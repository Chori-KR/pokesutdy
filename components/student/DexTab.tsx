"use client";

import { useEffect, useState } from "react";
import { S } from "@/lib/styles";
import { POOL, RARITY } from "@/lib/game";
import Sprite from "@/components/Sprite";

interface Member { id: string; nickname: string; dexCount: number; me: boolean }

// 도감 (M8 확장): 내 도감(마리 수 표시) + 친구들의 수집 현황·도감 구경 (건강한 경쟁!)
export default function DexTab({ caught, counts }: { caught: number[]; counts: Record<number, number> }) {
  const [view, setView] = useState<"mine" | "friends">("mine");
  const [members, setMembers] = useState<Member[] | null>(null);
  const [friend, setFriend] = useState<{ nickname: string; caught: number[]; counts?: Record<number, number> } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (view !== "friends" || members) return;
    fetch("/api/class/dex")
      .then((r) => r.json())
      .then((data) => setMembers(data.members ?? []))
      .catch(() => setErr("친구 목록을 불러오지 못했어요."));
  }, [view, members]);

  async function openFriend(m: Member) {
    setErr("");
    try {
      const res = await fetch(`/api/class/dex?student_id=${m.id}`);
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "도감을 열지 못했어요."); return; }
      setFriend(data);
    } catch {
      setErr("연결에 실패했어요.");
    }
  }

  const grid = (ids: number[], cnts?: Record<number, number>) => {
    const got = new Set(ids);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 6 }}>
        {POOL.map((p) => {
          const has = got.has(p.id);
          const n = cnts?.[p.id] ?? 0;
          return (
            <div key={p.id} style={{ position: "relative", ...S.panel, padding: "8px 4px", textAlign: "center", opacity: has ? 1 : 0.5 }}>
              {has && n > 1 && (
                <span style={{ position: "absolute", top: 4, right: 4, fontSize: 9, background: "#e07b39", color: "#fff", borderRadius: 8, padding: "0 5px" }}>×{n}</span>
              )}
              {has && n === 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, fontSize: 8, background: "#555", color: "#ddd", borderRadius: 8, padding: "0 4px" }}>보유0</span>
              )}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Sprite id={p.id} color={p.color} size={50} silhouette={!has} />
              </div>
              <div style={{ fontSize: 10, marginTop: 4, color: has ? "#f8f0dc" : "#777" }}>{has ? p.name : "???"}</div>
              <div style={{ fontSize: 8, marginTop: 1, color: RARITY[p.rarity].color }}>No.{String(p.id).padStart(3, "0")}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        <button onClick={() => { setView("mine"); setFriend(null); }} style={{ ...S.tabBtn, ...(view === "mine" ? S.tabOn : {}) }}>
          내 도감 {caught.length}/151
        </button>
        <button onClick={() => setView("friends")} style={{ ...S.tabBtn, ...(view === "friends" ? S.tabOn : {}) }}>
          친구들 도감 👀
        </button>
      </div>

      {err && <div style={S.warn}>{err}</div>}

      {view === "mine" && (
        <>
          <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 8, textAlign: "center" }}>
            1세대 도감 완성까지 {POOL.length - caught.length}종! (×숫자=마리 수, 보유0=진화로 떠나보냄·도감엔 영구 기록)
          </div>
          {grid(caught, counts)}
        </>
      )}

      {view === "friends" && !friend && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {!members && <div style={{ ...S.panel, textAlign: "center", fontSize: 12, color: "#9fd8ff" }}>불러오는 중...</div>}
          {members?.map((m, i) => (
            <button
              key={m.id}
              onClick={() => (m.me ? setView("mine") : openFriend(m))}
              style={{ ...S.panel, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "inherit", color: "#f8f0dc", border: m.me ? "3px solid #e07b39" : "3px solid #2c2c34", textAlign: "left" }}
            >
              <span style={{ fontSize: 15, width: 30, textAlign: "center", flexShrink: 0 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
              </span>
              <span style={{ flex: 1, fontSize: 13 }}>
                {m.nickname} {m.me && <span style={{ fontSize: 10, color: "#e07b39" }}>(나)</span>}
              </span>
              <span style={{ fontSize: 12, color: "#ffd54a", flexShrink: 0 }}>{m.dexCount}/151</span>
              <span style={{ display: "inline-block", width: 64, height: 6, background: "#1a1c2c", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                <span style={{ display: "block", width: `${Math.round((m.dexCount / 151) * 100)}%`, height: "100%", background: "#7ec8a8" }} />
              </span>
            </button>
          ))}
          {members && members.length <= 1 && (
            <div style={{ fontSize: 12, color: "#9fd8ff", textAlign: "center", padding: 10 }}>아직 친구들이 없어요. 학급 코드를 알려주자!</div>
          )}
        </div>
      )}

      {view === "friends" && friend && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <button onClick={() => setFriend(null)} style={S.ghostBtn}>← 목록</button>
            <span style={{ fontSize: 13 }}>
              {friend.nickname}의 도감 <span style={{ color: "#ffd54a" }}>{friend.caught.length}/151</span>
            </span>
          </div>
          {grid(friend.caught, friend.counts)}
        </>
      )}
    </div>
  );
}
