import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getClassSettings, bumpCatch } from "@/lib/api";

// 레이드 현황 (학생): 활성 여부 + 보스 + 내 신청/승리 상태 + 협동 진행도.
// 협동 목표(N명 성공) 달성 시, 아직 못 받은 학생에게 이 호출에서 포켓몬을 지급한다.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { raid } = await getClassSettings(supa, student.class_id);
  const gs = student.game_state ?? {};
  const myReqPid = gs.raidReq && Number(gs.raidReq.round ?? -1) === raid.round ? Number(gs.raidReq.pid) : null;
  const iWon = Number(gs.raidWin ?? -1) === raid.round;

  // 이번 라운드 승리 인원 집계
  const { data: rows } = await supa
    .from("students")
    .select("game_state")
    .eq("class_id", student.class_id);
  let winCount = 0;
  (rows ?? []).forEach((r: { game_state?: { raidWin?: number } }) => {
    if (Number(r.game_state?.raidWin ?? -1) === raid.round) winCount++;
  });
  const unlocked = raid.on && winCount >= raid.threshold;

  // 협동 달성 시에만 지급 — 포켓몬은 전원에게, 포인트/아이템 보상은 성공자에게만. (라운드당 1회)
  let justGranted = false;   // 포켓몬 지급됨
  let justRewarded = false;  // 성공자 보상 지급됨
  let points = student.points;
  let inventory = student.inventory;
  const nextGs = { ...gs };

  if (unlocked) {
    // 포켓몬 지급(전원)
    if (Number(gs.raidGrant ?? -1) !== raid.round) {
      const bump = await bumpCatch(supa, student.id, raid.pid, "raid", 1);
      if (!bump.error) {
        if (raid.shiny) {
          await supa.from("catches").update({ shiny: true })
            .eq("student_id", student.id).eq("pokemon_id", raid.pid);
        }
        nextGs.raidGrant = raid.round;
        justGranted = true;
      }
    }
    // 성공자 보상(포인트/아이템)
    if (iWon && Number(gs.raidReward ?? -1) !== raid.round) {
      points = student.points + raid.rewardPts;
      inventory = { ...student.inventory };
      if (raid.rewardItem && raid.rewardCount > 0) {
        const key = raid.rewardItem as keyof typeof inventory;
        inventory[key] = (inventory[key] ?? 0) + raid.rewardCount;
      }
      nextGs.raidReward = raid.round;
      justRewarded = true;
    }
    if (justGranted || justRewarded) {
      await supa.from("students").update({ points, inventory, game_state: nextGs }).eq("id", student.id);
    }
  }

  return NextResponse.json({
    on: raid.on,
    pid: raid.pid,
    shiny: raid.shiny,
    round: raid.round,
    myReqPid,
    iWon,
    winCount,
    threshold: raid.threshold,
    unlocked,
    justGranted,
    justRewarded,
    points,
    inventory,
    reward: { pts: raid.rewardPts, item: raid.rewardItem, count: raid.rewardCount },
  });
}
