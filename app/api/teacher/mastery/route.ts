import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { fetchAll } from "@/lib/fetchAll";
import { isMissingColumn } from "@/lib/api";
import { getLibrary } from "@/lib/library";
import { textKey } from "@/lib/bankImport";
import { Attempt, computeMastery, Level } from "@/lib/mastery";

// 학습경로 2-1: 학생 × 성취기준 숙달 현황 (읽기 전용).
// 풀이 기록 전체에서 성취기준이 있는 기본 문제만 본다:
//   - 기본 문제(lib_qid, 0012)
//   - 예전에 학급으로 복사된 기본 문제(question_id) — 같은 단원·같은 본문의 기본 문제로 찾아 연결
//   - 지워진 문제의 기록 — 남아 있는 문제 내용(q_tag·q_body, 0009)으로 찾아 연결
export async function GET(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const { data: students } = await supa.from("students").select("id, nickname").eq("class_id", cls.id).order("nickname");
  if (!students?.length) return NextResponse.json({ students: [] });
  const ids = students.map((s) => s.id as string);

  type Row = { student_id: string; question_id: string | null; lib_qid?: string | null; q_tag?: string | null; q_body?: string | null; correct: boolean; created_at: string };
  type Pg = PromiseLike<{ data: unknown[] | null; error: { message?: string; code?: string } | null }>;
  const page = (cols: string) => fetchAll<Row>((a, b) =>
    supa.from("answer_logs").select(cols).in("student_id", ids).order("created_at").order("id").range(a, b) as unknown as Pg);
  const BASE = "student_id, question_id, correct, created_at";
  let r = await page(BASE + ", lib_qid, q_tag, q_body");
  if (r.error && isMissingColumn(r.error)) r = await page(BASE + ", q_tag, q_body");
  if (r.error && isMissingColumn(r.error)) r = await page(BASE);
  const logs = r.data ?? [];

  const lib = getLibrary();
  const { data: qRows } = await fetchAll<{ id: string; tag: string; body: string }>((a, b) =>
    supa.from("questions").select("id, tag, body").eq("class_id", cls.id).order("id").range(a, b) as unknown as Pg);
  const own = new Map((qRows ?? []).map((q) => [q.id, lib.byBody.get(`${q.tag}|${textKey(q.body)}`)]));

  const perStudent = new Map<string, Attempt[]>();
  for (const l of logs) {
    const lq = l.lib_qid ? lib.byId.get(l.lib_qid)
      : l.question_id ? own.get(l.question_id)
      : l.q_tag && l.q_body ? lib.byBody.get(`${l.q_tag}|${textKey(l.q_body)}`) : undefined;
    if (!lq?.standard) continue;
    (perStudent.get(l.student_id) ?? perStudent.set(l.student_id, []).get(l.student_id)!)
      .push({ std: lq.standard, level: lq.difficulty as Level, correct: !!l.correct, at: String(l.created_at) });
  }

  return NextResponse.json({
    students: students.map((s) => ({ id: s.id, nickname: s.nickname, cells: computeMastery(perStudent.get(s.id as string) ?? []) })),
  });
}
