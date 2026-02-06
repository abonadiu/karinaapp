
# Plano: Dashboard de Sessões de Feedback

## Resumo

Criar uma nova aba na página de Relatórios para visualizar e gerenciar as sessões de feedback agendadas via Calendly, com filtros por status, período e empresa.

---

## Arquitetura da Solução

```text
+--------------------------------------------------+
|                 Página de Relatórios              |
+--------------------------------------------------+
| [Métricas] [Sessões de Feedback]  <- Nova aba    |
+--------------------------------------------------+
|                                                  |
|  Filtros: [Status ▼] [Período ▼] [Empresa ▼]     |
|                                                  |
|  +----------------------------------------------+|
|  | KPIs: Total | Agendadas | Realizadas | Canc. ||
|  +----------------------------------------------+|
|                                                  |
|  +----------------------------------------------+|
|  |          Tabela de Sessões                   ||
|  | Participante | Empresa | Data | Status       ||
|  | João Silva   | Acme    | 10/02| Agendada     ||
|  | Maria Costa  | Beta    | 08/02| Realizada    ||
|  +----------------------------------------------+|
+--------------------------------------------------+
```

---

## Componentes a Criar

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/components/feedback/FeedbackSessionsTab.tsx` | Novo | Container principal da aba |
| `src/components/feedback/FeedbackKPICards.tsx` | Novo | Cards com métricas de sessões |
| `src/components/feedback/FeedbackSessionsTable.tsx` | Novo | Tabela listando sessões |
| `src/components/feedback/FeedbackFilters.tsx` | Novo | Filtros por status/período |
| `src/pages/Relatorios.tsx` | Modificar | Adicionar sistema de abas |

---

## 1. Estrutura da Nova Aba

### FeedbackSessionsTab (Container)

Componente principal que agrupa:
- Filtros (status, período, empresa)
- KPI Cards (total, agendadas, realizadas, canceladas)
- Tabela de sessões

### FeedbackKPICards

4 cards exibindo:
| Métrica | Ícone | Cor |
|---------|-------|-----|
| Total de Sessões | Calendar | Primary |
| Agendadas | Clock | Amber |
| Realizadas | CheckCircle | Green |
| Canceladas | XCircle | Red |

### FeedbackSessionsTable

Colunas da tabela:
| Coluna | Descrição |
|--------|-----------|
| Participante | Nome + link para perfil |
| Empresa | Nome da empresa |
| Data/Hora | Data agendada formatada |
| Evento | Nome do evento Calendly |
| Status | Badge colorido |
| Ações | Ver detalhes |

### FeedbackFilters

Filtros disponíveis:
- **Status**: Todos, Agendadas, Realizadas, Canceladas
- **Período**: 7d, 30d, 90d, 1y, Todo período
- **Empresa**: Dropdown com empresas

---

## 2. Modificar Página de Relatórios

Transformar a página atual em um sistema de abas:

```tsx
<Tabs defaultValue="metrics">
  <TabsList>
    <TabsTrigger value="metrics">
      <BarChart3 /> Métricas
    </TabsTrigger>
    <TabsTrigger value="feedback">
      <Calendar /> Sessões de Feedback
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="metrics">
    {/* Conteúdo atual da página */}
  </TabsContent>
  
  <TabsContent value="feedback">
    <FeedbackSessionsTab />
  </TabsContent>
</Tabs>
```

---

## 3. Query de Dados

Buscar sessões com joins para participante e empresa:

```typescript
const { data } = await supabase
  .from("feedback_sessions")
  .select(`
    id,
    status,
    scheduled_at,
    event_name,
    created_at,
    participant:participants(id, name, email, company:companies(id, name))
  `)
  .order("scheduled_at", { ascending: false });
```

---

## 4. Status das Sessões

| Status | Label | Cor Badge |
|--------|-------|-----------|
| scheduled | Agendada | Amber |
| completed | Realizada | Green |
| cancelled | Cancelada | Red |
| no_show | Não compareceu | Gray |

---

## 5. Dados de Teste

Como a tabela `feedback_sessions` está vazia, criar dados de teste após implementar:

```sql
INSERT INTO feedback_sessions (participant_id, facilitator_id, status, scheduled_at, event_name)
SELECT 
  p.id,
  p.facilitator_id,
  (ARRAY['scheduled', 'completed', 'cancelled'])[floor(random() * 3 + 1)],
  now() + (random() * interval '30 days'),
  'Sessão de Feedback IQ+IS'
FROM participants p
WHERE p.status = 'completed'
LIMIT 10;
```

---

## Lista de Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/feedback/FeedbackSessionsTab.tsx` | Criar |
| `src/components/feedback/FeedbackKPICards.tsx` | Criar |
| `src/components/feedback/FeedbackSessionsTable.tsx` | Criar |
| `src/components/feedback/FeedbackFilters.tsx` | Criar |
| `src/pages/Relatorios.tsx` | Modificar |
| Dados de teste SQL | Criar |

---

## Seção Técnica

### Interface FeedbackSession

```typescript
interface FeedbackSession {
  id: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: string | null;
  event_name: string | null;
  created_at: string;
  participant: {
    id: string;
    name: string;
    email: string;
    company: {
      id: string;
      name: string;
    };
  };
}
```

### Lógica de Atualização de Status

Para marcar sessões passadas como "realizadas" automaticamente:

```typescript
// Sessões agendadas no passado podem ser marcadas como realizadas
const isPast = new Date(session.scheduled_at) < new Date();
if (session.status === 'scheduled' && isPast) {
  // Exibir botão "Marcar como Realizada"
}
```

### RLS Consideration

A tabela `feedback_sessions` já possui RLS configurado:
- Facilitadores podem ver sessões de seus participantes via `is_facilitator_of_participant()`

---

## Estimativa

| Etapa | Mensagens |
|-------|-----------|
| Criar componentes de feedback (4 arquivos) | 1 |
| Modificar Relatorios.tsx com abas | 1 |
| Inserir dados de teste | 1 |
| **Total** | 3 mensagens |
