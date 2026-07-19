import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";

// 레이드 승리 보고 (학생): 보스를 쓰러뜨리면 라운드당 1회 추가 보상(포인트/아이템) 지급.
// 포켓몬 지급은 협동 목표(N명 성공) 달성 시 /api/raid/status에서 일괄 처리.
// (HP/승리 판정은 클라이언트 보고 — 저위험, 기존 배틀과 동일한 실용 절충. 라운드당 1회로 가드.)
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { raid } = await getClassSettings(supa, student.class_id);
  if (!raid.on) return jsonError(409, "지금은 진행 중인 레이드가 없어요.");

  const gs = student.game_state ?? {};
  if (Number(gs.raidWin ?? -1) === raid.round) {
    // 이미 이번 라운드 보상 수령 — 중복 지급 방지
    return NextResponse.json({ ok: true, already: true, points: student.points, inventory: student.inventory });
  }

  const points = student.points + raid.rewardPts;
  const inventory = { ...student.inventory };
  if (raid.rewardItem && raid.rewardCount > 0) {
    const key = raid.rewardItem as keyof typeof inventory;
    inventory[key] = (inventory[key] ?? 0) + raid.rewardCount;
  }
  const game_state = { ...gs, raidWin: raid.round };

  const { error } = await supa
    .from("students")
    .update({ points, inventory, game_state })
    .eq("id", student.id);
  if (error) return jsonError(500, "보상 지급에 실패했어요.");

  return NextResponse.json({
    ok: true,
    already: false,
    points,
    inventory,
    reward: { pts: raid.rewardPts, item: raid.rewardItem, count: raid.rewardCount },
  });
}
