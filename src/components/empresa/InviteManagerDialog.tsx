import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserPlus, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

const inviteSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  facilitatorId: string;
  onSuccess?: () => void;
}

export function InviteManagerDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
  facilitatorId,
  onSuccess,
}: InviteManagerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setIsLoading(true);

    try {
      // 1. Create manager invite record
      const { data: inviteData, error: insertError } = await supabase
        .from("company_managers")
        .insert({
          company_id: companyId,
          invited_by: facilitatorId,
          email: data.email,
          name: data.name,
        })
        .select("invite_token")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("Este email já foi convidado para esta empresa");
        }
        throw insertError;
      }

      // 2. Send invite email via edge function
      const inviteUrl = `${window.location.origin}/empresa/cadastro/${inviteData.invite_token}`;

      const { error: invokeError } = await supabase.functions.invoke("invite-manager", {
        body: {
          managerName: data.name,
          managerEmail: data.email,
          companyName,
          inviteUrl,
        },
      });

      if (invokeError) {
        console.error("Error sending invite email:", invokeError);
        // Don't fail if email fails - the invite is still created
        toast.warning("Convite criado, mas houve erro ao enviar email. Copie o link manualmente.");
      } else {
        toast.success(`Convite enviado para ${data.email}!`);
      }

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error inviting manager:", error);
      toast.error(error.message || "Erro ao enviar convite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Gestor</DialogTitle>
          <DialogDescription>
            Envie um convite para um gestor de RH ou líder acessar os dados agregados da equipe.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Gestor</FormLabel>
                  <FormControl>
                    <Input placeholder="Maria Silva" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="gestor@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
