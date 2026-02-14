export interface DimensionDescription {
  about: string;
  lowInterpretation: string;
  midInterpretation: string;
  highInterpretation: string;
  whyItMatters: string;
}

export const DIMENSION_DESCRIPTIONS: Record<string, DimensionDescription> = {
  "Consciência Interior": {
    about: "Esta dimensão avalia sua capacidade de pausar e observar seus próprios pensamentos, emoções e reações sem julgamento. Inclui práticas de atenção plena, auto-observação e reconhecimento de padrões automáticos de comportamento.",
    lowInterpretation: "Você pode estar operando no \"piloto automático\" com frequência, reagindo a situações sem perceber seus padrões internos. É um convite para desenvolver momentos de pausa e auto-observação no seu dia a dia.",
    midInterpretation: "Você já demonstra capacidade de auto-observação em alguns momentos, mas pode aprofundar essa prática para que se torne mais consistente e natural no seu cotidiano.",
    highInterpretation: "Você tem uma forte capacidade de se observar internamente, reconhecendo pensamentos e emoções com clareza. Isso é uma base sólida para seu desenvolvimento pessoal e profissional.",
    whyItMatters: "A consciência interior é o alicerce de todo desenvolvimento pessoal. Sem perceber nossos padrões, não conseguimos transformá-los."
  },
  "Coerência Emocional": {
    about: "Esta dimensão mede sua habilidade de nomear, regular e expressar emoções de forma equilibrada e construtiva. Envolve reconhecer o que sente, entender a origem dessas emoções e escolher como responder a elas.",
    lowInterpretation: "Pode haver dificuldade em identificar ou expressar o que sente, ou uma tendência a reagir impulsivamente. Desenvolver vocabulário emocional e técnicas de regulação pode trazer mais equilíbrio.",
    midInterpretation: "Você consegue lidar com suas emoções em muitas situações, mas momentos de maior pressão ainda podem gerar reações automáticas. Há espaço para fortalecer sua regulação emocional.",
    highInterpretation: "Você demonstra maturidade emocional significativa, conseguindo nomear e regular suas emoções mesmo em situações desafiadoras. Isso contribui para relacionamentos mais saudáveis.",
    whyItMatters: "A coerência emocional permite tomar decisões mais conscientes e construir relacionamentos baseados em autenticidade e equilíbrio."
  },
  "Conexão e Propósito": {
    about: "Esta dimensão avalia o quanto suas ações estão alinhadas com seus valores e o quanto você sente clareza sobre seu senso de direção e significado na vida. Inclui a conexão com algo maior que si mesmo.",
    lowInterpretation: "Pode haver um sentimento de desconexão entre o que você faz e o que realmente importa para você. Refletir sobre seus valores essenciais pode ajudar a encontrar mais sentido nas suas atividades.",
    midInterpretation: "Você tem alguma clareza sobre seus valores e propósito, mas pode haver áreas da vida em que sente falta de alinhamento. Aprofundar essa reflexão pode trazer mais coerência.",
    highInterpretation: "Você demonstra forte alinhamento entre valores, ações e propósito. Essa clareza é um recurso poderoso para enfrentar desafios e tomar decisões significativas.",
    whyItMatters: "Quando vivemos conectados ao nosso propósito, encontramos mais resiliência, motivação e satisfação, mesmo diante de adversidades."
  },
  "Relações e Compaixão": {
    about: "Esta dimensão avalia sua capacidade de empatia, conexão genuína, perdão e autocompaixão nos relacionamentos. Inclui a habilidade de se colocar no lugar do outro e de tratar a si mesmo com gentileza.",
    lowInterpretation: "Pode haver desafios em se conectar genuinamente com outros ou em praticar autocompaixão. Isso pode se manifestar como julgamento excessivo, dificuldade de perdoar ou isolamento emocional.",
    midInterpretation: "Você tem boa capacidade de conexão em muitos contextos, mas pode haver situações em que a empatia ou a autocompaixão ficam em segundo plano. Há espaço para expandir essa habilidade.",
    highInterpretation: "Você demonstra forte capacidade empática e compassiva, tanto com os outros quanto consigo mesmo. Isso fortalece seus vínculos e contribui para um ambiente mais acolhedor ao seu redor.",
    whyItMatters: "Relações saudáveis e compaixão são pilares do bem-estar emocional e da capacidade de liderar e influenciar positivamente."
  },
  "Transformação": {
    about: "Esta dimensão mede sua abertura para mudança, aprendizado contínuo e crescimento pessoal. Avalia o quanto você abraça desafios como oportunidades e mantém uma mentalidade de evolução constante.",
    lowInterpretation: "Pode haver resistência à mudança ou uma tendência a permanecer na zona de conforto. Desenvolver uma mentalidade de crescimento pode abrir novas possibilidades de evolução.",
    midInterpretation: "Você demonstra disposição para crescer em algumas áreas, mas pode haver aspectos da vida em que a mudança parece mais difícil. Continuar se desafiando gradualmente pode fortalecer essa dimensão.",
    highInterpretation: "Você tem uma mentalidade de crescimento bem desenvolvida, abraçando desafios e aprendizados com naturalidade. Essa abertura é um diferencial valioso para sua evolução contínua.",
    whyItMatters: "A capacidade de se transformar continuamente é essencial em um mundo em constante mudança, permitindo adaptação e evolução pessoal e profissional."
  }
};

export function getInterpretation(dimension: string, score: number): string {
  const desc = DIMENSION_DESCRIPTIONS[dimension];
  if (!desc) return "";
  if (score < 2.5) return desc.lowInterpretation;
  if (score < 3.5) return desc.midInterpretation;
  return desc.highInterpretation;
}

export function getDimensionAbout(dimension: string): string {
  return DIMENSION_DESCRIPTIONS[dimension]?.about || "";
}

export function getDimensionWhyItMatters(dimension: string): string {
  return DIMENSION_DESCRIPTIONS[dimension]?.whyItMatters || "";
}

export const DIAGNOSTIC_INTRO = "O Diagnóstico IQ+IS é uma ferramenta de autoconhecimento que avalia cinco dimensões fundamentais da inteligência emocional e espiritual. Ele oferece um mapa do seu momento atual, identificando pontos fortes e áreas de desenvolvimento para orientar sua jornada de crescimento pessoal e profissional.";

export function getOverallScoreMessage(score: number): string {
  if (score >= 4) return "Seu resultado indica um alto nível de desenvolvimento nas dimensões avaliadas. Você demonstra consistência em práticas de autoconhecimento, regulação emocional e conexão com propósito. Continue cultivando essas habilidades e inspire outros ao seu redor.";
  if (score >= 3) return "Seu resultado mostra um bom nível de desenvolvimento, com bases sólidas em várias dimensões. Há oportunidades claras de crescimento que, se exploradas, podem elevar significativamente sua inteligência emocional e espiritual.";
  if (score >= 2) return "Seu resultado indica um estágio moderado de desenvolvimento. Este diagnóstico é um ponto de partida valioso — ele revela áreas específicas onde pequenas mudanças de hábito podem gerar grandes transformações.";
  return "Seu resultado mostra que você está no início de uma jornada importante de autoconhecimento. Cada dimensão avaliada representa uma oportunidade de crescimento. O primeiro passo já foi dado ao realizar este diagnóstico.";
}
