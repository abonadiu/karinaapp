import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ParticipantRouteProps {
  children: React.ReactNode;
}

export function ParticipantRoute({ children }: ParticipantRouteProps) {
  const { user, loading, isParticipant } = useAuth();

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
