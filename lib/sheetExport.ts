import { randomBytes } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

// 구글 시트 연동 — 학급의 풀이 기록을 시트(Apps Script)가 가져갈 수 있게 내보낸다.
//
// 인증: 학급 설정(classes.settings.exportToken)에 저장된 무작위 토큰.
//   · DB 구조를 바꾸지 않으려고 settings(jsonb)에 둔다.
//   · 학생 쪽 API는 getClassSettings()로 정해진 필드만 내보내므로 토큰이 학생에게 새지 않는다.
//
// 가져가기: created_at 오름차순으로 PAGE 행씩. 시트는 받은 cursor를 다음 요청에 넘겨
//   "이미 받은 것 이후"만 이어 받는다(누가 기록 방식).

export const EXPORT_PAGE = 1000; // Supabase(PostgREST) 한 번 응답 상한과 같게

export function newExportToken() {
  return "pk_" + randomBytes(24).toString("base64url");
}

const CONTEXT_KO: Record<string, string> = { battle: "배틀", solve: "문제풀이", raid: "레이드" };
// 시트 피벗에서 열이 쉬움→보통→어려움 순으로 정렬되도록 번호를 붙인다.
const DIFF_KO: Record<string, string> = { easy: "① 쉬움", medium: "② 보통", hard: "③ 어려움" };

// 태그 → [과목, 단원]
//   "수학·분수의 덧셈" → [수학, 분수의 덧셈]
//   "특수·수학·초3~4"  → [수학, 초3~4]
//   "분수의 덧셈"       → [기타, 분수의 덧셈]
export function splitTag(tag: string | null | undefined): [string, string] {
  const parts = String(tag ?? "").split("·").map((s) => s.trim()).filter(Boolean);
  if (parts[0] === "특수") parts.shift();
  if (parts.length === 0) return ["기타", "미분류"];
  if (parts.length === 1) return ["기타", parts[0]];
  return [parts[0], parts.slice(1).join("·")];
}

// 시트에서 읽기 좋게 흔한 LaTeX 수식을 일반 글자로 바꾼다. ($\frac{1}{2}$ → 1/2)
const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", n: "ⁿ" };
const SUB: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
const mapChars = (s: string, m: Record<string, string>) =>
  [...s].every((c) => c in m) ? [...s].map((c) => m[c]).join("") : null;

export function plainMath(s: string | null | undefined): string {
  let t = String(s ?? "");
  if (!t.includes("$") && !t.includes("\\")) return t;
  t = t.replace(/\$/g, "");
  for (let i = 0; i < 5 && /\\[dt]?frac\{/.test(t); i++)
    t = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2");
  t = t.replace(/\\sqrt\{([^{}]*)\}/g, "√$1")
    .replace(/\\(?:mathrm|text|mathbf|operatorname)\{([^{}]*)\}/g, "$1")
    .replace(/\^\\circ|\^\{\\circ\}/g, "°")
    .replace(/\^\{([^{}]*)\}|\^(\w)/g, (m, a, b) => mapChars(a ?? b, SUP) ?? `^${a ?? b}`)
    .replace(/_\{([^{}]*)\}|_(\d)/g, (m, a, b) => mapChars(a ?? b, SUB) ?? `_${a ?? b}`);
  const SYM: [RegExp, string][] = [
    [/\\times/g, "×"], [/\\div/g, "÷"], [/\\cdot/g, "·"], [/\\pm/g, "±"],
    [/\\le(q)?\b/g, "≤"], [/\\ge(q)?\b/g, "≥"], [/\\ne(q)?\b/g, "≠"], [/\\approx/g, "≈"],
    [/\\pi/g, "π"], [/\\(?:right|R)ightarrow|\\to\b/g, "→"], [/\\leftarrow/g, "←"],
    [/\\left|\\right/g, ""], [/\\[,;:! ]/g, " "], [/\\%/g, "%"],
  ];
  for (const [re, r] of SYM) t = t.replace(re, r);
  return t.replace(/[{}]/g, "").replace(/\s{2,}/g, " ").trim();
}

// Supabase 한 번 응답이 1,000행으로 잘리므로 끝까지 나눠 받는다.
async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const out: T[] = [];
  for (let from = 0; ; from += EXPORT_PAGE) {
    const { data, error } = await page(from, from + EXPORT_PAGE - 1);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < EXPORT_PAGE) return out;
  }
}

export interface ExportClass { id: string; name: string; class_code: string }

export interface ExportStudent { nickname: string; level: number; points: number; dex: number; joinedAt: string }

// 한 행 = [기록ID, 시각(ISO), 닉네임, 상황, 과목, 단원, 난이도, 정답(1/0), 문항, 정답 보기]
export type ExportLogRow = [string, string, string, string, string, string, string, number, string, string];

export async function exportStudents(supa: SupabaseClient, classId: string): Promise<ExportStudent[]> {
  const students = await fetchAll<{ id: string; nickname: string; level: number; points: number; created_at: string }>(
    (a, b) => supa.from("students").select("id, nickname, level, points, created_at")
      .eq("class_id", classId).order("nickname").range(a, b));
  if (students.length === 0) return [];
  const catches = await fetchAll<{ student_id: string }>(
    (a, b) => supa.from("catches").select("student_id")
      .in("student_id", students.map((s) => s.id)).order("id").range(a, b));
  const dex = new Map<string, number>();
  for (const c of catches) dex.set(c.student_id, (dex.get(c.student_id) ?? 0) + 1);
  return students.map((s) => ({
    nickname: s.nickname, level: s.level, points: s.points,
    dex: dex.get(s.id) ?? 0, joinedAt: s.created_at,
  }));
}

// cursor = "created_at|id" — 마지막으로 받은 행. 비어 있으면 처음부터.
export async function exportLogs(supa: SupabaseClient, classId: string, cursor: string) {
  const { data: studs } = await supa.from("students").select("id, nickname").eq("class_id", classId);
  const nick = new Map<string, string>((studs ?? []).map((s) => [s.id as string, s.nickname as string]));
  if (nick.size === 0) return { rows: [] as ExportLogRow[], cursor, done: true };

  const [curTs, curId] = cursor ? cursor.split("|") : ["", ""];
  let q = supa.from("answer_logs")
    .select("id, student_id, question_id, correct, context, created_at")
    .in("student_id", [...nick.keys()])
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(EXPORT_PAGE);
  // 같은 시각의 기록이 경계에 걸려도 빠지거나 겹치지 않도록 gte로 받고 아래에서 걸러낸다
  if (curTs) q = q.gte("created_at", curTs);
  const { data: raw, error } = await q;
  if (error) throw error;
  const fetched = raw ?? [];
  const logs = fetched.filter((l) =>
    !curTs || l.created_at !== curTs || (curId !== "" && String(l.id) > curId));

  const qids = [...new Set(logs.map((l) => l.question_id).filter(Boolean))] as string[];
  const qmap = new Map<string, { tag: string; difficulty: string; body: string; options: unknown; answer_idx: number }>();
  for (let i = 0; i < qids.length; i += 200) {
    const { data: qs } = await supa.from("questions")
      .select("id, tag, difficulty, body, options, answer_idx").in("id", qids.slice(i, i + 200));
    for (const x of qs ?? []) qmap.set(x.id as string, x as never);
  }

  const rows: ExportLogRow[] = logs.map((l) => {
    const qq = l.question_id ? qmap.get(l.question_id as string) : undefined;
    const [subject, unit] = qq ? splitTag(qq.tag) : ["기타", "(삭제된 문제)"];
    const opts = Array.isArray(qq?.options) ? (qq!.options as unknown[]) : [];
    return [
      // 시각은 밀리초까지로 정리해 보낸다(시트 쪽 날짜 변환이 확실하도록). cursor는 원본 그대로.
      String(l.id), new Date(l.created_at as string).toISOString(), nick.get(l.student_id as string) ?? "?",
      CONTEXT_KO[l.context as string] ?? String(l.context ?? ""),
      subject, unit, qq ? DIFF_KO[qq.difficulty] ?? qq.difficulty : "",
      l.correct ? 1 : 0,
      plainMath(qq?.body), plainMath(qq ? String(opts[qq.answer_idx] ?? "") : ""),
    ];
  });

  const last = fetched[fetched.length - 1];
  return {
    rows,
    cursor: last ? `${last.created_at}|${last.id}` : cursor,
    done: fetched.length < EXPORT_PAGE,
  };
}

export async function findClassByExportToken(supa: SupabaseClient, token: string): Promise<ExportClass | null> {
  if (!/^pk_[A-Za-z0-9_-]{20,}$/.test(token)) return null;
  const { data } = await supa.from("classes")
    .select("id, name, class_code, settings").eq("settings->>exportToken", token).limit(1);
  const c = data?.[0];
  if (!c || (c.settings as { exportToken?: string })?.exportToken !== token) return null;
  return { id: c.id as string, name: c.name as string, class_code: c.class_code as string };
}
