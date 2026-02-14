import { DimensionScore } from "@/lib/diagnostic-scoring";

export interface WeekPlan {
  week: number;
  title: string;
  objective: string;
  practices: { time: string; activity: string }[];
  weeklyGoal: string;
}

export interface ActionPlan {
  focusDimensions: string[];
  weeks: WeekPlan[];
}

const DIMENSION_PLANS: Record<string, WeekPlan[]> = {
  "Consciência Interior": [
    {
      week: 1, title: "Fundamentos da Presença",
      objective: "Estabelecer o hábito de pausa consciente e auto-observação básica",
      practices: [
        { time: "Manhã", activity: "5 minutos de respiração consciente ao acordar — sente-se confortavelmente, feche os olhos e observe a respiração natural sem tentar mudá-la" },
        { time: "Tarde", activity: "3 pausas de 1 minuto para auto-observação — pare o que está fazendo, pergunte-se 'o que estou sentindo agora?' e 'onde está minha atenção?'" },
        { time: "Noite", activity: "Registro escrito de 3 padrões que notou em si mesmo durante o dia (pensamentos recorrentes, reações automáticas, tensões corporais)" },
      ],
      weeklyGoal: "Completar o registro noturno por pelo menos 5 dos 7 dias"
    },
    {
      week: 2, title: "Aprofundamento Sensorial",
      objective: "Expandir a percepção consciente para o corpo e os sentidos",
      practices: [
        { time: "Manhã", activity: "10 minutos de escaneamento corporal — percorra mentalmente cada região do corpo, da cabeça aos pés, notando sensações sem julgamento" },
        { time: "Tarde", activity: "Pratique 'mindful eating' em uma refeição — coma sem telas, percebendo sabores, texturas, temperatura e sensações de fome/saciedade" },
        { time: "Noite", activity: "Registre: qual emoção predominou hoje? Onde a senti no corpo? O que a provocou? Como reagi?" },
      ],
      weeklyGoal: "Identificar pelo menos 3 gatilhos de 'piloto automático' e criar estratégias para interrompê-los"
    },
    {
      week: 3, title: "Reconhecimento de Padrões",
      objective: "Identificar padrões recorrentes de pensamento e comportamento",
      practices: [
        { time: "Manhã", activity: "10 minutos de meditação com foco nos pensamentos — observe-os como nuvens passando, sem se apegar ou rejeitar nenhum" },
        { time: "Tarde", activity: "Antes de reagir a qualquer situação estressante, pratique 3 respirações conscientes — crie o espaço entre estímulo e resposta" },
        { time: "Noite", activity: "Revise seu diário da semana: quais padrões se repetem? Quais pensamentos são recorrentes? Quais situações geram as mesmas reações?" },
      ],
      weeklyGoal: "Documentar pelo menos 2 padrões automáticos recorrentes e uma alternativa consciente para cada"
    },
    {
      week: 4, title: "Consolidação e Integração",
      objective: "Integrar a consciência interior nas atividades cotidianas",
      practices: [
        { time: "Manhã", activity: "15 minutos de prática contemplativa — meditação, escaneamento corporal ou consciência aberta (escolha a que mais ressoou nas semanas anteriores)" },
        { time: "Tarde", activity: "Escolha 3 atividades rotineiras como 'gatilhos de presença' (lavar mãos, abrir portas, beber água) — use-as como lembretes para voltar ao presente" },
        { time: "Noite", activity: "Reflexão semanal: compare seu nível de auto-observação do início da semana 1 com o momento atual. O que mudou? O que quer manter?" },
      ],
      weeklyGoal: "Definir sua rotina sustentável de prática de consciência interior para as próximas semanas"
    },
  ],
  "Coerência Emocional": [
    {
      week: 1, title: "Vocabulário Emocional",
      objective: "Desenvolver a capacidade de nomear emoções com precisão",
      practices: [
        { time: "Manhã", activity: "Check-in emocional matinal: identifique e nomeie com precisão o que está sentindo (ex: não 'estou bem', mas 'estou sereno e levemente ansioso sobre a reunião')" },
        { time: "Tarde", activity: "3 vezes ao dia, registre a emoção que está sentindo, sua intensidade (1-10) e o que a provocou — use um aplicativo de notas ou um caderno" },
        { time: "Noite", activity: "Revise os registros do dia: consegue identificar conexões entre situações e emoções? Há emoções que se repetem?" },
      ],
      weeklyGoal: "Expandir seu vocabulário emocional: usar pelo menos 10 palavras diferentes para nomear emoções ao longo da semana"
    },
    {
      week: 2, title: "Técnicas de Regulação",
      objective: "Aprender e praticar técnicas concretas de regulação emocional",
      practices: [
        { time: "Manhã", activity: "Pratique a técnica de respiração 4-7-8 por 4 ciclos: inspire por 4s, segure por 7s, expire por 8s — mesmo sem estar estressado, para criar memória muscular" },
        { time: "Tarde", activity: "Quando notar ativação emocional, pratique a 'reavaliação cognitiva': pergunte 'existe outra forma de interpretar esta situação?' — escreva 2-3 interpretações alternativas" },
        { time: "Noite", activity: "Identifique o momento de maior intensidade emocional do dia: o que a provocou? Como reagiu? O que faria diferente?" },
      ],
      weeklyGoal: "Usar a técnica de respiração 4-7-8 em pelo menos 3 situações reais de ativação emocional"
    },
    {
      week: 3, title: "Mapa de Gatilhos",
      objective: "Criar consciência antecipada dos gatilhos emocionais",
      practices: [
        { time: "Manhã", activity: "Antecipe: olhe para o dia que vem e identifique 1-2 situações que podem gerar ativação emocional — planeje como quer responder" },
        { time: "Tarde", activity: "Pratique a comunicação não-violenta em uma interação: observe sem avaliar, identifique o sentimento, conecte com a necessidade, faça um pedido" },
        { time: "Noite", activity: "Atualize seu 'mapa de gatilhos': quais situações, pessoas ou contextos ativam reações intensas? Qual padrão emerge?" },
      ],
      weeklyGoal: "Completar seu mapa de 5 gatilhos principais com estratégias de resposta para cada um"
    },
    {
      week: 4, title: "Expressão Autêntica",
      objective: "Integrar regulação com expressão emocional genuína",
      practices: [
        { time: "Manhã", activity: "Defina uma intenção emocional para o dia: 'Hoje quero comunicar minhas necessidades com clareza' ou 'Hoje quero acolher emoções difíceis sem reprimi-las'" },
        { time: "Tarde", activity: "Expresse uma emoção genuína a alguém de confiança usando o modelo: 'Quando [situação], eu me sinto [emoção] porque preciso de [necessidade]'" },
        { time: "Noite", activity: "Avaliação final: compare sua relação com as emoções no início do mês com agora. Quais mudanças percebe? O que quer consolidar?" },
      ],
      weeklyGoal: "Definir suas 3 práticas principais de regulação emocional para continuar nas próximas semanas"
    },
  ],
  "Conexão e Propósito": [
    {
      week: 1, title: "Mapeamento de Valores",
      objective: "Identificar seus valores autênticos vs. valores herdados",
      practices: [
        { time: "Manhã", activity: "Reflexão guiada (15 min): escreva sobre 3 momentos da sua vida em que se sentiu plenamente vivo e realizado — o que eles têm em comum?" },
        { time: "Tarde", activity: "Observe suas escolhas do dia: quais decisões refletem seus valores? Quais parecem automáticas ou impostas por expectativas externas?" },
        { time: "Noite", activity: "Liste 10 coisas que são importantes para você — sem censurar. Amanhã, revisitaremos esta lista para distinguir valores genuínos de valores introjetados" },
      ],
      weeklyGoal: "Definir seus 5 valores essenciais usando o exercício de eliminação progressiva"
    },
    {
      week: 2, title: "Auditoria de Alinhamento",
      objective: "Avaliar o grau de coerência entre valores e vida cotidiana",
      practices: [
        { time: "Manhã", activity: "Registre como planeja investir seu tempo hoje — que atividades são prioritárias? Quais valores elas servem?" },
        { time: "Tarde", activity: "Identifique uma atividade do dia que parece desconectada dos seus valores — existe uma forma de ressignificá-la ou substituí-la?" },
        { time: "Noite", activity: "Compare a distribuição do seu tempo semanal com seus 5 valores: onde há coerência? Onde há discrepância? O que pode ser ajustado?" },
      ],
      weeklyGoal: "Identificar 3 áreas de desalinhamento e definir um ajuste concreto para cada uma"
    },
    {
      week: 3, title: "Propósito em Ação",
      objective: "Conectar ações cotidianas a um significado maior",
      practices: [
        { time: "Manhã", activity: "Escreva a resposta para: 'Que contribuição quero dar ao mundo através do meu trabalho, relacionamentos e presença?'" },
        { time: "Tarde", activity: "Reserve 30 minutos para uma atividade que nutra seu senso de propósito — pode ser voluntariado, mentoria, criação ou aprendizado" },
        { time: "Noite", activity: "Gratidão contextualizada: registre 3 momentos do dia em que se sentiu conectado a algo significativo e identifique o valor presente" },
      ],
      weeklyGoal: "Escrever um rascunho da sua 'declaração de propósito pessoal' em 2-3 frases"
    },
    {
      week: 4, title: "Integração e Sustentabilidade",
      objective: "Criar estruturas que sustentem o alinhamento no longo prazo",
      practices: [
        { time: "Manhã", activity: "Revise sua declaração de propósito: ela ainda ressoa? Ajuste-a se necessário — o propósito é vivo e evolui com você" },
        { time: "Tarde", activity: "Planeje as próximas 4 semanas com seus valores como critério de priorização — o que entra, o que sai, o que muda?" },
        { time: "Noite", activity: "Reflexão final: 'O que aprendi sobre mim mesmo neste mês? Como minha relação com propósito e valores mudou?'" },
      ],
      weeklyGoal: "Criar um ritual semanal de revisão de alinhamento que funcione na sua rotina"
    },
  ],
  "Relações e Compaixão": [
    {
      week: 1, title: "Autocompaixão Fundacional",
      objective: "Desenvolver uma relação mais gentil consigo mesmo",
      practices: [
        { time: "Manhã", activity: "Exercício de autocompaixão: coloque a mão no peito e diga internamente 'que eu possa ser gentil comigo hoje, especialmente nos momentos difíceis'" },
        { time: "Tarde", activity: "Quando notar autocrítica, pratique os 3 passos: (1) 'Isso é sofrimento', (2) 'Outros também passam por isso', (3) 'Que eu me trate com gentileza'" },
        { time: "Noite", activity: "Escreva uma carta de compaixão para si mesmo sobre algo que o incomodou hoje — como um amigo querido escreveria para você?" },
      ],
      weeklyGoal: "Identificar seu padrão de autocrítica e conseguir interrompê-lo pelo menos 3 vezes durante a semana"
    },
    {
      week: 2, title: "Escuta Profunda",
      objective: "Aprimorar a capacidade de ouvir com presença e empatia",
      practices: [
        { time: "Manhã", activity: "Defina a intenção: 'Hoje vou praticar a escuta profunda — ouvir para compreender, não para responder'" },
        { time: "Tarde", activity: "Em pelo menos uma conversa importante, pratique: mantenha contato visual, não interrompa, reflita o que ouviu antes de responder" },
        { time: "Noite", activity: "Reflexão: em quais conversas consegui ouvir de verdade? Em quais estava formulando respostas mentalmente enquanto o outro falava?" },
      ],
      weeklyGoal: "Ter pelo menos 3 conversas onde praticou escuta profunda genuína e notou a diferença"
    },
    {
      week: 3, title: "Empatia Expandida",
      objective: "Ampliar a capacidade empática para além do círculo próximo",
      practices: [
        { time: "Manhã", activity: "10 minutos de meditação de bondade amorosa (Metta): envie votos de bem-estar para si, para alguém querido, para alguém neutro e para alguém difícil" },
        { time: "Tarde", activity: "Exercício de troca de perspectiva: escolha um conflito ou mal-entendido recente e escreva a situação do ponto de vista da outra pessoa" },
        { time: "Noite", activity: "Expresse gratidão genuína e específica a alguém — não um 'obrigado' genérico, mas uma mensagem sobre o impacto concreto que essa pessoa tem na sua vida" },
      ],
      weeklyGoal: "Enviar 3 mensagens de gratidão genuína e praticar Metta pelo menos 4 vezes"
    },
    {
      week: 4, title: "Vulnerabilidade e Limites",
      objective: "Equilibrar abertura emocional com limites saudáveis",
      practices: [
        { time: "Manhã", activity: "Reflexão: em quais relacionamentos me permito ser vulnerável? Em quais mantenho uma fachada? O que me impede de me abrir?" },
        { time: "Tarde", activity: "Pratique estabelecer um limite saudável com gentileza: diga 'não' a algo que não está alinhado, sem culpa e sem agressividade" },
        { time: "Noite", activity: "Avaliação do mês: como mudou sua relação consigo mesmo e com os outros? Que práticas quer manter?" },
      ],
      weeklyGoal: "Definir suas práticas sustentáveis de autocompaixão e conexão para as próximas semanas"
    },
  ],
  "Transformação": [
    {
      week: 1, title: "Mentalidade de Crescimento",
      objective: "Reconhecer e começar a transformar crenças limitantes",
      practices: [
        { time: "Manhã", activity: "Identifique uma crença limitante sobre si mesmo ('não sou bom em X', 'sou velho demais para Y') e anote 3 evidências que a contradizem" },
        { time: "Tarde", activity: "Quando pensar 'não consigo', adicione 'ainda': 'não consigo AINDA' — observe como essa palavra muda a perspectiva" },
        { time: "Noite", activity: "Diário de aprendizado: registre um erro ou dificuldade do dia e o que aprendeu com ele — transforme narrativa de 'fracasso' em 'dado'" },
      ],
      weeklyGoal: "Identificar suas 3 crenças limitantes mais ativas e criar contra-evidências para cada uma"
    },
    {
      week: 2, title: "Zona de Expansão",
      objective: "Praticar a saída gradual da zona de conforto",
      practices: [
        { time: "Manhã", activity: "Escolha um 'micro-desafio' para o dia: algo pequeno mas fora da zona de conforto (iniciar uma conversa, experimentar uma atividade nova, pedir ajuda)" },
        { time: "Tarde", activity: "Observe sua reação ao desconforto: em vez de fugir, fique com ele por 2 minutos, respirando — note que o desconforto é temporário e gerenciável" },
        { time: "Noite", activity: "Celebre: registre o micro-desafio do dia e o que ele ensinou sobre você — celebre o esforço, não o resultado" },
      ],
      weeklyGoal: "Completar 5 micro-desafios em 7 dias e registrar os aprendizados de cada um"
    },
    {
      week: 3, title: "Feedback como Nutriente",
      objective: "Transformar a relação com feedback e crítica construtiva",
      practices: [
        { time: "Manhã", activity: "Peça feedback a alguém de confiança: 'Na sua percepção, qual é minha maior força e minha maior área de desenvolvimento?' — ouça sem defender" },
        { time: "Tarde", activity: "Pratique a 'mentalidade de aprendiz': em uma situação onde se sente competente, pergunte-se 'o que ainda posso aprender aqui?'" },
        { time: "Noite", activity: "Integre o feedback recebido: o que ressoou? O que surpreendeu? Que ação concreta pode tomar a partir dele?" },
      ],
      weeklyGoal: "Solicitar e integrar feedback de pelo menos 2 pessoas diferentes"
    },
    {
      week: 4, title: "Plano de Crescimento Contínuo",
      objective: "Criar estrutura sustentável para o desenvolvimento contínuo",
      practices: [
        { time: "Manhã", activity: "Reflexão: 'Qual versão de mim quero construir nos próximos 6 meses? Que habilidades, hábitos e mentalidades preciso desenvolver?'" },
        { time: "Tarde", activity: "Defina 3 metas de crescimento para os próximos 3 meses — formule como metas de processo ('praticar X por Y minutos') em vez de resultado" },
        { time: "Noite", activity: "Avaliação do mês: compare sua mentalidade do início com agora. O que mudou? O que quer consolidar? Celebre cada progresso" },
      ],
      weeklyGoal: "Criar seu plano de crescimento contínuo para os próximos 3 meses com práticas sustentáveis"
    },
  ],
};

export function generateActionPlan(dimensionScores: DimensionScore[]): ActionPlan {
  const sorted = [...dimensionScores].sort((a, b) => a.score - b.score);
  const focusDimensions = sorted.slice(0, 2).map(d => d.dimension);

  // Interleave weeks from both dimensions
  const plans1 = DIMENSION_PLANS[focusDimensions[0]] || [];
  const plans2 = DIMENSION_PLANS[focusDimensions[1]] || [];

  const weeks: WeekPlan[] = [];
  for (let i = 0; i < 4; i++) {
    const primary = i % 2 === 0 ? plans1[i] : plans2[i];
    if (primary) {
      weeks.push({
        ...primary,
        title: `${focusDimensions[i % 2 === 0 ? 0 : 1]} — ${primary.title}`,
      });
    }
  }

  return { focusDimensions, weeks };
}
