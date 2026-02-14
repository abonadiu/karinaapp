-- ============================================================
-- Migração: Ativar teste DISC e inserir 40 perguntas
-- ============================================================

-- 1. Ativar o tipo de teste DISC
UPDATE public.test_types SET is_active = true WHERE slug = 'disc';

-- 2. Inserir as 40 perguntas DISC (10 por dimensão)
-- Dimensão D (Dominância) - dimension_order = 1
INSERT INTO public.test_questions (test_type_id, dimension, dimension_order, question_order, question_text, reverse_scored)
VALUES
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 1, 'Eu gosto de tomar decisões rápidas e ir direto ao ponto.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 2, 'Eu me sinto confortável assumindo o controle de situações.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 3, 'Eu prefiro resolver problemas de forma independente.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 4, 'Eu sou competitivo e gosto de desafios.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 5, 'Eu tenho facilidade em dizer o que penso, mesmo que seja impopular.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 6, 'Eu fico impaciente quando as coisas demoram para acontecer.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 7, 'Eu prefiro liderar do que seguir instruções de outros.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 8, 'Eu me sinto motivado quando tenho metas desafiadoras para alcançar.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 9, 'Eu não tenho medo de confrontar situações difíceis.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'dominancia', 1, 10, 'Eu valorizo resultados concretos mais do que o processo para alcançá-los.', false),

-- Dimensão I (Influência) - dimension_order = 2
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 1, 'Eu me sinto energizado quando estou em grupo e interagindo com pessoas.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 2, 'Eu tenho facilidade em convencer os outros sobre minhas ideias.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 3, 'Eu gosto de ser o centro das atenções em situações sociais.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 4, 'Eu sou otimista e costumo ver o lado positivo das situações.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 5, 'Eu prefiro trabalhar em equipe do que sozinho.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 6, 'Eu me expresso com entusiasmo e energia.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 7, 'Eu tenho facilidade em fazer novas amizades e conexões.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 8, 'Eu gosto de motivar e inspirar as pessoas ao meu redor.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 9, 'Eu prefiro ambientes de trabalho descontraídos e criativos.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'influencia', 2, 10, 'Eu valorizo o reconhecimento e a aprovação das pessoas.', false),

-- Dimensão S (Estabilidade) - dimension_order = 3
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 1, 'Eu prefiro um ambiente de trabalho estável e previsível.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 2, 'Eu sou paciente e consigo esperar o tempo necessário para que as coisas aconteçam.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 3, 'Eu sou leal às pessoas e aos compromissos que assumo.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 4, 'Eu prefiro evitar conflitos e buscar harmonia nas relações.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 5, 'Eu me sinto desconfortável com mudanças repentinas.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 6, 'Eu sou um bom ouvinte e as pessoas costumam me procurar para desabafar.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 7, 'Eu valorizo a cooperação mais do que a competição.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 8, 'Eu prefiro seguir um ritmo constante do que trabalhar sob pressão.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 9, 'Eu me sinto bem quando posso ajudar os outros.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'estabilidade', 3, 10, 'Eu valorizo relacionamentos duradouros e de confiança.', false),

-- Dimensão C (Conformidade) - dimension_order = 4
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 1, 'Eu presto muita atenção aos detalhes e à qualidade do meu trabalho.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 2, 'Eu prefiro tomar decisões baseadas em dados e fatos.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 3, 'Eu gosto de seguir regras e procedimentos estabelecidos.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 4, 'Eu sou perfeccionista e busco excelência em tudo que faço.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 5, 'Eu prefiro analisar todas as opções antes de tomar uma decisão.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 6, 'Eu me sinto desconfortável quando não tenho informações suficientes.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 7, 'Eu valorizo organização e planejamento.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 8, 'Eu sou crítico com a qualidade do trabalho — meu e dos outros.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 9, 'Eu prefiro trabalhar com processos claros e bem definidos.', false),
  ((SELECT id FROM public.test_types WHERE slug = 'disc'), 'conformidade', 4, 10, 'Eu me sinto satisfeito quando entrego um trabalho preciso e sem erros.', false);
