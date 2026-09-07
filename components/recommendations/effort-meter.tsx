"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Target01Icon,
  Shield01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import type { EffortEstimate } from "@/lib/effort";
import { scopeLabelFor } from "@/lib/effort";
import { cn } from "@/lib/utils";

const riskStyles: Record<EffortEstimate["risk"], string> = {
  low: "text-mint-foreground",
  medium: "text-amber-foreground",
  high: "text-destructive",
};

function EffortStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
      <span className="shrink-0 text-secondary-foreground/70">{icon}</span>
      <span className="max-w-full text-[10px] font-medium tracking-wider text-muted-foreground/80 uppercase">
        {label}
      </span>
      <span className={cn("truncate text-xs font-bold", accent)}>{value}</span>
    </div>
  );
}

export function EffortMeter({ effort }: { effort: EffortEstimate }) {
  const [open, setOpen] = useState(false);
  const scope = scopeLabelFor(effort.scope);

  return (
    <div className="animate-slide-up-sm rounded-xl bg-card/60 p-3 ring-1 ring-border/60">
      <div className="grid grid-cols-3 divide-x divide-border/60">
        <EffortStat
          icon={<HugeiconsIcon icon={Clock01Icon} size={13} />}
          label="Time to fix"
          value={effort.timeLabel}
        />
        <EffortStat
          icon={<HugeiconsIcon icon={Target01Icon} size={13} />}
          label="Change size"
          value={scope}
        />
        <EffortStat
          icon={<HugeiconsIcon icon={Shield01Icon} size={13} />}
          label="Risk"
          value={effort.riskLabel}
          accent={riskStyles[effort.risk]}
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2.5 flex w-full items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-primary uppercase transition-colors hover:text-primary-hover"
      >
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={11}
          className={cn(
            "transition-transform duration-300",
            open && "rotate-90",
          )}
        />
        How to land this
      </button>

      {open && (
        <ol className="mt-2 space-y-1.5 border-t border-border/70 pt-2.5">
          {effort.happyPath.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground"
            >
              <span
                className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-primary-softer text-[9px] font-bold text-primary"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
