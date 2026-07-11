import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api";

// 교사용 서버 API 인증: 클라이언트가 Supabase 세션의 access token을
// Authorization: Bearer 로 보내면 서버가 검증하고, 그 교사의 학급을 로드한다.
// 학생 테이블은 anon 정책이 없으므로(명세 §7) 교사용 조회/지급도 서버 경유만 가능.

export interface ClassRow {
  id: string;
  teacher_id: string;
  name: string;
  class_code: string;
  settings: Record<string, unknown>;
}

export async function requireTeacher(req: NextRequest): Promise<
  | { supa: SupabaseClient; userId: string; cls: ClassRow }
  | NextResponse
> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return jsonError(401, "교사 로그인이 필요해요.");

  const supa = supabaseAdmin();
  const { data, error } = await supa.auth.getUser(token);
  if (error || !data?.user) return jsonError(401, "로그인이 만료됐어요. 다시 로그인해주세요.");

  const { data: cls } = await supa
    .from("classes")
    .select("id, teacher_id, name, class_code, settings")
    .eq("teacher_id", data.user.id)
    .limit(1)
    .single();
  if (!cls) return jsonError(404, "학급이 없어요. 먼저 학급을 만들어주세요.");

  return { supa, userId: data.user.id, cls: cls as ClassRow };
}
