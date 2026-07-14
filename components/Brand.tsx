// 초리쌤 교수학습콘텐츠 브랜드 (시그니처 이미지 + 이름)
// 첫 화면과 교사 관리 페이지에 노출.
export default function Brand({
  height = 40,
  color = "#2c2c34",
  align = "center",
}: {
  height?: number;
  color?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand.png"
        alt="초리쌤 교수학습콘텐츠"
        style={{ height, width: "auto", display: "block" }}
      />
      <span style={{ fontSize: Math.round(height * 0.4), fontWeight: 700, color, letterSpacing: -0.3 }}>
        초리쌤 교수학습콘텐츠
      </span>
    </div>
  );
}
