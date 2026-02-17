import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Star, Sparkles, Eye, Heart, Target, Compass, Sun, Moon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import StarOfCreation from './StarOfCreation';
import type { SoulPlanResult, SoulPlanPosition } from '@/lib/soul-plan-calculator';
import { calculateSoulPlan, getPositionInterpretation, POSITION_COLORS, POSITION_LABELS_PT } from '@/lib/soul-plan-calculator';
import { generateSoulPlanPDF } from '@/lib/soul-plan-pdf-generator';
import type { FacilitatorProfile } from '@/hooks/useDiagnostic';

interface SoulPlanResultsProps {
  participantName: string;
  soulPlanResult?: SoulPlanResult;
  existingResult?: any;
  facilitatorProfile?: FacilitatorProfile | null;
}

const POSITION_ICONS: Record<string, React.ReactNode> = {
  worldlyChallenge: <Target className="h-5 w-5" />,
  spiritualChallenge: <Moon className="h-5 w-5" />,
  worldlyTalent: <Sun className="h-5 w-5" />,
  spiritualTalent: <Sparkles className="h-5 w-5" />,
  worldlyGoal: <Compass className="h-5 w-5" />,
  spiritualGoal: <Star className="h-5 w-5" />,
  soulDestiny: <Heart className="h-5 w-5" />,
};

const PositionCard: React.FC<{
  positionKey: string;
  position: SoulPlanPosition;
  isShortName: boolean;
}> = ({ positionKey, position, isShortName }) => {
  const [expanded, setExpanded] = useState(false);
  const energy = position.energy;
  const color = POSITION_COLORS[positionKey] || '#B8860B';
  const label = isShortName ? position.labelPt : POSITION_LABELS_PT[positionKey];
  const icon = POSITION_ICONS[positionKey];
  const interpretation = energy ? getPositionInterpretation(energy, positionKey) : '';

  return (
    <Card className="border-l-4 transition-all hover:shadow-md" style={{ borderLeftColor: color }}>
      <CardHeader
        className="cursor-pointer pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg" style={{ color }}>
                {label}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-sm font-bold"
                  style={{ borderColor: color, color }}
                >
                  {position.pair}
                </Badge>
                {energy && (
                  <span className="text-sm text-muted-foreground">
                    {energy.hebrewLetter} — {energy.vibration}
                  </span>
                )}
              </div>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {expanded && energy && (
        <CardContent className="pt-0 space-y-4">
          <Tabs defaultValue="interpretation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="interpretation">Interpretação</TabsTrigger>
              <TabsTrigger value="attributes">Atributos</TabsTrigger>
              <TabsTrigger value="healing">Cura</TabsTrigger>
            </TabsList>

            <TabsContent value="interpretation" className="space-y-3 mt-3">
              {interpretation && (
                <div className="bg-warm-cream/50 rounded-xl p-4">
                  <p className="text-base leading-relaxed">{interpretation}</p>
                </div>
              )}
              {energy.symbol && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Simbolismo</h4>
                  <p className="text-sm leading-relaxed">{energy.symbol}</p>
                </div>
              )}
              {energy.planet && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Planeta/Signo</h4>
                  <p className="text-sm">{energy.planet}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="attributes" className="space-y-3 mt-3">
              {energy.positiveAttributes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-700 mb-2">Atributos Positivos</h4>
                  <div className="flex flex-wrap gap-2">
                    {energy.positiveAttributes.map((attr, i) => (
                      <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                  {energy.positiveDescription && (
                    <p className="text-sm mt-2 leading-relaxed">{energy.positiveDescription}</p>
                  )}
                </div>
              )}
              {energy.challenges.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Desafios</h4>
                  <div className="flex flex-wrap gap-2">
                    {energy.challenges.map((ch, i) => (
                      <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                  {energy.challengeDescription && (
                    <p className="text-sm mt-2 leading-relaxed">{energy.challengeDescription}</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="healing" className="space-y-3 mt-3">
              {energy.soulMessage && (
                <div className="bg-purple-50/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-700 mb-1">Mensagem da Alma</h4>
                  <p className="text-sm italic leading-relaxed">{energy.soulMessage}</p>
                </div>
              )}
              {energy.healingAffirmation && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Afirmação de Cura</h4>
                  <p className="text-sm italic leading-relaxed">"{energy.healingAffirmation}"</p>
                </div>
              )}
              {energy.limitingBeliefs.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-red-600 mb-1">Crenças Limitantes a Transformar</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {energy.limitingBeliefs.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
              {energy.selfHelpMethods.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Métodos de Autoajuda</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {energy.selfHelpMethods.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {energy.bachFlowers.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Florais de Bach</h4>
                  <div className="space-y-1">
                    {energy.bachFlowers.map((f, i) => (
                      <p key={i} className="text-sm">
                        <span className="font-medium">{f.name}</span>
                        {f.purpose && ` — ${f.purpose}`}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};

export function SoulPlanResults({
  participantName,
  soulPlanResult,
  existingResult,
  facilitatorProfile,
}: SoulPlanResultsProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Reconstruct SoulPlanResult from existingResult if needed
  const result = useMemo<SoulPlanResult | null>(() => {
    if (soulPlanResult) return soulPlanResult;

    // Try to reconstruct from existingResult
    if (existingResult) {
      const birthName = existingResult.exercises_data?.birthName
        || existingResult.dimension_scores?.birthName;
      if (birthName) {
        return calculateSoulPlan(birthName);
      }
    }

    return null;
  }, [soulPlanResult, existingResult]);

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Não foi possível carregar o resultado do Mapa da Alma.</p>
      </div>
    );
  }

  const { positions, isShortName } = result;
  const facilitatorName = facilitatorProfile?.full_name || undefined;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateSoulPlanPDF({
        result,
        participantName,
        facilitatorName: facilitatorName || undefined,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Star className="h-6 w-6 text-amber-500" />
          <h1 className="font-display text-3xl font-bold text-warm-brown">
            Mapa da Alma
          </h1>
          <Star className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-lg text-muted-foreground">
          {participantName}
        </p>
        <p className="text-sm text-muted-foreground">
          Nome de nascimento: <span className="font-medium">{result.normalizedName}</span>
          {isShortName && (
            <Badge variant="outline" className="ml-2 text-xs">Nome curto</Badge>
          )}
        </p>
      </div>

      {/* Download PDF button */}
      <div className="flex justify-center">
        <Button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isGeneratingPdf ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar Relatório PDF'}
        </Button>
      </div>

      {/* Star of Creation */}
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Estrela da Criação</CardTitle>
          <p className="text-sm text-muted-foreground">
            Seu mapa energético baseado no nome de nascimento
          </p>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <StarOfCreation result={result} size={380} />
        </CardContent>
      </Card>

      {/* Soul Destiny highlight */}
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50/50 to-warm-cream/50">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-amber-600" />
            <CardTitle className="text-xl text-amber-700">Destino da Alma</CardTitle>
          </div>
          <Badge className="mx-auto bg-amber-100 text-amber-800 border-amber-300 text-lg px-4 py-1">
            {positions.soulDestiny.pair}
          </Badge>
          {positions.soulDestiny.energy && (
            <p className="text-base font-medium text-amber-700 mt-1">
              {positions.soulDestiny.energy.hebrewLetter} — {positions.soulDestiny.energy.vibration}
            </p>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-base leading-relaxed">{result.profileSummary}</p>
          {positions.soulDestiny.energy?.soulDestiny && (
            <p className="text-sm mt-3 leading-relaxed text-muted-foreground italic">
              {positions.soulDestiny.energy.soulDestiny}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Worldly positions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 rounded bg-[#B8860B] opacity-70" />
          <h2 className="font-display text-xl font-bold text-warm-brown">Plano Mundano</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Aspectos relacionados à sua vida material, prática e social.
        </p>
        <div className="space-y-3">
          <PositionCard
            positionKey="worldlyChallenge"
            position={positions.worldlyChallenge}
            isShortName={isShortName}
          />
          <PositionCard
            positionKey="worldlyTalent"
            position={positions.worldlyTalent}
            isShortName={isShortName}
          />
          <PositionCard
            positionKey="worldlyGoal"
            position={positions.worldlyGoal}
            isShortName={isShortName}
          />
        </div>
      </div>

      {/* Spiritual positions */}
      {!isShortName && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 rounded bg-[#7B2D8E] opacity-70" />
            <h2 className="font-display text-xl font-bold text-warm-brown">Plano Espiritual</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Aspectos relacionados ao seu desenvolvimento interior e espiritual.
          </p>
          <div className="space-y-3">
            <PositionCard
              positionKey="spiritualChallenge"
              position={positions.spiritualChallenge}
              isShortName={isShortName}
            />
            <PositionCard
              positionKey="spiritualTalent"
              position={positions.spiritualTalent}
              isShortName={isShortName}
            />
            <PositionCard
              positionKey="spiritualGoal"
              position={positions.spiritualGoal}
              isShortName={isShortName}
            />
          </div>
        </div>
      )}

      {/* Letter breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            Conversão do Nome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {result.letterValues.map((lv, i) => (
              <div
                key={i}
                className="flex flex-col items-center bg-warm-cream/50 rounded-lg px-3 py-2 min-w-[48px]"
              >
                <span className="text-sm font-medium text-warm-brown">{lv.letter}</span>
                <span className="text-sm text-muted-foreground">{lv.value}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Total de valores: {result.letterValues.length}
            {isShortName ? ' (nome curto — 3 posições combinadas)' : ' (nome longo — 6 posições separadas)'}
          </p>
        </CardContent>
      </Card>

      {/* Facilitator info */}
      {facilitatorName && (
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          <p>Facilitado por <span className="font-medium">{facilitatorName}</span></p>
        </div>
      )}
    </div>
  );
}

export default SoulPlanResults;
