// @ts-nocheck
import { Origin, Horoscope } from "circular-natal-horoscope-js";

// ============================================================
// Types
// ============================================================

export interface BirthData {
  year: number;
  month: number; // 1-12 (user-facing, converted to 0-11 internally)
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  cityName: string;
}

export interface PlanetPosition {
  key: string;
  label: string;
  sign: string;
  signLabel: string;
  degree: number;
  formattedDegree: string;
  house: number;
  isRetrograde: boolean;
  eclipticDegree: number;
}

export interface HouseCusp {
  id: number;
  label: string;
  sign: string;
  signLabel: string;
  degree: number;
  formattedDegree: string;
  eclipticDegreeStart: number;
  eclipticDegreeEnd: number;
}

export interface AspectData {
  point1: string;
  point1Label: string;
  point2: string;
  point2Label: string;
  type: string;
  typeLabel: string;
  level: string;
  orb: number;
}

export interface AngleData {
  key: string;
  label: string;
  sign: string;
  signLabel: string;
  degree: number;
  formattedDegree: string;
  eclipticDegree: number;
}

export interface AstralChartResult {
  birthData: BirthData;
  sunSign: string;
  sunSignLabel: string;
  moonSign: string;
  moonSignLabel: string;
  ascendantSign: string;
  ascendantSignLabel: string;
  midheavenSign: string;
  midheavenSignLabel: string;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: AspectData[];
  ascendant: AngleData;
  midheaven: AngleData;
}

// ============================================================
// Sign label translations (PT-BR)
// ============================================================

const SIGN_LABELS_PT: Record<string, string> = {
  aries: "Áries",
  taurus: "Touro",
  gemini: "Gêmeos",
  cancer: "Câncer",
  leo: "Leão",
  virgo: "Virgem",
  libra: "Libra",
  scorpio: "Escorpião",
  sagittarius: "Sagitário",
  capricorn: "Capricórnio",
  aquarius: "Aquário",
  pisces: "Peixes",
};

const PLANET_LABELS_PT: Record<string, string> = {
  sun: "Sol",
  moon: "Lua",
  mercury: "Mercúrio",
  venus: "Vênus",
  mars: "Marte",
  jupiter: "Júpiter",
  saturn: "Saturno",
  uranus: "Urano",
  neptune: "Netuno",
  pluto: "Plutão",
  chiron: "Quíron",
  sirius: "Sírius",
  northnode: "Nodo Norte",
  southnode: "Nodo Sul",
  lilith: "Lilith",
};

const ASPECT_LABELS_PT: Record<string, string> = {
  conjunction: "Conjunção",
  opposition: "Oposição",
  trine: "Trígono",
  square: "Quadratura",
  sextile: "Sextil",
  quincunx: "Quincúncio",
  quintile: "Quintil",
  septile: "Septil",
  "semi-square": "Semi-quadratura",
  "semi-sextile": "Semi-sextil",
};

const HOUSE_LABELS_PT: Record<number, string> = {
  1: "Casa 1 (Ascendente)",
  2: "Casa 2",
  3: "Casa 3",
  4: "Casa 4 (Fundo do Céu)",
  5: "Casa 5",
  6: "Casa 6",
  7: "Casa 7 (Descendente)",
  8: "Casa 8",
  9: "Casa 9",
  10: "Casa 10 (Meio do Céu)",
  11: "Casa 11",
  12: "Casa 12",
};

// ============================================================
// Sign symbols for the chart wheel
// ============================================================

export const SIGN_SYMBOLS: Record<string, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

export const PLANET_SYMBOLS: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  chiron: "⚷",
  northnode: "☊",
  southnode: "☋",
  lilith: "⚸",
};

export const SIGN_COLORS: Record<string, string> = {
  aries: "#E74C3C",
  taurus: "#27AE60",
  gemini: "#F1C40F",
  cancer: "#3498DB",
  leo: "#E67E22",
  virgo: "#2ECC71",
  libra: "#9B59B6",
  scorpio: "#C0392B",
  sagittarius: "#E74C3C",
  capricorn: "#34495E",
  aquarius: "#2980B9",
  pisces: "#1ABC9C",
};

export const ELEMENT_COLORS: Record<string, string> = {
  fire: "#E74C3C",
  earth: "#27AE60",
  air: "#F1C40F",
  water: "#3498DB",
};

export const SIGN_ELEMENTS: Record<string, string> = {
  aries: "fire",
  taurus: "earth",
  gemini: "air",
  cancer: "water",
  leo: "fire",
  virgo: "earth",
  libra: "air",
  scorpio: "water",
  sagittarius: "fire",
  capricorn: "earth",
  aquarius: "air",
  pisces: "water",
};

export const SIGN_MODALITIES: Record<string, string> = {
  aries: "cardinal",
  taurus: "fixed",
  gemini: "mutable",
  cancer: "cardinal",
  leo: "fixed",
  virgo: "mutable",
  libra: "cardinal",
  scorpio: "fixed",
  sagittarius: "mutable",
  capricorn: "cardinal",
  aquarius: "fixed",
  pisces: "mutable",
};

// ============================================================
// Helper functions
// ============================================================

function getSignLabel(key: string): string {
  return SIGN_LABELS_PT[key?.toLowerCase()] || key || "Desconhecido";
}

function getPlanetLabel(key: string): string {
  return PLANET_LABELS_PT[key?.toLowerCase()] || key || "Desconhecido";
}

function getAspectLabel(key: string): string {
  return ASPECT_LABELS_PT[key?.toLowerCase()] || key || "Desconhecido";
}

/**
 * Determine which house a planet is in based on ecliptic degree and house cusps.
 */
function findHouseForDegree(eclipticDegree: number, houses: any[]): number {
  for (let i = 0; i < houses.length; i++) {
    const start = houses[i].ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? 0;
    const nextIndex = (i + 1) % houses.length;
    const end = houses[nextIndex].ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? 360;

    if (start < end) {
      if (eclipticDegree >= start && eclipticDegree < end) {
        return houses[i].id || i + 1;
      }
    } else {
      // Wraps around 360°
      if (eclipticDegree >= start || eclipticDegree < end) {
        return houses[i].id || i + 1;
      }
    }
  }
  return 1;
}

// ============================================================
// Main calculation function
// ============================================================

export function calculateAstralChart(birthData: BirthData): AstralChartResult {
  const origin = new Origin({
    year: birthData.year,
    month: birthData.month - 1, // Library uses 0-indexed months
    date: birthData.day,
    hour: birthData.hour,
    minute: birthData.minute,
    latitude: birthData.latitude,
    longitude: birthData.longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies", "points", "angles"],
    aspectWithPoints: ["bodies", "points", "angles"],
    aspectTypes: ["major", "minor"],
    customOrbs: {
      conjunction: 8,
      opposition: 8,
      trine: 8,
      square: 7,
      sextile: 6,
      quincunx: 5,
      quintile: 2,
      septile: 1,
      "semi-square": 2,
      "semi-sextile": 2,
    },
    language: "en",
  });

  // Process planets (celestial bodies)
  const planets: PlanetPosition[] = [];
  const mainPlanets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

  mainPlanets.forEach((key) => {
    const body = horoscope.CelestialBodies?.[key];
    if (!body) return;

    const signKey = body.Sign?.key || "";
    const eclipticDeg = body.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0;

    planets.push({
      key,
      label: getPlanetLabel(key),
      sign: signKey,
      signLabel: getSignLabel(signKey),
      degree: body.ChartPosition?.Ecliptic?.ArcDegrees?.degrees ?? 0,
      formattedDegree: body.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 || "0° 0' 0''",
      house: findHouseForDegree(eclipticDeg, horoscope.Houses || []),
      isRetrograde: body.isRetrograde || false,
      eclipticDegree: eclipticDeg,
    });
  });

  // Process celestial points (nodes, lilith)
  const pointKeys = ["northnode", "southnode", "lilith"];
  pointKeys.forEach((key) => {
    const point = horoscope.CelestialPoints?.[key];
    if (!point) return;

    const signKey = point.Sign?.key || "";
    const eclipticDeg = point.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0;

    planets.push({
      key,
      label: getPlanetLabel(key),
      sign: signKey,
      signLabel: getSignLabel(signKey),
      degree: point.ChartPosition?.Ecliptic?.ArcDegrees?.degrees ?? 0,
      formattedDegree: point.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 || "0° 0' 0''",
      house: findHouseForDegree(eclipticDeg, horoscope.Houses || []),
      isRetrograde: false,
      eclipticDegree: eclipticDeg,
    });
  });

  // Process houses
  const houses: HouseCusp[] = (horoscope.Houses || []).map((house: any) => {
    const signKey = house.Sign?.key || "";
    return {
      id: house.id || 0,
      label: HOUSE_LABELS_PT[house.id] || `Casa ${house.id}`,
      sign: signKey,
      signLabel: getSignLabel(signKey),
      degree: house.ChartPosition?.StartPosition?.Ecliptic?.ArcDegrees?.degrees ?? 0,
      formattedDegree: house.ChartPosition?.StartPosition?.Ecliptic?.ArcDegreesFormatted30 || "0° 0' 0''",
      eclipticDegreeStart: house.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? 0,
      eclipticDegreeEnd: house.ChartPosition?.EndPosition?.Ecliptic?.DecimalDegrees ?? 0,
    };
  });

  // Process aspects (only major for display)
  const aspects: AspectData[] = (horoscope.Aspects?.all || [])
    .filter((a: any) => a.aspectLevel === "major" || a.aspectLevel === "minor")
    .map((a: any) => ({
      point1: a.point1Key || "",
      point1Label: getPlanetLabel(a.point1Key),
      point2: a.point2Key || "",
      point2Label: getPlanetLabel(a.point2Key),
      type: a.aspectKey || "",
      typeLabel: getAspectLabel(a.aspectKey),
      level: a.aspectLevel || "",
      orb: typeof a.orb === "number" ? Math.round(a.orb * 100) / 100 : 0,
    }));

  // Process angles
  const ascSignKey = horoscope.Ascendant?.Sign?.key || "";
  const mcSignKey = horoscope.Midheaven?.Sign?.key || "";

  const ascendant: AngleData = {
    key: "ascendant",
    label: "Ascendente",
    sign: ascSignKey,
    signLabel: getSignLabel(ascSignKey),
    degree: horoscope.Ascendant?.ChartPosition?.Ecliptic?.ArcDegrees?.degrees ?? 0,
    formattedDegree: horoscope.Ascendant?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 || "0° 0' 0''",
    eclipticDegree: horoscope.Ascendant?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0,
  };

  const midheaven: AngleData = {
    key: "midheaven",
    label: "Meio do Céu (MC)",
    sign: mcSignKey,
    signLabel: getSignLabel(mcSignKey),
    degree: horoscope.Midheaven?.ChartPosition?.Ecliptic?.ArcDegrees?.degrees ?? 0,
    formattedDegree: horoscope.Midheaven?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 || "0° 0' 0''",
    eclipticDegree: horoscope.Midheaven?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0,
  };

  // Get moon sign
  const moonBody = horoscope.CelestialBodies?.moon;
  const moonSignKey = moonBody?.Sign?.key || "";

  return {
    birthData,
    sunSign: horoscope.SunSign?.key || "",
    sunSignLabel: getSignLabel(horoscope.SunSign?.key || ""),
    moonSign: moonSignKey,
    moonSignLabel: getSignLabel(moonSignKey),
    ascendantSign: ascSignKey,
    ascendantSignLabel: getSignLabel(ascSignKey),
    midheavenSign: mcSignKey,
    midheavenSignLabel: getSignLabel(mcSignKey),
    planets,
    houses,
    aspects,
    ascendant,
    midheaven,
  };
}

// ============================================================
// Element & Modality analysis
// ============================================================

export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
}

export function analyzeElements(planets: PlanetPosition[]): ElementBalance {
  const balance: ElementBalance = { fire: 0, earth: 0, air: 0, water: 0 };
  const mainPlanets = planets.filter((p) =>
    ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"].includes(p.key)
  );

  mainPlanets.forEach((p) => {
    const element = SIGN_ELEMENTS[p.sign];
    if (element && element in balance) {
      balance[element as keyof ElementBalance]++;
    }
  });

  return balance;
}

export function analyzeModalities(planets: PlanetPosition[]): ModalityBalance {
  const balance: ModalityBalance = { cardinal: 0, fixed: 0, mutable: 0 };
  const mainPlanets = planets.filter((p) =>
    ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"].includes(p.key)
  );

  mainPlanets.forEach((p) => {
    const modality = SIGN_MODALITIES[p.sign];
    if (modality && modality in balance) {
      balance[modality as keyof ModalityBalance]++;
    }
  });

  return balance;
}

export function getDominantElement(balance: ElementBalance): string {
  const entries = Object.entries(balance);
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function getDominantModality(balance: ModalityBalance): string {
  const entries = Object.entries(balance);
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

const ELEMENT_LABELS_PT: Record<string, string> = {
  fire: "Fogo",
  earth: "Terra",
  air: "Ar",
  water: "Água",
};

const MODALITY_LABELS_PT: Record<string, string> = {
  cardinal: "Cardinal",
  fixed: "Fixo",
  mutable: "Mutável",
};

export function getElementLabel(key: string): string {
  return ELEMENT_LABELS_PT[key] || key;
}

export function getModalityLabel(key: string): string {
  return MODALITY_LABELS_PT[key] || key;
}
