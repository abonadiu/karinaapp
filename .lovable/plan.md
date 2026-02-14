

## Corrigir erro de build no PDF Generator

### Problema

O arquivo `src/lib/pdf-generator.ts` usa `setGlobalAlpha` nas linhas 671 e 673, mas esse metodo nao existe no jsPDF. O optional chaining (`?.`) evita erro em runtime mas o TypeScript nao aceita.

### Solucao

Remover as duas linhas com `setGlobalAlpha` (linhas 671 e 673). A barra de progresso ja funciona sem transparencia - basta usar uma cor mais clara como substituto visual.

### Mudanca

| Arquivo | Acao |
|---------|------|
| `src/lib/pdf-generator.ts` | Remover linhas 671 e 673 (`setGlobalAlpha`). Substituir a cor de fundo da barra (linha 670) por um cinza claro (ex: `setFillColor(220, 220, 220)`) para simular o efeito de background sem precisar de alpha. |

