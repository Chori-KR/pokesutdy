import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";
import { pickWild } from "@/lib/game";
import { signBattleToken } from "@/lib/studentSession";

// 야생 포켓몬 출현은 서버가 뽑고 서명해서 내려보낸다.
// M4: 배틀은 하루 N회 제한 (기본 2, 교사 설정) — 조우 시점에 차감.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  if (student.hp <= 0)
    return jsonError(409, "내 포켓몬이 기절 상태예요. 회복약을 쓰거나 내일까지 기다려야 해요.");

  const { battleLimit } = await getClassSettings(supa, student.class_id);
  const battleUsed = Number(student.day_state?.battleUsed ?? 0);
  if (battleUsed >= battleLimit)
    return jsonError(409, `오늘의 배틀 ${battleLimit}회를 모두 사용했어요. 내일 다시 도전하자!`);

  const day_state = { ...student.day_state, battleUsed: battleUsed + 1 };
  const { error } = await supa.from("students").update({ day_state }).eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  const wild = pickWild();
  const token = await signBattleToken(student.id, wild.id, "battle");
  return NextResponse.json({
    pokemon: { id: wild.id, name: wild.name, type: wild.type, rarity: wild.rarity },
    token,
    battleUsed: battleUsed + 1,
    battleLimit,
  });
}
