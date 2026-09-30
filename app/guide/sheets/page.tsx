import ScriptBox from "./ScriptBox";

export const metadata = { title: "구글 시트 연동 가이드 · 잡으면서 배우자!" };

const TEMPLATE_URL = process.env.NEXT_PUBLIC_SHEETS_TEMPLATE_URL || "";

const box: React.CSSProperties = {
  background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10,
  padding: "14px 16px", marginBottom: 12, lineHeight: 1.8,
};
const sub: React.CSSProperties = { fontSize: 13, color: "#444" };
const code: React.CSSProperties = { background: "#f0f0f0", padding: "1px 6px", borderRadius: 4, margin: "0 2px" };
const menu: React.CSSProperties = { ...code, background: "#eef1fb", color: "#2f4bc0", fontWeight: 600 };

// 구글 시트 연동 설정 안내 — 교사 메뉴 → 시스템 설정 → 구글 시트 연동 카드에서 연결.
export default function SheetsGuide() {
  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#2c2c34", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif", padding: "24px 16px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>📊 구글 시트 연동 가이드 (약 10분)</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 18 }}>
        학생들의 문제 풀이 기록이 <b>선생님의 구글 시트</b>에 자동으로 쌓이고, 학생마다 대시보드가 만들어져요.
        한 번만 설정하면 학기 내내 저절로 갱신됩니다.
      </p>

      <div style={box}>
        <b>이렇게 만들어져요</b>
        <ul style={{ ...sub, paddingLeft: 18, margin: "6px 0" }}>
          <li><b>학생현황</b> — 학생별 레벨·포인트·도감·푼 문항·정답률·최근 활동 (학생 이름을 누르면 그 학생 탭으로 이동)</li>
          <li><b>문제기록</b> — 모든 풀이 기록 원본. 계속 아래로 쌓여요 <span style={{ color: "#c0392b" }}>(지우지 마세요)</span></li>
          <li><b>반 전체</b> — 반 전체 대시보드</li>
          <li><b>👤 학생 이름</b> — 학생별 대시보드. 새 학생이 가입하면 <b>자동으로 생겨요</b></li>
        </ul>
        <div style={sub}>
          대시보드에는 <b>과목·단원별 정답률/오답률</b>, <b>과목·단원 × 난이도</b>, <b>난이도별</b>,
          <b> 상황별(배틀·문제풀이·레이드)</b>, <b>날짜별 정답률 그래프</b>, <b>오답 모아보기(복습용)</b>가 있고,
          위쪽에서 <b>기간</b>(이번 주·지난 주·이번 달·지난 달·최근 30일·전체·직접 입력)을 고르면 전부 그 기간으로 바뀌어요.
        </div>
      </div>

      {TEMPLATE_URL && (
        <div style={{ ...box, border: "2px solid #3d6fd9" }}>
          <b>⚡ 빠른 방법 — 템플릿 사본 받기</b>
          <div style={sub}>
            <a href={TEMPLATE_URL} target="_blank" style={{ color: "#3d6fd9", fontWeight: 700 }}>여기를 눌러 템플릿 사본 만들기 →</a><br />
            사본이 만들어지면 아래 <b>1~3단계는 건너뛰고 4단계</b>부터 하시면 됩니다.
          </div>
        </div>
      )}

      <div style={box}>
        <b>1단계 — 새 구글 시트 만들기</b>
        <div style={sub}>
          브라우저 주소창에 <code style={code}>sheets.new</code> 를 입력하면 빈 시트가 바로 만들어져요.
          이름은 <code style={code}>잡으면서 배우자 - 우리 반</code>처럼 알아보기 쉽게 바꿔 두세요.
        </div>
      </div>

      <div style={box}>
        <b>2단계 — 스크립트 붙여넣기</b>
        <div style={sub}>
          시트 위쪽 메뉴 <span style={menu}>확장 프로그램 → Apps Script</span>를 누르면 새 창이 열려요.
          원래 들어 있는 <code style={code}>function myFunction() {"{ }"}</code>을 <b>모두 지우고</b>,
          아래 버튼으로 복사한 코드를 붙여넣은 뒤 <b>💾 저장</b>(Ctrl+S)을 누르세요.
        </div>
        <div style={{ marginTop: 10 }}><ScriptBox /></div>
      </div>

      <div style={box}>
        <b>3단계 — 시트 준비 + 권한 허용</b>
        <div style={sub}>
          시트 창으로 돌아와 <b>새로고침(F5)</b> 하면 위쪽에 <span style={menu}>🎮 잡으면서 배우자</span> 메뉴가 생겨요.
          <span style={menu}>① 처음 설정하기</span>를 누르세요.<br />
          처음 한 번은 <b>권한 확인</b> 창이 떠요:
          <ol style={{ paddingLeft: 18, margin: "6px 0" }}>
            <li><b>계속</b> → 내 구글 계정 선택</li>
            <li><b>“Google에서 확인하지 않은 앱”</b> 경고가 나오면 → 왼쪽 아래 <b>고급</b> → <b>(안전하지 않음)으로 이동</b></li>
            <li><b>허용</b></li>
          </ol>
          <span style={{ color: "#888" }}>
            이 경고는 선생님이 직접 붙여넣은 스크립트라서 구글이 심사하지 않았다는 뜻이에요. 코드는 이 시트와
            잡으면서 배우자 서버하고만 통신합니다.
          </span>
        </div>
      </div>

      <div style={box}>
        <b>4단계 — 연동 주소 복사</b>
        <div style={sub}>
          잡으면서 배우자 <b>교사 메뉴 → 시스템 설정 → 📊 구글 시트 연동</b>에서
          <b> 🔗 연동 주소 만들기</b> → <b>📋 복사</b>.
        </div>
      </div>

      <div style={box}>
        <b>5단계 — 시트에 연결하고 가져오기</b>
        <div style={sub}>
          시트 메뉴 <span style={menu}>② 연동 주소 넣기</span> → 복사한 주소 붙여넣기 → 확인.<br />
          “연결됐어요”가 뜨면 <span style={menu}>③ 지금 가져오기</span>. 학생 탭들이 생기고 기록이 채워져요.
        </div>
      </div>

      <div style={box}>
        <b>6단계 — 자동 가져오기 켜기</b>
        <div style={sub}>
          <span style={menu}>⏱ 자동 가져오기 켜기</span>를 누르면 <b>5분마다</b> 새 기록이 저절로 쌓여요. 바로 보고 싶을 땐 <span style={menu}>③ 지금 가져오기</span>를 누르면 돼요.
          시트를 닫아 두어도 됩니다. 이제 끝! 🎉
        </div>
      </div>

      <h2 style={{ fontSize: 17, margin: "22px 0 10px" }}>다른 선생님께 나눠 드리기</h2>
      <div style={box}>
        <div style={sub}>
          설정을 마친 시트를 그대로 공유하면 <b>우리 반 기록까지 함께 넘어가요.</b> 그래서 나눠 드릴 때는:
          <ol style={{ paddingLeft: 18, margin: "6px 0" }}>
            <li>시트를 <b>하나 더</b> 만들어(<span style={menu}>파일 → 사본 만들기</span>) 템플릿으로 씁니다</li>
            <li>그 사본에서 <span style={menu}>🧹 배포용으로 비우기</span> — 기록·학생 탭·연동 주소가 모두 지워져요</li>
            <li><span style={menu}>공유 → 일반 액세스: 링크가 있는 모든 사용자(뷰어)</span> → 링크 복사</li>
            <li>링크 끝의 <code style={code}>/edit…</code> 부분을 <code style={code}>/copy</code> 로 바꿔서 나눠 드리면,
              받은 분이 누르는 즉시 <b>자기 드라이브에 사본</b>이 생겨요 (스크립트 포함)</li>
          </ol>
          받은 선생님은 위의 <b>3~6단계</b>만 하시면 됩니다.
          사본에는 원래 시트의 연동 주소가 따라가지 않도록 막아 두었어요.
        </div>
      </div>

      <h2 style={{ fontSize: 17, margin: "22px 0 10px" }}>자주 묻는 질문</h2>
      <div style={box}>
        <div style={sub}>
          <b>Q. 기록이 안 들어와요.</b><br />
          <span style={menu}>③ 지금 가져오기</span>를 눌러 오류 문구를 확인해 주세요.
          “연동 주소가 올바르지 않아요”라면 교사 메뉴에서 주소를 다시 복사해 <span style={menu}>② 연동 주소 넣기</span>를 다시 해 주세요.
          <br /><br />
          <b>Q. 연동 주소가 다른 사람에게 알려졌어요.</b><br />
          교사 메뉴의 <b>🔄 다시 만들기</b>를 누르면 예전 주소는 바로 막혀요. 새 주소를 시트에 다시 넣어 주세요.
          <br /><br />
          <b>Q. 기록을 처음부터 다시 받고 싶어요.</b><br />
          <span style={menu}>🔁 기록 전부 다시 받기</span>. 문제기록 탭을 비우고 처음부터 받아요 (학생 탭·서식은 그대로).
          <br /><br />
          <b>Q. 여러 반을 가르쳐요.</b><br />
          반마다 <b>시트 파일을 따로</b> 만들어 주세요. 한 시트에 여러 반을 넣으면 섞이지 않도록 막혀 있고, 시트도 무거워져요.
          <br /><br />
          <b>Q. 표 모양이나 색을 바꿔도 되나요?</b><br />
          네. 대시보드는 <b>문제기록</b> 탭을 수식으로 보여 주는 것이라, 서식·표를 고쳐도 기록에는 영향이 없어요.
          새 학생 탭의 모양을 바꾸고 싶으면 숨겨진 <b>_학생템플릿</b> 탭을 고치면 됩니다.
          <br /><br />
          <b>Q. 시트 없이 엑셀로만 보고 싶어요.</b><br />
          교사 메뉴의 <b>⬇️ 풀이 기록 CSV로 내려받기</b>를 누르면 엑셀에서 바로 열리는 파일을 받을 수 있어요.
        </div>
      </div>
    </div>
  );
}
