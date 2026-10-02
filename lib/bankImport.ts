import { sanitizeSvg } from "@/lib/svg";

// 문제 은행 JSON(Codex로 만든 bank_*.json) 읽기·검사.
//
// 형식
// {
//   "meta": { "subject": "국어", "unit": "읽기", ... },
//   "passages": [ { "id": "p1", "title": "제목", "text": "지문 본문", "source": "출처", "svg": "<svg…>" } ],
//   "questions": [
//     { "type": "multiple", "difficulty": "easy", "body": "…", "options": [4개], "answer": 0~3,
//       "passage": "p1", "svg": "<svg…>", "subject": "국어", "unit": "읽기" },
//     { "type": "short", "body": "…", "answers": ["정답", "허용 표현"] }
//   ]
// }
//  - passages / passage / svg 는 없어도 된다 (예전 형식 그대로 읽힘)
//  - 태그 = "과목·단원" (배틀은 과목별로 묶어 출제)
//  - 문제마다 passage 칸에 지문 객체를 바로 넣어도 된다 ({ "title", "text", "source" })

export type Difficulty = "easy" | "medium" | "hard";

export interface ParsedPassage { key: string; title: string; body: string; source: string; svg: string | null }
export interface ParsedQuestion {
  body: string; options: string[]; answer_idx: number; difficulty: Difficulty; tag: string;
  type: "multiple" | "short"; svg: string | null; passageKey: string | null;
}
export interface ParsedBank {
  file: string;
  questions: ParsedQuestion[];
  passages: ParsedPassage[];   // 실제로 문제가 딸린 지문만
  errors: string[];            // 이 문제는 빼고 가져옴
  warnings: string[];          // 가져오긴 하지만 확인해 볼 것
  fatal?: string;              // 파일 자체를 못 읽음
}

export const PASSAGE_MAX = 20000;
const BODY_MAX = 4000;

const LEVEL: Record<string, Difficulty> = { C: "easy", B: "medium", A: "hard" };
const DIFF_KO: Record<string, Difficulty> = { 쉬움: "easy", 보통: "medium", 어려움: "hard" };

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "").trim();

// 지문 같음 판단용 (띄어쓰기·줄바꿈 차이는 같은 글로 봄)
export const textKey = (s: string) => s.replace(/\s+/g, " ").trim();

function stripFence(t: string) {
  return t.replace(/^﻿/, "").replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
}

export function parseBank(file: string, text: string): ParsedBank {
  const out: ParsedBank = { file, questions: [], passages: [], errors: [], warnings: [] };
  let root: unknown;
  try {
    root = JSON.parse(stripFence(text));
  } catch (e) {
    out.fatal = `JSON 형식이 아니에요 (${(e as Error).message.slice(0, 80)})`;
    return out;
  }
  const obj = (Array.isArray(root) ? { questions: root } : root) as Record<string, unknown>;
  if (!obj || typeof obj !== "object" || !Array.isArray(obj.questions)) {
    out.fatal = "questions 목록이 없어요";
    return out;
  }
  const meta = (obj.meta ?? {}) as Record<string, unknown>;

  // ── 지문 ──
  const pmap = new Map<string, ParsedPassage>();
  const readPassage = (p: Record<string, unknown>, key: string, where: string): ParsedPassage | null => {
    const body = str(p.text ?? p.body ?? p.content);
    if (!body) { out.errors.push(`${where}: 지문 본문(text)이 비어 있어요`); return null; }
    if (body.length > PASSAGE_MAX) { out.errors.push(`${where}: 지문이 너무 길어요 (${body.length}자, 최대 ${PASSAGE_MAX}자)`); return null; }
    const source = str(p.source ?? p["출처"]);
    if (!source) out.warnings.push(`${where}: 출처(source)가 없어요`);
    let svg: string | null = null;
    if (p.svg) {
      svg = sanitizeSvg(p.svg);
      if (!svg) out.warnings.push(`${where}: 그림(svg)이 올바르지 않아 빼고 가져와요`);
    }
    return { key, title: str(p.title), body, source, svg };
  };
  if (Array.isArray(obj.passages)) {
    obj.passages.forEach((raw, i) => {
      const p = (raw ?? {}) as Record<string, unknown>;
      const key = str(p.id) || `#${i + 1}`;
      if (pmap.has(key)) { out.errors.push(`지문 ${key}: id가 겹쳐요`); return; }
      const parsed = readPassage(p, key, `지문 ${key}`);
      if (parsed) pmap.set(key, parsed);
    });
  }

  // ── 문제 ──
  const used = new Set<string>();
  obj.questions.forEach((raw, i) => {
    const q = (raw ?? {}) as Record<string, unknown>;
    const label = `문제 ${str(q.id) || `#${i + 1}`}`;
    const body = str(q.body ?? q.question);
    if (!body) { out.errors.push(`${label}: 문제 본문(body)이 비어 있어요`); return; }
    if (body.length > BODY_MAX) { out.errors.push(`${label}: 문제 본문이 너무 길어요 — 긴 글은 지문(passages)으로 빼 주세요`); return; }

    const dRaw = str(q.difficulty);
    const difficulty: Difficulty | undefined =
      (["easy", "medium", "hard"].includes(dRaw) ? (dRaw as Difficulty) : undefined) ?? DIFF_KO[dRaw] ?? LEVEL[str(q.level).toUpperCase()];
    if (!difficulty) { out.errors.push(`${label}: 난이도(difficulty)는 easy/medium/hard 중 하나여야 해요`); return; }

    const type: "multiple" | "short" = str(q.type) === "short" ? "short" : "multiple";
    let options: string[];
    let answer_idx = 0;
    if (type === "short") {
      const a = Array.isArray(q.answers) ? q.answers : typeof q.answer === "string" ? [q.answer] : Array.isArray(q.options) ? q.options : [];
      options = (a as unknown[]).map(str).filter(Boolean);
      if (options.length === 0) { out.errors.push(`${label}: 단답형은 answers(허용 정답)가 1개 이상 있어야 해요`); return; }
    } else {
      options = Array.isArray(q.options) ? (q.options as unknown[]).map(str) : [];
      if (options.length !== 4 || options.some((o) => !o)) { out.errors.push(`${label}: 객관식은 보기(options)가 정확히 4개여야 해요`); return; }
      const a = Number(q.answer ?? q.answer_idx);
      if (!Number.isInteger(a) || a < 0 || a > 3) { out.errors.push(`${label}: 정답(answer)은 0~3 이어야 해요`); return; }
      answer_idx = a;
    }

    const subject = str(q.subject ?? meta.subject);
    const unit = str(q.unit ?? meta.unit);
    const tag = (str(q.tag) || [subject, unit].filter(Boolean).join("·") || "미분류").slice(0, 60);

    let svg: string | null = null;
    if (q.svg) {
      svg = sanitizeSvg(q.svg);
      if (!svg) out.warnings.push(`${label}: 그림(svg)이 올바르지 않아 빼고 가져와요`);
    }

    // 지문 연결: "p1" 같은 id, 또는 지문 객체를 바로
    let passageKey: string | null = null;
    const pref = q.passage ?? q.passageId ?? q.passage_id;
    if (pref && typeof pref === "object") {
      const inline = readPassage(pref as Record<string, unknown>, "", `${label}의 지문`);
      if (!inline) return;
      const k = `inline:${textKey(inline.body)}`;
      if (!pmap.has(k)) pmap.set(k, { ...inline, key: k });
      passageKey = k;
    } else if (pref) {
      const k = str(pref);
      if (!pmap.has(k)) { out.errors.push(`${label}: 지문 '${k}'을(를) passages에서 찾을 수 없어요`); return; }
      passageKey = k;
    }
    if (passageKey) used.add(passageKey);

    out.questions.push({ body, options, answer_idx, difficulty, tag, type, svg, passageKey });
  });

  for (const [k, p] of pmap) {
    if (used.has(k)) out.passages.push(p);
    else if (!k.startsWith("inline:")) out.warnings.push(`지문 ${k}: 이 지문을 쓰는 문제가 없어 빼고 가져와요`);
  }
  return out;
}
