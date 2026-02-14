

## Melhorar o Relatorio do Participante no Modal

### Problema Atual

O modal que aparece ao clicar num participante mostra um relatorio "fraco":
- Usa o `ParticipantResultCard` que foi feito para ser um card compacto/colapsavel
- Mostra apenas o radar chart + 2 listas simples (pontos fortes e areas de desenvolvimento) com nomes e scores
- Nao mostra score geral destacado, descricoes das dimensoes, barra de progresso, nivel de desenvolvimento, nem recomendacoes praticas

### O Que Vai Melhorar

O modal passara a ter um relatorio completo e rico, incluindo:

1. **Header com score geral destacado** - Score grande com mensagem interpretativa (ex: "Bom! Ha espaco para crescimento")
2. **Radar chart** (ja existe, manter)
3. **Cards de cada dimensao** - Com icone, barra de progresso, descricao da dimensao e nivel (Em desenvolvimento / Moderado / Bem desenvolvido)
4. **Pontos fortes e areas de desenvolvimento** - Com destaque visual (verde/laranja)
5. **Recomendacoes praticas** - Praticas concretas baseadas nas dimensoes mais fracas
6. **Botao de baixar PDF** (ja existe, manter)

### Implementacao

#### 1. Criar componente `ParticipantResultModal` dedicado

**Novo arquivo**: `src/components/participants/ParticipantResultModal.tsx`

Componente que renderiza dentro do Dialog um relatorio completo reutilizando componentes existentes:
- `ResultsRadarChart` para o grafico radar
- `DimensionCard` para cada dimensao com icone, progresso e descricao
- `RecommendationList` para recomendacoes praticas
- `getScoreLevel` para mensagem interpretativa do score
- `getRecommendationsForWeakDimensions` para gerar recomendacoes

Conteudo do modal:
```
+------------------------------------------+
|  [Nome do Participante]                  |
|  Concluido em 13 fev 2026               |
|                                          |
|  Score Geral: 3.8 / 5                   |
|  "Bom! Ha espaco para crescimento"       |
|                                          |
|  [========= Radar Chart =========]       |
|                                          |
|  --- Pontos Fortes ---                   |
|  [DimensionCard: Consciencia Interior]   |
|  [DimensionCard: Transformacao]          |
|                                          |
|  --- Areas de Desenvolvimento ---        |
|  [DimensionCard: Coerencia Emocional]    |
|  [DimensionCard: Relacoes e Compaixao]   |
|                                          |
|  --- Detalhamento por Dimensao ---       |
|  [DimensionCard x5 com todas]            |
|                                          |
|  --- Recomendacoes ---                   |
|  [RecommendationList com praticas]       |
|                                          |
|  [Baixar PDF]                            |
+------------------------------------------+
```

#### 2. Atualizar `Participantes.tsx`

- Substituir o uso de `ParticipantResultCard` no Dialog pelo novo `ParticipantResultModal`
- Passar os dados necessarios (nome, data, score, dimensionScores)

### Arquivos a Modificar/Criar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/participants/ParticipantResultModal.tsx` | **Novo** - Componente com relatorio completo |
| `src/pages/Participantes.tsx` | Substituir `ParticipantResultCard` pelo novo componente no Dialog |

### Componentes Reutilizados (sem alteracao)

- `ResultsRadarChart` - Grafico radar
- `DimensionCard` - Card de dimensao com icone, progresso, descricao
- `RecommendationList` - Lista de recomendacoes praticas
- `getScoreLevel`, `getStrongestDimensions`, `getWeakestDimensions` - Funcoes de scoring
- `getRecommendationsForWeakDimensions` - Funcao de recomendacoes

