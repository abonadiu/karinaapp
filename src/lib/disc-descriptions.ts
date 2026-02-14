// ============================================================
// DISC Dimension Descriptions
// ============================================================

export interface DiscDimensionInfo {
  letter: string;
  name: string;
  color: string;
  icon: string;
  tagline: string;
  about: string;
  strengths: string[];
  challenges: string[];
  communication: string;
  idealEnvironment: string;
  underPressure: string;
  motivators: string[];
  fears: string[];
}

export const DISC_DIMENSIONS: Record<string, DiscDimensionInfo> = {
  D: {
    letter: "D",
    name: "Dominância",
    color: "#DC2626",
    icon: "🔴",
    tagline: "Orientado a resultados, direto e decisivo",
    about:
      "A dimensão Dominância reflete como você lida com problemas e desafios. Pessoas com alto D são assertivas, orientadas a resultados e gostam de assumir o controle. São motivadas por desafios e buscam eficiência em tudo que fazem. Tendem a ser diretas na comunicação e preferem ir direto ao ponto.",
    strengths: [
      "Tomada de decisão rápida e assertiva",
      "Foco em resultados e eficiência",
      "Capacidade de liderança e iniciativa",
      "Determinação e persistência diante de obstáculos",
      "Habilidade para resolver problemas complexos",
    ],
    challenges: [
      "Pode parecer impaciente ou insensível",
      "Tendência a ser excessivamente direto",
      "Dificuldade em delegar e confiar nos outros",
      "Pode ignorar detalhes em busca de velocidade",
      "Resistência a seguir processos estabelecidos",
    ],
    communication:
      "Comunica-se de forma direta, concisa e orientada à ação. Prefere conversas objetivas e focadas em resultados. Valoriza eficiência na comunicação e pode ficar impaciente com detalhes excessivos ou conversas longas sem propósito claro.",
    idealEnvironment:
      "Ambientes dinâmicos com autonomia para tomar decisões, desafios constantes, oportunidades de liderança e liberdade para inovar. Funciona melhor quando tem autoridade para agir e metas claras a alcançar.",
    underPressure:
      "Sob pressão, tende a se tornar mais autoritário e impaciente. Pode tomar decisões precipitadas, ignorar opiniões alheias e focar exclusivamente em resultados imediatos. Pode parecer agressivo ou intimidador.",
    motivators: [
      "Desafios e competição",
      "Autonomia e controle",
      "Resultados tangíveis",
      "Reconhecimento por conquistas",
      "Oportunidades de liderança",
    ],
    fears: [
      "Perder o controle",
      "Ser visto como vulnerável",
      "Fracasso ou ineficiência",
      "Rotina e monotonia",
    ],
  },
  I: {
    letter: "I",
    name: "Influência",
    color: "#F59E0B",
    icon: "🟡",
    tagline: "Entusiasta, otimista e colaborativo",
    about:
      "A dimensão Influência reflete como você lida com pessoas e como influencia os outros. Pessoas com alto I são sociáveis, entusiastas e otimistas. São motivadas por reconhecimento social e gostam de trabalhar em equipe. Tendem a ser persuasivas e criam ambientes positivos ao seu redor.",
    strengths: [
      "Excelente comunicação e persuasão",
      "Capacidade de motivar e inspirar pessoas",
      "Criatividade e pensamento inovador",
      "Habilidade para networking e relacionamentos",
      "Otimismo e energia contagiante",
    ],
    challenges: [
      "Pode ser desorganizado e pouco focado em detalhes",
      "Tendência a prometer mais do que pode entregar",
      "Dificuldade em lidar com conflitos diretos",
      "Pode evitar tarefas rotineiras ou analíticas",
      "Necessidade excessiva de aprovação social",
    ],
    communication:
      "Comunica-se de forma entusiasta, expressiva e envolvente. Gosta de contar histórias, usar humor e criar conexões emocionais. Prefere conversas informais e colaborativas, e pode ter dificuldade com comunicação muito formal ou técnica.",
    idealEnvironment:
      "Ambientes colaborativos, criativos e sociais com oportunidades de interação. Funciona melhor quando há reconhecimento, liberdade criativa, trabalho em equipe e um clima positivo e descontraído.",
    underPressure:
      "Sob pressão, tende a se tornar mais desorganizado e emocional. Pode buscar aprovação excessiva, evitar confrontos necessários e perder o foco em prioridades. Pode reagir de forma impulsiva ou dramática.",
    motivators: [
      "Reconhecimento e aprovação social",
      "Interação com pessoas",
      "Liberdade criativa",
      "Ambiente positivo e divertido",
      "Oportunidades de expressão",
    ],
    fears: [
      "Rejeição social",
      "Perda de influência",
      "Ambientes rígidos e isolados",
      "Ser ignorado ou desvalorizado",
    ],
  },
  S: {
    letter: "S",
    name: "Estabilidade",
    color: "#16A34A",
    icon: "🟢",
    tagline: "Paciente, confiável e colaborativo",
    about:
      "A dimensão Estabilidade reflete como você lida com ritmo e consistência. Pessoas com alto S são pacientes, confiáveis e valorizam harmonia. São motivadas por segurança e estabilidade, e preferem ambientes previsíveis. Tendem a ser excelentes ouvintes e mediadores de conflitos.",
    strengths: [
      "Lealdade e confiabilidade excepcionais",
      "Excelente capacidade de escuta ativa",
      "Paciência e persistência",
      "Habilidade para mediar conflitos",
      "Consistência e dedicação ao trabalho",
    ],
    challenges: [
      "Resistência a mudanças e novas situações",
      "Dificuldade em dizer 'não' e estabelecer limites",
      "Tendência a evitar conflitos necessários",
      "Pode ser passivo demais em situações que exigem ação",
      "Lentidão na tomada de decisões",
    ],
    communication:
      "Comunica-se de forma calma, paciente e empática. É um excelente ouvinte e prefere conversas sinceras e profundas. Evita confrontos e busca harmonia nas interações. Pode ter dificuldade em expressar discordância.",
    idealEnvironment:
      "Ambientes estáveis, previsíveis e harmoniosos com relacionamentos de confiança. Funciona melhor quando há clareza de expectativas, tempo adequado para completar tarefas e um clima de cooperação e respeito mútuo.",
    underPressure:
      "Sob pressão, tende a se retrair e evitar confrontos. Pode concordar com coisas que não acredita para manter a paz, acumular ressentimento silencioso e resistir passivamente a mudanças impostas.",
    motivators: [
      "Estabilidade e segurança",
      "Harmonia nos relacionamentos",
      "Reconhecimento pela lealdade",
      "Tempo para processar mudanças",
      "Ambiente cooperativo",
    ],
    fears: [
      "Mudanças repentinas",
      "Conflitos e confrontos",
      "Perda de segurança",
      "Pressão por decisões rápidas",
    ],
  },
  C: {
    letter: "C",
    name: "Conformidade",
    color: "#2563EB",
    icon: "🔵",
    tagline: "Analítico, preciso e orientado à qualidade",
    about:
      "A dimensão Conformidade reflete como você lida com procedimentos e regras. Pessoas com alto C são analíticas, detalhistas e valorizam precisão. São motivadas por qualidade e excelência, e preferem tomar decisões baseadas em dados e fatos. Tendem a ser sistemáticas e metódicas.",
    strengths: [
      "Pensamento analítico e crítico apurado",
      "Atenção excepcional aos detalhes",
      "Capacidade de planejamento e organização",
      "Tomada de decisão baseada em dados",
      "Altos padrões de qualidade e excelência",
    ],
    challenges: [
      "Tendência ao perfeccionismo excessivo",
      "Pode ser excessivamente crítico consigo e com os outros",
      "Dificuldade em lidar com ambiguidade",
      "Lentidão por excesso de análise (paralisia por análise)",
      "Pode parecer frio ou distante emocionalmente",
    ],
    communication:
      "Comunica-se de forma precisa, lógica e fundamentada. Prefere dados, fatos e evidências. Valoriza comunicação clara e estruturada, e pode ter dificuldade com conversas muito emocionais ou vagas.",
    idealEnvironment:
      "Ambientes organizados, com processos claros e padrões de qualidade definidos. Funciona melhor quando há acesso a informações, tempo para análise, autonomia para garantir qualidade e expectativas claras.",
    underPressure:
      "Sob pressão, tende a se tornar mais crítico e perfeccionista. Pode se isolar para analisar excessivamente, evitar tomar decisões por medo de errar e se tornar excessivamente rígido com regras e procedimentos.",
    motivators: [
      "Qualidade e excelência",
      "Dados e informações claras",
      "Processos bem definidos",
      "Reconhecimento pela precisão",
      "Autonomia para garantir padrões",
    ],
    fears: [
      "Cometer erros",
      "Críticas ao seu trabalho",
      "Ambientes caóticos",
      "Falta de informação para decidir",
    ],
  },
};

// ============================================================
// Profile Combination Descriptions
// ============================================================

export interface DiscProfileDetail {
  title: string;
  summary: string;
  howYouWork: string;
  howYouLead: string;
  howYouRelate: string;
  growthTips: string[];
}

export function getProfileDetail(
  primary: string,
  secondary: string
): DiscProfileDetail {
  const p = DISC_DIMENSIONS[primary];
  const s = DISC_DIMENSIONS[secondary];

  if (!p || !s) {
    return {
      title: "Perfil DISC",
      summary: "Seu perfil reflete uma combinação única de características comportamentais.",
      howYouWork: "",
      howYouLead: "",
      howYouRelate: "",
      growthTips: [],
    };
  }

  const profiles: Record<string, DiscProfileDetail> = {
    DI: {
      title: "O Inspirador",
      summary:
        "Você combina a orientação a resultados da Dominância com o entusiasmo da Influência. É uma pessoa que lidera com energia, motiva equipes e busca resultados ambiciosos através de pessoas.",
      howYouWork:
        "Você trabalha com ritmo acelerado, buscando resultados rápidos e envolvendo pessoas no processo. Gosta de liderar projetos, tomar decisões e inspirar a equipe. Pode se frustrar com processos lentos ou burocráticos.",
      howYouLead:
        "Como líder, você é carismático e orientado a resultados. Inspira pelo exemplo e pela energia, mas precisa ter cuidado para não atropelar pessoas mais analíticas ou cautelosas da equipe.",
      howYouRelate:
        "Nos relacionamentos, você é direto mas sociável. Gosta de interações dinâmicas e produtivas. Pode ser impaciente com pessoas mais lentas ou reservadas.",
      growthTips: [
        "Pratique a escuta ativa — nem tudo precisa de ação imediata",
        "Dê espaço para que outros contribuam com ideias",
        "Desenvolva paciência com processos e detalhes",
        "Equilibre velocidade com qualidade nas decisões",
      ],
    },
    DC: {
      title: "O Estrategista",
      summary:
        "Você combina a orientação a resultados da Dominância com a precisão da Conformidade. É uma pessoa que busca excelência através de planejamento estratégico e execução determinada.",
      howYouWork:
        "Você trabalha de forma focada e metódica, combinando visão estratégica com atenção aos detalhes. Gosta de ter controle sobre a qualidade e os resultados. Pode se frustrar com falta de competência ou padrões baixos.",
      howYouLead:
        "Como líder, você estabelece padrões altos e espera excelência. É respeitado pela competência técnica e pela capacidade de entregar resultados de qualidade.",
      howYouRelate:
        "Nos relacionamentos, você é reservado mas respeitoso. Valoriza competência e profissionalismo. Pode parecer distante ou exigente demais.",
      growthTips: [
        "Desenvolva mais empatia e conexão emocional com as pessoas",
        "Aceite que nem tudo precisa ser perfeito",
        "Pratique a delegação com confiança",
        "Equilibre análise com intuição nas decisões",
      ],
    },
    DS: {
      title: "O Persistente",
      summary:
        "Você combina a determinação da Dominância com a estabilidade. É uma pessoa que busca resultados de forma consistente e persistente, sem perder a calma.",
      howYouWork:
        "Você trabalha de forma determinada e constante. Combina a busca por resultados com paciência e método. Gosta de ter autonomia mas também valoriza processos estabelecidos.",
      howYouLead:
        "Como líder, você é firme mas justo. Estabelece expectativas claras e dá suporte consistente à equipe. É respeitado pela confiabilidade e determinação.",
      howYouRelate:
        "Nos relacionamentos, você é leal e direto. Valoriza confiança e consistência. Pode ser teimoso quando acredita estar certo.",
      growthTips: [
        "Esteja mais aberto a novas abordagens e mudanças",
        "Desenvolva flexibilidade na comunicação",
        "Pratique a expressão de emoções e vulnerabilidade",
        "Busque feedback regularmente para evitar pontos cegos",
      ],
    },
    ID: {
      title: "O Motivador",
      summary:
        "Você combina o entusiasmo da Influência com a assertividade da Dominância. É uma pessoa carismática que sabe mobilizar pessoas e entregar resultados.",
      howYouWork:
        "Você trabalha com energia e entusiasmo, envolvendo pessoas e buscando resultados. Gosta de liderar de forma inspiradora e dinâmica. Pode se frustrar com rotinas ou trabalho solitário.",
      howYouLead:
        "Como líder, você é inspirador e energético. Motiva a equipe com visão e entusiasmo, mas precisa ter cuidado com a organização e o acompanhamento de detalhes.",
      howYouRelate:
        "Nos relacionamentos, você é caloroso e direto. Gosta de interações animadas e produtivas. Pode dominar conversas sem perceber.",
      growthTips: [
        "Desenvolva habilidades de organização e follow-up",
        "Pratique ouvir mais e falar menos",
        "Equilibre entusiasmo com análise crítica",
        "Aprenda a lidar com feedback negativo de forma construtiva",
      ],
    },
    IS: {
      title: "O Harmonizador",
      summary:
        "Você combina o entusiasmo da Influência com a paciência da Estabilidade. É uma pessoa calorosa e acolhedora que cria ambientes harmoniosos e colaborativos.",
      howYouWork:
        "Você trabalha de forma colaborativa e paciente, valorizando relacionamentos e harmonia. Gosta de trabalhar em equipe e ajudar os outros. Pode ter dificuldade com prazos apertados ou ambientes competitivos.",
      howYouLead:
        "Como líder, você é acessível e empático. Cria um ambiente de confiança e colaboração, mas pode ter dificuldade em tomar decisões difíceis ou dar feedback negativo.",
      howYouRelate:
        "Nos relacionamentos, você é caloroso, leal e atencioso. Valoriza conexões profundas e harmonia. Pode evitar conflitos necessários.",
      growthTips: [
        "Desenvolva assertividade para expressar suas necessidades",
        "Pratique dizer 'não' quando necessário",
        "Equilibre cuidar dos outros com cuidar de si mesmo",
        "Aceite que conflitos podem ser construtivos",
      ],
    },
    IC: {
      title: "O Comunicador Analítico",
      summary:
        "Você combina habilidades sociais da Influência com o pensamento analítico da Conformidade. É uma pessoa que sabe apresentar dados e ideias de forma envolvente.",
      howYouWork:
        "Você trabalha combinando criatividade com análise. Gosta de pesquisar, entender profundamente e depois comunicar de forma clara e envolvente. Pode alternar entre momentos sociais e analíticos.",
      howYouLead:
        "Como líder, você é informado e comunicativo. Toma decisões baseadas em dados mas sabe apresentá-las de forma persuasiva e acessível.",
      howYouRelate:
        "Nos relacionamentos, você é sociável mas seletivo. Valoriza conversas inteligentes e significativas. Pode ser crítico de forma sutil.",
      growthTips: [
        "Equilibre análise com ação — evite a paralisia por análise",
        "Desenvolva paciência com pessoas menos analíticas",
        "Pratique a tomada de decisão mais rápida",
        "Aceite que nem tudo precisa ser perfeito para ser compartilhado",
      ],
    },
    SD: {
      title: "O Executor Confiável",
      summary:
        "Você combina a estabilidade com a determinação da Dominância. É uma pessoa confiável e persistente que sabe ser assertiva quando necessário.",
      howYouWork:
        "Você trabalha de forma consistente e determinada. Combina paciência com foco em resultados. Gosta de ter processos claros mas também de ter autonomia para agir.",
      howYouLead:
        "Como líder, você é firme e confiável. A equipe sabe o que esperar de você. Estabelece expectativas claras e dá suporte consistente.",
      howYouRelate:
        "Nos relacionamentos, você é leal e direto. Valoriza confiança e reciprocidade. Pode ser reservado inicialmente mas se abre com o tempo.",
      growthTips: [
        "Desenvolva mais flexibilidade diante de mudanças",
        "Pratique a comunicação mais expressiva",
        "Esteja aberto a novas ideias e abordagens",
        "Equilibre estabilidade com inovação",
      ],
    },
    SI: {
      title: "O Conselheiro",
      summary:
        "Você combina a paciência da Estabilidade com a sociabilidade da Influência. É uma pessoa acolhedora e empática que cria relacionamentos profundos e duradouros.",
      howYouWork:
        "Você trabalha de forma colaborativa e paciente, valorizando pessoas e processos. Gosta de ajudar os outros e criar um ambiente positivo. Pode ter dificuldade com pressão e competição.",
      howYouLead:
        "Como líder, você é acessível e empático. Cria um ambiente de confiança onde as pessoas se sentem valorizadas e ouvidas.",
      howYouRelate:
        "Nos relacionamentos, você é caloroso, leal e paciente. É um excelente ouvinte e conselheiro. Pode absorver os problemas dos outros.",
      growthTips: [
        "Desenvolva assertividade para proteger seus limites",
        "Pratique a tomada de decisão mais ágil",
        "Equilibre cuidar dos outros com suas próprias necessidades",
        "Aceite que mudanças podem trazer oportunidades positivas",
      ],
    },
    SC: {
      title: "O Especialista",
      summary:
        "Você combina a estabilidade com a precisão da Conformidade. É uma pessoa metódica e confiável que valoriza qualidade e consistência em tudo que faz.",
      howYouWork:
        "Você trabalha de forma metódica, cuidadosa e consistente. Gosta de ter processos claros e tempo para fazer as coisas com qualidade. Pode se frustrar com mudanças repentinas ou falta de padrões.",
      howYouLead:
        "Como líder, você é organizado e justo. Estabelece processos claros e mantém padrões de qualidade. Pode ter dificuldade com decisões rápidas ou ambíguas.",
      howYouRelate:
        "Nos relacionamentos, você é leal e reservado. Valoriza confiança e respeito mútuo. Pode demorar para se abrir mas é extremamente confiável.",
      growthTips: [
        "Desenvolva mais conforto com ambiguidade e mudanças",
        "Pratique a comunicação mais expressiva e direta",
        "Equilibre perfeição com pragmatismo",
        "Busque oportunidades de sair da zona de conforto",
      ],
    },
    CD: {
      title: "O Perfeccionista Estratégico",
      summary:
        "Você combina o pensamento analítico da Conformidade com a orientação a resultados da Dominância. É uma pessoa que busca excelência através de planejamento rigoroso.",
      howYouWork:
        "Você trabalha de forma analítica e focada, combinando precisão com determinação. Gosta de ter controle sobre a qualidade e os resultados. Pode se frustrar com incompetência ou falta de padrões.",
      howYouLead:
        "Como líder, você estabelece padrões altíssimos e espera excelência. É respeitado pela competência mas pode parecer exigente demais.",
      howYouRelate:
        "Nos relacionamentos, você é reservado e seletivo. Valoriza competência e integridade. Pode parecer frio ou distante.",
      growthTips: [
        "Desenvolva mais empatia e paciência com os outros",
        "Aceite que 'bom o suficiente' às vezes é suficiente",
        "Pratique a vulnerabilidade e a conexão emocional",
        "Equilibre crítica com reconhecimento positivo",
      ],
    },
    CI: {
      title: "O Analista Comunicativo",
      summary:
        "Você combina a precisão da Conformidade com as habilidades sociais da Influência. É uma pessoa que sabe analisar profundamente e comunicar de forma acessível.",
      howYouWork:
        "Você trabalha combinando análise detalhada com comunicação eficaz. Gosta de pesquisar e entender antes de agir, e depois compartilhar de forma clara e envolvente.",
      howYouLead:
        "Como líder, você é informado e comunicativo. Toma decisões baseadas em dados e sabe engajar a equipe com clareza e entusiasmo.",
      howYouRelate:
        "Nos relacionamentos, você é sociável mas criterioso. Gosta de conversas significativas e baseadas em fatos.",
      growthTips: [
        "Equilibre análise com ação prática",
        "Desenvolva mais tolerância com ambiguidade",
        "Pratique a tomada de decisão mais rápida",
        "Aceite que nem todos precisam de dados para se convencer",
      ],
    },
    CS: {
      title: "O Metódico",
      summary:
        "Você combina a precisão da Conformidade com a paciência da Estabilidade. É uma pessoa analítica e consistente que valoriza qualidade e processos bem definidos.",
      howYouWork:
        "Você trabalha de forma cuidadosa, organizada e consistente. Gosta de ter tempo para analisar e fazer as coisas com qualidade. Pode se frustrar com pressão por velocidade ou falta de informação.",
      howYouLead:
        "Como líder, você é organizado, justo e detalhista. Estabelece processos claros e mantém padrões elevados de qualidade.",
      howYouRelate:
        "Nos relacionamentos, você é reservado, leal e confiável. Valoriza respeito mútuo e consistência. Pode demorar para se abrir.",
      growthTips: [
        "Desenvolva mais conforto com riscos calculados",
        "Pratique a comunicação mais assertiva e direta",
        "Equilibre análise com intuição",
        "Busque oportunidades de liderar e se expor mais",
      ],
    },
  };

  const key = primary === secondary ? primary + primary : primary + secondary;

  // For same-dimension profiles (DD, II, SS, CC)
  if (primary === secondary) {
    const dim = DISC_DIMENSIONS[primary];
    return {
      title: `O ${dim.name} Puro`,
      summary: `Você tem uma forte predominância na dimensão ${dim.name}. ${dim.about}`,
      howYouWork: `Você trabalha de forma altamente alinhada com as características de ${dim.name}. Suas forças naturais incluem ${dim.strengths.slice(0, 3).join(", ").toLowerCase()}.`,
      howYouLead: `Como líder, você demonstra fortemente as qualidades de ${dim.name}. Sua equipe reconhece sua ${dim.strengths[0].toLowerCase()}.`,
      howYouRelate: dim.communication,
      growthTips: dim.challenges.map(
        (c) => `Trabalhe para superar: ${c.toLowerCase()}`
      ),
    };
  }

  return (
    profiles[key] || {
      title: "Perfil DISC",
      summary: `Você combina características de ${DISC_DIMENSIONS[primary]?.name || primary} e ${DISC_DIMENSIONS[secondary]?.name || secondary}.`,
      howYouWork: "",
      howYouLead: "",
      howYouRelate: "",
      growthTips: [],
    }
  );
}

// ============================================================
// Recommendations based on profile
// ============================================================

export interface DiscRecommendation {
  area: string;
  practice: string;
  description: string;
  frequency: string;
}

export function getDiscRecommendations(
  primary: string,
  secondary: string,
  dimensionScores: { dimension: string; percentage: number }[]
): DiscRecommendation[] {
  const recommendations: DiscRecommendation[] = [];

  // Find weakest dimensions
  const sorted = [...dimensionScores].sort(
    (a, b) => a.percentage - b.percentage
  );
  const weakest = sorted.slice(0, 2);

  weakest.forEach((dim) => {
    const info = DISC_DIMENSIONS[dim.dimension];
    if (!info) return;

    switch (dim.dimension) {
      case "D":
        recommendations.push(
          {
            area: "Assertividade",
            practice: "Exercício de posicionamento",
            description:
              "Pratique expressar sua opinião de forma clara e direta em reuniões. Comece com situações de baixo risco e vá aumentando gradualmente.",
            frequency: "3x por semana",
          },
          {
            area: "Tomada de decisão",
            practice: "Decisões cronometradas",
            description:
              "Estabeleça um limite de tempo para tomar decisões do dia a dia. Isso ajuda a desenvolver confiança na sua capacidade de decidir rapidamente.",
            frequency: "Diariamente",
          }
        );
        break;
      case "I":
        recommendations.push(
          {
            area: "Comunicação social",
            practice: "Networking intencional",
            description:
              "Reserve tempo para interagir com pessoas novas. Inicie conversas, participe de eventos e pratique a escuta ativa com genuíno interesse.",
            frequency: "2x por semana",
          },
          {
            area: "Expressão emocional",
            practice: "Diário de gratidão compartilhado",
            description:
              "Compartilhe algo positivo com alguém todos os dias. Pode ser um elogio, um agradecimento ou uma observação positiva.",
            frequency: "Diariamente",
          }
        );
        break;
      case "S":
        recommendations.push(
          {
            area: "Adaptabilidade",
            practice: "Micro-mudanças diárias",
            description:
              "Introduza pequenas mudanças na sua rotina diária. Mude o caminho para o trabalho, experimente um restaurante novo, tente uma abordagem diferente para uma tarefa.",
            frequency: "Diariamente",
          },
          {
            area: "Paciência ativa",
            practice: "Escuta profunda",
            description:
              "Em conversas importantes, pratique ouvir sem interromper por pelo menos 2 minutos. Depois, resuma o que ouviu antes de responder.",
            frequency: "3x por semana",
          }
        );
        break;
      case "C":
        recommendations.push(
          {
            area: "Pensamento analítico",
            practice: "Análise estruturada",
            description:
              "Antes de tomar decisões importantes, liste prós e contras de forma estruturada. Busque dados e evidências para fundamentar suas escolhas.",
            frequency: "Semanalmente",
          },
          {
            area: "Organização",
            practice: "Revisão de processos",
            description:
              "Reserve tempo para organizar e otimizar seus processos de trabalho. Documente procedimentos e crie checklists para tarefas recorrentes.",
            frequency: "Semanalmente",
          }
        );
        break;
    }
  });

  // Add profile-specific recommendations
  recommendations.push({
    area: "Autoconhecimento",
    practice: "Reflexão DISC semanal",
    description: `Reserve 15 minutos por semana para refletir sobre situações onde suas características de ${DISC_DIMENSIONS[primary]?.name || primary} se manifestaram. Identifique momentos de força e momentos de desafio.`,
    frequency: "Semanalmente",
  });

  return recommendations;
}

// ============================================================
// Action Plan
// ============================================================

export interface DiscWeeklyPlan {
  week: number;
  theme: string;
  activities: string[];
  goal: string;
}

export function getDiscActionPlan(
  primary: string,
  secondary: string
): DiscWeeklyPlan[] {
  const p = DISC_DIMENSIONS[primary];
  const s = DISC_DIMENSIONS[secondary];

  return [
    {
      week: 1,
      theme: "Autoconhecimento",
      activities: [
        `Releia seu relatório DISC e identifique 3 situações recentes onde seu perfil ${p?.name || primary} se manifestou`,
        "Peça feedback a 2 pessoas próximas sobre como elas percebem seu estilo comportamental",
        "Anote em um diário seus padrões de reação em situações de pressão",
        "Identifique seus 3 principais gatilhos de estresse",
      ],
      goal: "Ter clareza sobre seu perfil comportamental e como ele impacta suas interações",
    },
    {
      week: 2,
      theme: "Fortalecendo suas qualidades",
      activities: [
        `Aplique conscientemente suas forças de ${p?.name || primary} em uma situação profissional`,
        `Pratique uma habilidade ligada à ${s?.name || secondary} que complementa seu perfil`,
        "Busque uma oportunidade de usar seu estilo natural para ajudar alguém",
        "Registre os resultados positivos das suas interações",
      ],
      goal: "Potencializar suas forças naturais de forma consciente e intencional",
    },
    {
      week: 3,
      theme: "Desenvolvendo áreas de crescimento",
      activities: [
        `Identifique uma situação onde seu perfil ${p?.name || primary} pode criar desafios`,
        "Pratique um comportamento fora da sua zona de conforto",
        "Peça feedback sobre como você está se comunicando",
        "Experimente uma abordagem diferente em uma situação recorrente",
      ],
      goal: "Expandir seu repertório comportamental além do seu estilo natural",
    },
    {
      week: 4,
      theme: "Integração e próximos passos",
      activities: [
        "Revise seu diário das últimas 3 semanas e identifique padrões",
        "Defina 3 metas de desenvolvimento comportamental para os próximos 3 meses",
        "Compartilhe seu perfil DISC com sua equipe ou pessoas próximas",
        "Agende uma conversa com seu facilitador para discutir seu progresso",
      ],
      goal: "Consolidar os aprendizados e criar um plano de desenvolvimento contínuo",
    },
  ];
}
