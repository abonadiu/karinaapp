
# Plano: Filtros de Periodo e Empresa para Analytics

## Resumo
Adicionar filtros interativos na pagina de Relatorios para permitir ao facilitador refinar os dados por periodo de tempo (7, 30, 90 dias, 1 ano ou todos) e por empresa especifica.

---

## O Que Sera Implementado

### 1. Barra de Filtros
Uma seção no topo da pagina com dois controles:
- **Filtro de Periodo**: Select com opcoes pre-definidas (7 dias, 30 dias, 90 dias, 1 ano, Todos)
- **Filtro de Empresa**: Select com lista de todas as empresas do facilitador + opcao "Todas as Empresas"

### 2. Logica de Filtragem
Os filtros serao aplicados no frontend apos carregar os dados:

```text
Participantes filtrados = participantes.filter(p => {
  // Filtro de periodo: created_at >= dataLimite
  // Filtro de empresa: company_id === empresaSelecionada
})
```

### 3. Atualizacao Dinamica
Todos os graficos e KPIs serao recalculados automaticamente quando os filtros mudarem, utilizando `useMemo` para performance.

---

## Componente de Filtros

Novo componente `AnalyticsFilters.tsx`:

```text
+------------------------------------------------------------------+
|  Periodo: [ Ultimos 30 dias  v ]    Empresa: [ Todas as Empresas v ] |
+------------------------------------------------------------------+
```

### Props
- companies: Company[]
- selectedPeriod: string
- selectedCompany: string | "all"
- onPeriodChange: (period: string) => void
- onCompanyChange: (companyId: string) => void

---

## Modificacoes em Relatorios.tsx

### 1. Novos Estados
```typescript
const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
const [selectedCompany, setSelectedCompany] = useState<string>("all");
```

### 2. Funcao de Filtragem
```typescript
const filteredParticipants = useMemo(() => {
  let filtered = participants;
  
  // Filtro de periodo
  if (selectedPeriod !== "all") {
    const daysMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
    const cutoffDate = subDays(new Date(), daysMap[selectedPeriod]);
    filtered = filtered.filter(p => parseISO(p.created_at) >= cutoffDate);
  }
  
  // Filtro de empresa
  if (selectedCompany !== "all") {
    filtered = filtered.filter(p => p.company_id === selectedCompany);
  }
  
  return filtered;
}, [participants, selectedPeriod, selectedCompany]);
```

### 3. Recalculo de Metricas
Todos os calculos (KPIs, monthlyData, statusData, companyData, dimensionData) usarao `filteredParticipants` em vez de `participants`.

---

## Opcoes de Periodo

| Valor | Label |
|-------|-------|
| `7d` | Ultimos 7 dias |
| `30d` | Ultimos 30 dias |
| `90d` | Ultimos 90 dias |
| `1y` | Ultimo ano |
| `all` | Todo o periodo |

---

## Arquivos

### Criar
| Arquivo | Descricao |
|---------|-----------|
| `src/components/analytics/AnalyticsFilters.tsx` | Componente com selects de filtro |

### Modificar
| Arquivo | Modificacao |
|---------|-------------|
| `src/pages/Relatorios.tsx` | Adicionar estados, logica de filtragem e componente de filtros |

---

## Fluxo de Dados

```text
Usuario seleciona filtro
         |
         v
Estado atualiza (selectedPeriod / selectedCompany)
         |
         v
useMemo recalcula filteredParticipants
         |
         v
Todos os calculos de metricas usam dados filtrados
         |
         v
Componentes re-renderizam com novos dados
```

---

## Secao Tecnica

### Dependencias
- `date-fns/subDays` para calculo de datas limite

### Performance
- Uso de `useMemo` para evitar recalculos desnecessarios
- Filtragem no frontend (dados ja carregados)
- Recalculo apenas quando filtros ou dados mudam

### UI Components Utilizados
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` do shadcn/ui
- `Card` para container dos filtros
