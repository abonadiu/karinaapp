

## Reformular o Portal do Participante para exibir todos os testes

### Contexto atual

O portal (`PortalParticipante.tsx`) usa uma RPC (`get_participant_portal_data`) que retorna apenas UM resultado do diagnostico (da tabela antiga `diagnostic_results`). A plataforma ja usa a arquitetura multi-teste com as tabelas `participant_tests`, `test_types` e `test_results`, mas o portal ignora completamente esses dados.

### O que mudar

Redesenhar o portal para mostrar **todos os testes atribuidos** ao participante, com informacoes didaticas e completas sobre cada um.

---

### 1. Criar nova RPC no banco: `get_participant_portal_full_data`

Nova funcao que retorna:
- Dados do participante (nome, email, empresa)
- Dados do facilitador (nome, logo, calendly)
- **Lista de todos os testes** do participante (via `participant_tests` + `test_types` + `test_results`), incluindo:
  - Tipo do teste (nome, slug, icone)
  - Status (pending, in_progress, completed)
  - Datas (criado em, iniciado em, concluido em)
  - Resultado (total_score, dimension_scores) quando concluido

Manter a RPC antiga funcionando para nao quebrar nada.

Criar tambem uma versao `_by_id` para impersonacao.

### 2. Redesenhar `PortalParticipante.tsx`

**Header melhorado:**
- Nome do participante, empresa, e facilitador responsavel
- Avatar/logo do facilitador

**Secao "Meus Testes":**
- Cards com visual claro para cada teste atribuido
- Cada card mostra:
  - Icone e nome do teste (ex: "Diagnostico IQ+IS", "Perfil DISC")
  - Status com badge colorido
  - Data de atribuicao ("Atribuido em 15/01/2026")
  - Data de conclusao ("Concluido em 20/01/2026") se aplicavel
  - Nome do facilitador responsavel
  - Score geral (quando concluido)
- Card clicavel: ao expandir, mostra os resultados completos (radar chart, dimensoes, etc.)

**Para testes concluidos (expandido):**
- Score geral em destaque
- Radar chart com dimensoes
- Pontos fortes e areas de desenvolvimento
- Detalhamento por dimensao (usando `DimensionCard` para IQ+IS, ou `DiscResults`-style para DISC)
- Botao de baixar PDF
- Recomendacoes personalizadas

**Para testes pendentes/em andamento:**
- Mensagem orientando a verificar o email ou acessar o link
- Status visual claro

**Secao inferior:**
- Card de agendar feedback (Calendly) se disponivel
- Botao de sair

### 3. Detalhes tecnicos

**Migracao SQL:**

```sql
CREATE OR REPLACE FUNCTION public.get_participant_portal_full_data(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
  v_participant_id uuid;
BEGIN
  IF NOT public.is_participant(_user_id) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT id INTO v_participant_id FROM participants WHERE user_id = _user_id LIMIT 1;

  SELECT json_build_object(
    'participant', (
      SELECT json_build_object(
        'id', p.id, 'name', p.name, 'email', p.email,
        'company_name', c.name, 'status', p.status, 'completed_at', p.completed_at
      )
      FROM participants p JOIN companies c ON c.id = p.company_id
      WHERE p.id = v_participant_id
    ),
    'facilitator', (
      SELECT json_build_object(
        'name', pr.full_name, 'calendly_url', pr.calendly_url, 'logo_url', pr.logo_url
      )
      FROM participants p LEFT JOIN profiles pr ON pr.user_id = p.facilitator_id
      WHERE p.id = v_participant_id
    ),
    'tests', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', pt.id,
          'test_name', tt.name,
          'test_slug', tt.slug,
          'test_icon', tt.icon,
          'status', pt.status,
          'created_at', pt.created_at,
          'started_at', pt.started_at,
          'completed_at', pt.completed_at,
          'result', CASE WHEN tr.id IS NOT NULL THEN
            json_build_object(
              'id', tr.id,
              'total_score', tr.total_score,
              'dimension_scores', tr.dimension_scores,
              'completed_at', tr.completed_at
            )
          ELSE NULL END
        ) ORDER BY pt.created_at DESC
      ), '[]'::json)
      FROM participant_tests pt
      JOIN test_types tt ON tt.id = pt.test_type_id
      LEFT JOIN test_results tr ON tr.participant_test_id = pt.id
      WHERE pt.participant_id = v_participant_id
    ),
    'legacy_result', (
      SELECT CASE WHEN dr.id IS NOT NULL THEN
        json_build_object(
          'id', dr.id,
          'total_score', dr.total_score,
          'dimension_scores', dr.dimension_scores,
          'completed_at', dr.completed_at
        )
      ELSE NULL END
      FROM participants p
      LEFT JOIN diagnostic_results dr ON dr.participant_id = p.id
      WHERE p.id = v_participant_id
    )
  ) INTO result;

  RETURN result;
END;
$$;
```

Criar versao equivalente `get_participant_portal_full_data_by_id` para admin/impersonacao.

**`src/pages/participante/PortalParticipante.tsx`:**

- Atualizar interface `PortalData` para incluir `tests[]` e `legacy_result`
- Chamar a nova RPC em vez da antiga
- Renderizar lista de testes com cards expansiveis
- Cada teste concluido tem seu proprio radar chart e dimensoes
- Diferenciar a visualizacao por tipo de teste (IQ+IS vs DISC) com base no `test_slug`
- Manter compatibilidade: se `tests` estiver vazio mas `legacy_result` existir, mostrar o resultado legado como hoje

**Componente novo: `src/components/participante/TestResultCard.tsx`**

Card reutilizavel que recebe os dados de um teste e renderiza:
- Header com icone, nome, status, datas
- Conteudo expansivel com resultados detalhados
- Logica para determinar tipo de visualizacao (IQ+IS ou DISC)

### Layout visual (esquema)

```text
+--------------------------------------------+
| [Logo]  Meus Resultados                    |
|         Maria Silva        [Sair]          |
+--------------------------------------------+
| Empresa: Empresa ABC                       |
| Facilitador: João Santos                   |
+--------------------------------------------+
| MEUS TESTES (3)                            |
|                                            |
| +----------------------------------------+ |
| | [brain] Diagnostico IQ+IS              | |
| | Concluido em 20/01/2026                | |
| | Score: 4.2/5                           | |
| | [v Expandir para ver resultado]        | |
| +----------------------------------------+ |
|                                            |
| +----------------------------------------+ |
| | [target] Perfil DISC                   | |
| | Em andamento                           | |
| | Iniciado em 15/02/2026                 | |
| +----------------------------------------+ |
|                                            |
| +----------------------------------------+ |
| | [heart] Mapa da Alma                   | |
| | Pendente                               | |
| | Atribuido em 14/02/2026                | |
| +----------------------------------------+ |
|                                            |
| [Agendar Sessao de Feedback]              |
+--------------------------------------------+
```

