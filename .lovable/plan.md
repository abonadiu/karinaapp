

## Correcao: Desmarcar selecao ao trocar de pergunta

### Problema

Quando o participante responde uma pergunta, o botao fica marcado (highlighted) e a proxima pergunta aparece com o mesmo botao ainda visualmente selecionado por um breve momento. Isso induz o participante a clicar no mesmo valor sem refletir.

A causa e o delay de 200ms no `handleSelect` do `QuestionCard.tsx` -- durante esse tempo, o valor ja foi setado visualmente mas a pergunta ainda nao avancou. Alem disso, quando a pergunta ja foi respondida anteriormente (voltou e avancou de novo), o valor antigo aparece marcado, o que e correto, mas para perguntas novas nao deveria haver nenhuma selecao.

### Solucao

1. **Adicionar um estado local** no `QuestionCard` que controla a selecao visual, resetando para `undefined` sempre que o `question.id` mudar (nova pergunta)
2. Manter o valor salvo (`currentValue`) apenas como valor inicial quando o participante volta a uma pergunta ja respondida
3. Isso garante que ao avancar para uma pergunta nova, nenhum botao estara marcado

### Mudancas

**`src/components/diagnostic/QuestionCard.tsx`**:
- Adicionar um `useState` local para `selectedValue`, inicializado com `currentValue`
- Usar `useEffect` para resetar `selectedValue` para `currentValue` (ou `undefined`) quando `question.id` mudar
- Passar `selectedValue` em vez de `currentValue` para o `LikertScale`
- No `handleSelect`, setar o `selectedValue` imediatamente para feedback visual, e depois chamar `onAnswer` com o delay

