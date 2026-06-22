'use strict';

const questions = require('./questions');

// ─────────────────────────────────────────────────────────────────────────────
// MAPA DE SUGESTÕES PARA O GESTOR
// Combinações: perfil DISC + temperamento + aptidão principal
// ─────────────────────────────────────────────────────────────────────────────

const SUGESTOES_GESTOR = {

  // ── D / Colérico ──────────────────────────────────────────────────────────
  'D_colerico_pap': {
    perfil: 'D / Colérico / PAP',
    abordagem: 'Este corretor opera com alto senso de urgência e prefere ação imediata a planejamento excessivo. Na prospecção ativa presencial, ele é altamente eficaz porque converte energia em resultado sem precisar de validação constante. O gestor deve canalizar essa força, não contê-la.',
    feedback: 'Prefira feedback direto, objetivo e sem rodeios. Elogios vagos soam como ruído para ele — diga exatamente o que funcionou e por quê. Críticas devem vir acompanhadas de um plano de ação claro e imediato.',
    escalabilidade: 'Tem grande potencial de liderança informal e pode ser um multiplicador em treinamentos de prospecção. Com mentoria estruturada, pode evoluir para líder de equipe de prospecção em 12 a 18 meses.',
    motivacao: 'Responde a desafios concretos e metas audaciosas. Progresso visível é seu combustível — rankings, placas de reconhecimento e desafios de curto prazo funcionam melhor do que benefícios de longo prazo.',
    cuidados: 'Pode atropelar processos e colegas na busca por resultados. Monitore a qualidade do atendimento e o relacionamento pós-venda. Sem direcionamento, pode gerar conflitos de equipe e queimar leads por impaciência.'
  },

  'D_colerico_ligarAtivo': {
    perfil: 'D / Colérico / Ligações Ativas',
    abordagem: 'Perfil de alta performance em cadências de prospecção telefônica. Tem assertividade natural para superar gatekeepers e ir direto ao decisor. O volume de ligações tende a ser alto, mas a qualidade da escuta ativa pode precisar de desenvolvimento.',
    feedback: 'Foco em métricas de conversão: quantas ligações geraram reuniões qualificadas. Apresente benchmarks do mercado para criar competição interna saudável. Ele responde melhor a dados do que a opiniões subjetivas.',
    escalabilidade: 'Pode liderar squads de prospecção telefônica e treinar novos corretores em técnicas de abordagem. Ideal para projetos de lançamento onde velocidade de contato é crítica.',
    motivacao: 'Comissionamento acelerado, acesso a carteira premium e reconhecimento público de performance são os melhores motivadores. Odeiam burocracia — desburocratize o processo de cadastro de leads para ele.',
    cuidados: 'A pressa pode gerar qualificação superficial de leads. Estabeleça um roteiro mínimo de qualificação sem engessar a abordagem. Verifique se ele está registrando os contatos adequadamente no CRM.'
  },

  'D_colerico_leadsDigitais': {
    perfil: 'D / Colérico / Leads Digitais',
    abordagem: 'A velocidade de resposta deste perfil é um grande ativo no digital, onde o tempo de resposta ao lead é um fator crítico de conversão. O desafio está em calibrar a abordagem para o ritmo do lead digital, que frequentemente está no início da jornada de compra.',
    feedback: 'Mostre dados de janela de conversão: leads respondidos em menos de 5 minutos têm taxa X vezes maior de qualificação. Use métricas para disciplinar a urgência de forma produtiva.',
    escalabilidade: 'Pode coordenar o processo de resposta a leads inbound e definir os scripts de qualificação inicial para a equipe.',
    motivacao: 'Desafios com metas semanais de conversão de leads em visitas. Criar um placar visível de resposta mais rápida pode acionar a competitividade natural deste perfil.',
    cuidados: 'Leads digitais exigem nutrição e paciência — virtudes que desafiam o perfil D. Implemente um fluxo de cadência estruturado para evitar que ele abandone leads prematuramente.'
  },

  'D_colerico_plantao': {
    perfil: 'D / Colérico / Plantão',
    abordagem: 'Altamente eficaz em plantões de alto movimento, onde a capacidade de abordagem rápida e qualificação ágil define os resultados. Cria senso de urgência naturalmente, o que pode acelerar decisões de clientes mais indecisos.',
    feedback: 'Feedback baseado em taxa de conversão por atendimento. Discuta gravações ou encenações de atendimento para refinar a escuta ativa sem sufocar a energia natural.',
    escalabilidade: 'Referência natural em lançamentos de alto impacto. Pode ser o corretor de ancoragem em stands de vendas de grandes empreendimentos.',
    motivacao: 'Destaque para vendas em plantão, prioridade nos melhores stands e autonomia para definir sua abordagem dentro de parâmetros mínimos.',
    cuidados: 'Pode ser percebido como agressivo por clientes mais reservados. Trabalhe o repertório de abordagem para diferentes perfis de comprador.'
  },

  // ── I / Sanguíneo ─────────────────────────────────────────────────────────
  'I_sanguineo_pap': {
    perfil: 'I / Sanguíneo / PAP',
    abordagem: 'Perfil naturalmente encantador na abordagem presencial. Cria conexão rápida e torna o processo de prospecção uma experiência humana e agradável. Seu maior ativo é a impressão positiva que deixa — mesmo quando o cliente não compra agora, ele lembra do corretor.',
    feedback: 'Combine reconhecimento genuíno com orientação sobre consistência. Ele ama ser elogiado — use isso para reforçar comportamentos produtivos. Evite críticas em público; prefira conversas individuais leves e construtivas.',
    escalabilidade: 'Excelente embaixador da marca da imobiliária. Pode liderar iniciativas de relacionamento com comunidades de alto padrão, eventos e networking com potenciais clientes.',
    motivacao: 'Ambiente social positivo, reconhecimento público, oportunidades de representar a empresa em eventos e acesso a empreendimentos exclusivos para criar histórias de marca pessoal.',
    cuidados: 'A tendência de dispersão pode comprometer o follow-up. Implemente um sistema simples de CRM e cheque o pipeline semanalmente. O entusiasmo inicial nem sempre se converte em fechamento sem disciplina processual.'
  },

  'I_sanguineo_plantao': {
    perfil: 'I / Sanguíneo / Plantão',
    abordagem: 'Perfil ideal para plantões em empreendimentos de alto padrão com público diversificado. A capacidade de criar atmosfera e conexão humana rapidamente transforma visitas frias em experiências memoráveis. O stand se torna um palco natural para este perfil.',
    feedback: 'Enfatize histórias de sucesso e ajude-o a construir repertório de narrativas de clientes satisfeitos para usar nos atendimentos. Feedback deve ser dado como coaching de performance, não como correção.',
    escalabilidade: 'Pode treinar novos corretores em técnicas de rapport e atendimento consultivo. Com estrutura, pode evoluir para coordenador de experiência de cliente em grandes lançamentos.',
    motivacao: 'Protagonismo nos principais eventos de lançamento, visibilidade interna e acesso às campanhas mais criativas e premium da imobiliária.',
    cuidados: 'Pode se perder em conversas longas e deixar o foco na qualificação de lado. Ensine-o a usar perguntas de qualificação de forma natural na conversa para não perder tempo com clientes sem fit.'
  },

  'I_sanguineo_ligarAtivo': {
    perfil: 'I / Sanguíneo / Ligações Ativas',
    abordagem: 'Tem energia e carisma que funcionam muito bem ao telefone. Cria conexão rápida e torna a ligação uma experiência diferente das abordagens frias tradicionais. O desafio está em manter o foco no objetivo da ligação sem se perder em conversas.',
    feedback: 'Trabalhe métricas de duração de ligação versus resultado. O ideal é uma ligação envolvente mas direcionada — nem fria demais, nem longa demais. Compartilhe gravações de ligações com boa conversão como referência.',
    escalabilidade: 'Pode desenvolver scripts de ligação que equilibrem conexão e eficiência, servindo como referência para a equipe.',
    motivacao: 'Metas com recompensas criativas, eventos de celebração de resultado e reconhecimento em reuniões de equipe.',
    cuidados: 'Monitore a consistência da cadência. Perfis sanguíneos tendem a altos e baixos de motivação — criar rituais de início de dia pode ajudar a manter o ritmo.'
  },

  'I_sanguineo_leadsDigitais': {
    perfil: 'I / Sanguíneo / Leads Digitais',
    abordagem: 'Naturalmente habilidoso na criação de conteúdo e no tom de voz nas redes sociais. A jornada do lead digital passa muito por identificação com a pessoa do corretor — e este perfil constrói essa identidade com facilidade.',
    feedback: 'Oriente sobre consistência na produção de conteúdo e no follow-up de leads. O talento para comunicação precisa de disciplina de publicação para gerar resultados consistentes.',
    escalabilidade: 'Pode ser o rosto da imobiliária nas redes sociais e em campanhas de marketing de conteúdo para o segmento premium.',
    motivacao: 'Autonomia criativa, acesso a ferramentas de produção de conteúdo e reconhecimento público nas plataformas digitais.',
    cuidados: 'A vaidade digital pode desviar o foco do que realmente importa: converter leads em visitas. Acompanhe a taxa de conversão digital para garantir que a presença online está gerando negócio.'
  },

  // ── S / Fleumático ────────────────────────────────────────────────────────
  'S_fleumatico_ligarAtivo': {
    perfil: 'S / Fleumático / Ligações Ativas',
    abordagem: 'Perfil de alta confiabilidade e consistência. Na prospecção telefônica, tem paciência para nutrir relacionamentos ao longo do tempo e não abandona leads antes de esgotarem o potencial. Clientes percebem sua estabilidade como segurança, o que facilita a construção de confiança.',
    feedback: 'Feedback deve ser gentil, focado no processo e não apenas no resultado. Reconheça a consistência e a lealdade como forças. Para desafios, apresente sugestões, não ordens.',
    escalabilidade: 'Construtor de carteira de longo prazo. Pode ser mentor de novos corretores em gestão de relacionamento e nas técnicas de reativação de leads antigos.',
    motivacao: 'Estabilidade, reconhecimento de lealdade, carteira de clientes exclusiva e rotina previsível. Evite mudanças bruscas de processo sem aviso prévio.',
    cuidados: 'Pode ter dificuldade em fechar em situações que exigem assertividade. Trabalhe técnicas de fechamento e identificação de sinais de compra para compensar a tendência de ceder espaço ao cliente em momentos decisivos.'
  },

  'S_fleumatico_pap': {
    perfil: 'S / Fleumático / PAP',
    abordagem: 'Na prospecção presencial, este perfil se destaca pela abordagem respeitosa e não invasiva, que funciona especialmente bem com proprietários de imóveis de alto padrão. A confiança é construída de forma sólida e duradoura, gerando indicações e recomendações ao longo do tempo.',
    feedback: 'Foque no desenvolvimento de assertividade de forma gradual. Comemore cada conquista de novos contatos com destaque, pois ele tende a subestimar seus próprios resultados.',
    escalabilidade: 'Excelente para carteiras de relacionamento de longo prazo com proprietários de imóveis de alto valor que não têm pressa em vender mas têm a intenção firme.',
    motivacao: 'Reconhecimento de qualidade de atendimento, indicações recebidas e fidelização de carteira. Métricas de retenção e satisfação são mais motivadoras para ele do que rankings de volume.',
    cuidados: 'Pode ter dificuldade em abordar estranhos de forma proativa. Trabalhe a confiança com roleplay de abordagem e reforce que a abordagem gentil dele é um diferencial, não uma fraqueza.'
  },

  'S_fleumatico_plantao': {
    perfil: 'S / Fleumático / Plantão',
    abordagem: 'Cria um ambiente de atendimento acolhedor e sem pressão que funciona muito bem com compradores de alto padrão que detestam ser pressionados. A paciência nata permite que o cliente tome seu tempo sem que o corretor demonstre ansiedade.',
    feedback: 'Valorize a qualidade das interações e o NPS dos clientes atendidos. Para desenvolver assertividade, proponha desafios suaves de fechamento em encenações de atendimento.',
    escalabilidade: 'Ideal para empreendimentos com ciclo de venda longo e clientes exigentes que precisam de múltiplas visitas antes de decidir.',
    motivacao: 'Ambiente de trabalho harmonioso, metas de qualidade de atendimento e reconhecimento por fidelização de clientes.',
    cuidados: 'O excesso de paciência pode fazer com que ele perca vendas por não identificar o momento certo de fechar. Treine os sinais verbais e não-verbais de compra para que ele saiba quando agir.'
  },

  'S_fleumatico_leadsDigitais': {
    perfil: 'S / Fleumático / Leads Digitais',
    abordagem: 'Nas interações digitais, a consistência e o cuidado na comunicação são os grandes diferenciais deste perfil. Responde a leads de forma humanizada e minuciosa, o que cria uma percepção de confiabilidade rara no mercado digital.',
    feedback: 'Oriente sobre velocidade de resposta como fator de conversão digital sem comprometer a qualidade da comunicação. Use dados de benchmark para motivar, não para pressionar.',
    escalabilidade: 'Pode desenvolver roteiros de nutrição de leads de médio e longo prazo para a equipe, com base na sua experiência de relacionamento cuidadoso.',
    motivacao: 'Autonomia para conduzir o relacionamento no seu ritmo, metas de satisfação e reconhecimento por qualidade de atendimento digital.',
    cuidados: 'A velocidade de resposta inicial pode ser um ponto de perda de leads no digital. Configure alertas e templates de resposta imediata para o primeiro contato, enquanto a resposta qualificada é elaborada.'
  },

  // ── C / Melancólico ───────────────────────────────────────────────────────
  'C_melancolico_leadsDigitais': {
    perfil: 'C / Melancólico / Leads Digitais',
    abordagem: 'Perfil de maior acurácia na qualificação de leads digitais. Não desperdiça energia com leads sem fit e constrói abordagens altamente personalizadas com base em dados. No mercado de alto padrão, onde o comprador pesquisa muito antes de contatar, a profundidade técnica deste corretor é percebida como expertise genuína.',
    feedback: 'Feedback deve ser preciso, fundamentado e dado por escrito sempre que possível. Ele valorizará uma avaliação detalhada muito mais do que um elogio genérico. Critique com base em dados e sempre ofereça alternativas concretas.',
    escalabilidade: 'Pode desenvolver playbooks de qualificação de leads, análises de mercado e materiais técnicos que elevam o nível de toda a equipe. Excelente para criar conteúdo especializado de atração orgânica.',
    motivacao: 'Acesso a informações exclusivas de mercado, projetos com desafio técnico, autonomia de método e reconhecimento por qualidade em vez de volume.',
    cuidados: 'Pode paralisar na busca por perfeição ou ser percebido como frio pelos leads. Estabeleça prazos de resposta mínimos e trabalhe a humanização da comunicação digital sem suprimir a profundidade técnica.'
  },

  'C_melancolico_pap': {
    perfil: 'C / Melancólico / PAP',
    abordagem: 'Na prospecção presencial, o ponto forte deste perfil é o preparo. Vai ao campo com informações precisas sobre o imóvel, a região e o perfil do proprietário. Isso impressiona decisores de alto padrão que valorizam interlocutores preparados.',
    feedback: 'Reconheça o preparo e a qualidade técnica como diferenciais. Para desenvolver fluidez na abordagem, proponha encenações de visita presencial em um ambiente seguro.',
    escalabilidade: 'Pode criar roteiros de prospecção presencial baseados em dados de mercado e perfil de proprietário para elevar a qualidade das abordagens da equipe.',
    motivacao: 'Projetos com profundidade técnica, acesso a relatórios exclusivos de mercado e autonomia para preparar a abordagem da forma que preferir.',
    cuidados: 'O excesso de preparação pode gerar procrastinação na ação. Estabeleça metas de tentativas de abordagem para equilibrar qualidade com volume.'
  },

  'C_melancolico_ligarAtivo': {
    perfil: 'C / Melancólico / Ligações Ativas',
    abordagem: 'Domina os dados do imóvel, da região e do mercado antes de ligar. As ligações têm alto conteúdo técnico que funciona especialmente bem com compradores analíticos e investidores. Não é o perfil de maior volume, mas tem alta taxa de conversão nas ligações que realiza.',
    feedback: 'Feedback por escrito, detalhado e com base em métricas de qualidade. Ajude-o a construir argumentários técnicos de qualidade para os principais perfis de clientes.',
    escalabilidade: 'Pode especializar-se em investidores e compradores técnicos, desenvolvendo uma carteira de alto valor com ciclos de compra repetidos.',
    motivacao: 'Qualidade sobre quantidade. Metas de conversão por ligação em vez de volume. Acesso a bases de dados exclusivas de mercado.',
    cuidados: 'Pode ter resistência a ligar sem se sentir completamente preparado. Trabalhe a ideia de que as primeiras ligações do dia são de aquecimento e que a perfeição não é pré-requisito para o contato.'
  },

  'C_melancolico_plantao': {
    perfil: 'C / Melancólico / Plantão',
    abordagem: 'No plantão, é referência em precisão técnica. Clientes que chegam com dúvidas complexas sobre acabamentos, planta, registro e financiamento encontram neste perfil respostas seguras e completas. Isso gera confiança e credibilidade imediata.',
    feedback: 'Valorize a precisão técnica como diferencial competitivo. Para desenvolver a fluidez no atendimento, trabalhe a leveza na abertura de conversa sem comprometer a profundidade técnica.',
    escalabilidade: 'Pode criar materiais técnicos de apoio ao plantão, treinamentos sobre especificações dos empreendimentos e auditorias de qualidade de informação.',
    motivacao: 'Complexidade técnica, imóveis com arquitetura ou tecnologia diferenciada e clientes que valorizam profundidade de informação.',
    cuidados: 'Pode ser percebido como formal demais em ambientes que exigem leveza e conexão emocional. Trabalhe o equilíbrio entre expertise e calor humano no atendimento inicial.'
  },

  // ── Fallbacks por perfil DISC ─────────────────────────────────────────────
  'fallback_D': {
    perfil: 'D — Dominância (fallback)',
    abordagem: 'Corretor orientado a resultados, com alta iniciativa e baixa tolerância a processos lentos. Precisa de desafios claros, autonomia operacional e metas ambiciosas para manter o engajamento.',
    feedback: 'Direto, objetivo e baseado em dados de performance. Elogios devem vir acompanhados de próximos desafios.',
    escalabilidade: 'Alto potencial de liderança em squads de alta performance. Pode ser referência em treinamentos de prospecção e fechamento.',
    motivacao: 'Comissionamento agressivo, rankings visíveis e acesso a carteiras e empreendimentos premium.',
    cuidados: 'Monitorar relacionamento com a equipe e qualidade do processo de atendimento para evitar que a busca por resultado comprometa a experiência do cliente.'
  },

  'fallback_I': {
    perfil: 'I — Influência (fallback)',
    abordagem: 'Corretor com alto poder de conexão humana e capacidade de criar experiências memoráveis no processo de compra. Precisa de ambiente positivo, reconhecimento e liberdade criativa para performar.',
    feedback: 'Positivo, encorajador e com exemplos concretos de impacto. Críticas devem ser emolduradas como oportunidades de crescimento.',
    escalabilidade: 'Embaixador natural da marca e construtor de relacionamentos de longo prazo com clientes de alto padrão.',
    motivacao: 'Reconhecimento público, protagonismo em eventos e acesso às campanhas e empreendimentos mais criativos.',
    cuidados: 'Disciplinar follow-up e registro no CRM. Criar sistemas simples que ele consiga manter sem sentir como burocracia.'
  },

  'fallback_S': {
    perfil: 'S — Estabilidade (fallback)',
    abordagem: 'Corretor de alta confiabilidade, lealdade e paciência. Constrói relacionamentos duradouros e é o pilar de consistência da equipe. Prefere profundidade a volume.',
    feedback: 'Gentil, focado na qualidade do processo e no reconhecimento da consistência. Evitar pressão excessiva por velocidade.',
    escalabilidade: 'Construtor de carteira premium de longo prazo e mentor informal de novos corretores em relacionamento e atendimento.',
    motivacao: 'Estabilidade, segurança, carteira exclusiva e reconhecimento por qualidade e fidelização.',
    cuidados: 'Desenvolver assertividade e identificação de sinais de fechamento. Trabalhar o equilíbrio entre paciência e proatividade.'
  },

  'fallback_C': {
    perfil: 'C — Conformidade (fallback)',
    abordagem: 'Corretor analítico, preciso e altamente confiável em informações técnicas. Diferencial em clientes investidores e compradores que pesquisam muito antes de decidir.',
    feedback: 'Preciso, fundamentado e por escrito sempre que possível. Valoriza dados, argumentos técnicos e reconhecimento por qualidade.',
    escalabilidade: 'Produtor de conteúdo técnico, playbooks de qualificação e treinamentos especializados para a equipe.',
    motivacao: 'Projetos com profundidade técnica, autonomia de método e acesso a informações exclusivas de mercado.',
    cuidados: 'Combater a paralisia por análise e desenvolver leveza no contato inicial com clientes que preferem abordagem mais emocional.'
  }

};

// ─────────────────────────────────────────────────────────────────────────────
// MAPEAMENTOS DE RÓTULOS
// ─────────────────────────────────────────────────────────────────────────────

const DISC_LABELS = {
  dominancia:   'Dominância (D)',
  influencia:   'Influência (I)',
  estabilidade: 'Estabilidade (S)',
  conformidade: 'Conformidade (C)'
};

const TEMP_LABELS = {
  colerico:   'Colérico',
  sanguineo:  'Sanguíneo',
  fleumatico: 'Fleumático',
  melancolico: 'Melancólico'
};

const APT_LABELS = {
  pap:           'Prospecção Ativa Presencial (PAP)',
  ligarAtivo:    'Ligações Ativas',
  leadsDigitais: 'Leads Digitais',
  plantao:       'Plantão'
};

const DISC_KEY_MAP = {
  dominancia:   'D',
  influencia:   'I',
  estabilidade: 'S',
  conformidade: 'C'
};

const TEMP_KEY_MAP = {
  colerico:   'colerico',
  sanguineo:  'sanguineo',
  fleumatico: 'fleumatico',
  melancolico: 'melancolico'
};

// IDs válidos de questões — derivado do array em tempo de carga do módulo.
const VALID_QUESTION_IDS = new Set(questions.map(q => q.id));

// ─────────────────────────────────────────────────────────────────────────────
// calcularMaximosTeoricosCompleto
// Dinâmico: lê o array questions em runtime sem nenhum valor hardcoded.
// Para cada questão e subdimensão, acumula o maior peso possível entre
// todas as alternativas — representa o teto teórico de pontuação.
// Resultado cacheado no nível do módulo: calculado uma única vez no boot.
// ─────────────────────────────────────────────────────────────────────────────

function calcularMaximosTeoricosCompleto(qs) {
  const maximos = {};

  qs.forEach(question => {
    const melhorPorSubdim = {};

    Object.values(question.pesos).forEach(pesosAlt => {
      Object.entries(pesosAlt).forEach(([subdim, peso]) => {
        if (!melhorPorSubdim[subdim] || peso > melhorPorSubdim[subdim]) {
          melhorPorSubdim[subdim] = peso;
        }
      });
    });

    Object.entries(melhorPorSubdim).forEach(([subdim, maxPeso]) => {
      maximos[subdim] = (maximos[subdim] || 0) + maxPeso;
    });
  });

  return maximos;
}

// Cache: calculado uma vez no load do módulo, nunca recalculado.
const MAXIMOS_TEORICOS = calcularMaximosTeoricosCompleto(questions);

// ─────────────────────────────────────────────────────────────────────────────
// calcularPontos
// Soma os pesos reais obtidos pelas respostas do candidato.
// Ignora silenciosamente IDs de questão inválidos e alternativas inexistentes.
// ─────────────────────────────────────────────────────────────────────────────

function calcularPontos(respostas, qs) {
  const pontos = {};

  qs.forEach(question => {
    const resposta = respostas[question.id];
    if (!resposta || !question.pesos[resposta]) return;

    const pesosEscolhidos = question.pesos[resposta];
    Object.entries(pesosEscolhidos).forEach(([subdim, peso]) => {
      pontos[subdim] = (pontos[subdim] || 0) + peso;
    });
  });

  return pontos;
}

// ─────────────────────────────────────────────────────────────────────────────
// normalizarScores
// Retorna scores de 0 a 100 para cada subdimensão.
// Garante: sem NaN, sem negativos, sem valores acima de 100.
// ─────────────────────────────────────────────────────────────────────────────

function normalizarScores(pontos, maximos) {
  const scores = {};
  Object.keys(maximos).forEach(subdim => {
    const obtido = pontos[subdim] || 0;
    const maximo = maximos[subdim] > 0 ? maximos[subdim] : 1;
    scores[subdim] = Math.min(100, Math.max(0, Math.round((obtido / maximo) * 100)));
  });
  return scores;
}

// ─────────────────────────────────────────────────────────────────────────────
// identificarPerfis
// Determina o perfil predominante em cada dimensão.
// ─────────────────────────────────────────────────────────────────────────────

function identificarPerfis(scores) {
  const discDims   = ['dominancia', 'influencia', 'estabilidade', 'conformidade'];
  const tempDims   = ['colerico', 'sanguineo', 'fleumatico', 'melancolico'];
  const aptDims    = ['pap', 'ligarAtivo', 'leadsDigitais', 'plantao'];
  const forcasDims = ['foco', 'resiliencia', 'empatia', 'persuasao', 'disciplina'];

  const melhor = (dims) => {
    const presentes = dims.filter(d => scores[d] !== undefined);
    if (presentes.length === 0) return dims[0];
    return presentes.reduce((best, d) => (scores[d] > scores[best] ? d : best), presentes[0]);
  };

  return {
    discPredominante:         melhor(discDims),
    temperamentoPredominante: melhor(tempDims),
    aptidaoPrincipal:         melhor(aptDims),
    forcasPrincipais:         forcasDims
      .filter(d => scores[d] !== undefined)
      .sort((a, b) => scores[b] - scores[a])
      .slice(0, 2),
    pontosDesenvolvimento:    [...aptDims, ...forcasDims]
      .filter(d => scores[d] !== undefined)
      .sort((a, b) => scores[a] - scores[b])
      .slice(0, 3)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// buscarSugestaoGestor
// Tenta combinação específica, depois fallbacks por perfil DISC.
// ─────────────────────────────────────────────────────────────────────────────

function buscarSugestaoGestor(discKey, tempKey, aptKey) {
  const chaveEspecifica = `${discKey}_${tempKey}_${aptKey}`;
  if (SUGESTOES_GESTOR[chaveEspecifica]) return SUGESTOES_GESTOR[chaveEspecifica];

  const chaveDiscTemp = `${discKey}_${tempKey}`;
  if (SUGESTOES_GESTOR[chaveDiscTemp]) return SUGESTOES_GESTOR[chaveDiscTemp];

  const chaveDiscApt = `${discKey}_${aptKey}`;
  if (SUGESTOES_GESTOR[chaveDiscApt]) return SUGESTOES_GESTOR[chaveDiscApt];

  const chaveDisc = `fallback_${discKey}`;
  if (SUGESTOES_GESTOR[chaveDisc]) return SUGESTOES_GESTOR[chaveDisc];

  return {
    perfil: `${discKey} / ${tempKey} / ${aptKey}`,
    abordagem: 'Perfil com combinação única. Avalie individualmente com base nos scores detalhados.',
    feedback: 'Conduza uma conversa individual aprofundada para entender motivações e estilo de trabalho.',
    escalabilidade: 'A ser definida após observação de performance em campo.',
    motivacao: 'Identifique os motivadores individuais através de conversas abertas e observação de engajamento.',
    cuidados: 'Mantenha acompanhamento próximo nas primeiras semanas para identificar padrões de comportamento.'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// gerarPlanoDesenvolvimento
// ─────────────────────────────────────────────────────────────────────────────

function gerarPlanoDesenvolvimento(aptidaoPrincipal, pontosDesenvolvimento, scores) {
  const acoes = pontosDesenvolvimento.map(dim => {
    const score = scores[dim] || 0;
    const label = APT_LABELS[dim] || dim;
    if (score < 40) {
      return `Desenvolvimento prioritário em ${label} (score ${score}/100): recomenda-se imersão prática com acompanhamento semanal.`;
    }
    if (score < 60) {
      return `Aprimoramento em ${label} (score ${score}/100): roleplay quinzenal e revisão de métricas com o gestor.`;
    }
    return `Refinamento em ${label} (score ${score}/100): observação de pares de alta performance e autoavaliação mensal.`;
  });

  return {
    prazo: '90 dias',
    foco: aptidaoPrincipal,
    acoes,
    revisao: 'Checkpoint de 30, 60 e 90 dias com o gestor direto.'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// calcularResultado — função principal exportada
// ─────────────────────────────────────────────────────────────────────────────

function calcularResultado(respostas, dadosPessoais) {
  const pontos = calcularPontos(respostas, questions);
  const scores = normalizarScores(pontos, MAXIMOS_TEORICOS);
  const perfis = identificarPerfis(scores);

  const {
    discPredominante,
    temperamentoPredominante,
    aptidaoPrincipal,
    forcasPrincipais,
    pontosDesenvolvimento
  } = perfis;

  const discKey = DISC_KEY_MAP[discPredominante]          || discPredominante;
  const tempKey = TEMP_KEY_MAP[temperamentoPredominante]  || temperamentoPredominante;
  const aptKey  = aptidaoPrincipal;

  const sugestoesGestor      = buscarSugestaoGestor(discKey, tempKey, aptKey);
  const planoDesenvolvimento = gerarPlanoDesenvolvimento(aptidaoPrincipal, pontosDesenvolvimento, scores);

  // Conta apenas IDs que existem no questionário oficial.
  const totalRespondidas = Object.keys(respostas).filter(id => VALID_QUESTION_IDS.has(id)).length;

  return {
    dadosPessoais,
    scores,
    perfis: {
      disc: {
        predominante: discPredominante,
        label: DISC_LABELS[discPredominante] || discPredominante
      },
      temperamento: {
        predominante: temperamentoPredominante,
        label: TEMP_LABELS[temperamentoPredominante] || temperamentoPredominante
      },
      aptidao: {
        principal: aptidaoPrincipal,
        label: APT_LABELS[aptidaoPrincipal] || aptidaoPrincipal
      },
      forcas:       forcasPrincipais,
      desenvolvimento: pontosDesenvolvimento
    },
    planoDesenvolvimento,
    sugestoesGestor,
    meta: {
      totalQuestoes:    questions.length,
      totalRespondidas,
      maximosTeoricos:  MAXIMOS_TEORICOS,
      pontosObtidos:    pontos,
      geradoEm:         new Date().toISOString()
    }
  };
}

module.exports = { calcularResultado, calcularMaximosTeoricosCompleto };

// ═════════════════════════════════════════════════════════════════════════════
// EXEMPLOS COMENTADOS DE SAÍDA — Calibração do motor
// ═════════════════════════════════════════════════════════════════════════════

/*
─────────────────────────────────────────────────────────────────
EXEMPLO 1: Perfil D / Colérico / PAP
─────────────────────────────────────────────────────────────────
Candidato: Carlos Eduardo Melo
Respostas simuladas (sempre alternativa A — assertiva e direta):
  disc_01: A  → dominancia: 3, conformidade: 1
  disc_02: A  → dominancia: 3, conformidade: 1
  temp_01: A  → colerico: 3, melancolico: 1
  temp_02: A  → colerico: 3, sanguineo: 1
  apt_pap_01:    A → pap: 3, ligarAtivo: 1
  apt_ligar_01:  A → ligarAtivo: 1, pap: 2
  apt_leads_01:  A → leadsDigitais: 1, ligarAtivo: 2
  apt_plantao_01:A → plantao: 2, ligarAtivo: 2
  forca_01: A  → resiliencia: 3, foco: 2
  forca_02: A  → persuasao: 2, foco: 2

Resultado esperado:
{
  "perfis": {
    "disc":        { "predominante": "dominancia",  "label": "Dominância (D)" },
    "temperamento":{ "predominante": "colerico",     "label": "Colérico" },
    "aptidao":     { "principal": "ligarAtivo",      "label": "Ligações Ativas" }
  },
  "sugestoesGestor": {
    "perfil": "D / Colérico / Ligações Ativas",
    "abordagem": "Perfil de alta performance em cadências de prospecção telefônica..."
  }
}

─────────────────────────────────────────────────────────────────
EXEMPLO 2: Perfil I / Sanguíneo / Plantão
─────────────────────────────────────────────────────────────────
Candidato: Fernanda Lima Costa
Respostas simuladas (alternativa B — conectiva e empática):

Resultado esperado:
{
  "perfis": {
    "disc":        { "predominante": "influencia",  "label": "Influência (I)" },
    "temperamento":{ "predominante": "sanguineo",   "label": "Sanguíneo" },
    "aptidao":     { "principal": "plantao",        "label": "Plantão" }
  },
  "sugestoesGestor": { "perfil": "I / Sanguíneo / Plantão" }
}

─────────────────────────────────────────────────────────────────
EXEMPLO 3: Perfil S / Fleumático / Ligações Ativas
─────────────────────────────────────────────────────────────────
Candidato: Roberto Andrade Neto
Respostas simuladas (alternativa C — paciente e estável):

Resultado esperado:
{
  "perfis": {
    "disc":        { "predominante": "estabilidade", "label": "Estabilidade (S)" },
    "temperamento":{ "predominante": "fleumatico",   "label": "Fleumático" },
    "aptidao":     { "principal": "pap",             "label": "Prospecção Ativa Presencial (PAP)" }
  }
}

─────────────────────────────────────────────────────────────────
EXEMPLO 4: Perfil C / Melancólico / Leads Digitais
─────────────────────────────────────────────────────────────────
Candidato: Priscila Vasconcelos
Respostas simuladas (alternativa D — analítica e técnica):

Resultado esperado:
{
  "perfis": {
    "disc":        { "predominante": "conformidade",  "label": "Conformidade (C)" },
    "temperamento":{ "predominante": "melancolico",   "label": "Melancólico" },
    "aptidao":     { "principal": "leadsDigitais",    "label": "Leads Digitais" }
  },
  "sugestoesGestor": { "perfil": "C / Melancólico / Leads Digitais" }
}
*/
