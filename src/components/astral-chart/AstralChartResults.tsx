import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Globe, Download, Sun, Moon, Star, ArrowUp,
  Compass, BarChart3, Sparkles, Users
} from 'lucide-react';
import {
  AstralChartResult,
  SIGN_SYMBOLS,
  PLANET_SYMBOLS,
  SIGN_ELEMENTS,
  ELEMENT_COLORS,
  analyzeElements,
  analyzeModalities,
  getDominantElement,
  getDominantModality,
  getElementLabel,
  getModalityLabel,
} from '@/lib/astral-chart-calculator';
import {
  getPlanetInSignDescription,
  getPlanetInHouseDescription,
  getAscendantDescription,
  getMidheavenDescription,
  getAspectDescription,
  getElementDescription,
  getModalityDescription,
} from '@/lib/astral-chart-descriptions';
import { AstralChartWheel } from './AstralChartWheel';

interface AstralChartResultsProps {
  result: AstralChartResult;
  participantName: string;
  onDownloadPDF?: () => void;
  isGeneratingPDF?: boolean;
}

export const AstralChartResults: React.FC<AstralChartResultsProps> = ({
  result,
  participantName,
  onDownloadPDF,
  isGeneratingPDF = false,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const elementBalance = analyzeElements(result.planets);
  const modalityBalance = analyzeModalities(result.planets);
  const dominantElement = getDominantElement(elementBalance);
  const dominantModality = getDominantModality(modalityBalance);

  const mainPlanets = result.planets.filter(p =>
    ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(p.key)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Globe className="h-6 w-6 text-indigo-500" />
          <h1 className="font-display text-3xl font-bold text-primary">
            Mapa Astral
          </h1>
          <Globe className="h-6 w-6 text-indigo-500" />
        </div>
        <p className="text-lg text-muted-foreground">
          Mapa astral completo de <strong>{participantName}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          {result.birthData.day}/{result.birthData.month}/{result.birthData.year} às{' '}
          {String(result.birthData.hour).padStart(2, '0')}:{String(result.birthData.minute).padStart(2, '0')} — {result.birthData.cityName}
        </p>
      </div>

      {/* Big Three Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="pt-4 text-center">
            <Sun className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Sol</p>
            <p className="text-xl font-bold text-amber-700">
              {SIGN_SYMBOLS[result.sunSign]} {result.sunSignLabel}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Essência e identidade</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-4 text-center">
            <Moon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Lua</p>
            <p className="text-xl font-bold text-blue-700">
              {SIGN_SYMBOLS[result.moonSign]} {result.moonSignLabel}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Emoções e instintos</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="pt-4 text-center">
            <ArrowUp className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Ascendente</p>
            <p className="text-xl font-bold text-indigo-700">
              {SIGN_SYMBOLS[result.ascendantSign]} {result.ascendantSignLabel}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Máscara social</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Wheel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Carta Natal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AstralChartWheel result={result} size={500} />
        </CardContent>
      </Card>

      {/* Tabs for detailed interpretations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="text-sm">
            <Star className="h-3 w-3 mr-1" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="planets" className="text-sm">
            <Sun className="h-3 w-3 mr-1" />
            Planetas
          </TabsTrigger>
          <TabsTrigger value="houses" className="text-sm">
            <Compass className="h-3 w-3 mr-1" />
            Casas
          </TabsTrigger>
          <TabsTrigger value="aspects" className="text-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Aspectos
          </TabsTrigger>
          <TabsTrigger value="balance" className="text-sm">
            <BarChart3 className="h-3 w-3 mr-1" />
            Equilíbrio
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Ascendant */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-indigo-500" />
                Ascendente em {result.ascendantSignLabel} {SIGN_SYMBOLS[result.ascendantSign]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {getAscendantDescription(result.ascendantSign) ||
                  `Seu Ascendente está em ${result.ascendantSignLabel}, influenciando como você se apresenta ao mundo.`}
              </p>
            </CardContent>
          </Card>

          {/* Sun */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                Sol em {result.sunSignLabel} {SIGN_SYMBOLS[result.sunSign]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {getPlanetInSignDescription('sun', result.sunSign) ||
                  `Seu Sol está em ${result.sunSignLabel}, definindo sua essência e identidade central.`}
              </p>
            </CardContent>
          </Card>

          {/* Moon */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-400" />
                Lua em {result.moonSignLabel} {SIGN_SYMBOLS[result.moonSign]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {getPlanetInSignDescription('moon', result.moonSign) ||
                  `Sua Lua está em ${result.moonSignLabel}, revelando suas emoções e necessidades internas.`}
              </p>
            </CardContent>
          </Card>

          {/* Midheaven */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                Meio do Céu em {result.midheavenSignLabel} {SIGN_SYMBOLS[result.midheavenSign]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {getMidheavenDescription(result.midheavenSign) ||
                  `Seu Meio do Céu está em ${result.midheavenSignLabel}, indicando sua vocação e direção profissional.`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planets Tab */}
        <TabsContent value="planets" className="space-y-4">
          {mainPlanets.map((planet) => {
            const element = SIGN_ELEMENTS[planet.sign];
            const color = ELEMENT_COLORS[element] || '#335072';

            return (
              <Card key={planet.key}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span style={{ color }} className="text-lg">
                      {PLANET_SYMBOLS[planet.key]}
                    </span>
                    {planet.label} em {planet.signLabel} {SIGN_SYMBOLS[planet.sign]}
                    <Badge variant="outline" className="ml-auto text-xs">
                      Casa {planet.house}
                    </Badge>
                    {planet.isRetrograde && (
                      <Badge variant="destructive" className="text-xs">
                        Retrógrado
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {planet.label} no signo de {planet.signLabel}:
                    </p>
                    <p className="text-sm leading-relaxed">
                      {getPlanetInSignDescription(planet.key, planet.sign) ||
                        `${planet.label} em ${planet.signLabel} traz uma energia particular para esta área da vida.`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {planet.label} na Casa {planet.house}:
                    </p>
                    <p className="text-sm leading-relaxed">
                      {getPlanetInHouseDescription(planet.key, planet.house) ||
                        `${planet.label} na Casa ${planet.house} direciona esta energia para os temas desta casa.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Grau: {planet.formattedDegree}</span>
                    <span>•</span>
                    <span>Eclíptica: {planet.eclipticDegree.toFixed(2)}°</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Houses Tab */}
        <TabsContent value="houses" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                As 12 casas astrológicas representam diferentes áreas da vida. O signo na cúspide de cada casa
                indica como você vivencia os temas daquela área.
              </p>
              <div className="space-y-3">
                {result.houses.map((house) => {
                  const planetsInHouse = mainPlanets.filter(p => p.house === house.id);
                  return (
                    <div key={house.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{house.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{house.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {SIGN_SYMBOLS[house.sign]} {house.signLabel}
                          </Badge>
                        </div>
                        {planetsInHouse.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm text-muted-foreground">Planetas:</span>
                            {planetsInHouse.map(p => (
                              <Badge key={p.key} variant="secondary" className="text-xs">
                                {PLANET_SYMBOLS[p.key]} {p.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aspects Tab */}
        <TabsContent value="aspects" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Os aspectos são ângulos formados entre os planetas, indicando como suas energias interagem.
                Aspectos harmoniosos (trígono, sextil) facilitam, enquanto aspectos tensos (quadratura, oposição) desafiam.
              </p>
              <div className="space-y-2">
                {result.aspects
                  .filter(a => ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.type))
                  .slice(0, 25)
                  .map((aspect, i) => {
                    const isHarmonious = ['trine', 'sextile'].includes(aspect.type);
                    const isTense = ['square', 'opposition'].includes(aspect.type);

                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-1 min-w-[140px]">
                          <span className="text-sm">
                            {PLANET_SYMBOLS[aspect.point1] || '?'} {aspect.point1Label}
                          </span>
                        </div>
                        <Badge
                          variant={isHarmonious ? 'default' : isTense ? 'destructive' : 'secondary'}
                          className="text-xs shrink-0"
                        >
                          {aspect.typeLabel}
                        </Badge>
                        <div className="flex items-center gap-1 min-w-[140px]">
                          <span className="text-sm">
                            {PLANET_SYMBOLS[aspect.point2] || '?'} {aspect.point2Label}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground ml-auto">
                          orbe: {aspect.orb.toFixed(1)}°
                        </span>
                      </div>
                    );
                  })}
              </div>
              {result.aspects.filter(a => ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.type)).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum aspecto maior encontrado.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Tab */}
        <TabsContent value="balance" className="space-y-4">
          {/* Elements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Equilíbrio dos Elementos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(elementBalance).map(([element, count]) => {
                  const color = ELEMENT_COLORS[element] || '#666';
                  const maxCount = Math.max(...Object.values(elementBalance));
                  const pct = maxCount > 0 ? (count / 10) * 100 : 0;

                  return (
                    <div key={element} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color }}>
                          {getElementLabel(element)}
                        </span>
                        <span className="text-sm text-muted-foreground">{count} planetas</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">
                  Elemento dominante: <strong>{getElementLabel(dominantElement)}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  {getElementDescription(dominantElement) ||
                    `O elemento ${getElementLabel(dominantElement)} é predominante no seu mapa.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modalities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Equilíbrio das Modalidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {Object.entries(modalityBalance).map(([modality, count]) => {
                  const colors: Record<string, string> = {
                    cardinal: '#E74C3C',
                    fixed: '#2ECC71',
                    mutable: '#3498DB',
                  };
                  const color = colors[modality] || '#666';
                  const pct = (count / 10) * 100;

                  return (
                    <div key={modality} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color }}>
                          {getModalityLabel(modality)}
                        </span>
                        <span className="text-sm text-muted-foreground">{count} planetas</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">
                  Modalidade dominante: <strong>{getModalityLabel(dominantModality)}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  {getModalityDescription(dominantModality) ||
                    `A modalidade ${getModalityLabel(dominantModality)} é predominante no seu mapa.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Download PDF Button */}
      {onDownloadPDF && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar Relatório em PDF'}
          </Button>
        </div>
      )}
    </div>
  );
};
