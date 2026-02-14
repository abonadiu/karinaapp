import { DimensionScore } from "./diagnostic-scoring";

/**
 * Maps database slug names to the formatted names used by all content modules
 * (dimension-descriptions, cross-analysis, executive-summary, action-plan, recommendations).
 *
 * The database stores dimensions as slugs (e.g. "conexao_proposito"),
 * but all content modules use formatted names (e.g. "Conexão e Propósito").
 */
const DIMENSION_SLUG_MAP: Record<string, string> = {
  // Slug variants from the database
  "conexao_proposito": "Conexão e Propósito",
  "conexao_e_proposito": "Conexão e Propósito",
  "consciencia_interior": "Consciência Interior",
  "coerencia_emocional": "Coerência Emocional",
  "relacoes_compaixao": "Relações e Compaixão",
  "relacoes_e_compaixao": "Relações e Compaixão",
  "transformacao_crescimento": "Transformação",
  "transformacao_e_crescimento": "Transformação",
  "transformacao": "Transformação",
  // Already-formatted names map to themselves (idempotent)
  "Conexão e Propósito": "Conexão e Propósito",
  "Consciência Interior": "Consciência Interior",
  "Coerência Emocional": "Coerência Emocional",
  "Relações e Compaixão": "Relações e Compaixão",
  "Transformação": "Transformação",
};

/**
 * Normalizes a dimension name from any format (slug or formatted) to the
 * canonical formatted name used by all content modules.
 * Uses 3 levels of matching: direct, lowercase, and fuzzy (accent-stripped).
 */
export function normalizeDimensionName(name: string): string {
  // Direct lookup
  if (DIMENSION_SLUG_MAP[name]) return DIMENSION_SLUG_MAP[name];
  // Try lowercase
  const lower = name.toLowerCase().trim();
  if (DIMENSION_SLUG_MAP[lower]) return DIMENSION_SLUG_MAP[lower];
  // Fuzzy match: remove accents and compare
  const stripAccents = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
  const normalizedInput = stripAccents(name);
  for (const [key, value] of Object.entries(DIMENSION_SLUG_MAP)) {
    if (stripAccents(key) === normalizedInput) return value;
  }
  // Last resort: return original
  return name;
}

/**
 * Normalizes all dimension scores in an array, converting slug names to
 * formatted names and recalculating percentage if it's 0 or missing.
 */
export function normalizeDimensionScores(scores: DimensionScore[]): DimensionScore[] {
  return scores.map((s) => ({
    ...s,
    dimension: normalizeDimensionName(s.dimension),
    percentage: s.percentage > 0 ? s.percentage : (s.score / (s.maxScore || 5)) * 100,
  }));
}
