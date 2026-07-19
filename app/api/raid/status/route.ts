import { NextRequest, NextResponse } from "next/server";
import { requireStudent, getClassSettings } from "@/lib/api";

// 레이드 현황 (학생): 활성 여부 + 보스 + 내 신청(현재 라운드) 상태.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { raid } = await getClassSettings(supa, student.class_id);
  const req0 = student.game_state?.raidReq as { pid?: number; round?: number } | undefined;
  // 이번 라운드에 이미 신청했는지 (round 일치)
  const myReqPid = req0 && Number(req0.round ?? -1) === raid.round ? Number(req0.pid) : null;

  return NextResponse.json({
    on: raid.on,
    pid: raid.pid,
    shiny: raid.shiny,
    round: raid.round,
    myReqPid, // 이번 라운드에 내가 신청한 포켓몬(없으면 null)
  });
}
