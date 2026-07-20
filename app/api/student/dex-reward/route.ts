import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { DEX_MILESTONES } from "@/lib/game";

// 도감 달성 보상 수령: 도감 종수가 임계값 이상 + 미수령이면 아이템 지급(1회).
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const threshold = Math.round(Number(body?.threshold));
  const milestone = DEX_MILESTONES.find((m) => m.n === threshold);
  if (!milestone) return jsonError(400, "잘못된 보상이에요.");

  // 도감 종수 = catches 행 수 (마리 수 0 포함, 도감 영구 기록)
  const { count } = await supa
    .from("catches")
    .select("*", { count: "exact", head: true })
    .eq("student_id", student.id);
  const dexCount = count ?? 0;
  if (dexCount < threshold) return jsonError(409, "아직 도감이 부족해요.");

  const claimed: number[] = Array.isArray(student.game_state?.dexRewards) ? student.game_state.dexRewards : [];
  if (claimed.includes(threshold)) return jsonError(409, "이미 받은 보상이에요.");

  const inventory = { ...student.inventory };
  const key = milestone.item as keyof typeof inventory;
  inventory[key] = (inventory[key] ?? 0) + milestone.count;
  const game_state = { ...(student.game_state ?? {}), dexRewards: [...claimed, threshold] };

  const { error } = await supa
    .from("students")
    .update({ inventory, game_state })
    .eq("id", student.id);
  if (error) return jsonError(500, "보상 지급에 실패했어요.");

  return NextResponse.json({ ok: true, inventory, dexRewards: game_state.dexRewards, reward: milestone.label });
}
