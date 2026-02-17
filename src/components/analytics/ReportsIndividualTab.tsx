import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, FileText, Users, Building2, ChevronRight } from "lucide-react";

import { UnifiedReport } from "@/components/reports/UnifiedReport";
import { ComparativeReport } from "@/components/reports/ComparativeReport";
import { generateUnifiedPDF } from "@/lib/reports/unified-pdf-generator";
import { generateComparativePDF } from "@/lib/reports/comparative-pdf-generator";
import { getAllAdapters } from "@/lib/reports/test-adapter-registry";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { supabase } from "@/integrations/backend/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  email: string;
  department: string | null;
  company_id: string;
  status: string;
}

interface Company {
  id: string;
  name: string;
}

interface ReportsIndividualTabProps {
  companies: Company[];
}

export function ReportsIndividualTab({ companies }: ReportsIndividualTabProps) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [testCounts, setTestCounts] = useState<Record<string, { total: number; completed: number }>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Unified report dialog
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Comparative report
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparativeDialog, setShowComparativeDialog] = useState(false);
  const [comparativeTestSlug, setComparativeTestSlug] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: participantsData } = await supabase
        .from("participants")
        .select("id, name, email, department, company_id, status")
        .order("name");

      const participantsList = (participantsData || []) as Participant[];
      setParticipants(participantsList);

      // Fetch test counts
      if (participantsList.length > 0) {
        const { data: testsData } = await supabase
          .from("participant_tests")
          .select("participant_id, status");

        if (testsData) {
          const counts: Record<string, { total: number; completed: number }> = {};
          testsData.forEach((t: any) => {
            if (!counts[t.participant_id]) {
              counts[t.participant_id] = { total: 0, completed: 0 };
            }
            counts[t.participant_id].total++;
            if (t.status === "completed") {
              counts[t.participant_id].completed++;
            }
          });
          setTestCounts(counts);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar participantes");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter participants - only those with completed tests
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = companyFilter === "all" || p.company_id === companyFilter;

      const counts = testCounts[p.id];
      const hasCompletedTests = counts && counts.completed > 0;

      return matchesSearch && matchesCompany && hasCompletedTests;
    });
  }, [participants, searchTerm, companyFilter, testCounts]);

  // Company name lookup
  const companyNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    companies.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [companies]);

  // Toggle comparison selection
  const toggleComparison = (participantId: string) => {
    setSelectedForComparison((prev) => {
      const next = new Set(prev);
      if (next.has(participantId)) next.delete(participantId);
      else next.add(participantId);
      return next;
    });
  };

  const clearComparison = () => setSelectedForComparison(new Set());

  const openComparativeReport = () => {
    if (selectedForComparison.size < 2) {
      toast.error("Selecione pelo menos 2 participantes para comparar.");
      return;
    }
    const adapters = getAllAdapters();
    if (adapters.length > 0) {
      setComparativeTestSlug(adapters[0].slug);
    }
    setShowComparativeDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalWithTests = Object.values(testCounts).filter((c) => c.completed > 0).length;

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">
            {totalWithTests} participante{totalWithTests !== 1 ? "s" : ""} com testes concluídos
          </p>
          <p className="text-xs text-muted-foreground">
            Clique em um participante para ver o Relatório Unificado. Marque vários para comparar.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[200px]">
            <Building2 className="h-4 w-4 mr-2 shrink-0" />
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas empresas</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Comparative buttons */}
        {selectedForComparison.size >= 2 && (
          <Button variant="default" size="sm" onClick={openComparativeReport} className="gap-2">
            <Users className="h-4 w-4" />
            Comparar ({selectedForComparison.size})
          </Button>
        )}
        {selectedForComparison.size > 0 && (
          <Button variant="ghost" size="sm" onClick={clearComparison}>
            Limpar seleção
          </Button>
        )}
      </div>

      {/* Participants table */}
      {filteredParticipants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            Nenhum participante encontrado
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || companyFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Nenhum participante concluiu testes ainda"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <span className="sr-only">Selecionar</span>
                </TableHead>
                <TableHead>Participante</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Testes Concluídos</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => {
                const counts = testCounts[participant.id];
                const isSelected = selectedForComparison.has(participant.id);
                return (
                  <TableRow
                    key={participant.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedParticipant(participant)}
                  >
                    <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleComparison(participant.id)}
                        aria-label={`Selecionar ${participant.name} para comparação`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {companyNameMap[participant.company_id] || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {participant.department || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {counts ? (
                        <Badge variant="secondary" className="text-xs">
                          {counts.completed}/{counts.total}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Unified Report Dialog */}
      <Dialog
        open={!!selectedParticipant}
        onOpenChange={(open) => !open && setSelectedParticipant(null)}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório Unificado — {selectedParticipant?.name}</DialogTitle>
            <DialogDescription>
              Visão consolidada de todos os testes com análise cruzada via IA
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <UnifiedReport
              participantId={selectedParticipant.id}
              participantName={selectedParticipant.name}
              onGeneratePDF={async (data, crossAnalysis) => {
                try {
                  await generateUnifiedPDF(data, crossAnalysis);
                  toast.success("PDF do Relatório Unificado gerado com sucesso!");
                } catch (error) {
                  console.error("Erro ao gerar PDF unificado:", error);
                  toast.error("Erro ao gerar PDF. Tente novamente.");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Comparative Report Dialog */}
      <Dialog open={showComparativeDialog} onOpenChange={setShowComparativeDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório Comparativo</DialogTitle>
            <DialogDescription>
              Comparação entre {selectedForComparison.size} participantes selecionados
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Comparar por teste:
            </label>
            <Select value={comparativeTestSlug} onValueChange={setComparativeTestSlug}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione o teste" />
              </SelectTrigger>
              <SelectContent>
                {getAllAdapters().map((adapter) => (
                  <SelectItem key={adapter.slug} value={adapter.slug}>
                    {adapter.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {comparativeTestSlug && (
            <ComparativeReport
              participantIds={Array.from(selectedForComparison)}
              testSlug={comparativeTestSlug}
              onGeneratePDF={async (data) => {
                try {
                  await generateComparativePDF(data);
                  toast.success("PDF do Relatório Comparativo gerado com sucesso!");
                } catch (error) {
                  console.error("Erro ao gerar PDF comparativo:", error);
                  toast.error("Erro ao gerar PDF. Tente novamente.");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
