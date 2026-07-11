import { NextRequest, NextResponse } from "next/server";
import { requireStudent, studentSnapshot, daySnapshot } from "@/lib/api";
import { seoulToday, DEFAULT_EXPLORE_LIMIT, DEFAULT_SOLVE_LIMIT } from "@/lib/game";

// 학생 홈 진입 시 호출: 내 정보 + 학급 설정 + 도감 + 일일 카운터.
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

  const [{ data: cls }, { data: catches }] = await Promise.all([
    supa
      .from("classes")
      .select("name, class_code, settings")
      .eq("id", student.class_id)
      .single(),
    supa.from("catches").select("pokemon_id").eq("student_id", student.id),
  ]);

  const settings = {
    moveDiff: cls?.settings?.moveDiff !== false,
    exploreLimit: Math.max(0, Number(cls?.settings?.exploreLimit ?? DEFAULT_EXPLORE_LIMIT)),
    solveLimit: Math.max(0, Number(cls?.settings?.solveLimit ?? DEFAULT_SOLVE_LIMIT)),
  };

  return NextResponse.json({
    student: studentSnapshot(student),
    class: { name: cls?.name ?? "", class_code: cls?.class_code ?? "", settings },
    caught: (catches ?? []).map((c) => c.pokemon_id),
    day: daySnapshot(student, settings),
  });
}
