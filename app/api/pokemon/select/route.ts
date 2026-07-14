import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingGameState, GAME_STATE_HINT } from "@/lib/api";
import { POOL } from "@/lib/game";

// 배틀 포켓몬 선택 (M8): 지금 보유(1마리 이상)한 포켓몬만 선택 가능 (서버 검증).
// 진화로 소모돼 0마리가 된 종은 catches 행이 삭제되므로 자동으로 선택 불가.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const pid = Number(body?.pokemon_id);
  if (!(pid >= 1 && pid <= 151)) return jsonError(400, "포켓몬이 올바르지 않아요.");

  const { data: owned } = await supa
    .from("catches")
    .select("pokemon_id")
    .eq("student_id", student.id)
    .eq("pokemon_id", pid)
    .maybeSingle();
  if (!owned) return jsonError(409, "지금 보유하지 않은 포켓몬이에요.");

  const game_state = { ...(student.game_state ?? {}), battlePid: pid };
  const { error } = await supa.from("students").update({ game_state }).eq("id", student.id);
  if (error)
    return jsonError(500, isMissingGameState(error) ? GAME_STATE_HINT : "저장에 실패했어요.");

  return NextResponse.json({ battlePid: pid, name: POOL[pid - 1].name });
}
