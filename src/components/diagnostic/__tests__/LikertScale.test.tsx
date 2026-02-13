import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { LikertScale } from "../LikertScale";

describe("LikertScale", () => {
    it("renderiza todas as 5 opções da escala", () => {
        render(<LikertScale onChange={() => { }} />);

        // Cada opção aparece tanto no layout desktop quanto mobile (2x)
        expect(screen.getAllByText("1")).toHaveLength(2);
        expect(screen.getAllByText("2")).toHaveLength(2);
        expect(screen.getAllByText("3")).toHaveLength(2);
        expect(screen.getAllByText("4")).toHaveLength(2);
        expect(screen.getAllByText("5")).toHaveLength(2);
    });

    it("renderiza os labels das opções", () => {
        render(<LikertScale onChange={() => { }} />);

        expect(screen.getAllByText("Discordo totalmente")).toHaveLength(2);
        expect(screen.getAllByText("Concordo totalmente")).toHaveLength(2);
    });

    it("chama onChange ao clicar numa opção", async () => {
        const onChange = vi.fn();
        render(<LikertScale onChange={onChange} />);

        // Clicar no primeiro botão "4" (layout desktop)
        const buttons = screen.getAllByText("4");
        await userEvent.click(buttons[0]);

        expect(onChange).toHaveBeenCalledWith(4);
    });

    it("desabilita botões quando disabled=true", () => {
        render(<LikertScale onChange={() => { }} disabled />);

        const buttons = screen.getAllByRole("button");
        buttons.forEach((btn) => {
            expect(btn).toBeDisabled();
        });
    });
});
