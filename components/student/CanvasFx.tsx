"use client";

import { useEffect, useRef } from "react";

// 캔버스 파티클 엔진 — 타입별(15종) 스타일 + 난이도별(쉬움/보통/어려움) 규모로 기술 이펙트.
export interface FxTrigger { type: string; dir: "fwd" | "back"; diff: string; key: number }

interface P {
  x: number; y: number; vx: number; vy: number; life: number; max: number;
  size: number; color: string; shape: string; grav: number; rot: number; spin: number;
}

const PALETTE: Record<string, string[]> = {
  fire: ["#ff5722", "#ff9800", "#ffd54a", "#ffeb3b"],
  water: ["#4fc3f7", "#2196f3", "#0d47a1", "#b3e5fc"],
  electric: ["#fff176", "#ffd600", "#ffffff", "#ffee58"],
  grass: ["#66bb6a", "#2e7d32", "#a5d6a7", "#9ccc65"],
  ice: ["#b3e5fc", "#4dd0e1", "#e0f7fa", "#81d4fa"],
  fighting: ["#ef5350", "#b71c1c", "#ff8a80", "#ffffff"],
  poison: ["#ab47bc", "#6a1b9a", "#ce93d8", "#e040fb"],
  ground: ["#8d6e63", "#5d4037", "#d7ccc8", "#a1887f"],
  psychic: ["#f06292", "#ec407a", "#f8bbd0", "#ff80ab"],
  bug: ["#9ccc65", "#7cb342", "#c5e1a5", "#aed581"],
  rock: ["#8d6e63", "#6d4c41", "#bcaaa4", "#a1887f"],
  ghost: ["#7e57c2", "#4527a0", "#b39ddb", "#9575cd"],
  dragon: ["#7e57c2", "#5e35b1", "#9575cd", "#b388ff"],
  fairy: ["#f48fb1", "#f06292", "#fce4ec", "#ff80ab"],
  normal: ["#ffffff", "#eeeeee", "#ffd54a", "#e0e0e0"],
};

const TYPE: Record<string, { behavior: string; shape: string }> = {
  fire: { behavior: "rise", shape: "circle" },
  poison: { behavior: "rise", shape: "bubble" },
  grass: { behavior: "fall", shape: "leaf" },
  ice: { behavior: "fall", shape: "shard" },
  rock: { behavior: "fall", shape: "rock" },
  water: { behavior: "burst", shape: "drop" },
  fighting: { behavior: "burst", shape: "shard" },
  ground: { behavior: "burst", shape: "rock" },
  bug: { behavior: "burst", shape: "circle" },
  normal: { behavior: "burst", shape: "star" },
  electric: { behavior: "spark", shape: "line" },
  psychic: { behavior: "ring", shape: "circle" },
  dragon: { behavior: "ring", shape: "star" },
  ghost: { behavior: "float", shape: "wisp" },
  fairy: { behavior: "float", shape: "star" },
};

export function isTypeFx(kind: string) { return kind in TYPE; }

export default function CanvasFx({ trigger }: { trigger: FxTrigger | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const parts = useRef<P[]>([]);
  const raf = useRef<number>(0);
  const lastKey = useRef<number>(-1);
  const flash = useRef<{ c: string; life: number } | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!trigger || trigger.key === lastKey.current) return;
    lastKey.current = trigger.key;
    spawn(trigger);
    if (!raf.current) loop();
  });

  function sizeCanvas() {
    const cv = ref.current; if (!cv) return null;
    const parent = cv.parentElement; if (!parent) return null;
    const w = parent.clientWidth, h = parent.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext("2d"); ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function spawn(t: FxTrigger) {
    const info = sizeCanvas(); if (!info) return;
    const { w, h } = info;
    const tx = t.dir === "fwd" ? w * 0.62 : w * 0.18;
    const ty = t.dir === "fwd" ? h * 0.22 : h * 0.5;
    const pal = PALETTE[t.type] ?? PALETTE.normal;
    const cfg = TYPE[t.type] ?? TYPE.normal;
    const mult = t.diff === "hard" ? 1.9 : t.diff === "medium" ? 1.35 : 1;
    const n = Math.round((cfg.behavior === "ring" ? 16 : 22) * mult);
    if (t.diff === "hard") flash.current = { c: pal[0], life: 9 };
    for (let i = 0; i < n; i++) spawnOne(cfg.behavior, cfg.shape, tx, ty, pal, mult, i, n);
    if (t.diff !== "easy") {
      parts.current.push({ x: tx, y: ty, vx: 0, vy: 0, life: t.diff === "hard" ? 26 : 18, max: t.diff === "hard" ? 26 : 18, size: 6, color: pal[0], shape: "shock", grav: 0, rot: 0, spin: 0 });
    }
  }

  function spawnOne(behavior: string, shape: string, tx: number, ty: number, pal: string[], mult: number, i: number, n: number) {
    const color = pal[Math.floor(Math.random() * pal.length)];
    const size = (2 + Math.random() * 3) * (mult * 0.7 + 0.5);
    const spd = mult * 0.7 + 0.5;
    let x = tx, y = ty, vx = 0, vy = 0, grav = 0, life = 34 + Math.random() * 22;
    if (behavior === "rise") { x = tx + (Math.random() - 0.5) * 30; y = ty + Math.random() * 10; vx = (Math.random() - 0.5) * 1.2; vy = -(1.4 + Math.random() * 2.4) * spd; grav = 0.05; }
    else if (behavior === "fall") { x = tx + (Math.random() - 0.5) * 64; y = ty - 30 - Math.random() * 40; vx = (Math.random() - 0.5) * 1.2; vy = (0.8 + Math.random() * 1.8) * spd; grav = 0.06; }
    else if (behavior === "burst") { const a = Math.random() * Math.PI * 2; const v = (1.6 + Math.random() * 3.4) * spd; vx = Math.cos(a) * v; vy = Math.sin(a) * v; grav = 0.09; }
    else if (behavior === "spark") { const a = Math.random() * Math.PI * 2; const v = (3 + Math.random() * 5) * spd; vx = Math.cos(a) * v; vy = Math.sin(a) * v; life = 16 + Math.random() * 12; }
    else if (behavior === "ring") { const a = (i / n) * Math.PI * 2; const v = (1.4 + Math.random() * 0.8) * spd; vx = Math.cos(a) * v; vy = Math.sin(a) * v; x = tx + Math.cos(a) * 6; y = ty + Math.sin(a) * 6; }
    else { x = tx + (Math.random() - 0.5) * 44; y = ty + (Math.random() - 0.5) * 44; vx = (Math.random() - 0.5) * 0.5; vy = -(0.2 + Math.random() * 0.7); grav = -0.004; life = 44 + Math.random() * 30; }
    parts.current.push({ x, y, vx, vy, life, max: life, size, color, shape, grav, rot: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.3 });
  }

  function drawStar(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.5 : s * 1.3; const a = (Math.PI / 5) * i - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
  }

  function draw(ctx: CanvasRenderingContext2D, p: P) {
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
    ctx.shadowBlur = 8; ctx.shadowColor = p.color;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    const s = p.size;
    switch (p.shape) {
      case "line": ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s * 1.6, 0); ctx.lineTo(s * 1.6, 0); ctx.stroke(); break;
      case "leaf": ctx.beginPath(); ctx.ellipse(0, 0, s * 1.4, s * 0.6, 0, 0, Math.PI * 2); ctx.fill(); break;
      case "shard": ctx.beginPath(); ctx.moveTo(0, -s * 1.6); ctx.lineTo(s, s); ctx.lineTo(-s, s); ctx.closePath(); ctx.fill(); break;
      case "rock": ctx.fillRect(-s, -s, s * 2, s * 2); break;
      case "star": drawStar(ctx, s); break;
      case "bubble": ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.stroke(); break;
      case "wisp": ctx.beginPath(); ctx.arc(0, 0, s * 1.2, 0, Math.PI * 2); ctx.fill(); break;
      case "shock": ctx.globalAlpha = a * 0.7; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, s + (1 - a) * 48, 0, Math.PI * 2); ctx.stroke(); break;
      default: ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function loop() {
    const cv = ref.current; const ctx = cv?.getContext("2d");
    if (!cv || !ctx) { raf.current = 0; return; }
    const w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0, 0, w, h);
    if (flash.current) {
      ctx.globalAlpha = (flash.current.life / 9) * 0.45; ctx.fillStyle = flash.current.c;
      ctx.fillRect(0, 0, w, h); flash.current.life--;
      if (flash.current.life <= 0) flash.current = null;
    }
    const arr = parts.current;
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i]; p.vy += p.grav; p.x += p.vx; p.y += p.vy; p.rot += p.spin; p.life--;
      if (p.life <= 0) { arr.splice(i, 1); continue; }
      draw(ctx, p);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (arr.length > 0 || flash.current) raf.current = requestAnimationFrame(loop);
    else raf.current = 0;
  }

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 6 }} />;
}
