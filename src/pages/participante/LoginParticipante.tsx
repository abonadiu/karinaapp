import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function LoginParticipante() {
  const navigate = useNavigate();
  const { signIn, isParticipant, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as participant
  React.useEffect(() => {
    if (!authLoading && isParticipant) {
      navigate("/participante/portal");
    }
  }, [authLoading, isParticipant, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error("Erro ao fazer login", {
        description: "Verifique suas credenciais e tente novamente.",
      });
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    navigate("/participante/portal");
  };

  return (
    <AuthLayout 
      title="Portal do Participante" 
      subtitle="Acesse seus resultados de diagnóstico"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <Link
          to="/recuperar-senha"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>
    </AuthLayout>
  );
}
