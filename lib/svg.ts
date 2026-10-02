// 문제 그림(SVG) 안전 처리.
//
// 화면에서는 <img src="data:image/svg+xml,…">로만 그리므로 스크립트가 실행될 수는 없지만,
// 저장 전에 한 번 더 걸러 둔다(다른 곳에 옮겨 쓸 때를 대비).
//  - <svg …> 로 시작하는 것만, 30KB 이하
//  - <script>, <foreignObject>, on…= 이벤트 속성, 외부 링크(href) 제거
//  - xmlns가 없으면 붙인다 (없으면 <img>로 그릴 때 아무것도 안 보임)

export const SVG_MAX_BYTES = 30_000;

export function sanitizeSvg(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (!s) return null;
  if (!/^<svg[\s>]/i.test(s) || !/<\/svg>\s*$/i.test(s)) return null;
  s = s
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script[^>]*\/>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:xlink:)?href\s*=\s*("(?!#)[^"]*"|'(?!#)[^']*')/gi, "");
  s = withXmlns(s);
  if (new TextEncoder().encode(s).length > SVG_MAX_BYTES) return null;
  return s;
}

export function withXmlns(svg: string): string {
  return /^<svg[^>]*\sxmlns\s*=/i.test(svg) ? svg : svg.replace(/^<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
}
