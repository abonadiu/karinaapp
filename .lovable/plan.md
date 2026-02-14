

## Suporte a Multiplos Tipos de Teste por Participante

### Visao Geral

Transformar a plataforma de um unico diagnostico (IQ+IS) para suportar multiplos tipos de teste (DISC, Mapa da Alma, Numerologia, Mapa Astral, etc.), cada um com suas proprias perguntas, logica de pontuacao e relatorio. O facilitador pode enviar um teste de cada vez para cada participante.

### Arquitetura Proposta

A mudanca principal e introduzir o conceito de "tipo de teste" e desacoplar o vinculo direto participante-diagnostico. Hoje, cada participante tem um unico `access_token` e `status` que representam o diagnostico IQ+IS. Com a mudanca, um participante pode ter varios testes atribuidos, cada um com seu proprio token, status e resultado.

```text
ANTES:
  participant --> access_token --> diagnostico IQ+IS --> resultado

DEPOIS:
  participant --> participant_tests[1] --> test_type "IQ+IS" --> resultado 1
              --> participant_tests[2] --> test_type "DISC"  --> resultado 2
              --> participant_tests[3] --> test_type "Mapa da Alma" --> resultado 3
```

### Etapa 1 - Banco de Dados (migracao)

| Tabela | Acao |
|--------|------|
| `test_types` (nova) | Catalogo de tipos de teste. Colunas: `id`, `slug` (ex: "iq-is", "disc"), `name`, `description`, `icon`, `is_active`, `created_at`. Sera preenchida com o tipo "IQ+IS" como seed. |
| `test_questions` (nova) | Perguntas vinculadas a um tipo de teste. Colunas: `id`, `test_type_id`, `dimension`, `dimension_order`, `question_order`, `question_text`, `reverse_scored`, `created_at`. Os dados existentes de `diagnostic_questions` serao migrados para ca. |
| `participant_tests` (nova) | Vinculo entre participante e teste. Colunas: `id`, `participant_id`, `test_type_id`, `access_token` (unico), `status` (pending/invited/in_progress/completed), `started_at`, `completed_at`, `invited_at`, `reminder_count`, `last_reminder_at`, `created_at`. |
| `test_responses` (nova) | Respostas vinculadas a um `participant_test_id` em vez de `participant_id`. Colunas: `id`, `participant_test_id`, `question_id`, `score`, `answered_at`. |
| `test_results` (nova) | Resultados vinculados a um `participant_test_id`. Colunas: `id`, `participant_test_id`, `dimension_scores`, `total_score`, `exercises_data`, `completed_at`. |
| `participants` | Os campos `access_token`, `status`, `started_at`, `completed_at`, `invited_at`, `reminder_count`, `last_reminder_at` continuam existindo para compatibilidade, mas o fluxo novo usa `participant_tests`. |

Politicas RLS nas novas tabelas:
- `test_types`: leitura publica (SELECT true)
- `test_questions`: leitura publica (SELECT true)
- `participant_tests`: facilitador ve/cria/atualiza/deleta os seus (via `facilitator_id` do participante)
- `test_responses` e `test_results`: facilitador ve os de seus participantes

### Etapa 2 - Interface do Facilitador

**Atribuir teste ao participante:**

- No menu de acoes (dropdown) de cada participante na lista, adicionar opcao "Atribuir teste"
- Ao clicar, abre um dialog com a lista de tipos de teste disponiveis (vindos da tabela `test_types`)
- O facilitador seleciona um tipo e confirma
- Cria um registro em `participant_tests` com status "pending" e gera um `access_token` unico
- O botao "Copiar link" e "Enviar convite" passam a operar sobre `participant_tests` (mostrando qual teste)

**Lista de testes do participante:**

- No sheet lateral (ao clicar no participante), mostrar uma lista de testes atribuidos com status de cada um
- Cada teste mostra: tipo, status (badge), data de conclusao, e acoes (ver resultado, copiar link, enviar convite/lembrete)

**Coluna "Testes" na tabela de participantes:**

- Adicionar coluna mostrando quantos testes foram atribuidos e quantos concluidos (ex: "2/3")

### Etapa 3 - Fluxo do Diagnostico (participante)

- A rota `/diagnostico/:token` continua funcionando, mas agora o token vem de `participant_tests.access_token`
- O hook `useDiagnostic` busca o `participant_test` pelo token, identifica o `test_type_id`, e carrega as perguntas de `test_questions` filtradas por esse tipo
- As respostas sao salvas em `test_responses` e o resultado em `test_results`
- O fluxo de exercicios (respiracao, body map, reflexao) pode ser configuravel por tipo de teste no futuro, mas inicialmente todos os tipos usam o mesmo fluxo

### Etapa 4 - Seed dos Tipos de Teste

Inserir na tabela `test_types` os seguintes tipos iniciais:

| slug | name | icon | is_active |
|------|------|------|-----------|
| iq-is | Diagnostico IQ+IS | brain | true |
| disc | Perfil DISC | target | false |
| mapa-alma | Mapa da Alma | heart | false |
| numerologia | Numerologia | hash | false |
| mapa-astral | Mapa Astral | star | false |

Os tipos com `is_active = false` aparecem na interface mas nao podem ser atribuidos ainda (ficam "Em breve"). Isso permite que voce va adicionando as perguntas de cada tipo gradualmente.

### Etapa 5 - Atualizacao dos Componentes

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useDiagnostic.ts` | Buscar `participant_tests` pelo token em vez de `participants`. Carregar perguntas de `test_questions` filtradas por `test_type_id`. Salvar respostas em `test_responses` e resultados em `test_results`. |
| `src/pages/Diagnostico.tsx` | Sem mudancas estruturais, apenas consome o hook atualizado. |
| `src/components/participants/ParticipantList.tsx` | Adicionar coluna "Testes". Mudar dropdown para mostrar testes atribuidos. Adicionar opcao "Atribuir teste". |
| `src/pages/Participantes.tsx` | Carregar `participant_tests` junto com participantes. Atualizar sheet lateral para mostrar lista de testes. |
| `src/components/participants/AssignTestDialog.tsx` (novo) | Dialog para selecionar tipo de teste ao atribuir. |
| `src/components/participants/ParticipantTestsList.tsx` (novo) | Lista de testes atribuidos ao participante (para o sheet lateral). |
| Edge functions (`send-invite`, `send-reminder`) | Atualizar para receber `participant_test_id` e gerar link com o token correto. |

### Ordem de Implementacao

1. Criar tabelas e migrar dados existentes
2. Inserir seed dos tipos de teste
3. Atualizar `useDiagnostic` para usar novas tabelas
4. Criar componentes de atribuicao de teste
5. Atualizar lista de participantes e sheet lateral
6. Atualizar edge functions de convite/lembrete
7. Testar fluxo completo

### Observacoes

- Os dados existentes (perguntas, respostas e resultados do IQ+IS) serao migrados para as novas tabelas
- A compatibilidade com o fluxo atual sera mantida durante a transicao
- Para adicionar um novo tipo de teste no futuro, basta inserir o tipo na tabela `test_types`, adicionar as perguntas em `test_questions` e marcar como `is_active = true`
- A logica de pontuacao pode variar por tipo de teste (nem todos usam Likert 1-5), entao o campo `scoring_config` pode ser adicionado a `test_types` no futuro

