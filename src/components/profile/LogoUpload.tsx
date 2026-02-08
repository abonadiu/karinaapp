import { useState, useRef } from "react";
import { Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/backend/client";

interface LogoUploadProps {
  userId: string;
  currentLogoUrl: string | null;
  onUpload: (url: string) => void;
}

export function LogoUpload({ userId, currentLogoUrl, onUpload }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo inválido",
        description: "Use apenas PNG, JPG ou WebP",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 2MB",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/logo.${fileExt}`;

      // Remove old logo if exists
      if (currentLogoUrl) {
        const oldPath = currentLogoUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      onUpload(urlData.publicUrl);

      toast({
        title: "Logo atualizada",
        description: "Sua logo foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message,
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentLogoUrl) return;

    try {
      const filePath = currentLogoUrl.split("/").slice(-2).join("/");
      await supabase.storage.from("avatars").remove([filePath]);
      onUpload("");
      setPreviewUrl(null);

      toast({
        title: "Logo removida",
        description: "Sua logo foi removida.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const displayUrl = previewUrl || currentLogoUrl;

  return (
    <div className="space-y-3">
      {displayUrl ? (
        <div className="relative inline-block">
          <div className="w-40 h-20 rounded-lg border border-border overflow-hidden bg-card">
            <img
              src={displayUrl}
              alt="Logo da marca"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="w-40 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
          <Image className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Enviando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {displayUrl ? "Trocar logo" : "Adicionar logo"}
            </span>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG ou WebP. Máx 2MB.
        </p>
      </div>
    </div>
  );
}
