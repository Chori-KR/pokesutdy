import { SupabaseClient } from "@supabase/supabase-js";
import { isMissingColumn } from "@/lib/api";
import { fetchAll } from "@/lib/fetchAll";
import { LibSettings, isLibId, normalizeLibSettings, scopeOf } from "@/lib/libraryShared";
import { getLibrary, libraryQuestionsFor, libraryMedia } from "@/lib/library";

// 학생에게 출제할 문제를 불러온다 (배틀·레이드 프리로드 공용).
//
// 지문·그림은 무거우므로 여기서는 내려보내지 않고 "있다"는 표시만 붙인다.
//   passage_id : 딸린 지문 (같은 지문 문제를 이어서 내는 데 씀)
//   has_svg    : 문제 그림이 있는지
//   read_len   : 읽을 글 길이 = 지문 + 문제 본문 (배틀 길이 상한 판단용)
// 실제 지문·그림은 그 문제가 나올 때 /api/question/media 로 받는다.
//
// 0011(지문·그림) 마이그레이션 전 DB에서도 예전처럼 동작하도록 칸이 없으면 빼고 다시 읽는다.
//
// 출제 범위 = 우리 반 문제(출제 중) + 기본 문제 은행(켠 단원, 숨긴 문제 제외).
// 학생에게 공부 범위(모둠·개별)가 있으면 그 단원 태그 안에서만 — 기본 문제는 반에서 켰는지와 상관없이 범위대로.
// 레이드는 반 협동이라 범위와 상관없이 레이드 문제(우리 반 raid_only + 기본 문제 libRaid) 전부.

export interface ServedQuestion {
  id: string;
  body: string;
  options: string[];
  answer_idx: number;
  difficulty: "easy" | "medium" | "hard";
  tag: string;
  passage_id: string | null;
  has_svg: boolean;
  read_len: number;
}

export interface PassageMeta { id: string; title: string; len: number }

type Row = {
  id: string; body: string; options: string[]; answer_idx: number; difficulty: ServedQuestion["difficulty"];
  tag: string; svg?: string | null; passage_id?: string | null;
};

const BASE = "id, body, options, answer_idx, difficulty, tag";

export async function loadServeQuestions(
  supa: SupabaseClient,
  classId: string,
  opts: { raid: boolean; readMax?: number; lib?: LibSettings; studentId?: string },
): Promise<{ questions: ServedQuestion[]; passages: PassageMeta[]; error?: { message?: string } }> {
  const query = (cols: string, raidFilter: boolean) =>
    fetchAll<Row>((from, to) => {
      let q = supa.from("questions").select(cols)
        .eq("class_id", classId).eq("active", true)
        .neq("type", "short"); // 배틀·레이드는 4지선다만 (단답형은 문제풀이 탭)
      if (raidFilter) q = q.eq("raid_only", opts.raid);
      return q.order("id").range(from, to) as unknown as PromiseLike<{ data: unknown[] | null; error: { message?: string } | null }>;
    });

  let { data, error } = await query(BASE + ", svg, passage_id", true);
  if (error && isMissingColumn(error) && !/raid_only/.test(error.message ?? ""))
    ({ data, error } = await query(BASE, true)); // 0011 전
  if (error && /raid_only/.test(error.message ?? "")) {
    if (opts.raid) return { questions: [], passages: [], error }; // 0008 전: 레이드 문제 없음
    ({ data, error } = await query(BASE, false));                   // 0008 전 배틀
  }
  const scope = opts.raid || !opts.studentId ? null : scopeOf(opts.lib, opts.studentId);
  const inScope = scope ? new Set(scope.tags) : null;
  const rows = (data ?? []).filter((r) => !inScope || inScope.has(r.tag));

  // 지문 길이 (본문은 보내지 않음)
  const pids = [...new Set(rows.map((r) => r.passage_id).filter(Boolean))] as string[];
  const pmeta = new Map<string, PassageMeta>();
  for (let i = 0; i < pids.length; i += 200) {
    const { data: ps } = await supa.from("passages").select("id, title, body").in("id", pids.slice(i, i + 200));
    for (const p of ps ?? [])
      pmeta.set(p.id as string, { id: p.id as string, title: (p.title as string) ?? "", len: String(p.body ?? "").length });
  }

  const readMax = opts.readMax ?? 0;
  const questions: ServedQuestion[] = [];
  for (const r of rows) {
    const p = r.passage_id ? pmeta.get(r.passage_id) : undefined;
    const read_len = (p?.len ?? 0) + String(r.body ?? "").length;
    if (readMax > 0 && read_len > readMax) continue; // 너무 긴 글은 문제풀이에서만
    questions.push({
      id: r.id, body: r.body, options: r.options, answer_idx: r.answer_idx, difficulty: r.difficulty, tag: r.tag,
      passage_id: p ? p.id : null, has_svg: !!r.svg, read_len,
    });
  }

  // 기본 문제 은행
  const ls = normalizeLibSettings(opts.lib);
  const libQs = libraryQuestionsFor(scope ? scope.tags : ls.libUnits,
    { hidden: new Set(ls.libHidden), raid: new Set(ls.libRaid), raidMode: opts.raid });
  const lib = getLibrary();
  for (const q of libQs) {
    if (q.type === "short") continue; // 배틀·레이드는 4지선다만
    const p = q.passageId ? lib.passages.get(q.passageId) : undefined;
    const read_len = (p?.body.length ?? 0) + q.body.length;
    if (readMax > 0 && read_len > readMax) continue;
    if (p && !pmeta.has(p.id)) pmeta.set(p.id, { id: p.id, title: p.title, len: p.body.length });
    questions.push({
      id: q.id, body: q.body, options: q.options, answer_idx: q.answer_idx, difficulty: q.difficulty, tag: q.tag,
      passage_id: p ? p.id : null, has_svg: !!q.svg, read_len,
    });
  }

  const used = new Set(questions.map((q) => q.passage_id).filter(Boolean));
  return { questions, passages: [...pmeta.values()].filter((p) => used.has(p.id)) };
}

// 문제 한 개의 그림·지문 (그 문제가 실제로 나올 때 부름)
export interface QuestionMedia {
  svg: string | null;
  passage: { id: string; title: string; body: string; source: string; svg: string | null } | null;
}

export async function loadQuestionMedia(supa: SupabaseClient, classId: string, qid: string): Promise<QuestionMedia | null> {
  if (isLibId(qid)) {
    const m = libraryMedia(qid);
    return m ? { svg: m.svg, passage: m.passage } : null;
  }
  const { data: q, error } = await supa.from("questions")
    .select("id, svg, passage_id").eq("id", qid).eq("class_id", classId).maybeSingle();
  if (error && isMissingColumn(error)) return { svg: null, passage: null }; // 0011 전
  if (!q) return null;
  let passage: QuestionMedia["passage"] = null;
  if (q.passage_id) {
    const { data: p } = await supa.from("passages")
      .select("id, title, body, source, svg").eq("id", q.passage_id).eq("class_id", classId).maybeSingle();
    if (p) passage = { id: p.id, title: p.title ?? "", body: p.body ?? "", source: p.source ?? "", svg: p.svg ?? null };
  }
  return { svg: (q.svg as string | null) ?? null, passage };
}

// 문제풀이에 낼 수 있는 문제 (단답형 포함) — 출제 범위 규칙은 loadServeQuestions 와 같다.
export interface SolvePoolRow { id: string; body: string; options: string[]; difficulty: string; tag: string; type: string; passage_id?: string | null }

export async function loadSolvePool(supa: SupabaseClient, classId: string, lib: LibSettings | undefined, studentId: string): Promise<SolvePoolRow[]> {
  const pick = (cols: string) => fetchAll<SolvePoolRow>((from, to) =>
    supa.from("questions").select(cols).eq("class_id", classId).eq("active", true)
      .order("id").range(from, to) as unknown as PromiseLike<{ data: unknown[] | null; error: { message?: string } | null }>);
  let { data, error } = await pick("id, body, options, difficulty, tag, type, passage_id");
  if (error && isMissingColumn(error)) ({ data } = await pick("id, body, options, difficulty, tag, type")); // 0011 전
  const scope = scopeOf(lib, studentId);
  const inScope = scope ? new Set(scope.tags) : null;
  const rows = (data ?? []).filter((r) => !inScope || inScope.has(r.tag));
  const ls = normalizeLibSettings(lib);
  for (const q of libraryQuestionsFor(scope ? scope.tags : ls.libUnits, { hidden: new Set(ls.libHidden), raid: new Set(ls.libRaid), raidMode: false }))
    rows.push({ id: q.id, body: q.body, options: q.options, difficulty: q.difficulty, tag: q.tag, type: q.type, passage_id: q.passageId });
  return rows;
}

// 채점할 문제 한 개 — 우리 반 문제(tries/wrong 통계 포함) 또는 기본 문제
export interface GradableQuestion {
  id: string; answer_idx: number; type: string; options: string[]; tag: string; difficulty: string; body: string;
  tries?: number; wrong?: number; lib: boolean;
}

export async function loadGradable(supa: SupabaseClient, classId: string, qid: string): Promise<GradableQuestion | null> {
  if (isLibId(qid)) {
    const q = getLibrary().byId.get(qid);
    return q ? { id: q.id, answer_idx: q.answer_idx, type: q.type, options: q.options, tag: q.tag, difficulty: q.difficulty, body: q.body, lib: true } : null;
  }
  const { data: q } = await supa.from("questions")
    .select("id, answer_idx, tries, wrong, type, options, tag, difficulty, body")
    .eq("id", qid).eq("class_id", classId).maybeSingle();
  return q ? { ...(q as Omit<GradableQuestion, "lib">), lib: false } : null;
}

// 우리 반 문제만 문항 통계(tries/wrong)를 올린다 — 기본 문제는 풀이 기록으로 집계
export function bumpQuestionStats(supa: SupabaseClient, q: GradableQuestion, correct: boolean) {
  if (q.lib) return Promise.resolve();
  return Promise.resolve(supa.from("questions")
    .update({ tries: (q.tries ?? 0) + 1, wrong: (q.wrong ?? 0) + (correct ? 0 : 1) }).eq("id", q.id));
}
