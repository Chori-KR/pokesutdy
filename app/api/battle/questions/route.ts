import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getClassSettings, recentResults } from "@/lib/api";
import { loadServeQuestions } from "@/lib/questionServe";
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
  // 지문이 딸린 문제는 '읽을 글'이 선생님이 정한 길이(battleReadMax) 이하인 것만 — 긴 글은 문제풀이에서.
  // 학생에게 공부 범위(모둠·개별)가 있으면 그 단원 안에서만.
  const { battleReadMax, lib } = await getClassSettings(supa, student.class_id);
  const { questions, passages } = await loadServeQuestions(supa, student.class_id, { raid: false, readMax: battleReadMax, lib, studentId: student.id });

  // 학생 기록으로 (1) 문제별 최신 결과(가중치) (2) 오늘 배틀에서 이미 나온 문제(PP) 계산.
  // 최근 기록만 봐도 충분(오래된 건 '안 푼 것'처럼 다시 나오는 게 오히려 복습에 좋음).
  // 전체 스캔을 막아 기록이 쌓여도 느려지지 않게 최신 400개로 제한.
  const logs = await recentResults(supa, student.id);
  const seoulFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
  const today = seoulToday();
  const lastResult = new Map<string, { correct: boolean; at: string }>();
  const seenToday = new Set<string>();
  for (const l of logs) {
    if (!l.qid) continue;
    const prev = lastResult.get(l.qid);
    if (!prev || String(l.created_at) > prev.at)
      lastResult.set(l.qid, { correct: !!l.correct, at: String(l.created_at) });
    if (l.context === "battle" && seoulFmt.format(new Date(l.created_at as string)) === today)
      seenToday.add(l.qid);
  }

  const withStats = questions.map((q) => {
    const r = lastResult.get(q.id);
    return { ...q, last: !r ? "none" : r.correct ? "correct" : "wrong" };
  });

  return NextResponse.json({ questions: withStats, passages, seenTodayIds: [...seenToday] });
}
