
# Plano: Corrigir Visibilidade dos Participantes

## Diagnóstico do Problema

Os participantes de teste foram criados com o `facilitator_id` do usuário `teste@facilitador.com` (ID: `44b018bf-6f01-4d22-9049-b20c5783e69a`).

O usuário atual logado é `abonadiu@gmail.com` (ID: `6f396795-05c8-4d2a-a402-f9d16fe5d66c`).

A política RLS (Row Level Security) da tabela `participants` filtra assim:
```sql
USING (auth.uid() = facilitator_id)
```

Por isso, os participantes não aparecem - eles pertencem a outro facilitador.

---

## Solução

Atualizar o `facilitator_id` de todos os participantes (e empresas relacionadas) para o ID do usuário atual.

### Passo 1: Atualizar Empresas

```sql
UPDATE companies 
SET facilitator_id = '6f396795-05c8-4d2a-a402-f9d16fe5d66c'
WHERE facilitator_id = '44b018bf-6f01-4d22-9049-b20c5783e69a';
```

### Passo 2: Atualizar Participantes

```sql
UPDATE participants 
SET facilitator_id = '6f396795-05c8-4d2a-a402-f9d16fe5d66c'
WHERE facilitator_id = '44b018bf-6f01-4d22-9049-b20c5783e69a';
```

---

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| 0 participantes visíveis | 30 participantes visíveis |
| 0 empresas visíveis | 5 empresas visíveis |

---

## Execução

Serão 2 queries SQL diretas no banco para atualizar os dados de teste:

1. Atualizar `facilitator_id` nas empresas
2. Atualizar `facilitator_id` nos participantes
