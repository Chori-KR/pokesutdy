import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession, StudentSession } from "@/lib/studentSession";
import { Inventory } from "@/lib/game";

export interface StudentRow {
  id: string;
  class_id: string;
  nickname: string;
  pw_hash: string;
  points: number;
  inventory: Inventory;
  hp: number;
  level: number;
  xp: number;
  day_state: { date?: string };
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

// 학생 세션 검증 + 학생 행 로드. 실패 시 NextResponse(에러)를 반환.
export async function requireStudent(req: NextRequest): Promise<
  | { session: StudentSession; supa: SupabaseClient; student: StudentRow }
  | NextResponse
> {
  const session = await getStudentSession(req);
  if (!session) return jsonError(401, "로그인이 필요해요.");
  const supa = supabaseAdmin();
  const { data: student, error } = await supa
    .from("students")
    .select("*")
    .eq("id", session.sid)
    .single();
  if (error || !student) return jsonError(401, "학생 정보를 찾을 수 없어요. 다시 로그인해주세요.");
  return { session, supa, student: student as StudentRow };
}

// 클라이언트에 내려보낼 안전한 학생 스냅샷 (pw_hash 제외)
export function studentSnapshot(s: StudentRow) {
  return {
    id: s.id,
    nickname: s.nickname,
    points: s.points,
    inventory: s.inventory,
    hp: s.hp,
    level: s.level,
    xp: s.xp,
  };
}
