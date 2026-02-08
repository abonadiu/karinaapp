

## Corrigir Emulacao de Participante - Permitir Acesso Direto

### Problema Atual

Quando um admin clica em "Emular" um participante, o sistema:
1. Armazena os dados do participante no contexto de emulacao
2. Redireciona para `/participante/portal`
3. **Erro**: O `ParticipantRoute` nao verifica se esta em modo de emulacao
4. **Erro**: O `PortalParticipante` busca dados pelo `user.id` do admin (que nao e participante)

Resultado: Admin e redirecionado para tela de login, mesmo estando em modo de emulacao.

---

### Solucao

#### 1. Atualizar ParticipantRoute

**Arquivo**: `src/components/auth/ParticipantRoute.tsx`

Seguindo o mesmo padrao do `CompanyManagerRoute`, adicionar verificacao de emulacao:

```typescript
import { useImpersonation } from "@/contexts/ImpersonationContext";

export function ParticipantRoute({ children }: ParticipantRouteProps) {
  const { user, loading, isParticipant } = useAuth();
  const { isImpersonating, impersonatedUser } = useImpersonation();

  // Permitir acesso se admin esta emulando um participante
  if (isImpersonating && impersonatedUser?.role === "participant") {
    return <>{children}</>;
  }

  // Resto da logica existente...
}
```

---

#### 2. Atualizar PortalParticipante

**Arquivo**: `src/pages/participante/PortalParticipante.tsx`

Modificar para usar dados do participante emulado quando em modo de emulacao:

| Situacao | Fonte de Dados |
|----------|----------------|
| Usuario normal | Buscar via `user.id` |
| Admin emulando | Usar `impersonatedUser.participantToken` (ID do participante) |

**Mudancas principais**:

1. Importar e usar o contexto de emulacao
2. Criar variavel `effectiveParticipantId` (como no `PortalEmpresa`)
3. Modificar `fetchPortalData` para usar uma RPC diferente quando emulando (buscar por participant.id em vez de user_id)
4. Ocultar botao "Sair" quando estiver emulando (admin usa o banner para encerrar)

```typescript
const { isImpersonating, impersonatedUser } = useImpersonation();

// Se emulando, usar o participantToken; senao, null (buscar por user_id)
const effectiveParticipantId = isImpersonating && impersonatedUser?.role === "participant"
  ? impersonatedUser.participantToken
  : null;

// Modificar fetchPortalData para usar effectiveParticipantId quando disponivel
const fetchPortalData = async () => {
  if (effectiveParticipantId) {
    // Buscar direto pelo ID do participante
    const { data } = await supabase.rpc("get_participant_portal_data_by_id", {
      _participant_id: effectiveParticipantId,
    });
  } else {
    // Buscar pelo user_id (fluxo normal)
    const { data } = await supabase.rpc("get_participant_portal_data", {
      _user_id: user!.id,
    });
  }
};
```

---

#### 3. Criar Funcao RPC Alternativa

**Banco de Dados**: Nova migracao SQL

Criar uma funcao que busca dados do portal usando o ID do participante diretamente:

```sql
CREATE OR REPLACE FUNCTION get_participant_portal_data_by_id(_participant_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'participant', json_build_object(
      'id', p.id,
      'name', p.name,
      'email', p.email,
      'company_name', c.name,
      'status', p.status,
      'completed_at', p.completed_at
    ),
    'result', (
      SELECT json_build_object(
        'id', dr.id,
        'total_score', dr.total_score,
        'dimension_scores', dr.dimension_scores,
        'completed_at', dr.completed_at
      )
      FROM diagnostic_results dr
      WHERE dr.participant_id = p.id
      ORDER BY dr.completed_at DESC
      LIMIT 1
    ),
    'facilitator', json_build_object(
      'name', prof.full_name,
      'calendly_url', cs.calendly_link,
      'logo_url', prof.logo_url
    )
  ) INTO result
  FROM participants p
  JOIN companies c ON c.id = p.company_id
  LEFT JOIN profiles prof ON prof.user_id = c.owner_id
  LEFT JOIN calendly_settings cs ON cs.user_id = c.owner_id
  WHERE p.id = _participant_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/auth/ParticipantRoute.tsx` | Adicionar verificacao de emulacao |
| `src/pages/participante/PortalParticipante.tsx` | Usar dados de emulacao quando disponivel |
| Migracao SQL | Criar funcao `get_participant_portal_data_by_id` |

---

### Fluxo Corrigido

```text
Admin clica "Emular" no participante
         |
         v
Context armazena: { role: "participant", participantToken: "xxx" }
         |
         v
Navega para /participante/portal
         |
         v
ParticipantRoute verifica: isImpersonating && role === "participant"?
         |
    SIM  v
         |
Permite acesso ao PortalParticipante
         |
         v
PortalParticipante usa participantToken para buscar dados
         |
         v
Exibe dados do participante emulado
```

---

### Resultado Esperado

1. Admin clica em "Emular" para um participante
2. E redirecionado diretamente para o portal do participante
3. Ve os dados daquele participante especifico
4. Banner de emulacao aparece no topo
5. Botao "Sair" fica oculto (usa "Encerrar Emulacao" no banner)
6. Ao encerrar, volta para o painel admin

