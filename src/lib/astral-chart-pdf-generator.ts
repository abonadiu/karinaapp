import jsPDF from 'jspdf';
import { renderZodiacWheelToDataURL } from './astral-chart-wheel-renderer';
import type {
  AstralChartResult,
  PlanetPosition,
  ElementBalance,
  ModalityBalance,
} from './astral-chart-calculator';
import {
  SIGN_SYMBOLS,
  PLANET_SYMBOLS,
  SIGN_ELEMENTS,
  ELEMENT_COLORS,
  analyzeElements,
  analyzeModalities,
  getDominantElement,
  getDominantModality,
  getElementLabel,
  getModalityLabel,
} from './astral-chart-calculator';
import {
  getPlanetInSignDescription,
  getPlanetInHouseDescription,
  getAscendantDescription,
  getMidheavenDescription,
  getAspectDescription,
  getElementDescription,
  getModalityDescription,
} from './astral-chart-descriptions';
import { ASTRO_FONT_BASE64, ASTRO_FONT_NAME, ASTRO_FONT_FILENAME } from './astro-symbols-font';

// ============================================================
// INTERFACES
// ============================================================

interface AstralChartPDFData {
  result: AstralChartResult;
  participantName: string;
  facilitatorName?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  primary: { r: 45, g: 27, b: 105 },      // #2D1B69 (roxo profundo)
  accent: { r: 99, g: 102, b: 241 },      // indigo-500
  text: { r: 51, g: 51, b: 51 },
  muted: { r: 120, g: 120, b: 140 },
  cream: { r: 250, g: 247, b: 242 },       // warm cream #FAF7F2
  white: { r: 255, g: 255, b: 255 },
  lightIndigo: { r: 238, g: 242, b: 255 },
  fire: { r: 231, g: 76, b: 60 },
  earth: { r: 39, g: 174, b: 96 },
  air: { r: 241, g: 196, b: 15 },
  water: { r: 52, g: 152, b: 219 },
  harmonious: { r: 46, g: 204, b: 113 },
  tense: { r: 231, g: 76, b: 60 },
  neutral: { r: 255, g: 215, b: 0 },
  coverBg: { r: 250, g: 247, b: 242 },    // warm cream
  coverAccent: { r: 140, g: 100, b: 160 }, // muted purple
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function registerAstroFont(doc: jsPDF) {
  doc.addFileToVFS(ASTRO_FONT_FILENAME, ASTRO_FONT_BASE64);
  doc.addFont(ASTRO_FONT_FILENAME, ASTRO_FONT_NAME, 'normal');
}

function setColor(doc: jsPDF, color: { r: number; g: number; b: number }) {
  doc.setTextColor(color.r, color.g, color.b);
}

/** Print text that may include astro symbols. Uses DejaVu subset for symbols, Helvetica for the rest. */
function textWithSymbols(doc: jsPDF, text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) {
  // Regex matching any of the astrological Unicode symbols we support
  const astroRegex = /[\u2609\u260A\u260B\u263D\u263F\u2640\u2642-\u2647\u2648-\u2653\u26B7\u26B8]/g;
  const hasSymbols = astroRegex.test(text);

  if (!hasSymbols) {
    doc.text(text, x, y, options);
    return;
  }

  // For centered/right aligned text we need to calculate total width first
  if (options?.align === 'center' || options?.align === 'right') {
    // For simplicity with aligned text, render the full text with the astro font
    // which contains the symbols and falls back gracefully for other chars
    const currentFont = doc.getFont();
    const currentSize = (doc as any).getFontSize();
    doc.setFont(ASTRO_FONT_NAME, 'normal');
    doc.text(text, x, y, options);
    doc.setFont(currentFont.fontName, currentFont.fontStyle);
    return;
  }

  // For left-aligned, split text into segments and render with appropriate font
  const segments: { text: string; isSymbol: boolean }[] = [];
  let lastIndex = 0;
  astroRegex.lastIndex = 0;
  let match;
  while ((match = astroRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isSymbol: false });
    }
    segments.push({ text: match[0], isSymbol: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isSymbol: false });
  }

  const currentFont = doc.getFont();
  let curX = x;
  for (const seg of segments) {
    if (seg.isSymbol) {
      doc.setFont(ASTRO_FONT_NAME, 'normal');
    } else {
      doc.setFont(currentFont.fontName, currentFont.fontStyle);
    }
    doc.text(seg.text, curX, y);
    curX += doc.getTextWidth(seg.text);
  }
  doc.setFont(currentFont.fontName, currentFont.fontStyle);
}

function addHeader(doc: jsPDF, section: string) {
  doc.setFillColor(COLORS.cream.r, COLORS.cream.g, COLORS.cream.b);
  doc.rect(0, 0, PAGE_WIDTH, 18, 'F');
  doc.setFontSize(8);
  setColor(doc, COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('MAPA ASTRAL', MARGIN, 11);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.muted);
  doc.text(section, PAGE_WIDTH - MARGIN, 11, { align: 'right' });
  doc.setDrawColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 18, PAGE_WIDTH - MARGIN, 18);
}

function addFooter(doc: jsPDF, participantName: string, facilitatorName: string | undefined, pageNum: number, totalPages: number) {
  const y = PAGE_HEIGHT - 12;
  doc.setDrawColor(200, 200, 210);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y - 4, PAGE_WIDTH - MARGIN, y - 4);
  doc.setFontSize(7);
  setColor(doc, COLORS.muted);
  const footerLeft = facilitatorName
    ? `Gerado por ${facilitatorName} via Karina Bonadiu`
    : 'Gerado via Karina Bonadiu';
  doc.text(footerLeft, MARGIN, y);
  doc.text(participantName, PAGE_WIDTH / 2, y, { align: 'center' });
  doc.text(`${pageNum} / ${totalPages}`, PAGE_WIDTH - MARGIN, y, { align: 'right' });
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  if (!text) return [];
  return doc.splitTextToSize(text, maxWidth);
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, section: string, participantName: string, facilitatorName: string | undefined, pageNum: { value: number }, totalPages: number): number {
  if (y + needed > PAGE_HEIGHT - 25) {
    addFooter(doc, participantName, facilitatorName, pageNum.value, totalPages);
    doc.addPage();
    pageNum.value++;
    addHeader(doc, section);
    return 28;
  }
  return y;
}

// ============================================================
// COVER PAGE
// ============================================================

function addCoverPage(doc: jsPDF, data: AstralChartPDFData, wheelDataURL?: string) {
  const { result, participantName } = data;
  const cx = PAGE_WIDTH / 2;

  // Background — warm cream
  doc.setFillColor(COLORS.coverBg.r, COLORS.coverBg.g, COLORS.coverBg.b);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // Top decorative accent line
  doc.setDrawColor(COLORS.coverAccent.r, COLORS.coverAccent.g, COLORS.coverAccent.b);
  doc.setLineWidth(0.8);
  doc.line(50, 18, PAGE_WIDTH - 50, 18);

  // Title
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('MAPA ASTRAL', cx, 35, { align: 'center' });

  // Subtitle
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.muted);
  doc.text('Carta Natal Completa', cx, 45, { align: 'center' });

  // Second accent line
  doc.setDrawColor(COLORS.coverAccent.r, COLORS.coverAccent.g, COLORS.coverAccent.b);
  doc.setLineWidth(0.4);
  doc.line(60, 50, PAGE_WIDTH - 60, 50);

  // Zodiac wheel image (centered, larger)
  if (wheelDataURL) {
    const wheelSize = 150;
    const wheelX = cx - wheelSize / 2;
    const wheelY = 56;
    doc.addImage(wheelDataURL, 'PNG', wheelX, wheelY, wheelSize, wheelSize);
  } else {
    doc.setDrawColor(COLORS.coverAccent.r, COLORS.coverAccent.g, COLORS.coverAccent.b);
    doc.setLineWidth(0.5);
    doc.circle(cx, 130, 45);
    doc.circle(cx, 130, 39);
  }

  // Accent line below wheel
  doc.setDrawColor(COLORS.coverAccent.r, COLORS.coverAccent.g, COLORS.coverAccent.b);
  doc.setLineWidth(0.4);
  doc.line(60, 214, PAGE_WIDTH - 60, 214);

  // Participant name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text(participantName.toUpperCase(), cx, 230, { align: 'center' });

  // Birth data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.muted);
  const birthLine = `${result.birthData.day}/${result.birthData.month}/${result.birthData.year}    ${String(result.birthData.hour).padStart(2, '0')}:${String(result.birthData.minute).padStart(2, '0')}`;
  doc.text(birthLine, cx, 241, { align: 'center' });
  doc.text(result.birthData.cityName, cx, 249, { align: 'center' });

  // Big Three summary — with astrological symbols (left-aligned to avoid font issues)
  const bigThreeY = 264;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  // Distribute 3 items evenly across content width
  const thirdW = CONTENT_WIDTH / 3;
  textWithSymbols(doc, `☉ Sol: ${result.sunSignLabel}`, MARGIN + thirdW * 0.15, bigThreeY);
  textWithSymbols(doc, `☽ Lua: ${result.moonSignLabel}`, MARGIN + thirdW * 1.1, bigThreeY);
  doc.text(`ASC: ${result.ascendantSignLabel}`, MARGIN + thirdW * 2.1, bigThreeY);

  // Footer branding — right aligned
  doc.setFontSize(9);
  setColor(doc, COLORS.coverAccent);
  doc.text('Karina Bonadiu', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 18, { align: 'right' });
}

// ============================================================
// MAIN GENERATOR
// ============================================================

export async function generateAstralChartPDF(data: AstralChartPDFData): Promise<void> {
  const { result, participantName, facilitatorName } = data;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Register astrological symbols font
  registerAstroFont(doc);

  const elementBalance = analyzeElements(result.planets);
  const modalityBalance = analyzeModalities(result.planets);
  const dominantElement = getDominantElement(elementBalance);
  const dominantModality = getDominantModality(modalityBalance);

  const mainPlanets = result.planets.filter(p =>
    ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(p.key)
  );

  // totalPages placeholder — will be corrected in a second pass
  let totalPages = 0;

  // ---- RENDER ZODIAC WHEEL ----
  let wheelDataURL: string | undefined;
  try {
    wheelDataURL = renderZodiacWheelToDataURL(result);
  } catch (e) {
    console.warn('Failed to render zodiac wheel for PDF:', e);
  }

  // ---- COVER PAGE ----
  addCoverPage(doc, data, wheelDataURL);

  // ---- PAGE 2: BIG THREE + OVERVIEW ----
  doc.addPage();
  const page2 = { value: 2 };
  addHeader(doc, 'Visão Geral');

  let y = 28;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('Visão Geral do Mapa', MARGIN, y);
  y += 14;

  // Ascendant
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.accent);
  textWithSymbols(doc, `Ascendente em ${result.ascendantSignLabel} ${SIGN_SYMBOLS[result.ascendantSign]}`, MARGIN, y);
  y += 8;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  const ascDesc = getAscendantDescription(result.ascendantSign) || `Ascendente em ${result.ascendantSignLabel}.`;
  const ascLines = wrapText(doc, ascDesc, CONTENT_WIDTH);
  ascLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 5;
  });
  y += 5;

  // Sun
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.accent);
  textWithSymbols(doc, `Sol em ${result.sunSignLabel} ${SIGN_SYMBOLS[result.sunSign]}`, MARGIN, y);
  y += 8;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  const sunDesc = getPlanetInSignDescription('sun', result.sunSign) || `Sol em ${result.sunSignLabel}.`;
  const sunLines = wrapText(doc, sunDesc, CONTENT_WIDTH);
  sunLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 5;
  });
  y += 5;

  // Moon
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.accent);
  textWithSymbols(doc, `Lua em ${result.moonSignLabel} ${SIGN_SYMBOLS[result.moonSign]}`, MARGIN, y);
  y += 8;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  const moonDesc = getPlanetInSignDescription('moon', result.moonSign) || `Lua em ${result.moonSignLabel}.`;
  const moonLines = wrapText(doc, moonDesc, CONTENT_WIDTH);
  moonLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 5;
  });
  y += 5;

  // Midheaven
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.accent);
  textWithSymbols(doc, `Meio do Céu em ${result.midheavenSignLabel} ${SIGN_SYMBOLS[result.midheavenSign]}`, MARGIN, y);
  y += 8;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  const mcDesc = getMidheavenDescription(result.midheavenSign) || `Meio do Céu em ${result.midheavenSignLabel}.`;
  const mcLines = wrapText(doc, mcDesc, CONTENT_WIDTH);
  mcLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 5;
  });

  addFooter(doc, participantName, facilitatorName, page2.value, totalPages);

  // ---- PLANETS PAGES ----
  const pageNum = { value: 3 };

  doc.addPage();
  addHeader(doc, 'Posições Planetárias');
  y = 28;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('Posições Planetárias', MARGIN, y);
  y += 14;

  // Planet summary table
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('Planeta', MARGIN, y);
  doc.text('Signo', MARGIN + 38, y);
  doc.text('Grau', MARGIN + 75, y);
  doc.text('Casa', MARGIN + 105, y);
  doc.text('Retro', MARGIN + 125, y);
  y += 2;
  doc.setDrawColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 5;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  mainPlanets.forEach(planet => {
    textWithSymbols(doc, `${PLANET_SYMBOLS[planet.key]} ${planet.label}`, MARGIN, y);
    textWithSymbols(doc, `${SIGN_SYMBOLS[planet.sign]} ${planet.signLabel}`, MARGIN + 38, y);
    doc.text(planet.formattedDegree, MARGIN + 75, y);
    doc.text(`${planet.house}`, MARGIN + 105, y);
    doc.text(planet.isRetrograde ? 'R' : '-', MARGIN + 125, y);
    y += 6;
  });

  y += 8;

  // Detailed planet interpretations
  mainPlanets.forEach(planet => {
    const signDesc = getPlanetInSignDescription(planet.key, planet.sign) || '';
    const houseDesc = getPlanetInHouseDescription(planet.key, planet.house) || '';
    const signLines = wrapText(doc, signDesc, CONTENT_WIDTH - 5);
    const houseLines = wrapText(doc, houseDesc, CONTENT_WIDTH - 5);
    const needed = 20 + (signLines.length + houseLines.length) * 4.5;

    y = checkPageBreak(doc, y, needed, 'Posições Planetárias', participantName, facilitatorName, pageNum, totalPages);

    // Planet title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.accent);
    const retroLabel = planet.isRetrograde ? ' (Retrógrado)' : '';
    textWithSymbols(doc, `${PLANET_SYMBOLS[planet.key]} ${planet.label} em ${planet.signLabel} — Casa ${planet.house}${retroLabel}`, MARGIN, y);
    y += 7;

    // Sign interpretation
    if (signDesc) {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      setColor(doc, COLORS.muted);
      doc.text(`${planet.label} em ${planet.signLabel}:`, MARGIN + 3, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      setColor(doc, COLORS.text);
      doc.setFontSize(10);
      signLines.forEach(line => {
        doc.text(line, MARGIN + 3, y);
        y += 4.8;
      });
      y += 2;
    }

    // House interpretation
    if (houseDesc) {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      setColor(doc, COLORS.muted);
      doc.text(`${planet.label} na Casa ${planet.house}:`, MARGIN + 3, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      setColor(doc, COLORS.text);
      doc.setFontSize(10);
      houseLines.forEach(line => {
        doc.text(line, MARGIN + 3, y);
        y += 4.8;
      });
    }

    y += 6;
  });

  addFooter(doc, participantName, facilitatorName, pageNum.value, totalPages);

  // ---- HOUSES PAGE ----
  doc.addPage();
  pageNum.value++;
  addHeader(doc, 'Casas Astrológicas');
  y = 28;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('Casas Astrológicas', MARGIN, y);
  y += 12;

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  const housesIntro = 'As 12 casas astrológicas representam diferentes áreas da vida. O signo na cúspide de cada casa indica como você vivencia os temas daquela área.';
  const housesIntroLines = wrapText(doc, housesIntro, CONTENT_WIDTH);
  housesIntroLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 5;
  });
  y += 6;

  result.houses.forEach(house => {
    y = checkPageBreak(doc, y, 15, 'Casas Astrológicas', participantName, facilitatorName, pageNum, totalPages);

    const planetsInHouse = mainPlanets.filter(p => p.house === house.id);
    const planetNames = planetsInHouse.map(p => `${PLANET_SYMBOLS[p.key] || ''} ${p.label}`).join(', ');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.accent);
    textWithSymbols(doc, `${house.label} — ${SIGN_SYMBOLS[house.sign]} ${house.signLabel}`, MARGIN, y);
    y += 6;

    if (planetsInHouse.length > 0) {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      setColor(doc, COLORS.muted);
      textWithSymbols(doc, `Planetas: ${planetNames}`, MARGIN + 3, y);
      y += 6;
    }

    y += 3;
  });

  addFooter(doc, participantName, facilitatorName, pageNum.value, totalPages);

  // ---- ASPECTS PAGE ----
  doc.addPage();
  pageNum.value++;
  addHeader(doc, 'Aspectos');
  y = 28;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('Aspectos Planetários', MARGIN, y);
  y += 12;

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  const aspectsIntro = 'Os aspectos são ângulos formados entre os planetas, indicando como suas energias interagem. Aspectos harmoniosos (trígono, sextil) facilitam, enquanto aspectos tensos (quadratura, oposição) desafiam e impulsionam o crescimento.';
  const aspectsIntroLines = wrapText(doc, aspectsIntro, CONTENT_WIDTH);
  aspectsIntroLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 5;
  });
  y += 6;

  // Aspect table header
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('Planeta 1', MARGIN, y);
  doc.text('Aspecto', MARGIN + 48, y);
  doc.text('Planeta 2', MARGIN + 90, y);
  doc.text('Orbe', MARGIN + 135, y);
  y += 2;
  doc.setDrawColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 5;

  const majorAspects = result.aspects.filter(a =>
    ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.type)
  );

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  majorAspects.slice(0, 30).forEach(aspect => {
    y = checkPageBreak(doc, y, 7, 'Aspectos', participantName, facilitatorName, pageNum, totalPages);

    const isHarmonious = ['trine', 'sextile'].includes(aspect.type);
    const isTense = ['square', 'opposition'].includes(aspect.type);
    const color = isHarmonious ? COLORS.harmonious : isTense ? COLORS.tense : COLORS.neutral;

    setColor(doc, COLORS.text);
    textWithSymbols(doc, `${PLANET_SYMBOLS[aspect.point1] || ''} ${aspect.point1Label}`, MARGIN, y);
    setColor(doc, color);
    doc.text(aspect.typeLabel, MARGIN + 48, y);
    setColor(doc, COLORS.text);
    textWithSymbols(doc, `${PLANET_SYMBOLS[aspect.point2] || ''} ${aspect.point2Label}`, MARGIN + 90, y);
    doc.text(`${aspect.orb.toFixed(1)}°`, MARGIN + 135, y);
    y += 6;
  });

  addFooter(doc, participantName, facilitatorName, pageNum.value, totalPages);

  // ---- BALANCE PAGE ----
  doc.addPage();
  pageNum.value++;
  addHeader(doc, 'Equilíbrio');
  y = 28;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('Equilíbrio Energético', MARGIN, y);
  y += 14;

  // Elements
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.accent);
  doc.text('Elementos', MARGIN, y);
  y += 8;

  const elementEntries: [string, number][] = Object.entries(elementBalance) as [string, number][];
  const elementColorMap: Record<string, { r: number; g: number; b: number }> = {
    fire: COLORS.fire,
    earth: COLORS.earth,
    air: COLORS.air,
    water: COLORS.water,
  };

  elementEntries.forEach(([element, count]) => {
    const color = elementColorMap[element] || COLORS.text;
    const barWidth = (count / 10) * (CONTENT_WIDTH - 50);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    setColor(doc, color);
    doc.text(`${getElementLabel(element)}`, MARGIN, y);
    doc.text(`${count}`, MARGIN + 30, y);

    // Bar
    doc.setFillColor(230, 230, 240);
    doc.rect(MARGIN + 40, y - 3, CONTENT_WIDTH - 50, 4, 'F');
    doc.setFillColor(color.r, color.g, color.b);
    doc.rect(MARGIN + 40, y - 3, barWidth, 4, 'F');

    y += 7;
  });

  y += 4;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.text);
  doc.text(`Elemento dominante: ${getElementLabel(dominantElement)}`, MARGIN, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const elemDesc = getElementDescription(dominantElement) || '';
  const elemLines = wrapText(doc, elemDesc, CONTENT_WIDTH);
  elemLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 4.5;
  });

  y += 10;

  // Modalities
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.accent);
  doc.text('Modalidades', MARGIN, y);
  y += 8;

  const modalityEntries: [string, number][] = Object.entries(modalityBalance) as [string, number][];
  const modalityColorMap: Record<string, { r: number; g: number; b: number }> = {
    cardinal: COLORS.fire,
    fixed: COLORS.earth,
    mutable: COLORS.water,
  };

  modalityEntries.forEach(([modality, count]) => {
    const color = modalityColorMap[modality] || COLORS.text;
    const barWidth = (count / 10) * (CONTENT_WIDTH - 50);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    setColor(doc, color);
    doc.text(`${getModalityLabel(modality)}`, MARGIN, y);
    doc.text(`${count}`, MARGIN + 30, y);

    doc.setFillColor(230, 230, 240);
    doc.rect(MARGIN + 40, y - 3, CONTENT_WIDTH - 50, 4, 'F');
    doc.setFillColor(color.r, color.g, color.b);
    doc.rect(MARGIN + 40, y - 3, barWidth, 4, 'F');

    y += 7;
  });

  y += 4;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.text);
  doc.text(`Modalidade dominante: ${getModalityLabel(dominantModality)}`, MARGIN, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const modDesc = getModalityDescription(dominantModality) || '';
  const modLines = wrapText(doc, modDesc, CONTENT_WIDTH);
  modLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 4.5;
  });

  addFooter(doc, participantName, facilitatorName, pageNum.value, totalPages);

  // ---- LAST PAGE: ABOUT ----
  doc.addPage();
  pageNum.value++;
  addHeader(doc, 'Sobre');
  y = 28;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.primary);
  doc.text('Sobre o Mapa Astral', MARGIN, y);
  y += 12;

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);

  const aboutTexts = [
    'O Mapa Astral, também chamado de Carta Natal, é uma representação do céu no exato momento e local do seu nascimento. Ele mostra as posições dos planetas nos signos do zodíaco e nas casas astrológicas, formando um mapa único da sua personalidade.',
    'Este relatório utiliza o sistema de casas Placidus e o zodíaco tropical, que são os mais utilizados na astrologia ocidental moderna. Os cálculos são baseados em efemérides astronômicas precisas.',
    'Os planetas representam diferentes facetas da personalidade: o Sol é a essência, a Lua são as emoções, Mercúrio é a comunicação, Vênus é o amor, Marte é a ação, Júpiter é a expansão, Saturno é a disciplina, Urano é a inovação, Netuno é a intuição e Plutão é a transformação.',
    'Os signos mostram COMO essas energias se expressam, enquanto as casas indicam EM QUE ÁREA DA VIDA elas se manifestam. Os aspectos revelam como os planetas interagem entre si, criando harmonias e tensões que moldam a experiência de vida.',
    'Este mapa é uma ferramenta de autoconhecimento e não deve ser interpretado como determinismo. Ele revela tendências e potenciais, mas cada pessoa tem o livre-arbítrio para escolher como expressar essas energias.',
  ];

  aboutTexts.forEach(text => {
    const lines = wrapText(doc, text, CONTENT_WIDTH);
    lines.forEach(line => {
      y = checkPageBreak(doc, y, 5, 'Sobre', participantName, facilitatorName, pageNum, totalPages);
      doc.text(line, MARGIN, y);
      y += 4.5;
    });
    y += 4;
  });

  y += 10;
  doc.setFontSize(8);
  setColor(doc, COLORS.muted);
  doc.text('Karina Bonadiu — Mapa Astral', PAGE_WIDTH / 2, y, { align: 'center' });

  addFooter(doc, participantName, facilitatorName, pageNum.value, totalPages);

  // ---- TWO-PASS: correct totalPages in all footers ----
  totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    // Re-draw footer with correct total (overwrite previous footer area)
    if (p > 1) { // skip cover page (no footer with page numbers)
      // Clear footer area
      doc.setFillColor(255, 255, 255);
      doc.rect(0, PAGE_HEIGHT - 18, PAGE_WIDTH, 18, 'F');
      addFooter(doc, participantName, facilitatorName, p - 1, totalPages - 1);
    }
  }

  // Save
  const safeName = participantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  doc.save(`mapa-astral-${safeName}.pdf`);
}
