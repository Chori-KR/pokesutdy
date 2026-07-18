"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { S } from "@/lib/styles";
import {
  BALLS, BallKind, DIFF, Difficulty, RARITY, TIME_LIMIT, TYPE_COLORS,
  TYPE_MOVE, POOL, Pokemon, Move, MAX_HP, SNACKS, SnackKind,
  EVOLVES_TO, evoWinsNeeded, evoPointCost, isStoneEvo,
  myPokemonOf, captureRate, wildLevelFor, josa, shuffle, sleep,
} from "@/lib/game";
import { ApiQuestion, StudentData, DayInfo, GameInfo } from "@/lib/types";
import Sprite from "@/components/Sprite";
import ShinyFx from "@/components/student/ShinyFx";
import CanvasFx, { isTypeFx } from "@/components/student/CanvasFx";
import BallIcon from "@/components/BallIcon";
import HpBar from "@/components/HpBar";

interface Props {
  student: StudentData;
  setStudent: (s: StudentData) => void;
  moveDiff: boolean; // 교사 설정: 기술 선택 = 난이도 선택
  timerOn: boolean;  // 교사 설정: 배틀 타이머 On/Off
  timeScale: number; // 교사 설정: 제한 시간 배수(넉넉하게)
  caught: number[];
  setCaught: (ids: number[]) => void;
  counts: Record<number, number>;
  setCounts: (c: Record<number, number>) => void;
  shinies: number[];
  setShinies: (s: number[]) => void;
  day: DayInfo;
  setDay: (d: DayInfo) => void;
  game: GameInfo;
  setGame: (g: GameInfo) => void;
  showToast: (t: string) => void;
}

type BattlePhase = "idle" | "intro" | "select" | "question" | "busy" | "capture" | "throwing" | "done";
interface ShuffledOption { t: string; ok: boolean; idx: number }
interface ActiveQuestion extends ApiQuestion { sOpts: ShuffledOption[] }
type Fx = { kind: string; key: number; dir?: "fwd" | "back"; diff?: string } | null;

const BALL_KINDS: BallKind[] = ["poke", "superb", "hyper", "master"];

export default function BattleTab({ student, setStudent, moveDiff, timerOn, timeScale, caught, setCaught, counts, setCounts, shinies, setShinies, day, setDay, game, setGame, showToast }: Props) {
  const [phase, setPhase] = useState<BattlePhase>("idle");
  const timeLimitFor = (diff: Difficulty) => Math.round(TIME_LIMIT[diff] * timeScale);
  const [bank, setBank] = useState<ApiQuestion[] | null>(null);
  const [wild, setWild] = useState<(Pokemon & { token: string; lv: number; shiny?: boolean }) | null>(null);
  const [evoAnim, setEvoAnim] = useState<{ fromId: number; toId: number; toName: string; step: number } | null>(null);
  const [wildHp, setWildHp] = useState(0);
  const [msg, setMsg] = useState("");
  const [move, setMove] = useState<Move | null>(null);
  const [q, setQ] = useState<ActiveQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState<number | null>(null); // 선택→제출 2단계
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selected;
  const [fx, setFx] = useState<Fx>(null);
  const [throwKind, setThrowKind] = useState<BallKind>("poke"); // 애니메이션에 쓸 볼 종류
  const [capFx, setCapFx] = useState<"success" | "fail" | null>(null); // 포획 결과 연출
  const [wildState, setWildState] = useState<"idle" | "hit" | "captured" | "gone">("idle");
  const [myHit, setMyHit] = useState(false);
  const [fails, setFails] = useState(0);
  const [usedQ, setUsedQ] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);   // 포켓몬 선택 패널
  const [sprayAsk, setSprayAsk] = useState<{ snack?: SnackKind } | null>(null); // 스프레이 사용 여부 모달
  const [subject, setSubject] = useState("");    // M7: 배틀 출제 과목 ("" = 전체)
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
  const pointCost = evoPointCost(game.evoCount); // M5: 누적 진화 횟수별 1000/2000/2500P
  const battlesLeft = Math.max(0, day.battleLimit - day.battleUsed);
  const SNACK_KINDS: SnackKind[] = ["snack", "snack2", "snack3"];
  // M9: 도감(caught)엔 있어도 보유 0마리면 배틀에 못 데려감 — count≥1만 선택 가능
  const ownedIds = useMemo(
    () => caught.filter((id) => (counts[id] ?? 0) >= 1).sort((a, b) => a - b),
    [caught, counts]
  );

  // 배틀 진입 시 출제 중 문제 프리로드 (즉답 UX, 명세 §7)
  useEffect(() => {
    fetch("/api/battle/questions")
      .then((r) => r.json())
      .then((data) => setBank(data.questions ?? []))
      .catch(() => setBank([]));
  }, []);

  // M7: 한 배틀은 한 과목 안에서만 출제 — 태그의 "과목·단원"에서 과목 부분으로 묶는다
  const subjectOf = (tag: string) => (tag.split("·")[0] ?? "").trim() || "미분류";
  const subjects = useMemo(
    () => [...new Set((bank ?? []).map((q) => subjectOf(q.tag)))].sort((a, b) => a.localeCompare(b, "ko")),
    [bank]
  );
  const activeBank = useMemo(
    () => (subject ? (bank ?? []).filter((q) => subjectOf(q.tag) === subject) : (bank ?? [])),
    [bank, subject]
  );

  const countByDiff = useMemo(() => {
    const c: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
    activeBank.forEach((x) => c[x.difficulty]++);
    return c;
  }, [activeBank]);
  const activeCount = activeBank.length;

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

  // M5: 진화 3방식 — 승수(wins) / 포인트(points) / 진화의돌(stone, 서버가 페어로 강제)
  async function evolve(to: number, method: "wins" | "points" | "stone") {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const res = await fetch("/api/pokemon/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, method }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "진화에 실패했어요."); return; }
      setGame({ ...game, battlePid: data.battlePid, wins: data.wins, evoCount: data.evoCount });
      setStudent({ ...studentRef.current, points: data.points, inventory: data.inventory });
      // M9: 마리 수 갱신 — 진화 전 -1(0이 돼도 도감엔 남음), 진화체 +1
      setCounts({ ...counts, [data.from.id]: data.from.count, [to]: data.to.count });
      if (!caught.includes(to)) setCaught([...caught, to]); // 진화체를 도감에 추가(진화 전은 유지)
      // M6: 원작풍 진화 연출 — 하얗게 빛나며 변신
      setEvoAnim({ fromId: data.from.id, toId: data.to.id, toName: data.to.name, step: 0 });
      await sleep(1400);
      setEvoAnim((a) => (a ? { ...a, step: 1 } : a));
      await sleep(2400);
      setEvoAnim((a) => (a ? { ...a, step: 2 } : a));
    } catch {
      showToast("연결에 실패했어요.");
    } finally {
      setBusyAction(false);
    }
  }

  // 배틀 진입: 스프레이 보유 시 사용 여부를 먼저 모달로 묻고, 아니면 바로 시작
  function beginBattle(snack?: SnackKind) {
    if ((studentRef.current.inventory.spray ?? 0) > 0) setSprayAsk({ snack });
    else start(snack, false);
  }

  // M5: snack을 주면 일일 제한과 무관한 추가 배틀 (등급 확정 출현)
  async function start(snack?: SnackKind, withSpray = false) {
    setSprayAsk(null);
    setMsg(snack ? `${SNACKS[snack].name}을(를) 풀숲에 놓아두었다...` : "풀숲을 뒤지는 중...");
    setPhase("busy");
    try {
      const spray = withSpray && (studentRef.current.inventory.spray ?? 0) > 0;
      const res = await fetch("/api/battle/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(snack ? { snack } : {}), ...(spray ? { useSpray: true } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? "배틀을 시작할 수 없어요."); setPhase("idle"); return; }
      setDay({ ...day, battleUsed: data.battleUsed, battleLimit: data.battleLimit });
      // M6: 배틀은 풀 HP로 시작 (서버도 동일하게 초기화)
      setStudent({ ...studentRef.current, hp: MAX_HP, ...(data.inventory ? { inventory: data.inventory } : {}) });
      const meta = POOL.find((p) => p.id === data.pokemon.id)!;
      const hp = RARITY[meta.rarity].hp;
      setWild({ ...meta, token: data.token, lv: wildLevelFor(meta.rarity, studentRef.current.level), shiny: data.pokemon.shiny });
      if (data.pokemon.shiny) showToast(`✨ 이로치 ${meta.name}이(가) 나타났다!`);
      setWildHp(hp);
      wildHpRef.current = hp;
      setWildState("idle");
      setCapFx(null);
      setFails(0);
      setUsedQ([]);
      setPhase("intro");
      setMsg(
        snack
          ? `간식 냄새를 맡고 야생의 ${josa(meta.name, "이", "가")} 나타났다!`
          : `앗! 야생의 ${josa(meta.name, "이", "가")} 나타났다!`
      );
    } catch {
      setMsg("서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.");
      setPhase("idle");
    }
  }

  function pickQuestion(diff: Difficulty): ApiQuestion | undefined {
    const all = activeBank; // M7: 선택한 과목 안에서만 출제
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
    setSelected(null);
    setTimeLeft(timeLimitFor(m.diff));
    setPhase("question");
    setMsg(`문제를 맞히면 ${m.name} 발동!`);
  }

  // M6: 배틀 종료 시 자동 완전 회복 (약 시스템 폐지)
  useEffect(() => {
    if (phase !== "done") return;
    if (studentRef.current.hp < MAX_HP) {
      setStudent({ ...studentRef.current, hp: MAX_HP });
      fetch("/api/student/state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hp: MAX_HP }),
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "question") return;
    if (!timerOn) return; // 타이머 끄면 시간 제한 없음
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current);
          const sel = selectedRef.current;
          const opt = sel != null && q ? q.sOpts[sel] : null; // 고른 게 있으면 제출, 없으면 시간초과 오답
          answer(opt, 0);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, q]);

  // 내 공격 이펙트: 타입별 (불꽃/전기/에스퍼는 전용, 나머지는 타입색 투사체)
  async function answer(opt: ShuffledOption | null, remain: number) {
    if (phase !== "question" || !move || !q || !wild) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("busy");
    const total = timeLimitFor(move.diff);
    const correct = !!opt?.ok;
    // 급소: 제한시간 앞 1/3 안에 정답 (명세 §4.2). 타이머 꺼짐이면 급소 없음.
    const crit = correct && timerOn && remain > (total * 2) / 3;

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
        if (!res) return;
        setStudent({ ...studentRef.current, xp: res.xp, level: res.level, points: res.points ?? studentRef.current.points });
        if (res.levelBonus > 0) showToast(`🎉 레벨 업! Lv.${res.level} — 보상 +${res.levelBonus}P`);
      });
      setMsg(`${mine.name}의 ${move.name}!`);
      setFx({ kind: mine.type, key: Date.now(), dir: "fwd", diff: move.diff });
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
      setFx({ kind: wild.type, key: Date.now(), dir: "back", diff: wild.rarity === "legendary" ? "hard" : wild.rarity === "rare" ? "medium" : "easy" });
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
        setMsg(`${mine.name}은(는) 쓰러졌다... 배틀이 끝나고 기운을 차렸다! (HP 회복)`);
        setPhase("done");
      } else {
        setPhase("select");
      }
    }
  }

  async function throwBall(kind: BallKind) {
    if (!wild || studentRef.current.inventory[kind] <= 0) return;
    setPhase("throwing");
    setThrowKind(kind);
    setCapFx(null);
    setMsg(`${BALLS[kind].name}을(를) 던졌다! · · ·`);
    setFx({ kind: "ball", key: Date.now() });

    // 서버 권위 판정 (볼 차감 + RNG). 연출과 병렬로 요청.
    const reqStart = Date.now();
    let result: {
      success: boolean; newlyCaught?: boolean; caughtCount?: number; shiny?: boolean; inventory: StudentData["inventory"];
      points?: number; xp?: number; level?: number; levelBonus?: number;
      reward?: { pts: number; xp: number }; error?: string;
    } | null = null;
    try {
      const res = await fetch("/api/battle/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: wild.token, ball: kind }),
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

    // 볼 포물선 + 흔들림 연출 시간 확보 (속도 업)
    await sleep(Math.max(0, 430 - (Date.now() - reqStart)));
    setWildState("captured");
    setFx({ kind: "wiggle", key: Date.now() });
    await sleep(1080);

    if (result!.success) {
      setFx(null);
      setCapFx("success");
      setWildState("gone");
      setStudent({
        ...studentRef.current,
        inventory: result!.inventory,
        points: result!.points!,
        xp: result!.xp!,
        level: result!.level!,
      });
      if (result!.caughtCount != null) setCounts({ ...counts, [wild.id]: result!.caughtCount });
      if (result!.shiny && !shinies.includes(wild.id)) {
        setShinies([...shinies, wild.id]);
        showToast(`✨ 이로치 ${wild.name}을(를) 도감에 기록했다!`);
      }
      if (result!.newlyCaught && !caught.includes(wild.id)) {
        setCaught([...caught, wild.id]);
        showToast("도감에 새로운 포켓몬이 기록되었다!");
      } else if ((result!.caughtCount ?? 0) > 1) {
        showToast(`${wild.name}을(를) 또 잡았다! (보유 ${result!.caughtCount}마리)`);
      }
      if ((result!.levelBonus ?? 0) > 0) showToast(`🎉 레벨 업! Lv.${result!.level} — 보상 +${result!.levelBonus}P`);
      setMsg(`신난다! ${josa(wild.name, "을", "를")} 잡았다! +${result!.reward!.pts}P +${result!.reward!.xp}XP`);
      setPhase("done");
    } else {
      setFx(null);
      setCapFx("fail");
      setWildState("idle");
      setStudent({ ...studentRef.current, inventory: result!.inventory });
      setTimeout(() => setCapFx(null), 700); // 브레이크아웃 연출 후 정리
      const f = fails + 1;
      setFails(f);
      if (f >= 2) {
        // 누적 2회 실패 시 도망 (명세 §4.2)
        setWildState("gone");
        setMsg(`아앗! 야생 ${josa(wild.name, "이", "가")} 도망쳐 버렸다!`);
        setPhase("done");
      } else {
        setMsg("아... 아깝다! (기회 1번 남음)");
        setPhase("capture");
      }
    }
  }

  if (bank === null)
    return <div style={{ ...S.panel, textAlign: "center", padding: 30, fontSize: 13, color: "#9fd8ff" }}>문제를 불러오는 중...</div>;

  const moves = moveDiff
    ? mine.moves
    : [{ name: mine.moves[1].name, diff: "medium" as Difficulty, dmg: 20, label: "보통" }];

  return (
    <div>
      {/* M6: 진화 연출 오버레이 — 원작처럼 하얗게 빛나며 변신 */}
      {evoAnim && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,10,22,0.94)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: "inherit" }}>
          {evoAnim.step === 2 && (
            <div style={{ position: "absolute", inset: 0, background: "#fff", animation: "flash 0.9s ease forwards", pointerEvents: "none" }} />
          )}
          <div style={{ position: "relative" }}>
            {evoAnim.step < 2 ? (
              <Sprite
                id={evoAnim.fromId}
                size={150}
                style={
                  evoAnim.step === 1
                    ? { filter: "brightness(0) invert(1)", animation: "evoPulse 0.45s ease-in-out infinite" }
                    : { animation: "floaty 1.8s ease-in-out infinite" }
                }
              />
            ) : (
              <Sprite id={evoAnim.toId} size={180} style={{ animation: "pop 0.6s ease-out" }} />
            )}
          </div>
          <div style={{ color: "#f8f0dc", fontSize: 15, textAlign: "center", lineHeight: 1.8, padding: "0 20px" }}>
            {evoAnim.step === 0 && <>어...? {POOL[evoAnim.fromId - 1].name}의 상태가...!</>}
            {evoAnim.step === 1 && <>{POOL[evoAnim.fromId - 1].name}의 모습이 변하고 있다!</>}
            {evoAnim.step === 2 && (
              <>
                🎉 축하합니다! <br />
                <b style={{ color: "#ffd54a", fontSize: 18 }}>{POOL[evoAnim.fromId - 1].name}</b>
                {josa(POOL[evoAnim.fromId - 1].name, "은", "는")}{" "}
                <b style={{ color: "#7ef29a", fontSize: 18 }}>{evoAnim.toName}</b>(으)로 진화했다!
              </>
            )}
          </div>
          {evoAnim.step === 2 && (
            <button onClick={() => setEvoAnim(null)} style={{ ...S.primaryBtn, marginTop: 4 }}>
              최고야!
            </button>
          )}
        </div>
      )}

      {/* 배틀 필드 */}
      {phase !== "idle" && wild && (
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "4px solid #2c2c34", marginBottom: 8 }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "58%", background: "linear-gradient(#9adcf0 0%, #9adcf0 45%, #8fce6e 45%, #7bbf5c 100%)" }}>
            <div style={{ position: "absolute", left: "56%", top: "34%", width: "34%", height: "9%", background: "#6aab4d", borderRadius: "50%", opacity: 0.7 }} />
            <div style={{ position: "absolute", left: "6%", top: "72%", width: "42%", height: "11%", background: "#6aab4d", borderRadius: "50%", opacity: 0.7 }} />
            {wildState !== "gone" && (
              <div style={{ position: "absolute", left: "60%", top: "6%", width: "26%", transition: "transform 0.3s, opacity 0.3s", transform: wildState === "captured" ? "scale(0)" : "scale(1)", opacity: wildState === "captured" ? 0 : 1, animation: capFx === "fail" ? "breakout 0.6s ease-out" : wildState === "hit" ? "shakeit 0.5s" : phase === "select" || phase === "intro" ? "floaty 2.4s ease-in-out infinite" : "none", filter: wildState === "hit" ? "brightness(2.2) saturate(0.3)" : "none" }}>
                <Sprite id={wild.id} color={wild.color} pixel shiny={wild.shiny} size="100%" style={{ width: "100%", height: "auto" }} />
                {wild.shiny && <ShinyFx />}
              </div>
            )}
            <div style={{ position: "absolute", left: "10%", top: "42%", width: "34%", animation: myHit ? "shakeit 0.5s" : "none", filter: myHit ? "brightness(2.2) saturate(0.3)" : "none" }}>
              <Sprite id={mine.id} color={mine.color} back pixelated size="100%" style={{ width: "100%", height: "auto" }} />
            </div>
            {/* 이름 플레이트 */}
            <div style={{ position: "absolute", left: "3%", top: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
                {wild.name} <span style={{ fontSize: 10, color: "#666" }}>Lv.{wild.lv}</span>
                <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: RARITY[wild.rarity].color }}>{RARITY[wild.rarity].label}</span>
              </div>
              <HpBar cur={wildHp} max={RARITY[wild.rarity].hp} />
            </div>
            <div style={{ position: "absolute", right: "3%", bottom: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13 }}>{mine.name} <span style={{ fontSize: 10, color: "#666" }}>Lv.{student.level}</span></div>
              <HpBar cur={student.hp} max={MAX_HP} />
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 2 }}>{student.hp}/{MAX_HP}</div>
            </div>
            {/* 타입별 기술 이펙트 (캔버스 파티클) */}
            <CanvasFx trigger={fx && isTypeFx(fx.kind) ? { type: fx.kind, dir: fx.dir ?? "fwd", diff: fx.diff ?? "medium", key: fx.key } : null} />
            {/* 흡수 빔 (포켓몬이 볼로 빨려 들어감) */}
            {fx?.kind === "wiggle" && wildState === "captured" && (
              <div key={fx.key + "-beam"} style={{ position: "absolute", left: "63%", top: "18%", width: 90, height: 14, marginLeft: -45, marginTop: -7, background: `linear-gradient(90deg, transparent, ${BALLS[throwKind].top ?? "#e84545"})`, borderRadius: 8, animation: "captureBeam 0.5s ease-out forwards", pointerEvents: "none", zIndex: 5 }} />
            )}
            {/* 던진 볼 (볼 종류별 아이콘) */}
            {(fx?.kind === "ball" || fx?.kind === "wiggle") && wildState !== "gone" && (
              <div key={fx.key} style={{ position: "absolute", width: 30, height: 30, animation: fx.kind === "ball" ? "ballArc 0.42s ease-out forwards" : "ballShake3 1.05s ease-in-out", left: fx.kind === "wiggle" ? "63%" : undefined, top: fx.kind === "wiggle" ? "16%" : undefined, transformOrigin: "bottom center", zIndex: 6 }}>
                <BallIcon kind={throwKind} size={30} />
              </div>
            )}
            {/* 포획 성공: 별 터짐 + GET! */}
            {capFx === "success" && (
              <>
                {Array.from({ length: 8 }, (_, i) => {
                  const ang = (i / 8) * Math.PI * 2;
                  const st = { position: "absolute", left: "63%", top: "20%", fontSize: 18, animation: `starPop 0.9s ease-out ${i * 0.03}s forwards`, ["--dx"]: `${Math.cos(ang) * 46}px`, ["--dy"]: `${Math.sin(ang) * 46}px`, pointerEvents: "none", zIndex: 7 } as React.CSSProperties;
                  return <div key={i} style={st}>⭐</div>;
                })}
                <div style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%,-50%)", fontSize: 30, fontWeight: 800, color: "#ffd54a", textShadow: "0 2px 6px #000", animation: "pop 0.4s ease-out", zIndex: 8 }}>GET!</div>
              </>
            )}
            {/* 포획 실패: 볼에서 튀어나오는 펑! */}
            {capFx === "fail" && (
              <div style={{ position: "absolute", left: "63%", top: "18%", transform: "translate(-50%,-50%)", fontSize: 28, animation: "pop 0.4s ease-out", zIndex: 7 }}>💥</div>
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

          {evoTargets.length > 0 && (
            <div style={{ ...S.panel, marginBottom: 8, border: "3px solid #ffd54a" }}>
              <div style={{ fontSize: 12, marginBottom: 8, textAlign: "center" }}>
                ✨ 진화 — 방법을 골라 진화시키자! <span style={{ fontSize: 10, color: "#9fd8ff" }}>(내 {game.evoCount + 1}번째 진화)</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {evoTargets.map((to) => {
                  const stone = isStoneEvo(mine.id, to);
                  return (
                    <div key={to} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, minWidth: 86 }}>
                        <Sprite id={to} silhouette size={20} style={{ verticalAlign: "middle", marginRight: 3 }} />
                        {POOL[to - 1].name}(으)로:
                      </span>
                      {stone ? (
                        <button onClick={() => evolve(to, "stone")} disabled={busyAction || student.inventory.stone < 1} style={{ ...S.primaryBtn, padding: "7px 10px", fontSize: 11, background: "#7c5cd9", opacity: student.inventory.stone < 1 ? 0.45 : 1 }}>
                          💎 진화의돌 사용 (보유 {student.inventory.stone})
                        </button>
                      ) : (
                        <>
                          <button onClick={() => evolve(to, "wins")} disabled={busyAction || myWins < winsNeeded} style={{ ...S.primaryBtn, padding: "7px 10px", fontSize: 11, background: "#3d9970", opacity: myWins < winsNeeded ? 0.45 : 1 }}>
                            ⚔ 배틀 승수 ({Math.min(myWins, winsNeeded)}/{winsNeeded})
                          </button>
                          <button onClick={() => evolve(to, "points")} disabled={busyAction || student.points < pointCost} style={{ ...S.primaryBtn, padding: "7px 10px", fontSize: 11, background: "#e0a63a", opacity: student.points < pointCost ? 0.45 : 1 }}>
                            💰 {pointCost.toLocaleString()}P 사용
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              {evoTargets.some((to) => isStoneEvo(mine.id, to)) && student.inventory.stone < 1 && (
                <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 6, textAlign: "center" }}>진화의돌은 상점에서 1,500P에 살 수 있어요</div>
              )}
            </div>
          )}

          {picker && (
            <div style={{ ...S.panel, marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#9fd8ff", marginBottom: 8 }}>배틀에 데려갈 포켓몬을 고르자 ({ownedIds.length}종 보유)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 6 }}>
                {ownedIds.map((id) => {
                  const p = POOL[id - 1];
                  const on = id === game.battlePid;
                  const n = counts[id] ?? 1;
                  return (
                    <button key={id} onClick={() => selectPokemon(id)} disabled={busyAction} style={{ position: "relative", background: on ? "#2c2f44" : "transparent", border: on ? `2px solid ${TYPE_COLORS[p.type]}` : "2px solid #f8f0dc22", borderRadius: 8, padding: 6, cursor: "pointer", fontFamily: "inherit", color: "#f8f0dc" }}>
                      {n > 1 && <span style={{ position: "absolute", top: 2, right: 2, fontSize: 9, background: "#e07b39", borderRadius: 8, padding: "0 5px" }}>×{n}</span>}
                      <Sprite id={id} color={p.color} size={40} />
                      <div style={{ fontSize: 9, marginTop: 2 }}>{p.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* M7: 출제 과목 선택 — 한 배틀은 한 과목 안에서만 */}
          {subjects.length > 1 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#9fd8ff", flexShrink: 0 }}>출제 과목</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ ...S.input, marginBottom: 0, flex: 1, padding: "8px 10px", fontSize: 12 }}
              >
                <option value="">전체 과목 섞어서</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}만 나오게</option>
                ))}
              </select>
            </div>
          )}

          <button onClick={() => beginBattle()} disabled={activeCount === 0 || battlesLeft <= 0} style={{ ...S.primaryBtn, width: "100%", opacity: activeCount === 0 || battlesLeft <= 0 ? 0.4 : 1 }}>
            야생 포켓몬을 찾는다! (오늘 {battlesLeft}번 남음)
          </button>
          {/* M5: 간식 배틀 — 일일 제한과 무관한 추가 배틀, 등급 확정 출현 */}
          {SNACK_KINDS.some((k) => student.inventory[k] > 0) && activeCount > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {SNACK_KINDS.filter((k) => student.inventory[k] > 0).map((k) => (
                <button key={k} onClick={() => beginBattle(k)} style={{ ...S.choiceBtn, flex: 1, fontSize: 11 }}>
                  {SNACKS[k].emoji} {SNACKS[k].name} 주기 ×{student.inventory[k]}
                  <div style={{ fontSize: 9, color: "#9fd8ff", marginTop: 2 }}>{RARITY[SNACKS[k].rarity].label} 확정 배틀!</div>
                </button>
              ))}
            </div>
          )}
          {activeCount === 0 && (
            <div style={{ fontSize: 12, color: "#ff9d9d", marginTop: 8, textAlign: "center" }}>
              출제 중인 문제가 없어요. 선생님이 문제를 등록해야 배틀할 수 있어요.
            </div>
          )}
          {battlesLeft <= 0 && activeCount > 0 && (
            <div style={{ fontSize: 12, color: "#9fd8ff", marginTop: 8, textAlign: "center" }}>
              오늘의 배틀을 모두 마쳤어요. 상점의 간식🍪으로 추가 배틀을 할 수 있어요!
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
            {timerOn && (
              <span style={{ color: timeLeft < timeLimitFor(move.diff) / 3 ? "#ff8a8a" : "#f8f0dc" }}>⏱ {Math.ceil(timeLeft)}초</span>
            )}
          </div>
          {timerOn && (
            <div style={{ height: 7, background: "#1a1c2c", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ width: `${(timeLeft / timeLimitFor(move.diff)) * 100}%`, height: "100%", background: timeLeft > (timeLimitFor(move.diff) * 2) / 3 ? "#ffd23f" : "#4a90d9", transition: "width 0.1s linear" }} />
            </div>
          )}
          <div style={{ fontSize: 15, marginBottom: 10, lineHeight: 1.6 }}>{q.body}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {q.sOpts.map((o, i) => {
              const on = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{ ...S.choiceBtn, border: on ? "2px solid #ff9a52" : S.choiceBtn.border, background: on ? "#5a4a3a" : S.choiceBtn.background, fontWeight: on ? 700 : 600 }}
                >
                  {["①", "②", "③", "④"][i]} {o.t}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => selected != null && answer(q.sOpts[selected], timeLeft)}
            disabled={selected == null}
            style={{ ...S.primaryBtn, width: "100%", marginTop: 10, opacity: selected == null ? 0.45 : 1 }}
          >
            {selected == null ? "답을 골라주세요" : "정답 제출"}
          </button>
          {timerOn && (
            <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 6, textAlign: "center" }}>노란 타이머일 때 제출하면 급소(1.5배)!</div>
          )}
        </div>
      )}

      {(phase === "capture" || phase === "throwing") && wild && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {BALL_KINDS.map((k) => {
            const rate = captureRate(wild.rarity, k);
            const disabled = student.inventory[k] <= 0 || phase === "throwing";
            return (
              <button key={k} onClick={() => throwBall(k)} disabled={disabled} style={{ ...S.choiceBtn, opacity: student.inventory[k] <= 0 ? 0.35 : 1 }}>
                <BallIcon kind={k} size={15} /> {BALLS[k].name} ×{student.inventory[k]}
                <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 2 }}>성공률 {Math.round(rate * 100)}%</div>
              </button>
            );
          })}
          <button onClick={() => { setPhase("done"); setMsg("다음에 다시 만나자..."); }} disabled={phase === "throwing"} style={{ ...S.ghostBtn, gridColumn: "1 / -1" }}>
            포기하고 떠난다
          </button>
        </div>
      )}

      {phase === "done" && (
        battlesLeft > 0 ? (
          <button onClick={() => beginBattle()} style={{ ...S.primaryBtn, width: "100%" }}>다시 풀숲을 탐색한다 (오늘 {battlesLeft}번 남음)</button>
        ) : (
          <button onClick={() => setPhase("idle")} style={{ ...S.primaryBtn, width: "100%" }}>돌아가기 (간식으로 추가 배틀 가능!)</button>
        )
      )}

      {/* 빛나는 스프레이 사용 여부 모달 */}
      {sprayAsk && (
        <div
          onClick={() => start(sprayAsk.snack, false)}
          style={{ position: "fixed", inset: 0, background: "rgba(8,10,22,0.82)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ ...S.panel, width: "100%", maxWidth: 300, textAlign: "center", padding: 20, animation: "pop 0.25s ease-out" }}>
            <div style={{ fontSize: 34, marginBottom: 4 }}>✨</div>
            <div style={{ fontSize: 15, marginBottom: 4 }}>빛나는 스프레이 (보유 {student.inventory.spray})</div>
            <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 16, lineHeight: 1.6 }}>
              사용하면 이번 야생을 <b style={{ color: "#ffd54a" }}>이로치로 확정</b>해요! (1개 소모)
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => start(sprayAsk.snack, false)} style={{ ...S.ghostBtn, flex: 1, padding: "10px 0", fontSize: 13 }}>그냥 시작</button>
              <button onClick={() => start(sprayAsk.snack, true)} style={{ ...S.primaryBtn, flex: 1, padding: "10px 0", fontSize: 13 }}>✨ 사용하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
