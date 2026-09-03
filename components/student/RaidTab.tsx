"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { S } from "@/lib/styles";
import {
  POOL, TYPE_COLORS, BALLS, SNACKS, EVO_STONE, SPRAY,
  myPokemonOf, Move, Difficulty, TIME_LIMIT, RAID_BOSS_HP, RAID_HIT_DMG, MAX_HP, josa, shuffle, sleep, normalizeGens } from "@/lib/game";
import { ApiQuestion, StudentData, GameInfo } from "@/lib/types";
import Sprite from "@/components/Sprite";
import HpBar from "@/components/HpBar";
import ShinyFx from "@/components/student/ShinyFx";
import TypeFx from "@/components/student/TypeFx";
import TimerBar from "@/components/student/TimerBar";
import MathText from "@/components/MathText";
import { SFX, playCry, startRaidBgm, stopBattleBgm } from "@/lib/sound";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  game: GameInfo;
  timerOn: boolean;
  timeScale: number;
  caught: number[];
  setCaught: (v: number[]) => void;
  counts: Record<number, number>;
  setCounts: (v: Record<number, number>) => void;
  shinies: number[];
  setShinies: (v: number[]) => void;
  gens?: number[];   // 학급이 켠 세대
  showToast: (m: string) => void;
}

type ShuffledOption = { t: string; ok: boolean; idx: number };
interface ActiveQuestion extends ApiQuestion { sOpts: ShuffledOption[] }
type Phase = "idle" | "busy" | "select" | "question" | "done";
type RaidStatus = {
  on: boolean; pid: number; shiny: boolean; round: number; myReqPid: number | null;
  iWon: boolean; winCount: number; threshold: number; unlocked: boolean;
  justGranted: boolean; justRewarded: boolean;
  points: number; inventory: StudentData["inventory"];
  reward: { pts: number; item: string; count: number };
};
const COUNTER_DMG = 20; // 오답 시 보스의 반격 데미지

// 아이템 키 → 이름(보상 표시용)
function itemName(k: string): string {
  if (!k) return "";
  if (k in BALLS) return BALLS[k as keyof typeof BALLS].name;
  if (k in SNACKS) return SNACKS[k as keyof typeof SNACKS].name;
  if (k === "stone") return EVO_STONE.name;
  if (k === "spray") return SPRAY.name;
  return k;
}

export default function RaidTab({
  student, setStudent, game, timerOn, timeScale,
  caught, setCaught, counts, setCounts, shinies, setShinies, gens, showToast,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [raid, setRaid] = useState<RaidStatus | null>(null);
  const [bank, setBank] = useState<ApiQuestion[]>([]);
  const [needsMig, setNeedsMig] = useState(false); // raid_only 컬럼 미생성(0008 미실행)
  const [picker, setPicker] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [bossHp, setBossHp] = useState(RAID_BOSS_HP);
  const [msg, setMsg] = useState("");
  const [move, setMove] = useState<Move | null>(null);
  const [q, setQ] = useState<ActiveQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selected;
  const timeLeftRef = useRef(0);
  const [fx, setFx] = useState<{ kind: string; key: number; dir?: "fwd" | "back"; diff?: string } | null>(null);
  const [bossState, setBossState] = useState<"idle" | "hit" | "gone">("idle");
  const [myHit, setMyHit] = useState(false);
  const [usedQ, setUsedQ] = useState<string[]>([]);
  const studentRef = useRef(student);
  studentRef.current = student;

  const mine = myPokemonOf(game.battlePid);
  const boss = raid ? POOL[raid.pid - 1] : null;
  const timeLimitFor = (d: Difficulty) => Math.round(TIME_LIMIT[d] * timeScale);
  const countByDiff = useMemo(() => {
    const c: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    bank.forEach((x) => { c[x.difficulty] = (c[x.difficulty] ?? 0) + 1; });
    return c;
  }, [bank]);

  async function loadStatus(): Promise<RaidStatus | null> {
    try {
      const st: RaidStatus = await fetch("/api/raid/status").then((r) => r.json());
      setRaid(st);
      // 협동 달성으로 방금 지급받았으면 도감 반영
      if (st.justGranted) {
        if (!caught.includes(st.pid)) setCaught([...caught, st.pid]);
        setCounts({ ...counts, [st.pid]: Math.max(1, counts[st.pid] ?? 0) });
        if (st.shiny && !shinies.includes(st.pid)) setShinies([...shinies, st.pid]);
        showToast(`🎉 반 전체 달성! ${POOL[st.pid - 1].name}을(를) 받았어요!`);
      }
      // 협동 달성 후 성공자 보상(포인트/아이템)
      if (st.justRewarded) {
        setStudent({ ...studentRef.current, points: st.points, inventory: st.inventory });
        const bits = [st.reward.pts > 0 ? `+${st.reward.pts}P` : "", st.reward.item && st.reward.count > 0 ? `${itemName(st.reward.item)} ×${st.reward.count}` : ""].filter(Boolean);
        if (bits.length) showToast(`🏆 레이드 성공 보상 ${bits.join(" · ")}`);
      }
      return st;
    } catch { return null; }
  }

  useEffect(() => {
    Promise.all([
      loadStatus(),
      fetch("/api/raid/questions").then((r) => r.json()).catch(() => ({ questions: [] })),
    ]).then(([, qb]) => { setBank(qb?.questions ?? []); setNeedsMig(!!qb?.needsMigration); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => stopBattleBgm(), []);

  // 대기·종료 화면에서는 반 협동 진행도를 15초마다 자동 갱신(실시간 모니터링)
  useEffect(() => {
    if (phase !== "idle" && phase !== "done") return;
    const t = setInterval(() => { loadStatus(); }, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── 신청 ─────────────────────────────
  async function request(pid: number) {
    setPicker(false);
    try {
      const res = await fetch("/api/raid/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: pid }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "신청에 실패했어요."); return; }
      setRaid((r) => (r ? { ...r, myReqPid: pid } : r));
      showToast(`${POOL[pid - 1].name} 레이드를 신청했어요!`);
    } catch { showToast("서버에 연결할 수 없어요."); }
  }

  // ── 배틀 ─────────────────────────────
  function resetScene() { setFx(null); setBossState("idle"); setMyHit(false); }

  async function start() {
    resetScene();
    setMsg("레이드 보스를 소환하는 중...");
    setPhase("busy");
    try {
      const res = await fetch("/api/raid/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "레이드를 시작할 수 없어요."); setPhase("idle"); return; }
      setStudent({ ...studentRef.current, hp: MAX_HP });
      setBossHp(RAID_BOSS_HP);
      setUsedQ([]);
      startRaidBgm();
      if (boss) playCry(boss.id);
      setPhase("select");
      setMsg(`강력한 ${boss?.name} 레이드! 문제를 맞혀 체력을 깎자!`);
    } catch { showToast("서버에 연결할 수 없어요."); setPhase("idle"); }
  }

  function pickQuestion(diff: Difficulty): ApiQuestion | undefined {
    let pool = bank.filter((x) => x.difficulty === diff && !usedQ.includes(x.id));
    if (pool.length === 0) pool = bank.filter((x) => x.difficulty === diff);
    if (pool.length === 0) pool = bank;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function chooseMove(m: Move) {
    const raw = pickQuestion(m.diff);
    if (!raw) { showToast("출제할 문제가 없어요. 선생님께 문의해주세요."); return; }
    setUsedQ((u) => [...u, raw.id]);
    const sOpts = shuffle(raw.options.map((t, i) => ({ t, ok: i === raw.answer_idx, idx: i })));
    setMove(m);
    setQ({ ...raw, sOpts });
    setSelected(null);
    timeLeftRef.current = timeLimitFor(m.diff);
    setPhase("question");
  }

  function onTimeUp() {
    const sel = selectedRef.current;
    answer(sel != null && q ? q.sOpts[sel] : null);
  }

  async function win() {
    setPhase("busy");
    try { await fetch("/api/raid/win", { method: "POST" }); } catch { /* 실패해도 성공 자체는 유지 */ }
    stopBattleBgm();
    SFX.catchOk();
    const st = await loadStatus(); // 성공 기록 → 협동 인원/달성 여부 갱신(달성 시 보상·지급 처리)
    let m = `🎉 ${boss?.name} 레이드 성공!`;
    if (st) {
      if (st.unlocked) m += " 반 협동 달성! 🎉";
      else m += ` · 반 협동 ${st.winCount}/${st.threshold}명 (기준 달성 시 보상·지급!)`;
    }
    setMsg(m);
    setPhase("done");
  }

  async function answer(opt: ShuffledOption | null) {
    if (phase !== "question" || !move || !q || !boss) return;
    setPhase("busy");
    const correct = !!opt?.ok;

    if (correct) {
      setMsg(`정답! ${mine.name}의 ${move.name}!`);
      setFx({ kind: mine.type, key: Date.now(), dir: "fwd", diff: move.diff });
      SFX.correct();
      await sleep(300);
      setBossState("hit");
      const nh = Math.max(0, bossHp - RAID_HIT_DMG);
      setBossHp(nh);
      await sleep(450);
      setBossState("idle");
      if (nh <= 0) { await win(); }
      else { setMsg("좋아! 계속 공격하자!"); setPhase("select"); }
    } else {
      setMsg(opt ? "아쉽다! 틀렸다!" : "시간 초과!");
      setFx({ kind: boss.type, key: Date.now(), dir: "back", diff: "hard" });
      SFX.wrong();
      await sleep(300);
      setMyHit(true);
      const nh = Math.max(0, studentRef.current.hp - COUNTER_DMG);
      setStudent({ ...studentRef.current, hp: nh });
      fetch("/api/student/state", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hp: nh }),
      }).catch(() => {});
      await sleep(600);
      setMyHit(false);
      if (nh <= 0) { setMsg(`${mine.name}이(가) 쓰러졌다... 다시 도전할 수 있어요!`); stopBattleBgm(); setPhase("done"); }
      else setPhase("select");
    }
  }

  // ── 렌더 ─────────────────────────────
  if (loading) return <div style={{ ...S.panel, textAlign: "center", padding: 30, color: "#5b7a99" }}>불러오는 중...</div>;

  if (picker) {
    return (
      <div style={{ ...S.panel }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>원하는 레이드 포켓몬을 골라줘!</div>
          <button onClick={() => setPicker(false)} style={{ ...S.ghostBtn, padding: "4px 10px", fontSize: 12 }}>닫기</button>
        </div>
        <div style={{ fontSize: 11, color: "#5b7a99", marginBottom: 10 }}>선택하면 선생님께 전달돼요. (레이드당 1번 신청)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 6, maxHeight: "60vh", overflowY: "auto" }}>
          {POOL.filter((p) => normalizeGens(gens).includes(p.gen)).map((p) => (
            <button key={p.id} onClick={() => request(p.id)}
              style={{ ...S.panel, padding: 4, cursor: "pointer", border: "1px solid var(--line)", background: "var(--card)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Sprite id={p.id} color={TYPE_COLORS[p.type]} pixel size={44} />
              <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>{p.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 협동 진행 배지
  const coop = raid && raid.on && (
    <div style={{ ...S.panel, marginTop: 10, textAlign: "center", padding: "10px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: raid.unlocked ? "#4caf3f" : "#ffb37a" }}>
        {raid.unlocked ? "🎉 반 협동 달성! 모두 포켓몬을 받았어요!" : `🤝 반 협동: ${raid.winCount} / ${raid.threshold}명 성공`}
      </div>
      {!raid.unlocked && (
        <div style={{ fontSize: 11, color: "#8a8f9a", marginTop: 4 }}>
          {raid.threshold}명이 성공하면 <b>{boss?.name}</b>이(가) 반 전체에게 지급돼요!
        </div>
      )}
    </div>
  );

  const requestCard = raid && (
    <div style={{ ...S.panel, marginTop: 10, textAlign: "center" }}>
      {raid.myReqPid ? (
        <>
          <div style={{ fontSize: 12, color: "#5b7a99", marginBottom: 8 }}>이번 레이드에 신청한 포켓몬</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <Sprite id={raid.myReqPid} color={TYPE_COLORS[POOL[raid.myReqPid - 1].type]} pixel size={64} />
          </div>
          <div style={{ fontSize: 13, marginBottom: 4 }}>{POOL[raid.myReqPid - 1].name}</div>
          <div style={{ fontSize: 11, color: "#8a8f9a" }}>다음 레이드가 실시되면 다시 신청할 수 있어요.</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, lineHeight: 1.6 }}>
            다음 레이드에 나왔으면 하는 포켓몬이 있나요?<br />신청하면 선생님이 참고해요!
          </div>
          <button onClick={() => setPicker(true)} style={{ ...S.primaryBtn, width: "100%" }}>⭐ 레이드 포켓몬 신청하기</button>
        </>
      )}
    </div>
  );

  // 레이드 없음
  if (!raid?.on && phase === "idle") {
    return (
      <div>
        <div style={{ ...S.panel, textAlign: "center", padding: "24px 16px" }}>
          <div style={{ fontSize: 34, marginBottom: 6 }}>🛡️</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>오늘은 레이드가 없습니다.</div>
          <div style={{ fontSize: 12, color: "#5b7a99" }}>선생님이 레이드를 열면 강력한 포켓몬과 배틀할 수 있어요!</div>
        </div>
        {requestCard}
      </div>
    );
  }

  // 레이드 대기(활성)
  if (phase === "idle") {
    return (
      <div>
        <div style={{ ...S.panel, textAlign: "center", padding: "20px 16px", border: "2px solid #f0b48a", background: "linear-gradient(180deg,#ffffff,#fff6ef)" }}>
          <div style={{ fontSize: 12, color: "#d9641e", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>⚔️ 레이드 배틀</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, position: "relative", animation: "floaty 2.4s ease-in-out infinite" }}>
            <Sprite id={boss!.id} color={TYPE_COLORS[boss!.type]} pixel shiny={raid!.shiny} size={130} />
            {raid!.shiny && <ShinyFx />}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>{boss!.name}{raid!.shiny && " ✨"}</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>
            강력한 보스! <b style={{ color: "#eaa300" }}>문제 10개</b>를 맞혀 쓰러뜨리자. (재도전 가능)
            {raid!.iWon && <span style={{ color: "#4caf3f" }}> · 이미 성공! ✓</span>}
          </div>
          <button onClick={start} disabled={bank.length === 0} style={{ ...S.primaryBtn, width: "100%", background: "#d9641e", fontSize: 16, padding: "14px 0", opacity: bank.length === 0 ? 0.45 : 1 }}>레이드 도전!</button>
          {bank.length === 0 && (
            <div style={{ fontSize: 11.5, color: "#b45", marginTop: 10, lineHeight: 1.6 }}>
              {needsMig
                ? "레이드 전용 문제 기능 준비 중이에요. 선생님께 문의해주세요."
                : "아직 레이드 전용 문제가 없어요. 선생님이 '레이드 전용' 문제를 등록하면 도전할 수 있어요!"}
            </div>
          )}
        </div>
        {coop}
        {requestCard}
      </div>
    );
  }

  // 배틀 진행
  return (
    <div>
      <div style={{ ...S.panel, textAlign: "center", padding: 10, marginBottom: 8, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{msg}</div>

      {boss && bossState !== "gone" && (
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "4px solid #2c2c34", marginBottom: 8 }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "58%", background: "linear-gradient(#5b3a6e 0%,#5b3a6e 45%,#3a2540 45%,#2a1a30 100%)" }}>
            <div style={{ position: "absolute", left: "56%", top: "34%", width: "34%", height: "9%", background: "#7a4d8f", borderRadius: "50%", opacity: 0.6 }} />
            <div style={{ position: "absolute", left: "6%", top: "72%", width: "42%", height: "11%", background: "#7a4d8f", borderRadius: "50%", opacity: 0.6 }} />
            <div style={{ position: "absolute", left: "56%", top: "2%", width: "34%", transition: "transform 0.3s", transform: "scale(1.15)", animation: bossState === "hit" ? "shakeit 0.5s" : phase === "select" ? "floaty 2.4s ease-in-out infinite" : "none", filter: bossState === "hit" ? "brightness(2.2) saturate(0.3)" : "none" }}>
              <Sprite id={boss.id} color={TYPE_COLORS[boss.type]} pixel shiny={raid!.shiny} size="100%" style={{ width: "100%", height: "auto" }} />
              {raid!.shiny && <ShinyFx />}
            </div>
            <div style={{ position: "absolute", left: "10%", top: "44%", width: "34%", animation: myHit ? "shakeit 0.5s" : "none", filter: myHit ? "brightness(2.2) saturate(0.3)" : "none" }}>
              <Sprite id={mine.id} color={mine.color} back pixelated size="100%" shiny={game.battleShiny} style={{ width: "100%", height: "auto" }} />
            </div>
            <div style={{ position: "absolute", left: "3%", top: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
                {boss.name} <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: "#d9641e", color: "#fff" }}>BOSS</span>
              </div>
              <HpBar cur={bossHp} max={RAID_BOSS_HP} />
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 2 }}>체력 {bossHp}/{RAID_BOSS_HP}</div>
            </div>
            <div style={{ position: "absolute", right: "3%", bottom: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13 }}>{mine.name} <span style={{ fontSize: 10, color: "#666" }}>Lv.{student.level}</span></div>
              <HpBar cur={student.hp} max={MAX_HP} />
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 2 }}>{student.hp}/{MAX_HP}</div>
            </div>
            {fx && (fx.kind in TYPE_COLORS) && <TypeFx key={fx.key} type={fx.kind} dir={fx.dir} diff={fx.diff} />}
          </div>
        </div>
      )}

      {/* 기술 선택 (배틀과 동일 UI) */}
      {phase === "select" && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${mine.moves.length}, 1fr)`, gap: 6 }}>
          {mine.moves.map((m) => {
            const none = countByDiff[m.diff] === 0 && bank.length > 0;
            return (
              <button key={m.name} onClick={() => !none && chooseMove(m)} disabled={none} style={{ ...S.moveBtn(m.diff), opacity: none ? 0.35 : 1 }}>
                <div style={{ fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 10, opacity: 0.9, marginTop: 2 }}>{none ? "문제 없음" : `${m.label} 문제`}</div>
              </button>
            );
          })}
          <button onClick={() => { setPhase("done"); setMsg("레이드에서 도망쳤다! 언제든 다시 도전할 수 있어요."); stopBattleBgm(); }} style={{ ...S.ghostBtn, gridColumn: "1 / -1" }}>도망친다</button>
        </div>
      )}

      {/* 문제 (배틀과 동일 UI) */}
      {phase === "question" && q && move && (
        <div style={{ ...S.panel, padding: 12 }}>
          {timerOn ? (
            <TimerBar key={q.id} total={timeLimitFor(move.diff)} timeRef={timeLeftRef} onExpire={onTimeUp}
              label={<span style={{ color: "#5b7a99" }}>{move.label} 문제 · {q.tag}</span>} />
          ) : (
            <div style={{ fontSize: 11, marginBottom: 10 }}><span style={{ color: "#5b7a99" }}>{move.label} 문제 · {q.tag}</span></div>
          )}
          <div style={{ fontSize: 15, marginBottom: 10, lineHeight: 1.6 }}><MathText>{q.body}</MathText></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {q.sOpts.map((o, i) => {
              const on = selected === i;
              return (
                <button key={i} onClick={() => setSelected(i)}
                  style={{ ...S.choiceBtn, border: on ? "2px solid #4b7bec" : S.choiceBtn.border, background: on ? "#eaf0ff" : S.choiceBtn.background, fontWeight: on ? 700 : 600 }}>
                  {["①", "②", "③", "④"][i]} <MathText>{o.t}</MathText>
                </button>
              );
            })}
          </div>
          <button onClick={() => selected != null && answer(q.sOpts[selected])} disabled={selected == null}
            style={{ ...S.primaryBtn, width: "100%", marginTop: 10, opacity: selected == null ? 0.45 : 1 }}>
            {selected == null ? "답을 골라주세요" : "정답 제출"}
          </button>
        </div>
      )}

      {/* 종료 */}
      {phase === "done" && (
        <div>
          <div style={{ ...S.panel, textAlign: "center" }}>
            <div style={{ fontSize: 13, marginBottom: 10 }}>레이드는 몇 번이든 다시 도전할 수 있어요!</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={start} style={{ ...S.primaryBtn, flex: 1, background: "#d9641e" }}>다시 도전!</button>
              <button onClick={() => { resetScene(); setPhase("idle"); }} style={{ ...S.ghostBtn, flex: 1 }}>그만하기</button>
            </div>
          </div>
          {coop}
        </div>
      )}
    </div>
  );
}
