-- Inserir 16 novas perguntas no diagnóstico
-- Mantendo a estrutura de dimension_order e question_order existentes

-- Consciência Interior (dimension_order = 1) - adicionar perguntas 9, 10, 11
INSERT INTO public.diagnostic_questions (dimension, dimension_order, question_order, question_text, reverse_scored) VALUES
('Consciência Interior', 1, 9, 'Consigo fazer pausas conscientes durante o dia para verificar como estou me sentindo.', false),
('Consciência Interior', 1, 10, 'Percebo a diferença entre o que penso e o que sinto em situações desafiadoras.', false),
('Consciência Interior', 1, 11, 'Tenho dificuldade em distinguir minhas próprias opiniões das opiniões dos outros.', true);

-- Coerência Emocional (dimension_order = 2) - adicionar perguntas 9, 10, 11
INSERT INTO public.diagnostic_questions (dimension, dimension_order, question_order, question_text, reverse_scored) VALUES
('Coerência Emocional', 2, 9, 'Consigo pedir ajuda quando estou emocionalmente sobrecarregado.', false),
('Coerência Emocional', 2, 10, 'Reconheço quando estou projetando minhas emoções em outras pessoas.', false),
('Coerência Emocional', 2, 11, 'Evito situações que possam trazer desconforto emocional.', true);

-- Conexão e Propósito (dimension_order = 3) - adicionar perguntas 9, 10, 11, 12
INSERT INTO public.diagnostic_questions (dimension, dimension_order, question_order, question_text, reverse_scored) VALUES
('Conexão e Propósito', 3, 9, 'Minhas decisões importantes são guiadas por meus valores pessoais.', false),
('Conexão e Propósito', 3, 10, 'Sinto que contribuo de forma significativa para algo além de mim mesmo.', false),
('Conexão e Propósito', 3, 11, 'Frequentemente me sinto perdido sobre qual direção tomar na vida.', true),
('Conexão e Propósito', 3, 12, 'Consigo encontrar significado mesmo em experiências difíceis.', false);

-- Relações e Compaixão (dimension_order = 4) - adicionar perguntas 9, 10, 11
INSERT INTO public.diagnostic_questions (dimension, dimension_order, question_order, question_text, reverse_scored) VALUES
('Relações e Compaixão', 4, 9, 'Pratico a escuta atenta, sem planejar minha resposta enquanto o outro fala.', false),
('Relações e Compaixão', 4, 10, 'Consigo reconhecer e celebrar as conquistas dos outros genuinamente.', false),
('Relações e Compaixão', 4, 11, 'Tenho dificuldade em pedir desculpas quando erro.', true);

-- Transformação e Crescimento (dimension_order = 5) - adicionar perguntas 9, 10, 11
INSERT INTO public.diagnostic_questions (dimension, dimension_order, question_order, question_text, reverse_scored) VALUES
('Transformação e Crescimento', 5, 9, 'Busco ativamente feedback sobre meu comportamento e desempenho.', false),
('Transformação e Crescimento', 5, 10, 'Consigo identificar lições valiosas em fracassos e decepções.', false),
('Transformação e Crescimento', 5, 11, 'Prefiro manter as coisas como estão do que arriscar mudanças.', true);