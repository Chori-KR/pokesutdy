import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { seoulToday } from "@/lib/game";

// 학생별 통계 (명세 §5.4): 정답률, 오늘/누적 풀이 수, 도감 진행도, 최근 활동, 단원별 정답률.
// students 테이블은 anon 정책이 없어 서버 경유로만 조회 가능.
// M11: 기간 필터(period=today|7d|30d|all)로 정답률·오답률·단원 통계를 그 기간 기준으로 계산.
export async function GET(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const period = new URL(req.url).searchParams.get("period") ?? "all"; // today | 7d | 30d | all

  const { data: students } = await supa
    .from("students")
    .select("id, nickname, points, level, hp, inventory, created_at")
    .eq("class_id", cls.id)
    .order("nickname");
  if (!students || students.length === 0)
    return NextResponse.json({ students: [], summary: { avgCorrectRate: null, totalSolved: 0, activeToday: 0 }, weakQuestions: [], period });

  const ids = students.map((s) => s.id);
  const [{ data: logs }, { data: catches }, { data: qRows }] = await Promise.all([
    supa
      .from("answer_logs")
      .select("student_id, question_id, correct, created_at")
      .in("student_id", ids),
    supa.from("catches").select("student_id").in("student_id", ids),
    supa.from("questions").select("id, tag, body").eq("class_id", cls.id),
  ]);
  // 문제 id → 단원(태그)/본문 매핑
  const tagOf = new Map<string, string>();
  const bodyOf = new Map<string, string>();
  for (const q of qRows ?? []) {
    tagOf.set(q.id as string, (q.tag as string) ?? "미분류");
    bodyOf.set(q.id as string, (q.body as string) ?? "");
  }

  const today = seoulToday();
  const seoulDay = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(iso));
  const now = Date.now();
  const inPeriod = (iso: string) => {
    if (period === "all") return true;
    if (period === "today") return seoulDay(iso) === today;
    const days = period === "7d" ? 7 : 30;
    return new Date(iso).getTime() >= now - days * 86400000;
  };

  const allLogs = logs ?? [];
  const periodLogs = allLogs.filter((l) => inPeriod(String(l.created_at)));

  const byStudent = students.map((s) => {
    const mineAll = allLogs.filter((l) => l.student_id === s.id);
    const mine = periodLogs.filter((l) => l.student_id === s.id); // 기간 내
    const correct = mine.filter((l) => l.correct).length;
    const todayCount = mineAll.filter((l) => seoulDay(String(l.created_at)) === today).length;
    const lastActive = mineAll.length
      ? mineAll.reduce((a, b) => (a.created_at > b.created_at ? a : b)).created_at
      : null;
    // 단원(태그)별 정답률(기간 내) — 삭제된 문제(태그 매핑 없음)는 제외
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

  // 오답률 TOP — 기간 내 answer_logs로 문제별 집계(3회 이상 풀린 것)
  const perQ = new Map<string, { total: number; wrong: number }>();
  for (const l of periodLogs) {
    if (!l.question_id || !tagOf.has(l.question_id)) continue;
    const t = perQ.get(l.question_id) ?? { total: 0, wrong: 0 };
    t.total += 1;
    if (!l.correct) t.wrong += 1;
    perQ.set(l.question_id, t);
  }
  const weakQuestions = [...perQ.entries()]
    .filter(([, t]) => t.total >= 3)
    .map(([id, t]) => ({ id, body: bodyOf.get(id) ?? "", tag: tagOf.get(id) ?? "미분류", tries: t.total, wrong: t.wrong, rate: Math.round((t.wrong / t.total) * 100) }))
    .sort((a, b) => b.rate - a.rate || b.tries - a.tries)
    .slice(0, 10);

  const graded = byStudent.filter((s) => s.correctRate !== null);
  const summary = {
    avgCorrectRate: graded.length
      ? Math.round(graded.reduce((a, s) => a + (s.correctRate ?? 0), 0) / graded.length)
      : null,
    totalSolved: periodLogs.length,
    activeToday: byStudent.filter((s) => s.todayCount > 0).length,
  };

  return NextResponse.json({ students: byStudent, summary, weakQuestions, period });
}
