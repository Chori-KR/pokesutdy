"use client";

import { useState } from "react";
import { T } from "@/lib/styles";
import { DIFF, Difficulty } from "@/lib/game";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { teacherFetch } from "@/lib/teacherClient";
import type { QuestionRow } from "@/components/teacher/QuestionBank";

interface Props {
  classId: string;
  hasAiKey: boolean;
  aiProvider?: string;
  onRegistered: (rows: QuestionRow[]) => void;
  onClose: () => void;
  showToast: (t: string) => void;
}

interface Draft {
  q: string;
  type: "multiple" | "short";
  opts: string[];
  answer: number;
  d: Difficulty;
  why: string;
  approved: boolean;
}

const SUBJECTS = ["국어", "수학", "사회", "과학", "영어", "도덕", "실과", "체육", "음악", "미술", "진로와직업", "기타"];
const GRADES = ["초등 3학년", "초등 4학년", "초등 5학년", "초등 6학년", "중학 1학년", "중학 2학년", "중학 3학년"];
// 특수교육 기본교육과정(data/curriculum.json)의 과목·학년군 (JSON은 서버에서만 사용)
const SP_SUBJECTS = ["바른 생활", "슬기로운 생활", "즐거운 생활", "국어", "사회", "수학", "과학", "실과", "진로와 직업", "체육", "음악", "미술", "정보통신활용", "생활영어", "보건"];
const SP_BANDS = ["초등 1~2학년", "초등 3~4학년", "초등 5~6학년", "중학교", "고등학교"];

// AI 문제 생성 (명세 §5.2): 생성 → 검토(수정·정답/난이도 변경·선택) → 승인분만 등록.
// 검토 단계는 절대 생략하지 않는다 — "AI 초안 + 교사 최종 결재".
export default function AiGenerate({ classId, hasAiKey, aiProvider, onRegistered, onClose, showToast }: Props) {
  const [mode, setMode] = useState<"general" | "special">("general");
  const [qtype, setQtype] = useState<"multiple" | "short">("multiple");
  const [subject, setSubject] = useState("수학");
  const [grade, setGrade] = useState("초등 5학년");
  const [spSubject, setSpSubject] = useState("국어");
  const [spBand, setSpBand] = useState("초등 1~2학년");
  const [topic, setTopic] = useState("");
  const [tag, setTag] = useState("");
  const [counts, setCounts] = useState({ easy: 2, medium: 2, hard: 1 });
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);

  const total = counts.easy + counts.medium + counts.hard;

  async function generate() {
    if (mode === "general" && !topic.trim()) { setErr("단원·주제를 입력해주세요 (예: 조선의 건국, 분수의 덧셈)"); return; }
    if (total < 1 || total > 10) { setErr("난이도별 개수 합계는 1~10개로 해주세요."); return; }
    setErr("");
    setLoading(true);
    setDrafts([]);
    try {
      const payload = mode === "special"
        ? { mode: "special", subject: spSubject, gradeBand: spBand, counts, extra, qtype }
        : { subject, topic, grade, counts, extra, qtype };
      const res = await teacherFetch("/api/teacher/ai-generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // 서버가 함수 타임아웃 등으로 죽으면 JSON이 아닌 응답(504 HTML)이 온다.
      // 그럴 때 res.json()이 던지지 않게 텍스트로 먼저 받아 파싱한다.
      const raw = await res.text();
      let data: { error?: string; questions?: unknown; used?: number; limit?: number } | null = null;
      try { data = JSON.parse(raw); } catch { /* JSON 아님 */ }
      if (!res.ok) {
        const timeout = res.status === 504 || res.status === 408 || res.status === 502;
        setErr(
          data?.error ??
          (timeout
            ? `시간이 초과됐어요 (HTTP ${res.status}). 문제 개수를 줄이거나 잠시 후 다시 시도해주세요.`
            : `생성에 실패했어요 (HTTP ${res.status}).`)
        );
        return;
      }
      if (!data?.questions) { setErr("서버 응답을 해석하지 못했어요. 잠시 후 다시 시도해주세요."); return; }
      setDrafts((data.questions as Omit<Draft, "approved">[]).map((q) => ({ ...q, approved: true })));
      setUsage({ used: data.used ?? 0, limit: data.limit ?? 0 });
    } catch (e) {
      setErr(`연결에 실패했어요 (${e instanceof Error ? e.message.slice(0, 100) : "네트워크 오류"}). 다시 시도해주세요.`);
    } finally {
      setLoading(false);
    }
  }

  function update(i: number, patch: Partial<Draft>) {
    setDrafts((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  async function register() {
    const approved = drafts.filter((d) => d.approved);
    if (approved.length === 0) { setErr("등록할 문제를 선택해주세요."); return; }
    const supa = supabaseBrowser();
    const payload = approved.map((d) => ({
      class_id: classId,
      body: d.q,
      options: d.type === "short" ? d.opts.map((o) => o.trim()).filter(Boolean) : d.opts,
      answer_idx: d.type === "short" ? 0 : d.answer,
      difficulty: d.d,
      type: d.type,
      tag: tag.trim() || (mode === "special" ? `특수·${spSubject}·${spBand}` : `${subject}·${topic.trim()}`),
      source: mode === "special" ? "AI(특수)" : "AI",
    }));
    const { data, error } = await supa.from("questions").insert(payload).select("*");
    if (error || !data) { setErr(`등록 실패: ${error?.message}`); return; }
    onRegistered(data as QuestionRow[]);
    showToast(`AI 문제 ${data.length}개를 문제 은행에 등록했어요!`);
    onClose();
  }

  if (!hasAiKey)
    return (
      <div style={{ ...T.card, marginBottom: 10, border: "2px solid #e0a63a" }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>🤖 AI 문제 생성</div>
        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>
          AI 생성을 쓰려면 <b>시스템 설정 탭</b>에서 AI 제공사와 API 키를 먼저 등록해주세요.
          Google Gemini는 무료로 키를 만들 수 있어요 —{" "}
          <a href="/guide/ai-key" target="_blank" style={{ color: "#3d6fd9" }}>5분 키 발급 가이드</a>
        </div>
        <button onClick={onClose} style={{ ...T.secondaryBtn, marginTop: 10 }}>닫기</button>
      </div>
    );

  return (
    <div style={{ ...T.card, marginBottom: 10, border: "2px solid #7c5cd9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>🤖 AI 문제 생성</div>
        {usage && <span style={{ fontSize: 11, color: "#888" }}>오늘 {usage.used}/{usage.limit}회</span>}
      </div>

      {drafts.length === 0 ? (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button onClick={() => setMode("general")} style={{ ...(mode === "general" ? T.primaryBtn : T.secondaryBtn), padding: "7px 14px", fontSize: 13 }}>일반</button>
            <button onClick={() => setMode("special")} style={{ ...(mode === "special" ? T.primaryBtn : T.secondaryBtn), padding: "7px 14px", fontSize: 13 }}>특수 (기본교육과정)</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#666" }}>유형</span>
            <button onClick={() => setQtype("multiple")} style={{ ...(qtype === "multiple" ? T.primaryBtn : T.secondaryBtn), padding: "6px 12px", fontSize: 12 }}>객관식</button>
            <button onClick={() => setQtype("short")} style={{ ...(qtype === "short" ? T.primaryBtn : T.secondaryBtn), padding: "6px 12px", fontSize: 12 }}>단답형</button>
          </div>
          {mode === "special" ? (
            <>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 6, lineHeight: 1.6 }}>
                2022 개정 특수교육 기본 교육과정 성취기준에 근거해 생성합니다. 과목·학년군을 고르세요.
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <select value={spSubject} onChange={(e) => setSpSubject(e.target.value)} style={{ ...T.input, flex: 1, minWidth: 140 }}>
                  {SP_SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={spBand} onChange={(e) => setSpBand(e.target.value)} style={{ ...T.input, flex: 1, minWidth: 120 }}>
                  {SP_BANDS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={T.input}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} style={T.input}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="단원·주제 (예: 분수의 덧셈)" style={{ ...T.input, flex: 1, minWidth: 160 }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, fontSize: 12, flexWrap: "wrap" }}>
            {(["easy", "medium", "hard"] as const).map((d) => (
              <label key={d} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ padding: "2px 8px", borderRadius: 9, background: DIFF[d].bg, color: DIFF[d].fg }}>{DIFF[d].label}</span>
                <input
                  type="number" min={0} max={10} value={counts[d]}
                  onChange={(e) => setCounts({ ...counts, [d]: Math.max(0, Math.min(10, Number(e.target.value) || 0)) })}
                  style={{ ...T.input, width: 52, textAlign: "center" }}
                />개
              </label>
            ))}
            <span style={{ color: "#888" }}>합계 {total}개 (최대 10)</span>
          </div>
          {aiProvider === "gemini" && (
            <div style={{ fontSize: 11, color: "#8a5a00", background: "#fdf3df", border: "1px solid #f0d9a8", borderRadius: 8, padding: "7px 10px", marginBottom: 8, lineHeight: 1.6 }}>
              💡 <b>무료 Gemini</b>는 한 번에 <b>3~5개</b>가 가장 안정적이에요. 개수가 많으면 응답이 느려 실패할 수 있어요 — 실패하면 개수를 줄여 다시 시도해주세요.
            </div>
          )}
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="단원 태그 (비우면 '과목·주제'로 자동)" style={{ ...T.input, width: "100%", marginBottom: 8 }} />
          <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="추가 지시 (선택 — 예: 계산 과정이 2단계인 문장제로)" style={{ ...T.input, width: "100%", minHeight: 44, resize: "vertical", marginBottom: 8, fontFamily: "inherit" }} />
          {err && <div style={{ fontSize: 12, color: "#a32d2d", marginBottom: 8 }}>{err}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={generate} disabled={loading} style={{ ...T.primaryBtn, background: "#7c5cd9" }}>
              {loading ? "생성 중... (10~30초)" : `문제 ${total}개 생성`}
            </button>
            <button onClick={onClose} style={T.secondaryBtn}>닫기</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
            생성된 초안 {drafts.length}개 — 내용을 확인·수정하고, 등록할 문제만 체크하세요. (정답은 동그라미 클릭으로 변경)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {drafts.map((d, i) => (
              <div key={i} style={{ border: d.approved ? "1px solid #7c5cd9" : "1px solid #ddd", borderRadius: 8, padding: 10, opacity: d.approved ? 1 : 0.55 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                  <input type="checkbox" checked={d.approved} onChange={(e) => update(i, { approved: e.target.checked })} style={{ marginTop: 4 }} />
                  <textarea value={d.q} onChange={(e) => update(i, { q: e.target.value })} style={{ ...T.input, flex: 1, minHeight: 36, resize: "vertical", fontFamily: "inherit" }} />
                  <select value={d.d} onChange={(e) => update(i, { d: e.target.value as Difficulty })} style={T.input}>
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </div>
                {d.type === "short" ? (
                  <div style={{ marginLeft: 24, marginBottom: 4 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>정답 (여러 개 허용 — 쉼표로 구분)</div>
                    <input
                      value={d.opts.join(", ")}
                      onChange={(e) => update(i, { opts: e.target.value.split(",").map((s) => s.trim()) })}
                      placeholder="예: 세종, 세종대왕"
                      style={{ ...T.input, width: "100%", borderColor: "#0f6e56" }}
                    />
                  </div>
                ) : (
                  d.opts.map((o, j) => (
                    <div key={j} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, marginLeft: 24 }}>
                      <input type="radio" checked={d.answer === j} onChange={() => update(i, { answer: j })} title="정답으로 지정" />
                      <input
                        value={o}
                        onChange={(e) => {
                          const opts = [...d.opts];
                          opts[j] = e.target.value;
                          update(i, { opts });
                        }}
                        style={{ ...T.input, flex: 1, borderColor: d.answer === j ? "#0f6e56" : "#ddd" }}
                      />
                    </div>
                  ))
                )}
                {d.why && <div style={{ fontSize: 11, color: "#888", marginLeft: 24, marginTop: 4 }}>💡 {d.why}</div>}
              </div>
            ))}
          </div>
          {err && <div style={{ fontSize: 12, color: "#a32d2d", marginBottom: 8 }}>{err}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={register} style={{ ...T.primaryBtn, background: "#7c5cd9" }}>
              선택한 {drafts.filter((d) => d.approved).length}개 등록
            </button>
            <button onClick={() => setDrafts([])} style={T.secondaryBtn}>다시 생성</button>
            <button onClick={onClose} style={T.secondaryBtn}>닫기</button>
          </div>
        </>
      )}
    </div>
  );
}
