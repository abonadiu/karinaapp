

## Criar e Editar Usuários no Painel Administrativo

### Visao Geral
Adicionar funcionalidades ao painel de administracao para:
1. **Criar novos usuarios** com email, nome e role definido
2. **Editar role** de usuarios existentes
3. **Remover role** de usuarios

---

## Estrutura Atual

### Banco de Dados
- **Tabela `user_roles`**: armazena roles dos usuarios (enum: `facilitator`, `company_manager`)
- **Tabela `profiles`**: armazena dados do perfil (`full_name`, etc.)
- **Funcao `get_all_users`**: retorna usuarios com suas roles (funcao RPC existente)
- **Funcao `has_role`**: verifica se usuario tem determinada role

### Limitacoes Atuais
- Nao existe funcao para criar usuarios via admin (apenas signup publico)
- Nao existe funcao para atualizar/remover roles
- Tabela `user_roles` nao permite INSERT/UPDATE via RLS

---

## Plano de Implementacao

### Etapa 1: Criar funcoes de banco de dados (Migracao SQL)

**1.1 Funcao para atribuir/atualizar role:**
```sql
CREATE OR REPLACE FUNCTION admin_set_user_role(
  p_user_id uuid,
  p_role app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se chamador eh facilitador
  IF NOT has_role(auth.uid(), 'facilitator') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Inserir ou atualizar role
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Registrar no audit log
  PERFORM log_audit_event(
    'role_assigned',
    'user',
    p_user_id,
    jsonb_build_object('role', p_role)
  );

  RETURN true;
END;
$$;
```

**1.2 Funcao para remover role:**
```sql
CREATE OR REPLACE FUNCTION admin_remove_user_role(
  p_user_id uuid,
  p_role app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se chamador eh facilitador
  IF NOT has_role(auth.uid(), 'facilitator') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Remover role
  DELETE FROM user_roles
  WHERE user_id = p_user_id AND role = p_role;

  -- Registrar no audit log
  PERFORM log_audit_event(
    'role_removed',
    'user',
    p_user_id,
    jsonb_build_object('role', p_role)
  );

  RETURN true;
END;
$$;
```

**1.3 Funcao para criar usuario (via Supabase Admin):**
A criacao de usuarios requer uma edge function com service role key para criar usuarios no auth.users.

---

### Etapa 2: Criar Edge Function para criacao de usuarios

**Arquivo: `supabase/functions/admin-create-user/index.ts`**

A edge function vai:
1. Verificar se chamador e facilitador (via JWT)
2. Criar usuario no auth.users usando supabase-admin
3. Atribuir role inicial se especificado
4. Retornar dados do usuario criado

---

### Etapa 3: Componentes Frontend

**3.1 Dialog para criar usuario: `CreateUserDialog.tsx`**
- Campos: Nome, Email, Senha temporaria, Role (select)
- Validacao com Zod
- Chamada para edge function `admin-create-user`

**3.2 Dialog para editar role: `EditRoleDialog.tsx`**
- Exibe usuario atual
- Select para escolher nova role ou remover
- Chamada para RPC `admin_set_user_role` ou `admin_remove_user_role`

**3.3 Atualizar `AdminUsers.tsx`:**
- Adicionar botao "Novo Usuario" no header
- Adicionar menu dropdown nas acoes com "Editar Role"
- Integrar os novos dialogs

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/migrations/...` | Criar funcoes SQL |
| `supabase/functions/admin-create-user/index.ts` | Criar edge function |
| `src/components/admin/CreateUserDialog.tsx` | Criar componente |
| `src/components/admin/EditRoleDialog.tsx` | Criar componente |
| `src/components/admin/AdminUsers.tsx` | Modificar para integrar dialogs |

---

## Fluxo de Usuario

```text
Admin abre Painel > Aba Usuarios

[Criar Usuario]
1. Clica "Novo Usuario"
2. Preenche: Nome, Email, Senha, Role
3. Clica "Criar"
4. Sistema cria usuario + profile + role
5. Lista atualiza

[Editar Role]
1. Clica menu "..." no usuario
2. Seleciona "Editar Role"
3. Escolhe: Facilitador, Gestor, ou Remover role
4. Clica "Salvar"
5. Sistema atualiza role + audit log
```

---

## Seguranca

- Todas as operacoes exigem role `facilitator` (admin)
- Funcoes SQL usam `SECURITY DEFINER` com verificacao explicita
- Edge function valida JWT antes de criar usuario
- Acoes sao registradas na tabela `audit_logs`
- Nao e possivel remover a propria role de facilitador (protecao contra lockout)

---

## Interface Visual

### Botao Novo Usuario
Posicionado ao lado do botao "Atualizar" no header da lista

### Dialog Criar Usuario
```text
+----------------------------------+
|  Criar Novo Usuario              |
+----------------------------------+
| Nome completo:   [____________]  |
| Email:           [____________]  |
| Senha inicial:   [____________]  |
| Role:            [v Selecione ]  |
|                  - Facilitador   |
|                  - Gestor        |
|                  - Sem role      |
+----------------------------------+
|            [Cancelar] [Criar]    |
+----------------------------------+
```

### Dropdown de Acoes (por usuario)
```text
[Emular] [...]
           |
           +-> Editar Role
           +-> (futuro: Resetar Senha)
```

---

## Resultado Esperado

- Administradores podem criar usuarios diretamente no sistema
- Administradores podem promover/rebaixar usuarios entre roles
- Todas as acoes sao auditadas
- Interface intuitiva seguindo padroes existentes

