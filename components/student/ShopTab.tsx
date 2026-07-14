"use client";

import { useState } from "react";
import { S } from "@/lib/styles";
import { BALLS, SNACKS, EVO_STONE, BallKind, SnackKind, ShopItem } from "@/lib/game";
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

// 상점 (M8): 볼 4종 / 진화의돌 / 간식 3종. 구매 시 게임풍 확인 모달.
export default function ShopTab({ student, setStudent, showToast }: Props) {
  const [busy, setBusy] = useState(false);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null); // M8: 구매 확인 모달

  function priceName(item: ShopItem): { name: string; price: number } | null {
    if (item in BALLS) return BALLS[item as BallKind];
    if (item in SNACKS) return SNACKS[item as SnackKind];
    if (item === "stone") return EVO_STONE;
    return null;
  }

  // 구매 버튼 → 확인 모달 열기
  function askBuy(item: ShopItem) {
    if (busy) return;
    setConfirmItem(item);
  }

  // 아이템 종류로 아이콘 렌더
  function iconOf(item: ShopItem, size = 30): React.ReactNode {
    if (item in BALLS) return <BallIcon kind={item as BallKind} size={size} />;
    if (item === "stone") return <span style={{ fontSize: size - 6 }}>{EVO_STONE.emoji}</span>;
    if (item in SNACKS) return <span style={{ fontSize: size - 6 }}>{SNACKS[item as SnackKind].emoji}</span>;
    return null;
  }

  // 모달에서 확정 → 실제 구매
  async function doBuy() {
    if (!confirmItem || busy) return;
    const item = confirmItem;
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
      setConfirmItem(null);
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
          onBuy: () => askBuy(k),
        })
      )}

      <div style={{ fontSize: 11, color: "#9fd8ff", textAlign: "center", marginTop: 4 }}>— 도구 —</div>
      {row({
        key: "stone",
        icon: <span style={{ fontSize: 22 }}>{EVO_STONE.emoji}</span>,
        name: EVO_STONE.name,
        owned: student.inventory.stone,
        desc: `${EVO_STONE.desc} — 배틀 탭의 진화 메뉴에서 사용`,
        price: EVO_STONE.price,
        onBuy: () => askBuy("stone"),
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
          onBuy: () => askBuy(k),
        })
      )}

      <div style={{ fontSize: 10, color: "#9fd8ff", textAlign: "center", marginTop: 4, lineHeight: 1.7 }}>
        포인트는 오늘의 퀴즈(+150P + 랜덤 볼)·문제풀이(정답 +20P)·배틀 승리로 모아요.
      </div>

      {/* M8: 게임풍 구매 확인 모달 */}
      {confirmItem && (() => {
        const info = priceName(confirmItem)!;
        const after = student.points - info.price;
        const short = after < 0;
        return (
          <div
            onClick={() => !busy && setConfirmItem(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(8,10,22,0.82)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ ...S.panel, width: "100%", maxWidth: 300, textAlign: "center", padding: 20, animation: "pop 0.25s ease-out" }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{iconOf(confirmItem, 46)}</div>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{info.name}</div>
              <div style={{ fontSize: 13, color: "#ffd54a", marginBottom: 10 }}>{info.price.toLocaleString()} P</div>
              <div style={{ fontSize: 12, color: short ? "#ff9d9d" : "#9fd8ff", marginBottom: 16, lineHeight: 1.6 }}>
                {short
                  ? "포인트가 부족해요!"
                  : <>구매 후 남는 포인트: <b style={{ color: "#f8f0dc" }}>{after.toLocaleString()} P</b></>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmItem(null)} disabled={busy} style={{ ...S.ghostBtn, flex: 1, padding: "10px 0", fontSize: 13 }}>취소</button>
                <button onClick={doBuy} disabled={busy || short} style={{ ...S.primaryBtn, flex: 1, padding: "10px 0", fontSize: 13, opacity: short ? 0.5 : 1 }}>
                  {busy ? "구매 중..." : "구매하기"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
