'use strict';

require('dotenv').config();
const crypto   = require('crypto');
const express  = require('express');
const path     = require('path');
const { calcularResultado } = require('./scoring-engine');
const { buscarPorCodigo, salvarResultado,
        criarAssessment, listarConcluidos, buscarAssessmentGestor, obterEstatisticas,
        pp_criarCorretor, pp_buscarCorretorPorEmail, pp_buscarCorretorPorEmailQualquerStatus,
        pp_buscarCorretorPorSetupToken, pp_definirSenha, pp_gerarNovoSetupToken,
        pp_buscarCorretorPorId,
        pp_listarCorretores, pp_atualizarCorretor, pp_removerCorretor,
        pp_obterConfiguracao, pp_salvarConfiguracao,
        pp_listarVendas, pp_registrarVenda, pp_removerVenda } = require('./database');
const { calcularMetas, calcularComissao } = require('./pp-engine');
const questions = require('./questions');

const app  = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'chave-temporaria-insegura-configure-no-render';

const SETUP_TOKEN_DURACAO_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

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

  const token = assinarToken({ tipo: 'gestor' });
  return res.json({ ok: true, token });
});

app.post('/api/gestor/logout', autenticacaoGestor, (_req, res) => {
  return res.json({ ok: true });
});

app.get('/api/gestor/stats', autenticacaoGestor, async (_req, res) => {
  try {
    return res.json(await obterEstatisticas());
  } catch (err) {
    console.error('[stats] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.post('/api/gestor/assessments', autenticacaoGestor, async (req, res) => {
  const { nome, email } = req.body || {};

  if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
    return res.status(400).json({ erro: 'Nome obrigatório (mínimo 3 caracteres).' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ erro: 'E-mail inválido.' });
  }

  const nomeLimpo  = nome.trim().slice(0, 200);
  const emailLimpo = email.trim().toLowerCase().slice(0, 200);
  const codigo     = crypto.randomBytes(8).toString('hex');

  try {
    await criarAssessment(nomeLimpo, emailLimpo, codigo);
  } catch (err) {
    console.error('[criar assessment] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno ao criar assessment.' });
  }

  const url = `${getBaseUrl()}/a/${codigo}`;
  const mensagemWhats = `Olá ${nomeLimpo}! Segue o link do seu Assessment TIME CONSORT: ${url}`;
  const whatsappLink  = `https://wa.me/?text=${encodeURIComponent(mensagemWhats)}`;

  return res.json({ ok: true, codigo, url, whatsappLink });
});

app.get('/api/gestor/assessments', autenticacaoGestor, async (req, res) => {
  const q      = String(req.query.q      || '').trim().slice(0, 100);
  const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
  const limite = 20;
  const offset = (pagina - 1) * limite;

  try {
    const { items, total } = await listarConcluidos({ search: q, limite, offset });

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
  } catch (err) {
    console.error('[listar assessments] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.get('/api/gestor/assessments/:id', autenticacaoGestor, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  try {
    const a = await buscarAssessmentGestor(id);
    if (!a) return res.status(404).json({ erro: 'Não encontrado.' });

    let resultado = null;
    try { resultado = JSON.parse(a.dados_json); } catch (_) {}

    let piorPatrao = null;
    try {
      const corretorPP = await pp_buscarCorretorPorEmailQualquerStatus(
        (a.email || '').trim().toLowerCase()
      );

      if (corretorPP) {
        const cfg = await pp_obterConfiguracao(corretorPP.id);
        const vendas = await pp_listarVendas(corretorPP.id);

        let metas = null;
        if (cfg && (cfg.custos_itens || cfg.objetivos_itens)) {
          metas = calcularMetas({
            custosItens:    parseItensJson(cfg.custos_itens),
            objetivosItens: parseItensJson(cfg.objetivos_itens),
            situacao:       corretorPP.situacao
          });
        }

        const vgvTotal      = vendas.reduce((s, v) => s + v.vgv,      0);
        const comissaoTotal = vendas.reduce((s, v) => s + v.comissao, 0);

        piorPatrao = {
          cadastrado:    true,
          nome:          corretorPP.nome,
          situacao:      corretorPP.situacao,
          ativo:         !!corretorPP.ativo,
          configurado:   !!metas,
          metas,
          custosItens:    cfg ? parseItensJson(cfg.custos_itens)    : [],
          objetivosItens: cfg ? parseItensJson(cfg.objetivos_itens) : [],
          totalVendas:    vendas.length,
          vgvTotal:       vgvTotal,
          comissaoTotal:  comissaoTotal
        };
      }
    } catch (errPP) {
      console.error('[detalhe assessment] Erro ao buscar Pior Patrão:', errPP);
    }

    return res.json({
      id:           a.id,
      codigo:       a.codigo,
      nome:         a.nome,
      email:        a.email,
      status:       a.status,
      criado_em:    a.criado_em,
      concluido_em: a.concluido_em,
      url:          `${getBaseUrl()}/a/${a.codigo}`,
      resultado,
      piorPatrao
    });
  } catch (err) {
    console.error('[detalhe assessment] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO PIOR PATRÃO
// ═══════════════════════════════════════════════════════════════════════════════

function autenticacaoPP(req, res, next) {
  const header  = req.headers['authorization'] || '';
  const token   = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = verificarToken(token);

  if (!payload || payload.tipo !== 'pp' || !payload.corretorId) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  req.ppCorretorId = payload.corretorId;
  next();
}

function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verificarSenha(senha, armazenado) {
  const [salt, hash] = armazenado.split(':');
  const hashTentativa = crypto.scryptSync(senha, salt, 64).toString('hex');
  const buf1 = Buffer.from(hash,         'hex');
  const buf2 = Buffer.from(hashTentativa,'hex');
  return buf1.length === buf2.length && crypto.timingSafeEqual(buf1, buf2);
}

app.get(['/pp', '/pp/'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pior-patrao', 'index.html'));
});

app.get(['/pp/definir-senha', '/pp/definir-senha/'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pior-patrao', 'definir-senha.html'));
});

app.get('/api/pp/setup/:token', async (req, res) => {
  try {
    const corretor = await pp_buscarCorretorPorSetupToken(req.params.token);
    if (!corretor) {
      return res.status(404).json({ erro: 'Link inválido ou já utilizado.' });
    }
    if (!corretor.setup_token_exp || Date.now() > Number(corretor.setup_token_exp)) {
      return res.status(410).json({ erro: 'Este link expirou. Peça ao gestor para gerar um novo.' });
    }
    return res.json({ ok: true, nome: corretor.nome });
  } catch (err) {
    console.error('[pp setup verificar] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.post('/api/pp/setup/:token', async (req, res) => {
  const { senha } = req.body || {};

  if (!senha || typeof senha !== 'string' || senha.length < 6) {
    return res.status(400).json({ erro: 'Senha obrigatória (mínimo 6 caracteres).' });
  }

  try {
    const corretor = await pp_buscarCorretorPorSetupToken(req.params.token);
    if (!corretor) {
      return res.status(404).json({ erro: 'Link inválido ou já utilizado.' });
    }
    if (!corretor.setup_token_exp || Date.now() > Number(corretor.setup_token_exp)) {
      return res.status(410).json({ erro: 'Este link expirou. Peça ao gestor para gerar um novo.' });
    }

    const senha_hash = hashSenha(senha);
    await pp_definirSenha(corretor.id, senha_hash);

    return res.json({ ok: true });
  } catch (err) {
    console.error('[pp setup definir] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.post('/api/pp/login', async (req, res) => {
  const { email, senha } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ erro: 'E-mail obrigatório.' });
  }
  if (!senha || typeof senha !== 'string') {
    return res.status(400).json({ erro: 'Senha obrigatória.' });
  }

  try {
    const corretor = await pp_buscarCorretorPorEmail(email.trim().toLowerCase());
    if (!corretor) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }
    if (!corretor.senha_hash) {
      return res.status(403).json({ erro: 'Você ainda não definiu sua senha. Use o link enviado pelo gestor.' });
    }
    if (!verificarSenha(senha, corretor.senha_hash)) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = assinarToken({ tipo: 'pp', corretorId: corretor.id });
    return res.json({ ok: true, token, nome: corretor.nome, situacao: corretor.situacao });
  } catch (err) {
    console.error('[pp login] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.post('/api/pp/logout', autenticacaoPP, (_req, res) => {
  return res.json({ ok: true });
});

app.get('/api/pp/perfil', autenticacaoPP, async (req, res) => {
  try {
    const c = await pp_buscarCorretorPorId(req.ppCorretorId);
    if (!c) return res.status(404).json({ erro: 'Corretor não encontrado.' });
    return res.json({ id: c.id, nome: c.nome, email: c.email, situacao: c.situacao });
  } catch (err) {
    console.error('[pp perfil] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.get('/api/pp/configuracao', autenticacaoPP, async (req, res) => {
  try {
    const cfg = await pp_obterConfiguracao(req.ppCorretorId);
    return res.json({
      custosItens:    cfg ? parseItensJson(cfg.custos_itens)    : [],
      objetivosItens: cfg ? parseItensJson(cfg.objetivos_itens) : []
    });
  } catch (err) {
    console.error('[pp configuracao get] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.put('/api/pp/configuracao', autenticacaoPP, async (req, res) => {
  const { custosItens, objetivosItens } = req.body || {};

  if (!Array.isArray(custosItens) || !Array.isArray(objetivosItens)) {
    return res.status(400).json({ erro: 'Formato inválido.' });
  }

  const limparItens = (lista) => lista
    .map(it => ({
      nome:  typeof it.nome === 'string' ? it.nome.trim().slice(0, 100) : '',
      valor: Number(it.valor)
    }))
    .filter(it => it.nome && !isNaN(it.valor) && it.valor >= 0);

  const custosLimpos    = limparItens(custosItens);
  const objetivosLimpos = limparItens(objetivosItens);

  try {
    await pp_salvarConfiguracao({
      corretor_id:    req.ppCorretorId,
      custosItens:    custosLimpos,
      objetivosItens: objetivosLimpos
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[pp configuracao put] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.get('/api/pp/calculos', autenticacaoPP, async (req, res) => {
  try {
    const corretor = await pp_buscarCorretorPorId(req.ppCorretorId);
    const cfg      = await pp_obterConfiguracao(req.ppCorretorId);

    const custosItens    = cfg ? parseItensJson(cfg.custos_itens)    : [];
    const objetivosItens = cfg ? parseItensJson(cfg.objetivos_itens) : [];

    if (!custosItens.length && !objetivosItens.length) {
      return res.json({ configurado: false });
    }

    const metas = calcularMetas({
      custosItens,
      objetivosItens,
      situacao: corretor.situacao
    });

    return res.json({ configurado: true, ...metas });
  } catch (err) {
    console.error('[pp calculos] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.get('/api/pp/vendas', autenticacaoPP, async (req, res) => {
  try {
    const vendas = await pp_listarVendas(req.ppCorretorId);
    return res.json({ items: vendas });
  } catch (err) {
    console.error('[pp vendas get] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.post('/api/pp/vendas', autenticacaoPP, async (req, res) => {
  const { descricao, vgv, data_venda } = req.body || {};

  if (typeof vgv !== 'number' || vgv <= 0) {
    return res.status(400).json({ erro: 'VGV inválido.' });
  }
  if (!data_venda || typeof data_venda !== 'string') {
    return res.status(400).json({ erro: 'Data da venda obrigatória.' });
  }

  try {
    const corretor = await pp_buscarCorretorPorId(req.ppCorretorId);
    const { comissao, dist_reinvestimento, dist_custos, dist_lucro } =
      calcularComissao({ vgv, situacao: corretor.situacao });

    await pp_registrarVenda({
      corretor_id: req.ppCorretorId,
      descricao:   typeof descricao === 'string' ? descricao.trim().slice(0, 300) : '',
      vgv,
      data_venda,
      comissao,
      dist_reinvestimento,
      dist_custos,
      dist_lucro
    });

    return res.json({ ok: true, comissao, dist_reinvestimento, dist_custos, dist_lucro });
  } catch (err) {
    console.error('[pp venda post] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.delete('/api/pp/vendas/:id', autenticacaoPP, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const r = await pp_removerVenda(id, req.ppCorretorId);
    if (!r.rowsAffected) return res.status(404).json({ erro: 'Venda não encontrada.' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[pp venda delete] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.get('/api/gestor/pp/corretores', autenticacaoGestor, async (_req, res) => {
  try {
    const lista = await pp_listarCorretores();
    const listaComLink = lista.map(c => ({
      ...c,
      linkDefinirSenha: c.senha_definida ? null : `${getBaseUrl()}/pp/definir-senha?token=${c.setup_token}`
    }));
    return res.json({ items: listaComLink });
  } catch (err) {
    console.error('[pp corretores get] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.post('/api/gestor/pp/corretores', autenticacaoGestor, async (req, res) => {
  const { nome, email, situacao } = req.body || {};

  if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
    return res.status(400).json({ erro: 'Nome obrigatório (mínimo 3 caracteres).' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ erro: 'E-mail inválido.' });
  }
  if (situacao && !['estagiario', 'pleno'].includes(situacao)) {
    return res.status(400).json({ erro: 'Situação inválida.' });
  }

  const nomeLimpo  = nome.trim().slice(0, 200);
  const emailLimpo = email.trim().toLowerCase().slice(0, 200);
  const setupToken = crypto.randomBytes(24).toString('hex');
  const setupExp   = Date.now() + SETUP_TOKEN_DURACAO_MS;

  try {
    await pp_criarCorretor({
      nome: nomeLimpo, email: emailLimpo, situacao: situacao || 'pleno',
      setup_token: setupToken, setup_token_exp: setupExp
    });

    const linkDefinirSenha = `${getBaseUrl()}/pp/definir-senha?token=${setupToken}`;
    const mensagemWhats = `Olá ${nomeLimpo}! Você foi cadastrado(a) no Pior Patrão (TIME CONSORT). Crie sua senha de acesso aqui: ${linkDefinirSenha}`;
    const whatsappLink  = `https://wa.me/?text=${encodeURIComponent(mensagemWhats)}`;

    return res.json({ ok: true, linkDefinirSenha, whatsappLink });
  } catch (err) {
    if (String(err).includes('UNIQUE')) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }
    console.error('[pp corretor] Erro ao criar:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.post('/api/gestor/pp/corretores/:id/reenviar-link', autenticacaoGestor, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const corretor = await pp_buscarCorretorPorId(id);
    if (!corretor) return res.status(404).json({ erro: 'Corretor não encontrado.' });

    const setupToken = crypto.randomBytes(24).toString('hex');
    const setupExp   = Date.now() + SETUP_TOKEN_DURACAO_MS;
    await pp_gerarNovoSetupToken(id, setupToken, setupExp);

    const linkDefinirSenha = `${getBaseUrl()}/pp/definir-senha?token=${setupToken}`;
    const mensagemWhats = `Olá ${corretor.nome}! Aqui está seu link para criar/alterar sua senha do Pior Patrão (TIME CONSORT): ${linkDefinirSenha}`;
    const whatsappLink  = `https://wa.me/?text=${encodeURIComponent(mensagemWhats)}`;

    return res.json({ ok: true, linkDefinirSenha, whatsappLink });
  } catch (err) {
    console.error('[pp reenviar link] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.put('/api/gestor/pp/corretores/:id', autenticacaoGestor, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

  const { nome, situacao, ativo } = req.body || {};
  const campos = {};

  if (nome     !== undefined) campos.nome     = String(nome).trim().slice(0, 200);
  if (situacao !== undefined) {
    if (!['estagiario', 'pleno'].includes(situacao)) {
      return res.status(400).json({ erro: 'Situação inválida.' });
    }
    campos.situacao = situacao;
  }
  if (ativo !== undefined) campos.ativo = ativo ? 1 : 0;

  try {
    const r = await pp_atualizarCorretor(id, campos);
    if (!r) return res.status(404).json({ erro: 'Corretor não encontrado.' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[pp corretor put] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.delete('/api/gestor/pp/corretores/:id', autenticacaoGestor, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const r = await pp_removerCorretor(id);
    if (!r.rowsAffected) return res.status(404).json({ erro: 'Corretor não encontrado.' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[pp corretor delete] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
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
