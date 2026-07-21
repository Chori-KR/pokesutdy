// 학급 생성 직후 넣어주는 샘플 문제 — 교사가 바로 배틀을 시연해볼 수 있게.
// 프로토타입 SEED_BANK 포팅.
export const SEED_QUESTIONS = [
  { body: "1/5 + 2/5 = ?", options: ["3/5", "3/10", "2/25", "4/5"], answer_idx: 0, difficulty: "easy", tag: "수학·분수의 덧셈" },
  { body: "3/7 + 2/7 = ?", options: ["5/7", "5/14", "6/7", "5/49"], answer_idx: 0, difficulty: "easy", tag: "수학·분수의 덧셈" },
  { body: "1/2 + 1/3 = ?", options: ["5/6", "2/5", "2/6", "1/6"], answer_idx: 0, difficulty: "medium", tag: "수학·분수의 덧셈" },
  { body: "2/5 + 3/10 = ?", options: ["7/10", "5/15", "5/10", "6/15"], answer_idx: 0, difficulty: "medium", tag: "수학·분수의 덧셈" },
  { body: "철수는 피자의 1/4을, 영희는 3/8을 먹었습니다. 두 사람이 먹은 피자는 전체의 얼마일까요?", options: ["5/8", "4/12", "1/2", "7/8"], answer_idx: 0, difficulty: "hard", tag: "수학·분수의 덧셈" },
  { body: "자석에서 클립이 가장 많이 붙는 곳은 어디일까요?", options: ["양쪽 끝(극)", "한가운데", "아무 곳이나 같다", "붙지 않는다"], answer_idx: 0, difficulty: "easy", tag: "과학·자석" },
] as const;

// 학급 코드: 숫자 4자리 (예: 0472). 특수교육 대상 학생도 숫자만으로 쉽게 입력.
// 0000은 관리자용으로 예약 → 무작위 생성에서는 0001~9999만 발급.
// 중복은 classes.class_code의 UNIQUE 제약 + 생성부의 재시도로 방지.
export function generateClassCode(): string {
  return String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
}
