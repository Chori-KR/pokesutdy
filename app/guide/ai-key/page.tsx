import Link from "next/link";

export const metadata = { title: "AI 키 발급 가이드 · 포켓 스터디" };

const box: React.CSSProperties = {
  background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10,
  padding: "14px 16px", marginBottom: 12, lineHeight: 1.8,
};

// 5분 키 발급 가이드 (명세 §5.3) — 무료인 Google Gemini 기준.
export default function AiKeyGuide() {
  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#2c2c34", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif", padding: "24px 16px", maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>🤖 AI 키 발급 가이드 (약 5분)</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 18 }}>
        AI 문제 생성은 선생님 본인의 API 키로 동작해요. <b>Google Gemini는 무료</b>로 키를 만들 수
        있어서 가장 추천합니다. 무료 등급으로도 학급 문제 생성에는 충분해요.
      </p>

      <div style={box}>
        <b>1단계 — Google AI Studio 접속</b>
        <div style={{ fontSize: 13, color: "#444" }}>
          브라우저에서 <a href="https://aistudio.google.com/apikey" target="_blank" style={{ color: "#3d6fd9" }}>aistudio.google.com/apikey</a> 로
          이동한 뒤, 학교/개인 Google 계정으로 로그인하세요.
        </div>
      </div>

      <div style={box}>
        <b>2단계 — API 키 만들기</b>
        <div style={{ fontSize: 13, color: "#444" }}>
          파란색 <b>“API 키 만들기”(Create API key)</b> 버튼을 클릭하면 몇 초 뒤
          <code style={{ background: "#f0f0f0", padding: "1px 6px", borderRadius: 4, margin: "0 4px" }}>AIza...</code>로
          시작하는 긴 문자열이 나타나요. 이게 API 키입니다. <b>복사</b> 버튼을 눌러 복사하세요.
        </div>
      </div>

      <div style={box}>
        <b>3단계 — 포켓 스터디에 등록</b>
        <div style={{ fontSize: 13, color: "#444" }}>
          포켓 스터디 <b>교사 메뉴 → 게임 설정 → AI 문제 생성</b> 섹션에서 제공사를
          <b> Google Gemini</b>로 두고, 복사한 키를 붙여넣은 뒤 <b>“저장 + 연결 테스트”</b>를 누르세요.
          “연결 테스트 성공!”이 뜨면 끝 — 이제 문제 은행에서 <b>🤖 AI 생성</b> 버튼을 쓸 수 있어요.
        </div>
      </div>

      <div style={box}>
        <b>⚠️ 키 관리 주의사항</b>
        <ul style={{ fontSize: 13, color: "#444", paddingLeft: 18, margin: "6px 0" }}>
          <li>API 키는 <b>비밀번호처럼</b> 다뤄주세요. 학생이나 다른 사람에게 공유 금지.</li>
          <li>키는 암호화되어 저장되고, 문제 생성 요청에만 서버에서 사용됩니다.</li>
          <li>유출이 의심되면 Google AI Studio에서 키를 삭제하고 새로 만들면 됩니다.</li>
          <li>무료 등급은 요청 데이터가 Google 학습에 쓰일 수 있어요 — 문제 출제 용도로는 무해하지만, 개인정보는 입력하지 마세요.</li>
        </ul>
      </div>

      <div style={box}>
        <b>다른 AI를 쓰고 싶다면</b>
        <div style={{ fontSize: 13, color: "#444" }}>
          OpenAI(ChatGPT)는 <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: "#3d6fd9" }}>platform.openai.com/api-keys</a>,
          Anthropic(Claude)은 <a href="https://console.anthropic.com" target="_blank" style={{ color: "#3d6fd9" }}>console.anthropic.com</a> 에서
          발급해요. 두 곳 모두 <b>유료 크레딧 충전</b>이 필요합니다 (문제 생성 비용 자체는 회당 몇 원 수준).
        </div>
      </div>

      <Link href="/teacher" style={{ display: "inline-block", marginTop: 6, padding: "10px 18px", background: "#1a1c2c", color: "#f8f0dc", borderRadius: 8, fontSize: 14, textDecoration: "none" }}>
        ← 교사 메뉴로 돌아가기
      </Link>
    </div>
  );
}
