import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireTeacher } from "@/lib/teacherApi";
import { jsonError } from "@/lib/api";

// 학생 비밀번호 초기화 (명세 §5.5): 비밀번호를 잊은 학생을 교사가 구제.
export async function POST(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const body = await req.json().catch(() => null);
  const studentId = String(body?.student_id ?? "");
  const newPw = String(body?.new_pw ?? "");
  if (!studentId) return jsonError(400, "학생을 선택해주세요.");
  if (newPw.length < 4) return jsonError(400, "새 비밀번호는 4자 이상으로 해주세요.");

  const { data: student } = await supa
    .from("students")
    .select("id, nickname")
    .eq("id", studentId)
    .eq("class_id", cls.id)
    .single();
  if (!student) return jsonError(404, "학생을 찾을 수 없어요.");

  const pw_hash = await bcrypt.hash(newPw, 10);
  const { error } = await supa.from("students").update({ pw_hash }).eq("id", student.id);
  if (error) return jsonError(500, "변경에 실패했어요.");

  return NextResponse.json({ ok: true, nickname: student.nickname });
}
