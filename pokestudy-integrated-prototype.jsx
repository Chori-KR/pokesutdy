import { useState, useEffect, useRef } from "react";

// ═════════════════════════════════════════════
// 포켓 스터디 · 4단계 통합 프로토타입
// 학생(배틀·문제풀이·퀴즈·탐색·상점·도감) + 교사(문제은행·AI생성·설정)
// ═════════════════════════════════════════════

const SPRITE = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const BACK_SPRITE = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;

const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
  ghost: "#705898", dragon: "#7038F8", fairy: "#EE99AC",
};
const TYPE_MOVE = {
  normal: "몸통박치기", fire: "불꽃세례", water: "물대포", electric: "전기쇼크",
  grass: "덩굴채찍", ice: "눈보라", fighting: "태권당수", poison: "독침",
  ground: "모래뿌리기", psychic: "염동력", bug: "실뿜기", rock: "돌떨구기",
  ghost: "핥기", dragon: "용의숨결", fairy: "박치기",
};

const GEN1 = [
  ["이상해씨","grass"],["이상해풀","grass"],["이상해꽃","grass"],["파이리","fire"],["리자드","fire"],
  ["리자몽","fire"],["꼬부기","water"],["어니부기","water"],["거북왕","water"],["캐터피","bug"],
  ["단데기","bug"],["버터플","bug"],["뿔충이","bug"],["딱충이","bug"],["독침붕","bug"],
  ["구구","normal"],["피죤","normal"],["피죤투","normal"],["꼬렛","normal"],["레트라","normal"],
  ["깨비참","normal"],["깨비드릴조","normal"],["아보","poison"],["아보크","poison"],["피카츄","electric"],
  ["라이츄","electric"],["모래두지","ground"],["고지","ground"],["니드런♀","poison"],["니드리나","poison"],
  ["니드퀸","poison"],["니드런♂","poison"],["니드리노","poison"],["니드킹","poison"],["삐삐","fairy"],
  ["픽시","fairy"],["식스테일","fire"],["나인테일","fire"],["푸린","fairy"],["푸크린","fairy"],
  ["주뱃","poison"],["골뱃","poison"],["뚜벅쵸","grass"],["냄새꼬","grass"],["라플레시아","grass"],
  ["파라스","bug"],["파라섹트","bug"],["콘팡","bug"],["도나리","bug"],["디그다","ground"],
  ["닥트리오","ground"],["나옹","normal"],["페르시온","normal"],["고라파덕","water"],["골덕","water"],
  ["망키","fighting"],["성원숭","fighting"],["가디","fire"],["윈디","fire"],["발챙이","water"],
  ["슈륙챙이","water"],["강챙이","water"],["캐이시","psychic"],["윤겔라","psychic"],["후딘","psychic"],
  ["알통몬","fighting"],["근육몬","fighting"],["괴력몬","fighting"],["모다피","grass"],["우츠동","grass"],
  ["우츠보트","grass"],["왕눈해","water"],["독파리","water"],["꼬마돌","rock"],["데구리","rock"],
  ["딱구리","rock"],["포니타","fire"],["날쌩마","fire"],["야돈","water"],["야도란","water"],
  ["코일","electric"],["레어코일","electric"],["파오리","normal"],["두두","normal"],["두트리오","normal"],
  ["쥬쥬","water"],["쥬레곤","water"],["질퍽이","poison"],["질뻐기","poison"],["셀러","water"],
  ["파르셀","water"],["고오스","ghost"],["고우스트","ghost"],["팬텀","ghost"],["롱스톤","rock"],
  ["슬리프","psychic"],["슬리퍼","psychic"],["크랩","water"],["킹크랩","water"],["찌리리공","electric"],
  ["붐볼","electric"],["아라리","grass"],["나시","grass"],["탕구리","ground"],["텅구리","ground"],
  ["시라소몬","fighting"],["홍수몬","fighting"],["내루미","normal"],["또가스","poison"],["또도가스","poison"],
  ["뿔카노","rock"],["코뿌리","rock"],["럭키","normal"],["덩쿠리","grass"],["캥카","normal"],
  ["쏘드라","water"],["시드라","water"],["콘치","water"],["왕콘치","water"],["별가사리","water"],
  ["아쿠스타","water"],["마임맨","psychic"],["스라크","bug"],["루주라","ice"],["에레브","electric"],
  ["마그마","fire"],["쁘사이저","bug"],["켄타로스","normal"],["잉어킹","water"],["갸라도스","water"],
  ["라프라스","water"],["메타몽","normal"],["이브이","normal"],["샤미드","water"],["쥬피썬더","electric"],
  ["부스터","fire"],["폴리곤","normal"],["암나이트","rock"],["암스타","rock"],["투구","rock"],
  ["투구푸스","rock"],["프테라","rock"],["잠만보","normal"],["프리져","ice"],["썬더","electric"],
  ["파이어","fire"],["미뇽","dragon"],["신뇽","dragon"],["망나뇽","dragon"],["뮤츠","psychic"],
  ["뮤","psychic"],
];
const LEGENDARY_IDS = new Set([144, 145, 146, 150, 151]);
const RARE_IDS = new Set([3, 6, 9, 25, 26, 38, 45, 59, 65, 68, 94, 113, 115, 123, 127, 130, 131, 133, 134, 135, 136, 142, 143, 147, 148, 149]);
const POOL = GEN1.map(([name, type], i) => {
  const id = i + 1;
  return { id, name, type, color: TYPE_COLORS[type], rarity: LEGENDARY_IDS.has(id) ? "legendary" : RARE_IDS.has(id) ? "rare" : "common" };
});

const RARITY = {
  common: { label: "흔함", color: "#7ec8a8", catch: 0.9, hp: 40, atk: 10, pts: 50, xp: 20, lv: 5 },
  rare: { label: "희귀", color: "#f2b04c", catch: 0.6, hp: 70, atk: 15, pts: 100, xp: 40, lv: 12 },
  legendary: { label: "전설", color: "#c77dff", catch: 0.3, hp: 120, atk: 25, pts: 300, xp: 100, lv: 30 },
};
const BALLS = {
  poke: { name: "몬스터볼", price: 100, bonus: 0, top: "#e84545" },
  superb: { name: "슈퍼볼", price: 300, bonus: 0.15, top: "#4a90d9" },
  hyper: { name: "하이퍼볼", price: 800, bonus: 0.3, top: "#f2c94c" },
  master: { name: "마스터볼", price: 5000, bonus: 1, top: "#9b59b6" },
};
const ITEMS = {
  potion: { name: "상처약", price: 100, desc: "리자몽의 HP를 50 회복" },
  revive: { name: "회복약", price: 250, desc: "기절 회복 + HP 전부 회복" },
};

const MY = {
  id: 6, name: "리자몽", color: "#F08030", maxHp: 100,
  moves: [
    { name: "불꽃세례", diff: "easy", dmg: 10, label: "쉬움" },
    { name: "화염방사", diff: "medium", dmg: 20, label: "보통" },
    { name: "오버히트", diff: "hard", dmg: 35, label: "어려움" },
  ],
};
const TIME_LIMIT = { easy: 15, medium: 25, hard: 40 };
const DIFF = {
  easy: { label: "쉬움", bg: "#e1f5ee", fg: "#0f6e56" },
  medium: { label: "보통", bg: "#faeeda", fg: "#854f0b" },
  hard: { label: "어려움", bg: "#fcebeb", fg: "#a32d2d" },
};
const DIFF_FROM_LABEL = { 쉬움: "easy", 보통: "medium", 어려움: "hard" };

const SEED_BANK = [
  { id: 1, q: "1/5 + 2/5 = ?", opts: ["3/5", "3/10", "2/25", "4/5"], answer: 0, d: "easy", tag: "수학·분수의 덧셈", active: true, src: "기본", tries: 0, wrong: 0 },
  { id: 2, q: "3/7 + 2/7 = ?", opts: ["5/7", "5/14", "6/7", "5/49"], answer: 0, d: "easy", tag: "수학·분수의 덧셈", active: true, src: "기본", tries: 0, wrong: 0 },
  { id: 3, q: "1/2 + 1/3 = ?", opts: ["5/6", "2/5", "2/6", "1/6"], answer: 0, d: "medium", tag: "수학·분수의 덧셈", active: true, src: "기본", tries: 0, wrong: 0 },
  { id: 4, q: "2/5 + 3/10 = ?", opts: ["7/10", "5/15", "5/10", "6/15"], answer: 0, d: "medium", tag: "수학·분수의 덧셈", active: true, src: "기본", tries: 0, wrong: 0 },
  { id: 5, q: "철수는 피자의 1/4을, 영희는 3/8을 먹었습니다. 두 사람이 먹은 피자는 전체의 얼마일까요?", opts: ["5/8", "4/12", "1/2", "7/8"], answer: 0, d: "hard", tag: "수학·분수의 덧셈", active: true, src: "기본", tries: 0, wrong: 0 },
  { id: 6, q: "자석에서 클립이 가장 많이 붙는 곳은 어디일까요?", opts: ["양쪽 끝(극)", "한가운데", "아무 곳이나 같다", "붙지 않는다"], answer: 0, d: "easy", tag: "과학·자석", active: true, src: "기본", tries: 0, wrong: 0 },
];

const QKEY = "pokestudy-qbank-v1";
const SKEY = "pokestudy-integrated-student-v1";
const SETKEY = "pokestudy-settings-v1";

const INITIAL_STUDENT = {
  points: 500,
  inv: { poke: 3, superb: 0, hyper: 0, master: 0, potion: 0, revive: 0 },
  caught: [], day: 1, quizDone: false, encUsed: 0, solved: 0,
  hp: 100, level: 16, xp: 20,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const josa = (n, a, b) => {
  const c = n.charCodeAt(n.length - 1);
  return n + (c >= 44032 && c <= 55203 && (c - 44032) % 28 > 0 ? a : b);
};
const pickWild = () => {
  const r = Math.random();
  const pool = POOL.filter((p) => p.rarity === (r < 0.65 ? "common" : r < 0.95 ? "rare" : "legendary"));
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─────────────────────────────────────────────
// 공용 컴포넌트
// ─────────────────────────────────────────────
function Sprite({ id, mon, size, silhouette, back, pixelated, style }) {
  const [err, setErr] = useState(false);
  if (err) {
    const seed = (mon?.id || 1) % 4;
    const shapes = ["48% 52% 55% 45% / 55% 50% 50% 45%", "60% 40% 45% 55% / 45% 60% 40% 55%", "50% 50% 40% 60% / 60% 45% 55% 40%", "42% 58% 60% 40% / 50% 55% 45% 50%"];
    return (
      <div style={{ width: size, aspectRatio: "1/1", position: "relative", ...style }}>
        <div style={{ position: "absolute", inset: "10%", background: silhouette ? "#20222f" : (mon?.color || "#9fd8ff"), border: "3px solid #2c2c3488", borderRadius: shapes[seed] }}>
          {!silhouette && (
            <>
              <div style={{ position: "absolute", left: "24%", top: "32%", width: "16%", height: "20%", background: "#fff", borderRadius: "50%" }}><div style={{ position: "absolute", left: "30%", top: "35%", width: "45%", height: "45%", background: "#2c2c34", borderRadius: "50%" }} /></div>
              <div style={{ position: "absolute", right: "24%", top: "32%", width: "16%", height: "20%", background: "#fff", borderRadius: "50%" }}><div style={{ position: "absolute", left: "30%", top: "35%", width: "45%", height: "45%", background: "#2c2c34", borderRadius: "50%" }} /></div>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <img src={back ? BACK_SPRITE(id) : SPRITE(id)} alt="" onError={() => setErr(true)} draggable={false}
      style={{ width: size, height: size, objectFit: "contain", imageRendering: pixelated ? "pixelated" : "auto", filter: silhouette ? "brightness(0) opacity(0.85)" : "none", ...style }} />
  );
}

function BallIcon({ kind, size = 20 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", position: "relative", background: `linear-gradient(${BALLS[kind].top} 46%, #2c2c34 46%, #2c2c34 56%, #ffffff 56%)`, border: "2px solid #2c2c34", verticalAlign: "middle" }}>
      <span style={{ position: "absolute", left: "50%", top: "50%", width: size * 0.32, height: size * 0.32, borderRadius: "50%", background: "#fff", border: "2px solid #2c2c34", transform: "translate(-50%,-50%)" }} />
    </span>
  );
}

function HpBar({ cur, max, width = 110 }) {
  const pct = Math.max(0, (cur / max) * 100);
  const color = pct > 50 ? "#4cd964" : pct > 20 ? "#f2c94c" : "#eb5757";
  return (
    <div style={{ width, height: 9, background: "#3a3a44", borderRadius: 5, overflow: "hidden", border: "2px solid #2c2c34" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.8s ease" }} />
    </div>
  );
}

// ═════════════════════════════════════════════
// 루트: 역할 선택 + 데이터 로드
// ═════════════════════════════════════════════
const loadKey = async (key, fallback) => {
  try {
    const res = await window.storage.get(key);
    return res?.value ? JSON.parse(res.value) : fallback;
  } catch { return fallback; }
};

export default function App() {
  const [role, setRole] = useState(null); // student | teacher
  const [user, setUser] = useState(null); // 로그인한 학생 닉네임
  const [bank, setBank] = useState(null);
  const [student, setStudent] = useState(null);
  const [settings, setSettings] = useState(null);
  const [storageOk, setStorageOk] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try { if (typeof window.storage === "undefined") setStorageOk(false); } catch { setStorageOk(false); }
      setBank(await loadKey(QKEY, SEED_BANK));
      setSettings(await loadKey(SETKEY, { moveDiff: true }));
    })();
  }, []);

  // 로그인한 학생의 데이터 로드 (닉네임별 저장)
  useEffect(() => {
    if (!user) { setStudent(null); return; }
    (async () => {
      setStudent({ ...INITIAL_STUDENT, ...(await loadKey(`${SKEY}-${user}`, INITIAL_STUDENT)) });
    })();
  }, [user]);

  const persist = async (key, val) => {
    try { await window.storage.set(key, JSON.stringify(val)); } catch { setStorageOk(false); }
  };
  const saveBank = (next) => { setBank(next); persist(QKEY, next); };
  const saveStudent = (patch) => {
    setStudent((prev) => { const next = { ...prev, ...patch }; persist(`${SKEY}-${user}`, next); return next; });
  };
  const saveSettings = (patch) => {
    setSettings((prev) => { const next = { ...prev, ...patch }; persist(SETKEY, next); return next; });
  };
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(""), 2600); };
  // 문제 통계 기록 (배틀·문제풀이 공용)
  const recordStat = (qid, ok) => {
    setBank((prev) => {
      const next = prev.map((q) => q.id === qid ? { ...q, tries: (q.tries || 0) + 1, wrong: (q.wrong || 0) + (ok ? 0 : 1) } : q);
      persist(QKEY, next);
      return next;
    });
  };

  if (!bank || !settings)
    return <div style={{ minHeight: "100vh", background: "#1a1c2c", color: "#9fd8ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>불러오는 중...</div>;

  if (!role)
    return (
      <div style={{ ...S.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <GlobalStyle />
        <div style={{ fontSize: 26, marginBottom: 4 }}>포켓 스터디</div>
        <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 26 }}>공부하고, 배틀하고, 도감을 완성하자! (통합 프로토타입)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 420 }}>
          <button onClick={() => setRole("student")} style={{ ...S.primaryBtn, padding: "26px 10px", fontSize: 17 }}>
            학생으로 입장
            <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85 }}>로그인 · 회원가입</div>
          </button>
          <button onClick={() => setRole("teacher")} style={{ ...S.primaryBtn, background: "#3d6fd9", padding: "26px 10px", fontSize: 17 }}>
            교사로 입장
            <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85 }}>학급 코드 TIGER24</div>
          </button>
        </div>
        <div style={{ fontSize: 11, color: "#666", marginTop: 22, textAlign: "center", lineHeight: 1.7 }}>
          학생은 학급 코드로 가입해요 (프로토타입 코드: TIGER24).<br />교사 로그인은 배포판에서 추가됩니다.
        </div>
      </div>
    );

  if (role === "teacher")
    return <TeacherApp bank={bank} saveBank={saveBank} settings={settings} saveSettings={saveSettings} showToast={showToast} toast={toast} storageOk={storageOk} onLogout={() => setRole(null)} />;

  // 학생: 로그인 → 홈
  if (!user)
    return <LoginView onLogin={setUser} onBack={() => setRole(null)} />;
  if (!student)
    return <div style={{ minHeight: "100vh", background: "#1a1c2c", color: "#9fd8ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>내 정보를 불러오는 중...</div>;
  return <StudentApp nickname={user} student={student} save={saveStudent} bank={bank} settings={settings} recordStat={recordStat} showToast={showToast} toast={toast} storageOk={storageOk} onLogout={() => { setUser(null); setRole(null); }} />;
}

// ─────────────────────────────────────────────
// 학생 로그인 / 회원가입
// ─────────────────────────────────────────────
const AKEY = "pokestudy-accounts-v1";
const CLASS_CODE = "TIGER24";

function LoginView({ onLogin, onBack }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [code, setCode] = useState("");
  const [nick, setNick] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  async function getAccounts() {
    try {
      const res = await window.storage.get(AKEY);
      return res?.value ? JSON.parse(res.value) : {};
    } catch { return {}; }
  }

  async function submit() {
    setErr("");
    const nickname = nick.trim();
    if (!nickname) { setErr("닉네임을 입력해주세요."); return; }
    if (pw.length < 4) { setErr("비밀번호는 4자 이상으로 해주세요."); return; }
    const accounts = await getAccounts();

    if (mode === "signup") {
      if (code.trim().toUpperCase() !== CLASS_CODE) { setErr(`학급 코드가 달라요. (프로토타입 코드: ${CLASS_CODE})`); return; }
      if (accounts[nickname]) { setErr("이미 있는 닉네임이에요. 다른 이름으로 해주세요."); return; }
      try { await window.storage.set(AKEY, JSON.stringify({ ...accounts, [nickname]: { pw, code: CLASS_CODE } })); } catch {}
      onLogin(nickname);
    } else {
      if (!accounts[nickname]) { setErr("등록되지 않은 닉네임이에요. 회원가입을 먼저 해주세요."); return; }
      if (accounts[nickname].pw !== pw) { setErr("비밀번호가 달라요."); return; }
      onLogin(nickname);
    }
  }

  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <GlobalStyle />
      <div style={{ fontSize: 24, marginBottom: 4 }}>포켓 스터디</div>
      <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 20 }}>{mode === "login" ? "다시 만나서 반가워요!" : "새로운 트레이너의 등장!"}</div>
      <div style={{ ...S.panel, width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button onClick={() => { setMode("login"); setErr(""); }} style={{ ...S.tabBtn, ...(mode === "login" ? S.tabOn : {}) }}>로그인</button>
          <button onClick={() => { setMode("signup"); setErr(""); }} style={{ ...S.tabBtn, ...(mode === "signup" ? S.tabOn : {}) }}>회원가입</button>
        </div>
        {mode === "signup" && (
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={`학급 코드 (선생님께 받으세요)`} style={LG.input} />
        )}
        <input value={nick} onChange={(e) => setNick(e.target.value)} placeholder="닉네임" style={LG.input} />
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="비밀번호 (4자 이상)" style={LG.input} />
        {err && <div style={{ fontSize: 12, color: "#ff9d9d", marginBottom: 10 }}>{err}</div>}
        <button onClick={submit} style={{ ...S.primaryBtn, width: "100%", fontSize: 13 }}>
          {mode === "login" ? "모험 시작!" : "가입하기 (500P + 몬스터볼 3개 지급!)"}
        </button>
        {mode === "signup" && (
          <div style={{ fontSize: 10, color: "#9fb0d8", marginTop: 10, lineHeight: 1.7, textAlign: "center" }}>
            개인정보 없이 학급 코드 + 닉네임만으로 가입해요.
          </div>
        )}
      </div>
      <button onClick={onBack} style={{ ...S.ghostBtn, marginTop: 14 }}>처음으로</button>
    </div>
  );
}

const LG = {
  input: { width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 14, borderRadius: 9, border: "2px solid #f8f0dc33", background: "#1a1c2c", color: "#f8f0dc", outline: "none", marginBottom: 10, fontFamily: "inherit" },
};

function GlobalStyle() {
  return (
    <style>{`
      @font-face { font-family: 'DGM'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/DungGeunMo.woff') format('woff'); font-display: swap; }
      @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      @keyframes wiggle { 0%,100%{transform:rotate(0)} 15%{transform:rotate(-20deg)} 30%{transform:rotate(18deg)} 45%{transform:rotate(0)} 60%{transform:rotate(-20deg)} 75%{transform:rotate(18deg)} 90%{transform:rotate(0)} }
      @keyframes pop { 0%{transform:scale(0.4);opacity:0} 100%{transform:scale(1);opacity:1} }
      @keyframes proj { 0% { left: 22%; top: 58%; opacity: 1; transform: scale(0.6); } 70% { opacity: 1; } 100% { left: 68%; top: 24%; opacity: 0; transform: scale(1.2); } }
      @keyframes projBack { 0% { left: 68%; top: 26%; opacity: 1; transform: scale(0.6); } 70% { opacity: 1; } 100% { left: 24%; top: 56%; opacity: 0; transform: scale(1.2); } }
      @keyframes flash { 0%,100% { opacity: 0; } 30%,60% { opacity: 0.75; } }
      @keyframes pulse { 0% { transform: scale(0.3); opacity: 0.9; } 100% { transform: scale(2.4); opacity: 0; } }
      @keyframes shakeit { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-9px); } 40% { transform: translateX(9px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }
      @keyframes ballArc { 0% { left: 22%; top: 62%; transform: rotate(0deg); } 50% { top: 10%; } 100% { left: 66%; top: 22%; transform: rotate(720deg); } }
      button:active { transform: scale(0.97); }
    `}</style>
  );
}

// ═════════════════════════════════════════════
// 학생 앱
// ═════════════════════════════════════════════
function StudentApp({ nickname, student, save, bank, settings, recordStat, showToast, toast, storageOk, onLogout }) {
  const [tab, setTab] = useState("battle");
  const d = student;

  function nextDay() {
    save({ day: d.day + 1, quizDone: false, encUsed: 0, solved: 0, hp: MY.maxHp });
    showToast(`${d.day + 1}일차 아침! 퀴즈·탐색·문제풀이가 초기화되고 리자몽이 회복했어요.`);
  }

  return (
    <div style={S.page}>
      <GlobalStyle />
      <div style={S.header}>
        <div>
          <div style={{ fontSize: 16 }}>{nickname} <span style={{ fontSize: 11, opacity: 0.7 }}>5학년 2반 · {d.day}일차</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, fontSize: 11 }}>
            <span>{MY.name} Lv.{d.level}</span>
            <HpBar cur={d.hp} max={MY.maxHp} width={80} />
            <span style={{ opacity: 0.8 }}>{d.hp}/{MY.maxHp}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 17, color: "#ffd54a" }}>{d.points.toLocaleString()} P</div>
          <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3 }}>
            {["poke", "superb", "hyper", "master"].map((k) => d.inv[k] > 0 && <span key={k} style={{ marginLeft: 6 }}><BallIcon kind={k} size={12} /> {d.inv[k]}</span>)}
            {d.inv.potion > 0 && <span style={{ marginLeft: 6 }}>상처약 {d.inv.potion}</span>}
            {d.inv.revive > 0 && <span style={{ marginLeft: 6 }}>회복약 {d.inv.revive}</span>}
          </div>
          <button onClick={onLogout} style={{ ...S.ghostBtn, marginTop: 4, padding: "2px 8px", fontSize: 10 }}>로그아웃</button>
        </div>
      </div>

      {!storageOk && <div style={S.warn}>이 환경에서는 영구 저장이 꺼져 있어 새로고침 시 초기화됩니다.</div>}

      <div style={{ display: "flex", gap: 5, margin: "10px 0", flexWrap: "wrap" }}>
        {[["battle", "배틀"], ["solve", `문제풀이 ${d.solved}/10`], ["quiz", "오늘의 퀴즈"], ["explore", `야생탐색 ${d.encUsed}/3`], ["shop", "상점"], ["dex", `도감 ${d.caught.length}/151`]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...S.tabBtn, ...(tab === k ? S.tabOn : {}) }}>{label}</button>
        ))}
      </div>

      {tab === "battle" && <BattleTab d={d} save={save} bank={bank} settings={settings} recordStat={recordStat} showToast={showToast} />}
      {tab === "solve" && <SolveTab d={d} save={save} bank={bank} recordStat={recordStat} />}
      {tab === "quiz" && <QuizTab d={d} save={save} />}
      {tab === "explore" && <ExploreTab d={d} save={save} showToast={showToast} />}
      {tab === "shop" && <ShopTab d={d} save={save} showToast={showToast} />}
      {tab === "dex" && <DexTab d={d} />}

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button onClick={nextDay} style={S.ghostBtn}>테스트: 다음 날로 넘기기</button>
      </div>
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 배틀 탭 (교사 문제 은행 연동)
// ─────────────────────────────────────────────
function BattleTab({ d, save, bank, settings, recordStat, showToast }) {
  const [phase, setPhase] = useState("idle"); // idle | intro | select | question | busy | capture | throwing | done
  const [wild, setWild] = useState(null);
  const [wildHp, setWildHp] = useState(0);
  const [msg, setMsg] = useState("");
  const [move, setMove] = useState(null);
  const [q, setQ] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fx, setFx] = useState(null);
  const [wildState, setWildState] = useState("idle");
  const [myHit, setMyHit] = useState(false);
  const [fails, setFails] = useState(0);
  const [usedQ, setUsedQ] = useState([]);
  const timerRef = useRef(null);
  const wildHpRef = useRef(0);

  const activeQ = bank.filter((x) => x.active);
  const countByDiff = { easy: 0, medium: 0, hard: 0 };
  activeQ.forEach((x) => countByDiff[x.d]++);

  function start() {
    const w = pickWild();
    setWild(w); setWildHp(w.hp = RARITY[w.rarity].hp); wildHpRef.current = RARITY[w.rarity].hp;
    setWildState("idle"); setFails(0); setUsedQ([]);
    setPhase("intro"); setMsg(`앗! 야생의 ${josa(w.name, "이", "가")} 나타났다!`);
  }

  function pickQuestion(diff) {
    let pool = activeQ.filter((x) => x.d === diff && !usedQ.includes(x.id));
    if (pool.length === 0) pool = activeQ.filter((x) => x.d === diff);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function chooseMove(m) {
    const raw = pickQuestion(m.diff);
    if (!raw) return;
    setUsedQ((u) => [...u, raw.id]);
    const opts = shuffle(raw.opts.map((t, i) => ({ t, ok: i === raw.answer })));
    setMove(m); setQ({ ...raw, opts });
    setTimeLeft(TIME_LIMIT[m.diff]);
    setPhase("question");
    setMsg(`문제를 맞히면 ${m.name} 발동!`);
  }

  useEffect(() => {
    if (phase !== "question") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) { clearInterval(timerRef.current); answer(null, 0); return 0; }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [phase, q]);

  async function answer(opt, remain) {
    if (phase !== "question") return;
    clearInterval(timerRef.current);
    setPhase("busy");
    const total = TIME_LIMIT[move.diff];
    const crit = opt?.ok && remain > (total * 2) / 3;
    recordStat(q.id, !!opt?.ok);
    await sleep(500);

    if (opt?.ok) {
      save({ xp: gainXpCalc(d, 2).xp, level: gainXpCalc(d, 2).level });
      setMsg(`${MY.name}의 ${move.name}!`);
      setFx({ kind: "fire", key: Date.now() });
      await sleep(900);
      setWildState("hit"); setFx({ kind: "shake", key: Date.now() });
      const dmg = Math.round(move.dmg * (crit ? 1.5 : 1));
      const nh = Math.max(0, wildHpRef.current - dmg);
      wildHpRef.current = nh; setWildHp(nh);
      if (crit) { setMsg("급소에 맞았다!"); await sleep(900); }
      await sleep(650); setWildState("idle");
      if (nh <= 0) { setMsg(`야생 ${josa(wild.name, "이", "가")} 쓰러졌다! 볼을 골라 던지자!`); setPhase("capture"); }
      else { setMsg(`정답! (야생 HP ${nh}) 다음 기술을 고르자.`); setPhase("select"); }
    } else {
      setMsg(opt === null ? `시간 초과! ${move.name}은(는) 빗나갔다!` : `${move.name}! ...그러나 빗나갔다! (정답: ${q.opts.find((o) => o.ok).t})`);
      await sleep(1200);
      setMsg(`야생 ${wild.name}의 ${TYPE_MOVE[wild.type]}!`);
      setFx({ kind: wild.type === "electric" ? "electric" : wild.type === "psychic" ? "psychic" : "projBack", key: Date.now() });
      await sleep(900);
      setMyHit(true); setFx({ kind: "shake", key: Date.now() });
      const nh = Math.max(0, d.hp - RARITY[wild.rarity].atk);
      save({ hp: nh });
      await sleep(650); setMyHit(false);
      if (nh <= 0) { setMsg(`${MY.name}은(는) 쓰러졌다... 회복약을 쓰거나 내일까지 쉬어야 해요.`); setPhase("done"); }
      else { setPhase("select"); }
    }
  }

  async function throwBall(kind) {
    if (d.inv[kind] <= 0) return;
    save({ inv: { ...d.inv, [kind]: d.inv[kind] - 1 } });
    setPhase("throwing");
    setMsg(`${BALLS[kind].name}을(를) 던졌다! · · ·`);
    setFx({ kind: "ball", key: Date.now() });
    await sleep(750);
    setWildState("captured");
    setFx({ kind: "wiggle", key: Date.now() });
    await sleep(1700);
    const rate = Math.min(1, RARITY[wild.rarity].catch + BALLS[kind].bonus);
    if (Math.random() < rate) {
      setFx(null); setWildState("gone");
      const g = gainXpCalc(d, RARITY[wild.rarity].xp);
      const caught = d.caught.includes(wild.id) ? d.caught : [...d.caught, wild.id];
      save({ caught, points: d.points + RARITY[wild.rarity].pts, xp: g.xp, level: g.level });
      setMsg(`신난다! ${josa(wild.name, "을", "를")} 잡았다! +${RARITY[wild.rarity].pts}P +${RARITY[wild.rarity].xp}XP`);
      if (!d.caught.includes(wild.id)) showToast("도감에 새로운 포켓몬이 기록되었다!");
      setPhase("done");
    } else {
      setFx(null); setWildState("idle");
      const f = fails + 1; setFails(f);
      if (f >= 2) { setWildState("gone"); setMsg(`아앗! 야생 ${josa(wild.name, "이", "가")} 도망쳐 버렸다!`); setPhase("done"); }
      else { setMsg("아... 아깝다! (기회 1번 남음)"); setPhase("capture"); }
    }
  }

  function usePotion() {
    if (d.inv.potion <= 0 || d.hp >= MY.maxHp || d.hp <= 0) return;
    save({ inv: { ...d.inv, potion: d.inv.potion - 1 }, hp: Math.min(MY.maxHp, d.hp + 50) });
    showToast("상처약 사용! HP +50");
  }
  function useRevive() {
    if (d.inv.revive <= 0) return;
    save({ inv: { ...d.inv, revive: d.inv.revive - 1 }, hp: MY.maxHp });
    showToast("회복약 사용! 리자몽이 기운을 차렸다!");
  }

  // 기절 상태
  if (d.hp <= 0 && phase !== "busy")
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 30 }}>
        <div style={{ fontSize: 15, marginBottom: 8 }}>{MY.name}이(가) 기절했어요...</div>
        <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 14 }}>회복약을 쓰거나 내일까지 기다려야 배틀할 수 있어요.</div>
        <button onClick={useRevive} disabled={d.inv.revive <= 0} style={{ ...S.primaryBtn, opacity: d.inv.revive > 0 ? 1 : 0.4 }}>
          회복약 사용 (보유 {d.inv.revive})
        </button>
      </div>
    );

  const moves = settings.moveDiff ? MY.moves : [{ name: "공격", diff: "medium", dmg: 20, label: "보통" }];

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
                <Sprite id={wild.id} mon={wild} size="100%" style={{ width: "100%", height: "auto" }} />
              </div>
            )}
            <div style={{ position: "absolute", left: "10%", top: "42%", width: "34%", animation: myHit ? "shakeit 0.5s" : "none", filter: myHit ? "brightness(2.2) saturate(0.3)" : "none" }}>
              <Sprite id={MY.id} mon={MY} back pixelated size="100%" style={{ width: "100%", height: "auto" }} />
            </div>
            {/* 플레이트 */}
            <div style={{ position: "absolute", left: "3%", top: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
                {wild.name} <span style={{ fontSize: 10, color: "#666" }}>Lv.{RARITY[wild.rarity].lv}</span>
                <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: RARITY[wild.rarity].color }}>{RARITY[wild.rarity].label}</span>
              </div>
              <HpBar cur={wildHp} max={RARITY[wild.rarity].hp} />
            </div>
            <div style={{ position: "absolute", right: "3%", bottom: "4%", background: "#f8f0dc", border: "3px solid #2c2c34", borderRadius: 10, padding: "6px 10px", color: "#2c2c34" }}>
              <div style={{ fontSize: 13 }}>{MY.name} <span style={{ fontSize: 10, color: "#666" }}>Lv.{d.level}</span></div>
              <HpBar cur={d.hp} max={MY.maxHp} />
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 2 }}>{d.hp}/{MY.maxHp}</div>
            </div>
            {/* 이펙트 */}
            {fx?.kind === "fire" && [0, 1, 2].map((i) => (
              <div key={fx.key + "-" + i} style={{ position: "absolute", width: 18, height: 18, borderRadius: "50%", background: i === 1 ? "#ffd23f" : "#ff6b35", boxShadow: "0 0 14px #ff6b35", animation: `proj 0.85s ease-in ${i * 0.12}s forwards`, opacity: 0 }} />
            ))}
            {fx?.kind === "projBack" && <div key={fx.key} style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", background: TYPE_COLORS[wild.type], boxShadow: `0 0 14px ${TYPE_COLORS[wild.type]}`, animation: "projBack 0.85s ease-in forwards" }} />}
            {fx?.kind === "electric" && <div key={fx.key} style={{ position: "absolute", inset: 0, background: "#ffe94a", animation: "flash 0.8s ease forwards", pointerEvents: "none" }} />}
            {fx?.kind === "psychic" && <div key={fx.key} style={{ position: "absolute", left: "20%", top: "48%", width: 80, height: 80, borderRadius: "50%", border: "5px solid #c77dff", animation: "pulse 0.9s ease-out forwards", pointerEvents: "none" }} />}
            {(fx?.kind === "ball" || fx?.kind === "wiggle") && wildState !== "gone" && (
              <div key={fx.key} style={{ position: "absolute", width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(#e84545 46%, #2c2c34 46%, #2c2c34 56%, #ffffff 56%)", border: "3px solid #2c2c34", animation: fx.kind === "ball" ? "ballArc 0.72s ease-out forwards" : "wiggle 1.6s ease-in-out", left: fx.kind === "wiggle" ? "66%" : undefined, top: fx.kind === "wiggle" ? "20%" : undefined, zIndex: 5 }} />
            )}
          </div>
        </div>
      )}

      {/* 메시지 */}
      <div style={{ background: "#f8f0dc", color: "#2c2c34", border: "3px solid #2c2c34", borderRadius: 10, padding: "12px 14px", minHeight: 46, fontSize: 14, lineHeight: 1.5, marginBottom: 8 }}>
        {phase === "idle" ? "풀숲에서 야생 포켓몬을 찾아 배틀로 잡아보자! (선생님이 낸 문제가 출제됩니다)" : msg}
      </div>

      {/* 조작 */}
      {phase === "idle" && (
        <div>
          <button onClick={start} disabled={activeQ.length === 0} style={{ ...S.primaryBtn, width: "100%", opacity: activeQ.length === 0 ? 0.4 : 1 }}>
            야생 포켓몬을 찾는다!
          </button>
          {activeQ.length === 0 && <div style={{ fontSize: 12, color: "#ff9d9d", marginTop: 8, textAlign: "center" }}>출제 중인 문제가 없어요. 선생님이 문제를 등록해야 배틀할 수 있어요.</div>}
          {(d.inv.potion > 0 && d.hp < MY.maxHp) && (
            <button onClick={usePotion} style={{ ...S.ghostBtn, width: "100%", marginTop: 8 }}>상처약 사용 (HP+50, 보유 {d.inv.potion})</button>
          )}
        </div>
      )}
      {phase === "intro" && <button onClick={() => { setPhase("select"); setMsg(`가라! ${MY.name}! 기술을 고르자.`); }} style={{ ...S.primaryBtn, width: "100%" }}>배틀 시작!</button>}

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

      {phase === "question" && q && (
        <div style={{ ...S.panel, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: "#9fd8ff" }}>{move.label} 문제 · {q.tag}</span>
            <span style={{ color: timeLeft < TIME_LIMIT[move.diff] / 3 ? "#ff8a8a" : "#f8f0dc" }}>⏱ {Math.ceil(timeLeft)}초</span>
          </div>
          <div style={{ height: 7, background: "#1a1c2c", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ width: `${(timeLeft / TIME_LIMIT[move.diff]) * 100}%`, height: "100%", background: timeLeft > (TIME_LIMIT[move.diff] * 2) / 3 ? "#ffd23f" : "#4a90d9", transition: "width 0.1s linear" }} />
          </div>
          <div style={{ fontSize: 15, marginBottom: 10, lineHeight: 1.6 }}>{q.q}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {q.opts.map((o, i) => (
              <button key={i} onClick={() => answer(o, timeLeft)} style={S.choiceBtn}>{["①", "②", "③", "④"][i]} {o.t}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 6, textAlign: "center" }}>노란 타이머일 때 맞히면 급소(1.5배)!</div>
        </div>
      )}

      {phase === "capture" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {Object.keys(BALLS).map((k) => {
            const rate = Math.min(1, RARITY[wild.rarity].catch + BALLS[k].bonus);
            return (
              <button key={k} onClick={() => throwBall(k)} disabled={d.inv[k] <= 0} style={{ ...S.choiceBtn, opacity: d.inv[k] <= 0 ? 0.35 : 1 }}>
                <BallIcon kind={k} size={15} /> {BALLS[k].name} ×{d.inv[k]}
                <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 2 }}>성공률 {Math.round(rate * 100)}%</div>
              </button>
            );
          })}
          <button onClick={() => { setPhase("done"); setMsg("다음에 다시 만나자..."); }} style={{ ...S.ghostBtn, gridColumn: "1 / -1" }}>포기하고 떠난다</button>
        </div>
      )}

      {phase === "done" && <button onClick={start} style={{ ...S.primaryBtn, width: "100%" }}>다시 풀숲을 탐색한다</button>}
    </div>
  );
}

function gainXpCalc(d, n) {
  let xp = d.xp + n, level = d.level;
  while (xp >= 100) { xp -= 100; level++; }
  return { xp, level };
}

// ─────────────────────────────────────────────
// 문제풀이 탭 (포인트 벌기)
// ─────────────────────────────────────────────
function SolveTab({ d, save, bank, recordStat }) {
  const [q, setQ] = useState(null);
  const [picked, setPicked] = useState(null);
  const activeQ = bank.filter((x) => x.active);

  function next() {
    if (activeQ.length === 0) return;
    const raw = activeQ[Math.floor(Math.random() * activeQ.length)];
    setQ({ ...raw, sOpts: shuffle(raw.opts.map((t, i) => ({ t, ok: i === raw.answer }))) });
    setPicked(null);
  }

  function pick(o) {
    if (picked) return;
    setPicked(o);
    recordStat(q.id, o.ok);
    if (o.ok) save({ points: d.points + 20, solved: d.solved + 1 });
    else save({ solved: d.solved + 1 });
  }

  if (activeQ.length === 0)
    return <div style={{ ...S.panel, textAlign: "center", padding: 30, fontSize: 13, color: "#9fd8ff" }}>출제 중인 문제가 없어요. 선생님을 기다리자!</div>;

  if (d.solved >= 10 && !q)
    return <div style={{ ...S.panel, textAlign: "center", padding: 30, fontSize: 13, color: "#9fd8ff" }}>오늘의 문제풀이 10문제를 다 풀었어요! 내일 또 만나요.</div>;

  if (!q)
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 30 }}>
        <div style={{ fontSize: 14, marginBottom: 6 }}>문제를 풀고 포인트를 모으자!</div>
        <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 14 }}>정답 1개당 +20P · 하루 10문제까지</div>
        <button onClick={next} style={S.primaryBtn}>문제 시작 ({d.solved}/10)</button>
      </div>
    );

  return (
    <div style={{ ...S.panel }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9fd8ff", marginBottom: 8 }}>
        <span>{q.tag} · {DIFF[q.d].label}</span><span>{d.solved}/10 · 정답 +20P</span>
      </div>
      <div style={{ fontSize: 15, marginBottom: 12, lineHeight: 1.6 }}>{q.q}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {q.sOpts.map((o, i) => {
          const isAns = picked && o.ok;
          const isWrong = picked && picked === o && !o.ok;
          return (
            <button key={i} onClick={() => pick(o)} style={{ ...S.choiceBtn, background: isAns ? "#2e5d43" : isWrong ? "#6b3030" : S.choiceBtn.background, borderColor: isAns ? "#7ef29a" : isWrong ? "#ff9d9d" : "#f8f0dc33" }}>
              {["①", "②", "③", "④"][i]} {o.t}
            </button>
          );
        })}
      </div>
      {picked && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <div style={{ fontSize: 13, color: picked.ok ? "#7ef29a" : "#ff9d9d", marginBottom: 8 }}>{picked.ok ? "정답! +20P" : "아쉬워요! 다음 문제로."}</div>
          {d.solved < 10 ? <button onClick={next} style={S.primaryBtn}>다음 문제</button> : <div style={{ fontSize: 12, color: "#9fd8ff" }}>오늘 분량 완료!</div>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 오늘의 퀴즈 / 야생 탐색 / 상점 / 도감
// ─────────────────────────────────────────────
function QuizTab({ d, save }) {
  const [quiz, setQuiz] = useState(null);
  const [picked, setPicked] = useState(null);
  const [reward, setReward] = useState(null);

  function start() {
    const target = POOL[Math.floor(Math.random() * POOL.length)];
    const wrong = shuffle(POOL.filter((p) => p.id !== target.id)).slice(0, 3);
    setQuiz({ target, opts: shuffle([target, ...wrong]) });
    setPicked(null); setReward(null);
  }
  async function answer(opt) {
    if (picked) return;
    setPicked(opt);
    const ok = opt.id === quiz.target.id;
    if (ok) {
      const r = Math.random();
      const ball = r < 0.6 ? "poke" : r < 0.9 ? "superb" : "hyper";
      save({ points: d.points + 100, inv: { ...d.inv, [ball]: d.inv[ball] + 1 }, quizDone: true });
      setReward({ ok, ball });
    } else {
      save({ inv: { ...d.inv, poke: d.inv.poke + 1 }, quizDone: true });
      setReward({ ok });
    }
  }

  if (d.quizDone && !quiz)
    return <div style={{ ...S.panel, textAlign: "center", padding: 30, fontSize: 13, color: "#9fd8ff" }}>오늘의 퀴즈를 이미 풀었어요! 내일 새 포켓몬이 기다려요.</div>;
  if (!quiz)
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 30 }}>
        <div style={{ fontSize: 15, marginBottom: 4 }}>이 포켓몬은 누구일까?</div>
        <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 14 }}>맞히면 100P + 랜덤 볼! 틀려도 몬스터볼 1개!</div>
        <button onClick={start} style={S.primaryBtn}>오늘의 퀴즈 시작</button>
      </div>
    );
  return (
    <div style={{ ...S.panel, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", animation: "floaty 2.4s ease-in-out infinite" }}>
        <Sprite id={quiz.target.id} mon={quiz.target} size={140} silhouette={!picked} />
      </div>
      {reward && (
        <div style={{ margin: "8px 0", animation: "pop 0.3s" }}>
          <div style={{ fontSize: 14, color: reward.ok ? "#7ef29a" : "#ff9d9d" }}>{reward.ok ? `정답! ${quiz.target.name}!` : `정답은 ${quiz.target.name}!`}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{reward.ok ? <>+100P, <BallIcon kind={reward.ball} size={14} /> {BALLS[reward.ball].name} 획득!</> : <>위로 선물: 몬스터볼 1개</>}</div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
        {quiz.opts.map((o) => {
          const isAns = picked && o.id === quiz.target.id;
          const isWrong = picked && picked.id === o.id && !isAns;
          return <button key={o.id} onClick={() => answer(o)} style={{ ...S.choiceBtn, background: isAns ? "#2e5d43" : isWrong ? "#6b3030" : S.choiceBtn.background }}>{o.name}</button>;
        })}
      </div>
    </div>
  );
}

function ExploreTab({ d, save, showToast }) {
  const [enc, setEnc] = useState(null);
  const [msg, setMsg] = useState("");

  function explore() {
    if (d.encUsed >= 3) return;
    const wild = pickWild();
    setEnc({ wild, fails: 0, state: "active" });
    setMsg(`앗! 야생의 ${josa(wild.name, "이", "가")} 나타났다!`);
    save({ encUsed: d.encUsed + 1 });
  }
  async function throwBall(kind) {
    if (!enc || enc.state !== "active" || d.inv[kind] <= 0) return;
    save({ inv: { ...d.inv, [kind]: d.inv[kind] - 1 } });
    setEnc({ ...enc, state: "throwing" });
    setMsg(`${BALLS[kind].name}을(를) 던졌다! · · ·`);
    await sleep(1600);
    const rate = Math.min(1, RARITY[enc.wild.rarity].catch + BALLS[kind].bonus);
    if (Math.random() < rate) {
      setEnc({ ...enc, state: "caught" });
      setMsg(`신난다! ${josa(enc.wild.name, "을", "를")} 잡았다!`);
      if (!d.caught.includes(enc.wild.id)) { save({ caught: [...d.caught, enc.wild.id] }); showToast("도감에 새로운 포켓몬이 기록되었다!"); }
    } else {
      const fails = enc.fails + 1;
      if (fails >= 2) { setEnc({ ...enc, fails, state: "fled" }); setMsg(`아앗! 야생 ${josa(enc.wild.name, "이", "가")} 도망쳐 버렸다!`); }
      else { setEnc({ ...enc, fails, state: "active" }); setMsg("아... 아깝다! (기회 1번 남음)"); }
    }
  }
  const left = 3 - d.encUsed;
  return (
    <div style={S.panel}>
      {!enc || enc.state === "caught" || enc.state === "fled" ? (
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          {enc && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "center", opacity: enc.state === "fled" ? 0.4 : 1 }}><Sprite id={enc.wild.id} mon={enc.wild} size={110} /></div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{msg}</div>
            </div>
          )}
          {left > 0 ? (
            <>
              <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 10 }}>오늘 남은 탐색: {left}번 · 배틀 없이 볼만 던져서 잡는 찬스!</div>
              <button onClick={explore} style={S.primaryBtn}>풀숲을 탐색한다</button>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#9fd8ff", padding: 8 }}>오늘의 탐색 끝! 배틀 탭에서는 계속 잡을 수 있어요.</div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, marginBottom: 2 }}>{enc.wild.name} <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 8, background: RARITY[enc.wild.rarity].color, color: "#2c2c34" }}>{RARITY[enc.wild.rarity].label}</span></div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {enc.state === "throwing"
              ? <div style={{ width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ animation: "wiggle 1.5s ease-in-out infinite" }}><BallIcon kind="poke" size={40} /></div></div>
              : <div style={{ animation: "floaty 2.2s ease-in-out infinite" }}><Sprite id={enc.wild.id} mon={enc.wild} size={110} /></div>}
          </div>
          <div style={{ fontSize: 12, margin: "8px 0 12px" }}>{msg}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {Object.keys(BALLS).map((k) => {
              const rate = Math.min(1, RARITY[enc.wild.rarity].catch + BALLS[k].bonus);
              return (
                <button key={k} onClick={() => throwBall(k)} disabled={d.inv[k] <= 0 || enc.state === "throwing"} style={{ ...S.choiceBtn, opacity: d.inv[k] <= 0 ? 0.35 : 1, fontSize: 12 }}>
                  <BallIcon kind={k} size={14} /> {BALLS[k].name} ×{d.inv[k]}
                  <div style={{ fontSize: 10, color: "#9fd8ff", marginTop: 2 }}>성공률 {Math.round(rate * 100)}%</div>
                </button>
              );
            })}
          </div>
          <button onClick={() => { setEnc(null); setMsg(""); }} style={{ ...S.ghostBtn, marginTop: 8 }}>포기하고 떠난다</button>
        </div>
      )}
    </div>
  );
}

function ShopTab({ d, save, showToast }) {
  function buy(kind, isItem) {
    const item = isItem ? ITEMS[kind] : BALLS[kind];
    if (d.points < item.price) { showToast("포인트가 부족해요! 문제를 풀어 모으자."); return; }
    if (kind === "master" && d.inv.master >= 1) { showToast("마스터볼은 1개만 가질 수 있어요!"); return; }
    save({ points: d.points - item.price, inv: { ...d.inv, [kind]: d.inv[kind] + 1 } });
    showToast(`${item.name}을(를) 구매했어요!`);
  }
  const BALL_DESC = { poke: "기본 볼. 흔한 포켓몬은 이걸로!", superb: "성공률 +15%p. 희귀 사냥용.", hyper: "성공률 +30%p. 전설을 노린다면.", master: "무조건 잡힌다. 1인 1개, 한 학기의 꿈." };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {Object.keys(BALLS).map((k) => (
        <div key={k} style={{ ...S.panel, display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
          <BallIcon kind={k} size={30} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>{BALLS[k].name} <span style={{ fontSize: 10, color: "#9fd8ff", marginLeft: 5 }}>보유 ×{d.inv[k]}</span></div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{BALL_DESC[k]}</div>
          </div>
          <button onClick={() => buy(k, false)} style={{ ...S.primaryBtn, padding: "7px 12px", fontSize: 12, opacity: d.points < BALLS[k].price ? 0.45 : 1 }}>{BALLS[k].price.toLocaleString()} P</button>
        </div>
      ))}
      {Object.keys(ITEMS).map((k) => (
        <div key={k} style={{ ...S.panel, display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
          <span style={{ fontSize: 22 }}>{k === "potion" ? "🧴" : "💊"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>{ITEMS[k].name} <span style={{ fontSize: 10, color: "#9fd8ff", marginLeft: 5 }}>보유 ×{d.inv[k]}</span></div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{ITEMS[k].desc}</div>
          </div>
          <button onClick={() => buy(k, true)} style={{ ...S.primaryBtn, padding: "7px 12px", fontSize: 12, opacity: d.points < ITEMS[k].price ? 0.45 : 1 }}>{ITEMS[k].price.toLocaleString()} P</button>
        </div>
      ))}
      <div style={{ fontSize: 10, color: "#9fd8ff", textAlign: "center", marginTop: 2, lineHeight: 1.7 }}>
        포인트 수입: 데일리 퀴즈 +100P · 문제풀이 정답당 +20P · 배틀 승리 +50~300P
      </div>
    </div>
  );
}

function DexTab({ d }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 8, textAlign: "center" }}>1세대 도감 완성까지 {POOL.length - d.caught.length}마리!</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 6 }}>
        {POOL.map((p) => {
          const got = d.caught.includes(p.id);
          return (
            <div key={p.id} style={{ ...S.panel, padding: "8px 4px", textAlign: "center", opacity: got ? 1 : 0.5 }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Sprite id={p.id} mon={p} size={50} silhouette={!got} /></div>
              <div style={{ fontSize: 10, marginTop: 4, color: got ? "#f8f0dc" : "#777" }}>{got ? p.name : "???"}</div>
              <div style={{ fontSize: 8, marginTop: 1, color: RARITY[p.rarity].color }}>No.{String(p.id).padStart(3, "0")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 교사 앱
// ═════════════════════════════════════════════
function TeacherApp({ bank, saveBank, settings, saveSettings, showToast, toast, storageOk, onLogout }) {
  const [tab, setTab] = useState("bank");
  const [filterTag, setFilterTag] = useState(null);
  const [search, setSearch] = useState("");

  function addQuestions(items, srcLabel) {
    const base = Date.now();
    saveBank([...bank, ...items.map((it, i) => ({ ...it, id: base + i, active: true, src: srcLabel, tries: 0, wrong: 0 }))]);
    showToast(`문제 ${items.length}개가 등록되었습니다`);
    setTab("bank");
  }

  const tags = [...new Set(bank.map((q) => q.tag))];
  const visible = bank.filter((q) => (!filterTag || q.tag === filterTag) && (!search || q.q.includes(search)));

  return (
    <div style={T.page}>
      <GlobalStyle />
      <div style={T.header}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>포켓 스터디 · 교사 메뉴</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>5학년 2반 · TIGER24</div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ textAlign: "center", fontSize: 12 }}><div style={{ fontSize: 18, fontWeight: 600 }}>{bank.length}</div>총 문제</div>
          <div style={{ textAlign: "center", fontSize: 12 }}><div style={{ fontSize: 18, fontWeight: 600 }}>{bank.filter((q) => q.active).length}</div>출제 중</div>
          <button onClick={onLogout} style={{ padding: "5px 12px", fontSize: 12, borderRadius: 6, cursor: "pointer", border: "2px solid #f8f0dc66", background: "transparent", color: "#f8f0dc" }}>로그아웃</button>
        </div>
      </div>

      {!storageOk && <div style={{ ...S.warn, color: "#7a5b0d", background: "#fff6e0", borderColor: "#e8c56a" }}>이 환경에서는 영구 저장이 꺼져 있어 새로고침 시 초기화됩니다.</div>}

      <div style={{ display: "flex", gap: 6, margin: "12px 0" }}>
        {[["bank", "문제 은행"], ["ai", "AI 문제 생성"], ["bulk", "대량 등록"], ["settings", "게임 설정"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...T.tabBtn, ...(tab === k ? T.tabOn : {}) }}>{label}</button>
        ))}
      </div>

      {tab === "bank" && (
        <div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="문제 검색" style={{ ...T.input, width: "100%", boxSizing: "border-box", marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
            <button onClick={() => setFilterTag(null)} style={{ ...T.chip, ...(filterTag ? {} : T.chipOn) }}>전체</button>
            {tags.map((t) => <button key={t} onClick={() => setFilterTag(filterTag === t ? null : t)} style={{ ...T.chip, ...(filterTag === t ? T.chipOn : {}) }}>{t}</button>)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {visible.map((q) => {
              const wrongRate = q.tries > 0 ? Math.round((q.wrong / q.tries) * 100) : null;
              return (
                <div key={q.id} style={{ ...T.card, opacity: q.active ? 1 : 0.55 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 5 }}>{q.q}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>
                        {q.opts.map((o, i) => <span key={i} style={{ marginRight: 8, color: i === q.answer ? "#0f6e56" : "#999", fontWeight: i === q.answer ? 600 : 400 }}>{["①", "②", "③", "④"][i]} {o}</span>)}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", fontSize: 10 }}>
                        <span style={{ padding: "2px 7px", borderRadius: 9, background: DIFF[q.d].bg, color: DIFF[q.d].fg }}>{DIFF[q.d].label}</span>
                        <span style={{ padding: "2px 7px", borderRadius: 9, background: "#eef1f8", color: "#3a4a7a" }}>{q.tag}</span>
                        {wrongRate !== null && <span style={{ color: wrongRate >= 50 ? "#a32d2d" : "#888" }}>오답률 {wrongRate}% ({q.tries}회 풀림)</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <span onClick={() => saveBank(bank.map((x) => x.id === q.id ? { ...x, active: !x.active } : x))} style={{ position: "relative", width: 32, height: 17, background: q.active ? "#3d6fd9" : "#ccc", borderRadius: 9, cursor: "pointer" }}>
                        <span style={{ position: "absolute", top: 2, left: q.active ? 17 : 2, width: 13, height: 13, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
                      </span>
                      <button onClick={() => saveBank(bank.filter((x) => x.id !== q.id))} style={T.smallBtn}>삭제</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "ai" && <AiGen onApprove={(items) => addQuestions(items, "AI")} />}
      {tab === "bulk" && <BulkReg onRegister={(items) => addQuestions(items, "대량")} />}
      {tab === "settings" && (
        <div style={T.card}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>게임 설정</div>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, cursor: "pointer" }}>
            <div>
              기술 선택 = 난이도 선택
              <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>끄면 배틀에서 기술이 하나(보통 난이도)로 단순해집니다.</div>
            </div>
            <span onClick={() => saveSettings({ moveDiff: !settings.moveDiff })} style={{ position: "relative", width: 40, height: 21, background: settings.moveDiff ? "#3d6fd9" : "#ccc", borderRadius: 11, cursor: "pointer", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: settings.moveDiff ? 21 : 2, width: 17, height: 17, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
            </span>
          </label>
          <div style={{ fontSize: 11, color: "#999", marginTop: 16, lineHeight: 1.7 }}>
            배포판에서 추가될 설정: 하루 야생 탐색 횟수, 문제풀이 일일 한도, 학생에게 아이템 선물하기, AI 키(BYOK) 등록
          </div>
        </div>
      )}
      {toast && <div style={{ ...S.toast, background: "#1a1c2c", color: "#f8f0dc" }}>{toast}</div>}
    </div>
  );
}

// AI 생성 (교사)
function AiGen({ onApprove }) {
  const [subject, setSubject] = useState("수학");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("초등 5학년");
  const [counts, setCounts] = useState({ easy: 2, medium: 2, hard: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState([]);
  const total = counts.easy + counts.medium + counts.hard;

  async function generate() {
    if (!topic.trim()) { setError("단원·주제를 입력해주세요"); return; }
    if (total === 0 || total > 6) { setError("합계 1~6개로 해주세요"); return; }
    setError(""); setLoading(true); setDrafts([]);
    try {
      const prompt = `당신은 학교 교사를 돕는 시험 문제 출제 도우미입니다. 다음 조건으로 4지선다 문제를 만들어주세요.

과목: ${subject}
단원·주제: ${topic}
학년 수준: ${grade}
난이도별 개수: 쉬움 ${counts.easy}개, 보통 ${counts.medium}개, 어려움 ${counts.hard}개

출제 규칙:
- 오답 보기는 학생들이 실제로 저지르는 흔한 실수나 오개념에서 만들 것
- 쉬움=기본 개념 확인, 보통=개념 적용, 어려움=응용·복합·문장제로 난이도를 구분할 것
- 해당 학년이 이해할 수 있는 어휘로 쓸 것
- 정답이 특정 번호에 몰리지 않게 할 것

반드시 아래 형식의 JSON 배열만 출력하세요. 코드블록, 설명, 인사말 금지.
[{"q":"문제","opts":["보기1","보기2","보기3","보기4"],"answer":0,"d":"easy"}]`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await response.json();
      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      const clean = parsed.filter((p) => p.q && p.opts?.length === 4 && p.answer >= 0 && p.answer <= 3)
        .map((p) => ({ ...p, d: ["easy", "medium", "hard"].includes(p.d) ? p.d : "medium", tag: `${subject}·${topic.trim()}` }));
      if (clean.length === 0) throw new Error("empty");
      setDrafts(clean.map((c, i) => ({ ...c, _key: i, _approved: true })));
    } catch { setError("생성 실패. 잠시 후 다시 시도하거나 개수를 줄여보세요."); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div style={T.card}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 2fr 1fr", gap: 6, marginBottom: 8 }}>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} style={T.input}>
            {["국어", "수학", "사회", "과학", "영어", "도덕", "실과", "체육", "음악", "미술", "진로와직업", "기타"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="단원·주제 (예: 분수의 덧셈)" style={T.input} />
          <select value={grade} onChange={(e) => setGrade(e.target.value)} style={T.input}>
            {["초등 3학년", "초등 4학년", "초등 5학년", "초등 6학년", "중학교 1학년", "중학교 2학년", "중학교 3학년"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, fontSize: 12 }}>
          {["easy", "medium", "hard"].map((dd) => (
            <label key={dd} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ padding: "2px 8px", borderRadius: 9, background: DIFF[dd].bg, color: DIFF[dd].fg, fontSize: 11 }}>{DIFF[dd].label}</span>
              <select value={counts[dd]} onChange={(e) => setCounts({ ...counts, [dd]: +e.target.value })} style={{ ...T.input, padding: "3px 5px" }}>
                {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          ))}
          <span style={{ color: "#888", fontSize: 11 }}>합계 {total}/6</span>
        </div>
        <button onClick={generate} disabled={loading} style={{ ...T.primaryBtn, opacity: loading ? 0.6 : 1 }}>
          {loading ? "AI가 문제를 만드는 중..." : "AI로 문제 생성하기"}
        </button>
        {error && <div style={{ color: "#a32d2d", fontSize: 12, marginTop: 6 }}>{error}</div>}
      </div>
      {drafts.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>검토 후 등록 ({drafts.filter((x) => x._approved).length}/{drafts.length})</span>
            <button onClick={() => { onApprove(drafts.filter((x) => x._approved).map(({ _key, _approved, ...r }) => r)); setDrafts([]); }} style={T.primaryBtn}>선택 등록</button>
          </div>
          {drafts.map((dr) => (
            <div key={dr._key} style={{ ...T.card, marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="checkbox" checked={dr._approved} onChange={(e) => setDrafts((ds) => ds.map((x) => x._key === dr._key ? { ...x, _approved: e.target.checked } : x))} />
                <div style={{ flex: 1, fontSize: 12 }}>
                  <div style={{ marginBottom: 4 }}>{dr.q}</div>
                  <div style={{ color: "#666" }}>{dr.opts.map((o, i) => <span key={i} style={{ marginRight: 8, color: i === dr.answer ? "#0f6e56" : "#999", fontWeight: i === dr.answer ? 600 : 400 }}>{["①", "②", "③", "④"][i]} {o}</span>)}</div>
                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 8, background: DIFF[dr.d].bg, color: DIFF[dr.d].fg }}>{DIFF[dr.d].label}</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: "#996a1e", marginTop: 4 }}>정답·계산을 꼭 직접 확인하세요. 세부 수정은 2단계 프로토타입의 검토 화면에 있어요.</div>
        </div>
      )}
    </div>
  );
}

// 대량 등록 (교사)
function BulkReg({ onRegister }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  function parse() {
    const ok = [], bad = [];
    text.split("\n").map((l) => l.trim()).filter(Boolean).forEach((line, idx) => {
      const p = line.split("|").map((x) => x.trim());
      const answer = parseInt(p[5], 10) - 1;
      const dd = DIFF_FROM_LABEL[p[6]];
      if (p.length < 7 || !p[0] || isNaN(answer) || answer < 0 || answer > 3 || !dd) { bad.push(idx + 1); return; }
      ok.push({ q: p[0], opts: [p[1], p[2], p[3], p[4]], answer, d: dd, tag: p[7] || "미분류" });
    });
    setPreview({ ok, bad });
  }
  return (
    <div style={T.card}>
      <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7, marginBottom: 8 }}>
        한 줄에 하나씩: <code style={{ background: "#f4f4f0", padding: "1px 5px", borderRadius: 4 }}>문제 | 보기1 | 보기2 | 보기3 | 보기4 | 정답번호 | 난이도 | 태그</code>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={"세종대왕이 만든 문자는? | 한글 | 한자 | 가나 | 알파벳 | 1 | 쉬움 | 국어·우리 문화"} style={{ ...T.input, width: "100%", minHeight: 100, boxSizing: "border-box", fontFamily: "monospace", fontSize: 12, resize: "vertical" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={parse} style={T.secondaryBtn}>미리보기</button>
        {preview?.ok.length > 0 && <button onClick={() => { onRegister(preview.ok); setText(""); setPreview(null); }} style={T.primaryBtn}>{preview.ok.length}개 등록</button>}
      </div>
      {preview && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <span style={{ color: "#0f6e56" }}>성공 {preview.ok.length}개</span>
          {preview.bad.length > 0 && <span style={{ color: "#a32d2d", marginLeft: 8 }}>오류 줄: {preview.bad.join(", ")}</span>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#1a1c2c", color: "#f8f0dc", fontFamily: "'DGM', 'Galmuri11', sans-serif", padding: "14px 12px", maxWidth: 640, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#252840", border: "3px solid #2c2c34", borderRadius: 12, padding: "10px 14px" },
  tabBtn: { flex: "1 1 auto", padding: "8px 6px", fontSize: 11, borderRadius: 9, cursor: "pointer", border: "2px solid #f8f0dc22", background: "#252840", color: "#9fb0d8", fontFamily: "inherit" },
  tabOn: { background: "#e07b39", color: "#fff", border: "2px solid #2c2c34" },
  panel: { background: "#252840", border: "3px solid #2c2c34", borderRadius: 12, padding: 14 },
  primaryBtn: { padding: "11px 20px", fontSize: 14, borderRadius: 10, cursor: "pointer", border: "3px solid #2c2c34", background: "#e07b39", color: "#fff", fontFamily: "inherit", boxShadow: "0 3px 0 #2c2c3499" },
  choiceBtn: { padding: "11px 8px", fontSize: 13, borderRadius: 9, cursor: "pointer", border: "2px solid #f8f0dc33", background: "#2c2f44", color: "#f8f0dc", fontFamily: "inherit" },
  ghostBtn: { padding: "6px 12px", fontSize: 11, borderRadius: 8, cursor: "pointer", border: "2px solid #f8f0dc33", background: "transparent", color: "#9fb0d8", fontFamily: "inherit" },
  moveBtn: (diff) => ({ padding: "10px 6px", borderRadius: 9, cursor: "pointer", border: "3px solid #2c2c34", color: "#fff", fontFamily: "inherit", background: diff === "easy" ? "#3d9970" : diff === "medium" ? "#e0a63a" : "#d64545", boxShadow: "0 3px 0 #2c2c3499" }),
  warn: { background: "#3a3323", border: "1px solid #8a7433", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "#e8d9a0", margin: "8px 0" },
  toast: { position: "sticky", bottom: 14, margin: "12px auto 0", width: "fit-content", maxWidth: "90%", background: "#f8f0dc", color: "#2c2c34", padding: "9px 16px", borderRadius: 10, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.4)", textAlign: "center" },
};

const T = {
  page: { minHeight: "100vh", background: "#f6f5f1", color: "#2c2c34", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif", padding: "16px 14px", maxWidth: 760, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1c2c", color: "#f8f0dc", borderRadius: 12, padding: "14px 18px" },
  tabBtn: { padding: "8px 14px", fontSize: 13, borderRadius: 8, cursor: "pointer", border: "1px solid #ddd", background: "#fff", color: "#666" },
  tabOn: { background: "#1a1c2c", color: "#f8f0dc", border: "1px solid #1a1c2c" },
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: "12px 14px" },
  input: { padding: "7px 9px", fontSize: 13, borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#2c2c34", outline: "none" },
  primaryBtn: { padding: "9px 16px", fontSize: 13, borderRadius: 8, cursor: "pointer", border: "none", background: "#3d6fd9", color: "#fff", fontWeight: 600 },
  secondaryBtn: { padding: "9px 16px", fontSize: 13, borderRadius: 8, cursor: "pointer", border: "1px solid #ccc", background: "#fff", color: "#444" },
  smallBtn: { padding: "3px 9px", fontSize: 11, borderRadius: 6, cursor: "pointer", border: "1px solid #e0b4b4", background: "#fff", color: "#a33" },
  chip: { fontSize: 12, padding: "4px 11px", borderRadius: 13, cursor: "pointer", border: "1px solid #ddd", background: "#fff", color: "#777" },
  chipOn: { border: "1px solid #3d6fd9", background: "#e8effc", color: "#2a4fa0" },
};
