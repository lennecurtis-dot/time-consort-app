'use strict';

// ─── Regras de negócio — valores definidos pelo negócio, não alterar ──────────
const REGRAS = {
  FATOR_PRESERVACAO:        1.3,
  HORAS_UTEIS_ANO:          2112,
  TAXA_COMISSAO_CHEIA:      0.0517,
  PARTICIPACAO_CORRETOR:    0.40,
  PARTICIPACAO_ESTAGIARIO:  0.50,
  DURACAO_ESTAGIO_MESES:    6,
  DISTRIBUICAO_EDUCATIVA: {
    reinvestimento: 0.30,
    custos:         0.30,
    lucro:          0.40
  }
};

const TAXA_PLENO      = REGRAS.TAXA_COMISSAO_CHEIA * REGRAS.PARTICIPACAO_CORRETOR;
const TAXA_ESTAGIARIO = TAXA_PLENO * REGRAS.PARTICIPACAO_ESTAGIARIO;

function taxaPorSituacao(situacao) {
  return situacao === 'estagiario' ? TAXA_ESTAGIARIO : TAXA_PLENO;
}

function somarItens(itens) {
  if (!Array.isArray(itens)) return 0;
  return itens.reduce((s, item) => {
    const v = Number(item?.valor);
    return s + (isNaN(v) ? 0 : v);
  }, 0);
}

function calcularMetas({ custosItens = [], objetivosItens = [], situacao }) {
  const somaCustos   = somarItens(custosItens);
  const custoMensalTotal = somaCustos * REGRAS.FATOR_PRESERVACAO;
  const custoAnualTotal  = custoMensalTotal * 12;

  const somaObjetivos = somarItens(objetivosItens);
  const objetivoTotal  = somaObjetivos * REGRAS.FATOR_PRESERVACAO;

  const ganhoAnual    = custoAnualTotal + objetivoTotal;
  const ganhoMensal   = ganhoAnual / 12;
  const ganhoSemanal  = ganhoAnual / 52;
  const ganhoDiario   = ganhoAnual / (52 * 5);
  const ganhoPorHora  = ganhoAnual / REGRAS.HORAS_UTEIS_ANO;

  const taxa            = taxaPorSituacao(situacao);
  const vgvNecessario    = ganhoAnual / taxa;
  const vgvPleno         = ganhoAnual / TAXA_PLENO;
  const vgvEstagiario    = ganhoAnual / TAXA_ESTAGIARIO;

  return {
    somaCustos:        r2(somaCustos),
    custoMensalTotal:  r2(custoMensalTotal),
    custoAnualTotal:   r2(custoAnualTotal),
    somaObjetivos:     r2(somaObjetivos),
    objetivoTotal:     r2(objetivoTotal),
    ganhoAnual:        r2(ganhoAnual),
    ganhoMensal:       r2(ganhoMensal),
    ganhoSemanal:      r2(ganhoSemanal),
    ganhoDiario:       r2(ganhoDiario),
    ganhoPorHora:      r2(ganhoPorHora),
    vgvNecessario:     r2(vgvNecessario),
    vgvPleno:          r2(vgvPleno),
    vgvEstagiario:     r2(vgvEstagiario),
    taxaAplicada:      taxa,
    situacao
  };
}

function calcularComissao({ vgv, situacao }) {
  const taxa       = taxaPorSituacao(situacao);
  const comissao   = vgv * taxa;
  const { reinvestimento, custos, lucro } = REGRAS.DISTRIBUICAO_EDUCATIVA;

  return {
    comissao:          r2(comissao),
    dist_reinvestimento: r2(comissao * reinvestimento),
    dist_custos:         r2(comissao * custos),
    dist_lucro:          r2(comissao * lucro),
    taxaAplicada:        taxa
  };
}

function r2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { calcularMetas, calcularComissao, TAXA_PLENO, TAXA_ESTAGIARIO, REGRAS };
