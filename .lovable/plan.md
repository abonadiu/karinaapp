

## Enriquecer o Conteudo Explicativo do Diagnostico

### Problema Atual

O relatorio mostra dados numericos e descricoes curtas de uma linha por dimensao, mas falta contexto explicativo para o participante entender o que cada score significa na pratica. As descricoes atuais sao genericas (ex: "Capacidade de observar pensamentos e emocoes...") e os niveis sao apenas rotulos ("Em desenvolvimento", "Moderado", "Bem desenvolvido").

### O Que Vai Melhorar

1. **Descricoes detalhadas por dimensao** - Textos mais longos explicando o que cada dimensao avalia e por que e importante
2. **Interpretacao por nivel de score** - Para cada dimensao, um texto especifico baseado no nivel (baixo/medio/alto) explicando o que aquele resultado significa na pratica
3. **Descricao do score geral** - Texto explicativo sobre o que o score geral representa
4. **Secao "O que e o IQ+IS"** - Breve introducao no topo explicando o diagnostico

### Implementacao

#### 1. Criar arquivo de conteudo explicativo

**Novo arquivo**: `src/lib/dimension-descriptions.ts`

Contera para cada dimensao:
- `about`: Texto de 2-3 frases explicando a dimensao em profundidade
- `lowInterpretation`: O que significa ter score baixo nessa dimensao
- `midInterpretation`: O que significa ter score moderado
- `highInterpretation`: O que significa ter score alto
- `whyItMatters`: Por que essa dimensao e importante

Exemplo:
```
"Consciencia Interior": {
  about: "Esta dimensao avalia sua capacidade de pausar e observar seus proprios
    pensamentos, emocoes e reacoes sem julgamento. Inclui praticas de atencao plena,
    auto-observacao e reconhecimento de padroes automaticos de comportamento.",
  lowInterpretation: "Voce pode estar operando no 'piloto automatico' com frequencia,
    reagindo a situacoes sem perceber seus padroes internos. E um convite para
    desenvolver momentos de pausa e auto-observacao.",
  midInterpretation: "Voce ja demonstra capacidade de auto-observacao em alguns
    momentos, mas pode aprofundar essa pratica para que se torne mais consistente.",
  highInterpretation: "Voce tem uma forte capacidade de se observar internamente,
    reconhecendo pensamentos e emocoes com clareza. Isso e uma base solida para
    seu desenvolvimento."
}
```

#### 2. Atualizar o DimensionCard

**Arquivo**: `src/components/diagnostic/DimensionCard.tsx`

- Importar as descricoes detalhadas
- Substituir a descricao curta pela descricao `about` mais completa
- Adicionar a interpretacao especifica baseada no nivel do score (baixo/medio/alto)
- Mostrar a interpretacao como um texto em italico abaixo da barra de progresso

#### 3. Atualizar o ParticipantResultModal

**Arquivo**: `src/components/participants/ParticipantResultModal.tsx`

- Adicionar secao introdutoria "Sobre o Diagnostico IQ+IS" antes do radar chart
- Melhorar a mensagem do score geral com texto mais explicativo baseado na faixa

#### 4. Atualizar o DiagnosticResults

**Arquivo**: `src/components/diagnostic/DiagnosticResults.tsx`

- Mesmas melhorias do modal para manter consistencia entre as duas visualizacoes

### Arquivos a Criar/Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/dimension-descriptions.ts` | **Novo** - Conteudo explicativo detalhado por dimensao e nivel |
| `src/components/diagnostic/DimensionCard.tsx` | Adicionar interpretacao por nivel e descricao expandida |
| `src/components/participants/ParticipantResultModal.tsx` | Adicionar secao introdutoria e mensagem do score geral mais rica |
| `src/components/diagnostic/DiagnosticResults.tsx` | Mesmas melhorias para consistencia |

### Secao Tecnica

- O arquivo `dimension-descriptions.ts` exporta um `Record<string, DimensionDescription>` com as 5 dimensoes
- Uma funcao helper `getInterpretation(dimension, score)` retorna o texto correto baseado no nivel
- O `DimensionCard` recebe o conteudo explicativo sem necessidade de mudar sua interface (props)
- Nenhuma mudanca no banco de dados necessaria - todo o conteudo e estatico no frontend
