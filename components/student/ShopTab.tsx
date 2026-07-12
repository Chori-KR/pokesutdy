"use client";

import { useState } from "react";
import { S } from "@/lib/styles";
import { BALLS, MEDS, SNACKS, EVO_STONE, BallKind, MedKind, SnackKind, ShopItem, MAX_HP } from "@/lib/game";
import { StudentData } from "@/lib/types";
import BallIcon from "@/components/BallIcon";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  showToast: (t: string) => void;
}

const BALL_DESC: Record<BallKind, string> = {
  poke: "기본 볼. 흔한 포켓몬 사냥용 (성공률이 살짝 낮아요)",
  superb: "성공률 +15%p. 희귀 포켓몬 사냥용.",
  hyper: "성공률 +30%p. 전설을 노린다면.",
  master: "무조건 잡힌다. 1인 1개, 한 학기의 꿈.",
};

// 상점 (M5): 볼 4종 / 회복약 / 진화의돌 / 간식 3종. 가격·판정은 전부 서버.
export default function ShopTab({ student, setStudent, showToast }: Props) {
  const [busy, setBusy] = useState(false);

  async function buy(item: ShopItem) {
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
      showToast(`${data.used.name} 사용! HP ${data.hp}/${MAX_HP}`);
    } catch {
      showToast("연결에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  const row = (opts: {
    key: string; icon: React.ReactNode; name: string; owned: number;
    desc: string; price: number; onBuy: () => void; extra?: React.ReactNode;
  }) => (
    <div key={opts.key} style={{ ...S.panel, display: "flex", alignItems: "center", gap: 12, padding: "11px 14px" }}>
      <span style={{ width: 32, textAlign: "center", flexShrink: 0 }}>{opts.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13 }}>
          {opts.name}
          <span style={{ fontSize: 10, color: "#9fd8ff", marginLeft: 6 }}>보유 ×{opts.owned}</span>
        </div>
        <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>{opts.desc}</div>
      </div>
      {opts.extra}
      <button
        onClick={opts.onBuy}
        disabled={busy}
        style={{ ...S.primaryBtn, padding: "8px 12px", fontSize: 12, flexShrink: 0, opacity: student.points < opts.price ? 0.45 : 1 }}
      >
        {opts.price.toLocaleString()} P
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11, color: "#9fd8ff", textAlign: "center" }}>— 몬스터볼 —</div>
      {(Object.keys(BALLS) as BallKind[]).map((k) =>
        row({
          key: k,
          icon: <BallIcon kind={k} size={30} />,
          name: BALLS[k].name,
          owned: student.inventory[k],
          desc: BALL_DESC[k],
          price: BALLS[k].price,
          onBuy: () => buy(k),
        })
      )}

      <div style={{ fontSize: 11, color: "#9fd8ff", textAlign: "center", marginTop: 4 }}>— 도구 —</div>
      {row({
        key: "revive",
        icon: <span style={{ fontSize: 22 }}>💊</span>,
        name: MEDS.revive.name,
        owned: student.inventory.revive,
        desc: MEDS.revive.desc,
        price: MEDS.revive.price,
        onBuy: () => buy("revive"),
        extra:
          student.inventory.revive > 0 ? (
            <button onClick={() => useMed("revive")} disabled={busy} style={{ ...S.ghostBtn, padding: "8px 10px", flexShrink: 0 }}>
              사용
            </button>
          ) : undefined,
      })}
      {row({
        key: "stone",
        icon: <span style={{ fontSize: 22 }}>{EVO_STONE.emoji}</span>,
        name: EVO_STONE.name,
        owned: student.inventory.stone,
        desc: `${EVO_STONE.desc} — 배틀 탭의 진화 메뉴에서 사용`,
        price: EVO_STONE.price,
        onBuy: () => buy("stone"),
      })}

      <div style={{ fontSize: 11, color: "#9fd8ff", textAlign: "center", marginTop: 4 }}>— 간식 (추가 배틀!) —</div>
      {(Object.keys(SNACKS) as SnackKind[]).map((k) =>
        row({
          key: k,
          icon: <span style={{ fontSize: 22 }}>{SNACKS[k].emoji}</span>,
          name: SNACKS[k].name,
          owned: student.inventory[k],
          desc: `${SNACKS[k].desc} — 배틀 탭에서 사용`,
          price: SNACKS[k].price,
          onBuy: () => buy(k),
        })
      )}

      <div style={{ fontSize: 10, color: "#9fd8ff", textAlign: "center", marginTop: 4, lineHeight: 1.7 }}>
        포인트는 오늘의 퀴즈(+150P + 랜덤 볼)·문제풀이(정답 +20P)·배틀 승리로 모아요.
      </div>
    </div>
  );
}
