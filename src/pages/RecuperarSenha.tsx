import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const recuperarSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

type RecuperarFormValues = z.infer<typeof recuperarSchema>;

export default function RecuperarSenha() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const form = useForm<RecuperarFormValues>({
    resolver: zodResolver(recuperarSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: RecuperarFormValues) => {
    setIsLoading(true);

    const { error } = await resetPassword(data.email);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    setEmailSent(true);
    setIsLoading(false);
  };

  if (emailSent) {
    return (
      <AuthLayout 
        title="Email enviado" 
        subtitle="Verifique sua caixa de entrada"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e spam.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Recuperar senha" 
      subtitle="Digite seu email para receber o link de recuperação"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Enviando...
              </span>
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para login
        </Link>
      </div>
    </AuthLayout>
  );
}
