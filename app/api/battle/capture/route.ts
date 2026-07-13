import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { verifyBattleToken } from "@/lib/studentSession";
import { BALLS, POOL, RARITY, captureRate, applyXp, BallKind } from "@/lib/game";

// 포획 판정은 전부 서버 권위 (명세 §7).
// M5: 던지기 1회 = 볼 1개 (멀티볼 롤백). 등급은 게임 데이터(POOL) 기준.
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const ball = String(body?.ball ?? "") as BallKind;
  const token = String(body?.token ?? "");
  if (!(ball in BALLS)) return jsonError(400, "볼 종류가 잘못됐어요.");

  const battle = await verifyBattleToken(token, student.id);
  if (!battle) return jsonError(401, "배틀 정보가 유효하지 않아요. 배틀을 다시 시작해주세요.");

  const meta = POOL[battle.pokemonId - 1];
  if (!meta) return jsonError(404, "포켓몬 정보를 찾을 수 없어요.");
  const rarity = meta.rarity;

  const inventory = { ...student.inventory };
  if ((inventory[ball] ?? 0) <= 0)
    return jsonError(409, `${BALLS[ball].name}이(가) 없어요.`);
  inventory[ball] -= 1;

  const success = Math.random() < captureRate(rarity, ball);

  if (!success) {
    const { error } = await supa
      .from("students")
      .update({ inventory })
      .eq("id", student.id);
    if (error) return jsonError(500, "저장에 실패했어요.");
    return NextResponse.json({ success: false, inventory });
  }

  // 도감 등록 (이미 잡은 포켓몬이면 중복 등록 안 됨 — unique 제약)
  const { error: catchErr } = await supa
    .from("catches")
    .insert({ student_id: student.id, pokemon_id: meta.id, method: battle.source });
  const newlyCaught = !catchErr; // 23505(중복)면 이미 도감에 있음
  if (catchErr && catchErr.code !== "23505")
    return jsonError(500, "도감 기록에 실패했어요.");

  // 배틀 승리 포인트/XP는 배틀 포획에만 — 야생 탐색은 포획 자체가 보상 (명세 §4.3)
  if (battle.source === "explore") {
    const { error } = await supa
      .from("students")
      .update({ inventory })
      .eq("id", student.id);
    if (error) return jsonError(500, "저장에 실패했어요.");
    return NextResponse.json({ success: true, newlyCaught, inventory });
  }

  const reward = RARITY[rarity];
  const g = applyXp(student, reward.xp); // M6: 레벨업 보상 포함
  const points = student.points + reward.pts + g.levelBonus;
  const { error } = await supa
    .from("students")
    .update({ inventory, points, xp: g.xp, level: g.level })
    .eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({
    success: true,
    newlyCaught,
    inventory,
    points,
    xp: g.xp,
    level: g.level,
    levelBonus: g.levelBonus,
    reward: { pts: reward.pts, xp: reward.xp },
  });
}
