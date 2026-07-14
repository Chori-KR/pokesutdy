"use client";

import { useMemo, useState } from "react";
import { T } from "@/lib/styles";
import { DIFF, Difficulty } from "@/lib/game";
import { supabaseBrowser } from "@/lib/supabase/browser";
import AiGenerate from "@/components/teacher/AiGenerate";
import BulkImport from "@/components/teacher/BulkImport";

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
  type?: string; // "multiple"(기본) | "short"(단답형)
  tries: number;
  wrong: number;
  created_at: string;
}

interface Props {
  classId: string;
  questions: QuestionRow[];
  setQuestions: (qs: QuestionRow[]) => void;
  showToast: (t: string) => void;
  hasAiKey: boolean;
}

const CIRCLED = ["①", "②", "③", "④"];

interface FormState {
  id: string | null; // null = 새 문제
  body: string;
  options: [string, string, string, string];
  answer_idx: number;
  difficulty: Difficulty;
  tag: string;
  qtype: "multiple" | "short";
  shortAnswers: string; // 단답형 허용 정답(쉼표로 구분)
}

const EMPTY_FORM: FormState = {
  id: null, body: "", options: ["", "", "", ""], answer_idx: 0, difficulty: "easy", tag: "",
  qtype: "multiple", shortAnswers: "",
};

export default function QuestionBank({ classId, questions, setQuestions, showToast, hasAiKey }: Props) {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [formErr, setFormErr] = useState("");
  const [panel, setPanel] = useState<"ai" | "bulk" | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // M7: 체크된 문제 id

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

  // M7: 체크한 문제만 한 번에 출제/숨김
  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function bulkSetSelected(active: boolean) {
    const ids = [...selected];
    if (ids.length === 0) return;
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").update({ active }).in("id", ids);
    if (error) { showToast("일괄 변경에 실패했어요."); return; }
    setQuestions(questions.map((x) => (selected.has(x.id) ? { ...x, active } : x)));
    showToast(`선택한 ${ids.length}개 문제를 ${active ? "출제" : "숨김"} 처리했어요.`);
    setSelected(new Set());
  }

  const allVisibleSelected = visible.length > 0 && visible.every((q) => selected.has(q.id));

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
    const isShort = q.type === "short";
    setForm({
      id: q.id, body: q.body,
      options: [q.options[0] ?? "", q.options[1] ?? "", q.options[2] ?? "", q.options[3] ?? ""],
      answer_idx: q.answer_idx, difficulty: q.difficulty, tag: q.tag,
      qtype: isShort ? "short" : "multiple",
      shortAnswers: isShort ? (q.options ?? []).join(", ") : "",
    });
    setFormErr("");
  }

  async function saveForm() {
    if (!form) return;
    setFormErr("");
    if (!form.body.trim()) { setFormErr("문제 내용을 입력해주세요."); return; }
    let payload;
    if (form.qtype === "short") {
      const answers = form.shortAnswers.split(",").map((s) => s.trim()).filter(Boolean);
      if (answers.length === 0) { setFormErr("허용할 정답을 1개 이상 입력해주세요 (여러 개는 쉼표로 구분)."); return; }
      payload = {
        body: form.body.trim(),
        options: answers,          // 단답형: options에 허용 정답 저장
        answer_idx: 0,
        difficulty: form.difficulty,
        tag: form.tag.trim() || "미분류",
        type: "short",
      };
    } else {
      if (form.options.some((o) => !o.trim())) { setFormErr("보기 4개를 모두 입력해주세요."); return; }
      payload = {
        body: form.body.trim(),
        options: form.options.map((o) => o.trim()),
        answer_idx: form.answer_idx,
        difficulty: form.difficulty,
        tag: form.tag.trim() || "미분류",
        type: "multiple",
      };
    }
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
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="문제 검색" style={{ ...T.input, flex: 1, minWidth: 140 }} />
        <button onClick={() => { setForm({ ...EMPTY_FORM }); setFormErr(""); setPanel(null); }} style={T.primaryBtn}>+ 새 문제</button>
        <button onClick={() => { setPanel(panel === "ai" ? null : "ai"); setForm(null); }} style={{ ...T.primaryBtn, background: "#7c5cd9" }}>🤖 AI 생성</button>
        <button onClick={() => { setPanel(panel === "bulk" ? null : "bulk"); setForm(null); }} style={{ ...T.primaryBtn, background: "#2e8b57" }}>📥 대량 등록</button>
      </div>

      {panel === "ai" && (
        <AiGenerate
          classId={classId}
          hasAiKey={hasAiKey}
          onRegistered={(rows) => setQuestions([...rows, ...questions])}
          onClose={() => setPanel(null)}
          showToast={showToast}
        />
      )}
      {panel === "bulk" && (
        <BulkImport
          classId={classId}
          onRegistered={(rows) => setQuestions([...rows, ...questions])}
          onClose={() => setPanel(null)}
          showToast={showToast}
        />
      )}

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
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button onClick={() => setForm({ ...form, qtype: "multiple" })} style={{ ...(form.qtype === "multiple" ? T.primaryBtn : T.secondaryBtn), padding: "6px 12px", fontSize: 12 }}>4지선다</button>
            <button onClick={() => setForm({ ...form, qtype: "short" })} style={{ ...(form.qtype === "short" ? T.primaryBtn : T.secondaryBtn), padding: "6px 12px", fontSize: 12 }}>단답형</button>
          </div>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="문제 내용"
            style={{ ...T.input, width: "100%", minHeight: 60, resize: "vertical", marginBottom: 8, fontFamily: "inherit" }}
          />
          {form.qtype === "short" ? (
            <input
              value={form.shortAnswers}
              onChange={(e) => setForm({ ...form, shortAnswers: e.target.value })}
              placeholder="정답 (여러 개 허용 시 쉼표로 구분 — 예: 세종, 세종대왕)"
              style={{ ...T.input, width: "100%", marginBottom: 8 }}
            />
          ) : (
            form.options.map((o, i) => (
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
            ))
          )}
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

      {/* M7: 선택 일괄 관리 바 — 체크한 문제만 한 번에 출제/숨김 */}
      {visible.length > 0 && (
        <div style={{ ...T.card, display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "8px 12px", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) visible.forEach((q) => next.add(q.id));
                else visible.forEach((q) => next.delete(q.id));
                setSelected(next);
              }}
            />
            전체 선택
          </label>
          <span style={{ fontSize: 12, color: selected.size > 0 ? "#3d6fd9" : "#999", fontWeight: 600 }}>
            {selected.size}개 선택됨
          </span>
          <span style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button onClick={() => bulkSetSelected(true)} disabled={selected.size === 0} style={{ ...T.chip, color: selected.size ? "#0f6e56" : "#ccc", borderColor: selected.size ? "#0f6e56" : "#eee", cursor: selected.size ? "pointer" : "default" }}>선택 출제</button>
            <button onClick={() => bulkSetSelected(false)} disabled={selected.size === 0} style={{ ...T.chip, color: selected.size ? "#a32d2d" : "#ccc", borderColor: selected.size ? "#a32d2d" : "#eee", cursor: selected.size ? "pointer" : "default" }}>선택 숨김</button>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())} style={{ ...T.chip, color: "#888" }}>선택 해제</button>
            )}
          </span>
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
            <div key={q.id} style={{ ...T.card, opacity: q.active ? 1 : 0.55, border: selected.has(q.id) ? "2px solid #3d6fd9" : T.card.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={selected.has(q.id)}
                  onChange={() => toggleSelect(q.id)}
                  style={{ marginTop: 2, flexShrink: 0 }}
                  title="선택"
                />
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
