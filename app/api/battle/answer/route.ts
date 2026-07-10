import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { gainXpCalc } from "@/lib/game";

// 배틀 답안 기록 — 서버가 정답을 대조해 통계(tries/wrong)와
// 정답당 +2XP(승패 무관, 명세 §4.2)를 권위 있게 반영한다.
// chosen_idx: 0~3, 시간 초과는 null.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const questionId = String(body?.question_id ?? "");
  const chosenIdx =
    body?.chosen_idx === null || body?.chosen_idx === undefined
      ? null
      : Number(body.chosen_idx);
  if (!questionId) return jsonError(400, "question_id가 필요해요.");

  const { data: q } = await supa
    .from("questions")
    .select("id, answer_idx, tries, wrong, class_id")
    .eq("id", questionId)
    .eq("class_id", student.class_id)
    .single();
  if (!q) return jsonError(404, "문제를 찾을 수 없어요.");

  const correct = chosenIdx !== null && chosenIdx === q.answer_idx;

  const updates: Promise<unknown>[] = [
    Promise.resolve(
      supa
        .from("questions")
        .update({ tries: q.tries + 1, wrong: q.wrong + (correct ? 0 : 1) })
        .eq("id", q.id)
    ),
    Promise.resolve(
      supa.from("answer_logs").insert({
        student_id: student.id,
        question_id: q.id,
        correct,
        context: "battle",
      })
    ),
  ];

  let xp = student.xp;
  let level = student.level;
  if (correct) {
    const g = gainXpCalc(student, 2);
    xp = g.xp;
    level = g.level;
    updates.push(
      Promise.resolve(supa.from("students").update({ xp, level }).eq("id", student.id))
    );
  }
  await Promise.all(updates);

  return NextResponse.json({ correct, answer_idx: q.answer_idx, xp, level });
}
