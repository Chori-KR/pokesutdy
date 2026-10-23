"use client";

import { useEffect, useMemo, useState } from "react";
import { T } from "@/lib/styles";
import { teacherFetch } from "@/lib/teacherClient";
import { LibSettings, scopeOf } from "@/lib/libraryShared";
import { useLibIndex } from "@/lib/libIndexClient";
import { MASTERY_RULE, MasteryCell, MasteryStatus, STATUS_COLOR, STATUS_LABEL } from "@/lib/mastery";

// 📈 성취기준 현황 (학습경로 2-1, 읽기 전용) — 학생 × 성취기준(한 칸) 숙달 상태를 한눈에.
// 모둠(또는 개별 범위·범위 없음)을 고르면 그 범위의 단원 → 성취기준 순서대로 칸을 그린다.

interface StudentCells { id: string; nickname: string; cells: Record<string, MasteryCell> }

let textsP: Promise<Record<string, string>> | null = null;
const loadTexts = () => (textsP ??= fetch("/library/standards.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})));

const NONE: MasteryCell = { st: "none", n: 0, c: 0, lv: "", recent: [] };

export default function MasteryBoard({ lib }: { lib: LibSettings }) {
  const index = useLibIndex();
  const [data, setData] = useState<StudentCells[] | null>(null);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string>("");
  const [pick, setPick] = useState<{ sid: string; std: string } | null>(null);

  useEffect(() => {
    teacherFetch("/api/teacher/mastery").then(async (r) => setData(r.ok ? (await r.json()).students ?? [] : []));
    loadTexts().then(setTexts);
  }, []);

  // 단원 태그 → 성취기준 목록, 성취기준 → 단원 (교과서 순서 = index 순서)
  const { stdsOf, unitOfStd, tagOrder, unitName } = useMemo(() => {
    const stdsOf = new Map<string, string[]>(), unitOfStd = new Map<string, string>(), tagOrder = new Map<string, number>(), unitName = new Map<string, string>();
    let i = 0;
    for (const b of index?.bands ?? []) for (const s of b.subjects) for (const u of s.units) {
      stdsOf.set(u.tag, u.stds ?? []); tagOrder.set(u.tag, i++); unitName.set(u.tag, u.tag);
      for (const c of u.stds ?? []) unitOfStd.set(c, u.tag);
    }
    return { stdsOf, unitOfStd, tagOrder, unitName };
  }, [index]);

  // 고를 수 있는 묶음: 모둠들, 개별 범위 학생들, 범위 없는 학생들
  const choices = useMemo(() => {
    const out: { key: string; label: string; color: string; members: StudentCells[]; tags: string[] | null }[] = [];
    if (!data) return out;
    for (const g of lib.groups ?? []) {
      const members = data.filter((s) => { const sc = scopeOf(lib, s.id); return sc?.source === "group" && sc.group?.id === g.id; });
      out.push({ key: `g:${g.id}`, label: g.name, color: g.color, members, tags: g.tags });
    }
    for (const s of data) {
      const sc = scopeOf(lib, s.id);
      if (sc?.source === "individual") out.push({ key: `s:${s.id}`, label: `${s.nickname} (개별)`, color: "#888", members: [s], tags: sc.tags });
    }
    const free = data.filter((s) => !scopeOf(lib, s.id));
    if (free.length) out.push({ key: "free", label: "범위 없는 학생", color: "#bbb", members: free, tags: null });
    return out;
  }, [data, lib]);

  useEffect(() => { if (!sel && choices.length) setSel(choices[0].key); }, [choices, sel]);
  const cur = choices.find((c) => c.key === sel);

  // 열: 범위의 단원(교과서 순서) → 성취기준. 범위가 없으면 학생들이 풀어 본 성취기준만.
  const columns = useMemo(() => {
    if (!cur) return [] as { tag: string; stds: string[] }[];
    let tags: string[];
    if (cur.tags) tags = cur.tags;
    else {
      const seen = new Set<string>();
      for (const m of cur.members) for (const std of Object.keys(m.cells)) { const t = unitOfStd.get(std); if (t) seen.add(t); }
      tags = [...seen];
    }
    return tags.filter((t) => (stdsOf.get(t) ?? []).length > 0)
      .sort((a, b) => (tagOrder.get(a) ?? 1e9) - (tagOrder.get(b) ?? 1e9))
      .map((tag) => ({
        tag,
        stds: cur.tags ? stdsOf.get(tag)! : stdsOf.get(tag)!.filter((c) => cur.members.some((m) => m.cells[c])),
      }));
  }, [cur, stdsOf, unitOfStd, tagOrder]);
  const allStds = columns.flatMap((c) => c.stds);
  const ownOnly = (cur?.tags ?? []).filter((t) => !stdsOf.get(t)?.length);

  const detail = pick && data ? { s: data.find((x) => x.id === pick.sid)!, std: pick.std } : null;
  const dc = detail ? detail.s?.cells[detail.std] ?? NONE : null;

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>📈 성취기준 현황 <span style={{ fontSize: 11.5, fontWeight: 400, color: "#888" }}>칸 하나 = 성취기준 하나 · 기본 문제 풀이 기록 전체</span></div>
      <div style={{ fontSize: 11.5, color: "#666", marginBottom: 8, lineHeight: 1.7 }}>
        <b style={{ color: "#1b7a4a" }}>통과</b> = 쉬움·보통·어려움을 각각 1번 이상 맞히고 최근 {MASTERY_RULE.recentPass}번 중 {MASTERY_RULE.needPass}번 이상 정답 ·
        <b style={{ color: "#c0392b" }}> 도움 필요</b> = 최근 {MASTERY_RULE.recentHelp}번 중 정답이 ⅓ 이하
      </div>
      {!data ? <div style={{ ...T.card, textAlign: "center", color: "#888", fontSize: 13, padding: 20 }}>불러오는 중…</div>
        : choices.length === 0 ? <div style={{ ...T.card, textAlign: "center", color: "#888", fontSize: 13, padding: 20 }}>아직 학생이 없어요.</div>
        : (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {choices.map((c) => (
              <button key={c.key} onClick={() => { setSel(c.key); setPick(null); }}
                style={{ ...T.chip, display: "inline-flex", alignItems: "center", gap: 5, ...(sel === c.key ? { borderColor: "#1f8a8a", color: "#1f8a8a", background: "#eef8f7", fontWeight: 700 } : {}) }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.color }} />{c.label} <span style={{ color: "#999", fontWeight: 400 }}>{c.members.length}명</span>
              </button>
            ))}
          </div>
          {cur && cur.members.length === 0 && <div style={{ ...T.card, fontSize: 12.5, color: "#888" }}>이 모둠에 아직 학생이 없어요.</div>}
          {cur && cur.members.length > 0 && columns.length === 0 && (
            <div style={{ ...T.card, fontSize: 12.5, color: "#888" }}>
              {cur.tags ? "이 범위에는 성취기준이 있는 기본 문제 단원이 없어요." : "아직 기본 문제를 푼 기록이 없어요."}
            </div>
          )}
          {cur && cur.members.length > 0 && columns.length > 0 && (
            <div style={{ ...T.card, padding: "10px 10px 6px", overflowX: "auto" }}>
              <table style={{ borderCollapse: "separate", borderSpacing: 2, fontSize: 11.5 }}>
                <thead>
                  <tr>
                    <th />
                    {columns.map((c) => (
                      <th key={c.tag} colSpan={c.stds.length} title={c.tag}
                        style={{ fontWeight: 600, color: "#555", textAlign: "left", padding: "0 4px 2px", borderBottom: "2px solid #e6e9f0", whiteSpace: "nowrap", maxWidth: Math.max(60, c.stds.length * 24), overflow: "hidden", textOverflow: "ellipsis" }}>
                        {unitName.get(c.tag)?.split("·")[1] ?? c.tag}
                      </th>
                    ))}
                    <th style={{ paddingLeft: 8, color: "#555", whiteSpace: "nowrap" }}>통과</th>
                  </tr>
                </thead>
                <tbody>
                  {cur.members.map((m) => {
                    const passed = allStds.filter((c) => m.cells[c]?.st === "passed").length;
                    return (
                      <tr key={m.id}>
                        <td style={{ paddingRight: 8, whiteSpace: "nowrap", fontWeight: 600 }}>{m.nickname}</td>
                        {columns.flatMap((c) => c.stds.map((std) => {
                          const cell = m.cells[std] ?? NONE;
                          const on = pick?.sid === m.id && pick.std === std;
                          return (
                            <td key={std} onClick={() => setPick(on ? null : { sid: m.id, std })}
                              title={`${std} ${texts[std] ?? ""}\n${STATUS_LABEL[cell.st]}${cell.n ? ` · ${cell.c}/${cell.n} 정답` : ""}`}
                              style={{ width: 20, minWidth: 20, height: 20, borderRadius: 4, cursor: "pointer", background: STATUS_COLOR[cell.st], outline: on ? "2px solid #1c1c1e" : "none" }} />
                          );
                        }))}
                        <td style={{ paddingLeft: 8, whiteSpace: "nowrap" }}><b>{passed}</b><span style={{ color: "#999" }}>/{allStds.length}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#666", marginTop: 8, flexWrap: "wrap" }}>
                {(["passed", "learning", "help", "none"] as MasteryStatus[]).map((s) => (
                  <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: STATUS_COLOR[s] }} />{STATUS_LABEL[s]}
                  </span>
                ))}
                <span style={{ color: "#999" }}>· 칸을 누르면 자세히 볼 수 있어요</span>
              </div>
            </div>
          )}
          {ownOnly.length > 0 && (
            <div style={{ fontSize: 11.5, color: "#888", marginTop: 4 }}>✏️ 우리 반 문제 단원({ownOnly.join(", ")})은 성취기준이 없어 현황표에서 빠져요.</div>
          )}
          {detail && dc && (
            <div style={{ ...T.card, marginTop: 8, fontSize: 12.5, lineHeight: 1.7, border: `2px solid ${STATUS_COLOR[dc.st]}` }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <b>{detail.s.nickname}</b>
                <span style={{ padding: "1px 8px", borderRadius: 8, background: STATUS_COLOR[dc.st], color: dc.st === "none" || dc.st === "learning" ? "#1c1c1e" : "#fff", fontWeight: 700, fontSize: 11 }}>{STATUS_LABEL[dc.st]}</span>
                <span style={{ color: "#888" }}>{unitOfStd.get(detail.std)} · {detail.std}</span>
              </div>
              <div style={{ margin: "4px 0 6px" }}>{texts[detail.std] ?? ""}</div>
              {dc.n === 0 ? <div style={{ color: "#888" }}>아직 이 성취기준 문제를 풀지 않았어요.</div> : (
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                  <span>정답 <b>{dc.c}</b>/{dc.n}</span>
                  <span>맞힌 수준: {[["E", "쉬움"], ["M", "보통"], ["H", "어려움"]].map(([k, l]) => (
                    <span key={k} style={{ marginRight: 6, color: dc.lv.includes(k) ? "#1b7a4a" : "#bbb", fontWeight: 600 }}>{dc.lv.includes(k) ? "✓" : "✗"} {l}</span>
                  ))}</span>
                  <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>최근:
                    {dc.recent.map((ok, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: ok ? "#34c759" : "#ff6b6b" }} />)}
                  </span>
                  {dc.passedAt && <span style={{ color: "#1b7a4a" }}>통과: {new Date(dc.passedAt).toLocaleDateString("ko-KR")}</span>}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
