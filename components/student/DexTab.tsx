"use client";

import { useEffect, useMemo, useState } from "react";
import { S } from "@/lib/styles";
import { POOL, RARITY, DEX_MILESTONES, Rarity } from "@/lib/game";
import { StudentData, GameInfo } from "@/lib/types";
import Sprite from "@/components/Sprite";
import PokedexInfo from "@/components/student/PokedexInfo";

interface Member { id: string; nickname: string; dexCount: number; me: boolean }

interface Props {
  caught: number[];
  counts: Record<number, number>;
  setCounts: (c: Record<number, number>) => void;
  shinies?: number[];
  student: StudentData;
  setStudent: (s: StudentData) => void;
  game: GameInfo;
  setGame: (g: GameInfo) => void;
  showToast: (m: string) => void;
}

// 도감 (M8/M11): 내 도감(마리 수·이로치·정보카드) + 달성 보상 + 중복 환전 + 친구 도감
export default function DexTab({ caught, counts, setCounts, shinies = [], student, setStudent, game, setGame, showToast }: Props) {
  const [view, setView] = useState<"mine" | "friends">("mine");
  const [info, setInfo] = useState<number | null>(null); // 정보 카드 열린 포켓몬 id
  const shinySet = new Set(shinies);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [friend, setFriend] = useState<{ nickname: string; caught: number[]; counts?: Record<number, number> } | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const dexCount = caught.length;
  const claimed = new Set(game?.dexRewards ?? []);

  // 등급별 달성률
  const rarityStats = useMemo(() => {
    const total: Record<Rarity, number> = { common: 0, rare: 0, legendary: 0 };
    const got: Record<Rarity, number> = { common: 0, rare: 0, legendary: 0 };
    const gotSet = new Set(caught);
    POOL.forEach((p) => { total[p.rarity]++; if (gotSet.has(p.id)) got[p.rarity]++; });
    return { total, got };
  }, [caught]);

  // 중복(여분) 마리 수
  const dupeCount = useMemo(
    () => Object.values(counts).reduce((s, c) => s + Math.max(0, (c ?? 0) - 1), 0),
    [counts]
  );

  async function claimReward(n: number) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/student/dex-reward", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: n }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "수령에 실패했어요."); return; }
      setStudent({ ...student, inventory: data.inventory });
      setGame({ ...game, dexRewards: data.dexRewards });
      showToast(`🎁 ${data.reward} 획득!`);
    } catch { showToast("서버에 연결할 수 없어요."); }
    finally { setBusy(false); }
  }

  async function convertDupes() {
    if (busy || dupeCount === 0) return;
    if (!window.confirm(`중복 포켓몬 ${dupeCount}마리를 포인트로 환전할까요? (각 종 1마리는 도감에 남겨요)`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/student/convert-dupes", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "환전에 실패했어요."); return; }
      setStudent({ ...student, points: data.points });
      const nc = { ...counts };
      Object.keys(nc).forEach((k) => { if (nc[+k] > 1) nc[+k] = 1; });
      setCounts(nc);
      showToast(`💰 ${data.converted}마리 환전! +${data.gained.toLocaleString()}P`);
    } catch { showToast("서버에 연결할 수 없어요."); }
    finally { setBusy(false); }
  }

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

  const grid = (ids: number[], cnts?: Record<number, number>, shins?: Set<number>) => {
    const got = new Set(ids);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 6 }}>
        {POOL.map((p) => {
          const has = got.has(p.id);
          const n = cnts?.[p.id] ?? 0;
          const isShiny = !!shins?.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => has && setInfo(p.id)}
              disabled={!has}
              style={{ position: "relative", ...S.panel, padding: "8px 4px", textAlign: "center", opacity: has ? 1 : 0.5, cursor: has ? "pointer" : "default", fontFamily: "inherit", color: "inherit" }}
            >
              {has && n > 1 && (
                <span style={{ position: "absolute", top: 4, right: 4, fontSize: 9, background: "#e07b39", color: "#fff", borderRadius: 8, padding: "0 5px" }}>×{n}</span>
              )}
              {has && n === 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, fontSize: 8, background: "#555", color: "#ddd", borderRadius: 8, padding: "0 4px" }}>보유0</span>
              )}
              {isShiny && (
                <span style={{ position: "absolute", top: 4, left: 4, fontSize: 11 }}>✨</span>
              )}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Sprite id={p.id} color={p.color} size={50} silhouette={!has} shiny={isShiny} />
              </div>
              <div style={{ fontSize: 10, marginTop: 4, color: has ? "#1c1c1e" : "#8791b0" }}>{has ? p.name : "???"}</div>
              <div style={{ fontSize: 8, marginTop: 1, color: RARITY[p.rarity].color }}>No.{String(p.id).padStart(3, "0")}</div>
            </button>
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
          {/* 수집 요약: 전체 진행 바 + 등급별 달성률 */}
          <div style={{ ...S.panel, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>내 도감</span>
              <span style={{ fontSize: 13 }}><b style={{ color: "#4b7bec" }}>{dexCount}</b> / 151</span>
            </div>
            <div style={{ height: 8, background: "#e6e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${Math.round((dexCount / 151) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#7ec8a8,#4b7bec)", transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
              {(["common", "rare", "legendary"] as Rarity[]).map((r) => (
                <span key={r} style={{ flex: 1, textAlign: "center", padding: "4px 0", borderRadius: 8, background: "#f5f6fb" }}>
                  <span style={{ color: RARITY[r].color, fontWeight: 700 }}>{RARITY[r].label}</span><br />
                  {rarityStats.got[r]}/{rarityStats.total[r]}
                </span>
              ))}
            </div>
          </div>

          {/* 도감 달성 보상 — 15마리마다 아이템 */}
          <div style={{ ...S.panel, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🎁 도감 달성 보상</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {DEX_MILESTONES.map((m) => {
                const isClaimed = claimed.has(m.n);
                const reached = dexCount >= m.n;
                const claimable = reached && !isClaimed;
                return (
                  <button
                    key={m.n}
                    onClick={() => claimable && claimReward(m.n)}
                    disabled={!claimable}
                    title={m.label}
                    style={{
                      flexShrink: 0, width: 78, padding: "8px 4px", borderRadius: 12, textAlign: "center",
                      cursor: claimable ? "pointer" : "default", fontFamily: "inherit",
                      border: claimable ? "2px solid #eaa300" : isClaimed ? "1px solid #cfe6d8" : "1px solid #e4e6ee",
                      background: claimable ? "#fff8e8" : isClaimed ? "#eef8f1" : "#fafbfe",
                      opacity: reached ? 1 : 0.6,
                      animation: claimable ? "pop 0.3s ease-out" : "none",
                    }}
                  >
                    <div style={{
                      width: 30, height: 30, margin: "0 auto 4px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: "#fff",
                      background: isClaimed ? "#7ec8a8" : claimable ? "#eaa300" : "#c3c8d6",
                    }}>{isClaimed ? "✓" : m.n}</div>
                    <div style={{ fontSize: 9, color: "#5b6272", lineHeight: 1.3 }}>{m.label}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, marginTop: 2, color: isClaimed ? "#3aa06e" : claimable ? "#d98a00" : "#9aa0b2" }}>
                      {isClaimed ? "수령완료" : claimable ? "받기!" : `${m.n}마리`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 중복 환전 */}
          <div style={{ ...S.panel, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, fontSize: 12, color: "#5b6272" }}>
              중복 포켓몬 <b style={{ color: "#1c1c1e" }}>{dupeCount}</b>마리 있어요. 포인트로 바꿀 수 있어요!
            </div>
            <button onClick={convertDupes} disabled={busy || dupeCount === 0} style={{ ...S.primaryBtn, padding: "8px 14px", fontSize: 12, opacity: dupeCount === 0 ? 0.4 : 1 }}>💰 환전</button>
          </div>

          <div style={{ fontSize: 11, color: "#8a8f9a", marginBottom: 8, textAlign: "center" }}>
            (×숫자=마리 수, 보유0=진화로 떠나보냄·도감엔 영구 기록)
          </div>
          {grid(caught, counts, shinySet)}
        </>
      )}

      {view === "friends" && !friend && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {!members && <div style={{ ...S.panel, textAlign: "center", fontSize: 12, color: "#5b7a99" }}>불러오는 중...</div>}
          {members?.map((m, i) => (
            <button
              key={m.id}
              onClick={() => (m.me ? setView("mine") : openFriend(m))}
              style={{ ...S.panel, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "inherit", color: "#1c1c1e", border: m.me ? "2px solid #e07b39" : "1px solid #e4e6ee", textAlign: "left" }}
            >
              <span style={{ fontSize: 15, width: 30, textAlign: "center", flexShrink: 0 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
              </span>
              <span style={{ flex: 1, fontSize: 13 }}>
                {m.nickname} {m.me && <span style={{ fontSize: 10, color: "#e07b39" }}>(나)</span>}
              </span>
              <span style={{ fontSize: 12, color: "#eaa300", flexShrink: 0 }}>{m.dexCount}/151</span>
              <span style={{ display: "inline-block", width: 64, height: 6, background: "#e6e8f0", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                <span style={{ display: "block", width: `${Math.round((m.dexCount / 151) * 100)}%`, height: "100%", background: "#7ec8a8" }} />
              </span>
            </button>
          ))}
          {members && members.length <= 1 && (
            <div style={{ fontSize: 12, color: "#5b7a99", textAlign: "center", padding: 10 }}>아직 친구들이 없어요. 학급 코드를 알려주자!</div>
          )}
        </div>
      )}

      {view === "friends" && friend && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <button onClick={() => setFriend(null)} style={S.ghostBtn}>← 목록</button>
            <span style={{ fontSize: 13 }}>
              {friend.nickname}의 도감 <span style={{ color: "#eaa300" }}>{friend.caught.length}/151</span>
            </span>
          </div>
          {grid(friend.caught, friend.counts)}
        </>
      )}

      {info != null && (
        <PokedexInfo id={info} shiny={shinySet.has(info)} onClose={() => setInfo(null)} />
      )}
    </div>
  );
}
