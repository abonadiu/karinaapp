

## Corrigir o preview - porta do Vite incorreta

### Problema
O arquivo `vite.config.ts` esta configurado com `port: 5173`, mas o ambiente de preview do Lovable requer `port: 8080`. Isso faz com que o servidor de desenvolvimento nao inicie na porta esperada, resultando na tela "Preview has not been built yet".

### Correcao

**Arquivo: `vite.config.ts`**
- Alterar `port: 5173` para `port: 8080` na configuracao do `server`

Essa e a unica mudanca necessaria. O resto do codigo esta correto.

