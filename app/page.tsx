import Link from "next/link";
import { S } from "@/lib/styles";
import Brand from "@/components/Brand";

export default function Landing() {
  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 26, marginBottom: 4 }}>포켓 스터디</div>
        <div style={{ fontSize: 12, color: "#9fd8ff", marginBottom: 26 }}>공부하고, 배틀하고, 도감을 완성하자!</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 420 }}>
          <Link href="/student" style={{ ...S.primaryBtn, padding: "26px 10px", fontSize: 17, textAlign: "center", textDecoration: "none", display: "block" }}>
            학생으로 입장
            <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85 }}>학급 코드로 로그인</div>
          </Link>
          <Link href="/teacher" style={{ ...S.primaryBtn, background: "#3d6fd9", padding: "26px 10px", fontSize: 17, textAlign: "center", textDecoration: "none", display: "block" }}>
            교사로 입장
            <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85 }}>문제 은행 관리</div>
          </Link>
        </div>
        <div style={{ fontSize: 11, color: "#9fb0d8", marginTop: 22, textAlign: "center", lineHeight: 1.7 }}>
          학생은 선생님께 받은 학급 코드 + 닉네임만으로 가입해요.<br />개인정보는 수집하지 않아요.
        </div>
      </div>
      <div style={{ padding: "12px 0 20px", textAlign: "center" }}>
        <Brand height={30} color="#c7cdf0" />
      </div>
    </div>
  );
}
