import { NextRequest, NextResponse } from "next/server";
import { requireStudent, studentSnapshot } from "@/lib/api";
import { seoulToday } from "@/lib/game";

// 학생 홈 진입 시 호출: 내 정보 + 학급 설정 + 도감.
// 날짜가 바뀌었으면(Asia/Seoul) HP를 전부 회복시킨다 — 기절 상태의
// 다음 날 자동 회복(명세 §4.2/§4.7). 나머지 일일 카운터 리셋은 M2.
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

  return NextResponse.json({
    student: studentSnapshot(student),
    class: cls ?? { name: "", class_code: "", settings: { moveDiff: true } },
    caught: (catches ?? []).map((c) => c.pokemon_id),
  });
}
