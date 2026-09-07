"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { TiltCard } from "@/components/ui/tilt-card";

const BLIPS = [
  { x: 26, y: 32, color: "#2fd4be", match: true },
  { x: 62, y: 22, color: "#8b7cf0", match: false },
  { x: 72, y: 56, color: "#51e3b4", match: true },
  { x: 46, y: 70, color: "#ecc069", match: false },
  { x: 32, y: 58, color: "#5eb5f5", match: false },
  { x: 58, y: 46, color: "#2fd4be", match: true },
  { x: 78, y: 34, color: "#5eb5f5", match: false },
];

const FALLBACK_LINES = [
  "sweeping GitHub for fresh activity · watching trending repos",
  "matched 94% — language / interest / repo health",
  "indexing new pushes across monitored repos",
  "ranking repos updated in the last 24 hours",
  "sweep complete · latest pushes mapped",
];

interface Activity {
  totalRepos: number;
  updated24h: number;
  updated7d: number;
  recentlyPushed: {
    fullName: string;
    language: string | null;
    stars: number;
    pushedAt: string | null;
  }[];
  recentlyScraped: {
    fullName: string;
    language: string | null;
    openIssues: number;
    scrapedAt: string;
  }[];
}

function timeAgo(iso: string) {
  const seconds = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function makeLines(activity: Activity | null): string[] {
  if (!activity) return FALLBACK_LINES;
  const pushed = activity.recentlyPushed;
  const scraped = activity.recentlyScraped;
  const lines: string[] = [];

  if (pushed[0]) {
    lines.push(
      `${pushed[0].fullName} pushed ${timeAgo(pushed[0].pushedAt ?? "")}`,
    );
  }
  if (activity.updated24h > 0) {
    lines.push(
      `${activity.updated24h.toLocaleString()} repos updated in the last 24h`,
    );
  }
  if (scraped[0]) {
    lines.push(
      `${scraped[0].fullName} · ${scraped[0].openIssues} open issues matched`,
    );
  }
  if (activity.updated7d > 0) {
    lines.push(
      `${activity.updated7d.toLocaleString()} pushes this week across the radar`,
    );
  }
  if (pushed[1]) {
    lines.push(
      `tracking ${pushed[1].fullName} · ${pushed[1].stars.toLocaleString()} stars`,
    );
  }
  while (lines.length < 5) lines.push(FALLBACK_LINES[lines.length]!);

  return lines;
}

function TypewriterConsole({ lines }: { lines: string[] }) {
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const current = lines[line];
    if (!current) return;
    if (chars < current.length) {
      const t = setTimeout(() => setChars(chars + 1), 24);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLine((line + 1) % lines.length);
      setChars(0);
    }, 1100);
    return () => clearTimeout(t);
  }, [chars, line, lines]);

  return (
    <p className="min-h-6 truncate font-mono text-[11px] leading-6 sm:text-xs">
      <span className="text-primary">→</span>{" "}
      <span className="text-foreground">{lines[line]?.slice(0, chars)}</span>
      <span className="animate-pulse-dot">▍</span>
    </p>
  );
}

function HubAccent({
  className,
  activity,
}: {
  className: string;
  activity: Activity | null;
}) {
  const latest = activity?.recentlyPushed[0];
  return (
    <div
      aria-hidden="true"
      className={`absolute z-10 flex items-center gap-2 rounded-xl border border-border/80 bg-card/90 px-3.5 py-2.5 shadow-lift backdrop-blur-md ${className}`}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-mint text-mint-foreground">
        <HugeiconsIcon icon={SparklesIcon} size={15} />
      </span>
      <div>
        <p className="max-w-[10rem] truncate font-mono text-xs font-semibold text-foreground">
          {latest ? latest.fullName : "waiting for pushes"}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {latest
            ? `pushed ${timeAgo(latest.pushedAt ?? "")}`
            : "scanning github"}
        </p>
      </div>
    </div>
  );
}

function FabAccent({
  className,
  activity,
}: {
  className: string;
  activity: Activity | null;
}) {
  const value =
    activity?.updated24h ?? (activity ? activity.updated7d : null) ?? null;
  return (
    <div
      aria-hidden="true"
      className={`absolute z-10 flex items-center gap-2 rounded-xl border border-border/80 bg-card/90 px-3.5 py-2.5 shadow-lift backdrop-blur-md ${className}`}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <HugeiconsIcon icon={SparklesIcon} size={15} />
      </span>
      <div>
        <p className="font-mono text-xs font-semibold text-primary tabular-nums">
          {value !== null ? `${value.toLocaleString()} repos` : "… repos"}
        </p>
        <p className="text-[10px] text-muted-foreground">updated · live</p>
      </div>
    </div>
  );
}

export function RadarDeck() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loaded, setLoaded] = useState(false);
  const lines = makeLines(activity);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/repos/activity", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setActivity(data);
        setLoaded(true);
      } catch {
        if (!cancelled) setLoaded(true);
      }
    };

    load();
    const refresh = setInterval(load, 60_000);

    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, []);

  return (
    <div className="animate-fade-up relative mx-auto w-full max-w-2xl">
      <div className="card-shine relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-lift backdrop-blur-xl">
        {/* HUD header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-card/70 px-4 py-2.5">
          <span className="flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full ${loaded && activity ? "animate-pulse-dot bg-success" : "bg-muted-foreground/40"}`}
            />
            Target sweep
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.22em] text-muted-foreground/70 uppercase sm:block">
            github / live-activity
          </span>
        </div>

        <div className="relative p-5 sm:p-7">
          {/* Radar circle */}
          <TiltCard maxTilt={4} className="mx-auto w-full max-w-[24rem]">
            <div className="relative aspect-square w-full">
              {/* Rings */}
              <div className="absolute inset-0 rounded-full border border-primary/15" />
              <div className="absolute inset-[18%] rounded-full border border-primary/10" />
              <div className="absolute inset-[36%] rounded-full border border-primary/10" />
              {/* Crosshairs */}
              <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-primary/10" />
              <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-primary/10" />

              {/* Sweep blade */}
              <div
                aria-hidden="true"
                className="animate-radar-sweep absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgb(47 212 190 / 0.34) 20deg, rgb(139 124 240 / 0.24) 40deg, transparent 66deg)",
                  filter: "blur(1.5px)",
                }}
              />

              {/* Scan line */}
              <div
                aria-hidden="true"
                className="animate-radar-scan absolute inset-x-[6%] top-0 h-10 rounded-full bg-[linear-gradient(to_bottom,transparent,rgb(47_212_190/0.12),transparent)]"
              />

              {/* Blips */}
              {BLIPS.map((b, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                >
                  <span
                    className="animate-radar-blip block size-2.5 rounded-full"
                    style={{
                      backgroundColor: b.color,
                      boxShadow: `0 0 14px 3px ${b.color}66`,
                      animationDelay: `${0.4 * i}s`,
                    }}
                  />
                  {b.match && (
                    <span
                      className="animate-radar-ping absolute inset-0 rounded-full"
                      style={{
                        backgroundColor: `${b.color}33`,
                        animationDelay: `${0.4 * i}s`,
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Hub */}
              <div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="absolute inset-0 animate-radar-ping rounded-full bg-primary/25" />
                <span className="animate-pulse-dot relative flex size-11 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary via-brand-mid to-brand-end shadow-glow">
                  <HugeiconsIcon
                    icon={SparklesIcon}
                    size={18}
                    className="text-primary-foreground"
                  />
                </span>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Console */}
        <div className="border-t border-border/70 bg-card/70 px-4 py-3">
          <TypewriterConsole lines={lines} />
        </div>

        {/* Recent uploads */}
        {activity && activity.recentlyPushed.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 bg-card/40 px-4 py-2.5">
            <span className="mr-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/70 uppercase">
              pushed
            </span>
            {activity.recentlyPushed.map((r) => (
              <span
                key={r.fullName}
                className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-full border border-border/60 bg-card/80 py-0.5 pr-2 pl-1.5 text-[10px] text-muted-foreground"
              >
                <span className="size-1 rounded-full bg-primary/70" />
                <span className="truncate font-mono font-medium text-secondary-foreground">
                  {r.fullName}
                </span>
                <span className="text-[9px] text-muted-foreground/60">
                  {timeAgo(r.pushedAt ?? "")}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* HUD accents */}
      <HubAccent
        className="animate-float -top-8 -left-3 hidden lg:flex"
        activity={activity}
      />
      <FabAccent
        className="animate-float-delayed -bottom-8 -right-3 hidden lg:flex"
        activity={activity}
      />
    </div>
  );
}
