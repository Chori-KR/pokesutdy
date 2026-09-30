import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api";
import { exportLogs, exportStudents, findClassByExportToken } from "@/lib/sheetExport";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// 구글 시트(Apps Script)가 호출하는 내보내기 API.
//   GET /api/export?token=pk_...&cursor=<이전 응답의 cursor>
// 교사 로그인 대신 학급 연동 토큰으로 인증한다(시트는 로그인할 수 없으므로).
// 첫 요청(cursor 없음)에만 학생 현황을 함께 보낸다.
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const token = sp.get("token") ?? "";
  const cursor = sp.get("cursor") ?? "";

  const supa = supabaseAdmin();
  const cls = await findClassByExportToken(supa, token);
  if (!cls) return jsonError(401, "연동 주소가 올바르지 않아요. 교사 메뉴 → 시스템 설정에서 다시 복사해주세요.");

  try {
    const [students, page] = await Promise.all([
      sp.get("students") === "0" ? Promise.resolve(null) : exportStudents(supa, cls.id),
      exportLogs(supa, cls.id, cursor),
    ]);
    return NextResponse.json({
      ok: true,
      class: { name: cls.name, code: cls.class_code },
      generatedAt: new Date().toISOString(),
      students,
      logs: page.rows,
      cursor: page.cursor,
      done: page.done,
    });
  } catch {
    return jsonError(500, "기록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}
