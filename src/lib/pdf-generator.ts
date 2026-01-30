import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DimensionScore } from "./diagnostic-scoring";
import { Recommendation } from "./recommendations";

export interface PDFGeneratorOptions {
  participantName: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
  recommendations: Recommendation[];
  completedAt?: string;
}

/**
 * Generates a PDF from the diagnostic results by capturing the HTML content
 * and converting it to a multi-page PDF document.
 */
export async function generateDiagnosticPDF(
  contentRef: HTMLElement,
  data: PDFGeneratorOptions
): Promise<void> {
  // Temporarily add print-friendly styles
  contentRef.classList.add("pdf-capture");
  
  try {
    // Capture content as canvas with high quality
    const canvas = await html2canvas(contentRef, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 800, // Fixed width for consistency
    });

    // Create PDF in A4 format
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const margin = 10;
    const headerHeight = 15;
    const footerHeight = 10;
    const contentArea = pageHeight - headerHeight - footerHeight - (margin * 2);
    
    // Calculate image dimensions
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Track pagination
    let heightLeft = imgHeight;
    let position = headerHeight + margin;
    let pageNumber = 1;
    const totalPages = Math.ceil(imgHeight / contentArea);
    
    // Add header to first page
    addHeader(pdf, pageWidth, data);
    
    // Add first page content
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= contentArea;
    
    // Add footer to first page
    addFooter(pdf, pageWidth, pageHeight, pageNumber, totalPages);
    
    // Handle multi-page content
    while (heightLeft > 0) {
      pageNumber++;
      pdf.addPage();
      
      // Add header to new page
      addHeader(pdf, pageWidth, data);
      
      // Calculate new position (continue from where we left off)
      const yOffset = -(contentArea * (pageNumber - 1)) + headerHeight + margin;
      pdf.addImage(imgData, "PNG", margin, yOffset, imgWidth, imgHeight);
      
      heightLeft -= contentArea;
      
      // Add footer
      addFooter(pdf, pageWidth, pageHeight, pageNumber, totalPages);
    }

    // Generate filename
    const sanitizedName = data.participantName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `diagnostico-iq-is-${sanitizedName}-${dateStr}.pdf`;
    
    // Save the PDF
    pdf.save(fileName);
  } finally {
    // Remove temporary styles
    contentRef.classList.remove("pdf-capture");
  }
}

/**
 * Adds a header to the current page
 */
function addHeader(pdf: jsPDF, pageWidth: number, data: PDFGeneratorOptions): void {
  const headerY = 8;
  
  // Title
  pdf.setFontSize(12);
  pdf.setTextColor(139, 92, 246); // Primary purple color
  pdf.text("DIAGNÓSTICO IQ+IS", 10, headerY);
  
  // Date on the right
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  const dateText = data.completedAt 
    ? new Date(data.completedAt).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");
  const dateWidth = pdf.getTextWidth(dateText);
  pdf.text(dateText, pageWidth - 10 - dateWidth, headerY);
  
  // Separator line
  pdf.setDrawColor(230, 230, 230);
  pdf.line(10, headerY + 3, pageWidth - 10, headerY + 3);
}

/**
 * Adds a footer to the current page
 */
function addFooter(
  pdf: jsPDF, 
  pageWidth: number, 
  pageHeight: number, 
  pageNumber: number, 
  totalPages: number
): void {
  const footerY = pageHeight - 8;
  
  // Separator line
  pdf.setDrawColor(230, 230, 230);
  pdf.line(10, footerY - 3, pageWidth - 10, footerY - 3);
  
  // Brand text on the left
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text("Gerado via lovable.app", 10, footerY);
  
  // Page number on the right
  const pageText = `Página ${pageNumber}/${totalPages}`;
  const pageTextWidth = pdf.getTextWidth(pageText);
  pdf.text(pageText, pageWidth - 10 - pageTextWidth, footerY);
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
    recommendations: [], // Not needed for capture-based PDF
    completedAt
  });
}
