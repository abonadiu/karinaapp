import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
    it("concatena classes simples", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("ignora valores falsy", () => {
        expect(cn("foo", false && "bar", undefined, null, "baz")).toBe("foo baz");
    });

    it("faz merge de classes conflitantes do Tailwind", () => {
        // twMerge deve resolver conflito: px-4 e px-2 → px-2
        expect(cn("px-4", "px-2")).toBe("px-2");
    });

    it("aceita classes condicionais com clsx", () => {
        const isActive = true;
        expect(cn("base", { active: isActive, disabled: false })).toBe(
            "base active"
        );
    });

    it("retorna string vazia sem argumentos", () => {
        expect(cn()).toBe("");
    });
});
