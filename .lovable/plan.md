

## Corrigir navegacao com filtros e tornar lembretes clicaveis no Dashboard

### Problema

- O card "Concluidos" no Dashboard navega para `/participantes?status=completed`, mas a pagina Participantes le o filtro de `location.state.statusFilter`, nao de query params. O filtro nao e aplicado.
- Os 4 cards de estatisticas de lembretes e a lista de lembretes recentes nao sao clicaveis.

### Alteracoes

**1. `src/pages/Dashboard.tsx`**

- Adicionar propriedade `state` ao array `statCards` para o card "Concluidos":
  - `href: "/participantes"` com `state: { statusFilter: "completed" }`
- Atualizar o componente `Link` para passar `state={stat.state}` na navegacao
- Os outros dois cards (Empresas, Participantes) continuam sem state

**2. `src/components/dashboard/ReminderStatsCard.tsx`**

- Importar `useNavigate` do react-router-dom
- Tornar os 4 cards de estatisticas clicaveis com `onClick` e estilos de hover:
  - **Total Enviados**: navega para `/participantes` (sem filtro, mostra todos)
  - **Esta Semana**: navega para `/participantes` (sem filtro)
  - **Taxa Conversao**: navega para `/participantes` com `statusFilter: "completed"`
  - **Taxa Sucesso**: navega para `/participantes` (sem filtro)
- Adicionar `cursor-pointer`, `hover:bg-muted/80`, e `transition-colors` aos cards
- Tornar cada item da lista de lembretes recentes clicavel:
  - Ao clicar, navega para `/participantes` com `{ searchQuery: reminder.participant_name }` no state

**3. `src/pages/Participantes.tsx`** (ajuste menor)

- Adicionar suporte a `location.state?.searchQuery` para pre-preencher o campo de busca quando o usuario clica em um lembrete recente no Dashboard

### Fluxo esperado

1. Clicar em "Concluidos" no Dashboard -> abre Participantes filtrado por status "completed"
2. Clicar em "Taxa Conversao" nos lembretes -> abre Participantes filtrado por "completed"
3. Clicar em "Total Enviados" -> abre Participantes (lista geral)
4. Clicar no nome de um participante nos lembretes recentes -> abre Participantes com o nome no campo de busca

