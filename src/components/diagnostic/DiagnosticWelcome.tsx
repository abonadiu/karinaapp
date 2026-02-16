import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Compass, Users, Sparkles, Clock, CheckCircle, Target, Shield, Smile, Search, Star, Sun, Moon, Flame, Globe } from "lucide-react";
import { FacilitatorProfile } from "@/hooks/useDiagnostic";

interface DiagnosticWelcomeProps {
  participantName: string;
  facilitatorProfile?: FacilitatorProfile | null;
  onStart: () => void;
  testType?: "iq_is" | "disc" | "mapa_da_alma" | "mapa_astral";
}

const iqIsDimensions = [
  { icon: Brain, name: "Consciência Interior", color: "text-purple-500" },
  { icon: Heart, name: "Coerência Emocional", color: "text-red-500" },
  { icon: Compass, name: "Conexão e Propósito", color: "text-blue-500" },
  { icon: Users, name: "Relações e Compaixão", color: "text-green-500" },
  { icon: Sparkles, name: "Transformação", color: "text-amber-500" },
];

const discDimensions = [
  { icon: Shield, name: "Dominância (D)", color: "text-red-500" },
  { icon: Smile, name: "Influência (I)", color: "text-amber-500" },
  { icon: Heart, name: "Estabilidade (S)", color: "text-green-500" },
  { icon: Search, name: "Conformidade (C)", color: "text-blue-500" },
];

const soulPlanPositions = [
  { icon: Sun, name: "Desafios — padrões a transformar", color: "text-amber-600" },
  { icon: Flame, name: "Talentos — dons naturais da alma", color: "text-orange-500" },
  { icon: Target, name: "Objetivos — aspirações desta vida", color: "text-emerald-500" },
  { icon: Star, name: "Destino da Alma — propósito central", color: "text-violet-500" },
];

const astralChartFeatures = [
  { icon: Sun, name: "Sol, Lua e Ascendente — a tríade fundamental", color: "text-amber-500" },
  { icon: Globe, name: "10 Planetas em signos e casas", color: "text-indigo-500" },
  { icon: Star, name: "Aspectos planetários — harmonias e tensões", color: "text-purple-500" },
  { icon: Compass, name: "12 Casas astrológicas — áreas da vida", color: "text-blue-500" },
  { icon: Sparkles, name: "Equilíbrio de elementos e modalidades", color: "text-emerald-500" },
];

export function DiagnosticWelcome({ participantName, facilitatorProfile, onStart, testType = "iq_is" }: DiagnosticWelcomeProps) {
  const firstName = participantName.split(" ")[0];
  const isDisc = testType === "disc";
  const isSoulPlan = testType === "mapa_da_alma";
  const isAstralChart = testType === "mapa_astral";

  const dimensions = isAstralChart
    ? astralChartFeatures
    : isSoulPlan
    ? soulPlanPositions
    : isDisc
    ? discDimensions
    : iqIsDimensions;
  
  const title = isAstralChart
    ? "Bem-vindo(a) ao Mapa Astral"
    : isSoulPlan
    ? "Bem-vindo(a) ao Mapa da Alma"
    : isDisc
    ? "Bem-vindo(a) ao Perfil DISC"
    : "Bem-vindo(a) ao Diagnóstico de Inteligência Emocional e Espiritual";
  
  const description = isAstralChart
    ? "O Mapa Astral é uma ferramenta de autoconhecimento baseada na posição dos astros no momento do seu nascimento. A partir dos seus dados de nascimento, calculamos sua carta natal completa com:"
    : isSoulPlan
    ? "O Mapa da Alma é uma ferramenta de autoconhecimento profundo baseada no sistema Soul Plan de Blue Marsden. A partir do seu nome completo de nascimento, revelamos as energias que compõem o seu plano de alma:"
    : isDisc
    ? "Este diagnóstico foi desenvolvido para mapear seu perfil comportamental em 4 dimensões fundamentais:"
    : "Este diagnóstico foi desenvolvido para ajudá-lo(a) a compreender melhor suas fortalezas e áreas de desenvolvimento em 5 dimensões fundamentais:";

  // Estilos dinâmicos baseados no branding do facilitador
  const brandStyle = facilitatorProfile?.primary_color 
    ? { 
        '--dynamic-primary': facilitatorProfile.primary_color,
        '--dynamic-secondary': facilitatorProfile.secondary_color || facilitatorProfile.primary_color,
      } as React.CSSProperties
    : {};

  const getButtonLabel = () => {
    if (isAstralChart) return "Iniciar Mapa Astral";
    if (isSoulPlan) return "Iniciar Mapa da Alma";
    if (isDisc) return "Iniciar Perfil DISC";
    return "Iniciar Diagnóstico";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4" style={brandStyle}>
      <Card className="w-full max-w-2xl">
        {/* Logo do facilitador */}
        {facilitatorProfile?.logo_url && (
          <div className="flex justify-center pt-6">
            <img 
              src={facilitatorProfile.logo_url} 
              alt="Logo do facilitador" 
              className="h-16 w-auto object-contain"
            />
          </div>
        )}
        
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">
            Olá, {firstName}! 👋
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {title}
          </CardDescription>
          {facilitatorProfile?.full_name && (
            <p className="text-sm text-muted-foreground mt-1">
              Facilitado por <span className="font-medium">{facilitatorProfile.full_name}</span>
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center">
            {description}
          </p>

          <div className="grid gap-3">
            {dimensions.map((dim, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <dim.icon className={`h-5 w-5 ${dim.color}`} />
                <span className="font-medium">{dim.name}</span>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              O que esperar:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {isAstralChart ? (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Você informará sua data, hora e local de nascimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>O sistema calculará automaticamente sua carta natal completa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Você receberá a roda zodiacal com todas as posições planetárias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Relatório interpretativo completo em PDF disponível para download</span>
                  </li>
                </>
              ) : isSoulPlan ? (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Você informará seu nome completo de nascimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>O sistema calculará automaticamente as energias do seu plano de alma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Você receberá a Estrela da Criação com 7 posições interpretadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Relatório completo em PDF disponível para download</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>{isDisc ? "40 afirmações sobre comportamento (cerca de 10 minutos)" : "40 perguntas reflexivas (cerca de 15 minutos)"}</span>
                  </li>
                  {!isDisc && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                      <span>3 exercícios vivenciais curtos</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Relatório personalizado com recomendações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Você pode pausar e retomar quando quiser</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {isAstralChart ? (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                <strong>Importante:</strong> Para um mapa astral preciso, é essencial saber a hora exata de nascimento. 
                Se não souber, consulte sua certidão de nascimento ou pergunte a familiares. 
                A hora influencia diretamente o ascendente e as casas astrológicas.
              </p>
            </div>
          ) : isSoulPlan ? (
            <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
              <p className="text-sm text-violet-800 dark:text-violet-200">
                <strong>Importante:</strong> Use o nome completo exatamente como consta na sua certidão de nascimento. 
                O cálculo é baseado na vibração sonora do nome original, por isso é essencial que seja o nome de nascimento, 
                não apelidos ou nomes sociais.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Dica:</strong> Responda com honestidade, sem pensar muito. 
                A primeira resposta que vier à mente geralmente é a mais autêntica. 
                Não existem respostas certas ou erradas.
              </p>
            </div>
          )}

          <Button 
            onClick={onStart} 
            size="lg" 
            className="w-full text-lg py-6"
          >
            {getButtonLabel()}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
