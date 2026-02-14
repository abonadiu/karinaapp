

## Corrigir overflow na pagina Participantes e no dialog Atribuir Teste

### Problema

O container `main` no `DashboardLayout` nao tem `overflow-hidden`, entao conteudos que excedem a largura causam scroll horizontal. Alem disso, os filtros e botoes estao todos numa unica linha flex que estoura.

### Alteracoes

**1. `src/components/layout/DashboardLayout.tsx`** (linha 34)

- Adicionar `overflow-x-hidden` ao `<main>` para impedir scroll horizontal:
  - De: `className="flex-1 p-5 lg:p-8"`
  - Para: `className="flex-1 p-5 lg:p-8 overflow-x-hidden"`

**2. `src/pages/Participantes.tsx`** (linhas 458-521)

Separar filtros e botoes em duas linhas:

- **Linha 1** (botoes de acao): `div` com `flex justify-end gap-2 flex-wrap`
  - Botao "Importar CSV"
  - Botao "Novo Participante"

- **Linha 2** (filtros): `div` com `flex flex-wrap gap-3 items-center`
  - Campo de busca (flex-1 min-w-[200px])
  - Select empresa (w-[160px])
  - Select status (w-[160px])

Isso garante que os botoes nunca competem por espaco com os filtros.

**3. `src/components/participants/AssignTestDialog.tsx`** (linha ~98)

O dialog tambem esta estourando lateralmente. Adicionar `overflow-hidden` ao container da lista de testes e garantir que o texto da descricao tenha `truncate` para nao forcar largura extra.

