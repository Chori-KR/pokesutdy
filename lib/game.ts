// 게임 상수 — 프로토타입(pokestudy-integrated-prototype.jsx)에서 포팅.
// 수치 근거: pokestudy-dev-spec.md §4

import { DEX, EVO, STONE } from "@/lib/pokedexData";

export type Rarity = "common" | "special" | "rare" | "legendary";
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


// 전 세대 도감(1~9세대, 1025종)은 lib/pokedexData.ts에 자동 생성되어 있다.
// 1세대(1~151)는 기존 이름·타입·등급·진화를 그대로 보존한다 — 운영 중인 학급 밸런스 유지.
const RARITY_BY_CODE: Rarity[] = ["common", "special", "rare", "legendary"];

// 세대별 전국도감 번호 구간 (연속 구간이라 번호만 보면 세대를 알 수 있다)
export const GEN_RANGES: [number, number][] = [
  [1, 151], [152, 251], [252, 386], [387, 493], [494, 649],
  [650, 721], [722, 809], [810, 905], [906, 1025],
];
export const ALL_GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const MAX_DEX_ID = 1025;
// 기존 학급(설정 없음)은 1세대만 — 지금까지와 완전히 동일하게 동작
export const DEFAULT_GENS = [1];
// 새로 만드는 학급 기본값: 1세대 + 최신(9세대)
export const NEW_CLASS_GENS = [1, 9];

export const genOf = (id: number): number => {
  for (let g = 0; g < GEN_RANGES.length; g++) {
    if (id >= GEN_RANGES[g][0] && id <= GEN_RANGES[g][1]) return g + 1;
  }
  return 1;
};
// 선택한 세대만 남기기 (빈 배열·잘못된 값이면 1세대로 안전 복귀)
export const normalizeGens = (gens?: unknown): number[] => {
  const list = Array.isArray(gens) ? gens.map(Number).filter((g) => ALL_GENS.includes(g)) : [];
  const uniq = [...new Set(list)].sort((a, b) => a - b);
  return uniq.length ? uniq : DEFAULT_GENS;
};
export const inGens = (id: number, gens: number[]): boolean => gens.includes(genOf(id));
// 활성 세대의 총 종 수 (도감 분모)
export const dexTotal = (gens: number[]): number =>
  gens.reduce((n, g) => n + (GEN_RANGES[g - 1] ? GEN_RANGES[g - 1][1] - GEN_RANGES[g - 1][0] + 1 : 0), 0);
// 1세대 진화 체인: 진화 전 → 진화 후 후보들 (이브이는 3갈래 분기)
// 진화 체인 (전 세대). 세대를 끈 학급에서는 활성 세대 안의 진화체만 노출한다.
export const EVOLVES_TO: Record<number, number[]> = EVO;
// 활성 세대 안에서 실제로 진화 가능한 대상만
export const evoTargetsIn = (id: number, gens: number[]): number[] =>
  (EVOLVES_TO[id] ?? []).filter((to) => inGens(to, gens));

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

// 포인트 진화 비용 — 각 포켓몬의 진화 단계 기준
//  - 3단 라인: 1단계→2단계 1,000P, 2단계→3단계 2,000P
//  - 2단 라인(한 번만 진화하는 포켓몬): 1,500P
export const evoPointCost = (fromId: number, toId: number): number => {
  if (stageOf(fromId) >= 2) return 2000;      // 2단계 → 3단계 (두 번째 진화)
  return EVOLVES_TO[toId] ? 1000 : 1500;      // 1단계: 진화체가 또 진화하면(3단 라인) 1,000, 최종이면(2단 라인) 1,500
};

// M5: 진화의돌로만 진화하는 페어 (1세대 돌 진화 — 승수/포인트 진화 불가)
const STONE_PAIRS: [number, number][] = STONE;
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

// 세대별 스타팅 포켓몬 3종 (1세대는 피카츄를 더해 기존과 동일한 4종)
const STARTERS_BY_GEN: Record<number, number[]> = {
  1: [1, 4, 7, 25], 2: [152, 155, 158], 3: [252, 255, 258],
  4: [387, 390, 393], 5: [495, 498, 501], 6: [650, 653, 656],
  7: [722, 725, 728], 8: [810, 813, 816], 9: [906, 909, 912],
};
export const STARTER_IDS = STARTERS_BY_GEN[1];
// 활성 세대의 스타팅 후보 (1세대만 켜면 기존과 완전히 동일)
export const startersOf = (gens: number[]): number[] =>
  gens.flatMap((g) => STARTERS_BY_GEN[g] ?? []).sort((a, b) => a - b);

export const DEFAULT_BATTLE_LIMIT = 2; // 하루 배틀(조우) 횟수 기본값 — 교사 설정 가능

export interface Pokemon {
  id: number;
  name: string;
  type: string;
  gen: number;      // 세대 (1~9)
  color: string;
  rarity: Rarity;
}

export const POOL: Pokemon[] = DEX.map(([name, type, gen, rar], i) => ({
  id: i + 1, name, type, gen,
  color: TYPE_COLORS[type] ?? TYPE_COLORS.normal,
  rarity: RARITY_BY_CODE[rar] ?? "common",
}));

export const RARITY: Record<Rarity, {
  label: string; color: string; catch: number; hp: number; atk: number;
  pts: number; xp: number; lv: number;
}> = {
  common: { label: "흔함", color: "#7ec8a8", catch: 0.9, hp: 40, atk: 10, pts: 50, xp: 20, lv: 5 },
  special: { label: "특별", color: "#5aa9e8", catch: 0.75, hp: 55, atk: 13, pts: 75, xp: 30, lv: 8 },
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
export type SnackKind = "snack" | "snack2" | "snack3" | "snack4";
// 간식: 추가 배틀 1회 + 등급 분포(dist)에 따라 야생 등장. rarity는 대표 표시용.
export const SNACKS: Record<SnackKind, { name: string; price: number; rarity: Rarity; emoji: string; desc: string; dist: [Rarity, number][] }> = {
  snack:  { name: "일반 간식", price: 500, rarity: "special", emoji: "🍪", desc: "추가 배틀 1회! 흔함~특별 포켓몬이 랜덤으로 나와요 — 배틀 탭에서 사용", dist: [["common", 0.7], ["special", 0.3]] },
  snack2: { name: "고급 간식", price: 2000, rarity: "rare", emoji: "🍰", desc: "추가 배틀 1회! 특별~희귀 포켓몬이 랜덤으로 나와요 — 배틀 탭에서 사용", dist: [["special", 0.6], ["rare", 0.4]] },
  snack3: { name: "최고급 간식", price: 4000, rarity: "rare", emoji: "🎂", desc: "추가 배틀 1회! 희귀 포켓몬이 랜덤 나와요! — 가끔 전설 포켓몬이 나오기도 합니다. 배틀 탭에서 사용", dist: [["rare", 0.9], ["legendary", 0.1]] },
  snack4: { name: "전설의 간식", price: 6000, rarity: "legendary", emoji: "🍱", desc: "추가 배틀 1회! 전설 포켓몬이 확정으로 나와요! — 배틀 탭에서 사용", dist: [["legendary", 1]] },
};
// 간식별 등급 분포에서 실제 출현 등급을 뽑는다.
export function rollSnackRarity(k: SnackKind): Rarity {
  const r = Math.random(); let acc = 0;
  for (const [rar, p] of SNACKS[k].dist) { acc += p; if (r < acc) return rar; }
  return SNACKS[k].dist[SNACKS[k].dist.length - 1][0];
}

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

// 도감 달성 보상 — 도감 종수(caught.length)가 n에 도달하면 아이템 지급(1회 수령).
export const DEX_MILESTONES: { n: number; item: ShopItem; count: number; label: string }[] = [
  { n: 15, item: "poke", count: 3, label: "몬스터볼 ×3" },
  { n: 30, item: "superb", count: 3, label: "슈퍼볼 ×3" },
  { n: 45, item: "hyper", count: 3, label: "하이퍼볼 ×3" },
  { n: 60, item: "snack", count: 1, label: "일반 간식 ×1" },
  { n: 75, item: "snack2", count: 1, label: "고급 간식 ×1" },
  { n: 90, item: "snack3", count: 1, label: "최고급 간식 ×1" },
  { n: 105, item: "master", count: 1, label: "마스터볼 ×1" },
  { n: 120, item: "spray", count: 1, label: "빛나는 스프레이 ×1" },
  { n: 135, item: "master", count: 1, label: "마스터볼 ×1" },
  { n: 150, item: "spray", count: 1, label: "빛나는 스프레이 ×1" },
];

// 중복 포켓몬 환전 — 여분(count-1) 1마리당 포인트(등급별).
export const DUPE_CONVERT: Record<Rarity, number> = { common: 30, special: 50, rare: 70, legendary: 150 };

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
  stone: 0, snack: 0, snack2: 0, snack3: 0, snack4: 0, spray: 0,
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

// 등급 확률(4체계): 전설/희귀/특별, 나머지=흔함. 교사 설정으로 조정.
export const DEFAULT_SPECIAL_RATE = 0.25;
export const DEFAULT_RARE_RATE = 0.15;
export const DEFAULT_LEGEND_RATE = 0.05;
export const rollRarity = (
  rareRate = DEFAULT_RARE_RATE, specialRate = DEFAULT_SPECIAL_RATE, legendRate = DEFAULT_LEGEND_RATE
): Rarity => {
  const r = Math.random();
  if (r < legendRate) return "legendary";
  if (r < legendRate + rareRate) return "rare";
  if (r < legendRate + rareRate + specialRate) return "special";
  return "common";
};

// 등급 내에서 바이옴 선호 타입을 70% 확률로 우선.
// gens를 주면 그 세대 안에서만 출현한다(교사가 학급 설정에서 고른 세대).
export const pickWildOf = (rarity: Rarity, biomeTypes?: string[], gens?: number[]): Pokemon => {
  const active = gens?.length ? POOL.filter((p) => gens.includes(p.gen)) : POOL;
  // 활성 세대에 해당 등급이 하나도 없으면(예: 전설 없는 세대만 선택) 등급을 풀어 안전하게 뽑는다
  const pool = active.filter((p) => p.rarity === rarity);
  const base = pool.length ? pool : active.length ? active : POOL;
  if (biomeTypes && biomeTypes.length && Math.random() < 0.7) {
    const fav = base.filter((p) => biomeTypes.includes(p.type));
    if (fav.length) return fav[Math.floor(Math.random() * fav.length)];
  }
  return base[Math.floor(Math.random() * base.length)];
};
export const pickWild = (
  rareRate = DEFAULT_RARE_RATE, specialRate = DEFAULT_SPECIAL_RATE, legendRate = DEFAULT_LEGEND_RATE,
  biomeTypes?: string[], gens?: number[]
): Pokemon => pickWildOf(rollRarity(rareRate, specialRate, legendRate), biomeTypes, gens);

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
