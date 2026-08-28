// AI 문제 생성 — BYOK 어댑터 (명세 §5.2/5.3)
// 교사 API 키는 서버에서만 복호화·사용. 호출은 전부 서버 경유(키 브라우저 비노출).
// 어댑터 패턴: 제공사별 호출 모듈 분리. 응답은 공통 파서로 정규화.

// (주의) 이 파일은 클라이언트에서도 임포트됨 — Node 전용 모듈 금지.
// 키 암호화는 서버 전용 lib/aiCrypto.ts에 분리.
import type { Difficulty } from "@/lib/game";

export type AiProvider = "gemini" | "openai" | "claude";

export const AI_PROVIDERS: Record<AiProvider, { name: string; model: string; keyHelp: string }> = {
  gemini: { name: "Google Gemini", model: "flash(자동 선택)", keyHelp: "https://aistudio.google.com/apikey 에서 무료 발급 (권장)" },
  openai: { name: "OpenAI (ChatGPT)", model: "gpt-4o-mini", keyHelp: "https://platform.openai.com/api-keys 에서 발급 (유료 크레딧 필요)" },
  claude: { name: "Anthropic (Claude)", model: "claude-haiku-4-5", keyHelp: "https://console.anthropic.com 에서 발급 (유료 크레딧 필요)" },
};

// Gemini는 모델 세대 교체가 잦아(구모델이 신규 사용자에게 404) 후보를 순서대로 시도한다.
// gemini-flash-latest는 항상 최신 flash를 가리키는 공식 별칭.
const GEMINI_MODELS = ["gemini-flash-latest", "gemini-3-flash", "gemini-2.5-flash"];

export const AI_DAILY_LIMIT = 20; // 교사당 일일 생성 호출 제한 (명세 §5.3 남용 방지)

// ── 프롬프트 (프로토타입 teacher-menu의 출제 규칙 포팅, 명세 §5.2) ─────────
export interface GenRequest {
  subject: string;
  topic: string;
  grade: string;
  counts: { easy: number; medium: number; hard: number };
  extra?: string;
  special?: boolean;   // 특수교육 기본교육과정 모드
  curriculum?: string; // 근거 성취기준 목록(특수 모드)
  qtype?: "multiple" | "short"; // 문제 유형(기본 객관식)
}

export function buildPrompt(r: GenRequest): string {
  const isShort = r.qtype === "short";
  const formatBlock = isShort
    ? `반드시 아래 형식의 JSON 배열만 출력하세요. 마크다운 코드블록, 설명, 인사말을 절대 붙이지 마세요.
[{"q":"문제 내용","answers":["정답","허용 정답2"],"d":"easy","why":"정답 해설 한 줄"}]
answers는 정답으로 인정할 표현들의 배열입니다. 학생이 타이핑할 때를 대비해 동의어·축약·띄어쓰기 변형을 함께 넣으세요(예: ["세종","세종대왕"]). d는 easy/medium/hard 중 하나입니다.`
    : `반드시 아래 형식의 JSON 배열만 출력하세요. 마크다운 코드블록, 설명, 인사말을 절대 붙이지 마세요.
[{"q":"문제 내용","opts":["보기1","보기2","보기3","보기4"],"answer":0,"d":"easy","why":"정답 해설 한 줄"}]
answer는 정답 보기의 인덱스(0~3), d는 easy/medium/hard 중 하나입니다.`;
  const typeRules = isShort
    ? `
- [단답형] 정답은 한 단어~짧은 구로, 학생이 직접 타이핑해 맞힐 수 있게 명확하고 짧게 낼 것
- [단답형] 정답이 여러 표현으로 쓰일 수 있으면 answers에 허용 표현을 모두 넣을 것`
    : `
- 오답 보기는 학생들이 실제로 저지르는 흔한 실수나 오개념에서 만들 것
- 정답이 특정 번호에 몰리지 않게 answer 인덱스를 골고루 분배할 것`;
  return `당신은 학교 교사를 돕는 시험 문제 출제 도우미입니다. 다음 조건으로 ${isShort ? "단답형(주관식)" : "4지선다"} 문제를 만들어주세요.

과목: ${r.subject}
단원·주제: ${r.topic}
학년 수준: ${r.grade}
난이도별 개수: 쉬움 ${r.counts.easy}개, 보통 ${r.counts.medium}개, 어려움 ${r.counts.hard}개
${r.extra?.trim() ? `추가 지시: ${r.extra.trim()}` : ""}
${r.special && r.curriculum ? `
[근거 교육과정] 아래는 2022 개정 특수교육 기본 교육과정의 성취기준입니다. 반드시 이 성취기준에 근거해서 문제를 만드세요.
${r.curriculum}
` : ""}

출제 규칙:
- 난이도를 명확히 구분할 것: 쉬움=기본 개념 확인, 보통=개념 적용, 어려움=응용·복합·문장제
- 문제는 해당 학년이 이해할 수 있는 어휘로 쓸 것
- 수학·과학 수식과 기호는 반드시 LaTeX로 $...$(문장 속) 안에 쓸 것. 예: 지수 $2^{3}$, 분수 $\\frac{1}{2}$, 루트 $\\sqrt{b^2-4ac}$, 근의 공식 $x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$, 삼각함수 $\\sin\\theta$·$\\cos x$, 극한 $\\lim_{x \\to 0}$, 화학식 $\\mathrm{H_2O}$·$\\mathrm{CO_2}$, 물리 $E=mc^{2}$. (2^3, H2O처럼 밋밋하게 쓰지 말고 위처럼 LaTeX로 감쌀 것)${typeRules}${r.special ? `
- [특수교육] 대상은 특수교육 기본교육과정 학생입니다. 문장은 짧고 쉽고 구체적으로, 일상생활 맥락으로 쓸 것
- [특수교육] 추상적·복합적 사고를 최소화하고, 그림 없이 글만으로 풀 수 있게 할 것
- [특수교육] 성취기준이 태도·실천형이면 생활 속 상황을 고르는 문제로 재구성할 것` : ""}

${formatBlock}`;
}

// ── 제공사별 어댑터: 프롬프트 → 응답 텍스트 ─────────────────────────────
async function callGemini(key: string, prompt: string): Promise<string> {
  let lastErr = "";
  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // 순수 JSON만 받도록 강제 → 파싱 실패 감소 + 응답 지연 완화
          generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );
    if (res.status === 404) {
      // 이 모델이 폐기/미지원 — 다음 후보 시도
      lastErr = `Gemini 404 (${model})`;
      continue;
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await safeErr(res)}`);
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    return parts.map((p: { text?: string }) => p.text ?? "").join("");
  }

  // 후보가 전부 404 — 계정에서 실제 쓸 수 있는 flash 모델을 조회해 마지막으로 시도
  const discovered = await discoverGeminiModel(key);
  if (discovered) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${discovered}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // 순수 JSON만 받도록 강제 → 파싱 실패 감소 + 응답 지연 완화
          generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      return parts.map((p: { text?: string }) => p.text ?? "").join("");
    }
    lastErr = `Gemini ${res.status} (${discovered}): ${await safeErr(res)}`;
  }
  throw new Error(lastErr || "Gemini: 사용 가능한 모델을 찾지 못했어요.");
}

// 계정별 사용 가능 모델 목록에서 generateContent 지원 flash 모델을 고른다 (최신 우선).
async function discoverGeminiModel(key: string): Promise<string | null> {
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000",
      { headers: { "x-goog-api-key": key } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const names: string[] = (data?.models ?? [])
      .filter((m: { name?: string; supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        /flash/i.test(m.name ?? "") &&
        !/(embedding|image|tts|audio|live|thinking)/i.test(m.name ?? "")
      )
      .map((m: { name: string }) => m.name.replace(/^models\//, ""));
    if (names.length === 0) return null;
    return names.sort().reverse()[0]; // 버전 문자열 내림차순 → 대체로 최신
  } catch {
    return null;
  }
}

async function callOpenai(key: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: AI_PROVIDERS.openai.model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await safeErr(res)}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function callClaude(key: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: AI_PROVIDERS.claude.model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await safeErr(res)}`);
  const data = await res.json();
  if (data?.stop_reason === "refusal") throw new Error("Claude가 요청을 거절했어요.");
  return (data?.content ?? [])
    .map((b: { type: string; text?: string }) => (b.type === "text" ? b.text ?? "" : ""))
    .join("");
}

async function safeErr(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t.slice(0, 300);
  } catch {
    return "(응답 본문 없음)";
  }
}

export async function callAi(provider: AiProvider, key: string, prompt: string): Promise<string> {
  if (provider === "gemini") return callGemini(key, prompt);
  if (provider === "openai") return callOpenai(key, prompt);
  return callClaude(key, prompt);
}

// ── 공통 파서: 텍스트 → 검증된 문제 배열 ─────────────────────────────────
export interface GeneratedQuestion {
  q: string;
  type: "multiple" | "short";
  opts: string[];   // 객관식: 보기 4개 / 단답형: 허용 정답 목록
  answer: number;   // 객관식: 0~3 / 단답형: 0
  d: Difficulty;
  why: string;
}

export function parseQuestions(text: string): GeneratedQuestion[] {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end <= start) throw new Error("AI 응답에서 JSON을 찾지 못했어요.");
  const slice = cleaned.slice(start, end + 1);
  let parsed: unknown;
  try {
    parsed = JSON.parse(slice);
  } catch {
    // LaTeX 백슬래시(\frac, \sqrt 등)가 JSON 이스케이프를 깨는 경우 → 모든 \를 이스케이프해 재시도
    parsed = JSON.parse(slice.replace(/\\/g, "\\\\"));
  }
  if (!Array.isArray(parsed)) throw new Error("AI 응답이 배열이 아니에요.");

  const strList = (a: unknown): string[] | null =>
    Array.isArray(a) && a.length > 0 && a.every((o) => typeof o === "string" && String(o).trim())
      ? a.map((o) => String(o).trim()) : null;

  const clean: GeneratedQuestion[] = [];
  for (const p of parsed) {
    if (!p || typeof p.q !== "string" || !p.q.trim()) continue;
    const d = (["easy", "medium", "hard"].includes(p.d) ? p.d : "medium") as Difficulty;
    const why = typeof p.why === "string" ? p.why.trim() : "";
    const answers = strList(p.answers);
    const opts = strList(p.opts);
    if (answers) {
      // 단답형
      clean.push({ q: String(p.q).trim(), type: "short", opts: answers, answer: 0, d, why });
    } else if (opts && opts.length === 4 && Number.isInteger(p.answer) && p.answer >= 0 && p.answer <= 3) {
      // 객관식
      clean.push({ q: String(p.q).trim(), type: "multiple", opts, answer: Number(p.answer), d, why });
    }
  }
  if (clean.length === 0) throw new Error("사용할 수 있는 문제가 없었어요. 다시 시도해주세요.");
  return clean;
}
