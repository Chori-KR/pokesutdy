import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingGameState, GAME_STATE_HINT } from "@/lib/api";
import { STARTER_IDS, POOL } from "@/lib/game";

// 스타팅 포켓몬 선택 (M4): 이상해씨/파이리/꼬부기/피카츄 중 1회 선택.
// 선택한 포켓몬은 배틀 포켓몬이 되고 도감에도 등록된다.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  if (student.game_state?.starter)
    return jsonError(409, "스타팅 포켓몬은 이미 선택했어요!");

  const body = await req.json().catch(() => null);
  const pid = Number(body?.pokemon_id);
  if (!(STARTER_IDS as readonly number[]).includes(pid))
    return jsonError(400, "스타팅은 이상해씨·파이리·꼬부기·피카츄 중에서 골라주세요.");

  const game_state = { ...(student.game_state ?? {}), starter: pid, battlePid: pid, wins: student.game_state?.wins ?? {} };
  const { error } = await supa.from("students").update({ game_state }).eq("id", student.id);
  if (error)
    return jsonError(500, isMissingGameState(error) ? GAME_STATE_HINT : "저장에 실패했어요.");

  // 도감 등록 (이미 있으면 무시)
  const { error: catchErr } = await supa
    .from("catches")
    .insert({ student_id: student.id, pokemon_id: pid, method: "starter" });
  if (catchErr && catchErr.code !== "23505")
    return jsonError(500, "도감 기록에 실패했어요.");

  return NextResponse.json({
    starter: pid,
    battlePid: pid,
    name: POOL[pid - 1].name,
    newlyCaught: !catchErr,
  });
}
