import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signStudentToken, setStudentCookie } from "@/lib/studentSession";
import { jsonError, studentSnapshot, StudentRow } from "@/lib/api";

// 학급 코드 + 닉네임 + 비밀번호(4자 이상)만으로 가입 (명세 §2.2)
// 가입 즉시 500P + 몬스터볼 3개는 DB default로 지급된다.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  const nickname = String(body?.nickname ?? "").trim();
  const password = String(body?.password ?? "");

  if (!code) return jsonError(400, "학급 코드를 입력해주세요.");
  if (!nickname || nickname.length > 20) return jsonError(400, "닉네임은 1~20자로 해주세요.");
  if (password.length < 4) return jsonError(400, "비밀번호는 4자 이상으로 해주세요.");

  const supa = supabaseAdmin();
  const { data: cls } = await supa
    .from("classes")
    .select("id, name")
    .eq("class_code", code)
    .single();
  if (!cls) return jsonError(404, "학급 코드가 달라요. 선생님께 다시 확인해보세요.");

  const pw_hash = await bcrypt.hash(password, 10);
  const { data: student, error } = await supa
    .from("students")
    .insert({ class_id: cls.id, nickname, pw_hash })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505")
      return jsonError(409, "이미 있는 닉네임이에요. 다른 이름으로 해주세요.");
    return jsonError(500, "가입에 실패했어요. 잠시 후 다시 시도해주세요.");
  }

  const token = await signStudentToken({ sid: student.id, cid: cls.id });
  const res = NextResponse.json({ student: studentSnapshot(student as StudentRow) });
  setStudentCookie(res, token);
  return res;
}
