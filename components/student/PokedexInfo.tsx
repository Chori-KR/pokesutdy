"use client";

import { useEffect, useState } from "react";
import { S } from "@/lib/styles";
import { POOL } from "@/lib/game";
import Sprite from "@/components/Sprite";

// 도감 정보 카드 (M11): PokeAPI에서 한글 도감 설명만 가져와 보여준다(능력치 X).
export default function PokedexInfo({ id, shiny, onClose }: { id: number; shiny: boolean; onClose: () => void }) {
  const p = POOL[id - 1];
  const [genus, setGenus] = useState("");   // 분류 (예: 씨앗포켓몬)
  const [flavor, setFlavor] = useState(""); // 도감 설명
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const ko = (arr: { language: { name: string } }[]) => arr?.find((x) => x.language.name === "ko");
        const g = ko(d.genera) as { genus?: string } | undefined;
        const f = ko(d.flavor_text_entries) as { flavor_text?: string } | undefined;
        setGenus(g?.genus ?? "");
        setFlavor((f?.flavor_text ?? "").replace(/\s+/g, " ").trim());
        setLoading(false);
      })
      .catch(() => { if (alive) { setFlavor("도감 설명을 불러오지 못했어요."); setLoading(false); } });
    return () => { alive = false; };
  }, [id]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 95, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ ...S.panel, maxWidth: 340, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <Sprite id={id} color={p.color} shiny={shiny} size={120} />
        </div>
        <div style={{ fontSize: 12, color: "#8a8f9a" }}>No.{String(id).padStart(3, "0")}</div>
        <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>
          {p.name} {shiny && <span style={{ color: "#eaa300" }}>✨이로치</span>}
        </div>
        {genus && <div style={{ fontSize: 12, color: "#5b7a99", marginTop: 2 }}>{genus}</div>}
        <div style={{ fontSize: 13.5, lineHeight: 1.7, marginTop: 12, minHeight: 40, color: "var(--ink)" }}>
          {loading ? "불러오는 중..." : flavor || "도감 설명이 없어요."}
        </div>
        <button onClick={onClose} style={{ ...S.primaryBtn, width: "100%", marginTop: 14 }}>닫기</button>
      </div>
    </div>
  );
}
