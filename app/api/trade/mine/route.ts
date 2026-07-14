import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingTrades, TRADES_HINT } from "@/lib/api";
import { POOL } from "@/lib/game";

// 내 교환 현황 (M9): 내가 열어둔 교환(코드/포켓몬) + 최근 완료 내역.
export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { data: openRows, error } = await supa
    .from("trades")
    .select("id, code, offer_pokemon, created_at")
    .eq("from_student", student.id)
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) return jsonError(500, isMissingTrades(error) ? TRADES_HINT : "조회에 실패했어요.");

  const open = (openRows ?? []).map((r: { id: string; code: string; offer_pokemon: number }) => ({
    id: r.id,
    code: r.code,
    offer: { id: r.offer_pokemon, name: POOL[r.offer_pokemon - 1].name, color: POOL[r.offer_pokemon - 1].color },
  }));

  // 최근 완료 내역 (내가 걸었거나 받았던 교환)
  const { data: histRows } = await supa
    .from("trades")
    .select("from_student, to_student, offer_pokemon, want_pokemon, completed_at")
    .eq("status", "done")
    .or(`from_student.eq.${student.id},to_student.eq.${student.id}`)
    .order("completed_at", { ascending: false })
    .limit(8);

  const history = (histRows ?? []).map(
    (r: { from_student: string; to_student: string; offer_pokemon: number; want_pokemon: number }) => {
      const iAmFrom = r.from_student === student.id;
      const recv = iAmFrom ? r.want_pokemon : r.offer_pokemon; // 내가 받은 포켓몬
      const gave = iAmFrom ? r.offer_pokemon : r.want_pokemon; // 내가 준 포켓몬
      return {
        received: { id: recv, name: POOL[recv - 1].name, color: POOL[recv - 1].color },
        gave: { id: gave, name: POOL[gave - 1].name, color: POOL[gave - 1].color },
      };
    }
  );

  return NextResponse.json({ open, history });
}
