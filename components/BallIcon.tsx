"use client";

import { BALLS, BallKind } from "@/lib/game";

export default function BallIcon({ kind, size = 20 }: { kind: BallKind; size?: number }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", position: "relative", background: `linear-gradient(${BALLS[kind].top} 46%, #2c2c34 46%, #2c2c34 56%, #ffffff 56%)`, border: "2px solid #2c2c34", verticalAlign: "middle" }}>
      <span style={{ position: "absolute", left: "50%", top: "50%", width: size * 0.32, height: size * 0.32, borderRadius: "50%", background: "#fff", border: "2px solid #2c2c34", transform: "translate(-50%,-50%)" }} />
    </span>
  );
}
