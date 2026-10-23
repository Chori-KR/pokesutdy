"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { T } from "@/lib/styles";
import { teacherFetch } from "@/lib/teacherClient";
import { GROUP_COLORS, LibSettings, StudyGroup, scopeOf } from "@/lib/libraryShared";
import { libUnitMap, useLibIndex } from "@/lib/libIndexClient";
import type { QuestionRow } from "@/components/teacher/QuestionBank";

// 🎯 학습 범위 (학습경로 1단계): 학생마다 공부할 단원을 다르게.
// 수준 모둠(기초·기본·도전…)을 만들어 단원을 고르고 학생을 넣는다. 한 학생만 따로 정할 수도 있다(개별 범위).
// 배틀·문제풀이는 각 학생의 범위 안에서만 나온다(레이드는 반 협동이라 모두 같음). 범위가 없으면 반 전체 범위.
// 저장: 학급 설정의 groups / studentGroups / studentTags.

interface Props {
  lib: LibSettings;
  saveLib: (patch: Partial<LibSettings>) => Promise<boolean>;
  questions: QuestionRow[]; // 우리 반 문제 — 그 단원도 범위로 고를 수 있게
  showToast: (t: string) => void;
}

interface StudentStat { id: string; nickname: string; byTag: { tag: string; total: number; correct: number }[] }

const ACCENT = "#1f8a8a";
const RECENT_DAYS = 14;
const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const bandLabel = (b: string) => b.replace("초", "초등 ").replace("중", "중학 ") + "학년";
const newId = () => Math.random().toString(36).slice(2, 10);

type Editing = { kind: "group"; id: string } | { kind: "student"; id: string } | null;

export default function ScopeTab({ lib, saveLib, questions, showToast }: Props) {
  const index = useLibIndex();
  const units = useMemo(() => libUnitMap(index), [index]);
  const groups = lib.groups ?? [];
  const studentGroups = lib.studentGroups ?? {};
  const studentTags = lib.studentTags ?? {};
  const [students, setStudents] = useState<StudentStat[] | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    const d = new Date(); d.setDate(d.getDate() - (RECENT_DAYS - 1));
    const res = await teacherFetch(`/api/teacher/stats?from=${isoDate(d)}&to=${isoDate(new Date())}`);
    const data = await res.json().catch(() => ({}));
    setStudents(res.ok ? data.students ?? [] : []);
  }, []);
  useEffect(() => { load(); }, [load]);

  // 우리 반 문제 단원(출제 중) — 기본 문제 은행에 없는 단원도 범위로 고를 수 있게
  const ownTags = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of questions) if (q.active && !q.raid_only) m.set(q.tag, (m.get(q.tag) ?? 0) + 1);
    return m;
  }, [questions]);
  const countOf = (tags: string[]) => tags.reduce((n, t) => n + (units.get(t)?.count ?? 0) + (ownTags.get(t) ?? 0), 0);

  async function saveGroups(next: StudyGroup[]) { await saveLib({ groups: next }); }
  async function addGroup() {
    const name = newName.trim() || `모둠 ${groups.length + 1}`;
    await saveGroups([...groups, { id: newId(), name, color: GROUP_COLORS[groups.length % GROUP_COLORS.length], tags: [] }]);
    setNewName("");
    showToast(`'${name}'을(를) 만들었어요. 🎯 범위 정하기로 단원을 골라 주세요.`);
  }
  async function renameGroup(g: StudyGroup) {
    const name = prompt("모둠 이름", g.name)?.trim();
    if (name) await saveGroups(groups.map((x) => (x.id === g.id ? { ...x, name } : x)));
  }
  async function deleteGroup(g: StudyGroup) {
    if (!confirm(`'${g.name}'을(를) 지울까요? 이 모둠 학생들은 반 전체 범위로 돌아가요.`)) return;
    const sg = { ...studentGroups };
    for (const [sid, gid] of Object.entries(sg)) if (gid === g.id) delete sg[sid];
    await saveLib({ groups: groups.filter((x) => x.id !== g.id), studentGroups: sg });
  }
  // 학생 배정: "" = 모둠 없음, "__own" = 개별 범위, 그 외 = 모둠 id
  async function assign(sid: string, value: string) {
    const sg = { ...studentGroups }, st = { ...studentTags };
    if (value === "__own") {
      const cur = scopeOf(lib, sid);
      st[sid] = cur ? [...cur.tags] : [];
      await saveLib({ studentTags: st });
      setEditing({ kind: "student", id: sid });
      return;
    }
    delete st[sid];
    if (value) sg[sid] = value; else delete sg[sid];
    await saveLib({ studentGroups: sg, studentTags: st });
  }
  async function saveScope(tags: string[]) {
    if (!editing) return;
    if (editing.kind === "group") await saveGroups(groups.map((g) => (g.id === editing.id ? { ...g, tags } : g)));
    else await saveLib({ studentTags: { ...studentTags, [editing.id]: tags } });
    setEditing(null);
    showToast("공부 범위를 저장했어요. 학생 화면을 새로 열면 바로 적용돼요.");
  }

  const rateIn = (s: StudentStat, tags: string[] | null) => {
    const set = tags ? new Set(tags) : null;
    let total = 0, correct = 0;
    for (const t of s.byTag ?? []) if (!set || set.has(t.tag)) { total += t.total; correct += t.correct; }
    return { total, rate: total ? Math.round((correct / total) * 100) : null };
  };
  const nameOf = (sid: string) => students?.find((s) => s.id === sid)?.nickname ?? "학생";

  if (editing) {
    const g = editing.kind === "group" ? groups.find((x) => x.id === editing.id) : undefined;
    const initial = editing.kind === "group" ? g?.tags ?? [] : studentTags[editing.id] ?? [];
    const who = editing.kind === "group"
      ? (students ?? []).filter((s) => !studentTags[s.id] && studentGroups[s.id] === editing.id).map((s) => s.nickname)
      : [nameOf(editing.id)];
    return (
      <ScopePicker
        title={editing.kind === "group" ? `${g?.name ?? "모둠"}의 공부 범위 정하기` : `${nameOf(editing.id)} 학생의 개별 공부 범위`}
        color={g?.color ?? "#888"}
        who={who}
        initial={initial}
        ownTags={ownTags}
        onSave={saveScope}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const memberIds = (gid: string) => (students ?? []).filter((s) => !studentTags[s.id] && studentGroups[s.id] === gid);
  const noScope = (students ?? []).filter((s) => !scopeOf(lib, s.id));

  return (
    <div>
      <div style={{ fontSize: 12, lineHeight: 1.7, background: "#eef8f7", border: "1px solid #bfe3df", color: "#22524e", borderRadius: 12, padding: "9px 12px", marginBottom: 10 }}>
        🎯 <b>학생마다 공부할 범위를 다르게</b> 정할 수 있어요. 수준이 비슷한 학생끼리 <b>모둠</b>으로 묶어 한 번에 정하면 편해요.<br />
        · 배틀·문제풀이는 <b>각 학생의 범위 안에서만</b> 나와요 (레이드는 반 협동이라 모두 같은 문제)<br />
        · 모둠이 없는 학생은 <b>반 전체 범위</b>(📚 기본 문제에서 켠 단원 + 우리 반 문제)로 공부해요
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGroup()}
          placeholder="새 모둠 이름 (예: 기초 모둠)" style={{ ...T.input, flex: 1, minWidth: 160 }} />
        <button onClick={addGroup} style={{ ...T.primaryBtn, background: ACCENT }}>+ 모둠 만들기</button>
      </div>

      {groups.map((g) => {
        const members = memberIds(g.id);
        return (
          <div key={g.id} style={{ ...T.card, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: g.color, display: "inline-block" }} />
              <b style={{ fontSize: 15 }}>{g.name}</b>
              <span style={{ fontSize: 12, color: "#888" }}>학생 {members.length}명 · 단원 {g.tags.length}개 · {countOf(g.tags).toLocaleString()}문제</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button onClick={() => setEditing({ kind: "group", id: g.id })} style={{ ...T.chip, color: ACCENT, borderColor: "#b9dcd8", fontWeight: 700 }}>🎯 범위 정하기</button>
                <button onClick={() => renameGroup(g)} style={T.chip}>이름 바꾸기</button>
                <button onClick={() => deleteGroup(g)} style={{ ...T.chip, color: "#a32d2d" }}>삭제</button>
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
              {members.length === 0 && <span style={{ fontSize: 12, color: "#999" }}>아래 표에서 학생을 이 모둠에 넣어 주세요.</span>}
              {members.map((s) => <span key={s.id} style={{ background: "#f2f3f7", borderRadius: 999, padding: "3px 10px", fontSize: 12.5 }}>🧒 {s.nickname}</span>)}
            </div>
            <TagChips tags={g.tags} empty="아직 단원을 고르지 않았어요 — 이 모둠 학생에게는 문제가 나오지 않아요!" />
          </div>
        );
      })}
      {groups.length > 0 && (
        <div style={{ ...T.card, padding: "9px 14px", marginBottom: 8, fontSize: 12.5, color: "#666" }}>
          ⚪ <b>모둠 없음</b> — {noScope.length}명 (반 전체 범위로 공부){noScope.length ? `: ${noScope.map((s) => s.nickname).join(", ")}` : ""}
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: 14, margin: "14px 0 8px" }}>학생별 보기 <span style={{ fontSize: 11.5, fontWeight: 400, color: "#888" }}>정답률은 최근 {RECENT_DAYS}일, 공부 범위 안 단원만</span></div>
      {!students ? (
        <div style={{ ...T.card, textAlign: "center", color: "#888", fontSize: 13, padding: 20 }}>불러오는 중…</div>
      ) : students.length === 0 ? (
        <div style={{ ...T.card, textAlign: "center", color: "#888", fontSize: 13, padding: 20 }}>아직 가입한 학생이 없어요.</div>
      ) : (
        <div style={{ ...T.card, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--line)", color: "#666", textAlign: "left" }}>
                <th style={{ padding: "8px 10px" }}>학생</th><th style={{ padding: "8px 10px" }}>모둠</th>
                <th style={{ padding: "8px 10px" }}>공부 범위</th><th style={{ padding: "8px 10px" }}>범위 안 정답률</th><th />
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const sc = scopeOf(lib, s.id);
                const own = !!studentTags[s.id];
                const value = own ? "__own" : studentGroups[s.id] && groups.some((g) => g.id === studentGroups[s.id]) ? studentGroups[s.id] : "";
                const r = rateIn(s, sc ? sc.tags : null);
                return (
                  <tr key={s.id} style={{ borderTop: "1px solid var(--line)" }}>
                    <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>🧒 {s.nickname}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <select value={value} onChange={(e) => assign(s.id, e.target.value)} style={{ ...T.input, padding: "4px 8px", fontSize: 12 }}>
                        <option value="">모둠 없음 (반 전체)</option>
                        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        <option value="__own">개별 범위…</option>
                      </select>
                    </td>
                    <td style={{ padding: "8px 10px", color: "#555" }}>
                      {sc ? <>단원 {sc.tags.length}개 · {countOf(sc.tags).toLocaleString()}문제</> : <span style={{ color: "#999" }}>반 전체</span>}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      {r.rate === null ? <span style={{ color: "#999" }}>풀이 없음</span>
                        : <><b style={{ color: r.rate >= 80 ? "#1b7a4a" : r.rate < 40 ? "#b33" : "var(--ink)" }}>{r.rate}%</b> <span style={{ color: "#999" }}>· {r.total}회</span></>}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", whiteSpace: "nowrap" }}>
                      {own
                        ? <button onClick={() => setEditing({ kind: "student", id: s.id })} style={{ ...T.chip, color: ACCENT }}>개별 범위 고치기</button>
                        : <button onClick={() => assign(s.id, "__own")} style={T.chip}>개별로 정하기</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TagChips({ tags, empty }: { tags: string[]; empty: string }) {
  if (tags.length === 0) return <div style={{ fontSize: 12, color: "#b26a00" }}>⚠️ {empty}</div>;
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {tags.map((t) => <span key={t} style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 9, background: "#e3f4f2", color: "#1f7a74" }}>{t}</span>)}
    </div>
  );
}

// 단원 고르기 — 기본 문제 은행(학년 → 과목 → 단원) + 우리 반 문제 단원
function ScopePicker({ title, color, who, initial, ownTags, onSave, onCancel }: {
  title: string; color: string; who: string[]; initial: string[]; ownTags: Map<string, number>;
  onSave: (tags: string[]) => void; onCancel: () => void;
}) {
  const index = useLibIndex();
  const units = useMemo(() => libUnitMap(index), [index]);
  const [picked, setPicked] = useState<Set<string>>(new Set(initial));
  const [band, setBand] = useState("");
  useEffect(() => {
    if (!index || band) return;
    // 이미 고른 단원이 있는 학년부터 보여준다
    const first = index.bands.find((b) => b.subjects.some((s) => s.units.some((u) => picked.has(u.tag))));
    setBand((first ?? index.bands[0])?.band ?? "");
  }, [index, band, picked]);
  const toggle = (tags: string[], on: boolean) => {
    const next = new Set(picked);
    for (const t of tags) (on ? next.add(t) : next.delete(t));
    setPicked(next);
  };
  const extraOwn = [...ownTags.keys()].filter((t) => !units.has(t)).sort((a, b) => a.localeCompare(b, "ko"));
  const total = [...picked].reduce((n, t) => n + (units.get(t)?.count ?? 0) + (ownTags.get(t) ?? 0), 0);
  const cur = index?.bands.find((b) => b.band === band);
  const chip = (on: boolean) => ({ ...T.chip, fontSize: 12, padding: "5px 10px", ...(on ? { background: ACCENT, borderColor: ACCENT, color: "#fff" } : {}) });

  return (
    <div style={{ ...T.card, border: `2px solid ${ACCENT}` }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, display: "inline-block" }} />{title}
      </div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
        {who.length ? `${who.join(" · ")}` : "이 모둠 학생"}이(가) 공부할 단원을 골라 주세요. 학년을 넘나들어 골라도 돼요 (예: 초3-4 + 초5-6).
      </div>
      {!index ? <div style={{ color: "#888", fontSize: 13 }}>불러오는 중…</div> : (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {index.bands.map((b) => {
              const n = b.subjects.flatMap((s) => s.units).filter((u) => picked.has(u.tag)).length;
              return (
                <button key={b.band} onClick={() => setBand(b.band)}
                  style={{ ...T.chip, padding: "7px 14px", fontSize: 13, ...(band === b.band ? { borderColor: ACCENT, color: ACCENT, background: "#eef8f7", fontWeight: 700 } : {}) }}>
                  {bandLabel(b.band)}{n > 0 && <span style={{ marginLeft: 5, padding: "0 6px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 10.5 }}>{n}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {cur?.subjects.map((s) => {
              const all = s.units.map((u) => u.tag);
              const n = all.filter((t) => picked.has(t)).length;
              return (
                <div key={s.subject} style={{ border: "1px solid #e6e9f0", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, cursor: "pointer", marginBottom: 6 }}>
                    <input type="checkbox" checked={n === all.length} ref={(el) => { if (el) el.indeterminate = n > 0 && n < all.length; }}
                      onChange={(e) => toggle(all, e.target.checked)} />
                    {s.subject}<span style={{ fontSize: 11.5, fontWeight: 400, color: "#888" }}>단원 {s.units.length}개</span>
                  </label>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {s.units.map((u) => {
                      const on = picked.has(u.tag);
                      return (
                        <button key={u.tag} onClick={() => toggle([u.tag], !on)} title={u.tag} style={chip(on)}>
                          {on ? "✓ " : ""}{u.unit} <span style={{ fontSize: 10.5, opacity: 0.75 }}>{u.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {extraOwn.length > 0 && (
            <div style={{ border: "1px solid #e6dcfb", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>✏️ 우리 반 문제 단원</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {extraOwn.map((t) => {
                  const on = picked.has(t);
                  return <button key={t} onClick={() => toggle([t], !on)} style={chip(on)}>{on ? "✓ " : ""}{t} <span style={{ fontSize: 10.5, opacity: 0.75 }}>{ownTags.get(t)}</span></button>;
                })}
              </div>
            </div>
          )}
        </>
      )}
      <div style={{ fontSize: 11.5, color: "#888", margin: "4px 0 10px" }}>같은 단원의 ✏️ 우리 반 문제(직접 만든 문제)도 함께 나와요.</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => onSave([...picked])} style={{ ...T.primaryBtn, background: ACCENT }}>단원 {picked.size}개 · {total.toLocaleString()}문제로 저장</button>
        {picked.size > 0 && <button onClick={() => setPicked(new Set())} style={T.secondaryBtn}>모두 지우기</button>}
        <button onClick={onCancel} style={T.secondaryBtn}>취소</button>
      </div>
    </div>
  );
}
