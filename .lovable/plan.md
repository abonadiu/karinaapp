
## Menu de opcoes ao clicar no participante

### Situacao atual

Ao clicar na linha de um participante, o sistema abre diretamente o painel lateral (Sheet) com resultados. Nao ha escolha de acao.

### Proposta

Substituir o clique direto por um **Popover** (menu contextual) que aparece ao clicar na linha do participante, oferecendo duas opcoes:

1. **Ver resultados** - Abre o painel lateral com os resultados do participante (comportamento atual)
2. **Atribuir teste** - Abre o dialog de atribuicao de teste

### Mudancas

**`src/components/participants/ParticipantList.tsx`**:
- Importar `Popover`, `PopoverTrigger`, `PopoverContent` de `@/components/ui/popover`
- Adicionar estado local para controlar qual participante tem o popover aberto
- Substituir o `onClick` direto na `TableRow` por logica que abre o popover
- Renderizar o popover com dois botoes/itens de menu:
  - "Ver resultados" (icone `Eye`) - chama `onRowClick(participant)`
  - "Atribuir teste" (icone `ClipboardList`) - chama `onAssignTest(participant)`
- Fechar o popover apos qualquer clique

**`src/pages/Participantes.tsx`**:
- Nenhuma mudanca necessaria na logica, apenas as props `onRowClick` e `onAssignTest` ja existentes serao reutilizadas

### Comportamento esperado

- Clicar na linha do participante abre um pequeno menu flutuante
- O menu mostra "Ver resultados" e "Atribuir teste"
- Clicar fora fecha o menu
- A opcao "Ver resultados" so aparece se o participante tiver status "completed" (ou aparece sempre mas carrega vazio se nao tiver resultado)
