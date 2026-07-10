// 게임 상수 — 프로토타입(pokestudy-integrated-prototype.jsx)에서 포팅.
// 수치 근거: pokestudy-dev-spec.md §4

export type Rarity = "common" | "rare" | "legendary";
export type Difficulty = "easy" | "medium" | "hard";
export type BallKind = "poke" | "superb" | "hyper" | "master";

export const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
export const BACK_SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;

export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
  ghost: "#705898", dragon: "#7038F8", fairy: "#EE99AC",
};
export const TYPE_MOVE: Record<string, string> = {
  normal: "몸통박치기", fire: "불꽃세례", water: "물대포", electric: "전기쇼크",
  grass: "덩굴채찍", ice: "눈보라", fighting: "태권당수", poison: "독침",
  ground: "모래뿌리기", psychic: "염동력", bug: "실뿜기", rock: "돌떨구기",
  ghost: "핥기", dragon: "용의숨결", fairy: "박치기",
};

// 1세대 151마리 [한국어 이름, 타입]
export const GEN1: [string, string][] = [
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

export const LEGENDARY_IDS = new Set([144, 145, 146, 150, 151]);
export const RARE_IDS = new Set([
  3, 6, 9, 25, 26, 38, 45, 59, 65, 68, 94, 113, 115, 123, 127, 130, 131,
  133, 134, 135, 136, 142, 143, 147, 148, 149,
]);

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

export const BALLS: Record<BallKind, { name: string; price: number; bonus: number; top: string }> = {
  poke: { name: "몬스터볼", price: 100, bonus: 0, top: "#e84545" },
  superb: { name: "슈퍼볼", price: 300, bonus: 0.15, top: "#4a90d9" },
  hyper: { name: "하이퍼볼", price: 800, bonus: 0.3, top: "#f2c94c" },
  master: { name: "마스터볼", price: 5000, bonus: 1, top: "#9b59b6" },
};

// 내 포켓몬: MVP는 리자몽 고정 (명세 §4.2)
export const MY = {
  id: 6, name: "리자몽", color: "#F08030", maxHp: 100,
  moves: [
    { name: "불꽃세례", diff: "easy" as Difficulty, dmg: 10, label: "쉬움" },
    { name: "화염방사", diff: "medium" as Difficulty, dmg: 20, label: "보통" },
    { name: "오버히트", diff: "hard" as Difficulty, dmg: 35, label: "어려움" },
  ],
};

export const TIME_LIMIT: Record<Difficulty, number> = { easy: 15, medium: 25, hard: 40 };
export const DIFF: Record<Difficulty, { label: string; bg: string; fg: string }> = {
  easy: { label: "쉬움", bg: "#e1f5ee", fg: "#0f6e56" },
  medium: { label: "보통", bg: "#faeeda", fg: "#854f0b" },
  hard: { label: "어려움", bg: "#fcebeb", fg: "#a32d2d" },
};
export const DIFF_FROM_LABEL: Record<string, Difficulty> = { 쉬움: "easy", 보통: "medium", 어려움: "hard" };

export const INITIAL_INVENTORY = { poke: 3, superb: 0, hyper: 0, master: 0, potion: 0, revive: 0 };
export type Inventory = typeof INITIAL_INVENTORY;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// 받침 유무로 조사(이/가, 을/를) 분기
export const josa = (n: string, a: string, b: string) => {
  const c = n.charCodeAt(n.length - 1);
  return n + (c >= 44032 && c <= 55203 && (c - 44032) % 28 > 0 ? a : b);
};

// 희귀도 가중 랜덤 출현: 흔함 65% / 희귀 30% / 전설 5%
export const pickWild = (): Pokemon => {
  const r = Math.random();
  const rarity: Rarity = r < 0.65 ? "common" : r < 0.95 ? "rare" : "legendary";
  const pool = POOL.filter((p) => p.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
};

// 100XP당 1레벨
export const gainXpCalc = (cur: { xp: number; level: number }, n: number) => {
  let xp = cur.xp + n, level = cur.level;
  while (xp >= 100) { xp -= 100; level++; }
  return { xp, level };
};

export const captureRate = (rarity: Rarity, ball: BallKind) =>
  Math.min(1, RARITY[rarity].catch + BALLS[ball].bonus);

// Asia/Seoul 기준 오늘 날짜 문자열 (일일 리셋 판정용)
export const seoulToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
