import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { BALLS, MEDS, BallKind, MedKind } from "@/lib/game";

// 상점 구매 — 가격표는 서버 상수(명세 §4.6), 포인트 차감·재고 증가 전부 서버 판정.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const item = String(body?.item ?? "");
  const isBall = item in BALLS;
  const isMed = item in MEDS;
  if (!isBall && !isMed) return jsonError(400, "그런 상품은 없어요.");

  const price = isBall ? BALLS[item as BallKind].price : MEDS[item as MedKind].price;
  const name = isBall ? BALLS[item as BallKind].name : MEDS[item as MedKind].name;

  if (student.points < price)
    return jsonError(409, "포인트가 부족해요! 문제를 풀어 포인트를 모으자.");
  if (item === "master" && (student.inventory.master ?? 0) >= 1)
    return jsonError(409, "마스터볼은 1개만 가질 수 있어요!");

  const inventory = { ...student.inventory };
  inventory[item as keyof typeof inventory] = (inventory[item as keyof typeof inventory] ?? 0) + 1;
  const points = student.points - price;

  const { error } = await supa
    .from("students")
    .update({ points, inventory })
    .eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({ points, inventory, bought: { item, name, price } });
}
