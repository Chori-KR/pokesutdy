import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError } from "@/lib/api";
import { verifyBattleToken } from "@/lib/studentSession";
import {
  BALLS, POOL, RARITY, multiCaptureRate, gainXpCalc,
  BallKind, MAX_BALLS_PER_THROW,
} from "@/lib/game";

// 포획 판정은 전부 서버 권위 (명세 §7).
// M4: 볼을 1~10개 동시 사용 가능 — 성공률 1-(1-p)^n, 성공/실패와 무관하게 n개 소모.
// 마스터볼은 항상 1개(100%). 등급은 게임 데이터(POOL) 기준으로 판정(재분류 반영).
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const ball = String(body?.ball ?? "") as BallKind;
  const token = String(body?.token ?? "");
  if (!(ball in BALLS)) return jsonError(400, "볼 종류가 잘못됐어요.");
  const count = ball === "master"
    ? 1
    : Math.max(1, Math.min(MAX_BALLS_PER_THROW, Math.round(Number(body?.count) || 1)));

  const battle = await verifyBattleToken(token, student.id);
  if (!battle) return jsonError(401, "배틀 정보가 유효하지 않아요. 배틀을 다시 시작해주세요.");

  const meta = POOL[battle.pokemonId - 1];
  if (!meta) return jsonError(404, "포켓몬 정보를 찾을 수 없어요.");
  const rarity = meta.rarity;

  const inventory = { ...student.inventory };
  if ((inventory[ball] ?? 0) < count)
    return jsonError(409, `${BALLS[ball].name}이(가) ${count}개나 없어요. (보유 ${inventory[ball] ?? 0}개)`);
  inventory[ball] -= count;

  const success = Math.random() < multiCaptureRate(rarity, ball, count);

  if (!success) {
    const { error } = await supa
      .from("students")
      .update({ inventory })
      .eq("id", student.id);
    if (error) return jsonError(500, "저장에 실패했어요.");
    return NextResponse.json({ success: false, inventory, used: count });
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
    return NextResponse.json({ success: true, newlyCaught, inventory, used: count });
  }

  const reward = RARITY[rarity];
  const g = gainXpCalc(student, reward.xp);
  const points = student.points + reward.pts;
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
    used: count,
    reward: { pts: reward.pts, xp: reward.xp },
  });
}
