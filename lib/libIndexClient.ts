"use client";

import { useEffect, useState } from "react";
import { parseBank, ParsedBank, ParsedPassage, ParsedQuestion } from "@/lib/bankImport";
import { LibIndex, LibIndexUnit, libQid } from "@/lib/libraryShared";

// 교사 화면에서 기본 문제 은행(public/library) 읽기 — 목록은 한 번만 받아 두고, 문제는 단원을 열 때 받는다.

let indexP: Promise<LibIndex | null> | null = null;
export function loadLibIndex(): Promise<LibIndex | null> {
  indexP ??= fetch("/library/index.json")
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .then((d) => { if (!d) indexP = null; return d; }); // 실패하면 다음에 다시 시도
  return indexP;
}

export function useLibIndex() {
  const [index, setIndex] = useState<LibIndex | null>(null);
  useEffect(() => { loadLibIndex().then(setIndex); }, []);
  return index;
}

export const allLibTags = (index: LibIndex) => index.bands.flatMap((b) => b.subjects.flatMap((s) => s.units.map((u) => u.tag)));
export const libUnitMap = (index: LibIndex | null) => {
  const m = new Map<string, LibIndexUnit>();
  for (const b of index?.bands ?? []) for (const s of b.subjects) for (const u of s.units) m.set(u.tag, u);
  return m;
};

export interface ClientLibQuestion extends ParsedQuestion { id: string; passage: ParsedPassage | null; file: string }

const bankCache = new Map<string, Promise<ParsedBank | null>>();
function loadBank(file: string, src: string) {
  let p = bankCache.get(file);
  if (!p) {
    p = fetch(`/library/${file}`).then(async (r) => (r.ok ? parseBank(src, await r.text()) : null)).catch(() => null);
    bankCache.set(file, p);
  }
  return p;
}

export async function loadUnitQuestions(index: LibIndex, unit: LibIndexUnit): Promise<ClientLibQuestion[]> {
  const out: ClientLibQuestion[] = [];
  for (const f of unit.files) {
    const b = await loadBank(f, index.files[f] ?? f);
    if (!b) continue;
    for (const q of b.questions) {
      if (q.tag !== unit.tag || !q.srcId) continue;
      out.push({ ...q, id: libQid(q.srcId), passage: b.passages.find((p) => p.key === q.passageKey) ?? null, file: index.files[f] ?? f });
    }
  }
  return out;
}
