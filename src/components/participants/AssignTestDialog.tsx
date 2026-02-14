import { useState, useEffect } from "react";
import { Brain, Target, Heart, Hash, Star, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TestType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  is_active: boolean;
}

interface AssignTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  participantName: string;
  onAssigned: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  hash: <Hash className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
};

export function AssignTestDialog({
  open,
  onOpenChange,
  participantId,
  participantName,
  onAssigned,
}: AssignTestDialogProps) {
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadTestTypes();
    }
  }, [open]);

  const loadTestTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("test_types")
      .select("*")
      .order("created_at");

    if (error) {
      toast.error("Erro ao carregar tipos de teste");
    } else {
      setTestTypes(data || []);
    }
    setLoading(false);
  };

  const handleAssign = async (testType: TestType) => {
    setAssigning(testType.id);
    try {
      const { error } = await supabase
        .from("participant_tests")
        .insert({
          participant_id: participantId,
          test_type_id: testType.id,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("Este teste já foi atribuído a este participante");
        } else {
          throw error;
        }
      } else {
        toast.success(`${testType.name} atribuído a ${participantName}!`);
        onAssigned();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao atribuir teste");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Teste</DialogTitle>
          <DialogDescription>
            Selecione um tipo de teste para {participantName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {testTypes.map((tt) => {
              return (
                <button
                  key={tt.id}
                  disabled={!tt.is_active || assigning === tt.id}
                  onClick={() => handleAssign(tt)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {assigning === tt.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      iconMap[tt.icon] || <Brain className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{tt.name}</span>
                      {!tt.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Em breve
                        </Badge>
                      )}
                    </div>
                    {tt.description && (
                      <p className="text-sm text-muted-foreground truncate">{tt.description}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
