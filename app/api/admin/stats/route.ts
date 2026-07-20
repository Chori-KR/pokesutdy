import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api";

// 관리자 전용 가입 현황 (앱 제작자 본인만).
// 게이트: 로그인한 교사의 "검증된" 이메일이 ADMIN_EMAIL과 일치할 때만 통과.
//   - 토큰은 service-role로 검증하므로 이메일 위조 불가.
//   - ADMIN_EMAIL(=NEXT_PUBLIC_ADMIN_EMAIL) 미설정 시 전원 차단(기능 off).
// 반환: 교사 수 / 학급 수 / 학생 수 + 최근 가입 교사 목록.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();

export async function GET(req: NextRequest) {
  if (!ADMIN_EMAIL)
    return jsonError(403, "관리자 이메일이 설정되지 않았어요. 배포 환경변수에 ADMIN_EMAIL을 넣어주세요.");

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return jsonError(401, "로그인이 필요해요.");

  const supa = supabaseAdmin();
  const { data: got, error: authErr } = await supa.auth.getUser(token);
  if (authErr || !got?.user) return jsonError(401, "로그인이 만료됐어요. 다시 로그인해주세요.");

  const email = (got.user.email ?? "").trim().toLowerCase();
  if (email !== ADMIN_EMAIL) return jsonError(403, "이 화면은 관리자만 볼 수 있어요.");

  // 학급 / 학생 수 (정확 카운트, 행 데이터는 안 가져옴)
  const [{ count: classCount }, { count: studentCount }] = await Promise.all([
    supa.from("classes").select("*", { count: "exact", head: true }),
    supa.from("students").select("*", { count: "exact", head: true }),
  ]);

  // 교사(=auth 유저) 목록 — 소규모 서비스 가정, 최대 1000명까지 정확
  let teacherCount = 0;
  let recent: { email: string; created_at: string }[] = [];
  try {
    const { data: list } = await supa.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const users = list?.users ?? [];
    teacherCount = users.length;
    recent = users
      .map((u) => ({ email: u.email ?? "(이메일 없음)", created_at: u.created_at ?? "" }))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 30);
  } catch {
    // listUsers 실패 시 학급 소유 교사 수로 대체 추정
    const { data: rows } = await supa.from("classes").select("teacher_id");
    teacherCount = new Set((rows ?? []).map((r) => r.teacher_id)).size;
  }

  return NextResponse.json({
    teacherCount,
    classCount: classCount ?? 0,
    studentCount: studentCount ?? 0,
    recent,
    generatedAt: new Date().toISOString(),
  });
}
