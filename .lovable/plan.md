

## Correcao: Contraste da fonte durante transicao entre perguntas

### Problema

Quando o componente `QuestionCard` remonta (por causa do `key={currentQuestion.id}`), os botoes do `LikertScale` usam `transition-all`, o que faz o texto animar brevemente de branco (estado anterior `text-primary-foreground`) para a cor correta. Como nao ha cor de texto explicita no estado nao-selecionado, a transicao fica visualmente quebrada.

### Solucao

Duas mudancas no `LikertScale.tsx`:

1. **Substituir `transition-all` por transicoes especificas** (`transition-colors` e propriedades de borda/background) para evitar que a cor do texto anime
2. **Adicionar `text-foreground` explicito** no estado nao-selecionado dos botoes, garantindo que a cor do texto esteja sempre definida

### Mudancas

**`src/components/diagnostic/LikertScale.tsx`**:

- Linha 22 (desktop): trocar `transition-all` por `transition-colors duration-150`
- Linha 27: adicionar `text-foreground` ao estado nao-selecionado
- Linha 45 (mobile): mesma troca de `transition-all` por `transition-colors duration-150`
- Linha 50: adicionar `text-foreground` ao estado nao-selecionado

Isso garante que ao remontar o componente, o texto nunca pisca em branco.

