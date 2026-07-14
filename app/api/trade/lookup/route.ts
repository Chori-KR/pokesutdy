import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingTrades, TRADES_HINT } from "@/lib/api";
import { POOL } from "@/lib/game";

// 교환 코드 조회 (M9): 상대가 알려준 코드로 어떤 포켓몬을 걸었는지 확인.
// 같은 학급 + 열린 교환 + 내가 만든 교환이 아닐 때만 보여준다.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const code = String(new URL(req.url).searchParams.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return jsonError(400, "6자리 숫자 교환 코드를 입력해주세요.");

  const { data: rows, error } = await supa
    .from("trades")
    .select("*")
    .eq("code", code)
    .eq("status", "open")
    .limit(1);
  if (error) return jsonError(500, isMissingTrades(error) ? TRADES_HINT : "조회에 실패했어요.");
  const t = rows?.[0] as
    | { class_id: string; from_student: string; offer_pokemon: number }
    | undefined;
  if (!t) return jsonError(404, "그런 교환 코드가 없어요. (이미 완료됐거나 취소됐을 수 있어요)");
  if (t.class_id !== student.class_id) return jsonError(403, "우리 학급의 교환이 아니에요.");
  if (t.from_student === student.id) return jsonError(409, "내가 만든 교환은 수락할 수 없어요.");

  // 상대 닉네임
  const { data: from } = await supa
    .from("students")
    .select("nickname")
    .eq("id", t.from_student)
    .single();

  const p = POOL[t.offer_pokemon - 1];
  return NextResponse.json({
    code,
    from_nickname: from?.nickname ?? "친구",
    offer: { id: p.id, name: p.name, color: p.color, rarity: p.rarity },
  });
}
