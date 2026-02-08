
## Vincular Gestor a Empresa na Edicao de Usuario

### Resumo

Adicionar funcionalidade no dialog de edicao de usuario para vincular/desvincular um gestor (`company_manager`) a uma empresa existente.

---

## Mudancas Necessarias

### 1. Banco de Dados

**Atualizar funcao `get_all_users`** para retornar informacoes da empresa vinculada:

```sql
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
AS $$
  SELECT json_agg(
    json_build_object(
      'user_id', au.id,
      'email', au.email,
      'full_name', p.full_name,
      'roles', (SELECT COALESCE(json_agg(ur.role), '[]') FROM user_roles ur WHERE ur.user_id = au.id),
      'created_at', au.created_at,
      'last_sign_in', au.last_sign_in_at,
      'company_id', cm.company_id,      -- NOVO
      'company_name', c.name            -- NOVO
    )
  )
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN company_managers cm ON cm.user_id = au.id AND cm.status = 'active'
  LEFT JOIN companies c ON c.id = cm.company_id;
$$;
```

**Criar funcao `admin_link_user_to_company`** para vincular usuario a empresa:

```sql
CREATE FUNCTION admin_link_user_to_company(
  p_user_id uuid, 
  p_company_id uuid,
  p_name text,
  p_email text
) RETURNS boolean
```

**Criar funcao `admin_unlink_user_from_company`** para desvincular:

```sql
CREATE FUNCTION admin_unlink_user_from_company(p_user_id uuid) RETURNS boolean
```

---

### 2. Frontend - EditRoleDialog.tsx

Adicionar secao condicional quando `company_manager` estiver selecionado:

- Select para escolher empresa (buscar lista de empresas)
- Mostrar empresa atualmente vinculada
- Botao para desvincular

**Novo fluxo:**

```text
+---------------------------+
|   Editar Roles            |
+---------------------------+
| [ ] Administrador         |
| [ ] Facilitador           |
| [x] Gestor de Empresa     |  <-- Quando marcado, exibe:
|                           |
| Empresa vinculada:        |
| [TechCorp Brasil    v]    |  <-- Select com empresas
|                           |
+---------------------------+
```

---

### 3. Frontend - AdminUsers.tsx

Atualizar interface `UserData` para incluir empresa:

```typescript
interface UserData {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: string[] | null;
  created_at: string;
  last_sign_in: string | null;
  company_id: string | null;    // NOVO
  company_name: string | null;  // NOVO
}
```

Exibir empresa na tabela (na coluna de roles ou como coluna separada).

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/migrations/...` | Nova migracao SQL |
| `src/components/admin/EditRoleDialog.tsx` | Adicionar selecao de empresa |
| `src/components/admin/AdminUsers.tsx` | Exibir empresa na tabela |

---

## Consideracoes de Seguranca

1. Funcoes SQL usam `SECURITY DEFINER` e verificam role `admin`
2. Validacao server-side antes de vincular/desvincular
3. Registro no audit log para todas as operacoes
4. Um usuario pode ter apenas uma empresa vinculada como gestor

---

## Comportamento Esperado

1. Ao marcar `Gestor de Empresa`, aparece select de empresas
2. Ao desmarcar, pergunta se deseja remover vinculo existente
3. Na tabela de usuarios, gestores mostram nome da empresa vinculada
4. Se gestor nao tem empresa, exibe aviso para vincular
