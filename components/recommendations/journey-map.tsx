"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  FireIcon,
  EyeIcon,
  CheckmarkCircle01Icon,
  Chat01Icon,
  Rocket01Icon,
  Bookmark01Icon,
} from "@hugeicons/core-free-icons";
import { useSavedIssues } from "@/lib/saved-issues-context";
import { cn } from "@/lib/utils";

const milestoneIcons = [
  { icon: EyeIcon, tint: "bg-sky text-sky-foreground" },
  { icon: Bookmark01Icon, tint: "bg-lavender text-lavender-foreground" },
  { icon: Chat01Icon, tint: "bg-peach text-peach-foreground" },
  { icon: Rocket01Icon, tint: "bg-primary-soft text-primary" },
  { icon: CheckmarkCircle01Icon, tint: "bg-mint text-mint-foreground" },
  { icon: FireIcon, tint: "bg-amber-soft text-amber-foreground" },
];

export function JourneyMap() {
  const { bundle } = useSavedIssues();
  const { stats, streak } = bundle;
  const total = stats.interested + stats.applied + stats.pr;
  const applied = stats.applied + stats.pr;
  const pr = stats.pr;

  const milestones = [
    { label: "First saved issue", need: 1, value: total },
    { label: "First application", need: 1, value: applied },
    { label: "First PR sent", need: 1, value: pr },
    { label: "3 PRs sent", need: 3, value: pr },
    { label: "5 saved issues", need: 5, value: total },
    { label: "15 saved issues", need: 15, value: total },
  ];

  const maxNeed = Math.max(...milestones.map((m) => m.need));

  return (
    <section className="card-shine animate-slide-up-sm relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground">
            Your contribution journey
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track progress from first look to merged PR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-primary-softer px-3 py-1.5 text-xs font-bold text-primary">
            <HugeiconsIcon icon={FireIcon} size={13} />
            {streak.current} {streak.current === 1 ? "day" : "days"}
            <span className="font-medium text-muted-foreground">
              · best {streak.best}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {stats.interested} watching
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {stats.applied} applied
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {stats.pr} PRs sent
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <ol className="relative flex min-w-[52rem] items-start gap-2">
          {milestones.map((m, i) => {
            const done = m.value >= m.need;
            const Icon = milestoneIcons[i % milestoneIcons.length].icon;
            const tint = milestoneIcons[i % milestoneIcons.length].tint;
            const progress = Math.min(
              100,
              Math.round((m.value / m.need) * 100),
            );
            return (
              <li
                key={m.label}
                className="relative flex flex-1 flex-col items-center"
              >
                {i < milestones.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-4 right-[-50%] left-[50%] h-0.5",
                      m.value >= milestones[i + 1].need
                        ? "bg-gradient-to-r from-primary to-brand-end"
                        : "bg-border",
                    )}
                    style={{ width: "100%" }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-8 items-center justify-center rounded-full ring-2 ring-background transition-all duration-300",
                    done
                      ? `${tint} shadow-glow`
                      : "border border-border bg-muted text-muted-foreground/50",
                  )}
                >
                  <HugeiconsIcon icon={Icon} size={15} />
                </span>
                <span
                  className={cn(
                    "mt-2 text-center text-[10px] font-semibold leading-tight",
                    done ? "text-foreground" : "text-muted-foreground/70",
                  )}
                >
                  {m.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[10px] font-bold tabular-nums",
                    done ? "text-primary" : "text-muted-foreground/50",
                  )}
                >
                  {Math.min(m.value, m.need)}/{m.need}
                </span>
                <div className="mt-1.5 h-1 w-16 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500",
                      done ? "bg-success" : "bg-primary/50",
                      streak.current > 0 && done && "animate-bar-fill",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-4 h-px bg-border/70" />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground/80">
          <span className="font-semibold text-foreground">
            {maxNeed - total > 0 ? maxNeed - total : "0"}
          </span>{" "}
          more saved issues to your next milestone.
        </p>
        <p className="text-[10px] tracking-wider text-muted-foreground/60 uppercase">
          Progress is stored per issue — update it as you go
        </p>
      </div>
    </section>
  );
}
