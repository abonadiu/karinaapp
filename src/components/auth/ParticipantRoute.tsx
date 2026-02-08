import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useImpersonation, getPersistedImpersonatedUser } from "@/contexts/ImpersonationContext";
import { Loader2 } from "lucide-react";

interface ParticipantRouteProps {
  children: React.ReactNode;
}

export function ParticipantRoute({ children }: ParticipantRouteProps) {
  const { user, loading, isParticipant } = useAuth();
  const { isImpersonating, impersonatedUser } = useImpersonation();

  // Robustness: on fast navigate / refresh, context state can be momentarily empty.
  // We also read the persisted impersonation state to avoid redirecting to login.
  const persisted = getPersistedImpersonatedUser();
  const effectiveImpersonatedUser = impersonatedUser ?? persisted;

  if ((isImpersonating || !!persisted) && effectiveImpersonatedUser?.role === "participant") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/participante/login" replace />;
  }

  if (!isParticipant) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
