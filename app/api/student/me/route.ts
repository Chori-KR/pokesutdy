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

  // M8: 도감 = 마리 수 맵. caught = 보유(1마리 이상) 종 목록 (배틀 선택용)
  const counts: Record<number, number> = {};
  (catches ?? []).forEach((c: { pokemon_id: number; count?: number }) => {
    counts[c.pokemon_id] = c.count ?? 1;
  });
  const caught = Object.keys(counts).map(Number);

  const gs = student.game_state ?? {};
  // 배틀 포켓몬이 보유하지 않은 종이면(예: 스타팅을 진화로 소모) 보유 종 중 하나로 보정
  let battlePid = gs.battlePid ?? gs.starter ?? DEFAULT_BATTLE_PID;
  if (!counts[battlePid]) battlePid = caught[0] ?? battlePid;
  const game = {
    starter: gs.starter ?? null,
    battlePid,
    wins: gs.wins ?? {},
    evoCount: gs.evoCount ?? 0,
  };

  return NextResponse.json({
    student: studentSnapshot(student),
    class: { name: cls?.name ?? "", class_code: cls?.class_code ?? "", settings },
    caught,
    counts,
    day: daySnapshot(student, settings),
    game,
  });
}
