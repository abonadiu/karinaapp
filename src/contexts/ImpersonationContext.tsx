import React, { createContext, useContext, useState, useCallback } from "react";

export type ImpersonatedRole = "admin" | "facilitator" | "company_manager" | "participant";

export interface ImpersonatedUser {
  userId: string;
  email: string;
  fullName: string | null;
  role: ImpersonatedRole;
  companyId?: string;
  companyName?: string;
  participantToken?: string;
}

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: ImpersonatedUser | null;
  startImpersonation: (user: ImpersonatedUser) => void;
  stopImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

const STORAGE_KEY = "lovable.impersonation.v1";

function readPersistedImpersonation(): ImpersonatedUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ImpersonatedUser>;

    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.userId || !parsed.email || !parsed.role) return null;

    if (!(["admin", "facilitator", "company_manager", "participant"] as const).includes(parsed.role)) {
      return null;
    }

    return parsed as ImpersonatedUser;
  } catch {
    return null;
  }
}

function persistImpersonation(user: ImpersonatedUser | null) {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export function getPersistedImpersonatedUser(): ImpersonatedUser | null {
  return readPersistedImpersonation();
}

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(() =>
    readPersistedImpersonation()
  );

  const startImpersonation = useCallback((user: ImpersonatedUser) => {
    persistImpersonation(user);
    setImpersonatedUser(user);
  }, []);

  const stopImpersonation = useCallback(() => {
    persistImpersonation(null);
    setImpersonatedUser(null);
  }, []);

  const value = {
    isImpersonating: impersonatedUser !== null,
    impersonatedUser,
    startImpersonation,
    stopImpersonation,
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error("useImpersonation must be used within an ImpersonationProvider");
  }
  return context;
}
