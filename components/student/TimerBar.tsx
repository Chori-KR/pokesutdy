"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

// 배틀 타이머 — 자체 setInterval을 가진 독립 컴포넌트.
// 부모(BattleTab)를 0.1초마다 리렌더시키지 않도록 시간 상태를 여기서만 관리한다.
// 남은 시간은 timeRef로 공유해 제출 시 급소 판정에 사용하고, 만료 시 onExpire 호출.
export default function TimerBar({
  total,
  label,
  timeRef,
  onExpire,
}: {
  total: number;
  label: ReactNode;
  timeRef: { current: number };
  onExpire: () => void;
}) {
  const [t, setT] = useState(total);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    setT(total);
    timeRef.current = total;
    tick.current = setInterval(() => {
      setT((x) => {
        const nx = Math.max(0, x - 0.1);
        timeRef.current = nx;
        if (nx <= 0.05) {
          if (tick.current) clearInterval(tick.current);
          expireRef.current();
          return 0;
        }
        return nx;
      });
    }, 100);
    return () => { if (tick.current) clearInterval(tick.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = (t / total) * 100;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
        {label}
        <span style={{ color: t < total / 3 ? "#ff8a8a" : "#f8f0dc" }}>⏱ {Math.ceil(t)}초</span>
      </div>
      <div style={{ height: 7, background: "#1a1c2c", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: t > (total * 2) / 3 ? "#ffd23f" : "#4a90d9", transition: "width 0.1s linear" }} />
      </div>
    </>
  );
}
