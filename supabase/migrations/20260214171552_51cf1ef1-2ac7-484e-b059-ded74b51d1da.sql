
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
