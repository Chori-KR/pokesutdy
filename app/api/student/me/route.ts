import { NextRequest, NextResponse } from "next/server";
import { requireStudent, studentSnapshot, daySnapshot, getClassSettings } from "@/lib/api";
import { seoulToday, DEFAULT_BATTLE_PID } from "@/lib/game";

// 학생 홈 진입 시 호출: 내 정보 + 학급 설정 + 도감 + 일일 카운터 + 게임 상태.
// 날짜가 바뀌었으면(Asia/Seoul) HP 회복 + 일일 카운터 전체 리셋 (명세 §4.7).
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const today = seoulToday();
  if (student.day_state?.date !== today) {
    student.hp = 100;
    student.day_state = { date: today };
    await supa
      .from("students")
      .update({ hp: student.hp, day_state: student.day_state })
      .eq("id", student.id);
  }

  const [settings, { data: catches }] = await Promise.all([
    getClassSettings(supa, student.class_id),
    // select("*")로 읽어 count 컬럼이 없어도(0004 미실행) 안전
    supa.from("catches").select("*").eq("student_id", student.id),
  ]);
  const { data: cls } = await supa
    .from("classes")
    .select("name, class_code")
    .eq("id", student.class_id)
    .single();

  // M9: 도감 = 한 번이라도 잡은/진화시킨/교환받은 종(마리 수 0 포함). counts = 마리 수 맵.
  const counts: Record<number, number> = {};
  const shinies: number[] = [];
  (catches ?? []).forEach((c: { pokemon_id: number; count?: number; shiny?: boolean }) => {
    counts[c.pokemon_id] = c.count ?? 1;
    if (c.shiny) shinies.push(c.pokemon_id);
  });
  const caught = Object.keys(counts).map(Number); // 도감(보유 0 포함)
  const ownedIds = caught.filter((id) => counts[id] >= 1); // 배틀 선택 가능(보유 1↑)

  const gs = student.game_state ?? {};
  // 배틀 포켓몬이 지금 보유(1↑)하지 않는 종이면(진화·교환으로 소모) 보유 종으로 보정
  let battlePid = gs.battlePid ?? gs.starter ?? DEFAULT_BATTLE_PID;
  const pidKept = counts[battlePid] >= 1;
  if (!pidKept) battlePid = ownedIds[0] ?? battlePid;
  // M12: 이로치 출전은 그 종의 이로치를 보유 중일 때만 유지 (교체·교환 시 자동 해제)
  const battleShiny = gs.battleShiny === true && pidKept && shinies.includes(battlePid);
  const game = {
    starter: gs.starter ?? null,
    battlePid,
    battleShiny,
    wins: gs.wins ?? {},
    evoCount: gs.evoCount ?? 0,
    dexRewards: gs.dexRewards ?? [],
  };

  return NextResponse.json({
    student: studentSnapshot(student),
    class: { name: cls?.name ?? "", class_code: cls?.class_code ?? "", settings },
    caught,
    counts,
    shinies,
    day: daySnapshot(student, settings),
    game,
  });
}
