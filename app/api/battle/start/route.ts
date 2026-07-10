import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { pickWild } from "@/lib/game";
import { signBattleToken } from "@/lib/studentSession";

// 야생 포켓몬 출현은 서버가 뽑고 서명해서 내려보낸다.
// → 클라이언트가 "뮤츠 나왔음"이라고 임의 주장하며 포획 요청하는 것 차단.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { student } = auth;

  if (student.hp <= 0)
    return jsonError(409, "리자몽이 기절 상태예요. 내일까지 기다려야 해요.");

  const wild = pickWild();
  const token = await signBattleToken(student.id, wild.id);
  return NextResponse.json({
    pokemon: { id: wild.id, name: wild.name, type: wild.type, rarity: wild.rarity },
    token,
  });
}
