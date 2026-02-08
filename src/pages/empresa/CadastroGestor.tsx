import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building2, UserPlus, Loader2, AlertCircle } from "lucide-react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

const cadastroSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

interface InviteData {
  id: string;
  company_id: string;
  email: string;
  name: string;
  company_name: string;
}

export default function CadastroGestor() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Token não fornecido");
        setIsValidating(false);
        return;
      }

      try {
        const { data, error: rpcError } = await supabase
          .rpc('get_manager_invite_by_token', { p_token: token });

        if (rpcError) throw rpcError;

        if (!data || data.length === 0) {
          setError("Convite não encontrado ou já foi utilizado");
        } else {
          setInviteData(data[0] as InviteData);
        }
      } catch (err: any) {
        console.error("Error validating token:", err);
        setError("Erro ao validar convite");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: CadastroFormData) => {
    if (!inviteData || !token) return;

    setIsLoading(true);

    try {
      // 1. Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: inviteData.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: inviteData.name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Erro ao criar conta");
      }

      // 2. Activate manager invite (this adds the role and links to company)
      const { data: activated, error: activateError } = await supabase
        .rpc('activate_manager_invite', { 
          p_token: token, 
          p_user_id: authData.user.id 
        });

      if (activateError) throw activateError;

      if (!activated) {
        throw new Error("Erro ao ativar convite");
      }

      toast.success("Conta criada com sucesso! Faça login para continuar.");
      navigate("/empresa/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <AuthLayout
        title="Validando convite..."
        subtitle="Aguarde enquanto verificamos seu convite"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  if (error || !inviteData) {
    return (
      <AuthLayout
        title="Convite Inválido"
        subtitle="Não foi possível validar seu convite"
      >
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error || "Convite não encontrado"}
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Se você já criou sua conta, faça login abaixo.
          </p>
          <Link to="/empresa/login">
            <Button>Ir para Login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle={`Você foi convidado como gestor da empresa ${inviteData.company_name}`}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <Building2 className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">Portal da Empresa</span>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>Nome:</strong> {inviteData.name}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Email:</strong> {inviteData.email}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Empresa:</strong> {inviteData.company_name}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Conta
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Já tem uma conta?{" "}
          <Link to="/empresa/login" className="font-medium text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
