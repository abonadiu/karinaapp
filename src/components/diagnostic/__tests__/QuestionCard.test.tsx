import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QuestionCard } from "../QuestionCard";
import { Question } from "@/lib/diagnostic-questions";

const question: Question = {
    id: "q-test-1",
    dimension: "Coerência Emocional",
    dimension_order: 2,
    question_order: 1,
    question_text: "Eu consigo nomear minhas emoções com facilidade.",
    reverse_scored: false,
};

describe("QuestionCard", () => {
    const defaultProps = {
        question,
        currentIndex: 2,
        totalQuestions: 40,
        onAnswer: vi.fn(),
        onPrevious: vi.fn(),
        canGoPrevious: true,
    };

    it("exibe o texto da pergunta", () => {
        render(<QuestionCard {...defaultProps} />);

        expect(
            screen.getByText(/Eu consigo nomear minhas emoções/)
        ).toBeInTheDocument();
    });

    it("exibe a dimensão atual", () => {
        render(<QuestionCard {...defaultProps} />);

        const elements = screen.getAllByText("Coerência Emocional");
        expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it("exibe 'Pergunta X de Y' via ProgressBar", () => {
        render(<QuestionCard {...defaultProps} />);

        // currentIndex=2 → ProgressBar recebe currentQuestion = 3
        expect(screen.getByText("Pergunta 3 de 40")).toBeInTheDocument();
    });

    it("botão Anterior habilitado quando canGoPrevious=true", () => {
        render(<QuestionCard {...defaultProps} canGoPrevious={true} />);

        const btn = screen.getByText("Anterior");
        expect(btn).not.toBeDisabled();
    });

    it("botão Anterior desabilitado quando canGoPrevious=false", () => {
        render(<QuestionCard {...defaultProps} canGoPrevious={false} />);

        const btn = screen.getByText("Anterior");
        expect(btn).toBeDisabled();
    });
});
