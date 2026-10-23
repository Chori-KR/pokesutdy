import { readFileSync } from "fs";
import path from "path";
import { parseBank, Difficulty } from "@/lib/bankImport";
import { libQid, libPid, LibIndex } from "@/lib/libraryShared";

// 서버에서 기본 문제 은행(public/library — scripts/build-library.mjs가 만듦)을 읽는다.
// 화면의 JSON 가져오기와 같은 parseBank 규칙으로 읽어 한 번만 메모리에 둔다(배포마다 새로).
// next.config.mjs 의 outputFileTracingIncludes 로 API 함수에 파일이 함께 실린다.

export interface LibQuestion {
  id: string; body: string; options: string[]; answer_idx: number; difficulty: Difficulty;
  tag: string; type: "multiple" | "short"; svg: string | null; passageId: string | null;
}
export interface LibPassage { id: string; title: string; body: string; source: string; svg: string | null }

interface Library {
  questions: LibQuestion[];
  byId: Map<string, LibQuestion>;
  byTag: Map<string, LibQuestion[]>;
  passages: Map<string, LibPassage>;
}

let cache: Library | null = null;

export function getLibrary(): Library {
  if (cache) return cache;
  const lib: Library = { questions: [], byId: new Map(), byTag: new Map(), passages: new Map() };
  const dir = path.join(process.cwd(), "public", "library");
  let index: LibIndex;
  try {
    index = JSON.parse(readFileSync(path.join(dir, "index.json"), "utf8"));
  } catch {
    return lib; // 기본 문제 은행이 없는 배포 — 학급 문제만으로 동작 (다음 요청 때 다시 시도)
  }
  for (const [file, src] of Object.entries(index.files ?? {})) {
    let text: string;
    try { text = readFileSync(path.join(dir, file), "utf8"); } catch { continue; }
    const bank = parseBank(src, text);
    for (const p of bank.passages) {
      const id = libPid(src, p.key);
      lib.passages.set(id, { id, title: p.title, body: p.body, source: p.source, svg: p.svg });
    }
    for (const q of bank.questions) {
      if (!q.srcId) continue;
      const lq: LibQuestion = {
        id: libQid(q.srcId), body: q.body, options: q.options, answer_idx: q.answer_idx, difficulty: q.difficulty,
        tag: q.tag, type: q.type, svg: q.svg, passageId: q.passageKey ? libPid(src, q.passageKey) : null,
      };
      if (lib.byId.has(lq.id)) continue;
      lib.questions.push(lq);
      lib.byId.set(lq.id, lq);
      (lib.byTag.get(lq.tag) ?? lib.byTag.set(lq.tag, []).get(lq.tag)!).push(lq);
    }
  }
  cache = lib;
  return lib;
}

// 단원 목록(태그)에 든 기본 문제 — 숨긴 것·(평소 출제면) 레이드 전용은 뺀다
export function libraryQuestionsFor(tags: Iterable<string>, opts: { hidden: Set<string>; raid: Set<string>; raidMode: boolean }): LibQuestion[] {
  const lib = getLibrary();
  const out: LibQuestion[] = [];
  if (opts.raidMode) {
    for (const id of opts.raid) {
      const q = lib.byId.get(id);
      if (q && !opts.hidden.has(id)) out.push(q);
    }
    return out;
  }
  for (const t of new Set(tags))
    for (const q of lib.byTag.get(t) ?? [])
      if (!opts.hidden.has(q.id) && !opts.raid.has(q.id)) out.push(q);
  return out;
}

export function libraryMedia(id: string) {
  const lib = getLibrary();
  const q = lib.byId.get(id);
  if (!q) return null;
  const p = q.passageId ? lib.passages.get(q.passageId) ?? null : null;
  return { svg: q.svg, passage: p };
}
