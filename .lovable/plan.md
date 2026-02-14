

## Unificar acoes no Popover e remover coluna "Acoes"

### O que mudar

Mover **todas** as acoes que hoje estao no DropdownMenu (coluna "Acoes") para dentro do Popover que aparece ao clicar na linha. Depois, remover a coluna "Acoes" e o DropdownMenu completamente.

### Acoes no Popover (ordem)

1. **Ver resultados** (Eye) - se `onRowClick` existir
2. **Atribuir teste** (ClipboardList) - se `onAssignTest` existir
3. **Enviar convite** (Mail / Loader2) - se status === "pending"
4. **Enviar lembrete** (Bell / Loader2) - se status === "invited" ou "in_progress" e `onReminder` existir
5. **Editar** (Pencil)
6. **Excluir** (Trash2) - com estilo destructive

### Detalhes tecnicos

**`src/components/participants/ParticipantList.tsx`**:

- Remover a coluna `<TableHead>Acoes</TableHead>` do header
- Remover a `<TableCell>` que contem o `DropdownMenu` inteiro
- Remover imports de `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`, `MoreHorizontal`
- Mover todas as acoes condicionais (convite, lembrete, editar, excluir) para o `PopoverContent`, usando o mesmo estilo de botao ja existente
- Para "Enviar convite" e "Enviar lembrete", manter a logica de `disabled` e o spinner (Loader2) quando `sendingInviteId`/`sendingReminderId` estiver ativo
- Para "Excluir", usar classe `text-destructive` no botao
- Adicionar um separador visual (div com border-t) entre as acoes principais e "Editar"/"Excluir"
- Remover `onClick={(e) => e.stopPropagation()}` das celulas de Testes e Status, pois nao ha mais conflito com o dropdown

