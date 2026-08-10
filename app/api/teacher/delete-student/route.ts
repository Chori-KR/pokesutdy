import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { jsonError } from "@/lib/api";

// 학생 계정 삭제 — 교사가 자기 학급의 학생만 삭제 가능.
// students 삭제 시 catches/answer_logs/trades 는 FK on delete cascade 로 함께 정리된다.
export async function POST(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const body = await req.json().catch(() => null);
  const studentId = String(body?.student_id ?? "");
  if (!studentId) return jsonError(400, "학생을 선택해주세요.");

  const { data: student } = await supa
    .from("students")
    .select("id, nickname")
    .eq("id", studentId)
    .eq("class_id", cls.id)
    .single();
  if (!student) return jsonError(404, "학생을 찾을 수 없어요.");

  const { error } = await supa.from("students").delete().eq("id", student.id).eq("class_id", cls.id);
  if (error) return jsonError(500, "삭제에 실패했어요.");

  return NextResponse.json({ ok: true, nickname: student.nickname });
}
