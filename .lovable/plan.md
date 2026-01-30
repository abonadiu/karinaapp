
# Plano: Portal da Empresa (Visao RH/Gestor)

## Resumo
Implementar um portal dedicado para gestores de RH e lideres de empresas, permitindo que eles acessem dados agregados de sua equipe, acompanhem o progresso dos diagnosticos e visualizem relatorios consolidados - sem acesso a dados individuais dos participantes.

---

## Arquitetura de Roles

### Sistema de Permissoes
O sistema tera tres tipos de usuarios autenticados:

| Role | Descricao | Acesso |
|------|-----------|--------|
| `facilitator` | Consultor que aplica diagnosticos | Acesso completo a empresas e participantes |
| `company_manager` | RH/Gestor de uma empresa | Dados agregados de sua empresa apenas |
| `participant` | Colaborador (acesso via token) | Seu proprio diagnostico |

### Tabela de Roles (Nova)
```sql
CREATE TYPE public.app_role AS ENUM ('facilitator', 'company_manager');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
```

### Tabela de Associacao Gestor-Empresa (Nova)
```sql
CREATE TABLE public.company_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL, -- facilitator_id
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, company_id)
);
```

---

## Fluxo de Convite do Gestor

```text
Facilitador acessa detalhes da empresa
         |
         v
Clica em "Adicionar Gestor"
         |
         v
Preenche nome e email do gestor
         |
         v
Sistema cria registro em company_managers (pendente)
         |
         v
Edge function envia email com link de cadastro
         |
         v
Gestor clica no link e cria conta
         |
         v
Trigger associa role "company_manager" ao usuario
         |
         v
Gestor e redirecionado para portal da empresa
```

---

## Componentes do Portal da Empresa

### Dashboard do Gestor
O gestor vera:

1. **Resumo de Participacao**
   - Total de colaboradores cadastrados
   - Quantos concluiram / em andamento / pendentes
   - Taxa de conclusao percentual

2. **Grafico Radar Agregado**
   - Medias por dimensao de toda a equipe
   - Sem identificacao individual

3. **Pontos Fortes e Desenvolvimento**
   - Top 2 dimensoes com maior score
   - Top 2 dimensoes com menor score

4. **Timeline de Atividade**
   - Ultimas conclusoes (sem nomes, apenas "1 colaborador concluiu em...")

5. **Download do Relatorio de Equipe**
   - PDF consolidado (reutilizando team-pdf-generator.ts)

---

## Rotas e Navegacao

### Novas Rotas
| Rota | Componente | Acesso |
|------|------------|--------|
| `/empresa/login` | LoginEmpresa.tsx | Publico |
| `/empresa/cadastro/:token` | CadastroGestor.tsx | Publico (com token) |
| `/empresa/dashboard` | PortalEmpresa.tsx | company_manager |

### Layout Especifico
- Sidebar simplificada (sem menu de empresas/participantes)
- Header com logo da empresa (se disponivel)
- Navegacao entre Dashboard e Relatorios

---

## Politicas RLS

### Regras de Acesso para Gestores

```sql
-- Gestores podem ver sua empresa associada
CREATE POLICY "Managers can view their company"
ON public.companies FOR SELECT
USING (
  id IN (
    SELECT company_id FROM public.company_managers
    WHERE user_id = auth.uid()
  )
);

-- Gestores podem ver contagem de participantes (sem dados pessoais)
-- Implementado via view ou funcao security definer
```

### Funcao Security Definer para Verificar Role
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Funcao para Buscar Empresa do Gestor
```sql
CREATE OR REPLACE FUNCTION public.get_manager_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.company_managers
  WHERE user_id = _user_id
  LIMIT 1
$$;
```

---

## Arquivos a Criar

### Banco de Dados (Migracao)
| Arquivo | Descricao |
|---------|-----------|
| Nova migracao SQL | Enum app_role, tabelas user_roles e company_managers, funcoes e policies |

### Contexto de Autenticacao
| Arquivo | Modificacao |
|---------|-------------|
| `src/contexts/AuthContext.tsx` | Adicionar deteccao de role e redirecionamento |

### Paginas Novas
| Arquivo | Descricao |
|---------|-----------|
| `src/pages/empresa/LoginEmpresa.tsx` | Pagina de login para gestores |
| `src/pages/empresa/CadastroGestor.tsx` | Cadastro via token de convite |
| `src/pages/empresa/PortalEmpresa.tsx` | Dashboard principal do gestor |

### Componentes Novos
| Arquivo | Descricao |
|---------|-----------|
| `src/components/empresa/PortalLayout.tsx` | Layout do portal com sidebar simplificada |
| `src/components/empresa/PortalSidebar.tsx` | Sidebar especifica do gestor |
| `src/components/empresa/TeamProgressCard.tsx` | Card de progresso da equipe |
| `src/components/empresa/AggregateRadarChart.tsx` | Radar com medias agregadas |

### Edge Functions
| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/invite-manager/index.ts` | Enviar convite por email para gestor |

### Arquivos a Modificar
| Arquivo | Modificacao |
|---------|-------------|
| `src/App.tsx` | Adicionar novas rotas do portal empresa |
| `src/pages/EmpresaDetalhes.tsx` | Adicionar botao "Convidar Gestor" |

---

## Fluxo de Dados Agregados

### Visualizacao do Gestor
O gestor NAO tera acesso a:
- Nomes individuais dos participantes
- Scores individuais
- Respostas dos exercicios

O gestor TERA acesso a:
- Contagens agregadas (X de Y concluiram)
- Medias por dimensao da equipe
- Pontos fortes/fracos coletivos
- Relatorio PDF de equipe

### Query Segura para Dados Agregados
```sql
-- Funcao que retorna apenas dados agregados para o gestor
CREATE OR REPLACE FUNCTION public.get_company_aggregate_stats(p_company_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se usuario tem acesso a empresa
  IF NOT EXISTS (
    SELECT 1 FROM company_managers
    WHERE company_id = p_company_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_build_object(
    'total_participants', COUNT(*),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'pending', COUNT(*) FILTER (WHERE status IN ('pending', 'invited'))
  ) INTO result
  FROM participants
  WHERE company_id = p_company_id;

  RETURN result;
END;
$$;
```

---

## Interface do Gestor

### Dashboard Principal
```text
+------------------------------------------------------------------+
| [Logo Empresa]              Portal da Empresa              [Sair] |
+------------------------------------------------------------------+
|                                                                   |
|  Bem-vindo ao Portal da [Nome Empresa]                           |
|                                                                   |
|  +----------------+  +----------------+  +----------------+       |
|  | Total          |  | Concluidos     |  | Taxa           |       |
|  | 25             |  | 18 (72%)       |  | 72%            |       |
|  | Colaboradores  |  |                |  | Conclusao      |       |
|  +----------------+  +----------------+  +----------------+       |
|                                                                   |
|  +---------------------------+  +---------------------------+     |
|  | Perfil da Equipe         |  | Destaques                 |     |
|  | [RADAR CHART AGREGADO]   |  | Forte: Coerencia (4.2)    |     |
|  |                          |  | Desenvolver: Conexao (3.1) |     |
|  +---------------------------+  +---------------------------+     |
|                                                                   |
|  +----------------------------------------------------------+    |
|  | [Baixar Relatorio da Equipe]                             |    |
|  +----------------------------------------------------------+    |
+------------------------------------------------------------------+
```

---

## Sequencia de Implementacao

### Etapa 1: Banco de Dados
1. Criar enum `app_role`
2. Criar tabela `user_roles`
3. Criar tabela `company_managers`
4. Criar funcoes security definer
5. Atualizar RLS policies

### Etapa 2: Autenticacao
1. Atualizar AuthContext para detectar role
2. Criar ProtectedRoute com verificacao de role
3. Implementar redirecionamento baseado em role

### Etapa 3: Convite de Gestor
1. Criar UI de convite em EmpresaDetalhes
2. Criar edge function de convite
3. Criar pagina de cadastro com token

### Etapa 4: Portal do Gestor
1. Criar layout especifico
2. Criar dashboard com dados agregados
3. Integrar geracao de PDF de equipe

---

## Consideracoes de Seguranca

1. **Isolamento de Dados**: Gestores nunca veem dados individuais
2. **Funcoes Security Definer**: Todas as queries de dados agregados passam por funcoes que verificam permissao
3. **Tokens de Convite**: Unicos e vinculados a empresa especifica
4. **Audit Trail**: Registrar quando gestor acessa dados

---

## Secao Tecnica

### Dependencias Existentes
- Ja possui Supabase Auth configurado
- Ja possui sistema de profiles
- Ja possui team-pdf-generator.ts

### Componentes Reutilizaveis
- ResultsRadarChart (para dados agregados)
- TeamStats (adaptar para portal)
- generateTeamPDF (reutilizar integralmente)

### Novas Funcoes do Supabase
```typescript
// Tipos para o portal
interface CompanyAggregateStats {
  total_participants: number;
  completed: number;
  in_progress: number;
  pending: number;
}

interface CompanyDimensionAverages {
  dimension: string;
  average: number;
}
```

### Estimativa de Esforco
- Migracao DB: 1 mensagem
- Contexto Auth + Routes: 1 mensagem
- Paginas do Portal: 1-2 mensagens
- Edge Function Convite: 1 mensagem
- **Total**: ~4-5 mensagens
