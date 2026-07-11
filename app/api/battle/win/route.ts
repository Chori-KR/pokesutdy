import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingGameState, GAME_STATE_HINT } from "@/lib/api";
import { verifyBattleToken } from "@/lib/studentSession";
import { EVOLVES_TO, evoWinsNeeded, DEFAULT_BATTLE_PID } from "@/lib/game";

// 배틀 승리 기록 (M4, 진화 조건용): 야생 포켓몬을 쓰러뜨렸을 때 1승.
// 배틀 토큰 1개당 1승만 인정(day_state.winTokens) — 배틀은 하루 제한이 있으므로
// 승수도 자연히 하루 제한을 넘을 수 없다.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "");
  const battle = await verifyBattleToken(token, student.id);
  if (!battle || battle.source !== "battle")
    return jsonError(401, "배틀 정보가 유효하지 않아요.");

  const used = student.day_state?.winTokens ?? [];
  if (used.includes(token)) return jsonError(409, "이미 승리로 기록된 배틀이에요.");

  const gs = student.game_state ?? {};
  const pid = Number(gs.battlePid ?? gs.starter ?? DEFAULT_BATTLE_PID);
  const wins = { ...(gs.wins ?? {}), [String(pid)]: Number(gs.wins?.[String(pid)] ?? 0) + 1 };
  const game_state = { ...gs, wins };
  const day_state = { ...student.day_state, winTokens: [...used, token] };

  const { error } = await supa
    .from("students")
    .update({ game_state, day_state })
    .eq("id", student.id);
  if (error)
    return jsonError(500, isMissingGameState(error) ? GAME_STATE_HINT : "저장에 실패했어요.");

  const winCount = wins[String(pid)];
  const canEvolveTo = (EVOLVES_TO[pid] ?? []).length > 0 && winCount >= evoWinsNeeded(pid)
    ? EVOLVES_TO[pid]
    : [];

  return NextResponse.json({ pid, wins: winCount, allWins: wins, canEvolveTo, winsNeeded: evoWinsNeeded(pid) });
}
