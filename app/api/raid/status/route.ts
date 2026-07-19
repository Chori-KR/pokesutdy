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

  // 협동 달성 → 아직 못 받았으면 포켓몬 지급(라운드당 1회)
  let justGranted = false;
  if (unlocked && Number(gs.raidGrant ?? -1) !== raid.round) {
    const bump = await bumpCatch(supa, student.id, raid.pid, "raid", 1);
    if (!bump.error) {
      if (raid.shiny) {
        await supa.from("catches").update({ shiny: true })
          .eq("student_id", student.id).eq("pokemon_id", raid.pid);
      }
      const game_state = { ...gs, raidGrant: raid.round };
      await supa.from("students").update({ game_state }).eq("id", student.id);
      justGranted = true;
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
    reward: { pts: raid.rewardPts, item: raid.rewardItem, count: raid.rewardCount },
  });
}
