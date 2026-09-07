"use client";

import { RecommendationCard } from "./recommendation-card";
import { TiltCard } from "@/components/ui/tilt-card";
import type { Recommendation } from "@/lib/types";

interface RecommendationGridProps {
  recommendations: Recommendation[];
}

export function RecommendationGrid({
  recommendations,
}: RecommendationGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {recommendations.map((rec, i) => (
        <TiltCard key={rec.id} maxTilt={1.25}>
          <RecommendationCard
            recommendation={rec}
            index={i}
            featured={i === 0}
          />
        </TiltCard>
      ))}
    </div>
  );
}
