import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingGameState, GAME_STATE_HINT } from "@/lib/api";
import { EVOLVES_TO, evoWinsNeeded, POOL } from "@/lib/game";

// 포켓몬 진화 (M4): 현재 배틀 포켓몬으로 배틀 승수를 채우면 다음 단계로 진화.
// 1→2단계 5승, 2→3단계 10승. 진화체는 도감에 등록되고 배틀 포켓몬이 교체된다.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const gs = student.game_state ?? {};
  const from = Number(gs.battlePid ?? 0);
  if (!from) return jsonError(409, "배틀 포켓몬이 없어요.");

  const body = await req.json().catch(() => null);
  const to = Number(body?.to);
  const targets = EVOLVES_TO[from] ?? [];
  if (!targets.includes(to)) return jsonError(400, "그 포켓몬으로는 진화할 수 없어요.");

  const wins = Number(gs.wins?.[String(from)] ?? 0);
  const needed = evoWinsNeeded(from);
  if (wins < needed)
    return jsonError(409, `아직 승수가 부족해요! (${wins}/${needed}승) ${POOL[from - 1].name}으로 배틀에서 더 이겨보자.`);

  // 진화체 도감 등록 (이미 잡은 적 있으면 무시)
  const { error: catchErr } = await supa
    .from("catches")
    .insert({ student_id: student.id, pokemon_id: to, method: "evolve" });
  if (catchErr && catchErr.code !== "23505")
    return jsonError(500, "도감 기록에 실패했어요.");

  // 진화하면 배틀 포켓몬 교체 + 사용한 승수 차감 (다음 진화는 새로 모으기)
  const newWins = { ...(gs.wins ?? {}), [String(from)]: wins - needed };
  const game_state = { ...gs, battlePid: to, wins: newWins };
  const { error } = await supa.from("students").update({ game_state }).eq("id", student.id);
  if (error)
    return jsonError(500, isMissingGameState(error) ? GAME_STATE_HINT : "저장에 실패했어요.");

  return NextResponse.json({
    from: { id: from, name: POOL[from - 1].name },
    to: { id: to, name: POOL[to - 1].name },
    battlePid: to,
    wins: newWins,
    newlyCaught: !catchErr,
  });
}
