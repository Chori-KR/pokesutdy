// 타입별 고유 실루엣(SVG 아이콘). currentColor로 타입색을 입힌다.
type Glyph = { d: string; mode?: "fill" | "evenodd" | "stroke" };

const GLYPHS: Record<string, Glyph> = {
  // 노말: 반짝이는 별
  normal: { d: "M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z" },
  // 불: 화염
  fire: { d: "M12 23 C6 23 4 18 6 13 C7 15 9 15 9 13 C9 9 11 7 10 3 C14 6 18 9 18 15 C18 20 15 23 12 23 Z" },
  // 물: 물방울
  water: { d: "M12 2 C12 2 5 11 5 16 A7 7 0 0 0 19 16 C19 11 12 2 12 2 Z" },
  // 풀: 잎사귀
  grass: { d: "M21 3 C9 3 3 10 3 21 C15 21 21 14 21 3 Z" },
  // 전기: 번개
  electric: { d: "M13 1 L4 13 L10 13 L8 23 L20 9 L13 9 Z" },
  // 얼음: 육각 결정
  ice: { d: "M12 1 L13.5 8 L20 4.5 L15.5 11 L23 12 L15.5 13 L20 19.5 L13.5 16 L12 23 L10.5 16 L4 19.5 L8.5 13 L1 12 L8.5 11 L4 4.5 L10.5 8 Z" },
  // 격투: 주먹(둥근 블록)
  fighting: { d: "M5 9 H8 V7 A2 2 0 0 1 12 7 A2 2 0 0 1 16 8 A2 2 0 0 1 19 10 V14 A6 6 0 0 1 7 15 Z" },
  // 독: 플라스크
  poison: { d: "M9 2 H15 V8 L19.5 18 A3 3 0 0 1 16.5 22 H7.5 A3 3 0 0 1 4.5 18 L9 8 Z" },
  // 땅: 산맥
  ground: { d: "M1 21 L8 7 L13 15 L17 9 L23 21 Z" },
  // 비행: 날개
  flying: { d: "M3 21 C11 21 21 11 21 3 C13 5 6 11 3 21 Z" },
  // 에스퍼: 눈 (동공 구멍)
  psychic: { d: "M1 12 C6 5 18 5 23 12 C18 19 6 19 1 12 Z M12 8.5 A3.5 3.5 0 1 0 12.01 8.5 Z", mode: "evenodd" },
  // 벌레: 갑충
  bug: { d: "M12 4 C16 4 18 8 18 13 C18 19 15 22 12 22 C9 22 6 19 6 13 C6 8 8 4 12 4 Z M12 6 V21", mode: "stroke" },
  // 바위: 각진 암석
  rock: { d: "M6 21 L2 12 L9 3 L18 5 L22 14 L15 22 Z" },
  // 고스트: 유령
  ghost: { d: "M4 21 V11 A8 8 0 0 1 20 11 V21 L16.5 18 L13 21 L10 18 L7 21 Z" },
  // 드래곤: 발톱 자국(3줄)
  dragon: { d: "M4 3 C8 9 10 15 8 21 M12 2 C16 8 18 14 16 21 M20 4 C22 10 22 16 21 21", mode: "stroke" },
  // 악: 초승달
  dark: { d: "M18 3 A9 9 0 1 0 18 21 A7 7 0 1 1 18 3 Z" },
  // 강철: 육각 너트(구멍)
  steel: { d: "M12 2 L20.5 7 V17 L12 22 L3.5 17 V7 Z M12 8 A4 4 0 1 0 12.01 8 Z", mode: "evenodd" },
  // 페어리: 하트
  fairy: { d: "M12 21 C3 14 4 7 8.5 6 C10.7 5.5 12 7 12 8.2 C12 7 13.3 5.5 15.5 6 C20 7 21 14 12 21 Z" },
};

export default function TypeGlyph({ type, size = 28 }: { type: string; size?: number }) {
  const g = GLYPHS[type] ?? GLYPHS.normal;
  const stroke = g.mode === "stroke";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      style={{ display: "block", filter: `drop-shadow(0 0 5px currentColor)` }}
      fill={stroke ? "none" : "currentColor"}
      stroke={stroke ? "currentColor" : "none"}
      strokeWidth={stroke ? 2.4 : 0} strokeLinecap="round" strokeLinejoin="round">
      <path d={g.d} fillRule={g.mode === "evenodd" ? "evenodd" : "nonzero"} />
    </svg>
  );
}
