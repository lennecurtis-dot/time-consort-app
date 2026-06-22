'use strict';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Renderização da questão ──────────────────────────────────────────────────

function renderizarQuestao(questao, indice, total, respostaAtual) {
  const view     = document.querySelector('[data-view="questao"]');
  const progresso = Math.round((indice / total) * 100);

  view.querySelector('.questao__numero').textContent = indice + 1;
  view.querySelector('.questao__total').textContent  = total;

  const barra = view.querySelector('.questao__progresso-preenchimento');
  barra.style.width = `${progresso}%`;
  barra.closest('[role="progressbar"]').setAttribute('aria-valuenow', progresso);
  barra.closest('[role="progressbar"]').setAttribute(
    'aria-label', `Questão ${indice + 1} de ${total}`
  );

  view.querySelector('.questao__categoria').textContent = questao.categoria;
  view.querySelector('.questao__pergunta').textContent  = questao.pergunta;

  const opcoes = view.querySelectorAll('.questao__opcao');
  ['A', 'B', 'C', 'D'].forEach((letra, i) => {
    const btn      = opcoes[i];
    const selecion = respostaAtual === letra;

    btn.dataset.letra = letra;
    btn.querySelector('.questao__opcao-letra').textContent = letra;
    btn.querySelector('.questao__opcao-texto').textContent = questao.alternativas[letra] || '';
    btn.classList.toggle('questao__opcao--selecionada', selecion);
    btn.setAttribute('aria-pressed', selecion ? 'true' : 'false');
  });
}

// ─── Renderização do relatório ────────────────────────────────────────────────

function _grupoScores(titulo, itens, scores) {
  const linhas = itens.map(({ label, key }) => {
    const val = scores[key] ?? 0;
    return `
      <div class="relatorio__score-item">
        <span class="relatorio__score-label">${esc(label)}</span>
        <div class="relatorio__barra-container"
             role="progressbar"
             aria-valuenow="${val}"
             aria-valuemin="0"
             aria-valuemax="100"
             aria-label="${esc(label)}: ${val} de 100">
          <div class="relatorio__barra-preenchimento" style="width:${val}%"></div>
        </div>
        <span class="relatorio__score-valor">${val}</span>
      </div>`;
  }).join('');

  return `
    <div class="relatorio__grupo-scores">
      <h4 class="relatorio__grupo-titulo">${esc(titulo)}</h4>
      ${linhas}
    </div>`;
}

function _campoAnalise(titulo, texto) {
  return `
    <div class="relatorio__analise-item">
      <strong class="relatorio__analise-titulo">${esc(titulo)}</strong>
      <p class="relatorio__analise-texto">${esc(texto)}</p>
    </div>`;
}

function renderizarRelatorio(dados, container) {
  const { dadosPessoais, scores, perfis, planoDesenvolvimento, sugestoesGestor, meta } = dados;

  const scoresHtml = [
    _grupoScores('DISC', [
      { label: 'Dominância',   key: 'dominancia'   },
      { label: 'Influência',   key: 'influencia'   },
      { label: 'Estabilidade', key: 'estabilidade' },
      { label: 'Conformidade', key: 'conformidade' }
    ], scores),
    _grupoScores('Temperamento', [
      { label: 'Colérico',    key: 'colerico'    },
      { label: 'Sanguíneo',   key: 'sanguineo'   },
      { label: 'Fleumático',  key: 'fleumatico'  },
      { label: 'Melancólico', key: 'melancolico' }
    ], scores),
    _grupoScores('Canal de Vendas', [
      { label: 'Prosp. Presencial', key: 'pap'           },
      { label: 'Ligações Ativas',   key: 'ligarAtivo'    },
      { label: 'Leads Digitais',    key: 'leadsDigitais' },
      { label: 'Plantão',           key: 'plantao'       }
    ], scores),
    _grupoScores('Forças', [
      { label: 'Foco',       key: 'foco'       },
      { label: 'Resiliência',key: 'resiliencia' },
      { label: 'Empatia',    key: 'empatia'    },
      { label: 'Persuasão',  key: 'persuasao'  },
      { label: 'Disciplina', key: 'disciplina' }
    ], scores)
  ].join('');

  const analiseHtml = [
    sugestoesGestor.abordagem    ? _campoAnalise('Abordagem recomendada', sugestoesGestor.abordagem)    : '',
    sugestoesGestor.feedback     ? _campoAnalise('Como receber feedback',  sugestoesGestor.feedback)     : '',
    sugestoesGestor.escalabilidade ? _campoAnalise('Potencial de escala',  sugestoesGestor.escalabilidade) : '',
    sugestoesGestor.motivacao    ? _campoAnalise('O que me motiva',        sugestoesGestor.motivacao)    : '',
    sugestoesGestor.cuidados     ? _campoAnalise('Pontos de atenção',      sugestoesGestor.cuidados)     : ''
  ].join('');

  const acoesHtml = (planoDesenvolvimento.acoes || [])
    .map(a => `<li class="relatorio__acao">${esc(a)}</li>`)
    .join('');

  container.innerHTML = `
    <div class="relatorio">

      <div class="relatorio__cabecalho">
        <h2 class="relatorio__nome">${esc(dadosPessoais.nome)}</h2>
        ${dadosPessoais.cargo ? `<p class="relatorio__cargo">${esc(dadosPessoais.cargo)}</p>` : ''}
        <p class="relatorio__meta">
          Questões respondidas: ${esc(String(meta.totalRespondidas))} / ${esc(String(meta.totalQuestoes))}
        </p>
      </div>

      <section class="relatorio__secao">
        <h3 class="relatorio__secao-titulo">Perfil predominante</h3>
        <div class="relatorio__perfis">
          <div class="relatorio__perfil-item">
            <span class="relatorio__perfil-label">DISC</span>
            <span class="relatorio__perfil-valor">${esc(perfis.disc.label)}</span>
          </div>
          <div class="relatorio__perfil-item">
            <span class="relatorio__perfil-label">Temperamento</span>
            <span class="relatorio__perfil-valor">${esc(perfis.temperamento.label)}</span>
          </div>
          <div class="relatorio__perfil-item">
            <span class="relatorio__perfil-label">Canal principal</span>
            <span class="relatorio__perfil-valor">${esc(perfis.aptidao.label)}</span>
          </div>
        </div>
      </section>

      <section class="relatorio__secao">
        <h3 class="relatorio__secao-titulo">Scores por dimensão</h3>
        <div class="relatorio__scores">${scoresHtml}</div>
      </section>

      <section class="relatorio__secao">
        <h3 class="relatorio__secao-titulo">Perfil comportamental — ${esc(sugestoesGestor.perfil)}</h3>
        <div class="relatorio__analise">${analiseHtml}</div>
      </section>

      <section class="relatorio__secao">
        <h3 class="relatorio__secao-titulo">Plano de desenvolvimento — ${esc(planoDesenvolvimento.prazo)}</h3>
        <ul class="relatorio__acoes">${acoesHtml}</ul>
        <p class="relatorio__revisao">${esc(planoDesenvolvimento.revisao)}</p>
      </section>

    </div>`;
}

window.renderizarRelatorio = renderizarRelatorio;
window.Renderer = { renderizarQuestao, renderizarRelatorio };
