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
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 18 }}>{nickname} 트레이너!</div>
        <div style={{ fontSize: 13, color: "#9fd8ff", marginTop: 6, lineHeight: 1.7 }}>
          함께 모험할 <b style={{ color: "#ffd54a" }}>스타팅 포켓몬</b>을 고르자.<br />
          단 한 번만 고를 수 있어요!
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
