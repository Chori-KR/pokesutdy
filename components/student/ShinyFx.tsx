// 이로치 반짝임 효과 — 부모(position:relative/absolute) 위에 별들이 반짝인다.
const STARS = [
  { top: "2%", left: "10%", delay: "0s", size: 18 },
  { top: "14%", left: "80%", delay: "0.5s", size: 13 },
  { top: "58%", left: "4%", delay: "0.9s", size: 13 },
  { top: "74%", left: "72%", delay: "0.3s", size: 17 },
  { top: "38%", left: "90%", delay: "0.7s", size: 11 },
  { top: "50%", left: "44%", delay: "1.1s", size: 12 },
];

export default function ShinyFx() {
  return (
    <>
      {STARS.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute", top: s.top, left: s.left, fontSize: s.size,
            animation: `sparkle 1.4s ease-in-out ${s.delay} infinite`,
            pointerEvents: "none", zIndex: 4, filter: "drop-shadow(0 0 3px #fff)",
          }}
        >
          ✨
        </span>
      ))}
    </>
  );
}
