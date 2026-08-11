import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/api";
import { seoulToday } from "@/lib/game";

// 배틀 시작 전에 출제 중(active) 문제를 전부 프리로드 (명세 §7: 즉답 UX).
// 정답 인덱스를 포함해 내려보내는 것은 M1의 의도된 절충 —
// 채점·통계·XP는 /api/battle/answer 가 서버 권위로 기록한다.
// M11: 각 문제에 이 학생의 최신 결과(last: 똑똑한 출제 가중치용)를 붙이고,
//      오늘 배틀에서 이미 나온 문제 id(seenTodayIds: 기술별 남은 문제 수용)를 함께 반환.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  // 배틀은 4지선다만(단답형은 문제풀이 탭), 그리고 레이드 전용 문제는 제외한다.
  const base = () =>
    supa
      .from("questions")
      .select("id, body, options, answer_idx, difficulty, tag")
      .eq("class_id", student.class_id)
      .eq("active", true)
      .neq("type", "short");

  let { data, error } = await base().eq("raid_only", false);
  // raid_only 컬럼이 아직 없는 DB(0008 미실행)에서도 배틀이 멈추지 않도록 폴백
  if (error) ({ data } = await base());
  const questions = data ?? [];

  // 학생 기록으로 (1) 문제별 최신 결과(가중치) (2) 오늘 배틀에서 이미 나온 문제(PP) 계산.
  // 최근 기록만 봐도 충분(오래된 건 '안 푼 것'처럼 다시 나오는 게 오히려 복습에 좋음).
  // 전체 스캔을 막아 기록이 쌓여도 느려지지 않게 최신 400개로 제한.
  const { data: logs } = await supa
    .from("answer_logs")
    .select("question_id, correct, created_at, context")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false })
    .limit(400);
  const seoulFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
  const today = seoulToday();
  const lastResult = new Map<string, { correct: boolean; at: string }>();
  const seenToday = new Set<string>();
  for (const l of logs ?? []) {
    if (!l.question_id) continue;
    const prev = lastResult.get(l.question_id);
    if (!prev || String(l.created_at) > prev.at)
      lastResult.set(l.question_id, { correct: !!l.correct, at: String(l.created_at) });
    if (l.context === "battle" && seoulFmt.format(new Date(l.created_at as string)) === today)
      seenToday.add(l.question_id);
  }

  const withStats = questions.map((q) => {
    const r = lastResult.get(q.id);
    return { ...q, last: !r ? "none" : r.correct ? "correct" : "wrong" };
  });

  return NextResponse.json({ questions: withStats, seenTodayIds: [...seenToday] });
}
