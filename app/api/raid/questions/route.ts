import { NextRequest, NextResponse } from "next/server";
import { requireStudent, isMissingRaidOnly } from "@/lib/api";
import { fetchAll } from "@/lib/fetchAll";

// 레이드(형성평가) 전용 문제만 프리로드한다.
// questions.raid_only = true 인 4지선다 문제만 출제 → 평소 배틀에서 본 문제와 분리.
// raid_only 컬럼이 아직 없는 DB(0008 미실행)면 needsMigration 플래그로 안내.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  // 레이드 문제가 1000개를 넘어도 전부 (나눠 받음)
  const { data, error } = await fetchAll((a, b) =>
    supa
      .from("questions")
      .select("id, body, options, answer_idx, difficulty, tag")
      .eq("class_id", student.class_id)
      .eq("active", true)
      .neq("type", "short")
      .eq("raid_only", true)
      .order("id")
      .range(a, b) as unknown as PromiseLike<{ data: unknown[] | null; error: { message?: string; code?: string } | null }>);

  if (error)
    return NextResponse.json({ questions: [], needsMigration: isMissingRaidOnly(error) });

  return NextResponse.json({ questions: data ?? [] });
}
