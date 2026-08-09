import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/api";

// [임시 진단용] 로그인한 학생의 학급 문제들이 배틀 조건(active·4지선다·레이드아님)에
// 왜 안 잡히는지 확인하기 위한 엔드포인트. 원인 확인 후 삭제 예정.
export const dynamic = "force-dynamic";

interface Row { id: string; difficulty: string; type: string | null; active: boolean; raid_only?: boolean | null; tag: string }

export async function GET(req: NextRequest) {
  const auth = await requireStudent(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, student } = auth;

  let raidColMissing = false;
  let rows: Row[] | null = null;
  {
    const r = await supa
      .from("questions")
      .select("id, difficulty, type, active, raid_only, tag")
      .eq("class_id", student.class_id);
    if (r.error && /raid_only/.test(r.error.message)) {
      raidColMissing = true;
      const r2 = await supa
        .from("questions")
        .select("id, difficulty, type, active, tag")
        .eq("class_id", student.class_id);
      rows = (r2.data as Row[]) ?? [];
    } else {
      rows = (r.data as Row[]) ?? [];
    }
  }

  const list = rows ?? [];
  return NextResponse.json({
    class_id: student.class_id,
    raidColMissing,
    total: list.length,
    active: list.filter((q) => q.active).length,
    active_multiple: list.filter((q) => q.active && q.type !== "short").length,
    active_multiple_nonraid: list.filter((q) => q.active && q.type !== "short" && !q.raid_only).length,
    rows: list.map((q) => ({
      difficulty: q.difficulty,
      type: q.type,
      active: q.active,
      raid_only: q.raid_only ?? null,
      tag: q.tag,
    })),
  });
}
