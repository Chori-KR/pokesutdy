"use client";

import { useState } from "react";
import { S } from "@/lib/styles";
import { BALLS, MEDS, MY, BallKind, MedKind } from "@/lib/game";
import { StudentData } from "@/lib/types";
import BallIcon from "@/components/BallIcon";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  showToast: (t: string) => void;
}

const BALL_DESC: Record<BallKind, string> = {
  poke: "기본 볼. 흔한 포켓몬은 이걸로 충분!",
  superb: "성공률 +15%p. 희귀 포켓몬 사냥용.",
  hyper: "성공률 +30%p. 전설을 노린다면.",
  master: "무조건 잡힌다. 1인 1개, 한 학기의 꿈.",
};

// 상점: 가격·판정은 전부 서버. 여기는 요청과 표시만.
export default function ShopTab({ student, setStudent, showToast }: Props) {
  const [busy, setBusy] = useState(false);

  async function buy(item: BallKind | MedKind) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "구매에 실패했어요."); return; }
      setStudent({ ...student, points: data.points, inventory: data.inventory });
      showToast(`${data.bought.name}을(를) 구매했어요!`);
    } catch {
      showToast("연결에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function useMed(item: MedKind) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/shop/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "사용에 실패했어요."); return; }
      setStudent({ ...student, hp: data.hp, inventory: data.inventory });
      showToast(`${data.used.name} 사용! ${MY.name} HP ${data.hp}/${MY.maxHp}`);
    } catch {
      showToast("연결에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(Object.keys(BALLS) as BallKind[]).map((k) => (
        <div key={k} style={{ ...S.panel, display: "flex", alignItems: "center", gap: 12, padding: "11px 14px" }}>
          <BallIcon kind={k} size={32} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>
              {BALLS[k].name}
              <span style={{ fontSize: 10, color: "#9fd8ff", marginLeft: 6 }}>보유 ×{student.inventory[k]}</span>
            </div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>{BALL_DESC[k]}</div>
          </div>
          <button
            onClick={() => buy(k)}
            disabled={busy}
            style={{ ...S.primaryBtn, padding: "8px 12px", fontSize: 12, opacity: student.points < BALLS[k].price ? 0.45 : 1 }}
          >
            {BALLS[k].price.toLocaleString()} P
          </button>
        </div>
      ))}

      {(Object.keys(MEDS) as MedKind[]).map((k) => (
        <div key={k} style={{ ...S.panel, display: "flex", alignItems: "center", gap: 12, padding: "11px 14px" }}>
          <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{k === "potion" ? "🧪" : "💊"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>
              {MEDS[k].name}
              <span style={{ fontSize: 10, color: "#9fd8ff", marginLeft: 6 }}>보유 ×{student.inventory[k]}</span>
            </div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>{MEDS[k].desc}</div>
          </div>
          {student.inventory[k] > 0 && (
            <button onClick={() => useMed(k)} disabled={busy} style={{ ...S.ghostBtn, padding: "8px 10px" }}>
              사용
            </button>
          )}
          <button
            onClick={() => buy(k)}
            disabled={busy}
            style={{ ...S.primaryBtn, padding: "8px 12px", fontSize: 12, opacity: student.points < MEDS[k].price ? 0.45 : 1 }}
          >
            {MEDS[k].price.toLocaleString()} P
          </button>
        </div>
      ))}

      <div style={{ fontSize: 10, color: "#9fd8ff", textAlign: "center", marginTop: 4, lineHeight: 1.7 }}>
        포인트는 오늘의 퀴즈(+100P)·문제풀이(정답 +20P)·배틀 승리로 모아요.
      </div>
    </div>
  );
}
