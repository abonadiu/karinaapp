import { LucideIcon, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamProgressCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "muted";
  onClick?: () => void;
  isActive?: boolean;
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
  variant = "default",
  onClick,
  isActive = false
}: TeamProgressCardProps) {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        "shadow-warm transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",
        isActive && "ring-2 ring-primary border-primary"
      )}
      onClick={onClick}
    >
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
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {isClickable && (
            <ChevronRight className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              isActive && "rotate-90 text-primary"
            )} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
