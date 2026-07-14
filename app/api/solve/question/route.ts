import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";

// 문제풀이 출제 (명세 §4.5): 출제 중(active) 문제에서 랜덤 1개.
// 정답 인덱스는 절대 내려보내지 않는다 — 포인트(+20P)가 걸려 있어서.
// 출제한 문제 id를 day_state.solveQ에 기억해 두고, 채점은 그 문제만 받아준다.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { solveLimit } = await getClassSettings(supa, student.class_id);
  const solveCount = Number(student.day_state?.solveCount ?? 0);
  if (solveCount >= solveLimit)
    return jsonError(409, "오늘의 문제풀이를 모두 마쳤어요! 내일 또 만나요.");

  const { data: qs } = await supa
    .from("questions")
    .select("id, body, options, difficulty, tag, type")
    .eq("class_id", student.class_id)
    .eq("active", true);
  if (!qs || qs.length === 0)
    return jsonError(404, "출제 중인 문제가 없어요. 선생님께 알려주세요!");

  const picked = qs[Math.floor(Math.random() * qs.length)];
  // 단답형은 정답(options)을 절대 내려보내지 않는다
  const q = picked.type === "short"
    ? { id: picked.id, body: picked.body, difficulty: picked.difficulty, tag: picked.tag, type: "short", options: [] }
    : picked;

  const day_state = { ...student.day_state, solveQ: q.id };
  const { error } = await supa
    .from("students")
    .update({ day_state })
    .eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({ question: q, solveCount, solveLimit });
}
