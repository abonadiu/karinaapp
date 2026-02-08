import { useState, useEffect } from "react";
import { 
  ClipboardList, 
  User,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  Eye,
  Edit,
  Trash,
  Plus,
  Send,
  LogIn,
  LogOut
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data || []) as AuditLog[]);
    } catch (error: unknown) {
      console.error("Error fetching logs:", error);
      toast.error("Erro ao carregar logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
      case 'edit':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete':
      case 'remove':
        return <Trash className="h-4 w-4 text-red-500" />;
      case 'view':
      case 'read':
        return <Eye className="h-4 w-4 text-muted-foreground" />;
      case 'send':
      case 'invite':
        return <Send className="h-4 w-4 text-primary" />;
      case 'login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-amber-500" />;
      default:
        return <ClipboardList className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      create: "default",
      insert: "default",
      update: "secondary",
      edit: "secondary",
      delete: "destructive",
      remove: "destructive",
      view: "outline",
      read: "outline",
    };

    return (
      <Badge variant={variants[action.toLowerCase()] || "outline"}>
        {action}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const filteredLogs = logs.filter(log => 
    (log.user_email?.toLowerCase().includes(filter.toLowerCase()) ||
     log.action.toLowerCase().includes(filter.toLowerCase()) ||
     log.entity_type.toLowerCase().includes(filter.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Logs de Auditoria</h2>
          <p className="text-sm text-muted-foreground">
            Histórico de ações na plataforma
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Logs List */}
      <Card className="shadow-warm">
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {filter ? "Nenhum log encontrado com esse filtro" : "Nenhum log registrado ainda"}
            </div>
          ) : (
            <div className="divide-y">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActionBadge(log.action)}
                        <Badge variant="outline">{log.entity_type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {log.user_email || "Sistema"}
                        </span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(log.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
