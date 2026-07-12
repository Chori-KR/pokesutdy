import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { MEDS, MAX_HP, MedKind } from "@/lib/game";

// 소모품 사용 — M5: 회복약(기절 회복 + 완전 회복)만.
// 진화의돌은 진화 화면에서, 간식은 배틀 탭에서 사용된다.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const item = String(body?.item ?? "") as MedKind;
  if (!(item in MEDS)) return jsonError(400, "사용할 수 없는 아이템이에요.");
  if ((student.inventory[item] ?? 0) <= 0) return jsonError(409, `${MEDS[item].name}이 없어요.`);
  if (student.hp >= MAX_HP) return jsonError(409, "HP가 이미 가득이에요.");

  const hp = MAX_HP;
  const inventory = { ...student.inventory, [item]: student.inventory[item] - 1 };
  const { error } = await supa
    .from("students")
    .update({ hp, inventory })
    .eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({ hp, inventory, used: { item, name: MEDS[item].name } });
}
