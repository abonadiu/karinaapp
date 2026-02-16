// Definição das 5 dimensões do Diagnóstico de Consciência Integral

export interface DiagnosticDimension {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export const DIMENSIONS: DiagnosticDimension[] = [
  {
    id: 1,
    name: "Consciência Interior",
    description: "Capacidade de observar pensamentos e emoções, praticar atenção plena e reconhecer padrões internos.",
    icon: "brain"
  },
  {
    id: 2,
    name: "Coerência Emocional",
    description: "Habilidade de nomear, regular e expressar emoções de forma equilibrada e construtiva.",
    icon: "heart"
  },
  {
    id: 3,
    name: "Conexão e Propósito",
    description: "Alinhamento entre valores, ações e senso de significado e direção na vida.",
    icon: "compass"
  },
  {
    id: 4,
    name: "Relações e Compaixão",
    description: "Capacidade de empatia, conexão genuína, perdão e autocompaixão nos relacionamentos.",
    icon: "users"
  },
  {
    id: 5,
    name: "Transformação",
    description: "Abertura para mudança, aprendizado contínuo e crescimento pessoal.",
    icon: "sparkles"
  }
];

export interface Question {
  id: string;
  dimension: string;
  dimension_order: number;
  question_order: number;
  question_text: string;
  reverse_scored: boolean;
}

export const LIKERT_OPTIONS = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo totalmente" }
];
