import { describe, it, expect } from "vitest";
import { DIMENSIONS, LIKERT_OPTIONS } from "../diagnostic-questions";

describe("DIMENSIONS", () => {
    it("contém exatamente 5 dimensões", () => {
        expect(DIMENSIONS).toHaveLength(5);
    });

    it("cada dimensão tem id, name, description e icon", () => {
        DIMENSIONS.forEach((dim) => {
            expect(dim.id).toBeDefined();
            expect(typeof dim.id).toBe("number");
            expect(dim.name).toBeDefined();
            expect(dim.name.length).toBeGreaterThan(0);
            expect(dim.description).toBeDefined();
            expect(dim.description.length).toBeGreaterThan(0);
            expect(dim.icon).toBeDefined();
            expect(dim.icon.length).toBeGreaterThan(0);
        });
    });

    it("IDs são únicos e sequenciais de 1 a 5", () => {
        const ids = DIMENSIONS.map((d) => d.id);
        expect(ids).toEqual([1, 2, 3, 4, 5]);
    });

    it("contém os nomes esperados das dimensões", () => {
        const names = DIMENSIONS.map((d) => d.name);
        expect(names).toContain("Consciência Interior");
        expect(names).toContain("Coerência Emocional");
        expect(names).toContain("Conexão e Propósito");
        expect(names).toContain("Relações e Compaixão");
        expect(names).toContain("Transformação");
    });
});

describe("LIKERT_OPTIONS", () => {
    it("contém 5 opções da escala Likert", () => {
        expect(LIKERT_OPTIONS).toHaveLength(5);
    });

    it("tem valores de 1 a 5", () => {
        const values = LIKERT_OPTIONS.map((o) => o.value);
        expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    it("cada opção tem value e label", () => {
        LIKERT_OPTIONS.forEach((opt) => {
            expect(typeof opt.value).toBe("number");
            expect(typeof opt.label).toBe("string");
            expect(opt.label.length).toBeGreaterThan(0);
        });
    });

    it("vai de 'Discordo totalmente' a 'Concordo totalmente'", () => {
        expect(LIKERT_OPTIONS[0].label).toBe("Discordo totalmente");
        expect(LIKERT_OPTIONS[4].label).toBe("Concordo totalmente");
    });

    it("opção neutra está no meio (valor 3)", () => {
        const neutral = LIKERT_OPTIONS.find((o) => o.value === 3);
        expect(neutral).toBeDefined();
        expect(neutral!.label).toBe("Neutro");
    });
});
