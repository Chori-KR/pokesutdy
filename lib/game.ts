// 게임 상수 — 프로토타입(pokestudy-integrated-prototype.jsx)에서 포팅.
// 수치 근거: pokestudy-dev-spec.md §4

export type Rarity = "common" | "rare" | "legendary";
export type Difficulty = "easy" | "medium" | "hard";
export type BallKind = "poke" | "superb" | "hyper" | "master";

const SPR = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
// 도감·기본: 깔끔한 공식 일러스트
export const SPRITE = (id: number, shiny = false) =>
  `${SPR}/other/official-artwork${shiny ? "/shiny" : ""}/${id}.png`;
// 배틀: 도트(픽셀) 통일 — 앞모습/뒷모습 모두 클래식 픽셀 스프라이트
export const FRONT_PIXEL = (id: number, shiny = false) =>
  `${SPR}${shiny ? "/shiny" : ""}/${id}.png`;
export const BACK_SPRITE = (id: number, shiny = false) =>
  `${SPR}/back${shiny ? "/shiny" : ""}/${id}.png`;

export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
  ghost: "#705898", dragon: "#7038F8", fairy: "#EE99AC",
  // 아래 3종은 현재 등장 포켓몬은 없지만, 추후 타입 추가에 대비해 미리 준비
  flying: "#A890F0", dark: "#705848", steel: "#B8B8D0",
};
export const TYPE_MOVE: Record<string, string> = {
  normal: "몸통박치기", fire: "불꽃세례", water: "물대포", electric: "전기쇼크",
  grass: "덩굴채찍", ice: "눈보라", fighting: "태권당수", poison: "독침",
  ground: "모래뿌리기", psychic: "염동력", bug: "실뿜기", rock: "돌떨구기",
  ghost: "핥기", dragon: "용의숨결", fairy: "박치기",
  flying: "바람일으키기", dark: "속임수", steel: "강철날개",
};

// 1세대 151마리 [한국어 이름, 타입]
export const GEN1: [string, string][] = [
  ["이상해씨","grass"],["이상해풀","grass"],["이상해꽃","grass"],["파이리","fire"],["리자드","fire"],
  ["리자몽","fire"],["꼬부기","water"],["어니부기","water"],["거북왕","water"],["캐터피","bug"],
  ["단데기","bug"],["버터플","bug"],["뿔충이","bug"],["딱충이","bug"],["독침붕","bug"],
  ["구구","flying"],["피죤","flying"],["피죤투","flying"],["꼬렛","normal"],["레트라","normal"],
  ["깨비참","flying"],["깨비드릴조","flying"],["아보","poison"],["아보크","poison"],["피카츄","electric"],
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
  ["코일","electric"],["레어코일","electric"],["파오리","flying"],["두두","flying"],["두트리오","flying"],
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

export const LEGENDARY_IDS = new Set([144, 145, 146, 150, 151]);

// 등급 규칙(재분류): 최종 진화체 + 상징적 단일 포켓몬 + 스타팅 = 희귀 / 나머지 = 흔함
// (니드퀸·투구푸스 같은 진화체가 '흔함'이던 문제 수정)
export const RARE_IDS = new Set([
  // 각 진화 라인의 최종 진화체
  3, 6, 9, 12, 15, 18, 20, 22, 24, 26, 28, 31, 34, 36, 38, 40, 42, 45, 47,
  49, 51, 53, 55, 57, 59, 62, 65, 68, 71, 73, 76, 78, 80, 82, 85, 87, 89,
  91, 94, 97, 99, 101, 103, 105, 110, 112, 117, 119, 121, 130, 134, 135,
  136, 139, 141, 149,
  // 상징적 단일/특수 포켓몬
  113, 115, 123, 127, 131, 132, 133, 142, 143, 147, 148,
  // 스타팅 포켓몬 (야생에서도 귀하게)
  1, 4, 7, 25,
]);

// 1세대 진화 체인: 진화 전 → 진화 후 후보들 (이브이는 3갈래 분기)
export const EVOLVES_TO: Record<number, number[]> = {
  1: [2], 2: [3], 4: [5], 5: [6], 7: [8], 8: [9], 10: [11], 11: [12],
  13: [14], 14: [15], 16: [17], 17: [18], 19: [20], 21: [22], 23: [24],
  25: [26], 27: [28], 29: [30], 30: [31], 32: [33], 33: [34], 35: [36],
  37: [38], 39: [40], 41: [42], 43: [44], 44: [45], 46: [47], 48: [49],
  50: [51], 52: [53], 54: [55], 56: [57], 58: [59], 60: [61], 61: [62],
  63: [64], 64: [65], 66: [67], 67: [68], 69: [70], 70: [71], 72: [73],
  74: [75], 75: [76], 77: [78], 79: [80], 81: [82], 84: [85], 86: [87],
  88: [89], 90: [91], 92: [93], 93: [94], 96: [97], 98: [99], 100: [101],
  102: [103], 104: [105], 109: [110], 111: [112], 116: [117], 118: [119],
  120: [121], 129: [130], 133: [134, 135, 136], 138: [139], 140: [141],
  147: [148], 148: [149],
};

// 진화 단계 (1=기본, 2=중간, 3=최종): 3단 라인의 중간 단계에서만 2가 나온다
const EVO_TARGETS = new Set(Object.values(EVOLVES_TO).flat());
export const stageOf = (id: number): number => {
  if (!EVO_TARGETS.has(id)) return 1;
  // 나를 진화시키는 부모를 찾고, 그 부모가 또 누군가의 진화체면 나는 3단계
  const parent = Number(Object.keys(EVOLVES_TO).find((k) => EVOLVES_TO[Number(k)].includes(id)));
  return EVO_TARGETS.has(parent) ? 3 : 2;
};

// 진화 필요 배틀 승수: 1→2단계 5승, 2→3단계 10승 (그 포켓몬으로 이긴 횟수)
export const evoWinsNeeded = (fromId: number): number => (stageOf(fromId) >= 2 ? 10 : 5);

// M5: 포인트 진화 비용 — 학생의 누적 진화 횟수 기준 (1번째 1000P, 2번째 2000P, 3번째~ 2500P)
export const EVO_POINT_COSTS = [1000, 2000, 2500] as const;
export const evoPointCost = (evoCount: number): number =>
  EVO_POINT_COSTS[Math.min(Math.max(0, evoCount), EVO_POINT_COSTS.length - 1)];

// M5: 진화의돌로만 진화하는 페어 (1세대 돌 진화 — 승수/포인트 진화 불가)
const STONE_PAIRS: [number, number][] = [
  [25, 26],   // 피카츄 → 라이츄 (천둥의돌)
  [30, 31],   // 니드리나 → 니드퀸 (달의돌)
  [33, 34],   // 니드리노 → 니드킹 (달의돌)
  [35, 36],   // 삐삐 → 픽시 (달의돌)
  [37, 38],   // 식스테일 → 나인테일 (불꽃의돌)
  [39, 40],   // 푸린 → 푸크린 (달의돌)
  [44, 45],   // 냄새꼬 → 라플레시아 (리프의돌)
  [58, 59],   // 가디 → 윈디 (불꽃의돌)
  [61, 62],   // 슈륙챙이 → 강챙이 (물의돌)
  [70, 71],   // 우츠동 → 우츠보트 (리프의돌)
  [90, 91],   // 셀러 → 파르셀 (물의돌)
  [102, 103], // 아라리 → 나시 (리프의돌)
  [120, 121], // 별가사리 → 아쿠스타 (물의돌)
  [133, 134], // 이브이 → 샤미드 (물의돌)
  [133, 135], // 이브이 → 쥬피썬더 (천둥의돌)
  [133, 136], // 이브이 → 부스터 (불꽃의돌)
];
export const STONE_EVOS = new Set(STONE_PAIRS.map(([a, b]) => `${a}-${b}`));
export const isStoneEvo = (from: number, to: number) => STONE_EVOS.has(`${from}-${to}`);

// 스타팅 포켓몬 (가입 시 선택): 이상해씨 / 파이리 / 꼬부기 / 피카츄
// 단답형 채점: 공백·대소문자 무시하고 허용 정답 목록과 비교
export const normalizeAnswer = (s: string) =>
  String(s ?? "").trim().toLowerCase().replace(/\s+/g, "");
export const gradeShort = (text: string, accepted: string[]): boolean => {
  const t = normalizeAnswer(text);
  return !!t && accepted.some((a) => normalizeAnswer(a) === t);
};

export const DEFAULT_SHINY_RATE = 1 / 40; // 야생 조우 시 이로치(색違) 기본 확률 (2.5%)
export const rollShiny = (rate = DEFAULT_SHINY_RATE) => Math.random() < rate;

export const STARTER_IDS = [1, 4, 7, 25] as const;

export const DEFAULT_BATTLE_LIMIT = 2; // 하루 배틀(조우) 횟수 기본값 — 교사 설정 가능

export interface Pokemon {
  id: number;
  name: string;
  type: string;
  color: string;
  rarity: Rarity;
}

export const POOL: Pokemon[] = GEN1.map(([name, type], i) => {
  const id = i + 1;
  return {
    id, name, type,
    color: TYPE_COLORS[type],
    rarity: LEGENDARY_IDS.has(id) ? "legendary" : RARE_IDS.has(id) ? "rare" : "common",
  };
});

export const RARITY: Record<Rarity, {
  label: string; color: string; catch: number; hp: number; atk: number;
  pts: number; xp: number; lv: number;
}> = {
  common: { label: "흔함", color: "#7ec8a8", catch: 0.9, hp: 40, atk: 10, pts: 50, xp: 20, lv: 5 },
  rare: { label: "희귀", color: "#f2b04c", catch: 0.6, hp: 70, atk: 15, pts: 100, xp: 40, lv: 12 },
  legendary: { label: "전설", color: "#c77dff", catch: 0.3, hp: 120, atk: 25, pts: 300, xp: 100, lv: 30 },
};

// M5: 몬스터볼 살짝 너프 (bonus -0.1 → 흔함 80% / 희귀 50% / 전설 20%)
export const BALLS: Record<BallKind, { name: string; price: number; bonus: number; top: string }> = {
  poke: { name: "몬스터볼", price: 100, bonus: -0.1, top: "#e84545" },
  superb: { name: "슈퍼볼", price: 300, bonus: 0.15, top: "#4a90d9" },
  hyper: { name: "하이퍼볼", price: 800, bonus: 0.3, top: "#f2c94c" },
  master: { name: "마스터볼", price: 5000, bonus: 1, top: "#9b59b6" },
};

// M6: 약 판매 전면 종료 — 배틀이 끝나면 자동으로 완전 회복된다.

// M5: 간식 — 추가 배틀 1회 + 등급 확정 출현 (일일 배틀 제한과 무관)
export type SnackKind = "snack" | "snack2" | "snack3";
export const SNACKS: Record<SnackKind, { name: string; price: number; rarity: Rarity; emoji: string; desc: string }> = {
  snack: { name: "일반 간식", price: 500, rarity: "common", emoji: "🍪", desc: "추가 배틀 1회! 흔함 포켓몬이 랜덤으로 나와요" },
  snack2: { name: "고급 간식", price: 2000, rarity: "rare", emoji: "🍰", desc: "추가 배틀 1회! 희귀 포켓몬이 랜덤으로 나와요" },
  snack3: { name: "최고급 간식", price: 6000, rarity: "legendary", emoji: "🎂", desc: "추가 배틀 1회! 전설 포켓몬이 확정으로 나와요!" },
};

// M5: 진화의돌 — 돌 진화 포켓몬(피카츄→라이츄 등)은 이것으로만 진화
export const EVO_STONE = { name: "진화의돌", price: 1500, emoji: "💎", desc: "돌로 진화하는 포켓몬(피카츄·이브이 등)의 진화에 필요" };

// M11: 빛나는 스프레이 — 다음 야생 1마리를 이로치로 확정(배틀·탐색 시작 전 사용, 간식과 중복 가능)
export const SPRAY = { name: "빛나는 스프레이", price: 3000, emoji: "✨", desc: "다음 야생 1마리를 이로치로 확정! 배틀·탐색 시작 전에 사용하세요 (간식과 함께 사용 가능)" };

export type ShopItem = BallKind | SnackKind | "stone" | "spray";

// 경제 수치 (M5 정비 — 하루 성실 플레이 수입 ≈ 500P 기준)
export const DAILY_QUIZ_REWARD = 150; // 퀴즈 정답: +150P + 랜덤 볼
export const SOLVE_REWARD = 20;       // 문제풀이 정답당 (기본 10문제 = 최대 200P)
export const DEFAULT_EXPLORE_LIMIT = 3;
export const DEFAULT_SOLVE_LIMIT = 10;

// 데일리 퀴즈 정답 보상 볼: 몬스터볼 50% / 슈퍼볼 30% / 하이퍼볼 20%
export const rollQuizBall = (): BallKind => {
  const r = Math.random();
  return r < 0.5 ? "poke" : r < 0.8 ? "superb" : "hyper";
};

// 타입별 기술 세트 (쉬움/보통/어려움 = 위력 10/20/35, 기술=난이도 규칙 유지)
export const TYPE_MOVES: Record<string, [string, string, string]> = {
  normal: ["몸통박치기", "베어가르기", "파괴광선"],
  fire: ["불꽃세례", "화염방사", "오버히트"],
  water: ["물대포", "파도타기", "하이드로펌프"],
  electric: ["전기쇼크", "10만볼트", "번개"],
  grass: ["덩굴채찍", "잎날가르기", "솔라빔"],
  ice: ["얼음뭉치", "냉동빔", "눈보라"],
  fighting: ["태권당수", "깨트리기", "인파이트"],
  poison: ["독침", "오물공격", "오물폭탄"],
  ground: ["모래뿌리기", "구멍파기", "지진"],
  psychic: ["염동력", "사이코빔", "사이코키네시스"],
  bug: ["실뿜기", "시저크로스", "메가폰"],
  rock: ["돌떨구기", "암석봉인", "스톤에지"],
  ghost: ["핥기", "나이트헤드", "섀도볼"],
  dragon: ["용의숨결", "드래곤크루", "역린"],
  fairy: ["요정의바람", "매지컬샤인", "문포스"],
  flying: ["바람일으키기", "날개치기", "폭풍"],
  dark: ["속임수", "깨물어부수기", "나이트버스트"],
  steel: ["금속음", "강철날개", "러스터캐논"],
};

export interface Move { name: string; diff: Difficulty; dmg: number; label: string }

export const MAX_HP = 100; // 내 포켓몬 최대 HP (계정 공용)

// 레이드(형성평가): 강력한 보스 — 난이도 무관 정답 N번을 맞혀야 체력이 다 닳아 승리.
export const RAID_HITS = 10;
export const RAID_BOSS_HP = 100;
export const RAID_HIT_DMG = RAID_BOSS_HP / RAID_HITS; // 정답 1회 = 10 데미지
// 협동 보상 기본값
export const DEFAULT_RAID_THRESHOLD = 5;   // 이 인원 이상 성공하면 반 전체에게 지급
export const DEFAULT_RAID_REWARD_PTS = 200; // 승리자 추가 포인트

// 포켓몬 id → 배틀용 정보 (타입에 맞는 기술 3종 자동 배치)
export function myPokemonOf(id: number) {
  const p = POOL[id - 1] ?? POOL[5];
  const [e, m, h] = TYPE_MOVES[p.type] ?? TYPE_MOVES.normal;
  return {
    id: p.id, name: p.name, type: p.type, color: p.color, maxHp: MAX_HP,
    moves: [
      { name: e, diff: "easy", dmg: 10, label: "쉬움" },
      { name: m, diff: "medium", dmg: 20, label: "보통" },
      { name: h, diff: "hard", dmg: 35, label: "어려움" },
    ] as Move[],
  };
}

// 하위 호환: 스타팅 미선택(구 데이터) 기본값은 리자몽
export const DEFAULT_BATTLE_PID = 6;
export const MY = myPokemonOf(DEFAULT_BATTLE_PID);

export const TIME_LIMIT: Record<Difficulty, number> = { easy: 15, medium: 25, hard: 40 };
export const DIFF: Record<Difficulty, { label: string; bg: string; fg: string }> = {
  easy: { label: "쉬움", bg: "#e1f5ee", fg: "#0f6e56" },
  medium: { label: "보통", bg: "#faeeda", fg: "#854f0b" },
  hard: { label: "어려움", bg: "#fcebeb", fg: "#a32d2d" },
};
export const DIFF_FROM_LABEL: Record<string, Difficulty> = { 쉬움: "easy", 보통: "medium", 어려움: "hard" };

export const INITIAL_INVENTORY = {
  poke: 3, superb: 0, hyper: 0, master: 0,
  potion: 0, revive: 0,
  stone: 0, snack: 0, snack2: 0, snack3: 0, spray: 0,
};
export type Inventory = typeof INITIAL_INVENTORY;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// 받침 유무로 조사(이/가, 을/를) 분기
export const josa = (n: string, a: string, b: string) => {
  const c = n.charCodeAt(n.length - 1);
  return n + (c >= 44032 && c <= 55203 && (c - 44032) % 28 > 0 ? a : b);
};

// 배경(바이옴) — 배경마다 잘 나오는 타입이 다르고, 랜덤으로 걸린다.
export interface Biome { name: string; types: string[]; grad: string }
export const BIOMES: Record<string, Biome> = {
  grassland: { name: "초원", types: ["grass", "normal", "bug", "flying"], grad: "linear-gradient(#9adcf0 0%,#9adcf0 45%,#8fce6e 45%,#7bbf5c 100%)" },
  jungle: { name: "정글", types: ["grass", "bug", "poison"], grad: "linear-gradient(#63a9c0 0%,#63a9c0 40%,#3f7d54 40%,#265536 100%)" },
  snow: { name: "설원", types: ["ice", "water"], grad: "linear-gradient(#cfeaf5 0%,#cfeaf5 45%,#eaf6fb 45%,#cfe3ee 100%)" },
  swamp: { name: "늪지", types: ["poison", "water", "ground", "bug"], grad: "linear-gradient(#8a9a7a 0%,#8a9a7a 45%,#5c6b4a 45%,#41502f 100%)" },
  desert: { name: "사막", types: ["ground", "rock", "fire"], grad: "linear-gradient(#f6e5a8 0%,#f6e5a8 45%,#e8c878 45%,#d6ad55 100%)" },
  gym: { name: "체육관", types: ["fighting", "normal"], grad: "linear-gradient(#e2e7f0 0%,#e2e7f0 45%,#b9c0d0 45%,#9aa2b6 100%)" },
  sea: { name: "바다", types: ["water", "ice"], grad: "linear-gradient(#8ed7f2 0%,#8ed7f2 42%,#3d95cf 42%,#245f92 100%)" },
  city: { name: "도시", types: ["normal", "electric", "poison", "flying"], grad: "linear-gradient(#cdd6e8 0%,#cdd6e8 45%,#9aa6bf 45%,#79859f 100%)" },
  volcano: { name: "화산", types: ["fire", "rock", "ground"], grad: "linear-gradient(#f0a878 0%,#f0a878 42%,#b0442e 42%,#7a2a1e 100%)" },
  lab: { name: "연구소", types: ["electric", "psychic"], grad: "linear-gradient(#e4eef3 0%,#e4eef3 45%,#c2d0da 45%,#a9bac6 100%)" },
};
export const BIOME_KEYS = Object.keys(BIOMES);
export const pickBiome = (): string => BIOME_KEYS[Math.floor(Math.random() * BIOME_KEYS.length)];

// 등급 확률: legendRate(전설), rareRate(희귀), 나머지=흔함. 교사 설정으로 조정.
export const DEFAULT_RARE_RATE = 0.30;
export const DEFAULT_LEGEND_RATE = 0.05;
export const rollRarity = (rareRate = DEFAULT_RARE_RATE, legendRate = DEFAULT_LEGEND_RATE): Rarity => {
  const r = Math.random();
  if (r < legendRate) return "legendary";
  if (r < legendRate + rareRate) return "rare";
  return "common";
};

// 등급 내에서 바이옴 선호 타입을 70% 확률로 우선
export const pickWildOf = (rarity: Rarity, biomeTypes?: string[]): Pokemon => {
  const pool = POOL.filter((p) => p.rarity === rarity);
  if (biomeTypes && biomeTypes.length && Math.random() < 0.7) {
    const fav = pool.filter((p) => biomeTypes.includes(p.type));
    if (fav.length) return fav[Math.floor(Math.random() * fav.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
};
export const pickWild = (rareRate = DEFAULT_RARE_RATE, legendRate = DEFAULT_LEGEND_RATE, biomeTypes?: string[]): Pokemon =>
  pickWildOf(rollRarity(rareRate, legendRate), biomeTypes);

// 100XP당 1레벨
export const gainXpCalc = (cur: { xp: number; level: number }, n: number) => {
  let xp = cur.xp + n, level = cur.level;
  while (xp >= 100) { xp -= 100; level++; }
  return { xp, level };
};

// M6: 레벨업 보상 — 레벨업마다 +100P, 5의 배수 레벨 도달 시 +500P (100+400)
export const levelUpBonus = (fromLevel: number, toLevel: number): number => {
  let bonus = 0;
  for (let l = fromLevel + 1; l <= toLevel; l++) {
    bonus += 100;
    if (l % 5 === 0) bonus += 400;
  }
  return bonus;
};

// XP 적용 + 레벨업 보상 계산 (서버 공용)
export const applyXp = (cur: { xp: number; level: number }, n: number) => {
  const g = gainXpCalc(cur, n);
  return { xp: g.xp, level: g.level, levelBonus: levelUpBonus(cur.level, g.level) };
};

// M6: 야생 포켓몬 레벨 표시 — 내 레벨 연동 (흔함 -10±2 / 희귀 -4±2 / 전설 +4±2, 최소 2)
export const wildLevelFor = (rarity: Rarity, myLevel: number): number => {
  const base = rarity === "common" ? -10 : rarity === "rare" ? -4 : 4;
  const jitter = Math.floor(Math.random() * 5) - 2; // -2..+2
  return Math.max(2, myLevel + base + jitter);
};

export const captureRate = (rarity: Rarity, ball: BallKind) =>
  Math.max(0.05, Math.min(1, RARITY[rarity].catch + BALLS[ball].bonus));

// Asia/Seoul 기준 오늘 날짜 문자열 (일일 리셋 판정용)
export const seoulToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
