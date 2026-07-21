"use client";

import katex from "katex";
import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";

// 문제·보기 안의 수식을 KaTeX로 렌더한다.
//  - $$...$$ : 별도 줄(display) 수식,  $...$ : 문장 속(inline) 수식
//  - 구분자($)를 아예 안 쓴 텍스트면, 2^3 · x^{2} · H_2 같은 지수/아래첨자 표현을
//    자동으로 $…$로 감싸 렌더 (생성형 AI가 2^3처럼 써도 오른쪽 위로 올라감)
//  - 수식이 아닌 부분은 HTML 이스케이프 → 안전.

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// 지수(^)/아래첨자(_)를 가진 토큰을 $…$로 감싼다 (구분자 미사용 텍스트 전용)
function autoWrap(text: string): string {
  if (text.includes("$")) return text; // 이미 LaTeX 구분자 사용 → 그대로 존중
  return text.replace(
    /([A-Za-z0-9]+(?:[\^_](?:\{[^}]*\}|[A-Za-z0-9]+))+)/g,
    (m) => `$${m}$`
  );
}

function toHtml(input: string): string {
  const text = autoWrap(input);
  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    if (text[i] === "$") {
      const display = text[i + 1] === "$";
      const delim = display ? "$$" : "$";
      const end = text.indexOf(delim, i + delim.length);
      if (end === -1) { out += escapeHtml(text.slice(i)); break; }
      const latex = text.slice(i + delim.length, end);
      try {
        out += katex.renderToString(latex, { throwOnError: false, displayMode: display });
      } catch {
        out += escapeHtml(delim + latex + delim);
      }
      i = end + delim.length;
    } else {
      const next = text.indexOf("$", i);
      out += escapeHtml(next === -1 ? text.slice(i) : text.slice(i, next));
      i = next === -1 ? n : next;
    }
  }
  return out;
}

export default function MathText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const src = typeof children === "string" ? children : String(children ?? "");
  const html = useMemo(() => toHtml(src), [src]);
  return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
