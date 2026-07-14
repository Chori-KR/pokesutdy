"use client";

import { useState } from "react";
import { S } from "@/lib/styles";
import { DIFF, SOLVE_REWARD } from "@/lib/game";
import { StudentData, DayInfo, SolveQuestion } from "@/lib/types";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  day: DayInfo;
  setDay: (d: DayInfo) => void;
}

interface Result { correct: boolean; answer_idx: number; answerText?: string; reward: number; level: number; levelBonus: number }

// 문제풀이 (명세 §4.5): 정답 +20P, 하루 한도까지. 출제·채점은 전부 서버. (단답형 지원)
export default function SolveTab({ student, setStudent, day, setDay }: Props) {
  const [q, setQ] = useState<SolveQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [input, setInput] = useState("");   // 단답형 입력
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const isShort = q?.type === "short";

  const left = Math.max(0, day.solveLimit - day.solveCount);

  async function next() {
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/solve/question", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "문제를 받지 못했어요."); return; }
      setQ(data.question);
      setPicked(null);
      setInput("");
      setResult(null);
    } catch {
      setErr("연결에 실패했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(payload: { chosen_idx?: number; text?: string }) {
    if (!q || result || busy) return;
    setBusy(true);
    if (payload.chosen_idx != null) setPicked(payload.chosen_idx);
    try {
      const res = await fetch("/api/solve/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "채점에 실패했어요."); setPicked(null); return; }
      setResult(data);
      setStudent({ ...student, points: data.points, xp: data.xp, level: data.level });
      setDay({ ...day, solveCount: data.solveCount });
    } catch {
      setErr("연결에 실패했어요. 다시 시도해주세요.");
      setPicked(null);
    } finally {
      setBusy(false);
    }
  }

  if (!q)
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 15, marginBottom: 4 }}>문제풀이</div>
        <div style={{ fontSize: 11, color: "#9fd8ff", marginBottom: 6 }}>
          정답 1개당 +{SOLVE_REWARD}P · 오늘 {day.solveCount}/{day.solveLimit} 문제
        </div>
        {err && <div style={{ ...S.warn, textAlign: "left" }}>{err}</div>}
        {left > 0 ? (
          <button onClick={next} disabled={busy} style={{ ...S.primaryBtn, marginTop: 8 }}>
            {busy ? "출제 중..." : "문제 받기"}
          </button>
        ) : (
          <div style={{ fontSize: 12, color: "#9fd8ff", padding: 8 }}>
            오늘의 문제풀이를 모두 마쳤어요! 내일 또 만나요.
          </div>
        )}
      </div>
    );

  return (
    <div style={S.panel}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 8, background: DIFF[q.difficulty].bg, color: DIFF[q.difficulty].fg }}>
          {DIFF[q.difficulty].label} · {q.tag}
        </span>
        <span style={{ fontSize: 11, color: "#9fd8ff" }}>{day.solveCount}/{day.solveLimit} 문제</span>
      </div>

      <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{q.body}</div>

      {isShort ? (
        <div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim() && !result) submit({ text: input }); }}
            disabled={!!result || busy}
            placeholder="정답을 입력하세요"
            style={{ ...S.input, marginBottom: 8, textAlign: "center" }}
          />
          {!result && (
            <button onClick={() => input.trim() && submit({ text: input })} disabled={busy || !input.trim()} style={{ ...S.primaryBtn, width: "100%", opacity: input.trim() ? 1 : 0.5 }}>
              정답 제출
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {q.options.map((opt, i) => {
            const isAns = result && i === result.answer_idx;
            const isWrongPick = result && picked === i && !isAns;
            return (
              <button
                key={i}
                onClick={() => submit({ chosen_idx: i })}
                disabled={busy || picked !== null}
                style={{
                  ...S.choiceBtn,
                  textAlign: "left",
                  background: isAns ? "#2e5d43" : isWrongPick ? "#6b3030" : (S.choiceBtn.background as string),
                  borderColor: isAns ? "#7ef29a" : isWrongPick ? "#ff9d9d" : "#f8f0dc33",
                }}
              >
                {i + 1}. {opt}
              </button>
            );
          })}
        </div>
      )}

      {result && (
        <div style={{ textAlign: "center", marginTop: 12, animation: "pop 0.3s ease-out" }}>
          <div style={{ fontSize: 14, color: result.correct ? "#7ef29a" : "#ff9d9d" }}>
            {result.correct ? `정답! +${result.reward}P +2XP` : isShort ? `아쉬워요! 정답: ${result.answerText}` : "아쉬워요! 정답을 확인하세요."}
          </div>
          {result.levelBonus > 0 && (
            <div style={{ fontSize: 13, color: "#ffd54a", marginTop: 4 }}>
              🎉 레벨 업! Lv.{result.level} — 보상 +{result.levelBonus}P
            </div>
          )}
          {left > 0 ? (
            <button onClick={next} disabled={busy} style={{ ...S.primaryBtn, marginTop: 10, padding: "9px 18px", fontSize: 13 }}>
              다음 문제 ({left}문제 남음)
            </button>
          ) : (
            <div style={{ fontSize: 11, color: "#9fd8ff", marginTop: 8 }}>
              오늘의 문제풀이 완료! 내일 또 만나요.
            </div>
          )}
        </div>
      )}
      {err && <div style={S.warn}>{err}</div>}
    </div>
  );
}
