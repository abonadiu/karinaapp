import jsPDF from "jspdf";
import { DimensionScore, getScoreLevel, getWeakestDimensions, getStrongestDimensions } from "./diagnostic-scoring";
import { normalizeDimensionScores } from "./dimension-utils";
import { Recommendation } from "./recommendations";
import { getRecommendationsForWeakDimensions } from "./recommendations";
import { generateExecutiveSummary } from "./executive-summary";
import { getCrossAnalysisInsights, CrossInsight } from "./cross-analysis";
import { generateActionPlan, ActionPlan, WeekPlan } from "./action-plan";
import {
  DIAGNOSTIC_INTRO,
  DIAGNOSTIC_THEORETICAL_FOUNDATION,
  getOverallScoreMessage,
  getScoreLevelBadge,
  getInterpretation,
  getDimensionAbout,
  getDimensionWhyItMatters,
  getDimensionTheoreticalBasis,
  getDimensionSubDimensions,
  getDimensionSignsInDailyLife,
  getDimensionConnectionToOthers,
} from "./dimension-descriptions";

// ============================================================
// INTERFACES
// ============================================================

export interface FacilitatorBranding {
  full_name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
}

export interface PDFGeneratorOptions {
  participantName: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
  recommendations: Recommendation[];
  completedAt?: string;
  facilitatorProfile?: FacilitatorBranding;
}

// ============================================================
// COLOR UTILITIES
// ============================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function lightenColor(
  color: { r: number; g: number; b: number },
  factor: number
): { r: number; g: number; b: number } {
  return {
    r: Math.min(255, Math.round(color.r + (255 - color.r) * factor)),
    g: Math.min(255, Math.round(color.g + (255 - color.g) * factor)),
    b: Math.min(255, Math.round(color.b + (255 - color.b) * factor)),
  };
}

// Dimension-specific colors (fixed, not dependent on CSS variables)
const DIMENSION_PDF_COLORS: Record<string, { r: number; g: number; b: number }> = {
  "Consciência Interior": { r: 99, g: 102, b: 241 },   // Indigo
  "Coerência Emocional": { r: 236, g: 72, b: 153 },    // Pink
  "Conexão e Propósito": { r: 245, g: 158, b: 11 },    // Amber
  "Relações e Compaixão": { r: 16, g: 185, b: 129 },   // Emerald
  "Transformação": { r: 139, g: 92, b: 246 },           // Violet
};

function getDimensionPdfColor(dimension: string): { r: number; g: number; b: number } {
  return DIMENSION_PDF_COLORS[dimension] || { r: 139, g: 92, b: 246 };
}

// ============================================================
// TEXT UTILITIES
// ============================================================

function wrapText(
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontStyle: string = "normal"
): string[] {
  pdf.setFontSize(fontSize);
  pdf.setFont("helvetica", fontStyle);
  return pdf.splitTextToSize(text, maxWidth);
}

function drawWrappedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
  color: { r: number; g: number; b: number } = { r: 50, g: 50, b: 50 },
  fontStyle: string = "normal"
): number {
  pdf.setFontSize(fontSize);
  pdf.setFont("helvetica", fontStyle);
  pdf.setTextColor(color.r, color.g, color.b);
  const lines = pdf.splitTextToSize(text, maxWidth);
  lines.forEach((line: string, index: number) => {
    pdf.text(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

// ============================================================
// PAGE MANAGEMENT
// ============================================================

interface PageContext {
  pdf: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  primaryColor: { r: number; g: number; b: number };
  primaryColorLight: { r: number; g: number; b: number };
  facilitatorName: string;
  participantName: string;
  totalPages: number;
  currentPage: number;
}

function addHeaderAndFooter(ctx: PageContext, sectionTitle?: string): void {
  const { pdf, pageWidth, pageHeight, margin, primaryColor } = ctx;

  // Header line
  pdf.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 12, pageWidth - margin, 12);

  // Header text
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("DIAGNÓSTICO IQ+IS", margin, 9);

  if (sectionTitle) {
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 120, 120);
    const titleWidth = pdf.getTextWidth(sectionTitle);
    pdf.text(sectionTitle, pageWidth - margin - titleWidth, 9);
  }

  // Footer line
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  // Footer text
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(150, 150, 150);

  const footerText = ctx.facilitatorName
    ? `Gerado por ${ctx.facilitatorName} via Karina Bonadiu`
    : "Gerado via Karina Bonadiu";
  pdf.text(footerText, margin, pageHeight - 9);

  const pageText = `${ctx.participantName} — Página ${ctx.currentPage}`;
  const pageTextWidth = pdf.getTextWidth(pageText);
  pdf.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 9);
}

function checkPageBreak(
  ctx: PageContext,
  yPosition: number,
  requiredSpace: number,
  sectionTitle?: string
): number {
  const maxY = ctx.pageHeight - 20;
  if (yPosition + requiredSpace > maxY) {
    ctx.pdf.addPage();
    ctx.currentPage++;
    addHeaderAndFooter(ctx, sectionTitle);
    return 20; // Start position after header
  }
  return yPosition;
}

// ============================================================
// PAGE 1: COVER PAGE
// ============================================================

function drawCoverPage(ctx: PageContext, data: PDFGeneratorOptions): void {
  const { pdf, pageWidth, pageHeight, margin, primaryColor, primaryColorLight } = ctx;

  // Top colored band
  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(0, 0, pageWidth, 90, "F");

  // Decorative accent line
  const accentColor = lightenColor(primaryColor, 0.3);
  pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  pdf.rect(0, 85, pageWidth, 5, "F");

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.text("DIAGNÓSTICO IQ+IS", pageWidth / 2, 40, { align: "center" });

  // Subtitle
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "normal");
  pdf.text("Inteligência Emocional + Inteligência Espiritual", pageWidth / 2, 52, {
    align: "center",
  });

  // Subtitle line 2
  pdf.setFontSize(11);
  pdf.text("Relatório Individual de Diagnóstico", pageWidth / 2, 64, {
    align: "center",
  });

  // Participant info box
  const boxY = 110;
  const boxHeight = 50;
  pdf.setFillColor(primaryColorLight.r, primaryColorLight.g, primaryColorLight.b);
  pdf.roundedRect(margin + 20, boxY, pageWidth - (margin + 20) * 2, boxHeight, 4, 4, "F");

  // Participant name
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("PARTICIPANTE", pageWidth / 2, boxY + 15, { align: "center" });

  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.participantName, pageWidth / 2, boxY + 32, { align: "center" });

  // Date
  const dateStr = data.completedAt
    ? new Date(data.completedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Concluído em ${dateStr}`, pageWidth / 2, boxY + 45, { align: "center" });

  // Score circle area
  const circleY = 200;
  const circleRadius = 28;

  // Score circle background
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(3);
  pdf.circle(pageWidth / 2, circleY, circleRadius);

  // Score circle colored arc (simulated with filled arc)
  pdf.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.setLineWidth(3);
  // Draw partial circle based on score percentage
  const percentage = (data.totalScore / 5) * 100;
  const steps = Math.round((percentage / 100) * 60);
  for (let i = 0; i < steps; i++) {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const nextAngle = ((i + 1) / 60) * 2 * Math.PI - Math.PI / 2;
    const x1 = pageWidth / 2 + circleRadius * Math.cos(angle);
    const y1 = circleY + circleRadius * Math.sin(angle);
    const x2 = pageWidth / 2 + circleRadius * Math.cos(nextAngle);
    const y2 = circleY + circleRadius * Math.sin(nextAngle);
    pdf.line(x1, y1, x2, y2);
  }

  // Score text
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.totalScore.toFixed(1), pageWidth / 2, circleY + 2, { align: "center" });

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(120, 120, 120);
  pdf.text("/5", pageWidth / 2 + 14, circleY + 2, { align: "center" });

  // Score badge
  const badge = getScoreLevelBadge(data.totalScore);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text(badge.label, pageWidth / 2, circleY + circleRadius + 14, { align: "center" });

  // Motivational quote
  const quoteY = circleY + circleRadius + 30;
  const quoteText = getOverallScoreMessage(data.totalScore);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(80, 80, 80);
  const quoteLines = pdf.splitTextToSize(quoteText, pageWidth - margin * 2 - 30);
  // Decorative quote mark
  pdf.setFontSize(24);
  pdf.setTextColor(primaryColorLight.r, primaryColorLight.g, primaryColorLight.b);
  pdf.text('"', margin + 10, quoteY - 2);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(80, 80, 80);
  quoteLines.forEach((line: string, i: number) => {
    pdf.text(line, margin + 15, quoteY + 6 + i * 4.5);
  });

  // Facilitator branding at the bottom
  const bottomY = pageHeight - 30;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin + 30, bottomY - 5, pageWidth - margin - 30, bottomY - 5);

  if (data.facilitatorProfile?.full_name) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `Facilitado por ${data.facilitatorProfile.full_name}`,
      pageWidth / 2,
      bottomY + 3,
      { align: "center" }
    );
  }
}

// ============================================================
// PAGE 2: WELCOME / ABOUT THE DIAGNOSTIC
// ============================================================

function drawWelcomePage(ctx: PageContext, data: PDFGeneratorOptions): void {
  const { pdf, pageWidth, margin, contentWidth, primaryColor, primaryColorLight } = ctx;

  ctx.pdf.addPage();
  ctx.currentPage++;
  addHeaderAndFooter(ctx, "Sobre o Diagnóstico");

  let y = 24;

  // Section title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("Sobre o Diagnóstico IQ+IS", margin, y);
  y += 10;

  // Decorative line
  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(margin, y, 40, 1, "F");
  y += 8;

  // Intro text
  y = drawWrappedText(pdf, DIAGNOSTIC_INTRO, margin, y, contentWidth, 10, 5, { r: 50, g: 50, b: 50 });
  y += 6;

  // Theoretical foundation box
  pdf.setFillColor(primaryColorLight.r, primaryColorLight.g, primaryColorLight.b);
  const foundationLines = wrapText(pdf, DIAGNOSTIC_THEORETICAL_FOUNDATION, contentWidth - 16, 9);
  const foundationHeight = foundationLines.length * 4.5 + 20;
  pdf.roundedRect(margin, y, contentWidth, foundationHeight, 3, 3, "F");

  y += 8;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("Fundamentação Teórica", margin + 8, y);
  y += 7;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 60, 60);
  foundationLines.forEach((line: string) => {
    pdf.text(line, margin + 8, y);
    y += 4.5;
  });
  y += 10;

  // The 5 Dimensions overview
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("As 5 Dimensões Avaliadas", margin, y);
  y += 8;

  const dimensions = [
    { name: "Consciência Interior", desc: "Capacidade de auto-observação e presença consciente no momento atual." },
    { name: "Coerência Emocional", desc: "Habilidade de reconhecer, nomear e regular emoções de forma equilibrada." },
    { name: "Conexão e Propósito", desc: "Alinhamento entre ações cotidianas e valores profundos, senso de direção." },
    { name: "Relações e Compaixão", desc: "Qualidade da conexão emocional consigo e com os outros." },
    { name: "Transformação", desc: "Abertura para mudança, aprendizado contínuo e mentalidade de crescimento." },
  ];

  dimensions.forEach((dim) => {
    const dimColor = getDimensionPdfColor(dim.name);
    const dimColorLight = lightenColor(dimColor, 0.85);

    // Small colored box
    pdf.setFillColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.roundedRect(margin, y - 3, 3, 14, 1, 1, "F");

    // Background
    pdf.setFillColor(dimColorLight.r, dimColorLight.g, dimColorLight.b);
    pdf.roundedRect(margin + 5, y - 5, contentWidth - 5, 16, 2, 2, "F");

    // Name
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.text(dim.name, margin + 10, y + 1);

    // Description
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(80, 80, 80);
    pdf.text(dim.desc, margin + 10, y + 7);

    y += 20;
  });
}

// ============================================================
// PAGE 3: EXECUTIVE SUMMARY + RADAR CHART (SIMULATED)
// ============================================================

function drawExecutiveSummaryPage(ctx: PageContext, data: PDFGeneratorOptions): void {
  const { pdf, pageWidth, margin, contentWidth, primaryColor, primaryColorLight } = ctx;

  ctx.pdf.addPage();
  ctx.currentPage++;
  addHeaderAndFooter(ctx, "Resumo Executivo");

  let y = 24;

  // Section title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("Resumo Executivo", margin, y);
  y += 10;

  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(margin, y, 40, 1, "F");
  y += 8;

  // Executive summary text
  const summaryText = generateExecutiveSummary({
    participantName: data.participantName,
    totalScore: data.totalScore,
    dimensionScores: data.dimensionScores,
  });

  y = drawWrappedText(pdf, summaryText, margin, y, contentWidth, 10, 5.2, { r: 50, g: 50, b: 50 });
  y += 10;

  // Strengths and Development areas side by side
  const strongDimensions = getStrongestDimensions(data.dimensionScores);
  const weakDimensions = getWeakestDimensions(data.dimensionScores);
  const halfWidth = (contentWidth - 8) / 2;

  // Strengths box
  pdf.setFillColor(220, 252, 231);
  pdf.roundedRect(margin, y, halfWidth, 42, 3, 3, "F");
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(22, 101, 52);
  pdf.text("Pontos Fortes", margin + 8, y + 10);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  strongDimensions.forEach((dim, i) => {
    pdf.text(`• ${dim.dimension} (${dim.score.toFixed(1)})`, margin + 8, y + 20 + i * 8);
  });

  // Development areas box
  const devX = margin + halfWidth + 8;
  pdf.setFillColor(254, 243, 199);
  pdf.roundedRect(devX, y, halfWidth, 42, 3, 3, "F");
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(146, 64, 14);
  pdf.text("Áreas de Desenvolvimento", devX + 8, y + 10);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  weakDimensions.forEach((dim, i) => {
    pdf.text(`• ${dim.dimension} (${dim.score.toFixed(1)})`, devX + 8, y + 20 + i * 8);
  });

  y += 52;

  // ---- RADAR CHART (Simulated with pentagon) ----
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("Visão Geral das 5 Dimensões", margin, y);
  y += 8;

  const centerX = pageWidth / 2;
  const centerY = y + 55;
  const maxRadius = 45;
  const numAxes = 5;
  const angleStep = (2 * Math.PI) / numAxes;
  const startAngle = -Math.PI / 2; // Start from top

  // Draw grid circles (pentagons)
  for (let level = 1; level <= 5; level++) {
    const radius = (level / 5) * maxRadius;
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    for (let i = 0; i < numAxes; i++) {
      const angle1 = startAngle + i * angleStep;
      const angle2 = startAngle + (i + 1) * angleStep;
      const x1 = centerX + radius * Math.cos(angle1);
      const y1 = centerY + radius * Math.sin(angle1);
      const x2 = centerX + radius * Math.cos(angle2);
      const y2 = centerY + radius * Math.sin(angle2);
      pdf.line(x1, y1, x2, y2);
    }
  }

  // Draw axis lines
  for (let i = 0; i < numAxes; i++) {
    const angle = startAngle + i * angleStep;
    const x = centerX + maxRadius * Math.cos(angle);
    const y2 = centerY + maxRadius * Math.sin(angle);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(centerX, centerY, x, y2);
  }

  // Draw data polygon (filled)
  const sortedScores = [...data.dimensionScores].sort((a, b) => a.dimensionOrder - b.dimensionOrder);
  const dataPoints: { x: number; y: number }[] = [];

  sortedScores.forEach((score, i) => {
    const angle = startAngle + i * angleStep;
    const radius = (score.score / 5) * maxRadius;
    dataPoints.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  // Fill polygon
  if (dataPoints.length > 0) {
    const fillColor = lightenColor(primaryColor, 0.7);
    pdf.setFillColor(fillColor.r, fillColor.g, fillColor.b);
    pdf.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.setLineWidth(1.5);

    // Build polygon path manually
    const pathPoints = dataPoints.map((p) => [p.x, p.y] as [number, number]);
    // Draw filled polygon
    for (let i = 0; i < pathPoints.length; i++) {
      const next = (i + 1) % pathPoints.length;
      if (i === 0) {
        // Start triangle fan from first point
      }
      pdf.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.setLineWidth(1.5);
      pdf.line(pathPoints[i][0], pathPoints[i][1], pathPoints[next][0], pathPoints[next][1]);
    }

    // Draw dots at data points
    dataPoints.forEach((p) => {
      pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.circle(p.x, p.y, 1.5, "F");
    });
  }

  // Draw dimension labels
  sortedScores.forEach((score, i) => {
    const angle = startAngle + i * angleStep;
    const labelRadius = maxRadius + 14;
    const lx = centerX + labelRadius * Math.cos(angle);
    const ly = centerY + labelRadius * Math.sin(angle);

    const dimColor = getDimensionPdfColor(score.dimension);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);

    // Adjust alignment based on position
    let align: "center" | "left" | "right" = "center";
    let offsetX = 0;
    if (Math.cos(angle) > 0.3) {
      align = "left";
      offsetX = 2;
    } else if (Math.cos(angle) < -0.3) {
      align = "right";
      offsetX = -2;
    }

    // Short name for label
    const shortName = score.dimension;
    pdf.text(shortName, lx + offsetX, ly, { align });

    // Score below label
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`(${score.score.toFixed(1)})`, lx + offsetX, ly + 4, { align });
  });

  // Scale labels
  pdf.setFontSize(6);
  pdf.setTextColor(160, 160, 160);
  for (let level = 1; level <= 5; level++) {
    const radius = (level / 5) * maxRadius;
    pdf.text(level.toString(), centerX + 2, centerY - radius + 2);
  }
}

// ============================================================
// PAGES 4-8: DIMENSION DETAIL PAGES
// ============================================================

function drawDimensionPage(
  ctx: PageContext,
  score: DimensionScore,
  isStrong: boolean,
  isWeak: boolean
): void {
  const { pdf, pageWidth, margin, contentWidth, primaryColor } = ctx;

  ctx.pdf.addPage();
  ctx.currentPage++;
  addHeaderAndFooter(ctx, score.dimension);

  const dimColor = getDimensionPdfColor(score.dimension);
  const dimColorLight = lightenColor(dimColor, 0.85);
  const dimColorMedium = lightenColor(dimColor, 0.7);

  let y = 20;

  // ---- Dimension Header ----
  pdf.setFillColor(dimColor.r, dimColor.g, dimColor.b);
  pdf.roundedRect(margin, y, contentWidth, 30, 3, 3, "F");

  // Dimension name
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(score.dimension, margin + 12, y + 13);

  // Score
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  const scoreText = `${score.score.toFixed(1)}/5`;
  const scoreWidth = pdf.getTextWidth(scoreText);
  pdf.text(scoreText, pageWidth - margin - 12 - scoreWidth, y + 14);

  // Percentage bar
  const barY = y + 21;
  const barWidth = contentWidth - 24;
  const barHeight = 4;
  pdf.setFillColor(220, 220, 220);
  pdf.roundedRect(margin + 12, barY, barWidth, barHeight, 2, 2, "F");
  pdf.setFillColor(255, 255, 255);
  const filledWidth = (score.percentage / 100) * barWidth;
  if (filledWidth > 0) {
    pdf.roundedRect(margin + 12, barY, filledWidth, barHeight, 2, 2, "F");
  }

  // Badge
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  if (isStrong) {
    pdf.text("PONTO FORTE", margin + 12 + filledWidth + 5, barY + 3);
  } else if (isWeak) {
    pdf.text("A DESENVOLVER", margin + 12 + filledWidth + 5, barY + 3);
  }

  y += 38;

  // ---- Level indicator ----
  const level = getScoreLevel(score.score);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  if (level.level === "alto") {
    pdf.setTextColor(22, 163, 74);
  } else if (level.level === "medio") {
    pdf.setTextColor(202, 138, 4);
  } else {
    pdf.setTextColor(234, 88, 12);
  }
  pdf.text(`Nível: ${level.label}`, margin, y);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(120, 120, 120);
  const pctText = `${Math.round(score.percentage)}% do potencial máximo`;
  const pctWidth = pdf.getTextWidth(pctText);
  pdf.text(pctText, pageWidth - margin - pctWidth, y);
  y += 8;

  // ---- About this dimension ----
  const about = getDimensionAbout(score.dimension);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
  pdf.text("O que é esta dimensão?", margin, y);
  y += 6;

  y = drawWrappedText(pdf, about, margin, y, contentWidth, 9, 4.5, { r: 60, g: 60, b: 60 });
  y += 6;

  // ---- Your Result (Interpretation) ----
  y = checkPageBreak(ctx, y, 40, score.dimension);
  const interpretation = getInterpretation(score.dimension, score.score);
  if (interpretation) {
    pdf.setFillColor(dimColorLight.r, dimColorLight.g, dimColorLight.b);
    const interpLines = wrapText(pdf, interpretation, contentWidth - 20, 9);
    const interpHeight = interpLines.length * 4.5 + 16;
    pdf.roundedRect(margin, y, contentWidth, interpHeight, 3, 3, "F");

    // Colored left border
    pdf.setFillColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.rect(margin, y, 3, interpHeight, "F");

    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.text("Seu Resultado", margin + 10, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    interpLines.forEach((line: string) => {
      y = checkPageBreak(ctx, y, 5, score.dimension);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      pdf.text(line, margin + 10, y);
      y += 4.5;
    });
    y += 6;
  }

  // ---- Subdimensions ----
  y = checkPageBreak(ctx, y, 30, score.dimension);
  const subDimensions = getDimensionSubDimensions(score.dimension);
  if (subDimensions.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.text("Subdimensões", margin, y);
    y += 7;

    subDimensions.forEach((sub) => {
      y = checkPageBreak(ctx, y, 20, score.dimension);

      pdf.setFillColor(dimColorLight.r, dimColorLight.g, dimColorLight.b);
      const subLines = wrapText(pdf, sub.description, contentWidth - 20, 8);
      const subHeight = subLines.length * 4 + 12;
      pdf.roundedRect(margin, y, contentWidth, subHeight, 2, 2, "F");

      pdf.setFillColor(dimColor.r, dimColor.g, dimColor.b);
      pdf.rect(margin, y, 2.5, subHeight, "F");

      y += 6;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(50, 50, 50);
      pdf.text(sub.name, margin + 8, y);
      y += 5;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      subLines.forEach((line: string) => {
        pdf.text(line, margin + 8, y);
        y += 4;
      });
      y += 4;
    });
    y += 4;
  }

  // ---- Why it matters ----
  y = checkPageBreak(ctx, y, 25, score.dimension);
  const whyItMatters = getDimensionWhyItMatters(score.dimension);
  if (whyItMatters) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.text("Por que importa?", margin, y);
    y += 6;

    y = drawWrappedText(pdf, whyItMatters, margin, y, contentWidth, 9, 4.5, { r: 60, g: 60, b: 60 });
    y += 6;
  }

  // ---- Signs in daily life ----
  y = checkPageBreak(ctx, y, 25, score.dimension);
  const signs = getDimensionSignsInDailyLife(score.dimension);
  if (signs.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.text("Sinais no dia a dia", margin, y);
    y += 6;

    signs.forEach((sign, i) => {
      y = checkPageBreak(ctx, y, 10, score.dimension);
      pdf.setFillColor(dimColor.r, dimColor.g, dimColor.b);
      pdf.circle(margin + 3, y - 1, 2.5, "F");
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text((i + 1).toString(), margin + 3, y + 0.5, { align: "center" });

      const signLines = wrapText(pdf, sign, contentWidth - 12, 8.5);
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      signLines.forEach((line: string, li: number) => {
        pdf.text(line, margin + 10, y + li * 4);
      });
      y += signLines.length * 4 + 3;
    });
    y += 4;
  }

  // ---- Connection to others ----
  y = checkPageBreak(ctx, y, 20, score.dimension);
  const connection = getDimensionConnectionToOthers(score.dimension);
  if (connection) {
    pdf.setFillColor(dimColorLight.r, dimColorLight.g, dimColorLight.b);
    const connLines = wrapText(pdf, connection, contentWidth - 16, 8.5);
    const connHeight = connLines.length * 4 + 14;
    pdf.roundedRect(margin, y, contentWidth, connHeight, 3, 3, "F");

    y += 7;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.text("Conexão com outras dimensões", margin + 8, y);
    y += 5;

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    connLines.forEach((line: string) => {
      pdf.text(line, margin + 8, y);
      y += 4;
    });
  }
}

// ============================================================
// CROSS ANALYSIS PAGE
// ============================================================

function drawCrossAnalysisPage(ctx: PageContext, data: PDFGeneratorOptions): void {
  const { pdf, pageWidth, margin, contentWidth, primaryColor, primaryColorLight } = ctx;

  const insights = getCrossAnalysisInsights(data.dimensionScores);
  if (insights.length === 0) return;

  ctx.pdf.addPage();
  ctx.currentPage++;
  addHeaderAndFooter(ctx, "Análise Cruzada");

  let y = 24;

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("Análise Cruzada entre Dimensões", margin, y);
  y += 10;

  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(margin, y, 40, 1, "F");
  y += 8;

  y = drawWrappedText(
    pdf,
    "A interação entre suas dimensões revela padrões únicos que complementam a análise individual. Os insights abaixo identificam dinâmicas específicas do seu perfil.",
    margin,
    y,
    contentWidth,
    9,
    4.5,
    { r: 80, g: 80, b: 80 }
  );
  y += 8;

  insights.forEach((insight) => {
    y = checkPageBreak(ctx, y, 50, "Análise Cruzada");

    const color1 = getDimensionPdfColor(insight.dimensions[0]);
    const color2 = getDimensionPdfColor(insight.dimensions[1]);

    // Card header
    pdf.setFillColor(245, 245, 250);
    pdf.roundedRect(margin, y, contentWidth, 12, 3, 3, "F");

    // Dimension dots and names
    pdf.setFillColor(color1.r, color1.g, color1.b);
    pdf.circle(margin + 8, y + 6, 2.5, "F");
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(color1.r, color1.g, color1.b);
    pdf.text(insight.dimensions[0], margin + 14, y + 7.5);

    const arrow1X = margin + 14 + pdf.getTextWidth(insight.dimensions[0]) + 4;
    pdf.setTextColor(150, 150, 150);
    pdf.text("→", arrow1X, y + 7.5);

    const dot2X = arrow1X + 8;
    pdf.setFillColor(color2.r, color2.g, color2.b);
    pdf.circle(dot2X, y + 6, 2.5, "F");
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(color2.r, color2.g, color2.b);
    pdf.text(insight.dimensions[1], dot2X + 6, y + 7.5);

    // Title on the right
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    const titleW = pdf.getTextWidth(insight.title);
    pdf.text(insight.title, pageWidth - margin - 8 - titleW, y + 7.5);

    y += 16;

    // Insight text
    const insightLines = wrapText(pdf, insight.insight, contentWidth - 8, 9);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    insightLines.forEach((line: string) => {
      y = checkPageBreak(ctx, y, 5, "Análise Cruzada");
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      pdf.text(line, margin + 4, y);
      y += 4.5;
    });
    y += 4;

    // Recommendation box
    y = checkPageBreak(ctx, y, 20, "Análise Cruzada");
    const recLines = wrapText(pdf, insight.recommendation, contentWidth - 24, 8.5);
    const recHeight = recLines.length * 4 + 12;
    pdf.setFillColor(primaryColorLight.r, primaryColorLight.g, primaryColorLight.b);
    pdf.roundedRect(margin + 4, y, contentWidth - 8, recHeight, 2, 2, "F");

    y += 7;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.text("Recomendação:", margin + 10, y);
    y += 5;

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    recLines.forEach((line: string) => {
      pdf.text(line, margin + 10, y);
      y += 4;
    });
    y += 10;
  });
}

// ============================================================
// RECOMMENDATIONS PAGE
// ============================================================

function drawRecommendationsPage(ctx: PageContext, data: PDFGeneratorOptions): void {
  const { pdf, pageWidth, margin, contentWidth, primaryColor, primaryColorLight } = ctx;

  const weakDimensions = getWeakestDimensions(data.dimensionScores);
  const recommendations = getRecommendationsForWeakDimensions(weakDimensions.map((d) => d.dimension));

  if (recommendations.length === 0) return;

  ctx.pdf.addPage();
  ctx.currentPage++;
  addHeaderAndFooter(ctx, "Recomendações");

  let y = 24;

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("Recomendações para Você", margin, y);
  y += 10;

  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(margin, y, 40, 1, "F");
  y += 10;

  recommendations.forEach((rec) => {
    y = checkPageBreak(ctx, y, 50, "Recomendações");

    // Find dimension from title
    let dimName = "";
    if (rec.title.includes("Consciência")) dimName = "Consciência Interior";
    else if (rec.title.includes("Coerência")) dimName = "Coerência Emocional";
    else if (rec.title.includes("Conexão") || rec.title.includes("Propósito")) dimName = "Conexão e Propósito";
    else if (rec.title.includes("Relações") || rec.title.includes("Compaixão")) dimName = "Relações e Compaixão";
    else if (rec.title.includes("Transformação")) dimName = "Transformação";

    const dimColor = getDimensionPdfColor(dimName);
    const dimColorLight = lightenColor(dimColor, 0.85);

    // Header bar
    pdf.setFillColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(rec.title, margin + 8, y + 8);
    y += 16;

    // Description
    y = drawWrappedText(pdf, rec.description, margin + 4, y, contentWidth - 8, 9, 4.5, { r: 60, g: 60, b: 60 });
    y += 6;

    // Practices
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.text("Práticas Recomendadas:", margin + 4, y);
    y += 6;

    rec.practices.forEach((practice, i) => {
      y = checkPageBreak(ctx, y, 12, "Recomendações");

      // Number circle
      pdf.setFillColor(dimColor.r, dimColor.g, dimColor.b);
      pdf.circle(margin + 7, y - 1, 2.5, "F");
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text((i + 1).toString(), margin + 7, y + 0.5, { align: "center" });

      const practiceLines = wrapText(pdf, practice, contentWidth - 18, 8.5);
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      practiceLines.forEach((line: string, li: number) => {
        pdf.text(line, margin + 14, y + li * 4);
      });
      y += practiceLines.length * 4 + 3;
    });
    y += 4;

    // Resources
    if (rec.resources && rec.resources.length > 0) {
      y = checkPageBreak(ctx, y, 20, "Recomendações");
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
      pdf.text("Recursos Recomendados:", margin + 4, y);
      y += 5;

      rec.resources.forEach((resource) => {
        y = checkPageBreak(ctx, y, 6, "Recomendações");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(80, 80, 80);
        pdf.text(`★ ${resource}`, margin + 8, y);
        y += 4.5;
      });
      y += 4;
    }

    // Expected benefits
    if (rec.expectedBenefits) {
      y = checkPageBreak(ctx, y, 20, "Recomendações");
      pdf.setFillColor(dimColorLight.r, dimColorLight.g, dimColorLight.b);
      const benefitLines = wrapText(pdf, rec.expectedBenefits, contentWidth - 24, 8.5);
      const benefitHeight = benefitLines.length * 4 + 12;
      pdf.roundedRect(margin + 4, y, contentWidth - 8, benefitHeight, 2, 2, "F");

      y += 7;
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
      pdf.text("Resultados esperados:", margin + 10, y);
      y += 5;

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      benefitLines.forEach((line: string) => {
        pdf.text(line, margin + 10, y);
        y += 4;
      });
      y += 8;
    }

    y += 6;
  });
}

// ============================================================
// ACTION PLAN PAGE
// ============================================================

function drawActionPlanPage(ctx: PageContext, data: PDFGeneratorOptions): void {
  const { pdf, pageWidth, margin, contentWidth, primaryColor, primaryColorLight } = ctx;

  const plan = generateActionPlan(data.dimensionScores);

  ctx.pdf.addPage();
  ctx.currentPage++;
  addHeaderAndFooter(ctx, "Plano de Ação");

  let y = 24;

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("Plano de Ação — 4 Semanas", margin, y);
  y += 10;

  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(margin, y, 40, 1, "F");
  y += 8;

  const introText = `Um plano estruturado focado nas suas duas dimensões com maior potencial de desenvolvimento: ${plan.focusDimensions[0]} e ${plan.focusDimensions[1]}.`;
  y = drawWrappedText(pdf, introText, margin, y, contentWidth, 10, 5, { r: 60, g: 60, b: 60 });
  y += 8;

  const timeIcons: Record<string, string> = {
    "Manhã": "☀",
    "Tarde": "⛅",
    "Noite": "🌙",
  };

  plan.weeks.forEach((week, index) => {
    y = checkPageBreak(ctx, y, 60, "Plano de Ação");

    const dimName = plan.focusDimensions[index % 2 === 0 ? 0 : 1];
    const dimColor = getDimensionPdfColor(dimName);
    const dimColorLight = lightenColor(dimColor, 0.85);

    // Week header
    pdf.setFillColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.roundedRect(margin, y, contentWidth, 16, 3, 3, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Semana ${week.week} — ${week.title}`, margin + 8, y + 7);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Objetivo: ${week.objective}`, margin + 8, y + 13);

    y += 22;

    // Practices
    week.practices.forEach((practice) => {
      y = checkPageBreak(ctx, y, 15, "Plano de Ação");

      // Time label
      pdf.setFillColor(dimColorLight.r, dimColorLight.g, dimColorLight.b);
      const practiceLines = wrapText(pdf, practice.activity, contentWidth - 22, 8.5);
      const practiceHeight = practiceLines.length * 4 + 4;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
      pdf.text(practice.time.toUpperCase(), margin + 4, y);
      y += 4;

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      practiceLines.forEach((line: string) => {
        pdf.text(line, margin + 8, y);
        y += 4;
      });
      y += 3;
    });

    // Weekly goal
    y = checkPageBreak(ctx, y, 15, "Plano de Ação");
    pdf.setFillColor(dimColorLight.r, dimColorLight.g, dimColorLight.b);
    const goalLines = wrapText(pdf, week.weeklyGoal, contentWidth - 24, 8.5);
    const goalHeight = goalLines.length * 4 + 10;
    pdf.roundedRect(margin + 4, y, contentWidth - 8, goalHeight, 2, 2, "F");

    y += 6;
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(dimColor.r, dimColor.g, dimColor.b);
    pdf.text("Meta da semana:", margin + 10, y);
    y += 5;

    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    goalLines.forEach((line: string) => {
      pdf.text(line, margin + 10, y);
      y += 4;
    });
    y += 10;
  });
}

// ============================================================
// CLOSING PAGE
// ============================================================

function drawClosingPage(ctx: PageContext, data: PDFGeneratorOptions): void {
  const { pdf, pageWidth, pageHeight, margin, contentWidth, primaryColor, primaryColorLight } = ctx;

  ctx.pdf.addPage();
  ctx.currentPage++;
  addHeaderAndFooter(ctx, "Próximos Passos");

  let y = 24;

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text("Próximos Passos", margin, y);
  y += 10;

  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(margin, y, 40, 1, "F");
  y += 10;

  const firstName = data.participantName.split(" ")[0];

  const closingText = `${firstName}, este relatório é um mapa do seu momento atual — não um destino final. Cada dimensão avaliada representa uma área viva e dinâmica do seu ser, que pode ser cultivada e fortalecida com intenção e prática.

O mais importante não é a pontuação em si, mas o que você faz com o conhecimento que ela revela. Pequenas ações consistentes geram transformações profundas ao longo do tempo. A neurociência confirma: nosso cérebro é plástico e se reorganiza em resposta às experiências que escolhemos cultivar.

Aqui estão algumas sugestões para aproveitar ao máximo este diagnóstico:`;

  y = drawWrappedText(pdf, closingText, margin, y, contentWidth, 10, 5.2, { r: 50, g: 50, b: 50 });
  y += 8;

  const nextSteps = [
    "Releia este relatório com calma, prestando atenção especial às seções que mais ressoam com você.",
    "Escolha UMA prática do Plano de Ação para começar esta semana — não tente mudar tudo de uma vez.",
    "Compartilhe seus insights com alguém de confiança — verbalizar o aprendizado o consolida.",
    "Agende uma sessão de feedback com seu facilitador para aprofundar a compreensão dos resultados.",
    "Refaça o diagnóstico em 3-6 meses para acompanhar sua evolução e celebrar seu progresso.",
  ];

  nextSteps.forEach((step, i) => {
    y = checkPageBreak(ctx, y, 12, "Próximos Passos");

    pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.circle(margin + 5, y - 1, 3, "F");
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text((i + 1).toString(), margin + 5, y + 0.5, { align: "center" });

    const stepLines = wrapText(pdf, step, contentWidth - 16, 9.5);
    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50, 50, 50);
    stepLines.forEach((line: string, li: number) => {
      pdf.text(line, margin + 14, y + li * 5);
    });
    y += stepLines.length * 5 + 5;
  });

  y += 10;

  // Inspirational closing quote
  y = checkPageBreak(ctx, y, 30, "Próximos Passos");
  pdf.setFillColor(primaryColorLight.r, primaryColorLight.g, primaryColorLight.b);
  pdf.roundedRect(margin, y, contentWidth, 30, 4, 4, "F");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text(
    '"Entre estímulo e resposta há um espaço. Nesse espaço está o nosso poder',
    pageWidth / 2,
    y + 10,
    { align: "center" }
  );
  pdf.text(
    'de escolher nossa resposta. Na nossa resposta está nosso crescimento e nossa liberdade."',
    pageWidth / 2,
    y + 16,
    { align: "center" }
  );
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("— Viktor Frankl", pageWidth / 2, y + 24, { align: "center" });

  y += 40;

  // Facilitator info
  if (data.facilitatorProfile?.full_name) {
    y = checkPageBreak(ctx, y, 20, "Próximos Passos");
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin + 30, y, pageWidth - margin - 30, y);
    y += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Facilitado por ${data.facilitatorProfile.full_name}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 6;
    pdf.setFontSize(9);
    pdf.text("Para agendar uma sessão de feedback, entre em contato com seu facilitador.", pageWidth / 2, y, {
      align: "center",
    });
  }
}

// ============================================================
// MAIN EXPORT FUNCTION
// ============================================================

/**
 * Generates a comprehensive PDF from the diagnostic results using native jsPDF rendering.
 * This approach creates a professional multi-page document with full control over layout and design.
 */
export async function generateDiagnosticPDF(
  _contentRef: HTMLElement,
  data: PDFGeneratorOptions
): Promise<void> {
  // ==================== NORMALIZE DIMENSION NAMES ====================
  // The database stores dimension names as slugs (e.g. "conexao_proposito")
  // but all content modules expect formatted names (e.g. "Conexão e Propósito").
  // We normalize here so every downstream function receives the correct names.
  const normalizedData: PDFGeneratorOptions = {
    ...data,
    dimensionScores: normalizeDimensionScores(data.dimensionScores),
  };

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Determine colors
  const primaryColor = normalizedData.facilitatorProfile?.primary_color
    ? hexToRgb(normalizedData.facilitatorProfile!.primary_color!)
    : { r: 139, g: 92, b: 246 }; // Default purple

  const primaryColorLight = lightenColor(primaryColor, 0.88);

  // Create page context
  const ctx: PageContext = {
    pdf,
    pageWidth,
    pageHeight,
    margin,
    contentWidth,
    primaryColor,
    primaryColorLight,
    facilitatorName: normalizedData.facilitatorProfile?.full_name || "",
    participantName: normalizedData.participantName,
    totalPages: 0, // Will be updated at the end
    currentPage: 1,
  };

  // Determine strong/weak dimensions
  const strongDimensions = getStrongestDimensions(normalizedData.dimensionScores);
  const weakDimensions = getWeakestDimensions(normalizedData.dimensionScores);
  const strongSet = new Set(strongDimensions.map((d) => d.dimension));
  const weakSet = new Set(weakDimensions.map((d) => d.dimension));

  // ==================== BUILD DOCUMENT ====================

  // Page 1: Cover
  drawCoverPage(ctx, normalizedData);

  // Page 2: Welcome / About
  drawWelcomePage(ctx, normalizedData);

  // Page 3: Executive Summary + Radar
  drawExecutiveSummaryPage(ctx, normalizedData);

  // Pages 4-8: Dimension Details (one per dimension)
  const sortedScores = [...normalizedData.dimensionScores].sort(
    (a, b) => a.dimensionOrder - b.dimensionOrder
  );
  sortedScores.forEach((score) => {
    drawDimensionPage(ctx, score, strongSet.has(score.dimension), weakSet.has(score.dimension));
  });

  // Cross Analysis
  drawCrossAnalysisPage(ctx, normalizedData);

  // Recommendations
  drawRecommendationsPage(ctx, normalizedData);

  // Action Plan
  drawActionPlanPage(ctx, normalizedData);

  // Closing Page
  drawClosingPage(ctx, normalizedData);

  // ==================== UPDATE PAGE NUMBERS ====================
  const totalPages = pdf.getNumberOfPages();

  // Re-add headers and footers with correct total page count
  // (We already added them per page, but the page count in footer
  // uses currentPage which is correct for each page)

  // ==================== SAVE ====================
  const sanitizedName = normalizedData.participantName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `diagnostico-iq-is-${sanitizedName}-${dateStr}.pdf`;

  pdf.save(fileName);
}

/**
 * Generates a PDF for a participant from the facilitator view
 * (similar to main function but accepts pre-formatted data)
 */
export async function generateParticipantPDF(
  contentRef: HTMLElement,
  participantName: string,
  totalScore: number,
  dimensionScores: DimensionScore[],
  completedAt: string
): Promise<void> {
  return generateDiagnosticPDF(contentRef, {
    participantName,
    totalScore,
    dimensionScores,
    recommendations: [],
    completedAt,
  });
}
