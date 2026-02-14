

## Correcao: Link do teste DISC carrega fluxo errado (IQ+IS)

### Problema

Quando o participante acessa o link do teste DISC (`/diagnostico/:token`), o sistema encontra corretamente o `participant_test` do tipo DISC e carrega as 40 perguntas DISC. Porem, apos responder todas as perguntas, o fluxo segue para os exercicios de respiracao, mapa corporal e reflexao — que sao especificos do diagnostico IQ+IS. Alem disso, a tela de resultados renderiza o `DiagnosticResults` (IQ+IS) em vez do `DiscResults`.

### Causa raiz

O hook `useDiagnostic.ts` e a pagina `Diagnostico.tsx` nao diferenciam o tipo de teste. O fluxo de steps e sempre:
```text
welcome -> questions -> breathing -> bodymap -> reflection -> processing -> results
```

Para DISC, o fluxo correto seria:
```text
welcome -> questions -> processing -> results (DiscResults)
```

### Solucao

1. **`src/hooks/useDiagnostic.ts`**: Expor o `slug` do teste (ex: "disc" vs "iq-is") e, quando o slug for "disc", pular os exercicios — ir direto de `questions` para `processing`/`results`

2. **`src/pages/Diagnostico.tsx`**: Usar o slug do teste para renderizar `DiscResults` em vez de `DiagnosticResults` quando o teste for DISC

### Mudancas

**`src/hooks/useDiagnostic.ts`**:
- Expor uma nova propriedade `testTypeSlug` (string | null) derivada de `participantTest?.test_types?.slug`
- Na funcao `answerQuestion`, quando a ultima pergunta for respondida e o slug for "disc", chamar `finalizeDiagnostic` diretamente em vez de ir para o step "breathing"
- Na funcao `finalizeDiagnostic`, salvar `dimension_scores` como objetos `{ score, maxScore, percentage, dimensionOrder }` em vez de apenas `number`, para compatibilidade com o componente de resultados DISC

**`src/pages/Diagnostico.tsx`**:
- Importar `DiscResults` 
- Receber `testTypeSlug` do hook
- No step "results", verificar o slug: se for "disc", renderizar `DiscResults`; caso contrario, renderizar `DiagnosticResults`
- Esconder os steps de exercicios (breathing, bodymap, reflection) quando nao aplicaveis — eles ja nao serao atingidos pelo DISC gracas a mudanca no hook

