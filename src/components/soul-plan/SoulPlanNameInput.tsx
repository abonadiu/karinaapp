import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, AlertCircle, Info } from 'lucide-react';

interface SoulPlanNameInputProps {
  onCalculate: (birthName: string) => void;
  participantName: string;
  isLoading?: boolean;
  prefillName?: string;
}

export const SoulPlanNameInput: React.FC<SoulPlanNameInputProps> = ({
  onCalculate,
  participantName,
  isLoading = false,
  prefillName = '',
}) => {
  const [birthName, setBirthName] = useState(prefillName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = birthName.trim();
    if (!trimmed) {
      setError('Por favor, insira o nome completo de nascimento.');
      return;
    }

    // Must have at least first and last name
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      setError('Por favor, insira o nome completo (nome e sobrenome) como consta na certidão de nascimento.');
      return;
    }

    // Must have at least 3 letters total
    const lettersOnly = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '');
    if (lettersOnly.length < 3) {
      setError('O nome deve ter pelo menos 3 letras.');
      return;
    }

    onCalculate(trimmed);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          Mapeamento profundo da essência interior de {participantName}
        </p>
      </div>

      {/* Info card */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm leading-relaxed">
                O <strong>Mapa da Alma</strong> é baseado no sistema Soul Plan de Blue Marsden,
                que utiliza a vibração do seu <strong>nome completo de nascimento</strong> (como
                consta na certidão) para revelar seu plano de alma.
              </p>
              <p className="text-sm leading-relaxed">
                Cada letra do seu nome é convertida em um valor numérico hebraico, que é então
                mapeado na <strong>Estrela da Criação</strong> — revelando seus desafios, talentos,
                objetivos e o destino da sua alma.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name input form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nome de Nascimento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthName">
                Nome completo como consta na certidão de nascimento
              </Label>
              <Input
                id="birthName"
                type="text"
                placeholder="Ex: Maria José da Silva Santos"
                value={birthName}
                onChange={(e) => {
                  setBirthName(e.target.value);
                  setError('');
                }}
                className="text-lg"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="bg-warm-cream/50 rounded-lg p-3 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Importante:</p>
              <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>Use o nome <strong>exatamente como está na certidão de nascimento</strong></li>
                <li>Inclua todos os nomes e sobrenomes</li>
                <li>Acentos serão removidos automaticamente para o cálculo</li>
                <li>Não use apelidos ou nomes sociais</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isLoading || !birthName.trim()}
            >
              {isLoading ? 'Calculando...' : 'Calcular Mapa da Alma'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};


