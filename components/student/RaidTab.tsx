"use client";

import { useEffect, useRef, useState } from "react";
import { S } from "@/lib/styles";
import {
  POOL, TYPE_COLORS, BALLS, BallKind, captureRate,
  myPokemonOf, Move, Difficulty, TIME_LIMIT, RAID_HITS, MAX_HP, josa, shuffle, sleep,
} from "@/lib/game";
import { ApiQuestion, StudentData, GameInfo } from "@/lib/types";
import Sprite from "@/components/Sprite";
import HpBar from "@/components/HpBar";
import BallIcon from "@/components/BallIcon";
import ShinyFx from "@/components/student/ShinyFx";
import TypeFx from "@/components/student/TypeFx";
import TimerBar from "@/components/student/TimerBar";
import { SFX, playCry, startBattleBgm, stopBattleBgm } from "@/lib/sound";

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
  showToast: (m: string) => void;
}

type ShuffledOption = { t: string; ok: boolean; idx: number };
interface ActiveQuestion extends ApiQuestion { sOpts: ShuffledOption[] }
type Phase = "idle" | "busy" | "select" | "question" | "throwing" | "capture" | "done";
const COUNTER_DMG = 20; // 오답 시 보스의 반격 데미지
const BALL_KINDS: BallKind[] = ["poke", "superb", "hyper", "master"];

export default function RaidTab({
  student, setStudent, game, timerOn, timeScale,
  caught, setCaught, counts, setCounts, shinies, setShinies, showToast,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [raid, setRaid] = useState<{ on: boolean; pid: number; shiny: boolean; round: number; myReqPid: number | null } | null>(null);
  const [bank, setBank] = useState<ApiQuestion[]>([]);
  const [picker, setPicker] = useState(false); // 신청용 도감 그리드

  // 배틀 상태
  const [phase, setPhase] = useState<Phase>("idle");
  const [bossHp, setBossHp] = useState(RAID_HITS); // 남은 문제 수(= 보스 HP 칸)
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [move, setMove] = useState<Move | null>(null);
  const [q, setQ] = useState<ActiveQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selected;
  const timeLeftRef = useRef(0);
  const [fx, setFx] = useState<{ kind: string; key: number; dir?: "fwd" | "back"; diff?: string } | null>(null);
  const [throwKind, setThrowKind] = useState<BallKind>("poke");
  const [capFx, setCapFx] = useState<"success" | "fail" | null>(null);
  const [bossState, setBossState] = useState<"idle" | "hit" | "captured" | "gone">("idle");
  const [myHit, setMyHit] = useState(false);
  const [fails, setFails] = useState(0);
  const [usedQ, setUsedQ] = useState<string[]>([]);
  const studentRef = useRef(student);
  studentRef.current = student;

  const mine = myPokemonOf(game.battlePid);
  const boss = raid ? POOL[raid.pid - 1] : null;
  const timeLimitFor = (d: Difficulty) => Math.round(TIME_LIMIT[d] * timeScale);

  useEffect(() => {
    Promise.all([
      fetch("/api/raid/status").then((r) => r.json()).catch(() => null),
      fetch("/api/battle/questions").then((r) => r.json()).catch(() => ({ questions: [] })),
    ]).then(([st, qb]) => {
      if (st) setRaid(st);
      setBank(qb?.questions ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => () => stopBattleBgm(), []);

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
  function resetScene() { setFx(null); setCapFx(null); setBossState("idle"); setMyHit(false); }

  async function start() {
    resetScene();
    setMsg("레이드 보스를 소환하는 중...");
    setPhase("busy");
    try {
      const res = await fetch("/api/raid/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "레이드를 시작할 수 없어요."); setPhase("idle"); return; }
      setStudent({ ...studentRef.current, hp: MAX_HP });
      setToken(data.token);
      setBossHp(RAID_HITS);
      setFails(0);
      setUsedQ([]);
      startBattleBgm();
      if (boss) playCry(boss.id);
      if (data.pokemon.shiny) showToast(`✨ 이로치 ${data.pokemon.name} 레이드!`);
      setPhase("select");
      setMsg(`강력한 ${boss?.name} 레이드! 문제 ${RAID_HITS}개를 맞혀 쓰러뜨리자!`);
    } catch { showToast("서버에 연결할 수 없어요."); setPhase("idle"); }
  }

  function pickQuestion(diff: Difficulty): ApiQuestion | undefined {
    let pool = bank.filter((x) => x.difficulty === diff && !usedQ.includes(x.id));
    if (pool.length === 0) pool = bank.filter((x) => x.difficulty === diff);
    if (pool.length === 0) pool = bank; // 해당 난이도 없으면 전체에서
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
      const nh = Math.max(0, bossHp - 1);
      setBossHp(nh);
      await sleep(450);
      setBossState("idle");
      if (nh <= 0) {
        setMsg(`해냈다! ${boss.name}을(를) 쓰러뜨렸다! 몬스터볼을 던지자!`);
        setPhase("capture");
      } else {
        setMsg(`좋아! 남은 문제 ${nh}개!`);
        setPhase("select");
      }
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
      if (nh <= 0) {
        setMsg(`${mine.name}이(가) 쓰러졌다... 다시 도전할 수 있어요!`);
        stopBattleBgm();
        setPhase("done");
      } else {
        setPhase("select");
      }
    }
  }

  async function throwBall(kind: BallKind) {
    if (!boss || studentRef.current.inventory[kind] <= 0) return;
    setPhase("throwing");
    setThrowKind(kind);
    setCapFx(null);
    setMsg(`${BALLS[kind].name}을(를) 던졌다! · · ·`);
    setFx({ kind: "ball", key: Date.now() });
    SFX.throwBall();

    let result: {
      success: boolean; newlyCaught?: boolean; caughtCount?: number; shiny?: boolean;
      inventory: StudentData["inventory"]; points?: number; xp?: number; level?: number;
      levelBonus?: number; reward?: { pts: number; xp: number }; error?: string;
    } | null = null;
    const reqStart = Date.now();
    try {
      const res = await fetch("/api/battle/capture", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ball: kind }),
      });
      result = await res.json();
      if (!res.ok) { showToast(result?.error ?? "포획에 실패했어요."); setPhase("capture"); setFx(null); return; }
    } catch { showToast("서버에 연결할 수 없어요."); setPhase("capture"); setFx(null); return; }

    await sleep(Math.max(0, 380 - (Date.now() - reqStart)));
    setBossState("captured");
    setFx({ kind: "wiggle", key: Date.now() });
    await sleep(880);

    if (result!.success) {
      setFx(null); setCapFx("success"); SFX.catchOk(); stopBattleBgm(); setBossState("gone");
      setStudent({ ...studentRef.current, inventory: result!.inventory, points: result!.points!, xp: result!.xp!, level: result!.level! });
      if (result!.caughtCount != null) setCounts({ ...counts, [boss.id]: result!.caughtCount });
      if (result!.shiny && !shinies.includes(boss.id)) { setShinies([...shinies, boss.id]); showToast(`✨ 이로치 ${boss.name}을(를) 도감에 기록했다!`); }
      if (result!.newlyCaught && !caught.includes(boss.id)) { setCaught([...caught, boss.id]); showToast("도감에 새로운 포켓몬이 기록되었다!"); }
      else if ((result!.caughtCount ?? 0) > 1) showToast(`${boss.name}을(를) 또 잡았다! (보유 ${result!.caughtCount}마리)`);
      if ((result!.levelBonus ?? 0) > 0) showToast(`🎉 레벨 업! Lv.${result!.level} — 보상 +${result!.levelBonus}P`);
      setMsg(`대단해! 레이드 보스 ${josa(boss.name, "을", "를")} 잡았다! +${result!.reward!.pts}P +${result!.reward!.xp}XP`);
      setPhase("done");
    } else {
      setFx(null); setCapFx("fail"); SFX.catchFail(); setBossState("idle");
      setStudent({ ...studentRef.current, inventory: result!.inventory });
      setTimeout(() => setCapFx(null), 700);
      const f = fails + 1;
      setFails(f);
      if (f >= 3) {
        setBossState("gone");
        setMsg(`아앗! ${josa(boss.name, "이", "가")} 도망쳤다... 다시 도전할 수 있어요!`);
        stopBattleBgm();
        setPhase("done");
      } else {
        setMsg(`아... 아깝다! (기회 ${3 - f}번 남음)`);
        setPhase("capture");
      }
    }
  }

  // ── 렌더 ─────────────────────────────
  if (loading) return <div style={{ ...S.panel, textAlign: "center", padding: 30, color: "#9fd8ff" }}>불러오는 중...</div>;

  // 신청 도감 그리드
  if (picker) {
    return (
      <div style={{ ...S.panel }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>원하는 레이드 포켓몬을 골라줘!</div>
          <button onClick={() => setPicker(false)} style={{ ...S.ghostBtn, padding: "4px 10px", fontSize: 12 }}>닫기</button>
        </div>
        <div style={{ fontSize: 11, color: "#9fd8ff", marginBottom: 10 }}>선택하면 선생님께 전달돼요. (레이드당 1번 신청)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 6, maxHeight: "60vh", overflowY: "auto" }}>
          {POOL.map((p) => (
            <button key={p.id} onClick={() => request(p.id)}
              style={{ ...S.panel, padding: 4, cursor: "pointer", border: "2px solid #2c2c34", background: "#252840", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Sprite id={p.id} color={TYPE_COLORS[p.type]} pixel size={44} />
              <div style={{ fontSize: 9, color: "#c7cdf0", marginTop: 2 }}>{p.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const requestCard = raid && (
    <div style={{ ...S.panel, marginTop: phase === "idle" && raid.on ? 10 : 0, textAlign: "center" }}>
      {raid.myReqPid ? (
        <>
          <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 8 }}>이번 레이드에 신청한 포켓몬</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <Sprite id={raid.myReqPid} color={TYPE_COLORS[POOL[raid.myReqPid - 1].type]} pixel size={64} />
          </div>
          <div style={{ fontSize: 13, marginBottom: 4 }}>{POOL[raid.myReqPid - 1].name}</div>
          <div style={{ fontSize: 11, color: "#9fb0d8" }}>다음 레이드가 실시되면 다시 신청할 수 있어요.</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "#c7cdf0", marginBottom: 10, lineHeight: 1.6 }}>
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
        <div style={{ ...S.panel, textAlign: "center", padding: "24px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 34, marginBottom: 6 }}>🛡️</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>오늘은 레이드가 없습니다.</div>
          <div style={{ fontSize: 12, color: "#9fd8ff" }}>선생님이 레이드를 열면 강력한 포켓몬과 배틀할 수 있어요!</div>
        </div>
        {requestCard}
      </div>
    );
  }

  // 레이드 대기(활성) — 도전 배너
  if (phase === "idle") {
    return (
      <div>
        <div style={{ ...S.panel, textAlign: "center", padding: "20px 16px", border: "3px solid #d9641e", background: "linear-gradient(160deg,#3a2a44,#2c2f44)" }}>
          <div style={{ fontSize: 12, color: "#ffb37a", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>⚔️ 레이드 배틀</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, position: "relative", animation: "floaty 2.4s ease-in-out infinite" }}>
            <Sprite id={boss!.id} color={TYPE_COLORS[boss!.type]} pixel shiny={raid!.shiny} size={130} />
            {raid!.shiny && <ShinyFx />}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>{boss!.name}{raid!.shiny && " ✨"}</div>
          <div style={{ fontSize: 11, color: "#c7cdf0", marginBottom: 14 }}>
            강력한 보스! <b style={{ color: "#ffd54a" }}>문제 {RAID_HITS}개</b>를 맞혀야 이기고 포획 기회가 생겨요. (재도전 가능)
          </div>
          <button onClick={start} style={{ ...S.primaryBtn, width: "100%", background: "#d9641e", fontSize: 16, padding: "14px 0" }}>
            레이드 도전!
          </button>
        </div>
        {requestCard}
      </div>
    );
  }

  // 배틀 진행 화면
  return (
    <div>
      <div style={{ ...S.panel, textAlign: "center", padding: 10, marginBottom: 8, minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{msg}</div>

      {/* 레이드 필드 */}
      {boss && bossState !== "gone" && (
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "4px solid #2c2c34", marginBottom: 8 }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "58%", background: "linear-gradient(#5b3a6e 0%,#5b3a6e 45%,#3a2540 45%,#2a1a30 100%)" }}>
            <div style={{ position: "absolute", left: "56%", top: "34%", width: "34%", height: "9%", background: "#7a4d8f", borderRadius: "50%", opacity: 0.6 }} />
            <div style={{ position: "absolute", left: "6%", top: "72%", width: "42%", height: "11%", background: "#7a4d8f", borderRadius: "50%", opacity: 0.6 }} />
            <div style={{ position: "absolute", left: "56%", top: "2%", width: "34%", transition: "transform 0.3s, opacity 0.3s", transform: bossState === "captured" ? "scale(0)" : "scale(1.15)", opacity: bossState === "captured" ? 0 : 1, animation: capFx === "fail" ? "breakout 0.6s ease-out" : bossState === "hit" ? "shakeit 0.5s" : phase === "select" ? "floaty 2.4s ease-in-out infinite" : "none", filter: bossState === "hit" ? "brightness(2.2) saturate(0.3)" : "none" }}>
              <Sprite id={boss.id} color={TYPE_COLORS[boss.type]} pixel shiny={raid!.shiny} size="100%" style={{ width: "100%", height: "auto" }} />
              {raid!.shiny && <ShinyFx />}
            </div>
            <div style={{ position: "absolute", left: "10%", top: "44%", width: "34%", animation: myHit ? "shakeit 0.5s" : "none", filter: myHit ? "brightness(2.2) saturate(0.3)" : "none" }}>
              <Sprite id={mine.id} color={mine.color} back pixelated size="100%" style={{ width: "100%", height: "auto" }} />
            </div>
            {/* 보스 이름/HP(남은 문제) */}
            <div style={{ position: "absolute", left: "3%", top: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
                {boss.name} <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: "#d9641e", color: "#fff" }}>BOSS</span>
              </div>
              <HpBar cur={bossHp} max={RAID_HITS} />
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 2 }}>남은 문제 {bossHp}/{RAID_HITS}</div>
            </div>
            <div style={{ position: "absolute", right: "3%", bottom: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13 }}>{mine.name} <span style={{ fontSize: 10, color: "#666" }}>Lv.{student.level}</span></div>
              <HpBar cur={student.hp} max={MAX_HP} />
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 2 }}>{student.hp}/{MAX_HP}</div>
            </div>
            {fx && (fx.kind in TYPE_COLORS) && <TypeFx key={fx.key} type={fx.kind} dir={fx.dir} diff={fx.diff} />}
            {(fx?.kind === "ball" || fx?.kind === "wiggle") && (
              <div key={fx.key} style={{ position: "absolute", width: 30, height: 30, animation: fx.kind === "ball" ? "ballArc 0.38s ease-out forwards" : "ballShake3 0.85s ease-in-out", left: fx.kind === "wiggle" ? "63%" : undefined, top: fx.kind === "wiggle" ? "10%" : undefined, transformOrigin: "bottom center", zIndex: 6 }}>
                <BallIcon kind={throwKind} size={30} />
              </div>
            )}
            {capFx === "success" && (
              <div style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%,-50%)", fontSize: 30, fontWeight: 800, color: "#ffd54a", textShadow: "0 2px 6px #000", animation: "pop 0.4s ease-out", zIndex: 8 }}>GET!</div>
            )}
            {capFx === "fail" && (
              <div style={{ position: "absolute", left: "63%", top: "16%", transform: "translate(-50%,-50%)", fontSize: 28, animation: "pop 0.4s ease-out", zIndex: 7 }}>💥</div>
            )}
          </div>
        </div>
      )}

      {/* 기술(난이도) 선택 */}
      {phase === "select" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {mine.moves.map((m) => (
            <button key={m.diff} onClick={() => chooseMove(m)} style={{ ...S.choiceBtn }}>
              {m.name} <span style={{ fontSize: 10, color: "#9fd8ff" }}>({m.label})</span>
            </button>
          ))}
          <button onClick={() => { setPhase("done"); setMsg("레이드에서 물러났다."); stopBattleBgm(); }} style={{ ...S.ghostBtn, gridColumn: "1 / -1" }}>물러나기</button>
        </div>
      )}

      {/* 문제 */}
      {phase === "question" && q && move && (
        <div style={{ ...S.panel, padding: 12 }}>
          {timerOn ? (
            <TimerBar key={q.id} total={timeLimitFor(move.diff)} timeRef={timeLeftRef} onExpire={onTimeUp}
              label={<span style={{ color: "#9fd8ff" }}>{move.label} 문제 · {q.tag}</span>} />
          ) : (
            <div style={{ fontSize: 11, marginBottom: 10 }}><span style={{ color: "#9fd8ff" }}>{move.label} 문제 · {q.tag}</span></div>
          )}
          <div style={{ fontSize: 15, marginBottom: 10, lineHeight: 1.6 }}>{q.body}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {q.sOpts.map((o, i) => {
              const on = selected === i;
              return (
                <button key={i} onClick={() => setSelected(i)}
                  style={{ ...S.choiceBtn, border: on ? "2px solid #ff9a52" : S.choiceBtn.border, background: on ? "#5a4a3a" : S.choiceBtn.background, fontWeight: on ? 700 : 600 }}>
                  {["①", "②", "③", "④"][i]} {o.t}
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

      {/* 포획 */}
      {(phase === "capture" || phase === "throwing") && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {BALL_KINDS.map((k) => {
            const rate = Math.min(0.95, captureRate(boss!.rarity, k) + 0.35);
            const disabled = student.inventory[k] <= 0 || phase === "throwing";
            return (
              <button key={k} onClick={() => throwBall(k)} disabled={disabled} style={{ ...S.choiceBtn, opacity: student.inventory[k] <= 0 ? 0.35 : 1 }}>
                <BallIcon kind={k} size={15} /> {BALLS[k].name} ×{student.inventory[k]}
                <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 2 }}>성공률 {Math.round(rate * 100)}%</div>
              </button>
            );
          })}
          <button onClick={() => { setPhase("done"); setMsg("이번엔 포획하지 않았어요. 다시 도전할 수 있어요!"); stopBattleBgm(); }} disabled={phase === "throwing"} style={{ ...S.ghostBtn, gridColumn: "1 / -1" }}>
            그만두기
          </button>
        </div>
      )}

      {/* 종료 */}
      {phase === "done" && (
        <div style={{ ...S.panel, textAlign: "center" }}>
          <div style={{ fontSize: 13, marginBottom: 10 }}>레이드는 몇 번이든 다시 도전할 수 있어요!</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={start} style={{ ...S.primaryBtn, flex: 1, background: "#d9641e" }}>다시 도전!</button>
            <button onClick={() => { resetScene(); setPhase("idle"); }} style={{ ...S.ghostBtn, flex: 1 }}>그만하기</button>
          </div>
        </div>
      )}
    </div>
  );
}
