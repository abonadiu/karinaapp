/**
 * Unified Report PDF Generator
 *
 * Elegant, professional PDF consolidating all test results for a participant.
 * Visual style inspired by the Astral Chart PDF: warm cream tones, clean
 * typography, generous whitespace, consistent headers/footers.
 */

import jsPDF from 'jspdf';
import { ParticipantTestData } from './test-adapter';

// ============================================================
// COLOR PALETTE
// ============================================================

type RGB = [number, number, number];

const C = {
  primary:      [45, 27, 105]   as RGB,  // deep purple
  accent:       [99, 102, 241]  as RGB,  // indigo-500
  text:         [51, 51, 51]    as RGB,
  muted:        [120, 120, 140] as RGB,
  cream:        [250, 247, 242] as RGB,  // warm cream
  white:        [255, 255, 255] as RGB,
  lightBg:      [247, 244, 240] as RGB,  // warm light
  divider:      [220, 215, 210] as RGB,
  coverAccent:  [140, 100, 160] as RGB,
  success:      [22, 163, 74]   as RGB,
  warning:      [217, 119, 6]   as RGB,
  danger:       [220, 38, 38]   as RGB,
};

const TEST_COLORS: Record<string, RGB> = {
  'iq-is':       [139, 92, 246],  // violet
  disc:          [231, 76, 60],   // red
  mapa_da_alma:  [236, 72, 153],  // pink
  mapa_astral:   [99, 102, 241],  // indigo
};

const DISC_COLORS: Record<string, RGB> = {
  D: [200, 40, 40], I: [220, 145, 20], S: [30, 145, 70], C: [40, 90, 210],
};

const ELEMENT_COLORS: Record<string, RGB> = {
  fire: [231, 76, 60], earth: [39, 174, 96], air: [241, 196, 15], water: [52, 152, 219],
};

const ENERGY_CAT_COLORS: Record<string, RGB> = {
  worldly: [217, 119, 6], spiritual: [139, 92, 246], soul: [236, 72, 153],
};

// ============================================================
// LABEL MAPS
// ============================================================

const DIM_LABELS_CI: Record<string, string> = {
  consciencia: 'Consciência Interior',
  coerencia: 'Coerência Emocional',
  proposito: 'Propósito de Vida',
  compaixao: 'Compaixão e Empatia',
  transformacao: 'Transformação Pessoal',
};

const DISC_LABELS: Record<string, string> = {
  D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade',
};

const DISC_DESC: Record<string, string> = {
  D: 'Orientado a resultados, direto, decisivo e competitivo.',
  I: 'Comunicativo, entusiasta, otimista e persuasivo.',
  S: 'Paciente, confiável, cooperativo e bom ouvinte.',
  C: 'Analítico, preciso, sistemático e orientado a qualidade.',
};

const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fogo', earth: 'Terra', air: 'Ar', water: 'Água',
};

const SIGN_LABELS: Record<string, string> = {
  aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
  leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorpião',
  sagittarius: 'Sagitário', capricorn: 'Capricórnio', aquarius: 'Aquário', pisces: 'Peixes',
};

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

const ENERGY_CATS: Record<string, string> = {
  worldly: 'Mundano', spiritual: 'Espiritual', soul: 'Alma',
};

const POS_LABELS: Record<string, string> = {
  goal: 'Objetivo', talent: 'Talento', challenge: 'Desafio',
};

// ============================================================
// LAYOUT CONSTANTS
// ============================================================

const PW = 210;
const PH = 297;
const ML = 22;
const MR = 22;
const CW = PW - ML - MR;

// ============================================================
// UTILITY HELPERS
// ============================================================

function normDiscKey(key: string): string {
  const map: Record<string, string> = {
    dominance: 'D', dominância: 'D', dominancia: 'D', d: 'D',
    influence: 'I', influência: 'I', influencia: 'I', i: 'I',
    steadiness: 'S', estabilidade: 'S', s: 'S',
    conscientiousness: 'C', conformidade: 'C', c: 'C',
  };
  return map[key.toLowerCase()] || key.toUpperCase();
}

function scoreColor(pct: number): RGB {
  if (pct >= 80) return C.success;
  if (pct >= 60) return C.accent;
  if (pct >= 40) return C.warning;
  return C.danger;
}

function scoreLevel(pct: number): string {
  if (pct >= 80) return 'Elevado';
  if (pct >= 60) return 'Bom';
  if (pct >= 40) return 'Moderado';
  return 'Em Desenvolvimento';
}

function wrap(doc: jsPDF, text: string, maxW: number): string[] {
  if (!text) return [];
  return doc.splitTextToSize(text, maxW);
}

function tc(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]); }
function fc(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function dc(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }

// ============================================================
// PAGE CHROME: HEADER + FOOTER
// ============================================================

function addHeader(doc: jsPDF, section: string) {
  fc(doc, C.cream);
  doc.rect(0, 0, PW, 18, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.primary);
  doc.text('RELATÓRIO UNIFICADO', ML, 11);
  doc.setFont('helvetica', 'normal');
  tc(doc, C.muted);
  doc.text(section, PW - MR, 11, { align: 'right' });
  dc(doc, C.accent);
  doc.setLineWidth(0.5);
  doc.line(ML, 18, PW - MR, 18);
}

function addFooter(doc: jsPDF, name: string, page: number, total: number) {
  const y = PH - 12;
  dc(doc, C.divider);
  doc.setLineWidth(0.3);
  doc.line(ML, y - 4, PW - MR, y - 4);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  tc(doc, C.muted);
  doc.text('Gerado via Karina Bonadiu', ML, y);
  doc.text(name, PW / 2, y, { align: 'center' });
  doc.text(`${page} / ${total}`, PW - MR, y, { align: 'right' });
}

// ============================================================
// PAGE BREAK HELPER
// ============================================================

interface PageCtx {
  section: string;
  name: string;
  pageNum: { value: number };
  totalPages: number;
}

function pb(doc: jsPDF, y: number, need: number, ctx: PageCtx): number {
  if (y + need > PH - 25) {
    addFooter(doc, ctx.name, ctx.pageNum.value, ctx.totalPages);
    doc.addPage();
    ctx.pageNum.value++;
    addHeader(doc, ctx.section);
    return 28;
  }
  return y;
}

// ============================================================
// DRAWING PRIMITIVES
// ============================================================

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.primary);
  doc.text(title, ML, y);
  return y + 12;
}

function subTitle(doc: jsPDF, title: string, y: number, color?: RGB): number {
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  tc(doc, color || C.accent);
  doc.text(title, ML, y);
  return y + 8;
}

function bodyText(doc: jsPDF, text: string, y: number, ctx: PageCtx, opts?: { italic?: boolean; fontSize?: number }): number {
  const fs = opts?.fontSize || 10.5;
  doc.setFontSize(fs);
  doc.setFont('helvetica', opts?.italic ? 'italic' : 'normal');
  tc(doc, C.text);
  const lines = wrap(doc, text, CW);
  for (const line of lines) {
    y = pb(doc, y, 5, ctx);
    doc.text(line, ML, y);
    y += fs * 0.45;
  }
  return y + 2;
}

function drawBar(doc: jsPDF, label: string, value: number, max: number, y: number, color: RGB, ctx: PageCtx): number {
  y = pb(doc, y, 10, ctx);
  const pct = Math.min((value / max) * 100, 100);
  const barX = ML + 58;
  const barW = CW - 75;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.text);
  doc.text(label, ML, y + 4);

  // Background
  fc(doc, [230, 228, 225]);
  doc.rect(barX, y, barW, 5, 'F');

  // Fill
  const fillW = Math.max(1, (pct / 100) * barW);
  fc(doc, color);
  doc.rect(barX, y, fillW, 5, 'F');

  // Value
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  tc(doc, color);
  doc.text(`${value.toFixed(1)}/${max}`, barX + barW + 3, y + 4);

  return y + 9;
}

function drawBarPct(doc: jsPDF, label: string, pct: number, y: number, color: RGB, ctx: PageCtx): number {
  y = pb(doc, y, 10, ctx);
  const barX = ML + 58;
  const barW = CW - 75;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.text);
  doc.text(label, ML, y + 4);

  fc(doc, [230, 228, 225]);
  doc.rect(barX, y, barW, 5, 'F');

  const fillW = Math.max(1, (Math.min(pct, 100) / 100) * barW);
  fc(doc, color);
  doc.rect(barX, y, fillW, 5, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  tc(doc, color);
  doc.text(`${pct.toFixed(0)}%`, barX + barW + 3, y + 4);

  return y + 9;
}

// ============================================================
// MARKDOWN RENDERER (for AI analysis text)
// ============================================================

function renderMarkdown(doc: jsPDF, text: string, y: number, ctx: PageCtx): number {
  const lines = text.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t === '') { y += 3; continue; }

    // Bold header line
    if (t.startsWith('**') && t.endsWith('**')) {
      y = pb(doc, y, 10, ctx);
      y += 3;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      tc(doc, C.primary);
      doc.text(t.replace(/\*\*/g, ''), ML, y);
      y += 8;
      continue;
    }

    // Regular text
    const clean = t.replace(/\*\*/g, '');
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.text);
    const wrapped = wrap(doc, clean, CW);
    for (const wl of wrapped) {
      y = pb(doc, y, 5, ctx);
      doc.text(wl, ML, y);
      y += 4.8;
    }
    y += 2;
  }
  return y;
}

// ============================================================
// COVER PAGE
// ============================================================

function addCover(doc: jsPDF, data: ParticipantTestData) {
  const cx = PW / 2;

  // Warm cream background
  fc(doc, C.cream);
  doc.rect(0, 0, PW, PH, 'F');

  // Top decorative line
  dc(doc, C.coverAccent);
  doc.setLineWidth(0.8);
  doc.line(50, 30, PW - 50, 30);

  // Title
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.primary);
  doc.text('RELATÓRIO', cx, 50, { align: 'center' });
  doc.setFontSize(26);
  doc.text('UNIFICADO', cx, 63, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  tc(doc, C.muted);
  doc.text('Consolidação de Diagnósticos', cx, 76, { align: 'center' });

  // Accent line
  dc(doc, C.coverAccent);
  doc.setLineWidth(0.4);
  doc.line(60, 82, PW - 60, 82);

  // Participant name
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.primary);
  doc.text(data.participantName.toUpperCase(), cx, 105, { align: 'center' });

  // Company
  if (data.company) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.muted);
    doc.text(data.company, cx, 116, { align: 'center' });
  }

  // Accent line
  dc(doc, C.coverAccent);
  doc.setLineWidth(0.4);
  doc.line(60, 125, PW - 60, 125);

  // Test list
  let ty = 140;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  tc(doc, C.muted);
  doc.text(`${data.tests.length} diagnósticos realizados`, cx, ty, { align: 'center' });
  ty += 12;

  data.tests.forEach((test) => {
    const color = TEST_COLORS[test.slug] || C.coverAccent;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    tc(doc, color);
    doc.text(test.displayName, cx, ty, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.muted);
    doc.text(`Concluído em ${new Date(test.completedAt).toLocaleDateString('pt-BR')}`, cx, ty + 5, { align: 'center' });
    ty += 14;
  });

  // Date
  ty = PH - 55;
  dc(doc, C.coverAccent);
  doc.setLineWidth(0.4);
  doc.line(60, ty, PW - 60, ty);

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  tc(doc, C.muted);
  doc.text(`Gerado em ${today}`, cx, ty + 12, { align: 'center' });

  // Branding
  doc.setFontSize(9);
  tc(doc, C.coverAccent);
  doc.text('Karina Bonadiu', PW - MR, PH - 18, { align: 'right' });
}

// ============================================================
// DETAILED TEST RENDERERS
// ============================================================

function renderIQIS(doc: jsPDF, result: any, y: number, ctx: PageCtx): number {
  const scores = result.dimension_scores || {};
  const total = Number(result.total_score || 0);
  const pct = (total / 5) * 100;

  // Score highlight
  y = pb(doc, y, 22, ctx);
  fc(doc, C.cream);
  doc.rect(ML, y, CW, 18, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.text);
  doc.text('Score Geral de Consciência Integral', ML + 5, y + 7);
  doc.setFontSize(18);
  tc(doc, scoreColor(pct));
  doc.text(`${total.toFixed(2)} / 5.00`, ML + 5, y + 15);
  doc.setFontSize(10);
  doc.text(`${pct.toFixed(0)}% — ${scoreLevel(pct)}`, ML + 52, y + 15);
  y += 24;

  // Dimensions
  y = subTitle(doc, 'Scores por Dimensão', y);
  const sorted = Object.entries(scores)
    .map(([dim, val]) => ({ dim, score: Number(val) }))
    .sort((a, b) => b.score - a.score);

  for (const { dim, score } of sorted) {
    const label = DIM_LABELS_CI[dim] || dim;
    y = drawBar(doc, label, score, 5, y, scoreColor((score / 5) * 100), ctx);
  }
  y += 4;

  // Strengths & development
  if (sorted.length >= 2) {
    const top2 = sorted.slice(0, 2);
    const bot2 = sorted.slice(-2).reverse();

    y = subTitle(doc, 'Pontos Fortes', y, C.success);
    for (const s of top2) {
      y = pb(doc, y, 6, ctx);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      tc(doc, C.text);
      doc.text(`${DIM_LABELS_CI[s.dim] || s.dim}: ${s.score.toFixed(2)}/5 (${((s.score / 5) * 100).toFixed(0)}%)`, ML + 3, y);
      y += 6;
    }
    y += 4;

    y = subTitle(doc, 'Áreas de Desenvolvimento', y, C.warning);
    for (const w of bot2) {
      y = pb(doc, y, 6, ctx);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      tc(doc, C.text);
      doc.text(`${DIM_LABELS_CI[w.dim] || w.dim}: ${w.score.toFixed(2)}/5 (${((w.score / 5) * 100).toFixed(0)}%)`, ML + 3, y);
      y += 6;
    }
  }

  return y + 6;
}

function renderDISC(doc: jsPDF, result: any, y: number, ctx: PageCtx): number {
  const scores = result.dimension_scores || {};
  const norm = Object.entries(scores)
    .map(([dim, val]) => ({ dim: normDiscKey(dim), score: Number(val) }))
    .sort((a, b) => b.score - a.score);

  const pri = norm[0];
  const sec = norm[1];

  // Profile highlight
  y = pb(doc, y, 22, ctx);
  fc(doc, C.cream);
  doc.rect(ML, y, CW, 18, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.text);
  doc.text('Perfil Comportamental DISC', ML + 5, y + 7);
  doc.setFontSize(18);
  tc(doc, DISC_COLORS[pri?.dim] || C.accent);
  doc.text(`${pri?.dim || ''}${sec?.dim || ''}`, ML + 5, y + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  tc(doc, C.muted);
  doc.text(`${DISC_LABELS[pri?.dim] || ''} — ${DISC_LABELS[sec?.dim] || ''}`, ML + 25, y + 15);
  y += 24;

  // Dimension bars
  y = subTitle(doc, 'Scores por Dimensão', y);
  for (const { dim, score } of norm) {
    y = drawBar(doc, `${dim} — ${DISC_LABELS[dim] || dim}`, score, 5, y, DISC_COLORS[dim] || C.accent, ctx);
  }
  y += 4;

  // Descriptions
  y = subTitle(doc, 'Descrição do Perfil', y);
  for (const { dim, score } of norm) {
    y = pb(doc, y, 16, ctx);
    const strong = score >= 3.5;
    const intensity = strong ? 'Traço forte' : score >= 2.5 ? 'Traço moderado' : 'Traço menos expressivo';

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    tc(doc, DISC_COLORS[dim] || C.accent);
    doc.text(`${DISC_LABELS[dim] || dim} (${dim}) — ${score.toFixed(1)}/5`, ML, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.text);
    const desc = `${intensity}: ${DISC_DESC[dim] || ''}`;
    const lines = wrap(doc, desc, CW - 5);
    lines.forEach(line => { doc.text(line, ML + 3, y); y += 4.8; });
    y += 4;
  }

  return y + 4;
}

function renderSoulPlan(doc: jsPDF, result: any, y: number, ctx: PageCtx): number {
  const sp = result.exercises_data?.soulPlanResult;
  if (!sp) {
    y = bodyText(doc, 'Dados detalhados do Mapa da Alma não disponíveis.', y, ctx);
    return y;
  }

  // Destiny highlight
  y = pb(doc, y, 22, ctx);
  fc(doc, C.cream);
  doc.rect(ML, y, CW, 18, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.text);
  doc.text('Destino da Alma', ML + 5, y + 7);
  doc.setFontSize(22);
  tc(doc, ENERGY_CAT_COLORS.soul);
  doc.text(String(sp.soulDestinyNumber || 'N/A'), ML + 5, y + 16);
  if (sp.fullName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.muted);
    doc.text(`Nome: ${sp.fullName}`, ML + 25, y + 16);
  }
  y += 24;

  // Energy grid
  y = subTitle(doc, 'Mapa de Energias', y);

  // Table header
  y = pb(doc, y, 10, ctx);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.primary);
  const colW = CW / 4;
  doc.text('Categoria', ML, y);
  doc.text('Objetivo', ML + colW, y);
  doc.text('Talento', ML + colW * 2, y);
  doc.text('Desafio', ML + colW * 3, y);
  y += 2;
  dc(doc, C.accent);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 5;

  const cats = ['worldly', 'spiritual', 'soul'] as const;
  const positions = ['Goal', 'Talent', 'Challenge'] as const;

  for (const cat of cats) {
    y = pb(doc, y, 8, ctx);
    const catColor = ENERGY_CAT_COLORS[cat] || C.accent;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    tc(doc, catColor);
    doc.text(ENERGY_CATS[cat] || cat, ML, y);

    doc.setFont('helvetica', 'normal');
    tc(doc, C.text);
    positions.forEach((pos, j) => {
      const key = `${cat}${pos}`;
      const energy = sp[key];
      if (energy !== undefined && energy !== null) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        tc(doc, catColor);
        doc.text(String(energy), ML + colW * (j + 1) + 10, y);
      }
    });
    y += 8;
  }

  y += 6;

  // Energy interpretations
  y = subTitle(doc, 'Interpretação das Energias', y);
  for (const cat of cats) {
    for (const pos of positions) {
      const key = `${cat}${pos}`;
      const energy = sp[key];
      if (energy !== undefined && energy !== null) {
        y = pb(doc, y, 8, ctx);
        const catColor = ENERGY_CAT_COLORS[cat] || C.accent;
        const posLabel = POS_LABELS[pos.toLowerCase()] || pos;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        tc(doc, catColor);
        doc.text(`${ENERGY_CATS[cat]} — ${posLabel}: Energia ${energy}`, ML + 3, y);
        y += 6;
      }
    }
  }

  return y + 4;
}

function renderAstralChart(doc: jsPDF, result: any, y: number, ctx: PageCtx): number {
  const fr = result.exercises_data?.fullResult;
  if (!fr) {
    y = bodyText(doc, 'Dados detalhados do Mapa Astral não disponíveis.', y, ctx);
    return y;
  }

  const sunLabel = fr.sunSignLabel || SIGN_LABELS[fr.sunSign] || fr.sunSign || 'N/A';
  const moonLabel = fr.moonSignLabel || SIGN_LABELS[fr.moonSign] || fr.moonSign || 'N/A';
  const ascLabel = fr.ascendantSignLabel || SIGN_LABELS[fr.ascendantSign] || fr.ascendantSign || 'N/A';

  // Big Three highlight
  y = pb(doc, y, 30, ctx);
  fc(doc, C.cream);
  doc.rect(ML, y, CW, 26, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  tc(doc, C.text);
  doc.text('Os Três Grandes', ML + 5, y + 7);

  const thirdW = CW / 3;
  const items = [
    { label: 'Sol (Essência)', value: sunLabel, color: [245, 158, 11] as RGB },
    { label: 'Lua (Emoções)', value: moonLabel, color: [139, 92, 246] as RGB },
    { label: 'Ascendente', value: ascLabel, color: [236, 72, 153] as RGB },
  ];

  items.forEach((item, i) => {
    const x = ML + thirdW * i + 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.muted);
    doc.text(item.label, x, y + 14);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    tc(doc, item.color);
    doc.text(item.value, x, y + 22);
  });
  y += 32;

  // Midheaven
  if (fr.midheavenSign) {
    const mcLabel = fr.midheavenSignLabel || SIGN_LABELS[fr.midheavenSign] || fr.midheavenSign;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    tc(doc, C.accent);
    doc.text(`Meio do Céu (Vocação): ${mcLabel}`, ML, y);
    y += 10;
  }

  // Element balance
  if (fr.planets && Array.isArray(fr.planets)) {
    y = subTitle(doc, 'Equilíbrio dos Elementos', y);

    const elCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
    fr.planets.forEach((p: any) => {
      const el = SIGN_ELEMENTS[p.sign];
      if (el) elCount[el]++;
    });
    const total = fr.planets.length || 1;

    for (const [el, count] of Object.entries(elCount).sort((a, b) => b[1] - a[1])) {
      const elColor = ELEMENT_COLORS[el] || C.accent;
      const label = `${ELEMENT_LABELS[el] || el} (${count})`;
      y = drawBarPct(doc, label, (count / total) * 100, y, elColor, ctx);
    }
    y += 6;

    // Planets table
    y = subTitle(doc, 'Posições Planetárias', y);
    y = pb(doc, y, 10, ctx);

    // Table header
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    tc(doc, C.primary);
    doc.text('Planeta', ML, y);
    doc.text('Signo', ML + 40, y);
    doc.text('Elemento', ML + 82, y);
    doc.text('Casa', ML + 118, y);
    doc.text('Grau', ML + 142, y);
    y += 2;
    dc(doc, C.accent);
    doc.setLineWidth(0.3);
    doc.line(ML, y, PW - MR, y);
    y += 5;

    const mainPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const filtered = fr.planets.filter((p: any) => mainPlanets.includes(p.key));

    doc.setFontSize(9.5);
    filtered.forEach((planet: any) => {
      y = pb(doc, y, 6, ctx);
      const signLabel = SIGN_LABELS[planet.sign] || planet.signLabel || planet.sign || '';
      const element = SIGN_ELEMENTS[planet.sign] || '';
      const elLabel = ELEMENT_LABELS[element] || element;
      const elColor = ELEMENT_COLORS[element] || C.muted;

      doc.setFont('helvetica', 'bold');
      tc(doc, C.text);
      doc.text(planet.label || planet.key || '', ML, y);
      doc.setFont('helvetica', 'normal');
      doc.text(signLabel, ML + 40, y);
      tc(doc, elColor);
      doc.text(elLabel, ML + 82, y);
      tc(doc, C.muted);
      doc.text(planet.house ? `Casa ${planet.house}` : '', ML + 118, y);
      doc.text(planet.degree ? `${planet.degree}°` : (planet.formattedDegree || ''), ML + 142, y);
      y += 6;
    });
  }

  return y + 4;
}

function renderGeneric(doc: jsPDF, test: any, y: number, ctx: PageCtx): number {
  y = subTitle(doc, 'Métricas', y);
  for (const metric of test.comparisonMetrics) {
    y = drawBarPct(doc, metric.label, metric.value, y, TEST_COLORS[test.slug] || C.accent, ctx);
  }
  y += 4;

  if (test.keyTraits.length > 0) {
    y = subTitle(doc, 'Traços-Chave', y);
    for (const trait of test.keyTraits) {
      y = pb(doc, y, 10, ctx);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      tc(doc, C.text);
      doc.text(`${trait.label}`, ML + 3, y);
      y += 5;
      if (trait.description) {
        doc.setFont('helvetica', 'normal');
        tc(doc, C.muted);
        const lines = wrap(doc, trait.description, CW - 5);
        lines.slice(0, 2).forEach((line: string) => { doc.text(line, ML + 5, y); y += 4.5; });
      }
      y += 2;
    }
  }

  return y + 4;
}

// ============================================================
// MAIN GENERATOR
// ============================================================

export async function generateUnifiedPDF(
  data: ParticipantTestData,
  crossAnalysis: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const tocEntries: { title: string; page: number }[] = [];

  // Placeholder for two-pass page numbering
  let totalPages = 0;
  const pageNum = { value: 1 };

  // ---- COVER ----
  addCover(doc, data);

  // ---- TABLE OF CONTENTS ----
  doc.addPage();
  pageNum.value = 2;
  addHeader(doc, 'Sumário');
  let y = 28;

  const tocPageNum = doc.getNumberOfPages();
  y = sectionTitle(doc, 'Sumário', y);
  dc(doc, C.accent);
  doc.setLineWidth(0.4);
  doc.line(ML, y - 4, PW - MR, y - 4);
  y += 4;
  const tocStartY = y;

  // ---- OVERVIEW PAGE ----
  doc.addPage();
  pageNum.value++;
  addHeader(doc, 'Visão Geral');
  y = 28;
  tocEntries.push({ title: 'Visão Geral dos Resultados', page: doc.getNumberOfPages() });

  y = sectionTitle(doc, 'Visão Geral dos Resultados', y);

  const ctx: PageCtx = { section: 'Visão Geral', name: data.participantName, pageNum, totalPages };

  for (const test of data.tests) {
    y = pb(doc, y, 40, ctx);
    const color = TEST_COLORS[test.slug] || C.coverAccent;

    // Test name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    tc(doc, color);
    doc.text(test.displayName, ML, y);
    y += 6;

    // Date
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.muted);
    doc.text(`Concluído em ${new Date(test.completedAt).toLocaleDateString('pt-BR')}`, ML, y);
    y += 6;

    // Headline
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    tc(doc, C.text);
    doc.text(test.summary.headline, ML, y);
    y += 6;

    // Summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.text);
    const summaryLines = wrap(doc, test.summary.summary, CW);
    summaryLines.slice(0, 4).forEach((line: string) => { doc.text(line, ML, y); y += 4.8; });

    // Score
    if (test.summary.mainScore !== undefined) {
      y += 2;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      tc(doc, color);
      doc.text(`${test.summary.mainScoreLabel || 'Score'}: ${test.summary.mainScore.toFixed(0)}%`, ML, y);
      y += 4;
    }

    // Separator
    y += 4;
    dc(doc, C.divider);
    doc.setLineWidth(0.2);
    doc.line(ML, y, PW - MR, y);
    y += 8;
  }

  // ---- DETAILED TEST PAGES ----
  for (const test of data.tests) {
    doc.addPage();
    pageNum.value++;
    const section = test.displayName;
    addHeader(doc, section);
    y = 28;
    tocEntries.push({ title: section, page: doc.getNumberOfPages() });

    ctx.section = section;

    y = sectionTitle(doc, section, y);

    // Intro synthesis
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'italic');
    tc(doc, C.muted);
    const introLines = wrap(doc, test.summary.summary, CW);
    introLines.forEach((line: string) => { doc.text(line, ML, y); y += 4.8; });
    y += 6;

    // Detailed rendering
    switch (test.slug) {
      case 'iq-is':
        y = renderIQIS(doc, test.result, y, ctx);
        break;
      case 'disc':
        y = renderDISC(doc, test.result, y, ctx);
        break;
      case 'mapa_da_alma':
        y = renderSoulPlan(doc, test.result, y, ctx);
        break;
      case 'mapa_astral':
        y = renderAstralChart(doc, test.result, y, ctx);
        break;
      default:
        y = renderGeneric(doc, test, y, ctx);
        break;
    }

    addFooter(doc, data.participantName, pageNum.value, totalPages);
  }

  // ---- CROSS ANALYSIS ----
  if (crossAnalysis && data.tests.length >= 2) {
    doc.addPage();
    pageNum.value++;
    addHeader(doc, 'Análise Cruzada');
    y = 28;
    tocEntries.push({ title: 'Análise Cruzada Integrada (IA)', page: doc.getNumberOfPages() });

    ctx.section = 'Análise Cruzada';

    y = sectionTitle(doc, 'Análise Cruzada Integrada', y);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    tc(doc, C.muted);
    doc.text('Análise gerada por inteligência artificial combinando os resultados de todos os diagnósticos.', ML, y);
    y += 10;

    y = renderMarkdown(doc, crossAnalysis, y, ctx);

    addFooter(doc, data.participantName, pageNum.value, totalPages);
  }

  // ---- CORRELATIONS ----
  if (data.tests.length >= 2) {
    doc.addPage();
    pageNum.value++;
    addHeader(doc, 'Correlações');
    y = 28;
    tocEntries.push({ title: 'Correlações entre Diagnósticos', page: doc.getNumberOfPages() });

    ctx.section = 'Correlações';

    y = sectionTitle(doc, 'Correlações entre Diagnósticos', y);
    y = bodyText(doc, 'A tabela abaixo mostra os temas que aparecem em múltiplos diagnósticos, indicando padrões consistentes no perfil do participante.', y, ctx, { italic: true });
    y += 4;

    // Find common tags
    const tagsByTest: Record<string, Set<string>> = {};
    data.tests.forEach(t => {
      tagsByTest[t.slug] = new Set();
      t.keyTraits.forEach(trait => {
        trait.tags.forEach(tag => tagsByTest[t.slug].add(tag));
      });
    });

    const allTags = new Set<string>();
    Object.values(tagsByTest).forEach(tags => tags.forEach(t => allTags.add(t)));

    const correlations: { tag: string; tests: string[] }[] = [];
    allTags.forEach(tag => {
      const matching = data.tests.filter(t => tagsByTest[t.slug].has(tag));
      if (matching.length >= 2) {
        correlations.push({ tag, tests: matching.map(t => t.displayName) });
      }
    });
    correlations.sort((a, b) => b.tests.length - a.tests.length);

    if (correlations.length > 0) {
      // Table header
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      tc(doc, C.primary);
      doc.text('Tema', ML, y);
      doc.text('Presente em', ML + 45, y);
      doc.text('Diagnósticos', ML + 72, y);
      y += 2;
      dc(doc, C.accent);
      doc.setLineWidth(0.3);
      doc.line(ML, y, PW - MR, y);
      y += 5;

      doc.setFontSize(9.5);
      correlations.slice(0, 25).forEach((corr) => {
        y = pb(doc, y, 7, ctx);
        doc.setFont('helvetica', 'bold');
        tc(doc, C.text);
        doc.text(corr.tag.charAt(0).toUpperCase() + corr.tag.slice(1), ML, y);
        doc.setFont('helvetica', 'normal');
        tc(doc, C.accent);
        doc.text(`${corr.tests.length} testes`, ML + 45, y);
        tc(doc, C.muted);
        const testsText = corr.tests.join(', ');
        const truncated = testsText.length > 55 ? testsText.substring(0, 52) + '...' : testsText;
        doc.text(truncated, ML + 72, y);
        y += 6;
      });
    } else {
      y = bodyText(doc, 'Não foram encontradas correlações significativas entre os diagnósticos realizados.', y, ctx);
    }

    addFooter(doc, data.participantName, pageNum.value, totalPages);
  }

  // ---- KEY TRAITS ----
  doc.addPage();
  pageNum.value++;
  addHeader(doc, 'Traços-Chave');
  y = 28;
  tocEntries.push({ title: 'Traços-Chave do Participante', page: doc.getNumberOfPages() });

  ctx.section = 'Traços-Chave';

  y = sectionTitle(doc, 'Traços-Chave do Participante', y);
  y = bodyText(doc, 'Resumo dos principais traços identificados em cada diagnóstico, organizados por categoria.', y, ctx, { italic: true });
  y += 4;

  for (const test of data.tests) {
    if (test.keyTraits.length === 0) continue;

    y = pb(doc, y, 16, ctx);
    const color = TEST_COLORS[test.slug] || C.coverAccent;

    y = subTitle(doc, test.displayName, y, color);

    for (const trait of test.keyTraits) {
      y = pb(doc, y, 12, ctx);

      // Category + label
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      tc(doc, color);
      doc.text(`${trait.category}:`, ML, y);
      tc(doc, C.text);
      const catWidth = doc.getTextWidth(`${trait.category}: `);
      doc.text(trait.label, ML + catWidth, y);
      y += 5;

      // Description
      if (trait.description) {
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        tc(doc, C.muted);
        const lines = wrap(doc, trait.description, CW - 5);
        lines.slice(0, 2).forEach((line: string) => { doc.text(line, ML + 3, y); y += 4.5; });
      }
      y += 2;
    }
    y += 6;
  }

  addFooter(doc, data.participantName, pageNum.value, totalPages);

  // ---- ABOUT ----
  doc.addPage();
  pageNum.value++;
  addHeader(doc, 'Sobre');
  y = 28;
  tocEntries.push({ title: 'Sobre este Relatório', page: doc.getNumberOfPages() });

  ctx.section = 'Sobre';

  y = sectionTitle(doc, 'Sobre este Relatório', y);

  const aboutTexts = [
    'Este Relatório Unificado consolida os resultados de múltiplos diagnósticos de autoconhecimento e desenvolvimento pessoal realizados pelo participante na plataforma Karina Bonadiu.',
    'A Análise Cruzada Integrada é gerada por inteligência artificial, combinando os insights de todos os diagnósticos para identificar padrões, pontos fortes convergentes e áreas de desenvolvimento. Esta análise é uma ferramenta complementar e deve ser interpretada em conjunto com a devolutiva do facilitador.',
    'Cada diagnóstico utiliza metodologias distintas e complementares, oferecendo diferentes perspectivas sobre o perfil do participante. A combinação dessas visões proporciona uma compreensão mais rica e integrada.',
  ];

  for (const text of aboutTexts) {
    y = bodyText(doc, text, y, ctx);
    y += 3;
  }

  y += 6;
  y = subTitle(doc, 'Diagnósticos incluídos', y);

  data.tests.forEach(test => {
    y = pb(doc, y, 8, ctx);
    const color = TEST_COLORS[test.slug] || C.coverAccent;

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    tc(doc, color);
    doc.text(test.displayName, ML, y);

    doc.setFont('helvetica', 'normal');
    tc(doc, C.muted);
    doc.text(` — Concluído em ${new Date(test.completedAt).toLocaleDateString('pt-BR')}`, ML + doc.getTextWidth(test.displayName), y);
    y += 7;
  });

  y += 12;
  doc.setFontSize(8);
  tc(doc, C.muted);
  doc.text('© 2026 Karina Bonadiu. Todos os direitos reservados.', PW / 2, y, { align: 'center' });

  addFooter(doc, data.participantName, pageNum.value, totalPages);

  // ============================================================
  // TWO-PASS: Fill TOC + correct page numbers
  // ============================================================

  totalPages = doc.getNumberOfPages();

  // Fill table of contents
  doc.setPage(tocPageNum);
  let tocY = tocStartY;

  tocEntries.forEach((entry) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    tc(doc, C.text);
    doc.text(entry.title, ML + 5, tocY);

    doc.setFont('helvetica', 'bold');
    tc(doc, C.primary);
    doc.text(String(entry.page), PW - MR, tocY, { align: 'right' });

    // Dotted separator
    dc(doc, C.divider);
    doc.setLineWidth(0.2);
    const titleW = doc.getTextWidth(entry.title);
    const pageW = doc.getTextWidth(String(entry.page));
    const dotStart = ML + 5 + titleW + 4;
    const dotEnd = PW - MR - pageW - 4;
    // Draw dots manually
    for (let x = dotStart; x < dotEnd; x += 2.5) {
      doc.circle(x, tocY - 1.5, 0.3, 'F');
    }

    tocY += 9;
  });

  // Re-draw all footers with correct total
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    // Clear footer area
    fc(doc, C.white);
    doc.rect(0, PH - 18, PW, 18, 'F');
    addFooter(doc, data.participantName, p - 1, totalPages - 1);
  }

  // ---- SAVE ----
  const safeName = data.participantName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  doc.save(`relatorio-unificado-${safeName}.pdf`);
}
