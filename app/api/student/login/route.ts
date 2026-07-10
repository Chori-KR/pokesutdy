import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signStudentToken, setStudentCookie } from "@/lib/studentSession";
import { jsonError, studentSnapshot, StudentRow } from "@/lib/api";

// 닉네임은 학급 내에서만 고유하므로 로그인에도 학급 코드가 필요하다.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  const nickname = String(body?.nickname ?? "").trim();
  const password = String(body?.password ?? "");

  if (!code || !nickname || !password)
    return jsonError(400, "학급 코드, 닉네임, 비밀번호를 모두 입력해주세요.");

  const supa = supabaseAdmin();
  const { data: cls } = await supa
    .from("classes")
    .select("id")
    .eq("class_code", code)
    .single();
  if (!cls) return jsonError(404, "학급 코드가 달라요. 선생님께 다시 확인해보세요.");

  const { data: student } = await supa
    .from("students")
    .select("*")
    .eq("class_id", cls.id)
    .eq("nickname", nickname)
    .single();
  if (!student) return jsonError(404, "등록되지 않은 닉네임이에요. 회원가입을 먼저 해주세요.");

  const ok = await bcrypt.compare(password, student.pw_hash);
  if (!ok) return jsonError(401, "비밀번호가 달라요.");

  const token = await signStudentToken({ sid: student.id, cid: cls.id });
  const res = NextResponse.json({ student: studentSnapshot(student as StudentRow) });
  setStudentCookie(res, token);
  return res;
}
