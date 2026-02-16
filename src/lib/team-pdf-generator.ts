import jsPDF from "jspdf";
import { DimensionScore } from "./diagnostic-scoring";
import { getRecommendationsForWeakDimensions } from "./recommendations";

export interface TeamReportData {
  companyName: string;
  facilitatorName?: string;
  facilitatorLogoUrl?: string;
  primaryColor?: string;
  totalParticipants: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  teamAverageScore: number;
  teamDimensionScores: DimensionScore[];
  participantResults: {
    name: string;
    score: number;
    completedAt: string;
  }[];
}

/**
 * Converts a hex color string to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * Generates a consolidated team PDF report
 */
export async function generateTeamPDF(data: TeamReportData): Promise<void> {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Colors
  const primaryColor = data.primaryColor 
    ? hexToRgb(data.primaryColor) 
    : { r: 139, g: 92, b: 246 };
  
  let yPosition = margin;

  // ==================== COVER PAGE ====================
  
  // Logo do facilitador (se houver)
  if (data.facilitatorLogoUrl) {
    try {
      // For now, we'll skip the logo loading as it requires async image loading
      // This would need to be enhanced with proper image loading
    } catch (e) {
      console.warn("Could not load logo:", e);
    }
  }

  // Title section with gradient simulation
  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(0, 0, pageWidth, 80, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.text("RELATÓRIO DE EQUIPE", pageWidth / 2, 35, { align: "center" });
  
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.text("Diagnóstico de Consciência Integral", pageWidth / 2, 48, { align: "center" });
  
  pdf.setFontSize(12);
  pdf.text(data.companyName, pageWidth / 2, 65, { align: "center" });

  yPosition = 100;

  // Date
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(11);
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  pdf.text(`Gerado em: ${dateStr}`, pageWidth / 2, yPosition, { align: "center" });
  
  if (data.facilitatorName) {
    yPosition += 8;
    pdf.text(`Facilitador: ${data.facilitatorName}`, pageWidth / 2, yPosition, { align: "center" });
  }

  // ==================== EXECUTIVE SUMMARY ====================
  yPosition = 130;
  
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("RESUMO EXECUTIVO", margin, yPosition);
  
  yPosition += 15;
  
  // Stats boxes
  const boxWidth = (contentWidth - 20) / 3;
  const boxHeight = 35;
  
  // Box 1: Total Participants
  pdf.setFillColor(245, 245, 250);
  pdf.roundedRect(margin, yPosition, boxWidth, boxHeight, 3, 3, "F");
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Total de Participantes", margin + boxWidth / 2, yPosition + 10, { align: "center" });
  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.totalParticipants.toString(), margin + boxWidth / 2, yPosition + 26, { align: "center" });

  // Box 2: Completed
  const box2X = margin + boxWidth + 10;
  pdf.setFillColor(220, 252, 231);
  pdf.roundedRect(box2X, yPosition, boxWidth, boxHeight, 3, 3, "F");
  pdf.setTextColor(22, 101, 52);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Concluídos", box2X + boxWidth / 2, yPosition + 10, { align: "center" });
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  const completionRate = data.totalParticipants > 0 
    ? Math.round((data.completedCount / data.totalParticipants) * 100) 
    : 0;
  pdf.text(`${data.completedCount} (${completionRate}%)`, box2X + boxWidth / 2, yPosition + 26, { align: "center" });

  // Box 3: Average Score
  const box3X = margin + (boxWidth + 10) * 2;
  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.roundedRect(box3X, yPosition, boxWidth, boxHeight, 3, 3, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Média Geral", box3X + boxWidth / 2, yPosition + 10, { align: "center" });
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${data.teamAverageScore.toFixed(1)}/5`, box3X + boxWidth / 2, yPosition + 26, { align: "center" });

  // ==================== DIMENSION ANALYSIS ====================
  yPosition += boxHeight + 25;
  
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("ANÁLISE POR DIMENSÃO", margin, yPosition);
  
  yPosition += 12;
  
  // Sort dimensions by score
  const sortedDimensions = [...data.teamDimensionScores].sort((a, b) => b.score - a.score);
  
  // Dimension bars
  sortedDimensions.forEach((dim, index) => {
    const barMaxWidth = contentWidth - 80;
    const barWidth = (dim.score / 5) * barMaxWidth;
    const barHeight = 8;
    const rowHeight = 18;
    
    // Dimension name
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const shortName = dim.dimension.length > 25 ? dim.dimension.substring(0, 22) + "..." : dim.dimension;
    pdf.text(shortName, margin, yPosition + 6);
    
    // Score bar background
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(margin + 70, yPosition, barMaxWidth, barHeight, 2, 2, "F");
    
    // Score bar fill
    const isTop = index < 2;
    const isBottom = index >= sortedDimensions.length - 2;
    if (isTop) {
      pdf.setFillColor(34, 197, 94); // Green
    } else if (isBottom) {
      pdf.setFillColor(249, 115, 22); // Orange
    } else {
      pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    }
    if (barWidth > 0) {
      pdf.roundedRect(margin + 70, yPosition, barWidth, barHeight, 2, 2, "F");
    }
    
    // Score value
    pdf.setTextColor(50, 50, 50);
    pdf.setFont("helvetica", "bold");
    pdf.text(dim.score.toFixed(1), margin + 70 + barMaxWidth + 5, yPosition + 6);
    
    yPosition += rowHeight;
  });

  // ==================== STRENGTHS & DEVELOPMENT ====================
  yPosition += 10;
  
  const topDimensions = sortedDimensions.slice(0, 2);
  const bottomDimensions = sortedDimensions.slice(-2).reverse();
  
  const halfWidth = (contentWidth - 10) / 2;
  
  // Strengths
  pdf.setFillColor(220, 252, 231);
  pdf.roundedRect(margin, yPosition, halfWidth, 45, 3, 3, "F");
  pdf.setTextColor(22, 101, 52);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("✓ Pontos Fortes", margin + 8, yPosition + 12);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  topDimensions.forEach((dim, i) => {
    pdf.text(`• ${dim.dimension} (${dim.score.toFixed(1)})`, margin + 8, yPosition + 24 + (i * 9));
  });

  // Development areas
  const devX = margin + halfWidth + 10;
  pdf.setFillColor(254, 243, 199);
  pdf.roundedRect(devX, yPosition, halfWidth, 45, 3, 3, "F");
  pdf.setTextColor(146, 64, 14);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("↗ Áreas de Desenvolvimento", devX + 8, yPosition + 12);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  bottomDimensions.forEach((dim, i) => {
    pdf.text(`• ${dim.dimension} (${dim.score.toFixed(1)})`, devX + 8, yPosition + 24 + (i * 9));
  });

  // ==================== PAGE 2: PARTICIPANTS ====================
  pdf.addPage();
  yPosition = margin;
  
  // Header
  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(0, 0, pageWidth, 25, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("RESULTADOS INDIVIDUAIS", margin, 17);
  
  yPosition = 40;
  
  // Table header
  pdf.setFillColor(245, 245, 250);
  pdf.rect(margin, yPosition, contentWidth, 10, "F");
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Participante", margin + 5, yPosition + 7);
  pdf.text("Score", margin + contentWidth - 50, yPosition + 7);
  pdf.text("Data", margin + contentWidth - 25, yPosition + 7);
  
  yPosition += 12;
  
  // Sort participants by score (highest first)
  const sortedParticipants = [...data.participantResults].sort((a, b) => b.score - a.score);
  
  sortedParticipants.forEach((participant, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
      
      // Re-add header
      pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.rect(0, 0, pageWidth, 25, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("RESULTADOS INDIVIDUAIS (continuação)", margin, 17);
      
      yPosition = 40;
    }
    
    // Alternating row background
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 252);
      pdf.rect(margin, yPosition - 4, contentWidth, 10, "F");
    }
    
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    
    // Truncate long names
    const name = participant.name.length > 35 
      ? participant.name.substring(0, 32) + "..." 
      : participant.name;
    pdf.text(name, margin + 5, yPosition + 2);
    
    // Score with color coding
    const score = participant.score;
    if (score >= 4) {
      pdf.setTextColor(22, 101, 52);
    } else if (score >= 3) {
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    } else {
      pdf.setTextColor(249, 115, 22);
    }
    pdf.setFont("helvetica", "bold");
    pdf.text(score.toFixed(1), margin + contentWidth - 50, yPosition + 2);
    
    // Date
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "normal");
    const date = new Date(participant.completedAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit"
    });
    pdf.text(date, margin + contentWidth - 25, yPosition + 2);
    
    yPosition += 10;
  });

  // ==================== PAGE 3: RECOMMENDATIONS ====================
  pdf.addPage();
  yPosition = margin;
  
  // Header
  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(0, 0, pageWidth, 25, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("RECOMENDAÇÕES PARA GESTORES", margin, 17);
  
  yPosition = 45;
  
  // Get recommendations for weak dimensions
  const weakDimensionNames = bottomDimensions.map(d => d.dimension);
  const recommendations = getRecommendationsForWeakDimensions(weakDimensionNames);
  
  if (recommendations.length > 0) {
    weakDimensionNames.forEach((dimName, recIndex) => {
      const rec = recommendations[recIndex];
      if (!rec) return;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin + 15;
      }
      
      // Dimension header
      pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.setTextColor(255, 255, 255);
      pdf.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, "F");
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(dimName, margin + 5, yPosition + 8);
      
      yPosition += 18;
      
      // Recommendation content
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(rec.title, margin, yPosition);
      
      yPosition += 8;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      
      // Wrap description text
      const descLines = pdf.splitTextToSize(rec.description, contentWidth);
      descLines.forEach((line: string) => {
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 5;
      
      // Practices
      rec.practices.forEach(practice => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin + 15;
        }
        
        pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.text("→", margin, yPosition);
        pdf.setTextColor(50, 50, 50);
        
        const practiceLines = pdf.splitTextToSize(practice, contentWidth - 10);
        practiceLines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, margin + 8, yPosition + (lineIndex * 5));
        });
        yPosition += practiceLines.length * 5 + 3;
      });
      
      yPosition += 10;
    });
  } else {
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(11);
    pdf.text("Nenhuma recomendação específica disponível.", margin, yPosition);
  }

  // ==================== FOOTER ====================
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(230, 230, 230);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    
    const footerText = data.facilitatorName 
      ? `Gerado por ${data.facilitatorName} via Karina Bonadiu`
      : "Gerado via Karina Bonadiu";
    pdf.text(footerText, margin, pageHeight - 8);
    
    pdf.text(`Página ${i}/${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
  }

  // ==================== SAVE ====================
  const sanitizedCompanyName = data.companyName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  
  const dateForFile = new Date().toISOString().split("T")[0];
  const fileName = `relatorio-equipe-${sanitizedCompanyName}-${dateForFile}.pdf`;
  
  pdf.save(fileName);
}
