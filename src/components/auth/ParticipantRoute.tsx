import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { Loader2 } from "lucide-react";

interface ParticipantRouteProps {
  children: React.ReactNode;
}

export function ParticipantRoute({ children }: ParticipantRouteProps) {
  const { user, loading, isParticipant } = useAuth();
  const { isImpersonating, impersonatedUser } = useImpersonation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access if admin is impersonating a participant
  if (isImpersonating && impersonatedUser?.role === "participant") {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/participante/login" replace />;
  }

  if (!isParticipant) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
