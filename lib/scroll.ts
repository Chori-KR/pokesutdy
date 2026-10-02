// 배틀·레이드에서 문제 ↔ 배틀 장면 사이를 자동으로 오가게 하는 스크롤 도우미.
// 이미 화면에 다 보이면 움직이지 않으므로(큰 화면·짧은 문제) 불필요하게 흔들리지 않는다.
export function revealEl(el: HTMLElement | null | undefined) {
  if (!el || typeof window === "undefined") return;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  if (r.top >= 0 && r.bottom <= vh) return; // 이미 다 보임
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  // 화면보다 크거나 위쪽으로 잘려 있으면 윗부분부터, 아래로 잘려 있으면 아랫부분까지 보이게
  const block: ScrollLogicalPosition = r.height > vh || r.top < 0 ? "start" : "end";
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block });
}
