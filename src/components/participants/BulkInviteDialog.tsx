import { useState } from "react";
import { Mail, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Participant {
  id: string;
  name: string;
  email: string;
  status: string;
  access_token?: string;
}

interface BulkInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  onComplete: () => void;
}

interface InviteResult {
  participantId: string;
  participantName: string;
  participantEmail: string;
  success: boolean;
  error?: string;
}

type DialogState = "confirm" | "sending" | "complete";

export function BulkInviteDialog({
  open,
  onOpenChange,
  participants,
  onComplete,
}: BulkInviteDialogProps) {
  const [state, setState] = useState<DialogState>("confirm");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<InviteResult[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<string>("");

  const pendingParticipants = participants.filter((p) => p.status === "pending");
  const alreadyInvited = participants.filter((p) => p.status === "invited");

  const resetState = () => {
    setState("confirm");
    setProgress(0);
    setResults([]);
    setCurrentParticipant("");
  };

  const handleClose = () => {
    if (state === "sending") return; // Prevent closing during send
    resetState();
    onOpenChange(false);
  };

  const handleStartSending = async () => {
    if (pendingParticipants.length === 0) return;

    setState("sending");
    setProgress(0);
    setResults([]);

    const newResults: InviteResult[] = [];
    let processed = 0;

    for (const participant of pendingParticipants) {
      setCurrentParticipant(participant.name);

      try {
        // 1. Fetch access_token
        const { data: participantData, error: fetchError } = await supabase
          .from("participants")
          .select("access_token")
          .eq("id", participant.id)
          .single();

        if (fetchError || !participantData?.access_token) {
          throw new Error("Token não encontrado");
        }

        // 2. Build diagnostic URL
        const diagnosticUrl = `${window.location.origin}/diagnostico/${participantData.access_token}`;

        // 3. Call edge function
        const { error: invokeError } = await supabase.functions.invoke("send-invite", {
          body: {
            participantName: participant.name,
            participantEmail: participant.email,
            diagnosticUrl,
          },
        });

        if (invokeError) {
          throw invokeError;
        }

        // 4. Update participant status
        const { error: updateError } = await supabase
          .from("participants")
          .update({
            status: "invited",
            invited_at: new Date().toISOString(),
          })
          .eq("id", participant.id);

        if (updateError) {
          throw updateError;
        }

        newResults.push({
          participantId: participant.id,
          participantName: participant.name,
          participantEmail: participant.email,
          success: true,
        });
      } catch (error: any) {
        newResults.push({
          participantId: participant.id,
          participantName: participant.name,
          participantEmail: participant.email,
          success: false,
          error: error.message || "Erro desconhecido",
        });
      }

      processed++;
      setProgress(Math.round((processed / pendingParticipants.length) * 100));
      setResults([...newResults]);
    }

    setState("complete");
    setCurrentParticipant("");
  };

  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;
  const failedResults = results.filter((r) => !r.success);

  const handleFinish = () => {
    onComplete();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Convites em Massa
          </DialogTitle>
          <DialogDescription>
            {state === "confirm" && "Envie convites para todos os participantes pendentes."}
            {state === "sending" && "Enviando convites..."}
            {state === "complete" && "Envio concluído!"}
          </DialogDescription>
        </DialogHeader>

        {state === "confirm" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Pendentes (serão convidados)</span>
              <span className="font-semibold text-foreground">{pendingParticipants.length}</span>
            </div>
            
            {alreadyInvited.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Já convidados (ignorados)</span>
                <span className="font-medium text-muted-foreground">{alreadyInvited.length}</span>
              </div>
            )}

            {pendingParticipants.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-600 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Não há participantes pendentes para convidar.</span>
              </div>
            )}
          </div>
        )}

        {state === "sending" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {currentParticipant && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enviando para: {currentParticipant}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                {successCount} enviados
              </span>
              {failedCount > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-4 w-4" />
                  {failedCount} falhas
                </span>
              )}
            </div>
          </div>
        )}

        {state === "complete" && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-4 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-2xl font-bold text-green-600">{successCount}</span>
                <span className="text-sm text-muted-foreground">Enviados</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 bg-destructive/10 rounded-lg">
                <XCircle className="h-8 w-8 text-destructive mb-2" />
                <span className="text-2xl font-bold text-destructive">{failedCount}</span>
                <span className="text-sm text-muted-foreground">Falhas</span>
              </div>
            </div>

            {failedResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">Falhas:</p>
                <ScrollArea className="h-32 rounded-md border p-2">
                  {failedResults.map((result) => (
                    <div key={result.participantId} className="py-1 text-sm">
                      <span className="font-medium">{result.participantName}</span>
                      <span className="text-muted-foreground"> - {result.error}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {state === "confirm" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleStartSending} 
                disabled={pendingParticipants.length === 0}
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar {pendingParticipants.length} Convite{pendingParticipants.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}

          {state === "sending" && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </Button>
          )}

          {state === "complete" && (
            <Button onClick={handleFinish}>
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
