
# Plano: Integração Calendly na Administração

## Resumo

Adicionar seção de configuração do Calendly na área de administração e criar uma Edge Function para receber webhooks do Calendly, registrando automaticamente as sessões de feedback na tabela `feedback_sessions`.

---

## Arquitetura da Solução

```text
+-------------------+       +-------------------+       +--------------------+
| Participante      |       | Calendly          |       | Lovable Cloud      |
| clica no botão    | ----> | Widget/Popup      | ----> | Edge Function      |
| de agendamento    |       | (agendamento)     |       | (webhook)          |
+-------------------+       +-------------------+       +--------------------+
                                                               |
                                                               v
                                                        +--------------------+
                                                        | feedback_sessions  |
                                                        | (tabela)           |
                                                        +--------------------+
```

---

## Componentes a Criar/Modificar

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/components/admin/AdminCalendlyIntegration.tsx` | Novo | Card de configuração do Calendly |
| `src/components/admin/AdminSettings.tsx` | Modificar | Adicionar seção de integrações |
| `supabase/functions/calendly-webhook/index.ts` | Novo | Edge Function para receber webhooks |
| `supabase/config.toml` | Modificar | Registrar nova função |
| Migração SQL | Nova | Adicionar configurações de Calendly na system_settings |

---

## 1. Configuração de Calendly na Administração

### Novo Componente: AdminCalendlyIntegration

Card dedicado para gerenciar a integração:

```text
+--------------------------------------------------+
| 📅 Integração Calendly                           |
|--------------------------------------------------|
| Status: ● Ativo / ○ Inativo                      |
|                                                  |
| Webhook URL: (copiável, readonly)                |
| https://dlsnflfqemavnhavtaxe.functions.          |
| supabase.co/calendly-webhook                     |
|                                                  |
| Signing Key: ******* [Mostrar] [Copiar]          |
| [Configurar]                                     |
|                                                  |
| Eventos Registrados: 15                          |
| Última Sincronização: há 2 horas                 |
|--------------------------------------------------|
| [Testar Conexão]          [Ver Logs de Webhook]  |
+--------------------------------------------------+
```

### Campos a Salvar em system_settings

| Chave | Valor (JSON) |
|-------|--------------|
| `calendly_integration` | `{ enabled: true, signing_key: "xxx", last_sync: "2026-01-30T..." }` |

---

## 2. Edge Function: calendly-webhook

### Endpoint
`POST /functions/v1/calendly-webhook`

### Eventos Suportados
| Evento Calendly | Ação na Plataforma |
|-----------------|-------------------|
| `invitee.created` | Criar registro em `feedback_sessions` com status `scheduled` |
| `invitee.canceled` | Atualizar registro para status `cancelled` |

### Fluxo de Processamento

```text
1. Receber payload do Calendly
          |
          v
2. Validar assinatura do webhook (Calendly-Webhook-Signature)
          |
          v
3. Extrair dados do invitee (email, nome, horário)
          |
          v
4. Buscar participante pelo email
          |
          v
5. Inserir/atualizar feedback_sessions
          |
          v
6. Retornar 200 OK
```

### Payload do Calendly (invitee.created)

```json
{
  "event": "invitee.created",
  "payload": {
    "email": "participante@email.com",
    "name": "João Silva",
    "scheduled_event": {
      "start_time": "2026-02-01T10:00:00Z",
      "end_time": "2026-02-01T10:30:00Z",
      "uri": "https://api.calendly.com/scheduled_events/xxx",
      "name": "Sessão de Feedback IQ+IS"
    },
    "uri": "https://api.calendly.com/invitees/yyy"
  }
}
```

### Código da Edge Function

```typescript
serve(async (req: Request) => {
  // 1. Validar assinatura
  const signature = req.headers.get("Calendly-Webhook-Signature");
  const body = await req.text();
  
  if (!verifySignature(body, signature, signingKey)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);
  
  // 2. Processar evento
  if (event.event === "invitee.created") {
    // Buscar participante pelo email
    const { data: participant } = await supabase
      .from("participants")
      .select("id, facilitator_id")
      .eq("email", event.payload.email)
      .single();

    if (participant) {
      // Inserir sessão de feedback
      await supabase.from("feedback_sessions").insert({
        participant_id: participant.id,
        facilitator_id: participant.facilitator_id,
        status: "scheduled",
        scheduled_at: event.payload.scheduled_event.start_time,
        event_name: event.payload.scheduled_event.name,
        calendly_event_uri: event.payload.scheduled_event.uri,
        calendly_invitee_uri: event.payload.uri
      });
    }
  }
  
  if (event.event === "invitee.canceled") {
    // Atualizar status para cancelado
    await supabase
      .from("feedback_sessions")
      .update({ status: "cancelled" })
      .eq("calendly_invitee_uri", event.payload.uri);
  }

  return new Response("OK", { status: 200 });
});
```

---

## 3. Modificar AdminSettings

Adicionar nova seção "Integrações" com o componente de Calendly:

```tsx
{/* Integrações */}
<Card className="shadow-warm">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Link2 className="h-5 w-5" />
      Integrações
    </CardTitle>
  </CardHeader>
  <CardContent>
    <AdminCalendlyIntegration />
  </CardContent>
</Card>
```

---

## 4. Migração SQL

Adicionar configuração padrão na tabela `system_settings`:

```sql
INSERT INTO system_settings (key, value, description)
VALUES (
  'calendly_integration',
  '{"enabled": false, "signing_key": null, "last_sync": null}',
  'Configurações de integração com Calendly'
)
ON CONFLICT (key) DO NOTHING;
```

---

## 5. Configuração no Calendly (Manual pelo Usuário)

Instruções a exibir na interface:

1. Acessar **Calendly > Integrações > Webhooks**
2. Clicar em **Create Webhook**
3. Colar a **Webhook URL** fornecida pela plataforma
4. Selecionar eventos: `invitee.created`, `invitee.canceled`
5. Copiar a **Signing Key** gerada pelo Calendly
6. Colar a chave na configuração da plataforma

---

## 6. Componente de Logs de Webhook

Exibir histórico de eventos recebidos:

| Data/Hora | Evento | Participante | Status |
|-----------|--------|--------------|--------|
| 30/01 10:00 | invitee.created | João Silva | Processado |
| 29/01 15:30 | invitee.canceled | Maria Costa | Processado |

---

## Lista de Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/admin/AdminCalendlyIntegration.tsx` | Criar |
| `src/components/admin/AdminSettings.tsx` | Modificar |
| `supabase/functions/calendly-webhook/index.ts` | Criar |
| `supabase/functions/calendly-webhook/deno.json` | Criar |
| `supabase/config.toml` | Modificar |
| Nova migração SQL | Criar |

---

## Seção Técnica

### Validação de Assinatura do Calendly

O Calendly usa HMAC-SHA256 para assinar webhooks:

```typescript
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

async function verifySignature(
  body: string, 
  signature: string | null, 
  signingKey: string
): Promise<boolean> {
  if (!signature) return false;
  
  // Formato: t=timestamp,v1=signature
  const parts = signature.split(",");
  const timestamp = parts.find(p => p.startsWith("t="))?.slice(2);
  const sig = parts.find(p => p.startsWith("v1="))?.slice(3);
  
  if (!timestamp || !sig) return false;
  
  // Criar payload assinado
  const signedPayload = `${timestamp}.${body}`;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const computed = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );
  
  const computedHex = Array.from(new Uint8Array(computed))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  return computedHex === sig;
}
```

### Estrutura do deno.json

```json
{
  "imports": {
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2"
  }
}
```

### Config TOML

```toml
[functions.calendly-webhook]
verify_jwt = false
```

---

## Estimativa

| Etapa | Mensagens |
|-------|-----------|
| Migração SQL | 1 |
| Edge Function calendly-webhook | 1 |
| Componente AdminCalendlyIntegration | 1 |
| Modificar AdminSettings | 1 |
| **Total** | 4 mensagens |
