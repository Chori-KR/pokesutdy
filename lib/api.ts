import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession, StudentSession } from "@/lib/studentSession";
import { Inventory, DEFAULT_EXPLORE_LIMIT, DEFAULT_SOLVE_LIMIT } from "@/lib/game";

// 일일 상태 (day_state jsonb) — 자정(Asia/Seoul) 지나면 통째로 리셋 (명세 §4.7)
export interface DayState {
  date?: string;
  quizDone?: boolean;
  quiz?: { target: number; opts: number[] } | null; // 데일리 퀴즈: 서버가 뽑아둔 정답+보기
  encUsed?: number;                                  // 오늘 사용한 야생 탐색 횟수
  solveCount?: number;                               // 오늘 푼 문제풀이 수
  solveQ?: string | null;                            // 지금 출제된 문제풀이 문제 id
}

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
  day_state: DayState;
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

// 학급 설정 로드 (탐색/문제풀이 일일 한도 포함)
export async function getClassSettings(supa: SupabaseClient, classId: string) {
  const { data } = await supa.from("classes").select("settings").eq("id", classId).single();
  const s = (data?.settings ?? {}) as { moveDiff?: boolean; exploreLimit?: number; solveLimit?: number };
  return {
    moveDiff: s.moveDiff !== false,
    exploreLimit: Math.max(0, Number(s.exploreLimit ?? DEFAULT_EXPLORE_LIMIT)),
    solveLimit: Math.max(0, Number(s.solveLimit ?? DEFAULT_SOLVE_LIMIT)),
  };
}

// 클라이언트에 내려보낼 일일 카운터 스냅샷
export function daySnapshot(s: StudentRow, limits: { exploreLimit: number; solveLimit: number }) {
  return {
    quizDone: s.day_state?.quizDone === true,
    encUsed: Number(s.day_state?.encUsed ?? 0),
    solveCount: Number(s.day_state?.solveCount ?? 0),
    exploreLimit: limits.exploreLimit,
    solveLimit: limits.solveLimit,
  };
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
