// 학습경로: 성취기준(한 칸)별 숙달 판단 — 서버·화면 공용 규칙.
//
// 통과(passed) : 쉬움·보통·어려움을 각각 1번 이상 맞히고, 최근 5번 중 4번 이상 정답
// 도움 필요(help): 최근 6번 중 4번 이상 풀었는데 정답이 1/3 이하
// 공부 중(learning): 풀어 봤지만 위 둘이 아님
// 아직(none)   : 풀어 본 적 없음
// 한 번 통과한 칸은 나중에 틀려도 통과로 남긴다(복습 결과는 recent 로 따로 보여줌).

export type Level = "easy" | "medium" | "hard";
export type MasteryStatus = "passed" | "learning" | "help" | "none";

export const MASTERY_RULE = { recentPass: 5, needPass: 4, recentHelp: 6, minHelp: 4, helpRate: 1 / 3 };

export interface Attempt { std: string; level: Level; correct: boolean; at: string }

export interface MasteryCell {
  st: MasteryStatus;
  n: number;          // 푼 횟수
  c: number;          // 맞힌 횟수
  lv: string;         // 맞힌 적 있는 수준: "E","M","H" 조합
  recent: boolean[];  // 최근 결과(오래된 → 최근), 최대 6개
  passedAt?: string;  // 통과한 시각
}

const LV: Record<Level, string> = { easy: "E", medium: "M", hard: "H" };

// 한 학생의 풀이 기록 → 성취기준별 숙달 상태
export function computeMastery(attempts: Attempt[]): Record<string, MasteryCell> {
  const byStd = new Map<string, Attempt[]>();
  for (const a of [...attempts].sort((x, y) => (x.at < y.at ? -1 : x.at > y.at ? 1 : 0)))
    (byStd.get(a.std) ?? byStd.set(a.std, []).get(a.std)!).push(a);
  const out: Record<string, MasteryCell> = {};
  for (const [std, list] of byStd) {
    const levels = new Set<string>();
    let passedAt: string | undefined;
    list.forEach((a, i) => {
      if (a.correct) levels.add(LV[a.level]);
      if (passedAt) return;
      const last = list.slice(Math.max(0, i + 1 - MASTERY_RULE.recentPass), i + 1);
      if (levels.size === 3 && last.filter((x) => x.correct).length >= MASTERY_RULE.needPass) passedAt = a.at;
    });
    const recent = list.slice(-MASTERY_RULE.recentHelp).map((a) => a.correct);
    const rc = recent.filter(Boolean).length;
    const st: MasteryStatus = passedAt ? "passed"
      : recent.length >= MASTERY_RULE.minHelp && rc / recent.length <= MASTERY_RULE.helpRate ? "help"
      : "learning";
    out[std] = {
      st, n: list.length, c: list.filter((a) => a.correct).length,
      lv: ["E", "M", "H"].filter((x) => levels.has(x)).join(""), recent, ...(passedAt ? { passedAt } : {}),
    };
  }
  return out;
}

export const STATUS_LABEL: Record<MasteryStatus, string> = { passed: "통과", learning: "공부 중", help: "도움 필요", none: "아직" };
export const STATUS_COLOR: Record<MasteryStatus, string> = { passed: "#34c759", learning: "#8fb8ff", help: "#ff6b6b", none: "#e4e6ec" };
