import { NextRequest, NextResponse } from "next/server";
import {
  requireStudent, jsonError, bumpCatch,
  isMissingTrades, TRADES_HINT, isMissingCount, CATCH_COUNT_HINT,
} from "@/lib/api";
import { POOL } from "@/lib/game";

// 교환 수락 (M9): 내가 걸 포켓몬(pokemon_id)을 정해 코드의 교환을 완료한다.
// 서버가 교환 행을 먼저 원자적으로 선점(status open→done)해 중복 수락을 막고,
// 양쪽 도감 마리 수를 맞바꾼다. 진화로 도감에 남은 '보유0' 종은 교환에 걸 수 없다.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  const give = Number(body?.pokemon_id); // 내가 상대에게 줄 포켓몬
  if (code.length !== 6) return jsonError(400, "6자리 교환 코드를 입력해주세요.");
  if (!(give >= 1 && give <= 151)) return jsonError(400, "줄 포켓몬이 올바르지 않아요.");

  // 교환 조회
  const { data: rows, error: qErr } = await supa
    .from("trades")
    .select("*")
    .eq("code", code)
    .eq("status", "open")
    .limit(1);
  if (qErr) return jsonError(500, isMissingTrades(qErr) ? TRADES_HINT : "조회에 실패했어요.");
  const t = rows?.[0] as
    | { id: string; class_id: string; from_student: string; offer_pokemon: number }
    | undefined;
  if (!t) return jsonError(404, "그런 교환 코드가 없어요. (이미 완료됐거나 취소됐을 수 있어요)");
  if (t.class_id !== student.class_id) return jsonError(403, "우리 학급의 교환이 아니에요.");
  if (t.from_student === student.id) return jsonError(409, "내가 만든 교환은 수락할 수 없어요.");

  const offer = t.offer_pokemon; // 내가 받을 포켓몬

  // 보유 확인: 내가 줄 포켓몬(1↑) + 상대가 걸어둔 포켓몬(1↑)
  const [{ data: mine }, { data: theirs }] = await Promise.all([
    supa.from("catches").select("count").eq("student_id", student.id).eq("pokemon_id", give).limit(1),
    supa.from("catches").select("count").eq("student_id", t.from_student).eq("pokemon_id", offer).limit(1),
  ]);
  if (!((mine?.[0] as { count?: number } | undefined)?.count ?? 0))
    return jsonError(409, "지금 보유하지 않은 포켓몬은 교환에 걸 수 없어요.");
  if (!((theirs?.[0] as { count?: number } | undefined)?.count ?? 0))
    return jsonError(409, "상대가 그 포켓몬을 더 이상 가지고 있지 않아요. 교환이 취소돼요.");

  // 교환 행 원자적 선점 (열려 있을 때만 done으로) — 중복 수락 방지
  const { data: claimed, error: claimErr } = await supa
    .from("trades")
    .update({
      status: "done",
      to_student: student.id,
      want_pokemon: give,
      completed_at: new Date().toISOString(),
    })
    .eq("id", t.id)
    .eq("status", "open")
    .select("id");
  if (claimErr) return jsonError(500, isMissingTrades(claimErr) ? TRADES_HINT : "교환 처리에 실패했어요.");
  if (!claimed || claimed.length === 0)
    return jsonError(409, "방금 다른 친구가 먼저 교환했어요. 다시 시도해주세요.");

  // 도감 마리 수 맞바꿈: 상대 -offer / 나 +offer / 나 -give / 상대 +give
  const steps = [
    await bumpCatch(supa, t.from_student, offer, "trade", -1),
    await bumpCatch(supa, student.id, offer, "trade", 1),
    await bumpCatch(supa, student.id, give, "trade", -1),
    await bumpCatch(supa, t.from_student, give, "trade", 1),
  ];
  const bad = steps.find((s) => s.error);
  if (bad?.error)
    return jsonError(500, isMissingCount(bad.error) ? CATCH_COUNT_HINT : "도감 기록에 실패했어요.");

  return NextResponse.json({
    received: { id: offer, name: POOL[offer - 1].name },
    gave: { id: give, name: POOL[give - 1].name },
  });
}
