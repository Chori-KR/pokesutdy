import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, getClassSettings } from "@/lib/api";
import { pickWild, pickWildOf, SNACKS, SnackKind, rollShiny, rollSnackRarity, pickBiome, BIOMES } from "@/lib/game";
import { signBattleToken } from "@/lib/studentSession";

// 야생 포켓몬 출현은 서버가 뽑고 서명해서 내려보낸다.
// 배틀은 하루 N회 제한 (기본 2, 교사 설정) — 조우 시점에 차감.
// M5: 간식을 쓰면 제한과 무관하게 추가 배틀 + 등급 확정 출현
//     (일반=흔함 / 고급=희귀 / 최고급=전설).
export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const snack = body?.snack ? (String(body.snack) as SnackKind) : null;
  if (snack && !(snack in SNACKS)) return jsonError(400, "그런 간식은 없어요.");

  // 빛나는 스프레이: 켜고 시작하면 이로치 확정(+ 소모). 간식과 중복 가능.
  const useSpray = body?.useSpray === true && (student.inventory.spray ?? 0) > 0;

  const { battleLimit, rareRate, specialRate, legendRate, shinyRate, gens } = await getClassSettings(supa, student.class_id);
  const battleUsed = Number(student.day_state?.battleUsed ?? 0);
  const biome = pickBiome();
  const biomeTypes = BIOMES[biome].types;

  let wildPokemon;
  if (snack) {
    // 간식 배틀: 아이템 소모, 일일 제한 미차감, 등급 확정
    const inventory = { ...student.inventory };
    if ((inventory[snack] ?? 0) < 1)
      return jsonError(409, `${SNACKS[snack].name}이 없어요. 상점에서 살 수 있어요!`);
    inventory[snack] -= 1;
    if (useSpray) inventory.spray -= 1;
    // M6: 배틀은 항상 풀 HP로 시작 (약 시스템 폐지)
    const { error } = await supa.from("students").update({ inventory, hp: 100 }).eq("id", student.id);
    if (error) return jsonError(500, "저장에 실패했어요.");
    wildPokemon = pickWildOf(rollSnackRarity(snack), biomeTypes, gens);
    const shiny = useSpray || rollShiny(shinyRate);
    const token = await signBattleToken(student.id, wildPokemon.id, "battle", shiny);
    return NextResponse.json({
      pokemon: { id: wildPokemon.id, name: wildPokemon.name, type: wildPokemon.type, rarity: wildPokemon.rarity, shiny },
      biome,
      token,
      battleUsed,
      battleLimit,
      inventory,
      snackUsed: SNACKS[snack].name,
    });
  }

  if (battleUsed >= battleLimit)
    return jsonError(409, `오늘의 배틀 ${battleLimit}회를 모두 사용했어요. 상점의 간식으로 추가 배틀을 할 수 있어요!`);

  // M6: 배틀은 항상 풀 HP로 시작 (약 시스템 폐지)
  const inventory = { ...student.inventory };
  if (useSpray) inventory.spray -= 1;
  const day_state = { ...student.day_state, battleUsed: battleUsed + 1 };
  const { error } = await supa
    .from("students")
    .update({ day_state, hp: 100, ...(useSpray ? { inventory } : {}) })
    .eq("id", student.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  wildPokemon = pickWild(rareRate, specialRate, legendRate, biomeTypes, gens);
  const shiny = useSpray || rollShiny(shinyRate);
  const token = await signBattleToken(student.id, wildPokemon.id, "battle", shiny);
  return NextResponse.json({
    pokemon: { id: wildPokemon.id, name: wildPokemon.name, type: wildPokemon.type, rarity: wildPokemon.rarity, shiny },
    biome,
    token,
    battleUsed: battleUsed + 1,
    battleLimit,
    ...(useSpray ? { inventory } : {}),
  });
}
