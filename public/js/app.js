'use strict';

// ─── Mapeamento de views para etapas (null = sem barra de etapas) ─────────────
const VIEW_PARA_ETAPA = {
  identificacao: 1,
  instrucoes:    2,
  questao:       3,
  confirmacao:   4,
  resultado:     5
};

// ─── Estado global ────────────────────────────────────────────────────────────
const state = {
  codigo:          null,
  dadosAssessment: null,   // { nome, status } vindos da API
  dadosPessoais:   { nome: '', cargo: '' },
  respostas:       {},
  questoes:        [],
  questaoAtual:    0,
  viewAtual:       null,
  resultado:       null,
  iniciadoEm:      null,
  storageOk:       false
};

// ─── Barra de etapas ──────────────────────────────────────────────────────────
function _atualizarBarraEtapas(viewId) {
  const bar = document.getElementById('etapas-bar');
  const etapaAtiva = VIEW_PARA_ETAPA[viewId];

  if (!etapaAtiva) {
    bar.hidden = true;
    return;
  }

  bar.hidden = false;

  bar.querySelectorAll('.etapa-item').forEach(el => {
    const n = parseInt(el.dataset.etapa, 10);
    delete el.dataset.status;
    if (n < etapaAtiva)   el.dataset.status = 'concluida';
    if (n === etapaAtiva) el.dataset.status = 'ativa';
  });

  // Linhas entre etapas: verde quando ambas as etapas adjacentes estão concluídas
  bar.querySelectorAll('.etapa-item__linha').forEach((linha, i) => {
    delete linha.dataset.status;
    if (etapaAtiva > i + 1) linha.dataset.status = 'concluida';
  });
}

// ─── Navegação ────────────────────────────────────────────────────────────────
function navegarPara(viewId) {
  const atual   = state.viewAtual
    ? document.querySelector(`[data-view="${state.viewAtual}"]`)
    : null;
  const proxima = document.querySelector(`[data-view="${viewId}"]`);
  if (!proxima) return;

  if (atual) atual.setAttribute('aria-hidden', 'true');
  proxima.setAttribute('aria-hidden', 'false');
  state.viewAtual = viewId;

  _atualizarBarraEtapas(viewId);
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Move o foco para o primeiro input, depois botão/link
  setTimeout(() => {
    const alvo = proxima.querySelector('input, button, a, [tabindex="0"]');
    if (alvo) alvo.focus({ preventScroll: false });
  }, 60);
}

// ─── Inicialização ────────────────────────────────────────────────────────────
async function inicializar() {
  // Bloqueia o botão Voltar do navegador
  history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', () => {
    history.pushState(null, '', window.location.href);
  });

  // Extrai código da URL: /a/XXXXXXXXXXXXXXXX
  const partes = window.location.pathname.split('/').filter(Boolean);
  const codigo = partes[partes.length - 1];

  if (!codigo || !/^[A-Za-z0-9]{16}$/.test(codigo)) {
    navegarPara('link-invalido');
    return;
  }

  state.codigo    = codigo;
  state.storageOk = window.AssessmentStorage.disponivel();

  navegarPara('carregando');

  try {
    const [linkResult] = await Promise.all([
      Api.validarLink(codigo),
      _carregarQuestoes()
    ]);

    const { status, data } = linkResult;

    if (status === 404) { navegarPara('link-invalido'); return; }
    if (status === 410) { navegarPara('link-expirado'); return; }
    if (status === 409) { navegarPara('ja-concluido');  return; }
    if (status !== 200) { navegarPara('link-invalido'); return; }

    state.dadosAssessment = data;

    const progresso = state.storageOk
      ? window.AssessmentStorage.carregar(codigo)
      : null;

    if (progresso) {
      state.respostas     = progresso.respostas    || {};
      state.dadosPessoais = progresso.dadosPessoais || { nome: '', cargo: '' };
      state.iniciadoEm    = progresso.iniciadoEm   || null;
    }

    _prepararIdentificacao(!!progresso && Object.keys(state.respostas).length > 0);

  } catch (err) {
    console.error('[app] Erro na inicialização:', err);
    navegarPara('link-invalido');
  }
}

async function _carregarQuestoes() {
  if (state.questoes.length > 0) return;
  state.questoes = await Api.getQuestoes();
}

// ─── Etapa 1: Identificação ───────────────────────────────────────────────────
function _prepararIdentificacao(temProgresso) {
  const nomeLink = state.dadosAssessment.nome || '';

  document.querySelector('.ident__nome-do-link').textContent = nomeLink;

  document.querySelector('#input-nome').value  = state.dadosPessoais.nome  || nomeLink;
  document.querySelector('#input-cargo').value = state.dadosPessoais.cargo || '';
  document.querySelector('#erro-ident-nome').textContent = '';

  const infoEl   = document.querySelector('.ident__info-retomada');
  const btnRetom = document.querySelector('.ident__btn-retomar');
  const btnInic  = document.querySelector('.ident__btn-iniciar');

  if (temProgresso) {
    const respondidas   = Object.keys(state.respostas).length;
    const totalQuestoes = state.questoes.length;
    infoEl.textContent  = `Você já respondeu ${respondidas} de ${totalQuestoes} perguntas.`;
    infoEl.hidden       = false;
    btnRetom.hidden     = false;
    btnInic.textContent = 'Recomeçar do início';
  } else {
    infoEl.hidden       = true;
    btnRetom.hidden     = true;
    btnInic.textContent = 'Iniciar Assessment';
  }

  navegarPara('identificacao');
}

function _validarIdentificacao() {
  const nome   = document.querySelector('#input-nome').value.trim();
  const cargo  = document.querySelector('#input-cargo').value.trim();
  const erroEl = document.querySelector('#erro-ident-nome');

  if (!nome) {
    erroEl.textContent = 'Por favor, informe seu nome completo.';
    document.querySelector('#input-nome').focus();
    return false;
  }
  if (nome.length < 3) {
    erroEl.textContent = 'O nome deve ter pelo menos 3 caracteres.';
    document.querySelector('#input-nome').focus();
    return false;
  }

  erroEl.textContent  = '';
  state.dadosPessoais = { nome, cargo };
  return true;
}

// ─── Etapa 2: Instrucoes ──────────────────────────────────────────────────────
function _prepararInstrucoes() {
  const itemPausar = document.querySelector('#instrucoes-item-pausar');
  if (itemPausar) itemPausar.hidden = !state.storageOk;
}

// ─── Fluxo: iniciar do zero ───────────────────────────────────────────────────
function iniciarFluxo() {
  if (!_validarIdentificacao()) return;

  state.respostas    = {};
  state.questaoAtual = 0;
  state.iniciadoEm   = null;

  if (state.storageOk) window.AssessmentStorage.limpar(state.codigo);

  _prepararInstrucoes();
  navegarPara('instrucoes');
}

// ─── Fluxo: retomar sessão ────────────────────────────────────────────────────
function retomar() {
  if (!_validarIdentificacao()) return;

  const idx = state.questoes.findIndex(q => !state.respostas[q.id]);
  state.questaoAtual = idx === -1 ? state.questoes.length : idx;
  _exibirQuestao(state.questaoAtual);
}

// ─── Etapa 3: Perguntas ───────────────────────────────────────────────────────
function _exibirQuestao(indice) {
  if (indice >= state.questoes.length) {
    _exibirConfirmacao();
    return;
  }
  if (indice < 0) return;

  state.questaoAtual = indice;
  const questao  = state.questoes[indice];
  const resposta = state.respostas[questao.id] || null;

  window.Renderer.renderizarQuestao(questao, indice, state.questoes.length, resposta);

  // Atualiza botões de navegação
  const btnAnterior = document.querySelector('.questao__btn-anterior');
  const btnProxima  = document.querySelector('.questao__btn-proxima');
  if (btnAnterior) btnAnterior.disabled = indice === 0;
  if (btnProxima)  btnProxima.disabled  = !resposta;

  navegarPara('questao');

  // Foca na pergunta para leitores de tela
  setTimeout(() => {
    const p = document.querySelector('.questao__pergunta');
    if (p) p.focus();
  }, 80);
}

function _responderQuestao(letra) {
  const questao = state.questoes[state.questaoAtual];
  if (!questao) return;

  const jaRespondida = !!state.respostas[questao.id];
  state.respostas[questao.id] = letra;

  if (!state.iniciadoEm) state.iniciadoEm = new Date().toISOString();

  // Persiste imediatamente no localStorage
  if (state.storageOk) {
    window.AssessmentStorage.salvar(state.codigo, {
      dadosPessoais: state.dadosPessoais,
      respostas:     state.respostas,
      questaoAtual:  state.questaoAtual,
      iniciadoEm:    state.iniciadoEm
    });
  }

  // Feedback visual na opção selecionada
  const opcoes = document.querySelectorAll('.questao__opcao');
  opcoes.forEach(btn => {
    btn.classList.toggle('questao__opcao--selecionada', btn.dataset.letra === letra);
    btn.setAttribute('aria-pressed', btn.dataset.letra === letra ? 'true' : 'false');
    btn.disabled = true;
  });

  // Habilita Próxima assim que uma resposta é selecionada
  const btnProxima = document.querySelector('.questao__btn-proxima');
  if (btnProxima) btnProxima.disabled = false;

  if (!jaRespondida) {
    // Primeira resposta: avança automaticamente após feedback visual
    setTimeout(() => {
      opcoes.forEach(btn => { btn.disabled = false; });
      _exibirQuestao(state.questaoAtual + 1);
    }, 350);
  } else {
    // Revisita: apenas atualiza a seleção, não avança — usuário usa botão Próxima
    setTimeout(() => {
      opcoes.forEach(btn => { btn.disabled = false; });
    }, 350);
  }
}

// ─── Etapa 4: Revisão / Confirmação ──────────────────────────────────────────
function _exibirConfirmacao() {
  const respondidas      = state.questoes.filter(q => state.respostas[q.id]).length;
  const total            = state.questoes.length;
  const todasRespondidas = respondidas === total;

  document.querySelector('.confirmacao__respondidas').textContent = respondidas;
  document.querySelector('.confirmacao__total').textContent       = total;

  const btnEnviar = document.querySelector('.confirmacao__btn-enviar');
  const avisoEl   = document.querySelector('.confirmacao__aviso-incompleto');
  if (btnEnviar) btnEnviar.disabled  = !todasRespondidas;
  if (avisoEl)   avisoEl.hidden      = todasRespondidas;

  navegarPara('confirmacao');
}

// ─── Submissão ────────────────────────────────────────────────────────────────
async function _enviarAssessment() {
  navegarPara('enviando');

  try {
    const { status, data } = await Api.submeter(
      state.codigo,
      state.dadosPessoais,
      state.respostas
    );

    if (status === 200) {
      if (state.storageOk) window.AssessmentStorage.limpar(state.codigo);
      state.resultado = data.resultado;
      _exibirResultado();

    } else if (status === 409) {
      if (state.storageOk) window.AssessmentStorage.limpar(state.codigo);
      navegarPara('ja-concluido');

    } else {
      // Preserva localStorage para retry
      navegarPara('erro-envio');
    }

  } catch (err) {
    console.error('[app] Erro no submit:', err);
    navegarPara('erro-envio');
  }
}

// ─── Etapa 5: Resultado ───────────────────────────────────────────────────────
function _exibirResultado() {
  const nomeEl = document.querySelector('.resultado__nome');
  if (nomeEl) {
    nomeEl.textContent = state.dadosPessoais.nome || state.dadosAssessment.nome || '';
  }

  const container = document.querySelector('.resultado__relatorio');
  if (container && state.resultado) {
    window.renderizarRelatorio(state.resultado, container);
  }

  navegarPara('resultado');
}

// ─── Event listeners ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Etapa 1 — Identificação
  document.querySelector('.ident__btn-iniciar')
    .addEventListener('click', iniciarFluxo);

  document.querySelector('.ident__btn-retomar')
    .addEventListener('click', retomar);

  document.querySelector('#input-nome')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') document.querySelector('#input-cargo').focus();
    });

  document.querySelector('#input-cargo')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') document.querySelector('.ident__btn-iniciar').click();
    });

  // Etapa 2 — Instruções
  document.querySelector('.instrucoes__btn-comecar')
    .addEventListener('click', () => {
      if (!state.iniciadoEm) state.iniciadoEm = new Date().toISOString();
      _exibirQuestao(0);
    });

  // Etapa 3 — Perguntas: seleção de resposta (event delegation)
  document.querySelector('.questao__opcoes')
    .addEventListener('click', e => {
      const opcao = e.target.closest('.questao__opcao');
      if (opcao && !opcao.disabled) _responderQuestao(opcao.dataset.letra);
    });

  // Etapa 3 — Perguntas: navegação anterior/próxima
  document.querySelector('.questao__btn-anterior')
    .addEventListener('click', () => {
      if (state.questaoAtual > 0) _exibirQuestao(state.questaoAtual - 1);
    });

  document.querySelector('.questao__btn-proxima')
    .addEventListener('click', () => {
      const questao = state.questoes[state.questaoAtual];
      if (questao && state.respostas[questao.id]) {
        _exibirQuestao(state.questaoAtual + 1);
      }
    });

  // Etapa 4 — Confirmação
  document.querySelector('.confirmacao__btn-enviar')
    .addEventListener('click', _enviarAssessment);

  document.querySelector('.confirmacao__btn-revisar')
    .addEventListener('click', () => {
      _exibirQuestao(Math.max(0, state.questoes.length - 1));
    });

  // Erro de envio — retry
  document.querySelector('.erro-envio__btn-retry')
    .addEventListener('click', _enviarAssessment);

  // Captura rejeições não tratadas — evita travar na tela de carregamento
  window.addEventListener('unhandledrejection', () => {
    if (state.viewAtual === 'carregando') navegarPara('link-invalido');
  });

  inicializar();
});
