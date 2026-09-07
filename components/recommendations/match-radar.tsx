"use client";

import { useId } from "react";
import type { MatchScoreBreakdown } from "@/lib/types";

function useSafeId(): string {
  return useId().replace(/:/g, "radar");
}

export interface RadarAxis {
  label: string;
  value: number;
}

const AXIS_ORDER = [
  "language",
  "interest",
  "issue",
  "project",
  "goal",
] as const;
const AXIS_LABELS: Record<string, { label: string; max: number }> = {
  language: { label: "Language", max: 40 },
  interest: { label: "Fit", max: 22 },
  issue: { label: "Issue", max: 45 },
  project: { label: "Repo", max: 40 },
  goal: { label: "Goal", max: 18 },
};

export function radarAxesFromBreakdown(
  breakdown: MatchScoreBreakdown[],
): RadarAxis[] {
  return AXIS_ORDER.map((cat) => {
    const meta = AXIS_LABELS[cat];
    const sum = breakdown
      .filter((b) => b.category === cat)
      .reduce((acc, b) => acc + Math.max(0, b.points), 0);
    const normalized = Math.max(
      0,
      Math.min(100, Math.round((sum / meta.max) * 100)),
    );
    return { label: meta.label, value: normalized };
  });
}

interface MatchRadarProps {
  breakdown: MatchScoreBreakdown[];
  className?: string;
  size?: number;
}

function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  count: number,
) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function polygonPoints(
  cx: number,
  cy: number,
  count: number,
  getRadius: (index: number) => number,
) {
  return Array.from({ length: count }, (_, i) => {
    const p = polarPoint(cx, cy, getRadius(i), i, count);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(" ");
}

export function MatchRadar({
  breakdown,
  className,
  size = 168,
}: MatchRadarProps) {
  const axes = radarAxesFromBreakdown(breakdown);
  const count = axes.length;
  const pad = 34;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - pad * 2) / 2;
  const gradId = useSafeId();

  const ringRadii = [0.25, 0.5, 0.75, 1];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Match radar: ${axes
          .map((a) => `${a.label} ${a.value}%`)
          .join(", ")}`}
        className="w-full"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--brand-end)" />
          </linearGradient>
        </defs>

        {/* Grid rings */}
        {ringRadii.map((r) => (
          <polygon
            key={r}
            points={polygonPoints(cx, cy, count, () => radius * r)}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}

        {/* Axis spokes */}
        {axes.map((_, i) => {
          const p = polarPoint(cx, cy, radius, i, count);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="var(--border)"
              strokeWidth={1}
            />
          );
        })}

        {/* Value polygon */}
        <polygon
          points={polygonPoints(
            cx,
            cy,
            count,
            (i) => radius * (axes[i].value / 100),
          )}
          fill={`url(#${gradId})`}
          fillOpacity={0.25}
          stroke={`url(#${gradId})`}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Value vertices */}
        {axes.map((axis, i) => {
          const p = polarPoint(cx, cy, radius * (axis.value / 100), i, count);
          return (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="var(--primary)" />
          );
        })}

        {/* Labels */}
        {axes.map((axis, i) => {
          const p = polarPoint(cx, cy, radius + 16, i, count);
          const isLeft = p.x < cx;
          const isRight = p.x > cx;
          const anchor =
            Math.abs(p.x - cx) < 2
              ? "middle"
              : isLeft
                ? "end"
                : isRight
                  ? "start"
                  : "middle";
          return (
            <g key={i}>
              <text
                x={p.x}
                y={p.y - 3}
                textAnchor={anchor}
                fontSize={9}
                fontWeight={700}
                fill="var(--secondary-foreground)"
              >
                {axis.label}
              </text>
              <text
                x={p.x}
                y={p.y + 8}
                textAnchor={anchor}
                fontSize={9}
                fontWeight={600}
                fill="var(--primary)"
                className="tabular-nums"
              >
                {axis.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
