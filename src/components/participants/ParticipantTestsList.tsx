import { useState, useEffect } from "react";
import { Brain, Target, Heart, Hash, Star, Loader2, Copy, Mail, Eye, Bell } from "lucide-react";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

interface ParticipantTestWithType {
  id: string;
  participant_id: string;
  test_type_id: string;
  access_token: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  invited_at: string | null;
  test_types: {
    slug: string;
    name: string;
    icon: string;
  };
}

interface ParticipantTestsListProps {
  participantId: string;
  participantName: string;
  onViewResult?: (participantTestId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="h-4 w-4" />,
  target: <Target className="h-4 w-4" />,
  heart: <Heart className="h-4 w-4" />,
  hash: <Hash className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
};

export function ParticipantTestsList({
  participantId,
  participantName,
  onViewResult,
}: ParticipantTestsListProps) {
  const [tests, setTests] = useState<ParticipantTestWithType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, [participantId]);

  const loadTests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("participant_tests")
      .select("*, test_types(slug, name, icon)")
      .eq("participant_id", participantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading tests:", error);
    } else {
      setTests((data || []) as any);
    }
    setLoading(false);
  };

  const copyLink = (accessToken: string) => {
    const publishedOrigin = "https://karinabonadiu.lovable.app";
    const url = `${publishedOrigin}/diagnostico/${accessToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Nenhum teste atribuído ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Testes Atribuídos ({tests.length})
      </h4>
      {tests.map((test) => (
        <div
          key={test.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            {iconMap[test.test_types?.icon] || <Brain className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{test.test_types?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={test.status as any} />
              {test.completed_at && (
                <span className="text-sm text-muted-foreground">
                  {new Date(test.completed_at).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => copyLink(test.access_token)}
              title="Copiar link"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {test.status === "completed" && onViewResult && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onViewResult(test.id)}
                title="Ver resultado"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function useParticipantTestCounts(participantIds: string[]) {
  const [counts, setCounts] = useState<Record<string, { total: number; completed: number }>>({});

  useEffect(() => {
    if (participantIds.length === 0) return;

    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("participant_tests")
        .select("participant_id, status")
        .in("participant_id", participantIds);

      if (error) {
        console.error("Error fetching test counts:", error);
        return;
      }

      const result: Record<string, { total: number; completed: number }> = {};
      (data || []).forEach((row) => {
        if (!result[row.participant_id]) {
          result[row.participant_id] = { total: 0, completed: 0 };
        }
        result[row.participant_id].total++;
        if (row.status === "completed") {
          result[row.participant_id].completed++;
        }
      });
      setCounts(result);
    };

    fetchCounts();
  }, [participantIds.join(",")]);

  return counts;
}
