import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SelfRegisterLinkDialogProps {
  selfRegisterToken: string;
  companyName: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SelfRegisterLinkDialog({
  selfRegisterToken,
  companyName,
  trigger,
  open,
  onOpenChange,
}: SelfRegisterLinkDialogProps) {
  const [copied, setCopied] = useState(false);

  const link = `${window.location.origin}/autocadastro/${selfRegisterToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link de Autocadastro</DialogTitle>
          <DialogDescription>
            Compartilhe este link para que participantes de <strong>{companyName}</strong> se cadastrem automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input value={link} readOnly className="text-sm" />
          <Button size="icon" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
