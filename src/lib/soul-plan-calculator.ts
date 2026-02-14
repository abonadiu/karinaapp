// Soul Plan Calculator
// Based on the Soul Plan system by Blue Marsden
// Converts birth name to Hebrew letter values and maps to Star of Creation positions

import { getEnergyByNumber, type SoulPlanEnergy } from './soul-plan-descriptions';

// ============================================================
// LETTER-TO-NUMBER MAPPING (Official Soul Plan System)
// ============================================================

const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 11, D: 4, E: 5, F: 17, G: 3, H: 5, I: 10,
  J: 10, K: 19, L: 12, M: 13, N: 14, O: 6, P: 17, Q: 19, R: 20,
  S: 15, T: 9, U: 6, V: 6, W: 6, X: 15, Y: 16, Z: 7,
};

// Special combinations (treated as single unit)
const COMBINATIONS: Record<string, number> = {
  AH: 5, CH: 8, SH: 21, TA: 22, TH: 22, TZ: 18, WH: 16,
};

// Final letter values (when letter is at end of a name part)
const FINAL_LETTERS: Record<string, number> = {
  M: 12, P: 12,
};

// ============================================================
// INTERFACES
// ============================================================

export interface SoulPlanPosition {
  label: string;
  labelPt: string;
  pair: string;
  energyNumber: number;
  energy: SoulPlanEnergy | undefined;
  firstPart: number;
  secondPart: number;
}

export interface SoulPlanResult {
  fullName: string;
  normalizedName: string;
  letterValues: Array<{ letter: string; value: number }>;
  isShortName: boolean;
  positions: {
    worldlyChallenge: SoulPlanPosition;
    spiritualChallenge: SoulPlanPosition;
    worldlyTalent: SoulPlanPosition;
    spiritualTalent: SoulPlanPosition;
    worldlyGoal: SoulPlanPosition;
    spiritualGoal: SoulPlanPosition;
    soulDestiny: SoulPlanPosition;
  };
  dominantEnergies: number[];
  profileSummary: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Remove accents and normalize a name for calculation
 */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '') // Keep only letters and spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Convert a name to its Hebrew letter number values
 */
export function nameToNumbers(name: string): Array<{ letter: string; value: number }> {
  const normalized = normalizeName(name);
  const parts = normalized.split(' ');
  const result: Array<{ letter: string; value: number }> = [];

  for (let p = 0; p < parts.length; p++) {
    const part = parts[p];
    let i = 0;

    while (i < part.length) {
      // Check for two-letter combinations first
      if (i + 1 < part.length) {
        const twoLetters = part[i] + part[i + 1];
        if (COMBINATIONS[twoLetters] !== undefined) {
          result.push({ letter: twoLetters, value: COMBINATIONS[twoLetters] });
          i += 2;
          continue;
        }
      }

      // Check for final letter (last letter of a name part)
      const isLastLetter = i === part.length - 1;
      const letter = part[i];

      if (isLastLetter && FINAL_LETTERS[letter] !== undefined) {
        result.push({ letter: letter + '(final)', value: FINAL_LETTERS[letter] });
      } else if (LETTER_VALUES[letter] !== undefined) {
        result.push({ letter, value: LETTER_VALUES[letter] });
      }

      i++;
    }
  }

  return result;
}

/**
 * Reduce a number to 22 or less by summing digits
 */
export function reduceToMax22(num: number): number {
  while (num > 22) {
    let sum = 0;
    let n = num;
    while (n > 0) {
      sum += n % 10;
      n = Math.floor(n / 10);
    }
    num = sum;
  }
  return num;
}

/**
 * Reduce a number to 9 or less by summing digits
 */
function reduceToMax9(num: number): number {
  while (num > 9) {
    let sum = 0;
    let n = num;
    while (n > 0) {
      sum += n % 10;
      n = Math.floor(n / 10);
    }
    num = sum;
  }
  return num;
}

/**
 * Create a pair from a reduced number
 * e.g., 7 -> "7-7", 11 -> "11-2", 10 -> "10-1"
 */
function createPair(num: number): { pair: string; firstPart: number; secondPart: number; energyNumber: number } {
  const reduced = reduceToMax22(num);

  if (reduced <= 9) {
    return {
      pair: `${reduced}-${reduced}`,
      firstPart: reduced,
      secondPart: reduced,
      energyNumber: reduced,
    };
  }

  // For 10+, second part is digit sum
  const secondPart = reduceToMax9(reduced);
  return {
    pair: `${reduced}-${secondPart}`,
    firstPart: reduced,
    secondPart,
    energyNumber: reduced,
  };
}

/**
 * Create a SoulPlanPosition from a number
 */
function createPosition(num: number, label: string, labelPt: string): SoulPlanPosition {
  const { pair, firstPart, secondPart, energyNumber } = createPair(num);
  return {
    label,
    labelPt,
    pair,
    energyNumber,
    energy: getEnergyByNumber(energyNumber),
    firstPart,
    secondPart,
  };
}

// ============================================================
// MAIN CALCULATION
// ============================================================

/**
 * Calculate the full Soul Plan from a birth name
 */
export function calculateSoulPlan(fullName: string): SoulPlanResult {
  const letterValues = nameToNumbers(fullName);
  const values = letterValues.map(lv => lv.value);
  const isShortName = values.length <= 9;

  let positions: SoulPlanResult['positions'];

  if (isShortName) {
    // Short name: 3 combined positions (worldly+spiritual share same energy)
    positions = calculateShortName(values);
  } else {
    // Long name: 6 separate positions distributed clockwise
    positions = calculateLongName(values);
  }

  // Find dominant energies (most frequent)
  const energyCounts: Record<number, number> = {};
  const allPositions = [
    positions.worldlyChallenge,
    positions.spiritualChallenge,
    positions.worldlyTalent,
    positions.spiritualTalent,
    positions.worldlyGoal,
    positions.spiritualGoal,
    positions.soulDestiny,
  ];

  for (const pos of allPositions) {
    energyCounts[pos.energyNumber] = (energyCounts[pos.energyNumber] || 0) + 1;
  }

  const dominantEnergies = Object.entries(energyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([num]) => parseInt(num));

  // Generate profile summary
  const destinyEnergy = positions.soulDestiny.energy;
  const profileSummary = destinyEnergy
    ? `Seu Destino da Alma é a energia ${destinyEnergy.pair} (${destinyEnergy.hebrewLetter}) — ${destinyEnergy.vibration}. Esta é a essência central do seu plano de alma, representando o potencial máximo que você veio manifestar nesta vida.`
    : `Seu Destino da Alma é a energia ${positions.soulDestiny.pair}.`;

  return {
    fullName,
    normalizedName: normalizeName(fullName),
    letterValues,
    isShortName,
    positions,
    dominantEnergies,
    profileSummary,
  };
}

/**
 * Calculate positions for a long name (10+ letter values)
 * Distribution order (clockwise): WC, SC, WT, ST, WG, SG, then repeat
 */
function calculateLongName(values: number[]): SoulPlanResult['positions'] {
  // Distribute values into 6 buckets
  const buckets: number[][] = [[], [], [], [], [], []];
  const positionOrder = ['WC', 'SC', 'WT', 'ST', 'WG', 'SG'];

  for (let i = 0; i < values.length; i++) {
    buckets[i % 6].push(values[i]);
  }

  // Sum each bucket and reduce
  const sums = buckets.map(b => b.reduce((a, c) => a + c, 0));
  const reduced = sums.map(s => reduceToMax22(s));

  const wc = createPosition(reduced[0], 'Worldly Challenge', 'Desafio Mundano');
  const sc = createPosition(reduced[1], 'Spiritual Challenge', 'Desafio Espiritual');
  const wt = createPosition(reduced[2], 'Worldly Talent', 'Talento Mundano');
  const st = createPosition(reduced[3], 'Spiritual Talent', 'Talento Espiritual');
  const wg = createPosition(reduced[4], 'Worldly Goal', 'Objetivo Mundano');
  const sg = createPosition(reduced[5], 'Spiritual Goal', 'Objetivo Espiritual');

  // Soul Destiny: sum of all first parts (reduce to ≤22) and all second parts (reduce to ≤9)
  const allPositions = [wc, sc, wt, st, wg, sg];
  const leftSum = allPositions.reduce((a, p) => a + p.firstPart, 0);
  const rightSum = allPositions.reduce((a, p) => a + p.secondPart, 0);
  const destinyFirst = reduceToMax22(leftSum);
  const destinySecond = reduceToMax9(rightSum);

  const soulDestiny: SoulPlanPosition = {
    label: 'Soul Destiny',
    labelPt: 'Destino da Alma',
    pair: `${destinyFirst}-${destinySecond}`,
    energyNumber: destinyFirst,
    energy: getEnergyByNumber(destinyFirst),
    firstPart: destinyFirst,
    secondPart: destinySecond,
  };

  return { worldlyChallenge: wc, spiritualChallenge: sc, worldlyTalent: wt, spiritualTalent: st, worldlyGoal: wg, spiritualGoal: sg, soulDestiny };
}

/**
 * Calculate positions for a short name (≤9 letter values)
 * Uses upward triangle: 3 combined positions
 */
function calculateShortName(values: number[]): SoulPlanResult['positions'] {
  // Distribute into 3 buckets
  const buckets: number[][] = [[], [], []];

  for (let i = 0; i < values.length; i++) {
    buckets[i % 3].push(values[i]);
  }

  const sums = buckets.map(b => b.reduce((a, c) => a + c, 0));
  const reduced = sums.map(s => reduceToMax22(s));

  // For short names, worldly and spiritual share the same energy
  const challenge = createPosition(reduced[0], 'Challenge', 'Desafio');
  const talent = createPosition(reduced[1], 'Talent', 'Talento');
  const goal = createPosition(reduced[2], 'Goal', 'Objetivo');

  // Soul Destiny for short name: sum ALL individual values, reduce to pair
  const totalSum = values.reduce((a, c) => a + c, 0);
  const destinyReduced = reduceToMax22(totalSum);
  const destinyPair = createPair(destinyReduced);

  const soulDestiny: SoulPlanPosition = {
    label: 'Soul Destiny',
    labelPt: 'Destino da Alma',
    pair: destinyPair.pair,
    energyNumber: destinyPair.energyNumber,
    energy: getEnergyByNumber(destinyPair.energyNumber),
    firstPart: destinyPair.firstPart,
    secondPart: destinyPair.secondPart,
  };

  return {
    worldlyChallenge: { ...challenge, label: 'Worldly/Spiritual Challenge', labelPt: 'Desafio Mundano/Espiritual' },
    spiritualChallenge: { ...challenge, label: 'Worldly/Spiritual Challenge', labelPt: 'Desafio Mundano/Espiritual' },
    worldlyTalent: { ...talent, label: 'Worldly/Spiritual Talent', labelPt: 'Talento Mundano/Espiritual' },
    spiritualTalent: { ...talent, label: 'Worldly/Spiritual Talent', labelPt: 'Talento Mundano/Espiritual' },
    worldlyGoal: { ...goal, label: 'Worldly/Spiritual Goal', labelPt: 'Objetivo Mundano/Espiritual' },
    spiritualGoal: { ...goal, label: 'Worldly/Spiritual Goal', labelPt: 'Objetivo Mundano/Espiritual' },
    soulDestiny,
  };
}

// ============================================================
// POSITION LABELS AND COLORS
// ============================================================

export const POSITION_COLORS: Record<string, string> = {
  worldlyChallenge: '#B8860B',
  spiritualChallenge: '#7B2D8E',
  worldlyTalent: '#B8860B',
  spiritualTalent: '#7B2D8E',
  worldlyGoal: '#B8860B',
  spiritualGoal: '#7B2D8E',
  soulDestiny: '#DAA520',
};

export const POSITION_LABELS_PT: Record<string, string> = {
  worldlyChallenge: 'Desafio Mundano',
  spiritualChallenge: 'Desafio Espiritual',
  worldlyTalent: 'Talento Mundano',
  spiritualTalent: 'Talento Espiritual',
  worldlyGoal: 'Objetivo Mundano',
  spiritualGoal: 'Objetivo Espiritual',
  soulDestiny: 'Destino da Alma',
};

/**
 * Get the interpretation text for a specific position
 */
export function getPositionInterpretation(energy: SoulPlanEnergy | undefined, positionKey: string): string {
  if (!energy) return '';

  switch (positionKey) {
    case 'worldlyChallenge':
      return energy.worldlyChallenge || energy.challengeDescription;
    case 'spiritualChallenge':
      return energy.spiritualChallenge || energy.challengeDescription;
    case 'worldlyTalent':
      return energy.worldlyTalent || energy.positiveDescription;
    case 'spiritualTalent':
      return energy.spiritualTalent || energy.positiveDescription;
    case 'worldlyGoal':
      return energy.worldlyGoal || energy.positiveDescription;
    case 'spiritualGoal':
      return energy.spiritualGoal || energy.positiveDescription;
    case 'soulDestiny':
      return energy.soulDestiny || energy.positiveDescription;
    default:
      return energy.positiveDescription;
  }
}
