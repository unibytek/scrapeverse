"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

interface ConfettiBurstProps {
  burstKey: number | null;
}

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  width: number;
  height: number;
  drift: number;
  rotate: number;
}

const COLORS = [
  "#2fd4be",
  "#8b7cf0",
  "#41e6c7",
  "#ecc069",
  "#5eb5f5",
];

function generatePieces(burstKey: number): Piece[] {
  return Array.from({ length: 88 }, (_, i) => ({
    id: burstKey * 1000 + i,
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    duration: 1.9 + Math.random() * 1.2,
    color: COLORS[i % COLORS.length],
    width: 5 + Math.random() * 5,
    height: 8 + Math.random() * 8,
    drift: (Math.random() - 0.5) * 260,
    rotate: 360 + Math.random() * 560,
  }));
}

export function ConfettiBurst({ burstKey }: ConfettiBurstProps) {
  const [burst, setBurst] = useState<number | null>(burstKey);

  if (burstKey !== null && burstKey !== burst) {
    setBurst(burstKey);
  }

  useEffect(() => {
    if (burst === null) return;
    const t = setTimeout(() => setBurst(null), 4200);
    return () => clearTimeout(t);
  }, [burst]);

  const pieces = useMemo(
    () => (burst === null ? [] : generatePieces(burst)),
    [burst],
  );

  if (pieces.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {pieces.map((p) => {
        const style = {
          left: `${p.left}%`,
          width: p.width,
          height: p.height,
          backgroundColor: p.color,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          "--cf-drift": `${p.drift}px`,
          "--cf-rotate": `${p.rotate}deg`,
        } as CSSProperties;
        return (
          <span
            key={p.id}
            className="animate-confetti-fall absolute top-0 rounded-[2px]"
            style={style}
          />
        );
      })}
    </div>
  );
}