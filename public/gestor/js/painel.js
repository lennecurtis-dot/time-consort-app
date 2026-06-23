'use strict';

// ─── Estado ────────────────────────────────────────────────────────────────────
const SESSION_KEY = 'gestor_token';

const state = {
  token:        sessionStorage.getItem(SESSION_KEY) || null,
  viewAtual:    null,
  viewAnterior: null,
  paginaAtual:  1,
  totalPaginas: 1,
  buscaAtual:   '',
  assessments:  []
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

async function copiarTexto(texto, btnEl) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch (_) {
    const el = document.createElement('textarea');
    el.value = texto;
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  if (!btnEl) return;
  const textoEl = btnEl.querySelector('.btn-copiar__texto');
  if (textoEl) {
    const original = textoEl.textContent;
    textoEl.textContent = 'Copiado!';
    btnEl.classList.add('btn-copiar--ok');
    setTimeout(() => {
      textoEl.textContent = original;
      btnEl.classList.remove('btn-copiar--ok');
    }, 2000);
  }
}

function formatarData(iso) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(iso));
  } catch (_) { return iso; }
}

function labelDisc(k) {
  const m = { dominancia: 'Dominância (D)', influencia: 'Influência (I)',
               estabilidade: 'Estabilidade (S)', conformidade: 'Conformidade (C)' };
  return m[k] || k || '—';
}
function labelTemp(k) {
  const m = { colerico: 'Colérico', sanguineo: 'Sanguíneo',
               fleumatico: 'Fleumático', melancolico: 'Melancólico' };
  return m[k] || k || '—';
}
function labelApt(k) {
  const m = { pap: 'Prosp. Presencial', ligarAtivo: 'Ligações Ativas',
               leadsDigitais: 'Leads Digitais', plantao: 'Plantão' };
  return m[k] || k || '—';
}

function copiarMini(btnEl) {
  const url = btnEl.dataset.url || '';
  if (!url) return;
  copiarTexto(url, null);
  const original = btnEl.textContent;
  btnEl.textContent = '✓';
  btnEl.classList.add('btn-copiar-mini--ok');
  setTimeout(() => {
    btnEl.textContent = original;
    btnEl.classList.remove('btn-copiar-mini--ok');
  }, 2000);
}

// ─── Navegação ─────────────────────────────────────────────────────────────────
function navegarPara(viewId) {
  document.querySelectorAll('.painel-view').forEach(el => {
    const ativo = el.dataset.painelView === viewId;
    el.setAttribute('aria-hidden', ativo ? 'false' : 'true');
  });
  state.viewAnterior = state.viewAtual;
  state.viewAtual    = viewId;
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
  const senhaEl = document.getElementById('input-senha');
  const erroEl  = document.getElementById('erro-login');
  const btnEl   = document.getElementById('btn-entrar');

  erroEl.textContent = '';
  btnEl.disabled     = true;
  btnEl.textContent  = 'Entrando…';

  try {
    const { status, data } = await apiFetch('/api/gestor/login', {
      method: 'POST',
      body: JSON.stringify({ senha: senhaEl.value })
    });

    if (status === 200 && data.token) {
      state.token = data.token;
      sessionStorage.setItem(SESSION_KEY, data.token);
      senhaEl.value = '';
      await carregarDashboard();
    } else {
      erroEl.textContent = data.erro || 'Senha incorreta.';
      senhaEl.focus();
    }
  } catch (_) {
    erroEl.textContent = 'Erro de conexão. Tente novamente.';
  } finally {
    btnEl.disabled    = false;
    btnEl.textContent = 'Entrar';
  }
}

function deslogar() {
  apiFetch('/api/gestor/logout', { method: 'POST' }).catch(() => {});
  state.token = null;
  sessionStorage.removeItem(SESSION_KEY);
  fecharModal();
  navegarPara('login');
  setTimeout(() => document.getElementById('input-senha').focus(), 60);
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
async function carregarDashboard() {
  navegarPara('dashboard');

  ['stat-concluidos-val','stat-total-val','stat-disc-val','stat-temp-val','stat-apt-val']
    .forEach(id => { document.getElementById(id).textContent = '…'; });

  document.getElementById('tbody-recentes').innerHTML =
    '<tr><td colspan="6" class="painel-tabela__vazio">Carregando…</td></tr>';

  try {
    const { status, data } = await apiFetch('/api/gestor/stats');
    if (status === 401) { deslogar(); return; }

    document.getElementById('stat-concluidos-val').textContent = data.concluidos ?? 0;
    document.getElementById('stat-total-val').textContent      = data.total      ?? 0;
    document.getElementById('stat-disc-val').textContent       = labelDisc(data.discTop);
    document.getElementById('stat-temp-val').textContent       = labelTemp(data.tempTop);
    document.getElementById('stat-apt-val').textContent        = labelApt(data.aptTop);
  } catch (_) {
    ['stat-concluidos-val','stat-total-val','stat-disc-val','stat-temp-val','stat-apt-val']
      .forEach(id => { document.getElementById(id).textContent = '—'; });
  }

  try {
    const { status, data } = await apiFetch('/api/gestor/assessments?pagina=1');
    if (status === 401) { deslogar(); return; }

    const tbody    = document.getElementById('tbody-recentes');
    const recentes = (data.items || []).slice(0, 5);

    if (!recentes.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="painel-tabela__vazio">Nenhum assessment concluído ainda.</td></tr>';
      return;
    }

    tbody.innerHTML = recentes.map(a => `
      <tr class="painel-tabela__linha" data-id="${esc(String(a.id))}" tabindex="0"
          role="button" aria-label="Ver assessment de ${esc(a.nome)}">
        <td>${esc(a.nome)}</td>
        <td class="col-email">${esc(a.email)}</td>
        <td>${esc(a.perfis?.disc || '—')}</td>
        <td class="col-apt">${esc(a.perfis?.aptidao || '—')}</td>
        <td class="col-data">${esc(formatarData(a.concluido_em))}</td>
        <td class="col-link">
          <button class="btn-copiar-mini" data-url="${esc(a.url || '')}"
                  title="Copiar link" aria-label="Copiar link de ${esc(a.nome)}">⎘</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.painel-tabela__linha').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('.btn-copiar-mini')) return;
        verDetalhe(parseInt(tr.dataset.id), 'dashboard');
      });
      tr.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          verDetalhe(parseInt(tr.dataset.id), 'dashboard');
        }
      });
    });
    tbody.querySelectorAll('.btn-copiar-mini').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); copiarMini(btn); });
    });
  } catch (_) {
    document.getElementById('tbody-recentes').innerHTML =
      '<tr><td colspan="6" class="painel-tabela__vazio">Erro ao carregar.</td></tr>';
  }
}

// ─── Lista ─────────────────────────────────────────────────────────────────────
async function carregarLista(pagina = 1, busca = '') {
  navegarPara('lista');
  state.paginaAtual = pagina;
  state.buscaAtual  = busca;

  document.getElementById('input-busca').value         = busca;
  document.getElementById('lista-status').textContent  = 'Carregando…';
  document.getElementById('tbody-lista').innerHTML     =
    '<tr><td colspan="7" class="painel-tabela__vazio">Carregando…</td></tr>';

  const params = new URLSearchParams({ pagina: String(pagina) });
  if (busca) params.set('q', busca);

  try {
    const { status, data } = await apiFetch(`/api/gestor/assessments?${params}`);
    if (status === 401) { deslogar(); return; }

    state.assessments  = data.items    || [];
    state.totalPaginas = data.paginas  || 1;

    const total = data.total || 0;
    document.getElementById('lista-status').textContent = busca
      ? `${total} resultado(s) para "${esc(busca)}"`
      : `${total} assessment(s) concluído(s)`;

    renderizarTabelaLista();
    renderizarPaginacao();
  } catch (_) {
    document.getElementById('lista-status').textContent = 'Erro ao carregar.';
    document.getElementById('tbody-lista').innerHTML =
      '<tr><td colspan="7" class="painel-tabela__vazio">Erro ao carregar.</td></tr>';
  }
}

function renderizarTabelaLista() {
  const tbody = document.getElementById('tbody-lista');

  if (!state.assessments.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="painel-tabela__vazio">Nenhum resultado encontrado.</td></tr>';
    return;
  }

  tbody.innerHTML = state.assessments.map(a => `
    <tr class="painel-tabela__linha" data-id="${esc(String(a.id))}" tabindex="0"
        role="button" aria-label="Ver assessment de ${esc(a.nome)}">
      <td>${esc(a.nome)}</td>
      <td class="col-email">${esc(a.email)}</td>
      <td class="col-codigo"><code>${esc(a.codigo)}</code></td>
      <td>${esc(a.perfis?.disc || '—')}</td>
      <td class="col-apt">${esc(a.perfis?.aptidao || '—')}</td>
      <td class="col-data">${esc(formatarData(a.concluido_em))}</td>
      <td class="col-link">
        <button class="btn-copiar-mini" data-url="${esc(a.url || '')}"
                title="Copiar link" aria-label="Copiar link de ${esc(a.nome)}">⎘</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.painel-tabela__linha').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('.btn-copiar-mini')) return;
      verDetalhe(parseInt(tr.dataset.id), 'lista');
    });
    tr.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        verDetalhe(parseInt(tr.dataset.id), 'lista');
      }
    });
  });
  tbody.querySelectorAll('.btn-copiar-mini').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); copiarMini(btn); });
  });
}

function renderizarPaginacao() {
  document.getElementById('pag-info').textContent =
    `Página ${state.paginaAtual} de ${state.totalPaginas}`;
  document.getElementById('btn-anterior-pag').disabled = state.paginaAtual <= 1;
  document.getElementById('btn-proxima-pag').disabled  = state.paginaAtual >= state.totalPaginas;
}

// ─── Detalhe ───────────────────────────────────────────────────────────────────
async function verDetalhe(id, origem = 'lista') {
  const container = document.getElementById('detalhe-relatorio');
  container.innerHTML = '<div class="painel-carregando">Carregando relatório…</div>';

  const btnVoltar = document.getElementById('btn-voltar-detalhe');
  btnVoltar.textContent = origem === 'dashboard' ? '← Painel' : '← Lista';

  navegarPara('detalhe');

  try {
    const { status, data } = await apiFetch(`/api/gestor/assessments/${id}`);
    if (status === 401) { deslogar(); return; }

    if (status !== 200) {
      container.innerHTML = '<p class="painel-erro">Erro ao carregar o assessment.</p>';
      return;
    }

    document.getElementById('detalhe-titulo').textContent = data.nome   || '';
    document.getElementById('detalhe-email').textContent  = data.email  || '';
    document.getElementById('detalhe-codigo').textContent = data.codigo || '';
    document.getElementById('detalhe-data').textContent   = formatarData(data.concluido_em);

    const urlEl  = document.getElementById('detalhe-url');
    const btnUrl = document.getElementById('btn-copiar-url');
    if (data.url) {
      urlEl.href        = data.url;
      urlEl.textContent = data.url;
      urlEl.hidden      = false;
      btnUrl.hidden     = false;
      btnUrl.onclick    = () => copiarTexto(data.url, btnUrl);
    } else {
      urlEl.hidden  = true;
      btnUrl.hidden = true;
    }

    if (data.resultado) {
      container.innerHTML = '';
      window.renderizarRelatorio(data.resultado, container);
    } else {
      container.innerHTML = '<p class="painel-erro">Resultado não disponível para este assessment.</p>';
    }
  } catch (_) {
    container.innerHTML = '<p class="painel-erro">Erro de conexão. Tente novamente.</p>';
  }
}

// ─── Modal Novo Assessment ──────────────────────────────────────────────────────
function abrirModal() {
  resetarModal();
  const overlay = document.getElementById('modal-novo');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('modal-input-nome').focus(), 50);
}

function fecharModal() {
  const overlay = document.getElementById('modal-novo');
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function resetarModal() {
  document.getElementById('modal-corpo-form').hidden = false;
  document.getElementById('modal-resultado').hidden  = true;
  document.getElementById('modal-input-nome').value  = '';
  document.getElementById('modal-input-email').value = '';
  document.getElementById('modal-erro-nome').textContent  = '';
  document.getElementById('modal-erro-email').textContent = '';
  const btn = document.getElementById('btn-gerar-link');
  btn.disabled    = false;
  btn.textContent = 'Gerar Link';
}

async function gerarLink() {
  const nomeEl    = document.getElementById('modal-input-nome');
  const emailEl   = document.getElementById('modal-input-email');
  const erroNome  = document.getElementById('modal-erro-nome');
  const erroEmail = document.getElementById('modal-erro-email');
  const btnGerar  = document.getElementById('btn-gerar-link');

  erroNome.textContent  = '';
  erroEmail.textContent = '';

  const nome  = nomeEl.value.trim();
  const email = emailEl.value.trim();

  let valido = true;
  if (!nome || nome.length < 3) {
    erroNome.textContent = 'Nome obrigatório (mínimo 3 caracteres).';
    nomeEl.focus();
    valido = false;
  }
  if (!email || !email.includes('@') || !email.includes('.')) {
    erroEmail.textContent = 'E-mail inválido.';
    if (valido) emailEl.focus();
    valido = false;
  }
  if (!valido) return;

  btnGerar.disabled    = true;
  btnGerar.textContent = 'Gerando…';

  try {
    const { status, data } = await apiFetch('/api/gestor/assessments', {
      method: 'POST',
      body: JSON.stringify({ nome, email })
    });

    if (status === 401) { deslogar(); return; }

    if (status !== 200 || !data.ok) {
      erroNome.textContent = data.erro || 'Erro ao gerar link. Tente novamente.';
      btnGerar.disabled    = false;
      btnGerar.textContent = 'Gerar Link';
      return;
    }

    // Exibir resultado
    document.getElementById('modal-corpo-form').hidden = true;
    const resultado = document.getElementById('modal-resultado');
    resultado.hidden = false;
    document.getElementById('modal-url-texto').textContent = data.url;

    const btnCopiar = document.getElementById('btn-copiar-novo');
    btnCopiar.onclick = () => copiarTexto(data.url, btnCopiar);
    btnCopiar.focus();

  } catch (_) {
    erroNome.textContent = 'Erro de conexão. Tente novamente.';
    btnGerar.disabled    = false;
    btnGerar.textContent = 'Gerar Link';
  }
}

// ─── Inicialização e event listeners ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Login
  document.getElementById('btn-entrar').addEventListener('click', login);
  document.getElementById('input-senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });

  // Logout (todos os botões com classe .btn-logout)
  document.querySelectorAll('.btn-logout').forEach(btn => {
    btn.addEventListener('click', deslogar);
  });

  // Dashboard → Lista completa
  document.getElementById('btn-ver-todos').addEventListener('click', () => {
    carregarLista(1, '');
  });

  // Lista → Painel
  document.getElementById('btn-voltar-dashboard').addEventListener('click', () => {
    carregarDashboard();
  });

  // Busca com debounce
  let debounce;
  document.getElementById('input-busca').addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => carregarLista(1, e.target.value.trim()), 350);
  });

  // Paginação
  document.getElementById('btn-anterior-pag').addEventListener('click', () => {
    if (state.paginaAtual > 1) carregarLista(state.paginaAtual - 1, state.buscaAtual);
  });
  document.getElementById('btn-proxima-pag').addEventListener('click', () => {
    if (state.paginaAtual < state.totalPaginas) carregarLista(state.paginaAtual + 1, state.buscaAtual);
  });

  // Detalhe → Voltar
  document.getElementById('btn-voltar-detalhe').addEventListener('click', () => {
    if (state.viewAnterior === 'dashboard') {
      carregarDashboard();
    } else {
      carregarLista(state.paginaAtual, state.buscaAtual);
    }
  });

  // Modal — abrir
  document.getElementById('btn-abrir-modal').addEventListener('click', abrirModal);
  document.getElementById('btn-abrir-modal-lista').addEventListener('click', abrirModal);

  // Modal — fechar
  document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
  document.getElementById('modal-novo').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharModal();
  });

  // Modal — gerar link
  document.getElementById('btn-gerar-link').addEventListener('click', gerarLink);
  document.getElementById('modal-input-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') gerarLink();
  });

  // Modal — gerar outro link
  document.getElementById('btn-outro-link').addEventListener('click', resetarModal);

  // Fechar com Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModal();
  });

  // Sessão ativa ao abrir a página
  if (state.token) {
    carregarDashboard();
  } else {
    navegarPara('login');
    setTimeout(() => document.getElementById('input-senha').focus(), 60);
  }
});
