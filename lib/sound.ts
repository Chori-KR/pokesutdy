// 사운드 — Web Audio로 합성한 효과음 + 배틀 BGM (자산 파일 없음, 저작권 자유).
// 포켓몬 울음소리만 PokeAPI cries(ogg)를 재생. 음소거 상태는 localStorage에 저장.

let ctx: AudioContext | null = null;
let muted = false;
let bgmTimer: ReturnType<typeof setTimeout> | null = null;
let bgmOn = false;

if (typeof window !== "undefined") {
  muted = window.localStorage.getItem("ps_muted") === "1";
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// 첫 사용자 제스처에서 호출해 오디오 잠금 해제
export function initAudio() { ac(); }
export function isMuted() { return muted; }
export function setMuted(m: boolean) {
  muted = m;
  if (typeof window !== "undefined") window.localStorage.setItem("ps_muted", m ? "1" : "0");
  if (m) stopBattleBgm();
}

// 단일 톤 (delay초 뒤 시작)
function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.2, delay = 0) {
  const a = ac(); if (!a || muted) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type; o.frequency.value = freq;
  const t = a.currentTime + delay;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

// 노트 시퀀스 [주파수(0=쉼), 길이초]
function seq(notes: [number, number][], type: OscillatorType = "square", vol = 0.2) {
  let d = 0;
  for (const [f, dur] of notes) { if (f > 0) tone(f, dur, type, vol, d); d += dur; }
}

function noise(dur: number, vol = 0.25) {
  const a = ac(); if (!a || muted) return;
  const n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = a.createBufferSource();
  const g = a.createGain();
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  src.buffer = buf; src.connect(g).connect(a.destination); src.start();
}

export const SFX = {
  click: () => seq([[720, 0.045]], "square", 0.14),
  select: () => seq([[520, 0.05], [780, 0.05]], "square", 0.14),
  correct: () => seq([[660, 0.09], [880, 0.09], [1320, 0.14]], "square", 0.16),
  wrong: () => seq([[320, 0.12], [200, 0.18]], "sawtooth", 0.16),
  attack: () => { noise(0.12, 0.18); seq([[180, 0.1]], "square", 0.12); },
  hit: () => noise(0.18, 0.24),
  throwBall: () => seq([[500, 0.06], [700, 0.06], [900, 0.06]], "square", 0.12),
  catchOk: () => seq([[784, 0.11], [988, 0.11], [1319, 0.11], [1568, 0.22]], "square", 0.16),
  catchFail: () => seq([[400, 0.12], [260, 0.2]], "triangle", 0.16),
  buy: () => seq([[988, 0.06], [1319, 0.06], [1568, 0.1]], "square", 0.14),
  levelup: () => seq([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.24]], "square", 0.16),
  evolve: () => seq([[440, 0.12], [554, 0.12], [659, 0.12], [880, 0.12], [1109, 0.28]], "square", 0.16),
};

// 야생 포켓몬 울음소리 (PokeAPI cries)
export function playCry(id: number) {
  if (muted || typeof window === "undefined") return;
  try {
    const au = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`);
    au.volume = 0.5;
    au.play().catch(() => {});
  } catch { /* ogg 미지원 브라우저는 무시 */ }
}

// 배틀 BGM — 간단한 칩튠 루프 (배틀 중에만)
const MEL: [number, number][] = [
  [523, 0.16], [659, 0.16], [784, 0.16], [659, 0.16],
  [587, 0.16], [740, 0.16], [880, 0.32],
  [523, 0.16], [784, 0.16], [1047, 0.16], [784, 0.16],
  [880, 0.16], [740, 0.16], [659, 0.32],
];
const BASS: [number, number][] = [
  [131, 0.32], [131, 0.32], [147, 0.32], [98, 0.32],
  [131, 0.32], [165, 0.32], [147, 0.32], [131, 0.32],
];

// 레이드(보스전) BGM — 단조·저음역의 웅장하고 어두운 루프.
// 느린 템포 + 깊은 베이스 드론 + 사우투스 멜로디로 긴장감을 준다.
const MEL_RAID: [number, number][] = [
  [220, 0.22], [262, 0.22], [330, 0.22], [294, 0.22],   // A C E D
  [262, 0.22], [247, 0.22], [220, 0.44],                // C B A(길게)
  [220, 0.22], [330, 0.22], [392, 0.22], [349, 0.22],   // A E G F
  [330, 0.22], [294, 0.22], [262, 0.44],                // E D C(길게)
];
const BASS_RAID: [number, number][] = [
  [55, 0.44], [55, 0.44], [73, 0.44], [49, 0.44],       // A1 A1 D2 G1
  [55, 0.44], [87, 0.44], [65, 0.44], [55, 0.44],       // A1 F2 C2 A1
];
// 낮게 깔리는 드론(장중함)
const DRONE_RAID: [number, number][] = [[110, 1.76], [110, 1.76]]; // A2 지속


function loopBgm(loopLen: number, play: () => void) {
  bgmOn = true;
  play();
  bgmTimer = setTimeout(function next() {
    if (!bgmOn || muted) return;
    play();
    bgmTimer = setTimeout(next, loopLen * 1000 - 30);
  }, loopLen * 1000 - 30);
}

export function startBattleBgm() {
  const a = ac(); if (!a || muted || bgmOn) return;
  const loopLen = MEL.reduce((s, [, d]) => s + d, 0);
  loopBgm(loopLen, () => { seq(MEL, "square", 0.07); seq(BASS, "triangle", 0.09); });
}

export function startRaidBgm() {
  const a = ac(); if (!a || muted || bgmOn) return;
  const loopLen = MEL_RAID.reduce((s, [, d]) => s + d, 0);
  loopBgm(loopLen, () => {
    seq(MEL_RAID, "sawtooth", 0.055);   // 어두운 멜로디
    seq(BASS_RAID, "triangle", 0.13);   // 깊고 묵직한 베이스
    seq(DRONE_RAID, "sine", 0.07);      // 저음 드론(웅장함)
  });
}

export function stopBattleBgm() {
  bgmOn = false;
  if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; }
}
