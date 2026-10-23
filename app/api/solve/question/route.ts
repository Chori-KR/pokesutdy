import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings, recentResults } from "@/lib/api";
import { loadQuestionMedia, loadSolvePool } from "@/lib/questionServe";
import { scopeOf } from "@/lib/libraryShared";

// 문제풀이 출제 (명세 §4.5): 출제 중(active) 문제 + 기본 문제 은행(켠 단원)에서 1개.
// 학생에게 공부 범위(모둠·개별)가 있으면 그 단원 안에서만.
// 정답 인덱스는 절대 내려보내지 않는다 — 포인트(+20P)가 걸려 있어서.
// 출제한 문제 id를 day_state.solveQ에, 4지선다 보기 셔플 순서를 day_state.solveOrder에 기억.
// M11: 똑똑한 출제 — 안 푼 문제 > 최근 틀린 문제 > 최근 맞힌 문제 순으로 가중치.
// 지문 문제: 한 지문의 문제를 낸 뒤에는 같은 지문의 남은 문제를 이어서 낸다(day_state.solvePassage).
// 지문 길이 제한 없음 — 긴 글은 여기서 차분히 읽는다. 지문·그림은 응답에 함께 담는다.
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

  const { solveLimit, lib } = await getClassSettings(supa, student.class_id);
  const solveCount = Number(student.day_state?.solveCount ?? 0);
  if (solveCount >= solveLimit)
    return jsonError(409, "오늘의 문제풀이를 모두 마쳤어요! 내일 또 만나요.");

  const qs = await loadSolvePool(supa, student.class_id, lib, student.id);
  if (qs.length === 0)
    return jsonError(404, scopeOf(lib, student.id)
      ? "선생님이 정해 준 공부 범위에 문제가 없어요. 선생님께 알려주세요!"
      : "출제 중인 문제가 없어요. 선생님께 알려주세요!");

  // 똑똑한 출제: 이 학생의 기록으로 문제별 최신 결과를 구해 가중치 부여.
  // 최신 400개만 조회해 기록이 쌓여도 느려지지 않게 함(전체 스캔 방지).
  const logs = await recentResults(supa, student.id);
  const lastResult = new Map<string, { correct: boolean; at: string }>();
  for (const l of logs) {
    if (!l.qid) continue;
    const prev = lastResult.get(l.qid);
    if (!prev || String(l.created_at) > prev.at)
      lastResult.set(l.qid, { correct: !!l.correct, at: String(l.created_at) });
  }
  const lastServed = student.day_state?.solveQ ?? null;
  const weightOf = (id: string): number => {
    if (id === lastServed) return 0.15; // 방금 낸 문제는 되도록 피함
    const r = lastResult.get(id);
    if (!r) return 6; // 안 풀어본 것 우선
    if (!r.correct) return 4; // 최근 틀린 것(복습)
    return 1; // 최근 맞힌 것
  };
  // 같은 지문의 아직 안 낸 문제가 남아 있으면 그중에서 고른다(지문을 다시 처음부터 읽지 않게)
  const chain = student.day_state?.solvePassage ?? null;
  const siblings = chain
    ? qs.filter((q) => q.passage_id === chain.id && !chain.done.includes(q.id) && q.id !== lastServed)
    : [];
  const pool = siblings.length > 0 ? siblings : qs;
  const weights = pool.map((q) => weightOf(q.id));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let idx = 0;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) { idx = i; break; }
    idx = i;
  }
  const picked = pool[idx];
  const media = await loadQuestionMedia(supa, student.class_id, picked.id);

  // 4지선다 보기 셔플(부정 완화) — 표시 순서를 저장해 채점 때 원복. 단답형은 정답 노출 금지.
  let order: number[] | null = null;
  let outOptions = ((picked.options as string[]) ?? []);
  if (picked.type !== "short") {
    order = shuffledIdx(outOptions.length);
    outOptions = order.map((i) => (picked.options as string[])[i]);
  }
  const extra = { svg: media?.svg ?? null, passage: media?.passage ?? null };
  const q = picked.type === "short"
    ? { id: picked.id, body: picked.body, difficulty: picked.difficulty, tag: picked.tag, type: "short", options: [] as string[], ...extra }
    : { id: picked.id, body: picked.body, options: outOptions, difficulty: picked.difficulty, tag: picked.tag, type: picked.type ?? "multiple", ...extra };

  const pid = extra.passage?.id ?? null;
  const solvePassage = pid
    ? { id: pid, done: [...(chain?.id === pid ? chain.done : []), picked.id].slice(-50) }
    : null;
  const day_state = { ...student.day_state, solveQ: q.id, solveOrder: order, solvePassage };
  const { error } = await supa.from("students").update({ day_state }).eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({ question: q, solveCount, solveLimit });
}
