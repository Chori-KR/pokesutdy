"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "@/lib/styles";
import { DIFF, Difficulty } from "@/lib/game";
import { supabaseBrowser } from "@/lib/supabase/browser";
import AiGenerate from "@/components/teacher/AiGenerate";
import BulkImport from "@/components/teacher/BulkImport";
import MathText from "@/components/MathText";

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
  raid_only?: boolean; // true면 평소 배틀엔 안 나오고 레이드에서만 출제
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
  raidOnly: boolean;    // 레이드 전용 문제 여부
}

const EMPTY_FORM: FormState = {
  id: null, body: "", options: ["", "", "", ""], answer_idx: 0, difficulty: "easy", tag: "",
  qtype: "multiple", shortAnswers: "", raidOnly: false,
};

// 0008 미실행 DB 안내 (client 번들에 서버 모듈 import 방지 위해 문구를 인라인)
const RAID_ONLY_HINT =
  "레이드 전용 문제 기능에 필요한 DB 작업이 아직 안 됐어요. 'supabase/migrations/0008_raid_only.sql' 실행이 필요해요.";

export default function QuestionBank({ classId, questions, setQuestions, showToast, hasAiKey }: Props) {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [formErr, setFormErr] = useState("");
  const [panel, setPanel] = useState<"ai" | "bulk" | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // M7: 체크된 문제 id

  // 수정/새 문제 폼을 열면 상단 폼으로 자동 스크롤 (열림 순간에만 — 입력 중 재스크롤 방지)
  const formRef = useRef<HTMLDivElement>(null);
  const [formOpenSeq, setFormOpenSeq] = useState(0);
  useEffect(() => {
    if (formOpenSeq > 0) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [formOpenSeq]);

  const tags = useMemo(() => [...new Set(questions.map((q) => q.tag))], [questions]);
  const visible = questions
    .filter((q) => (!filterTag || q.tag === filterTag) && (!search || q.body.includes(search)))
    // 출제(활성) 문제를 위로. 같은 활성 상태 안에서는 기존 순서(최신순) 유지 — stable sort
    .sort((a, b) => Number(b.active) - Number(a.active));

  // 배틀에 실제로 나올 문제 = 출제(ON) + 4지선다 + 레이드전용 아님. 0개면 배틀이 안 돼서 경고.
  const battleReady = questions.filter((q) => q.active && q.type !== "short" && !q.raid_only).length;
  const shortActive = questions.filter((q) => q.active && q.type === "short").length;

  async function toggleActive(q: QuestionRow) {
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").update({ active: !q.active }).eq("id", q.id);
    if (!error) setQuestions(questions.map((x) => (x.id === q.id ? { ...x, active: !q.active } : x)));
  }

  // 레이드 전용 지정/해제 — true면 평소 배틀엔 안 나오고 레이드에서만 출제
  async function toggleRaidOnly(q: QuestionRow) {
    const next = !q.raid_only;
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").update({ raid_only: next }).eq("id", q.id);
    if (error) { showToast(/raid_only/.test(error.message) ? RAID_ONLY_HINT : "변경에 실패했어요."); return; }
    setQuestions(questions.map((x) => (x.id === q.id ? { ...x, raid_only: next } : x)));
    showToast(next ? "레이드 전용으로 지정했어요. (평소 배틀엔 안 나와요)" : "레이드 전용을 해제했어요.");
  }

  // 선택 일괄: 레이드 전용 지정/해제
  async function bulkSetRaidOnly(raid_only: boolean) {
    const ids = [...selected];
    if (ids.length === 0) return;
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").update({ raid_only }).in("id", ids);
    if (error) { showToast(/raid_only/.test(error.message) ? RAID_ONLY_HINT : "일괄 변경에 실패했어요."); return; }
    setQuestions(questions.map((x) => (selected.has(x.id) ? { ...x, raid_only } : x)));
    showToast(`선택한 ${ids.length}개를 레이드 전용 ${raid_only ? "지정" : "해제"}했어요.`);
    setSelected(new Set());
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

  // 선택(부분) 삭제 — 체크한 문제만 삭제
  async function bulkDeleteSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!window.confirm(`선택한 ${ids.length}개 문제를 삭제할까요? 되돌릴 수 없어요.`)) return;
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").delete().in("id", ids);
    if (error) { showToast("삭제에 실패했어요."); return; }
    setQuestions(questions.filter((x) => !selected.has(x.id)));
    showToast(`선택한 ${ids.length}개 문제를 삭제했어요.`);
    setSelected(new Set());
  }

  // 전체 삭제 — 이 학급의 모든 문제 삭제(2단계 확인)
  async function deleteAll() {
    if (questions.length === 0) return;
    if (!window.confirm(`정말 전체 문제 ${questions.length}개를 모두 삭제할까요? 되돌릴 수 없어요.`)) return;
    if (!window.confirm("한 번 더 확인합니다. 문제 은행이 완전히 비워집니다. 계속할까요?")) return;
    const supa = supabaseBrowser();
    const { error } = await supa.from("questions").delete().eq("class_id", classId);
    if (error) { showToast("전체 삭제에 실패했어요."); return; }
    setQuestions([]);
    setSelected(new Set());
    showToast("모든 문제를 삭제했어요.");
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
      raidOnly: !!q.raid_only,
    });
    setFormErr("");
    setFormOpenSeq((s) => s + 1);
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
        raid_only: form.raidOnly,
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
        raid_only: form.raidOnly,
      };
    }
    const supa = supabaseBrowser();
    // raid_only 컬럼이 없는 DB(0008 미실행)에서도 저장은 되게 폴백
    const stripRaid = (p: typeof payload) => { const { raid_only, ...rest } = p as typeof payload & { raid_only?: boolean }; return rest; };
    if (form.id) {
      let { error } = await supa.from("questions").update(payload).eq("id", form.id);
      if (error && /raid_only/.test(error.message)) {
        ({ error } = await supa.from("questions").update(stripRaid(payload)).eq("id", form.id));
        if (!error) showToast(RAID_ONLY_HINT);
      }
      if (error) { setFormErr(`저장 실패: ${error.message}`); return; }
      setQuestions(questions.map((x) => (x.id === form.id ? { ...x, ...payload } : x)));
      showToast("문제를 수정했어요.");
    } else {
      let res = await supa.from("questions").insert({ ...payload, class_id: classId, source: "수동" }).select("*").single();
      if (res.error && /raid_only/.test(res.error.message)) {
        res = await supa.from("questions").insert({ ...stripRaid(payload), class_id: classId, source: "수동" }).select("*").single();
        if (!res.error) showToast(RAID_ONLY_HINT);
      }
      if (res.error || !res.data) { setFormErr(`등록 실패: ${res.error?.message}`); return; }
      setQuestions([res.data as QuestionRow, ...questions]);
      showToast("문제를 등록했어요.");
    }
    setForm(null);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="문제 검색" style={{ ...T.input, flex: 1, minWidth: 140 }} />
        <button onClick={() => { setForm({ ...EMPTY_FORM }); setFormErr(""); setPanel(null); setFormOpenSeq((s) => s + 1); }} style={T.primaryBtn}>+ 새 문제</button>
        <button onClick={() => { setPanel(panel === "ai" ? null : "ai"); setForm(null); }} style={{ ...T.primaryBtn, background: "#7c5cd9" }}>🤖 AI 생성</button>
        <button onClick={() => { setPanel(panel === "bulk" ? null : "bulk"); setForm(null); }} style={{ ...T.primaryBtn, background: "#2e8b57" }}>📥 대량 등록</button>
      </div>

      {/* 배틀 출제 현황 — 배틀은 4지선다만 쓰므로, 출제된 4지선다가 0이면 경고 */}
      <div style={{ ...T.card, padding: "8px 12px", marginBottom: 8, fontSize: 12, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", background: battleReady === 0 ? "#fff5f5" : "#f2f8f4", border: battleReady === 0 ? "1px solid #f0b4b4" : "1px solid #cfe6d8" }}>
        <span>⚔️ 배틀에 나올 문제(4지선다·출제 중): <b style={{ color: battleReady === 0 ? "#c0392b" : "#0f6e56" }}>{battleReady}개</b></span>
        <span style={{ color: "#888" }}>✏️ 문제풀이용 단답형(출제 중): {shortActive}개</span>
        {battleReady === 0 && (
          <span style={{ color: "#c0392b", fontWeight: 600 }}>← 배틀을 하려면 4지선다 문제의 토글을 켜서 <b>출제(ON)</b> 하세요.</span>
        )}
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
        <div ref={formRef} style={{ ...T.card, marginBottom: 10, border: "2px solid #3d6fd9", scrollMarginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{form.id ? "✏️ 문제 수정" : "새 문제 등록"}</div>
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
          <MathHelp />
          {form.body.includes("$") && (
            <div style={{ ...T.card, background: "#f6f9ff", border: "1px solid #d5e0f5", padding: "8px 10px", marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: "#666", marginRight: 6 }}>미리보기:</span>
              <MathText>{form.body}</MathText>
            </div>
          )}
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
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 12.5, cursor: "pointer" }}>
            <input type="checkbox" checked={form.raidOnly} onChange={(e) => setForm({ ...form, raidOnly: e.target.checked })} />
            🛡️ 레이드 전용 <span style={{ color: "#888", fontSize: 11 }}>(체크하면 평소 배틀엔 안 나오고 레이드에서만 출제 — 형성평가용)</span>
          </label>
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
          <span style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button onClick={() => bulkSetSelected(true)} disabled={selected.size === 0} style={{ ...T.chip, color: selected.size ? "#0f6e56" : "#ccc", borderColor: selected.size ? "#0f6e56" : "#eee", cursor: selected.size ? "pointer" : "default" }}>선택 출제</button>
            <button onClick={() => bulkSetSelected(false)} disabled={selected.size === 0} style={{ ...T.chip, color: selected.size ? "#a32d2d" : "#ccc", borderColor: selected.size ? "#a32d2d" : "#eee", cursor: selected.size ? "pointer" : "default" }}>선택 숨김</button>
            <button onClick={() => bulkSetRaidOnly(true)} disabled={selected.size === 0} style={{ ...T.chip, color: selected.size ? "#c0651e" : "#ccc", borderColor: selected.size ? "#e0a06a" : "#eee", cursor: selected.size ? "pointer" : "default" }}>🛡️ 레이드 지정</button>
            <button onClick={() => bulkSetRaidOnly(false)} disabled={selected.size === 0} style={{ ...T.chip, color: selected.size ? "#8890a0" : "#ccc", borderColor: selected.size ? "#c9cfda" : "#eee", cursor: selected.size ? "pointer" : "default" }}>레이드 해제</button>
            <button onClick={bulkDeleteSelected} disabled={selected.size === 0} style={{ ...T.chip, background: selected.size ? "#fdecec" : "#fff", color: selected.size ? "#c0392b" : "#ccc", borderColor: selected.size ? "#f0b4b4" : "#eee", cursor: selected.size ? "pointer" : "default", fontWeight: 600 }}>🗑 선택 삭제</button>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())} style={{ ...T.chip, color: "#888" }}>선택 해제</button>
            )}
            <button onClick={deleteAll} style={{ ...T.chip, background: "#c0392b", color: "#fff", borderColor: "#c0392b", fontWeight: 600 }}>전체 삭제</button>
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
                  <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 5 }}><MathText>{q.body}</MathText></div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    {q.type === "short" ? (
                      <span style={{ color: "#0f6e56", fontWeight: 600 }}>
                        정답:{" "}
                        {q.options.map((o, i) => (
                          <span key={i} style={{ marginRight: 6 }}>
                            <MathText>{o}</MathText>{i < q.options.length - 1 ? " /" : ""}
                          </span>
                        ))}
                      </span>
                    ) : (
                      q.options.map((o, i) => (
                        <span key={i} style={{ marginRight: 8, color: i === q.answer_idx ? "#0f6e56" : "#999", fontWeight: i === q.answer_idx ? 600 : 400 }}>
                          {CIRCLED[i]} <MathText>{o}</MathText>
                        </span>
                      ))
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", fontSize: 10, flexWrap: "wrap" }}>
                    {q.type === "short" ? (
                      <span style={{ padding: "2px 7px", borderRadius: 9, background: "#fff3e0", color: "#b26a00", fontWeight: 700 }}>✏️ 단답형</span>
                    ) : (
                      <span style={{ padding: "2px 7px", borderRadius: 9, background: "#e8f0ff", color: "#3d6fd9", fontWeight: 700 }}>🔘 4지선다</span>
                    )}
                    <span style={{ padding: "2px 7px", borderRadius: 9, background: DIFF[q.difficulty].bg, color: DIFF[q.difficulty].fg }}>{DIFF[q.difficulty].label}</span>
                    <span style={{ padding: "2px 7px", borderRadius: 9, background: "#eef1f8", color: "#3a4a7a" }}>{q.tag}</span>
                    {q.raid_only && <span style={{ padding: "2px 7px", borderRadius: 9, background: "#fdeee0", color: "#c0651e", fontWeight: 700 }}>🛡️ 레이드 전용</span>}
                    {wrongRate !== null && (
                      <span style={{ color: wrongRate >= 50 ? "#a32d2d" : "#888" }}>오답률 {wrongRate}% ({q.tries}회 풀림)</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <span onClick={() => toggleActive(q)} title={q.active ? "출제 중 (클릭해서 숨김)" : "숨김 (클릭해서 출제)"} style={{ position: "relative", width: 32, height: 17, background: q.active ? "#3d6fd9" : "#ccc", borderRadius: 9, cursor: "pointer" }}>
                    <span style={{ position: "absolute", top: 2, left: q.active ? 17 : 2, width: 13, height: 13, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
                  </span>
                  <button onClick={() => toggleRaidOnly(q)} title="레이드 전용 지정/해제" style={{ ...T.smallBtn, border: q.raid_only ? "1px solid #e0a06a" : "1px solid #d9dde6", color: q.raid_only ? "#c0651e" : "#8890a0", background: q.raid_only ? "#fdf3ea" : "#fff" }}>🛡️ 레이드{q.raid_only ? " ✓" : ""}</button>
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

// 수식(LaTeX) 입력 방법 안내 — 접었다 폈다 하는 도움말 (과목별 그룹)
const MATH_GROUPS: { title: string; items: { label: string; input: string }[] }[] = [
  {
    title: "📐 수학 기본",
    items: [
      { label: "지수 (제곱)", input: "$2^{3}$" },
      { label: "분수", input: "$\\frac{1}{2}$" },
      { label: "제곱근", input: "$\\sqrt{b^2-4ac}$" },
      { label: "삼각함수", input: "$\\sin\\theta$" },
      { label: "극한", input: "$\\lim_{x\\to 0}$" },
      { label: "곱하기·나누기", input: "$3 \\times 4 \\div 2$" },
      { label: "부등호·같지 않음", input: "$a \\leq b \\neq c$" },
      { label: "집합 기호", input: "$x \\in A \\cup B$" },
    ],
  },
  {
    title: "🧪 과학·기타 기호",
    items: [
      { label: "화학식 (아래첨자)", input: "$\\mathrm{H_2O}$" },
      { label: "물리 공식", input: "$E=mc^2$" },
      { label: "반응 화살표", input: "$A \\rightarrow B$" },
      { label: "화학 평형", input: "$aA \\rightleftharpoons bB$" },
      { label: "그리스 문자", input: "$\\alpha, \\beta, \\pi, \\theta, \\Omega$" },
      { label: "단위 (가속도)", input: "$9.8\\ \\mathrm{m/s^2}$" },
      { label: "섭씨온도", input: "$25^\\circ\\mathrm{C}$" },
      { label: "벡터", input: "$\\vec{F} = m\\vec{a}$" },
      { label: "근사·비례", input: "$\\pi \\approx 3.14,\\ y \\propto x$" },
      { label: "이온 (위첨자)", input: "$\\mathrm{Na^{+}},\\ \\mathrm{SO_4^{2-}}$" },
    ],
  },
];

function MathHelp() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ ...T.chip, fontSize: 11.5, color: "#5a3ea8", borderColor: "#d5c9f0", background: "#f6f2ff", cursor: "pointer" }}
      >
        🧮 수식·기호(지수·분수·화학식·그리스문자…) 입력 방법 {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{ ...T.card, background: "#faf8ff", border: "1px solid #e2d9f5", padding: "10px 12px", marginTop: 6, fontSize: 12, lineHeight: 1.6 }}>
          <div style={{ marginBottom: 8, color: "#444" }}>
            수식·기호는 <b>달러 기호 <code style={{ background: "#efe8fb", padding: "1px 5px", borderRadius: 4 }}>$ … $</code></b> 사이에 넣으면 교과서처럼 예쁘게 나와요.
            지수만 필요하면 <code style={{ background: "#efe8fb", padding: "1px 5px", borderRadius: 4 }}>2^3</code>처럼 <b>그냥 써도</b> 자동으로 <MathText>{"$2^{3}$"}</MathText>가 돼요.
          </div>
          {MATH_GROUPS.map((group) => (
            <div key={group.title} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#5a3ea8", margin: "2px 0 6px" }}>{group.title}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {group.items.map((ex) => (
                  <div key={ex.input} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #ece5f7", borderRadius: 8, padding: "6px 8px" }}>
                    <code style={{ fontSize: 11, color: "#7a5", flexShrink: 0 }}>{ex.input}</code>
                    <span style={{ color: "#bbb" }}>→</span>
                    <span style={{ fontSize: 13 }}><MathText>{ex.input}</MathText></span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "#999", flexShrink: 0 }}>{ex.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 4, color: "#888", fontSize: 11 }}>
            💡 보기 칸에도 똑같이 쓸 수 있어요. AI 생성·대량 등록으로 만든 문제도 자동으로 적용돼요.<br />
            💡 화살표·부등호·그리스문자 같은 <b>기호 하나</b>도 <code style={{ background: "#efe8fb", padding: "1px 4px", borderRadius: 4 }}>$\rightarrow$</code>처럼 달러 기호로 감싸면 돼요. (사회·기술·가정 등에서도 사용)
          </div>
        </div>
      )}
    </div>
  );
}
