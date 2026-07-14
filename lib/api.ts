import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentSession, StudentSession } from "@/lib/studentSession";
import { Inventory, DEFAULT_EXPLORE_LIMIT, DEFAULT_SOLVE_LIMIT, DEFAULT_BATTLE_LIMIT } from "@/lib/game";

// 일일 상태 (day_state jsonb) — 자정(Asia/Seoul) 지나면 통째로 리셋 (명세 §4.7)
export interface DayState {
  date?: string;
  quizDone?: boolean;
  quiz?: { target: number; opts: number[] } | null; // 데일리 퀴즈: 서버가 뽑아둔 정답+보기
  encUsed?: number;                                  // 오늘 사용한 야생 탐색 횟수
  solveCount?: number;                               // 오늘 푼 문제풀이 수
  solveQ?: string | null;                            // 지금 출제된 문제풀이 문제 id
  battleUsed?: number;                               // 오늘 시작한 배틀(조우) 수
  winTokens?: string[];                              // 승수 처리된 배틀 토큰 (중복 승수 방지)
}

// 영구 게임 상태 (game_state jsonb, 0003 마이그레이션) — 배틀 포켓몬 시스템
export interface GameState {
  starter?: number;                 // 스타팅 포켓몬 id (미선택이면 없음)
  battlePid?: number;               // 현재 배틀 포켓몬 id
  wins?: Record<string, number>;    // 포켓몬 id별 배틀 승수 (진화 조건)
  evoCount?: number;                // 누적 진화 횟수 (포인트 진화 비용 계산용, M5)
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
  game_state?: GameState | null; // 0003 이전 DB에는 컬럼이 없을 수 있음
}

// game_state 컬럼이 아직 없는 DB(0003 미실행)에서 나는 오류를 친절한 안내로 변환
export function isMissingGameState(error: { message?: string } | null): boolean {
  return !!error?.message && /game_state/.test(error.message);
}
export const GAME_STATE_HINT =
  "게임 업데이트에 필요한 DB 작업이 아직 안 됐어요. 선생님께 'supabase/migrations/0003_battle_pokemon.sql 실행'을 요청해주세요!";

// catches.count 컬럼이 아직 없는 DB(0004 미실행) 안내
export const isMissingCount = (error: { message?: string } | null): boolean =>
  !!error?.message && /count/.test(error.message);
export const CATCH_COUNT_HINT =
  "게임 업데이트에 필요한 DB 작업이 아직 안 됐어요. 선생님께 'supabase/migrations/0004_catch_count.sql 실행'을 요청해주세요!";

// trades 테이블이 아직 없는 DB(0005 미실행) 안내
export const isMissingTrades = (error: { message?: string } | null): boolean =>
  !!error?.message && /trades/.test(error.message);
export const TRADES_HINT =
  "교환 기능에 필요한 DB 작업이 아직 안 됐어요. 선생님께 'supabase/migrations/0005_trades.sql 실행'을 요청해주세요!";

// 잡은 마리 수 증감 (M8/M9). delta>0 증가, delta<0 감소.
// M9: 0마리가 돼도 행을 남긴다 — 한 번이라도 잡거나 진화시킨 종은 도감에 영구 기록.
//     (교환으로 받은 종만 그 종의 행이 새로 생겨 도감에 추가 — 진화 전 종은 안 남음)
// select("*")로 읽어 count 컬럼이 없어도 읽기는 안전, 쓰기 오류만 상위에서 안내.
// 반환: { count, created, error } — created=이번에 처음 도감에 추가된 종
export async function bumpCatch(
  supa: SupabaseClient, studentId: string, pid: number, method: string, delta = 1
): Promise<{ count: number; created: boolean; error: { message?: string } | null }> {
  const { data: rows } = await supa
    .from("catches")
    .select("*")
    .eq("student_id", studentId)
    .eq("pokemon_id", pid)
    .limit(1);
  const existing = rows?.[0] as { id: string; count?: number } | undefined;

  if (!existing) {
    if (delta <= 0) return { count: 0, created: false, error: null };
    const { error } = await supa
      .from("catches")
      .insert({ student_id: studentId, pokemon_id: pid, method, count: delta });
    return { count: delta, created: !error, error };
  }
  const next = Math.max(0, (existing.count ?? 1) + delta); // 0으로 내려가도 행 유지(도감 기록)
  const { error } = await supa.from("catches").update({ count: next }).eq("id", existing.id);
  return { count: next, created: false, error };
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

// 학급 설정 로드 (탐색/문제풀이/배틀 일일 한도 포함)
export async function getClassSettings(supa: SupabaseClient, classId: string) {
  const { data } = await supa.from("classes").select("settings").eq("id", classId).single();
  const s = (data?.settings ?? {}) as {
    moveDiff?: boolean; exploreLimit?: number; solveLimit?: number; battleLimit?: number;
    timerOn?: boolean; timeScale?: number;
  };
  return {
    moveDiff: s.moveDiff !== false,
    exploreLimit: Math.max(0, Number(s.exploreLimit ?? DEFAULT_EXPLORE_LIMIT)),
    solveLimit: Math.max(0, Number(s.solveLimit ?? DEFAULT_SOLVE_LIMIT)),
    battleLimit: Math.max(0, Number(s.battleLimit ?? DEFAULT_BATTLE_LIMIT)),
    timerOn: s.timerOn !== false,                                   // 기본 켜짐
    timeScale: Math.min(3, Math.max(1, Number(s.timeScale ?? 1.5))), // 기본 1.5배(넉넉)
  };
}

// 클라이언트에 내려보낼 일일 카운터 스냅샷
export function daySnapshot(
  s: StudentRow,
  limits: { exploreLimit: number; solveLimit: number; battleLimit: number }
) {
  return {
    quizDone: s.day_state?.quizDone === true,
    encUsed: Number(s.day_state?.encUsed ?? 0),
    solveCount: Number(s.day_state?.solveCount ?? 0),
    battleUsed: Number(s.day_state?.battleUsed ?? 0),
    exploreLimit: limits.exploreLimit,
    solveLimit: limits.solveLimit,
    battleLimit: limits.battleLimit,
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
