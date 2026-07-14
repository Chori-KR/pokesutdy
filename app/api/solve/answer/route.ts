import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";
import { SOLVE_REWARD, applyXp, gradeShort } from "@/lib/game";

// 문제풀이 채점 (명세 §4.5): 정답 +20P +2XP, 하루 한도까지. 통계·풀이 로그 집계.
// M6: 레벨업 시 보상 포인트도 함께 지급.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const questionId = String(body?.question_id ?? "");
  const chosenIdx = Number(body?.chosen_idx);
  const text = typeof body?.text === "string" ? body.text : "";
  const isShortAnswer = typeof body?.text === "string";
  if (!questionId) return jsonError(400, "답안이 올바르지 않아요.");
  if (!isShortAnswer && !(chosenIdx >= 0 && chosenIdx <= 3))
    return jsonError(400, "답안이 올바르지 않아요.");

  // 방금 서버가 출제한 그 문제만 채점 — 아는 문제를 골라 반복 제출하는 꼼수 차단
  if (student.day_state?.solveQ !== questionId)
    return jsonError(409, "출제된 문제가 아니에요. 새 문제를 받아주세요.");

  const { solveLimit } = await getClassSettings(supa, student.class_id);
  const solveCount = Number(student.day_state?.solveCount ?? 0);
  if (solveCount >= solveLimit)
    return jsonError(409, "오늘의 문제풀이를 모두 마쳤어요!");

  const { data: q } = await supa
    .from("questions")
    .select("id, answer_idx, tries, wrong, type, options")
    .eq("id", questionId)
    .eq("class_id", student.class_id)
    .single();
  if (!q) return jsonError(404, "문제를 찾을 수 없어요.");

  const correct = q.type === "short"
    ? gradeShort(text, (q.options as string[]) ?? [])
    : chosenIdx === q.answer_idx;
  const g = correct ? applyXp(student, 2) : { xp: student.xp, level: student.level, levelBonus: 0 };
  const points = student.points + (correct ? SOLVE_REWARD : 0) + g.levelBonus;
  const day_state = { ...student.day_state, solveCount: solveCount + 1, solveQ: null };

  const [{ error }] = await Promise.all([
    supa.from("students").update({ points, day_state, xp: g.xp, level: g.level }).eq("id", student.id),
    supa
      .from("questions")
      .update({ tries: q.tries + 1, wrong: q.wrong + (correct ? 0 : 1) })
      .eq("id", q.id),
    supa.from("answer_logs").insert({
      student_id: student.id,
      question_id: q.id,
      correct,
      context: "solve",
    }),
  ]);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({
    correct,
    answer_idx: q.answer_idx,
    answerText: q.type === "short" ? ((q.options as string[]) ?? [])[0] ?? "" : undefined,
    points,
    xp: g.xp,
    level: g.level,
    levelBonus: g.levelBonus,
    solveCount: solveCount + 1,
    solveLimit,
    reward: correct ? SOLVE_REWARD : 0,
  });
}
