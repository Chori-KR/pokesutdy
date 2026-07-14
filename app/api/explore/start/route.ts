import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";
import { pickWild, rollShiny } from "@/lib/game";
import { signBattleToken } from "@/lib/studentSession";

// 야생 탐색 (트랙 A, 명세 §4.3): 하루 N회(기본 3), 배틀 없이 볼만 던져 포획.
// 탐색 횟수는 조우 시점에 차감 — 포기해도 반환 없음.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { exploreLimit } = await getClassSettings(supa, student.class_id);
  const encUsed = Number(student.day_state?.encUsed ?? 0);
  if (encUsed >= exploreLimit)
    return jsonError(409, "오늘의 탐색을 모두 사용했어요. 내일 다시 만나요!");

  // 빛나는 스프레이: 켜고 시작하면 이로치 확정(+ 소모)
  const body = await req.json().catch(() => null);
  const useSpray = body?.useSpray === true && (student.inventory.spray ?? 0) > 0;
  const inventory = { ...student.inventory };
  if (useSpray) inventory.spray -= 1;

  const day_state = { ...student.day_state, encUsed: encUsed + 1 };
  const { error } = await supa
    .from("students")
    .update({ day_state, ...(useSpray ? { inventory } : {}) })
    .eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  const wild = pickWild();
  const shiny = useSpray || rollShiny();
  const token = await signBattleToken(student.id, wild.id, "explore", shiny);
  return NextResponse.json({
    pokemon: { id: wild.id, name: wild.name, type: wild.type, rarity: wild.rarity, shiny },
    token,
    encUsed: encUsed + 1,
    exploreLimit,
    ...(useSpray ? { inventory } : {}),
  });
}
