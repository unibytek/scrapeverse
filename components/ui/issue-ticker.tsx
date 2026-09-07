"use client";

import { useEffect, useState } from "react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { languageColorMap } from "@/lib/languages";

interface RecentItem {
  fullName: string;
  title: string;
  language: string | null;
  number: number;
  url: string;
  scrapedAt: string;
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

function LangDot({ lang }: { lang: string | null }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2 rounded-full"
      style={{
        backgroundColor: lang ? (languageColorMap[lang] ?? "#5e7f79") : "#5e7f79",
      }}
    />
  );
}

function LiveStage({ item }: { item: RecentItem }) {
  return (
    <a
      key={item.url}
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="card-shine animate-fade-up group relative flex items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-lift backdrop-blur-xl transition-colors hover:border-primary/40 sm:p-5"
    >
      <span className="relative flex size-2.5 shrink-0">
        <span
          aria-hidden="true"
          className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-3 opacity-75"
        />
        <span className="relative inline-flex size-2.5 rounded-full bg-chart-3" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-mono text-[11px] font-semibold text-secondary-foreground sm:text-xs">
          {item.fullName}
          <span className="text-muted-foreground/50">#{item.number}</span>
        </span>
        <span className="mt-0.5 block truncate text-sm text-foreground sm:text-base">
          {item.title}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <LangDot lang={item.language} />
        <span className="font-mono text-[10px] text-muted-foreground">
          {timeAgo(item.scrapedAt)}
        </span>
      </span>
      <span className="sr-only">Open this GitHub issue</span>
    </a>
  );
}

function CompactTicker({ items }: { items: RecentItem[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="issue-ticker mask-fade-x relative overflow-hidden">
      <div className="issue-ticker-track gap-3 pr-3">
        {doubled.map((item, i) => (
          <a
            key={`${item.url}-${i}`}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-border/70 bg-card/85 py-1.5 pr-4 pl-2.5 shadow-soft transition-colors hover:border-primary/40"
          >
            <LangDot lang={item.language} />
            <span className="truncate font-mono text-[11px] font-semibold text-secondary-foreground">
              {item.fullName}
            </span>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {item.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function IssueTicker({
  compact = false,
  onGetStarted,
}: {
  compact?: boolean;
  onGetStarted?: () => void;
}) {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/issues/recent", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setItems(data.items ?? []);
        setTotal(data.total ?? null);
        setLoaded(true);
      } catch {
        if (!cancelled) setLoaded(true);
      }
    };

    load();
    const refresh = setInterval(load, 20_000);
    const rotate = setInterval(() => setIndex((i) => i + 1), 3400);

    return () => {
      cancelled = true;
      clearInterval(refresh);
      clearInterval(rotate);
    };
  }, []);

  const current = items.length > 0 ? items[index % items.length] : null;
  const seenEarlier = current
    ? items.filter((i) => i.url !== current.url).slice(0, 4)
    : [];
  const languages = [...new Set(items.map((i) => i.language).filter(Boolean))] as string[];

  if (compact) {
    if (loaded && items.length === 0) return null;
    return (
      <section className="relative py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex size-2 shrink-0">
              <span
                aria-hidden="true"
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-3 opacity-75"
              />
              <span className="relative inline-flex size-2 rounded-full bg-chart-3" />
            </span>
            <p className="text-xs font-semibold text-foreground sm:text-sm">
              Live stream{" "}
              <span className="text-muted-foreground">
                — issues our scanner is finding right now
              </span>
            </p>
          </div>
          {items.length > 0 && <CompactTicker items={items} />}
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Heading — tells the user what the live feed actually is */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            <span className="relative flex size-1.5">
              <span
                aria-hidden="true"
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-3 opacity-75"
              />
              <span className="relative inline-flex size-1.5 rounded-full bg-chart-3" />
            </span>
            Live right now
          </span>
          <h2 className="font-heading mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Real open-source issues, streaming in
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every few seconds our scanner pulls a fresh, open issue from GitHub.
            This is exactly the kind of thing you&apos;ll find matched to your
            profile — click a card to see it for real.
          </p>
        </div>

        {/* Live stage — one readable issue at a time */}
        <div className="mt-8">
          {!loaded && (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-border/60 bg-card/60">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-primary" />
              <span className="ml-2.5 font-mono text-xs text-muted-foreground">
                connecting to scanner…
              </span>
            </div>
          )}

          {loaded && items.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/60 p-8 text-center">
              <p className="text-sm font-semibold text-foreground">
                The scanner has just started up
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                The first batch of issues lands within the next few hours. Set
                up your profile now so they match you the moment they arrive.
              </p>
              {onGetStarted && (
                <button
                  onClick={onGetStarted}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow"
                >
                  Set up profile
                  <HugeiconsIcon icon={ArrowRight01Icon} />
                </button>
              )}
            </div>
          )}

          {current && <LiveStage item={current} />}
        </div>

        {/* Earlier finds */}
        {loaded && items.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground/60 uppercase">
              seen earlier
            </span>
            {seenEarlier.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 py-1 pr-2.5 pl-2 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <LangDot lang={item.language} />
                <span className="max-w-[10rem] truncate font-medium">
                  {item.fullName}
                </span>
                <span className="opacity-70">·</span>
                <span className="max-w-[12rem] truncate">{item.title}</span>
              </a>
            ))}
          </div>
        )}

        {/* Legend + live counter */}
        {loaded && items.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                >
                  <LangDot lang={lang} />
                  {lang}
                </span>
              ))}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              <span className="font-semibold text-primary">
                {total?.toLocaleString() ?? "…"}
              </span>{" "}
              open issues on the radar{" "}
              <span className="inline-flex items-center gap-1">
                <span className="size-1 animate-pulse-dot rounded-full bg-primary" />
                live
              </span>
            </span>
          </div>
        )}

        {onGetStarted && loaded && items.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              Match me with issues like these
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}