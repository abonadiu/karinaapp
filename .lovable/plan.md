

## Remover bloco "Diagnostico ainda nao concluido" do painel lateral

### O que mudar

No arquivo `src/pages/Participantes.tsx`, remover o bloco de fallback que aparece quando o participante nao tem status "completed". Esse bloco mostra o icone de relogio, a mensagem "Diagnostico ainda nao concluido" e o badge de status — informacao redundante, pois o `ParticipantTestsList` ja exibe o status de cada teste.

### Detalhes tecnicos

**`src/pages/Participantes.tsx`**:
- Remover todo o bloco condicional que comeca com `{selectedParticipant.status === "completed" ? ...}` e o fallback com o icone `Clock` e `StatusBadge`
- Manter apenas a secao de resultado legado (diagnostic_results) para participantes que ja completaram o diagnostico antigo, sem o wrapper condicional de status
- Remover os imports nao utilizados: `Clock` do lucide-react e `StatusBadge`

O resultado final: o painel lateral mostra apenas o cabecalho do participante, a lista de testes (`ParticipantTestsList`), e os resultados quando visualizados.

