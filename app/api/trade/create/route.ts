import { NextRequest, NextResponse } from "next/server";
import { requireStudent, jsonError, isMissingTrades, TRADES_HINT } from "@/lib/api";
import { POOL, MAX_DEX_ID } from "@/lib/game";

// 교환 등록 (M9/M10): 내가 보유(1마리 이상)한 포켓몬을 걸고 6자리 숫자 코드를 만든다.
// 실제 맞바꿈은 상대가 수락할 때 서버가 원자적으로 처리(여기선 포켓몬을 잡아두지 않음).
// 같은 포켓몬을 이미 교환에 걸어둔 게 있으면 재사용(중복 방지).
// 코드는 '열린 교환'끼리만 유일 → 완료·취소된 숫자는 나중에 다시 나올 수 있음.
function genTradeCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

export async function POST(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  const body = await req.json().catch(() => null);
  const pid = Number(body?.pokemon_id);
  if (!(pid >= 1 && pid <= MAX_DEX_ID)) return jsonError(400, "포켓몬이 올바르지 않아요.");

  // 보유(1마리 이상) 확인
  const { data: rows } = await supa
    .from("catches")
    .select("*")
    .eq("student_id", student.id)
    .eq("pokemon_id", pid)
    .limit(1);
  const owned = rows?.[0] as { count?: number } | undefined;
  if (!owned || (owned.count ?? 1) < 1)
    return jsonError(409, "지금 보유하지 않은 포켓몬은 교환에 걸 수 없어요.");

  // 이미 같은 포켓몬으로 열어둔 교환이 있으면 그 코드를 그대로 반환
  const { data: existing, error: exErr } = await supa
    .from("trades")
    .select("code")
    .eq("from_student", student.id)
    .eq("offer_pokemon", pid)
    .eq("status", "open")
    .limit(1);
  if (exErr) return jsonError(500, isMissingTrades(exErr) ? TRADES_HINT : "교환 등록에 실패했어요.");
  if (existing && existing[0])
    return NextResponse.json({ code: (existing[0] as { code: string }).code, name: POOL[pid - 1].name, reused: true });

  // 유니크 코드 생성 (충돌 시 재시도)
  let code = "";
  for (let attempt = 0; attempt < 6; attempt++) {
    code = genTradeCode();
    const { error } = await supa.from("trades").insert({
      class_id: student.class_id,
      code,
      from_student: student.id,
      offer_pokemon: pid,
      status: "open",
    });
    if (!error) return NextResponse.json({ code, name: POOL[pid - 1].name, reused: false });
    if (isMissingTrades(error)) return jsonError(500, TRADES_HINT);
    if (!/code/.test(error.message ?? "")) return jsonError(500, "교환 등록에 실패했어요.");
    // 코드 중복이면 재시도
  }
  return jsonError(500, "교환 코드 생성에 실패했어요. 다시 시도해주세요.");
}
