import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { jsonError } from "@/lib/api";
import { newExportToken } from "@/lib/sheetExport";

// 구글 시트 연동 토큰 발급·재발급(POST) / 해제(DELETE).
// 재발급하면 예전 주소는 즉시 무효 — 주소가 새어 나갔을 때 쓰는 용도.
export async function POST(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const exportToken = newExportToken();
  const settings = { ...cls.settings, exportToken };
  const { error } = await supa.from("classes").update({ settings }).eq("id", cls.id);
  if (error) return jsonError(500, "저장에 실패했어요.");
  return NextResponse.json({ ok: true, exportToken });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const settings = { ...cls.settings };
  delete settings.exportToken;
  const { error } = await supa.from("classes").update({ settings }).eq("id", cls.id);
  if (error) return jsonError(500, "저장에 실패했어요.");
  return NextResponse.json({ ok: true });
}
