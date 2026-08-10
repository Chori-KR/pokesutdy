import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { seoulToday } from "@/lib/game";

// 학생별 통계 (명세 §5.4): 정답률, 오늘/누적 풀이 수, 도감 진행도, 최근 활동.
// students 테이블은 anon 정책이 없어 서버 경유로만 조회 가능.
export async function GET(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const { data: students } = await supa
    .from("students")
    .select("id, nickname, points, level, hp, inventory, created_at")
    .eq("class_id", cls.id)
    .order("nickname");
  if (!students || students.length === 0)
    return NextResponse.json({ students: [], summary: { avgCorrectRate: null, totalSolved: 0 } });

  const ids = students.map((s) => s.id);
  const [{ data: logs }, { data: catches }, { data: qRows }] = await Promise.all([
    supa
      .from("answer_logs")
      .select("student_id, question_id, correct, created_at")
      .in("student_id", ids),
    supa.from("catches").select("student_id").in("student_id", ids),
    supa.from("questions").select("id, tag").eq("class_id", cls.id),
  ]);
  // 문제 id → 단원(태그) 매핑 (학생별 취약 단원 계산용)
  const tagOf = new Map<string, string>();
  for (const q of qRows ?? []) tagOf.set(q.id as string, (q.tag as string) ?? "미분류");

  const today = seoulToday();
  const seoulDay = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(iso));

  const byStudent = students.map((s) => {
    const mine = (logs ?? []).filter((l) => l.student_id === s.id);
    const correct = mine.filter((l) => l.correct).length;
    const todayCount = mine.filter((l) => seoulDay(l.created_at) === today).length;
    const lastActive = mine.length
      ? mine.reduce((a, b) => (a.created_at > b.created_at ? a : b)).created_at
      : null;
    // 단원(태그)별 정답률 — 삭제된 문제(태그 매핑 없음)는 제외
    const perTag = new Map<string, { total: number; correct: number }>();
    for (const l of mine) {
      const tag = l.question_id ? tagOf.get(l.question_id) : undefined;
      if (!tag) continue;
      const t = perTag.get(tag) ?? { total: 0, correct: 0 };
      t.total += 1;
      if (l.correct) t.correct += 1;
      perTag.set(tag, t);
    }
    const byTag = [...perTag.entries()]
      .map(([tag, t]) => ({ tag, total: t.total, correct: t.correct, rate: Math.round((t.correct / t.total) * 100) }))
      .sort((a, b) => a.rate - b.rate || b.total - a.total); // 취약(낮은 정답률) 먼저
    return {
      id: s.id,
      nickname: s.nickname,
      points: s.points,
      level: s.level,
      total: mine.length,
      correct,
      correctRate: mine.length ? Math.round((correct / mine.length) * 100) : null,
      todayCount,
      dexCount: (catches ?? []).filter((c) => c.student_id === s.id).length,
      lastActive,
      joinedAt: s.created_at,
      byTag,
    };
  });

  const graded = byStudent.filter((s) => s.correctRate !== null);
  const summary = {
    avgCorrectRate: graded.length
      ? Math.round(graded.reduce((a, s) => a + (s.correctRate ?? 0), 0) / graded.length)
      : null,
    totalSolved: (logs ?? []).length,
    activeToday: byStudent.filter((s) => s.todayCount > 0).length,
  };

  return NextResponse.json({ students: byStudent, summary });
}
