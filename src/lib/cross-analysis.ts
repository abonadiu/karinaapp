import { DimensionScore } from "@/lib/diagnostic-scoring";

export interface CrossInsight {
  title: string;
  dimensions: [string, string];
  insight: string;
  recommendation: string;
}

interface ScoreMap {
  [dimension: string]: number;
}

function toScoreMap(scores: DimensionScore[]): ScoreMap {
  const map: ScoreMap = {};
  for (const s of scores) map[s.dimension] = s.score;
  return map;
}

const HIGH = 3.5;
const LOW = 2.8;

interface CrossRule {
  condition: (m: ScoreMap) => boolean;
  insight: CrossInsight;
}

const CROSS_RULES: CrossRule[] = [
  {
    condition: (m) => m["Consciência Interior"] >= HIGH && m["Coerência Emocional"] < LOW,
    insight: {
      title: "Percepção sem regulação",
      dimensions: ["Consciência Interior", "Coerência Emocional"],
      insight: "Você tem boa capacidade de perceber o que sente e o que acontece internamente, mas pode ter dificuldade em regular ou modular essas emoções uma vez que as identifica. É como ter um radar emocional sensível, mas sem os controles de ajuste — você detecta tudo, mas nem sempre consegue decidir como responder. Isso pode se manifestar como hiper-reatividade consciente: você percebe que está reagindo de forma exagerada no momento em que acontece, mas não consegue frear a reação.",
      recommendation: "O próximo passo natural é desenvolver técnicas de regulação emocional que aproveitem sua forte consciência: a respiração 4-7-8, a reavaliação cognitiva e a comunicação não-violenta podem transformar sua percepção em regulação efetiva."
    }
  },
  {
    condition: (m) => m["Coerência Emocional"] >= HIGH && m["Consciência Interior"] < LOW,
    insight: {
      title: "Regulação sem raiz",
      dimensions: ["Coerência Emocional", "Consciência Interior"],
      insight: "Você demonstra boa capacidade de lidar com emoções na superfície, mas pode estar operando com regulação reativa — controlando emoções quando elas já estão intensas, em vez de percebê-las nos estágios iniciais. Isso pode funcionar em situações cotidianas, mas tende a falhar sob pressão extrema, quando as emoções surgem com intensidade que ultrapassa a capacidade de controle.",
      recommendation: "Desenvolver a consciência interior — especialmente práticas de mindfulness e auto-observação — pode dar profundidade e sustentabilidade à sua regulação emocional, permitindo que você note emoções muito antes de se tornarem avassaladoras."
    }
  },
  {
    condition: (m) => m["Conexão e Propósito"] >= HIGH && m["Transformação"] < LOW,
    insight: {
      title: "Visão sem ação",
      dimensions: ["Conexão e Propósito", "Transformação"],
      insight: "Você tem clareza sobre seus valores e sobre a direção que deseja para sua vida, mas pode encontrar dificuldade em implementar as mudanças concretas necessárias para viver de acordo com esses valores. O desafio não é saber 'para onde ir', mas sim 'como dar o primeiro passo' e sustentá-lo. Pode haver uma distância entre a vida idealizada e a vida vivida que gera frustração ou sensação de estagnação.",
      recommendation: "O foco deve estar em desenvolver a mentalidade de crescimento e a tolerância ao desconforto: comece com micro-mudanças alinhadas aos seus valores, celebre o progresso (não a perfeição), e use sua clareza de propósito como combustível para sustentar o esforço da transformação."
    }
  },
  {
    condition: (m) => m["Transformação"] >= HIGH && m["Conexão e Propósito"] < LOW,
    insight: {
      title: "Movimento sem direção",
      dimensions: ["Transformação", "Conexão e Propósito"],
      insight: "Você tem forte disposição para mudança e crescimento, mas sem uma bússola clara de valores e propósito, essa energia pode dispersar-se em múltiplas direções sem gerar transformação significativa. É como ter o motor ligado em alta rotação, mas sem GPS — há muito movimento, mas não necessariamente progresso coerente. Pode haver uma tendência a buscar novidades compulsivamente, sem aprofundar-se suficientemente em nenhuma direção.",
      recommendation: "Investir tempo em clarificar seus valores autênticos e definir um propósito pode canalizar sua energia transformadora de forma muito mais eficaz. A reflexão sobre 'para que estou mudando?' pode dar foco e profundidade à sua disposição natural para o crescimento."
    }
  },
  {
    condition: (m) => m["Relações e Compaixão"] >= HIGH && m["Consciência Interior"] < LOW,
    insight: {
      title: "Empatia sem auto-observação",
      dimensions: ["Relações e Compaixão", "Consciência Interior"],
      insight: "Sua empatia natural e capacidade de conexão são recursos valiosos, mas sem auto-observação suficiente, podem levar ao esgotamento emocional. Quando nos conectamos profundamente com o sofrimento alheio sem perceber o impacto em nós mesmos, corremos o risco de 'fadiga de compaixão' — um estado de exaustão emocional que pode comprometer tanto nossa saúde quanto nossa capacidade de ajudar.",
      recommendation: "Desenvolver práticas de consciência interior — especialmente o escaneamento corporal e a atenção aos próprios limites emocionais — pode proteger sua capacidade empática, permitindo que você continue se conectando com outros sem se perder no processo."
    }
  },
  {
    condition: (m) => m["Consciência Interior"] >= HIGH && m["Relações e Compaixão"] < LOW,
    insight: {
      title: "Introspecção sem conexão",
      dimensions: ["Consciência Interior", "Relações e Compaixão"],
      insight: "Sua forte capacidade de auto-observação é um recurso valioso, mas pode estar sendo direcionada predominantemente para dentro, sem se expandir para a conexão empática com os outros. A introspecção sem empatia pode criar uma forma sofisticada de isolamento emocional — você entende bem a si mesmo, mas pode ter dificuldade em aplicar essa mesma sensibilidade para compreender a experiência dos outros.",
      recommendation: "A prática de meditação de bondade amorosa (Metta), exercícios de escuta ativa profunda e o cultivo deliberado de autocompaixão podem ser pontes naturais entre sua consciência interior desenvolvida e uma conexão mais profunda com as pessoas ao seu redor."
    }
  },
  {
    condition: (m) => m["Coerência Emocional"] >= HIGH && m["Relações e Compaixão"] < LOW,
    insight: {
      title: "Regulação sem vulnerabilidade",
      dimensions: ["Coerência Emocional", "Relações e Compaixão"],
      insight: "Você demonstra boa capacidade de gerenciar suas emoções, mas pode estar usando essa habilidade mais como escudo do que como ponte. A regulação emocional, quando excessivamente orientada para o controle, pode dificultar a vulnerabilidade necessária para conexões profundas. Relacionamentos genuínos exigem que nos mostremos — incluindo nossos medos, inseguranças e necessidades — e uma regulação muito rígida pode impedir essa abertura.",
      recommendation: "Experimente praticar a 'vulnerabilidade dosada' — compartilhar gradualmente sentimentos e necessidades em relacionamentos seguros. A autocompaixão pode ser particularmente útil: tratar-se com gentileza abre espaço para tratar os outros da mesma forma."
    }
  },
  {
    condition: (m) => m["Relações e Compaixão"] >= HIGH && m["Coerência Emocional"] < LOW,
    insight: {
      title: "Coração aberto sem proteção",
      dimensions: ["Relações e Compaixão", "Coerência Emocional"],
      insight: "Sua capacidade empática e compassiva é admirável, mas sem regulação emocional robusta, pode torná-lo vulnerável a absorver emoções alheias de forma desgastante. Pessoas altamente empáticas com baixa regulação frequentemente relatam sentir-se 'esponjas emocionais' — captando estados emocionais dos outros e tendo dificuldade em distinguir entre suas emoções e as dos outros.",
      recommendation: "Desenvolver técnicas de regulação emocional — especialmente a capacidade de reconhecer limites e modular a intensidade da experiência empática — pode proteger sua saúde emocional sem fechar seu coração. A distinção entre empatia e compaixão é chave: a compaixão motiva sem desgastar."
    }
  },
  {
    condition: (m) => m["Conexão e Propósito"] >= HIGH && m["Coerência Emocional"] < LOW,
    insight: {
      title: "Propósito com turbulência emocional",
      dimensions: ["Conexão e Propósito", "Coerência Emocional"],
      insight: "Você tem clareza sobre o que importa e aonde quer chegar, mas a instabilidade emocional pode sabotar a jornada. É como ter um mapa excelente, mas estar dirigindo durante uma tempestade — a visão está clara, mas as condições dificultam a navegação. Frustrações emocionais mal reguladas podem levar a decisões impulsivas que afastam do propósito declarado.",
      recommendation: "Fortalecer a regulação emocional pode ser o diferencial que transforma sua clareza de propósito em ação consistente. Técnicas de respiração consciente, reavaliação cognitiva e o diário emocional podem ajudá-lo a manter o rumo mesmo em momentos de tempestade interna."
    }
  },
  {
    condition: (m) => m["Transformação"] >= HIGH && m["Consciência Interior"] < LOW,
    insight: {
      title: "Mudança sem autoconhecimento",
      dimensions: ["Transformação", "Consciência Interior"],
      insight: "Sua disposição para mudança e crescimento é notável, mas sem consciência interior robusta, corre o risco de mudar de forma reativa — respondendo a pressões externas em vez de necessidades internas. A transformação genuína requer saber o que precisa mudar e por quê, e isso só é possível com auto-observação profunda. Sem ela, pode haver um padrão de mudanças frequentes que não se aprofundam.",
      recommendation: "Investir em práticas de atenção plena e auto-observação pode dar profundidade e direção à sua energia transformadora, garantindo que as mudanças que você busca sejam genuínas e sustentáveis, não apenas reações a estímulos externos."
    }
  }
];

export function getCrossAnalysisInsights(scores: DimensionScore[]): CrossInsight[] {
  const map = toScoreMap(scores);
  return CROSS_RULES
    .filter(rule => rule.condition(map))
    .map(rule => rule.insight);
}
