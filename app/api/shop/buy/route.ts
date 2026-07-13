import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { BALLS, SNACKS, EVO_STONE, BallKind, SnackKind } from "@/lib/game";

// 상점 구매 — 가격표는 서버 상수, 포인트 차감·재고 증가 전부 서버 판정.
// M6 상품: 볼 4종 / 진화의돌 / 간식 3종 (약 판매 종료 — 배틀 후 자동 회복)
function priceOf(item: string): { price: number; name: string } | null {
  if (item in BALLS) return BALLS[item as BallKind];
  if (item in SNACKS) return SNACKS[item as SnackKind];
  if (item === "stone") return EVO_STONE;
  return null;
}

export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const item = String(body?.item ?? "");
  const info = priceOf(item);
  if (!info) return jsonError(400, "그런 상품은 없어요.");

  if (student.points < info.price)
    return jsonError(409, "포인트가 부족해요! 문제를 풀어 포인트를 모으자.");
  if (item === "master" && (student.inventory.master ?? 0) >= 1)
    return jsonError(409, "마스터볼은 1개만 가질 수 있어요!");

  const inventory = { ...student.inventory };
  inventory[item as keyof typeof inventory] = (inventory[item as keyof typeof inventory] ?? 0) + 1;
  const points = student.points - info.price;

  const { error } = await supa
    .from("students")
    .update({ points, inventory })
    .eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({ points, inventory, bought: { item, name: info.name, price: info.price } });
}
