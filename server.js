'use strict';

require('dotenv').config();
const crypto   = require('crypto');
const express  = require('express');
const path     = require('path');
const { calcularResultado } = require('./scoring-engine');
const { buscarPorCodigo, salvarResultado,
        criarAssessment, listarConcluidos, buscarAssessmentGestor, obterEstatisticas,
        pp_criarCorretor, pp_buscarCorretorPorEmail, pp_buscarCorretorPorEmailQualquerStatus,
        pp_buscarCorretorPorId,
        pp_listarCorretores, pp_atualizarCorretor, pp_removerCorretor,
        pp_obterConfiguracao, pp_salvarConfiguracao,
        pp_listarVendas, pp_registrarVenda, pp_removerVenda } = require('./database');
const { calcularMetas, calcularComissao } = require('./pp-engine');
const questions = require('./questions');

const app  = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'chave-temporaria-insegura-configure-no-render';

function getBaseUrl() {
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return base || `http://localhost:${PORT}`;
}

function parseItensJson(str) {
  if (!str) return [];
  try {
    const arr = JSON.parse(str);
    return Array.isArray(arr) ? arr : [];
  } catch (_) { return []; }
}

// ─── Tokens de sessão assinados (não dependem de memória do servidor) ─────────
// Formato: base64url(payloadJson) + '.' + assinaturaHMAC
// Sobrevivem a reinícios do servidor, diferente de um Set/Map em memória.
const SESSAO_DURACAO_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function assinarToken(payload) {
  const corpo = { ...payload, exp: Date.now() + SESSAO_DURACAO_MS };
  const corpoBase64 = Buffer.from(JSON.stringify(corpo)).toString('base64url');
  const assinatura  = crypto.createHmac('sha256', SESSION_SECRET)
    .update(corpoBase64)
    .digest('base64url');
  return `${corpoBase64}.${assinatura}`;
}

function verificarToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [corpoBase64, assinatura] = token.split('.');
  if (!corpoBase64 || !assinatura) return null;

  const assinaturaEsperada = crypto.createHmac('sha256', SESSION_SECRET)
    .update(corpoBase64)
    .digest('base64url');

  const buf1 = Buffer.from(assinatura);
  const buf2 = Buffer.from(assinaturaEsperada);
  if (buf1.length !== buf2.length || !crypto.timingSafeEqual(buf1, buf2)) return null;

  try {
    const payload = JSON.parse(Buffer.from(corpoBase64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (_) { return null; }
}

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pp', express.static(path.join(__dirname, 'public', 'pior-patrao')));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── SPA: serve index.html para rotas de assessment ───────────────────────────
app.get('/a/:codigo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── API: valida o link do corretor ───────────────────────────────────────────
app.get('/api/a/:codigo', async (req, res) => {
  const { codigo } = req.params;

  if (!/^[A-Za-z0-9]{16}$/.test(codigo)) {
    return res.status(404).json({ erro: 'Link inválido.' });
  }

  try {
    const assessment = await buscarPorCodigo(codigo);
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
  } catch (err) {
    console.error('[validar link] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

// ─── API: retorna as questões sem pesos (nunca expor pesos ao frontend) ────────
app.get('/api/questoes', (_req, res) => {
  const questoesFrontend = questions.map(({ id, categoria, pergunta, alternativas }) => ({
    id, categoria, pergunta, alternativas
  }));
  return res.json(questoesFrontend);
});

// ─── API: recebe e processa o assessment submetido ────────────────────────────
app.post('/api/a/:codigo/submit', async (req, res) => {
  const { codigo }                = req.params;
  const { dadosPessoais, respostas } = req.body || {};

  if (!dadosPessoais || typeof dadosPessoais.nome !== 'string' || dadosPessoais.nome.trim().length < 3) {
    return res.status(400).json({ erro: 'Nome obrigatório (mínimo 3 caracteres).' });
  }
  if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas)) {
    return res.status(400).json({ erro: 'Respostas inválidas.' });
  }
  if (Object.keys(respostas).length === 0) {
    return res.status(400).json({ erro: 'Nenhuma resposta recebida.' });
  }

  let assessment;
  try {
    assessment = await buscarPorCodigo(codigo);
  } catch (err) {
    console.error('[submit] Erro em buscarPorCodigo:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }

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
    await salvarResultado(assessment.id, dadosCompletos, respostas);
  } catch (errSave) {
    console.error('[submit] Erro em salvarResultado:', errSave);
    return res.status(500).json({ erro: 'Erro interno ao salvar o resultado.' });
  }

  return res.json({ ok: true, resultado: dadosCompletos });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FASE 3 — PAINEL DO GESTOR
// ═══════════════════════════════════════════════════════════════════════════════

function autenticacaoGestor(req, res, next) {
  const header  = req.headers['authorization'] || '';
  const token   = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = verificarToken(token);

  if (!payload || payload.tipo !== 'gestor') {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  next();
}

app.get(['/gestor', '/gestor/'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gestor', 'index.html'));
});

app.post('/api/gestor/login', (req, res) => {
  const { senha } = req.body || {};
  const senhaGestor =
