import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface CompanyDetail {
  id: string;
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  averageScore: number | null;
  completionRate: number;
}

interface CompanyDetailsTableProps {
  data: CompanyDetail[];
  isLoading: boolean;
  onCompanyClick?: (companyId: string) => void;
}

type SortField = "name" | "total" | "completed" | "averageScore" | "completionRate";
type SortDirection = "asc" | "desc";

export function CompanyDetailsTable({ data, isLoading, onCompanyClick }: CompanyDetailsTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: string | number = a[sortField] ?? 0;
      let bValue: string | number = b[sortField] ?? 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc" 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const LOW_COMPLETION_THRESHOLD = 50;

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle className="text-lg">Detalhamento por Empresa</CardTitle>
        <CardDescription>Métricas completas de cada empresa</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Nenhuma empresa encontrada
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("name")}
                  >
                    Empresa
                    <SortIcon field="name" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("total")}
                  >
                    Total
                    <SortIcon field="total" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("completed")}
                  >
                    Concluídos
                    <SortIcon field="completed" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Em Andamento</TableHead>
                <TableHead className="text-center">Pendentes</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("averageScore")}
                  >
                    Média
                    <SortIcon field="averageScore" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("completionRate")}
                  >
                    Taxa Conclusão
                    <SortIcon field="completionRate" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((company) => (
                <TableRow
                  key={company.id}
                  className={onCompanyClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                  onClick={() => onCompanyClick?.(company.id)}
                >
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="text-center">{company.total}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {company.completed}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                      {company.inProgress}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{company.pending}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {company.averageScore !== null 
                      ? company.averageScore.toFixed(2) 
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {company.completionRate < LOW_COMPLETION_THRESHOLD && company.total > 0 && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                      <span className={
                        company.completionRate < LOW_COMPLETION_THRESHOLD && company.total > 0
                          ? "text-warning font-medium"
                          : ""
                      }>
                        {company.completionRate.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
