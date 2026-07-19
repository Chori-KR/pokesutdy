import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";

// 레이드 승리 보고 (학생): 보스를 쓰러뜨리면 이번 라운드 "성공"으로 기록한다(라운드당 1회).
// 보상(포인트/아이템)과 포켓몬 지급은 반 협동 목표(N명 성공) 달성 시에만
// /api/raid/status에서 성공자/전원에게 각각 지급 → 기준 미달이면 성공해도 보상 없음.
// (승리 판정은 클라이언트 보고 — 저위험, 기존 배틀과 동일한 실용 절충.)
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { raid } = await getClassSettings(supa, student.class_id);
  if (!raid.on) return jsonError(409, "지금은 진행 중인 레이드가 없어요.");

  const gs = student.game_state ?? {};
  if (Number(gs.raidWin ?? -1) === raid.round)
    return NextResponse.json({ ok: true, already: true });

  const game_state = { ...gs, raidWin: raid.round };
  const { error } = await supa.from("students").update({ game_state }).eq("id", student.id);
  if (error) return jsonError(500, "성공 기록에 실패했어요.");

  return NextResponse.json({ ok: true, already: false });
}
