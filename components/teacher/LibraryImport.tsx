"use client";

import { useEffect, useMemo, useState } from "react";
import { T } from "@/lib/styles";
import { parseBank, ParsedBank } from "@/lib/bankImport";
import { saveBanks } from "@/components/teacher/JsonImport";
import type { QuestionRow, PassageRow } from "@/components/teacher/QuestionBank";

// 기본 문제 은행 — 앱에 들어 있는 문제(public/library, scripts/build-library.mjs가 만듦)를
// 학년군 → 과목 → 단원으로 골라 우리 반에 넣는다. 파일 고르기 없이 체크만 하면 된다.

interface LibUnit { tag: string; group: string; unit: string; count: number; svg: number; passage: number; files: string[] }
interface LibSubject { subject: string; count: number; units: LibUnit[] }
interface LibBand { band: string; count: number; subjects: LibSubject[] }
interface LibIndex { total: number; bands: LibBand[] }

interface Props {
  classId: string;
  questions: QuestionRow[];
  passages: PassageRow[];
  welcome?: boolean; // 학급을 막 만들었을 때 — 안내 문구를 바꿔 보여준다
  onRegistered: (rows: QuestionRow[], passages: PassageRow[]) => void;
  onClose: () => void;
  showToast: (t: string) => void;
}

const ACCENT = "#1f8a8a";

export default function LibraryImport({ classId, questions, passages, welcome, onRegistered, onClose, showToast }: Props) {
  const [index, setIndex] = useState<LibIndex | null>(null);
  const [band, setBand] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [activeOn, setActiveOn] = useState(true);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/library/index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: LibIndex) => { setIndex(d); setBand(d.bands[0]?.band ?? ""); })
      .catch(() => setErr("기본 문제 은행을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요."));
  }, []);

  // 우리 반에 이미 있는 단원 (태그 기준)
  const have = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of questions) m.set(q.tag, (m.get(q.tag) ?? 0) + 1);
    return m;
  }, [questions]);

  const units = useMemo(() => {
    const m = new Map<string, LibUnit>();
    for (const b of index?.bands ?? []) for (const s of b.subjects) for (const u of s.units) m.set(u.tag, u);
    return m;
  }, [index]);
  const pickedCount = [...picked].reduce((n, t) => n + (units.get(t)?.count ?? 0), 0);
  const pickedIn = (list: LibUnit[]) => list.filter((u) => picked.has(u.tag)).length;

  function toggle(tags: string[], on: boolean) {
    const next = new Set(picked);
    for (const t of tags) (on ? next.add(t) : next.delete(t));
    setPicked(next);
  }

  async function register() {
    if (picked.size === 0) return;
    setErr("");
    try {
      const files = [...new Set([...picked].flatMap((t) => units.get(t)?.files ?? []))];
      const banks: ParsedBank[] = [];
      for (let i = 0; i < files.length; i++) {
        setBusy(`문제 꺼내는 중… ${i}/${files.length}`);
        const res = await fetch(`/library/${files[i]}`);
        if (!res.ok) { setErr("문제 파일을 받지 못했어요. 다시 시도해 주세요."); return; }
        const b = parseBank(files[i], await res.text());
        // 한 파일에 다른 단원이 섞여 있어도 고른 단원만
        banks.push({ ...b, questions: b.questions.filter((q) => picked.has(q.tag)) });
      }
      const r = await saveBanks({ classId, banks, questions, passages, active: activeOn, source: "기본 은행", onBusy: setBusy });
      if (r.rows.length || r.newPassages.length) onRegistered(r.rows, r.newPassages);
      if (r.error) { setErr(r.error); return; }
      if (r.rows.length === 0) { setErr(`새로 넣을 문제가 없어요 — ${r.dup}개 모두 이미 우리 반에 있어요.`); return; }
      showToast(`${picked.size}개 단원, ${r.rows.length}개 문제를 우리 반에 넣었어요${r.dup ? ` · 이미 있는 ${r.dup}개는 건너뜀` : ""}`);
      onClose();
    } finally {
      setBusy("");
    }
  }

  const cur = index?.bands.find((b) => b.band === band);

  return (
    <div style={{ ...T.card, marginBottom: 10, border: `2px solid ${ACCENT}` }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
        {welcome ? "🎉 학급이 만들어졌어요! 어떤 문제로 시작할까요?" : "📚 기본 문제 은행"}
      </div>
      <div style={{ fontSize: 11.5, color: "#666", lineHeight: 1.7, marginBottom: 10 }}>
        2022 개정 교육과정에 맞춘 문제 <b>{index ? index.total.toLocaleString() : "…"}개</b>가 들어 있어요.
        <b> 학년 → 과목 → 단원</b>을 골라 <b>우리 반에 넣기</b>를 누르면 끝! 지문·그림도 함께 들어가요.
        {welcome && <><br />나중에 문제 은행의 <b>📚 기본 문제 은행</b> 버튼으로 언제든 더 넣을 수 있어요.</>}
      </div>

      {/* 학년군 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {index?.bands.map((b) => {
          const n = pickedIn(b.subjects.flatMap((s) => s.units));
          return (
            <button key={b.band} onClick={() => setBand(b.band)}
              style={{ ...T.chip, padding: "7px 14px", fontSize: 13, ...(band === b.band ? { ...T.chipOn, borderColor: ACCENT, color: ACCENT } : {}) }}>
              {b.band.replace("초", "초등 ").replace("중", "중학 ")}학년
              <span style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>{b.count.toLocaleString()}</span>
              {n > 0 && <span style={{ marginLeft: 5, padding: "0 6px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 10.5 }}>{n}</span>}
            </button>
          );
        })}
      </div>

      {/* 과목 → 단원 */}
      <div style={{ maxHeight: "52vh", overflowY: "auto", paddingRight: 2 }}>
        {cur?.subjects.map((s) => {
          const all = s.units.map((u) => u.tag);
          const n = pickedIn(s.units);
          const groups = [...new Set(s.units.map((u) => u.group))];
          return (
            <div key={s.subject} style={{ border: "1px solid #e6e9f0", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, cursor: "pointer", marginBottom: 6 }}>
                <input type="checkbox" checked={n === all.length} ref={(el) => { if (el) el.indeterminate = n > 0 && n < all.length; }}
                  onChange={(e) => toggle(all, e.target.checked)} />
                {s.subject}
                <span style={{ fontSize: 11.5, fontWeight: 400, color: "#888" }}>단원 {s.units.length}개 · {s.count}문제</span>
              </label>
              {groups.map((g) => (
                <div key={g} style={{ marginBottom: 4 }}>
                  {g && <div style={{ fontSize: 11, color: "#888", margin: "4px 0 3px 2px" }}>{g}</div>}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {s.units.filter((u) => u.group === g).map((u) => {
                      const on = picked.has(u.tag);
                      const got = have.get(u.tag) ?? 0;
                      return (
                        <button key={u.tag} onClick={() => toggle([u.tag], !on)} title={u.tag}
                          style={{ ...T.chip, fontSize: 12, padding: "5px 10px", textAlign: "left",
                            ...(on ? { background: ACCENT, borderColor: ACCENT, color: "#fff" } : {}) }}>
                          {on ? "✓ " : ""}{u.unit}
                          <span style={{ fontSize: 10.5, opacity: 0.75, marginLeft: 4 }}>
                            {u.count}{u.passage > 0 ? " 📖" : ""}{u.svg > 0 ? " 🖼️" : ""}
                          </span>
                          {got > 0 && <span style={{ fontSize: 10, marginLeft: 4, color: on ? "#e6fffa" : "#0f6e56" }}>(우리 반 {got})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: "#888", margin: "6px 0 8px" }}>📖 지문(긴 글)이 딸린 문제 있음 · 🖼️ 그림 문제 있음 · (우리 반 N) 이미 넣은 문제 수 — 다시 골라도 똑같은 문제는 건너뛰어요</div>

      {busy && <div style={{ fontSize: 12, color: "#3d6fd9", marginBottom: 8 }}>{busy}</div>}
      {err && <div style={{ fontSize: 12, color: "#a32d2d", marginBottom: 8 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={register} disabled={picked.size === 0 || !!busy}
          style={{ ...T.primaryBtn, background: ACCENT, opacity: picked.size === 0 || busy ? 0.5 : 1 }}>
          {picked.size === 0 ? "단원을 골라 주세요" : `단원 ${picked.size}개 · ${pickedCount.toLocaleString()}문제 우리 반에 넣기`}
        </button>
        {picked.size > 0 && !busy && <button onClick={() => setPicked(new Set())} style={T.secondaryBtn}>선택 지우기</button>}
        <button onClick={onClose} disabled={!!busy} style={T.secondaryBtn}>{welcome ? "나중에 할게요" : "닫기"}</button>
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", marginLeft: 4 }}>
          <input type="checkbox" checked={activeOn} onChange={(e) => setActiveOn(e.target.checked)} />
          넣자마자 출제(ON)
        </label>
      </div>
    </div>
  );
}
