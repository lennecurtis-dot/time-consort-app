'use strict';

/**
 * Array de questões do Assessment Comportamental para Corretores de Imóveis de Alto Padrão.
 *
 * Estrutura de categorias e subdimensões:
 *   DISC          (12 questões): dominancia | influencia | estabilidade | conformidade
 *   Temperamento  (12 questões): colerico | sanguineo | fleumatico | melancolico
 *   Aptidao       (16 questões): pap | ligarAtivo | leadsDigitais | plantao
 *   Forcas        (10 questões): foco | resiliencia | empatia | persuasao | disciplina
 *
 * Pesos das alternativas: valores entre 1 e 3, distribuídos de forma equilibrada.
 * Nenhuma alternativa tem peso 0 — todas revelam algo útil.
 */

const questions = [

  // ─────────────────────────────────────────────────────────────────
  // DISC — 12 questões
  // Cobertura: dominancia ×3, influencia ×3, estabilidade ×3, conformidade ×3
  // ─────────────────────────────────────────────────────────────────

  {
    id: 'disc_01',
    categoria: 'DISC',
    subdimensao: 'dominancia',
    pergunta: 'Você está negociando um apartamento de R$ 4 milhões com um cliente que apresenta objeções firmes sobre o preço. Como você normalmente reage?',
    alternativas: {
      A: 'Apresento dados de mercado e comparativos diretos para justificar o valor, sem recuar do preço.',
      B: 'Crio conexão emocional com o imóvel e envolvo o cliente em uma conversa sobre o estilo de vida que ele terá.',
      C: 'Ouço todas as objeções com calma e proponho um cronograma de visitas para ele aprofundar a decisão.',
      D: 'Analiso cada objeção detalhadamente, preparo um dossiê técnico e retorno com respostas estruturadas.'
    },
    pesos: {
      A: { dominancia: 3, conformidade: 1 },
      B: { influencia: 3, estabilidade: 1 },
      C: { estabilidade: 3, influencia: 1 },
      D: { conformidade: 3, dominancia: 1 }
    }
  },

  {
    id: 'disc_02',
    categoria: 'DISC',
    subdimensao: 'influencia',
    pergunta: 'Um cliente em potencial acompanha você nas redes sociais há meses mas nunca respondeu às suas mensagens. O que você faz?',
    alternativas: {
      A: 'Ligo diretamente e vou direto ao ponto: pergunto se há algum imóvel do perfil dele em que posso ajudar.',
      B: 'Mando uma mensagem personalizada e descontraída, mencionando algo que ele publicou recentemente.',
      C: 'Aguardo o momento certo e continuo entregando conteúdo de valor até ele vir naturalmente.',
      D: 'Estruturo uma sequência de e-mails com informações precisas de mercado para criar autoridade antes do contato.'
    },
    pesos: {
      A: { dominancia: 3, conformidade: 1 },
      B: { influencia: 3, dominancia: 1 },
      C: { estabilidade: 3, influencia: 1 },
      D: { conformidade: 3, estabilidade: 1 }
    }
  },

  {
    id: 'disc_03',
    categoria: 'DISC',
    subdimensao: 'estabilidade',
    pergunta: 'Um cliente indeciso visitou o mesmo imóvel três vezes em um mês e ainda não se decidiu. Como você conduz a situação?',
    alternativas: {
      A: 'Informo diretamente que o imóvel pode ser vendido para outro comprador e que ele precisa tomar uma decisão.',
      B: 'Proponho uma visita diferenciada com um especialista em decoração para ajudá-lo a imaginar como o espaço ficaria.',
      C: 'Ofereço mais tempo, reforço minha disponibilidade e aguardo ele chegar à decisão no próprio ritmo.',
      D: 'Preparo uma comparação detalhada com outros imóveis similares para que ele possa fazer uma escolha embasada.'
    },
    pesos: {
      A: { dominancia: 3, conformidade: 1 },
      B: { influencia: 3, estabilidade: 1 },
      C: { estabilidade: 3, conformidade: 1 },
      D: { conformidade: 3, dominancia: 1 }
    }
  },

  {
    id: 'disc_04',
    categoria: 'DISC',
    subdimensao: 'conformidade',
    pergunta: 'Durante a due diligence de um imóvel de R$ 5 milhões, você identifica cláusulas contratuais incomuns que o cliente deseja alterar. Como você age?',
    alternativas: {
      A: 'Entro diretamente em contato com o vendedor e exijo que as cláusulas sejam ajustadas antes de avançar.',
      B: 'Organizo uma reunião com todas as partes e facilito uma conversa que leve a um entendimento satisfatório.',
      C: 'Tranquilizo o cliente, explico que esse tipo de situação é comum e o guio com calma em cada etapa.',
      D: 'Documento todas as cláusulas questionáveis, consulto assessoria jurídica e apresento uma proposta formal de alteração.'
    },
    pesos: {
      A: { dominancia: 3, conformidade: 1 },
      B: { influencia: 2, estabilidade: 2 },
      C: { estabilidade: 3, conformidade: 1 },
      D: { conformidade: 3, dominancia: 1 }
    }
  },

  {
    id: 'disc_05',
    categoria: 'DISC',
    subdimensao: 'dominancia',
    pergunta: 'Seu gestor designa para você um bairro nobre com pouca transação histórica e nenhuma carteira estabelecida. Qual é a sua primeira reação?',
    alternativas: {
      A: 'Encaro como desafio pessoal e crio imediatamente meu próprio plano de prospecção para o território.',
      B: 'Pesquiso como corretores bem-sucedidos abriram territórios parecidos e adapto essas estratégias ao meu estilo.',
      C: 'Mapeio o bairro com cuidado antes de qualquer ação, entendendo a dinâmica local antes de começar.',
      D: 'Estudo dados históricos, valores por metro quadrado e perfil dos moradores antes de qualquer abordagem.'
    },
    pesos: {
      A: { dominancia: 3, influencia: 1 },
      B: { influencia: 2, dominancia: 1 },
      C: { estabilidade: 2, conformidade: 2 },
      D: { conformidade: 3, estabilidade: 1 }
    }
  },

  {
    id: 'disc_06',
    categoria: 'DISC',
    subdimensao: 'influencia',
    pergunta: 'Você participa de um evento exclusivo de lançamento com dezenas de potenciais compradores de alto padrão. Como você se comporta?',
    alternativas: {
      A: 'Identifico as pessoas mais influentes da sala e faço questão de criar uma conexão direta e memorável com elas.',
      B: 'Circulo naturalmente pelo evento, entro em diferentes conversas e faço o ambiente trabalhar a meu favor.',
      C: 'Encontro alguém que parece interessado mas calmo e dedico uma conversa mais profunda e exclusiva a essa pessoa.',
      D: 'Observo quem demonstra interesse técnico no empreendimento e abordo com informações específicas sobre o projeto.'
    },
    pesos: {
      A: { dominancia: 2, influencia: 2 },
      B: { influencia: 3, estabilidade: 1 },
      C: { estabilidade: 3, conformidade: 1 },
      D: { conformidade: 2, influencia: 1 }
    }
  },

  {
    id: 'disc_07',
    categoria: 'DISC',
    subdimensao: 'estabilidade',
    pergunta: 'Um cliente fiel pede exclusividade de atendimento com você, mas você já tem 15 clientes ativos. O que você decide?',
    alternativas: {
      A: 'Aceito a exclusividade e reorganizo minha agenda para dar conta desse cliente importante.',
      B: 'Aceito com entusiasmo e crio uma experiência de relacionamento tão personalizada que o cliente se sente único.',
      C: 'Tenho uma conversa honesta sobre minha capacidade atual e negocio o que essa exclusividade significa na prática.',
      D: 'Registro tudo por escrito, defino exatamente o que está incluído e só me comprometo se puder entregar de fato.'
    },
    pesos: {
      A: { dominancia: 2, estabilidade: 1 },
      B: { influencia: 3, dominancia: 1 },
      C: { estabilidade: 3, conformidade: 1 },
      D: { conformidade: 3, estabilidade: 1 }
    }
  },

  {
    id: 'disc_08',
    categoria: 'DISC',
    subdimensao: 'conformidade',
    pergunta: 'Você descobre uma irregularidade documental em um imóvel de alto valor durante a análise pré-compra. Como você age?',
    alternativas: {
      A: 'Contato o vendedor diretamente e exijo que regularize imediatamente, ou vou recomendar ao cliente que desista.',
      B: 'Reúno vendedor e comprador, apresento a situação com clareza e facilito uma solução que preserve a negociação.',
      C: 'Comunico ambas as partes com calma, tranquilizo o cliente e guio o processo sem gerar pânico desnecessário.',
      D: 'Documento tudo formalmente, consulto um advogado e apresento um plano detalhado com prazos para resolver cada ponto.'
    },
    pesos: {
      A: { dominancia: 3, conformidade: 1 },
      B: { influencia: 2, estabilidade: 2 },
      C: { estabilidade: 3, conformidade: 1 },
      D: { conformidade: 3, dominancia: 1 }
    }
  },

  {
    id: 'disc_09',
    categoria: 'DISC',
    subdimensao: 'dominancia',
    pergunta: 'Um concorrente está assediando um cliente seu com vantagens de comissão. Você fica sabendo pelo próprio cliente. O que você faz?',
    alternativas: {
      A: 'Entro em contato imediatamente, evidencio meu histórico com o cliente e entrego resultados concretos rapidamente.',
      B: 'Crio uma experiência memorável para o cliente — visita exclusiva, atenção personalizada, algo que ele não esquece.',
      C: 'Mantenho minha consistência de atendimento e confio que a qualidade do relacionamento vai falar por si.',
      D: 'Preparo uma análise comparativa detalhada mostrando tudo o que já entreguei versus o que o concorrente promete.'
    },
    pesos: {
      A: { dominancia: 3, influencia: 1 },
      B: { influencia: 3, dominancia: 1 },
      C: { estabilidade: 2, conformidade: 1 },
      D: { conformidade: 2, estabilidade: 1 }
    }
  },

  {
    id: 'disc_10',
    categoria: 'DISC',
    subdimensao: 'influencia',
    pergunta: 'Você precisa apresentar um imóvel de R$ 8 milhões para um grupo de três investidores céticos ao mesmo tempo. Como você se prepara?',
    alternativas: {
      A: 'Vou direto aos números: ROI projetado, histórico de valorização e comparativos de mercado para tornar o argumento irrefutável.',
      B: 'Crio uma experiência de visita imersiva com curadoria, narrativa sobre o imóvel e projeção de estilo de vida.',
      C: 'Pesquiso cada investidor individualmente e adapto minha apresentação ao que é mais relevante para cada um deles.',
      D: 'Preparo um portfólio completo com projeções financeiras, análise de risco e uma seção de perguntas e respostas estruturada.'
    },
    pesos: {
      A: { dominancia: 2, conformidade: 1 },
      B: { influencia: 3, estabilidade: 1 },
      C: { estabilidade: 2, influencia: 1 },
      D: { conformidade: 3, dominancia: 1 }
    }
  },

  {
    id: 'disc_11',
    categoria: 'DISC',
    subdimensao: 'estabilidade',
    pergunta: 'Oito meses após a venda de um imóvel, o cliente entra em contato muito insatisfeito com um defeito construtivo. Como você reage?',
    alternativas: {
      A: 'Entro em contato imediato com a construtora e exijo uma solução, posicionando-me como defensor do meu cliente.',
      B: 'Ouço o cliente com atenção, expresso empatia genuína e mobilizo meus contatos para resolver o problema rapidamente.',
      C: 'Recebo a reclamação com calma, valido a frustração dele e trabalho de forma constante para mediar a solução entre as partes.',
      D: 'Documento o defeito formalmente, revejo o contrato e apresento um protocolo estruturado para encaminhar a resolução.'
    },
    pesos: {
      A: { dominancia: 3, conformidade: 1 },
      B: { influencia: 2, estabilidade: 1 },
      C: { estabilidade: 3, conformidade: 1 },
      D: { conformidade: 3, dominancia: 1 }
    }
  },

  {
    id: 'disc_12',
    categoria: 'DISC',
    subdimensao: 'conformidade',
    pergunta: 'Seu gestor pede que você apresente a estratégia de vendas do próximo trimestre para toda a equipe. Como você se prepara?',
    alternativas: {
      A: 'Estruturo as principais ações e prioridades, mantenho a apresentação direta e foco nos resultados esperados.',
      B: 'Crio uma apresentação envolvente que motive a equipe e gere entusiasmo coletivo em relação às metas.',
      C: 'Converso com os colegas antes de preparar, para que o plano reflita a realidade de quem está na ponta.',
      D: 'Faço uma análise detalhada dos resultados do trimestre anterior, das tendências de mercado e elaboro um plano bem documentado.'
    },
    pesos: {
      A: { dominancia: 2, conformidade: 1 },
      B: { influencia: 3, estabilidade: 1 },
      C: { estabilidade: 2, conformidade: 2 },
      D: { conformidade: 3, dominancia: 1 }
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // TEMPERAMENTO — 12 questões
  // Cobertura: colerico ×3, sanguineo ×3, fleumatico ×3, melancolico ×3
  // ─────────────────────────────────────────────────────────────────

  {
    id: 'temp_01',
    categoria: 'Temperamento',
    subdimensao: 'colerico',
    pergunta: 'Sua imobiliária acabou de lançar um novo empreendimento de alto padrão. Qual é a sua primeira atitude?',
    alternativas: {
      A: 'Monto imediatamente um plano de ação e começo a ligar para os meus melhores clientes antes de qualquer colega.',
      B: 'Organizo um evento de lançamento exclusivo e convido influenciadores e clientes para uma experiência memorável.',
      C: 'Converso com a equipe para entender a melhor abordagem antes de sair prospectando.',
      D: 'Leio todo o material técnico do empreendimento e preparo uma apresentação detalhada antes do primeiro contato.'
    },
    pesos: {
      A: { colerico: 3, melancolico: 1 },
      B: { sanguineo: 3, colerico: 1 },
      C: { fleumatico: 3, sanguineo: 1 },
      D: { melancolico: 3, fleumatico: 1 }
    }
  },

  {
    id: 'temp_02',
    categoria: 'Temperamento',
    subdimensao: 'melancolico',
    pergunta: 'Após perder uma venda de R$ 6 milhões para um concorrente, como você lida com a situação?',
    alternativas: {
      A: 'Analiso rapidamente o que aconteceu e já começo a prospectar novos clientes para compensar a perda.',
      B: 'Converso com colegas, compartilho o ocorrido e busco aprendizado coletivo com bom humor.',
      C: 'Processo a situação internamente, mantenho minha rotina e evito tomar decisões impulsivas nesse momento.',
      D: 'Faço uma análise profunda de cada etapa da negociação para identificar exatamente onde a venda foi perdida.'
    },
    pesos: {
      A: { colerico: 3, sanguineo: 1 },
      B: { sanguineo: 3, fleumatico: 1 },
      C: { fleumatico: 3, melancolico: 1 },
      D: { melancolico: 3, colerico: 1 }
    }
  },

  {
    id: 'temp_03',
    categoria: 'Temperamento',
    subdimensao: 'sanguineo',
    pergunta: 'Uma tarde livre sem compromissos agendados abre espaço na sua semana. Como você aproveita esse tempo?',
    alternativas: {
      A: 'Uso para avançar em uma ação de prospecção que vinha postergando — tempo livre é tempo de produção.',
      B: 'Entro em contato com pessoas do meu network que não falo há algum tempo e reativo relacionamentos.',
      C: 'Organizo meu pipeline, revejo notas de reuniões recentes e planejo a semana seguinte com calma.',
      D: 'Pesquiso dados de mercado, analiso a concorrência e preparo materiais técnicos para as próximas apresentações.'
    },
    pesos: {
      A: { colerico: 2, melancolico: 1 },
      B: { sanguineo: 3, colerico: 1 },
      C: { fleumatico: 3, melancolico: 1 },
      D: { melancolico: 3, fleumatico: 1 }
    }
  },

  {
    id: 'temp_04',
    categoria: 'Temperamento',
    subdimensao: 'fleumatico',
    pergunta: 'Faltando uma semana para o fim do mês, você já bateu a meta. Como você usa esse tempo restante?',
    alternativas: {
      A: 'Estabeleço um novo desafio pessoal e vou atrás de superar meu próprio recorde antes do mês fechar.',
      B: 'Celebro com a equipe, compartilho o resultado e uso a energia do momento para motivar os colegas.',
      C: 'Dedico o tempo a aprofundar relacionamentos com clientes atuais e a me preparar bem para o próximo mês.',
      D: 'Revejo o que funcionou e documento as abordagens bem-sucedidas para referência futura.'
    },
    pesos: {
      A: { colerico: 3, sanguineo: 1 },
      B: { sanguineo: 3, colerico: 1 },
      C: { fleumatico: 3, melancolico: 1 },
      D: { melancolico: 3, fleumatico: 1 }
    }
  },

  {
    id: 'temp_05',
    categoria: 'Temperamento',
    subdimensao: 'colerico',
    pergunta: 'Dois imóveis compatíveis com o perfil de um cliente estratégico surgem ao mesmo tempo. Qual é sua primeira ação?',
    alternativas: {
      A: 'Ligo imediatamente para o cliente e agendam uma visita de emergência ainda neste dia.',
      B: 'Envio uma mensagem animada com os destaques dos dois e proponho um "tour comparativo" descontraído.',
      C: 'Revejo os dois imóveis com cuidado antes de contatar o cliente, garantindo que tenho informação completa.',
      D: 'Preparo um comparativo técnico detalhado e envio uma análise completa antes de sugerir qualquer visita.'
    },
    pesos: {
      A: { colerico: 3, sanguineo: 1 },
      B: { sanguineo: 3, colerico: 1 },
      C: { fleumatico: 2, melancolico: 2 },
      D: { melancolico: 3, fleumatico: 1 }
    }
  },

  {
    id: 'temp_06',
    categoria: 'Temperamento',
    subdimensao: 'sanguineo',
    pergunta: 'Um colega introvertido precisa apresentar um imóvel para um cliente exigente e pede sua ajuda. Como você responde?',
    alternativas: {
      A: 'Dou conselhos práticos rápidos e deixo ele conduzir — a independência é fundamental para o desenvolvimento dele.',
      B: 'Faço um roleplay animado da apresentação com ele, injeto energia e ajudo a construir a confiança dele no processo.',
      C: 'Sento com ele, ouço suas preocupações com calma e trabalho cada ponto com apoio constante e tranquilo.',
      D: 'Ajudo-o a criar um roteiro detalhado com respostas para as principais objeções prováveis do cliente.'
    },
    pesos: {
      A: { colerico: 2, sanguineo: 1 },
      B: { sanguineo: 3, colerico: 1 },
      C: { fleumatico: 3, sanguineo: 1 },
      D: { melancolico: 3, fleumatico: 1 }
    }
  },

  {
    id: 'temp_07',
    categoria: 'Temperamento',
    subdimensao: 'fleumatico',
    pergunta: 'O mercado imobiliário está lento há dois meses consecutivos. Como você mantém seu ritmo e motivação?',
    alternativas: {
      A: 'Crio um desafio pessoal de 90 dias e intensifico minha rotina de prospecção para manter o volume de contatos.',
      B: 'Organizo um encontro informal com clientes e parceiros para manter minha visibilidade e energia em alta.',
      C: 'Foco em qualidade e não em quantidade: aprofundo o relacionamento com a carteira atual e preparo o terreno.',
      D: 'Analiso as causas do desaquecimento e pesquiso estratégias que funcionaram em ciclos semelhantes de mercado.'
    },
    pesos: {
      A: { colerico: 3, sanguineo: 1 },
      B: { sanguineo: 3, fleumatico: 1 },
      C: { fleumatico: 3, melancolico: 1 },
      D: { melancolico: 3, colerico: 1 }
    }
  },

  {
    id: 'temp_08',
    categoria: 'Temperamento',
    subdimensao: 'melancolico',
    pergunta: 'Às vésperas de fechar uma venda relevante, você percebe uma divergência entre o valor acordado verbalmente e o registrado no contrato. O que você faz?',
    alternativas: {
      A: 'Aponto a divergência diretamente para ambas as partes e exijo a correção antes de qualquer avanço.',
      B: 'Menciono de forma leve, enquadrando como um detalhe fácil de ajustar, para não gerar ansiedade desnecessária.',
      C: 'Comunico ambas as partes com tranquilidade e guio a correção sem pressa e sem criar tensão.',
      D: 'Documento formalmente a divergência, comparo com todos os registros anteriores e só avanço após confirmação por escrito.'
    },
    pesos: {
      A: { colerico: 3, melancolico: 1 },
      B: { sanguineo: 2, melancolico: 1 },
      C: { fleumatico: 2, melancolico: 2 },
      D: { melancolico: 3, fleumatico: 1 }
    }
  },

  {
    id: 'temp_09',
    categoria: 'Temperamento',
    subdimensao: 'colerico',
    pergunta: 'Seu pipeline cresceu, mas a taxa de conversão caiu. Um colega sugere uma metodologia nova de qualificação. Como você reage?',
    alternativas: {
      A: 'Avalio rapidamente se faz sentido, adapto ao meu jeito e começo a aplicar ainda esta semana.',
      B: 'Fico animado com a novidade, compartilho com a equipe e proponho que todos experimentem juntos.',
      C: 'Observo o colega aplicando primeiro, avalio se funciona para o meu perfil e então decido gradualmente.',
      D: 'Pesquiso a metodologia em profundidade, estudo as evidências e só aplico após criar um teste estruturado.'
    },
    pesos: {
      A: { colerico: 3, sanguineo: 1 },
      B: { sanguineo: 3, colerico: 1 },
      C: { fleumatico: 3, melancolico: 1 },
      D: { melancolico: 3, fleumatico: 1 }
    }
  },

  {
    id: 'temp_10',
    categoria: 'Temperamento',
    subdimensao: 'sanguineo',
    pergunta: 'Você está organizando um evento exclusivo para 30 potenciais compradores de alto padrão. Como você atua no evento?',
    alternativas: {
      A: 'Foco nos convidados com maior potencial de compra imediato e faço networking estratégico com eles.',
      B: 'Sou a energia do evento — cumprimento a todos com calor, conto histórias dos imóveis e torno a noite inesquecível.',
      C: 'Garanto que cada convidado se sinta acolhido e bem atendido, criando uma atmosfera sem pressão.',
      D: 'Me briefo sobre cada convidado antes do evento e faço conexões pensadas e personalizadas durante a noite.'
    },
    pesos: {
      A: { colerico: 2, sanguineo: 1 },
      B: { sanguineo: 3, colerico: 1 },
      C: { fleumatico: 3, sanguineo: 1 },
      D: { melancolico: 3, sanguineo: 1 }
    }
  },

  {
    id: 'temp_11',
    categoria: 'Temperamento',
    subdimensao: 'fleumatico',
    pergunta: 'Em uma negociação crítica, comprador e vendedor travam em uma diferença de R$ 200 mil. Como você conduz o impasse?',
    alternativas: {
      A: 'Tomo as rédeas da negociação, proponho um caminho claro e empurro ambas as partes em direção à decisão.',
      B: 'Injeto otimismo na sala, ajudo as partes a enxergar o que ganham ao fechar e crio momentum para o acordo.',
      C: 'Crio espaço para ambos expressarem suas posições, facilito o diálogo e deixo a solução emergir naturalmente.',
      D: 'Apresento uma proposta com dados: o que cada parte ganha e perde em cada cenário possível.'
    },
    pesos: {
      A: { colerico: 3, fleumatico: 1 },
      B: { sanguineo: 3, fleumatico: 1 },
      C: { fleumatico: 3, melancolico: 1 },
      D: { melancolico: 3, colerico: 1 }
    }
  },

  {
    id: 'temp_12',
    categoria: 'Temperamento',
    subdimensao: 'melancolico',
    pergunta: 'Você está fechando um negócio complexo de R$ 12 milhões com múltiplos envolvidos e ainda há três pontos abertos. Como você os gerencia?',
    alternativas: {
      A: 'Resolvo cada ponto em ligações rápidas separadas com os responsáveis e não deixo detalhes atrasarem o fechamento.',
      B: 'Reúno todos em uma chamada, trato os pontos com energia e construo momentum coletivo para fechar logo.',
      C: 'Trato cada ponto um a um com paciência, sem pressa, garantindo que todas as partes se sintam ouvidas.',
      D: 'Crio uma lista formal com cada ponto em aberto, os responsáveis e os prazos, e monitoro até a resolução completa.'
    },
    pesos: {
      A: { colerico: 3, melancolico: 1 },
      B: { sanguineo: 2, melancolico: 1 },
      C: { fleumatico: 2, melancolico: 2 },
      D: { melancolico: 3, fleumatico: 1 }
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // APTIDÃO POR ATIVIDADE — 16 questões
  // PAP ×4 | ligarAtivo ×4 | leadsDigitais ×4 | plantao ×4
  // ─────────────────────────────────────────────────────────────────

  // ── PAP (Prospecção Ativa Presencial) ─────────────────────────────

  {
    id: 'apt_pap_01',
    categoria: 'Aptidao',
    subdimensao: 'pap',
    pergunta: 'Você está fazendo prospecção a pé em um bairro nobre e encontra um morador saindo do seu edifício. Como você o aborda?',
    alternativas: {
      A: 'Me apresento com confiança, comento algo específico sobre o edifício e pergunto diretamente se ele tem interesse em vender.',
      B: 'Inicio uma conversa natural sobre o bairro, construo rapport e deixo a proposta surgir organicamente na conversa.',
      C: 'Entrego meu cartão educadamente, explico meu serviço brevemente e ofereço contato sem pressão.',
      D: 'Peço alguns minutos para apresentar dados de valorização da região e mostrar como posso maximizar o valor do imóvel dele.'
    },
    pesos: {
      A: { pap: 3, ligarAtivo: 1 },
      B: { pap: 2, plantao: 2 },
      C: { pap: 2, leadsDigitais: 1 },
      D: { pap: 3, leadsDigitais: 1 }
    }
  },

  {
    id: 'apt_pap_02',
    categoria: 'Aptidao',
    subdimensao: 'pap',
    pergunta: 'Você identificou um edifício onde três proprietários podem ter interesse em vender. Como você aborda esse prédio de forma proativa?',
    alternativas: {
      A: 'Vou pessoalmente ao edifício, me apresento com confiança a quem encontrar e faço minha proposta de forma direta.',
      B: 'Começo pelo porteiro — construo uma relação de confiança com ele e uso essa conexão para chegar aos moradores.',
      C: 'Envio uma carta personalizada a cada proprietário antes de ir pessoalmente, para chegar com uma abertura já criada.',
      D: 'Pesquiso cada proprietário, preparo uma análise de mercado específica para cada unidade e solicito uma reunião com embasamento.'
    },
    pesos: {
      A: { pap: 3, ligarAtivo: 1 },
      B: { pap: 2, plantao: 1 },
      C: { pap: 1, leadsDigitais: 2 },
      D: { pap: 2, leadsDigitais: 2 }
    }
  },

  {
    id: 'apt_pap_03',
    categoria: 'Aptidao',
    subdimensao: 'pap',
    pergunta: 'Em um condomínio de luxo durante uma prospecção, você é apresentado ao síndico. Como você usa esse encontro?',
    alternativas: {
      A: 'Faço uma proposta direta — é um tomador de decisão e a oportunidade não deve ser desperdiçada.',
      B: 'Foco totalmente em construir uma conexão pessoal genuína e deixo o assunto negócio surgir naturalmente.',
      C: 'Troco contatos, ouço o que ele tem a dizer e permito que ele direcione a conversa conforme seu interesse.',
      D: 'Faço perguntas específicas sobre a rotatividade de imóveis no condomínio e me posiciono como especialista do bairro.'
    },
    pesos: {
      A: { pap: 2, ligarAtivo: 2 },
      B: { pap: 3, plantao: 1 },
      C: { pap: 2, plantao: 2 },
      D: { pap: 3, leadsDigitais: 1 }
    }
  },

  {
    id: 'apt_pap_04',
    categoria: 'Aptidao',
    subdimensao: 'pap',
    pergunta: 'Durante uma prospecção presencial, um morador recusa sua abordagem de forma educada. O que você faz?',
    alternativas: {
      A: 'Respeito a recusa, deixo meu cartão e pergunto se posso tentar novamente em outro momento.',
      B: 'Aceito com um sorriso, faço um comentário simpático sobre o bairro que deixe uma impressão positiva e sigo em frente.',
      C: 'Agradeço a atenção e sigo para o próximo contato — nem toda abordagem vai funcionar e isso é normal.',
      D: 'Registro a recusa, não insisto e anoto detalhes para tentar uma abordagem diferente em outro momento.'
    },
    pesos: {
      A: { pap: 2, ligarAtivo: 1 },
      B: { pap: 3, plantao: 1 },
      C: { pap: 2, plantao: 1 },
      D: { pap: 1, leadsDigitais: 2 }
    }
  },

  // ── Ligações Ativas ────────────────────────────────────────────────

  {
    id: 'apt_ligar_01',
    categoria: 'Aptidao',
    subdimensao: 'ligarAtivo',
    pergunta: 'Você tem uma lista de 20 leads frios que visitaram imóveis há mais de 60 dias sem dar retorno. Como você estrutura sua abordagem?',
    alternativas: {
      A: 'Ligo para todos hoje mesmo, sem roteiro fixo — prefiro improvisar conforme a conversa flui.',
      B: 'Segmento a lista por perfil, preparo uma abertura personalizada para cada grupo e ligo com um objetivo claro por chamada.',
      C: 'Envio uma mensagem de WhatsApp antes de ligar, para o lead já estar esperando meu contato.',
      D: 'Preparo um script detalhado com prováveis objeções e respostas, e ligo apenas para os que têm maior fit com os imóveis disponíveis.'
    },
    pesos: {
      A: { ligarAtivo: 1, pap: 2 },
      B: { ligarAtivo: 3, leadsDigitais: 1 },
      C: { ligarAtivo: 2, leadsDigitais: 2 },
      D: { ligarAtivo: 3, leadsDigitais: 1 }
    }
  },

  {
    id: 'apt_ligar_02',
    categoria: 'Aptidao',
    subdimensao: 'ligarAtivo',
    pergunta: 'Um cliente foi indicado por um contato de confiança e ainda não falou com você. Como você faz o primeiro contato?',
    alternativas: {
      A: 'Ligo diretamente, menciono rapidamente a indicação e vou direto ao ponto: propor um encontro.',
      B: 'Abro a conversa com calor, trabalho a indicação de forma natural e construo rapport antes de qualquer proposta.',
      C: 'Envio uma mensagem me apresentando e pergunto qual o melhor momento para uma ligação.',
      D: 'Pesquiso o perfil do indicado antes de ligar e faço contato já com informações adaptadas às prováveis necessidades dele.'
    },
    pesos: {
      A: { ligarAtivo: 2, pap: 2 },
      B: { ligarAtivo: 3, plantao: 1 },
      C: { ligarAtivo: 2, leadsDigitais: 2 },
      D: { ligarAtivo: 3, leadsDigitais: 1 }
    }
  },

  {
    id: 'apt_ligar_03',
    categoria: 'Aptidao',
    subdimensao: 'ligarAtivo',
    pergunta: 'Um prospect desliga o telefone após 10 segundos sem dar explicação. O que você faz?',
    alternativas: {
      A: 'Ligo de volta imediatamente — provavelmente foi um momento ruim e vale tentar mais uma vez.',
      B: 'Aguardo algumas horas e ligo novamente com uma abertura mais leve e informal.',
      C: 'Envio uma mensagem curta me apresentando e ofereço falar no horário que for melhor para ele.',
      D: 'Registro como lead de baixa receptividade, programo uma nova tentativa em 15 dias com uma abordagem diferente.'
    },
    pesos: {
      A: { ligarAtivo: 2, pap: 2 },
      B: { ligarAtivo: 3, plantao: 1 },
      C: { ligarAtivo: 2, leadsDigitais: 2 },
      D: { ligarAtivo: 1, leadsDigitais: 2 }
    }
  },

  {
    id: 'apt_ligar_04',
    categoria: 'Aptidao',
    subdimensao: 'ligarAtivo',
    pergunta: 'Durante uma ligação de prospecção, o cliente diz que já tem um corretor com quem trabalha. Como você conduz?',
    alternativas: {
      A: 'Reconheço, mas pergunto imediatamente o que o corretor atual está fazendo por ele e apresento meu diferencial.',
      B: 'Respondo com simpatia, digo que é ótimo e peço licença para que ele guarde meu contato para necessidades futuras.',
      C: 'Agradeço o tempo, não insisto e proponho mantê-lo na minha lista de envio de atualizações de mercado.',
      D: 'Faço perguntas específicas sobre o perfil que ele busca e apresento argumentos técnicos concretos sobre minha especialidade.'
    },
    pesos: {
      A: { ligarAtivo: 3, pap: 1 },
      B: { ligarAtivo: 2, plantao: 2 },
      C: { ligarAtivo: 2, leadsDigitais: 1 },
      D: { ligarAtivo: 3, leadsDigitais: 1 }
    }
  },

  // ── Leads Digitais ─────────────────────────────────────────────────

  {
    id: 'apt_leads_01',
    categoria: 'Aptidao',
    subdimensao: 'leadsDigitais',
    pergunta: 'Um lead chegou pelo Instagram depois de curtir três publicações suas de imóveis acima de R$ 3 milhões. Qual é sua abordagem inicial?',
    alternativas: {
      A: 'Respondo imediatamente com uma proposta direta e pergunto qual o orçamento disponível.',
      B: 'Mando uma mensagem descontraída, menciono as publicações que ele curtiu e proponho uma conversa informal.',
      C: 'Aguardo ele enviar mensagem primeiro e então respondo com atenção total ao que ele trouxer.',
      D: 'Analiso o perfil dele nas redes, identifico seu padrão de interesse e elaboro uma resposta com curadoria personalizada de imóveis.'
    },
    pesos: {
      A: { leadsDigitais: 1, ligarAtivo: 2 },
      B: { leadsDigitais: 3, plantao: 1 },
      C: { leadsDigitais: 1, plantao: 2 },
      D: { leadsDigitais: 3, ligarAtivo: 1 }
    }
  },

  {
    id: 'apt_leads_02',
    categoria: 'Aptidao',
    subdimensao: 'leadsDigitais',
    pergunta: 'Um lead preencheu um formulário no seu site demonstrando interesse em imóveis acima de R$ 4 milhões, mas deixou pouquíssimas informações. Como você faz o follow-up?',
    alternativas: {
      A: 'Ligo imediatamente — a velocidade de resposta é um fator crítico de conversão de leads digitais.',
      B: 'Respondo via WhatsApp com uma mensagem amigável e faço algumas perguntas para entender melhor o perfil.',
      C: 'Aguardo para ver se ele volta a interagir antes de investir energia nesse contato.',
      D: 'Pesquiso o que for possível sobre ele online e elaboro um primeiro contato altamente personalizado.'
    },
    pesos: {
      A: { leadsDigitais: 1, ligarAtivo: 3 },
      B: { leadsDigitais: 3, plantao: 1 },
      C: { leadsDigitais: 1, plantao: 2 },
      D: { leadsDigitais: 3, ligarAtivo: 1 }
    }
  },

  {
    id: 'apt_leads_03',
    categoria: 'Aptidao',
    subdimensao: 'leadsDigitais',
    pergunta: 'Seu último post sobre um empreendimento de luxo teve 1.000 visualizações, mas apenas 3 mensagens diretas. Como você melhora a performance?',
    alternativas: {
      A: 'Publico com mais frequência e em formatos diferentes — volume e variedade vão converter mais leads ao longo do tempo.',
      B: 'Crio um post de continuação com a história de um cliente que encontrou o imóvel ideal — conteúdo emocional converte mais.',
      C: 'Engajo com cada comentarista e envio mensagens pessoais para as contas que salvaram o post.',
      D: 'Analiso quais elementos geraram salvamentos versus comentários versus mensagens e otimizo com base nos dados.'
    },
    pesos: {
      A: { leadsDigitais: 1, pap: 2 },
      B: { leadsDigitais: 2, plantao: 2 },
      C: { leadsDigitais: 3, ligarAtivo: 1 },
      D: { leadsDigitais: 3, ligarAtivo: 1 }
    }
  },

  {
    id: 'apt_leads_04',
    categoria: 'Aptidao',
    subdimensao: 'leadsDigitais',
    pergunta: 'Um potencial comprador engaja com seu conteúdo há 3 meses, mas nunca enviou uma mensagem direta. Como você o converte?',
    alternativas: {
      A: 'Envio uma mensagem direta mencionando exatamente o tipo de imóvel com que ele mais tem interagido.',
      B: 'Publico um story de bastidores convidando seguidores a enviar perguntas — uma porta de entrada mais suave.',
      C: 'Continuo produzindo conteúdo relevante e confio no processo — quando ele estiver pronto, vai se manifestar.',
      D: 'Crio uma série de conteúdo aprofundado sobre o tipo específico de imóvel que ele tem curtido com mais frequência.'
    },
    pesos: {
      A: { leadsDigitais: 2, ligarAtivo: 2 },
      B: { leadsDigitais: 3, plantao: 1 },
      C: { leadsDigitais: 1, plantao: 2 },
      D: { leadsDigitais: 3, ligarAtivo: 1 }
    }
  },

  // ── Plantão ────────────────────────────────────────────────────────

  {
    id: 'apt_plantao_01',
    categoria: 'Aptidao',
    subdimensao: 'plantao',
    pergunta: 'Você está de plantão em um stand de vendas quando chega um casal que diz estar "só olhando" e parece apressado. O que você faz?',
    alternativas: {
      A: 'Apresento o empreendimento de forma rápida e objetiva, já mostrando os diferenciais mais impactantes para acelerar a decisão.',
      B: 'Recebo o casal com entusiasmo, quebro o gelo com uma história envolvente sobre o empreendimento e torno a visita agradável.',
      C: 'Deixo-os à vontade para explorar o espaço e fico disponível para responder apenas quando me procurarem.',
      D: 'Faço perguntas estratégicas para entender o perfil do casal e mostro apenas as unidades com maior aderência ao que precisam.'
    },
    pesos: {
      A: { plantao: 2, ligarAtivo: 2 },
      B: { plantao: 3, leadsDigitais: 1 },
      C: { plantao: 2, pap: 1 },
      D: { plantao: 3, leadsDigitais: 1 }
    }
  },

  {
    id: 'apt_plantao_02',
    categoria: 'Aptidao',
    subdimensao: 'plantao',
    pergunta: 'Um visitante de alto perfil chega sozinho ao seu stand, faz perguntas técnicas muito específicas e demonstra estar com pressa. Como você o atende?',
    alternativas: {
      A: 'Acompanho o ritmo dele — respostas diretas e precisas, sem perder tempo com conversa fora do assunto.',
      B: 'Engajo com a história por trás do projeto e faço a visita ser uma experiência diferenciada, mesmo que breve.',
      C: 'Respondo tudo o que ele perguntar, sigo o lead dele e só ofereço mais informação se ele quiser.',
      D: 'Uso as perguntas técnicas dele como abertura para demonstrar profundidade de conhecimento sobre o empreendimento.'
    },
    pesos: {
      A: { plantao: 2, ligarAtivo: 2 },
      B: { plantao: 3, leadsDigitais: 1 },
      C: { plantao: 2, pap: 1 },
      D: { plantao: 3, leadsDigitais: 1 }
    }
  },

  {
    id: 'apt_plantao_03',
    categoria: 'Aptidao',
    subdimensao: 'plantao',
    pergunta: 'Cinco visitantes chegam ao seu stand ao mesmo tempo e você está sozinho. Como você gerencia a situação?',
    alternativas: {
      A: 'Priorizo o que demonstra maior intenção de compra imediata e deixo os outros confortáveis enquanto aguardam.',
      B: 'Recebo todos de uma vez, crio uma energia de grupo e transformo a situação em uma apresentação informal.',
      C: 'Cumprimento todos com calor, garanto que ninguém se sinta ignorado e gerencio o fluxo com calma.',
      D: 'Faço uma leitura rápida do perfil e nível de interesse de cada um e decido quem priorizar para uma conversa mais profunda.'
    },
    pesos: {
      A: { plantao: 2, ligarAtivo: 2 },
      B: { plantao: 3, pap: 1 },
      C: { plantao: 2, pap: 2 },
      D: { plantao: 3, leadsDigitais: 1 }
    }
  },

  {
    id: 'apt_plantao_04',
    categoria: 'Aptidao',
    subdimensao: 'plantao',
    pergunta: 'Faltam 30 minutos para o fim do seu turno de plantão quando um casal entra com aparente interesse genuíno. O que você faz?',
    alternativas: {
      A: 'Dedico tudo ao atendimento — o horário é irrelevante quando existe uma oportunidade real na minha frente.',
      B: 'Recebo o casal com calor e crio uma atmosfera aconchegante e sem pressa para que se sintam à vontade.',
      C: 'Atendo com profissionalismo, sou transparente sobre o horário e ofereço continuar em outro dia se necessário.',
      D: 'Foco em qualificar o interesse deles de forma eficiente para saber exatamente como e quando fazer o follow-up.'
    },
    pesos: {
      A: { plantao: 3, ligarAtivo: 1 },
      B: { plantao: 3, pap: 1 },
      C: { plantao: 2, leadsDigitais: 1 },
      D: { plantao: 2, ligarAtivo: 2 }
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // FORÇAS — 10 questões
  // Cobertura: foco ×2, resiliencia ×2, empatia ×2, persuasao ×2, disciplina ×2
  // ─────────────────────────────────────────────────────────────────

  {
    id: 'forca_01',
    categoria: 'Forcas',
    subdimensao: 'resiliencia',
    pergunta: 'Você trabalhou três meses em um cliente que estava próximo de fechar um imóvel de R$ 8 milhões, e ele desistiu na véspera da assinatura. Como você se comporta no dia seguinte?',
    alternativas: {
      A: 'Retomo minha agenda normalmente e foco em outros leads ativos — o tempo perdido não volta, mas o próximo cliente pode estar logo ali.',
      B: 'Compartilho o ocorrido com colegas próximos, processo emocionalmente com suporte do time e sigo em frente com energia renovada.',
      C: 'Dedico um tempo para organizar meus pensamentos, reviso minha carteira e retomo o ritmo no dia seguinte com calma.',
      D: 'Faço um retrospecto detalhado da negociação para entender o que poderia ter sido feito diferente e documento as lições.'
    },
    pesos: {
      A: { resiliencia: 3, foco: 2 },
      B: { resiliencia: 2, empatia: 2 },
      C: { resiliencia: 2, disciplina: 1 },
      D: { resiliencia: 2, disciplina: 2 }
    }
  },

  {
    id: 'forca_02',
    categoria: 'Forcas',
    subdimensao: 'persuasao',
    pergunta: 'Durante uma negociação de alto valor, o cliente compara seu imóvel com outro que é R$ 500 mil mais barato e diz não ver justificativa para o preço. Como você conduz a conversa?',
    alternativas: {
      A: 'Apresento os números diretamente: valorização histórica, custos de condomínio, localização e ROI projetado para mostrar que o valor é justo.',
      B: 'Ajudo o cliente a visualizar como seria sua vida naquele imóvel versus o concorrente, criando uma conexão emocional com os diferenciais.',
      C: 'Ouço com atenção, valido a preocupação dele e proponho que ele visite os dois imóveis antes de decidir, sem pressa.',
      D: 'Mostro um comparativo detalhado de especificações técnicas, acabamentos, histórico do incorporador e depreciação esperada de cada opção.'
    },
    pesos: {
      A: { persuasao: 2, foco: 2 },
      B: { persuasao: 3, empatia: 2 },
      C: { persuasao: 1, empatia: 3 },
      D: { persuasao: 2, disciplina: 2 }
    }
  },

  {
    id: 'forca_03',
    categoria: 'Forcas',
    subdimensao: 'foco',
    pergunta: 'Você está no meio de três negociações simultâneas de alta prioridade quando surge um novo lead com forte potencial. Como você gerencia sua atenção?',
    alternativas: {
      A: 'Adiciono o novo lead ao pipeline ativo imediatamente — gerenciar múltiplas prioridades é o que define um corretor de alta performance.',
      B: 'Faço uma ligação rápida de qualificação com o novo lead e decido se cabe na minha capacidade atual.',
      C: 'Concluo uma entrega importante em uma das negociações em andamento antes de me dedicar ao novo lead.',
      D: 'Registro o novo lead com todas as informações, envio um retorno imediato e agendo contato aprofundado para o dia seguinte.'
    },
    pesos: {
      A: { foco: 1, resiliencia: 2 },
      B: { foco: 2, persuasao: 2 },
      C: { foco: 3, disciplina: 1 },
      D: { foco: 2, disciplina: 2 }
    }
  },

  {
    id: 'forca_04',
    categoria: 'Forcas',
    subdimensao: 'empatia',
    pergunta: 'Durante uma negociação, você percebe que um dos cônjuges está entusiasmado com o imóvel e o outro está resistente. Como você lida com os dois?',
    alternativas: {
      A: 'Foco no cônjuge animado, amplifico o entusiasmo dele e deixo que esse impulso naturalmente influencie o outro.',
      B: 'Trato o casal como uma unidade — celebro o que os une e ajudo a explorar a resistência de forma construtiva.',
      C: 'Dou espaço extra ao cônjuge resistente, garantindo que ele nunca se sinta pressionado em nenhum momento.',
      D: 'Pergunto a cada um separadamente o que é mais importante e uso essas informações para mostrar como o imóvel atende os dois.'
    },
    pesos: {
      A: { persuasao: 2, empatia: 1 },
      B: { empatia: 3, persuasao: 1 },
      C: { empatia: 2, resiliencia: 1 },
      D: { empatia: 3, foco: 1 }
    }
  },

  {
    id: 'forca_05',
    categoria: 'Forcas',
    subdimensao: 'disciplina',
    pergunta: 'Você tem um compromisso consigo mesmo de fazer 10 ligações de prospecção antes do meio-dia, mas acorda com mensagens urgentes de clientes. O que você faz?',
    alternativas: {
      A: 'Resolvo as mensagens urgentes primeiro e adapto as ligações de prospecção para a tarde.',
      B: 'Faço uma triagem das mensagens, respondo apenas as verdadeiramente críticas e protejo minha rotina matinal.',
      C: 'Respondo todas as mensagens com atenção primeiro e reavalo se as ligações ainda cabem no dia.',
      D: 'Bloqueio a primeira hora para as ligações, coloco as mensagens como "visto" e respondo todas em bloco depois.'
    },
    pesos: {
      A: { resiliencia: 2, disciplina: 1 },
      B: { disciplina: 3, foco: 2 },
      C: { resiliencia: 1, empatia: 1 },
      D: { disciplina: 3, foco: 2 }
    }
  },

  {
    id: 'forca_06',
    categoria: 'Forcas',
    subdimensao: 'foco',
    pergunta: 'Durante uma visita a um imóvel com seu cliente, você recebe uma ligação de outro cliente em um momento tenso de negociação. O que você faz?',
    alternativas: {
      A: 'Me desculpo brevemente com o cliente presente, atendo a ligação e resolvo a outra situação rapidamente antes de retornar.',
      B: 'Envio uma mensagem rápida dizendo que retorno em uma hora e mantenho presença total na visita.',
      C: 'Recuso a chamada e garanto que o cliente da visita sinta toda a minha atenção dedicada a ele.',
      D: 'Me desculpo, avalio se a chamada é verdadeiramente urgente e só me afasto se for genuinamente necessário.'
    },
    pesos: {
      A: { resiliencia: 2, foco: 1 },
      B: { foco: 3, disciplina: 2 },
      C: { foco: 2, empatia: 2 },
      D: { foco: 2, disciplina: 2 }
    }
  },

  {
    id: 'forca_07',
    categoria: 'Forcas',
    subdimensao: 'resiliencia',
    pergunta: 'Após um primeiro semestre excelente, o segundo começa com três negócios perdidos consecutivos. Como você mantém sua performance?',
    alternativas: {
      A: 'Aumento o volume de prospecção imediatamente — negócios perdidos se compensam com novas oportunidades.',
      B: 'Reconecto com meu network, frequento eventos e recarrego minha energia através das relações.',
      C: 'Revejo meu processo, identifico padrões nos insucessos e faço ajustes cirúrgicos antes de retomar em ritmo pleno.',
      D: 'Estabeleço uma meta pessoal que reenquadra a situação — vou fechar um negócio maior do que qualquer um dos três perdidos.'
    },
    pesos: {
      A: { resiliencia: 2, foco: 2 },
      B: { resiliencia: 2, empatia: 1 },
      C: { resiliencia: 3, disciplina: 2 },
      D: { resiliencia: 3, persuasao: 1 }
    }
  },

  {
    id: 'forca_08',
    categoria: 'Forcas',
    subdimensao: 'empatia',
    pergunta: 'Um cliente revela que está comprando esse imóvel em homenagem a um familiar que faleceu recentemente. Como isso impacta seu atendimento?',
    alternativas: {
      A: 'Reconheço o significado brevemente e mantenho o profissionalismo — misturar emoções pode turvar a transação.',
      B: 'Dedico tempo para entender o que esse imóvel representa para ele e faço o processo refletir essa importância.',
      C: 'Abro espaço para ele compartilhar o quanto quiser, criando um ambiente seguro para o peso emocional da compra.',
      D: 'Anoto o contexto emocional, adapto toda a comunicação durante o processo e asseguro que cada interação respeite o que ele expressou.'
    },
    pesos: {
      A: { foco: 2, empatia: 1 },
      B: { empatia: 3, resiliencia: 1 },
      C: { empatia: 3, disciplina: 1 },
      D: { empatia: 2, disciplina: 2 }
    }
  },

  {
    id: 'forca_09',
    categoria: 'Forcas',
    subdimensao: 'persuasao',
    pergunta: 'Um cliente está 90% convicto de fechar, mas continua dizendo que precisa "pensar mais um pouco". Como você lida com essa barreira final?',
    alternativas: {
      A: 'Crio urgência com delicadeza — menciono que esse tipo de imóvel raramente fica disponível e apresento razões concretas para agir agora.',
      B: 'Pergunto diretamente o que ainda está segurando a decisão — preciso entender a objeção real antes de endereçá-la.',
      C: 'Recuo um pouco, dou espaço e agendo uma ligação dois dias depois com uma perspectiva fresca.',
      D: 'Apresento um resumo final focado nos três motivos principais pelos quais esse imóvel se alinha com tudo que ele me disse que queria.'
    },
    pesos: {
      A: { persuasao: 3, foco: 1 },
      B: { persuasao: 2, empatia: 2 },
      C: { resiliencia: 2, empatia: 1 },
      D: { persuasao: 3, disciplina: 1 }
    }
  },

  {
    id: 'forca_10',
    categoria: 'Forcas',
    subdimensao: 'disciplina',
    pergunta: 'Você percebe que seu CRM acumula dezenas de tarefas de follow-up vencidas nas últimas duas semanas. Como você recupera a situação?',
    alternativas: {
      A: 'Trato as mais urgentes agora e reconstruo o restante à medida que surgirem novas oportunidades — o acumulado não é crítico.',
      B: 'Bloqueio meio período esta semana para zerar o backlog e configuro lembretes recorrentes para não deixar acumular novamente.',
      C: 'Entro em contato pessoalmente com cada lead vencido, reconheço o período sem notícias e retomo o relacionamento.',
      D: 'Revejo todas as tarefas em aberto, priorizo por potencial de negócio e monto um plano de recuperação estruturado para 5 dias.'
    },
    pesos: {
      A: { resiliencia: 1, foco: 1 },
      B: { disciplina: 3, foco: 2 },
      C: { empatia: 2, disciplina: 2 },
      D: { disciplina: 3, foco: 2 }
    }
  }

];

module.exports = questions;
