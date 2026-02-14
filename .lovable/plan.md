

## Redesign Completo do Conteudo do Relatorio IQ+IS

### Problema

O conteudo atual e superficial: cada dimensao tem 2-3 frases genericas de "about", uma interpretacao curta por nivel, e recomendacoes com 4 bullet points simples. O relatorio nao parece profissional nem robusto o suficiente para um diagnostico de coaching/consultoria.

### Visao Geral da Solucao

Transformar o relatorio num documento denso e profissional, com estilo hibrido entre relatorio de coaching e laudo psicologico. Adicionar novas secoes estruturais: resumo executivo, fundamentacao teorica, analise cruzada entre dimensoes e plano de acao com cronograma semanal.

### Estrutura do Novo Relatorio (ordem de exibicao)

```text
1. Cabecalho com score (ja existe)
2. NOVO - Resumo Executivo (paragrafo denso de sintese)
3. Sobre o Diagnostico IQ+IS (expandido com fundamentacao teorica)
4. Radar Chart (ja existe)
5. Analise Dimensional Detalhada (5 dimensoes - conteudo 5x maior)
6. NOVO - Analise Cruzada entre Dimensoes
7. Recomendacoes (expandidas com mais profundidade)
8. NOVO - Plano de Acao com Cronograma (4 semanas)
9. Acoes (PDF, compartilhar)
```

### Detalhamento das Mudancas

#### 1. Novo arquivo de conteudo expandido (`src/lib/dimension-descriptions.ts`)

Para cada dimensao, expandir drasticamente o conteudo:

**Estrutura atual** (por dimensao):
- about: 2 frases
- lowInterpretation: 2 frases
- midInterpretation: 2 frases
- highInterpretation: 2 frases
- whyItMatters: 1 frase

**Nova estrutura** (por dimensao):
- `about`: 1 paragrafo denso (4-5 frases) explicando o que a dimensao mede, quais competencias abrange
- `theoreticalBasis`: Fundamento teorico - quais teorias/autores sustentam (ex: Goleman, Kabat-Zinn, Viktor Frankl, Neff, Dweck)
- `subDimensions`: Array de 3-4 subdimensoes com nome e descricao (ex: "Atencao Plena", "Auto-observacao", "Reconhecimento de Padroes")
- `lowInterpretation`: Paragrafo completo (5-6 frases) com analise, manifestacoes praticas, impacto no cotidiano e convite ao desenvolvimento
- `midInterpretation`: Idem, com nuances do estagio intermediario
- `highInterpretation`: Idem, com reconhecimento e orientacao para aprofundamento
- `whyItMatters`: 2-3 frases conectando a dimensao com resultados concretos na vida pessoal e profissional
- `signsInDailyLife`: Array de 3-4 exemplos praticos de como essa dimensao se manifesta no dia a dia
- `connectionToOthers`: Texto explicando como essa dimensao se relaciona com as demais

Exemplo para "Consciencia Interior":
```
about: "A Consciencia Interior representa a capacidade fundamental de voltar
a atencao para si mesmo de forma deliberada e nao reativa. Ela abrange a
habilidade de observar pensamentos, emocoes e sensacoes corporais sem se
identificar automaticamente com eles, criando um espaco entre estimulo e
resposta. Esta dimensao inclui a pratica de atencao plena (mindfulness),
a auto-observacao reflexiva e o reconhecimento de padroes automaticos de
pensamento e comportamento que operam abaixo do nivel consciente."

theoreticalBasis: "Fundamentada nas pesquisas de Jon Kabat-Zinn sobre
mindfulness e reducao de estresse, nos estudos de Daniel Siegel sobre
integracao neural e na tradicao contemplativa adaptada pela psicologia
positiva. A neurociencia contemporanea demonstra que praticas regulares
de auto-observacao fortalecem o cortex pre-frontal e reduzem a reatividade
da amigdala, promovendo respostas mais conscientes e equilibradas."

subDimensions: [
  { name: "Atencao Plena", description: "Capacidade de estar presente..." },
  { name: "Auto-observacao", description: "Habilidade de perceber..." },
  { name: "Reconhecimento de Padroes", description: "Identificar..." },
  { name: "Pausa Consciente", description: "Criar espaco entre..." }
]

signsInDailyLife: [
  "Perceber quando esta no 'piloto automatico' e trazer-se de volta ao presente",
  "Notar tensoes corporais antes que se tornem dores cronicas",
  "Reconhecer quando uma reacao emocional e desproporcional a situacao",
  "Fazer pausas voluntarias durante o dia para respirar e se recentrar"
]
```

#### 2. Novo componente: Resumo Executivo

Gerar um paragrafo denso e personalizado baseado na combinacao dos scores. Nao e um texto fixo - e composto dinamicamente:

- Frase de abertura baseada no score geral
- Mencao das 2 dimensoes mais fortes com contexto
- Mencao das 2 dimensoes a desenvolver com implicacoes praticas
- Frase de fechamento conectando tudo com um convite a acao

Exemplo: "O perfil de Maria revela uma base solida de inteligencia emocional e espiritual, com score geral de 3.8/5 (Bom desenvolvimento). Suas maiores forcas residem na Consciencia Interior (4.2) e Relacoes e Compaixao (4.0), indicando forte capacidade de auto-observacao e conexao genuina com outros. As areas que mais se beneficiariam de atencao sao Coerencia Emocional (3.1) e Transformacao (3.3), onde ha potencial significativo de crescimento. O fortalecimento dessas dimensoes pode criar um efeito multiplicador, potencializando as competencias ja desenvolvidas e ampliando sua capacidade de influencia positiva."

#### 3. Nova secao: Analise Cruzada entre Dimensoes

Logica inteligente que identifica combinacoes relevantes entre dimensoes e gera insights. Exemplos de regras:

- **Consciencia alta + Coerencia baixa**: "Voce tem boa capacidade de perceber o que sente, mas pode ter dificuldade em regular essas emocoes. Isso sugere que o proximo passo e desenvolver tecnicas de regulacao emocional..."
- **Proposito alto + Transformacao baixa**: "Voce tem clareza sobre seus valores, mas pode encontrar dificuldade em implementar mudancas concretas. Isso indica que o desafio nao e saber 'para onde ir', mas sim 'como dar o primeiro passo'..."
- **Relacoes alta + Consciencia baixa**: "Sua empatia natural e um recurso valioso, mas sem auto-observacao pode levar ao esgotamento emocional..."

Implementar 8-10 combinacoes pre-definidas que sao selecionadas com base nos scores reais.

#### 4. Plano de Acao com Cronograma (4 semanas)

Gerar um plano estruturado de 4 semanas focado nas 2 dimensoes mais fracas:

```
Semana 1 - Consciencia e Observacao
  Objetivo: Estabelecer o habito de pausa consciente
  Praticas diarias:
    - Manhã: 5 min de respiração consciente ao acordar
    - Tarde: 3 pausas de 1 min para auto-observação
    - Noite: Registro de 3 padrões notados no dia
  Meta da semana: Completar o registro por pelo menos 5 dias

Semana 2 - Aprofundamento
  Objetivo: Expandir a pratica...
  ...

Semana 3 - Integracao
  ...

Semana 4 - Consolidacao e Avaliacao
  ...
```

#### 5. Recomendacoes expandidas (`src/lib/recommendations.ts`)

Expandir cada recomendacao com:
- `description`: 3-4 frases em vez de 1
- `practices`: 6 praticas em vez de 4, com mais detalhamento
- `resources`: Array de referencias (livros, tecnicas, conceitos)
- `expectedBenefits`: O que a pessoa pode esperar ao praticar

### Arquivos a Criar/Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/dimension-descriptions.ts` | Expandir drasticamente o conteudo de cada dimensao (5x mais texto), adicionar subdimensoes, fundamentacao teorica, sinais no cotidiano |
| `src/lib/recommendations.ts` | Expandir recomendacoes com mais praticas, recursos e beneficios esperados |
| `src/lib/cross-analysis.ts` | **Novo** - Logica de analise cruzada entre dimensoes com 8-10 combinacoes |
| `src/lib/action-plan.ts` | **Novo** - Gerador de plano de acao de 4 semanas baseado nas dimensoes fracas |
| `src/lib/executive-summary.ts` | **Novo** - Gerador de resumo executivo personalizado |
| `src/components/diagnostic/DimensionCard.tsx` | Expandir conteudo expandivel: adicionar subdimensoes, fundamentacao, sinais no cotidiano |
| `src/components/diagnostic/ExecutiveSummary.tsx` | **Novo** - Componente do resumo executivo |
| `src/components/diagnostic/CrossAnalysis.tsx` | **Novo** - Componente da analise cruzada |
| `src/components/diagnostic/ActionPlan.tsx` | **Novo** - Componente do plano de 4 semanas |
| `src/components/diagnostic/RecommendationList.tsx` | Atualizar para mostrar conteudo expandido |
| `src/components/diagnostic/DiagnosticResults.tsx` | Integrar novas secoes na ordem correta |
| `src/components/participants/ParticipantResultModal.tsx` | Integrar novas secoes na ordem correta |

### Secao Tecnica

**Geracao de conteudo dinamico**: O resumo executivo e a analise cruzada usam funcoes que recebem os scores e retornam texto montado dinamicamente (template strings com logica condicional). Nao e IA generativa - sao templates pre-escritos selecionados por regras.

**Analise cruzada**: Cada combinacao tem um `condition` (funcao que recebe os scores e retorna boolean) e um `insight` (texto). As condicoes verificam relacoes como "score X > 3.5 E score Y < 2.5".

**Plano de acao**: Um gerador que recebe as 2 dimensoes mais fracas e monta um cronograma de 4 semanas com praticas progressivas pre-definidas para cada dimensao.

**DimensionCard expandido**: O accordion passa a ter 4 abas internas ao expandir: "Visao Geral", "Subdimensoes", "Seu Resultado", "Na Pratica". Isso organiza o volume maior de conteudo sem sobrecarregar visualmente.

**Nenhuma mudanca no banco de dados** - todo o conteudo e estatico no frontend, gerado por templates baseados nos scores.
