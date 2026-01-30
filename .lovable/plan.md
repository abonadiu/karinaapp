

# Fase 4: Sistema de Diagnostico IQ+IS

## Resumo
Implementacao do sistema de diagnostico de inteligencia emocional (IQ) e espiritual (IS), permitindo que participantes acessem via link unico, respondam 40 perguntas em 5 dimensoes, realizem exercicios vivenciais e recebam um relatorio personalizado.

---

## O que sera implementado

### 1. Acesso via Link Unico
- **Pagina de Acesso** (`/diagnostico/:token`) - Validacao do token do participante
- **Tela de Boas-vindas** - Introducao ao diagnostico e instrucoes
- **Progresso Salvo** - Participante pode pausar e retomar depois

### 2. Questionario de 40 Perguntas
- **5 Dimensoes** - 8 perguntas cada:
  1. Consciencia Interior (Meta-cognicao)
  2. Coerencia Emocional (Regulacao)
  3. Conexao e Proposito (Valores)
  4. Relacoes e Compaixao (Empatia)
  5. Transformacao (Crescimento)
- **Escala Likert** - 1 a 5 (Discordo totalmente a Concordo totalmente)
- **Navegacao entre perguntas** - Uma por vez com barra de progresso

### 3. Exercicios Vivenciais
- **Exercicio de Respiracao** - Timer interativo com instrucoes
- **Mapeamento Corporal** - Selecao de areas de tensao/conforto
- **Reflexao Guiada** - Campo de texto para insights

### 4. Resultados e Relatorio
- **Calculo de Scores** - Media por dimensao
- **Grafico Radar** - Visualizacao das 5 dimensoes
- **Pontos Cegos** - Dimensoes com menor score
- **Recomendacoes** - Praticas sugeridas por dimensao
- **PDF/Compartilhamento** - Exportar resultado (futuro)

---

## Estrutura do Banco de Dados

### Tabela: `diagnostic_questions`
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | ID unico (PK) |
| dimension | text | Nome da dimensao |
| dimension_order | integer | Ordem da dimensao (1-5) |
| question_order | integer | Ordem dentro da dimensao (1-8) |
| question_text | text | Texto da pergunta |
| reverse_scored | boolean | Se a escala e invertida |
| created_at | timestamp | Data de criacao |

### Tabela: `diagnostic_responses`
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | ID unico (PK) |
| participant_id | uuid | Referencia a participants.id |
| question_id | uuid | Referencia a diagnostic_questions.id |
| score | integer | Resposta (1-5) |
| answered_at | timestamp | Data/hora da resposta |
| created_at | timestamp | Data de criacao |

### Tabela: `diagnostic_results`
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | ID unico (PK) |
| participant_id | uuid | Referencia a participants.id |
| dimension_scores | jsonb | Scores por dimensao |
| total_score | decimal | Score medio geral |
| completed_at | timestamp | Data de conclusao |
| exercises_data | jsonb | Dados dos exercicios vivenciais |
| created_at | timestamp | Data de criacao |

---

## Fluxo do Participante

```text
Email com Link
     |
     v
/diagnostico/:token
     |
     +---> Validar Token
     |          |
     |          +--(invalido)--> Erro: Link invalido
     |          |
     |          +--(valido)--> Boas-vindas
     |                              |
     v                              v
[Iniciar] ----------------------> Questionario
                                      |
     +--------------------------------+
     |
     v
Pergunta 1/40 --> ... --> Pergunta 40/40
     |
     v
Exercicio 1: Respiracao
     |
     v
Exercicio 2: Mapeamento Corporal
     |
     v
Exercicio 3: Reflexao
     |
     v
Processando Resultados...
     |
     v
Tela de Resultado (Grafico Radar + Recomendacoes)
```

---

## Arquivos a serem criados

### Paginas do Diagnostico
- `src/pages/Diagnostico.tsx` - Container principal do diagnostico
- `src/pages/DiagnosticoResultado.tsx` - Pagina de resultados

### Componentes do Diagnostico
- `src/components/diagnostic/DiagnosticWelcome.tsx` - Tela inicial
- `src/components/diagnostic/QuestionCard.tsx` - Card de pergunta individual
- `src/components/diagnostic/LikertScale.tsx` - Componente de escala 1-5
- `src/components/diagnostic/ProgressBar.tsx` - Barra de progresso
- `src/components/diagnostic/ExerciseBreathing.tsx` - Exercicio de respiracao
- `src/components/diagnostic/ExerciseBodyMap.tsx` - Mapeamento corporal
- `src/components/diagnostic/ExerciseReflection.tsx` - Reflexao guiada
- `src/components/diagnostic/ResultsRadarChart.tsx` - Grafico radar
- `src/components/diagnostic/DimensionCard.tsx` - Card de resultado por dimensao
- `src/components/diagnostic/RecommendationList.tsx` - Lista de recomendacoes

### Hooks e Utils
- `src/hooks/useDiagnostic.ts` - Hook para gerenciar estado do diagnostico
- `src/lib/diagnostic-questions.ts` - Lista das 40 perguntas
- `src/lib/diagnostic-scoring.ts` - Logica de calculo de scores
- `src/lib/recommendations.ts` - Recomendacoes por dimensao

---

## Politicas de Seguranca (RLS)

### Tabela `diagnostic_questions`
- SELECT: Todos podem ler (perguntas sao publicas)
- INSERT/UPDATE/DELETE: Apenas admins (ou ninguem via cliente)

### Tabela `diagnostic_responses`
- SELECT: Facilitador pode ver respostas de seus participantes
- INSERT: Via token do participante (validacao no backend)
- UPDATE: Permitir atualizar resposta antes de finalizar
- DELETE: Nao permitido

### Tabela `diagnostic_results`
- SELECT: Facilitador pode ver resultados de seus participantes
- INSERT: Apenas apos completar todas as respostas
- UPDATE: Nao permitido (resultado e final)
- DELETE: Nao permitido

---

## Detalhes Tecnicos

### Validacao de Token
- Buscar participante por `access_token`
- Verificar se status permite acesso (`pending`, `invited`, `in_progress`)
- Atualizar status para `in_progress` ao iniciar

### Persistencia de Progresso
- Salvar cada resposta individualmente
- Permitir retornar ao ponto onde parou
- Marcar `started_at` na primeira resposta

### Calculo de Scores
- Cada dimensao: media das 8 respostas (1-5)
- Perguntas com `reverse_scored`: inverter valor (6 - resposta)
- Score total: media das 5 dimensoes
- Armazenar em `diagnostic_results.dimension_scores` como JSON

### Grafico Radar
- Usar Recharts (ja instalado)
- 5 eixos representando as dimensoes
- Escala de 1 a 5

### Exercicios Vivenciais
- Respiracao: Timer de 4-7-8 segundos (inspirar-segurar-expirar)
- Mapeamento: SVG interativo do corpo humano
- Reflexao: Textarea com prompts guiados

---

## As 5 Dimensoes e Exemplos de Perguntas

### 1. Consciencia Interior
- "Consigo observar meus pensamentos sem me identificar com eles"
- "Percebo quando estou no 'piloto automatico'"

### 2. Coerencia Emocional
- "Consigo nomear minhas emocoes quando as sinto"
- "Mantenho a calma em situacoes de pressao"

### 3. Conexao e Proposito
- "Minhas acoes estao alinhadas com meus valores"
- "Sinto que minha vida tem um proposito claro"

### 4. Relacoes e Compaixao
- "Consigo me colocar no lugar dos outros"
- "Ofereco apoio genuino sem esperar retorno"

### 5. Transformacao
- "Vejo os desafios como oportunidades de crescimento"
- "Estou aberto a mudar de opiniao quando apresentado a novas informacoes"

---

## Ordem de Implementacao

1. Criar tabelas `diagnostic_questions`, `diagnostic_responses`, `diagnostic_results`
2. Configurar RLS policies para todas as tabelas
3. Inserir as 40 perguntas no banco de dados
4. Criar pagina de acesso com validacao de token
5. Implementar componente de pergunta com escala Likert
6. Criar fluxo de navegacao entre perguntas
7. Implementar exercicio de respiracao
8. Implementar mapeamento corporal
9. Implementar reflexao guiada
10. Criar tela de resultados com grafico radar
11. Implementar recomendacoes por dimensao
12. Atualizar status do participante ao finalizar
13. Adicionar rotas no App.tsx

