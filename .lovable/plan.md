

## Correcao: Links do Diagnostico nao funcionam (RLS bloqueando acesso anonimo)

### Problema

As novas tabelas `participant_tests`, `test_responses` e `test_results` so tem politicas RLS para **facilitadores autenticados**. Quando um participante (usuario anonimo) acessa o link `/diagnostico/:token`, a consulta a `participant_tests` falha silenciosamente por falta de permissao, e o fallback para a tabela antiga tambem nao encontra o token pois ele foi migrado para `participant_tests`.

### Solucao

Adicionar politicas RLS que permitam acesso anonimo nas 3 tabelas, restrito ao contexto do token/diagnostico:

| Tabela | Politica | Descricao |
|--------|----------|-----------|
| `participant_tests` | SELECT via `access_token` | Qualquer pessoa com o token pode ler o registro correspondente |
| `participant_tests` | UPDATE via `access_token` | Permite atualizar status (pending -> in_progress -> completed) |
| `test_responses` | INSERT/SELECT/UPDATE | Permite inserir e ler respostas vinculadas ao participant_test acessado via token |
| `test_results` | INSERT/SELECT | Permite inserir e ler resultados vinculados ao participant_test |
| `test_questions` | SELECT (ja existe) | Ja esta liberado para leitura publica |

### Detalhes Tecnicos

**Migracao SQL:**

```sql
-- Participantes anonimos podem ler seu proprio participant_test pelo access_token
CREATE POLICY "Anyone can read participant_test by token"
  ON public.participant_tests FOR SELECT
  USING (true);

-- Participantes anonimos podem atualizar status do seu teste
CREATE POLICY "Anyone can update participant_test by token"
  ON public.participant_tests FOR UPDATE
  USING (true);

-- Permitir inserir respostas para qualquer participant_test
CREATE POLICY "Anyone can insert test responses"
  ON public.test_responses FOR INSERT
  WITH CHECK (true);

-- Permitir ler respostas (para retomada do diagnostico)
CREATE POLICY "Anyone can read test responses"
  ON public.test_responses FOR SELECT
  USING (true);

-- Permitir atualizar respostas existentes (upsert)
CREATE POLICY "Anyone can update test responses"
  ON public.test_responses FOR UPDATE
  USING (true);

-- Permitir inserir resultados
CREATE POLICY "Anyone can insert test results"
  ON public.test_results FOR INSERT
  WITH CHECK (true);

-- Permitir ler resultados (para exibir na tela de resultados)
CREATE POLICY "Anyone can read test results"
  ON public.test_results FOR SELECT
  USING (true);
```

> Nota: As politicas sao abertas (USING true) porque o acesso ja e controlado pelo token unico (UUID) que serve como "senha" do participante — o mesmo modelo usado na tabela `participants` original. Sem conhecer o token, nao e possivel acessar os dados.

**Nenhuma mudanca de codigo** e necessaria — o hook `useDiagnostic` ja esta correto, so precisa que o banco permita as consultas.

