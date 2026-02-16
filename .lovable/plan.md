

## Corrigir atribuicao de role ao criar usuario pelo admin

### Problema raiz

A edge function `admin-create-user` usa o `supabaseAdmin` (service role) para chamar `admin_set_user_role`. O service role nao tem `auth.uid()`, entao a verificacao `has_role(auth.uid(), 'admin')` dentro da funcao SQL retorna false e lanca "Acesso negado".

Os logs confirmam: `Error assigning role: { code: "P0001", message: "Acesso negado" }`

### Solucao

Alterar a edge function para inserir a role diretamente na tabela `user_roles` usando o client de service role, em vez de chamar a funcao `admin_set_user_role`. O service role ja tem permissao total para inserir em qualquer tabela, e a verificacao de que o chamador e admin ja foi feita na propria edge function.

### Mudanca

**Arquivo: `supabase/functions/admin-create-user/index.ts`**

Substituir o trecho:
```typescript
const { error: roleError } = await supabaseAdmin.rpc("admin_set_user_role", {
  p_user_id: newUser.user.id,
  p_role: role,
});
```

Por:
```typescript
const { error: roleError } = await supabaseAdmin
  .from("user_roles")
  .insert({ user_id: newUser.user.id, role: role });
```

Isso e seguro porque:
1. A edge function ja verificou que o chamador e admin (via `has_role` com o token do chamador)
2. O service role tem permissao de bypass em RLS
3. A tabela `user_roles` tem constraint `UNIQUE (user_id, role)` que previne duplicatas

### Impacto
- Nenhuma mudanca no frontend
- Nenhuma migracao de banco necessaria
- Apenas a edge function precisa ser atualizada

