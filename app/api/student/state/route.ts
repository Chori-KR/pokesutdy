import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { MY } from "@/lib/game";

// 저위험 상태(HP) 갱신 — 자기 자신에게만 영향이 가는 값이라
// 클라이언트 보고를 받되 서버에서 범위를 클램프한다 (실용 절충).
export async function PATCH(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  if (typeof body?.hp !== "number") return jsonError(400, "hp가 필요해요.");

  const hp = Math.max(0, Math.min(MY.maxHp, Math.round(body.hp)));
  const { error } = await supa.from("students").update({ hp }).eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");
  return NextResponse.json({ hp });
}
