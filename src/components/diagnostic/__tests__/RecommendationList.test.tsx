import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RecommendationList } from "../RecommendationList";
import { Recommendation } from "@/lib/recommendations";

const mockRecommendations: Recommendation[] = [
    {
        title: "Desenvolva sua Consciência Interior",
        description: "Fortaleça sua capacidade de auto-observação.",
        practices: [
            "Pratique meditação diariamente",
            "Faça pausas conscientes",
        ],
    },
    {
        title: "Abrace a Transformação",
        description: "Desenvolva flexibilidade.",
        practices: ["Desafie-se semanalmente"],
    },
];

describe("RecommendationList", () => {
    it("retorna null quando lista está vazia", () => {
        const { container } = render(<RecommendationList recommendations={[]} />);
        expect(container.innerHTML).toBe("");
    });

    it('renderiza o título "Recomendações para Você"', () => {
        render(<RecommendationList recommendations={mockRecommendations} />);
        expect(screen.getByText("Recomendações para Você")).toBeInTheDocument();
    });

    it("renderiza títulos de todas as recomendações", () => {
        render(<RecommendationList recommendations={mockRecommendations} />);

        expect(
            screen.getByText("Desenvolva sua Consciência Interior")
        ).toBeInTheDocument();
        expect(screen.getByText("Abrace a Transformação")).toBeInTheDocument();
    });

    it("renderiza as práticas de cada recomendação", () => {
        render(<RecommendationList recommendations={mockRecommendations} />);

        expect(
            screen.getByText("Pratique meditação diariamente")
        ).toBeInTheDocument();
        expect(screen.getByText("Faça pausas conscientes")).toBeInTheDocument();
        expect(
            screen.getByText("Desafie-se semanalmente")
        ).toBeInTheDocument();
    });

    it("renderiza descrições das recomendações", () => {
        render(<RecommendationList recommendations={mockRecommendations} />);

        expect(
            screen.getByText("Fortaleça sua capacidade de auto-observação.")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Desenvolva flexibilidade.")
        ).toBeInTheDocument();
    });
});
