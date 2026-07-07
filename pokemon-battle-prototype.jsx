import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────
const SPRITE = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const BACK_SPRITE = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;

const MY_POKEMON = {
  id: 6,
  name: "리자몽",
  color: "#f2913d",
  maxHp: 100,
  moves: [
    { name: "불꽃세례", diff: "easy", dmg: 10, type: "fire", label: "쉬움" },
    { name: "화염방사", diff: "medium", dmg: 20, type: "fire", label: "보통" },
    { name: "오버히트", diff: "hard", dmg: 35, type: "fire", label: "어려움" },
  ],
};

const WILD_POOL = [
  { id: 10, name: "캐터피", color: "#8bc34a", rarity: "common", hp: 40, atk: 8, move: "몸통박치기", moveType: "normal" },
  { id: 16, name: "구구", color: "#c8a165", rarity: "common", hp: 45, atk: 10, move: "바람일으키기", moveType: "normal" },
  { id: 19, name: "꼬렛", color: "#9575cd", rarity: "common", hp: 40, atk: 9, move: "몸통박치기", moveType: "normal" },
  { id: 25, name: "피카츄", color: "#ffd54a", rarity: "rare", hp: 70, atk: 14, move: "전기쇼크", moveType: "electric" },
  { id: 133, name: "이브이", color: "#a1745b", rarity: "rare", hp: 65, atk: 13, move: "몸통박치기", moveType: "normal" },
  { id: 150, name: "뮤츠", color: "#b39ddb", rarity: "legendary", hp: 120, atk: 22, move: "염동력", moveType: "psychic" },
];

const RARITY = {
  common: { label: "흔함", color: "#7ec8a8", catch: 0.9, xp: 20 },
  rare: { label: "희귀", color: "#f2b04c", catch: 0.6, xp: 40 },
  legendary: { label: "전설", color: "#c77dff", catch: 0.3, xp: 100 },
};

const TIME_LIMIT = { easy: 15, medium: 25, hard: 40 };

// 초5 수학 — 분수의 덧셈과 뺄셈
const QUESTIONS = [
  { id: 1, d: "easy", q: "1/5 + 2/5 = ?", a: "3/5", w: ["3/10", "2/25", "4/5"] },
  { id: 2, d: "easy", q: "3/7 + 2/7 = ?", a: "5/7", w: ["5/14", "6/7", "5/49"] },
  { id: 3, d: "easy", q: "5/8 − 2/8 = ?", a: "3/8", w: ["3/16", "7/8", "3/64"] },
  { id: 4, d: "easy", q: "2/6 + 3/6 = ?", a: "5/6", w: ["5/12", "5/36", "6/6"] },
  { id: 5, d: "easy", q: "7/10 − 3/10 = ?", a: "2/5", w: ["4/20", "1/10", "10/10"] },
  { id: 6, d: "medium", q: "1/2 + 1/3 = ?", a: "5/6", w: ["2/5", "2/6", "1/6"] },
  { id: 7, d: "medium", q: "1/4 + 2/3 = ?", a: "11/12", w: ["3/7", "3/12", "8/12"] },
  { id: 8, d: "medium", q: "3/4 − 1/2 = ?", a: "1/4", w: ["1/2", "3/8", "1/8"] },
  { id: 9, d: "medium", q: "2/5 + 3/10 = ?", a: "7/10", w: ["5/15", "5/10", "6/15"] },
  { id: 10, d: "medium", q: "5/6 − 1/4 = ?", a: "7/12", w: ["4/12", "1/2", "2/3"] },
  { id: 11, d: "hard", q: "1/2 + 1/3 + 1/6 = ?", a: "1", w: ["11/12", "3/11", "5/6"] },
  { id: 12, d: "hard", q: "철수는 피자의 1/4을, 영희는 3/8을 먹었습니다. 두 사람이 먹은 피자는 전체의 얼마일까요?", a: "5/8", w: ["4/12", "1/2", "7/8"] },
  { id: 13, d: "hard", q: "3/4 − 1/3 + 1/6 = ?", a: "7/12", w: ["5/12", "1/2", "2/3"] },
  { id: 14, d: "hard", q: "물통에 물이 5/6 만큼 있었습니다. 1/2 을 마시고 1/4 을 다시 부으면 물은 얼마일까요?", a: "7/12", w: ["1/3", "5/12", "2/3"] },
];

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const hasJong = (s) => {
  const c = s.charCodeAt(s.length - 1);
  return c >= 44032 && c <= 55203 && (c - 44032) % 28 > 0;
};
const josa = (name, a, b) => name + (hasJong(name) ? a : b);

const pickWild = () => {
  const r = Math.random();
  const pool =
    r < 0.65
      ? WILD_POOL.filter((p) => p.rarity === "common")
      : r < 0.95
      ? WILD_POOL.filter((p) => p.rarity === "rare")
      : WILD_POOL.filter((p) => p.rarity === "legendary");
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─────────────────────────────────────────────
// 작은 컴포넌트들
// ─────────────────────────────────────────────
function Sprite({ src, size, flip, pixelated, style, mon }) {
  const [err, setErr] = useState(false);
  if (err) {
    const color = mon?.color || "#9fd8ff";
    return (
      <div style={{ width: size, aspectRatio: "1 / 1", position: "relative", ...style }}>
        <div
          style={{
            position: "absolute",
            left: "12%",
            top: "14%",
            width: "76%",
            height: "72%",
            background: color,
            border: "4px solid #2c2c3488",
            borderRadius: "48% 52% 55% 45% / 55% 50% 50% 45%",
            animation: "floaty 2.6s ease-in-out infinite",
          }}
        >
          <div style={{ position: "absolute", left: "24%", top: "32%", width: "18%", height: "22%", background: "#fff", borderRadius: "50%" }}>
            <div style={{ position: "absolute", left: "30%", top: "35%", width: "45%", height: "45%", background: "#2c2c34", borderRadius: "50%" }} />
          </div>
          <div style={{ position: "absolute", right: "24%", top: "32%", width: "18%", height: "22%", background: "#fff", borderRadius: "50%" }}>
            <div style={{ position: "absolute", left: "30%", top: "35%", width: "45%", height: "45%", background: "#2c2c34", borderRadius: "50%" }} />
          </div>
          <div style={{ position: "absolute", left: "38%", bottom: "22%", width: "24%", height: "8%", background: "#2c2c3466", borderRadius: "0 0 50% 50%" }} />
        </div>
        {mon?.name && (
          <div style={{ position: "absolute", bottom: "-2%", width: "100%", textAlign: "center", fontSize: 12, color: "#2c2c34", background: "#f8f0dcbb", borderRadius: 6 }}>
            {mon.name}
          </div>
        )}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setErr(true)}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: pixelated ? "pixelated" : "auto",
        transform: flip ? "scaleX(-1)" : "none",
        ...style,
      }}
    />
  );
}

function HpBar({ cur, max, width = 120 }) {
  const pct = Math.max(0, (cur / max) * 100);
  const color = pct > 50 ? "#4cd964" : pct > 20 ? "#f2c94c" : "#eb5757";
  return (
    <div
      style={{
        width,
        height: 10,
        background: "#3a3a44",
        borderRadius: 5,
        overflow: "hidden",
        border: "2px solid #2c2c34",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          transition: "width 0.8s ease, background 0.4s",
        }}
      />
    </div>
  );
}

function Plate({ name, level, cur, max, rarity, showNum, xp, align }) {
  return (
    <div
      style={{
        background: "#f8f0dc",
        border: "3px solid #2c2c34",
        borderRadius: 10,
        padding: "8px 12px",
        minWidth: 190,
        boxShadow: "3px 3px 0 #2c2c3466",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ fontWeight: "bold", fontSize: 15 }}>{name}</span>
        <span style={{ fontSize: 12, color: "#666" }}>Lv.{level}</span>
        {rarity && (
          <span
            style={{
              fontSize: 10,
              padding: "1px 6px",
              borderRadius: 8,
              background: RARITY[rarity].color,
              color: "#2c2c34",
            }}
          >
            {RARITY[rarity].label}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10, color: "#e07b39", fontWeight: "bold" }}>HP</span>
        <HpBar cur={cur} max={max} />
      </div>
      {showNum && (
        <div style={{ fontSize: 11, textAlign: "right", marginTop: 2, color: "#444" }}>
          {Math.max(0, Math.round(cur))} / {max}
        </div>
      )}
      {xp !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 9, color: "#4a90d9", fontWeight: "bold" }}>XP</span>
          <div style={{ flex: 1, height: 5, background: "#3a3a44", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${xp}%`, height: "100%", background: "#4a90d9", transition: "width 0.6s" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("intro"); // intro | select | question | busy | capture | throwing | summary
  const [wild, setWild] = useState(pickWild);
  const [wildHp, setWildHp] = useState(0);
  const [myHp, setMyHp] = useState(MY_POKEMON.maxHp);
  const [level, setLevel] = useState(16);
  const [xp, setXp] = useState(20);
  const [balls, setBalls] = useState(5);
  const [msg, setMsg] = useState("");
  const [currentQ, setCurrentQ] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fx, setFx] = useState(null); // {kind, key}
  const [wildState, setWildState] = useState("idle"); // idle | hit | captured | gone
  const [myState, setMyState] = useState("idle");
  const [failThrow, setFailThrow] = useState(0);
  const [summary, setSummary] = useState(null); // caught | fled | fainted | ran
  const [caught, setCaught] = useState([]);
  const [answered, setAnswered] = useState({ ok: 0, total: 0 });
  const [usedQ, setUsedQ] = useState([]);
  const [pickedOpt, setPickedOpt] = useState(null);

  const timerRef = useRef(null);
  const wildHpRef = useRef(0);
  const myHpRef = useRef(MY_POKEMON.maxHp);
  const setWHp = (v) => { wildHpRef.current = v; setWildHp(v); };
  const setMHp = (v) => { myHpRef.current = v; setMyHp(v); };

  // 첫 조우
  useEffect(() => { startEncounter(wild); }, []);

  function startEncounter(w) {
    setWHp(w.hp);
    setMHp(MY_POKEMON.maxHp);
    setWildState("idle");
    setMyState("idle");
    setFailThrow(0);
    setSummary(null);
    setUsedQ([]);
    setPhase("intro");
    setMsg(`앗! 야생의 ${josa(w.name, "이", "가")} 나타났다!`);
  }

  function newEncounter() {
    const w = pickWild();
    setWild(w);
    startEncounter(w);
  }

  function gainXp(n) {
    setXp((prev) => {
      let v = prev + n;
      let ups = 0;
      while (v >= 100) { v -= 100; ups++; }
      if (ups > 0) setLevel((l) => l + ups);
      return v;
    });
  }

  // ── 기술 선택 → 문제 출제 ──
  function chooseMove(move) {
    let pool = QUESTIONS.filter((q) => q.d === move.diff && !usedQ.includes(q.id));
    if (pool.length === 0) pool = QUESTIONS.filter((q) => q.d === move.diff);
    const q = pool[Math.floor(Math.random() * pool.length)];
    setUsedQ((u) => [...u, q.id]);
    const opts = shuffle([{ t: q.a, ok: true }, ...q.w.map((t) => ({ t, ok: false }))]);
    setSelectedMove(move);
    setCurrentQ({ ...q, opts });
    setPickedOpt(null);
    setTimeLeft(TIME_LIMIT[move.diff]);
    setPhase("question");
    setMsg(`${move.name}을(를) 쓰려면 문제를 맞혀라!`);
  }

  // ── 타이머 ──
  useEffect(() => {
    if (phase !== "question") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          handleAnswer(null, 0);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [phase, currentQ]);

  // ── 답 처리 ──
  async function handleAnswer(opt, remain) {
    if (phase !== "question") return;
    clearInterval(timerRef.current);
    setPickedOpt(opt);
    setPhase("busy");
    const move = selectedMove;
    const total = TIME_LIMIT[move.diff];
    const crit = opt?.ok && remain > (total * 2) / 3;
    setAnswered((s) => ({ ok: s.ok + (opt?.ok ? 1 : 0), total: s.total + 1 }));

    await sleep(600);

    if (opt?.ok) {
      gainXp(2);
      setMsg(`${MY_POKEMON.name}의 ${move.name}!`);
      setFx({ kind: "fire", key: Date.now() });
      await sleep(900);
      setWildState("hit");
      setFx({ kind: "shake-wild", key: Date.now() });
      const dmg = Math.round(move.dmg * (crit ? 1.5 : 1));
      const newHp = Math.max(0, wildHpRef.current - dmg);
      setWHp(newHp);
      if (crit) { setMsg("급소에 맞았다!"); await sleep(900); }
      await sleep(700);
      setWildState("idle");
      if (newHp <= 0) {
        setMsg(`야생 ${josa(wild.name, "이", "가")} 쓰러졌다! 몬스터볼을 던지자!`);
        setPhase("capture");
      } else {
        setMsg("효과가 좋았다! 다음 기술을 고르자.");
        setPhase("select");
      }
    } else {
      setMsg(
        opt === null
          ? `시간 초과! ${MY_POKEMON.name}의 ${move.name}은(는) 빗나갔다!`
          : `${MY_POKEMON.name}의 ${move.name}! ...그러나 빗나갔다!`
      );
      await sleep(1100);
      setMsg(`야생 ${wild.name}의 ${wild.move}!`);
      setFx({ kind: wild.moveType, key: Date.now() });
      await sleep(900);
      setMyState("hit");
      setFx({ kind: "shake-my", key: Date.now() });
      const newHp = Math.max(0, myHpRef.current - wild.atk);
      setMHp(newHp);
      await sleep(700);
      setMyState("idle");
      if (newHp <= 0) {
        setMsg(`${MY_POKEMON.name}은(는) 쓰러졌다...`);
        await sleep(1000);
        setSummary("fainted");
        setPhase("summary");
      } else {
        setMsg("정답을 확인하고 다시 도전하자!");
        setPhase("select");
      }
    }
  }

  // ── 포획 ──
  async function throwBall() {
    if (balls <= 0) return;
    setBalls((b) => b - 1);
    setPhase("throwing");
    setMsg("몬스터볼을 던졌다!");
    setFx({ kind: "ball", key: Date.now() });
    await sleep(750);
    setWildState("captured");
    await sleep(400);
    setFx({ kind: "wiggle", key: Date.now() });
    setMsg("· · ·");
    await sleep(1800);
    const ok = Math.random() < RARITY[wild.rarity].catch;
    if (ok) {
      setFx(null);
      setWildState("gone");
      setMsg(`신난다! ${josa(wild.name, "을", "를")} 잡았다!`);
      setCaught((c) => [...c, wild]);
      gainXp(RARITY[wild.rarity].xp);
      await sleep(1200);
      setSummary("caught");
      setPhase("summary");
    } else {
      setFx(null);
      setWildState("idle");
      const fails = failThrow + 1;
      setFailThrow(fails);
      if (fails >= 2) {
        setMsg(`아앗! 야생 ${josa(wild.name, "이", "가")} 도망쳐 버렸다!`);
        setWildState("gone");
        await sleep(1000);
        setSummary("fled");
        setPhase("summary");
      } else {
        setMsg("아... 아깝다! 조금만 더 하면 잡을 수 있었는데!");
        setPhase("capture");
      }
    }
  }

  function runAway() {
    setSummary("ran");
    setMsg("무사히 도망쳤다!");
    setPhase("summary");
  }

  // ─────────────────────────────
  // 렌더
  // ─────────────────────────────
  const rate = answered.total > 0 ? Math.round((answered.ok / answered.total) * 100) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#1a1c2c", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", fontFamily: "'DGM', 'Galmuri11', sans-serif", color: "#f8f0dc" }}>
      <style>{`
        @font-face {
          font-family: 'DGM';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/DungGeunMo.woff') format('woff');
          font-display: swap;
        }
        @keyframes proj {
          0% { left: 22%; top: 58%; opacity: 1; transform: scale(0.6); }
          70% { opacity: 1; }
          100% { left: 68%; top: 24%; opacity: 0; transform: scale(1.2); }
        }
        @keyframes projBack {
          0% { left: 68%; top: 26%; opacity: 1; transform: scale(0.6); }
          70% { opacity: 1; }
          100% { left: 24%; top: 56%; opacity: 0; transform: scale(1.2); }
        }
        @keyframes flash { 0%,100% { opacity: 0; } 30%,60% { opacity: 0.75; } }
        @keyframes pulse {
          0% { transform: scale(0.3); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes shakeit {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-9px); } 40% { transform: translateX(9px); }
          60% { transform: translateX(-6px); } 80% { transform: translateX(6px); }
        }
        @keyframes ballArc {
          0% { left: 22%; top: 62%; transform: rotate(0deg) scale(1); }
          50% { top: 10%; }
          100% { left: 66%; top: 22%; transform: rotate(720deg) scale(1); }
        }
        @keyframes wiggle {
          0%,100% { transform: rotate(0); }
          15% { transform: rotate(-22deg); } 30% { transform: rotate(20deg); }
          45% { transform: rotate(0); } 60% { transform: rotate(-22deg); }
          75% { transform: rotate(20deg); } 90% { transform: rotate(0); }
        }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .hitflash { filter: brightness(2.2) saturate(0.3); }
        button:active { transform: scale(0.97); }
      `}</style>

      {/* ── 상단 세션 바 ── */}
      <div style={{ width: "100%", maxWidth: 640, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontSize: 13, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 15 }}>포켓 스터디 · 배틀 프로토타입</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span>몬스터볼 ×{balls}</span>
          <button onClick={() => setBalls((b) => b + 5)} style={{ fontFamily: "inherit", fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "2px solid #f8f0dc55", background: "transparent", color: "#f8f0dc", cursor: "pointer" }}>
            볼 +5 (테스트)
          </button>
          {rate !== null && <span style={{ color: "#9fd8ff" }}>정답률 {rate}%</span>}
        </div>
      </div>

      {/* ── 배틀 필드 ── */}
      <div style={{ width: "100%", maxWidth: 640, position: "relative", borderRadius: 16, overflow: "hidden", border: "4px solid #2c2c34", boxShadow: "0 8px 0 #00000055" }}>
        <div style={{ position: "relative", width: "100%", paddingTop: "62%", background: "linear-gradient(#9adcf0 0%, #9adcf0 45%, #8fce6e 45%, #7bbf5c 100%)" }}>
          {/* 발판 */}
          <div style={{ position: "absolute", left: "56%", top: "34%", width: "34%", height: "9%", background: "#6aab4d", borderRadius: "50%", opacity: 0.7 }} />
          <div style={{ position: "absolute", left: "6%", top: "72%", width: "42%", height: "11%", background: "#6aab4d", borderRadius: "50%", opacity: 0.7 }} />

          {/* 야생 포켓몬 */}
          {wildState !== "gone" && (
            <div style={{ position: "absolute", left: "60%", top: "8%", width: "26%", transition: "transform 0.3s, opacity 0.3s", transform: wildState === "captured" ? "scale(0)" : "scale(1)", opacity: wildState === "captured" ? 0 : 1, animation: phase === "intro" || phase === "select" ? "floaty 2.4s ease-in-out infinite" : "none" }} className={wildState === "hit" ? "hitflash" : ""}>
            <Sprite src={SPRITE(wild.id)} size="100%" mon={wild} style={{ width: "100%", height: "auto" }} />
            </div>
          )}

          {/* 내 포켓몬 (등짝) */}
          <div style={{ position: "absolute", left: "10%", top: "44%", width: "34%" }} className={myState === "hit" ? "hitflash" : ""}>
            <Sprite src={BACK_SPRITE(MY_POKEMON.id)} size="100%" pixelated mon={MY_POKEMON} style={{ width: "100%", height: "auto" }} />
          </div>

          {/* HP 플레이트 */}
          <div style={{ position: "absolute", left: "3%", top: "5%" }}>
            <Plate name={wild.name} level={wild.rarity === "legendary" ? 30 : wild.rarity === "rare" ? 12 : 5} cur={wildHp} max={wild.hp} rarity={wild.rarity} />
          </div>
          <div style={{ position: "absolute", right: "3%", bottom: "5%" }}>
            <Plate name={MY_POKEMON.name} level={level} cur={myHp} max={MY_POKEMON.maxHp} showNum xp={xp} />
          </div>

          {/* ── 이펙트 레이어 ── */}
          {fx?.kind === "fire" && (
            <div key={fx.key}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", background: i === 1 ? "#ffd23f" : "#ff6b35", boxShadow: "0 0 14px #ff6b35", animation: `proj 0.85s ease-in ${i * 0.12}s forwards`, opacity: 0 }} />
              ))}
            </div>
          )}
          {(fx?.kind === "normal" || fx?.kind === "psychic" || fx?.kind === "electric") && fx?.kind !== "electric" && (
            <div key={fx.key} style={{ position: "absolute", width: 22, height: 22, borderRadius: "50%", background: fx.kind === "psychic" ? "#c77dff" : "#e0e0e0", boxShadow: `0 0 14px ${fx.kind === "psychic" ? "#c77dff" : "#ffffff"}`, animation: "projBack 0.85s ease-in forwards" }} />
          )}
          {fx?.kind === "electric" && (
            <div key={fx.key} style={{ position: "absolute", inset: 0, background: "#ffe94a", animation: "flash 0.8s ease forwards", pointerEvents: "none" }} />
          )}
          {fx?.kind === "psychic" && (
            <div key={fx.key + "p"} style={{ position: "absolute", left: "20%", top: "50%", width: 90, height: 90, borderRadius: "50%", border: "5px solid #c77dff", animation: "pulse 0.9s ease-out forwards", pointerEvents: "none" }} />
          )}
          {fx?.kind === "shake-wild" && (
            <style key={fx.key}>{`.hitflash { animation: shakeit 0.5s; }`}</style>
          )}
          {fx?.kind === "shake-my" && (
            <style key={fx.key}>{`.hitflash { animation: shakeit 0.5s; }`}</style>
          )}
          {(fx?.kind === "ball" || fx?.kind === "wiggle") && wildState !== "gone" && (
            <div key={fx.key} style={{ position: "absolute", width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(#e84545 48%, #2c2c34 48%, #2c2c34 56%, #ffffff 56%)", border: "3px solid #2c2c34", animation: fx.kind === "ball" ? "ballArc 0.72s ease-out forwards" : "wiggle 1.7s ease-in-out", left: fx.kind === "wiggle" ? "66%" : undefined, top: fx.kind === "wiggle" ? "22%" : undefined, zIndex: 5 }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 9, height: 9, borderRadius: "50%", background: "#fff", border: "2px solid #2c2c34", transform: "translate(-50%,-50%)" }} />
            </div>
          )}
        </div>
      </div>

      {/* ── 메시지 박스 ── */}
      <div style={{ width: "100%", maxWidth: 640, marginTop: 10, background: "#f8f0dc", color: "#2c2c34", border: "4px solid #2c2c34", borderRadius: 12, padding: "14px 16px", minHeight: 64, fontSize: 16, lineHeight: 1.5, boxShadow: "0 5px 0 #00000044" }}>
        {msg}
      </div>

      {/* ── 조작 영역 ── */}
      <div style={{ width: "100%", maxWidth: 640, marginTop: 10 }}>
        {phase === "intro" && (
          <button onClick={() => { setPhase("select"); setMsg(`가라! ${MY_POKEMON.name}! 기술을 고르자.`); }} style={btn("#e07b39", true)}>
            배틀 시작!
          </button>
        )}

        {phase === "select" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {MY_POKEMON.moves.map((m) => (
              <button key={m.name} onClick={() => chooseMove(m)} style={btn(m.diff === "easy" ? "#3d9970" : m.diff === "medium" ? "#e0a63a" : "#d64545")}>
                <div style={{ fontSize: 15 }}>{m.name}</div>
                <div style={{ fontSize: 11, opacity: 0.9, marginTop: 3 }}>
                  {m.label} 문제 · 위력 {m.dmg}
                </div>
              </button>
            ))}
            <button onClick={runAway} style={{ ...btn("#5a5a66"), gridColumn: "1 / -1", padding: "8px" }}>
              도망친다
            </button>
          </div>
        )}

        {phase === "question" && currentQ && (
          <div style={{ background: "#2c2f44", border: "3px solid #f8f0dc33", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: "#9fd8ff" }}>{selectedMove.label} 문제 · {selectedMove.name}</span>
              <span style={{ color: timeLeft < TIME_LIMIT[selectedMove.diff] / 3 ? "#ff8a8a" : "#f8f0dc" }}>
                ⏱ {Math.ceil(timeLeft)}초
              </span>
            </div>
            <div style={{ height: 8, background: "#1a1c2c", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ width: `${(timeLeft / TIME_LIMIT[selectedMove.diff]) * 100}%`, height: "100%", background: timeLeft > (TIME_LIMIT[selectedMove.diff] * 2) / 3 ? "#ffd23f" : "#4a90d9", transition: "width 0.1s linear" }} />
            </div>
            <div style={{ fontSize: 17, marginBottom: 12, lineHeight: 1.6 }}>{currentQ.q}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {currentQ.opts.map((o, i) => (
                <button key={i} onClick={() => handleAnswer(o, timeLeft)} style={{ ...btn("#3a3f5c"), fontSize: 16, padding: "12px" }}>
                  {["①", "②", "③", "④"][i]} {o.t}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#9fd8ff", marginTop: 8, textAlign: "center" }}>
              남은 시간 노란색일 때 맞히면 급소(1.5배)!
            </div>
          </div>
        )}

        {phase === "busy" && currentQ && pickedOpt !== undefined && (
          <div style={{ textAlign: "center", fontSize: 13, color: "#9fd8ff", padding: 8 }}>
            {pickedOpt?.ok ? "정답!" : `정답은 ${currentQ.a} 이었다.`}
          </div>
        )}

        {phase === "capture" && (
          <div style={{ display: "grid", gridTemplateColumns: balls > 0 ? "1fr 1fr" : "1fr", gap: 8 }}>
            {balls > 0 ? (
              <>
                <button onClick={throwBall} style={btn("#e84545")}>
                  몬스터볼 던지기 (×{balls})
                  <div style={{ fontSize: 11, opacity: 0.9, marginTop: 3 }}>
                    성공률 {Math.round(RARITY[wild.rarity].catch * 100)}% · 기회 {2 - failThrow}번
                  </div>
                </button>
                <button onClick={runAway} style={btn("#5a5a66")}>포기하고 떠난다</button>
              </>
            ) : (
              <button onClick={runAway} style={btn("#5a5a66")}>가방이 비었다... 떠난다 (상단에서 볼 충전)</button>
            )}
          </div>
        )}

        {phase === "summary" && (
          <div style={{ background: "#2c2f44", border: "3px solid #f8f0dc33", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 17, marginBottom: 8 }}>
              {summary === "caught" && `${wild.name} 포획 성공! +${RARITY[wild.rarity].xp} XP`}
              {summary === "fled" && "다음엔 꼭 잡자!"}
              {summary === "fainted" && `${MY_POKEMON.name}이(가) 기절했다... (프로토타입: 자동 회복)`}
              {summary === "ran" && "다음 상대를 찾아보자!"}
            </div>
            <button onClick={newEncounter} style={{ ...btn("#e07b39"), maxWidth: 280, margin: "0 auto" }}>
              풀숲을 탐색한다
            </button>
          </div>
        )}
      </div>

      {/* ── 이번 세션 도감 ── */}
      <div style={{ width: "100%", maxWidth: 640, marginTop: 14, fontSize: 12 }}>
        <div style={{ marginBottom: 6, color: "#9fd8ff" }}>이번 세션에서 잡은 포켓몬 ({caught.length})</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {caught.length === 0 && <span style={{ opacity: 0.5 }}>아직 없음 — 배틀에서 이겨 포획해 보자!</span>}
          {caught.map((c, i) => (
            <div key={i} style={{ background: "#2c2f44", borderRadius: 10, padding: "6px 10px 4px", display: "flex", flexDirection: "column", alignItems: "center", border: "2px solid #f8f0dc22" }}>
              <Sprite src={SPRITE(c.id)} size={44} mon={c} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function btn(color, big) {
  return {
    fontFamily: "inherit",
    width: "100%",
    padding: big ? "14px" : "10px 8px",
    fontSize: big ? 17 : 14,
    borderRadius: 10,
    border: "3px solid #2c2c34",
    background: color,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 0 #2c2c3499",
    transition: "transform 0.05s",
  };
}
