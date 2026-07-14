import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

// 학생 인증: 개인정보 무수집 원칙(명세 §2.2) 때문에 Supabase Auth 대신
// 자체 JWT(httpOnly 쿠키) 세션을 쓴다. 페이로드는 학생/학급 id뿐.

const COOKIE = "ps_student";
const BATTLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30일

function secret() {
  const s = process.env.STUDENT_JWT_SECRET;
  if (!s) throw new Error("STUDENT_JWT_SECRET이 설정되지 않았습니다 (.env.local 확인)");
  return new TextEncoder().encode(s);
}

export interface StudentSession {
  sid: string; // students.id
  cid: string; // classes.id
}

export async function signStudentToken(session: StudentSession): Promise<string> {
  return new SignJWT({ sid: session.sid, cid: session.cid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export function setStudentCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: BATTLE_COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearStudentCookie(res: NextResponse) {
  res.cookies.set(COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
}

export async function getStudentSession(req: NextRequest): Promise<StudentSession | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sid !== "string" || typeof payload.cid !== "string") return null;
    return { sid: payload.sid, cid: payload.cid };
  } catch {
    return null;
  }
}

// 배틀 토큰: 서버가 고른 야생 포켓몬을 서명해 내려보내고,
// 포획 시 검증한다 → 클라이언트가 임의의 포켓몬(전설 등)을 포획 요청하는 것 방지.
// source: "battle"(배틀 승리 보상 있음) | "explore"(야생 탐색 — 포획만, 보상 없음)
export type EncounterSource = "battle" | "explore";

export async function signBattleToken(
  sid: string, pokemonId: number, source: EncounterSource = "battle", shiny = false
): Promise<string> {
  return new SignJWT({ sid, pid: pokemonId, kind: "battle", src: source, shy: shiny })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret());
}

export async function verifyBattleToken(
  token: string, sid: string
): Promise<{ pokemonId: number; source: EncounterSource; shiny: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== "battle" || payload.sid !== sid) return null;
    if (typeof payload.pid !== "number") return null;
    return {
      pokemonId: payload.pid,
      source: payload.src === "explore" ? "explore" : "battle",
      shiny: payload.shy === true,
    };
  } catch {
    return null;
  }
}
