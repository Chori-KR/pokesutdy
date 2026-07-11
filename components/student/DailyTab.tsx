"use client";

import { useState } from "react";
import { S } from "@/lib/styles";
import { BALLS, BallKind } from "@/lib/game";
import { StudentData, DayInfo } from "@/lib/types";
import BallIcon from "@/components/BallIcon";
import Sprite from "@/components/Sprite";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  day: DayInfo;
  setDay: (d: DayInfo) => void;
}

interface Option { id: number; name: string }
interface Result { correct: boolean; target: { id: number; name: string }; ball: BallKind }

// 오늘의 실루엣 퀴즈 (명세 §4.4). 문제 선정·채점·보상은 전부 서버.
// 실루엣은 /api/daily/sprite 프록시 — 주소로 정답을 알 수 없다.
export default function DailyTab({ student, setStudent, day, setDay }: Props) {
  const [options, setOptions] = useState<Option[] | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function start() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/daily/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "퀴즈를 시작하지 못했어요."); return; }
      setOptions(data.options);
    } catch {
      setErr("연결에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function answer(id: number) {
    if (picked !== null || busy) return;
    setBusy(true);
    setPicked(id);
    try {
      const res = await fetch("/api/daily/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: id }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "채점에 실패했어요."); setPicked(null); return; }
      setResult(data);
      setStudent({ ...student, points: data.points, inventory: data.inventory });
      setDay({ ...day, quizDone: true });
    } catch {
      setErr("연결에 실패했어요. 다시 시도해주세요.");
      setPicked(null);
    } finally {
      setBusy(false);
    }
  }

  // 이미 다 푼 날 (지금 막 푼 경우는 result 화면 유지)
  if (day.quizDone && !result)
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 36 }}>
        <div style={{ fontSize: 14, marginBottom: 6 }}>오늘의 퀴즈를 이미 풀었어요!</div>
        <div style={{ fontSize: 11, color: "#9fd8ff" }}>내일 새로운 포켓몬이 기다리고 있어요.</div>
      </div>
    );

  if (!options)
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 15, marginBottom: 4 }}>이 포켓몬은 누구일까?</div>
        <div style={{ fontSize: 11, color: "#9fd8ff", marginBottom: 14 }}>
          맞히면 +100P + 랜덤 볼! 틀려도 몬스터볼 1개!
        </div>
        {err && <div style={{ ...S.warn, textAlign: "left" }}>{err}</div>}
        <button onClick={start} disabled={busy} style={S.primaryBtn}>
          {busy ? "준비 중..." : "오늘의 퀴즈 시작"}
        </button>
      </div>
    );

  return (
    <div style={{ ...S.panel, textAlign: "center" }}>
      <div style={{ fontSize: 14, margin: "6px 0 12px" }}>이 포켓몬은 누구일까?</div>
      <div style={{ display: "flex", justifyContent: "center", animation: "floaty 2.4s ease-in-out infinite" }}>
        {result ? (
          <Sprite id={result.target.id} size={140} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/api/daily/sprite"
            alt=""
            draggable={false}
            style={{ width: 140, height: 140, objectFit: "contain", filter: "brightness(0) opacity(0.85)" }}
          />
        )}
      </div>

      {result && (
        <div style={{ margin: "10px 0", animation: "pop 0.3s ease-out" }}>
          <div style={{ fontSize: 14, color: result.correct ? "#7ef29a" : "#ff9d9d" }}>
            {result.correct ? `정답! ${result.target.name}!` : `아쉬워요, 정답은 ${result.target.name}!`}
          </div>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            {result.correct ? (
              <>+100P, <BallIcon kind={result.ball} size={15} /> {BALLS[result.ball].name} 획득!</>
            ) : (
              <>위로 선물: <BallIcon kind="poke" size={15} /> 몬스터볼 1개</>
            )}
          </div>
        </div>
      )}
      {err && <div style={S.warn}>{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        {options.map((o) => {
          const isAns = result && o.id === result.target.id;
          const isWrongPick = result && picked === o.id && !isAns;
          return (
            <button
              key={o.id}
              onClick={() => answer(o.id)}
              disabled={busy || picked !== null}
              style={{
                ...S.choiceBtn,
                background: isAns ? "#2e5d43" : isWrongPick ? "#6b3030" : (S.choiceBtn.background as string),
                borderColor: isAns ? "#7ef29a" : isWrongPick ? "#ff9d9d" : "#f8f0dc33",
              }}
            >
              {o.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
