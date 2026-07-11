import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { jsonError } from "@/lib/api";
import { seoulToday } from "@/lib/game";
import {
  AI_DAILY_LIMIT, AI_PROVIDERS, AiProvider,
  buildPrompt, callAi, parseQuestions,
} from "@/lib/ai";
import { decryptApiKey } from "@/lib/aiCrypto";

// AI 문제 생성 (명세 §5.2): 입력 → 프롬프트 조립 → AI 호출 → 파싱·검증 → 검토용 초안 반환.
// 등록은 하지 않는다 — 반드시 교사 검토 화면을 거쳐 승인분만 클라이언트가 등록.
// 남용 방지: 교사당 하루 AI_DAILY_LIMIT회 (settings.aiDay에 날짜별 카운트).
export async function POST(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const provider = cls.settings.aiProvider as AiProvider | undefined;
  const keyEnc = cls.settings.aiKeyEnc as string | undefined;
  if (!provider || !keyEnc || !(provider in AI_PROVIDERS))
    return jsonError(409, "AI 키가 등록되지 않았어요. 게임 설정에서 먼저 등록해주세요.");

  const today = seoulToday();
  const aiDay = (cls.settings.aiDay ?? {}) as { date?: string; count?: number };
  const used = aiDay.date === today ? Number(aiDay.count ?? 0) : 0;
  if (used >= AI_DAILY_LIMIT)
    return jsonError(429, `오늘의 AI 생성 한도(${AI_DAILY_LIMIT}회)를 모두 썼어요. 내일 다시!`);

  const body = await req.json().catch(() => null);
  const counts = {
    easy: clampCount(body?.counts?.easy),
    medium: clampCount(body?.counts?.medium),
    hard: clampCount(body?.counts?.hard),
  };
  const total = counts.easy + counts.medium + counts.hard;
  const topic = String(body?.topic ?? "").trim();
  if (!topic) return jsonError(400, "단원·주제를 입력해주세요 (예: 조선의 건국, 분수의 덧셈)");
  if (total < 1 || total > 10) return jsonError(400, "난이도별 개수 합계는 1~10개로 해주세요.");

  const prompt = buildPrompt({
    subject: String(body?.subject ?? "기타"),
    topic,
    grade: String(body?.grade ?? "초등 5학년"),
    counts,
    extra: typeof body?.extra === "string" ? body.extra : "",
  });

  let questions;
  try {
    const text = await callAi(provider, decryptApiKey(keyEnc), prompt);
    questions = parseQuestions(text);
  } catch (e) {
    return jsonError(502, `문제 생성에 실패했어요. 잠시 후 다시 시도하거나 개수를 줄여보세요. (${e instanceof Error ? e.message.slice(0, 160) : "알 수 없는 오류"})`);
  }

  // 성공 시에만 횟수 차감
  const settings = { ...cls.settings, aiDay: { date: today, count: used + 1 } };
  await supa.from("classes").update({ settings }).eq("id", cls.id);

  return NextResponse.json({ questions, used: used + 1, limit: AI_DAILY_LIMIT });
}

const clampCount = (v: unknown) => Math.max(0, Math.min(10, Number(v) || 0));
