import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UserPlus, Check } from "lucide-react";

interface CreateAccountCTAProps {
  participantEmail: string;
  participantName: string;
  accessToken: string;
}

export function CreateAccountCTA({ participantEmail, participantName, accessToken }: CreateAccountCTAProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    setLoading(true);

    try {
      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: participantEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/participante/portal",
          data: {
            full_name: participantName,
          },
        },
      });

      if (signUpError) {
        toast.error("Erro ao criar conta", {
          description: signUpError.message,
        });
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Erro ao criar conta");
        setLoading(false);
        return;
      }

      // Activate participant account
      const { data: activated, error: activateError } = await supabase.rpc(
        "activate_participant_account" as any,
        {
          p_token: accessToken,
          p_user_id: authData.user.id,
        }
      );

      if (activateError) {
        console.error("Error activating account:", activateError);
        // Still show success since account was created
      }

      setSuccess(true);
      toast.success("Conta criada com sucesso!", {
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });
    } catch (err) {
      console.error("Error creating account:", err);
      toast.error("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Conta criada!</p>
              <p className="text-sm text-muted-foreground">
                Verifique seu e-mail para confirmar e depois acesse o{" "}
                <button
                  onClick={() => navigate("/participante/login")}
                  className="underline font-medium text-primary"
                >
                  Portal do Participante
                </button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isOpen) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <p className="font-medium">Quer acessar seus resultados depois?</p>
              <p className="text-sm text-muted-foreground">
                Crie uma conta para acessar o Portal do Participante a qualquer momento.
              </p>
            </div>
            <Button onClick={() => setIsOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Criar Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Criar Conta
        </CardTitle>
        <CardDescription>
          Defina uma senha para acessar seus resultados a qualquer momento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="text-muted-foreground">E-mail:</span>{" "}
            <span className="font-medium">{participantEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cta-password">Senha</Label>
            <Input
              id="cta-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta-confirm-password">Confirmar Senha</Label>
            <Input
              id="cta-confirm-password"
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
