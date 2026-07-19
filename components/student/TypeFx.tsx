"use client";

import { CSSProperties } from "react";
import { TYPE_COLORS } from "@/lib/game";
import TypeGlyph from "@/components/student/TypeGlyph";
import SkillSvg, { hasSkill } from "@/components/student/SkillSvg";

// 타입별 공격 이펙트 — 타입 고유 실루엣(글리프)이 공격자→피격자로 날아가 타격 지점에서 터진다.
// 색=타입색, 규모·파편·화면섬광=난이도(쉬움/보통/어려움).
const IMPACT = { fwd: { left: "66%", top: "22%" }, back: { left: "22%", top: "54%" } };
const HIT_DELAY = 0.34;

export default function TypeFx({ type, dir = "fwd", diff = "medium" }: { type: string; dir?: "fwd" | "back"; diff?: string }) {
  const color = TYPE_COLORS[type] ?? "#ffffff";
  const at = IMPACT[dir];
  const projAnim = dir === "fwd" ? "proj" : "projBack";
  const hard = diff === "hard", easy = diff === "easy";
  const n = hard ? 20 : easy ? 6 : 12;
  const projSize = hard ? 40 : easy ? 22 : 30;
  const hitSize = hard ? 78 : easy ? 42 : 58;
  const skill = hasSkill(type, diff);
  const skillSize = hard ? 150 : easy ? 96 : 122;

  return (
    <div style={{ color }}>
      {/* 발사체: 타입 글리프가 날아감 */}
      <div style={{ position: "absolute", animation: `${projAnim} 0.4s ease-in forwards`, zIndex: 6, pointerEvents: "none" }}>
        <div style={{ animation: easy ? undefined : "glyphSpin 0.4s linear" }}>
          <TypeGlyph type={type} size={projSize} />
        </div>
      </div>

      {/* 타격 지점: 정교한 스킬 SVG(있으면) 또는 타입 글리프가 크게 터짐 */}
      <div style={{ position: "absolute", left: at.left, top: at.top, transform: "translate(-50%,-50%)", opacity: 0, animation: `glyphHit 0.55s ease-out ${HIT_DELAY}s forwards`, zIndex: 7, pointerEvents: "none" }}>
        {skill ? <SkillSvg type={type} diff={diff} size={skillSize} /> : <TypeGlyph type={type} size={hitSize} />}
      </div>

      {/* 파편 (타입색) */}
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.3;
        const d = (hard ? 52 : easy ? 26 : 38) * (0.7 + Math.random() * 0.6);
        const sz = (hard ? 7 : 5) * (0.7 + Math.random() * 0.7);
        const st = {
          position: "absolute", left: at.left, top: at.top, width: sz, height: sz, borderRadius: "50%",
          background: color, boxShadow: `0 0 6px ${color}`, opacity: 0, transform: "translate(-50%,-50%)",
          animation: `fxBurst 0.5s ease-out ${HIT_DELAY + i * 0.005}s forwards`, pointerEvents: "none", zIndex: 6,
          ["--dx"]: `${Math.cos(a) * d}px`, ["--dy"]: `${Math.sin(a) * d}px`,
        } as CSSProperties;
        return <div key={i} style={st} />;
      })}

      {/* 어려움: 타입색 화면 섬광 */}
      {hard && (
        <div style={{ position: "absolute", inset: 0, background: color, opacity: 0, animation: `fxFlash 0.4s ease ${HIT_DELAY}s forwards`, pointerEvents: "none", zIndex: 4 }} />
      )}
    </div>
  );
}
