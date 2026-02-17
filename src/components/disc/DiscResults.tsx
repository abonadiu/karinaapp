import { useState, useRef } from "react";
import {
  Target,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  Heart,
  Search,
  Lightbulb,
  Calendar,
  MessageSquare,
  Zap,
  AlertTriangle,
  Star,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscProfileChart } from "./DiscProfileChart";
import {
  DiscDimensionScore,
  DiscProfile,
  DiscScores,
  calculateDiscScores,
  getDiscScoreLevel,
} from "@/lib/disc-scoring";
import {
  DISC_DIMENSIONS,
  getProfileDetail,
  getDiscRecommendations,
  getDiscActionPlan,
} from "@/lib/disc-descriptions";
import { FacilitatorProfile } from "@/hooks/useDiagnostic";
import { generateDiscPDF } from "@/lib/disc-pdf-generator";
import { toast } from "sonner";

interface DiscResultsProps {
  participantName: string;
  participantEmail?: string;
  accessToken?: string;
  discScores?: DiscScores;
  existingResult?: any;
  facilitatorProfile?: FacilitatorProfile | null;
}

export function DiscResults({
  participantName,
  participantEmail,
  accessToken,
  discScores: propScores,
  existingResult,
  facilitatorProfile,
}: DiscResultsProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Use existing result or prop scores
  const dimensionScores: DiscDimensionScore[] = existingResult
    ? Object.entries(existingResult.dimension_scores || {}).map(
      ([dim, score]: [string, any]) => {
        const key = dim.toUpperCase().charAt(0) === "D" || dim.toUpperCase().charAt(0) === "I" || dim.toUpperCase().charAt(0) === "S" || dim.toUpperCase().charAt(0) === "C"
          ? dim.toUpperCase().charAt(0)
          : dim;
        const normalizedKey = normalizeDimKey(dim);
        return {
          dimension: normalizedKey,
          dimensionLabel: DISC_DIMENSIONS[normalizedKey]?.name || dim,
          score: Number(score),
          maxScore: 5,
          percentage: Number(((Number(score) / 5) * 100).toFixed(1)),
          color: DISC_DIMENSIONS[normalizedKey]?.color || "#6B7280",
        };
      }
    )
    : propScores?.dimensionScores || [];

  // Sort to find profile
  const sorted = [...dimensionScores].sort((a, b) => b.score - a.score);
  const primary = sorted[0]?.dimension || "S";
  const secondary = sorted[1]?.dimension || "I";
  const profile = propScores?.profile || {
    primary,
    secondary,
    label: `${DISC_DIMENSIONS[primary]?.name} ${DISC_DIMENSIONS[secondary]?.name}`,
    description: "",
  };

  const totalScore = existingResult?.total_score || propScores?.totalScore || 0;
  const profileDetail = getProfileDetail(primary, secondary);
  const recommendations = getDiscRecommendations(primary, secondary, dimensionScores);
  const actionPlan = getDiscActionPlan(primary, secondary);

  const firstName = participantName.split(" ")[0];

  function normalizeDimKey(dim: string): string {
    const d = dim.toLowerCase();
    if (d === "d" || d.includes("domin")) return "D";
    if (d === "i" || d.includes("influen")) return "I";
    if (d === "s" || d.includes("estabil")) return "S";
    if (d === "c" || d.includes("conform") || d.includes("cautela")) return "C";
    return dim;
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateDiscPDF({
        participantName,
        dimensionScores,
        profile,
        profileDetail,
        recommendations,
        actionPlan,
        facilitatorName: facilitatorProfile?.full_name || undefined,
      });
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil DISC - ${participantName}`,
          text: `Meu perfil DISC: ${profile.label}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Target className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Perfil DISC
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Resultado de {firstName}
          </h1>
          <p className="text-muted-foreground">
            Análise de Perfil Comportamental DISC
          </p>
        </div>

        {/* Profile Summary Card */}
        <Card className="overflow-hidden">
          <div
            className="h-2"
            style={{
              background: `linear-gradient(to right, ${DISC_DIMENSIONS[primary]?.color || "#6B7280"}, ${DISC_DIMENSIONS[secondary]?.color || "#6B7280"})`,
            }}
          />
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile badge */}
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                  style={{
                    backgroundColor: DISC_DIMENSIONS[primary]?.color || "#6B7280",
                  }}
                >
                  {primary}
                  <span className="text-lg opacity-75">{secondary}</span>
                </div>
                <Badge className="mt-3 text-sm px-3 py-1" variant="secondary">
                  {profile.label}
                </Badge>
              </div>

              {/* Profile info */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <h2 className="text-2xl font-display font-bold">
                  {profileDetail.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.description}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-8">
              <DiscProfileChart scores={dimensionScores} size="lg" />
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* About DISC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              Sobre o Perfil DISC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              O DISC é uma das ferramentas de avaliação comportamental mais utilizadas no mundo.
              Baseado nos estudos de William Moulton Marston, o modelo mapeia quatro dimensões
              fundamentais do comportamento humano: Dominância, Influência, Estabilidade e
              Conformidade. Cada pessoa possui uma combinação única dessas dimensões, que influencia
              como se comunica, toma decisões e se relaciona com os outros.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["D", "I", "S", "C"].map((dim) => {
                const info = DISC_DIMENSIONS[dim];
                return (
                  <div
                    key={dim}
                    className="p-3 rounded-xl border text-center"
                    style={{ borderColor: info.color + "40" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2"
                      style={{ backgroundColor: info.color }}
                    >
                      {dim}
                    </div>
                    <p className="font-semibold text-sm">{info.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {info.tagline}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Your Profile Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Star className="h-5 w-5 text-primary" />
              Seu Perfil: {profileDetail.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              {profileDetail.summary}
            </p>

            {profileDetail.howYouWork && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Como Você Trabalha
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {profileDetail.howYouWork}
                </p>
              </div>
            )}

            {profileDetail.howYouLead && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Como Você Lidera
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {profileDetail.howYouLead}
                </p>
              </div>
            )}

            {profileDetail.howYouRelate && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-500" />
                  Como Você se Relaciona
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {profileDetail.howYouRelate}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dimension Details (Expandable) */}
        <div className="space-y-3">
          <h2 className="text-xl font-display font-bold px-1">
            Análise por Dimensão
          </h2>
          {dimensionScores.map((score) => {
            const info = DISC_DIMENSIONS[score.dimension];
            if (!info) return null;
            const level = getDiscScoreLevel(score.percentage);
            const isExpanded = expandedDimension === score.dimension;

            return (
              <Card key={score.dimension} className="overflow-hidden">
                <div
                  className="h-1"
                  style={{ backgroundColor: score.color }}
                />
                <button
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    setExpandedDimension(isExpanded ? null : score.dimension)
                  }
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: score.color }}
                  >
                    {score.dimension}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">
                        {info.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: score.color + "60",
                          color: score.color,
                        }}
                      >
                        {level.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${score.percentage}%`,
                            backgroundColor: score.color,
                          }}
                        />
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: score.color }}
                      >
                        {score.score.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 pb-6 px-5 space-y-5 border-t">
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      {info.about}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4" />
                          Pontos Fortes
                        </h4>
                        <ul className="space-y-1.5">
                          {info.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2"
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Challenges */}
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <h4 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-4 w-4" />
                          Pontos de Atenção
                        </h4>
                        <ul className="space-y-1.5">
                          {info.challenges.map((c, i) => (
                            <li
                              key={i}
                              className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2"
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Communication */}
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Comunicação
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {info.communication}
                      </p>
                    </div>

                    {/* Under Pressure */}
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Sob Pressão
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {info.underPressure}
                      </p>
                    </div>

                    {/* Ideal Environment */}
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        Ambiente Ideal
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {info.idealEnvironment}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lightbulb className="h-5 w-5 text-primary" />
                Recomendações de Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {rec.area}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {rec.frequency}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{rec.practice}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              Plano de Ação — 4 Semanas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionPlan.map((week) => (
              <div
                key={week.week}
                className="p-4 rounded-xl border bg-card"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {week.week}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      Semana {week.week}: {week.theme}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Meta: {week.goal}
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5 ml-10">
                  {week.activities.map((activity, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Growth Tips */}
        {profileDetail.growthTips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Dicas de Crescimento para {profileDetail.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {profileDetail.growthTips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-sm text-muted-foreground space-y-2">
          {facilitatorProfile?.full_name && (
            <p>
              Facilitado por{" "}
              <span className="font-semibold">
                {facilitatorProfile.full_name}
              </span>
            </p>
          )}
          <p>Perfil DISC via Karina Bonadiu &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
