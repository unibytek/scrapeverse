"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  Task01Icon,
  DocumentCodeIcon,
  Radar01Icon,
} from "@hugeicons/core-free-icons";
import { useCountUp } from "@/lib/use-count-up";
import { timeToString } from "@/lib/time-to-string";
import { cn } from "@/lib/utils";

interface ScrapeStatus {
  repos: number;
  issues: number;
  readmes: number;
  lastScrapedAt: string | null;
}

function StatTile({
  icon,
  label,
  value,
  suffix,
  tint,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  tint: string;
  delay: number;
}) {
  const display = useCountUp(value, 1400);

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-up group flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          tint,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-shimmer font-heading text-2xl font-extrabold tabular-nums">
          {display.toLocaleString()}
          {suffix ? <span className="text-lg">{suffix}</span> : null}
        </p>
        <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

export function LiveStats({
  className,
  hideLabel = false,
}: {
  className?: string;
  hideLabel?: boolean;
}) {
  const [status, setStatus] = useState<ScrapeStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/scrape/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setStatus(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[5.5rem] animate-pulse rounded-2xl border border-border/60 bg-muted/50"
          />
        ))}
      </div>
    );
  }

  const lastScraped = status.lastScrapedAt
    ? timeSince(status.lastScrapedAt)
    : "never";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-4 shadow-soft backdrop-blur-sm sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-success" />
          Live data radar
        </p>
        {!hideLabel && (
          <p className="text-[11px] text-muted-foreground">
            Scraped <span className="font-semibold text-foreground">{lastScraped}</span>
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<HugeiconsIcon icon={Folder01Icon} size={18} />}
          label="Repos monitored"
          value={status.repos}
          tint="bg-lavender text-lavender-foreground"
          delay={0}
        />
        <StatTile
          icon={<HugeiconsIcon icon={Task01Icon} size={18} />}
          label="Open issues scanned"
          value={status.issues}
          tint="bg-sky text-sky-foreground"
          delay={80}
        />
        <StatTile
          icon={<HugeiconsIcon icon={DocumentCodeIcon} size={18} />}
          label="READMEs analyzed"
          value={status.readmes}
          tint="bg-mint text-mint-foreground"
          delay={160}
        />
        <StatTile
          icon={<HugeiconsIcon icon={Radar01Icon} size={18} />}
          label="Avg issues per repo"
          value={status.repos > 0 ? Math.round(status.issues / status.repos) : 0}
          tint="bg-primary-soft text-primary"
          delay={240}
        />
      </div>
    </div>
  );
}

function timeSince(iso: string): string {
  const secs = (Date.now() - new Date(iso).getTime()) / 1000;
  if (secs < 60) return "just now";
  return `${timeToString(secs)} ago`;
}