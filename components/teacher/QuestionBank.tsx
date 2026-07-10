"use client";

import { useMemo, useState } from "react";
import { T } from "@/lib/styles";
import { DIFF, Difficulty } from "@/lib/game";
import { supabaseBrowser } from "@/lib/supabase/browser";

export interface QuestionRow {
  id: string;
  class_id: string;
  body: string;
  options: string[];
  answer_idx: number;
  difficulty: Difficulty;
  tag: string;
  active: boolean;
  source: string;
  tries: number;
  wrong: number;
  created_at: string;
}

interface Props {
  classId: string;
  questions: QuestionRow[];
  setQuestions: (qs: QuestionRow[]) => void;
  showToast: (t: string) => void;
}

const CIRCLED = ["①", "②", "③", "④"];

interface FormState {
  id: string | null; // null = 새 문제
  body: string;
  options: [string, string, string, string];
  answer_idx: number;
  difficulty: Difficulty;
  tag: string;
}

const EMPTY_FORM: FormState = {
  id: null, body: "", options: ["", "", "", ""], answer_idx: 0, difficulty: "easy", tag: "",
};

export default function QuestionBank({ classId, questions, setQuestions, showToast }: Props) {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [formErr, setFormErr] = useState("");

  const tags = useMemo(() => [...new Set(questions.map((q) => q.tag))], [questions]);
  const visible = questions.filter(
    (q) => (!filterTag || q.tag === filterTag) && (!search || q.body.includes(search))
  );

  async function toggleActive(q: QuestionRow) {
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").update({ active: !q.active }).eq("id", q.id);
    if (!error) setQuestions(questions.map((x) => (x.id === q.id ? { ...x, active: !q.active } : x)));
  }

  // 태그 단위 일괄 출제 켜기/끄기 (명세 §5.1)
  async function toggleTagAll(tag: string, active: boolean) {
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").update({ active }).eq("class_id", classId).eq("tag", tag);
    if (!error) {
      setQuestions(questions.map((x) => (x.tag === tag ? { ...x, active } : x)));
      showToast(`'${tag}' 문제를 모두 ${active ? "출제" : "숨김"} 처리했어요.`);
    }
  }

  async function remove(q: QuestionRow) {
    if (!window.confirm("이 문제를 삭제할까요? 되돌릴 수 없어요.")) return;
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").delete().eq("id", q.id);
    if (!error) {
      setQuestions(questions.filter((x) => x.id !== q.id));
      showToast("문제를 삭제했어요.");
    }
  }

  function openEdit(q: QuestionRow) {
    setForm({
      id: q.id, body: q.body,
      options: [q.options[0] ?? "", q.options[1] ?? "", q.options[2] ?? "", q.options[3] ?? ""],
      answer_idx: q.answer_idx, difficulty: q.difficulty, tag: q.tag,
    });
    setFormErr("");
  }

  async function saveForm() {
    if (!form) return;
    setFormErr("");
    if (!form.body.trim()) { setFormErr("문제 내용을 입력해주세요."); return; }
    if (form.options.some((o) => !o.trim())) { setFormErr("보기 4개를 모두 입력해주세요."); return; }
    const payload = {
      body: form.body.trim(),
      options: form.options.map((o) => o.trim()),
      answer_idx: form.answer_idx,
      difficulty: form.difficulty,
      tag: form.tag.trim() || "미분류",
    };
    const supa = supabaseBrowser();
    if (form.id) {
      const { error } = await supa.from("questions").update(payload).eq("id", form.id);
      if (error) { setFormErr(`저장 실패: ${error.message}`); return; }
      setQuestions(questions.map((x) => (x.id === form.id ? { ...x, ...payload } : x)));
      showToast("문제를 수정했어요.");
    } else {
      const { data, error } = await supa
        .from("questions")
        .insert({ ...payload, class_id: classId, source: "수동" })
        .select("*")
        .single();
      if (error || !data) { setFormErr(`등록 실패: ${error?.message}`); return; }
      setQuestions([data as QuestionRow, ...questions]);
      showToast("문제를 등록했어요.");
    }
    setForm(null);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="문제 검색" style={{ ...T.input, flex: 1 }} />
        <button onClick={() => { setForm({ ...EMPTY_FORM }); setFormErr(""); }} style={T.primaryBtn}>+ 새 문제</button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
        <button onClick={() => setFilterTag(null)} style={{ ...T.chip, ...(filterTag ? {} : T.chipOn) }}>전체</button>
        {tags.map((t) => (
          <button key={t} onClick={() => setFilterTag(filterTag === t ? null : t)} style={{ ...T.chip, ...(filterTag === t ? T.chipOn : {}) }}>{t}</button>
        ))}
        {filterTag && (
          <span style={{ display: "flex", gap: 4, marginLeft: 4 }}>
            <button onClick={() => toggleTagAll(filterTag, true)} style={{ ...T.chip, color: "#0f6e56" }}>모두 출제</button>
            <button onClick={() => toggleTagAll(filterTag, false)} style={{ ...T.chip, color: "#a32d2d" }}>모두 숨김</button>
          </span>
        )}
      </div>

      {/* 추가/수정 폼 */}
      {form && (
        <div style={{ ...T.card, marginBottom: 10, border: "2px solid #3d6fd9" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{form.id ? "문제 수정" : "새 문제 등록"}</div>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="문제 내용"
            style={{ ...T.input, width: "100%", minHeight: 60, resize: "vertical", marginBottom: 8, fontFamily: "inherit" }}
          />
          {form.options.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <input
                type="radio"
                name="answer"
                checked={form.answer_idx === i}
                onChange={() => setForm({ ...form, answer_idx: i })}
                title="정답으로 지정"
              />
              <input
                value={o}
                onChange={(e) => {
                  const options = [...form.options] as FormState["options"];
                  options[i] = e.target.value;
                  setForm({ ...form, options });
                }}
                placeholder={`보기 ${i + 1}${form.answer_idx === i ? " (정답)" : ""}`}
                style={{ ...T.input, flex: 1, borderColor: form.answer_idx === i ? "#0f6e56" : "#ddd" }}
              />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })} style={T.input}>
              <option value="easy">쉬움</option>
              <option value="medium">보통</option>
              <option value="hard">어려움</option>
            </select>
            <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="단원 태그 (예: 수학·분수의 덧셈)" style={{ ...T.input, flex: 1 }} />
          </div>
          {formErr && <div style={{ fontSize: 12, color: "#a32d2d", marginBottom: 8 }}>{formErr}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveForm} style={T.primaryBtn}>{form.id ? "수정 저장" : "등록"}</button>
            <button onClick={() => setForm(null)} style={T.secondaryBtn}>취소</button>
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 8 }}>왼쪽 동그라미를 눌러 정답 보기를 지정하세요.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.length === 0 && (
          <div style={{ ...T.card, textAlign: "center", color: "#888", fontSize: 13, padding: 24 }}>
            {questions.length === 0 ? "아직 문제가 없어요. '+ 새 문제'로 첫 문제를 등록해보세요!" : "검색 결과가 없어요."}
          </div>
        )}
        {visible.map((q) => {
          const wrongRate = q.tries > 0 ? Math.round((q.wrong / q.tries) * 100) : null;
          return (
            <div key={q.id} style={{ ...T.card, opacity: q.active ? 1 : 0.55 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 5 }}>{q.body}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    {q.options.map((o, i) => (
                      <span key={i} style={{ marginRight: 8, color: i === q.answer_idx ? "#0f6e56" : "#999", fontWeight: i === q.answer_idx ? 600 : 400 }}>
                        {CIRCLED[i]} {o}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", fontSize: 10 }}>
                    <span style={{ padding: "2px 7px", borderRadius: 9, background: DIFF[q.difficulty].bg, color: DIFF[q.difficulty].fg }}>{DIFF[q.difficulty].label}</span>
                    <span style={{ padding: "2px 7px", borderRadius: 9, background: "#eef1f8", color: "#3a4a7a" }}>{q.tag}</span>
                    {wrongRate !== null && (
                      <span style={{ color: wrongRate >= 50 ? "#a32d2d" : "#888" }}>오답률 {wrongRate}% ({q.tries}회 풀림)</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <span onClick={() => toggleActive(q)} title={q.active ? "출제 중 (클릭해서 숨김)" : "숨김 (클릭해서 출제)"} style={{ position: "relative", width: 32, height: 17, background: q.active ? "#3d6fd9" : "#ccc", borderRadius: 9, cursor: "pointer" }}>
                    <span style={{ position: "absolute", top: 2, left: q.active ? 17 : 2, width: 13, height: 13, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
                  </span>
                  <button onClick={() => openEdit(q)} style={{ ...T.smallBtn, border: "1px solid #b4c4e0", color: "#3a5" }}>수정</button>
                  <button onClick={() => remove(q)} style={T.smallBtn}>삭제</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
