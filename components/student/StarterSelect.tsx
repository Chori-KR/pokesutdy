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
          <ProfessorOak size={78} />
        </div>
        <div
          style={{
            position: "relative", flex: 1, background: "#f8f0dc", color: "#2c2c34",
            border: "3px solid #2c2c34", borderRadius: 14, padding: "10px 12px",
            fontSize: 13, lineHeight: 1.6,
          }}
        >
          <b style={{ color: "#c0392b" }}>오박사</b>: 오, {nickname} 트레이너!<br />
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
                color: "#f8f0dc",
                border: on ? `3px solid ${TYPE_COLORS[p.type]}` : "3px solid #2c2c34",
                background: on ? "#2c2f44" : "#252840",
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

// 오박사 캐릭터(저작권 무관 오리지널 SVG): 흰 가운·회색 머리·따뜻한 표정
function ProfessorOak({ size = 78 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }}>
      {/* 흰 가운 어깨 */}
      <path d="M20 100 C20 78 34 70 50 70 C66 70 80 78 80 100 Z" fill="#f4f6fb" stroke="#c3c9d6" strokeWidth="1.5" />
      <path d="M50 70 L44 100 M50 70 L56 100" stroke="#d5dae6" strokeWidth="1.5" fill="none" />
      {/* 넥타이 */}
      <path d="M50 70 L46 76 L50 92 L54 76 Z" fill="#c0392b" />
      {/* 목 */}
      <rect x="44" y="60" width="12" height="12" rx="4" fill="#e8b48c" />
      {/* 얼굴 */}
      <circle cx="50" cy="44" r="22" fill="#f2c39c" />
      {/* 귀 */}
      <circle cx="28" cy="46" r="4.5" fill="#e8b48c" /><circle cx="72" cy="46" r="4.5" fill="#e8b48c" />
      {/* 회색 머리(뒤로 넘김) */}
      <path d="M28 40 C26 22 40 14 50 14 C60 14 74 22 72 40 C68 30 60 26 50 26 C40 26 32 30 28 40 Z" fill="#d7d7db" stroke="#b9b9bf" strokeWidth="1" />
      <path d="M27 42 C24 34 27 28 31 26 C29 33 30 39 33 44 Z" fill="#d7d7db" />
      {/* 눈썹 */}
      <path d="M38 38 C41 36 45 36 47 38" stroke="#8a8a90" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M53 38 C55 36 59 36 62 38" stroke="#8a8a90" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 눈 */}
      <circle cx="42" cy="44" r="2.6" fill="#3a2a1c" /><circle cx="58" cy="44" r="2.6" fill="#3a2a1c" />
      {/* 미소 */}
      <path d="M42 53 C46 58 54 58 58 53" stroke="#a05a34" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
