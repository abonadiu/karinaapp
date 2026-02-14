
## Correcao: "Copiar link" usa token antigo (sempre IQ+IS)

### Problema

O botao "Copiar link" no dropdown de acoes do participante (`ParticipantList.tsx`, linha 200) usa `participant.access_token` da tabela `participants`. Esse token antigo e resolvido pelo fallback do `useDiagnostic.ts` que assume sempre IQ+IS. Assim, mesmo que o participante tenha um teste DISC atribuido via `participant_tests`, o link copiado leva sempre ao diagnostico IQ+IS.

O componente `ParticipantTestsList.tsx` ja copia o link correto por teste (usando `test.access_token` da tabela `participant_tests`), mas o dropdown da lista principal nao.

### Solucao

Remover o item "Copiar link" generico do dropdown de acoes na `ParticipantList.tsx`, pois ele e ambiguo quando o participante tem multiplos testes. O link correto ja pode ser copiado pelo painel lateral ("Ver resultados"), que usa `ParticipantTestsList` com links individuais por teste.

Alternativamente, se quiser manter um "Copiar link" no dropdown, ele deve:
1. Verificar quantos testes o participante tem em `participant_tests`
2. Se houver apenas 1, copiar o `access_token` desse teste
3. Se houver multiplos, direcionar o usuario ao painel lateral para escolher

### Mudanca proposta (opcao mais simples)

**`src/components/participants/ParticipantList.tsx`**:
- Remover o bloco "Copiar link" (linhas 197-208) do DropdownMenu, pois ele usa o token legado e causa confusao
- Opcionalmente, substituir por um item que abre o painel lateral (mesmo efeito de "Ver resultados"), onde o usuario pode copiar o link do teste correto

Tambem corrigir o mesmo problema em:
- **`src/pages/Participantes.tsx`** (linha 206): A funcao `handleInviteParticipant` envia convite usando `participants.access_token` (legado). Deve buscar o `participant_tests.access_token` mais recente.
- **`src/components/participants/BulkInviteDialog.tsx`** (linha 96): Mesmo problema no convite em massa.
- **`src/pages/EmpresaDetalhes.tsx`** (linha 323): Mesmo problema no convite a partir da pagina de detalhes da empresa.

### Detalhes tecnicos

**`src/components/participants/ParticipantList.tsx`**:
- Remover o `DropdownMenuItem` "Copiar link" que usa `participant.access_token`

**`src/pages/Participantes.tsx`** - funcao `handleInviteParticipant`:
- Em vez de buscar `participants.access_token`, buscar o `participant_tests` mais recente (com status `pending` ou `invited`) para obter o token correto
- Fallback para o token legado caso nao haja registros em `participant_tests`

**`src/components/participants/BulkInviteDialog.tsx`**:
- Apos criar o participante, usar o token do `participant_tests` (se existir) em vez do `participants.access_token`

**`src/pages/EmpresaDetalhes.tsx`**:
- Mesma correcao do invite: usar token de `participant_tests`
