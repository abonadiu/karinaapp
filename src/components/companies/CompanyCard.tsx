import { Link } from "react-router-dom";
import { Building2, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CompanyCardProps {
  id: string;
  name: string;
  contactName?: string | null;
  totalLicenses: number;
  usedLicenses: number;
}

export function CompanyCard({
  id,
  name,
  contactName,
  totalLicenses,
  usedLicenses,
}: CompanyCardProps) {
  const usagePercent = totalLicenses > 0 
    ? Math.round((usedLicenses / totalLicenses) * 100) 
    : 0;

  return (
    <Link to={`/empresas/${id}`}>
      <Card className="shadow-warm hover:shadow-warm-lg transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {name}
                </h3>
                {contactName && (
                  <p className="text-sm text-muted-foreground">{contactName}</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                Licenças
              </span>
              <span className="font-medium">
                {usedLicenses} / {totalLicenses}
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
