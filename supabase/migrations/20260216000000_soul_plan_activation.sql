-- ===========================
-- Migração: Ativar Mapa da Alma (Soul Plan)
-- ===========================
-- O Mapa da Alma não usa perguntas tradicionais.
-- O cálculo é feito a partir do nome de nascimento do participante.
-- Esta migração apenas ativa o tipo de teste.

-- 1. Ativar o tipo de teste Mapa da Alma
UPDATE test_types 
SET is_active = true 
WHERE slug = 'mapa_da_alma';

-- Verificar se a atualização funcionou
-- Se o tipo não existir, inserir
INSERT INTO test_types (name, slug, description, is_active)
SELECT 'Mapa da Alma', 'mapa_da_alma', 'Mapeamento profundo da essência interior baseado no Soul Plan', true
WHERE NOT EXISTS (SELECT 1 FROM test_types WHERE slug = 'mapa_da_alma');
