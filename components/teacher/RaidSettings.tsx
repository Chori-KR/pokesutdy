"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/styles";
import { POOL, TYPE_COLORS } from "@/lib/game";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { teacherFetch } from "@/lib/teacherClient";
import Sprite from "@/components/Sprite";
import type { ClassRow } from "@/components/teacher/TeacherHome";

interface Props {
  cls: ClassRow;
  setCls: (c: ClassRow) => void;
  showToast: (t: string) => void;
}

// 레이드(형성평가) 설정: 151마리 중 보스 선택 + 이로치 지급 여부 + 실시/종료.
// 학생 신청 현황(원하는 레이드 포켓몬)을 집계해 보여줘 의견을 반영할 수 있게 한다.
export default function RaidSettings({ cls, setCls, showToast }: Props) {
  const raid = cls.settings?.raid ?? {};
  const [pid, setPid] = useState<number>(Number(raid.pid ?? 1));
  const [shiny, setShiny] = useState<boolean>(raid.shiny === true);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [reqs, setReqs] = useState<{ list: { pid: number; count: number }[]; total: number } | null>(null);

  const on = raid.on === true;
  const round = Number(raid.round ?? 0);

  const loadReqs = async () => {
    try {
      const res = await teacherFetch("/api/teacher/raid-requests");
      if (res.ok) setReqs(await res.json());
    } catch { /* 무시 */ }
  };
  useEffect(() => { loadReqs(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [round]);

  async function saveRaid(next: { on: boolean; pid: number; shiny: boolean; round: number }) {
    setBusy(true);
    const settings = { ...cls.settings, raid: next };
    const { error } = await supabaseBrowser().from("classes").update({ settings }).eq("id", cls.id);
    setBusy(false);
    if (error) { showToast("저장에 실패했어요."); return; }
    setCls({ ...cls, settings });
  }

  async function startRaid() {
    await saveRaid({ on: true, pid, shiny, round: round + 1 });
    showToast(`${POOL[pid - 1].name} 레이드를 실시했어요!`);
    setReqs(null); // 새 라운드 → 신청 현황 초기화(다시 로드는 round 변경 effect가)
  }
  async function endRaid() {
    await saveRaid({ on: false, pid, shiny, round });
    showToast("레이드를 종료했어요.");
  }

  const filtered = search.trim()
    ? POOL.filter((p) => p.name.includes(search.trim()) || String(p.id) === search.trim())
    : POOL;

  return (
    <div style={T.card}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>⚔️ 레이드 (형성평가)</div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 10, lineHeight: 1.6 }}>
        단원·주 마무리용 보스 배틀. 학생은 <b>문제 10개</b>를 맞혀야 이기고 포획 기회를 얻어요. 재도전 가능.
      </div>

      {/* 현재 상태 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: on ? "#eef6ee" : "#f4f4f4", marginBottom: 12 }}>
        <Sprite id={on ? Number(raid.pid ?? 1) : pid} color={TYPE_COLORS[POOL[(on ? Number(raid.pid ?? 1) : pid) - 1].type]} size={46} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {on ? `진행 중: ${POOL[Number(raid.pid ?? 1) - 1].name}` : "레이드 꺼짐"}
            {on && raid.shiny && " ✨"}
          </div>
          <div style={{ fontSize: 11, color: "#888" }}>{on ? "학생들이 지금 도전할 수 있어요." : "아래에서 보스를 골라 실시하세요."}</div>
        </div>
        {on && (
          <button onClick={endRaid} disabled={busy} style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12 }}>종료</button>
        )}
      </div>

      {/* 학생 신청 현황 */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>학생 신청 현황 {reqs ? `(${reqs.total}명 신청)` : ""}</div>
          <button onClick={loadReqs} style={{ ...T.secondaryBtn, padding: "3px 10px", fontSize: 11 }}>새로고침</button>
        </div>
        {reqs && reqs.list.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {reqs.list.map(({ pid: rp, count }) => (
              <div key={rp} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <Sprite id={rp} color={TYPE_COLORS[POOL[rp - 1].type]} size={30} />
                <span style={{ flex: 1 }}>{POOL[rp - 1].name}</span>
                <span style={{ color: "#3d6fd9", fontWeight: 700 }}>{count}표</span>
                <button onClick={() => { setPid(rp); showToast(`${POOL[rp - 1].name} 선택됨`); }} style={{ ...T.secondaryBtn, padding: "3px 10px", fontSize: 11 }}>선택</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "#aaa", padding: "6px 0" }}>아직 신청한 학생이 없어요. (레이드를 실시하면 신청이 초기화돼요)</div>
        )}
      </div>

      {/* 보스 선택 */}
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>레이드 포켓몬 선택</div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름 또는 번호로 검색"
        style={{ ...T.input, width: "100%", marginBottom: 8 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))", gap: 5, maxHeight: 220, overflowY: "auto", marginBottom: 12 }}>
        {filtered.map((p) => {
          const sel = pid === p.id;
          return (
            <button key={p.id} onClick={() => setPid(p.id)}
              style={{ padding: 3, borderRadius: 8, cursor: "pointer", background: sel ? "#dbe7ff" : "#fafafa", border: sel ? "2px solid #3d6fd9" : "1px solid #e5e5e5", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Sprite id={p.id} color={TYPE_COLORS[p.type]} size={38} />
              <div style={{ fontSize: 8, color: "#666" }}>{p.name}</div>
            </button>
          );
        })}
      </div>

      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, marginBottom: 12 }}>
        <span>✨ 이로치로 지급 <span style={{ fontSize: 11, color: "#888" }}>(이 레이드에서 잡으면 이로치 확정)</span></span>
        <span onClick={() => setShiny((v) => !v)} style={{ position: "relative", width: 40, height: 21, background: shiny ? "#f0a500" : "#ccc", borderRadius: 11, cursor: "pointer", flexShrink: 0 }}>
          <span style={{ position: "absolute", top: 2, left: shiny ? 21 : 2, width: 17, height: 17, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
        </span>
      </label>

      <button onClick={startRaid} disabled={busy} style={{ ...T.primaryBtn, width: "100%" }}>
        {on ? `${POOL[pid - 1].name}(으)로 레이드 다시 실시` : `${POOL[pid - 1].name}(으)로 레이드 실시하기`}
      </button>
      <div style={{ fontSize: 11, color: "#999", marginTop: 8, lineHeight: 1.6 }}>
        실시하면 학생 신청이 초기화되고, 학생들은 다음 레이드 포켓몬을 다시 신청할 수 있어요.
      </div>
    </div>
  );
}
