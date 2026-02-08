

## Adicionar Emulacao para Participantes

### Problema

O botao "Emular" nao aparece para usuarios com role `participant` porque:

1. A funcao `hasEmulableRole` nao inclui `participant` na lista de roles emulaveis
2. A funcao `handleImpersonate` nao tem logica para emular participantes

---

### Solucao

#### 1. Atualizar hasEmulableRole

**Arquivo**: `src/components/admin/AdminUsers.tsx`

Adicionar `participant` a lista de roles emulaveis:

```typescript
const hasEmulableRole = (roles: string[] | null) => {
  if (!roles || roles.length === 0) return false;
  return roles.some(r => ['admin', 'facilitator', 'company_manager', 'participant'].includes(r));
};
```

---

#### 2. Adicionar Logica de Emulacao para Participante

**Arquivo**: `src/components/admin/AdminUsers.tsx`

Adicionar tratamento na funcao `handleImpersonate` para emular participantes:

```typescript
} else if (roles.includes("participant")) {
  // Buscar dados do participante
  const { data: participant } = await supabase
    .from("participants")
    .select("id, company_id, companies(name)")
    .eq("user_id", user.user_id)
    .single();
  
  if (participant) {
    startImpersonation({
      userId: user.user_id,
      email: user.email,
      fullName: user.full_name,
      role: "participant",
      companyId: participant.company_id,
      companyName: participant.companies?.name || "Empresa",
      participantToken: participant.id, // Token para acessar portal
    });
    
    toast.success(`Emulando visao de ${user.full_name || user.email}`);
    navigate("/participante/portal");
  } else {
    toast.error("Este participante nao possui dados vinculados");
  }
}
```

---

#### 3. Atualizar ImpersonationContext (se necessario)

**Arquivo**: `src/contexts/ImpersonationContext.tsx`

Verificar se o tipo `ImpersonatedRole` ja inclui `participant`. Se nao, adicionar:

```typescript
export type ImpersonatedRole = "admin" | "facilitator" | "company_manager" | "participant";
```

---

#### 4. Atualizar ImpersonationBanner

**Arquivo**: `src/components/admin/ImpersonationBanner.tsx`

Adicionar case para exibir icone e label de participante:

```typescript
case "participant":
  return <User className="h-4 w-4" />;
  
// e no getRoleLabel:
case "participant":
  return "Participante";
```

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/admin/AdminUsers.tsx` | Adicionar `participant` em hasEmulableRole e handleImpersonate |
| `src/contexts/ImpersonationContext.tsx` | Verificar/adicionar `participant` no tipo |
| `src/components/admin/ImpersonationBanner.tsx` | Adicionar case para participant |

---

### Resultado Esperado

1. Botao "Emular" aparece para usuarios com role `participant`
2. Ao clicar, admin e redirecionado para `/participante/portal`
3. Banner de emulacao mostra "Participante" como role
4. Admin pode encerrar emulacao e voltar ao painel

