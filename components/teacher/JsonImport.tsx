"use client";

import { useState } from "react";
import { T } from "@/lib/styles";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { fetchAll } from "@/lib/fetchAll";
import { parseBank, textKey, ParsedBank } from "@/lib/bankImport";
import type { QuestionRow, PassageRow } from "@/components/teacher/QuestionBank";

interface Props {
  classId: string;
  questions: QuestionRow[];
  passages: PassageRow[];
  onRegistered: (rows: QuestionRow[], passages: PassageRow[]) => void;
  onClose: () => void;
  showToast: (t: string) => void;
}

const MIGRATION_HINT =
  "지문·그림 기능에 필요한 DB 작업이 아직 안 됐어요. Supabase에서 'supabase/migrations/0011_passages_svg.sql'을 먼저 실행해 주세요.";
const isMissingDb = (e: { message?: string; code?: string } | null) =>
  !!e && (e.code === "PGRST204" || e.code === "PGRST205" || e.code === "42703" || e.code === "42P01" ||
    /passage|svg|schema cache|does not exist/i.test(e.message ?? ""));

// JSON 문제 은행 가져오기 (Codex로 만든 bank_*.json 여러 개를 한 번에)
//  1) 파일 읽기·검사 → 미리보기   2) 지문 먼저 저장(같은 글이 이미 있으면 재사용)
//  3) 문제 저장(이미 있는 똑같은 문제는 건너뜀) — 200개씩 나눠서
export default function JsonImport({ classId, questions, passages, onRegistered, onClose, showToast }: Props) {
  const [banks, setBanks] = useState<ParsedBank[]>([]);
  const [activeOn, setActiveOn] = useState(true);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    setErr("");
    const parsed = await Promise.all(files.map(async (f) => parseBank(f.name, await f.text())));
    setBanks(parsed);
  }

  const totalQ = banks.reduce((n, b) => n + b.questions.length, 0);
  const totalP = banks.reduce((n, b) => n + b.passages.length, 0);
  const totalSvg = banks.reduce((n, b) => n + b.questions.filter((q) => q.svg).length, 0);
  const totalShort = banks.reduce((n, b) => n + b.questions.filter((q) => q.type === "short").length, 0);
  const totalErr = banks.reduce((n, b) => n + b.errors.length + (b.fatal ? 1 : 0), 0);

  async function register() {
    if (totalQ === 0) return;
    setErr("");
    const supa = supabaseBrowser();
    try {
      // ── 지문: 이미 있는 같은 글은 재사용, 없는 것만 새로 ──
      const byText = new Map<string, string>(); // 지문 글 → DB id
      const pBodyById = new Map<string, string>();
      for (const p of passages) { byText.set(textKey(p.body), p.id); pBodyById.set(p.id, textKey(p.body)); }
      const fresh = new Map<string, { title: string; body: string; source: string; svg: string | null }>();
      for (const b of banks) for (const p of b.passages) {
        const k = textKey(p.body);
        if (!byText.has(k) && !fresh.has(k)) fresh.set(k, { title: p.title, body: p.body, source: p.source, svg: p.svg });
      }
      const newPassages: PassageRow[] = [];
      const freshList = [...fresh.values()];
      for (let i = 0; i < freshList.length; i += 100) {
        setBusy(`지문 저장 중… ${i}/${freshList.length}`);
        const { data, error } = await supa.from("passages")
          .insert(freshList.slice(i, i + 100).map((p) => ({ ...p, class_id: classId })))
          .select("id, title, body, source, svg");
        if (error || !data) { setErr(isMissingDb(error) ? MIGRATION_HINT : `지문 저장 실패: ${error?.message}`); return; }
        for (const p of data as PassageRow[]) { byText.set(textKey(p.body), p.id); pBodyById.set(p.id, textKey(p.body)); newPassages.push(p); }
      }

      // ── 문제: (본문 + 지문)이 똑같은 문제는 한 번만 ──
      const seen = new Set(questions.map((q) => `${textKey(q.body)}|${q.passage_id ? pBodyById.get(q.passage_id) ?? q.passage_id : ""}`));
      const payload: Record<string, unknown>[] = [];
      let dup = 0;
      for (const b of banks) {
        const keyText = new Map(b.passages.map((p) => [p.key, textKey(p.body)]));
        for (const q of b.questions) {
          const pText = q.passageKey ? keyText.get(q.passageKey) ?? "" : "";
          const k = `${textKey(q.body)}|${pText}`;
          if (seen.has(k)) { dup++; continue; }
          seen.add(k);
          const row: Record<string, unknown> = {
            class_id: classId, body: q.body, options: q.options, answer_idx: q.answer_idx,
            difficulty: q.difficulty, tag: q.tag, type: q.type, active: activeOn, source: "JSON",
          };
          if (q.svg) row.svg = q.svg;
          if (pText) row.passage_id = byText.get(pText);
          payload.push(row);
        }
      }

      const rows: QuestionRow[] = [];
      for (let i = 0; i < payload.length; i += 200) {
        setBusy(`문제 저장 중… ${i}/${payload.length}`);
        const { data, error } = await supa.from("questions").insert(payload.slice(i, i + 200)).select("*");
        if (error || !data) {
          if (rows.length) onRegistered(rows, newPassages);
          setErr((isMissingDb(error) ? MIGRATION_HINT : `문제 저장 실패: ${error?.message}`) + (rows.length ? ` (앞의 ${rows.length}개는 저장됐어요)` : ""));
          return;
        }
        rows.push(...(data as QuestionRow[]));
      }
      onRegistered(rows, newPassages);
      if (rows.length === 0) { setErr(`새로 가져올 문제가 없어요 — ${dup}개 모두 이미 문제 은행에 있어요.`); return; }
      showToast(`${rows.length}개 문제를 가져왔어요${newPassages.length ? ` (지문 ${newPassages.length}개)` : ""}${dup ? ` · 이미 있는 ${dup}개는 건너뜀` : ""}`);
      onClose();
    } finally {
      setBusy("");
    }
  }

  return (
    <div style={{ ...T.card, marginBottom: 10, border: "2px solid #c07a1e" }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>🗂️ JSON 문제 은행 가져오기</div>
      <div style={{ fontSize: 11.5, color: "#666", lineHeight: 1.7, marginBottom: 10 }}>
        Codex로 만든 <b>bank_….json</b> 파일을 골라요. <b>여러 개를 한꺼번에</b> 골라도 돼요.<br />
        지문(긴 글)·그림(SVG)·출처도 함께 들어오고, 이미 있는 똑같은 문제는 건너뛰어요.
        태그는 <b>과목·단원</b>으로 붙어요.
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <label style={{ ...T.primaryBtn, background: "#c07a1e", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
          📂 JSON 파일 고르기
          <input type="file" accept=".json,application/json" multiple onChange={onFiles} style={{ display: "none" }} />
        </label>
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
          <input type="checkbox" checked={activeOn} onChange={(e) => setActiveOn(e.target.checked)} />
          가져오자마자 출제(ON)
        </label>
      </div>

      {banks.length > 0 && (
        <div style={{ fontSize: 12, marginBottom: 10 }}>
          <div style={{ marginBottom: 6 }}>
            <b style={{ color: "#0f6e56" }}>가져올 문제 {totalQ}개</b>
            <span style={{ color: "#666" }}> · 지문 {totalP}개 · 그림 {totalSvg}개 · 단답형 {totalShort}개</span>
            {totalErr > 0 && <span style={{ color: "#a32d2d" }}> · 오류로 빠지는 것 {totalErr}개</span>}
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #eee", borderRadius: 8, padding: "6px 10px" }}>
            {banks.map((b) => (
              <div key={b.file} style={{ padding: "5px 0", borderBottom: "1px dashed #eee" }}>
                <div>
                  {b.fatal ? "❌" : b.errors.length ? "⚠️" : "✅"} <b>{b.file}</b>
                  {!b.fatal && <span style={{ color: "#666" }}> — 문제 {b.questions.length} · 지문 {b.passages.length}</span>}
                </div>
                {b.fatal && <div style={{ color: "#a32d2d", marginLeft: 18 }}>{b.fatal}</div>}
                {b.errors.slice(0, 4).map((m, i) => <div key={i} style={{ color: "#a32d2d", marginLeft: 18 }}>{m}</div>)}
                {b.errors.length > 4 && <div style={{ color: "#a32d2d", marginLeft: 18 }}>…외 {b.errors.length - 4}개</div>}
                {b.warnings.slice(0, 3).map((m, i) => <div key={i} style={{ color: "#b26a00", marginLeft: 18 }}>{m}</div>)}
                {b.warnings.length > 3 && <div style={{ color: "#b26a00", marginLeft: 18 }}>…외 확인할 것 {b.warnings.length - 3}개</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {busy && <div style={{ fontSize: 12, color: "#3d6fd9", marginBottom: 8 }}>{busy}</div>}
      {err && <div style={{ fontSize: 12, color: "#a32d2d", marginBottom: 8 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={register} disabled={totalQ === 0 || !!busy}
          style={{ ...T.primaryBtn, background: "#c07a1e", opacity: totalQ === 0 || busy ? 0.5 : 1 }}>
          {totalQ}개 가져오기
        </button>
        <button onClick={onClose} disabled={!!busy} style={T.secondaryBtn}>닫기</button>
      </div>
    </div>
  );
}

// 학급의 지문 목록 (문제 은행 미리보기·가져오기 중복 확인용). 0011 전이면 빈 목록.
export async function loadPassages(classId: string): Promise<PassageRow[]> {
  const supa = supabaseBrowser();
  const { data } = await fetchAll<PassageRow>((from, to) =>
    supa.from("passages").select("id, title, body, source, svg").eq("class_id", classId).order("id").range(from, to));
  return data ?? [];
}
