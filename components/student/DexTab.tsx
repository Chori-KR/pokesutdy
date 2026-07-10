"use client";

import { S } from "@/lib/styles";
import { POOL, RARITY } from "@/lib/game";
import Sprite from "@/components/Sprite";

export default function DexTab({ caught }: { caught: number[] }) {
  const got = new Set(caught);
  return (
    <div>
      <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 8, textAlign: "center" }}>
        1세대 도감 완성까지 {POOL.length - caught.length}마리!
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 6 }}>
        {POOL.map((p) => {
          const has = got.has(p.id);
          return (
            <div key={p.id} style={{ ...S.panel, padding: "8px 4px", textAlign: "center", opacity: has ? 1 : 0.5 }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Sprite id={p.id} color={p.color} size={50} silhouette={!has} />
              </div>
              <div style={{ fontSize: 10, marginTop: 4, color: has ? "#f8f0dc" : "#777" }}>{has ? p.name : "???"}</div>
              <div style={{ fontSize: 8, marginTop: 1, color: RARITY[p.rarity].color }}>No.{String(p.id).padStart(3, "0")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
