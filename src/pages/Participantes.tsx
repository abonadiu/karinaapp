import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Building2, Upload, UserPlus } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParticipantManager } from "@/components/participants/ParticipantManager";
import { ParticipantForm, ParticipantFormData } from "@/components/participants/ParticipantForm";
import { CsvImport } from "@/components/participants/CsvImport";
import { SelfRegisterLinkDialog } from "@/components/participants/SelfRegisterLinkDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/integrations/backend/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Participant } from "@/hooks/useParticipantActions";

interface Company {
  id: string;
  name: string;
  self_register_token?: string;
}

export default function Participantes() {
  const { user } = useAuth();
  const location = useLocation();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);

    const [participantsResult, companiesResult] = await Promise.all([
      supabase
        .from("participants")
        .select("*, companies(name)")
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("companies")
        .select("id, name, self_register_token")
        .order("name"),
    ]);

    if (participantsResult.error) {
      toast.error("Erro ao carregar participantes");
      console.error(participantsResult.error);
    } else {
      setParticipants((participantsResult.data || []) as Participant[]);
    }

    if (!companiesResult.error) {
      setCompanies(companiesResult.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (location.state?.companyFilter) {
      setCompanyFilter(location.state.companyFilter);
    }
  }, [location.state]);

  const handleCreateParticipant = async (data: ParticipantFormData) => {
    if (!user || !data.company_id) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("participants")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        department: data.department || null,
        position: data.position || null,
        company_id: data.company_id,
        facilitator_id: user.id,
      });

    if (error) {
      toast.error("Erro ao criar participante");
      console.error(error);
    } else {
      toast.success("Participante adicionado!");
      fetchData();
    }
    setIsSaving(false);
  };

  const handleCsvImport = async (
    csvParticipants: { name: string; email: string; phone?: string; department?: string; position?: string }[]
  ) => {
    if (!user) return;

    const targetCompanyId = companyFilter !== "all" ? companyFilter : null;
    if (!targetCompanyId) {
      toast.error("Selecione uma empresa no filtro antes de importar via CSV");
      return;
    }

    const rows = csvParticipants.map((p) => ({
      name: p.name,
      email: p.email,
      phone: p.phone || null,
      department: p.department || null,
      position: p.position || null,
      company_id: targetCompanyId,
      facilitator_id: user.id,
    }));

    const { error } = await supabase.from("participants").insert(rows);

    if (error) {
      toast.error("Erro ao importar participantes");
      console.error(error);
    } else {
      toast.success(`${rows.length} participantes importados!`);
      fetchData();
    }
  };

  // Filter by company (the ParticipantManager handles search + status filter internally)
  const companyFilteredParticipants = companyFilter === "all"
    ? participants
    : participants.filter(p => p.company_id === companyFilter);

  return (
    <DashboardLayout
      title="Participantes"
      description="Todos os participantes de todas as empresas"
    >
      {/* Action buttons */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-end gap-2 flex-wrap">
          {companyFilter !== "all" && (() => {
            const selectedCompany = companies.find(c => c.id === companyFilter);
            return selectedCompany?.self_register_token ? (
              <SelfRegisterLinkDialog
                selfRegisterToken={selectedCompany.self_register_token}
                companyName={selectedCompany.name}
              />
            ) : null;
          })()}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (companyFilter === "all") {
                toast.error("Selecione uma empresa no filtro antes de importar via CSV");
                return;
              }
              setIsCsvOpen(true);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Participante
          </Button>
        </div>

        {/* Company filter (only on this page) */}
        <div className="flex items-center">
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Modular ParticipantManager */}
      <ParticipantManager
        participants={companyFilteredParticipants}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Create participant form */}
      <ParticipantForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateParticipant}
        isLoading={isSaving}
        companies={companies}
      />

      {/* CSV import */}
      <CsvImport
        open={isCsvOpen}
        onOpenChange={setIsCsvOpen}
        onImport={handleCsvImport}
      />
    </DashboardLayout>
  );
}
