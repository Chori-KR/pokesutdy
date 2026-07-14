import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/api";

// 배틀 시작 전에 출제 중(active) 문제를 전부 프리로드 (명세 §7: 즉답 UX).
// 정답 인덱스를 포함해 내려보내는 것은 M1의 의도된 절충 —
// 채점·통계·XP는 /api/battle/answer 가 서버 권위로 기록한다.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { data } = await supa
    .from("questions")
    .select("id, body, options, answer_idx, difficulty, tag")
    .eq("class_id", student.class_id)
    .eq("active", true)
    .neq("type", "short"); // 배틀은 4지선다만 (단답형은 문제풀이 탭에서)

  return NextResponse.json({ questions: data ?? [] });
}
