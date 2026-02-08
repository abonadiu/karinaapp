import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyManagerRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for company manager portal.
 * - Shows loading spinner while auth state is loading
 * - Redirects to /empresa/login if not authenticated
 * - Redirects to /empresa/login if user is not a company manager
 */
export function CompanyManagerRoute({ children }: CompanyManagerRouteProps) {
  const { user, loading, isManager, managerCompanyId } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/empresa/login" state={{ from: location }} replace />;
  }

  // User is logged in but not a company manager
  if (!isManager || !managerCompanyId) {
    return <Navigate to="/empresa/login" state={{ error: "not_manager" }} replace />;
  }

  return <>{children}</>;
}
