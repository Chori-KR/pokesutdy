"use client";

import { CSSProperties } from "react";
import { TYPE_COLORS } from "@/lib/game";

// 타입별 공격 이펙트(CSS) — 공격자에서 피격자로 발사체가 날아가 타격 지점에서 터진다.
// 색은 타입색, 규모·화면섬광은 난이도(쉬움/보통/어려움)로 차등.
const IMPACT = { fwd: { left: "66%", top: "22%" }, back: { left: "22%", top: "54%" } };
const HIT_DELAY = 0.34; // 발사체 도착 시각(초)

export default function TypeFx({ type, dir = "fwd", diff = "medium" }: { type: string; dir?: "fwd" | "back"; diff?: string }) {
  const color = TYPE_COLORS[type] ?? "#ffffff";
  const at = IMPACT[dir];
  const projAnim = dir === "fwd" ? "proj" : "projBack";
  const hard = diff === "hard", easy = diff === "easy";
  const n = hard ? 22 : easy ? 8 : 14;
  const impScale = hard ? 1.4 : easy ? 0.78 : 1;

  // 발사체(잔상 포함) — proj/projBack 키프레임이 위치를 옮김
  const orb = (delay: number, sz: number, op: number): CSSProperties => ({
    position: "absolute", width: sz, height: sz, borderRadius: "50%",
    background: `radial-gradient(circle, #fff, ${color} 60%, transparent 74%)`,
    boxShadow: `0 0 16px ${color}`, opacity: op,
    animation: `${projAnim} 0.4s ease-in ${delay}s forwards`, pointerEvents: "none", zIndex: 6,
  });

  return (
    <>
      {/* 발사체 + 잔상 (공격자 → 피격자) */}
      <div style={orb(0, hard ? 26 : 20, 1)} />
      <div style={orb(0.05, hard ? 18 : 14, 0.55)} />
      <div style={orb(0.1, hard ? 12 : 9, 0.3)} />

      {/* 타격 섬광 (도착 순간) */}
      <div style={{
        position: "absolute", left: at.left, top: at.top,
        width: 54 * impScale, height: 54 * impScale, marginLeft: -27 * impScale, marginTop: -27 * impScale,
        borderRadius: "50%", background: `radial-gradient(circle, #fff, ${color} 55%, transparent 70%)`,
        opacity: 0, animation: `fxFlash 0.4s ease ${HIT_DELAY}s forwards`, pointerEvents: "none", zIndex: 6,
      }} />

      {/* 충격파 링 */}
      <div style={{
        position: "absolute", left: at.left, top: at.top, width: hard ? 34 : 24, height: hard ? 34 : 24,
        borderRadius: "50%", border: `${hard ? 6 : 4}px solid ${color}`, opacity: 0,
        animation: `fxRing 0.6s ease-out ${HIT_DELAY + 0.02}s forwards`, pointerEvents: "none", zIndex: 5,
      }} />

      {/* 파편 파티클 사방으로 */}
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = (hard ? 50 : easy ? 26 : 36) * (0.7 + Math.random() * 0.6);
        const sz = (hard ? 7 : 5) * (0.7 + Math.random() * 0.7);
        const st = {
          position: "absolute", left: at.left, top: at.top, width: sz, height: sz, borderRadius: "50%",
          background: color, boxShadow: `0 0 6px ${color}`, opacity: 0, transform: "translate(-50%,-50%)",
          animation: `fxBurst 0.5s ease-out ${HIT_DELAY + i * 0.006}s forwards`, pointerEvents: "none", zIndex: 6,
          ["--dx"]: `${Math.cos(a) * d}px`, ["--dy"]: `${Math.sin(a) * d}px`,
        } as CSSProperties;
        return <div key={i} style={st} />;
      })}

      {/* 어려움: 타입색 화면 섬광 */}
      {hard && (
        <div style={{ position: "absolute", inset: 0, background: color, opacity: 0, animation: `fxFlash 0.4s ease ${HIT_DELAY}s forwards`, pointerEvents: "none", zIndex: 4 }} />
      )}
    </>
  );
}
