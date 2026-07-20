"use client";

import { useState } from "react";
import { S } from "@/lib/styles";
import { STARTER_IDS, POOL, TYPE_COLORS, TYPE_MOVES, josa } from "@/lib/game";
import Sprite from "@/components/Sprite";

interface Props {
  nickname: string;
  onDone: () => void; // 선택 완료 → me 재로드
}

// 스타팅 포켓몬 선택 (M4): 가입 직후(또는 기존 학생 첫 접속 시) 1회.
export default function StarterSelect({ nickname, onDone }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function confirm() {
    if (!picked || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/student/starter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: picked }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "선택에 실패했어요."); return; }
      onDone();
    } catch {
      setErr("연결에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      {/* 오박사 인트로: 몰입감 있는 스타팅 안내 */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 14 }}>
        <div style={{ flexShrink: 0, animation: "floaty 3s ease-in-out infinite" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/okid.png" alt="오박사" style={{ width: 96, height: "auto", display: "block", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.3))" }} />
        </div>
        <div
          style={{
            position: "relative", flex: 1, background: "#f8f0dc", color: "#2c2c34",
            border: "3px solid #2c2c34", borderRadius: 14, padding: "10px 12px",
            fontSize: 13, lineHeight: 1.6,
          }}
        >
          <b style={{ color: "#c0392b" }}>초리박사</b>: 오, {nickname} 트레이너!<br />
          함께 모험을 떠날 <b style={{ color: "#d9641e" }}>파트너 포켓몬</b>을 골라보거라.
          <span style={{ color: "#888" }}> 딱 한 번만 고를 수 있으니 신중하게!</span>
          {/* 말풍선 꼬리 */}
          <span style={{ position: "absolute", left: -10, bottom: 12, width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "11px solid #2c2c34" }} />
          <span style={{ position: "absolute", left: -6, bottom: 14, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "8px solid #f8f0dc" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {STARTER_IDS.map((id) => {
          const p = POOL[id - 1];
          const on = picked === id;
          return (
            <button
              key={id}
              onClick={() => setPicked(id)}
              style={{
                ...S.panel, cursor: "pointer", textAlign: "center", fontFamily: "inherit",
                color: "#1c1c1e",
                border: on ? `2.5px solid ${TYPE_COLORS[p.type]}` : "2.5px solid transparent",
                background: on ? "#eef3ff" : "#fff",
                transform: on ? "scale(1.03)" : "none", transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", animation: on ? "floaty 1.6s ease-in-out infinite" : "none" }}>
                <Sprite id={id} color={TYPE_COLORS[p.type]} size={84} />
              </div>
              <div style={{ fontSize: 14, marginTop: 6 }}>{p.name}</div>
              <div style={{ fontSize: 10, marginTop: 3, color: TYPE_COLORS[p.type] }}>
                {TYPE_MOVES[p.type][0]} · {TYPE_MOVES[p.type][1]} · {TYPE_MOVES[p.type][2]}
              </div>
            </button>
          );
        })}
      </div>

      {err && <div style={{ ...S.warn, marginTop: 10 }}>{err}</div>}

      <button
        onClick={confirm}
        disabled={!picked || busy}
        style={{ ...S.primaryBtn, width: "100%", marginTop: 14, opacity: !picked ? 0.4 : 1 }}
      >
        {busy
          ? "함께하는 중..."
          : picked
            ? `${josa(POOL[picked - 1].name, "과", "와")} 모험을 시작한다!`
            : "포켓몬을 골라주세요"}
      </button>
    </div>
  );
}
