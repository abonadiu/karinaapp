import React, { createContext, useContext, useState, useCallback } from "react";

export type ImpersonatedRole = "facilitator" | "company_manager" | "participant";

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

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);

  const startImpersonation = useCallback((user: ImpersonatedUser) => {
    setImpersonatedUser(user);
  }, []);

  const stopImpersonation = useCallback(() => {
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
