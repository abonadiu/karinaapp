import jsPDF from 'jspdf';
import type { SoulPlanResult, SoulPlanPosition } from './soul-plan-calculator';
import { getPositionInterpretation, POSITION_LABELS_PT } from './soul-plan-calculator';

// ============================================================
// INTERFACES
// ============================================================

interface SoulPlanPDFData {
  result: SoulPlanResult;
  participantName: string;
  facilitatorName?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  mundano: { r: 184, g: 134, b: 11 },     // #B8860B
  espiritual: { r: 123, g: 45, b: 142 },   // #7B2D8E
  destino: { r: 218, g: 165, b: 32 },      // #DAA520
  warmBrown: { r: 101, g: 67, b: 33 },
  text: { r: 51, g: 51, b: 51 },
  muted: { r: 120, g: 100, b: 80 },
  cream: { r: 253, g: 249, b: 240 },
  white: { r: 255, g: 255, b: 255 },
  lightGold: { r: 255, g: 248, b: 220 },
  lightPurple: { r: 245, g: 235, b: 250 },
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function setColor(doc: jsPDF, color: { r: number; g: number; b: number }) {
  doc.setTextColor(color.r, color.g, color.b);
}

function addHeader(doc: jsPDF, section: string) {
  doc.setFillColor(COLORS.cream.r, COLORS.cream.g, COLORS.cream.b);
  doc.rect(0, 0, PAGE_WIDTH, 18, 'F');
  doc.setFontSize(8);
  setColor(doc, COLORS.warmBrown);
  doc.setFont('helvetica', 'bold');
  doc.text('MAPA DA ALMA', MARGIN, 11);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.muted);
  doc.text(section, PAGE_WIDTH - MARGIN, 11, { align: 'right' });
  doc.setDrawColor(COLORS.destino.r, COLORS.destino.g, COLORS.destino.b);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 18, PAGE_WIDTH - MARGIN, 18);
}

function addFooter(doc: jsPDF, participantName: string, facilitatorName: string | undefined, pageNum: number, totalPages: number) {
  const y = PAGE_HEIGHT - 12;
  doc.setDrawColor(200, 190, 175);
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

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, color: { r: number; g: number; b: number }) {
  doc.setFillColor(color.r, color.g, color.b);
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

function checkPageBreak(doc: jsPDF, currentY: number, needed: number, section: string, participantName: string, facilitatorName: string | undefined): number {
  if (currentY + needed > PAGE_HEIGHT - 25) {
    doc.addPage();
    addHeader(doc, section);
    return 28;
  }
  return currentY;
}

// ============================================================
// PAGE GENERATORS
// ============================================================

function generateCoverPage(doc: jsPDF, data: SoulPlanPDFData) {
  const { result, participantName } = data;

  // Gold gradient header
  doc.setFillColor(COLORS.destino.r, COLORS.destino.g, COLORS.destino.b);
  doc.rect(0, 0, PAGE_WIDTH, 80, 'F');
  doc.setFillColor(184, 134, 11);
  doc.rect(0, 75, PAGE_WIDTH, 5, 'F');

  // Title
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MAPA DA ALMA', PAGE_WIDTH / 2, 35, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Soul Plan Reading', PAGE_WIDTH / 2, 48, { align: 'center' });

  // Star symbol
  doc.setFontSize(24);
  doc.text('\u2721', PAGE_WIDTH / 2, 65, { align: 'center' });

  // Participant name
  let y = 100;
  doc.setFontSize(12);
  setColor(doc, COLORS.muted);
  doc.text('Preparado para', PAGE_WIDTH / 2, y, { align: 'center' });

  y += 12;
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.warmBrown);
  doc.text(participantName, PAGE_WIDTH / 2, y, { align: 'center' });

  // Soul Destiny highlight
  y += 25;
  drawRoundedRect(doc, PAGE_WIDTH / 2 - 50, y, 100, 45, 5, COLORS.lightGold);
  doc.setFontSize(10);
  setColor(doc, COLORS.muted);
  doc.text('Destino da Alma', PAGE_WIDTH / 2, y + 12, { align: 'center' });

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.destino);
  doc.text(result.positions.soulDestiny.pair, PAGE_WIDTH / 2, y + 28, { align: 'center' });

  const destinyEnergy = result.positions.soulDestiny.energy;
  if (destinyEnergy) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    setColor(doc, COLORS.muted);
    doc.text(`${destinyEnergy.hebrewLetter} — ${destinyEnergy.vibration}`, PAGE_WIDTH / 2, y + 38, { align: 'center' });
  }

  // Birth name
  y += 60;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.muted);
  doc.text(`Nome de nascimento: ${result.normalizedName}`, PAGE_WIDTH / 2, y, { align: 'center' });

  // Profile summary
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  setColor(doc, COLORS.text);
  const summaryLines = wrapText(doc, result.profileSummary, CONTENT_WIDTH - 20);
  for (const line of summaryLines) {
    doc.text(line, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 5;
  }

  // Date and facilitator
  y = PAGE_HEIGHT - 40;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.muted);
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(date, PAGE_WIDTH / 2, y, { align: 'center' });

  if (data.facilitatorName) {
    y += 6;
    doc.text(`Facilitador(a): ${data.facilitatorName}`, PAGE_WIDTH / 2, y, { align: 'center' });
  }
}

function generateAboutPage(doc: jsPDF, data: SoulPlanPDFData) {
  addHeader(doc, 'Sobre o Mapa da Alma');
  let y = 28;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.warmBrown);
  doc.text('Sobre o Mapa da Alma', MARGIN, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);

  const introText = 'O Mapa da Alma (Soul Plan) é um sistema de leitura energética desenvolvido por Blue Marsden, baseado na antiga tradição hebraica de interpretação das vibrações contidas no nome de nascimento. Cada letra do seu nome carrega uma frequência específica que, quando decodificada, revela o plano que sua alma traçou para esta encarnação.';
  const introLines = wrapText(doc, introText, CONTENT_WIDTH);
  for (const line of introLines) {
    doc.text(line, MARGIN, y);
    y += 5;
  }
  y += 5;

  // How it works box
  drawRoundedRect(doc, MARGIN, y, CONTENT_WIDTH, 40, 3, COLORS.lightGold);
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.destino);
  doc.text('Como Funciona', MARGIN + 8, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.text);
  const howItWorks = 'As letras do seu nome de nascimento são convertidas em valores numéricos hebraicos e distribuídas na Estrela da Criação (Estrela de Davi) — um símbolo sagrado formado por dois triângulos sobrepostos. O triângulo descendente representa o plano mundano (vida material e social), enquanto o triângulo ascendente representa o plano espiritual (desenvolvimento interior). No centro, onde os triângulos se cruzam, encontra-se o Destino da Alma — seu propósito central.';
  const howLines = wrapText(doc, howItWorks, CONTENT_WIDTH - 16);
  for (const line of howLines) {
    doc.text(line, MARGIN + 8, y);
    y += 4.5;
  }
  y += 12;

  // The 7 positions
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.warmBrown);
  doc.text('As 7 Posições', MARGIN, y);
  y += 8;

  const positions = [
    { name: 'Desafio Mundano', desc: 'Padrões limitantes e bloqueios na vida material que precisam ser superados.', color: COLORS.mundano },
    { name: 'Desafio Espiritual', desc: 'Obstáculos no caminho do desenvolvimento interior e espiritual.', color: COLORS.espiritual },
    { name: 'Talento Mundano', desc: 'Habilidades naturais e dons para a vida prática e social.', color: COLORS.mundano },
    { name: 'Talento Espiritual', desc: 'Capacidades inatas para o crescimento espiritual e a conexão interior.', color: COLORS.espiritual },
    { name: 'Objetivo Mundano', desc: 'Aspirações e metas no plano material que sua alma busca realizar.', color: COLORS.mundano },
    { name: 'Objetivo Espiritual', desc: 'Aspirações no plano espiritual e a contribuição que sua alma deseja fazer.', color: COLORS.espiritual },
    { name: 'Destino da Alma', desc: 'O propósito central — a síntese de todo o seu plano de alma e potencial máximo.', color: COLORS.destino },
  ];

  for (const pos of positions) {
    y = checkPageBreak(doc, y, 18, 'Sobre o Mapa da Alma', data.participantName, data.facilitatorName);

    // Color dot
    doc.setFillColor(pos.color.r, pos.color.g, pos.color.b);
    doc.circle(MARGIN + 3, y - 1.5, 2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(pos.color.r, pos.color.g, pos.color.b);
    doc.text(pos.name, MARGIN + 8, y);

    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.text);
    doc.text(pos.desc, MARGIN + 8, y);
    y += 8;
  }

  // 22 energies note
  y += 5;
  y = checkPageBreak(doc, y, 25, 'Sobre o Mapa da Alma', data.participantName, data.facilitatorName);
  drawRoundedRect(doc, MARGIN, y, CONTENT_WIDTH, 20, 3, COLORS.lightPurple);
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  setColor(doc, COLORS.espiritual);
  const noteText = 'Cada posição recebe uma das 22 energias do sistema, baseadas nas 22 letras do alfabeto hebraico. Cada energia tem atributos positivos, desafios, mensagens da alma e métodos de cura específicos.';
  const noteLines = wrapText(doc, noteText, CONTENT_WIDTH - 16);
  for (const line of noteLines) {
    doc.text(line, MARGIN + 8, y);
    y += 4.5;
  }
}

function generateStarPage(doc: jsPDF, data: SoulPlanPDFData) {
  addHeader(doc, 'Estrela da Criação');
  let y = 28;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.warmBrown);
  doc.text('Sua Estrela da Criação', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.muted);
  doc.text(`Nome: ${data.result.normalizedName}`, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 12;

  // Draw the Star of Creation
  const starCx = PAGE_WIDTH / 2;
  const starCy = y + 65;
  const starR = 55;

  // Outer circle
  doc.setDrawColor(200, 190, 175);
  doc.setLineWidth(0.3);
  doc.circle(starCx, starCy, starR * 1.15);

  // Calculate star points
  const starAngles = [-90, -30, 30, 90, 150, 210];
  const starPoints = starAngles.map(angle => ({
    x: starCx + starR * Math.cos((angle * Math.PI) / 180),
    y: starCy + starR * Math.sin((angle * Math.PI) / 180),
  }));

  // Downward triangle (mundano)
  doc.setDrawColor(COLORS.mundano.r, COLORS.mundano.g, COLORS.mundano.b);
  doc.setLineWidth(1);
  doc.triangle(
    starPoints[0].x, starPoints[0].y,
    starPoints[2].x, starPoints[2].y,
    starPoints[4].x, starPoints[4].y,
    'S'
  );

  // Upward triangle (espiritual)
  doc.setDrawColor(COLORS.espiritual.r, COLORS.espiritual.g, COLORS.espiritual.b);
  doc.triangle(
    starPoints[3].x, starPoints[3].y,
    starPoints[5].x, starPoints[5].y,
    starPoints[1].x, starPoints[1].y,
    'S'
  );

  // Position mapping on star
  const { positions } = data.result;
  const posMap = [
    { pos: positions.spiritualGoal, label: 'Obj. Espiritual', color: COLORS.espiritual },
    { pos: positions.worldlyGoal, label: 'Obj. Mundano', color: COLORS.mundano },
    { pos: positions.worldlyTalent, label: 'Tal. Mundano', color: COLORS.mundano },
    { pos: positions.spiritualTalent, label: 'Tal. Espiritual', color: COLORS.espiritual },
    { pos: positions.spiritualChallenge, label: 'Des. Espiritual', color: COLORS.espiritual },
    { pos: positions.worldlyChallenge, label: 'Des. Mundano', color: COLORS.mundano },
  ];

  // Draw position nodes
  for (let i = 0; i < 6; i++) {
    const point = starPoints[i];
    const { pos, label, color } = posMap[i];
    const angle = (starAngles[i] * Math.PI) / 180;
    const labelDist = starR + 18;
    const labelX = starCx + labelDist * Math.cos(angle);
    const labelY = starCy + labelDist * Math.sin(angle);

    // Node circle
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(color.r, color.g, color.b);
    doc.setLineWidth(1.5);
    doc.circle(point.x, point.y, 8, 'FD');

    // Pair number
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(pos.pair, point.x, point.y + 1, { align: 'center' });

    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label, labelX, labelY, { align: 'center' });

    // Hebrew letter
    if (pos.energy) {
      doc.setFontSize(6);
      doc.setFont('helvetica', 'italic');
      setColor(doc, COLORS.muted);
      doc.text(pos.energy.hebrewLetter, labelX, labelY + 4, { align: 'center' });
    }
  }

  // Soul Destiny (center)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(COLORS.destino.r, COLORS.destino.g, COLORS.destino.b);
  doc.setLineWidth(2);
  doc.circle(starCx, starCy, 12, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.destino.r, COLORS.destino.g, COLORS.destino.b);
  doc.text(positions.soulDestiny.pair, starCx, starCy + 1, { align: 'center' });

  doc.setFontSize(6);
  setColor(doc, COLORS.destino);
  doc.text('Destino da Alma', starCx, starCy + 16, { align: 'center' });

  // Legend
  y = starCy + starR + 30;
  doc.setFillColor(COLORS.mundano.r, COLORS.mundano.g, COLORS.mundano.b);
  doc.rect(MARGIN + 10, y, 8, 4, 'F');
  doc.setFontSize(8);
  setColor(doc, COLORS.text);
  doc.text('Plano Mundano', MARGIN + 22, y + 3);

  doc.setFillColor(COLORS.espiritual.r, COLORS.espiritual.g, COLORS.espiritual.b);
  doc.rect(MARGIN + 70, y, 8, 4, 'F');
  doc.text('Plano Espiritual', MARGIN + 82, y + 3);

  doc.setFillColor(COLORS.destino.r, COLORS.destino.g, COLORS.destino.b);
  doc.rect(MARGIN + 135, y, 8, 4, 'F');
  doc.text('Destino da Alma', MARGIN + 147, y + 3);

  // Letter conversion table
  y += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.warmBrown);
  doc.text('Conversão do Nome', MARGIN, y);
  y += 8;

  // Draw letter boxes
  const boxW = 22;
  const boxH = 20;
  const cols = Math.floor(CONTENT_WIDTH / boxW);
  let col = 0;

  for (const lv of data.result.letterValues) {
    if (col >= cols) {
      col = 0;
      y += boxH + 2;
    }
    y = checkPageBreak(doc, y, boxH + 5, 'Estrela da Criação', data.participantName, data.facilitatorName);

    const bx = MARGIN + col * boxW;
    drawRoundedRect(doc, bx, y, boxW - 2, boxH, 2, COLORS.cream);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.warmBrown);
    doc.text(lv.letter, bx + (boxW - 2) / 2, y + 8, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.muted);
    doc.text(String(lv.value), bx + (boxW - 2) / 2, y + 15, { align: 'center' });

    col++;
  }
}

function generatePositionPage(doc: jsPDF, position: SoulPlanPosition, positionKey: string, data: SoulPlanPDFData) {
  const label = data.result.isShortName ? position.labelPt : POSITION_LABELS_PT[positionKey];
  const isMundano = positionKey.startsWith('worldly');
  const isDestiny = positionKey === 'soulDestiny';
  const color = isDestiny ? COLORS.destino : (isMundano ? COLORS.mundano : COLORS.espiritual);
  const bgColor = isDestiny ? COLORS.lightGold : (isMundano ? { r: 255, g: 248, b: 230 } : COLORS.lightPurple);
  const energy = position.energy;

  addHeader(doc, label);
  let y = 28;

  // Position header with color
  doc.setFillColor(color.r, color.g, color.b);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 30, 3, 3, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(label, MARGIN + 10, y + 12);

  doc.setFontSize(20);
  doc.text(position.pair, PAGE_WIDTH - MARGIN - 10, y + 12, { align: 'right' });

  if (energy) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${energy.hebrewLetter} — ${energy.vibration}`, MARGIN + 10, y + 23);
  }

  y += 38;

  if (!energy) {
    doc.setFontSize(10);
    setColor(doc, COLORS.text);
    doc.text('Informações não disponíveis para esta energia.', MARGIN, y);
    return;
  }

  // Interpretation
  const interpretation = getPositionInterpretation(energy, positionKey);
  if (interpretation) {
    drawRoundedRect(doc, MARGIN, y, CONTENT_WIDTH, 4, 3, bgColor);
    const interpLines = wrapText(doc, interpretation, CONTENT_WIDTH - 16);
    const interpHeight = interpLines.length * 5 + 12;
    drawRoundedRect(doc, MARGIN, y, CONTENT_WIDTH, interpHeight, 3, bgColor);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.text);
    for (const line of interpLines) {
      doc.text(line, MARGIN + 8, y);
      y += 5;
    }
    y += 8;
  }

  // Positive attributes
  if (energy.positiveAttributes.length > 0) {
    y = checkPageBreak(doc, y, 30, label, data.participantName, data.facilitatorName);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setColor(doc, { r: 34, g: 139, b: 34 });
    doc.text('Atributos Positivos', MARGIN, y);
    y += 6;

    // Badges
    let badgeX = MARGIN;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    for (const attr of energy.positiveAttributes) {
      const textW = doc.getTextWidth(attr) + 8;
      if (badgeX + textW > PAGE_WIDTH - MARGIN) {
        badgeX = MARGIN;
        y += 8;
      }
      drawRoundedRect(doc, badgeX, y - 4, textW, 7, 2, { r: 220, g: 245, b: 220 });
      doc.setTextColor(34, 139, 34);
      doc.text(attr, badgeX + 4, y);
      badgeX += textW + 3;
    }
    y += 8;

    if (energy.positiveDescription) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(doc, COLORS.text);
      const descLines = wrapText(doc, energy.positiveDescription, CONTENT_WIDTH);
      for (const line of descLines) {
        y = checkPageBreak(doc, y, 5, label, data.participantName, data.facilitatorName);
        doc.text(line, MARGIN, y);
        y += 4.5;
      }
    }
    y += 5;
  }

  // Challenges
  if (energy.challenges.length > 0) {
    y = checkPageBreak(doc, y, 30, label, data.participantName, data.facilitatorName);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setColor(doc, { r: 180, g: 120, b: 0 });
    doc.text('Desafios', MARGIN, y);
    y += 6;

    let badgeX = MARGIN;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    for (const ch of energy.challenges) {
      const textW = doc.getTextWidth(ch) + 8;
      if (badgeX + textW > PAGE_WIDTH - MARGIN) {
        badgeX = MARGIN;
        y += 8;
      }
      drawRoundedRect(doc, badgeX, y - 4, textW, 7, 2, { r: 255, g: 240, b: 210 });
      doc.setTextColor(180, 120, 0);
      doc.text(ch, badgeX + 4, y);
      badgeX += textW + 3;
    }
    y += 8;

    if (energy.challengeDescription) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(doc, COLORS.text);
      const descLines = wrapText(doc, energy.challengeDescription, CONTENT_WIDTH);
      for (const line of descLines) {
        y = checkPageBreak(doc, y, 5, label, data.participantName, data.facilitatorName);
        doc.text(line, MARGIN, y);
        y += 4.5;
      }
    }
    y += 5;
  }

  // Soul Message
  if (energy.soulMessage) {
    y = checkPageBreak(doc, y, 25, label, data.participantName, data.facilitatorName);
    drawRoundedRect(doc, MARGIN, y, CONTENT_WIDTH, 4, 3, COLORS.lightPurple);
    const msgLines = wrapText(doc, energy.soulMessage, CONTENT_WIDTH - 16);
    const msgHeight = msgLines.length * 5 + 14;
    drawRoundedRect(doc, MARGIN, y, CONTENT_WIDTH, msgHeight, 3, COLORS.lightPurple);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.espiritual.r, COLORS.espiritual.g, COLORS.espiritual.b);
    doc.text('Mensagem da Alma', MARGIN + 8, y);
    y += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    for (const line of msgLines) {
      doc.text(line, MARGIN + 8, y);
      y += 5;
    }
    y += 8;
  }

  // Healing Affirmation
  if (energy.healingAffirmation) {
    y = checkPageBreak(doc, y, 20, label, data.participantName, data.facilitatorName);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.warmBrown);
    doc.text('Afirmação de Cura', MARGIN, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    setColor(doc, COLORS.text);
    const affLines = wrapText(doc, `"${energy.healingAffirmation}"`, CONTENT_WIDTH);
    for (const line of affLines) {
      y = checkPageBreak(doc, y, 5, label, data.participantName, data.facilitatorName);
      doc.text(line, MARGIN, y);
      y += 4.5;
    }
    y += 5;
  }

  // Self-help methods
  if (energy.selfHelpMethods.length > 0) {
    y = checkPageBreak(doc, y, 20, label, data.participantName, data.facilitatorName);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.warmBrown);
    doc.text('Métodos de Autoajuda', MARGIN, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.text);
    for (const method of energy.selfHelpMethods) {
      y = checkPageBreak(doc, y, 5, label, data.participantName, data.facilitatorName);
      doc.text(`• ${method}`, MARGIN + 4, y);
      y += 5;
    }
    y += 3;
  }

  // Bach Flowers
  if (energy.bachFlowers.length > 0) {
    y = checkPageBreak(doc, y, 20, label, data.participantName, data.facilitatorName);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.warmBrown);
    doc.text('Florais de Bach', MARGIN, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.text);
    for (const flower of energy.bachFlowers) {
      y = checkPageBreak(doc, y, 8, label, data.participantName, data.facilitatorName);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${flower.name}`, MARGIN + 4, y);
      if (flower.purpose) {
        doc.setFont('helvetica', 'normal');
        const purposeLines = wrapText(doc, `— ${flower.purpose}`, CONTENT_WIDTH - 15);
        for (let li = 0; li < purposeLines.length; li++) {
          if (li === 0) {
            doc.text(purposeLines[li], MARGIN + 8 + doc.getTextWidth(`${flower.name} `), y);
          } else {
            y += 4.5;
            doc.text(purposeLines[li], MARGIN + 8, y);
          }
        }
      }
      y += 5;
    }
  }
}

function generateClosingPage(doc: jsPDF, data: SoulPlanPDFData) {
  addHeader(doc, 'Próximos Passos');
  let y = 40;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.warmBrown);
  doc.text('Próximos Passos', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 15;

  const steps = [
    { title: 'Reflexão', text: 'Reserve um momento de silêncio para absorver as informações do seu Mapa da Alma. Permita que as mensagens ressoem dentro de você sem julgamento.' },
    { title: 'Integração', text: 'Identifique quais energias mais ressoam com sua experiência atual. Os desafios apontados podem refletir padrões que você já reconhece em sua vida.' },
    { title: 'Afirmações', text: 'Pratique as afirmações de cura de cada posição diariamente. Elas foram criadas para ajudar a transformar crenças limitantes em potencial de crescimento.' },
    { title: 'Florais e Métodos', text: 'Considere experimentar os florais de Bach e métodos de autoajuda sugeridos. Eles podem apoiar seu processo de desenvolvimento.' },
    { title: 'Acompanhamento', text: 'Converse com seu facilitador sobre os insights do Mapa da Alma. Uma leitura aprofundada pode revelar nuances e conexões entre as posições.' },
  ];

  for (const step of steps) {
    y = checkPageBreak(doc, y, 25, 'Próximos Passos', data.participantName, data.facilitatorName);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.destino);
    doc.text(`✦ ${step.title}`, MARGIN, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.text);
    const lines = wrapText(doc, step.text, CONTENT_WIDTH - 5);
    for (const line of lines) {
      doc.text(line, MARGIN + 5, y);
      y += 4.5;
    }
    y += 6;
  }

  // Quote
  y += 10;
  y = checkPageBreak(doc, y, 30, 'Próximos Passos', data.participantName, data.facilitatorName);
  drawRoundedRect(doc, MARGIN + 10, y, CONTENT_WIDTH - 20, 30, 3, COLORS.lightGold);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  setColor(doc, COLORS.warmBrown);
  const quote = '"Seu nome não é um acidente. É um mapa codificado que contém as sementes do seu potencial máximo."';
  const quoteLines = wrapText(doc, quote, CONTENT_WIDTH - 40);
  for (const line of quoteLines) {
    doc.text(line, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 5;
  }
  y += 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, COLORS.muted);
  doc.text('— Blue Marsden, Soul Plan', PAGE_WIDTH / 2, y, { align: 'center' });

  // Facilitator info
  if (data.facilitatorName) {
    y += 20;
    doc.setFontSize(9);
    setColor(doc, COLORS.muted);
    doc.text(`Facilitador(a): ${data.facilitatorName}`, PAGE_WIDTH / 2, y, { align: 'center' });
  }
}

// ============================================================
// MAIN GENERATOR
// ============================================================

export async function generateSoulPlanPDF(data: SoulPlanPDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const { result } = data;
  const { positions, isShortName } = result;

  // Page 1: Cover
  generateCoverPage(doc, data);

  // Page 2: About
  doc.addPage();
  generateAboutPage(doc, data);

  // Page 3: Star of Creation
  doc.addPage();
  generateStarPage(doc, data);

  // Position pages
  if (isShortName) {
    // Short name: 3 combined positions + destiny
    doc.addPage();
    generatePositionPage(doc, positions.worldlyChallenge, 'worldlyChallenge', data);
    doc.addPage();
    generatePositionPage(doc, positions.worldlyTalent, 'worldlyTalent', data);
    doc.addPage();
    generatePositionPage(doc, positions.worldlyGoal, 'worldlyGoal', data);
  } else {
    // Long name: 6 separate positions
    doc.addPage();
    generatePositionPage(doc, positions.worldlyChallenge, 'worldlyChallenge', data);
    doc.addPage();
    generatePositionPage(doc, positions.spiritualChallenge, 'spiritualChallenge', data);
    doc.addPage();
    generatePositionPage(doc, positions.worldlyTalent, 'worldlyTalent', data);
    doc.addPage();
    generatePositionPage(doc, positions.spiritualTalent, 'spiritualTalent', data);
    doc.addPage();
    generatePositionPage(doc, positions.worldlyGoal, 'worldlyGoal', data);
    doc.addPage();
    generatePositionPage(doc, positions.spiritualGoal, 'spiritualGoal', data);
  }

  // Soul Destiny page
  doc.addPage();
  generatePositionPage(doc, positions.soulDestiny, 'soulDestiny', data);

  // Closing page
  doc.addPage();
  generateClosingPage(doc, data);

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) { // Skip cover page
      addFooter(doc, data.participantName, data.facilitatorName, i, totalPages);
    }
  }

  // Save
  const safeName = data.participantName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  const date = new Date().toISOString().split('T')[0];
  doc.save(`mapa-da-alma-${safeName}-${date}.pdf`);
}
