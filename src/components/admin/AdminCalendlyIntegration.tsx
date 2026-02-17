import { useState, useEffect } from "react";
import {
  Calendar,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Json } from "@/integrations/supabase/types";

interface CalendlySettings {
  enabled: boolean;
  signing_key: string | null;
  last_sync: string | null;
  events_count: number;
}

export function AdminCalendlyIntegration() {
  const [settings, setSettings] = useState<CalendlySettings>({
    enabled: false,
    signing_key: null,
    last_sync: null,
    events_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signingKeyInput, setSigningKeyInput] = useState("");

  const webhookUrl = `https://dlsnflfqemavnhavtaxe.supabase.co/functions/v1/calendly-webhook`;

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "calendly_integration")
        .single();

      if (error) throw error;

      const value = data?.value as unknown as CalendlySettings;
      setSettings(value);
      setSigningKeyInput(value.signing_key || "");
    } catch (error) {
      console.error("Error fetching Calendly settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("URL copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newSettings: CalendlySettings = {
        ...settings,
        signing_key: signingKeyInput || null,
      };

      const { error } = await supabase
        .from("system_settings")
        .update({
          value: newSettings as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq("key", "calendly_integration");

      if (error) throw error;

      setSettings(newSettings);
      toast.success("Configurações salvas!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const newSettings = { ...settings, enabled };

      const { error } = await supabase
        .from("system_settings")
        .update({
          value: newSettings as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq("key", "calendly_integration");

      if (error) throw error;

      setSettings(newSettings);
      toast.success(enabled ? "Integração ativada!" : "Integração desativada!");
    } catch (error) {
      console.error("Error toggling integration:", error);
      toast.error("Erro ao alterar status");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Integração Calendly</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={settings.enabled ? "default" : "secondary"}>
              {settings.enabled ? "Ativo" : "Inativo"}
            </Badge>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggleEnabled}
              disabled={isSaving}
            />
          </div>
        </div>
        <CardDescription>
          Receba automaticamente agendamentos de sessões de feedback via Calendly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Webhook URL */}
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              readOnly
              className="font-mono text-xs bg-muted"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyUrl}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Cole esta URL nas configurações de webhook do Calendly
          </p>
        </div>

        {/* Signing Key */}
        <div className="space-y-2">
          <Label htmlFor="signingKey">Signing Key do Calendly</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="signingKey"
                type={showKey ? "text" : "password"}
                value={signingKeyInput}
                onChange={(e) => setSigningKeyInput(e.target.value)}
                placeholder="Cole a signing key do webhook"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            A signing key é usada para validar a autenticidade dos webhooks
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Eventos Registrados</span>
              <Badge variant="outline">{settings.events_count}</Badge>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Última Sincronização</span>
              <span className="text-sm">
                {settings.last_sync
                  ? formatDistanceToNow(new Date(settings.last_sync), {
                    addSuffix: true,
                    locale: ptBR,
                  })
                  : "Nunca"}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Como configurar:</strong>
            <ol className="mt-2 ml-4 list-decimal space-y-1">
              <li>Acesse o painel do Calendly → Integrações → Webhooks</li>
              <li>Clique em "Create Webhook"</li>
              <li>Cole a Webhook URL acima</li>
              <li>Selecione os eventos: <code className="text-xs bg-muted px-1 rounded">invitee.created</code> e <code className="text-xs bg-muted px-1 rounded">invitee.canceled</code></li>
              <li>Copie a Signing Key gerada e cole acima</li>
              <li>Ative a integração usando o botão acima</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href="https://calendly.com/integrations/api_webhooks"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Calendly
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
