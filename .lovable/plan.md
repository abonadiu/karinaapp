
## Plano: Corrigir Build Error + Criar Dados de Teste

### 1. Corrigir Build Error no Edge Function

**Arquivo**: `supabase/functions/admin-create-user/index.ts` (linha 124)

O erro e uma referencia a `supabase` que nao existe -- deveria ser `supabaseAdmin`. Trocar:

```typescript
// DE:
const { error: roleError } = await supabase.rpc("admin_set_user_role", ...);

// PARA:
const { error: roleError } = await supabaseAdmin.rpc("admin_set_user_role", ...);
```

---

### 2. Criar Dados de Teste

O banco ja possui 23 resultados de diagnostico e 5 empresas. Para enriquecer a analise, vou adicionar resultados para os participantes que estao como `pending`/`invited` sem resultados, simulando perfis variados:

**Participantes que receberao resultados** (10 novos):

| Participante | Empresa | Perfil |
|---|---|---|
| Amanda Torres | TechCorp Brasil | Scores altos (4.0-4.8) |
| Gabriela Souza | TechCorp Brasil | Scores medios (2.8-3.5) |
| Joao Silva | TechCorp Brasil | Scores baixos (1.5-2.5) |
| Juliana Souza | Banco Horizonte | Scores altos (4.2-4.7) |
| Henrique Lopes | Banco Horizonte | Scores medios-baixos (2.3-3.2) |
| Rogerio Nascimento | Industrias Nova Era | Scores medios (3.0-3.8) |
| Renata Dias | Consultoria Estrategica | Scores altos (4.0-4.5) |
| Isabela Cunha | Consultoria Estrategica | Scores baixos (1.8-2.8) |
| Participante Teste | TechCorp Brasil | Scores medios (3.0-3.5) |
| Participante Teste Calendly | Empresa Teste IQIS | Scores altos (3.8-4.5) |

**Para cada participante**:
1. Atualizar `status` para `completed`, definir `completed_at` e `started_at`
2. Inserir um registro em `diagnostic_results` com `dimension_scores` variados (5 dimensoes) e `total_score`

**Formato dos dimension_scores** (baseado no formato existente):
```json
{
  "consciencia_interior": {"label": "Consciencia Interior", "score": X.X},
  "coerencia_emocional": {"label": "Coerencia Emocional", "score": X.X},
  "conexao_proposito": {"label": "Conexao e Proposito", "score": X.X},
  "relacoes_compaixao": {"label": "Relacoes e Compaixao", "score": X.X},
  "transformacao_crescimento": {"label": "Transformacao e Crescimento", "score": X.X}
}
```

Os scores serao variados para gerar graficos interessantes com distribuicoes realistas (altos, medios e baixos).

---

### Arquivos a Modificar

| Acao | Detalhe |
|------|---------|
| Editar `supabase/functions/admin-create-user/index.ts` | Corrigir `supabase` para `supabaseAdmin` na linha 124 |
| Inserir dados via SQL | UPDATE 10 participantes para `completed` + INSERT 10 `diagnostic_results` |
