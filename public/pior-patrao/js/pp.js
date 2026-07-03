'use strict';

// ─── Estado ────────────────────────────────────────────────────────────────────
const SESSION_KEY = 'pp_token';

const state = {
  token:    sessionStorage.getItem(SESSION_KEY) || null,
  nome:     sessionStorage.getItem('pp_nome')   || '',
  situacao: sessionStorage.getItem('pp_sit')    || 'pleno',
  viewAtual: null,
  vendas:   [],
  custosItens:    [],
  objetivosItens: []
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function brl(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);
}

function formatarData(iso) {
  if (!iso) return '—';
  const partes = iso.split('-');
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(iso));
  } catch (_) { return iso; }
}

function labelSituacao(s) {
  return s === 'estagiario' ? 'Estagiário' : 'Corretor Pleno';
}

// ─── Navegação ─────────────────────────────────────────────────────────────────
function navegarPara(viewId) {
  document.querySelectorAll('.pp-view').forEach(el => {
    const ativo = el.dataset.ppView === viewId;
    el.setAttribute('aria-hidden', ativo ? 'false' : 'true');
  });
  state.viewAtual = viewId;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ─── API ───────────────────────────────────────────────────────────────────────
async function apiFetch(url, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...(opts.headers || {})
  };
  const r    = await fetch(url, { ...opts, headers });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
async function login() {
  const emailEl = document.getElementById('input-email');
  const senhaEl = document.getElementById('input-senha');
  const erroEl  = document.getElementById('erro-login');
  const btnEl   = document.getElementById('btn-entrar');

  erroEl.textContent = '';
  btnEl.disabled     = true;
  btnEl.textContent  = 'Entrando…';

  try {
    const { status, data } = await apiFetch('/api/pp/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailEl.value.trim(), senha: senhaEl.value })
    });

    if (status === 200 && data.token) {
      state.token    = data.token;
      state.nome     = data.nome    || '';
      state.situacao = data.situacao || 'pleno';

      sessionStorage.setItem(SESSION_KEY, data.token);
      sessionStorage.setItem('pp_nome', state.nome);
      sessionStorage.setItem('pp_sit',  state.situacao);

      senhaEl.value = '';
      await iniciarSessao();
    } else {
      erroEl.textContent = data.erro || 'E-mail ou senha incorretos.';
      emailEl.focus();
    }
  } catch (_) {
    erroEl.textContent = 'Erro de conexão. Tente novamente.';
  } finally {
    btnEl.disabled    = false;
    btnEl.textContent = 'Entrar';
  }
}

function deslogar() {
  apiFetch('/api/pp/logout', { method: 'POST' }).catch(() => {});
  state.token    = null;
  state.nome     = '';
  state.situacao = 'pleno';
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('pp_nome');
  sessionStorage.removeItem('pp_sit');
  fecharModalVenda();
  navegarPara('login');
  setTimeout(() => document.getElementById('input-email').focus(), 60);
}

function verificarSessaoExpirada(status) {
  if (status === 401) { deslogar(); return true; }
  return false;
}

// ─── Iniciar sessão após login ─────────────────────────────────────────────────
async function iniciarSessao() {
  atualizarNomesHeader();

  const { status, data } = await apiFetch('/api/pp/calculos');
  if (verificarSessaoExpirada(status)) return;

  if (!data.configurado) {
    await carregarConfiguracaoView();
  } else {
    await carregarDashboard();
  }
}

function atualizarNomesHeader() {
  document.getElementById('header-nome-cfg').textContent  = state.nome;
  document.getElementById('header-nome-dash').textContent = state.nome;
}

// ─── View: Configuração — Custos e Objetivos dinâmicos ─────────────────────────
async function carregarConfiguracaoView() {
  navegarPara('configuracao');

  const badge   = document.getElementById('cfg-situacao-badge');
  const textoEl = document.getElementById('cfg-situacao-texto');
  badge.textContent        = labelSituacao(state.situacao);
  badge.dataset.situacao   = state.situacao;
  textoEl.textContent      = state.situacao === 'estagiario'
    ? 'Sua taxa de comissão é 1,034% do VGV.'
    : 'Sua taxa de comissão é 2,068% do VGV.';

  try {
    const { data } = await apiFetch('/api/pp/configuracao');
    state.custosItens    = (data.custosItens    && data.custosItens.length)    ? data.custosItens    : [{ nome: '', valor: '' }];
    state.objetivosItens = (data.objetivosItens && data.objetivosItens.length) ? data.objetivosItens : [{ nome: '', valor: '' }];
  } catch (_) {
    state.custosItens    = [{ nome: '', valor: '' }];
    state.objetivosItens = [{ nome: '', valor: '' }];
  }

  renderizarItens('custos');
  renderizarItens('objetivos');
}

function renderizarItens(tipo) {
  const container = document.getElementById(tipo === 'custos' ? 'lista-custos' : 'lista-objetivos');
  const itens      = tipo === 'custos' ? state.custosItens : state.objetivosItens;
  const placeholderNome = tipo === 'custos' ? 'Ex: Água, Energia, Internet…' : 'Ex: Trocar de carro, Entrada do imóvel…';

  container.innerHTML = itens.map((item, i) => `
    <div class="pp-item-row" data-index="${i}">
      <input class="pp-campo__input pp-item-row__nome" type="text"
             placeholder="${placeholderNome}" maxlength="100"
             value="${esc(item.nome)}" data-tipo="${tipo}" data-campo="nome" data-index="${i}">
      <input class="pp-campo__input pp-item-row__valor" type="number"
             min="0" step="0.01" placeholder="R$ 0,00"
             value="${esc(item.valor)}" data-tipo="${tipo}" data-campo="valor" data-index="${i}">
      <button class="pp-btn-remove-item" type="button"
              data-tipo="${tipo}" data-index="${i}"
              aria-label="Remover item" ${itens.length <= 1 ? 'disabled' : ''}>✕</button>
    </div>
  `).join('');

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', onItemInputChange);
  });
  container.querySelectorAll('.pp-btn-remove-item').forEach(btn => {
    btn.addEventListener('click', () => removerItem(btn.dataset.tipo, parseInt(btn.dataset.index)));
  });

  atualizarSomaExibida(tipo);
}

function onItemInputChange(e) {
  const { tipo, campo, index } = e.target.dataset;
  const itens = tipo === 'custos' ? state.custosItens : state.objetivosItens;
  const i     = parseInt(index);
  if (!itens[i]) return;

  itens[i][campo] = campo === 'valor' ? e.target.value : e.target.value;

  // Auto-adiciona nova linha vazia quando o usuário começa a preencher a última
  const ultima = itens[itens.length - 1];
  if (ultima.nome.trim() !== '' || String(ultima.valor).trim() !== '') {
    itens.push({ nome: '', valor: '' });
    renderizarItens(tipo);
    // Mantém o foco no campo que o usuário estava editando
    setTimeout(() => {
      const seletor = `[data-tipo="${tipo}"][data-campo="${campo}"][data-index="${i}"]`;
      const el = document.querySelector(seletor);
      if (el) { el.focus(); el.setSelectionRange?.(el.value.length, el.value.length); }
    }, 0);
    return;
  }

  atualizarSomaExibida(tipo);
}

function removerItem(tipo, index) {
  const itens = tipo === 'custos' ? state.custosItens : state.objetivosItens;
  if (itens.length <= 1) return;
  itens.splice(index, 1);
  renderizarItens(tipo);
}

function somarItensValidos(itens) {
  return itens.reduce((s, item) => {
    const v = parseFloat(item.valor);
    return s + (isNaN(v) ? 0 : v);
  }, 0);
}

function atualizarSomaExibida(tipo) {
  const itens = tipo === 'custos' ? state.custosItens : state.objetivosItens;
  const soma  = somarItensValidos(itens);
  const alvo  = document.getElementById(tipo === 'custos' ? 'total-custos-soma' : 'total-objetivos-soma');
  if (alvo) alvo.textContent = brl(soma);
}

async function salvarConfiguracao() {
  const erroEl = document.getElementById('cfg-erro-geral');
  const btnEl  = document.getElementById('btn-salvar-cfg');
  erroEl.textContent = '';

  const limpar = (itens) => itens
    .map(it => ({ nome: (it.nome || '').trim(), valor: parseFloat(it.valor) }))
    .filter(it => it.nome && !isNaN(it.valor) && it.valor >= 0);

  const custosLimpos    = limpar(state.custosItens);
  const objetivosLimpos = limpar(state.objetivosItens);

  if (!custosLimpos.length) {
    erroEl.textContent = 'Adicione pelo menos um custo mensal com nome e valor.';
    return;
  }
  if (!objetivosLimpos.length) {
    erroEl.textContent = 'Adicione pelo menos um objetivo com nome e valor.';
    return;
  }

  btnEl.disabled    = true;
  btnEl.textContent = 'Salvando…';

  try {
    const { status, data } = await apiFetch('/api/pp/configuracao', {
      method: 'PUT',
      body: JSON.stringify({ custosItens: custosLimpos, objetivosItens: objetivosLimpos })
    });
    if (verificarSessaoExpirada(status)) return;

    if (status !== 200 || !data.ok) {
      erroEl.textContent = data.erro || 'Erro ao salvar. Tente novamente.';
      return;
    }

    await carregarDashboard();
  } catch (_) {
    erroEl.textContent = 'Erro de conexão. Tente novamente.';
  } finally {
    btnEl.disabled    = false;
    btnEl.textContent = 'Calcular metas';
  }
}

// ─── View: Dashboard ───────────────────────────────────────────────────────────
async function carregarDashboard() {
  navegarPara('dashboard');
  ativarNavBtn('dash');

  atualizarNomesHeader();

  const badge = document.getElementById('dash-situacao-badge');
  badge.textContent      = labelSituacao(state.situacao);
  badge.dataset.situacao = state.situacao;

  // Metas
  try {
    const { status, data } = await apiFetch('/api/pp/calculos');
    if (verificarSessaoExpirada(status)) return;

    if (data.configurado) {
      document.getElementById('resumo-custo-mensal').textContent   = brl(data.custoMensalTotal);
      document.getElementById('resumo-custo-anual').textContent    = brl(data.custoAnualTotal);
      document.getElementById('resumo-objetivo-total').textContent = brl(data.objetivoTotal);

      document.getElementById('meta-anual').textContent   = brl(data.ganhoAnual);
      document.getElementById('meta-mensal').textContent  = brl(data.ganhoMensal);
      document.getElementById('meta-semanal').textContent = brl(data.ganhoSemanal);
      document.getElementById('meta-diario').textContent  = brl(data.ganhoDiario);
      document.getElementById('meta-hora').textContent    = brl(data.ganhoPorHora);
      document.getElementById('vgv-pleno').textContent      = brl(data.vgvPleno);
      document.getElementById('vgv-estagiario').textContent = brl(data.vgvEstagiario);
    }
  } catch (_) {}

  // Vendas resumo
  await carregarResumoVendas();
}

async function carregarResumoVendas() {
  try {
    const { status, data } = await apiFetch('/api/pp/vendas');
    if (verificarSessaoExpirada(status)) return;

    state.vendas = data.items || [];
    renderizarResumoVendas();
  } catch (_) {}
}

function renderizarResumoVendas() {
  const vendas = state.vendas;

  document.getElementById('resumo-total-vendas').textContent = vendas.length;

  const vgvTotal       = vendas.reduce((s, v) => s + v.vgv,      0);
  const comissaoTotal  = vendas.reduce((s, v) => s + v.comissao, 0);
  const reinvTotal     = vendas.reduce((s, v) => s + v.dist_reinvestimento, 0);
  const custosTotal    = vendas.reduce((s, v) => s + v.dist_custos,         0);
  const lucroTotal     = vendas.reduce((s, v) => s + v.dist_lucro,          0);

  document.getElementById('resumo-vgv-total').textContent     = brl(vgvTotal);
  document.getElementById('resumo-comissao-total').textContent = brl(comissaoTotal);
  document.getElementById('dist-reinvestimento').textContent   = brl(reinvTotal);
  document.getElementById('dist-custos').textContent           = brl(custosTotal);
  document.getElementById('dist-lucro').textContent            = brl(lucroTotal);
}

// ─── View: Vendas ──────────────────────────────────────────────────────────────
async function carregarVendas() {
  navegarPara('vendas');
  ativarNavBtn('vendas');

  const container = document.getElementById('lista-vendas-container');
  container.innerHTML = '<p class="pp-vazio">Carregando…</p>';

  try {
    const { status, data } = await apiFetch('/api/pp/vendas');
    if (verificarSessaoExpirada(status)) return;

    state.vendas = data.items || [];
    renderizarListaVendas();
  } catch (_) {
    container.innerHTML = '<p class="pp-vazio">Erro ao carregar vendas.</p>';
  }
}

function renderizarListaVendas() {
  const container = document.getElementById('lista-vendas-container');

  if (!state.vendas.length) {
    container.innerHTML = `
      <div class="pp-vazio">
        <p>Nenhuma venda registrada ainda.</p>
        <button class="pp-btn-secondary pp-vazio--action" id="btn-primeira-venda" type="button">
          + Registrar primeira venda
        </button>
      </div>
    `;
    document.getElementById('btn-primeira-venda')
      ?.addEventListener('click', abrirModalVenda);
    return;
  }

  container.innerHTML = `
    <div class="pp-vendas-lista">
      ${state.vendas.map(v => `
        <div class="pp-venda-card">
          <div>
            <div class="pp-venda-card__header">
              <span class="pp-venda-card__desc">${esc(v.descricao || 'Venda')}</span>
              <span class="pp-venda-card__data">${formatarData(v.data_venda)}</span>
            </div>
            <p class="pp-venda-card__vgv">VGV: ${brl(v.vgv)}</p>
            <div class="pp-venda-card__dist">
              <span class="pp-venda-card__dist-tag pp-venda-card__dist-tag--reinvestimento">
                Reinvestimento ${brl(v.dist_reinvestimento)}
              </span>
              <span class="pp-venda-card__dist-tag pp-venda-card__dist-tag--custos">
                Custos ${brl(v.dist_custos)}
              </span>
              <span class="pp-venda-card__dist-tag pp-venda-card__dist-tag--lucro">
                Lucro ${brl(v.dist_lucro)}
              </span>
            </div>
          </div>
          <div>
            <span class="pp-venda-card__comissao-label">Comissão</span>
            <span class="pp-venda-card__comissao">${brl(v.comissao)}</span>
            <button class="pp-btn-excluir" data-id="${esc(String(v.id))}"
                    type="button" aria-label="Excluir venda">Excluir</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.pp-btn-excluir').forEach(btn => {
    btn.addEventListener('click', () => excluirVenda(parseInt(btn.dataset.id)));
  });
}

async function excluirVenda(id) {
  if (!confirm('Deseja excluir esta venda?')) return;

  try {
    const { status, data } = await apiFetch(`/api/pp/vendas/${id}`, { method: 'DELETE' });
    if (verificarSessaoExpirada(status)) return;

    if (status !== 200) {
      alert(data.erro || 'Erro ao excluir.');
      return;
    }

    await carregarVendas();
    renderizarResumoVendas();
  } catch (_) {
    alert('Erro de conexão. Tente novamente.');
  }
}

// ─── Nav helper ────────────────────────────────────────────────────────────────
function ativarNavBtn(qual) {
  const mapa = {
    dash:   ['nav-dashboard',   'nav-vendas',   'nav-config'],
    vendas: ['nav-dashboard-v', 'nav-vendas-v', 'nav-config-v'],
    config: []
  };
  const todos = [...document.querySelectorAll('.pp-nav__btn')];
  todos.forEach(b => b.classList.remove('pp-nav__btn--ativo'));

  const ids = mapa[qual] || [];
  if (qual === 'dash')   document.getElementById(ids[0])?.classList.add('pp-nav__btn--ativo');
  if (qual === 'vendas') document.getElementById(ids[1])?.classList.add('pp-nav__btn--ativo');
}

// ─── Modal nova venda ──────────────────────────────────────────────────────────
function abrirModalVenda() {
  resetarModalVenda();
  const overlay = document.getElementById('modal-venda');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('venda-data').value = hoje;

  setTimeout(() => document.getElementById('venda-vgv').focus(), 50);
}

function fecharModalVenda() {
  const overlay = document.getElementById('modal-venda');
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function resetarModalVenda() {
  document.getElementById('modal-venda-form').hidden     = false;
  document.getElementById('modal-venda-resultado').hidden = true;
  document.getElementById('venda-descricao').value = '';
  document.getElementById('venda-vgv').value       = '';
  document.getElementById('venda-data').value      = '';
  document.getElementById('venda-erro-vgv').textContent  = '';
  document.getElementById('venda-erro-data').textContent = '';
  const btn = document.getElementById('btn-salvar-venda');
  btn.disabled    = false;
  btn.textContent = 'Registrar';
}

async function registrarVenda() {
  const descEl   = document.getElementById('venda-descricao');
  const vgvEl    = document.getElementById('venda-vgv');
  const dataEl   = document.getElementById('venda-data');
  const erroVgv  = document.getElementById('venda-erro-vgv');
  const erroData = document.getElementById('venda-erro-data');
  const btnEl    = document.getElementById('btn-salvar-venda');

  erroVgv.textContent  = '';
  erroData.textContent = '';

  const vgv  = parseFloat(vgvEl.value);
  const data = dataEl.value;
  let valido = true;

  if (isNaN(vgv) || vgv <= 0) {
    erroVgv.textContent = 'Informe o VGV da venda.';
    vgvEl.focus();
    valido = false;
  }
  if (!data) {
    erroData.textContent = 'Informe a data da venda.';
    if (valido) dataEl.focus();
    valido = false;
  }
  if (!valido) return;

  btnEl.disabled    = true;
  btnEl.textContent = 'Registrando…';

  try {
    const { status, data: resp } = await apiFetch('/api/pp/vendas', {
      method: 'POST',
      body: JSON.stringify({
        descricao:  descEl.value.trim(),
        vgv,
        data_venda: data
      })
    });

    if (verificarSessaoExpirada(status)) return;

    if (status !== 200 || !resp.ok) {
      erroVgv.textContent = resp.erro || 'Erro ao registrar. Tente novamente.';
      btnEl.disabled    = false;
      btnEl.textContent = 'Registrar';
      return;
    }

    document.getElementById('modal-venda-form').hidden     = true;
    document.getElementById('modal-venda-resultado').hidden = false;
    document.getElementById('modal-venda-detalhe').innerHTML = `
      <div class="pp-modal-resultado__row">
        <span>VGV</span><span>${brl(vgv)}</span>
      </div>
      <div class="pp-modal-resultado__row">
        <span>Comissão</span><span>${brl(resp.comissao)}</span>
      </div>
      <div class="pp-modal-resultado__row">
        <span>Reinvestimento (30%)</span><span>${brl(resp.dist_reinvestimento)}</span>
      </div>
      <div class="pp-modal-resultado__row">
        <span>Custos (30%)</span><span>${brl(resp.dist_custos)}</span>
      </div>
      <div class="pp-modal-resultado__row">
        <span>Lucro (40%)</span><span>${brl(resp.dist_lucro)}</span>
      </div>
    `;

    await carregarResumoVendas();
  } catch (_) {
    erroVgv.textContent = 'Erro de conexão. Tente novamente.';
    btnEl.disabled    = false;
    btnEl.textContent = 'Registrar';
  }
}

// ─── Inicialização ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('btn-entrar').addEventListener('click', login);
  document.getElementById('input-senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });
  document.getElementById('input-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('input-senha').focus();
  });

  document.getElementById('btn-logout-cfg').addEventListener('click', deslogar);
  document.getElementById('btn-logout-dash').addEventListener('click', deslogar);
  document.getElementById('btn-logout-vendas').addEventListener('click', deslogar);

  document.getElementById('btn-add-custo').addEventListener('click', () => {
    state.custosItens.push({ nome: '', valor: '' });
    renderizarItens('custos');
    const inputs = document.querySelectorAll('#lista-custos .pp-item-row__nome');
    inputs[inputs.length - 1]?.focus();
  });

  document.getElementById('btn-add-objetivo').addEventListener('click', () => {
    state.objetivosItens.push({ nome: '', valor: '' });
    renderizarItens('objetivos');
    const inputs = document.querySelectorAll('#lista-objetivos .pp-item-row__nome');
    inputs[inputs.length - 1]?.focus();
  });

  document.getElementById('btn-salvar-cfg').addEventListener('click', salvarConfiguracao);

  document.getElementById('nav-dashboard').addEventListener('click', () => carregarDashboard());
  document.getElementById('nav-vendas').addEventListener('click',    () => carregarVendas());
  document.getElementById('nav-config').addEventListener('click',    () => carregarConfiguracaoView());

  document.getElementById('nav-dashboard-v').addEventListener('click', () => carregarDashboard());
  document.getElementById('nav-vendas-v').addEventListener('click',    () => carregarVendas());
  document.getElementById('nav-config-v').addEventListener('click',    () => carregarConfiguracaoView());

  document.getElementById('btn-nova-venda-dash').addEventListener('click', abrirModalVenda);
  document.getElementById('btn-nova-venda').addEventListener('click',      abrirModalVenda);

  document.getElementById('btn-fechar-modal-venda').addEventListener('click', fecharModalVenda);
  document.getElementById('modal-venda').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharModalVenda();
  });

  document.getElementById('btn-salvar-venda').addEventListener('click', registrarVenda);
  document.getElementById('venda-data').addEventListener('keydown', e => {
    if (e.key === 'Enter') registrarVenda();
  });

  document.getElementById('btn-outra-venda').addEventListener('click', () => {
    resetarModalVenda();
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('venda-data').value = hoje;
    setTimeout(() => document.getElementById('venda-vgv').focus(), 50);
  });
  document.getElementById('btn-ok-venda').addEventListener('click', () => {
    fecharModalVenda();
    if (state.viewAtual === 'vendas') {
      carregarVendas();
    } else {
      carregarDashboard();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModalVenda();
  });

  if (state.token) {
    iniciarSessao();
  } else {
    navegarPara('login');
    setTimeout(() => document.getElementById('input-email').focus(), 60);
  }
});
