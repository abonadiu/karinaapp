import { useState } from "react";
import { Users, Pencil, Trash2, Mail, Loader2, Bell, ClipboardList, Eye, Link2, FileText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusBadge";
import { toast } from "sonner";

type ParticipantStatus = "pending" | "invited" | "in_progress" | "completed";

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  status: ParticipantStatus;
  company_id: string;
  created_at: string;
  access_token?: string;
  invited_at?: string | null;
  user_id?: string | null;
}

interface ParticipantListProps {
  participants: Participant[];
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
  onInvite: (participant: Participant) => void;
  onReminder?: (participant: Participant) => void;
  onRowClick?: (participant: Participant) => void;
  onAssignTest?: (participant: Participant) => void;
  isLoading?: boolean;
  showCompany?: boolean;
  sendingInviteId?: string | null;
  sendingReminderId?: string | null;
  testCounts?: Record<string, { total: number; completed: number }>;
  selectedForComparison?: Set<string>;
  onToggleComparison?: (participantId: string) => void;
}

export function ParticipantList({ 
  participants, 
  onEdit, 
  onDelete,
  onInvite,
  onReminder,
  onRowClick,
  onAssignTest,
  isLoading,
  sendingInviteId,
  sendingReminderId,
  testCounts,
  selectedForComparison,
  onToggleComparison,
}: ParticipantListProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          Nenhum participante cadastrado
        </h3>
        <p className="text-muted-foreground">
          Adicione participantes individualmente ou importe via CSV
        </p>
      </div>
    );
  }

  const showCheckbox = !!onToggleComparison;

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckbox && (
              <TableHead className="w-[40px]">
                <span className="sr-only">Selecionar</span>
              </TableHead>
            )}
            <TableHead>Participante</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Testes</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => {
            const counts = testCounts?.[participant.id];
            const isSelected = selectedForComparison?.has(participant.id) ?? false;
            return (
              <Popover 
                key={participant.id} 
                open={openPopoverId === participant.id} 
                onOpenChange={(open) => setOpenPopoverId(open ? participant.id : null)}
              >
                <PopoverTrigger asChild>
                  <TableRow 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                  >
                    {showCheckbox && (
                      <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleComparison?.(participant.id)}
                          aria-label={`Selecionar ${participant.name} para comparação`}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {participant.department || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {participant.position || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {counts ? (
                        <Badge variant="secondary" className="text-xs">
                          {counts.completed}/{counts.total}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={participant.status} />
                    </TableCell>
                  </TableRow>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <div className="flex flex-col">
                    {onRowClick && (
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        onClick={() => {
                          setOpenPopoverId(null);
                          onRowClick(participant);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Ver resultados
                      </button>
                    )}
                    {onAssignTest && (
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        onClick={() => {
                          setOpenPopoverId(null);
                          onAssignTest(participant);
                        }}
                      >
                        <ClipboardList className="h-4 w-4" />
                        Atribuir teste
                      </button>
                    )}
                    {participant.status === "pending" && (
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:pointer-events-none"
                        disabled={sendingInviteId === participant.id}
                        onClick={() => {
                          setOpenPopoverId(null);
                          onInvite(participant);
                        }}
                      >
                        {sendingInviteId === participant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        {sendingInviteId === participant.id ? "Enviando..." : "Enviar convite"}
                      </button>
                    )}
                    {(participant.status === "invited" || participant.status === "in_progress") && onReminder && (
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:pointer-events-none"
                        disabled={sendingReminderId === participant.id}
                        onClick={() => {
                          setOpenPopoverId(null);
                          onReminder(participant);
                        }}
                      >
                        {sendingReminderId === participant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                        {sendingReminderId === participant.id ? "Enviando..." : "Enviar lembrete"}
                      </button>
                    )}
                    {!participant.user_id && participant.access_token && (
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        onClick={() => {
                          const url = `${window.location.origin}/participante/cadastro/${participant.access_token}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Link de cadastro copiado!");
                          setOpenPopoverId(null);
                        }}
                      >
                        <Link2 className="h-4 w-4" />
                        Link para criar conta
                      </button>
                    )}
                    <div className="border-t my-1" />
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                      onClick={() => {
                        setOpenPopoverId(null);
                        onEdit(participant);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-destructive/10 transition-colors text-left text-destructive"
                      onClick={() => {
                        setOpenPopoverId(null);
                        onDelete(participant);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
