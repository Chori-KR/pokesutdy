import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { POOL, DUPE_CONVERT } from "@/lib/game";

// 중복 포켓몬 환전(선택형): 학생이 고른 종·마리 수만큼만 포인트로 바꾼다.
// body: { items: [{ pokemon_id, qty }] } — qty는 여분(count-1) 이하로 클램프.
// 각 종 최소 1마리는 항상 도감/보유에 남는다.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) return jsonError(400, "환전할 포켓몬을 선택해주세요.");

  // 요청한 종만 조회
  const wantIds = items.map((it: { pokemon_id: number }) => Math.round(Number(it.pokemon_id))).filter((n: number) => n >= 1 && n <= 151);
  const { data: rows } = await supa
    .from("catches")
    .select("id, pokemon_id, count")
    .eq("student_id", student.id)
    .in("pokemon_id", wantIds);
  const byPid = new Map<number, { id: string; count: number }>();
  (rows ?? []).forEach((r: { id: string; pokemon_id: number; count?: number }) => byPid.set(r.pokemon_id, { id: r.id, count: r.count ?? 1 }));

  let gained = 0;
  let converted = 0;
  const newCounts: Record<number, number> = {};
  for (const it of items as { pokemon_id: number; qty: number }[]) {
    const pid = Math.round(Number(it.pokemon_id));
    const row = byPid.get(pid);
    const meta = POOL[pid - 1];
    if (!row || !meta) continue;
    const extra = Math.max(0, row.count - 1);
    const qty = Math.min(Math.max(0, Math.round(Number(it.qty) || 0)), extra);
    if (qty <= 0) continue;
    const nextCount = row.count - qty;
    gained += qty * DUPE_CONVERT[meta.rarity];
    converted += qty;
    newCounts[pid] = nextCount;
    await supa.from("catches").update({ count: nextCount }).eq("id", row.id);
  }

  if (converted === 0) return jsonError(409, "환전한 포켓몬이 없어요.");

  const points = student.points + gained;
  const { error } = await supa.from("students").update({ points }).eq("id", student.id);
  if (error) return jsonError(500, "환전에 실패했어요.");

  return NextResponse.json({ ok: true, points, gained, converted, newCounts });
}
