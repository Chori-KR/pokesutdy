import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { POOL, shuffle } from "@/lib/game";

// 오늘의 실루엣 퀴즈 시작 (하루 1회, 명세 §4.4).
// 서버가 정답 1마리 + 오답 3마리를 뽑아 day_state에 저장해 두고,
// 클라이언트에는 보기 이름만 내려보낸다. 실루엣은 /api/daily/sprite가 프록시로 제공
// → 이미지 주소에 도감 번호가 노출되지 않아 정답 유추 불가.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  if (student.day_state?.quizDone)
    return jsonError(409, "오늘의 퀴즈를 이미 풀었어요! 내일 새로운 포켓몬이 기다려요.");

  let quiz = student.day_state?.quiz;
  if (!quiz) {
    const target = POOL[Math.floor(Math.random() * POOL.length)];
    const wrong = shuffle(POOL.filter((p) => p.id !== target.id)).slice(0, 3);
    quiz = { target: target.id, opts: shuffle([target, ...wrong]).map((p) => p.id) };
    const day_state = { ...student.day_state, quiz };
    const { error } = await supa
      .from("students")
      .update({ day_state })
      .eq("id", student.id);
    if (error) return jsonError(500, "저장에 실패했어요.");
  }

  // 보기는 {id, name} — id는 답안 제출용. 실루엣과 대조할 방법은 없다.
  const options = quiz.opts.map((id) => ({ id, name: POOL[id - 1].name }));
  return NextResponse.json({ options });
}
