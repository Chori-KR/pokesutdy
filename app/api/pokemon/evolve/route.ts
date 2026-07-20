import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingGameState, GAME_STATE_HINT, bumpCatch, isMissingCount, CATCH_COUNT_HINT } from "@/lib/api";
import { EVOLVES_TO, evoWinsNeeded, evoPointCost, isStoneEvo, POOL } from "@/lib/game";

// 포켓몬 진화 (M5, 3방식):
//  - 돌 진화 페어(피카츄→라이츄 등): 진화의돌 1개 소모 (승수/포인트 불가)
//  - 일반 페어: "승수"(1→2단계 5승, 2→3단계 10승) 또는 "포인트"(누적 진화 횟수별
//    1000/2000/2500P) 중 학생이 선택
// 진화체는 도감 등록 + 배틀 포켓몬 교체.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const gs = student.game_state ?? {};
  const from = Number(gs.battlePid ?? 0);
  if (!from) return jsonError(409, "배틀 포켓몬이 없어요.");

  const body = await req.json().catch(() => null);
  const to = Number(body?.to);
  const method = String(body?.method ?? "wins"); // wins | points | stone
  const targets = EVOLVES_TO[from] ?? [];
  if (!targets.includes(to)) return jsonError(400, "그 포켓몬으로는 진화할 수 없어요.");

  const inventory = { ...student.inventory };
  let points = student.points;
  const wins = { ...(gs.wins ?? {}) };
  const evoCount = Number(gs.evoCount ?? 0);
  let usedDesc = "";

  if (isStoneEvo(from, to)) {
    // 돌 진화: 방식과 무관하게 진화의돌 필수
    if ((inventory.stone ?? 0) < 1)
      return jsonError(409, `${POOL[to - 1].name}(으)로 진화하려면 진화의돌이 필요해요! (상점에서 1,500P)`);
    inventory.stone -= 1;
    usedDesc = "진화의돌";
  } else if (method === "points") {
    const cost = evoPointCost(from, to);
    if (points < cost)
      return jsonError(409, `포인트가 부족해요. 이번 진화 비용은 ${cost.toLocaleString()}P예요.`);
    points -= cost;
    usedDesc = `${cost.toLocaleString()}P`;
  } else {
    const winCount = Number(wins[String(from)] ?? 0);
    const needed = evoWinsNeeded(from);
    if (winCount < needed)
      return jsonError(409, `아직 승수가 부족해요! (${winCount}/${needed}승) 포인트 진화(${evoPointCost(from, to).toLocaleString()}P)도 가능해요.`);
    wins[String(from)] = winCount - needed;
    usedDesc = `배틀 ${needed}승`;
  }

  // M8: 진화 전 포켓몬 1마리 소모(0이 되면 사라짐) + 진화체 1마리 추가
  const down = await bumpCatch(supa, student.id, from, "evolve", -1);
  if (down.error)
    return jsonError(500, isMissingCount(down.error) ? CATCH_COUNT_HINT : "도감 기록에 실패했어요.");
  const up = await bumpCatch(supa, student.id, to, "evolve", 1);
  if (up.error)
    return jsonError(500, isMissingCount(up.error) ? CATCH_COUNT_HINT : "도감 기록에 실패했어요.");

  const game_state = { ...gs, battlePid: to, wins, evoCount: evoCount + 1 };
  const { error } = await supa
    .from("students")
    .update({ game_state, points, inventory })
    .eq("id", student.id);
  if (error)
    return jsonError(500, isMissingGameState(error) ? GAME_STATE_HINT : "저장에 실패했어요.");

  return NextResponse.json({
    from: { id: from, name: POOL[from - 1].name, count: down.count },
    to: { id: to, name: POOL[to - 1].name, count: up.count },
    battlePid: to,
    wins,
    evoCount: evoCount + 1,
    points,
    inventory,
    used: usedDesc,
    newlyCaught: up.created,
  });
}
