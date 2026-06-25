'use strict';

require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './assessment.db';

const STATUS_VALIDOS = ['pendente', 'em_andamento', 'concluido', 'expirado'];

let _db = null;

function getDb() {
  if (_db) return _db;
  _db = new Database(path.resolve(DB_PATH));
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  inicializarSchema(_db);
  return _db;
}

function inicializarSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo       TEXT    NOT NULL UNIQUE,
      nome         TEXT    NOT NULL,
      email        TEXT    NOT NULL,
      status       TEXT    NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'expirado')),
      dados_json   TEXT,
      criado_em    TEXT    NOT NULL DEFAULT (datetime('now')),
      concluido_em TEXT
    );

    CREATE TABLE IF NOT EXISTS respostas (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id INTEGER NOT NULL
                    REFERENCES assessments(id) ON DELETE CASCADE,
      questao_id    TEXT    NOT NULL,
      alternativa   TEXT    NOT NULL,
      respondido_em TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_assessments_codigo
      ON assessments(codigo);

    CREATE INDEX IF NOT EXISTS idx_assessments_status
      ON assessments(status);

    CREATE INDEX IF NOT EXISTS idx_respostas_assessment_id
      ON respostas(assessment_id);

    -- ── Módulo Pior Patrão ────────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS pp_corretores (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nome       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      senha_hash TEXT    NOT NULL,
      situacao   TEXT    NOT NULL DEFAULT 'pleno'
                 CHECK (situacao IN ('estagiario', 'pleno')),
      ativo      INTEGER NOT NULL DEFAULT 1,
      criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pp_configuracao (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      corretor_id    INTEGER NOT NULL UNIQUE
                     REFERENCES pp_corretores(id) ON DELETE CASCADE,
      custos_fixos   REAL    NOT NULL DEFAULT 0,
      objetivo_anual REAL    NOT NULL DEFAULT 0,
      atualizado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pp_vendas (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      corretor_id         INTEGER NOT NULL
                          REFERENCES pp_corretores(id) ON DELETE CASCADE,
      descricao           TEXT    NOT NULL DEFAULT '',
      vgv                 REAL    NOT NULL,
      data_venda          TEXT    NOT NULL,
      comissao            REAL    NOT NULL,
      dist_reinvestimento REAL    NOT NULL,
      dist_custos         REAL    NOT NULL,
      dist_lucro          REAL    NOT NULL,
      registrado_em       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_pp_corretores_email
      ON pp_corretores(email);

    CREATE INDEX IF NOT EXISTS idx_pp_vendas_corretor
      ON pp_vendas(corretor_id);
  `);
}

function buscarPorCodigo(codigo) {
  return getDb()
    .prepare('SELECT * FROM assessments WHERE codigo = ?')
    .get(codigo);
}

function salvarResultado(id, dadosCompletos, respostasObj) {
  const db = getDb();

  const transacao = db.transaction(() => {
    db.prepare(`
      UPDATE assessments
      SET status       = 'concluido',
          dados_json   = ?,
          nome         = ?,
          concluido_em = ?
      WHERE id = ?
    `).run(
      JSON.stringify(dadosCompletos),
      dadosCompletos.nome,
      dadosCompletos.concluido_em,
      id
    );

    const inserir = db.prepare(
      'INSERT INTO respostas (assessment_id, questao_id, alternativa) VALUES (?, ?, ?)'
    );

    Object.entries(respostasObj).forEach(([questaoId, alternativa]) => {
      inserir.run(id, questaoId, String(alternativa));
    });
  });

  transacao();
}

function listarConcluidos({ search = '', limite = 20, offset = 0 } = {}) {
  const db    = getDb();
  const filtro = search ? `%${search}%` : null;

  if (filtro) {
    const items = db.prepare(`
      SELECT id, codigo, nome, email, status, concluido_em, dados_json
      FROM assessments
      WHERE status = 'concluido'
        AND (nome LIKE ? OR email LIKE ? OR codigo LIKE ?)
      ORDER BY concluido_em DESC
      LIMIT ? OFFSET ?
    `).all(filtro, filtro, filtro, limite, offset);

    const { total } = db.prepare(`
      SELECT COUNT(*) AS total FROM assessments
      WHERE status = 'concluido'
        AND (nome LIKE ? OR email LIKE ? OR codigo LIKE ?)
    `).get(filtro, filtro, filtro);

    return { items, total };
  }

  const items = db.prepare(`
    SELECT id, codigo, nome, email, status, concluido_em, dados_json
    FROM assessments
    WHERE status = 'concluido'
    ORDER BY concluido_em DESC
    LIMIT ? OFFSET ?
  `).all(limite, offset);

  const { total } = db.prepare(`
    SELECT COUNT(*) AS total FROM assessments WHERE status = 'concluido'
  `).get();

  return { items, total };
}

function criarAssessment(nome, email, codigo) {
  return getDb()
    .prepare('INSERT INTO assessments (nome, email, codigo) VALUES (?, ?, ?)')
    .run(nome, email, codigo);
}

function buscarAssessmentGestor(id) {
  return getDb()
    .prepare('SELECT * FROM assessments WHERE id = ?')
    .get(id);
}

function obterEstatisticas() {
  const db = getDb();

  const linhasStatus = db.prepare(
    'SELECT status, COUNT(*) AS n FROM assessments GROUP BY status'
  ).all();

  const contagem = { pendente: 0, em_andamento: 0, concluido: 0, expirado: 0 };
  linhasStatus.forEach(r => { contagem[r.status] = r.n; });
  const total = linhasStatus.reduce((s, r) => s + r.n, 0);

  const concluidos = db.prepare(
    "SELECT dados_json FROM assessments WHERE status = 'concluido' AND dados_json IS NOT NULL"
  ).all();

  const discCount = {}, tempCount = {}, aptCount = {};

  concluidos.forEach(row => {
    try {
      const d = JSON.parse(row.dados_json);
      const disc = d?.perfis?.disc?.predominante;
      const temp = d?.perfis?.temperamento?.predominante;
      const apt  = d?.perfis?.aptidao?.principal;
      if (disc) discCount[disc] = (discCount[disc] || 0) + 1;
      if (temp) tempCount[temp] = (tempCount[temp] || 0) + 1;
      if (apt)  aptCount[apt]   = (aptCount[apt]  || 0) + 1;
    } catch (_) {}
  });

  const top = obj => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    total,
    concluidos:   contagem.concluido,
    emAndamento:  contagem.em_andamento,
    pendentes:    contagem.pendente,
    expirados:    contagem.expirado,
    discTop:      top(discCount),
    tempTop:      top(tempCount),
    aptTop:       top(aptCount),
    discContagem: discCount,
    tempContagem: tempCount,
    aptContagem:  aptCount
  };
}

module.exports = {
  getDb, STATUS_VALIDOS,
  buscarPorCodigo, salvarResultado,
  criarAssessment, listarConcluidos, buscarAssessmentGestor, obterEstatisticas,
  // Módulo Pior Patrão
  pp_criarCorretor, pp_buscarCorretorPorEmail, pp_buscarCorretorPorId,
  pp_listarCorretores, pp_atualizarCorretor, pp_removerCorretor,
  pp_obterConfiguracao, pp_salvarConfiguracao,
  pp_listarVendas, pp_registrarVenda, pp_removerVenda
};

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO PIOR PATRÃO — funções de banco
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Corretores PP ────────────────────────────────────────────────────────────
function pp_criarCorretor({ nome, email, senha_hash, situacao }) {
  return getDb()
    .prepare('INSERT INTO pp_corretores (nome, email, senha_hash, situacao) VALUES (?, ?, ?, ?)')
    .run(nome, email, senha_hash, situacao || 'pleno');
}

function pp_buscarCorretorPorEmail(email) {
  return getDb()
    .prepare('SELECT * FROM pp_corretores WHERE email = ? AND ativo = 1')
    .get(email);
}

function pp_buscarCorretorPorId(id) {
  return getDb()
    .prepare('SELECT id, nome, email, situacao, ativo, criado_em FROM pp_corretores WHERE id = ?')
    .get(id);
}

function pp_listarCorretores() {
  return getDb()
    .prepare('SELECT id, nome, email, situacao, ativo, criado_em FROM pp_corretores ORDER BY nome ASC')
    .all();
}

function pp_atualizarCorretor(id, campos) {
  const db     = getDb();
  const atuais = db.prepare('SELECT * FROM pp_corretores WHERE id = ?').get(id);
  if (!atuais) return null;

  const nome      = campos.nome      !== undefined ? campos.nome      : atuais.nome;
  const situacao  = campos.situacao  !== undefined ? campos.situacao  : atuais.situacao;
  const ativo     = campos.ativo     !== undefined ? campos.ativo     : atuais.ativo;
  const senhaHash = campos.senha_hash !== undefined ? campos.senha_hash : atuais.senha_hash;

  return db.prepare(
    'UPDATE pp_corretores SET nome = ?, situacao = ?, ativo = ?, senha_hash = ? WHERE id = ?'
  ).run(nome, situacao, ativo, senhaHash, id);
}

function pp_removerCorretor(id) {
  return getDb()
    .prepare('DELETE FROM pp_corretores WHERE id = ?')
    .run(id);
}

// ─── Configuração PP ─────────────────────────────────────────────────────────
function pp_obterConfiguracao(corretor_id) {
  return getDb()
    .prepare('SELECT * FROM pp_configuracao WHERE corretor_id = ?')
    .get(corretor_id);
}

function pp_salvarConfiguracao({ corretor_id, custos_fixos, objetivo_anual }) {
  const agora = new Date().toISOString();
  return getDb().prepare(`
    INSERT INTO pp_configuracao (corretor_id, custos_fixos, objetivo_anual, atualizado_em)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(corretor_id) DO UPDATE SET
      custos_fixos   = excluded.custos_fixos,
      objetivo_anual = excluded.objetivo_anual,
      atualizado_em  = excluded.atualizado_em
  `).run(corretor_id, custos_fixos, objetivo_anual, agora);
}

// ─── Vendas PP ────────────────────────────────────────────────────────────────
function pp_listarVendas(corretor_id) {
  return getDb()
    .prepare('SELECT * FROM pp_vendas WHERE corretor_id = ? ORDER BY data_venda DESC, registrado_em DESC')
    .all(corretor_id);
}

function pp_registrarVenda({ corretor_id, descricao, vgv, data_venda, comissao,
                              dist_reinvestimento, dist_custos, dist_lucro }) {
  return getDb().prepare(`
    INSERT INTO pp_vendas
      (corretor_id, descricao, vgv, data_venda, comissao,
       dist_reinvestimento, dist_custos, dist_lucro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(corretor_id, descricao || '', vgv, data_venda, comissao,
         dist_reinvestimento, dist_custos, dist_lucro);
}

function pp_removerVenda(id, corretor_id) {
  return getDb()
    .prepare('DELETE FROM pp_vendas WHERE id = ? AND corretor_id = ?')
    .run(id, corretor_id);
}
