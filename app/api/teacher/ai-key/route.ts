import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { jsonError } from "@/lib/api";
import { AI_PROVIDERS, AiProvider, AiUserError, callAi } from "@/lib/ai";
import { encryptApiKey } from "@/lib/aiCrypto";

// 연결 테스트에서 Gemini 모델 탐색(후보 404 → 목록 조회)이 돌면 10초를 넘길 수 있어
// 라우트 실행 제한을 늘려 둔다. (기본 Hobby 10초 제한 회피)
export const maxDuration = 60;

// AI 키 등록 + 연결 테스트 (명세 §5.3).
// 키는 저장 전에 실제 호출로 검증하고, AES-GCM으로 암호화해 학급 설정에 저장.
// 클라이언트에는 암호문과 힌트(끝 4자)만 존재 — 원문 키는 서버에서만 복호화.
export async function POST(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const body = await req.json().catch(() => null);
  const provider = String(body?.provider ?? "") as AiProvider;
  const key = String(body?.key ?? "").trim();
  if (!(provider in AI_PROVIDERS)) return jsonError(400, "지원하지 않는 AI 제공사예요.");
  if (key.length < 10) return jsonError(400, "API 키가 너무 짧아요. 다시 확인해주세요.");

  // 연결 테스트: 아주 작은 요청 1회
  try {
    await callAi(provider, key, '연결 테스트입니다. JSON 배열 ["ok"] 만 출력하세요.');
  } catch (e) {
    // 서버 혼잡은 키 문제가 아니므로 "키를 확인하라"고 하지 않는다
    if (e instanceof AiUserError) return jsonError(503, e.message);
    return jsonError(400, `연결 테스트 실패 — 키를 다시 확인해주세요. (${e instanceof Error ? e.message.slice(0, 160) : "알 수 없는 오류"})`);
  }

  const settings = {
    ...cls.settings,
    aiProvider: provider,
    aiKeyEnc: encryptApiKey(key),
    aiKeyHint: key.slice(-4),
  };
  const { error } = await supa.from("classes").update({ settings }).eq("id", cls.id);
  if (error) return jsonError(500, "저장에 실패했어요.");

  return NextResponse.json({ ok: true, provider, hint: key.slice(-4) });
}

// 등록된 키 삭제
export async function DELETE(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const settings = { ...cls.settings };
  delete settings.aiProvider;
  delete settings.aiKeyEnc;
  delete settings.aiKeyHint;
  const { error } = await supa.from("classes").update({ settings }).eq("id", cls.id);
  if (error) return jsonError(500, "저장에 실패했어요.");
  return NextResponse.json({ ok: true });
}
