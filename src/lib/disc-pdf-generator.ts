import jsPDF from "jspdf";
import {
  DiscDimensionScore,
  DiscProfile,
  getDiscScoreLevel,
} from "./disc-scoring";
import {
  DISC_DIMENSIONS,
  DiscProfileDetail,
  DiscRecommendation,
  DiscWeeklyPlan,
} from "./disc-descriptions";

// ============================================================
// Types
// ============================================================

interface DiscPDFData {
  participantName: string;
  dimensionScores: DiscDimensionScore[];
  profile: DiscProfile;
  profileDetail: DiscProfileDetail;
  recommendations: DiscRecommendation[];
  actionPlan: DiscWeeklyPlan[];
  facilitatorName?: string;
}

// ============================================================
// Constants
// ============================================================

const COLORS = {
  primary: [168, 78, 22] as [number, number, number], // warm terracotta
  primaryLight: [210, 140, 90] as [number, number, number],
  D: [200, 40, 40] as [number, number, number],
  I: [220, 145, 20] as [number, number, number],
  S: [30, 145, 70] as [number, number, number],
  C: [40, 90, 210] as [number, number, number],
  dark: [25, 25, 30] as [number, number, number],
  text: [50, 50, 55] as [number, number, number],
  muted: [130, 130, 140] as [number, number, number],
  light: [247, 244, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  divider: [225, 220, 215] as [number, number, number],
  greenBg: [240, 253, 244] as [number, number, number],
  greenText: [22, 120, 60] as [number, number, number],
  amberBg: [255, 251, 235] as [number, number, number],
  amberText: [160, 100, 10] as [number, number, number],
  redText: [180, 40, 40] as [number, number, number],
};

const PAGE = {
  width: 210,
  height: 297,
  marginLeft: 22,
  marginRight: 22,
  marginTop: 28,
  marginBottom: 28,
  get contentWidth() {
    return this.width - this.marginLeft - this.marginRight;
  },
};

function getDimColor(dim: string): [number, number, number] {
  return (
    (COLORS[dim as keyof typeof COLORS] as [number, number, number]) ||
    COLORS.muted
  );
}

/**
 * Lighten a color by mixing it with white.
 * amount: 0 = original, 1 = white
 */
function lightenColor(
  color: [number, number, number],
  amount: number
): [number, number, number] {
  return [
    Math.round(color[0] + (255 - color[0]) * amount),
    Math.round(color[1] + (255 - color[1]) * amount),
    Math.round(color[2] + (255 - color[2]) * amount),
  ];
}

// ============================================================
// Utility Functions
// ============================================================

function addHeader(doc: jsPDF, sectionTitle: string) {
  // Thin colored accent line at top
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 2, "F");

  // Header background
  doc.setFillColor(...COLORS.white);
  doc.rect(0, 2, PAGE.width, 16, "F");

  // Bottom border
  doc.setDrawColor(...COLORS.divider);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginLeft, 17, PAGE.width - PAGE.marginRight, 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.primary);
  doc.text("PERFIL DISC", PAGE.marginLeft, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(sectionTitle, PAGE.width - PAGE.marginRight, 11, {
    align: "right",
  });
}

function addFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  participantName: string,
  facilitatorName?: string
) {
  const y = PAGE.height - 14;

  // Divider line
  doc.setDrawColor(...COLORS.divider);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginLeft, y - 3, PAGE.width - PAGE.marginRight, y - 3);

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");

  const leftText = facilitatorName
    ? `Gerado por ${facilitatorName} via Karina Bonadiu`
    : "Gerado via Karina Bonadiu";
  doc.text(leftText, PAGE.marginLeft, y);
  doc.text(participantName, PAGE.width / 2, y, { align: "center" });
  doc.text(`${pageNum} / ${totalPages}`, PAGE.width - PAGE.marginRight, y, {
    align: "right",
  });
}

function wrapText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string, i: number) => {
    doc.text(line, x, y + i * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function measureWrappedText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  return lines.length * lineHeight;
}

function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  neededSpace: number,
  sectionTitle: string
): number {
  if (currentY + neededSpace > PAGE.height - PAGE.marginBottom - 18) {
    doc.addPage();
    addHeader(doc, sectionTitle);
    return PAGE.marginTop + 2;
  }
  return currentY;
}

/**
 * Draw a small decorative accent bar (used before section titles).
 */
function drawSectionAccent(
  doc: jsPDF,
  x: number,
  y: number,
  color: [number, number, number]
) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, 28, 2.5, 1.2, 1.2, "F");
}

// ============================================================
// Page Generators
// ============================================================

function addCoverPage(doc: jsPDF, data: DiscPDFData) {
  // Full page light background
  doc.setFillColor(...COLORS.light);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");

  // Top colored band
  const primaryColor = getDimColor(data.profile.primary);
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, PAGE.width, 85, "F");

  // Subtle darker strip at top
  const darkerPrimary = lightenColor(primaryColor, -0.15);
  doc.setFillColor(...darkerPrimary);
  doc.rect(0, 0, PAGE.width, 3, "F");

  // "PERFIL DISC" label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("PERFIL DISC", PAGE.width / 2, 28, { align: "center" });

  // Decorative thin line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(PAGE.width / 2 - 20, 32, PAGE.width / 2 + 20, 32);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(
    "Análise de Perfil Comportamental",
    PAGE.width / 2,
    39,
    { align: "center" }
  );

  // Participant name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(data.participantName, PAGE.width / 2, 60, { align: "center" });

  // Profile badge area
  const badgeY = 100;
  const circleX = PAGE.width / 2;

  // Outer ring (decorative)
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.circle(circleX, badgeY, 28, "S");

  // Inner filled circle
  doc.setFillColor(...primaryColor);
  doc.circle(circleX, badgeY, 24, "F");

  // Profile letters — centered properly
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  const profileText = `${data.profile.primary}${data.profile.secondary}`;
  doc.setFontSize(26);
  doc.text(profileText, circleX, badgeY + 4, { align: "center" });

  // Small label under circle
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Perfil Comportamental", circleX, badgeY + 38, {
    align: "center",
  });

  // Profile title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.dark);
  doc.text(data.profileDetail.title, circleX, badgeY + 50, {
    align: "center",
  });

  // Profile label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  doc.text(data.profile.label, circleX, badgeY + 59, { align: "center" });

  // Bar chart
  const chartY = badgeY + 70;
  const barWidth = 28;
  const barGap = 14;
  const maxBarHeight = 48;
  const totalChartWidth =
    data.dimensionScores.length * barWidth +
    (data.dimensionScores.length - 1) * barGap;
  const startX = PAGE.width / 2 - totalChartWidth / 2;

  // Baseline
  doc.setDrawColor(...COLORS.divider);
  doc.setLineWidth(0.3);
  doc.line(
    startX - 5,
    chartY + maxBarHeight,
    startX + totalChartWidth + 5,
    chartY + maxBarHeight
  );

  data.dimensionScores.forEach((score, i) => {
    const x = startX + i * (barWidth + barGap);
    const barHeight = Math.max((score.percentage / 100) * maxBarHeight, 5);
    const barY = chartY + maxBarHeight - barHeight;
    const color = getDimColor(score.dimension);

    // Bar shadow (subtle)
    doc.setFillColor(...lightenColor(color, 0.7));
    doc.roundedRect(x + 1, barY + 1, barWidth, barHeight, 2, 2, "F");

    // Bar
    doc.setFillColor(...color);
    doc.roundedRect(x, barY, barWidth, barHeight, 2, 2, "F");

    // Percentage above bar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(`${Math.round(score.percentage)}%`, x + barWidth / 2, barY - 4, {
      align: "center",
    });

    // Letter badge below bar
    doc.setFillColor(...color);
    doc.circle(x + barWidth / 2, chartY + maxBarHeight + 12, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text(score.dimension, x + barWidth / 2, chartY + maxBarHeight + 15, {
      align: "center",
    });

    // Dimension name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      score.dimensionLabel,
      x + barWidth / 2,
      chartY + maxBarHeight + 26,
      { align: "center" }
    );
  });

  // Date and facilitator at bottom
  const bottomY = PAGE.height - 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    PAGE.width / 2,
    bottomY,
    { align: "center" }
  );

  if (data.facilitatorName) {
    doc.text(
      `Facilitado por ${data.facilitatorName}`,
      PAGE.width / 2,
      bottomY + 7,
      { align: "center" }
    );
  }

  // Bottom accent line
  doc.setFillColor(...primaryColor);
  doc.rect(0, PAGE.height - 4, PAGE.width, 4, "F");
}

function addAboutPage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();
  addHeader(doc, "Sobre o DISC");

  let y = PAGE.marginTop + 2;

  // Section accent
  drawSectionAccent(doc, PAGE.marginLeft, y, COLORS.primary);
  y += 8;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text("Sobre o Perfil DISC", PAGE.marginLeft, y);
  y += 10;

  // Intro text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.text);
  y = wrapText(
    doc,
    "O DISC é uma das ferramentas de avaliação comportamental mais utilizadas no mundo, com mais de 40 milhões de pessoas avaliadas. Baseado nos estudos do psicólogo William Moulton Marston (1928), o modelo mapeia quatro dimensões fundamentais do comportamento humano observável.",
    PAGE.marginLeft,
    y,
    PAGE.contentWidth,
    5
  );
  y += 4;

  y = wrapText(
    doc,
    "Cada pessoa possui uma combinação única dessas quatro dimensões, que influencia como se comunica, toma decisões, lida com conflitos e se relaciona com os outros. Não existem perfis 'melhores' ou 'piores' — cada combinação traz forças e áreas de atenção específicas.",
    PAGE.marginLeft,
    y,
    PAGE.contentWidth,
    5
  );
  y += 10;

  // Four dimensions subtitle
  drawSectionAccent(doc, PAGE.marginLeft, y, COLORS.primary);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.dark);
  doc.text("As Quatro Dimensões", PAGE.marginLeft, y);
  y += 10;

  const dims = ["D", "I", "S", "C"];
  dims.forEach((dim) => {
    const info = DISC_DIMENSIONS[dim];
    if (!info) return;
    const color = getDimColor(dim);
    const bgColor = lightenColor(color, 0.88);

    // Calculate dynamic height based on content
    doc.setFontSize(8);
    const descText = info.about.length > 220 ? info.about.substring(0, 220) + "..." : info.about;
    const descLines = doc.splitTextToSize(descText, PAGE.contentWidth - 38);
    const descHeight = Math.min(descLines.length, 4) * 4.2;
    const boxHeight = Math.max(38, 22 + descHeight);

    // Dimension box with lighter background
    doc.setFillColor(...bgColor);
    doc.roundedRect(PAGE.marginLeft, y - 4, PAGE.contentWidth, boxHeight, 3, 3, "F");

    // Left color accent bar
    doc.setFillColor(...color);
    doc.roundedRect(PAGE.marginLeft, y - 4, 4, boxHeight, 2, 0, "F");

    // Letter circle
    doc.setFillColor(...color);
    doc.circle(PAGE.marginLeft + 16, y + 10, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.white);
    doc.text(dim, PAGE.marginLeft + 16, y + 14, { align: "center" });

    // Name and tagline
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.text(info.name, PAGE.marginLeft + 30, y + 6);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text(info.tagline, PAGE.marginLeft + 30, y + 13);

    // Short description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    descLines.slice(0, 4).forEach((line: string, i: number) => {
      doc.text(line, PAGE.marginLeft + 30, y + 20 + i * 4.2);
    });

    y += boxHeight + 6;
  });
}

function addProfilePage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();
  addHeader(doc, "Seu Perfil");

  let y = PAGE.marginTop + 2;

  // Section accent
  drawSectionAccent(doc, PAGE.marginLeft, y, getDimColor(data.profile.primary));
  y += 8;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text(`Seu Perfil: ${data.profileDetail.title}`, PAGE.marginLeft, y);
  y += 10;

  // Profile badge banner
  const primaryColor = getDimColor(data.profile.primary);
  const secondaryColor = getDimColor(data.profile.secondary);

  doc.setFillColor(...primaryColor);
  doc.roundedRect(PAGE.marginLeft, y - 3, PAGE.contentWidth, 30, 3, 3, "F");

  // Small secondary color accent on right
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(
    PAGE.marginLeft + PAGE.contentWidth - 4,
    y - 3,
    4,
    30,
    0,
    2,
    "F"
  );

  // Profile letters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  doc.text(
    `${data.profile.primary}${data.profile.secondary}`,
    PAGE.marginLeft + 15,
    y + 14,
    { align: "center" }
  );

  // Profile label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text(data.profile.label, PAGE.marginLeft + 30, y + 10);

  // Primary / Secondary info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const primaryName =
    DISC_DIMENSIONS[data.profile.primary]?.name || data.profile.primary;
  const secondaryName =
    DISC_DIMENSIONS[data.profile.secondary]?.name || data.profile.secondary;
  doc.text(
    `Primário: ${primaryName}  |  Secundário: ${secondaryName}`,
    PAGE.marginLeft + 30,
    y + 18
  );
  y += 38;

  // Summary
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.text);
  y = wrapText(
    doc,
    data.profileDetail.summary,
    PAGE.marginLeft,
    y,
    PAGE.contentWidth,
    5
  );
  y += 8;

  // How you work
  if (data.profileDetail.howYouWork) {
    y = checkPageBreak(doc, y, 30, "Seu Perfil");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text("Como Você Trabalha", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.text);
    y = wrapText(
      doc,
      data.profileDetail.howYouWork,
      PAGE.marginLeft,
      y,
      PAGE.contentWidth,
      5
    );
    y += 8;
  }

  // How you lead
  if (data.profileDetail.howYouLead) {
    y = checkPageBreak(doc, y, 30, "Seu Perfil");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text("Como Você Lidera", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.text);
    y = wrapText(
      doc,
      data.profileDetail.howYouLead,
      PAGE.marginLeft,
      y,
      PAGE.contentWidth,
      5
    );
    y += 8;
  }

  // How you relate
  if (data.profileDetail.howYouRelate) {
    y = checkPageBreak(doc, y, 30, "Seu Perfil");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text("Como Você se Relaciona", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.text);
    y = wrapText(
      doc,
      data.profileDetail.howYouRelate,
      PAGE.marginLeft,
      y,
      PAGE.contentWidth,
      5
    );
    y += 8;
  }

  // Growth tips
  if (data.profileDetail.growthTips.length > 0) {
    y = checkPageBreak(doc, y, 40, "Seu Perfil");

    drawSectionAccent(doc, PAGE.marginLeft, y, COLORS.primary);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text("Dicas de Crescimento", PAGE.marginLeft, y);
    y += 8;

    data.profileDetail.growthTips.forEach((tip, i) => {
      y = checkPageBreak(doc, y, 14, "Seu Perfil");

      // Number badge
      doc.setFillColor(...COLORS.primary);
      doc.circle(PAGE.marginLeft + 5, y, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.white);
      doc.text(`${i + 1}`, PAGE.marginLeft + 5, y + 2.5, { align: "center" });

      // Tip text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      y = wrapText(
        doc,
        tip,
        PAGE.marginLeft + 14,
        y,
        PAGE.contentWidth - 14,
        4.5
      );
      y += 5;
    });
  }
}

function addDimensionPages(doc: jsPDF, data: DiscPDFData) {
  data.dimensionScores.forEach((score) => {
    const info = DISC_DIMENSIONS[score.dimension];
    if (!info) return;
    const color = getDimColor(score.dimension);
    const level = getDiscScoreLevel(score.percentage);

    doc.addPage();
    addHeader(doc, info.name);

    // Colored header bar
    doc.setFillColor(...color);
    doc.rect(0, 18, PAGE.width, 32, "F");

    // Dimension letter circle
    doc.setFillColor(...COLORS.white);
    doc.circle(PAGE.marginLeft + 14, 34, 11, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...color);
    doc.text(score.dimension, PAGE.marginLeft + 14, 38, { align: "center" });

    // Dimension name and tagline
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...COLORS.white);
    doc.text(info.name, PAGE.marginLeft + 30, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(info.tagline, PAGE.marginLeft + 30, 40);

    // Score on the right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      `${score.score.toFixed(1)} / 5`,
      PAGE.width - PAGE.marginRight - 5,
      34,
      { align: "right" }
    );
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(level.label, PAGE.width - PAGE.marginRight - 5, 42, {
      align: "right",
    });

    let y = 60;

    // Progress bar
    doc.setFillColor(230, 225, 220);
    doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 6, 3, 3, "F");
    const barWidth = (score.percentage / 100) * PAGE.contentWidth;
    doc.setFillColor(...color);
    doc.roundedRect(
      PAGE.marginLeft,
      y,
      Math.max(barWidth, 6),
      6,
      3,
      3,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...color);
    doc.text(
      `${Math.round(score.percentage)}% do potencial máximo`,
      PAGE.width - PAGE.marginRight,
      y - 2,
      { align: "right" }
    );
    y += 14;

    // About
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, info.about, PAGE.marginLeft, y, PAGE.contentWidth, 5);
    y += 8;

    // Strengths and Challenges side by side — dynamic height
    const colWidth = (PAGE.contentWidth - 8) / 2;
    const rightX = PAGE.marginLeft + colWidth + 8;

    // Measure content heights
    doc.setFontSize(8.5);
    const strengthsItemHeight = 5.5;
    const challengesItemHeight = 5.5;
    const strengthsContentH =
      14 + info.strengths.length * strengthsItemHeight + 4;
    const challengesContentH =
      14 + info.challenges.length * challengesItemHeight + 4;
    const boxHeight = Math.max(strengthsContentH, challengesContentH);

    y = checkPageBreak(doc, y, boxHeight + 10, info.name);

    // Strengths box
    doc.setFillColor(...COLORS.greenBg);
    doc.roundedRect(PAGE.marginLeft, y - 3, colWidth, boxHeight, 3, 3, "F");
    // Left accent
    doc.setFillColor(22, 163, 74);
    doc.roundedRect(PAGE.marginLeft, y - 3, 3, boxHeight, 1.5, 0, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text("Pontos Fortes", PAGE.marginLeft + 8, y + 6);

    let sy = y + 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.greenText);
    info.strengths.forEach((s) => {
      if (sy < y + boxHeight - 2) {
        // Bullet dot
        doc.setFillColor(...COLORS.greenText);
        doc.circle(PAGE.marginLeft + 9, sy - 1, 1, "F");
        doc.text(s, PAGE.marginLeft + 14, sy);
        sy += strengthsItemHeight;
      }
    });

    // Challenges box
    doc.setFillColor(...COLORS.amberBg);
    doc.roundedRect(rightX, y - 3, colWidth, boxHeight, 3, 3, "F");
    // Left accent
    doc.setFillColor(200, 140, 20);
    doc.roundedRect(rightX, y - 3, 3, boxHeight, 1.5, 0, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 120, 10);
    doc.text("Pontos de Atenção", rightX + 8, y + 6);

    let cy = y + 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.amberText);
    info.challenges.forEach((c) => {
      if (cy < y + boxHeight - 2) {
        // Bullet dot
        doc.setFillColor(...COLORS.amberText);
        doc.circle(rightX + 9, cy - 1, 1, "F");
        doc.text(c, rightX + 14, cy);
        cy += challengesItemHeight;
      }
    });

    y += boxHeight + 8;

    // Communication
    y = checkPageBreak(doc, y, 35, info.name);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.dark);
    doc.text("Comunicação", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    y = wrapText(
      doc,
      info.communication,
      PAGE.marginLeft,
      y,
      PAGE.contentWidth,
      4.5
    );
    y += 7;

    // Under Pressure
    y = checkPageBreak(doc, y, 35, info.name);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.dark);
    doc.text("Sob Pressão", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    y = wrapText(
      doc,
      info.underPressure,
      PAGE.marginLeft,
      y,
      PAGE.contentWidth,
      4.5
    );
    y += 7;

    // Ideal Environment
    y = checkPageBreak(doc, y, 35, info.name);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.dark);
    doc.text("Ambiente Ideal", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    y = wrapText(
      doc,
      info.idealEnvironment,
      PAGE.marginLeft,
      y,
      PAGE.contentWidth,
      4.5
    );
    y += 7;

    // Motivators and Fears
    y = checkPageBreak(doc, y, 45, info.name);
    const motColWidth = (PAGE.contentWidth - 8) / 2;

    // Motivators header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text("Motivadores", PAGE.marginLeft, y);
    doc.setTextColor(...COLORS.redText);
    doc.text("Receios", PAGE.marginLeft + motColWidth + 8, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const maxItems = Math.max(info.motivators.length, info.fears.length);
    for (let i = 0; i < maxItems; i++) {
      y = checkPageBreak(doc, y, 6, info.name);
      if (info.motivators[i]) {
        doc.setFillColor(22, 163, 74);
        doc.circle(PAGE.marginLeft + 3, y - 1, 1.2, "F");
        doc.setTextColor(...COLORS.greenText);
        doc.text(info.motivators[i], PAGE.marginLeft + 8, y);
      }
      if (info.fears[i]) {
        doc.setFillColor(...COLORS.redText);
        doc.circle(PAGE.marginLeft + motColWidth + 11, y - 1, 1.2, "F");
        doc.setTextColor(...COLORS.redText);
        doc.text(info.fears[i], PAGE.marginLeft + motColWidth + 16, y);
      }
      y += 5.5;
    }
  });
}

function addRecommendationsPage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();
  addHeader(doc, "Recomendações");

  let y = PAGE.marginTop + 2;

  // Section accent
  drawSectionAccent(doc, PAGE.marginLeft, y, COLORS.primary);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text("Recomendações de Desenvolvimento", PAGE.marginLeft, y);
  y += 12;

  data.recommendations.forEach((rec, i) => {
    // Measure description height to size the card dynamically
    doc.setFontSize(8.5);
    const descHeight = measureWrappedText(
      doc,
      rec.description,
      PAGE.contentWidth - 24,
      4.2
    );
    const cardHeight = Math.max(28, 18 + descHeight + 2);

    y = checkPageBreak(doc, y, cardHeight + 6, "Recomendações");

    // Card background
    doc.setFillColor(...COLORS.light);
    doc.roundedRect(
      PAGE.marginLeft,
      y - 3,
      PAGE.contentWidth,
      cardHeight,
      3,
      3,
      "F"
    );

    // Left accent bar
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(PAGE.marginLeft, y - 3, 3, cardHeight, 1.5, 0, "F");

    // Number badge
    doc.setFillColor(...COLORS.primary);
    doc.circle(PAGE.marginLeft + 12, y + 7, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.white);
    doc.text(`${i + 1}`, PAGE.marginLeft + 12, y + 9.5, { align: "center" });

    // Practice name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.dark);
    doc.text(rec.practice, PAGE.marginLeft + 22, y + 5);

    // Area and frequency
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `${rec.area}  •  ${rec.frequency}`,
      PAGE.marginLeft + 22,
      y + 11
    );

    // Description
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.text);
    wrapText(
      doc,
      rec.description,
      PAGE.marginLeft + 22,
      y + 17,
      PAGE.contentWidth - 24,
      4.2
    );

    y += cardHeight + 6;
  });
}

function addActionPlanPage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();
  addHeader(doc, "Plano de Ação");

  let y = PAGE.marginTop + 2;

  // Section accent
  drawSectionAccent(doc, PAGE.marginLeft, y, COLORS.primary);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text("Plano de Ação — 4 Semanas", PAGE.marginLeft, y);
  y += 12;

  data.actionPlan.forEach((week) => {
    // Estimate needed space
    const activitiesSpace = week.activities.length * 8 + 20;
    y = checkPageBreak(doc, y, activitiesSpace, "Plano de Ação");

    // Week header
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(
      PAGE.marginLeft,
      y - 3,
      PAGE.contentWidth,
      16,
      3,
      3,
      "F"
    );

    // Week number circle
    doc.setFillColor(...COLORS.white);
    doc.circle(PAGE.marginLeft + 10, y + 5, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.primary);
    doc.text(`${week.week}`, PAGE.marginLeft + 10, y + 7.5, {
      align: "center",
    });

    // Week title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text(`Semana ${week.week}: ${week.theme}`, PAGE.marginLeft + 20, y + 4);

    // Goal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Meta: ${week.goal}`, PAGE.marginLeft + 20, y + 10);
    y += 18;

    // Activities
    week.activities.forEach((activity) => {
      y = checkPageBreak(doc, y, 12, "Plano de Ação");

      // Bullet
      doc.setFillColor(...COLORS.primary);
      doc.circle(PAGE.marginLeft + 6, y, 1.5, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      y = wrapText(
        doc,
        activity,
        PAGE.marginLeft + 14,
        y,
        PAGE.contentWidth - 16,
        4.5
      );
      y += 3;
    });

    y += 8;
  });
}

function addClosingPage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();

  // Background
  doc.setFillColor(...COLORS.light);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");

  const primaryColor = getDimColor(data.profile.primary);

  // Top accent bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, PAGE.width, 4, "F");

  let y = 55;

  // Decorative accent
  drawSectionAccent(doc, PAGE.width / 2 - 14, y, primaryColor);
  y += 12;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.dark);
  doc.text("Próximos Passos", PAGE.width / 2, y, { align: "center" });
  y += 16;

  // Steps
  const steps = [
    "Releia este relatório com calma e identifique os pontos que mais ressoam com você.",
    "Compartilhe seu perfil DISC com pessoas próximas e peça feedback.",
    "Comece o plano de ação de 4 semanas proposto neste relatório.",
    "Agende uma sessão com seu facilitador para aprofundar a análise.",
    "Lembre-se: o DISC é uma ferramenta de autoconhecimento, não um rótulo.",
  ];

  steps.forEach((step, i) => {
    // Number circle
    doc.setFillColor(...primaryColor);
    doc.circle(PAGE.marginLeft + 10, y + 1, 5.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.white);
    doc.text(`${i + 1}`, PAGE.marginLeft + 10, y + 4, { align: "center" });

    // Step text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    wrapText(doc, step, PAGE.marginLeft + 22, y, PAGE.contentWidth - 28, 5);
    y += 16;
  });

  y += 8;

  // Quote box — using a light tint of the primary color (no alpha needed)
  const quoteBg = lightenColor(primaryColor, 0.88);
  doc.setFillColor(...quoteBg);
  doc.roundedRect(
    PAGE.marginLeft + 10,
    y - 5,
    PAGE.contentWidth - 20,
    32,
    4,
    4,
    "F"
  );

  // Left decorative bar on quote
  doc.setFillColor(...primaryColor);
  doc.roundedRect(PAGE.marginLeft + 10, y - 5, 3, 32, 1.5, 0, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  const quote =
    '"Conhecer os outros é inteligência, conhecer a si mesmo é sabedoria."';
  doc.text(quote, PAGE.width / 2, y + 9, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("— Lao Tzu", PAGE.width / 2, y + 18, { align: "center" });

  y += 48;

  // Facilitator info
  if (data.facilitatorName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text("Facilitado por", PAGE.width / 2, y, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.dark);
    doc.text(data.facilitatorName, PAGE.width / 2, y + 10, {
      align: "center",
    });
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Perfil DISC via Karina Bonadiu © ${new Date().getFullYear()}`,
    PAGE.width / 2,
    PAGE.height - 20,
    { align: "center" }
  );

  // Bottom accent bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, PAGE.height - 4, PAGE.width, 4, "F");
}

// ============================================================
// Main Generator
// ============================================================

export async function generateDiscPDF(data: DiscPDFData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // 1. Cover page
  addCoverPage(doc, data);

  // 2. About DISC
  addAboutPage(doc, data);

  // 3. Your Profile
  addProfilePage(doc, data);

  // 4. Dimension detail pages (4 pages)
  addDimensionPages(doc, data);

  // 5. Recommendations
  addRecommendationsPage(doc, data);

  // 6. Action Plan
  addActionPlanPage(doc, data);

  // 7. Closing
  addClosingPage(doc, data);

  // Add footers to all pages (skip cover)
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages, data.participantName, data.facilitatorName);
  }

  // Save
  const fileName = `perfil-disc-${data.participantName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
