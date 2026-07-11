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
  const [{ data: logs }, { data: catches }] = await Promise.all([
    supa
      .from("answer_logs")
      .select("student_id, correct, created_at")
      .in("student_id", ids),
    supa.from("catches").select("student_id").in("student_id", ids),
  ]);

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
