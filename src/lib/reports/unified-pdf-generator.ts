/**
 * Unified Report PDF Generator
 * 
 * Generates a comprehensive PDF consolidating all test results
 * for a single participant, including cross-analysis.
 */

import jsPDF from 'jspdf';
import { ParticipantTestData } from './test-adapter';

const COLORS = {
  primary: '#335072',
  accent: '#B38F8F',
  cream: '#F2E9E4',
  dark: '#1a1a2e',
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  mediumGray: '#6B7280',
  border: '#E5E7EB',
};

const ADAPTER_COLORS: Record<string, string> = {
  iq_is: '#8B5CF6',
  disc: '#E74C3C',
  mapa_da_alma: '#EC4899',
  mapa_astral: '#6366F1',
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

export async function generateUnifiedPDF(
  data: ParticipantTestData,
  crossAnalysis: string
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // ==================== COVER PAGE ====================
  // Background
  doc.setFillColor(...hexToRgb(COLORS.primary));
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative circle
  doc.setFillColor(...hexToRgb(COLORS.accent));
  doc.setGlobalAlpha?.(0.1);
  doc.circle(pageWidth / 2, 120, 60, 'F');
  doc.setGlobalAlpha?.(1);

  // Title
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO', pageWidth / 2, 80, { align: 'center' });
  doc.text('UNIFICADO', pageWidth / 2, 95, { align: 'center' });

  // Participant name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(data.participantName.toUpperCase(), pageWidth / 2, 130, { align: 'center' });

  // Company
  if (data.company) {
    doc.setFontSize(12);
    doc.text(data.company, pageWidth / 2, 142, { align: 'center' });
  }

  // Test badges
  let badgeY = 165;
  doc.setFontSize(10);
  doc.text('Testes Realizados:', pageWidth / 2, badgeY, { align: 'center' });
  badgeY += 10;

  data.tests.forEach((test, i) => {
    const color = ADAPTER_COLORS[test.slug] || COLORS.accent;
    doc.setFillColor(...hexToRgb(color));
    doc.roundedRect(margin + 10, badgeY + i * 12, contentWidth - 20, 10, 2, 2, 'F');
    doc.setTextColor(...hexToRgb(COLORS.white));
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(test.displayName, pageWidth / 2, badgeY + i * 12 + 6.5, { align: 'center' });
  });

  // Date
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Gerado em ${today}`, pageWidth / 2, pageHeight - 40, { align: 'center' });

  // Branding
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KARINA BONADIU', pageWidth / 2, pageHeight - 25, { align: 'center' });

  // ==================== SUMMARY PAGE ====================
  doc.addPage();
  currentY = margin;

  // Page header
  currentY = addSectionHeader(doc, 'Visão Geral dos Resultados', currentY, margin, contentWidth);
  currentY += 5;

  // Test summaries
  for (const test of data.tests) {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }

    const color = ADAPTER_COLORS[test.slug] || COLORS.accent;

    // Test card
    doc.setFillColor(...hexToRgb(COLORS.lightGray));
    doc.roundedRect(margin, currentY, contentWidth, 35, 3, 3, 'F');

    // Color bar
    doc.setFillColor(...hexToRgb(color));
    doc.rect(margin, currentY, 4, 35, 'F');

    // Test name
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(test.displayName, margin + 10, currentY + 8);

    // Headline
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(color));
    doc.text(test.summary.headline, margin + 10, currentY + 15);

    // Summary text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    const summaryLines = doc.splitTextToSize(test.summary.summary, contentWidth - 20);
    doc.text(summaryLines.slice(0, 3), margin + 10, currentY + 21);

    // Score badge
    if (test.summary.mainScore !== undefined) {
      doc.setFillColor(...hexToRgb(color));
      doc.roundedRect(margin + contentWidth - 30, currentY + 3, 25, 12, 2, 2, 'F');
      doc.setTextColor(...hexToRgb(COLORS.white));
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${test.summary.mainScore.toFixed(0)}%`, margin + contentWidth - 17.5, currentY + 10.5, { align: 'center' });
    }

    currentY += 40;
  }

  // ==================== CROSS ANALYSIS PAGE ====================
  if (crossAnalysis && data.tests.length >= 2) {
    doc.addPage();
    currentY = margin;

    currentY = addSectionHeader(doc, 'Análise Cruzada Integrada', currentY, margin, contentWidth);
    currentY += 5;

    // Subtitle
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text('Análise gerada por inteligência artificial combinando os resultados de todos os testes.', margin, currentY);
    currentY += 8;

    // Parse and render cross analysis text
    const lines = crossAnalysis.split('\n');
    for (const line of lines) {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = margin;
      }

      const trimmed = line.trim();
      if (trimmed === '') {
        currentY += 3;
        continue;
      }

      // Bold headers
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        const headerText = trimmed.replace(/\*\*/g, '');
        currentY += 4;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...hexToRgb(COLORS.primary));
        doc.text(headerText, margin, currentY);
        currentY += 6;
        continue;
      }

      // Regular text (handle inline bold)
      const cleanText = trimmed.replace(/\*\*/g, '');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(COLORS.dark));
      const wrappedLines = doc.splitTextToSize(cleanText, contentWidth);
      for (const wl of wrappedLines) {
        if (currentY > pageHeight - 25) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(wl, margin, currentY);
        currentY += 4.5;
      }
      currentY += 2;
    }
  }

  // ==================== KEY TRAITS CORRELATION PAGE ====================
  if (data.tests.length >= 2) {
    doc.addPage();
    currentY = margin;

    currentY = addSectionHeader(doc, 'Correlações entre Testes', currentY, margin, contentWidth);
    currentY += 5;

    // Find common tags across tests
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
        correlations.push({
          tag,
          tests: matchingTests.map(t => t.displayName),
        });
      }
    });

    // Sort by number of tests (most correlated first)
    correlations.sort((a, b) => b.tests.length - a.tests.length);

    if (correlations.length > 0) {
      // Table header
      doc.setFillColor(...hexToRgb(COLORS.primary));
      doc.rect(margin, currentY, contentWidth, 8, 'F');
      doc.setTextColor(...hexToRgb(COLORS.white));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Tema', margin + 3, currentY + 5.5);
      doc.text('Testes Correlacionados', margin + 45, currentY + 5.5);
      currentY += 8;

      correlations.slice(0, 20).forEach((corr, i) => {
        if (currentY > pageHeight - 25) {
          doc.addPage();
          currentY = margin;
        }

        const bgColor = i % 2 === 0 ? COLORS.lightGray : COLORS.white;
        doc.setFillColor(...hexToRgb(bgColor));
        doc.rect(margin, currentY, contentWidth, 7, 'F');

        doc.setTextColor(...hexToRgb(COLORS.dark));
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(corr.tag.charAt(0).toUpperCase() + corr.tag.slice(1), margin + 3, currentY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...hexToRgb(COLORS.mediumGray));
        const testsText = corr.tests.join(', ');
        const truncated = testsText.length > 80 ? testsText.substring(0, 77) + '...' : testsText;
        doc.text(truncated, margin + 45, currentY + 5);

        currentY += 7;
      });
    }
  }

  // ==================== ABOUT PAGE ====================
  doc.addPage();
  currentY = margin;

  currentY = addSectionHeader(doc, 'Sobre este Relatório', currentY, margin, contentWidth);
  currentY += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(COLORS.dark));

  const aboutText = [
    'Este Relatório Unificado consolida os resultados de múltiplos testes de autoconhecimento e desenvolvimento pessoal realizados pelo participante na plataforma Karina Bonadiu.',
    '',
    'A Análise Cruzada Integrada é gerada por inteligência artificial, combinando os insights de todos os testes para identificar padrões, pontos fortes convergentes e áreas de desenvolvimento. Esta análise é uma ferramenta complementar e deve ser interpretada em conjunto com a devolutiva do facilitador.',
    '',
    'Testes incluídos neste relatório:',
  ];

  aboutText.forEach(line => {
    if (line === '') {
      currentY += 3;
      return;
    }
    const wrapped = doc.splitTextToSize(line, contentWidth);
    wrapped.forEach((wl: string) => {
      doc.text(wl, margin, currentY);
      currentY += 4.5;
    });
  });

  currentY += 2;
  data.tests.forEach(test => {
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${test.displayName}`, margin + 5, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text(`  Concluído em ${new Date(test.completedAt).toLocaleDateString('pt-BR')}`, margin + 5 + doc.getTextWidth(`• ${test.displayName}`), currentY);
    doc.setTextColor(...hexToRgb(COLORS.dark));
    currentY += 6;
  });

  currentY += 10;
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(COLORS.mediumGray));
  doc.text('© 2026 Karina Bonadiu. Todos os direitos reservados.', pageWidth / 2, currentY, { align: 'center' });

  // ==================== ADD PAGE NUMBERS ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Karina Bonadiu — Relatório Unificado', margin, pageHeight - 10);
  }

  // Save
  const safeName = data.participantName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  doc.save(`relatorio-unificado-${safeName}.pdf`);
}

function addSectionHeader(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number,
  contentWidth: number
): number {
  doc.setFillColor(...hexToRgb(COLORS.primary));
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin + 5, y + 8.5);
  return y + 12;
}
