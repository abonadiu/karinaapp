

## Correcao: Grafico radar mostrando 6 dimensoes (Transformacao duplicada)

### Problema

O banco de dados possui **6 dimensoes** na tabela `diagnostic_questions` em vez de 5: tanto "Transformacao" quanto "Transformacao e Crescimento" existem com `dimension_order: 5`. Isso faz com que o calculo de scores gere 6 entradas, e o radar chart exiba 6 pontos com o label "Transformacao" aparecendo duas vezes.

Alem disso, ha um problema secundario: ao carregar resultados existentes do banco em `DiagnosticResults.tsx`, o formato dos `dimension_scores` pode variar entre `{ score: number }` (novo) e simplesmente `number` (antigo), causando dados invalidos no grafico.

### Causa raiz

Consulta no banco retornou:
- Consciencia Interior (order 1)
- Coerencia Emocional (order 2)
- Conexao e Proposito (order 3)
- Relacoes e Compaixao (order 4)
- Transformacao (order 5)
- **Transformacao e Crescimento (order 5)** -- duplicata

### Solucao

1. **Migracao no banco**: Unificar as perguntas que usam "Transformacao" para usar "Transformacao e Crescimento" (ou vice-versa), eliminando a duplicidade. Atualizar todas as perguntas da dimensao duplicada para o nome canonico.

2. **Deduplicacao no codigo**: Adicionar logica de deduplicacao em `normalizeDimensionScores()` (`dimension-utils.ts`) para que, mesmo com dados antigos, dimensoes que normalizem para o mesmo nome sejam mescladas (media dos scores).

3. **Correcao do parsing de existingResult**: Em `DiagnosticResults.tsx`, ajustar a leitura de `dimension_scores` para suportar ambos os formatos (`number` direto ou `{ score: number, label?: string }`).

### Mudancas

**Migracao SQL**:
- Atualizar todas as perguntas com `dimension = 'Transformacao'` para `dimension = 'Transformacao e Crescimento'` (ou o inverso, dependendo de qual nome e mais usado)
- Isso resolve o problema na raiz para novos diagnosticos

**`src/lib/dimension-utils.ts`**:
- Em `normalizeDimensionScores()`, apos normalizar os nomes, agrupar dimensoes com o mesmo nome normalizado e calcular a media dos scores (deduplicacao)

**`src/components/diagnostic/DiagnosticResults.tsx`**:
- Linhas 40-50: ao construir `rawScores` a partir de `existingResult`, verificar se o valor e um numero ou um objeto `{ score }` e extrair corretamente:
  ```
  score: typeof scoreVal === 'number' ? scoreVal : scoreVal.score
  ```

