
## Tornar Cards de KPI Clicaveis no Portal da Empresa

### Problema Atual

Os cards de estatisticas (Total de Colaboradores, Concluidos, Em Andamento, Pendentes) no Portal da Empresa sao apenas visuais. O usuario espera poder clicar neles para ver mais detalhes ou filtrar a lista de colaboradores.

---

### Solucao Proposta

Adicionar interatividade aos cards de KPI para que, ao clicar, filtrem uma lista de colaboradores (anonimizados) ou exibam um modal/secao com mais detalhes.

Como o Portal da Empresa foi desenhado para manter a **privacidade dos participantes** (gestores so veem dados agregados), a solucao mantera esse principio exibindo apenas informacoes anonimizadas.

---

### Implementacao

#### 1. Tornar `TeamProgressCard` Clicavel

**Arquivo**: `src/components/empresa/TeamProgressCard.tsx`

Adicionar prop `onClick` opcional ao componente:

```typescript
interface TeamProgressCardProps {
  // ... props existentes
  onClick?: () => void;
  clickable?: boolean;
}
```

Quando `onClick` estiver presente, o card tera:
- Cursor pointer
- Efeito hover mais pronunciado
- Seta ou indicador visual de que e clicavel

---

#### 2. Criar Secao de Lista Filtrada no Dashboard

**Arquivo**: `src/pages/empresa/PortalEmpresa.tsx`

Adicionar estado para controlar o filtro selecionado:

```typescript
const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
```

Ao clicar em um card, atualizar o filtro:

| Card Clicado | Filtro Aplicado |
|--------------|-----------------|
| Total de Colaboradores | `null` (mostra todos) |
| Concluidos | `"completed"` |
| Em Andamento | `"in_progress"` |
| Pendentes | `"pending"` |

---

#### 3. Exibir Lista Anonimizada de Colaboradores

Criar uma nova secao no dashboard que aparece quando um filtro esta ativo:

```text
+---------------------------------------------+
| Colaboradores: Concluidos (6)          [X]  |
+---------------------------------------------+
| Colaborador 1  | Concluido | 15/01/2024     |
| Colaborador 2  | Concluido | 14/01/2024     |
| ...                                         |
+---------------------------------------------+
```

**Dados exibidos** (sem identificacao pessoal):
- Numero sequencial ("Colaborador 1", "Colaborador 2")
- Status
- Data de conclusao (se aplicavel)
- Departamento (se disponivel, mas sem nome)

---

#### 4. Criar RPC para Buscar Lista Anonimizada

**Banco de Dados**: Nova funcao SQL

```sql
CREATE OR REPLACE FUNCTION get_company_participants_anonymized(
  p_company_id uuid,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  row_number bigint,
  status text,
  department text,
  completed_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    row_number() OVER (ORDER BY p.created_at) as row_number,
    p.status::text,
    p.department,
    p.completed_at
  FROM participants p
  WHERE p.company_id = p_company_id
    AND (p_status IS NULL OR p.status = p_status)
  ORDER BY p.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Arquivos a Criar/Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/empresa/TeamProgressCard.tsx` | Adicionar props `onClick` e `clickable` |
| `src/pages/empresa/PortalEmpresa.tsx` | Estado de filtro + renderizar lista filtrada |
| `src/components/empresa/ParticipantStatusList.tsx` | Novo componente para lista anonimizada |
| Migracao SQL | Criar funcao `get_company_participants_anonymized` |

---

### Fluxo de Uso

```text
Gestor acessa Portal da Empresa
         |
         v
Ve cards de KPI (agora clicaveis)
         |
    Clica em "Concluidos (6)"
         |
         v
Secao aparece abaixo dos cards:
"Mostrando 6 colaboradores com status: Concluidos"
         |
         v
Lista anonimizada:
- Colaborador 1 | Comercial | 15/01/2024
- Colaborador 2 | TI | 14/01/2024
- ...
         |
    Clica no [X] ou em outro card
         |
         v
Lista e ocultada ou filtro muda
```

---

### Consideracoes de Privacidade

A implementacao mantem o principio de privacidade do Portal da Empresa:

- Nenhum nome ou email de participante e exibido
- Apenas dados agregados e anonimizados
- Departamento pode ser exibido (opcional) por ser informacao estrutural, nao pessoal
- Data de conclusao ajuda a ver cronologia sem identificar pessoas

---

### Resultado Esperado

1. Cards de KPI tem cursor pointer e efeito hover
2. Ao clicar, uma secao de lista aparece filtrada pelo status
3. A lista mostra dados anonimizados (Colaborador 1, 2, etc.)
4. Clicar em outro card muda o filtro
5. Clicar no mesmo card ou no X fecha a lista
