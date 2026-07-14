"use client";

import { CSSProperties } from "react";
import { TYPE_COLORS } from "@/lib/game";

// 타입별(15종) 기술 이펙트. 이모지 파티클 + 모션으로 타입마다 다른 연출.
type Motion = "burst" | "rise" | "fall" | "ring" | "flash" | "float" | "spin";
const FX: Record<string, { emoji: string; motion: Motion }> = {
  normal: { emoji: "💫", motion: "burst" },
  fire: { emoji: "🔥", motion: "rise" },
  water: { emoji: "💧", motion: "burst" },
  electric: { emoji: "⚡", motion: "flash" },
  grass: { emoji: "🍃", motion: "fall" },
  ice: { emoji: "❄️", motion: "fall" },
  fighting: { emoji: "👊", motion: "burst" },
  poison: { emoji: "🫧", motion: "rise" },
  ground: { emoji: "💨", motion: "burst" },
  psychic: { emoji: "🌀", motion: "ring" },
  bug: { emoji: "🕸️", motion: "burst" },
  rock: { emoji: "🪨", motion: "fall" },
  ghost: { emoji: "👻", motion: "float" },
  dragon: { emoji: "🐉", motion: "ring" },
  fairy: { emoji: "✨", motion: "spin" },
};

export function isTypeFx(kind: string) { return kind in FX; }

// 공격 대상 위치: fwd = 내 공격이 상대(우상단) / back = 상대 공격이 나(좌하단)
const POS = { fwd: { left: "60%", top: "14%" }, back: { left: "14%", top: "46%" } };

export default function BattleFx({ type, dir = "fwd" }: { type: string; dir?: "fwd" | "back" }) {
  const spec = FX[type] ?? FX.normal;
  const color = TYPE_COLORS[type] ?? "#ffffff";
  const at = POS[dir];
  const base: CSSProperties = { position: "absolute", left: at.left, top: at.top, pointerEvents: "none", zIndex: 6 };
  const glow = `drop-shadow(0 0 4px ${color})`;

  if (spec.motion === "flash") {
    return (
      <>
        <div style={{ position: "absolute", inset: 0, background: color, animation: "fxFlash 0.7s ease forwards", pointerEvents: "none", zIndex: 5 }} />
        <div style={{ ...base, fontSize: 42, transform: "translate(-50%,-50%)", animation: "fxSpin 0.6s ease-out forwards", filter: glow }}>{spec.emoji}</div>
      </>
    );
  }

  if (spec.motion === "ring") {
    return (
      <>
        <div style={{ ...base, width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: "50%", border: `5px solid ${color}`, animation: "fxRing 0.85s ease-out forwards" }} />
        <div style={{ ...base, fontSize: 36, transform: "translate(-50%,-50%)", animation: "fxSpin 0.85s ease-out forwards", filter: glow }}>{spec.emoji}</div>
      </>
    );
  }

  if (spec.motion === "rise" || spec.motion === "float") {
    const dur = spec.motion === "float" ? "1.2s" : "0.9s";
    return (
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} style={{ ...base, fontSize: 20 + (i % 3) * 4, marginLeft: (i - 2) * 15, animation: `fxRise ${dur} ease-out ${i * 0.08}s forwards`, filter: glow }}>{spec.emoji}</div>
        ))}
      </>
    );
  }

  if (spec.motion === "fall") {
    return (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ ...base, fontSize: 18 + (i % 3) * 4, marginLeft: (i - 3) * 14, animation: `fxFall 0.95s ease-in ${i * 0.07}s forwards`, filter: glow }}>{spec.emoji}</div>
        ))}
      </>
    );
  }

  // burst — 중심에서 사방으로 튀는 파티클
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => {
        const ang = (i / 7) * Math.PI * 2;
        const d = 34 + (i % 2) * 14;
        const st = {
          ...base, fontSize: 18 + (i % 3) * 5, transform: "translate(-50%,-50%)",
          animation: `fxBurst 0.7s ease-out ${i * 0.02}s forwards`, filter: glow,
          ["--dx"]: `${Math.cos(ang) * d}px`, ["--dy"]: `${Math.sin(ang) * d}px`,
        } as CSSProperties;
        return <div key={i} style={st}>{spec.emoji}</div>;
      })}
    </>
  );
}
