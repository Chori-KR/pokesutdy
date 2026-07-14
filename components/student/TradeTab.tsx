"use client";

import { useEffect, useMemo, useState } from "react";
import { S } from "@/lib/styles";
import { POOL, RARITY } from "@/lib/game";
import Sprite from "@/components/Sprite";

interface Props {
  caught: number[];
  setCaught: (ids: number[]) => void;
  counts: Record<number, number>;
  setCounts: (c: Record<number, number>) => void;
  showToast: (t: string) => void;
}

interface OpenTrade { id: string; code: string; offer: { id: number; name: string; color: string } }
interface HistItem {
  received: { id: number; name: string; color: string };
  gave: { id: number; name: string; color: string };
}
interface Offer { id: number; name: string; color: string; rarity: keyof typeof RARITY }

// 학생 간 교환 (M9): 내 포켓몬을 걸고 코드 발급 → 친구가 코드로 자기 포켓몬과 맞바꿈.
export default function TradeTab({ caught, setCaught, counts, setCounts, showToast }: Props) {
  const [mode, setMode] = useState<"create" | "receive">("create");
  const [open, setOpen] = useState<OpenTrade[]>([]);
  const [history, setHistory] = useState<HistItem[]>([]);
  const [pickOffer, setPickOffer] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // 받기 화면
  const [code, setCode] = useState("");
  const [found, setFound] = useState<{ code: string; from_nickname: string; offer: Offer } | null>(null);
  const [pickGive, setPickGive] = useState<number | null>(null);

  // 지금 보유(1마리 이상)한 포켓몬 = 교환에 걸 수 있는 종
  const ownedIds = useMemo(
    () => caught.filter((id) => (counts[id] ?? 0) >= 1).sort((a, b) => a - b),
    [caught, counts]
  );

  const loadMine = () => {
    fetch("/api/trade/mine")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setErr(d.error); return; }
        setOpen(d.open ?? []);
        setHistory(d.history ?? []);
      })
      .catch(() => setErr("교환 현황을 불러오지 못했어요."));
  };
  useEffect(loadMine, []);

  // 교환 후 도감 마리 수 로컬 반영
  const applySwap = (recv: number, gave: number) => {
    const next = { ...counts };
    next[recv] = (next[recv] ?? 0) + 1;
    next[gave] = Math.max(0, (next[gave] ?? 1) - 1);
    setCounts(next);
    if (!caught.includes(recv)) setCaught([...caught, recv]);
  };

  async function createTrade() {
    if (pickOffer == null || busy) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/trade/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: pickOffer }),
      });
      const d = await res.json();
      if (!res.ok) { setErr(d.error ?? "교환 등록에 실패했어요."); return; }
      showToast(d.reused ? `이미 만든 코드예요: ${d.code}` : `교환 코드 ${d.code} 발급! 친구에게 알려주세요`);
      setPickOffer(null);
      loadMine();
    } finally { setBusy(false); }
  }

  async function cancelTrade(id: string) {
    setErr("");
    const res = await fetch("/api/trade/cancel", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trade_id: id }),
    });
    const d = await res.json();
    if (!res.ok) { setErr(d.error ?? "취소에 실패했어요."); return; }
    showToast("교환을 취소했어요.");
    loadMine();
  }

  async function lookup() {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) { setErr("6자리 코드를 입력해주세요."); return; }
    setErr(""); setFound(null); setPickGive(null);
    const res = await fetch(`/api/trade/lookup?code=${encodeURIComponent(c)}`);
    const d = await res.json();
    if (!res.ok) { setErr(d.error ?? "코드를 찾지 못했어요."); return; }
    setFound(d);
  }

  async function accept() {
    if (!found || pickGive == null || busy) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/trade/accept", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: found.code, pokemon_id: pickGive }),
      });
      const d = await res.json();
      if (!res.ok) { setErr(d.error ?? "교환에 실패했어요."); return; }
      applySwap(d.received.id, d.gave.id);
      showToast(`${d.gave.name} ↔ ${d.received.name} 교환 완료!`);
      setFound(null); setCode(""); setPickGive(null);
      loadMine();
    } finally { setBusy(false); }
  }

  const picker = (selected: number | null, onPick: (id: number) => void) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6, marginTop: 8 }}>
      {ownedIds.map((id) => {
        const p = POOL[id - 1];
        const on = selected === id;
        return (
          <button
            key={id}
            onClick={() => onPick(id)}
            style={{
              ...S.panel, padding: "6px 3px", textAlign: "center", cursor: "pointer",
              border: on ? "3px solid #e07b39" : "3px solid #2c2c34", fontFamily: "inherit", color: "#f8f0dc",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Sprite id={p.id} color={p.color} size={42} />
            </div>
            <div style={{ fontSize: 9, marginTop: 3 }}>{p.name}</div>
            {(counts[id] ?? 1) > 1 && (
              <div style={{ fontSize: 8, color: "#e07b39" }}>×{counts[id]}</div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        <button onClick={() => setMode("create")} style={{ ...S.tabBtn, ...(mode === "create" ? S.tabOn : {}) }}>
          내 포켓몬 걸기
        </button>
        <button onClick={() => setMode("receive")} style={{ ...S.tabBtn, ...(mode === "receive" ? S.tabOn : {}) }}>
          코드로 교환받기
        </button>
      </div>

      {err && <div style={S.warn}>{err}</div>}

      {mode === "create" && (
        <>
          <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 6, textAlign: "center" }}>
            교환할 포켓몬을 고르면 6자리 코드가 나와요. 친구에게 코드를 알려주세요!
          </div>
          {ownedIds.length === 0 ? (
            <div style={{ ...S.panel, textAlign: "center", fontSize: 12, color: "#9fd8ff" }}>
              아직 교환할 포켓몬이 없어요. 먼저 포켓몬을 잡아보자!
            </div>
          ) : (
            <>
              {picker(pickOffer, (id) => setPickOffer(id === pickOffer ? null : id))}
              <button
                onClick={createTrade}
                disabled={pickOffer == null || busy}
                style={{ ...S.primaryBtn, width: "100%", marginTop: 10, opacity: pickOffer == null || busy ? 0.5 : 1 }}
              >
                {pickOffer == null ? "포켓몬을 골라주세요" : `${POOL[pickOffer - 1].name} 교환 코드 만들기`}
              </button>
            </>
          )}

          {open.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: "#ffd54a", marginBottom: 6 }}>내가 연 교환</div>
              {open.map((t) => (
                <div key={t.id} style={{ ...S.panel, display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <Sprite id={t.offer.id} color={t.offer.color} size={36} />
                  <span style={{ flex: 1, fontSize: 12 }}>{t.offer.name}</span>
                  <span style={{ fontSize: 15, letterSpacing: 2, color: "#ffd54a" }}>{t.code}</span>
                  <button onClick={() => cancelTrade(t.id)} style={S.ghostBtn}>취소</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "receive" && (
        <>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="교환 코드 6자리"
              style={{ ...S.input, marginBottom: 0, letterSpacing: 3, textAlign: "center" }}
            />
            <button onClick={lookup} style={{ ...S.primaryBtn, flexShrink: 0 }}>찾기</button>
          </div>

          {found && (
            <div style={{ marginTop: 12 }}>
              <div style={{ ...S.panel, display: "flex", alignItems: "center", gap: 10 }}>
                <Sprite id={found.offer.id} color={found.offer.color} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{found.from_nickname} 님이 걸었어요</div>
                  <div style={{ fontSize: 14, color: RARITY[found.offer.rarity].color }}>{found.offer.name}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#9fd8ff", margin: "10px 0 2px", textAlign: "center" }}>
                내가 줄 포켓몬을 골라주세요 (돌려받을 수 없어요!)
              </div>
              {ownedIds.length === 0 ? (
                <div style={{ ...S.panel, textAlign: "center", fontSize: 12, color: "#9fd8ff" }}>
                  줄 수 있는 포켓몬이 없어요.
                </div>
              ) : (
                <>
                  {picker(pickGive, (id) => setPickGive(id === pickGive ? null : id))}
                  <button
                    onClick={accept}
                    disabled={pickGive == null || busy}
                    style={{ ...S.primaryBtn, width: "100%", marginTop: 10, opacity: pickGive == null || busy ? 0.5 : 1 }}
                  >
                    {pickGive == null
                      ? "줄 포켓몬을 골라주세요"
                      : `${POOL[pickGive - 1].name} 주고 ${found.offer.name} 받기`}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, color: "#9fb0d8", marginBottom: 6 }}>최근 교환 내역</div>
          {history.map((h, i) => (
            <div key={i} style={{ ...S.panel, display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11 }}>
              <Sprite id={h.gave.id} color={h.gave.color} size={30} />
              <span>{h.gave.name}</span>
              <span style={{ color: "#e07b39", fontSize: 14 }}>→</span>
              <Sprite id={h.received.id} color={h.received.color} size={30} />
              <span style={{ color: "#7ec8a8" }}>{h.received.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
