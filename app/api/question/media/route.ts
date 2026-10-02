import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { loadQuestionMedia } from "@/lib/questionServe";

// 문제 한 개의 그림(SVG)·지문을 내려준다. 배틀·레이드는 문제 목록을 가볍게 먼저 받고
// 지문·그림이 있는 문제가 실제로 나올 때 여기서 받는다. 자기 학급 문제만.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const qid = req.nextUrl.searchParams.get("qid") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(qid)) return jsonError(400, "문제 번호가 올바르지 않아요.");
  const media = await loadQuestionMedia(supa, student.class_id, qid);
  if (!media) return jsonError(404, "문제를 찾을 수 없어요.");
  return NextResponse.json(media, { headers: { "Cache-Control": "private, max-age=300" } });
}
