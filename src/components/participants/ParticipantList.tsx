import { Users, MoreHorizontal, Pencil, Trash2, Mail, Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

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
}

interface ParticipantListProps {
  participants: Participant[];
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
  onInvite: (participant: Participant) => void;
  isLoading?: boolean;
  showCompany?: boolean;
  sendingInviteId?: string | null;
}

export function ParticipantList({ 
  participants, 
  onEdit, 
  onDelete,
  onInvite,
  isLoading,
  sendingInviteId,
}: ParticipantListProps) {
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

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participante</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
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
                <StatusBadge status={participant.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(participant.status === "pending" || participant.status === "invited") && (
                      <DropdownMenuItem 
                        onClick={() => onInvite(participant)}
                        disabled={sendingInviteId === participant.id}
                      >
                        {sendingInviteId === participant.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        {sendingInviteId === participant.id 
                          ? "Enviando..." 
                          : participant.status === "invited" 
                            ? "Reenviar convite"
                            : "Enviar convite"
                        }
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(participant)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(participant)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
