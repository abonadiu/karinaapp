import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Filter, Building2, Calendar } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface FeedbackFiltersProps {
  companies: Company[];
  selectedStatus: string;
  selectedPeriod: string;
  selectedCompany: string;
  onStatusChange: (status: string) => void;
  onPeriodChange: (period: string) => void;
  onCompanyChange: (companyId: string) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "scheduled", label: "Agendadas" },
  { value: "completed", label: "Realizadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "no_show", label: "Não compareceu" },
];

const PERIOD_OPTIONS = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "1y", label: "Último ano" },
  { value: "all", label: "Todo o período" },
];

export function FeedbackFilters({
  companies,
  selectedStatus,
  selectedPeriod,
  selectedCompany,
  onStatusChange,
  onPeriodChange,
  onCompanyChange,
}: FeedbackFiltersProps) {
  return (
    <Card className="p-4 shadow-warm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCompany} onValueChange={onCompanyChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
