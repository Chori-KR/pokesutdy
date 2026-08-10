"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { T } from "@/lib/styles";
import { BALLS, SNACKS, EVO_STONE } from "@/lib/game";
import { teacherFetch } from "@/lib/teacherClient";
import type { QuestionRow } from "@/components/teacher/QuestionBank";

interface StudentStat {
  id: string;
  nickname: string;
  points: number;
  level: number;
  total: number;
  correct: number;
  correctRate: number | null;
  todayCount: number;
  dexCount: number;
  lastActive: string | null;
  byTag?: { tag: string; total: number; correct: number; rate: number }[];
}

interface Summary { avgCorrectRate: number | null; totalSolved: number; activeToday: number }

interface Props {
  questions: QuestionRow[];
  showToast: (t: string) => void;
}

const GIFT_ITEMS: [string, string][] = [
  ["", "아이템 없음"],
  ...Object.entries(BALLS).map(([k, v]) => [k, v.name] as [string, string]),
  ["stone", EVO_STONE.name],
  ...Object.entries(SNACKS).map(([k, v]) => [k, v.name] as [string, string]),
];

// 통계 + 학생 관리 (명세 §5.4/5.5): 오답률 TOP10, 학생별 현황, 선물, 비밀번호 초기화.
export default function StatsTab({ questions, showToast }: Props) {
  const [students, setStudents] = useState<StudentStat[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [err, setErr] = useState("");
  const [giftFor, setGiftFor] = useState<string | null>(null);
  const [giftPoints, setGiftPoints] = useState(100);
  const [giftItem, setGiftItem] = useState("");
  const [giftCount, setGiftCount] = useState(1);
  const [pwFor, setPwFor] = useState<string | null>(null);
  const [tagsFor, setTagsFor] = useState<string | null>(null); // 단원별 정답률 펼친 학생
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // 다중 선물 선택
  const toggleSel = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const load = useCallback(async () => {
    setErr("");
    try {
      const res = await teacherFetch("/api/teacher/stats");
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "통계를 불러오지 못했어요."); return; }
      setStudents(data.students);
      setSummary(data.summary);
    } catch {
      setErr("연결에 실패했어요.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function sendGift(ids: string[]) {
    if (ids.length === 0) return;
    setBusy(true);
    try {
      const res = await teacherFetch("/api/teacher/gift", {
        method: "POST",
        body: JSON.stringify({ student_ids: ids, points: giftPoints, item: giftItem || null, count: giftCount }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "지급에 실패했어요."); return; }
      showToast(`${data.nickname}에게 선물을 보냈어요! 🎁`);
      setGiftFor(null); setSelected(new Set());
      load();
    } finally {
      setBusy(false);
    }
  }

  async function resetPw(studentId: string) {
    setBusy(true);
    try {
      const res = await teacherFetch("/api/teacher/reset-pw", {
        method: "POST",
        body: JSON.stringify({ student_id: studentId, new_pw: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "변경에 실패했어요."); return; }
      showToast(`${data.nickname}의 비밀번호를 바꿨어요. 학생에게 알려주세요!`);
      setPwFor(null);
      setNewPw("");
    } finally {
      setBusy(false);
    }
  }

  // 오답률 TOP 10 — "다음 수업에서 다시 다룰 것" 신호 (명세 §5.4)
  const top10 = questions
    .filter((q) => q.tries >= 3)
    .map((q) => ({ ...q, rate: Math.round((q.wrong / q.tries) * 100) }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10);

  const fmtDate = (iso: string | null) =>
    iso ? new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric", timeZone: "Asia/Seoul" }).format(new Date(iso)) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {err && <div style={{ ...T.card, color: "#a32d2d", fontSize: 13 }}>{err} <button onClick={load} style={T.smallBtn}>다시 시도</button></div>}

      {summary && students && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([
            ["학생 수", `${students.length}명`],
            ["오늘 참여", `${summary.activeToday}명`],
            ["학급 평균 정답률", summary.avgCorrectRate !== null ? `${summary.avgCorrectRate}%` : "—"],
            ["누적 풀이", `${summary.totalSolved}회`],
          ] as const).map(([label, value]) => (
            <div key={label} style={{ ...T.card, flex: 1, minWidth: 110, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={T.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>학생별 현황</div>
        {!students ? (
          <div style={{ fontSize: 13, color: "#888", padding: 10 }}>불러오는 중...</div>
        ) : students.length === 0 ? (
          <div style={{ fontSize: 13, color: "#888", padding: 10 }}>아직 가입한 학생이 없어요. 학급 코드를 알려주세요!</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: "#888", textAlign: "left" }}>
                  <th style={{ padding: "6px 8px", borderBottom: "1px solid #eee" }}>
                    <input type="checkbox"
                      checked={students.length > 0 && selected.size === students.length}
                      onChange={(e) => setSelected(e.target.checked ? new Set(students.map((s) => s.id)) : new Set())}
                      title="전체 선택" />
                  </th>
                  {["닉네임", "포인트", "Lv", "정답률", "오늘/누적", "도감", "최근", ""].map((h) => (
                    <th key={h} style={{ padding: "6px 8px", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <Fragment key={s.id}>
                  <tr style={{ borderBottom: "1px solid #f3f3f3", background: selected.has(s.id) ? "#eef5ff" : undefined }}>
                    <td style={{ padding: "7px 8px" }}>
                      <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSel(s.id)} />
                    </td>
                    <td style={{ padding: "7px 8px", fontWeight: 600 }}>
                      <button onClick={() => setTagsFor(tagsFor === s.id ? null : s.id)} title="단원별 정답률 보기" style={{ background: "none", border: "none", padding: 0, font: "inherit", fontWeight: 600, color: "#3d6fd9", cursor: "pointer" }}>
                        {tagsFor === s.id ? "▾ " : "▸ "}{s.nickname}
                      </button>
                    </td>
                    <td style={{ padding: "7px 8px" }}>{s.points.toLocaleString()}P</td>
                    <td style={{ padding: "7px 8px" }}>{s.level}</td>
                    <td style={{ padding: "7px 8px", color: s.correctRate !== null && s.correctRate < 50 ? "#a32d2d" : "#333" }}>
                      {s.correctRate !== null ? `${s.correctRate}%` : "—"}
                    </td>
                    <td style={{ padding: "7px 8px" }}>{s.todayCount}/{s.total}</td>
                    <td style={{ padding: "7px 8px" }}>{s.dexCount}/151</td>
                    <td style={{ padding: "7px 8px" }}>{fmtDate(s.lastActive)}</td>
                    <td style={{ padding: "7px 8px", whiteSpace: "nowrap" }}>
                      <button onClick={() => { const open = giftFor !== s.id; setGiftFor(open ? s.id : null); setPwFor(null); if (open) { setGiftPoints(100); setGiftItem(""); setGiftCount(1); } }} style={{ ...T.smallBtn, border: "1px solid #b4c4e0", color: "#3a5", marginRight: 4 }}>🎁 선물</button>
                      <button onClick={() => { setPwFor(pwFor === s.id ? null : s.id); setGiftFor(null); setNewPw(""); }} style={T.smallBtn}>🔑 비번</button>
                    </td>
                  </tr>
                  {tagsFor === s.id && (
                    <tr>
                      <td colSpan={9} style={{ padding: "4px 8px 12px 34px", background: "#fafbfe" }}>
                        <div style={{ fontSize: 11, color: "#888", margin: "4px 0 8px" }}>단원별 정답률 (낮은 순 — 취약 단원 먼저)</div>
                        {(!s.byTag || s.byTag.length === 0) ? (
                          <div style={{ fontSize: 12, color: "#aaa" }}>아직 푼 문제가 없어요.</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 460 }}>
                            {s.byTag.map((t) => {
                              const weak = t.rate < 60;
                              return (
                                <div key={t.tag} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                                  <span style={{ width: 150, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={t.tag}>{weak ? "🔴 " : ""}{t.tag}</span>
                                  <span style={{ flex: 1, height: 8, background: "#eceff5", borderRadius: 5, overflow: "hidden" }}>
                                    <span style={{ display: "block", width: `${t.rate}%`, height: "100%", background: weak ? "#e0563f" : "#3d9970" }} />
                                  </span>
                                  <b style={{ width: 38, textAlign: "right", color: weak ? "#a32d2d" : "#333", flexShrink: 0 }}>{t.rate}%</b>
                                  <span style={{ color: "#aaa", width: 58, flexShrink: 0 }}>({t.correct}/{t.total})</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {giftFor && (
          <div style={{ marginTop: 10, padding: 10, background: "#f4f8f4", borderRadius: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12 }}>
            <b>🎁 {students?.find((s) => s.id === giftFor)?.nickname}에게:</b>
            <label>포인트 <input type="number" min={0} max={100000} step={50} value={giftPoints} onChange={(e) => setGiftPoints(Math.max(0, Number(e.target.value) || 0))} style={{ ...T.input, width: 80 }} /></label>
            <select value={giftItem} onChange={(e) => setGiftItem(e.target.value)} style={T.input}>
              {GIFT_ITEMS.map(([k, name]) => <option key={k} value={k}>{name}</option>)}
            </select>
            {giftItem && <input type="number" min={1} max={99} value={giftCount} onChange={(e) => setGiftCount(Math.max(1, Number(e.target.value) || 1))} style={{ ...T.input, width: 56 }} />}
            <button onClick={() => sendGift([giftFor])} disabled={busy} style={{ ...T.primaryBtn, padding: "6px 12px", fontSize: 12 }}>보내기</button>
            <button onClick={() => setGiftFor(null)} style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12 }}>취소</button>
          </div>
        )}

        {selected.size > 0 && (
          <div style={{ marginTop: 10, padding: 10, background: "#eef5ff", borderRadius: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12, border: "1px solid #b4c4e0" }}>
            <b>🎁 선택한 {selected.size}명에게 한꺼번에:</b>
            <label>포인트 <input type="number" min={0} max={100000} step={50} value={giftPoints} onChange={(e) => setGiftPoints(Math.max(0, Number(e.target.value) || 0))} style={{ ...T.input, width: 80 }} /></label>
            <select value={giftItem} onChange={(e) => setGiftItem(e.target.value)} style={T.input}>
              {GIFT_ITEMS.map(([k, name]) => <option key={k} value={k}>{name}</option>)}
            </select>
            {giftItem && <input type="number" min={1} max={99} value={giftCount} onChange={(e) => setGiftCount(Math.max(1, Number(e.target.value) || 1))} style={{ ...T.input, width: 56 }} />}
            <button onClick={() => sendGift([...selected])} disabled={busy} style={{ ...T.primaryBtn, padding: "6px 12px", fontSize: 12 }}>{selected.size}명에게 보내기</button>
            <button onClick={() => setSelected(new Set())} style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12 }}>선택 해제</button>
          </div>
        )}

        {pwFor && (
          <div style={{ marginTop: 10, padding: 10, background: "#fdf6f0", borderRadius: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12 }}>
            <b>🔑 {students?.find((s) => s.id === pwFor)?.nickname}의 새 비밀번호:</b>
            <input value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="4자 이상" style={{ ...T.input, width: 140 }} />
            <button onClick={() => resetPw(pwFor)} disabled={busy || newPw.length < 4} style={{ ...T.primaryBtn, padding: "6px 12px", fontSize: 12 }}>변경</button>
            <button onClick={() => setPwFor(null)} style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12 }}>취소</button>
          </div>
        )}
      </div>

      <div style={T.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>오답률 TOP 10</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>3회 이상 풀린 문제 기준 — 다음 수업에서 다시 다뤄볼 만한 내용이에요.</div>
        {top10.length === 0 ? (
          <div style={{ fontSize: 13, color: "#888", padding: 6 }}>아직 데이터가 부족해요. 학생들이 문제를 풀면 채워집니다.</div>
        ) : (
          top10.map((q, i) => (
            <div key={q.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f3f3f3", fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: i < 3 ? "#a32d2d" : "#888", width: 22 }}>{i + 1}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.body}</span>
              <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 8, background: "#eef1f8", color: "#3a4a7a", flexShrink: 0 }}>{q.tag}</span>
              <b style={{ color: q.rate >= 50 ? "#a32d2d" : "#666", flexShrink: 0 }}>{q.rate}%</b>
              <span style={{ color: "#aaa", flexShrink: 0 }}>({q.tries}회)</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
