

## Permitir reenvio de teste ja respondido

### Problema atual

Existem dois bloqueios impedindo que um participante receba o mesmo tipo de teste novamente:

1. **Constraint UNIQUE no banco**: A tabela `participant_tests` tem um indice unico em `(participant_id, test_type_id)`, impedindo a insercao de uma segunda atribuicao do mesmo tipo
2. **Bloqueio na UI**: O `AssignTestDialog` marca testes ja atribuidos como "Ja atribuido" e desabilita o botao

### Solucao

1. **Migracao SQL**: Remover o constraint unico `participant_tests_participant_id_test_type_id_key` para permitir multiplas atribuicoes do mesmo tipo de teste ao mesmo participante

2. **Atualizar `AssignTestDialog.tsx`**:
   - Remover a logica de `alreadyAssigned` que desabilita o botao
   - Remover a prop `existingTestTypeIds` (nao sera mais necessaria)
   - Mostrar um indicador informativo caso o teste ja tenha sido atribuido antes (ex: badge "Atribuido X vezes"), mas sem bloquear

3. **Atualizar `Participantes.tsx`**:
   - Remover a busca de `existingTestTypeIds` antes de abrir o dialog
   - Simplificar a funcao `handleAssignTest`

### Detalhes tecnicos

**Migracao SQL**:
```text
DROP INDEX IF EXISTS participant_tests_participant_id_test_type_id_key;
```

**`src/components/participants/AssignTestDialog.tsx`**:
- Remover prop `existingTestTypeIds` da interface
- Remover a verificacao `alreadyAssigned` que desabilita o botao
- Manter apenas `!tt.is_active` como condicao de desabilitar
- Opcionalmente mostrar quantas vezes o teste ja foi atribuido (badge informativo)

**`src/pages/Participantes.tsx`**:
- Remover estado `existingTestTypeIds`
- Simplificar `handleAssignTest` removendo a query previa de test_type_ids
- Remover a prop `existingTestTypeIds` do componente `AssignTestDialog`

