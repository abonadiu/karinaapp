
# Plano: Comparativo com Benchmark e Percentil de Posicionamento

## Resumo

Implementar funcionalidade de benchmark que permite comparar o desempenho de uma equipe/empresa com as médias gerais da plataforma, incluindo visualização de percentil para entender o posicionamento relativo.

---

## Funcionalidades a Implementar

### 1. Radar Chart Comparativo (Equipe vs Benchmark)

Modificar o `AggregateRadarChart` para exibir duas camadas:
- **Camada 1 (Primária)**: Médias da equipe atual
- **Camada 2 (Referência)**: Médias globais de todos os diagnósticos

| Cor | Representação |
|-----|---------------|
| Azul (primary) | Média da Equipe |
| Cinza (muted) | Benchmark Global |

### 2. Card de Percentil de Posicionamento

Novo componente mostrando onde a equipe se posiciona em relação a todas as outras:

```text
+------------------------------------------+
|  Posicionamento da Equipe                |
+------------------------------------------+
|                                          |
|  Sua equipe está melhor que              |
|                                          |
|          [ 72% ]                         |
|                                          |
|  das outras equipes avaliadas            |
|                                          |
|  ======[====|====]======                 |
|        25%  50%  75%                     |
+------------------------------------------+
```

### 3. Tabela Comparativa por Dimensão

Mostrar cada dimensão com:
- Score da equipe
- Benchmark global
- Diferença (positiva/negativa)
- Indicador visual

```text
| Dimensão           | Equipe | Benchmark | Diferença |
|--------------------|--------|-----------|-----------|
| Consciência        |  4.2   |   3.94    |   +0.26   |
| Coerência          |  3.8   |   3.90    |   -0.10   |
| ...                |  ...   |   ...     |   ...     |
```

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/empresa/BenchmarkComparisonCard.tsx` | Card com tabela comparativa por dimensão |
| `src/components/empresa/PercentilePositionCard.tsx` | Card de percentil com barra visual |
| `src/components/empresa/ComparisonRadarChart.tsx` | Radar chart com duas camadas |

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/empresa/PortalEmpresa.tsx` | Adicionar seção de benchmark |

---

## Nova Função no Banco de Dados

Criar função para calcular benchmark global:

```sql
CREATE OR REPLACE FUNCTION get_global_benchmark()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Médias globais por dimensão
  WITH dimension_avgs AS (
    SELECT 
      key as dimension,
      AVG((value->>'score')::numeric) as avg_score
    FROM diagnostic_results,
         jsonb_each(dimension_scores::jsonb)
    GROUP BY key
  ),
  global_avg AS (
    SELECT AVG(total_score) as global_score
    FROM diagnostic_results
  )
  SELECT json_build_object(
    'dimensions', (SELECT json_agg(json_build_object(
      'dimension', dimension,
      'average', ROUND(avg_score::numeric, 2)
    )) FROM dimension_avgs),
    'global_average', (SELECT ROUND(global_score::numeric, 2) FROM global_avg),
    'total_completed', (SELECT COUNT(*) FROM diagnostic_results)
  ) INTO result;

  RETURN result;
END;
$$;
```

Função para calcular percentil da empresa:

```sql
CREATE OR REPLACE FUNCTION get_company_percentile(p_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_avg numeric;
  percentile integer;
BEGIN
  -- Média da empresa
  SELECT AVG(dr.total_score) INTO company_avg
  FROM diagnostic_results dr
  JOIN participants p ON p.id = dr.participant_id
  WHERE p.company_id = p_company_id;

  IF company_avg IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calcular percentil
  SELECT ROUND(
    (COUNT(*) FILTER (WHERE avg_score <= company_avg)::numeric / 
     NULLIF(COUNT(*), 0)) * 100
  )::integer INTO percentile
  FROM (
    SELECT p.company_id, AVG(dr.total_score) as avg_score
    FROM diagnostic_results dr
    JOIN participants p ON p.id = dr.participant_id
    GROUP BY p.company_id
  ) company_scores;

  RETURN percentile;
END;
$$;
```

---

## Design dos Componentes

### ComparisonRadarChart

Gráfico radar com duas séries sobrepostas:

```tsx
<RadarChart>
  <Radar 
    name="Benchmark" 
    dataKey="benchmark" 
    stroke="hsl(var(--muted-foreground))"
    fill="hsl(var(--muted-foreground))"
    fillOpacity={0.1}
  />
  <Radar 
    name="Sua Equipe" 
    dataKey="team" 
    stroke="hsl(var(--primary))"
    fill="hsl(var(--primary))"
    fillOpacity={0.3}
  />
  <Legend />
</RadarChart>
```

### PercentilePositionCard

Visualização com:
- Número grande do percentil (ex: 72%)
- Barra de progresso segmentada (quartis)
- Texto explicativo

### BenchmarkComparisonCard

Tabela mostrando:
- Cada dimensão como linha
- Colunas: Equipe | Benchmark | Δ
- Cores indicando performance (verde = acima, vermelho = abaixo)

---

## Layout no Portal da Empresa

Nova seção "Comparativo com Benchmark":

```text
+------------------------------------------+
|  Comparativo com Benchmark               |
|  Veja como sua equipe se posiciona       |
+------------------------------------------+

+-------------------+   +-------------------+
|   Radar Chart     |   |    Percentil      |
|   Comparativo     |   |    Position       |
|   (2 camadas)     |   |    72%            |
+-------------------+   +-------------------+

+------------------------------------------+
|  Detalhamento por Dimensão               |
|  ----------------------------------------|
|  Dimensão      | Equipe | Bench | Dif    |
|  Consciência   |  4.2   | 3.94  | +0.26  |
|  Coerência     |  3.8   | 3.90  | -0.10  |
|  ...           |  ...   | ...   | ...    |
+------------------------------------------+
```

---

## Fluxo de Dados

1. Portal carrega dados da empresa (existente)
2. Chamada adicional para `get_global_benchmark()` 
3. Chamada para `get_company_percentile(company_id)`
4. Componentes recebem ambos os conjuntos de dados
5. Renderização comparativa

---

## Seção Técnica

### Interface de Dados

```typescript
interface BenchmarkData {
  dimensions: {
    dimension: string;
    average: number;
  }[];
  global_average: number;
  total_completed: number;
}

interface ComparisonDimension {
  dimension: string;
  shortName: string;
  teamScore: number;
  benchmarkScore: number;
  difference: number;
  isAbove: boolean;
}
```

### Query no Portal

```typescript
// Buscar benchmark global
const { data: benchmarkData } = await supabase
  .rpc('get_global_benchmark');

// Buscar percentil da empresa
const { data: percentile } = await supabase
  .rpc('get_company_percentile', { p_company_id: companyId });
```

### Lógica do Percentil Visual

```typescript
function getPercentileColor(percentile: number): string {
  if (percentile >= 75) return "text-green-500";
  if (percentile >= 50) return "text-blue-500";
  if (percentile >= 25) return "text-yellow-500";
  return "text-orange-500";
}

function getPercentileLabel(percentile: number): string {
  if (percentile >= 75) return "Excelente";
  if (percentile >= 50) return "Acima da média";
  if (percentile >= 25) return "Na média";
  return "Abaixo da média";
}
```

---

## Estimativa de Implementação

| Etapa | Esforço |
|-------|---------|
| Funções do banco (benchmark + percentil) | 1 mensagem |
| Componentes visuais + integração no Portal | 1 mensagem |
| **Total** | 2 mensagens |
