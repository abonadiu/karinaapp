import { useImpersonation } from "@/contexts/ImpersonationContext";
import { Button } from "@/components/ui/button";
import { X, Eye, Building2, Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, stopImpersonation } = useImpersonation();
  const navigate = useNavigate();

  if (!isImpersonating || !impersonatedUser) return null;

  const getRoleIcon = () => {
    switch (impersonatedUser.role) {
      case "facilitator":
        return <Shield className="h-4 w-4" />;
      case "company_manager":
        return <Building2 className="h-4 w-4" />;
      case "participant":
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = () => {
    switch (impersonatedUser.role) {
      case "facilitator":
        return "Facilitador";
      case "company_manager":
        return "Gestor de Empresa";
      case "participant":
        return "Participante";
    }
  };

  const handleStop = () => {
    stopImpersonation();
    navigate("/administracao");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5" />
          <span className="font-medium">Modo de Emulação</span>
          <span className="text-amber-800">|</span>
          <div className="flex items-center gap-2">
            {getRoleIcon()}
            <span>{getRoleLabel()}</span>
          </div>
          <span className="text-amber-800">|</span>
          <span className="font-medium">
            {impersonatedUser.fullName || impersonatedUser.email}
          </span>
          {impersonatedUser.companyName && (
            <>
              <span className="text-amber-800">|</span>
              <span className="text-sm">{impersonatedUser.companyName}</span>
            </>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleStop}
          className="text-amber-950 hover:bg-amber-600 hover:text-amber-950"
        >
          <X className="h-4 w-4 mr-1" />
          Encerrar Emulação
        </Button>
      </div>
    </div>
  );
}
