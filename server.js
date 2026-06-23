'use strict';

require('dotenv').config();
const crypto   = require('crypto');
const express  = require('express');
const path     = require('path');
const { calcularResultado } = require('./scoring-engine');
const { buscarPorCodigo, salvarResultado,
        criarAssessment, listarConcluidos, buscarAssessmentGestor, obterEstatisticas } = require('./database');
const questions = require('./questions');

const app  = express();
const PORT = process.env.PORT || 3000;

function getBaseUrl() {
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return base || `http://localhost:${PORT}`;
}

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── SPA: serve index.html para rotas de assessment ───────────────────────────
app.get('/a/:codigo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── API: valida o link do corretor ───────────────────────────────────────────
app.get('/api/a/:codigo', (req, res) => {
  const { codigo } = req.params;

  if (!/^[A-Za-z0-9]{16}$/.test(codigo)) {
    return res.status(404).json({ erro: 'Link inválido.' });
  }

  const assessment = buscarPorCodigo(codigo);
  if (!assessment) {
    return res.status(404).json({ erro: 'Link inválido.' });
  }
  if (assessment.status === 'expirado') {
    return res.status(410).json({ erro: 'Este link expirou.' });
  }
  if (assessment.status === 'concluido') {
    return res.status(409).json({ erro: 'Assessment já concluído.' });
  }

  return res.json({
    ok:     true,
    nome:   assessment.nome,
    status: assessment.status
  });
});

// ─── API: retorna as questões sem pesos (nunca expor pesos ao frontend) ────────
app.get('/api/questoes', (_req, res) => {
  const questoesFrontend = questions.map(({ id, categoria, pergunta, alternativas }) => ({
    id, categoria, pergunta, alternativas
  }));
  return res.json(questoesFrontend);
});

// ─── API: recebe e processa o assessment submetido ────────────────────────────
app.post('/api/a/:codigo/submit', (req, res) => {
  const { codigo }                = req.params;
  const { dadosPessoais, respostas } = req.body || {};

  // Validações de entrada
  if (!dadosPessoais || typeof dadosPessoais.nome !== 'string' || dadosPessoais.nome.trim().length < 3) {
    return res.status(400).json({ erro: 'Nome obrigatório (mínimo 3 caracteres).' });
  }
  if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas)) {
    return res.status(400).json({ erro: 'Respostas inválidas.' });
  }
  if (Object.keys(respostas).length === 0) {
    return res.status(400).json({ erro: 'Nenhuma resposta recebida.' });
  }

  const assessment = buscarPorCodigo(codigo);
  if (!assessment) {
    return res.status(404).json({ erro: 'Código não encontrado.' });
  }
  if (assessment.status === 'concluido') {
    return res.status(409).json({ erro: 'Assessment já concluído.' });
  }

  const nomeLimpo = dadosPessoais.nome.trim().slice(0, 200);
  const cargo     = typeof dadosPessoais.cargo === 'string'
    ? dadosPessoais.cargo.trim().slice(0, 200)
    : '';

  let resultado;
  try {
    resultado = calcularResultado(respostas, { nome: nomeLimpo, cargo });
  } catch (errCalc) {
    console.error('[submit] Erro em calcularResultado:', errCalc);
    return res.status(500).json({ erro: 'Erro interno ao processar as respostas.' });
  }

  const agora = new Date().toISOString();
  const dadosCompletos = {
    ...resultado,
    codigo:       assessment.codigo,
    nome:         nomeLimpo,
    email:        assessment.email,
    status:       'concluido',
    criado_em:    assessment.criado_em,
    concluido_em: agora
  };

  try {
    salvarResultado(assessment.id, dadosCompletos, respostas);
  } catch (errSave) {
    console.error('[submit] Erro em salvarResultado:', errSave);
    return res.status(500).json({ erro: 'Erro interno ao salvar o resultado.' });
  }

  return res.json({ ok: true, resultado: dadosCompletos });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FASE 3 — PAINEL DO GESTOR
// ═══════════════════════════════════════════════════════════════════════════════

// Tokens Bearer em memória — perdidos ao reiniciar o servidor (comportamento esperado)
const _tokensGestor = new Set();

function autenticacaoGestor(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !_tokensGestor.has(token)) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  next();
}

// GET /gestor — serve o SPA do painel
app.get(['/gestor', '/gestor/'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gestor', 'index.html'));
});

// POST /api/gestor/login
app.post('/api/gestor/login', (req, res) => {
  const { senha } = req.body || {};
  const senhaGestor = process.env.GESTOR_PASSWORD || '';

  if (!senha || typeof senha !== 'string') {
    return res.status(400).json({ erro: 'Senha obrigatória.' });
  }
  if (!senhaGestor) {
    return res.status(503).json({ erro: 'Painel não configurado.' });
  }

  const buf1 = Buffer.from(senha);
  const buf2 = Buffer.from(senhaGestor);

  const senhaCorreta = buf1.length === buf2.length
    && crypto.timingSafeEqual(buf1, buf2);

  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Senha incorreta.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  _tokensGestor.add(token);
  return res.json({ ok: true, token });
});

// POST /api/gestor/logout
app.post('/api/gestor/logout', autenticacaoGestor, (req, res) => {
  const token = (req.headers['authorization'] || '').slice(7);
  _tokensGestor.delete(token);
  return res.json({ ok: true });
});

// GET /api/gestor/stats
app.get('/api/gestor/stats', autenticacaoGestor, (_req, res) => {
  return res.json(obterEstatisticas());
});

// POST /api/gestor/assessments — cria novo assessment e retorna link
app.post('/api/gestor/assessments', autenticacaoGestor, (req, res) => {
  const { nome, email } = req.body || {};

  if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
    return res.status(400).json({ erro: 'Nome obrigatório (mínimo 3 caracteres).' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ erro: 'E-mail inválido.' });
  }

  const nomeLimpo  = nome.trim().slice(0, 200);
  const emailLimpo = email.trim().toLowerCase().slice(0, 200);
  const codigo     = crypto.randomBytes(8).toString('hex'); // 16 chars hex

  try {
    criarAssessment(nomeLimpo, emailLimpo, codigo);
  } catch (err) {
    console.error('[criar assessment] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno ao criar assessment.' });
  }

  return res.json({ ok: true, codigo, url: `${getBaseUrl()}/a/${codigo}` });
});

// GET /api/gestor/assessments?q=&pagina=
app.get('/api/gestor/assessments', autenticacaoGestor, (req, res) => {
  const q      = String(req.query.q      || '').trim().slice(0, 100);
  const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
  const limite = 20;
  const offset = (pagina - 1) * limite;

  const { items, total } = listarConcluidos({ search: q, limite, offset });

  const lista = items.map(a => {
    let perfis = null;
    try {
      const d = JSON.parse(a.dados_json);
      perfis = {
        disc:         d?.perfis?.disc?.label         || null,
        temperamento: d?.perfis?.temperamento?.label || null,
        aptidao:      d?.perfis?.aptidao?.label      || null
      };
    } catch (_) {}

    return {
      id:           a.id,
      codigo:       a.codigo,
      nome:         a.nome,
      email:        a.email,
      concluido_em: a.concluido_em,
      url:          `${getBaseUrl()}/a/${a.codigo}`,
      perfis
    };
  });

  return res.json({
    items:   lista,
    total,
    pagina,
    limite,
    paginas: Math.ceil(total / limite) || 1
  });
});

// GET /api/gestor/assessments/:id
app.get('/api/gestor/assessments/:id', autenticacaoGestor, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  const a = buscarAssessmentGestor(id);
  if (!a) return res.status(404).json({ erro: 'Não encontrado.' });

  let resultado = null;
  try { resultado = JSON.parse(a.dados_json); } catch (_) {}

  return res.json({
    id:           a.id,
    codigo:       a.codigo,
    nome:         a.nome,
    email:        a.email,
    status:       a.status,
    criado_em:    a.criado_em,
    concluido_em: a.concluido_em,
    url:          `${getBaseUrl()}/a/${a.codigo}`,
    resultado
  });
});

// ─── 404 JSON para rotas de API desconhecidas ─────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// ─── Boot (apenas quando executado diretamente, não quando importado) ──────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Assessment Imobiliário — servidor na porta ${PORT}`);
  });
}

module.exports = app;
