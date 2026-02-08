import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ParticipantInfo {
  id: string;
  name: string;
  email: string;
  company_name: string;
}

export default function CadastroParticipante() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token inválido");
      setLoading(false);
      return;
    }

    fetchParticipantInfo();
  }, [token]);

  const fetchParticipantInfo = async () => {
    try {
      // Fetch participant info by token
      const { data, error: fetchError } = await supabase
        .from("participants")
        .select(`
          id,
          name,
          email,
          user_id,
          companies (name)
        `)
        .eq("access_token", token)
        .single();

      if (fetchError || !data) {
        setError("Link inválido ou expirado");
        setLoading(false);
        return;
      }

      // Type assertion for the joined data
      const participantData = data as any;

      if (participantData.user_id) {
        setError("Este participante já possui uma conta. Faça login para continuar.");
        setLoading(false);
        return;
      }

      setParticipant({
        id: participantData.id,
        name: participantData.name,
        email: participantData.email,
        company_name: participantData.companies?.name || "Empresa",
      });
    } catch (err) {
      setError("Erro ao carregar informações");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!participant) return;

    setSubmitting(true);

    try {
      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: participant.email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/participante/portal",
          data: {
            full_name: participant.name,
          },
        },
      });

      if (signUpError) {
        toast.error("Erro ao criar conta", {
          description: signUpError.message,
        });
        setSubmitting(false);
        return;
      }

      if (!authData.user) {
        toast.error("Erro ao criar conta");
        setSubmitting(false);
        return;
      }

      // Activate participant account (link user to participant)
      const { data: activated, error: activateError } = await supabase.rpc(
        "activate_participant_account" as any,
        {
          p_token: token,
          p_user_id: authData.user.id,
        }
      );

      if (activateError || !activated) {
        console.error("Error activating account:", activateError);
        toast.error("Erro ao vincular conta ao participante");
        setSubmitting(false);
        return;
      }

      toast.success("Conta criada com sucesso!", {
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });

      navigate("/participante/login");
    } catch (err) {
      console.error("Error creating account:", err);
      toast.error("Erro ao criar conta");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout title="Carregando..." subtitle="Aguarde um momento">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout title="Erro" subtitle="Não foi possível acessar o cadastro">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Link to="/participante/login">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ir para login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Criar Conta" 
      subtitle="Complete seu cadastro para acessar seus resultados"
    >
      <div className="mb-6 p-4 bg-muted rounded-lg space-y-2">
        <p className="text-sm">
          <span className="text-muted-foreground">Nome:</span>{" "}
          <span className="font-medium">{participant?.name}</span>
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">E-mail:</span>{" "}
          <span className="font-medium">{participant?.email}</span>
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Empresa:</span>{" "}
          <span className="font-medium">{participant?.company_name}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar Conta"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/participante/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
