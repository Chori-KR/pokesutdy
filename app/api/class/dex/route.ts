import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";

// 친구 도감 (M5): 같은 학급 친구들의 수집 현황을 본다 — 건강한 경쟁 유도.
// - 파라미터 없음: 학급 랭킹 (닉네임 + 도감 수, 많은 순)
// - ?student_id=...: 그 친구가 잡은 포켓몬 id 목록 (같은 학급만)
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const targetId = req.nextUrl.searchParams.get("student_id");

  if (targetId) {
    const { data: target } = await supa
      .from("students")
      .select("id, nickname")
      .eq("id", targetId)
      .eq("class_id", student.class_id) // 같은 학급만
      .single();
    if (!target) return jsonError(404, "그 친구를 찾을 수 없어요.");
    const { data: catches } = await supa
      .from("catches")
      .select("pokemon_id")
      .eq("student_id", target.id);
    return NextResponse.json({
      nickname: target.nickname,
      caught: (catches ?? []).map((c) => c.pokemon_id),
    });
  }

  const { data: mates } = await supa
    .from("students")
    .select("id, nickname")
    .eq("class_id", student.class_id);
  if (!mates || mates.length === 0) return NextResponse.json({ members: [] });

  const { data: catches } = await supa
    .from("catches")
    .select("student_id")
    .in("student_id", mates.map((m) => m.id));

  const countBy = new Map<string, number>();
  (catches ?? []).forEach((c) => countBy.set(c.student_id, (countBy.get(c.student_id) ?? 0) + 1));

  const members = mates
    .map((m) => ({ id: m.id, nickname: m.nickname, dexCount: countBy.get(m.id) ?? 0, me: m.id === student.id }))
    .sort((a, b) => b.dexCount - a.dexCount || a.nickname.localeCompare(b.nickname, "ko"));

  return NextResponse.json({ members });
}
