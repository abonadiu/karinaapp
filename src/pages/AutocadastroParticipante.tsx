import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2 } from "lucide-react";

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
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  department: z.string().trim().max(100).optional().or(z.literal("")),
  position: z.string().trim().max(100).optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export default function AutocadastroParticipante() {
  const { token } = useParams<{ token: string }>();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [invalidToken, setInvalidToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", department: "", position: "" },
  });

  useEffect(() => {
    const fetchCompany = async () => {
      if (!token) {
        setInvalidToken(true);
        setIsLoadingCompany(false);
        return;
      }

      const { data, error } = await (supabase as any)
        .from("companies")
        .select("name")
        .eq("self_register_token", token)
        .single();

      if (error || !data) {
        setInvalidToken(true);
      } else {
        setCompanyName(data.name);
      }
      setIsLoadingCompany(false);
    };

    fetchCompany();
  }, [token]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await (supabase as any).rpc("self_register_participant", {
        p_token: token,
        p_name: data.name,
        p_email: data.email,
        p_phone: data.phone || null,
        p_department: data.department || null,
        p_position: data.position || null,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCompany) {
    return (
      <AuthLayout title="Carregando...">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  if (invalidToken) {
    return (
      <AuthLayout title="Link inválido" subtitle="Este link de cadastro não é válido ou não existe.">
        <p className="text-center text-muted-foreground">
          Verifique o link e tente novamente.
        </p>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Cadastro realizado!" subtitle={`Você foi cadastrado em ${companyName}`}>
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle className="h-16 w-16 text-primary" />
          <p className="text-center text-muted-foreground">
            Seu cadastro foi recebido com sucesso. O facilitador entrará em contato em breve.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Autocadastro"
      subtitle={`Cadastre-se como participante em ${companyName}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Comercial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Gerente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {errorMessage && (
            <p className="text-sm text-destructive font-medium">{errorMessage}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
