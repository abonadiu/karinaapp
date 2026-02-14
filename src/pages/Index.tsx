import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Compass, Users, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const dimensions = [
  {
    icon: Brain,
    title: "Consciência Interior",
    description: "Meta-cognição e auto-observação profunda",
    color: "text-primary",
  },
  {
    icon: Heart,
    title: "Coerência Emocional",
    description: "Regulação e resiliência emocional",
    color: "text-accent",
  },
  {
    icon: Compass,
    title: "Conexão e Propósito",
    description: "Valores e significado de vida",
    color: "text-dimension-purpose",
  },
  {
    icon: Users,
    title: "Relações e Compaixão",
    description: "Empatia e liderança servidora",
    color: "text-dimension-compassion",
  },
  {
    icon: TrendingUp,
    title: "Transformação",
    description: "Mentalidade de crescimento contínuo",
    color: "text-dimension-growth",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">IQ+IS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#sobre" className="text-base text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </a>
            <a href="#dimensoes" className="text-base text-muted-foreground hover:text-foreground transition-colors">
              Dimensões
            </a>
            <a href="#facilitadores" className="text-base text-muted-foreground hover:text-foreground transition-colors">
              Para Facilitadores
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm-subtle opacity-50" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in text-balance">
              Descubra sua Inteligência Emocional e Espiritual
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-fade-in text-balance leading-relaxed" style={{ animationDelay: "0.1s" }}>
              Uma jornada de autoconhecimento profundo através de diagnósticos personalizados
              que revelam seus pontos cegos e potenciais de crescimento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link to="/cadastro">
                  Iniciar Jornada
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <a href="#sobre">Saiba Mais</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-5">
              O que é o IQ+IS?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Uma plataforma inovadora que combina inteligência emocional (IQ) e inteligência 
              espiritual (IS) para oferecer uma visão completa do seu potencial humano.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-warm bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Diagnóstico Profundo</h3>
                <p className="text-muted-foreground leading-relaxed">
                  40 perguntas cuidadosamente elaboradas para mapear suas 5 dimensões internas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-warm bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <Heart className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Exercícios Vivenciais</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Práticas interativas de respiração, mapeamento corporal e reflexão guiada.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-warm bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-dimension-purpose/10 flex items-center justify-center mx-auto mb-5">
                  <TrendingUp className="w-7 h-7 text-dimension-purpose" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Plano Personalizado</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Relatório detalhado com pontos cegos identificados e práticas recomendadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dimensions Section */}
      <section id="dimensoes" className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-5">
              As 5 Dimensões Avaliadas
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Cada dimensão representa um aspecto fundamental da sua inteligência integral.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {dimensions.map((dimension, index) => (
              <Card 
                key={dimension.title} 
                className="border-0 shadow-warm bg-card hover:shadow-warm-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <dimension.icon className={`w-10 h-10 ${dimension.color} mx-auto mb-4`} />
                  <h3 className="font-display text-lg font-semibold mb-2">{dimension.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{dimension.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Facilitators */}
      <section id="facilitadores" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-warm-xl gradient-warm overflow-hidden">
            <CardContent className="p-8 md:p-14 text-center text-primary-foreground">
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-5">
                Você é Coach ou Consultor?
              </h2>
              <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Aplique o diagnóstico IQ+IS em seus clientes e equipes. 
                Gerencie empresas, participantes e acompanhe resultados em tempo real.
              </p>
              <Button size="lg" variant="secondary" className="gap-2 text-base" asChild>
                <Link to="/cadastro">
                  Criar Conta de Facilitador
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold text-foreground">IQ+IS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Plataforma IQ+IS. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
