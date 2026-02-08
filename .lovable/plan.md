# Plano: Melhorias na Página de Relatórios

## Resumo

Aprimorar a aba "Métricas" com comparativos detalhados por empresa, evolução temporal de performance e exportação de relatórios em PDF.

---

## Arquitetura da Solução

```text
+----------------------------------------------------------+
|                    Página de Relatórios                   |
+----------------------------------------------------------+
| [Métricas] [Sessões de Feedback]                          |
+----------------------------------------------------------+
|                                                          |
|  Filtros: [Período ▼] [Empresa ▼] [📄 Exportar PDF]      |
|                                                          |
|  +------------------------------------------------------+|
|  | KPIs: Total | Concluídos | Taxa | Tempo Médio        ||
|  +------------------------------------------------------+|
|                                                          |
|  +------------------------+  +-------------------------+ |
|  | Evolução Mensal        |  | Distribuição Status     | |
|  | (Gráfico de linha)     |  | (Gráfico de pizza)      | |
|  +------------------------+  +-------------------------+ |
|                                                          |
|  +------------------------+  +-------------------------+ |
|  | Comparativo Empresas   |  | Radar Global            | |
|  | (Gráfico de barras)    |  | (Média das dimensões)   | |
|  +------------------------+  +-------------------------+ |
|                                                          |
|  +------------------------------------------------------+|
|  | NOVO: Tabela Detalhada por Empresa                   ||
|  | Empresa | Participantes | Concluídos | Média | Taxa  ||
|  +------------------------------------------------------+|
|                                                          |
|  +------------------------------------------------------+|
|  | NOVO: Evolução Temporal de Scores                    ||
|  | (Gráfico de linha com média de scores por mês)       ||
|  +------------------------------------------------------+|
+----------------------------------------------------------+
```

---

## Componentes a Criar/Modificar

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/components/analytics/CompanyDetailsTable.tsx` | Novo | Tabela detalhada com métricas por empresa |
| `src/components/analytics/ScoreEvolutionChart.tsx` | Novo | Gráfico de evolução temporal de scores |
| `src/components/analytics/ExportPDFButton.tsx` | Novo | Botão de exportação do relatório em PDF |
| `src/pages/Relatorios.tsx` | Modificar | Adicionar novos componentes e botão de export |

---

## 1. Tabela Detalhada por Empresa

### CompanyDetailsTable

Tabela com métricas completas por empresa:

| Coluna | Descrição |
|--------|-----------|
| Empresa | Nome da empresa |
| Total | Total de participantes |
| Concluídos | Participantes que finalizaram |
| Em Andamento | Participantes ativos |
| Pendentes | Ainda não iniciaram |
| Média Score | Média de pontuação (0-5) |
| Taxa Conclusão | Percentual de conclusão |

Features:
- Ordenação por qualquer coluna
- Destaque para empresas com baixa taxa de conclusão

---

## 2. Evolução Temporal de Scores

### ScoreEvolutionChart

Gráfico de linha mostrando:
- Eixo X: Meses
- Eixo Y: Média de scores (0-5)
- Linha: Evolução da média geral ao longo do tempo

Permite identificar:
- Tendências de melhoria/piora
- Sazonalidade no engajamento
- Impacto de ações específicas

---

## 3. Exportação PDF

### ExportPDFButton

Botão que gera um PDF contendo:
1. Cabeçalho com logo do facilitador e data
2. KPIs principais
3. Gráfico de evolução mensal
4. Tabela resumo por empresa
5. Radar chart global

Usar jsPDF + html2canvas (já instalados no projeto).

---

## 4. Query de Dados

Dados já disponíveis via queries existentes. Apenas reorganizar para novos componentes:

```typescript
// Dados por empresa detalhados
const companyDetails = companies.map(company => {
  const companyParticipants = filteredParticipants.filter(
    p => p.company_id === company.id
  );
  const completed = companyParticipants.filter(p => p.status === 'completed');
  const companyResults = filteredResults.filter(r => 
    completed.some(p => p.id === r.participant_id)
  );
  
  return {
    id: company.id,
    name: company.name,
    total: companyParticipants.length,
    completed: completed.length,
    inProgress: companyParticipants.filter(p => p.status === 'in_progress').length,
    pending: companyParticipants.filter(p => p.status === 'pending').length,
    averageScore: companyResults.length > 0 
      ? companyResults.reduce((sum, r) => sum + r.total_score, 0) / companyResults.length 
      : null,
    completionRate: companyParticipants.length > 0 
      ? (completed.length / companyParticipants.length) * 100 
      : 0
  };
});
```

---

## 5. Evolução de Scores por Mês

```typescript
// Agrupar scores por mês de conclusão
const scoreEvolution = useMemo(() => {
  const monthMap = new Map<string, number[]>();
  
  filteredResults.forEach(result => {
    const participant = participants.find(p => p.id === result.participant_id);
    if (participant?.completed_at) {
      const month = format(parseISO(participant.completed_at), "MMM/yy", { locale: ptBR });
      if (!monthMap.has(month)) monthMap.set(month, []);
      monthMap.get(month)!.push(Number(result.total_score));
    }
  });
  
  return Array.from(monthMap.entries())
    .map(([month, scores]) => ({
      month,
      average: scores.reduce((a, b) => a + b, 0) / scores.length
    }))
    .sort((a, b) => /* ordenar por data */);
}, [filteredResults, participants]);
```

---

## Lista de Tarefas

| # | Tarefa | Estimativa |
|---|--------|------------|
| 1 | Criar CompanyDetailsTable | 1 msg |
| 2 | Criar ScoreEvolutionChart | 1 msg |
| 3 | Criar ExportPDFButton | 1 msg |
| 4 | Integrar tudo em Relatorios.tsx | 1 msg |
| **Total** | | **4 mensagens** |

---

## Próximos Passos

Após aprovar, implementarei na seguinte ordem:
1. CompanyDetailsTable (tabela detalhada)
2. ScoreEvolutionChart (evolução temporal)
3. ExportPDFButton (exportação PDF)
4. Integração final + testes
