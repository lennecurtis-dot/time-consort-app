'use strict';

require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const STATUS_VALIDOS = ['pendente', 'em_andamento', 'concluido', 'expirado'];

let _schemaPronto = null;

function garantirSchema() {
  if (_schemaPronto) return _schemaPronto;
  _schemaPronto = (async () => {
    const statements = [
      `CREATE TABLE IF NOT EXISTS assessments (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo       TEXT    NOT NULL UNIQUE,
        nome         TEXT    NOT NULL,
        email        TEXT    NOT NULL,
        status       TEXT    NOT NULL DEFAULT 'pendente'
                     CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'expirado')),
        dados_json   TEXT,
        criado_em    TEXT    NOT NULL DEFAULT (datetime('now')),
        concluido_em TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS respostas (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL
                      REFERENCES assessments(id) ON DELETE CASCADE,
        questao_id    TEXT    NOT NULL,
        alternativa   TEXT    NOT NULL,
        respondido_em TEXT    NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_assessments_codigo ON assessments(codigo)`,
      `CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status)`,
      `CREATE INDEX IF NOT EXISTS idx_respostas_assessment_id ON respostas(assessment_id)`,
      `CREATE TABLE IF NOT EXISTS pp_corretores (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        nome       TEXT    NOT NULL,
        email      TEXT    NOT NULL UNIQUE,
        senha_hash TEXT    NOT NULL,
        situacao   TEXT    NOT NULL DEFAULT 'pleno'
                   CHECK (situacao IN ('estagiario', 'pleno')),
        ativo      INTEGER NOT NULL DEFAULT 1,
        criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS pp_configuracao (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        corretor_id    INTEGER NOT NULL UNIQUE
                       REFERENCES pp_corretores(id) ON DELETE CASCADE,
        custos_fixos   REAL    NOT NULL DEFAULT 0,
        objetivo_anual REAL    NOT NULL DEFAULT 0,
        atualizado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS pp_vendas (
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
      )`,
      `CREATE INDEX IF NOT EXISTS idx_pp_corretores_email ON pp_corretores(email)`,
      `CREATE INDEX IF NOT EXISTS idx_pp_vendas_corretor ON pp_vendas(corretor_id)`
    ];
    for (const sql of statements) {
      await client.execute(sql);
    }
  })();
  return _schemaPronto;
}

async function buscarPorCodigo(codigo) {
  await garantirSchema();
  const r = await client.execute({ sql: 'SELECT * FROM assessments WHERE codigo = ?', args: [codigo] });
  return r.rows[0] || null;
}

async function salvarResultado(id, dadosCompletos, respostasObj) {
  await garantirSchema();
  const statements = [
    {
      sql: `UPDATE assessments SET status = 'concluido', dados_json = ?, nome = ?, concluido_em = ? WHERE id = ?`,
      args: [JSON.stringify(dadosCompletos), dadosCompletos.nome, dadosCompletos.concluido_em, id]
    }
  ];
  Object.entries(respostasObj).forEach(([questaoId, alternativa]) => {
    statements.push({
      sql: 'INSERT INTO respostas (assessment_id, questao_id, alternativa) VALUES (?, ?, ?)',
      args: [id, questaoId, String(alternativa)]
    });
  });
  await client.batch(statements, 'write');
}

async function listarConcluidos({ search = '', limite = 20, offset = 0 } = {}) {
  await garantirSchema();
  const filtro = search ? `%${search}%` : null;

  if (filtro) {
    const itemsR = await client.execute({
      sql: `SELECT id, codigo, nome, email, status, concluido_em, dados_json
            FROM assessments
            WHERE status = 'concluido'
              AND (nome LIKE ? OR email LIKE ? OR codigo LIKE ?)
            ORDER BY concluido_em DESC
            LIMIT ? OFFSET ?`,
      args: [filtro, filtro, filtro, limite, offset]
    });
    const totalR = await client.execute({
      sql: `SELECT COUNT(*) AS total FROM assessments
            WHERE status = 'concluido'
              AND (nome LIKE ? OR email LIKE ? OR codigo LIKE ?)`,
      args: [filtro, filtro, filtro]
    });
    return { items: itemsR.rows, total: Number(totalR.rows[0].total) };
  }

  const itemsR = await client.execute({
    sql: `SELECT id, codigo, nome, email, status, concluido_em, dados_json
          FROM assessments
          WHERE status = 'concluido'
          ORDER BY concluido_em DESC
          LIMIT ? OFFSET ?`,
    args: [limite, offset]
  });
  const totalR = await client.execute(`SELECT COUNT(*) AS total FROM assessments WHERE status = 'concluido'`);
  return { items: itemsR.rows, total: Number(totalR.rows[0].total) };
}

async function criarAssessment(nome, email, codigo) {
  await garantirSchema();
  return client.execute({
    sql: 'INSERT INTO assessments (nome, email, codigo) VALUES (?, ?, ?)',
    args: [nome, email, codigo]
  });
}

async function buscarAssessmentGestor(id) {
  await garantirSchema();
  const r = await client.execute({ sql: 'SELECT * FROM assessments WHERE id = ?', args: [id] });
  return r.rows[0] || null;
}

async function obterEstatisticas() {
  await garantirSchema();
  const statusR = await client.execute('SELECT status, COUNT(*) AS n FROM assessments GROUP BY status');
  const contagem = { pendente: 0, em_andamento: 0, concluido: 0, expirado: 0 };
  statusR.rows.forEach(r => { contagem[r.status] = Number(r.n); });
  const total = statusR.rows.reduce((s, r) => s + Number(r.n), 0);

  const concluidosR = await client.execute(
    "SELECT dados_json FROM assessments WHERE status = 'concluido' AND dados_json IS NOT NULL"
  );

  const discCount = {}, tempCount = {}, aptCount = {};
  concluidosR.rows.forEach(row => {
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

async function pp_criarCorretor({ nome, email, senha_hash, situacao }) {
  await garantirSchema();
  return client.execute({
    sql: 'INSERT INTO pp_corretores (nome, email, senha_hash, situacao) VALUES (?, ?, ?, ?)',
    args: [nome, email, senha_hash, situacao || 'pleno']
  });
}

async function pp_buscarCorretorPorEmail(email) {
  await garantirSchema();
  const r = await client.execute({
    sql: 'SELECT * FROM pp_corretores WHERE email = ? AND ativo = 1',
    args: [email]
  });
  return r.rows[0] || null;
}

async function pp_buscarCorretorPorId(id) {
  await garantirSchema();
  const r = await client.execute({
    sql: 'SELECT id, nome, email, situacao, ativo, criado_em FROM pp_corretores WHERE id = ?',
    args: [id]
  });
  return r.rows[0] || null;
}

async function pp_listarCorretores() {
  await garantirSchema();
  const r = await client.execute(
    'SELECT id, nome, email, situacao, ativo, criado_em FROM pp_corretores ORDER BY nome ASC'
  );
  return r.rows;
}

async function pp_atualizarCorretor(id, campos) {
  await garantirSchema();
  const atuaisR = await client.execute({ sql: 'SELECT * FROM pp_corretores WHERE id = ?', args: [id] });
  const atuais = atuaisR.rows[0];
  if (!atuais) return null;

  const nome      = campos.nome      !== undefined ? campos.nome      : atuais.nome;
  const situacao  = campos.situacao  !== undefined ? campos.situacao  : atuais.situacao;
  const ativo     = campos.ativo     !== undefined ? campos.ativo     : atuais.ativo;
  const senhaHash = campos.senha_hash !== undefined ? campos.senha_hash : atuais.senha_hash;

  return client.execute({
    sql: 'UPDATE pp_corretores SET nome = ?, situacao = ?, ativo = ?, senha_hash = ? WHERE id = ?',
    args: [nome, situacao, ativo, senhaHash, id]
  });
}

async function pp_removerCorretor(id) {
  await garantirSchema();
  return client.execute({ sql: 'DELETE FROM pp_corretores WHERE id = ?', args: [id] });
}

async function pp_obterConfiguracao(corretor_id) {
  await garantirSchema();
  const r = await client.execute({
    sql: 'SELECT * FROM pp_configuracao WHERE corretor_id = ?',
    args: [corretor_id]
  });
  return r.rows[0] || null;
}

async function pp_salvarConfiguracao({ corretor_id, custos_fixos, objetivo_anual }) {
  await garantirSchema();
  const agora = new Date().toISOString();
  return client.execute({
    sql: `INSERT INTO pp_configuracao (corretor_id, custos_fixos, objetivo_anual, atualizado_em)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(corretor_id) DO UPDATE SET
            custos_fixos   = excluded.custos_fixos,
            objetivo_anual = excluded.objetivo_anual,
            atualizado_em  = excluded.atualizado_em`,
    args: [corretor_id, custos_fixos, objetivo_anual, agora]
  });
}

async function pp_listarVendas(corretor_id) {
  await garantirSchema();
  const r = await client.execute({
    sql: 'SELECT * FROM pp_vendas WHERE corretor_id = ? ORDER BY data_venda DESC, registrado_em DESC',
    args: [corretor_id]
  });
  return r.rows;
}

async function pp_registrarVenda({ corretor_id, descricao, vgv, data_venda, comissao,
                              dist_reinvestimento, dist_custos, dist_lucro }) {
  await garantirSchema();
  return client.execute({
    sql: `INSERT INTO pp_vendas
      (corretor_id, descricao, vgv, data_venda, comissao,
       dist_reinvestimento, dist_custos, dist_lucro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [corretor_id, descricao || '', vgv, data_venda, comissao,
           dist_reinvestimento, dist_custos, dist_lucro]
  });
}

async function pp_removerVenda(id, corretor_id) {
  await garantirSchema();
  return client.execute({
    sql: 'DELETE FROM pp_vendas WHERE id = ? AND corretor_id = ?',
    args: [id, corretor_id]
  });
}

module.exports = {
  STATUS_VALIDOS,
  buscarPorCodigo, salvarResultado,
  criarAssessment, listarConcluidos, buscarAssessmentGestor, obterEstatisticas,
  pp_criarCorretor, pp_buscarCorretorPorEmail, pp_buscarCorretorPorId,
  pp_listarCorretores, pp_atualizarCorretor, pp_removerCorretor,
  pp_obterConfiguracao, pp_salvarConfiguracao,
  pp_listarVendas, pp_registrarVenda, pp_removerVenda
};
