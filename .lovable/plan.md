

# Exportacao PDF do Relatorio de Diagnostico

## Resumo
Implementar funcionalidade de download do relatorio de diagnostico em PDF, permitindo que participantes e facilitadores baixem um documento profissional com grafico radar, scores por dimensao e recomendacoes personalizadas.

---

## Abordagem Tecnica

### Biblioteca Escolhida: jsPDF + html2canvas
- **jsPDF**: Biblioteca leve para geracao de PDF
- **html2canvas**: Captura elementos HTML como imagem para incluir no PDF
- **Vantagens**: Melhor compatibilidade com charts SVG (Recharts), mais simples de implementar, menor bundle size

### Alternativa Considerada
- `@react-pdf/renderer` com `react-pdf-charts` - Mais complexo, requer reescrever componentes

---

## O que sera implementado

### 1. Funcao de Geracao de PDF
- Capturar conteudo do relatorio como imagem
- Gerar PDF multi-pagina se necessario
- Adicionar cabecalho/rodape com logo e data
- Nome do arquivo: `diagnostico-iq-is-{nome}-{data}.pdf`

### 2. Botao de Download Funcional
- Substituir botao desabilitado no `DiagnosticResults.tsx`
- Mostrar estado de loading durante geracao
- Feedback de sucesso/erro com toast

### 3. PDF para Facilitador (bonus)
- Adicionar botao de download no `ParticipantResultCard.tsx`
- Permitir baixar PDF de qualquer participante

---

## Estrutura do PDF

```text
+--------------------------------------------------+
|  [Logo]     DIAGNOSTICO IQ+IS                    |
|             Data: 30/01/2026                      |
+--------------------------------------------------+

    Parabens, {Nome}!
    Voce completou o Diagnostico IQ+IS
    
    Score Geral: 3.8/5
    "Bom! Ha espaco para crescimento em algumas areas."

+--------------------------------------------------+
|                                                  |
|            [GRAFICO RADAR - 5 DIMENSOES]         |
|                                                  |
+--------------------------------------------------+

--- PONTOS FORTES ---
+-------------------------+  +-------------------------+
| Coerencia Emocional     |  | Relacoes e Compaixao    |
| 4.2/5                   |  | 4.0/5                   |
+-------------------------+  +-------------------------+

--- AREAS DE DESENVOLVIMENTO ---
+-------------------------+  +-------------------------+
| Consciencia Interior    |  | Transformacao           |
| 2.8/5                   |  | 3.0/5                   |
+-------------------------+  +-------------------------+

--- DETALHAMENTO POR DIMENSAO ---
[Cards de cada dimensao com barra de progresso]

--- RECOMENDACOES ---
> Desenvolva sua Consciencia Interior
  - Pratique 10 minutos de meditacao...
  - Faca pausas conscientes...

+--------------------------------------------------+
|  Gerado em lovable.app | Pagina 1/2              |
+--------------------------------------------------+
```

---

## Arquivos a serem modificados/criados

### Novos Arquivos
1. `src/lib/pdf-generator.ts`
   - Funcao `generateDiagnosticPDF()`
   - Configuracao de margens, fontes, cores
   - Logica de paginacao
   - Helper para adicionar secoes

### Modificacoes
1. `src/components/diagnostic/DiagnosticResults.tsx`
   - Importar funcao de geracao
   - Adicionar ref para area do conteudo
   - Habilitar botao de download
   - Estado de loading durante geracao

2. `src/components/participants/ParticipantResultCard.tsx`
   - Adicionar botao de download no card expandido
   - Reutilizar mesma funcao de geracao

---

## Fluxo de Geracao

```text
Usuario clica "Baixar PDF"
        |
        v
Mostrar loading state
        |
        v
Capturar elemento com html2canvas
        |
        +---> Converter SVG do radar para imagem
        |
        v
Criar documento jsPDF
        |
        +---> Adicionar cabecalho
        +---> Adicionar score geral
        +---> Adicionar grafico radar
        +---> Adicionar dimensoes
        +---> Adicionar recomendacoes
        +---> Adicionar rodape
        |
        v
pdf.save("diagnostico-iq-is-nome-2026-01-30.pdf")
        |
        v
Toast de sucesso
```

---

## Detalhes Tecnicos

### Instalacao de Dependencias
```bash
npm install jspdf html2canvas
```

### Funcao Principal
```typescript
// src/lib/pdf-generator.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PDFData {
  participantName: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
  recommendations: Recommendation[];
}

export async function generateDiagnosticPDF(
  contentRef: HTMLElement,
  data: PDFData
): Promise<void> {
  // 1. Capturar conteudo como canvas
  const canvas = await html2canvas(contentRef, {
    scale: 2, // Maior qualidade
    useCORS: true,
    logging: false
  });

  // 2. Criar PDF
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // 3. Adicionar imagem do canvas
  const imgData = canvas.toDataURL("image/png");
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // 4. Multiplas paginas se necessario
  let heightLeft = imgHeight;
  let position = 10;
  
  pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // 5. Salvar
  const fileName = `diagnostico-iq-is-${data.participantName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(fileName);
}
```

### Uso no Componente
```typescript
// DiagnosticResults.tsx
const contentRef = useRef<HTMLDivElement>(null);
const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

const handleDownloadPDF = async () => {
  if (!contentRef.current) return;
  
  setIsGeneratingPDF(true);
  try {
    await generateDiagnosticPDF(contentRef.current, {
      participantName,
      totalScore: displayScores.totalScore,
      dimensionScores: displayScores.dimensionScores,
      recommendations
    });
    toast.success("PDF gerado com sucesso!");
  } catch (error) {
    toast.error("Erro ao gerar PDF");
    console.error(error);
  } finally {
    setIsGeneratingPDF(false);
  }
};
```

---

## Estilizacao para PDF

Para garantir que o PDF tenha boa aparencia, precisamos:

1. **Ref no conteudo principal**
   - Envolver o conteudo em div com ref
   - Excluir botoes de acao da captura

2. **Cores solidas**
   - Usar cores fixas em vez de CSS variables para o PDF
   - Aplicar classe especial durante captura

3. **Tamanho otimizado**
   - Width fixo para consistencia
   - Fontes legiveis em impressao

---

## Ordem de Implementacao

1. Instalar `jspdf` e `html2canvas`
2. Criar `src/lib/pdf-generator.ts` com funcao principal
3. Atualizar `DiagnosticResults.tsx`:
   - Adicionar ref ao conteudo
   - Implementar handler de download
   - Habilitar botao
4. Adicionar botao de download no `ParticipantResultCard.tsx`
5. Testar geracao de PDF
6. Ajustar estilos se necessario

---

## Tipos TypeScript

```typescript
// src/lib/pdf-generator.ts

export interface PDFGeneratorOptions {
  participantName: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
  recommendations: Recommendation[];
  companyName?: string;
  completedAt?: string;
}

export interface PDFStyles {
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  headerHeight: number;
  margin: number;
}
```

