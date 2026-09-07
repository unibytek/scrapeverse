"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <span
          role="button"
          aria-label="View logo full size"
          title="Click to view logo"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          className="relative flex size-8 shrink-0 cursor-zoom-in items-center justify-center overflow-hidden rounded-xl bg-card ring-1 ring-border/40 shadow-[0_6px_16px_-4px_rgb(14_148_136/0.5),0_0_24px_-8px_rgb(47_212_190/0.55)] transition-transform hover:scale-105"
        >
          <Image
            src="/logo.png"
            alt=""
            width={1254}
            height={1254}
            className="size-full rounded-xl object-cover"
          />
        </span>
        <span className="hidden bg-linear-to-r from-foreground via-primary to-brand-end bg-clip-text font-heading text-lg font-bold tracking-tight text-transparent sm:inline">
          Scrapeverse
        </span>
      </span>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Scrapeverse logo"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#04070c] p-6 sm:p-10"
        >
          <button
            type="button"
            aria-label="Close logo preview"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground shadow-soft transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
          <Image
            src="/logo.png"
            alt="Scrapeverse logo"
            width={1254}
            height={1254}
            onClick={(e) => e.stopPropagation()}
            className="animate-step-in max-h-[80vh] max-w-full rounded-3xl object-contain shadow-glow ring-1 ring-border/40"
          />
        </div>
      )}
    </>
  );
}
