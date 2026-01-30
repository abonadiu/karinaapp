import { useState, useEffect } from "react";
import { 
  Settings, 
  Save,
  Loader2,
  Mail,
  Bell,
  Palette,
  RefreshCw,
  Link2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminCalendlyIntegration } from "./AdminCalendlyIntegration";

interface SystemSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_at: string;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [platformName, setPlatformName] = useState("");
  const [platformTagline, setPlatformTagline] = useState("");
  const [inviteSubject, setInviteSubject] = useState("");
  const [reminderSubject, setReminderSubject] = useState("");
  const [daysAfterInvite, setDaysAfterInvite] = useState(3);
  const [daysBetweenReminders, setDaysBetweenReminders] = useState(3);
  const [maxReminders, setMaxReminders] = useState(3);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      
      const typedData = (data || []) as SystemSetting[];
      setSettings(typedData);

      // Parse settings into form values
      typedData.forEach((setting) => {
        const val = setting.value as Record<string, unknown>;
        switch (setting.key) {
          case 'platform_name':
            setPlatformName((val.name as string) || "");
            setPlatformTagline((val.tagline as string) || "");
            break;
          case 'email_templates':
            setInviteSubject((val.invite_subject as string) || "");
            setReminderSubject((val.reminder_subject as string) || "");
            break;
          case 'reminder_settings':
            setDaysAfterInvite((val.days_after_invite as number) || 3);
            setDaysBetweenReminders((val.days_between_reminders as number) || 3);
            setMaxReminders((val.max_reminders as number) || 3);
            break;
        }
      });
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const results = await Promise.all([
        saveSetting('platform_name', { name: platformName, tagline: platformTagline }),
        saveSetting('email_templates', { invite_subject: inviteSubject, reminder_subject: reminderSubject }),
        saveSetting('reminder_settings', { 
          days_after_invite: daysAfterInvite, 
          days_between_reminders: daysBetweenReminders, 
          max_reminders: maxReminders 
        }),
      ]);

      if (results.every(Boolean)) {
        toast.success("Configurações salvas com sucesso!");
        fetchSettings();
      } else {
        toast.error("Erro ao salvar algumas configurações");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Configurações do Sistema</h2>
          <p className="text-sm text-muted-foreground">
            Parâmetros globais da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Tudo
          </Button>
        </div>
      </div>

      {/* Platform Settings */}
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Identidade da Plataforma
          </CardTitle>
          <CardDescription>
            Nome e descrição exibidos na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platformName">Nome da Plataforma</Label>
              <Input
                id="platformName"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="Plataforma IQ+IS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformTagline">Tagline</Label>
              <Input
                id="platformTagline"
                value={platformTagline}
                onChange={(e) => setPlatformTagline(e.target.value)}
                placeholder="Diagnóstico de Inteligência Emocional"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Templates de Email
          </CardTitle>
          <CardDescription>
            Assuntos dos emails enviados pela plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inviteSubject">Assunto do Convite</Label>
              <Input
                id="inviteSubject"
                value={inviteSubject}
                onChange={(e) => setInviteSubject(e.target.value)}
                placeholder="Convite para Diagnóstico IQ+IS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderSubject">Assunto do Lembrete</Label>
              <Input
                id="reminderSubject"
                value={reminderSubject}
                onChange={(e) => setReminderSubject(e.target.value)}
                placeholder="Lembrete: Complete seu diagnóstico"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Lembretes
          </CardTitle>
          <CardDescription>
            Parâmetros para envio automático de lembretes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="daysAfterInvite">Dias após convite</Label>
              <Input
                id="daysAfterInvite"
                type="number"
                min={1}
                max={30}
                value={daysAfterInvite}
                onChange={(e) => setDaysAfterInvite(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Dias até o primeiro lembrete
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysBetweenReminders">Dias entre lembretes</Label>
              <Input
                id="daysBetweenReminders"
                type="number"
                min={1}
                max={30}
                value={daysBetweenReminders}
                onChange={(e) => setDaysBetweenReminders(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Intervalo entre lembretes
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxReminders">Máximo de lembretes</Label>
              <Input
                id="maxReminders"
                type="number"
                min={1}
                max={10}
                value={maxReminders}
                onChange={(e) => setMaxReminders(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Limite de lembretes por participante
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Integrações
          </CardTitle>
          <CardDescription>
            Conexões com serviços externos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminCalendlyIntegration />
        </CardContent>
      </Card>
    </div>
  );
}
