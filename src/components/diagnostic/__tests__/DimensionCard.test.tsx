import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DimensionCard } from "../DimensionCard";
import { DimensionScore } from "@/lib/diagnostic-scoring";

const baseScore: DimensionScore = {
    dimension: "Consciência Interior",
    dimensionOrder: 1,
    score: 3.8,
    maxScore: 5,
    percentage: 76,
};

describe("DimensionCard", () => {
    it("renderiza nome da dimensão e score formatado", () => {
        render(<DimensionCard score={baseScore} />);

        expect(screen.getByText("Consciência Interior")).toBeInTheDocument();
        expect(screen.getByText("3.8")).toBeInTheDocument();
        expect(screen.getByText("/5")).toBeInTheDocument();
    });

    it("exibe label de nível correto (alto para score 3.8)", () => {
        render(<DimensionCard score={baseScore} />);

        expect(screen.getByText("Bem desenvolvido")).toBeInTheDocument();
    });

    it('exibe "Área de desenvolvimento" quando isWeak=true', () => {
        render(<DimensionCard score={baseScore} isWeak />);

        expect(screen.getByText("Área de desenvolvimento")).toBeInTheDocument();
    });

    it('exibe "Ponto forte" quando isStrong=true', () => {
        render(<DimensionCard score={baseScore} isStrong />);

        expect(screen.getByText("Ponto forte")).toBeInTheDocument();
    });

    it("exibe label de nível baixo para score baixo", () => {
        const lowScore: DimensionScore = { ...baseScore, score: 1.5 };
        render(<DimensionCard score={lowScore} />);

        expect(screen.getByText("Em desenvolvimento")).toBeInTheDocument();
    });

    it("exibe descrição da dimensão", () => {
        render(<DimensionCard score={baseScore} />);

        expect(
            screen.getByText(/Capacidade de observar pensamentos/)
        ).toBeInTheDocument();
    });
});
