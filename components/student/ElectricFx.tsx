"use client";

import { CSSProperties } from "react";

// 전기 타입 전용 이펙트 — 노란 화면 번쩍임 + 스파크(이전 스타일 복원).
const POS = { fwd: { left: "62%", top: "22%" }, back: { left: "18%", top: "48%" } };

export default function ElectricFx({ dir = "fwd", diff = "medium" }: { dir?: "fwd" | "back"; diff?: string }) {
  const at = POS[dir];
  const base: CSSProperties = { position: "absolute", left: at.left, top: at.top, pointerEvents: "none", zIndex: 6 };
  const big = diff === "hard", small = diff === "easy";
  const boltSize = big ? 62 : small ? 34 : 46;
  const sparks = big ? 9 : small ? 4 : 6;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#ffe94a", animation: `fxFlash ${big ? 0.7 : 0.55}s ease forwards`, opacity: small ? 0.6 : 1, pointerEvents: "none", zIndex: 5 }} />
      <div style={{ ...base, fontSize: boltSize, transform: "translate(-50%,-50%)", animation: "fxSpin 0.5s ease-out forwards", filter: "drop-shadow(0 0 7px #ffe94a)" }}>⚡</div>
      {Array.from({ length: sparks }, (_, i) => {
        const a = (i / sparks) * Math.PI * 2;
        const d = big ? 54 : 40;
        const st = {
          ...base, fontSize: 22, transform: "translate(-50%,-50%)",
          animation: `fxBurst 0.55s ease-out ${i * 0.02}s forwards`,
          filter: "drop-shadow(0 0 4px #fff59d)",
          ["--dx"]: `${Math.cos(a) * d}px`, ["--dy"]: `${Math.sin(a) * d}px`,
        } as CSSProperties;
        return <div key={i} style={st}>⚡</div>;
      })}
    </>
  );
}
