import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
    it("exibe 'Pergunta X de Y' corretamente", () => {
        render(
            <ProgressBar currentQuestion={3} totalQuestions={40} />
        );

        expect(screen.getByText("Pergunta 3 de 40")).toBeInTheDocument();
    });

    it("exibe o nome da dimensão quando fornecido", () => {
        render(
            <ProgressBar
                currentQuestion={1}
                totalQuestions={40}
                currentDimension="Consciência Interior"
            />
        );

        expect(screen.getByText("Consciência Interior")).toBeInTheDocument();
    });

    it("não exibe nome da dimensão quando não fornecido", () => {
        render(
            <ProgressBar currentQuestion={1} totalQuestions={40} />
        );

        // Não deve existir nenhum span com "font-medium text-primary"
        // (verificamos que não há dimensões renderizadas)
        expect(screen.queryByText("Consciência Interior")).not.toBeInTheDocument();
    });

    it("renderiza indicadores para as 5 dimensões", () => {
        const { container } = render(
            <ProgressBar currentQuestion={1} totalQuestions={40} />
        );

        // 5 dimensões = 5 indicadores
        const indicators = container.querySelectorAll("[title]");
        expect(indicators).toHaveLength(5);
    });
});
