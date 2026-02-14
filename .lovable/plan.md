

## Adicionar botoes "Novo Participante" e "Importar CSV" na pagina Participantes

### Resumo

Adicionar dois botoes no topo da pagina de Participantes para criar participantes individualmente (com selecao de empresa) e importar em lote via CSV.

### Alteracoes

**1. `src/components/participants/ParticipantForm.tsx`**

- Adicionar prop opcional `companies` (array de `{id, name}`)
- Adicionar campo `company_id` ao schema zod (opcional por padrao)
- Quando `companies` e fornecido e nao esta editando, exibir um `<Select>` de empresa no topo do formulario com validacao obrigatoria
- Quando nao fornecido (uso em EmpresaDetalhes), funciona como hoje sem mudancas

**2. `src/pages/Participantes.tsx`**

- Adicionar estados: `isFormOpen`, `isCsvOpen`, `csvCompanyId`
- Adicionar imports: `CsvImport`, `UserPlus`, `Upload`
- Adicionar dois botoes ao lado dos filtros:
  - "Importar CSV" (variante outline, icone Upload)
  - "Novo Participante" (variante default, icone UserPlus)
- Implementar `handleCreateParticipant`:
  - Usa `data.company_id` do formulario (vem do select de empresa)
  - Insere na tabela `participants` com `facilitator_id = user.id`
  - Chama `fetchData()` para atualizar
- Implementar `handleCsvImport`:
  - Se `companyFilter !== "all"`, usa essa empresa automaticamente
  - Senao, exibe toast pedindo para filtrar por empresa primeiro
  - Insere participantes em lote e chama `fetchData()`
- Adicionar `<ParticipantForm>` para criacao (com prop `companies`)
- Adicionar `<CsvImport>` para importacao em lote

### Fluxo do usuario

1. Clica "Novo Participante" -> abre formulario com select de empresa + campos de dados
2. Clica "Importar CSV" -> se uma empresa esta selecionada no filtro, abre direto o dialog CSV; senao, mostra toast pedindo para selecionar empresa primeiro
3. Apos criar/importar, a lista atualiza automaticamente

