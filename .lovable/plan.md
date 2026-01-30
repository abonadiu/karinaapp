

# Plano: Historico de Lembretes e Botao de Lembrete Manual

## Resumo

Implementar duas funcionalidades complementares:
1. **Secao no Dashboard**: Mostrar estatisticas de lembretes enviados e taxas de resposta
2. **Botao de Lembrete Manual**: Permitir que facilitadores enviem lembretes individuais a qualquer momento

---

## Funcionalidade 1: Secao de Historico de Lembretes no Dashboard

### Dados a Exibir

| Metrica | Descricao |
|---------|-----------|
| Total de lembretes enviados | Soma de todos os lembretes |
| Lembretes esta semana | Lembretes enviados nos ultimos 7 dias |
| Taxa de conversao | % de participantes que concluiram apos lembrete |
| Lembretes com sucesso | % de emails enviados sem erro |

### Componente: ReminderStatsCard

Novo componente em `src/components/dashboard/ReminderStatsCard.tsx` que exibira:
- Card com icone de sino/email
- Metricas principais em destaque
- Mini lista dos ultimos 5 lembretes enviados com status

### Query de Dados

```sql
-- Estatisticas agregadas
SELECT 
  COUNT(*) as total_reminders,
  COUNT(*) FILTER (WHERE sent_at > now() - interval '7 days') as this_week,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed
FROM participant_reminders pr
JOIN participants p ON p.id = pr.participant_id
WHERE p.facilitator_id = :user_id
```

### Layout no Dashboard

Adicionar uma nova secao abaixo das "Acoes Rapidas":
- Titulo: "Lembretes Automaticos"
- Subtitulo: "Acompanhe o sistema de lembretes"
- Cards com metricas
- Tabela compacta com historico recente

---

## Funcionalidade 2: Botao de Lembrete Manual

### Alteracoes em ParticipantList.tsx

Adicionar opcao "Enviar Lembrete" no menu dropdown para participantes com status `invited` ou `in_progress`.

### Diferenca entre Convite e Lembrete

| Acao | Status Elegivel | Funcao Edge | Template |
|------|-----------------|-------------|----------|
| Enviar Convite | `pending` | send-invite | Convite inicial |
| Enviar Lembrete | `invited`, `in_progress` | send-reminder (nova) | Lembrete |

### Nova Edge Function: send-reminder (individual)

Criar `supabase/functions/send-reminder/index.ts` para envio manual de lembretes individuais:
- Recebe: `participantId`, `participantName`, `participantEmail`, `diagnosticUrl`
- Reutiliza template de lembrete do send-reminders
- Registra na tabela `participant_reminders`
- Atualiza `reminder_count` e `last_reminder_at`

### Fluxo de Usuario

1. Facilitador visualiza lista de participantes
2. Clica no menu de acoes (...) de um participante
3. Opcao "Enviar Lembrete" aparece para status `invited` ou `in_progress`
4. Clique dispara envio do email
5. Toast confirma sucesso/erro
6. Contador de lembretes e atualizado

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/dashboard/ReminderStatsCard.tsx` | Card de estatisticas de lembretes |
| `supabase/functions/send-reminder/index.ts` | Edge function para lembrete individual |
| `supabase/functions/send-reminder/deno.json` | Configuracao Deno |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Dashboard.tsx` | Adicionar secao de lembretes |
| `src/components/participants/ParticipantList.tsx` | Adicionar opcao de lembrete no menu |
| `src/pages/Participantes.tsx` | Handler para envio de lembrete manual |
| `supabase/config.toml` | Registrar nova funcao |

---

## Design do ReminderStatsCard

```text
+------------------------------------------+
|  Lembretes Automaticos                   |
|  Acompanhe o engajamento                 |
+------------------------------------------+
|  +--------+  +--------+  +--------+      |
|  |   12   |  |    5   |  |   75%  |      |
|  | Total  |  | Semana |  | Taxa   |      |
|  +--------+  +--------+  +--------+      |
+------------------------------------------+
|  Ultimos lembretes:                      |
|  - Maria Silva (hoje, sucesso)           |
|  - Joao Costa (ontem, sucesso)           |
|  - Ana Santos (2 dias, falha)            |
+------------------------------------------+
```

---

## Interface do Menu de Participantes

```text
Menu Dropdown do Participante:
+------------------------+
| [Mail] Enviar Lembrete |  <- Novo (para invited/in_progress)
|------------------------|
| [Pencil] Editar        |
| [Trash] Excluir        |
+------------------------+
```

---

## Secao Tecnica

### Edge Function send-reminder

```typescript
interface ManualReminderRequest {
  participantId: string;
  participantName: string;
  participantEmail: string;
  accessToken: string;
}

// Fluxo:
// 1. Validar request
// 2. Buscar perfil do facilitador (via JWT)
// 3. Calcular dias desde convite
// 4. Gerar HTML do lembrete
// 5. Enviar via Resend
// 6. Registrar em participant_reminders
// 7. Atualizar participante
```

### Query para Estatisticas

```typescript
// Dashboard.tsx - nova query
const { data: reminderStats } = await supabase
  .from("participant_reminders")
  .select(`
    id,
    sent_at,
    success,
    participants!inner (
      id,
      name,
      facilitator_id
    )
  `)
  .eq("participants.facilitator_id", user.id)
  .order("sent_at", { ascending: false })
  .limit(50);
```

### Calculo da Taxa de Conversao

```sql
WITH reminded AS (
  SELECT DISTINCT participant_id
  FROM participant_reminders
  WHERE participant_id IN (
    SELECT id FROM participants WHERE facilitator_id = :user_id
  )
),
completed_after AS (
  SELECT COUNT(*) as count
  FROM participants p
  WHERE p.id IN (SELECT participant_id FROM reminded)
    AND p.status = 'completed'
)
SELECT 
  (SELECT count FROM completed_after)::float / 
  NULLIF((SELECT COUNT(*) FROM reminded), 0) * 100 as conversion_rate
```

### Reutilizacao de Codigo

O template de email sera extraido de `send-reminders/index.ts` para uma funcao compartilhada, evitando duplicacao.

---

## Estimativa de Implementacao

| Etapa | Esforco |
|-------|---------|
| Edge function send-reminder | 1 mensagem |
| ReminderStatsCard + Dashboard | 1 mensagem |
| Botao no ParticipantList | Junto com acima |
| **Total** | 2 mensagens |

