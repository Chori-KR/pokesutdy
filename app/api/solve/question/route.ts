import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";

// 문제풀이 출제 (명세 §4.5): 출제 중(active) 문제에서 1개.
// 정답 인덱스는 절대 내려보내지 않는다 — 포인트(+20P)가 걸려 있어서.
// 출제한 문제 id를 day_state.solveQ에, 4지선다 보기 셔플 순서를 day_state.solveOrder에 기억.
// M11: 똑똑한 출제 — 안 푼 문제 > 최근 틀린 문제 > 최근 맞힌 문제 순으로 가중치.
function shuffledIdx(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

  // 똑똑한 출제: 이 학생의 기록으로 문제별 최신 결과를 구해 가중치 부여
  const { data: logs } = await supa
    .from("answer_logs")
    .select("question_id, correct, created_at")
    .eq("student_id", student.id);
  const lastResult = new Map<string, { correct: boolean; at: string }>();
  for (const l of logs ?? []) {
    if (!l.question_id) continue;
    const prev = lastResult.get(l.question_id);
    if (!prev || String(l.created_at) > prev.at)
      lastResult.set(l.question_id, { correct: !!l.correct, at: String(l.created_at) });
  }
  const lastServed = student.day_state?.solveQ ?? null;
  const weightOf = (id: string): number => {
    if (id === lastServed) return 0.15; // 방금 낸 문제는 되도록 피함
    const r = lastResult.get(id);
    if (!r) return 6; // 안 풀어본 것 우선
    if (!r.correct) return 4; // 최근 틀린 것(복습)
    return 1; // 최근 맞힌 것
  };
  const weights = qs.map((q) => weightOf(q.id));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let idx = 0;
  for (let i = 0; i < qs.length; i++) {
    roll -= weights[i];
    if (roll <= 0) { idx = i; break; }
    idx = i;
  }
  const picked = qs[idx];

  // 4지선다 보기 셔플(부정 완화) — 표시 순서를 저장해 채점 때 원복. 단답형은 정답 노출 금지.
  let order: number[] | null = null;
  let outOptions = ((picked.options as string[]) ?? []);
  if (picked.type !== "short") {
    order = shuffledIdx(outOptions.length);
    outOptions = order.map((i) => (picked.options as string[])[i]);
  }
  const q = picked.type === "short"
    ? { id: picked.id, body: picked.body, difficulty: picked.difficulty, tag: picked.tag, type: "short", options: [] as string[] }
    : { id: picked.id, body: picked.body, options: outOptions, difficulty: picked.difficulty, tag: picked.tag, type: picked.type ?? "multiple" };

  const day_state = { ...student.day_state, solveQ: q.id, solveOrder: order };
  const { error } = await supa.from("students").update({ day_state }).eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({ question: q, solveCount, solveLimit });
}
