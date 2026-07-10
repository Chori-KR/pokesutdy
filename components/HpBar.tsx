"use client";

export default function HpBar({ cur, max, width = 110 }: { cur: number; max: number; width?: number }) {
  const pct = Math.max(0, (cur / max) * 100);
  const color = pct > 50 ? "#4cd964" : pct > 20 ? "#f2c94c" : "#eb5757";
  return (
    <div style={{ width, height: 9, background: "#3a3a44", borderRadius: 5, overflow: "hidden", border: "2px solid #2c2c34" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.8s ease" }} />
    </div>
  );
}
