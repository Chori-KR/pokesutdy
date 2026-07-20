import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { POOL, DUPE_CONVERT } from "@/lib/game";

// 중복 포켓몬 환전: 각 종의 여분(count-1)을 등급별 포인트로 바꾸고 마리 수는 1로 정리.
// 도감 종수(catches 행)는 유지 — 도감 손실 없음.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { data: rows } = await supa
    .from("catches")
    .select("id, pokemon_id, count")
    .eq("student_id", student.id);

  let gained = 0;
  let converted = 0; // 환전한 여분 마리 수
  const updates: { id: string }[] = [];
  for (const r of (rows ?? []) as { id: string; pokemon_id: number; count?: number }[]) {
    const cnt = r.count ?? 1;
    if (cnt <= 1) continue;
    const extra = cnt - 1;
    const meta = POOL[r.pokemon_id - 1];
    if (!meta) continue;
    gained += extra * DUPE_CONVERT[meta.rarity];
    converted += extra;
    updates.push({ id: r.id });
    await supa.from("catches").update({ count: 1 }).eq("id", r.id);
  }

  if (converted === 0) return jsonError(409, "환전할 중복 포켓몬이 없어요.");

  const points = student.points + gained;
  const { error } = await supa.from("students").update({ points }).eq("id", student.id);
  if (error) return jsonError(500, "환전에 실패했어요.");

  return NextResponse.json({ ok: true, points, gained, converted });
}
