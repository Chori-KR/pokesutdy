"use client";

import { useEffect, useState } from "react";
import MathText from "@/components/MathText";
import { ApiQuestion, QuestionMediaData, PassageData } from "@/lib/types";
import { withXmlns } from "@/lib/svg";

// 문제에 딸린 그림(SVG)과 지문을 보여주는 조각들 (배틀·레이드·문제풀이 공용).
//
// 그림은 <img src="data:image/svg+xml,…"> 로 그린다 — 이 방식은 SVG 안의 스크립트·외부 링크가
// 실행되지 않아 안전하다. 어두운 화면에서도 선이 보이도록 항상 흰 카드 위에 올린다.

export function SvgImage({ svg, maxHeight = 260 }: { svg: string; maxHeight?: number }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 8, margin: "0 0 10px", textAlign: "center", border: "1px solid var(--line)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(withXmlns(svg.trim()))}`}
        alt="문제 그림"
        style={{ maxWidth: "100%", maxHeight, height: "auto", display: "inline-block" }}
      />
    </div>
  );
}

// 지문 카드: 제목 · 본문(줄바꿈 유지) · 그림 · 출처.
// maxHeight를 주면 그 높이 안에서 따로 스크롤 (문제를 풀며 지문을 다시 볼 때 화면을 다 차지하지 않게).
export function PassageBox({ passage, maxHeight }: { passage: PassageData; maxHeight?: string }) {
  return (
    <div
      style={{
        background: "var(--card-2, rgba(127,127,127,0.08))", border: "1px solid var(--line)", borderRadius: 12,
        padding: "10px 12px", marginBottom: 10, maxHeight, overflowY: maxHeight ? "auto" : undefined,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "#5b7a99", marginBottom: 6 }}>
        📖 지문{passage.title ? ` · ${passage.title}` : ""}
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "keep-all", overflowWrap: "anywhere" }}>
        <MathText>{passage.body}</MathText>
      </div>
      {passage.svg && <div style={{ marginTop: 10 }}><SvgImage svg={passage.svg} /></div>}
      {passage.source && (
        <div style={{ fontSize: 10.5, color: "var(--ink-2)", marginTop: 8, textAlign: "right" }}>출처: {passage.source}</div>
      )}
    </div>
  );
}

// ── 지문·그림 받아오기 (한 번 받은 것은 기억) ──
const mediaCache = new Map<string, QuestionMediaData>();   // 문제 id → 그림·지문
const passageCache = new Map<string, PassageData>();       // 지문 id → 지문 (같은 지문 문제끼리 재사용)
const EMPTY: QuestionMediaData = { svg: null, passage: null };

export const needsMedia = (q: Pick<ApiQuestion, "has_svg" | "passage_id">) => !!q.has_svg || !!q.passage_id;

function cached(q: ApiQuestion): QuestionMediaData | undefined {
  if (!needsMedia(q)) return EMPTY;
  const hit = mediaCache.get(q.id);
  if (hit) return hit;
  // 그림 없는 문제이고 같은 지문을 이미 받았으면 다시 안 받는다
  if (!q.has_svg && q.passage_id && passageCache.has(q.passage_id))
    return { svg: null, passage: passageCache.get(q.passage_id)! };
  return undefined;
}

export async function fetchMedia(q: ApiQuestion): Promise<QuestionMediaData> {
  const hit = cached(q);
  if (hit) return hit;
  try {
    const r = await fetch(`/api/question/media?qid=${encodeURIComponent(q.id)}`);
    if (!r.ok) return EMPTY;
    const m = (await r.json()) as QuestionMediaData;
    const media = { svg: m.svg ?? null, passage: m.passage ?? null };
    mediaCache.set(q.id, media);
    if (media.passage) passageCache.set(media.passage.id, media.passage);
    return media;
  } catch {
    return EMPTY; // 못 받아도 문제는 풀 수 있게
  }
}

// 지금 문제의 그림·지문. 받는 중이면 null.
export function useQuestionMedia(q: ApiQuestion | null): QuestionMediaData | null {
  const [state, setState] = useState<{ id: string; media: QuestionMediaData } | null>(null);
  useEffect(() => {
    if (!q) return;
    const hit = cached(q);
    if (hit) { setState({ id: q.id, media: hit }); return; }
    let alive = true;
    fetchMedia(q).then((media) => { if (alive) setState({ id: q.id, media }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id]);
  if (!q) return null;
  if (state?.id === q.id) return state.media;
  return cached(q) ?? null;
}
