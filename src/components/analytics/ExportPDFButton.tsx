import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CompanyDetail {
  name: string;
  total: number;
  completed: number;
  averageScore: number | null;
  completionRate: number;
}

interface KPIData {
  totalParticipants: number;
  completedParticipants: number;
  completionRate: number;
  averageCompletionDays: number | null;
}

interface ExportPDFButtonProps {
  kpiData: KPIData;
  companyDetails: CompanyDetail[];
  facilitatorName?: string;
  selectedPeriod: string;
  selectedCompany: string;
}

const PERIOD_LABELS: Record<string, string> = {
  all: "Todos os períodos",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  "1y": "Último ano",
};

export function ExportPDFButton({
  kpiData,
  companyDetails,
  facilitatorName = "Facilitador",
  selectedPeriod,
  selectedCompany,
}: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Relatório de Métricas", margin, yPos);
      yPos += 10;

      // Subheader with date and filters
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, margin, yPos);
      yPos += 5;
      pdf.text(`Período: ${PERIOD_LABELS[selectedPeriod] || selectedPeriod}`, margin, yPos);
      yPos += 5;
      if (selectedCompany !== "all") {
        const company = companyDetails.find(c => c.name === selectedCompany);
        pdf.text(`Empresa: ${company?.name || selectedCompany}`, margin, yPos);
        yPos += 5;
      }
      yPos += 10;

      // KPIs Section
      pdf.setFontSize(14);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Indicadores Principais", margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      const kpiItems = [
        `Total de Participantes: ${kpiData.totalParticipants}`,
        `Diagnósticos Concluídos: ${kpiData.completedParticipants}`,
        `Taxa de Conclusão: ${kpiData.completionRate.toFixed(1)}%`,
        `Tempo Médio de Conclusão: ${kpiData.averageCompletionDays !== null ? `${kpiData.averageCompletionDays.toFixed(1)} dias` : "N/A"}`,
      ];

      kpiItems.forEach((item) => {
        pdf.text(`• ${item}`, margin + 5, yPos);
        yPos += 6;
      });
      yPos += 10;

      // Company Table
      if (companyDetails.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(40, 40, 40);
        pdf.text("Detalhamento por Empresa", margin, yPos);
        yPos += 8;

        // Table headers
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        const colWidths = [50, 25, 30, 30, 35];
        const headers = ["Empresa", "Total", "Concluídos", "Média", "Taxa Conclusão"];
        
        let xPos = margin;
        headers.forEach((header, i) => {
          pdf.text(header, xPos, yPos);
          xPos += colWidths[i];
        });
        yPos += 2;

        // Separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;

        // Table rows
        pdf.setTextColor(60, 60, 60);
        companyDetails.slice(0, 15).forEach((company) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }

          xPos = margin;
          const truncatedName = company.name.length > 20 
            ? company.name.substring(0, 20) + "..." 
            : company.name;
          
          pdf.text(truncatedName, xPos, yPos);
          xPos += colWidths[0];
          pdf.text(String(company.total), xPos, yPos);
          xPos += colWidths[1];
          pdf.text(String(company.completed), xPos, yPos);
          xPos += colWidths[2];
          pdf.text(company.averageScore !== null ? company.averageScore.toFixed(2) : "—", xPos, yPos);
          xPos += colWidths[3];
          pdf.text(`${company.completionRate.toFixed(0)}%`, xPos, yPos);
          
          yPos += 6;
        });

        if (companyDetails.length > 15) {
          yPos += 3;
          pdf.setTextColor(100, 100, 100);
          pdf.setFontSize(8);
          pdf.text(`... e mais ${companyDetails.length - 15} empresa(s)`, margin, yPos);
        }
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `${facilitatorName} • Página ${i} de ${pageCount}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save
      const fileName = `relatorio-metricas-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
      
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={exportToPDF}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      Exportar PDF
    </Button>
  );
}
