import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Plus, X, Calendar, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/backend/client";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { LogoUpload } from "@/components/profile/LogoUpload";
import { ColorPicker } from "@/components/profile/ColorPicker";

const perfilSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  calendlyUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type PerfilFormValues = z.infer<typeof perfilSchema>;

export default function Perfil() {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#C4A484");
  const [secondaryColor, setSecondaryColor] = useState("#8B7355");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");

  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      fullName: "",
      bio: "",
      calendlyUrl: "",
    },
  });

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (profileData) {
          form.reset({
            fullName: profileData.full_name || "",
            bio: profileData.bio || "",
            calendlyUrl: profileData.calendly_url || "",
          });
          setAvatarUrl(profileData.avatar_url);
          setLogoUrl(profileData.logo_url);
          setPrimaryColor(profileData.primary_color || "#C4A484");
          setSecondaryColor(profileData.secondary_color || "#8B7355");
          setCertifications(profileData.certifications || []);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    
    loadProfileData();
  }, [user, form]);

  const handleAddCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  const onSubmit = async (data: PerfilFormValues) => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          bio: data.bio || null,
          avatar_url: avatarUrl,
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          certifications: certifications,
          calendly_url: data.calendlyUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-serif font-semibold text-foreground">
                Meu Perfil
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas informações pessoais e da sua marca
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Suas informações básicas de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AvatarUpload
                  userId={user.id}
                  currentAvatarUrl={avatarUrl}
                  onUpload={setAvatarUrl}
                  userName={form.watch("fullName")}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia profissional</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conte um pouco sobre sua experiência como facilitador..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Brand */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Sua Marca</CardTitle>
                <CardDescription>
                  Personalize a identidade visual da sua marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormLabel className="mb-3 block">Logo da marca</FormLabel>
                  <LogoUpload
                    userId={user.id}
                    currentLogoUrl={logoUrl}
                    onUpload={setLogoUrl}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ColorPicker
                    label="Cor primária"
                    value={primaryColor}
                    onChange={setPrimaryColor}
                    description="Cor principal da sua marca"
                  />
                  <ColorPicker
                    label="Cor secundária"
                    value={secondaryColor}
                    onChange={setSecondaryColor}
                    description="Cor de apoio/destaque"
                  />
                </div>

                {/* Preview */}
                <div className="p-4 rounded-lg border border-border bg-card">
                  <p className="text-sm text-muted-foreground mb-3">Preview</p>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="text-white font-bold text-sm">IQ</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: primaryColor }}>
                        Texto primário
                      </p>
                      <p className="text-sm" style={{ color: secondaryColor }}>
                        Texto secundário
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Agendamento de Sessões
                </CardTitle>
                <CardDescription>
                  Configure o link para seus participantes agendarem sessões de feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="calendlyUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Calendly (ou similar)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://calendly.com/seu-usuario/sessao-feedback" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  Esta URL será exibida para seus participantes após completarem o diagnóstico, 
                  permitindo que agendem uma sessão de feedback individual com você.
                </p>
                {form.watch("calendlyUrl") && (
                  <a 
                    href={form.watch("calendlyUrl")} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Testar link
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Certificações</CardTitle>
                <CardDescription>
                  Liste suas certificações e formações relevantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Certificação XYZ"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCertification();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCertification}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert) => (
                      <Badge
                        key={cert}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(cert)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link to="/dashboard">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar alterações
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
