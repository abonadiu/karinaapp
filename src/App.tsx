import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
// Portal da Empresa (Company Manager)
import LoginEmpresa from "./pages/empresa/LoginEmpresa";
import CadastroGestor from "./pages/empresa/CadastroGestor";
import PortalEmpresa from "./pages/empresa/PortalEmpresa";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            
            {/* Company Manager Portal (protected) */}
            <Route path="/empresa/dashboard" element={<PortalEmpresa />} />
            {/* Protected routes */}
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
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
