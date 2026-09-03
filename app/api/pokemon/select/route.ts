import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingGameState, GAME_STATE_HINT } from "@/lib/api";
import { POOL, MAX_DEX_ID } from "@/lib/game";

// 배틀 포켓몬 선택 (M9): 지금 보유(1마리 이상)한 포켓몬만 선택 가능 (서버 검증).
// 진화·교환으로 0마리가 된 종은 도감엔 남지만 count<1이라 선택 불가.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const pid = Number(body?.pokemon_id);
  if (!(pid >= 1 && pid <= MAX_DEX_ID)) return jsonError(400, "포켓몬이 올바르지 않아요.");

  // M9: 도감엔 있어도 보유 0마리면 선택 불가 — count≥1 확인
  const { data: rows } = await supa
    .from("catches")
    .select("*")
    .eq("student_id", student.id)
    .eq("pokemon_id", pid)
    .limit(1);
  const owned = rows?.[0] as { count?: number; shiny?: boolean } | undefined;
  if (!owned || (owned.count ?? 1) < 1) return jsonError(409, "지금 보유하지 않은 포켓몬이에요.");

  // M12: 이로치 출전 — 그 종의 이로치를 실제로 보유한 경우에만 허용(서버 검증)
  const wantShiny = body?.shiny === true;
  if (wantShiny && !owned.shiny)
    return jsonError(409, "아직 이로치를 잡지 못한 포켓몬이에요.");

  const game_state = { ...(student.game_state ?? {}), battlePid: pid, battleShiny: wantShiny };
  const { error } = await supa.from("students").update({ game_state }).eq("id", student.id);
  if (error)
    return jsonError(500, isMissingGameState(error) ? GAME_STATE_HINT : "저장에 실패했어요.");

  return NextResponse.json({ battlePid: pid, battleShiny: wantShiny, name: POOL[pid - 1].name });
}
