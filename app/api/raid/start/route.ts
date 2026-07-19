import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";
import { POOL } from "@/lib/game";

// 레이드 배틀 시작 (학생): 교사가 지정한 보스 정보 반환. 일일 제한·횟수 차감 없음(재도전 자유).
// 승리 보상/포획은 /api/raid/win에서 서버가 처리(설정을 서버가 다시 읽음).
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const { raid } = await getClassSettings(supa, student.class_id);
  if (!raid.on) return jsonError(409, "지금은 진행 중인 레이드가 없어요.");

  const boss = POOL[raid.pid - 1];
  if (!boss) return jsonError(404, "레이드 포켓몬 정보를 찾을 수 없어요.");

  return NextResponse.json({
    pokemon: { id: boss.id, name: boss.name, type: boss.type, rarity: boss.rarity, shiny: raid.shiny },
  });
}
