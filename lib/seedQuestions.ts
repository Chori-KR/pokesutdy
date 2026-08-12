// 학급 생성 직후 넣어주는 기본 문제 — 새 교사가 바로 배틀을 시연해볼 수 있게.
// 간단한 곱셈 4지선다 6개(난이도별 2개씩) + 과학(자석) 1개. 3가지 기술이 모두 나오도록.
export const SEED_QUESTIONS = [
  // 쉬움 — 한 자리 × 한 자리
  { body: "3 × 4 = ?", options: ["12", "7", "9", "15"], answer_idx: 0, difficulty: "easy", tag: "수학·곱셈" },
  { body: "6 × 7 = ?", options: ["42", "36", "48", "13"], answer_idx: 0, difficulty: "easy", tag: "수학·곱셈" },
  // 보통 — 두 자리 × 한 자리
  { body: "12 × 5 = ?", options: ["60", "55", "65", "50"], answer_idx: 0, difficulty: "medium", tag: "수학·곱셈" },
  { body: "14 × 6 = ?", options: ["84", "74", "96", "78"], answer_idx: 0, difficulty: "medium", tag: "수학·곱셈" },
  // 어려움 — 두 자리 × 두 자리 / 문장제
  { body: "23 × 12 = ?", options: ["276", "266", "246", "286"], answer_idx: 0, difficulty: "hard", tag: "수학·곱셈" },
  { body: "한 상자에 사과가 15개씩 들어 있어요. 8상자에는 사과가 모두 몇 개일까요?", options: ["120개", "105개", "130개", "115개"], answer_idx: 0, difficulty: "hard", tag: "수학·곱셈" },
  // 과학 — 기본 유지(태그 필터·과목 구분 시연용)
  { body: "자석에서 클립이 가장 많이 붙는 곳은 어디일까요?", options: ["양쪽 끝(극)", "한가운데", "아무 곳이나 같다", "붙지 않는다"], answer_idx: 0, difficulty: "easy", tag: "과학·자석" },
] as const;

// 학급 코드: 숫자 4자리 (예: 0472). 특수교육 대상 학생도 숫자만으로 쉽게 입력.
// 0000은 관리자용으로 예약 → 무작위 생성에서는 0001~9999만 발급.
// 중복은 classes.class_code의 UNIQUE 제약 + 생성부의 재시도로 방지.
export function generateClassCode(): string {
  return String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
}
