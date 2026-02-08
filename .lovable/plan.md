

## Adicionar Role "Participant" ao Sistema

### Problema Identificado

O role `participant` foi adicionado no código frontend (CreateUserDialog) e no Edge Function (admin-create-user), mas:
1. O enum `app_role` no banco de dados nao inclui `participant`
2. O dialog de edicao de roles (EditRoleDialog) nao mostra a opcao `participant`

### Solucao

#### 1. Migracao do Banco de Dados

Adicionar o valor `participant` ao enum `app_role`:

```sql
ALTER TYPE app_role ADD VALUE 'participant';
```

**Nota**: Esta migracao ja foi criada anteriormente mas pode nao ter sido aplicada corretamente.

---

#### 2. Atualizar EditRoleDialog.tsx

**Arquivo**: `src/components/admin/EditRoleDialog.tsx`

**Mudancas**:

1. Atualizar o tipo `AppRole`:
```typescript
type AppRole = "admin" | "facilitator" | "company_manager" | "participant";
```

2. Adicionar checkbox para o role `participant` apos o checkbox de `company_manager`:
```typescript
<div className="flex items-center space-x-3">
  <Checkbox
    id="participant"
    checked={selectedRoles.has("participant")}
    onCheckedChange={() => handleRoleToggle("participant")}
  />
  <div className="grid gap-1.5 leading-none">
    <label htmlFor="participant" className="text-sm font-medium">
      Participante
    </label>
    <p className="text-xs text-muted-foreground">
      Acesso ao diagnostico e portal de resultados
    </p>
  </div>
</div>
```

---

#### 3. Verificar/Atualizar Edge Function

**Arquivo**: `supabase/functions/admin-create-user/index.ts`

O arquivo ja inclui `participant` no tipo, mas precisamos garantir que o banco aceite esse valor.

---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| Migration SQL | Adicionar `participant` ao enum `app_role` |
| `src/components/admin/EditRoleDialog.tsx` | Adicionar opcao de checkbox para `participant` |

---

### Verificacao

Apos as mudancas:
1. Criar um usuario com role `participant` no painel admin
2. Editar roles de um usuario existente e atribuir `participant`
3. Verificar se o participante consegue acessar o portal em `/participante/login`

