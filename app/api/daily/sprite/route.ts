import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { SPRITE } from "@/lib/game";

// 오늘의 퀴즈 실루엣 이미지 프록시.
// 클라이언트는 이 경로 하나만 보게 되므로 URL로 도감 번호(=정답)를 알 수 없다.
// 실루엣 처리는 클라이언트 CSS(brightness(0))가 담당.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { student } = auth;

  const target = student.day_state?.quiz?.target;
  if (!target || student.day_state?.quizDone)
    return jsonError(404, "진행 중인 퀴즈가 없어요.");

  const upstream = await fetch(SPRITE(target)).catch(() => null);
  if (!upstream?.ok) return jsonError(502, "이미지를 불러오지 못했어요.");

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
      "Cache-Control": "no-store", // 매일 다른 포켓몬 — 캐시 금지
    },
  });
}
