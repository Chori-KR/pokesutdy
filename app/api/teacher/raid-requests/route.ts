import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";

// 레이드 신청 현황 (교사): 이번 라운드(현재 settings.raid.round)에 학생들이 신청한
// 포켓몬을 집계해 많은 순으로 반환 → 교사가 학생 의견을 보고 레이드를 정할 수 있게.
export async function GET(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const round = Math.max(0, Number((cls.settings as { raid?: { round?: number } })?.raid?.round ?? 0));

  const { data: students } = await supa
    .from("students")
    .select("game_state")
    .eq("class_id", cls.id);

  const tally: Record<number, number> = {};
  let total = 0;
  (students ?? []).forEach((st: { game_state?: { raidReq?: { pid?: number; round?: number } } }) => {
    const rq = st.game_state?.raidReq;
    if (rq && Number(rq.round ?? -1) === round && Number(rq.pid) >= 1) {
      tally[Number(rq.pid)] = (tally[Number(rq.pid)] ?? 0) + 1;
      total++;
    }
  });

  const list = Object.entries(tally)
    .map(([pid, count]) => ({ pid: Number(pid), count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ round, total, list });
}
