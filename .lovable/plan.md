

## Tornar os cards de KPI clicaveis na pagina de Participantes

### O que mudar

Os 4 cards de resumo (Total, Pendentes, Em andamento, Concluidos) atualmente sao estaticos. Ao clicar em cada um, devem filtrar a lista de participantes pelo status correspondente:

- **Total**: limpa o filtro (mostra todos)
- **Pendentes**: filtra por `pending`
- **Em andamento**: filtra por `in_progress`
- **Concluidos**: filtra por `completed`

O card ativo deve ter um destaque visual (borda colorida ou fundo diferenciado) para indicar qual filtro esta selecionado. Ao clicar no card que ja esta ativo, o filtro e removido (volta para "all").

### Detalhes tecnicos

**`src/pages/Participantes.tsx`** (linhas 436-459):

- Transformar cada `<div>` de card em um `<button>` (ou `<div>` com `onClick` e `cursor-pointer`)
- No click:
  - Card "Total": `setStatusFilter("all")`
  - Card "Pendentes": `setStatusFilter(statusFilter === "pending" ? "all" : "pending")`
  - Card "Em andamento": `setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")`
  - Card "Concluidos": `setStatusFilter(statusFilter === "completed" ? "all" : "completed")`
- Adicionar estilo condicional: quando `statusFilter` coincide com o status do card, aplicar uma borda destacada (ex: `border-primary` ou `ring-2 ring-primary`)
- Adicionar `cursor-pointer` e `hover:border-primary/50 transition-colors` a todos os cards
- Manter o `<Select>` de status sincronizado (ja usa `statusFilter`, entao funciona automaticamente)

