import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recommendation } from "@/lib/recommendations";
import { CheckCircle2, Target } from "lucide-react";

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recomendações para Você</h3>
      </div>

      {recommendations.map((rec, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{rec.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{rec.description}</p>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-2">
              {rec.practices.map((practice, pIndex) => (
                <li key={pIndex} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
