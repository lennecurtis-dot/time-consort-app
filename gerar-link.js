'use strict';

/**
 * Utilitário de desenvolvimento — gera um link de assessment para testes.
 * USO: node gerar-link.js "Nome do Corretor" "email@exemplo.com"
 * NÃO é a interface do gestor — é apenas para testar o fluxo do corretor.
 */

require('dotenv').config();
const crypto = require('crypto');
const { getDb } = require('./database');

const nome  = process.argv[2] || 'Corretor Teste';
const email = process.argv[3] || 'corretor@teste.com';

if (!nome || !email) {
  console.error('Uso: node gerar-link.js "Nome Completo" "email@exemplo.com"');
  process.exit(1);
}

const codigo = crypto.randomBytes(8).toString('hex'); // 16 chars hexadecimais

const db = getDb();
db.prepare('INSERT INTO assessments (codigo, nome, email) VALUES (?, ?, ?)').run(codigo, nome, email);

const baseUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '')
  || `http://localhost:${process.env.PORT || 3000}`;

console.log('\n✓ Link gerado com sucesso!');
console.log(`  Corretor : ${nome}`);
console.log(`  E-mail   : ${email}`);
console.log(`  Código   : ${codigo}`);
console.log(`  URL      : ${baseUrl}/a/${codigo}\n`);
