
# Plano: Sistema de Lembretes Automaticos por Email

## Resumo
Implementar um sistema de lembretes automaticos que envia emails para participantes que foram convidados mas nao concluiram o diagnostico dentro de um periodo configuravel. O sistema usara uma edge function disparada via cron job (pg_cron + pg_net).

---

## Arquitetura do Sistema

```text
pg_cron (diario)
      |
      v
pg_net HTTP POST
      |
      v
Edge Function: send-reminders
      |
      v
1. Busca participantes elegiveis
2. Aplica regras (max lembretes, intervalo)
3. Envia emails via Resend
4. Registra lembrete enviado
```

---

## Regras de Lembrete

| Regra | Valor Padrao |
|-------|--------------|
| Dias apos convite para 1o lembrete | 3 dias |
| Intervalo minimo entre lembretes | 3 dias |
| Maximo de lembretes por participante | 3 |
| Status elegiveis | `invited`, `in_progress` |

---

## Estrutura do Banco de Dados

### Nova Tabela: participant_reminders
Registra todos os lembretes enviados para controle e auditoria.

```sql
CREATE TABLE public.participant_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reminder_number INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Novas Colunas em participants
```sql
ALTER TABLE participants ADD COLUMN reminder_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE participants ADD COLUMN last_reminder_at TIMESTAMPTZ;
```

### Funcao para Buscar Participantes Elegiveis
```sql
CREATE FUNCTION get_pending_reminders()
RETURNS TABLE(
  participant_id uuid,
  participant_name text,
  participant_email text,
  access_token text,
  facilitator_id uuid,
  reminder_count integer,
  invited_at timestamptz
)
```

---

## Edge Function: send-reminders

### Funcionamento
1. Recebe chamada do cron (com secret para autenticacao)
2. Busca participantes elegiveis via funcao SQL
3. Para cada participante:
   - Busca perfil do facilitador (branding)
   - Envia email de lembrete personalizado
   - Atualiza `reminder_count` e `last_reminder_at`
   - Registra em `participant_reminders`
4. Retorna relatorio de envios

### Template do Email de Lembrete
Email diferente do convite inicial, com tom mais amigavel:
- Assunto: "Lembrete: Seu diagnostico IQ+IS esta aguardando"
- Corpo: Menciona que o diagnostico foi iniciado/convidado, incentiva a conclusao
- Mantem branding do facilitador

---

## Agendamento via pg_cron

### Habilitar Extensoes
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Criar Job Diario
```sql
SELECT cron.schedule(
  'send-diagnostic-reminders',
  '0 9 * * *', -- Todos os dias as 9h (UTC)
  $$
  SELECT net.http_post(
    url := 'https://dlsnflfqemavnhavtaxe.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_KEY>'
    ),
    body := jsonb_build_object('source', 'cron')
  );
  $$
);
```

---

## Arquivos a Criar

### Edge Function
| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/send-reminders/index.ts` | Logica de envio de lembretes |
| `supabase/functions/send-reminders/deno.json` | Configuracao Deno |

### Migracao SQL
- Tabela `participant_reminders`
- Colunas novas em `participants`
- Funcao `get_pending_reminders()`
- RLS policies
- Job pg_cron (via insert separado)

---

## Configuracao no config.toml

```toml
[functions.send-reminders]
verify_jwt = false
```

---

## Interface do Facilitador (Opcional/Futuro)

Possibilidades para controle manual:
- Botao "Enviar Lembrete" individual por participante
- Configuracao de frequencia de lembretes por empresa
- Historico de lembretes enviados

Para esta implementacao inicial, o sistema sera 100% automatico.

---

## Template do Email de Lembrete

```text
Assunto: Lembrete: Complete seu Diagnostico IQ+IS

Corpo:
- Saudacao personalizada
- Mencao de que o convite foi enviado ha X dias
- Reforco dos beneficios do diagnostico
- Botao CTA: "Continuar Diagnostico"
- Nota: "Se ja concluiu, ignore este email"
- Branding do facilitador
```

---

## Fluxo de Dados

```text
Participante convidado (status: invited, invited_at: data)
                |
                v
        3 dias se passam
                |
                v
    Cron dispara edge function
                |
                v
    Query busca participantes elegiveis:
    - status IN ('invited', 'in_progress')
    - invited_at < now() - 3 days
    - reminder_count < 3
    - (last_reminder_at IS NULL OR last_reminder_at < now() - 3 days)
                |
                v
    Para cada elegivel:
    - Envia email
    - Incrementa reminder_count
    - Atualiza last_reminder_at
    - Registra em participant_reminders
```

---

## Seguranca

1. **Autenticacao do Cron**: O job usa a anon key, mas a funcao valida a origem
2. **Rate Limiting**: Maximo 3 lembretes por participante
3. **Intervalo Minimo**: 3 dias entre lembretes evita spam
4. **Registro de Auditoria**: Todos os envios sao registrados

---

## Secao Tecnica

### Dependencias
- Resend API (ja configurada: RESEND_API_KEY)
- pg_cron e pg_net (extensoes Postgres)

### Funcao SQL de Elegibilidade
```sql
SELECT p.id, p.name, p.email, p.access_token, p.facilitator_id, 
       p.reminder_count, p.invited_at
FROM participants p
WHERE p.status IN ('invited', 'in_progress')
  AND p.invited_at < now() - interval '3 days'
  AND p.reminder_count < 3
  AND (p.last_reminder_at IS NULL 
       OR p.last_reminder_at < now() - interval '3 days')
ORDER BY p.invited_at ASC
LIMIT 100; -- Batch limit
```

### Reutilizacao de Codigo
- Funcao `darkenColor()` do send-invite
- Logica de busca de perfil do facilitador
- Template de email base (adaptado)

### Estimativa de Esforco
- Migracao DB: 1 mensagem
- Edge Function: 1 mensagem
- Configuracao Cron: Junto com migracao
- **Total**: 2-3 mensagens
