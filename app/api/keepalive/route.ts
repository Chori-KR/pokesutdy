import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Supabase 무료 플랜 자동 정지(7일 미사용 시 pause) 방지용 엔드포인트.
// 외부 스케줄러(GitHub Actions)가 주기적으로 호출해 DB에 가벼운 요청을 보내
// 프로젝트를 '활동 중'으로 유지한다. 민감 데이터는 노출하지 않는다.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supa = supabaseAdmin();
    // 항상 151행이 있는 pokemon_meta에 count(head)만 — 데이터는 내려보내지 않음
    const { error } = await supa
      .from("pokemon_meta")
      .select("id", { count: "exact", head: true });
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
