
-- Permitir leitura anônima da tabela participants (necessário para o diagnóstico via token)
CREATE POLICY "Anyone can read participants"
  ON public.participants FOR SELECT
  USING (true);

-- Permitir leitura anônima de profiles (necessário para branding do facilitador)
CREATE POLICY "Anyone can read profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Permitir atualização anônima do participante (para mudar status via diagnóstico)
CREATE POLICY "Anyone can update participants"
  ON public.participants FOR UPDATE
  USING (true);

-- Permitir inserção anônima em diagnostic_responses (fluxo antigo)
CREATE POLICY "Anyone can insert diagnostic responses"
  ON public.diagnostic_responses FOR INSERT
  WITH CHECK (true);

-- Permitir leitura anônima de diagnostic_responses (retomada do fluxo antigo)
CREATE POLICY "Anyone can read diagnostic responses"
  ON public.diagnostic_responses FOR SELECT
  USING (true);

-- Permitir update de diagnostic_responses (upsert fluxo antigo)
CREATE POLICY "Anyone can update diagnostic responses"
  ON public.diagnostic_responses FOR UPDATE
  USING (true);

-- Permitir inserção anônima em diagnostic_results (fluxo antigo)
CREATE POLICY "Anyone can insert diagnostic results"
  ON public.diagnostic_results FOR INSERT
  WITH CHECK (true);

-- Permitir leitura anônima de diagnostic_results (exibir resultado)
CREATE POLICY "Anyone can read diagnostic results"
  ON public.diagnostic_results FOR SELECT
  USING (true);
