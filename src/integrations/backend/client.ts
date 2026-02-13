/**
 * Supabase Client — KarinaApp
 *
 * Cria o client Supabase com fallback para variáveis de ambiente não configuradas.
 *
 * SEGURANÇA: As chaves abaixo são a URL pública e a anon key (publishable),
 * que são seguras para incluir no código-fonte do frontend por design.
 * NUNCA inclua a service_role key aqui.
 *
 * Para rotacionar as chaves, atualize as variáveis de ambiente:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_PUBLISHABLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';

// Fallback público (anon key — segura para frontend)
const FALLBACK_URL = "https://dlsnflfqemavnhavtaxe.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsc25mbGZxZW1hdm5oYXZ0YXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzUxNDcsImV4cCI6MjA4NTMxMTE0N30.xPuH5ds_uzbyXxEn1Hvn6ED_S2Hox-5vGEtL6vYi_ow";

function getEnvOrFallback(envKey: string, fallback: string, label: string): string {
  const value = import.meta.env[envKey];
  if (!value) {
    console.warn(
      `[Supabase] Variável de ambiente ${envKey} não encontrada. ` +
      `Usando ${label} de fallback. Configure a variável em .env para produção.`
    );
    return fallback;
  }
  return value;
}

const supabaseUrl = getEnvOrFallback('VITE_SUPABASE_URL', FALLBACK_URL, 'URL');
const supabaseKey = getEnvOrFallback('VITE_SUPABASE_PUBLISHABLE_KEY', FALLBACK_KEY, 'anon key');

/** Indica se o client está usando valores de fallback (útil para debugging) */
export const isUsingFallback =
  !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Client Supabase configurado para a aplicação */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
