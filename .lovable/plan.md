

## Padronizar lista de participantes entre paginas (com modularizacao)

### Problema atual

A pagina `EmpresaDetalhes` tem uma versao simplificada da lista de participantes comparada com a pagina `Participantes`. Faltam:
- Busca e filtro por status
- Cards de KPI clicaveis (Total, Pendentes, Em andamento, Concluidos)
- Clique na linha para abrir Sheet lateral com resultados e testes
- Funcionalidade de lembrete
- Atribuir teste
- Contagem de testes na tabela
- Geracao de PDF DISC

### Solucao: Criar um hook + componente modular reutilizavel

Em vez de duplicar codigo, vamos extrair toda a logica de interacao com participantes em um **hook customizado** (`useParticipantActions`) e um **componente wrapper** (`ParticipantManager`) que encapsula filtros, KPIs, tabela e Sheet de resultados.

### Arquivos a criar

**1. `src/hooks/useParticipantActions.ts`** - Hook que encapsula toda a logica de:
- Enviar convite
- Enviar lembrete
- Editar participante
- Excluir participante
- Atribuir teste
- Ver resultado (abrir Sheet)
- Gerar PDF DISC
- Estados de loading para cada acao

**2. `src/components/participants/ParticipantManager.tsx`** - Componente que renderiza:
- Barra de busca + filtro de status
- Cards de KPI clicaveis (Total, Pendentes, Em andamento, Concluidos)
- `ParticipantList` com todas as props conectadas
- Sheet lateral de resultados com `ParticipantTestsList`, `DiscResults`, `ParticipantResultModal`
- Dialogs de editar, excluir, atribuir teste
- Recebe como props: `participants`, `onRefresh`, `isLoading`, e opcionalmente `showSearch` (default true)

### Arquivos a modificar

**3. `src/pages/Participantes.tsx`** - Simplificar drasticamente:
- Manter apenas: fetch de dados, filtro por empresa, botoes de acao (CSV, Novo Participante)
- Delegar tudo de participantes ao `ParticipantManager`
- Remover ~400 linhas de codigo duplicado

**4. `src/pages/EmpresaDetalhes.tsx`** - Substituir a aba "Participantes":
- Trocar o `ParticipantList` simples pelo `ParticipantManager`
- Ganhar automaticamente todas as funcionalidades: busca, filtros, KPIs, Sheet de resultados, lembretes, atribuir teste

### Estrutura do componente modular

```text
ParticipantManager
+--------------------------------------------------+
| [Buscar...]              [Status v]              |
+--------------------------------------------------+
| [Total: 14] [Pendentes: 3] [Andamento: 1] [OK: 10] |
+--------------------------------------------------+
| ParticipantList (tabela com popover de acoes)     |
|   - Ver resultados                                |
|   - Atribuir teste                                |
|   - Enviar convite / lembrete                     |
|   - Editar / Excluir                              |
+--------------------------------------------------+
| Sheet lateral (ao clicar "Ver resultados")        |
|   - ParticipantTestsList                          |
|   - DiscResults ou ParticipantResultModal         |
+--------------------------------------------------+
| AlertDialog (confirmar exclusao)                  |
| AssignTestDialog                                  |
| ParticipantForm (edicao)                          |
+--------------------------------------------------+
```

### Beneficios da modularizacao

- Qualquer nova funcionalidade adicionada ao `ParticipantManager` aparece automaticamente em ambas as paginas
- Codigo de participantes centralizado em um unico lugar
- Paginas ficam mais leves e focadas no seu contexto especifico
- Facilita testes e manutencao

### Detalhes tecnicos

**Props do ParticipantManager:**

```text
interface ParticipantManagerProps {
  participants: Participant[]
  onRefresh: () => void
  isLoading: boolean
  companyId?: string          // quando usado dentro de EmpresaDetalhes
  showStatusFilter?: boolean  // default true
  showSearch?: boolean        // default true
}
```

**Hook useParticipantActions:**

```text
function useParticipantActions(onRefresh: () => void) {
  // Estados
  sendingInviteId, sendingReminderId, editingParticipant,
  deletingParticipant, assigningParticipant, selectedParticipant,
  selectedResult, selectedTestResult, isGeneratingDiscPDF...

  // Funcoes
  handleInviteParticipant()
  handleReminderParticipant()
  handleEditParticipant()
  handleDeleteParticipant()
  handleAssignTest()
  handleRowClick()
  handleViewTestResult()

  return { estados, funcoes }
}
```

