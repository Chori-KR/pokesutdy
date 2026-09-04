import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";
import { MAX_DEX_ID, inGens } from "@/lib/game";

// 레이드 포켓몬 신청 (학생): 한 라운드에 1회. 다음 레이드가 실시(round++)되면 다시 신청 가능.
// 신청은 각자 game_state.raidReq에 저장 → 자기 행만 기록(충돌 없음), 매일 리셋 안 됨.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const pid = Math.round(Number(body?.pokemon_id));
  if (!(pid >= 1 && pid <= MAX_DEX_ID)) return jsonError(400, "포켓몬을 골라주세요.");

  const { raid, gens } = await getClassSettings(supa, student.class_id);
  // 학급이 켠 세대의 포켓몬만 신청 가능 (화면에서도 걸러지지만 서버에서 다시 확인)
  if (!inGens(pid, gens))
    return jsonError(400, "지금 우리 반에 등장하지 않는 세대의 포켓몬이에요.");

  const prev = student.game_state?.raidReq as { pid?: number; round?: number } | undefined;
  if (prev && Number(prev.round ?? -1) === raid.round)
    return jsonError(409, "이미 이번 레이드에 신청했어요. 다음 레이드부터 다시 신청할 수 있어요.");

  const game_state = { ...(student.game_state ?? {}), raidReq: { pid, round: raid.round } };
  const { error } = await supa.from("students").update({ game_state }).eq("id", student.id);
  if (error) return jsonError(500, "신청 저장에 실패했어요.");

  return NextResponse.json({ ok: true, pid, round: raid.round });
}
