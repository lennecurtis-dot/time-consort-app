'use strict';

const VERSAO_ATUAL = 1;

function chave(codigo) {
  return `assessment_progress_${codigo}`;
}

function disponivel() {
  try {
    const t = '__assessment_test__';
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

function salvar(codigo, dados) {
  try {
    const obj = {
      versao:            VERSAO_ATUAL,
      codigo,
      dadosPessoais:     dados.dadosPessoais,
      respostas:         dados.respostas,
      questaoAtual:      dados.questaoAtual,
      iniciadoEm:        dados.iniciadoEm || new Date().toISOString(),
      ultimaAtividadeEm: new Date().toISOString()
    };
    localStorage.setItem(chave(codigo), JSON.stringify(obj));
    return true;
  } catch {
    return false;
  }
}

function carregar(codigo) {
  try {
    const raw = localStorage.getItem(chave(codigo));
    if (!raw) return null;

    const obj = JSON.parse(raw);
    if (!_validar(obj, codigo)) return null;

    return obj;
  } catch {
    return null;
  }
}

function limpar(codigo) {
  try {
    localStorage.removeItem(chave(codigo));
  } catch {}
}

function _validar(obj, codigo) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.versao !== VERSAO_ATUAL) return false;
  if (obj.codigo !== codigo) return false;
  if (!obj.respostas || typeof obj.respostas !== 'object') return false;
  if (typeof obj.questaoAtual !== 'number') return false;
  if (!obj.dadosPessoais || !obj.dadosPessoais.nome) return false;
  if (Object.keys(obj.respostas).length === 0) return false;
  return true;
}

window.AssessmentStorage = { disponivel, salvar, carregar, limpar };
