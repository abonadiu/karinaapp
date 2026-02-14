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
  primary: [198, 93, 26] as [number, number, number], // terracotta
  D: [220, 38, 38] as [number, number, number],
  I: [245, 158, 11] as [number, number, number],
  S: [22, 163, 74] as [number, number, number],
  C: [37, 99, 235] as [number, number, number],
  dark: [30, 20, 15] as [number, number, number],
  text: [60, 45, 35] as [number, number, number],
  muted: [120, 100, 85] as [number, number, number],
  light: [245, 240, 235] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
};

const PAGE = {
  width: 210,
  height: 297,
  marginLeft: 20,
  marginRight: 20,
  marginTop: 25,
  marginBottom: 25,
  contentWidth: 170,
};

function getDimColor(dim: string): [number, number, number] {
  return COLORS[dim as keyof typeof COLORS] as [number, number, number] || COLORS.muted;
}

// ============================================================
// Utility Functions
// ============================================================

function addHeader(doc: jsPDF, sectionTitle: string) {
  doc.setFillColor(...COLORS.light);
  doc.rect(0, 0, PAGE.width, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.primary);
  doc.text("PERFIL DISC", PAGE.marginLeft, 11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(sectionTitle, PAGE.width - PAGE.marginRight, 11, { align: "right" });
}

function addFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  participantName: string,
  facilitatorName?: string
) {
  const y = PAGE.height - 12;
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginLeft, y - 4, PAGE.width - PAGE.marginRight, y - 4);

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "normal");

  const leftText = facilitatorName
    ? `Gerado por ${facilitatorName} via IQ+IS`
    : "Gerado via IQ+IS";
  doc.text(leftText, PAGE.marginLeft, y);
  doc.text(participantName, PAGE.width / 2, y, { align: "center" });
  doc.text(`${pageNum}/${totalPages}`, PAGE.width - PAGE.marginRight, y, {
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

function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  neededSpace: number,
  sectionTitle: string
): number {
  if (currentY + neededSpace > PAGE.height - PAGE.marginBottom - 15) {
    doc.addPage();
    addHeader(doc, sectionTitle);
    return PAGE.marginTop + 5;
  }
  return currentY;
}

// ============================================================
// Page Generators
// ============================================================

function addCoverPage(doc: jsPDF, data: DiscPDFData) {
  // Background gradient effect
  doc.setFillColor(...COLORS.light);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");

  // Top colored bar with gradient
  const primaryColor = getDimColor(data.profile.primary);
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, PAGE.width, 80, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  doc.text("PERFIL DISC", PAGE.width / 2, 30, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Análise de Perfil Comportamental", PAGE.width / 2, 40, {
    align: "center",
  });

  // Participant name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(data.participantName, PAGE.width / 2, 60, { align: "center" });

  // Profile badge area
  const badgeY = 100;

  // Large profile circle
  const circleX = PAGE.width / 2;
  doc.setFillColor(...primaryColor);
  doc.circle(circleX, badgeY + 15, 25, "F");

  // Profile letters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.text(data.profile.primary, circleX - 6, badgeY + 18);
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(data.profile.secondary, circleX + 8, badgeY + 22);

  // Profile label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.dark);
  doc.text(data.profileDetail.title, PAGE.width / 2, badgeY + 55, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.muted);
  doc.text(data.profile.label, PAGE.width / 2, badgeY + 65, {
    align: "center",
  });

  // Bar chart
  const chartY = badgeY + 85;
  const barWidth = 30;
  const barGap = 12;
  const maxBarHeight = 60;
  const startX =
    PAGE.width / 2 -
    (data.dimensionScores.length * barWidth +
      (data.dimensionScores.length - 1) * barGap) /
      2;

  data.dimensionScores.forEach((score, i) => {
    const x = startX + i * (barWidth + barGap);
    const barHeight = Math.max((score.percentage / 100) * maxBarHeight, 4);
    const barY = chartY + maxBarHeight - barHeight;
    const color = getDimColor(score.dimension);

    // Bar
    doc.setFillColor(...color);
    doc.roundedRect(x, barY, barWidth, barHeight, 2, 2, "F");

    // Percentage above bar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(`${Math.round(score.percentage)}%`, x + barWidth / 2, barY - 3, {
      align: "center",
    });

    // Letter below bar
    doc.setFillColor(...color);
    doc.circle(x + barWidth / 2, chartY + maxBarHeight + 12, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text(
      score.dimension,
      x + barWidth / 2,
      chartY + maxBarHeight + 15,
      { align: "center" }
    );

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

  // Date and facilitator
  const bottomY = PAGE.height - 40;
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
      bottomY + 8,
      { align: "center" }
    );
  }
}

function addAboutPage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();
  addHeader(doc, "Sobre o DISC");

  let y = PAGE.marginTop + 5;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.dark);
  doc.text("Sobre o Perfil DISC", PAGE.marginLeft, y);
  y += 12;

  // Intro text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(
    doc,
    "O DISC é uma das ferramentas de avaliação comportamental mais utilizadas no mundo, com mais de 40 milhões de pessoas avaliadas. Baseado nos estudos do psicólogo William Moulton Marston (1928), o modelo mapeia quatro dimensões fundamentais do comportamento humano observável.",
    PAGE.marginLeft,
    y,
    PAGE.contentWidth,
    5
  );
  y += 5;

  y = wrapText(
    doc,
    "Cada pessoa possui uma combinação única dessas quatro dimensões, que influencia como se comunica, toma decisões, lida com conflitos e se relaciona com os outros. Não existem perfis 'melhores' ou 'piores' — cada combinação traz forças e áreas de atenção específicas.",
    PAGE.marginLeft,
    y,
    PAGE.contentWidth,
    5
  );
  y += 10;

  // Four dimensions
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

    // Dimension box
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(PAGE.marginLeft, y - 4, PAGE.contentWidth, 42, 3, 3, "F");

    // Letter circle
    doc.setFillColor(...COLORS.white);
    doc.circle(PAGE.marginLeft + 14, y + 12, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...color);
    doc.text(dim, PAGE.marginLeft + 14, y + 16, { align: "center" });

    // Name and tagline
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.white);
    doc.text(info.name, PAGE.marginLeft + 30, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(info.tagline, PAGE.marginLeft + 30, y + 15);

    // Short description
    doc.setFontSize(7.5);
    const descLines = doc.splitTextToSize(
      info.about.substring(0, 200) + "...",
      PAGE.contentWidth - 35
    );
    descLines.slice(0, 3).forEach((line: string, i: number) => {
      doc.text(line, PAGE.marginLeft + 30, y + 22 + i * 4);
    });

    y += 48;
  });
}

function addProfilePage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();
  addHeader(doc, "Seu Perfil");

  let y = PAGE.marginTop + 5;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.dark);
  doc.text(`Seu Perfil: ${data.profileDetail.title}`, PAGE.marginLeft, y);
  y += 10;

  // Profile badge
  const primaryColor = getDimColor(data.profile.primary);
  doc.setFillColor(...primaryColor);
  doc.roundedRect(PAGE.marginLeft, y - 3, PAGE.contentWidth, 28, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  doc.text(
    `${data.profile.primary}${data.profile.secondary}`,
    PAGE.marginLeft + 15,
    y + 14
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(data.profile.label, PAGE.marginLeft + 45, y + 10);
  doc.setFontSize(8);
  doc.text(
    `Perfil Primário: ${DISC_DIMENSIONS[data.profile.primary]?.name || data.profile.primary} | Secundário: ${DISC_DIMENSIONS[data.profile.secondary]?.name || data.profile.secondary}`,
    PAGE.marginLeft + 45,
    y + 18
  );
  y += 35;

  // Summary
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
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
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.text("Como Você Trabalha", PAGE.marginLeft, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
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
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.text("Como Você Lidera", PAGE.marginLeft, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
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
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.text("Como Você se Relaciona", PAGE.marginLeft, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
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
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.text("Dicas de Crescimento", PAGE.marginLeft, y);
    y += 8;

    data.profileDetail.growthTips.forEach((tip, i) => {
      y = checkPageBreak(doc, y, 12, "Seu Perfil");
      doc.setFillColor(...COLORS.amber);
      doc.circle(PAGE.marginLeft + 4, y - 1, 3.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.white);
      doc.text(`${i + 1}`, PAGE.marginLeft + 4, y + 1, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, tip, PAGE.marginLeft + 12, y, PAGE.contentWidth - 12, 4.5);
      y += 4;
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
    doc.rect(0, 18, PAGE.width, 30, "F");

    // Dimension letter and name
    doc.setFillColor(...COLORS.white);
    doc.circle(PAGE.marginLeft + 12, 33, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...color);
    doc.text(score.dimension, PAGE.marginLeft + 12, 37, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.white);
    doc.text(info.name, PAGE.marginLeft + 28, 31);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(info.tagline, PAGE.marginLeft + 28, 39);

    // Score display
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      `${score.score.toFixed(1)}/5`,
      PAGE.width - PAGE.marginRight - 5,
      33,
      { align: "right" }
    );
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(level.label, PAGE.width - PAGE.marginRight - 5, 40, {
      align: "right",
    });

    let y = 58;

    // Progress bar
    doc.setFillColor(230, 225, 220);
    doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 6, 3, 3, "F");
    const barWidth = (score.percentage / 100) * PAGE.contentWidth;
    doc.setFillColor(...color);
    doc.roundedRect(PAGE.marginLeft, y, Math.max(barWidth, 6), 6, 3, 3, "F");

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
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, info.about, PAGE.marginLeft, y, PAGE.contentWidth, 5);
    y += 8;

    // Strengths and Challenges side by side
    const colWidth = (PAGE.contentWidth - 6) / 2;

    // Strengths box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(PAGE.marginLeft, y - 3, colWidth, 65, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text("Pontos Fortes", PAGE.marginLeft + 5, y + 5);

    let sy = y + 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(22, 120, 60);
    info.strengths.forEach((s) => {
      if (sy < y + 60) {
        doc.text(`• ${s}`, PAGE.marginLeft + 5, sy);
        sy += 5;
      }
    });

    // Challenges box
    const rightX = PAGE.marginLeft + colWidth + 6;
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(rightX, y - 3, colWidth, 65, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 120, 10);
    doc.text("Pontos de Atenção", rightX + 5, y + 5);

    let cy = y + 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 100, 10);
    info.challenges.forEach((c) => {
      if (cy < y + 60) {
        doc.text(`• ${c}`, rightX + 5, cy);
        cy += 5;
      }
    });

    y += 72;

    // Communication
    y = checkPageBreak(doc, y, 35, info.name);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text("Comunicação", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, info.communication, PAGE.marginLeft, y, PAGE.contentWidth, 4.5);
    y += 6;

    // Under Pressure
    y = checkPageBreak(doc, y, 35, info.name);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text("Sob Pressão", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, info.underPressure, PAGE.marginLeft, y, PAGE.contentWidth, 4.5);
    y += 6;

    // Ideal Environment
    y = checkPageBreak(doc, y, 35, info.name);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text("Ambiente Ideal", PAGE.marginLeft, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, info.idealEnvironment, PAGE.marginLeft, y, PAGE.contentWidth, 4.5);
    y += 6;

    // Motivators and Fears
    y = checkPageBreak(doc, y, 40, info.name);
    const motColWidth = (PAGE.contentWidth - 6) / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.dark);
    doc.text("Motivadores", PAGE.marginLeft, y);
    doc.text("Receios", PAGE.marginLeft + motColWidth + 6, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.text);
    const maxItems = Math.max(info.motivators.length, info.fears.length);
    for (let i = 0; i < maxItems; i++) {
      if (info.motivators[i]) {
        doc.setTextColor(22, 163, 74);
        doc.text(`✓ ${info.motivators[i]}`, PAGE.marginLeft, y);
      }
      if (info.fears[i]) {
        doc.setTextColor(220, 38, 38);
        doc.text(`✗ ${info.fears[i]}`, PAGE.marginLeft + motColWidth + 6, y);
      }
      y += 5;
    }
  });
}

function addRecommendationsPage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();
  addHeader(doc, "Recomendações");

  let y = PAGE.marginTop + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.dark);
  doc.text("Recomendações de Desenvolvimento", PAGE.marginLeft, y);
  y += 12;

  data.recommendations.forEach((rec, i) => {
    y = checkPageBreak(doc, y, 35, "Recomendações");

    // Card background
    doc.setFillColor(...COLORS.light);
    doc.roundedRect(PAGE.marginLeft, y - 3, PAGE.contentWidth, 30, 3, 3, "F");

    // Number badge
    doc.setFillColor(...COLORS.primary);
    doc.circle(PAGE.marginLeft + 8, y + 8, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.white);
    doc.text(`${i + 1}`, PAGE.marginLeft + 8, y + 10, { align: "center" });

    // Area and frequency
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);
    doc.text(rec.practice, PAGE.marginLeft + 18, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(`${rec.area} • ${rec.frequency}`, PAGE.marginLeft + 18, y + 11);

    // Description
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    wrapText(doc, rec.description, PAGE.marginLeft + 18, y + 17, PAGE.contentWidth - 22, 4);

    y += 36;
  });
}

function addActionPlanPage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();
  addHeader(doc, "Plano de Ação");

  let y = PAGE.marginTop + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.dark);
  doc.text("Plano de Ação — 4 Semanas", PAGE.marginLeft, y);
  y += 12;

  data.actionPlan.forEach((week) => {
    y = checkPageBreak(doc, y, 55, "Plano de Ação");

    // Week header
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(PAGE.marginLeft, y - 3, PAGE.contentWidth, 14, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text(`Semana ${week.week}: ${week.theme}`, PAGE.marginLeft + 5, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`Meta: ${week.goal}`, PAGE.marginLeft + 5, y + 10);
    y += 16;

    // Activities
    week.activities.forEach((activity) => {
      y = checkPageBreak(doc, y, 10, "Plano de Ação");
      doc.setFillColor(...COLORS.primary);
      doc.circle(PAGE.marginLeft + 5, y, 1.5, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, activity, PAGE.marginLeft + 12, y, PAGE.contentWidth - 15, 4.5);
      y += 3;
    });

    y += 6;
  });
}

function addClosingPage(doc: jsPDF, data: DiscPDFData) {
  doc.addPage();

  // Background
  doc.setFillColor(...COLORS.light);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");

  const primaryColor = getDimColor(data.profile.primary);

  // Top bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, PAGE.width, 6, "F");

  let y = 60;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.dark);
  doc.text("Próximos Passos", PAGE.width / 2, y, { align: "center" });
  y += 15;

  // Steps
  const steps = [
    "Releia este relatório com calma e identifique os pontos que mais ressoam com você.",
    "Compartilhe seu perfil DISC com pessoas próximas e peça feedback.",
    "Comece o plano de ação de 4 semanas proposto neste relatório.",
    "Agende uma sessão com seu facilitador para aprofundar a análise.",
    "Lembre-se: o DISC é uma ferramenta de autoconhecimento, não um rótulo.",
  ];

  steps.forEach((step, i) => {
    doc.setFillColor(...primaryColor);
    doc.circle(PAGE.marginLeft + 8, y + 1, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.white);
    doc.text(`${i + 1}`, PAGE.marginLeft + 8, y + 3.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    wrapText(doc, step, PAGE.marginLeft + 20, y, PAGE.contentWidth - 25, 5);
    y += 14;
  });

  y += 10;

  // Quote
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  (doc as any).setGlobalAlpha?.(0.1);
  doc.roundedRect(PAGE.marginLeft + 10, y - 5, PAGE.contentWidth - 20, 30, 3, 3, "F");
  (doc as any).setGlobalAlpha?.(1);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  const quote =
    '"Conhecer os outros é inteligência, conhecer a si mesmo é sabedoria."';
  doc.text(quote, PAGE.width / 2, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("— Lao Tzu", PAGE.width / 2, y + 16, { align: "center" });

  y += 45;

  // Facilitator info
  if (data.facilitatorName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
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
    `Perfil DISC via IQ+IS © ${new Date().getFullYear()}`,
    PAGE.width / 2,
    PAGE.height - 20,
    { align: "center" }
  );
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

  // Add footers to all pages
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
