/**
 * Unified Report PDF Generator
 * 
 * Generates a comprehensive PDF consolidating all test results
 * for a single participant, including detailed scores, cross-analysis,
 * and correlations.
 */

import jsPDF from 'jspdf';
import { ParticipantTestData } from './test-adapter';

// ==================== CONSTANTS ====================

const COLORS = {
  primary: '#335072',
  accent: '#B38F8F',
  cream: '#F2E9E4',
  dark: '#1a1a2e',
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  mediumGray: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const ADAPTER_COLORS: Record<string, string> = {
  'iq-is': '#8B5CF6',
  disc: '#E74C3C',
  mapa_da_alma: '#EC4899',
  mapa_astral: '#6366F1',
};

const DIMENSION_LABELS_CI: Record<string, string> = {
  consciencia: 'Consciência Interior',
  coerencia: 'Coerência Emocional',
  proposito: 'Propósito de Vida',
  compaixao: 'Compaixão e Empatia',
  transformacao: 'Transformação Pessoal',
};

const DISC_LABELS: Record<string, string> = {
  D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade',
};

const DISC_DESCRIPTIONS: Record<string, string> = {
  D: 'Orientado a resultados, direto, decisivo e competitivo',
  I: 'Comunicativo, entusiasta, otimista e persuasivo',
  S: 'Paciente, confiável, cooperativo e bom ouvinte',
  C: 'Analítico, preciso, sistemático e orientado a qualidade',
};

const DISC_COLORS: Record<string, string> = {
  D: '#E74C3C', I: '#F1C40F', S: '#2ECC71', C: '#3498DB',
};

const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fogo', earth: 'Terra', air: 'Ar', water: 'Água',
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#E74C3C', earth: '#8B6914', air: '#3498DB', water: '#1ABC9C',
};

const SIGN_LABELS_PT: Record<string, string> = {
  aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
  leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorpião',
  sagittarius: 'Sagitário', capricorn: 'Capricórnio', aquarius: 'Aquário', pisces: 'Peixes',
};

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

const ENERGY_CATEGORIES: Record<string, string> = {
  worldly: 'Mundano', spiritual: 'Espiritual', soul: 'Alma',
};

const ENERGY_CATEGORY_COLORS: Record<string, string> = {
  worldly: '#F59E0B', spiritual: '#8B5CF6', soul: '#EC4899',
};

const POSITION_LABELS: Record<string, string> = {
  goal: 'Objetivo', talent: 'Talento', challenge: 'Desafio',
};

// ==================== HELPERS ====================

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function normalizeDimKey(key: string): string {
  const map: Record<string, string> = {
    dominance: 'D', dominância: 'D', dominancia: 'D', d: 'D',
    influence: 'I', influência: 'I', influencia: 'I', i: 'I',
    steadiness: 'S', estabilidade: 'S', s: 'S',
    conscientiousness: 'C', conformidade: 'C', c: 'C',
  };
  return map[key.toLowerCase()] || key.toUpperCase();
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return COLORS.success;
  if (percentage >= 60) return COLORS.primary;
  if (percentage >= 40) return COLORS.warning;
  return COLORS.danger;
}

function getScoreLevel(percentage: number): string {
  if (percentage >= 80) return 'Elevado';
  if (percentage >= 60) return 'Bom';
  if (percentage >= 40) return 'Moderado';
  return 'Em Desenvolvimento';
}

// ==================== PAGE HELPERS ====================

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function checkPageBreak(doc: jsPDF, currentY: number, needed: number): number {
  if (currentY + needed > PAGE_HEIGHT - 25) {
    doc.addPage();
    return MARGIN;
  }
  return currentY;
}

function addSectionHeader(doc: jsPDF, title: string, y: number): number {
  y = checkPageBreak(doc, y, 20);
  doc.setFillColor(...hexToRgb(COLORS.primary));
  doc.rect(MARGIN, y, CONTENT_WIDTH, 12, 'F');
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN + 5, y + 8.5);
  return y + 16;
}

function addSubHeader(doc: jsPDF, title: string, y: number, color?: string): number {
  y = checkPageBreak(doc, y, 14);
  const c = color || COLORS.primary;
  doc.setFillColor(...hexToRgb(c));
  doc.rect(MARGIN, y, 3, 9, 'F');
  doc.setTextColor(...hexToRgb(COLORS.dark));
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN + 7, y + 7);
  return y + 13;
}

function addParagraph(doc: jsPDF, text: string, y: number, fontSize?: number): number {
  doc.setFontSize(fontSize || 9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(COLORS.dark));
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  for (const line of lines) {
    y = checkPageBreak(doc, y, 5);
    doc.text(line, MARGIN, y);
    y += 4.5;
  }
  return y + 2;
}

function addScoreBar(
  doc: jsPDF, label: string, value: number, maxValue: number,
  y: number, barColor: string, showPercentage?: boolean
): number {
  y = checkPageBreak(doc, y, 12);
  const percentage = (value / maxValue) * 100;
  const barWidth = CONTENT_WIDTH - 70;
  const barX = MARGIN + 55;

  // Label
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(COLORS.dark));
  doc.text(label, MARGIN, y + 4.5);

  // Background bar
  doc.setFillColor(...hexToRgb(COLORS.border));
  doc.roundedRect(barX, y, barWidth, 7, 1.5, 1.5, 'F');

  // Filled bar
  const filledWidth = Math.max(2, (percentage / 100) * barWidth);
  doc.setFillColor(...hexToRgb(barColor));
  doc.roundedRect(barX, y, filledWidth, 7, 1.5, 1.5, 'F');

  // Value text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(barColor));
  const valueText = showPercentage ? `${percentage.toFixed(0)}%` : `${value.toFixed(1)}/${maxValue}`;
  doc.text(valueText, barX + barWidth + 3, y + 5);

  return y + 10;
}

// ==================== MAIN GENERATOR ====================

export async function generateUnifiedPDF(
  data: ParticipantTestData,
  crossAnalysis: string
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentY = MARGIN;

  // Track section pages for TOC
  const tocEntries: { title: string; page: number }[] = [];

  // ==================== PAGE 1: COVER ====================
  doc.setFillColor(...hexToRgb(COLORS.primary));
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // Decorative accent line
  doc.setFillColor(...hexToRgb(COLORS.accent));
  doc.rect(0, 70, PAGE_WIDTH, 2, 'F');
  doc.rect(0, 160, PAGE_WIDTH, 1, 'F');

  // Title
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO', PAGE_WIDTH / 2, 90, { align: 'center' });
  doc.setFontSize(28);
  doc.text('UNIFICADO', PAGE_WIDTH / 2, 105, { align: 'center' });

  // Participant name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(data.participantName.toUpperCase(), PAGE_WIDTH / 2, 130, { align: 'center' });

  // Company
  if (data.company) {
    doc.setFontSize(12);
    doc.setTextColor(...hexToRgb(COLORS.accent));
    doc.text(data.company, PAGE_WIDTH / 2, 142, { align: 'center' });
  }

  // Test badges
  let badgeY = 170;
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.tests.length} testes realizados`, PAGE_WIDTH / 2, badgeY, { align: 'center' });
  badgeY += 10;

  data.tests.forEach((test, i) => {
    const color = ADAPTER_COLORS[test.slug] || COLORS.accent;
    doc.setFillColor(...hexToRgb(color));
    doc.roundedRect(MARGIN + 15, badgeY + i * 12, CONTENT_WIDTH - 30, 10, 2, 2, 'F');
    doc.setTextColor(...hexToRgb(COLORS.white));
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(test.displayName, PAGE_WIDTH / 2, badgeY + i * 12 + 6.5, { align: 'center' });
  });

  // Date
  doc.setTextColor(...hexToRgb(COLORS.accent));
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Gerado em ${today}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 40, { align: 'center' });

  // Branding
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KARINA BONADIU', PAGE_WIDTH / 2, PAGE_HEIGHT - 25, { align: 'center' });

  // ==================== PAGE 2: TABLE OF CONTENTS ====================
  doc.addPage();
  currentY = MARGIN;
  const tocPageNum = doc.getNumberOfPages();

  doc.setTextColor(...hexToRgb(COLORS.primary));
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Sumário', MARGIN, currentY + 10);
  currentY += 20;

  doc.setDrawColor(...hexToRgb(COLORS.primary));
  doc.setLineWidth(0.5);
  doc.line(MARGIN, currentY, MARGIN + CONTENT_WIDTH, currentY);
  currentY += 10;

  // Placeholder - we'll fill in page numbers later
  const tocStartY = currentY;

  // ==================== PAGE 3: EXECUTIVE SUMMARY ====================
  doc.addPage();
  currentY = MARGIN;
  tocEntries.push({ title: 'Visão Geral dos Resultados', page: doc.getNumberOfPages() });

  currentY = addSectionHeader(doc, 'Visão Geral dos Resultados', currentY);
  currentY += 2;

  for (const test of data.tests) {
    currentY = checkPageBreak(doc, currentY, 45);
    const color = ADAPTER_COLORS[test.slug] || COLORS.accent;

    // Card background
    doc.setFillColor(...hexToRgb(COLORS.lightGray));
    doc.roundedRect(MARGIN, currentY, CONTENT_WIDTH, 38, 3, 3, 'F');

    // Color bar left
    doc.setFillColor(...hexToRgb(color));
    doc.rect(MARGIN, currentY, 4, 38, 'F');

    // Test name
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(test.displayName, MARGIN + 10, currentY + 8);

    // Date
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text(`Concluído em ${new Date(test.completedAt).toLocaleDateString('pt-BR')}`, MARGIN + 10, currentY + 14);

    // Headline
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(color));
    doc.text(test.summary.headline, MARGIN + 10, currentY + 21);

    // Summary text (full, not truncated)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    const summaryLines = doc.splitTextToSize(test.summary.summary, CONTENT_WIDTH - 45);
    doc.text(summaryLines.slice(0, 4), MARGIN + 10, currentY + 27);

    // Score badge
    if (test.summary.mainScore !== undefined) {
      doc.setFillColor(...hexToRgb(color));
      doc.roundedRect(MARGIN + CONTENT_WIDTH - 30, currentY + 3, 25, 14, 3, 3, 'F');
      doc.setTextColor(...hexToRgb(COLORS.white));
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${test.summary.mainScore.toFixed(0)}%`, MARGIN + CONTENT_WIDTH - 17.5, currentY + 12, { align: 'center' });
    }

    currentY += 44;
  }

  // ==================== DETAILED TEST RESULTS ====================
  for (const test of data.tests) {
    doc.addPage();
    currentY = MARGIN;
    tocEntries.push({ title: test.displayName, page: doc.getNumberOfPages() });

    const color = ADAPTER_COLORS[test.slug] || COLORS.accent;
    currentY = addSectionHeader(doc, test.displayName, currentY);

    // Headline + summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(color));
    doc.text(test.summary.headline, MARGIN, currentY);
    currentY += 6;

    currentY = addParagraph(doc, test.summary.summary, currentY);
    currentY += 4;

    // Render detailed content based on test type
    switch (test.slug) {
      case 'iq-is':
        currentY = renderIQISDetailed(doc, test.result, currentY, color);
        break;
      case 'disc':
        currentY = renderDISCDetailed(doc, test.result, currentY, color);
        break;
      case 'mapa_da_alma':
        currentY = renderSoulPlanDetailed(doc, test.result, currentY, color);
        break;
      case 'mapa_astral':
        currentY = renderAstralChartDetailed(doc, test.result, currentY, color);
        break;
      default:
        currentY = renderGenericDetailed(doc, test, currentY, color);
        break;
    }
  }

  // ==================== CROSS ANALYSIS ====================
  if (crossAnalysis && data.tests.length >= 2) {
    doc.addPage();
    currentY = MARGIN;
    tocEntries.push({ title: 'Análise Cruzada Integrada (IA)', page: doc.getNumberOfPages() });

    currentY = addSectionHeader(doc, 'Análise Cruzada Integrada', currentY);

    // Subtitle
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text('Análise gerada por inteligência artificial combinando os resultados de todos os testes.', MARGIN, currentY);
    currentY += 8;

    // Render cross analysis text
    currentY = renderMarkdownText(doc, crossAnalysis, currentY);
  }

  // ==================== CORRELATIONS ====================
  if (data.tests.length >= 2) {
    doc.addPage();
    currentY = MARGIN;
    tocEntries.push({ title: 'Correlações entre Testes', page: doc.getNumberOfPages() });

    currentY = addSectionHeader(doc, 'Correlações entre Testes', currentY);
    currentY += 2;

    currentY = addParagraph(doc, 'A tabela abaixo mostra os temas que aparecem em múltiplos testes, indicando padrões consistentes no perfil do participante.', currentY);
    currentY += 4;

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
      const matchingTests = data.tests.filter(t => tagsByTest[t.slug].has(tag));
      if (matchingTests.length >= 2) {
        correlations.push({ tag, tests: matchingTests.map(t => t.displayName) });
      }
    });

    correlations.sort((a, b) => b.tests.length - a.tests.length);

    if (correlations.length > 0) {
      // Table header
      currentY = checkPageBreak(doc, currentY, 10);
      doc.setFillColor(...hexToRgb(COLORS.primary));
      doc.rect(MARGIN, currentY, CONTENT_WIDTH, 8, 'F');
      doc.setTextColor(...hexToRgb(COLORS.white));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Tema', MARGIN + 3, currentY + 5.5);
      doc.text('Presente em', MARGIN + 40, currentY + 5.5);
      doc.text('Testes', MARGIN + 65, currentY + 5.5);
      currentY += 8;

      correlations.slice(0, 25).forEach((corr, i) => {
        currentY = checkPageBreak(doc, currentY, 8);
        const bgColor = i % 2 === 0 ? COLORS.lightGray : COLORS.white;
        doc.setFillColor(...hexToRgb(bgColor));
        doc.rect(MARGIN, currentY, CONTENT_WIDTH, 7, 'F');

        doc.setTextColor(...hexToRgb(COLORS.dark));
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(corr.tag.charAt(0).toUpperCase() + corr.tag.slice(1), MARGIN + 3, currentY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...hexToRgb(COLORS.primary));
        doc.text(`${corr.tests.length} testes`, MARGIN + 40, currentY + 5);

        doc.setTextColor(...hexToRgb(COLORS.mediumGray));
        const testsText = corr.tests.join(', ');
        const truncated = testsText.length > 60 ? testsText.substring(0, 57) + '...' : testsText;
        doc.text(truncated, MARGIN + 65, currentY + 5);

        currentY += 7;
      });
    } else {
      currentY = addParagraph(doc, 'Não foram encontradas correlações significativas entre os testes realizados.', currentY);
    }
  }

  // ==================== KEY TRAITS SUMMARY ====================
  doc.addPage();
  currentY = MARGIN;
  tocEntries.push({ title: 'Traços-Chave do Participante', page: doc.getNumberOfPages() });

  currentY = addSectionHeader(doc, 'Traços-Chave do Participante', currentY);
  currentY += 2;

  currentY = addParagraph(doc, 'Resumo dos principais traços identificados em cada teste, organizados por categoria.', currentY);
  currentY += 4;

  for (const test of data.tests) {
    if (test.keyTraits.length === 0) continue;

    currentY = checkPageBreak(doc, currentY, 20);
    const color = ADAPTER_COLORS[test.slug] || COLORS.accent;

    currentY = addSubHeader(doc, test.displayName, currentY, color);

    for (const trait of test.keyTraits) {
      currentY = checkPageBreak(doc, currentY, 12);

      // Category badge
      doc.setFillColor(...hexToRgb(color));
      const catWidth = doc.getTextWidth(trait.category) * 0.35 + 6;
      doc.roundedRect(MARGIN, currentY, Math.max(catWidth, 18), 5, 1, 1, 'F');
      doc.setTextColor(...hexToRgb(COLORS.white));
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(trait.category, MARGIN + 2, currentY + 3.5);

      // Label
      doc.setTextColor(...hexToRgb(COLORS.dark));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(trait.label, MARGIN + Math.max(catWidth, 18) + 3, currentY + 3.5);
      currentY += 6;

      // Description
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(COLORS.mediumGray));
      const descLines = doc.splitTextToSize(trait.description, CONTENT_WIDTH - 5);
      doc.text(descLines.slice(0, 2), MARGIN + 3, currentY + 1);
      currentY += descLines.slice(0, 2).length * 3.5 + 3;
    }

    currentY += 4;
  }

  // ==================== ABOUT PAGE ====================
  doc.addPage();
  currentY = MARGIN;
  tocEntries.push({ title: 'Sobre este Relatório', page: doc.getNumberOfPages() });

  currentY = addSectionHeader(doc, 'Sobre este Relatório', currentY);
  currentY += 4;

  currentY = addParagraph(doc, 'Este Relatório Unificado consolida os resultados de múltiplos testes de autoconhecimento e desenvolvimento pessoal realizados pelo participante na plataforma Karina Bonadiu.');
  currentY += 2;
  currentY = addParagraph(doc, 'A Análise Cruzada Integrada é gerada por inteligência artificial, combinando os insights de todos os testes para identificar padrões, pontos fortes convergentes e áreas de desenvolvimento. Esta análise é uma ferramenta complementar e deve ser interpretada em conjunto com a devolutiva do facilitador.', currentY);
  currentY += 4;

  currentY = addSubHeader(doc, 'Testes incluídos neste relatório', currentY);

  data.tests.forEach(test => {
    currentY = checkPageBreak(doc, currentY, 8);
    const color = ADAPTER_COLORS[test.slug] || COLORS.accent;
    doc.setFillColor(...hexToRgb(color));
    doc.circle(MARGIN + 3, currentY + 2, 1.5, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.text(test.displayName, MARGIN + 8, currentY + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text(`— Concluído em ${new Date(test.completedAt).toLocaleDateString('pt-BR')}`, MARGIN + 8 + doc.getTextWidth(test.displayName) + 2, currentY + 3.5);
    currentY += 8;
  });

  currentY += 10;
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(COLORS.mediumGray));
  doc.text('© 2026 Karina Bonadiu. Todos os direitos reservados.', PAGE_WIDTH / 2, currentY, { align: 'center' });

  // ==================== FILL IN TABLE OF CONTENTS ====================
  doc.setPage(tocPageNum);
  let tocY = tocStartY;

  tocEntries.forEach((entry, i) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.text(entry.title, MARGIN + 5, tocY);

    // Page number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COLORS.primary));
    doc.text(String(entry.page), PAGE_WIDTH - MARGIN, tocY, { align: 'right' });

    // Dotted line
    doc.setDrawColor(...hexToRgb(COLORS.border));
    doc.setLineDashPattern([1, 1], 0);
    const textWidth = doc.getTextWidth(entry.title);
    const pageNumWidth = doc.getTextWidth(String(entry.page));
    doc.line(MARGIN + 5 + textWidth + 3, tocY - 1, PAGE_WIDTH - MARGIN - pageNumWidth - 3, tocY - 1);
    doc.setLineDashPattern([], 0);

    tocY += 8;
  });

  // ==================== ADD PAGE NUMBERS ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text(`${i} / ${totalPages}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
    doc.text('Karina Bonadiu — Relatório Unificado', MARGIN, PAGE_HEIGHT - 10);
    doc.text(data.participantName, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: 'right' });
  }

  // ==================== SAVE ====================
  const safeName = data.participantName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  doc.save(`relatorio-unificado-${safeName}.pdf`);
}

// ==================== DETAILED RENDERERS ====================

function renderIQISDetailed(doc: jsPDF, result: any, y: number, color: string): number {
  const scores = result.dimension_scores || {};
  const totalScore = Number(result.total_score || 0);
  const totalPercentage = (totalScore / 5) * 100;

  // Overall score card
  y = checkPageBreak(doc, y, 25);
  doc.setFillColor(...hexToRgb(COLORS.cream));
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 20, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(COLORS.dark));
  doc.text('Score Geral de Consciência Integral', MARGIN + 5, y + 8);
  doc.setFontSize(16);
  doc.setTextColor(...hexToRgb(getScoreColor(totalPercentage)));
  doc.text(`${totalScore.toFixed(2)} / 5.00`, MARGIN + 5, y + 16);
  doc.setFontSize(10);
  doc.text(`(${totalPercentage.toFixed(0)}%)`, MARGIN + 50, y + 16);

  // Level badge
  const level = getScoreLevel(totalPercentage);
  doc.setFillColor(...hexToRgb(getScoreColor(totalPercentage)));
  doc.roundedRect(MARGIN + CONTENT_WIDTH - 35, y + 5, 30, 10, 2, 2, 'F');
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(level, MARGIN + CONTENT_WIDTH - 20, y + 11.5, { align: 'center' });
  y += 26;

  // Dimension scores header
  y = addSubHeader(doc, 'Scores por Dimensão', y, color);

  // Sort dimensions by score (highest first)
  const sorted = Object.entries(scores)
    .map(([dim, val]) => ({ dim, score: Number(val) }))
    .sort((a, b) => b.score - a.score);

  for (const { dim, score } of sorted) {
    const label = DIMENSION_LABELS_CI[dim] || dim;
    const percentage = (score / 5) * 100;
    y = addScoreBar(doc, label, score, 5, y, getScoreColor(percentage));
  }

  y += 4;

  // Strengths and weaknesses
  if (sorted.length >= 2) {
    y = checkPageBreak(doc, y, 30);

    const strongest = sorted.slice(0, 2);
    const weakest = sorted.slice(-2).reverse();

    // Strengths
    y = addSubHeader(doc, 'Pontos Fortes', y, COLORS.success);
    for (const s of strongest) {
      y = checkPageBreak(doc, y, 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(COLORS.dark));
      doc.text(`✓ ${DIMENSION_LABELS_CI[s.dim] || s.dim}: ${s.score.toFixed(2)}/5 (${((s.score / 5) * 100).toFixed(0)}%)`, MARGIN + 3, y + 3);
      y += 6;
    }

    y += 2;

    // Areas for development
    y = addSubHeader(doc, 'Áreas de Desenvolvimento', y, COLORS.warning);
    for (const w of weakest) {
      y = checkPageBreak(doc, y, 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(COLORS.dark));
      doc.text(`→ ${DIMENSION_LABELS_CI[w.dim] || w.dim}: ${w.score.toFixed(2)}/5 (${((w.score / 5) * 100).toFixed(0)}%)`, MARGIN + 3, y + 3);
      y += 6;
    }
  }

  return y + 4;
}

function renderDISCDetailed(doc: jsPDF, result: any, y: number, color: string): number {
  const scores = result.dimension_scores || {};
  const normalized = Object.entries(scores)
    .map(([dim, val]) => ({ dim: normalizeDimKey(dim), score: Number(val) }))
    .sort((a, b) => b.score - a.score);

  const primary = normalized[0];
  const secondary = normalized[1];

  // Profile card
  y = checkPageBreak(doc, y, 25);
  doc.setFillColor(...hexToRgb(COLORS.cream));
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 20, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(COLORS.dark));
  doc.text('Perfil Comportamental DISC', MARGIN + 5, y + 8);
  doc.setFontSize(16);
  doc.setTextColor(...hexToRgb(DISC_COLORS[primary?.dim] || color));
  doc.text(`${primary?.dim || ''}${secondary?.dim || ''}`, MARGIN + 5, y + 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${DISC_LABELS[primary?.dim] || ''} - ${DISC_LABELS[secondary?.dim] || ''}`, MARGIN + 25, y + 16);
  y += 26;

  // Dimension scores
  y = addSubHeader(doc, 'Scores por Dimensão', y, color);

  for (const { dim, score } of normalized) {
    const dimColor = DISC_COLORS[dim] || color;
    y = addScoreBar(doc, `${dim} - ${DISC_LABELS[dim] || dim}`, score, 5, y, dimColor);
  }

  y += 4;

  // Profile descriptions
  y = addSubHeader(doc, 'Descrição do Perfil', y, color);

  for (const { dim, score } of normalized) {
    y = checkPageBreak(doc, y, 14);
    const isStrong = score >= 3.5;
    const dimColor = DISC_COLORS[dim] || color;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(dimColor));
    doc.text(`${DISC_LABELS[dim] || dim} (${dim}) — ${score.toFixed(1)}/5`, MARGIN + 3, y + 3);
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.dark));
    const desc = DISC_DESCRIPTIONS[dim] || '';
    const intensity = isStrong ? 'Traço forte' : score >= 2.5 ? 'Traço moderado' : 'Traço menos expressivo';
    const fullDesc = `${intensity}: ${desc}.`;
    const lines = doc.splitTextToSize(fullDesc, CONTENT_WIDTH - 10);
    doc.text(lines, MARGIN + 3, y + 2);
    y += lines.length * 4 + 4;
  }

  return y + 4;
}

function renderSoulPlanDetailed(doc: jsPDF, result: any, y: number, color: string): number {
  const soulPlanResult = result.exercises_data?.soulPlanResult;
  if (!soulPlanResult) {
    return addParagraph(doc, 'Dados detalhados do Mapa da Alma não disponíveis.', y);
  }

  // Soul Destiny card
  y = checkPageBreak(doc, y, 25);
  doc.setFillColor(...hexToRgb(COLORS.cream));
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 20, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(COLORS.dark));
  doc.text('Destino da Alma', MARGIN + 5, y + 8);
  doc.setFontSize(20);
  doc.setTextColor(...hexToRgb(color));
  doc.text(String(soulPlanResult.soulDestinyNumber || 'N/A'), MARGIN + 5, y + 17);
  if (soulPlanResult.fullName) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text(`Nome: ${soulPlanResult.fullName}`, MARGIN + 25, y + 17);
  }
  y += 26;

  // Energies Grid
  y = addSubHeader(doc, 'Mapa de Energias', y, color);

  // Table header
  y = checkPageBreak(doc, y, 12);
  doc.setFillColor(...hexToRgb(COLORS.primary));
  doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  const colWidth = CONTENT_WIDTH / 4;
  doc.text('', MARGIN + 3, y + 5.5);
  doc.text('Objetivo', MARGIN + colWidth + 3, y + 5.5);
  doc.text('Talento', MARGIN + colWidth * 2 + 3, y + 5.5);
  doc.text('Desafio', MARGIN + colWidth * 3 + 3, y + 5.5);
  y += 8;

  const categories = ['worldly', 'spiritual', 'soul'] as const;
  const positions = ['Goal', 'Talent', 'Challenge'] as const;

  categories.forEach((cat, i) => {
    y = checkPageBreak(doc, y, 10);
    const bgColor = i % 2 === 0 ? COLORS.lightGray : COLORS.white;
    doc.setFillColor(...hexToRgb(bgColor));
    doc.rect(MARGIN, y, CONTENT_WIDTH, 9, 'F');

    // Category color bar
    const catColor = ENERGY_CATEGORY_COLORS[cat] || color;
    doc.setFillColor(...hexToRgb(catColor));
    doc.rect(MARGIN, y, 3, 9, 'F');

    // Category label
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(ENERGY_CATEGORIES[cat] || cat, MARGIN + 6, y + 6);

    // Values
    doc.setFont('helvetica', 'normal');
    positions.forEach((pos, j) => {
      const key = `${cat}${pos}`;
      const energy = soulPlanResult[key];
      if (energy !== undefined && energy !== null) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...hexToRgb(catColor));
        doc.text(String(energy), MARGIN + colWidth * (j + 1) + 10, y + 6.5);
      }
    });

    y += 9;
  });

  y += 6;

  // Interpretation of energies
  y = addSubHeader(doc, 'Interpretação das Energias', y, color);

  for (const cat of categories) {
    for (const pos of positions) {
      const key = `${cat}${pos}`;
      const energy = soulPlanResult[key];
      if (energy !== undefined && energy !== null) {
        y = checkPageBreak(doc, y, 10);
        const catColor = ENERGY_CATEGORY_COLORS[cat] || color;
        const posLabel = POSITION_LABELS[pos.toLowerCase()] || pos;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...hexToRgb(catColor));
        doc.text(`${ENERGY_CATEGORIES[cat]} — ${posLabel}: Energia ${energy}`, MARGIN + 3, y + 3);
        y += 6;
      }
    }
  }

  return y + 4;
}

function renderAstralChartDetailed(doc: jsPDF, result: any, y: number, color: string): number {
  const fullResult = result.exercises_data?.fullResult;
  if (!fullResult) {
    return addParagraph(doc, 'Dados detalhados do Mapa Astral não disponíveis.', y);
  }

  // Big Three card
  y = checkPageBreak(doc, y, 30);
  doc.setFillColor(...hexToRgb(COLORS.cream));
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 28, 3, 3, 'F');

  const sunLabel = fullResult.sunSignLabel || SIGN_LABELS_PT[fullResult.sunSign] || fullResult.sunSign || 'N/A';
  const moonLabel = fullResult.moonSignLabel || SIGN_LABELS_PT[fullResult.moonSign] || fullResult.moonSign || 'N/A';
  const ascLabel = fullResult.ascendantSignLabel || SIGN_LABELS_PT[fullResult.ascendantSign] || fullResult.ascendantSign || 'N/A';

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(COLORS.dark));
  doc.text('Os Três Grandes', MARGIN + 5, y + 7);

  const thirdWidth = CONTENT_WIDTH / 3;

  // Sun
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(COLORS.mediumGray));
  doc.text('Sol (Essência)', MARGIN + 5, y + 14);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb('#F59E0B'));
  doc.text(sunLabel, MARGIN + 5, y + 22);

  // Moon
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(COLORS.mediumGray));
  doc.text('Lua (Emoções)', MARGIN + thirdWidth + 5, y + 14);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb('#8B5CF6'));
  doc.text(moonLabel, MARGIN + thirdWidth + 5, y + 22);

  // Ascendant
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(COLORS.mediumGray));
  doc.text('Ascendente (Projeção)', MARGIN + thirdWidth * 2 + 5, y + 14);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb('#EC4899'));
  doc.text(ascLabel, MARGIN + thirdWidth * 2 + 5, y + 22);

  y += 34;

  // Midheaven
  if (fullResult.midheavenSign) {
    const mcLabel = fullResult.midheavenSignLabel || SIGN_LABELS_PT[fullResult.midheavenSign] || fullResult.midheavenSign;
    y = checkPageBreak(doc, y, 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.text(`Meio do Céu (Vocação): ${mcLabel}`, MARGIN, y + 3);
    y += 8;
  }

  // Element Balance
  if (fullResult.planets && Array.isArray(fullResult.planets)) {
    y = addSubHeader(doc, 'Equilíbrio dos Elementos', y, color);

    const elementCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
    fullResult.planets.forEach((p: any) => {
      const el = SIGN_ELEMENTS[p.sign];
      if (el) elementCount[el]++;
    });

    const total = fullResult.planets.length || 1;

    for (const [el, count] of Object.entries(elementCount).sort((a, b) => b[1] - a[1])) {
      const elColor = ELEMENT_COLORS[el] || color;
      const label = `${ELEMENT_LABELS[el] || el} (${count} planetas)`;
      y = addScoreBar(doc, label, count, total, y, elColor, true);
    }

    y += 4;

    // Planets table
    y = addSubHeader(doc, 'Posições Planetárias', y, color);

    // Table header
    y = checkPageBreak(doc, y, 10);
    doc.setFillColor(...hexToRgb(COLORS.primary));
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setTextColor(...hexToRgb(COLORS.white));
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Planeta', MARGIN + 3, y + 5.5);
    doc.text('Signo', MARGIN + 40, y + 5.5);
    doc.text('Elemento', MARGIN + 80, y + 5.5);
    doc.text('Casa', MARGIN + 115, y + 5.5);
    doc.text('Grau', MARGIN + 140, y + 5.5);
    y += 8;

    const mainPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const filteredPlanets = fullResult.planets.filter((p: any) => mainPlanets.includes(p.key));

    filteredPlanets.forEach((planet: any, i: number) => {
      y = checkPageBreak(doc, y, 8);
      const bgColor = i % 2 === 0 ? COLORS.lightGray : COLORS.white;
      doc.setFillColor(...hexToRgb(bgColor));
      doc.rect(MARGIN, y, CONTENT_WIDTH, 7, 'F');

      const signLabel = SIGN_LABELS_PT[planet.sign] || planet.signLabel || planet.sign || '';
      const element = SIGN_ELEMENTS[planet.sign] || '';
      const elLabel = ELEMENT_LABELS[element] || element;
      const elColor = ELEMENT_COLORS[element] || COLORS.mediumGray;

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(COLORS.dark));
      doc.text(planet.label || planet.key || '', MARGIN + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(signLabel, MARGIN + 40, y + 5);

      doc.setTextColor(...hexToRgb(elColor));
      doc.text(elLabel, MARGIN + 80, y + 5);

      doc.setTextColor(...hexToRgb(COLORS.mediumGray));
      doc.text(planet.house ? `Casa ${planet.house}` : '', MARGIN + 115, y + 5);
      doc.text(planet.degree ? `${planet.degree}°` : '', MARGIN + 140, y + 5);

      y += 7;
    });
  }

  return y + 4;
}

function renderGenericDetailed(doc: jsPDF, test: any, y: number, color: string): number {
  // Fallback for unknown test types - show comparison metrics
  y = addSubHeader(doc, 'Métricas', y, color);

  for (const metric of test.comparisonMetrics) {
    y = addScoreBar(doc, metric.label, metric.value, metric.maxValue || 100, y, metric.color || color, true);
  }

  y += 4;

  // Key traits
  if (test.keyTraits.length > 0) {
    y = addSubHeader(doc, 'Traços-Chave', y, color);
    for (const trait of test.keyTraits) {
      y = checkPageBreak(doc, y, 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(COLORS.dark));
      doc.text(`• ${trait.label}`, MARGIN + 3, y + 3);
      y += 5;
      if (trait.description) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...hexToRgb(COLORS.mediumGray));
        const lines = doc.splitTextToSize(trait.description, CONTENT_WIDTH - 10);
        doc.text(lines.slice(0, 2), MARGIN + 6, y + 1);
        y += lines.slice(0, 2).length * 3.5 + 2;
      }
    }
  }

  return y + 4;
}

// ==================== MARKDOWN TEXT RENDERER ====================

function renderMarkdownText(doc: jsPDF, text: string, y: number): number {
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      y += 3;
      continue;
    }

    // Bold headers (full line)
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      y = checkPageBreak(doc, y, 10);
      const headerText = trimmed.replace(/\*\*/g, '');
      y += 3;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(COLORS.primary));
      doc.text(headerText, MARGIN, y);
      y += 7;
      continue;
    }

    // Regular text (strip markdown bold markers for PDF)
    const cleanText = trimmed.replace(/\*\*/g, '');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.dark));
    const wrappedLines = doc.splitTextToSize(cleanText, CONTENT_WIDTH);
    for (const wl of wrappedLines) {
      y = checkPageBreak(doc, y, 5);
      doc.text(wl, MARGIN, y);
      y += 4.5;
    }
    y += 2;
  }

  return y;
}
