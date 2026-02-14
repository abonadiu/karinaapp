

## Ativar Mapa da Alma na tabela test_types

### Situacao atual

O registro com slug `mapa_da_alma` nao existe na tabela `test_types`. Precisamos inseri-lo.

### Acao

Executar um INSERT na tabela `test_types` para criar o tipo de teste "Mapa da Alma" com `is_active = true`:

```sql
INSERT INTO test_types (name, slug, description, icon, is_active)
VALUES (
  'Mapa da Alma',
  'mapa_da_alma',
  'Mapeamento profundo da essência interior baseado no Soul Plan',
  'star',
  true
);
```

### Detalhes tecnicos

- Tabela: `test_types`
- Operacao: INSERT (dados, nao schema)
- Nenhum arquivo de codigo sera alterado
- O icone `star` sera usado pois ja existe no `iconMap` do `AssignTestDialog.tsx`

