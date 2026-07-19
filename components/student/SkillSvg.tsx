"use client";

import { useId, ReactElement } from "react";

// 타입×난이도별 정교한 스킬 SVG(viewBox 0 0 100 100). 없는 조합은 null → 기본 글리프로 폴백.
// defs(gradient/blur/dropshadow) + 비대칭 path + 다중 레이어로 타격감·속도감 표현.
export function hasSkill(type: string, diff: string) {
  return !!REGISTRY[`${type}-${diff}`];
}

export default function SkillSvg({ type, diff, size = 120 }: { type: string; diff: string; size?: number }) {
  const uid = useId().replace(/[:]/g, "");
  const render = REGISTRY[`${type}-${diff}`];
  if (!render) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
      {render(uid)}
    </svg>
  );
}

type R = (id: string) => ReactElement;
const REGISTRY: Record<string, R> = {
  // ── 노말 ─────────────────────────────
  "normal-easy": (id) => (
    <>
      <g stroke="#c9c9c9" strokeWidth="6" strokeLinecap="round" opacity="0.55">
        <line x1="6" y1="26" x2="34" y2="26" />
        <line x1="4" y1="50" x2="30" y2="50" />
        <line x1="8" y1="74" x2="36" y2="74" />
      </g>
      <g fill="#a9a9a9" opacity="0.5">
        <circle cx="60" cy="50" r="26" />
        <circle cx="66" cy="46" r="18" />
        <circle cx="54" cy="55" r="15" />
      </g>
      <circle cx="62" cy="49" r="9" fill="#fff" opacity="0.7" />
    </>
  ),
  "normal-medium": (id) => (
    <>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#cfd6e0" />
          <stop offset="1" stopColor="#cfd6e0" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}s`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#9aa7bd" floodOpacity="0.8" />
        </filter>
      </defs>
      <g fill={`url(#${id}g)`} filter={`url(#${id}s)`}>
        <path d="M12 78 C40 60 66 40 88 14 C74 44 48 66 20 84 Z" />
        <path d="M24 84 C50 66 74 46 92 26 C80 52 56 72 30 88 Z" opacity="0.7" />
        <path d="M8 62 C34 48 58 30 80 8 C68 34 44 54 18 70 Z" opacity="0.5" />
      </g>
    </>
  ),
  "normal-hard": (id) => (
    <>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}gl`} x="-20%" y="-120%" width="140%" height="340%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g filter={`url(#${id}gl)`}>
        <rect x="0" y="40" width="100" height="20" fill="#ff8a3d" opacity="0.55" />
        <rect x="0" y="44" width="100" height="12" fill="#b768ff" opacity="0.5" />
      </g>
      <rect x="0" y="46" width="100" height="8" fill={`url(#${id}b)`} />
      <rect x="0" y="48" width="100" height="4" fill="#fff" />
      <g stroke="#ffd9a8" strokeWidth="2" fill="none" opacity="0.8">
        <path d="M20 50 C30 34 42 34 50 50 C58 66 70 66 80 50" />
        <path d="M20 50 C30 66 42 66 50 50 C58 34 70 34 80 50" opacity="0.6" />
      </g>
    </>
  ),

  // ── 불 ─────────────────────────────
  "fire-easy": () => (
    <g>
      {[[50, 78, 1], [30, 70, 0.85], [70, 70, 0.85], [40, 58, 0.7], [62, 56, 0.7]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M0 -18 C8 -6 9 4 0 12 C-9 4 -8 -6 0 -18 Z" fill="#e23b1e" />
          <path d="M0 -11 C4 -3 5 3 0 9 C-5 3 -4 -3 0 -11 Z" fill="#ffcf3a" />
        </g>
      ))}
    </g>
  ),
  "fire-medium": (id) => (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd23f" />
          <stop offset="0.6" stopColor="#ff6a1e" />
          <stop offset="1" stopColor="#d61f0a" />
        </linearGradient>
      </defs>
      <path d="M6 92 C34 78 70 46 96 8 C86 40 60 66 34 84 C50 74 74 50 90 22 C74 54 44 78 6 92 Z" fill={`url(#${id}f)`} />
      <path d="M18 88 C40 74 66 50 86 24 C74 50 52 70 30 84 Z" fill="#ffd23f" opacity="0.8" />
      <path d="M12 90 C30 80 52 62 70 40" stroke="#fff3c4" strokeWidth="2" fill="none" opacity="0.7" />
    </>
  ),
  "fire-hard": (id) => (
    <>
      <defs>
        <radialGradient id={`${id}c`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#ffd23f" />
          <stop offset="0.75" stopColor="#ff5a1e" />
          <stop offset="1" stopColor="#7a1206" />
        </radialGradient>
      </defs>
      <polygon fill="#c0290c" points="50,2 60,20 82,14 72,36 96,44 74,54 86,78 62,70 56,96 44,72 22,84 30,58 6,50 28,42 16,18 40,26" opacity="0.9" />
      <circle cx="50" cy="50" r="34" fill={`url(#${id}c)`} />
      <circle cx="50" cy="50" r="14" fill="#fff" opacity="0.9" />
    </>
  ),

  // ── 물 ─────────────────────────────
  "water-easy": (id) => (
    <>
      <g stroke="#2f8fe0" strokeWidth="8" strokeLinecap="round" fill="none">
        <path d="M6 82 C34 66 40 40 66 18" opacity="0.9" />
        <path d="M16 88 C44 74 58 46 88 30" opacity="0.7" />
      </g>
      <g fill="#7fc4f2">
        <circle cx="70" cy="20" r="5" /><circle cx="84" cy="34" r="4" /><circle cx="58" cy="30" r="3" /><circle cx="40" cy="50" r="3.5" />
      </g>
    </>
  ),
  "water-medium": (id) => (
    <>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8ecff" />
          <stop offset="1" stopColor="#1f7fd6" />
        </linearGradient>
      </defs>
      <path d="M4 82 C4 50 26 26 56 26 C40 34 34 52 46 60 C58 68 74 58 74 44 C86 58 82 82 58 88 C34 94 8 90 4 82 Z" fill={`url(#${id}w)`} />
      <path d="M50 30 C44 36 42 46 50 52 C40 50 38 38 50 30 Z" fill="#fff" />
      <path d="M70 46 C80 56 78 74 62 82" stroke="#eafaff" strokeWidth="2.5" fill="none" opacity="0.8" />
    </>
  ),
  "water-hard": (id) => (
    <>
      <defs>
        <linearGradient id={`${id}j`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f7fd6" />
          <stop offset="1" stopColor="#bff0ff" />
        </linearGradient>
        <filter id={`${id}m`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <ellipse cx="50" cy="46" rx="34" ry="44" fill="#fff" opacity="0.35" filter={`url(#${id}m)`} />
      <g fill="none" stroke={`url(#${id}j)`} strokeWidth="11" strokeLinecap="round">
        <path d="M36 96 C36 70 64 60 64 40 C64 20 40 14 42 2" />
        <path d="M64 96 C64 70 36 60 36 40 C36 20 60 14 58 2" opacity="0.85" />
      </g>
      <g fill="#eafaff" opacity="0.9"><circle cx="50" cy="8" r="4" /><circle cx="43" cy="20" r="3" /><circle cx="58" cy="24" r="3" /></g>
    </>
  ),

  // ── 전기 ─────────────────────────────
  "electric-easy": (id) => (
    <>
      <polyline points="16,20 40,42 26,54 52,74 40,86" fill="none" stroke="#ffd400" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
      {[[40, 42], [26, 54], [52, 74]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 1} L${x + 7} ${y} L${x + 2} ${y + 1} L${x} ${y + 7} L${x - 2} ${y + 1} L${x - 7} ${y} L${x - 2} ${y - 1} Z`} fill="#fff59d" />
      ))}
    </>
  ),
  "electric-medium": (id) => (
    <>
      <defs>
        <filter id={`${id}n`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#fff200" floodOpacity="0.9" />
        </filter>
      </defs>
      <g filter={`url(#${id}n)`}>
        <polygon points="52,2 40,40 58,38 30,98 46,50 30,52 52,2" fill="#ffe600" />
        <polygon points="58,38 74,60 62,58 70,84 52,54 62,52" fill="#ffe600" opacity="0.85" />
        <polygon points="40,40 24,58 34,58 26,78 44,50 34,50" fill="#ffe600" opacity="0.7" />
      </g>
    </>
  ),
  "electric-hard": (id) => (
    <>
      <defs>
        <radialGradient id={`${id}bg`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#5b2a8c" stopOpacity="0.7" />
          <stop offset="1" stopColor="#1a0b33" stopOpacity="0.85" />
        </radialGradient>
        <filter id={`${id}gl`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8fd4ff" floodOpacity="0.9" />
        </filter>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}bg)`} />
      <g filter={`url(#${id}gl)`}>
        <polygon points="54,0 42,34 56,32 36,68 52,64 34,100 62,58 48,62 66,30 52,34 62,0" fill="#eaf6ff" />
        <g stroke="#bfe6ff" strokeWidth="1.4" fill="none" opacity="0.85">
          <path d="M50 30 L34 40 L40 48" /><path d="M52 60 L70 66 L64 74" /><path d="M46 46 L28 52" /><path d="M58 40 L76 34" />
        </g>
      </g>
    </>
  ),
};
