import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, AlertCircle, Info, MapPin, Clock, Calendar, Loader2, Search } from 'lucide-react';
import { BirthData } from '@/lib/astral-chart-calculator';

interface AstralChartInputProps {
  onCalculate: (birthData: BirthData) => void;
  participantName: string;
  isLoading?: boolean;
}

interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
}

export const AstralChartInput: React.FC<AstralChartInputProps> = ({
  onCalculate,
  participantName,
  isLoading = false,
}) => {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<GeocodingResult | null>(null);
  const [cityResults, setCityResults] = useState<GeocodingResult[]>([]);
  const [searchingCity, setSearchingCity] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const searchCity = useCallback(async () => {
    if (!citySearch.trim() || citySearch.trim().length < 3) return;

    setSearchingCity(true);
    setShowResults(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(citySearch)}&format=json&limit=5&accept-language=pt-BR`,
        {
          headers: {
            'User-Agent': 'KarinaApp/1.0',
          },
        }
      );
      const data: GeocodingResult[] = await response.json();
      setCityResults(data);
    } catch {
      setCityResults([]);
    } finally {
      setSearchingCity(false);
    }
  }, [citySearch]);

  const handleCitySelect = (result: GeocodingResult) => {
    setSelectedCity(result);
    setCitySearch(result.display_name);
    setShowResults(false);
    setCityResults([]);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!birthDate) {
      setError('Por favor, informe a data de nascimento.');
      return;
    }

    if (!birthTime) {
      setError('Por favor, informe a hora de nascimento. Se não souber a hora exata, use 12:00.');
      return;
    }

    if (!selectedCity) {
      setError('Por favor, busque e selecione a cidade de nascimento.');
      return;
    }

    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    if (year < 1900 || year > 2026) {
      setError('Ano de nascimento deve estar entre 1900 e 2026.');
      return;
    }

    const birthData: BirthData = {
      year,
      month,
      day,
      hour,
      minute,
      latitude: parseFloat(selectedCity.lat),
      longitude: parseFloat(selectedCity.lon),
      cityName: selectedCity.display_name.split(',')[0],
    };

    onCalculate(birthData);
  };

  const handleCityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchCity();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
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
          Mapa astral completo de {participantName}
        </p>
      </div>

      {/* Info card */}
      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm leading-relaxed">
                O <strong>Mapa Astral</strong> (ou Carta Natal) é um retrato do céu no exato momento
                do seu nascimento. Ele revela as posições dos planetas nos signos e casas astrológicas,
                formando um mapa único da sua personalidade, talentos e desafios.
              </p>
              <p className="text-sm leading-relaxed">
                Para um cálculo preciso, precisamos da <strong>data, hora e local exatos de nascimento</strong>.
                A hora é especialmente importante para determinar o Ascendente e as casas astrológicas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Birth data form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Dados de Nascimento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setError('');
                }}
                className="text-lg"
                max="2026-12-31"
                min="1900-01-01"
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="birthTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora de Nascimento
              </Label>
              <Input
                id="birthTime"
                type="time"
                value={birthTime}
                onChange={(e) => {
                  setBirthTime(e.target.value);
                  setError('');
                }}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Se não souber a hora exata, consulte a certidão de nascimento ou use 12:00 como aproximação.
              </p>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="citySearch" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Cidade de Nascimento
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="citySearch"
                    type="text"
                    placeholder="Ex: São Paulo, Brasil"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setSelectedCity(null);
                      setError('');
                    }}
                    onKeyDown={handleCityKeyDown}
                    className="text-lg pr-10"
                  />
                  {selectedCity && (
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchCity}
                  disabled={searchingCity || citySearch.trim().length < 3}
                  className="shrink-0"
                >
                  {searchingCity ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* City search results */}
              {showResults && cityResults.length > 0 && (
                <div className="border rounded-lg divide-y bg-background shadow-sm max-h-48 overflow-y-auto">
                  {cityResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm transition-colors"
                      onClick={() => handleCitySelect(result)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">{result.display_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showResults && !searchingCity && cityResults.length === 0 && citySearch.trim().length >= 3 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma cidade encontrada. Tente um nome diferente.
                </p>
              )}

              {selectedCity && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Localização selecionada: {parseFloat(selectedCity.lat).toFixed(2)}°, {parseFloat(selectedCity.lon).toFixed(2)}°
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Tips */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Dicas importantes:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>A <strong>hora de nascimento</strong> é essencial para calcular o Ascendente e as casas</li>
                <li>Consulte sua <strong>certidão de nascimento</strong> para a hora exata</li>
                <li>Se não souber a hora, o Ascendente e as casas serão aproximados</li>
                <li>A cidade determina as coordenadas geográficas para o cálculo</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading || !birthDate || !birthTime || !selectedCity}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculando Mapa Astral...
                </span>
              ) : (
                'Calcular Mapa Astral'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
