import { useState, useEffect } from "react";

// ─────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────
const SPRITE = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
  ghost: "#705898", dragon: "#7038F8", fairy: "#EE99AC",
};

// 1세대 151마리 (도감 번호 순)
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
  return {
    id, name,
    color: TYPE_COLORS[type],
    rarity: LEGENDARY_IDS.has(id) ? "legendary" : RARE_IDS.has(id) ? "rare" : "common",
  };
});

const RARITY = {
  common: { label: "흔함", color: "#7ec8a8", catch: 0.9 },
  rare: { label: "희귀", color: "#f2b04c", catch: 0.6 },
  legendary: { label: "전설", color: "#c77dff", catch: 0.3 },
};

const BALLS = {
  poke: { name: "몬스터볼", price: 100, bonus: 0, top: "#e84545" },
  superb: { name: "슈퍼볼", price: 300, bonus: 0.15, top: "#4a90d9" },
  hyper: { name: "하이퍼볼", price: 800, bonus: 0.3, top: "#f2c94c" },
  master: { name: "마스터볼", price: 5000, bonus: 1, top: "#9b59b6" },
};

const STORAGE_KEY = "pokestudy-student-v1";
const INITIAL = {
  points: 500,
  inv: { poke: 3, superb: 0, hyper: 0, master: 0 },
  caught: [],
  day: 1,
  quizDone: false,
  encUsed: 0,
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
// 스프라이트 (실패 시 블롭 대체)
// ─────────────────────────────────────────────
function Sprite({ id, mon, size, silhouette }) {
  const [err, setErr] = useState(false);
  const filt = silhouette ? "brightness(0) opacity(0.85)" : "none";
  if (err) {
    const seed = (mon?.id || 1) % 4;
    const shapes = [
      "48% 52% 55% 45% / 55% 50% 50% 45%",
      "60% 40% 45% 55% / 45% 60% 40% 55%",
      "50% 50% 40% 60% / 60% 45% 55% 40%",
      "42% 58% 60% 40% / 50% 55% 45% 50%",
    ];
    return (
      <div style={{ width: size, height: size, position: "relative" }}>
        <div style={{ position: "absolute", inset: "10%", background: silhouette ? "#20222f" : mon.color, border: "3px solid #2c2c3488", borderRadius: shapes[seed] }}>
          {!silhouette && (
            <>
              <div style={{ position: "absolute", left: "24%", top: "32%", width: "16%", height: "20%", background: "#fff", borderRadius: "50%" }}>
                <div style={{ position: "absolute", left: "30%", top: "35%", width: "45%", height: "45%", background: "#2c2c34", borderRadius: "50%" }} />
              </div>
              <div style={{ position: "absolute", right: "24%", top: "32%", width: "16%", height: "20%", background: "#fff", borderRadius: "50%" }}>
                <div style={{ position: "absolute", left: "30%", top: "35%", width: "45%", height: "45%", background: "#2c2c34", borderRadius: "50%" }} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <img src={SPRITE(id)} alt="" onError={() => setErr(true)} draggable={false}
      style={{ width: size, height: size, objectFit: "contain", filter: filt }} />
  );
}

function BallIcon({ kind, size = 22 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", position: "relative", background: `linear-gradient(${BALLS[kind].top} 46%, #2c2c34 46%, #2c2c34 56%, #ffffff 56%)`, border: "2px solid #2c2c34", verticalAlign: "middle" }}>
      <span style={{ position: "absolute", left: "50%", top: "50%", width: size * 0.32, height: size * 0.32, borderRadius: "50%", background: "#fff", border: "2px solid #2c2c34", transform: "translate(-50%,-50%)" }} />
    </span>
  );
}

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(null);
  const [storageOk, setStorageOk] = useState(true);
  const [tab, setTab] = useState("quiz"); // quiz | explore | shop | dex
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        setData(res?.value ? { ...INITIAL, ...JSON.parse(res.value) } : INITIAL);
      } catch {
        setStorageOk(typeof window.storage !== "undefined" ? true : false);
        setData(INITIAL);
      }
    })();
  }, []);

  async function save(patch) {
    const next = { ...data, ...patch };
    setData(next);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(next)); } catch { setStorageOk(false); }
  }

  function showToast(t) { setToast(t); setTimeout(() => setToast(""), 2600); }

  function nextDay() {
    save({ day: data.day + 1, quizDone: false, encUsed: 0 });
    showToast(`${data.day + 1}일차 아침이 밝았다! 퀴즈와 탐색이 초기화됐어요.`);
  }

  if (!data)
    return <div style={{ ...S.page, textAlign: "center", paddingTop: 80, color: "#9fd8ff" }}>불러오는 중...</div>;

  const totalBalls = Object.values(data.inv).reduce((a, b) => a + b, 0);

  return (
    <div style={S.page}>
      <style>{`
        @font-face { font-family: 'DGM'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/DungGeunMo.woff') format('woff'); font-display: swap; }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes wiggle { 0%,100%{transform:rotate(0)} 15%{transform:rotate(-20deg)} 30%{transform:rotate(18deg)} 45%{transform:rotate(0)} 60%{transform:rotate(-20deg)} 75%{transform:rotate(18deg)} 90%{transform:rotate(0)} }
        @keyframes pop { 0%{transform:scale(0.4);opacity:0} 100%{transform:scale(1);opacity:1} }
        button:active { transform: scale(0.97); }
      `}</style>

      {/* 헤더 */}
      <div style={S.header}>
        <div>
          <div style={{ fontSize: 17 }}>포켓 스터디 · 학생 화면</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>지우 (5학년 2반) · {data.day}일차</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, color: "#ffd54a" }}>{data.points.toLocaleString()} P</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>
            {Object.keys(BALLS).map((k) => data.inv[k] > 0 && (
              <span key={k} style={{ marginLeft: 8 }}><BallIcon kind={k} size={13} /> ×{data.inv[k]}</span>
            ))}
            {totalBalls === 0 && <span>볼 없음</span>}
          </div>
        </div>
      </div>

      {!storageOk && (
        <div style={{ background: "#3a3323", border: "1px solid #8a7433", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#e8d9a0", margin: "8px 0" }}>
          이 환경에서는 영구 저장이 꺼져 있어 새로고침 시 초기화됩니다. 배포판에서는 서버에 저장돼요.
        </div>
      )}

      {/* 탭 */}
      <div style={{ display: "flex", gap: 6, margin: "12px 0" }}>
        {[["quiz", "오늘의 퀴즈"], ["explore", `야생 탐색 ${data.encUsed}/3`], ["shop", "상점"], ["dex", `도감 ${data.caught.length}/${POOL.length}`]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...S.tabBtn, ...(tab === k ? S.tabOn : {}) }}>{label}</button>
        ))}
      </div>

      {tab === "quiz" && <QuizView data={data} save={save} showToast={showToast} />}
      {tab === "explore" && <ExploreView data={data} save={save} showToast={showToast} />}
      {tab === "shop" && <ShopView data={data} save={save} showToast={showToast} />}
      {tab === "dex" && <DexView data={data} />}

      <div style={{ marginTop: 18, textAlign: "center" }}>
        <button onClick={nextDay} style={{ ...S.ghostBtn }}>테스트: 다음 날로 넘기기</button>
      </div>

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 오늘의 실루엣 퀴즈
// ─────────────────────────────────────────────
function QuizView({ data, save, showToast }) {
  const [quiz, setQuiz] = useState(null); // {target, opts}
  const [picked, setPicked] = useState(null);
  const [reward, setReward] = useState(null);

  function start() {
    const target = POOL[Math.floor(Math.random() * POOL.length)];
    const wrong = shuffle(POOL.filter((p) => p.id !== target.id)).slice(0, 3);
    setQuiz({ target, opts: shuffle([target, ...wrong]) });
    setPicked(null);
    setReward(null);
  }

  async function answer(opt) {
    if (picked) return;
    setPicked(opt);
    const ok = opt.id === quiz.target.id;
    let rw;
    if (ok) {
      const r = Math.random();
      const ballKind = r < 0.6 ? "poke" : r < 0.9 ? "superb" : "hyper";
      rw = { ok, points: 100, ball: ballKind };
      save({
        points: data.points + 100,
        inv: { ...data.inv, [ballKind]: data.inv[ballKind] + 1 },
        quizDone: true,
      });
    } else {
      rw = { ok, points: 0, ball: "poke" };
      save({ inv: { ...data.inv, poke: data.inv.poke + 1 }, quizDone: true });
    }
    await sleep(400);
    setReward(rw);
  }

  if (data.quizDone && !quiz)
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 15, marginBottom: 6 }}>오늘의 퀴즈를 이미 풀었어요!</div>
        <div style={{ fontSize: 12, color: "#9fd8ff" }}>내일 새로운 포켓몬이 기다리고 있어요. (테스트하려면 아래 '다음 날' 버튼)</div>
      </div>
    );

  if (!quiz)
    return (
      <div style={{ ...S.panel, textAlign: "center", padding: 36 }}>
        <div style={{ fontSize: 16, marginBottom: 4 }}>이 포켓몬은 누구일까?</div>
        <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 16 }}>맞히면 100P + 랜덤 볼! 틀려도 몬스터볼 1개!</div>
        <button onClick={start} style={S.primaryBtn}>오늘의 퀴즈 시작</button>
      </div>
    );

  return (
    <div style={{ ...S.panel, textAlign: "center" }}>
      <div style={{ fontSize: 15, margin: "8px 0 14px" }}>이 포켓몬은 누구일까?</div>
      <div style={{ display: "flex", justifyContent: "center", animation: "floaty 2.4s ease-in-out infinite" }}>
        <Sprite id={quiz.target.id} mon={quiz.target} size={150} silhouette={!picked} />
      </div>
      {reward && (
        <div style={{ margin: "10px 0", animation: "pop 0.3s ease-out" }}>
          <div style={{ fontSize: 15, color: reward.ok ? "#7ef29a" : "#ff9d9d" }}>
            {reward.ok ? `정답! ${quiz.target.name}!` : `아쉬워요, 정답은 ${quiz.target.name}!`}
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            {reward.ok ? <>+100P, <BallIcon kind={reward.ball} size={16} /> {BALLS[reward.ball].name} 획득!</> : <>위로 선물: <BallIcon kind="poke" size={16} /> 몬스터볼 1개</>}
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        {quiz.opts.map((o) => {
          const isAns = picked && o.id === quiz.target.id;
          const isWrongPick = picked && picked.id === o.id && !isAns;
          return (
            <button key={o.id} onClick={() => answer(o)} style={{
              ...S.choiceBtn,
              background: isAns ? "#2e5d43" : isWrongPick ? "#6b3030" : S.choiceBtn.background,
              borderColor: isAns ? "#7ef29a" : isWrongPick ? "#ff9d9d" : "#f8f0dc33",
            }}>
              {o.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 야생 탐색 (아이템 포획 트랙)
// ─────────────────────────────────────────────
function ExploreView({ data, save, showToast }) {
  const [enc, setEnc] = useState(null); // {wild, fails, state: active|throwing|caught|fled}
  const [msg, setMsg] = useState("");

  function explore() {
    if (data.encUsed >= 3) return;
    const wild = pickWild();
    setEnc({ wild, fails: 0, state: "active" });
    setMsg(`앗! 야생의 ${josa(wild.name, "이", "가")} 나타났다!`);
    save({ encUsed: data.encUsed + 1 });
  }

  async function throwBall(kind) {
    if (!enc || enc.state !== "active" || data.inv[kind] <= 0) return;
    const inv = { ...data.inv, [kind]: data.inv[kind] - 1 };
    save({ inv });
    setEnc({ ...enc, state: "throwing" });
    setMsg(`${BALLS[kind].name}을(를) 던졌다! · · ·`);
    await sleep(1600);
    const rate = Math.min(1, RARITY[enc.wild.rarity].catch + BALLS[kind].bonus);
    if (Math.random() < rate) {
      setEnc({ ...enc, state: "caught" });
      setMsg(`신난다! ${josa(enc.wild.name, "을", "를")} 잡았다!`);
      const caught = data.caught.includes(enc.wild.id) ? data.caught : [...data.caught, enc.wild.id];
      save({ inv, caught });
      if (!data.caught.includes(enc.wild.id)) showToast("도감에 새로운 포켓몬이 기록되었다!");
    } else {
      const fails = enc.fails + 1;
      if (fails >= 2) {
        setEnc({ ...enc, fails, state: "fled" });
        setMsg(`아앗! 야생 ${josa(enc.wild.name, "이", "가")} 도망쳐 버렸다!`);
      } else {
        setEnc({ ...enc, fails, state: "active" });
        setMsg("아... 아깝다! 조금만 더 하면 잡을 수 있었는데! (기회 1번 남음)");
      }
    }
  }

  const left = 3 - data.encUsed;

  return (
    <div style={S.panel}>
      {!enc || enc.state === "caught" || enc.state === "fled" ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          {enc && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "center", opacity: enc.state === "fled" ? 0.4 : 1 }}>
                <Sprite id={enc.wild.id} mon={enc.wild} size={120} />
              </div>
              <div style={{ fontSize: 14, marginTop: 8 }}>{msg}</div>
            </div>
          )}
          {left > 0 ? (
            <>
              <div style={{ fontSize: 13, color: "#9fd8ff", marginBottom: 10 }}>
                오늘 남은 탐색: {left}번 · 배틀 없이 볼만 던져서 잡는 찬스!
              </div>
              <button onClick={explore} style={S.primaryBtn}>풀숲을 탐색한다</button>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#9fd8ff", padding: 10 }}>
              오늘의 탐색을 모두 사용했어요. 내일 다시 만나요! (배틀로 잡는 건 배틀 화면에서 계속!)
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 15 }}>{enc.wild.name}</span>
            <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 8, background: RARITY[enc.wild.rarity].color, color: "#2c2c34" }}>
              {RARITY[enc.wild.rarity].label}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", animation: enc.state === "throwing" ? "none" : "floaty 2.2s ease-in-out infinite" }}>
            {enc.state === "throwing" ? (
              <div style={{ width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ animation: "wiggle 1.5s ease-in-out infinite" }}><BallIcon kind="poke" size={44} /></div>
              </div>
            ) : (
              <Sprite id={enc.wild.id} mon={enc.wild} size={120} />
            )}
          </div>
          <div style={{ fontSize: 13, margin: "10px 0 14px", minHeight: 20 }}>{msg}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.keys(BALLS).map((k) => {
              const rate = Math.min(1, RARITY[enc.wild.rarity].catch + BALLS[k].bonus);
              return (
                <button key={k} onClick={() => throwBall(k)} disabled={data.inv[k] <= 0 || enc.state === "throwing"}
                  style={{ ...S.choiceBtn, opacity: data.inv[k] <= 0 ? 0.35 : 1, fontSize: 13 }}>
                  <BallIcon kind={k} size={16} /> {BALLS[k].name} ×{data.inv[k]}
                  <div style={{ fontSize: 11, color: "#9fd8ff", marginTop: 3 }}>성공률 {Math.round(rate * 100)}%</div>
                </button>
              );
            })}
          </div>
          <button onClick={() => { setEnc(null); setMsg(""); }} style={{ ...S.ghostBtn, marginTop: 10 }}>
            포기하고 떠난다
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 상점
// ─────────────────────────────────────────────
function ShopView({ data, save, showToast }) {
  function buy(kind) {
    const item = BALLS[kind];
    if (data.points < item.price) { showToast("포인트가 부족해요! 문제를 풀어 포인트를 모으자."); return; }
    if (kind === "master" && data.inv.master >= 1) { showToast("마스터볼은 1개만 가질 수 있어요!"); return; }
    save({ points: data.points - item.price, inv: { ...data.inv, [kind]: data.inv[kind] + 1 } });
    showToast(`${item.name}을(를) 구매했어요!`);
  }

  const DESC = {
    poke: "기본 볼. 흔한 포켓몬은 이걸로 충분!",
    superb: "성공률 +15%p. 희귀 포켓몬 사냥용.",
    hyper: "성공률 +30%p. 전설을 노린다면.",
    master: "무조건 잡힌다. 1인 1개, 한 학기의 꿈.",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Object.keys(BALLS).map((k) => (
        <div key={k} style={{ ...S.panel, display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
          <BallIcon kind={k} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14 }}>{BALLS[k].name} <span style={{ fontSize: 11, color: "#9fd8ff", marginLeft: 6 }}>보유 ×{data.inv[k]}</span></div>
            <div style={{ fontSize: 11, color: "#bbb", marginTop: 3 }}>{DESC[k]}</div>
          </div>
          <button onClick={() => buy(k)} style={{ ...S.primaryBtn, padding: "8px 14px", fontSize: 13, opacity: data.points < BALLS[k].price ? 0.45 : 1 }}>
            {BALLS[k].price.toLocaleString()} P
          </button>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#9fd8ff", textAlign: "center", marginTop: 4, lineHeight: 1.7 }}>
        포인트는 데일리 퀴즈(+100P)와 학습 문제 풀이(통합 단계에서 연결, 정답당 +20P)로 모아요.<br />
        상처약·회복약은 배틀과 합쳐지는 통합 단계에서 추가됩니다.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 도감
// ─────────────────────────────────────────────
function DexView({ data }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: "#9fd8ff", marginBottom: 10, textAlign: "center" }}>
        1세대 도감 완성까지 {POOL.length - data.caught.length}마리! 매일 조금씩 채워보자.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 8 }}>
        {POOL.map((p) => {
          const got = data.caught.includes(p.id);
          return (
            <div key={p.id} style={{ ...S.panel, padding: "10px 6px", textAlign: "center", opacity: got ? 1 : 0.55 }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Sprite id={p.id} mon={p} size={56} silhouette={!got} />
              </div>
              <div style={{ fontSize: 11, marginTop: 6, color: got ? "#f8f0dc" : "#777" }}>
                {got ? p.name : "???"}
              </div>
              <div style={{ fontSize: 9, marginTop: 2, color: RARITY[p.rarity].color }}>No.{String(p.id).padStart(3, "0")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh", background: "#1a1c2c", color: "#f8f0dc",
    fontFamily: "'DGM', 'Galmuri11', sans-serif",
    padding: "16px 12px", maxWidth: 640, margin: "0 auto",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#252840", border: "3px solid #2c2c34", borderRadius: 14, padding: "12px 16px",
    boxShadow: "0 4px 0 #00000044",
  },
  tabBtn: {
    flex: 1, padding: "9px 4px", fontSize: 12, borderRadius: 10, cursor: "pointer",
    border: "2px solid #f8f0dc22", background: "#252840", color: "#9fb0d8", fontFamily: "inherit",
  },
  tabOn: { background: "#e07b39", color: "#fff", border: "2px solid #2c2c34" },
  panel: {
    background: "#252840", border: "3px solid #2c2c34", borderRadius: 14, padding: "16px",
    boxShadow: "0 4px 0 #00000044",
  },
  primaryBtn: {
    padding: "12px 22px", fontSize: 15, borderRadius: 10, cursor: "pointer",
    border: "3px solid #2c2c34", background: "#e07b39", color: "#fff", fontFamily: "inherit",
    boxShadow: "0 4px 0 #2c2c3499",
  },
  choiceBtn: {
    padding: "12px 8px", fontSize: 14, borderRadius: 10, cursor: "pointer",
    border: "2px solid #f8f0dc33", background: "#2c2f44", color: "#f8f0dc", fontFamily: "inherit",
  },
  ghostBtn: {
    padding: "6px 14px", fontSize: 11, borderRadius: 8, cursor: "pointer",
    border: "2px solid #f8f0dc33", background: "transparent", color: "#9fb0d8", fontFamily: "inherit",
  },
  toast: {
    position: "sticky", bottom: 16, margin: "14px auto 0", width: "fit-content", maxWidth: "90%",
    background: "#f8f0dc", color: "#2c2c34", padding: "10px 18px", borderRadius: 10, fontSize: 13,
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)", textAlign: "center",
  },
};
