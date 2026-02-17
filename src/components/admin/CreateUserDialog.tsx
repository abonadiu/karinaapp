import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
}

const createUserSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(72),
  role: z.enum(["admin", "facilitator", "company_manager", "participant", "none"]),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "none",
    },
  });

  const watchedRole = useWatch({ control: form.control, name: "role" });
  const needsCompany = watchedRole === "company_manager" || watchedRole === "participant";

  // Load companies when dialog opens
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    if (open) {
      fetchCompanies();
    }
  }, [open]);

  // Reset company when role changes
  useEffect(() => {
    if (!needsCompany) {
      setSelectedCompanyId(null);
    }
  }, [needsCompany]);

  const onSubmit = async (data: CreateUserFormData) => {
    // Validate company selection
    if (needsCompany && !selectedCompanyId) {
      toast.error(`Selecione uma empresa para o ${data.role === "company_manager" ? "gestor" : "participante"}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: data.email.trim().toLowerCase(),
          password: data.password,
          fullName: data.fullName.trim(),
          role: data.role === "none" ? null : data.role,
          companyId: needsCompany ? selectedCompanyId : null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao criar usuário");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success("Usuário criado com sucesso!");
      form.reset();
      setSelectedCompanyId(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo usuário na plataforma.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
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
                    <Input type="email" placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha inicial</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de acesso</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sem perfil específico</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="facilitator">Facilitador</SelectItem>
                      <SelectItem value="company_manager">Gestor de Empresa</SelectItem>
                      <SelectItem value="participant">Participante</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company selection - shown when company_manager or participant is selected */}
            {needsCompany && (
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Label>Empresa vinculada</Label>
                </div>
                <Select
                  value={selectedCompanyId || ""}
                  onValueChange={(value) => setSelectedCompanyId(value || null)}
                  disabled={isLoadingCompanies}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingCompanies ? "Carregando..." : "Selecione uma empresa"} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedCompanyId && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Selecione uma empresa para vincular o {watchedRole === "company_manager" ? "gestor" : "participante"}
                  </p>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Usuário"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
