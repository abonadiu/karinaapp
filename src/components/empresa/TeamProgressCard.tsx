import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamProgressCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "muted";
}

const variantStyles = {
  default: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-foreground",
  },
  success: {
    iconBg: "bg-green-100 dark:bg-green-950/50",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
  },
  warning: {
    iconBg: "bg-amber-100 dark:bg-amber-950/50",
    iconColor: "text-amber-600",
    valueColor: "text-amber-600",
  },
  muted: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    valueColor: "text-muted-foreground",
  },
};

export function TeamProgressCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  variant = "default" 
}: TeamProgressCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className="shadow-warm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg", styles.iconBg)}>
            <Icon className={cn("h-5 w-5", styles.iconColor)} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", styles.valueColor)}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
