import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";

// 레이드 답안 기록 — 배틀(/api/battle/answer)과 같이 서버가 정답을 대조해
// 풀이 기록(answer_logs, context='raid')과 문항 통계(tries/wrong)를 남긴다.
// 레이드의 진행(체력·승리)은 지금처럼 화면에서 처리하고, 여기서는 기록만 한다.
// chosen_idx: 원래 보기 순서 기준 0~3, 시간 초과는 null.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const questionId = String(body?.question_id ?? "");
  const chosenIdx =
    body?.chosen_idx === null || body?.chosen_idx === undefined ? null : Number(body.chosen_idx);
  if (!questionId) return jsonError(400, "question_id가 필요해요.");

  const { data: q } = await supa
    .from("questions")
    .select("id, answer_idx, tries, wrong")
    .eq("id", questionId)
    .eq("class_id", student.class_id)
    .single();
  if (!q) return jsonError(404, "문제를 찾을 수 없어요.");

  const correct = chosenIdx !== null && chosenIdx === q.answer_idx;
  await Promise.all([
    supa.from("questions").update({ tries: q.tries + 1, wrong: q.wrong + (correct ? 0 : 1) }).eq("id", q.id),
    supa.from("answer_logs").insert({ student_id: student.id, question_id: q.id, correct, context: "raid" }),
  ]);
  return NextResponse.json({ ok: true, correct });
}
