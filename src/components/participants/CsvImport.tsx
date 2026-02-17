import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParsedParticipant {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  isValid: boolean;
  errors: string[];
}

interface CsvImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (participants: Omit<ParsedParticipant, "isValid" | "errors">[]) => Promise<void>;
  isLoading?: boolean;
}

function parseCSV(text: string): ParsedParticipant[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(",").map(h => h.trim());

  const nameIndex = headers.findIndex(h => h.includes("nome") || h === "name");
  const emailIndex = headers.findIndex(h => h.includes("email") || h === "e-mail");
  const phoneIndex = headers.findIndex(h => h.includes("telefone") || h === "phone");
  const departmentIndex = headers.findIndex(h => h.includes("departamento") || h === "department");
  const positionIndex = headers.findIndex(h => h.includes("cargo") || h === "position");

  if (nameIndex === -1 || emailIndex === -1) {
    return [];
  }

  const participants: ParsedParticipant[] = [];
  const seenEmails = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));

    const name = values[nameIndex] || "";
    const email = values[emailIndex]?.toLowerCase() || "";
    const phone = phoneIndex !== -1 ? values[phoneIndex] : undefined;
    const department = departmentIndex !== -1 ? values[departmentIndex] : undefined;
    const position = positionIndex !== -1 ? values[positionIndex] : undefined;

    const errors: string[] = [];

    if (!name) errors.push("Nome obrigatório");
    if (!email) errors.push("Email obrigatório");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email inválido");
    else if (seenEmails.has(email)) errors.push("Email duplicado");

    if (email) seenEmails.add(email);

    participants.push({
      name,
      email,
      phone,
      department,
      position,
      isValid: errors.length === 0,
      errors,
    });
  }

  return participants;
}

export function CsvImport({
  open,
  onOpenChange,
  onImport,
  isLoading = false,
}: CsvImportProps) {
  const [parsedData, setParsedData] = useState<ParsedParticipant[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = parsedData.filter(p => p.isValid).length;
  const invalidCount = parsedData.filter(p => !p.isValid).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        setParseError("Arquivo inválido. Certifique-se de que o CSV contém colunas 'nome' e 'email'.");
        setParsedData([]);
      } else {
        setParsedData(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validParticipants = parsedData
      .filter(p => p.isValid)
      .map(({ name, email, phone, department, position }) => ({
        name,
        email,
        phone,
        department,
        position,
      }));

    await onImport(validParticipants);
    setParsedData([]);
    setFileName("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setParsedData([]);
    setFileName("");
    setParseError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Importar Participantes via CSV</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV com as colunas: nome, email, telefone (opcional), departamento (opcional), cargo (opcional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload area */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Clique para selecionar ou arraste um arquivo CSV
            </p>
            {fileName && (
              <div className="flex items-center justify-center gap-2 mt-2 text-primary">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{fileName}</span>
              </div>
            )}
          </div>

          {/* Parse error */}
          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {/* Preview table */}
          {parsedData.length > 0 && (
            <>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  {validCount} válidos
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <X className="h-4 w-4" />
                    {invalidCount} com erros
                  </span>
                )}
              </div>

              <ScrollArea className="h-[250px] rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">Status</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Cargo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((participant, index) => (
                      <TableRow
                        key={index}
                        className={!participant.isValid ? "bg-destructive/5" : undefined}
                      >
                        <TableCell>
                          {participant.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span>{participant.name || "-"}</span>
                            {participant.errors.length > 0 && (
                              <p className="text-sm text-destructive">
                                {participant.errors.join(", ")}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{participant.email || "-"}</TableCell>
                        <TableCell>{participant.department || "-"}</TableCell>
                        <TableCell>{participant.position || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || isLoading}
          >
            {isLoading ? "Importando..." : `Importar ${validCount} participantes`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
