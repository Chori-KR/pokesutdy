import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingTrades, TRADES_HINT } from "@/lib/api";

// 교환 취소 (M9): 내가 만든 열린 교환을 취소한다.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const id = String(body?.trade_id ?? "");
  if (!id) return jsonError(400, "교환을 찾을 수 없어요.");

  const { data, error } = await supa
    .from("trades")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("from_student", student.id)
    .eq("status", "open")
    .select("id");
  if (error) return jsonError(500, isMissingTrades(error) ? TRADES_HINT : "취소에 실패했어요.");
  if (!data || data.length === 0) return jsonError(404, "취소할 교환이 없어요.");
  return NextResponse.json({ ok: true });
}
