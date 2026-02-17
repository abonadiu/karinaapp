import { useState, useMemo } from "react";
import { Search, Loader2, Download, FileText, Users } from "lucide-react";

import { ParticipantList } from "./ParticipantList";
import { ParticipantForm } from "./ParticipantForm";
import { AssignTestDialog } from "./AssignTestDialog";
import { ParticipantTestsList, useParticipantTestCounts } from "./ParticipantTestsList";
import { ParticipantResultModal } from "./ParticipantResultModal";
import { UnifiedReport } from "@/components/reports/UnifiedReport";
import { ComparativeReport } from "@/components/reports/ComparativeReport";
import { generateUnifiedPDF } from "@/lib/reports/unified-pdf-generator";
import { generateComparativePDF } from "@/lib/reports/comparative-pdf-generator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useParticipantActions, Participant } from "@/hooks/useParticipantActions";
import { DimensionScore } from "@/lib/diagnostic-scoring";
import { DiscResults } from "@/components/disc/DiscResults";
import { SoulPlanResults } from "@/components/soul-plan/SoulPlanResults";
import { AstralChartResults } from "@/components/astral-chart/AstralChartResults";
import { generateAstralChartPDF } from "@/lib/astral-chart-pdf-generator";
import { AstralChartResult } from "@/lib/astral-chart-calculator";
import { getAllAdapters } from "@/lib/reports/test-adapter-registry";
import { toast } from "sonner";

interface ParticipantManagerProps {
  participants: Participant[];
  onRefresh: () => void;
  isLoading: boolean;
  companyId?: string;
  showStatusFilter?: boolean;
  showSearch?: boolean;
}

export function ParticipantManager({
  participants,
  onRefresh,
  isLoading,
  companyId,
  showStatusFilter = true,
  showSearch = true,
}: ParticipantManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetTab, setSheetTab] = useState<"testes" | "unificado">("testes");

  // Comparative report state
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparativeDialog, setShowComparativeDialog] = useState(false);
  const [comparativeTestSlug, setComparativeTestSlug] = useState<string>("");

  const actions = useParticipantActions(onRefresh);

  const participantIds = useMemo(() => participants.map(p => p.id), [participants]);
  const testCounts = useParticipantTestCounts(participantIds);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const matchesSearch =
        !searchTerm ||
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || participant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [participants, searchTerm, statusFilter]);

  // KPI counts
  const totalCount = participants.length;
  const pendingCount = participants.filter(p => p.status === "pending").length;
  const inProgressCount = participants.filter(p => p.status === "in_progress").length;
  const completedCount = participants.filter(p => p.status === "completed").length;

  // Toggle participant selection for comparison
  const toggleComparison = (participantId: string) => {
    setSelectedForComparison(prev => {
      const next = new Set(prev);
      if (next.has(participantId)) next.delete(participantId);
      else next.add(participantId);
      return next;
    });
  };

  const clearComparison = () => {
    setSelectedForComparison(new Set());
  };

  const openComparativeReport = () => {
    if (selectedForComparison.size < 2) {
      toast.error("Selecione pelo menos 2 participantes para comparar.");
      return;
    }
    // Default to first available adapter
    const adapters = getAllAdapters();
    if (adapters.length > 0) {
      setComparativeTestSlug(adapters[0].slug);
    }
    setShowComparativeDialog(true);
  };

  // Reset sheet tab when opening a new participant
  const handleRowClickWithReset = (participant: Participant) => {
    setSheetTab("testes");
    actions.handleRowClick(participant);
  };

  return (
    <div className="space-y-4">
      {/* Search + Status Filter */}
      {(showSearch || showStatusFilter) && (
        <div className="flex flex-wrap gap-3 items-center">
          {showSearch && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar participantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {showStatusFilter && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="invited">Convidado</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Comparative report button */}
          {selectedForComparison.size >= 2 && (
            <Button
              variant="default"
              size="sm"
              onClick={openComparativeReport}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Comparar ({selectedForComparison.size})
            </Button>
          )}
          {selectedForComparison.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearComparison}
            >
              Limpar seleção
            </Button>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`bg-card rounded-lg border p-4 text-left cursor-pointer hover:border-primary/50 transition-colors ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
        >
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{totalCount}</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
          className={`bg-card rounded-lg border p-4 text-left cursor-pointer hover:border-primary/50 transition-colors ${statusFilter === "pending" ? "ring-2 ring-primary" : ""}`}
        >
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")}
          className={`bg-card rounded-lg border p-4 text-left cursor-pointer hover:border-primary/50 transition-colors ${statusFilter === "in_progress" ? "ring-2 ring-primary" : ""}`}
        >
          <p className="text-sm text-muted-foreground">Em andamento</p>
          <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
          className={`bg-card rounded-lg border p-4 text-left cursor-pointer hover:border-primary/50 transition-colors ${statusFilter === "completed" ? "ring-2 ring-primary" : ""}`}
        >
          <p className="text-sm text-muted-foreground">Concluídos</p>
          <p className="text-2xl font-bold text-foreground">{completedCount}</p>
        </button>
      </div>

      {/* Participant List */}
      <ParticipantList
        participants={filteredParticipants}
        onEdit={(p) => actions.setEditingParticipant(p)}
        onDelete={(p) => actions.setDeletingParticipant(p)}
        onInvite={actions.handleInviteParticipant}
        onReminder={actions.handleReminderParticipant}
        onRowClick={handleRowClickWithReset}
        onAssignTest={actions.handleAssignTest}
        isLoading={isLoading}
        sendingInviteId={actions.sendingInviteId}
        sendingReminderId={actions.sendingReminderId}
        testCounts={testCounts}
        selectedForComparison={selectedForComparison}
        onToggleComparison={toggleComparison}
      />

      {/* Edit participant form */}
      <ParticipantForm
        open={!!actions.editingParticipant}
        onOpenChange={(open) => !open && actions.setEditingParticipant(null)}
        onSubmit={actions.handleEditParticipant}
        defaultValues={
          actions.editingParticipant
            ? {
              name: actions.editingParticipant.name,
              email: actions.editingParticipant.email,
              phone: actions.editingParticipant.phone || "",
              department: actions.editingParticipant.department || "",
              position: actions.editingParticipant.position || "",
            }
            : undefined
        }
        isEditing
        isLoading={actions.isSaving}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!actions.deletingParticipant}
        onOpenChange={(open) => !open && actions.setDeletingParticipant(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir participante?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{actions.deletingParticipant?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.handleDeleteParticipant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign test dialog */}
      {actions.assigningParticipant && (
        <AssignTestDialog
          open={!!actions.assigningParticipant}
          onOpenChange={(open) => !open && actions.setAssigningParticipant(null)}
          participantId={actions.assigningParticipant.id}
          participantName={actions.assigningParticipant.name}
          onAssigned={onRefresh}
        />
      )}

      {/* Result sheet with tabs (Testes / Relatório Unificado) */}
      <Sheet
        open={!!actions.selectedParticipant}
        onOpenChange={(open) => !open && actions.setSelectedParticipant(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-6">
          <SheetHeader className="sr-only">
            <SheetTitle>{actions.selectedParticipant?.name}</SheetTitle>
            <SheetDescription>Detalhes do participante</SheetDescription>
          </SheetHeader>

          {actions.selectedParticipant && (
            <div className="space-y-6">
              {/* Participant info header */}
              <div>
                <h2 className="text-xl font-semibold text-foreground">{actions.selectedParticipant.name}</h2>
                <p className="text-sm text-muted-foreground">{actions.selectedParticipant.email}</p>
              </div>

              {/* Tabs: Testes | Relatório Unificado */}
              <Tabs value={sheetTab} onValueChange={(v) => setSheetTab(v as "testes" | "unificado")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="testes" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Testes
                  </TabsTrigger>
                  <TabsTrigger value="unificado" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Relatório Unificado
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Individual Tests */}
                <TabsContent value="testes" className="space-y-6 mt-4">
                  {/* Tests list */}
                  <ParticipantTestsList
                    participantId={actions.selectedParticipant.id}
                    participantName={actions.selectedParticipant.name}
                    onViewResult={actions.handleViewTestResult}
                  />

                  {/* Test result view */}
                  {actions.isLoadingTestResult && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {actions.selectedTestResult && !actions.isLoadingTestResult && (
                    <div className="mt-4">
                      {actions.selectedTestTypeSlug === "mapa_da_alma" ? (
                        <SoulPlanResults
                          participantName={actions.selectedParticipant.name}
                          existingResult={actions.selectedTestResult}
                        />
                      ) : actions.selectedTestTypeSlug === "disc" ? (
                        <>
                          <div className="flex justify-end mb-4">
                            <Button
                              onClick={() =>
                                actions.handleGenerateDiscPDF(
                                  actions.selectedParticipant!.name,
                                  actions.selectedTestResult
                                )
                              }
                              disabled={actions.isGeneratingDiscPDF}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {actions.isGeneratingDiscPDF ? "Gerando..." : "Exportar PDF"}
                            </Button>
                          </div>
                          <DiscResults
                            participantName={actions.selectedParticipant.name}
                            existingResult={actions.selectedTestResult}
                          />
                        </>
                      ) : actions.selectedTestTypeSlug === "mapa_astral" ? (
                        (() => {
                          const chartResult = actions.selectedTestResult?.exercises_data?.fullResult as AstralChartResult | undefined;
                          if (!chartResult || !chartResult.planets) {
                            return (
                              <p className="text-center text-muted-foreground py-8">
                                Dados do mapa astral não encontrados.
                              </p>
                            );
                          }
                          const handleAstralPDF = async () => {
                            try {
                              await generateAstralChartPDF({
                                participantName: actions.selectedParticipant!.name,
                                result: chartResult,
                              });
                            } catch (error) {
                              console.error("Erro ao gerar PDF:", error);
                            }
                          };
                          return (
                            <AstralChartResults
                              participantName={actions.selectedParticipant.name}
                              result={chartResult}
                              onDownloadPDF={handleAstralPDF}
                            />
                          );
                        })()
                      ) : (
                        <ParticipantResultModal
                          participantName={actions.selectedParticipant.name}
                          completedAt={actions.selectedTestResult.completed_at}
                          totalScore={Number(actions.selectedTestResult.total_score)}
                          dimensionScores={
                            Object.entries(actions.selectedTestResult.dimension_scores as Record<string, any>).map(
                              ([dimension, data]) => ({
                                dimension,
                                dimensionOrder: typeof data === 'object' ? ((data as any).dimensionOrder ?? 0) : 0,
                                score: typeof data === 'number' ? data : ((data as any).score ?? 0),
                                maxScore: typeof data === 'object' ? ((data as any).maxScore ?? 5) : 5,
                                percentage: typeof data === 'object' ? ((data as any).percentage ?? 0) : 0,
                              })
                            ) as DimensionScore[]
                          }
                          testTypeSlug={actions.selectedTestTypeSlug || undefined}
                        />
                      )}
                    </div>
                  )}

                  {/* Legacy result view */}
                  {actions.selectedParticipant.status === "completed" && (
                    actions.isLoadingResult ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : actions.selectedResult ? (
                      <>
                        {actions.allResults.length > 1 && (
                          <div className="mb-4">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">
                              Selecionar diagnóstico ({actions.allResults.length} realizados)
                            </label>
                            <Select
                              value={actions.selectedResult.id}
                              onValueChange={(id) => {
                                const found = actions.allResults.find((r: any) => r.id === id);
                                if (found) actions.setSelectedResult(found);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {actions.allResults.map((r: any, idx: number) => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {new Date(r.completed_at).toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}{" "}
                                    — Score: {Number(r.total_score).toFixed(1)}
                                    {idx === 0 ? " (mais recente)" : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <ParticipantResultModal
                          participantName={actions.selectedParticipant.name}
                          completedAt={actions.selectedResult.completed_at}
                          totalScore={Number(actions.selectedResult.total_score)}
                          dimensionScores={
                            Object.entries(actions.selectedResult.dimension_scores as Record<string, any>).map(
                              ([dimension, data]) => ({
                                dimension,
                                dimensionOrder: (data as any).dimensionOrder ?? 0,
                                score: (data as any).score ?? 0,
                                maxScore: (data as any).maxScore ?? 5,
                                percentage: (data as any).percentage ?? 0,
                              })
                            ) as DimensionScore[]
                          }
                        />
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Resultado não encontrado.
                      </p>
                    )
                  )}
                </TabsContent>

                {/* Tab: Unified Report */}
                <TabsContent value="unificado" className="mt-4">
                  <UnifiedReport
                    participantId={actions.selectedParticipant.id}
                    participantName={actions.selectedParticipant.name}
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
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Comparative Report Dialog */}
      <Dialog open={showComparativeDialog} onOpenChange={setShowComparativeDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório Comparativo</DialogTitle>
            <DialogDescription>
              Comparação entre {selectedForComparison.size} participantes selecionados
            </DialogDescription>
          </DialogHeader>

          {/* Test type selector */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Comparar por teste:
            </label>
            <Select value={comparativeTestSlug} onValueChange={setComparativeTestSlug}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione o teste" />
              </SelectTrigger>
              <SelectContent>
                {getAllAdapters().map(adapter => (
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
