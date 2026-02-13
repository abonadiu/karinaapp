import { describe, it, expect } from "vitest";
import {
    RECOMMENDATIONS,
    getRecommendationsForWeakDimensions,
} from "../recommendations";

describe("RECOMMENDATIONS", () => {
    it("contém recomendações para as 5 dimensões do diagnóstico", () => {
        const expectedDimensions = [
            "Consciência Interior",
            "Coerência Emocional",
            "Conexão e Propósito",
            "Relações e Compaixão",
            "Transformação",
        ];

        expectedDimensions.forEach((dim) => {
            expect(RECOMMENDATIONS[dim]).toBeDefined();
        });
    });

    it("cada recomendação tem título, descrição e práticas", () => {
        Object.entries(RECOMMENDATIONS).forEach(([dimension, rec]) => {
            expect(rec.title).toBeDefined();
            expect(rec.title.length).toBeGreaterThan(0);
            expect(rec.description).toBeDefined();
            expect(rec.description.length).toBeGreaterThan(0);
            expect(rec.practices).toBeDefined();
            expect(Array.isArray(rec.practices)).toBe(true);
            expect(rec.practices.length).toBeGreaterThan(0);
        });
    });

    it("cada dimensão tem exatamente 4 práticas sugeridas", () => {
        Object.values(RECOMMENDATIONS).forEach((rec) => {
            expect(rec.practices).toHaveLength(4);
        });
    });
});

describe("getRecommendationsForWeakDimensions", () => {
    it("retorna recomendações para dimensões válidas", () => {
        const result = getRecommendationsForWeakDimensions([
            "Consciência Interior",
            "Coerência Emocional",
        ]);

        expect(result).toHaveLength(2);
        expect(result[0].title).toBe("Desenvolva sua Consciência Interior");
        expect(result[1].title).toBe("Desenvolva sua Coerência Emocional");
    });

    it("filtra silenciosamente dimensões inválidas", () => {
        const result = getRecommendationsForWeakDimensions([
            "Dimensão Inexistente",
            "Consciência Interior",
        ]);

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe("Desenvolva sua Consciência Interior");
    });

    it("retorna array vazio se nenhuma dimensão é válida", () => {
        const result = getRecommendationsForWeakDimensions([
            "Fake Dimension 1",
            "Fake Dimension 2",
        ]);

        expect(result).toHaveLength(0);
    });

    it("retorna array vazio para input vazio", () => {
        const result = getRecommendationsForWeakDimensions([]);
        expect(result).toHaveLength(0);
    });

    it("mantém a ordem das dimensões de entrada", () => {
        const result = getRecommendationsForWeakDimensions([
            "Transformação",
            "Consciência Interior",
        ]);

        expect(result[0].title).toContain("Transformação");
        expect(result[1].title).toContain("Consciência Interior");
    });

    /**
     * NOTA: A dimensão chama-se "Transformação e Crescimento" no banco de dados
     * (diagnostic_questions) mas apenas "Transformação" no RECOMMENDATIONS.
     * Isso pode causar falha no mapeamento se o score vier do banco.
     */
    it("ATENÇÃO: 'Transformação e Crescimento' (nome do banco) não é encontrada", () => {
        const result = getRecommendationsForWeakDimensions([
            "Transformação e Crescimento",
        ]);

        // Isso documenta a inconsistência entre banco e frontend
        expect(result).toHaveLength(0);
    });
});
