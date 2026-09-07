"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let visible = false;
    let raf = 0;

    const paint = () => {
      raf = 0;
      el.style.opacity = visible ? "1" : "0";
    };

    const onMove = (e: PointerEvent) => {
      el.style.setProperty("--glow-x", `${e.clientX}px`);
      el.style.setProperty("--glow-y", `${e.clientY}px`);
      visible = true;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      visible = false;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(540px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgb(47 212 190 / 0.07), transparent 62%), radial-gradient(820px circle at calc(var(--glow-x, 50%) + 140px) calc(var(--glow-y, 50%) + 90px), rgb(139 124 240 / 0.05), transparent 60%)",
      }}
    />
  );
}