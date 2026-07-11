import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { POOL, DAILY_QUIZ_REWARD, rollQuizBall } from "@/lib/game";

// 오늘의 퀴즈 채점 (명세 §4.4):
// 정답 → +100P + 랜덤 볼(60/30/10) / 오답 → 위로 몬스터볼 1개 + 정답 공개.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const quiz = student.day_state?.quiz;
  if (!quiz || student.day_state?.quizDone)
    return jsonError(409, "진행 중인 퀴즈가 없어요. 퀴즈를 먼저 시작해주세요.");

  const body = await req.json().catch(() => null);
  const picked = Number(body?.pokemon_id);
  if (!quiz.opts.includes(picked)) return jsonError(400, "보기에 없는 답이에요.");

  const correct = picked === quiz.target;
  const target = POOL[quiz.target - 1];

  const inventory = { ...student.inventory };
  let points = student.points;
  let ball: ReturnType<typeof rollQuizBall> = "poke";
  if (correct) {
    points += DAILY_QUIZ_REWARD;
    ball = rollQuizBall();
    inventory[ball] += 1;
  } else {
    inventory.poke += 1; // 위로 보상 — 하루를 기분 나쁘게 시작하지 않게
  }

  const day_state = { ...student.day_state, quizDone: true, quiz: null };
  const { error } = await supa
    .from("students")
    .update({ points, inventory, day_state })
    .eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({
    correct,
    target: { id: target.id, name: target.name },
    points,
    inventory,
    ball,
  });
}
