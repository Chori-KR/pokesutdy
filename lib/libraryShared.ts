// 기본 문제 은행(모든 학급이 함께 쓰는 원본)과 학생별 학습 범위 — 서버·화면 공용 규칙.
//
// 기본 문제는 학급에 복사하지 않는다. 학급 설정(classes.settings)에는 다음만 둔다.
//   libUnits  : 켠 단원(태그) 목록 — 이 단원의 기본 문제가 반 전체에 출제된다
//   libHidden : 우리 반에서 숨긴 기본 문제 id
//   libRaid   : 레이드 전용으로 지정한 기본 문제 id (평소 배틀·문제풀이엔 안 나옴)
//   groups / studentGroups / studentTags : 수준 모둠과 학생별 공부 범위(단원 태그)

// 기본 문제·지문의 고유 번호. 학급 문제(uuid)와 겹치지 않게 앞에 표시를 붙인다.
export const libQid = (srcId: string) => `L:${srcId}`;
export const libPid = (bankFile: string, key: string) => `P:${bankFile.replace(/\.json$/, "")}:${key}`;
export const isLibId = (id: string | null | undefined) => typeof id === "string" && id.startsWith("L:");

export interface LibIndexUnit {
  tag: string; group: string; unit: string;
  count: number; mc: number; svg: number; passage: number; files: string[];
}
export interface LibIndexSubject { subject: string; count: number; units: LibIndexUnit[] }
export interface LibIndexBand { band: string; count: number; subjects: LibIndexSubject[] }
export interface LibIndex { total: number; files: Record<string, string>; bands: LibIndexBand[] }

export interface StudyGroup { id: string; name: string; color: string; tags: string[] }

export interface LibSettings {
  libUnits?: string[];
  libHidden?: string[];
  libRaid?: string[];
  groups?: StudyGroup[];
  studentGroups?: Record<string, string>;
  studentTags?: Record<string, string[]>;
}

const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

// 학생의 공부 범위(단원 태그). null = 따로 정하지 않음 → 반 전체 범위로 공부.
// 개별 범위 > 모둠 범위 순. 빈 목록도 '정함'으로 본다(아무것도 안 나옴을 교사가 바로 알아챌 수 있게 화면에서 경고).
export function scopeOf(s: LibSettings | null | undefined, studentId: string): { tags: string[]; source: "individual" | "group"; group?: StudyGroup } | null {
  if (!s) return null;
  const own = s.studentTags?.[studentId];
  if (Array.isArray(own)) return { tags: strList(own), source: "individual" };
  const gid = s.studentGroups?.[studentId];
  const g = gid ? (s.groups ?? []).find((x) => x.id === gid) : undefined;
  if (g) return { tags: strList(g.tags), source: "group", group: g };
  return null;
}

export function normalizeLibSettings(s: LibSettings | null | undefined) {
  return {
    libUnits: strList(s?.libUnits),
    libHidden: strList(s?.libHidden),
    libRaid: strList(s?.libRaid),
  };
}

export const GROUP_COLORS = ["#f2994a", "#2d9cdb", "#9b51e0", "#27ae60", "#eb5757", "#f2c94c", "#56ccf2", "#bb6bd9"];
