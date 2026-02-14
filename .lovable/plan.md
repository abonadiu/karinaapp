
## Tornar Elementos Clicaveis na Pagina de Relatorios

### O Que Sera Clicavel

| Elemento | Acao ao Clicar |
|----------|----------------|
| Card "Total de Participantes" | Navega para `/participantes` |
| Card "Diagnosticos Concluidos" | Navega para `/participantes` com filtro `completed` |
| Card "Taxa de Conclusao" | Navega para `/participantes` com filtro `in_progress` (foco nos que faltam) |
| Card "Tempo Medio (dias)" | Navega para `/participantes` com filtro `completed` |
| Linha da tabela "Detalhamento por Empresa" | Navega para `/empresas/{id}` (detalhes da empresa) |

---

### Implementacao

#### 1. KPICards com onClick

**Arquivo**: `src/components/analytics/KPICards.tsx`

Adicionar uma prop `onCardClick` opcional ao componente. Cada card recebera um identificador e, ao clicar, dispara a navegacao.

```typescript
interface KPICardsProps {
  // ... props existentes
  onCardClick?: (cardId: string) => void;
}
```

Cada card tera:
- Cursor pointer
- Efeito hover (scale + shadow)
- Indicador visual sutil de que e clicavel

---

#### 2. Relatorios.tsx - Navegacao nos Cards

**Arquivo**: `src/pages/Relatorios.tsx`

Usar `useNavigate` do React Router. Ao clicar em um card KPI, navegar para `/participantes` passando o filtro de status como query parameter ou state:

```typescript
const navigate = useNavigate();

const handleKPIClick = (cardId: string) => {
  switch (cardId) {
    case "total":
      navigate("/participantes");
      break;
    case "completed":
      navigate("/participantes", { state: { statusFilter: "completed" } });
      break;
    case "completion_rate":
      navigate("/participantes", { state: { statusFilter: "in_progress" } });
      break;
    case "avg_days":
      navigate("/participantes", { state: { statusFilter: "completed" } });
      break;
  }
};
```

---

#### 3. CompanyDetailsTable - Linhas Clicaveis

**Arquivo**: `src/components/analytics/CompanyDetailsTable.tsx`

Adicionar prop `onCompanyClick` e tornar cada linha da tabela clicavel, navegando para `/empresas/{id}`:

- Cursor pointer nas linhas
- Hover com destaque de fundo
- Ao clicar, navega para detalhes da empresa

---

#### 4. Participantes.tsx - Receber Filtro via State

**Arquivo**: `src/pages/Participantes.tsx`

Usar `useLocation` para ler o state de navegacao e aplicar o filtro automaticamente:

```typescript
const location = useLocation();
useEffect(() => {
  if (location.state?.statusFilter) {
    setStatusFilter(location.state.statusFilter);
  }
}, [location.state]);
```

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/analytics/KPICards.tsx` | Adicionar `onCardClick`, estilos hover/pointer |
| `src/pages/Relatorios.tsx` | Adicionar `useNavigate` e handler de clique nos KPIs |
| `src/components/analytics/CompanyDetailsTable.tsx` | Linhas clicaveis com `onCompanyClick` |
| `src/pages/Participantes.tsx` | Receber filtro via `location.state` |

---

### Resultado Esperado

1. Cards de KPI mostram cursor pointer e efeito hover
2. Clicar em um card navega para a pagina de Participantes com o filtro adequado
3. Linhas da tabela de empresas sao clicaveis e levam aos detalhes da empresa
4. Transicoes suaves e feedback visual em todos os elementos clicaveis
