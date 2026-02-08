import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CompanyManagerRoute } from "@/components/auth/CompanyManagerRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Empresas from "./pages/Empresas";
import EmpresaDetalhes from "./pages/EmpresaDetalhes";
import Participantes from "./pages/Participantes";
import Diagnostico from "./pages/Diagnostico";
import Relatorios from "./pages/Relatorios";
import Administracao from "./pages/Administracao";
// Portal da Empresa (Company Manager)
import LoginEmpresa from "./pages/empresa/LoginEmpresa";
import CadastroGestor from "./pages/empresa/CadastroGestor";
import PortalEmpresa from "./pages/empresa/PortalEmpresa";
// Portal do Participante
import LoginParticipante from "./pages/participante/LoginParticipante";
import CadastroParticipante from "./pages/participante/CadastroParticipante";
import PortalParticipante from "./pages/participante/PortalParticipante";
import { ParticipantRoute } from "./components/auth/ParticipantRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ImpersonationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ImpersonationBanner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/diagnostico/:token" element={<Diagnostico />} />
            
            {/* Company Manager Portal (public routes) */}
            <Route path="/empresa/login" element={<LoginEmpresa />} />
            <Route path="/empresa/cadastro/:token" element={<CadastroGestor />} />
            
            {/* Participant Portal (public routes) */}
            <Route path="/participante/login" element={<LoginParticipante />} />
            <Route path="/participante/cadastro/:token" element={<CadastroParticipante />} />
            
            {/* Company Manager Portal (protected) */}
            <Route path="/empresa/dashboard" element={
              <CompanyManagerRoute>
                <PortalEmpresa />
              </CompanyManagerRoute>
            } />
            <Route path="/empresa/portal" element={
              <CompanyManagerRoute>
                <PortalEmpresa />
              </CompanyManagerRoute>
            } />
            
            {/* Participant Portal (protected) */}
            <Route path="/participante/portal" element={
              <ParticipantRoute>
                <PortalParticipante />
              </ParticipantRoute>
            } />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/empresas"
              element={
                <ProtectedRoute>
                  <Empresas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/empresas/:id"
              element={
                <ProtectedRoute>
                  <EmpresaDetalhes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/participantes"
              element={
                <ProtectedRoute>
                  <Participantes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <Relatorios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Administracao />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ImpersonationProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
