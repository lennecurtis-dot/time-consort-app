'use strict';

const Api = {
  async validarLink(codigo) {
    const r    = await fetch(`/api/a/${encodeURIComponent(codigo)}`);
    const data = await r.json();
    return { status: r.status, data };
  },

  async getQuestoes() {
    const r = await fetch('/api/questoes');
    if (!r.ok) throw new Error('Erro ao carregar questões.');
    return r.json();
  },

  async submeter(codigo, dadosPessoais, respostas) {
    const r = await fetch(`/api/a/${encodeURIComponent(codigo)}/submit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ dadosPessoais, respostas })
    });
    const data = await r.json();
    return { status: r.status, data };
  }
};

window.Api = Api;
