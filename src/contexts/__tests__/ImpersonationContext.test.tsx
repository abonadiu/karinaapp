import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import {
    ImpersonationProvider,
    useImpersonation,
    getPersistedImpersonatedUser,
    ImpersonatedUser,
} from "../ImpersonationContext";

const STORAGE_KEY = "lovable.impersonation.v1";

const validUser: ImpersonatedUser = {
    userId: "user-123",
    email: "test@example.com",
    fullName: "Test User",
    role: "facilitator",
};

// Componente auxiliar para testar o hook
function TestConsumer() {
    const { isImpersonating, impersonatedUser, startImpersonation, stopImpersonation } =
        useImpersonation();

    return (
        <div>
            <span data-testid="is-impersonating">{String(isImpersonating)}</span>
            <span data-testid="user-email">{impersonatedUser?.email ?? "none"}</span>
            <button onClick={() => startImpersonation(validUser)}>Start</button>
            <button onClick={() => stopImpersonation()}>Stop</button>
        </div>
    );
}

describe("getPersistedImpersonatedUser", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("retorna null quando não há dados no localStorage", () => {
        expect(getPersistedImpersonatedUser()).toBeNull();
    });

    it("retorna usuário quando dados válidos existem no localStorage", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validUser));
        const result = getPersistedImpersonatedUser();
        expect(result).toEqual(validUser);
    });

    it("retorna null para JSON inválido no localStorage", () => {
        localStorage.setItem(STORAGE_KEY, "not-json");
        expect(getPersistedImpersonatedUser()).toBeNull();
    });

    it("retorna null quando campos obrigatórios estão faltando", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: "123" }));
        expect(getPersistedImpersonatedUser()).toBeNull();
    });

    it("retorna null para role inválida", () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...validUser, role: "superadmin" })
        );
        expect(getPersistedImpersonatedUser()).toBeNull();
    });
});

describe("ImpersonationProvider", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("inicia sem impersonação", () => {
        render(
            <ImpersonationProvider>
                <TestConsumer />
            </ImpersonationProvider>
        );

        expect(screen.getByTestId("is-impersonating")).toHaveTextContent("false");
        expect(screen.getByTestId("user-email")).toHaveTextContent("none");
    });

    it("startImpersonation atualiza estado e salva no localStorage", async () => {
        render(
            <ImpersonationProvider>
                <TestConsumer />
            </ImpersonationProvider>
        );

        await userEvent.click(screen.getByText("Start"));

        expect(screen.getByTestId("is-impersonating")).toHaveTextContent("true");
        expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
        expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    });

    it("stopImpersonation limpa estado e localStorage", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validUser));

        render(
            <ImpersonationProvider>
                <TestConsumer />
            </ImpersonationProvider>
        );

        // Inicialmente está impersonando (leu do localStorage)
        expect(screen.getByTestId("is-impersonating")).toHaveTextContent("true");

        await userEvent.click(screen.getByText("Stop"));

        expect(screen.getByTestId("is-impersonating")).toHaveTextContent("false");
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
});

describe("useImpersonation", () => {
    it("lança erro quando usado fora do provider", () => {
        // Suprimir console.error do React para este teste
        const spy = vi.spyOn(console, "error").mockImplementation(() => { });

        expect(() => render(<TestConsumer />)).toThrow(
            "useImpersonation must be used within an ImpersonationProvider"
        );

        spy.mockRestore();
    });
});
