/**
 * Comparative Report PDF Generator
 * 
 * Generates a PDF comparing the same test results
 * across multiple participants (side-by-side comparison).
 */

import jsPDF from 'jspdf';
import { ComparisonData } from './test-adapter';
import { getTestAdapter } from './test-adapter-registry';

const COLORS = {
  primary: '#335072',
  accent: '#B38F8F',
  cream: '#F2E9E4',
  dark: '#1a1a2e',
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  mediumGray: '#6B7280',
  border: '#E5E7EB',
  green: '#10B981',
  red: '#EF4444',
  yellow: '#F59E0B',
};

const PARTICIPANT_COLORS = [
  '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
];

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

export async function generateComparativePDF(data: ComparisonData): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const adapter = getTestAdapter(data.testSlug);
  const testColor = adapter?.color || COLORS.primary;

  // ==================== COVER PAGE ====================
  doc.setFillColor(...hexToRgb(testColor));
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Title
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO', pageWidth / 2, 75, { align: 'center' });
  doc.text('COMPARATIVO', pageWidth / 2, 90, { align: 'center' });

  // Test name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(data.testDisplayName, pageWidth / 2, 115, { align: 'center' });

  // Participant count
  doc.setFontSize(14);
  doc.text(`${data.participants.length} Participantes`, pageWidth / 2, 135, { align: 'center' });

  // Participant names
  let nameY = 155;
  doc.setFontSize(10);
  data.participants.forEach((p, i) => {
    const color = PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];
    doc.setFillColor(...hexToRgb(color));
    doc.circle(margin + 15, nameY + i * 10 - 1.5, 3, 'F');
    doc.setTextColor(...hexToRgb(COLORS.white));
    doc.text(p.name, margin + 22, nameY + i * 10);
  });

  // Date and branding
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(10);
  doc.text(`Gerado em ${today}`, pageWidth / 2, pageHeight - 40, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KARINA BONADIU', pageWidth / 2, pageHeight - 25, { align: 'center' });

  // ==================== COMPARISON TABLE PAGE ====================
  doc.addPage();
  currentY = margin;

  // Section header
  currentY = addSectionHeader(doc, 'Comparação de Métricas', currentY, margin, contentWidth);
  currentY += 8;

  // Get all unique metric keys
  const allMetricKeys = Array.from(
    new Set(data.participants.flatMap(p => p.metrics.map(m => m.key)))
  );

  // Legend
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  data.participants.forEach((p, i) => {
    const color = PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];
    doc.setFillColor(...hexToRgb(color));
    doc.circle(margin + 3, currentY, 2, 'F');
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.text(p.name, margin + 8, currentY + 1);
    currentY += 6;
  });
  currentY += 5;

  // Bar chart for each metric
  for (const key of allMetricKeys) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    const sampleMetric = data.participants[0]?.metrics.find(m => m.key === key);
    const label = sampleMetric?.label || key;
    const maxValue = Math.max(
      ...data.participants.map(p => {
        const m = p.metrics.find(met => met.key === key);
        return m?.maxValue ?? m?.value ?? 0;
      })
    );

    // Metric label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.text(label, margin, currentY);
    currentY += 5;

    // Bars for each participant
    const barHeight = 6;
    const barMaxWidth = contentWidth - 30;

    data.participants.forEach((p, i) => {
      const metric = p.metrics.find(m => m.key === key);
      const value = metric?.value ?? 0;
      const barWidth = maxValue > 0 ? (value / maxValue) * barMaxWidth : 0;
      const color = PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];

      // Background bar
      doc.setFillColor(...hexToRgb(COLORS.lightGray));
      doc.roundedRect(margin, currentY, barMaxWidth, barHeight, 1, 1, 'F');

      // Value bar
      if (barWidth > 0) {
        doc.setFillColor(...hexToRgb(color));
        doc.roundedRect(margin, currentY, barWidth, barHeight, 1, 1, 'F');
      }

      // Value text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(COLORS.dark));
      doc.text(value.toFixed(1), margin + barMaxWidth + 3, currentY + barHeight - 1);

      currentY += barHeight + 2;
    });

    currentY += 5;
  }

  // ==================== RANKING PAGE ====================
  doc.addPage();
  currentY = margin;

  currentY = addSectionHeader(doc, 'Ranking por Métrica', currentY, margin, contentWidth);
  currentY += 8;

  for (const key of allMetricKeys) {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin;
    }

    const sampleMetric = data.participants[0]?.metrics.find(m => m.key === key);
    const label = sampleMetric?.label || key;

    // Sort participants by this metric (descending)
    const ranked = [...data.participants]
      .map(p => ({
        name: p.name,
        value: p.metrics.find(m => m.key === key)?.value ?? 0,
      }))
      .sort((a, b) => b.value - a.value);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COLORS.primary));
    doc.text(label, margin, currentY);
    currentY += 5;

    ranked.forEach((r, i) => {
      const medal = i === 0 ? '1o' : i === 1 ? '2o' : i === 2 ? '3o' : `${i + 1}o`;
      const medalColor = i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : COLORS.mediumGray;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(medalColor));
      doc.text(medal, margin + 2, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(COLORS.dark));
      doc.text(r.name, margin + 12, currentY);

      doc.setFont('helvetica', 'bold');
      doc.text(r.value.toFixed(1), margin + contentWidth - 10, currentY, { align: 'right' });

      currentY += 5;
    });

    currentY += 5;
  }

  // ==================== INDIVIDUAL SUMMARIES PAGE ====================
  doc.addPage();
  currentY = margin;

  currentY = addSectionHeader(doc, 'Resumo Individual', currentY, margin, contentWidth);
  currentY += 8;

  data.participants.forEach((p, i) => {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    const color = PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];

    // Card background
    doc.setFillColor(...hexToRgb(COLORS.lightGray));
    doc.roundedRect(margin, currentY, contentWidth, 30, 3, 3, 'F');

    // Color bar
    doc.setFillColor(...hexToRgb(color));
    doc.rect(margin, currentY, 4, 30, 'F');

    // Name
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COLORS.dark));
    doc.text(p.name, margin + 10, currentY + 8);

    // Headline
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(color));
    doc.text(p.summary.headline, margin + 10, currentY + 14);

    // Summary
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    const summaryLines = doc.splitTextToSize(p.summary.summary, contentWidth - 20);
    doc.text(summaryLines.slice(0, 2), margin + 10, currentY + 20);

    currentY += 35;
  });

  // ==================== ADD PAGE NUMBERS ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COLORS.mediumGray));
    doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Karina Bonadiu — Relatório Comparativo', margin, pageHeight - 10);
  }

  // Save
  const safeName = data.testDisplayName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  doc.save(`relatorio-comparativo-${safeName}.pdf`);
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
