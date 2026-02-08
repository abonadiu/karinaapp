

## Corrigir Sistema de Participantes no Admin

### Problemas Identificados

Ao analisar o código e banco de dados, identifiquei os seguintes problemas:

| Problema | Status | Causa |
|----------|--------|-------|
| Role nao aparece na tabela | UI incompleta | `getRoleBadges` nao renderiza badge para `participant` |
| Nao pede empresa na criacao | Logica ausente | `CreateUserDialog` nao tem campo de empresa para participantes |
| Nao aparece empresa na edicao | Logica incompleta | `EditRoleDialog` so mostra empresa para `company_manager` |
| Tabela participants sem user_id | Migracao pendente | Coluna `user_id` nao existe na tabela |

**Nota importante**: A role `participant` **foi salva corretamente** no banco de dados - o problema e apenas visual na UI.

---

### Solucao

#### 1. Adicionar Badge para Participante na Tabela

**Arquivo**: `src/components/admin/AdminUsers.tsx`

Adicionar badge para role `participant` na funcao `getRoleBadges`:

```typescript
{roles.includes('participant') && (
  <Badge variant="outline" className="border-green-600 text-green-600">
    <Users className="h-3 w-3 mr-1" />
    Participante
    {/* Se tiver empresa vinculada, mostrar */}
  </Badge>
)}
```

---

#### 2. Adicionar Campo de Empresa no CreateUserDialog

**Arquivo**: `src/components/admin/CreateUserDialog.tsx`

Quando o role selecionado for `participant` ou `company_manager`, mostrar um dropdown para selecionar a empresa:

- Adicionar estado para `selectedCompanyId`
- Carregar lista de empresas
- Mostrar dropdown condicionalmente
- Enviar `companyId` para a edge function

---

#### 3. Atualizar Edge Function para Vincular Participante a Empresa

**Arquivo**: `supabase/functions/admin-create-user/index.ts`

Adicionar logica para:
- Receber `companyId` no request
- Se role for `participant` e tiver `companyId`, criar registro na tabela `participants`
- Se role for `company_manager` e tiver `companyId`, vincular via `admin_link_user_to_company`

---

#### 4. Mostrar Empresa na Edicao para Participantes

**Arquivo**: `src/components/admin/EditRoleDialog.tsx`

Expandir a logica de selecao de empresa para incluir role `participant`:

```typescript
{(selectedRoles.has("company_manager") || selectedRoles.has("participant")) && (
  <div className="mt-4 p-3 rounded-lg border bg-muted/30">
    {/* Selector de empresa */}
  </div>
)}
```

---

#### 5. Criar Migracao para Coluna user_id

**Banco de Dados**: Nova migracao SQL

```sql
-- Adicionar coluna user_id na tabela participants
ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Criar indice para performance
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);

-- Adicionar RLS para participantes verem seus proprios dados
CREATE POLICY "Participants can view their own data"
ON participants FOR SELECT
USING (user_id = auth.uid());
```

---

#### 6. Atualizar Funcao get_all_users

**Banco de Dados**: Funcao atualizada

Modificar para incluir dados de participantes vinculados:

```sql
-- Buscar empresa do participante se existir
LEFT JOIN participants part ON part.user_id = au.id
LEFT JOIN companies c_part ON c_part.id = part.company_id
```

---

### Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/components/admin/AdminUsers.tsx` | Adicionar badge para participant |
| `src/components/admin/CreateUserDialog.tsx` | Adicionar campo de empresa |
| `src/components/admin/EditRoleDialog.tsx` | Mostrar empresa para participant |
| `supabase/functions/admin-create-user/index.ts` | Criar participante com empresa |
| Migracao SQL | Adicionar user_id e atualizar get_all_users |

---

### Fluxo Esperado Apos Correcoes

1. Admin clica em "Novo Usuario"
2. Preenche nome, email, senha
3. Seleciona role "Participante"
4. **Novo**: Aparece dropdown para selecionar empresa
5. Cria usuario
6. Usuario aparece na tabela com badge "Participante" e nome da empresa
7. Ao editar, pode alterar a empresa vinculada

