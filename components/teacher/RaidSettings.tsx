"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/styles";
import { POOL, TYPE_COLORS, BALLS, SNACKS, EVO_STONE, SPRAY, DEFAULT_RAID_THRESHOLD, DEFAULT_RAID_REWARD_PTS } from "@/lib/game";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { teacherFetch } from "@/lib/teacherClient";
import Sprite from "@/components/Sprite";
import type { ClassRow } from "@/components/teacher/TeacherHome";

interface Props {
  cls: ClassRow;
  setCls: (c: ClassRow) => void;
  showToast: (t: string) => void;
}

const REWARD_ITEMS: [string, string][] = [
  ["", "아이템 없음"],
  ...Object.entries(BALLS).map(([k, v]) => [k, v.name] as [string, string]),
  ["stone", EVO_STONE.name],
  ["spray", SPRAY.name],
  ...Object.entries(SNACKS).map(([k, v]) => [k, v.name] as [string, string]),
];

// 레이드(형성평가) 설정: 보스 선택 + 이로치 + 협동 인원 기준 + 승리 보상 + 실시/종료 + 신청 현황.
export default function RaidSettings({ cls, setCls, showToast }: Props) {
  const raid = cls.settings?.raid ?? {};
  const [pid, setPid] = useState<number>(Number(raid.pid ?? 1));
  const [shiny, setShiny] = useState<boolean>(raid.shiny === true);
  const [threshold, setThreshold] = useState<number>(Number(raid.threshold ?? DEFAULT_RAID_THRESHOLD));
  const [rewardPts, setRewardPts] = useState<number>(Number(raid.rewardPts ?? DEFAULT_RAID_REWARD_PTS));
  const [rewardItem, setRewardItem] = useState<string>(String(raid.rewardItem ?? ""));
  const [rewardCount, setRewardCount] = useState<number>(Number(raid.rewardCount ?? 1));
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [reqs, setReqs] = useState<{ list: { pid: number; count: number }[]; total: number; winCount: number; studentTotal: number } | null>(null);

  const on = raid.on === true;
  const round = Number(raid.round ?? 0);

  const loadReqs = async () => {
    try { const res = await teacherFetch("/api/teacher/raid-requests"); if (res.ok) setReqs(await res.json()); } catch { /* 무시 */ }
  };
  useEffect(() => { loadReqs(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [round]);

  async function save(next: Record<string, unknown>) {
    setBusy(true);
    const settings = { ...cls.settings, raid: next };
    const { error } = await supabaseBrowser().from("classes").update({ settings }).eq("id", cls.id);
    setBusy(false);
    if (error) { showToast("저장에 실패했어요."); return false; }
    setCls({ ...cls, settings });
    return true;
  }

  const rewardFields = () => ({ threshold: Math.max(1, threshold), rewardPts: Math.max(0, rewardPts), rewardItem, rewardCount: Math.max(0, rewardCount) });

  async function startRaid() {
    const ok = await save({ on: true, pid, shiny, round: round + 1, ...rewardFields() });
    if (ok) { showToast(`${POOL[pid - 1].name} 레이드를 실시했어요!`); setReqs(null); }
  }
  async function endRaid() {
    const ok = await save({ on: false, pid: Number(raid.pid ?? pid), shiny, round, ...rewardFields() });
    if (ok) showToast("레이드를 종료했어요.");
  }
  async function saveReward() {
    const ok = await save({ on, pid: Number(raid.pid ?? pid), shiny: raid.shiny === true, round, ...rewardFields() });
    if (ok) showToast("보상 설정을 저장했어요.");
  }

  const filtered = search.trim()
    ? POOL.filter((p) => p.name.includes(search.trim()) || String(p.id) === search.trim())
    : POOL;
  const bossPid = on ? Number(raid.pid ?? 1) : pid;

  return (
    <div style={T.card}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>⚔️ 레이드 (형성평가)</div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 10, lineHeight: 1.6 }}>
        보스의 <b>체력을 문제 10개</b>로 깎으면 성공. 반에서 기준 인원 이상 성공하면 그 포켓몬이 <b>모두에게 지급</b>돼요. 재도전 가능.
      </div>

      {/* 현재 상태 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: on ? "#eef6ee" : "#f4f4f4", marginBottom: 12 }}>
        <Sprite id={bossPid} color={TYPE_COLORS[POOL[bossPid - 1].type]} size={46} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{on ? `진행 중: ${POOL[Number(raid.pid ?? 1) - 1].name}` : "레이드 꺼짐"}{on && raid.shiny && " ✨"}</div>
          <div style={{ fontSize: 11, color: "#888" }}>
            {on ? (reqs ? `성공 ${reqs.winCount}/${threshold}명 · 참여 ${reqs.studentTotal}명` : "학생들이 도전 중") : "아래에서 보스를 골라 실시하세요."}
          </div>
        </div>
        {on && <button onClick={endRaid} disabled={busy} style={{ ...T.secondaryBtn, padding: "6px 12px", fontSize: 12 }}>종료</button>}
      </div>

      {/* 학생 신청 현황 */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>학생 신청 현황 {reqs ? `(${reqs.total}명)` : ""}</div>
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

      {/* 협동 인원 + 보상 */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>협동 목표 & 승리 보상</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>기준 인원을 채워야 포켓몬 지급 + 성공자 보상이 나가요. (기준 미달이면 성공해도 보상 없음)</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
          <span>지급 인원 기준(명) <span style={{ fontSize: 11, color: "#888" }}>이 인원 성공 시 모두에게 지급</span></span>
          <input type="number" min={1} max={99} value={threshold} onChange={(e) => setThreshold(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} style={{ ...T.input, width: 64, textAlign: "center", flexShrink: 0 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
          <span>승리자 추가 포인트</span>
          <input type="number" min={0} max={100000} value={rewardPts} onChange={(e) => setRewardPts(Math.max(0, Number(e.target.value) || 0))} style={{ ...T.input, width: 80, textAlign: "center", flexShrink: 0 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, marginBottom: 8, gap: 6 }}>
          <span>승리자 추가 아이템</span>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <select value={rewardItem} onChange={(e) => setRewardItem(e.target.value)} style={{ ...T.input, width: 120 }}>
              {REWARD_ITEMS.map(([k, name]) => <option key={k} value={k}>{name}</option>)}
            </select>
            <input type="number" min={0} max={99} value={rewardCount} onChange={(e) => setRewardCount(Math.max(0, Math.min(99, Number(e.target.value) || 0)))} disabled={!rewardItem} style={{ ...T.input, width: 56, textAlign: "center", opacity: rewardItem ? 1 : 0.4 }} />
          </div>
        </div>
        <button onClick={saveReward} disabled={busy} style={{ ...T.secondaryBtn, width: "100%", fontSize: 12, marginTop: 2 }}>보상·인원 설정만 저장</button>
      </div>

      {/* 보스 선택 */}
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>레이드 포켓몬 선택</div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름 또는 번호로 검색" style={{ ...T.input, width: "100%", marginBottom: 8 }} />
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
        <span>✨ 이로치로 지급 <span style={{ fontSize: 11, color: "#888" }}>(지급되는 포켓몬이 이로치)</span></span>
        <span onClick={() => setShiny((v) => !v)} style={{ position: "relative", width: 40, height: 21, background: shiny ? "#f0a500" : "#ccc", borderRadius: 11, cursor: "pointer", flexShrink: 0 }}>
          <span style={{ position: "absolute", top: 2, left: shiny ? 21 : 2, width: 17, height: 17, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
        </span>
      </label>

      <button onClick={startRaid} disabled={busy} style={{ ...T.primaryBtn, width: "100%" }}>
        {on ? `${POOL[pid - 1].name}(으)로 레이드 다시 실시` : `${POOL[pid - 1].name}(으)로 레이드 실시하기`}
      </button>
      <div style={{ fontSize: 11, color: "#999", marginTop: 8, lineHeight: 1.6 }}>
        실시하면 학생 신청·성공 기록이 초기화되고, 학생들은 다음 레이드 포켓몬을 다시 신청할 수 있어요.
      </div>
    </div>
  );
}
