export interface Recommendation {
  title: string;
  description: string;
  practices: string[];
  resources: string[];
  expectedBenefits: string;
}

export const RECOMMENDATIONS: Record<string, Recommendation> = {
  "Consciência Interior": {
    title: "Desenvolva sua Consciência Interior",
    description: "Fortaleça sua capacidade de auto-observação e presença no momento atual. A consciência interior é treinável como um músculo — cada prática de atenção plena fortalece as redes neurais associadas à metacognição e à regulação atencional, criando gradualmente uma capacidade mais estável de presença e auto-observação.",
    practices: [
      "Pratique 10 minutos de meditação mindfulness diariamente, começando com foco na respiração e expandindo gradualmente para a consciência aberta",
      "Faça 3 'pausas conscientes' de 60 segundos durante o dia: pare, respire, observe o que está sentindo e pensando, e retome a atividade",
      "Mantenha um diário reflexivo noturno: registre 3 padrões que notou em si mesmo durante o dia (pensamentos recorrentes, reações automáticas, tensões corporais)",
      "Experimente o escaneamento corporal de 15 minutos antes de dormir — percorra mentalmente cada parte do corpo, notando sensações sem tentar mudá-las",
      "Pratique 'mindful eating' em pelo menos uma refeição por dia: coma sem telas, percebendo sabores, texturas e sensações de fome/saciedade",
      "Estabeleça 'gatilhos de presença' — escolha atividades rotineiras (lavar as mãos, abrir uma porta) como lembretes para voltar ao momento presente"
    ],
    resources: [
      "Livro: 'Atenção Plena' — Mark Williams e Danny Penman",
      "Livro: 'Aonde Quer que Você Vá, É Você que Está Lá' — Jon Kabat-Zinn",
      "Técnica: MBSR (Mindfulness-Based Stress Reduction) — programa de 8 semanas",
      "Conceito: 'Mindsight' de Daniel Siegel — a capacidade de ver a própria mente"
    ],
    expectedBenefits: "Em 4-8 semanas de prática consistente, é esperado: maior capacidade de notar pensamentos e emoções antes de reagir, redução perceptível nos níveis de estresse, melhoria na qualidade do sono e maior sensação de presença e conexão com a vida cotidiana."
  },
  "Coerência Emocional": {
    title: "Desenvolva sua Coerência Emocional",
    description: "Aprimore sua capacidade de reconhecer, nomear e regular suas emoções de forma equilibrada. A literacia emocional — saber identificar com precisão o que está sentindo — é o primeiro passo para a regulação. Pesquisas de Marc Brackett mostram que pessoas com maior vocabulário emocional regulam melhor seus estados internos, tomam melhores decisões e constroem relacionamentos mais saudáveis.",
    practices: [
      "Pratique nomear suas emoções com granularidade: em vez de 'estou mal', tente identificar se é frustração, tristeza, decepção, ansiedade ou ressentimento — a precisão na nomeação inicia o processo de regulação",
      "Use a técnica de respiração 4-7-8 em momentos de ativação emocional: inspire por 4 segundos, segure por 7, expire por 8 — repita 3 ciclos",
      "Crie um 'mapa de gatilhos': identifique 5 situações que regularmente ativam reações emocionais intensas e planeje respostas alternativas para cada uma",
      "Pratique a comunicação não-violenta (CNV) de Marshall Rosenberg: observe sem avaliar, identifique o sentimento, conecte com a necessidade, faça um pedido claro",
      "Mantenha um diário emocional: 3 vezes ao dia, registre o que está sentindo, a intensidade (1-10), o que provocou e como reagiu",
      "Pratique a 'reavaliação cognitiva': quando uma situação gerar emoção intensa, pergunte-se 'existe outra forma de interpretar essa situação?' — isso ativa o córtex pré-frontal e reduz a resposta amigdalar"
    ],
    resources: [
      "Livro: 'Permission to Feel' — Marc Brackett (Yale Center for Emotional Intelligence)",
      "Livro: 'Comunicação Não-Violenta' — Marshall Rosenberg",
      "Técnica: Método RULER — Recognizing, Understanding, Labeling, Expressing, Regulating",
      "Conceito: 'Janela de Tolerância' de Dan Siegel — a faixa de ativação na qual funcionamos bem"
    ],
    expectedBenefits: "Em 4-8 semanas de prática consistente, é esperado: maior capacidade de nomear emoções com precisão, redução significativa de reações impulsivas, melhoria na comunicação interpessoal e maior sensação de equilíbrio emocional mesmo em situações desafiadoras."
  },
  "Conexão e Propósito": {
    title: "Fortaleça sua Conexão e Propósito",
    description: "Aprofunde o alinhamento entre seus valores autênticos e suas ações cotidianas. O propósito não é um destino fixo a ser descoberto — é uma bússola interna que pode ser calibrada e fortalecida através de reflexão intencional e ação alinhada. Viktor Frankl demonstrou que o sentido pode ser encontrado em qualquer circunstância, e a pesquisa contemporânea confirma que ele pode ser cultivado deliberadamente.",
    practices: [
      "Escreva uma 'carta do eu futuro': imagine-se daqui a 5 anos vivendo sua melhor versão e descreva em detalhes como é um dia típico — que valores estão presentes? Que impacto você gera?",
      "Identifique seus 5 valores essenciais usando o exercício de eliminação: comece com 20 valores, elimine até restar 5 que são genuinamente seus (não herdados ou impostos)",
      "Faça uma 'auditoria de alinhamento' semanal: compare como gastou seu tempo na semana com seus 5 valores essenciais — onde há coerência? Onde há discrepância?",
      "Pratique a gratidão contextualizada: toda noite, escreva 3 momentos do dia em que se sentiu conectado a algo significativo, e identifique o valor subjacente a cada um",
      "Reserve 2 horas semanais para uma atividade que nutra seu senso de propósito — pode ser voluntariado, mentoria, criação artística, estudo ou qualquer atividade que gere significado",
      "Explore a prática Ikigai: mapeie a interseção entre o que você ama, o que faz bem, o que o mundo precisa e pelo que pode ser remunerado"
    ],
    resources: [
      "Livro: 'Em Busca de Sentido' — Viktor Frankl",
      "Livro: 'Comece pelo Porquê' — Simon Sinek",
      "Técnica: Exercício de 'Valores em Ação' (VIA Character Strengths) — questionário gratuito",
      "Conceito: Ikigai — a razão de ser japonesa que integra paixão, missão, vocação e profissão"
    ],
    expectedBenefits: "Em 4-8 semanas de prática consistente, é esperado: maior clareza sobre o que genuinamente importa para você, decisões mais firmes e menos ambivalentes, aumento da motivação intrínseca e sensação crescente de que suas atividades diárias contribuem para algo significativo."
  },
  "Relações e Compaixão": {
    title: "Cultive Relações e Compaixão",
    description: "Desenvolva a capacidade de empatia genuína, conexão profunda e autocompaixão. A ciência demonstra que a compaixão não é apenas um sentimento — é uma habilidade treinável que ativa circuitos de recompensa no cérebro e gera resiliência emocional, ao contrário da empatia pura que pode levar ao esgotamento. Kristin Neff mostra que a autocompaixão não é autoindulgência, mas uma forma mais eficaz de motivação que a autocrítica.",
    practices: [
      "Pratique a escuta ativa profunda: em conversas importantes, dedique-se inteiramente a compreender a perspectiva do outro antes de formular sua resposta — ouça para entender, não para responder",
      "Quando cometer um erro ou fracassar, pratique o exercício de autocompaixão de 3 passos: (1) reconheça o sofrimento, (2) lembre que errar é humano, (3) ofereça a si mesmo as palavras que diria a um amigo querido",
      "Expresse gratidão genuína e específica a uma pessoa importante toda semana — não um 'obrigado' genérico, mas uma mensagem detalhada sobre o impacto que ela tem na sua vida",
      "Pratique a meditação de bondade amorosa (Metta) por 10 minutos, 3 vezes por semana: envie mentalmente votos de bem-estar para si mesmo, para pessoas queridas, para pessoas neutras e para pessoas difíceis",
      "Experimente o exercício de 'troca de perspectiva': diante de um conflito, escreva a situação do ponto de vista da outra pessoa, tentando genuinamente compreender suas motivações e sentimentos",
      "Identifique um relacionamento que precisa de reparação e dê um pequeno passo esta semana — uma mensagem, um pedido de desculpas, um gesto de reconciliação"
    ],
    resources: [
      "Livro: 'Autocompaixão' — Kristin Neff",
      "Livro: 'A Coragem de Ser Imperfeito' — Brené Brown",
      "Técnica: Meditação de Bondade Amorosa (Metta Bhavana) — prática contemplativa budista adaptada",
      "Conceito: 'Compaixão vs. Empatia' — Tania Singer (Max Planck) — treinar compaixão gera resiliência, enquanto empatia pura pode gerar esgotamento"
    ],
    expectedBenefits: "Em 4-8 semanas de prática consistente, é esperado: redução significativa da autocrítica destrutiva, maior facilidade em se abrir e ser vulnerável em relacionamentos seguros, melhoria perceptível na qualidade das conexões interpessoais e maior sensação de pertencimento e conexão."
  },
  "Transformação": {
    title: "Abrace a Transformação",
    description: "Desenvolva flexibilidade, coragem para mudança e uma mentalidade de crescimento genuína. A transformação pessoal não acontece em saltos dramáticos — ela se constrói em pequenas escolhas diárias de sair da zona de conforto, encarar erros como aprendizado e manter a persistência diante de obstáculos. Carol Dweck demonstra que a forma como interpretamos desafios e fracassos determina fundamentalmente nossa trajetória de crescimento.",
    practices: [
      "Desafie-se semanalmente com algo fora da zona de conforto: uma conversa difícil, uma habilidade nova, uma atividade desconhecida — o objetivo não é o resultado, mas o exercício de enfrentar o desconforto",
      "Mantenha um 'diário de aprendizados': toda semana, registre 3 erros ou dificuldades e o que aprendeu com cada um — transforme a narrativa de 'fracasso' para 'dado de aprendizado'",
      "Busque feedback construtivo ativamente: peça a 3 pessoas de confiança que identifiquem uma força e uma área de desenvolvimento sua, e crie um plano para trabalhar no que ouviu",
      "Pratique a técnica 'ainda não' de Carol Dweck: quando pensar 'não consigo fazer isso', adicione 'ainda' — 'não consigo fazer isso AINDA' ativa circuitos de aprendizado no cérebro",
      "Celebre o processo, não apenas o resultado: estabeleça metas de esforço ('praticar 20 minutos por dia') em vez de metas de resultado ('tocar perfeitamente'), reconhecendo que o caminho é tão valioso quanto o destino",
      "Identifique uma crença limitante que está restringindo seu crescimento ('sou velho demais para mudar', 'não tenho talento para isso') e colete 3 evidências concretas que a contradizem"
    ],
    resources: [
      "Livro: 'Mindset: A Nova Psicologia do Sucesso' — Carol Dweck",
      "Livro: 'Antifrágil' — Nassim Nicholas Taleb",
      "Técnica: 'Desafios de Crescimento Graduado' — exposição progressiva a desconfortos gerenciáveis",
      "Conceito: 'Zona de Desenvolvimento Proximal' — crescemos não no conforto nem no pânico, mas no espaço intermediário"
    ],
    expectedBenefits: "Em 4-8 semanas de prática consistente, é esperado: maior disposição para enfrentar desafios sem evitá-los, redução do medo de falhar, aumento da criatividade e da disposição para experimentar, e uma sensação crescente de agência — de que você é capaz de moldar sua própria trajetória."
  }
};

export function getRecommendationsForWeakDimensions(
  weakDimensions: string[]
): Recommendation[] {
  return weakDimensions
    .map(dim => RECOMMENDATIONS[dim])
    .filter(Boolean);
}
