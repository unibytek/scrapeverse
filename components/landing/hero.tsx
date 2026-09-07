"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlayCircleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { GlowOrbs } from "@/components/ui/glow-orbs";
import { LiveStats } from "@/components/ui/live-stats";
import { RadarDeck } from "./radar-deck";

interface HeroProps {
  onGetStarted: () => void;
}

const HEADLINE_WORDS: { text: string; gloss?: boolean }[] = [
  { text: "Find" },
  { text: "open-source" },
  { text: "projects" },
  { text: "worth", gloss: true },
  { text: "contributing", gloss: true },
  { text: "to", gloss: true },
];

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
      {/* Background */}
      <GlowOrbs />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {HEADLINE_WORDS.map((word, i) => (
              <span key={i} className="inline-block sm:inline">
                <span
                  style={{ animationDelay: `${130 + i * 90}ms` }}
                  className={`animate-fade-up inline-block [animation-fill-mode:both] ${
                    word.gloss ? "text-gloss" : ""
                  }`}
                >
                  {word.text}
                </span>
                {i < HEADLINE_WORDS.length - 1 && (
                  <span
                    className="inline-block w-[0.24em]"
                    aria-hidden="true"
                  />
                )}
              </span>
            ))}
          </h1>

          <p
            style={{ animationDelay: "180ms" }}
            className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Tell us your interests and stack — we scan thousands of live issues
            and surface the ones where you can actually land your first (or
            next) pull request.
          </p>

          <div
            style={{ animationDelay: "270ms" }}
            className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              variant="gradient"
              size="xl"
              onClick={onGetStarted}
              className="w-full sm:w-auto"
            >
              Find my projects
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
            <Button
              variant="outline"
              size="xl"
              render={<a href="#how-it-works" />}
              className="w-full sm:w-auto"
            >
              <HugeiconsIcon icon={PlayCircleIcon} />
              See how it works
            </Button>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <RadarDeck />
        </div>

        <div
          style={{ animationDelay: "520ms" }}
          className="animate-fade-up mx-auto mt-10 max-w-3xl"
        >
          <LiveStats hideLabel />
        </div>
      </div>
    </section>
  );
}
