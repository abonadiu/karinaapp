/**
 * Professional Zodiac Wheel Renderer (Browser Canvas)
 * Generates a high-quality natal chart wheel image using HTML5 Canvas API.
 * Returns a base64 PNG data URL for embedding in PDFs.
 */

import type { AstralChartResult } from './astral-chart-calculator';

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  primary: '#2D1B69',
  accent: '#8C64A0',
  background: 'transparent',
  white: '#FFFFFF',
  text: '#333333',
  lightGray: '#D8DAE4',
  mediumGray: '#A0A4B8',
  darkGray: '#444460',
};

const ELEMENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  fire: { bg: '#FFD4C4', border: '#E74C3C', text: '#C0392B' },
  earth: { bg: '#B8E6B8', border: '#27AE60', text: '#1E8449' },
  air: { bg: '#D6C8E8', border: '#8E44AD', text: '#6C3483' },
  water: { bg: '#B0D4F1', border: '#2980B9', text: '#1F618D' },
};

const ASPECT_COLORS: Record<string, { color: string; width: number }> = {
  conjunction: { color: '#FFD700', width: 2.5 },
  opposition: { color: '#E74C3C', width: 2.5 },
  trine: { color: '#2ECC71', width: 2.5 },
  square: { color: '#E74C3C', width: 2.0 },
  sextile: { color: '#3498DB', width: 1.8 },
};

const SIGNS = [
  { key: 'aries', label: 'Áries', element: 'fire' },
  { key: 'taurus', label: 'Touro', element: 'earth' },
  { key: 'gemini', label: 'Gêmeos', element: 'air' },
  { key: 'cancer', label: 'Câncer', element: 'water' },
  { key: 'leo', label: 'Leão', element: 'fire' },
  { key: 'virgo', label: 'Virgem', element: 'earth' },
  { key: 'libra', label: 'Libra', element: 'air' },
  { key: 'scorpio', label: 'Escorp.', element: 'water' },
  { key: 'sagittarius', label: 'Sagit.', element: 'fire' },
  { key: 'capricorn', label: 'Capric.', element: 'earth' },
  { key: 'aquarius', label: 'Aquário', element: 'air' },
  { key: 'pisces', label: 'Peixes', element: 'water' },
];

const PLANET_SHORT: Record<string, string> = {
  sun: 'SO', moon: 'LU', mercury: 'ME', venus: 'VE', mars: 'MA',
  jupiter: 'JU', saturn: 'SA', uranus: 'UR', neptune: 'NE', pluto: 'PL',
};

const PLANET_COLORS: Record<string, string> = {
  sun: '#E67E22', moon: '#5D6D7E', mercury: '#D35400', venus: '#C2185B',
  mars: '#C0392B', jupiter: '#8E44AD', saturn: '#2C3E50', uranus: '#0097A7',
  neptune: '#283593', pluto: '#5D4037',
};

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

// ============================================================
// HELPERS
// ============================================================

function eclipticToAngle(eclipticDeg: number, ascDeg: number): number {
  const offset = eclipticDeg - ascDeg;
  return (180 - offset) * (Math.PI / 180);
}

function polarToCartesian(cx: number, cy: number, radius: number, angleRad: number) {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, strokeColor?: string, lineWidth?: number, fillColor?: string) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
  if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth || 1; ctx.stroke(); }
}

function drawRingSegment(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number, fillColor?: string, strokeColor?: string, lineWidth?: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, startAngle, endAngle);
  ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
  ctx.closePath();
  if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
  if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth || 1; ctx.stroke(); }
}

function drawCenteredText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, radius: number, angle: number, fontSize: number, color: string, bold: boolean) {
  const pos = polarToCartesian(cx, cy, radius, angle);
  ctx.save();
  ctx.font = `${bold ? 'bold ' : ''}${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, pos.x, pos.y);
  ctx.restore();
}

// ============================================================
// MAIN RENDER FUNCTION
// ============================================================

export function renderZodiacWheelToDataURL(result: AstralChartResult): string {
  const SIZE = 1300;
  const CENTER = SIZE / 2;
  const OUTER_RADIUS = SIZE / 2 - 60;
  const SIGN_RING_INNER = OUTER_RADIUS - 55;
  const HOUSE_RING_INNER = SIGN_RING_INNER - 20;
  const PLANET_RING = HOUSE_RING_INNER - 35;
  const ASPECT_RADIUS = PLANET_RING - 40;
  const INNER_CIRCLE = ASPECT_RADIUS;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const ascDeg = result.ascendant.eclipticDegree;

  // ---- BACKGROUND (transparent) ----
  ctx.clearRect(0, 0, SIZE, SIZE);

  // ---- CIRCLES ----
  drawCircle(ctx, CENTER, CENTER, OUTER_RADIUS, COLORS.primary, 3.5);
  drawCircle(ctx, CENTER, CENTER, SIGN_RING_INNER, COLORS.primary, 2.5);
  drawCircle(ctx, CENTER, CENTER, HOUSE_RING_INNER, COLORS.mediumGray, 1.2);
  drawCircle(ctx, CENTER, CENTER, INNER_CIRCLE, COLORS.lightGray, 0.8);

  // ---- SIGN RING ----
  for (let i = 0; i < 12; i++) {
    const sign = SIGNS[i];
    const signStartDeg = i * 30;
    const signEndDeg = (i + 1) * 30;
    const startAngle = eclipticToAngle(signStartDeg, ascDeg);
    const endAngle = eclipticToAngle(signEndDeg, ascDeg);
    const elementColor = ELEMENT_COLORS[sign.element];

    drawRingSegment(ctx, CENTER, CENTER, OUTER_RADIUS, SIGN_RING_INNER, endAngle, startAngle, elementColor.bg, elementColor.border, 1.5);

    const outerPoint = polarToCartesian(CENTER, CENTER, OUTER_RADIUS, startAngle);
    const innerPoint = polarToCartesian(CENTER, CENTER, SIGN_RING_INNER, startAngle);
    drawLine(ctx, outerPoint.x, outerPoint.y, innerPoint.x, innerPoint.y, elementColor.border, 1.5);

    const midAngle = eclipticToAngle(signStartDeg + 15, ascDeg);
    const labelRadius = (OUTER_RADIUS + SIGN_RING_INNER) / 2;
    drawCenteredText(ctx, sign.label, CENTER, CENTER, labelRadius, midAngle, 20, elementColor.text, true);
  }

  drawCircle(ctx, CENTER, CENTER, OUTER_RADIUS, COLORS.primary, 3.5);
  drawCircle(ctx, CENTER, CENTER, SIGN_RING_INNER, COLORS.primary, 2.5);

  // ---- DEGREE TICKS ----
  for (let deg = 0; deg < 360; deg++) {
    const angle = eclipticToAngle(deg, ascDeg);
    const isMajor = deg % 30 === 0;
    const isMinor5 = deg % 5 === 0;
    const outerR = SIGN_RING_INNER;
    const innerR = isMajor ? SIGN_RING_INNER - 8 : isMinor5 ? SIGN_RING_INNER - 5 : SIGN_RING_INNER - 3;
    const p1 = polarToCartesian(CENTER, CENTER, outerR, angle);
    const p2 = polarToCartesian(CENTER, CENTER, innerR, angle);
    const tickColor = isMajor ? COLORS.primary : isMinor5 ? COLORS.darkGray : COLORS.mediumGray;
    const tickWidth = isMajor ? 2.5 : 0.8;
    drawLine(ctx, p1.x, p1.y, p2.x, p2.y, tickColor, tickWidth);
  }

  // ---- HOUSE CUSPS ----
  const houses = result.houses;
  for (let i = 0; i < houses.length; i++) {
    const house = houses[i];
    const angle = eclipticToAngle(house.eclipticDegreeStart, ascDeg);
    const isAngular = [1, 4, 7, 10].includes(house.id);
    const p1 = polarToCartesian(CENTER, CENTER, SIGN_RING_INNER, angle);
    const p2 = polarToCartesian(CENTER, CENTER, isAngular ? 25 : INNER_CIRCLE, angle);
    drawLine(ctx, p1.x, p1.y, p2.x, p2.y, isAngular ? COLORS.primary : COLORS.mediumGray, isAngular ? 3 : 1.2);

    // House number
    const nextHouse = houses[(i + 1) % 12];
    let midDeg = (house.eclipticDegreeStart + nextHouse.eclipticDegreeStart) / 2;
    if (nextHouse.eclipticDegreeStart < house.eclipticDegreeStart) {
      midDeg = (house.eclipticDegreeStart + nextHouse.eclipticDegreeStart + 360) / 2;
      if (midDeg >= 360) midDeg -= 360;
    }
    const houseAngle = eclipticToAngle(midDeg, ascDeg);
    const houseNumRadius = (HOUSE_RING_INNER + INNER_CIRCLE) / 2;
    drawCenteredText(ctx, `${house.id}`, CENTER, CENTER, houseNumRadius, houseAngle, 24, COLORS.darkGray, true);
  }

  // ---- ASC / MC / DSC / IC LABELS ----
  const ascAngle = eclipticToAngle(ascDeg, ascDeg);
  const mcAngle = eclipticToAngle(result.midheaven.eclipticDegree, ascDeg);
  const dscAngle = eclipticToAngle(ascDeg + 180, ascDeg);
  const icAngle = eclipticToAngle(result.midheaven.eclipticDegree + 180, ascDeg);

  const angularLabels = [
    { text: 'ASC', angle: ascAngle },
    { text: 'MC', angle: mcAngle },
    { text: 'DSC', angle: dscAngle },
    { text: 'IC', angle: icAngle },
  ];

  angularLabels.forEach(({ text, angle }) => {
    const pos = polarToCartesian(CENTER, CENTER, OUTER_RADIUS + 28, angle);
    ctx.save();
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = COLORS.primary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pos.x, pos.y);
    ctx.restore();
  });

  // ---- ASPECT LINES ----
  result.aspects.forEach(aspect => {
    const planet1 = result.planets.find(p => p.key === aspect.point1);
    const planet2 = result.planets.find(p => p.key === aspect.point2);
    if (!planet1 || !planet2) return;

    const angle1 = eclipticToAngle(planet1.eclipticDegree, ascDeg);
    const angle2 = eclipticToAngle(planet2.eclipticDegree, ascDeg);
    const p1 = polarToCartesian(CENTER, CENTER, ASPECT_RADIUS - 10, angle1);
    const p2 = polarToCartesian(CENTER, CENTER, ASPECT_RADIUS - 10, angle2);
    const aspectStyle = ASPECT_COLORS[aspect.type] || { color: '#999', width: 0.5 };

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = aspectStyle.color;
    ctx.lineWidth = aspectStyle.width;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  });

  // ---- PLANETS ----
  interface PlanetAngle {
    key: string;
    degree: number;
    eclipticDegree: number;
    isRetrograde: boolean;
    angle: number;
    displayRadius: number;
    collisionLevel: number;
  }

  const planetAngles: PlanetAngle[] = result.planets
    .filter(p => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(p.key))
    .map(p => ({
      key: p.key,
      degree: p.degree,
      eclipticDegree: p.eclipticDegree,
      isRetrograde: p.isRetrograde,
      angle: eclipticToAngle(p.eclipticDegree, ascDeg),
      displayRadius: PLANET_RING,
      collisionLevel: 0,
    }));

  planetAngles.sort((a, b) => a.angle - b.angle);

  const MIN_ANGLE_DIFF = 0.14;
  const radialOffsets = [0, -28, -56];
  for (let i = 0; i < planetAngles.length; i++) {
    let level = 0;
    for (let j = 0; j < i; j++) {
      let diff = Math.abs(planetAngles[i].angle - planetAngles[j].angle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff < MIN_ANGLE_DIFF) {
        level = Math.max(level, planetAngles[j].collisionLevel + 1);
      }
    }
    planetAngles[i].collisionLevel = level;
    planetAngles[i].displayRadius = PLANET_RING + (radialOffsets[Math.min(level, 2)] || -56);
  }

  planetAngles.forEach(planet => {
    const pos = polarToCartesian(CENTER, CENTER, planet.displayRadius, planet.angle);
    const color = PLANET_COLORS[planet.key] || COLORS.text;

    drawCircle(ctx, pos.x, pos.y, 22, color, 2.5, COLORS.white);

    ctx.save();
    ctx.font = 'bold 17px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(PLANET_SHORT[planet.key] || '??', pos.x, pos.y);
    ctx.restore();

    if (planet.isRetrograde) {
      ctx.save();
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#E74C3C';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', pos.x + 18, pos.y - 18);
      ctx.restore();
    }

    // Tick line
    const exactPos = polarToCartesian(CENTER, CENTER, SIGN_RING_INNER + 2, planet.angle);
    const connectPos = polarToCartesian(CENTER, CENTER, planet.displayRadius + 22, planet.angle);
    ctx.beginPath();
    ctx.moveTo(exactPos.x, exactPos.y);
    ctx.lineTo(connectPos.x, connectPos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Degree label
    const degPos = polarToCartesian(CENTER, CENTER, planet.displayRadius + 30, planet.angle);
    ctx.save();
    ctx.font = '13px sans-serif';
    ctx.fillStyle = COLORS.darkGray;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${planet.degree}°`, degPos.x, degPos.y);
    ctx.restore();
  });

  // ---- CENTER ----
  const initials = result.birthData.cityName
    ? result.birthData.cityName.split(',')[0].substring(0, 2).toUpperCase()
    : 'KB';
  drawCircle(ctx, CENTER, CENTER, 28, COLORS.primary, 3, COLORS.white);
  ctx.save();
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = COLORS.primary;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, CENTER, CENTER);
  ctx.restore();

  // Return as data URL
  return canvas.toDataURL('image/png');
}
