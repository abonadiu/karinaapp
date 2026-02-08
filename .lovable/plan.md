

## Adicionar Role "Admin" ao Sistema

### Resumo

Criar uma nova role `admin` (super-usuario) separada de `facilitator` (coach/consultor), seguindo a estrutura de roles sugerida:

| Role | Descricao | Acesso |
|------|-----------|--------|
| **admin** | Super-usuario do sistema | Painel administrativo, gestao de facilitadores, configuracoes globais, logs de auditoria |
| **facilitator** | Coach/Consultor | Gerencia suas proprias empresas e participantes, aplica diagnosticos |
| **company_manager** | Gestor RH | Visualiza dados agregados da sua empresa |
| **participant** | Participante | Acesso via token (sem conta no sistema) - sem alteracao |

---

## Impacto das Mudancas

### O que muda

1. **Painel de Administracao** (`/admin`) passa a exigir role `admin` em vez de `facilitator`
2. **Funcoes SQL** de gestao de usuarios/roles passam a verificar `admin`
3. **Politicas RLS** de tabelas administrativas (`audit_logs`, `system_settings`) passam a verificar `admin`
4. **Edge function** `admin-create-user` passa a verificar role `admin`
5. **Menu lateral** exibe "Administracao" apenas para admins
6. **Dialogs de criacao/edicao** incluem nova opcao "Administrador"

### O que NAO muda

- Facilitadores continuam gerenciando suas empresas e participantes normalmente
- Gestores de empresa continuam com acesso ao portal
- Participantes continuam acessando via token
- Politicas RLS de `companies`, `participants`, `diagnostic_*` permanecem iguais

---

## Etapas de Implementacao

### Etapa 1: Migrar Banco de Dados

**1.1 Adicionar valor ao enum `app_role`:**
```sql
ALTER TYPE public.app_role ADD VALUE 'admin';
```

**1.2 Atualizar politicas RLS para usar `admin`:**
- `audit_logs`: SELECT exige `admin`
- `system_settings`: SELECT, UPDATE, INSERT exigem `admin`

**1.3 Atualizar funcoes SQL:**
- `get_platform_stats()`: verificar `admin`
- `get_all_users()`: verificar `admin`
- `admin_set_user_role()`: verificar `admin`
- `admin_remove_user_role()`: verificar `admin` + protecao contra remover propria role `admin`
- `log_audit_event()`: sem alteracao (continua registrando para qualquer usuario autenticado)

**1.4 Migrar usuario atual para admin:**
```sql
-- Adicionar role admin ao usuario que ja era facilitator (se for o caso)
-- O facilitador atual que e administrador ganhara role admin
```

---

### Etapa 2: Atualizar Edge Function

**Arquivo: `supabase/functions/admin-create-user/index.ts`**

Alterar verificacao de `facilitator` para `admin`:
```typescript
const { data: hasRole } = await supabaseAdmin.rpc("has_role", {
  _user_id: caller.id,
  _role: "admin",  // era "facilitator"
});
```

---

### Etapa 3: Atualizar Frontend

**3.1 Atualizar `Administracao.tsx`:**
- Verificar `admin` em vez de `facilitator`
- Renomear variaveis de `isFacilitator` para `isAdmin`

**3.2 Atualizar `Sidebar.tsx`:**
- Exibir link "Administracao" condicionalmente (apenas para admins)
- Adicionar verificacao de role no AuthContext ou localmente

**3.3 Atualizar `AuthContext.tsx`:**
- Adicionar `isAdmin: boolean` ao contexto
- Adicionar funcao `checkAdminStatus()` similar a `checkManagerStatus()`

**3.4 Atualizar `ImpersonationContext.tsx`:**
- Adicionar `admin` ao tipo `ImpersonatedRole`

**3.5 Atualizar `AdminUsers.tsx`:**
- Adicionar opcao "Administrador" no dropdown de roles
- Atualizar funcao `getRoleBadge()` para exibir badge de Admin

**3.6 Atualizar `CreateUserDialog.tsx`:**
- Adicionar opcao "Administrador" no select de role

**3.7 Atualizar `EditRoleDialog.tsx`:**
- Adicionar opcao "Administrador" no select
- Protecao contra remover propria role de `admin`

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/migrations/...` | Nova migracao SQL |
| `supabase/functions/admin-create-user/index.ts` | Verificar `admin` |
| `src/contexts/AuthContext.tsx` | Adicionar `isAdmin` |
| `src/contexts/ImpersonationContext.tsx` | Adicionar `admin` ao tipo |
| `src/pages/Administracao.tsx` | Verificar `admin` |
| `src/components/layout/Sidebar.tsx` | Exibir menu condicionalmente |
| `src/components/admin/AdminUsers.tsx` | Badge e opcoes para admin |
| `src/components/admin/CreateUserDialog.tsx` | Opcao admin |
| `src/components/admin/EditRoleDialog.tsx` | Opcao admin + protecao |
| `src/components/admin/AdminOverview.tsx` | Exibir contagem de admins |

---

## Consideracoes de Seguranca

1. **Protecao contra lockout**: Admin nao pode remover sua propria role de `admin`
2. **Verificacao server-side**: Todas as verificacoes de permissao sao feitas via RPC com `SECURITY DEFINER`
3. **Audit log**: Todas as alteracoes de role continuam sendo registradas
4. **Separacao de poderes**: Facilitadores nao tem mais acesso administrativo por padrao

---

## Migracao de Usuarios Existentes

Ao aplicar a migracao, usuarios que atualmente tem role `facilitator` e deveriam ser administradores precisarao receber a role `admin` manualmente (ou via script na migracao).

A sugestao e:
1. Manter o usuario `abonadiu@gmail.com` com **ambas** as roles: `admin` + `facilitator`
2. Isso permite que ele administre o sistema E gerencie suas proprias empresas/participantes

---

## Fluxo Visual Atualizado

```text
+------------------+
|      ADMIN       |  <- Novo! Acesso total ao sistema
+------------------+
         |
         v
+------------------+
|   FACILITATOR    |  <- Coaches que aplicam diagnosticos
+------------------+
         |
         v
+------------------+
| COMPANY_MANAGER  |  <- Gestores RH das empresas
+------------------+
         |
         v
+------------------+
|   PARTICIPANT    |  <- Acesso via token (sem alteracao)
+------------------+
```

