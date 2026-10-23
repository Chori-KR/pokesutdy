"use client";

import { useEffect, useMemo, useState } from "react";
import { T } from "@/lib/styles";
import { DIFF } from "@/lib/game";
import { LibIndexUnit, LibSettings, normalizeLibSettings } from "@/lib/libraryShared";
import { ClientLibQuestion, loadUnitQuestions, useLibIndex } from "@/lib/libIndexClient";
import { PassageBox, SvgImage } from "@/components/student/QuestionMedia";
import MathText from "@/components/MathText";

// 📚 기본 문제 — 모든 학급이 함께 쓰는 원본(앱에 들어 있음). 우리 반에 복사하지 않는다.
// 단원 스위치를 켜면 그 단원 문제가 배틀·문제풀이에 나오고, 문제마다 숨기기·레이드 지정·우리 반용으로 고치기.
// 저장되는 것은 학급 설정의 libUnits / libHidden / libRaid 목록뿐이다.

interface Props {
  lib: LibSettings;
  saveLib: (patch: Partial<LibSettings>) => Promise<boolean>;
  onCopyEdit: (q: ClientLibQuestion) => Promise<void>;
}

const ACCENT = "#1f8a8a";
const CIRCLED = ["①", "②", "③", "④"];
const PAGE = 60;

function Switch({ on, onClick, title, small }: { on: boolean; onClick: () => void; title?: string; small?: boolean }) {
  const w = small ? 32 : 40, h = small ? 17 : 21, k = h - 4;
  return (
    <span onClick={onClick} title={title} role="switch" aria-checked={on}
      style={{ position: "relative", width: w, height: h, background: on ? ACCENT : "#ccc", borderRadius: h, cursor: "pointer", flexShrink: 0, display: "inline-block" }}>
      <span style={{ position: "absolute", top: 2, left: on ? w - k - 2 : 2, width: k, height: k, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
    </span>
  );
}

const bandLabel = (b: string) => b.replace("초", "초등 ").replace("중", "중학 ") + "학년";

export default function LibraryBank({ lib, saveLib, onCopyEdit }: Props) {
  const index = useLibIndex();
  const ls = normalizeLibSettings(lib);
  const on = useMemo(() => new Set(ls.libUnits), [ls.libUnits]);
  const hidden = useMemo(() => new Set(ls.libHidden), [ls.libHidden]);
  const raid = useMemo(() => new Set(ls.libRaid), [ls.libRaid]);
  const [band, setBand] = useState("");
  const [unit, setUnit] = useState<LibIndexUnit | null>(null);
  const [qs, setQs] = useState<ClientLibQuestion[] | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [openMedia, setOpenMedia] = useState<string | null>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => { if (index && !band) setBand(index.bands[0]?.band ?? ""); }, [index, band]);
  useEffect(() => {
    setQs(null); setLimit(PAGE);
    if (index && unit) loadUnitQuestions(index, unit).then(setQs);
  }, [index, unit]);

  if (!index) return <div style={{ ...T.card, textAlign: "center", color: "#888", fontSize: 13, padding: 24 }}>기본 문제를 불러오는 중…</div>;

  const allUnits = index.bands.flatMap((b) => b.subjects.flatMap((s) => s.units));
  const onUnits = allUnits.filter((u) => on.has(u.tag));
  const onCount = onUnits.reduce((n, u) => n + u.count, 0);

  async function setUnits(tags: string[], turnOn: boolean) {
    const next = new Set(on);
    for (const t of tags) (turnOn ? next.add(t) : next.delete(t));
    await saveLib({ libUnits: [...next] });
  }
  const toggleIn = (key: "libHidden" | "libRaid", cur: Set<string>, id: string) => {
    const next = new Set(cur);
    if (next.has(id)) next.delete(id); else next.add(id);
    return saveLib({ [key]: [...next] });
  };

  // ── 단원 문제 보기 ──
  if (unit) {
    const unitOn = on.has(unit.tag);
    const shownHidden = (qs ?? []).filter((q) => hidden.has(q.id)).length;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "2px 0 10px", fontSize: 13 }}>
          <button onClick={() => setUnit(null)} style={{ ...T.chip, fontSize: 12.5 }}>‹ 단원 목록</button>
          <span style={{ color: "#666" }}>{bandLabel(band)} › {unit.tag.split("·")[0]} ›</span>
          <b>{unit.unit}</b><span style={{ color: "#888" }}>({unit.count}문제)</span>
          <Switch on={unitOn} onClick={() => setUnits([unit.tag], !unitOn)} />
          <span style={{ fontSize: 12, color: unitOn ? ACCENT : "#999", fontWeight: 700 }}>{unitOn ? "단원 켜짐 — 반 전체에 출제" : "단원 꺼짐"}</span>
        </div>
        <div style={{ ...T.card, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#555", lineHeight: 1.7 }}>
          문제마다 <b>스위치로 우리 반에서 숨기기</b>, <b>🛡️ 레이드 지정</b>(평소엔 안 나오고 레이드에만)을 할 수 있어요.
          기본 문제는 지울 수 없고, 고치려면 <b>✏️ 우리 반용으로 고치기</b>(복사본을 만들어 고침)를 눌러요.
          {shownHidden > 0 && <> · 숨긴 문제 <b>{shownHidden}개</b></>}
        </div>
        {busy && <div style={{ fontSize: 12, color: "#3d6fd9", marginBottom: 8 }}>{busy}</div>}
        {!qs && <div style={{ ...T.card, textAlign: "center", color: "#888", fontSize: 13, padding: 24 }}>문제를 불러오는 중…</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(qs ?? []).slice(0, limit).map((q) => {
            const isHidden = hidden.has(q.id), isRaid = raid.has(q.id);
            const hasMedia = !!q.svg || !!q.passage;
            return (
              <div key={q.id} style={{ ...T.card, opacity: isHidden ? 0.5 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {q.svg && <div style={{ maxWidth: 420 }}><SvgImage svg={q.svg} maxHeight={170} /></div>}
                    <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 5, whiteSpace: "pre-wrap" }}><MathText>{q.body}</MathText></div>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      {q.type === "short" ? (
                        <span style={{ color: "#0f6e56", fontWeight: 600 }}>정답: {q.options.join(" / ")}</span>
                      ) : (
                        q.options.map((o, i) => (
                          <span key={i} style={{ marginRight: 8, color: i === q.answer_idx ? "#0f6e56" : "#999", fontWeight: i === q.answer_idx ? 600 : 400 }}>
                            {CIRCLED[i]} <MathText>{o}</MathText>
                          </span>
                        ))
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", fontSize: 10, flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 7px", borderRadius: 9, background: "#e3f4f2", color: "#1f7a74", fontWeight: 700 }}>📚 기본 문제</span>
                      <span style={{ padding: "2px 7px", borderRadius: 9, background: q.type === "short" ? "#fff3e0" : "#e8f0ff", color: q.type === "short" ? "#b26a00" : "#3d6fd9", fontWeight: 700 }}>
                        {q.type === "short" ? "✏️ 단답형" : "🔘 4지선다"}
                      </span>
                      <span style={{ padding: "2px 7px", borderRadius: 9, background: DIFF[q.difficulty].bg, color: DIFF[q.difficulty].fg }}>{DIFF[q.difficulty].label}</span>
                      {isRaid && <span style={{ padding: "2px 7px", borderRadius: 9, background: "#fdeee0", color: "#c0651e", fontWeight: 700 }}>🛡️ 레이드 전용</span>}
                      {isHidden && <span style={{ padding: "2px 7px", borderRadius: 9, background: "#eee", color: "#888" }}>우리 반에서 숨김</span>}
                      {q.passage && (
                        <span onClick={() => setOpenMedia(openMedia === q.id ? null : q.id)}
                          style={{ padding: "2px 7px", borderRadius: 9, background: "#f3ecff", color: "#6a45c2", fontWeight: 700, cursor: "pointer" }}>
                          📖 지문{q.passage.title ? `: ${q.passage.title}` : ""} ({q.passage.body.length}자)
                        </span>
                      )}
                    </div>
                    {hasMedia && q.passage && openMedia === q.id && (
                      <div style={{ marginTop: 8, maxWidth: 520 }}>
                        <PassageBox passage={{ id: q.passage.key, title: q.passage.title, body: q.passage.body, source: q.passage.source, svg: q.passage.svg }} maxHeight="320px" />
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <Switch small on={!isHidden} onClick={() => toggleIn("libHidden", hidden, q.id)} title={isHidden ? "숨김 (클릭해서 다시 출제)" : "출제 (클릭해서 우리 반에서 숨김)"} />
                    <button onClick={() => toggleIn("libRaid", raid, q.id)} title="레이드 전용 지정/해제"
                      style={{ ...T.smallBtn, border: isRaid ? "1px solid #e0a06a" : "1px solid #d9dde6", color: isRaid ? "#c0651e" : "#8890a0", background: isRaid ? "#fdf3ea" : "#fff" }}>
                      🛡️ 레이드{isRaid ? " ✓" : ""}
                    </button>
                    <button disabled={!!busy}
                      onClick={async () => { setBusy("우리 반용 복사본을 만드는 중…"); try { await onCopyEdit(q); } finally { setBusy(""); } }}
                      style={{ ...T.smallBtn, border: "1px solid #b9dcd8", color: "#1f7a74", whiteSpace: "nowrap" }}>
                      ✏️ 우리 반용으로 고치기
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {qs && qs.length > limit && (
            <button onClick={() => setLimit(limit + PAGE)} style={{ ...T.secondaryBtn, alignSelf: "center", marginTop: 4 }}>더 보기 ({limit}/{qs.length})</button>
          )}
        </div>
      </div>
    );
  }

  // ── 단원 목록 ──
  const cur = index.bands.find((b) => b.band === band);
  return (
    <div>
      <div style={{ fontSize: 12, lineHeight: 1.7, background: "#eef8f7", border: "1px solid #bfe3df", color: "#22524e", borderRadius: 12, padding: "9px 12px", marginBottom: 10 }}>
        📚 <b>기본 문제는 모든 학급이 함께 쓰는 원본</b>이라 우리 반 용량을 차지하지 않아요.
        <b> 단원 스위치를 켜면</b> 그 단원 문제가 배틀·문제풀이에 나오고, 끄면 안 나와요.<br />
        지금 <b>{onUnits.length}개 단원 · {onCount.toLocaleString()}문제</b>를 켜 두었어요.
        학생마다 다른 단원을 공부하게 하려면 <b>학생·통계 → 🎯 학습 범위</b>에서 정해요.
      </div>
      {onUnits.length === 0 && (
        <div style={{ ...T.card, padding: "12px 14px", marginBottom: 10, background: "#fffbea", border: "1px solid #f3dd8a", fontSize: 13, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span>아직 켠 단원이 없어요. 전부 켜 두고 안 쓰는 학년·과목만 끄면 편해요.</span>
          <button onClick={() => setUnits(allUnits.map((u) => u.tag), true)} style={{ ...T.primaryBtn, background: ACCENT }}>
            전체 단원 켜기 ({index.total.toLocaleString()}문제)
          </button>
        </div>
      )}
      <div style={{ ...T.card, padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
          {index.bands.map((b) => {
            const n = b.subjects.flatMap((s) => s.units).filter((u) => on.has(u.tag)).length;
            const sel = band === b.band;
            return (
              <button key={b.band} onClick={() => setBand(b.band)}
                style={{ ...T.chip, padding: "7px 14px", fontSize: 13, ...(sel ? { borderColor: ACCENT, color: ACCENT, background: "#eef8f7", fontWeight: 700 } : {}) }}>
                {bandLabel(b.band)}<span style={{ fontSize: 11, color: "#999", marginLeft: 4, fontWeight: 400 }}>{b.count.toLocaleString()}</span>
                {n > 0 && <span style={{ marginLeft: 5, padding: "0 6px", borderRadius: 8, background: ACCENT, color: "#fff", fontSize: 10.5 }}>{n}</span>}
              </button>
            );
          })}
          {cur && (
            <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <button onClick={() => setUnits(cur.subjects.flatMap((s) => s.units.map((u) => u.tag)), true)} style={{ ...T.chip, color: "#0f6e56" }}>이 학년 모두 켜기</button>
              <button onClick={() => setUnits(cur.subjects.flatMap((s) => s.units.map((u) => u.tag)), false)} style={{ ...T.chip, color: "#a32d2d" }}>모두 끄기</button>
            </span>
          )}
        </div>
        {cur?.subjects.map((s) => {
          const n = s.units.filter((u) => on.has(u.tag)).length;
          const groups = [...new Set(s.units.map((u) => u.group))];
          return (
            <div key={s.subject} style={{ border: "1px solid #e6e9f0", borderRadius: 12, padding: "8px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "2px 0 4px", flexWrap: "wrap" }}>
                <b style={{ fontSize: 14 }}>{s.subject}</b>
                <span style={{ fontSize: 11.5, color: "#888" }}>단원 {s.units.length}개 · {s.count}문제{n ? ` · 켬 ${n}` : ""}</span>
                <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                  <button onClick={() => setUnits(s.units.map((u) => u.tag), true)} style={{ ...T.chip, fontSize: 11, padding: "2px 9px", color: "#0f6e56" }}>모두 켜기</button>
                  <button onClick={() => setUnits(s.units.map((u) => u.tag), false)} style={{ ...T.chip, fontSize: 11, padding: "2px 9px", color: "#a32d2d" }}>모두 끄기</button>
                </span>
              </div>
              {groups.map((g) => (
                <div key={g}>
                  {g && <div style={{ fontSize: 11, color: "#888", margin: "6px 0 0 2px" }}>{g}</div>}
                  {s.units.filter((u) => u.group === g).map((u) => {
                    const uo = on.has(u.tag);
                    return (
                      <div key={u.tag} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 2px", borderTop: "1px dashed #eee", fontSize: 13 }}>
                        <Switch on={uo} onClick={() => setUnits([u.tag], !uo)} />
                        <span style={{ flex: 1, color: uo ? "var(--ink)" : "#999" }}>{u.unit}</span>
                        <span style={{ fontSize: 11.5, color: "#888" }}>{u.count}문제{u.passage ? " 📖" : ""}{u.svg ? " 🖼️" : ""}</span>
                        <button onClick={() => setUnit(u)} style={{ fontSize: 12, color: "#4b7bec", background: "none", border: "none", cursor: "pointer", padding: 0 }}>문제 보기 ›</button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
