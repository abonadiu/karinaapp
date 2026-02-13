import { describe, it, expect } from "vitest";
import {
  calculateScores,
  getScoreLevel,
  getWeakestDimensions,
  getStrongestDimensions,
  DimensionScore,
} from "../diagnostic-scoring";
import { Question } from "../diagnostic-questions";

// Helper para criar perguntas de teste
function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "q1",
    dimension: "Consciência Interior",
    dimension_order: 1,
    question_order: 1,
    question_text: "Pergunta de teste",
    reverse_scored: false,
    ...overrides,
  };
}

describe("calculateScores", () => {
  it("calcula score médio de uma dimensão com respostas normais", () => {
    const questions: Question[] = [
      makeQuestion({ id: "q1", question_order: 1 }),
      makeQuestion({ id: "q2", question_order: 2 }),
    ];
    const responses = new Map([
      ["q1", 4],
      ["q2", 2],
    ]);

    const result = calculateScores(questions, responses);

    expect(result.dimensionScores).toHaveLength(1);
    expect(result.dimensionScores[0].score).toBe(3); // (4+2)/2
    expect(result.dimensionScores[0].maxScore).toBe(5);
    expect(result.dimensionScores[0].percentage).toBe(60); // (3/5)*100
  });

  it("inverte score para perguntas reverse_scored (6 - resposta)", () => {
    const questions: Question[] = [
      makeQuestion({ id: "q1", reverse_scored: true }),
    ];
    const responses = new Map([["q1", 1]]); // invertido: 6-1 = 5

    const result = calculateScores(questions, responses);

    expect(result.dimensionScores[0].score).toBe(5);
  });

  it("calcula scores para múltiplas dimensões corretamente", () => {
    const questions: Question[] = [
      makeQuestion({ id: "q1", dimension: "Dim A", dimension_order: 1 }),
      makeQuestion({ id: "q2", dimension: "Dim B", dimension_order: 2 }),
    ];
    const responses = new Map([
      ["q1", 5],
      ["q2", 1],
    ]);

    const result = calculateScores(questions, responses);

    expect(result.dimensionScores).toHaveLength(2);
    expect(result.dimensionScores[0].dimension).toBe("Dim A");
    expect(result.dimensionScores[0].score).toBe(5);
    expect(result.dimensionScores[1].dimension).toBe("Dim B");
    expect(result.dimensionScores[1].score).toBe(1);
  });

  it("ordena dimensões por dimensionOrder", () => {
    const questions: Question[] = [
      makeQuestion({ id: "q1", dimension: "Z Last", dimension_order: 3 }),
      makeQuestion({ id: "q2", dimension: "A First", dimension_order: 1 }),
      makeQuestion({ id: "q3", dimension: "M Middle", dimension_order: 2 }),
    ];
    const responses = new Map([
      ["q1", 3],
      ["q2", 3],
      ["q3", 3],
    ]);

    const result = calculateScores(questions, responses);

    expect(result.dimensionScores[0].dimension).toBe("A First");
    expect(result.dimensionScores[1].dimension).toBe("M Middle");
    expect(result.dimensionScores[2].dimension).toBe("Z Last");
  });

  it("calcula totalScore como média das dimensões", () => {
    const questions: Question[] = [
      makeQuestion({ id: "q1", dimension: "Dim A", dimension_order: 1 }),
      makeQuestion({ id: "q2", dimension: "Dim B", dimension_order: 2 }),
    ];
    const responses = new Map([
      ["q1", 5],
      ["q2", 3],
    ]);

    const result = calculateScores(questions, responses);

    expect(result.totalScore).toBe(4); // (5+3)/2
    expect(result.totalPercentage).toBe(80); // (4/5)*100
  });

  it("trata corretamente respostas vazias (sem nenhuma resposta)", () => {
    const questions: Question[] = [makeQuestion({ id: "q1" })];
    const responses = new Map<string, number>();

    const result = calculateScores(questions, responses);

    expect(result.dimensionScores[0].score).toBe(0);
    expect(result.totalScore).toBe(0);
  });

  it("trata corretamente quando não há perguntas", () => {
    const result = calculateScores([], new Map());

    expect(result.dimensionScores).toHaveLength(0);
    expect(result.totalScore).toBe(0);
  });

  it("trata respostas parciais (apenas algumas perguntas respondidas)", () => {
    const questions: Question[] = [
      makeQuestion({ id: "q1", question_order: 1 }),
      makeQuestion({ id: "q2", question_order: 2 }),
      makeQuestion({ id: "q3", question_order: 3 }),
    ];
    // Apenas q1 respondido
    const responses = new Map([["q1", 4]]);

    const result = calculateScores(questions, responses);

    expect(result.dimensionScores[0].score).toBe(4); // apenas 1 resposta
  });
});

describe("getScoreLevel", () => {
  it("retorna 'baixo' para scores menores que 2.5", () => {
    expect(getScoreLevel(1.0).level).toBe("baixo");
    expect(getScoreLevel(2.4).level).toBe("baixo");
    expect(getScoreLevel(0).level).toBe("baixo");
  });

  it("retorna 'medio' para scores entre 2.5 e 3.5", () => {
    expect(getScoreLevel(2.5).level).toBe("medio");
    expect(getScoreLevel(3.0).level).toBe("medio");
    expect(getScoreLevel(3.49).level).toBe("medio");
  });

  it("retorna 'alto' para scores >= 3.5", () => {
    expect(getScoreLevel(3.5).level).toBe("alto");
    expect(getScoreLevel(5.0).level).toBe("alto");
  });

  it("retorna labels descritivos corretos", () => {
    expect(getScoreLevel(1.0).label).toBe("Em desenvolvimento");
    expect(getScoreLevel(3.0).label).toBe("Moderado");
    expect(getScoreLevel(4.0).label).toBe("Bem desenvolvido");
  });

  it("retorna cores CSS corretas", () => {
    expect(getScoreLevel(1.0).color).toBe("text-orange-500");
    expect(getScoreLevel(3.0).color).toBe("text-yellow-500");
    expect(getScoreLevel(4.0).color).toBe("text-green-500");
  });
});

describe("getWeakestDimensions", () => {
  const scores: DimensionScore[] = [
    { dimension: "A", dimensionOrder: 1, score: 4, maxScore: 5, percentage: 80 },
    { dimension: "B", dimensionOrder: 2, score: 2, maxScore: 5, percentage: 40 },
    { dimension: "C", dimensionOrder: 3, score: 1, maxScore: 5, percentage: 20 },
    { dimension: "D", dimensionOrder: 4, score: 3, maxScore: 5, percentage: 60 },
  ];

  it("retorna as 2 dimensões com menor score", () => {
    const weakest = getWeakestDimensions(scores);
    expect(weakest).toHaveLength(2);
    expect(weakest[0].dimension).toBe("C"); // score 1
    expect(weakest[1].dimension).toBe("B"); // score 2
  });

  it("não modifica o array original", () => {
    const original = [...scores];
    getWeakestDimensions(scores);
    expect(scores).toEqual(original);
  });
});

describe("getStrongestDimensions", () => {
  const scores: DimensionScore[] = [
    { dimension: "A", dimensionOrder: 1, score: 4, maxScore: 5, percentage: 80 },
    { dimension: "B", dimensionOrder: 2, score: 2, maxScore: 5, percentage: 40 },
    { dimension: "C", dimensionOrder: 3, score: 5, maxScore: 5, percentage: 100 },
    { dimension: "D", dimensionOrder: 4, score: 3, maxScore: 5, percentage: 60 },
  ];

  it("retorna as 2 dimensões com maior score", () => {
    const strongest = getStrongestDimensions(scores);
    expect(strongest).toHaveLength(2);
    expect(strongest[0].dimension).toBe("C"); // score 5
    expect(strongest[1].dimension).toBe("A"); // score 4
  });

  it("não modifica o array original", () => {
    const original = [...scores];
    getStrongestDimensions(scores);
    expect(scores).toEqual(original);
  });
});
