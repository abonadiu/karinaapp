

# Visualizacao de Resultados para Facilitador

## Resumo
Adicionar uma aba "Resultados" na pagina de detalhes da empresa (`EmpresaDetalhes.tsx`) que mostra os resultados do diagnostico dos participantes que completaram a avaliacao, incluindo grafico radar, scores por dimensao e estatisticas consolidadas.

---

## O que sera implementado

### 1. Sistema de Abas na Pagina da Empresa
- Aba "Participantes" (atual) - Lista de todos os participantes
- Aba "Resultados" (nova) - Visualizacao dos diagnosticos completos

### 2. Visualizacao de Resultados
- Lista de participantes com status "completed"
- Card expandivel para cada participante mostrando:
  - Score total
  - Grafico radar com as 5 dimensoes
  - Pontos fortes e areas de desenvolvimento
  - Data de conclusao

### 3. Estatisticas Consolidadas da Empresa
- Media geral de todos os participantes
- Grafico radar agregado (media por dimensao)
- Dimensoes mais fortes e mais fracas da equipe
- Contadores de participantes por status

---

## Estrutura do Codigo

### Componente Principal
`src/components/participants/ParticipantResults.tsx` - Lista de resultados dos participantes

### Componente de Resultado Individual
`src/components/participants/ParticipantResultCard.tsx` - Card expandivel com resultado individual

### Componente de Estatisticas
`src/components/participants/TeamStats.tsx` - Estatisticas consolidadas da equipe

---

## Arquivos a serem modificados/criados

### Novos Componentes
1. `src/components/participants/ParticipantResults.tsx`
   - Busca resultados do banco de dados
   - Lista participantes que completaram
   - Mostra mensagem quando nao ha resultados

2. `src/components/participants/ParticipantResultCard.tsx`
   - Card com nome, data de conclusao, score total
   - Expansivel para mostrar grafico radar e detalhes
   - Reutiliza `ResultsRadarChart` e `DimensionCard`

3. `src/components/participants/TeamStats.tsx`
   - Cards com estatisticas agregadas
   - Grafico radar com medias da equipe
   - Top 2 pontos fortes e fracos coletivos

### Modificacoes
1. `src/pages/EmpresaDetalhes.tsx`
   - Adicionar sistema de abas (Tabs do Radix)
   - Tab "Participantes" com conteudo atual
   - Tab "Resultados" com novos componentes
   - Buscar dados de `diagnostic_results` junto com participantes

---

## Fluxo de Dados

```text
EmpresaDetalhes
     |
     +---> fetchParticipants() - ja existe
     |
     +---> fetchResults() - NOVO
             |
             +---> SELECT * FROM diagnostic_results
             |     WHERE participant_id IN (participantes da empresa)
             |
             v
     Combinar participants + results
             |
             v
     [Aba Participantes]        [Aba Resultados]
          |                           |
          v                           v
     ParticipantList          ParticipantResults
                                     |
                                     +---> TeamStats (agregado)
                                     |
                                     +---> ParticipantResultCard (lista)
```

---

## Detalhes Tecnicos

### Query para buscar resultados
A RLS policy `is_facilitator_of_participant` ja permite que facilitadores vejam resultados de seus participantes.

```typescript
const { data: results } = await supabase
  .from("diagnostic_results")
  .select("*")
  .in("participant_id", participantIds);
```

### Estrutura do resultado (diagnostic_results.dimension_scores)
```json
{
  "Consciencia Interior": 3.5,
  "Coerencia Emocional": 4.2,
  "Conexao e Proposito": 3.8,
  "Relacoes e Compaixao": 4.0,
  "Transformacao": 3.2
}
```

### Conversao para DimensionScore[]
```typescript
const dimensionScores = Object.entries(result.dimension_scores).map(
  ([dimension, score], index) => ({
    dimension,
    dimensionOrder: index + 1,
    score: score as number,
    maxScore: 5,
    percentage: ((score as number) / 5) * 100
  })
);
```

### Calculo de medias da equipe
```typescript
const teamAverages = dimensions.map(dim => {
  const scores = results
    .map(r => r.dimension_scores[dim.name])
    .filter(Boolean);
  return {
    dimension: dim.name,
    score: scores.reduce((a, b) => a + b, 0) / scores.length
  };
});
```

---

## Interface Visual

### Aba Resultados - Layout
```text
+-------------------------------------------------------+
| [Participantes] [Resultados]                          |  <- Tabs
+-------------------------------------------------------+

+-- Estatisticas da Equipe -----------------------------+
|  +-------------+  +-------------+  +-------------+    |
|  | Completados |  | Media Geral |  | Em Progresso|    |
|  |     8       |  |    3.8/5    |  |      3      |    |
|  +-------------+  +-------------+  +-------------+    |
|                                                       |
|  [Grafico Radar - Media da Equipe]                    |
|                                                       |
|  Dimensao mais forte: Coerencia Emocional (4.2)       |
|  Dimensao a desenvolver: Transformacao (3.1)          |
+-------------------------------------------------------+

+-- Resultados Individuais -----------------------------+
|  +-- Maria Silva (click para expandir) ----+ 3.9/5   |
|  |  Concluido em 28/01/2026                         |
|  +----------------------------------------------+   |
|                                                       |
|  +-- Joao Santos [expandido] ---------------+ 4.1/5  |
|  |  Concluido em 27/01/2026                         |
|  |                                                   |
|  |  [Grafico Radar Individual]                      |
|  |                                                   |
|  |  Pontos Fortes:                                  |
|  |  - Relacoes e Compaixao (4.5)                    |
|  |  - Coerencia Emocional (4.3)                     |
|  |                                                   |
|  |  Areas de Desenvolvimento:                       |
|  |  - Consciencia Interior (3.2)                    |
|  |  - Transformacao (3.4)                           |
|  +----------------------------------------------+   |
+-------------------------------------------------------+
```

---

## Ordem de Implementacao

1. Criar `TeamStats.tsx` - estatisticas agregadas
2. Criar `ParticipantResultCard.tsx` - card expandivel individual
3. Criar `ParticipantResults.tsx` - container com lista e stats
4. Modificar `EmpresaDetalhes.tsx`:
   - Adicionar imports de Tabs
   - Adicionar estado para resultados
   - Criar funcao `fetchResults()`
   - Reorganizar layout com abas
5. Testar fluxo completo

---

## Componentes Reutilizados

- `ResultsRadarChart` - ja existe, sera reutilizado
- `DimensionCard` - ja existe, sera reutilizado
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - do Radix UI
- `Collapsible` - do Radix UI para cards expandiveis
- `Card`, `Progress`, `Badge` - componentes UI existentes

