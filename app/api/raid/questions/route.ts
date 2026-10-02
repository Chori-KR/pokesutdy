import { NextRequest, NextResponse } from "next/server";
import { requireStudent, isMissingRaidOnly } from "@/lib/api";
import { loadServeQuestions } from "@/lib/questionServe";

// 레이드(형성평가) 전용 문제만 프리로드한다.
// questions.raid_only = true 인 4지선다 문제만 출제 → 평소 배틀에서 본 문제와 분리.
// 레이드 문제는 선생님이 골라 넣은 것이라 지문 길이로 거르지 않는다.
// raid_only 컬럼이 아직 없는 DB(0008 미실행)면 needsMigration 플래그로 안내.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { questions, passages, error } = await loadServeQuestions(supa, student.class_id, { raid: true });
  if (error)
    return NextResponse.json({ questions: [], needsMigration: isMissingRaidOnly(error) });

  return NextResponse.json({ questions, passages });
}
