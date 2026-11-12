// 학생이 고르는 '출제 범위(영역)' — 배틀·문제풀이 공통.
// 태그 "과목·영역(단원)"에서
//   · 출제 중 문제의 과목이 2개 이상이면 과목으로 묶고
//   · 과목이 하나뿐이면(예: 전부 "수학·…") '·' 뒷부분(영역·단원)으로 묶는다.
export const subjectOf = (tag: string | null | undefined) =>
  (String(tag ?? "").split("·")[0] ?? "").trim() || "미분류";

export const unitOf = (tag: string | null | undefined) => {
  const parts = String(tag ?? "").split("·").map((x) => x.trim()).filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join("·") : parts[0] || "미분류";
};

export function areaGrouping(tags: (string | null | undefined)[]) {
  const byUnit = new Set(tags.map(subjectOf)).size <= 1;
  const areaOf = (tag: string | null | undefined) => (byUnit ? unitOf(tag) : subjectOf(tag));
  const areas = [...new Set(tags.map(areaOf))].sort((a, b) => a.localeCompare(b, "ko"));
  return { byUnit, areaOf, areas, label: byUnit ? "영역" : "과목" };
}
