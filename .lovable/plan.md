

# Fase 5 - Funcionalidades Avancadas

## Resumo Executivo
Implementar 4 funcionalidades avancadas para completar a plataforma IQ+IS: Envio de emails em massa, Relatorio de Equipe em PDF, Dashboard Analytics Avancado, e White-label com marca do facilitador.

---

## Ordem de Implementacao (por dependencias)

```text
1. Envio de Emails em Massa
   (reutiliza edge function send-invite existente)
           |
           v
2. White-label com Marca do Facilitador
   (aplica cores/logo nos emails e PDFs)
           |
           v
3. Relatorio de Equipe em PDF
   (reutiliza pdf-generator com estilos personalizados)
           |
           v
4. Dashboard Analytics Avancado
   (graficos e metricas de engajamento)
```

---

## 1. Envio de Emails em Massa

### O que sera feito
- Botao "Enviar para Todos" na pagina da empresa
- Dialog de confirmacao mostrando quantos participantes serao convidados
- Barra de progresso durante envio
- Resumo ao final (enviados, falhas, ja convidados)

### Componentes
- `BulkInviteDialog.tsx` - Modal com selecao e progresso
- Modificar `EmpresaDetalhes.tsx` - Adicionar botao e logica

### Logica de envio
```text
Para cada participante com status "pending":
  1. Chamar edge function send-invite
  2. Atualizar status para "invited"
  3. Incrementar contador de progresso
  4. Tratar erros individualmente

Exibir resumo:
- X emails enviados com sucesso
- Y falhas (com lista de emails)
- Z ja haviam sido convidados
```

### Codigo principal
```typescript
// EmpresaDetalhes.tsx
const handleBulkInvite = async () => {
  const pendingParticipants = participants.filter(p => p.status === "pending");
  let sent = 0, failed = 0;
  
  for (const participant of pendingParticipants) {
    try {
      await supabase.functions.invoke("send-invite", {
        body: { ... }
      });
      await supabase.from("participants").update({
        status: "invited",
        invited_at: new Date().toISOString()
      }).eq("id", participant.id);
      sent++;
    } catch (error) {
      failed++;
    }
    setProgress((sent + failed) / pendingParticipants.length * 100);
  }
};
```

---

## 2. White-label com Marca do Facilitador

### O que sera feito
- Aplicar logo e cores do facilitador na pagina do diagnostico
- Personalizar template de email com cores do facilitador
- Aplicar marca no cabecalho do PDF gerado
- Email mostra "Enviado por [Nome do Facilitador]"

### Fluxo de dados
```text
Participante acessa diagnostico
        |
        v
Buscar facilitator_id do participante
        |
        v
Buscar profile do facilitador (logo, cores)
        |
        v
Aplicar estilos dinamicos via CSS variables
```

### Modificacoes

1. **Diagnostico.tsx**
   - Buscar dados do facilitador ao carregar
   - Passar logo/cores para componentes filhos
   - Aplicar CSS variables dinamicas

2. **Edge function send-invite**
   - Receber facilitatorId como parametro
   - Buscar profile do facilitador no banco
   - Usar cores/logo no template HTML

3. **pdf-generator.ts**
   - Aceitar opcoes de branding
   - Renderizar logo do facilitador no cabecalho
   - Usar cores primarias nos titulos

### CSS Variables dinamicas
```typescript
// Diagnostico.tsx
useEffect(() => {
  if (facilitatorProfile) {
    document.documentElement.style.setProperty(
      '--brand-primary', 
      facilitatorProfile.primary_color
    );
    document.documentElement.style.setProperty(
      '--brand-secondary', 
      facilitatorProfile.secondary_color
    );
  }
}, [facilitatorProfile]);
```

### Template de email personalizado
```html
<td style="background: linear-gradient(135deg, 
  ${primaryColor} 0%, ${darken(primaryColor)} 100%);">
  ${logoUrl ? `<img src="${logoUrl}" height="50" />` : ''}
  <h1>Diagnostico IQ+IS</h1>
</td>
...
<p>Facilitador: ${facilitatorName}</p>
```

---

## 3. Relatorio de Equipe em PDF

### O que sera feito
- Botao "Baixar Relatorio da Equipe" na aba Resultados
- PDF consolidado com:
  - Capa com nome da empresa e facilitador
  - Resumo executivo (total participantes, media geral)
  - Grafico radar agregado da equipe
  - Top 3 pontos fortes e fracos coletivos
  - Lista de participantes com scores individuais
  - Recomendacoes para gestores

### Estrutura do PDF
```text
+--------------------------------------------------+
|  [Logo Facilitador]     RELATORIO DE EQUIPE      |
|                         Empresa XYZ               |
|                         Data: 30/01/2026          |
+--------------------------------------------------+

--- RESUMO EXECUTIVO ---
- Total de participantes: 15
- Diagnosticos completos: 12 (80%)
- Media geral da equipe: 3.8/5

--- PERFIL COLETIVO ---
[Grafico Radar com medias da equipe]

--- PONTOS FORTES DA EQUIPE ---
1. Coerencia Emocional (4.2)
2. Relacoes e Compaixao (4.0)
3. Conexao e Proposito (3.9)

--- AREAS DE DESENVOLVIMENTO ---
1. Transformacao (3.1)
2. Consciencia Interior (3.3)

--- DISTRIBUICAO POR DIMENSAO ---
[Tabela com min, max, media por dimensao]

--- PARTICIPANTES ---
| Nome           | Score | Status      |
|----------------|-------|-------------|
| Maria Silva    | 4.2   | Concluido   |
| Joao Santos    | 3.8   | Concluido   |
| Ana Costa      | 3.5   | Concluido   |

--- RECOMENDACOES PARA GESTORES ---
> Desenvolver Transformacao na equipe
  - Realizar workshops de gestao de mudanca...
  - Implementar projetos de melhoria continua...

+--------------------------------------------------+
|  Gerado por [Nome Facilitador] via IQ+IS         |
+--------------------------------------------------+
```

### Novo arquivo
`src/lib/team-pdf-generator.ts`
- Funcao `generateTeamPDF()`
- Aceita: empresa, participantes, resultados, facilitador
- Renderiza graficos como canvas
- Multiplas paginas automaticas

### Modificacao
`src/components/participants/TeamStats.tsx`
- Adicionar botao "Baixar Relatorio"
- Passar dados necessarios para geracao

---

## 4. Dashboard Analytics Avancado

### O que sera feito
- Nova pagina `/relatorios` ou secao no Dashboard
- Graficos de:
  - Participantes por status (pizza)
  - Evolucao mensal de conclusoes (linha)
  - Comparativo entre empresas (barras)
  - Media por dimensao (radar overlay)
- Metricas:
  - Taxa de conclusao
  - Tempo medio de resposta
  - Empresas mais ativas

### Nova pagina
`src/pages/Relatorios.tsx`
- Cards com KPIs principais
- Graficos usando Recharts
- Filtros por periodo e empresa

### Layout
```text
+-- Dashboard Analytics -------------------------------+
|                                                      |
|  +-- KPIs ----------------------------------------+  |
|  | Participantes | Concluidos | Taxa    | Tempo   |  |
|  | 156          | 98         | 62.8%   | 18min   |  |
|  +------------------------------------------------+  |
|                                                      |
|  +-- Evolucao Mensal ----+  +-- Por Status -------+  |
|  | [Line Chart]          |  | [Pie Chart]        |  |
|  |                       |  |                    |  |
|  +-----------------------+  +--------------------+  |
|                                                      |
|  +-- Comparativo por Empresa ----------------------+  |
|  | [Bar Chart - media por empresa]                 |  |
|  +-------------------------------------------------+  |
|                                                      |
|  +-- Perfil Medio Global --------------------------+  |
|  | [Radar Chart - todas as empresas]               |  |
|  +-------------------------------------------------+  |
+------------------------------------------------------+
```

### Queries necessarias
```typescript
// Participantes por mes
const { data } = await supabase
  .from("participants")
  .select("created_at, status, completed_at")
  .order("created_at");

// Agrupar por mes/status no frontend
const monthlyData = groupByMonth(data);

// Media por empresa
const { data: results } = await supabase
  .from("diagnostic_results")
  .select("participant_id, total_score, participants!inner(company_id, companies!inner(name))");
```

### Componentes
- `src/pages/Relatorios.tsx` - Pagina principal
- `src/components/analytics/KPICards.tsx` - Cards de metricas
- `src/components/analytics/MonthlyChart.tsx` - Grafico de evolucao
- `src/components/analytics/StatusPieChart.tsx` - Pizza de status
- `src/components/analytics/CompanyComparisonChart.tsx` - Barras comparativas

---

## Arquivos a serem criados

| Arquivo | Descricao |
|---------|-----------|
| `src/components/participants/BulkInviteDialog.tsx` | Modal de envio em massa |
| `src/lib/team-pdf-generator.ts` | Geracao de PDF da equipe |
| `src/pages/Relatorios.tsx` | Pagina de analytics |
| `src/components/analytics/KPICards.tsx` | Cards de KPI |
| `src/components/analytics/MonthlyChart.tsx` | Grafico mensal |
| `src/components/analytics/StatusPieChart.tsx` | Grafico pizza |
| `src/components/analytics/CompanyComparisonChart.tsx` | Comparativo empresas |

## Arquivos a serem modificados

| Arquivo | Modificacao |
|---------|-------------|
| `src/pages/EmpresaDetalhes.tsx` | Adicionar botao envio em massa |
| `src/pages/Diagnostico.tsx` | Carregar branding do facilitador |
| `src/hooks/useDiagnostic.ts` | Retornar dados do facilitador |
| `supabase/functions/send-invite/index.ts` | Buscar e aplicar branding |
| `src/lib/pdf-generator.ts` | Aceitar opcoes de branding |
| `src/components/participants/TeamStats.tsx` | Botao PDF da equipe |
| `src/components/layout/Sidebar.tsx` | Link para Relatorios |
| `src/App.tsx` | Rota /relatorios |

---

## Cronograma Sugerido

| Fase | Funcionalidade | Complexidade |
|------|----------------|--------------|
| 5.1 | Envio de emails em massa | Media |
| 5.2 | White-label (diagnostico + email) | Media |
| 5.3 | Relatorio de equipe PDF | Alta |
| 5.4 | Dashboard Analytics | Alta |

---

## Proximos Passos

Recomendo comecar pelo **Envio de Emails em Massa** pois:
1. Reutiliza infraestrutura existente (send-invite)
2. Tem alto impacto para o facilitador
3. Serve de base para testar o white-label

Apos aprovar, implementarei o componente `BulkInviteDialog` e a logica de envio sequencial com progresso visual.

