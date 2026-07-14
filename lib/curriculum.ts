// 특수교육 기본 교육과정(2022 개정) 성취기준 데이터 접근 헬퍼.
// data/curriculum.json = scripts/extract_curriculum.py 로 PDF에서 추출한 688개 성취기준.
import raw from "@/data/curriculum.json";

export interface Standard {
  code: string;
  subject: string;
  gradeBand: string;
  area: number;
  text: string;
  note?: string;
}

const data = raw as {
  title: string;
  subjects: string[];
  gradeBands: string[];
  standards: Standard[];
};

export const CURRICULUM_TITLE = data.title;
export const CURRICULUM_SUBJECTS = data.subjects;
export const CURRICULUM_BANDS = data.gradeBands;

// 과목 + 학년군으로 성취기준 필터
export function standardsFor(subject: string, gradeBand: string): Standard[] {
  return data.standards.filter((s) => s.subject === subject && s.gradeBand === gradeBand);
}

// 특정 성취기준 코드들만
export function standardsByCodes(codes: string[]): Standard[] {
  const set = new Set(codes);
  return data.standards.filter((s) => set.has(s.code));
}
