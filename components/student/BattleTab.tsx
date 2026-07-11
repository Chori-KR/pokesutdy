"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { S } from "@/lib/styles";
import {
  BALLS, BallKind, DIFF, Difficulty, RARITY, TIME_LIMIT, TYPE_COLORS,
  TYPE_MOVE, POOL, Pokemon, Move, MAX_HP, MAX_BALLS_PER_THROW,
  EVOLVES_TO, evoWinsNeeded, myPokemonOf, multiCaptureRate, josa, shuffle, sleep,
} from "@/lib/game";
import { ApiQuestion, StudentData, DayInfo, GameInfo } from "@/lib/types";
import Sprite from "@/components/Sprite";
import BallIcon from "@/components/BallIcon";
import HpBar from "@/components/HpBar";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  moveDiff: boolean; // 교사 설정: 기술 선택 = 난이도 선택
  caught: number[];
  setCaught: (ids: number[]) => void;
  day: DayInfo;
  setDay: (d: DayInfo) => void;
  game: GameInfo;
  setGame: (g: GameInfo) => void;
  showToast: (t: string) => void;
}

type BattlePhase = "idle" | "intro" | "select" | "question" | "busy" | "capture" | "throwing" | "done";
interface ShuffledOption { t: string; ok: boolean; idx: number }
interface ActiveQuestion extends ApiQuestion { sOpts: ShuffledOption[] }
type Fx = { kind: string; key: number } | null;

const BALL_KINDS: BallKind[] = ["poke", "superb", "hyper", "master"];

export default function BattleTab({ student, setStudent, moveDiff, caught, setCaught, day, setDay, game, setGame, showToast }: Props) {
  const [phase, setPhase] = useState<BattlePhase>("idle");
  const [bank, setBank] = useState<ApiQuestion[] | null>(null);
  const [wild, setWild] = useState<(Pokemon & { token: string }) | null>(null);
  const [wildHp, setWildHp] = useState(0);
  const [msg, setMsg] = useState("");
  const [move, setMove] = useState<Move | null>(null);
  const [q, setQ] = useState<ActiveQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fx, setFx] = useState<Fx>(null);
  const [wildState, setWildState] = useState<"idle" | "hit" | "captured" | "gone">("idle");
  const [myHit, setMyHit] = useState(false);
  const [fails, setFails] = useState(0);
  const [usedQ, setUsedQ] = useState<string[]>([]);
  const [ballCount, setBallCount] = useState(1); // M4: 동시에 던질 볼 개수
  const [picker, setPicker] = useState(false);   // 포켓몬 선택 패널
  const [busyAction, setBusyAction] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wildHpRef = useRef(0);
  const studentRef = useRef(student);
  studentRef.current = student;

  // 내 배틀 포켓몬 (M4: 선택 가능, 타입별 기술 자동 배치)
  const mine = myPokemonOf(game.battlePid);
  const myWins = Number(game.wins?.[String(mine.id)] ?? 0);
  const evoTargets = EVOLVES_TO[mine.id] ?? [];
  const winsNeeded = evoWinsNeeded(mine.id);
  const canEvolve = evoTargets.length > 0 && myWins >= winsNeeded;
  const battlesLeft = Math.max(0, day.battleLimit - day.battleUsed);
  const ownedIds = useMemo(() => {
    const set = new Set<number>(caught);
    if (game.starter) set.add(game.starter);
    return [...set].sort((a, b) => a - b);
  }, [caught, game.starter]);

  // 배틀 진입 시 출제 중 문제 프리로드 (즉답 UX, 명세 §7)
  useEffect(() => {
    fetch("/api/battle/questions")
      .then((r) => r.json())
      .then((data) => setBank(data.questions ?? []))
      .catch(() => setBank([]));
  }, []);

  const countByDiff = useMemo(() => {
    const c: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
    (bank ?? []).forEach((x) => c[x.difficulty]++);
    return c;
  }, [bank]);
  const activeCount = bank?.length ?? 0;

  async function selectPokemon(pid: number) {
    if (busyAction || pid === game.battlePid) { setPicker(false); return; }
    setBusyAction(true);
    try {
      const res = await fetch("/api/pokemon/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: pid }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "선택에 실패했어요."); return; }
      setGame({ ...game, battlePid: data.battlePid });
      setPicker(false);
      showToast(`가라, ${data.name}!`);
    } catch {
      showToast("연결에 실패했어요.");
    } finally {
      setBusyAction(false);
    }
  }

  async function evolve(to: number) {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const res = await fetch("/api/pokemon/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "진화에 실패했어요."); return; }
      setGame({ ...game, battlePid: data.battlePid, wins: data.wins });
      if (data.newlyCaught && !caught.includes(to)) setCaught([...caught, to]);
      showToast(`축하해! ${data.from.name}${josa(data.from.name, "이", "가").slice(-1)} ${data.to.name}(으)로 진화했다! ✨`);
    } catch {
      showToast("연결에 실패했어요.");
    } finally {
      setBusyAction(false);
    }
  }

  async function start() {
    setMsg("풀숲을 뒤지는 중...");
    setPhase("busy");
    try {
      const res = await fetch("/api/battle/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? "배틀을 시작할 수 없어요."); setPhase("idle"); return; }
      setDay({ ...day, battleUsed: data.battleUsed, battleLimit: data.battleLimit });
      const meta = POOL.find((p) => p.id === data.pokemon.id)!;
      const hp = RARITY[meta.rarity].hp;
      setWild({ ...meta, token: data.token });
      setWildHp(hp);
      wildHpRef.current = hp;
      setWildState("idle");
      setFails(0);
      setUsedQ([]);
      setBallCount(1);
      setPhase("intro");
      setMsg(`앗! 야생의 ${josa(meta.name, "이", "가")} 나타났다!`);
    } catch {
      setMsg("서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.");
      setPhase("idle");
    }
  }

  function pickQuestion(diff: Difficulty): ApiQuestion | undefined {
    const all = bank ?? [];
    // 같은 배틀 내 중복 출제 방지, 소진 시 재사용 (명세 §4.2)
    let pool = all.filter((x) => x.difficulty === diff && !usedQ.includes(x.id));
    if (pool.length === 0) pool = all.filter((x) => x.difficulty === diff);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function chooseMove(m: Move) {
    const raw = pickQuestion(m.diff);
    if (!raw) return;
    setUsedQ((u) => [...u, raw.id]);
    const sOpts = shuffle(raw.options.map((t, i) => ({ t, ok: i === raw.answer_idx, idx: i })));
    setMove(m);
    setQ({ ...raw, sOpts });
    setTimeLeft(TIME_LIMIT[m.diff]);
    setPhase("question");
    setMsg(`문제를 맞히면 ${m.name} 발동!`);
  }

  useEffect(() => {
    if (phase !== "question") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current);
          answer(null, 0);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, q]);

  // 내 공격 이펙트: 타입별 (불꽃/전기/에스퍼는 전용, 나머지는 타입색 투사체)
  function attackFx(): string {
    if (mine.type === "fire") return "fire";
    if (mine.type === "electric") return "electric";
    if (mine.type === "psychic") return "psychic";
    return "proj";
  }

  async function answer(opt: ShuffledOption | null, remain: number) {
    if (phase !== "question" || !move || !q || !wild) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("busy");
    const total = TIME_LIMIT[move.diff];
    const correct = !!opt?.ok;
    // 급소: 제한시간 앞 1/3 안에 정답 (명세 §4.2)
    const crit = correct && remain > (total * 2) / 3;

    // 서버 권위 기록: 통계 + 정답당 +2XP (응답으로 xp/level 동기화)
    const record = fetch("/api/battle/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: q.id, chosen_idx: opt ? opt.idx : null }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    await sleep(500);

    if (correct) {
      record.then((res) => {
        if (res) setStudent({ ...studentRef.current, xp: res.xp, level: res.level });
      });
      setMsg(`${mine.name}의 ${move.name}!`);
      setFx({ kind: attackFx(), key: Date.now() });
      await sleep(900);
      setWildState("hit");
      setFx({ kind: "shake", key: Date.now() });
      const dmg = Math.round(move.dmg * (crit ? 1.5 : 1));
      const nh = Math.max(0, wildHpRef.current - dmg);
      wildHpRef.current = nh;
      setWildHp(nh);
      if (crit) { setMsg("급소에 맞았다!"); await sleep(900); }
      await sleep(650);
      setWildState("idle");
      if (nh <= 0) {
        // M4: 배틀 승리 → 진화 승수 기록 (서버 권위, 토큰당 1회)
        fetch("/api/battle/win", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: wild.token }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((res) => {
            if (!res) return;
            setGame({ ...game, wins: res.allWins });
            if (res.canEvolveTo.length > 0) showToast(`${mine.name} ${res.wins}승! 진화할 수 있어요! ✨`);
          })
          .catch(() => {});
        setMsg(`야생 ${josa(wild.name, "이", "가")} 쓰러졌다! 볼을 골라 던지자!`);
        setPhase("capture");
      } else {
        setMsg(`정답! (야생 HP ${nh}) 다음 기술을 고르자.`);
        setPhase("select");
      }
    } else {
      const answerText = q.sOpts.find((o) => o.ok)?.t ?? "";
      setMsg(opt === null
        ? `시간 초과! ${move.name}은(는) 빗나갔다!`
        : `${move.name}! ...그러나 빗나갔다! (정답: ${answerText})`);
      await sleep(1200);
      // 오답 → 야생의 반격 (반격 데미지는 희귀도로 결정)
      setMsg(`야생 ${wild.name}의 ${TYPE_MOVE[wild.type]}!`);
      setFx({ kind: wild.type === "electric" ? "electric" : wild.type === "psychic" ? "psychic" : "projBack", key: Date.now() });
      await sleep(900);
      setMyHit(true);
      setFx({ kind: "shake", key: Date.now() });
      const nh = Math.max(0, studentRef.current.hp - RARITY[wild.rarity].atk);
      setStudent({ ...studentRef.current, hp: nh });
      fetch("/api/student/state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hp: nh }),
      }).catch(() => {});
      await sleep(650);
      setMyHit(false);
      if (nh <= 0) {
        setMsg(`${mine.name}은(는) 쓰러졌다... 회복약을 쓰거나 내일까지 기다리자.`);
        setPhase("done");
      } else {
        setPhase("select");
      }
    }
  }

  async function throwBall(kind: BallKind) {
    if (!wild) return;
    const n = kind === "master" ? 1 : ballCount;
    if (studentRef.current.inventory[kind] < n) return;
    setPhase("throwing");
    setMsg(`${BALLS[kind].name} ${n > 1 ? `${n}개를` : "을(를)"} 던졌다! · · ·`);
    setFx({ kind: "ball", key: Date.now() });

    // 서버 권위 판정 (볼 차감 + RNG). 연출과 병렬로 요청.
    const reqStart = Date.now();
    let result: {
      success: boolean; newlyCaught?: boolean; inventory: StudentData["inventory"];
      points?: number; xp?: number; level?: number; reward?: { pts: number; xp: number };
      used?: number; error?: string;
    } | null = null;
    try {
      const res = await fetch("/api/battle/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: wild.token, ball: kind, count: n }),
      });
      result = await res.json();
      if (!res.ok) {
        showToast(result?.error ?? "포획에 실패했어요. 다시 시도해주세요.");
        setPhase("capture");
        setFx(null);
        return;
      }
    } catch {
      showToast("서버에 연결할 수 없어요.");
      setPhase("capture");
      setFx(null);
      return;
    }

    // 볼 포물선 + 흔들림 연출 시간 확보
    await sleep(Math.max(0, 750 - (Date.now() - reqStart)));
    setWildState("captured");
    setFx({ kind: "wiggle", key: Date.now() });
    await sleep(1700);

    if (result!.success) {
      setFx(null);
      setWildState("gone");
      setStudent({
        ...studentRef.current,
        inventory: result!.inventory,
        points: result!.points!,
        xp: result!.xp!,
        level: result!.level!,
      });
      if (result!.newlyCaught && !caught.includes(wild.id)) {
        setCaught([...caught, wild.id]);
        showToast("도감에 새로운 포켓몬이 기록되었다!");
      }
      setMsg(`신난다! ${josa(wild.name, "을", "를")} 잡았다! +${result!.reward!.pts}P +${result!.reward!.xp}XP`);
      setPhase("done");
    } else {
      setFx(null);
      setWildState("idle");
      setStudent({ ...studentRef.current, inventory: result!.inventory });
      const f = fails + 1;
      setFails(f);
      if (f >= 2) {
        // 누적 2회 실패 시 도망 (명세 §4.2)
        setWildState("gone");
        setMsg(`아앗! 야생 ${josa(wild.name, "이", "가")} 도망쳐 버렸다!`);
        setPhase("done");
      } else {
        setMsg(`볼 ${n}개가 모두 튕겨 나왔다... 아깝다! (기회 1번 남음)`);
        setPhase("capture");
      }
    }
  }

  if (bank === null)
    return <div style={{ ...S.panel, textAlign: "center", padding: 30, fontSize: 13, color: "#9fd8ff" }}>문제를 불러오는 중...</div>;

  if (student.hp <= 0 && phase !== "busy")
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 30 }}>
        <div style={{ fontSize: 15, marginBottom: 8 }}>{mine.name}이(가) 기절했어요...</div>
        <div style={{ fontSize: 12, color: "#9fd8ff" }}>상점의 회복약을 쓰거나, 내일 아침이 되면 저절로 기운을 차려요.</div>
      </div>
    );

  const moves = moveDiff
    ? mine.moves
    : [{ name: mine.moves[1].name, diff: "medium" as Difficulty, dmg: 20, label: "보통" }];

  return (
    <div>
      {/* 배틀 필드 */}
      {phase !== "idle" && wild && (
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "4px solid #2c2c34", marginBottom: 8 }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "58%", background: "linear-gradient(#9adcf0 0%, #9adcf0 45%, #8fce6e 45%, #7bbf5c 100%)" }}>
            <div style={{ position: "absolute", left: "56%", top: "34%", width: "34%", height: "9%", background: "#6aab4d", borderRadius: "50%", opacity: 0.7 }} />
            <div style={{ position: "absolute", left: "6%", top: "72%", width: "42%", height: "11%", background: "#6aab4d", borderRadius: "50%", opacity: 0.7 }} />
            {wildState !== "gone" && (
              <div style={{ position: "absolute", left: "60%", top: "6%", width: "26%", transition: "transform 0.3s, opacity 0.3s", transform: wildState === "captured" ? "scale(0)" : "scale(1)", opacity: wildState === "captured" ? 0 : 1, animation: wildState === "hit" ? "shakeit 0.5s" : phase === "select" || phase === "intro" ? "floaty 2.4s ease-in-out infinite" : "none", filter: wildState === "hit" ? "brightness(2.2) saturate(0.3)" : "none" }}>
                <Sprite id={wild.id} color={wild.color} size="100%" style={{ width: "100%", height: "auto" }} />
              </div>
            )}
            <div style={{ position: "absolute", left: "10%", top: "42%", width: "34%", animation: myHit ? "shakeit 0.5s" : "none", filter: myHit ? "brightness(2.2) saturate(0.3)" : "none" }}>
              <Sprite id={mine.id} color={mine.color} back pixelated size="100%" style={{ width: "100%", height: "auto" }} />
            </div>
            {/* 이름 플레이트 */}
            <div style={{ position: "absolute", left: "3%", top: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
                {wild.name} <span style={{ fontSize: 10, color: "#666" }}>Lv.{RARITY[wild.rarity].lv}</span>
                <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: RARITY[wild.rarity].color }}>{RARITY[wild.rarity].label}</span>
              </div>
              <HpBar cur={wildHp} max={RARITY[wild.rarity].hp} />
            </div>
            <div style={{ position: "absolute", right: "3%", bottom: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13 }}>{mine.name} <span style={{ fontSize: 10, color: "#666" }}>Lv.{student.level}</span></div>
              <HpBar cur={student.hp} max={MAX_HP} />
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 2 }}>{student.hp}/{MAX_HP}</div>
            </div>
            {/* 기술 이펙트 */}
            {fx?.kind === "fire" && [0, 1, 2].map((i) => (
              <div key={fx.key + "-" + i} style={{ position: "absolute", width: 18, height: 18, borderRadius: "50%", background: i === 1 ? "#ffd23f" : "#ff6b35", boxShadow: "0 0 14px #ff6b35", animation: `proj 0.85s ease-in ${i * 0.12}s forwards`, opacity: 0 }} />
            ))}
            {fx?.kind === "proj" && (
              <div key={fx.key} style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", background: mine.color, boxShadow: `0 0 14px ${mine.color}`, animation: "proj 0.85s ease-in forwards" }} />
            )}
            {fx?.kind === "projBack" && <div key={fx.key} style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", background: TYPE_COLORS[wild.type], boxShadow: `0 0 14px ${TYPE_COLORS[wild.type]}`, animation: "projBack 0.85s ease-in forwards" }} />}
            {fx?.kind === "electric" && <div key={fx.key} style={{ position: "absolute", inset: 0, background: "#ffe94a", animation: "flash 0.8s ease forwards", pointerEvents: "none" }} />}
            {fx?.kind === "psychic" && <div key={fx.key} style={{ position: "absolute", left: "20%", top: "48%", width: 80, height: 80, borderRadius: "50%", border: "5px solid #c77dff", animation: "pulse 0.9s ease-out forwards", pointerEvents: "none" }} />}
            {(fx?.kind === "ball" || fx?.kind === "wiggle") && wildState !== "gone" && (
              <div key={fx.key} style={{ position: "absolute", width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(#e84545 46%, #2c2c34 46%, #2c2c34 56%, #ffffff 56%)", border: "3px solid #2c2c34", animation: fx.kind === "ball" ? "ballArc 0.72s ease-out forwards" : "wiggle 1.6s ease-in-out", left: fx.kind === "wiggle" ? "66%" : undefined, top: fx.kind === "wiggle" ? "20%" : undefined, zIndex: 5 }} />
            )}
          </div>
        </div>
      )}

      {/* 메시지 박스 */}
      {phase !== "idle" && (
        <div style={{ background: "#f8f0dc", color: "#2c2c34", border: "3px solid #2c2c34", borderRadius: 10, padding: "12px 14px", minHeight: 46, fontSize: 14, lineHeight: 1.5, marginBottom: 8 }}>
          {msg}
        </div>
      )}

      {/* 대기 화면: 내 포켓몬 카드 + 선택 + 진화 (M4) */}
      {phase === "idle" && (
        <div>
          <div style={{ ...S.panel, display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <div style={{ animation: "floaty 2.4s ease-in-out infinite" }}>
              <Sprite id={mine.id} color={mine.color} size={72} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14 }}>
                {mine.name} <span style={{ fontSize: 10, color: "#9fd8ff" }}>Lv.{student.level}</span>
              </div>
              <div style={{ fontSize: 10, color: TYPE_COLORS[mine.type], marginTop: 3 }}>
                {mine.moves.map((m) => m.name).join(" · ")}
              </div>
              {evoTargets.length > 0 ? (
                <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 4 }}>
                  진화까지 배틀 승수 {Math.min(myWins, winsNeeded)}/{winsNeeded}
                  <span style={{ display: "inline-block", width: 60, height: 5, background: "#1a1c2c", borderRadius: 3, marginLeft: 6, verticalAlign: "middle", overflow: "hidden" }}>
                    <span style={{ display: "block", width: `${Math.min(100, (myWins / winsNeeded) * 100)}%`, height: "100%", background: "#7ef29a" }} />
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "#777", marginTop: 4 }}>최종 형태 (승수 {myWins})</div>
              )}
            </div>
            <button onClick={() => setPicker(!picker)} style={{ ...S.ghostBtn, flexShrink: 0 }}>바꾸기</button>
          </div>

          {canEvolve && (
            <div style={{ ...S.panel, marginBottom: 8, textAlign: "center", border: "3px solid #ffd54a" }}>
              <div style={{ fontSize: 13, marginBottom: 8 }}>✨ {mine.name}{josa(mine.name, "이", "가").slice(-1)} 진화하고 싶어한다!</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                {evoTargets.map((to) => (
                  <button key={to} onClick={() => evolve(to)} disabled={busyAction} style={{ ...S.primaryBtn, padding: "8px 14px", fontSize: 13, background: "#e0a63a" }}>
                    <Sprite id={to} silhouette size={22} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    {evoTargets.length > 1 ? `${POOL[to - 1].name}(으)로!` : "진화한다!"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {picker && (
            <div style={{ ...S.panel, marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#9fd8ff", marginBottom: 8 }}>배틀에 데려갈 포켓몬을 고르자 ({ownedIds.length}마리 보유)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 6 }}>
                {ownedIds.map((id) => {
                  const p = POOL[id - 1];
                  const on = id === game.battlePid;
                  return (
                    <button key={id} onClick={() => selectPokemon(id)} disabled={busyAction} style={{ background: on ? "#2c2f44" : "transparent", border: on ? `2px solid ${TYPE_COLORS[p.type]}` : "2px solid #f8f0dc22", borderRadius: 8, padding: 6, cursor: "pointer", fontFamily: "inherit", color: "#f8f0dc" }}>
                      <Sprite id={id} color={p.color} size={40} />
                      <div style={{ fontSize: 9, marginTop: 2 }}>{p.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={start} disabled={activeCount === 0 || battlesLeft <= 0} style={{ ...S.primaryBtn, width: "100%", opacity: activeCount === 0 || battlesLeft <= 0 ? 0.4 : 1 }}>
            야생 포켓몬을 찾는다! (오늘 {battlesLeft}번 남음)
          </button>
          {activeCount === 0 && (
            <div style={{ fontSize: 12, color: "#ff9d9d", marginTop: 8, textAlign: "center" }}>
              출제 중인 문제가 없어요. 선생님이 문제를 등록해야 배틀할 수 있어요.
            </div>
          )}
          {battlesLeft <= 0 && activeCount > 0 && (
            <div style={{ fontSize: 12, color: "#9fd8ff", marginTop: 8, textAlign: "center" }}>
              오늘의 배틀을 모두 마쳤어요. 문제풀이·퀴즈·탐색은 계속할 수 있어요!
            </div>
          )}
        </div>
      )}

      {phase === "intro" && (
        <button onClick={() => { setPhase("select"); setMsg(`가라! ${mine.name}! 기술을 고르자.`); }} style={{ ...S.primaryBtn, width: "100%" }}>
          배틀 시작!
        </button>
      )}

      {phase === "select" && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${moves.length}, 1fr)`, gap: 6 }}>
          {moves.map((m) => {
            const none = countByDiff[m.diff] === 0;
            return (
              <button key={m.name} onClick={() => !none && chooseMove(m)} disabled={none} style={{ ...S.moveBtn(m.diff), opacity: none ? 0.35 : 1 }}>
                <div style={{ fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 10, opacity: 0.9, marginTop: 2 }}>{none ? "문제 없음" : `${m.label} 문제 · 위력 ${m.dmg}`}</div>
              </button>
            );
          })}
          <button onClick={() => { setPhase("done"); setMsg("무사히 도망쳤다!"); }} style={{ ...S.ghostBtn, gridColumn: "1 / -1" }}>도망친다</button>
        </div>
      )}

      {phase === "question" && q && move && (
        <div style={{ ...S.panel, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: "#9fd8ff" }}>{move.label} 문제 · {q.tag}</span>
            <span style={{ color: timeLeft < TIME_LIMIT[move.diff] / 3 ? "#ff8a8a" : "#f8f0dc" }}>⏱ {Math.ceil(timeLeft)}초</span>
          </div>
          <div style={{ height: 7, background: "#1a1c2c", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ width: `${(timeLeft / TIME_LIMIT[move.diff]) * 100}%`, height: "100%", background: timeLeft > (TIME_LIMIT[move.diff] * 2) / 3 ? "#ffd23f" : "#4a90d9", transition: "width 0.1s linear" }} />
          </div>
          <div style={{ fontSize: 15, marginBottom: 10, lineHeight: 1.6 }}>{q.body}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {q.sOpts.map((o, i) => (
              <button key={i} onClick={() => answer(o, timeLeft)} style={S.choiceBtn}>{["①", "②", "③", "④"][i]} {o.t}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 6, textAlign: "center" }}>노란 타이머일 때 맞히면 급소(1.5배)!</div>
        </div>
      )}

      {(phase === "capture" || phase === "throwing") && wild && (
        <div>
          {/* M4: 볼 개수 선택 — 여러 개 던지면 확률 상승, 전부 소모 */}
          <div style={{ ...S.panel, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginBottom: 6, padding: "8px 10px" }}>
            <span style={{ fontSize: 11, color: "#9fd8ff" }}>한 번에 던질 개수</span>
            <button onClick={() => setBallCount(Math.max(1, ballCount - 1))} disabled={phase === "throwing"} style={{ ...S.ghostBtn, padding: "4px 12px", fontSize: 14 }}>−</button>
            <span style={{ fontSize: 16, minWidth: 28, textAlign: "center", color: "#ffd54a" }}>{ballCount}</span>
            <button onClick={() => setBallCount(Math.min(MAX_BALLS_PER_THROW, ballCount + 1))} disabled={phase === "throwing"} style={{ ...S.ghostBtn, padding: "4px 12px", fontSize: 14 }}>＋</button>
            <span style={{ fontSize: 10, color: "#777" }}>(최대 {MAX_BALLS_PER_THROW}개 · 마스터볼은 1개)</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {BALL_KINDS.map((k) => {
              const n = k === "master" ? 1 : ballCount;
              const owned = student.inventory[k];
              const rate = multiCaptureRate(wild.rarity, k, n);
              const disabled = owned < n || phase === "throwing";
              return (
                <button key={k} onClick={() => throwBall(k)} disabled={disabled} style={{ ...S.choiceBtn, opacity: owned < n ? 0.35 : 1 }}>
                  <BallIcon kind={k} size={15} /> {BALLS[k].name} {n > 1 ? `×${n}개` : ""} <span style={{ fontSize: 10, color: "#9fb0d8" }}>(보유 {owned})</span>
                  <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 2 }}>성공률 {Math.round(rate * 100)}%</div>
                </button>
              );
            })}
            <button onClick={() => { setPhase("done"); setMsg("다음에 다시 만나자..."); }} disabled={phase === "throwing"} style={{ ...S.ghostBtn, gridColumn: "1 / -1" }}>
              포기하고 떠난다
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        battlesLeft > 0 ? (
          <button onClick={start} style={{ ...S.primaryBtn, width: "100%" }}>다시 풀숲을 탐색한다 (오늘 {battlesLeft}번 남음)</button>
        ) : (
          <button onClick={() => setPhase("idle")} style={{ ...S.primaryBtn, width: "100%" }}>오늘의 배틀 끝! 돌아가기</button>
        )
      )}
    </div>
  );
}
