# 포켓 스터디 (PokéStudy)

교사가 출제한 학습 문제로 포켓몬을 배틀·포획하며 1세대 도감(151마리)을 완성하는 학급용 교육 게임 웹앱.

> 설계 근거: [`pokestudy-dev-spec.md`](./pokestudy-dev-spec.md) · UI/게임 로직 원본: 루트의 `*-prototype.jsx` 4종

## 현재 구현 범위: M1~M5 (코어 + 경제 + AI·관리 + 배틀 확장 + 경제·진화 개편)

| 기능 | 상태 |
|---|---|
| 교사 가입/로그인 (이메일, Supabase Auth) | ✅ |
| 학급 생성 + 학급 코드 자동 발급 (예: TIGER24) | ✅ |
| 학생 가입/로그인 (학급코드+닉네임+비밀번호만, bcrypt 해시) | ✅ |
| 가입 보너스 500P + 몬스터볼 3개 | ✅ |
| 문제 은행 CRUD (검색·태그 필터·오답률·출제 토글·태그 일괄 토글) | ✅ |
| 배틀 (기술=난이도, 타이머, 급소 1.5배, 오답 시 반격, 종료 시 자동 회복) | ✅ |
| 포획 (볼 선택, 서버 RNG 판정, 2회 실패 시 도망) | ✅ |
| 도감 151칸 (미포획 실루엣) | ✅ |
| 서버 권위: 포인트·인벤토리·포획·XP·통계는 서버에서 계산 | ✅ |
| 상점: 볼 4종·진화의돌(1,500P)·간식 3종 (마스터볼 1인 1개, 약 판매 없음) | ✅ |
| 오늘의 실루엣 퀴즈 (하루 1회, +150P+랜덤볼 50/30/20, 오답 위로 보상) | ✅ |
| 야생 탐색 (하루 3회, 배틀 없이 볼만 던져 포획) | ✅ |
| 문제풀이 탭 (정답 +20P, 하루 10문제 한도) | ✅ |
| 일일 리셋: 자정(Asia/Seoul) 퀴즈·탐색·문제풀이·HP 전부 초기화 | ✅ |
| 교사 설정: 탐색 횟수·문제풀이 한도 조절 | ✅ |
| AI 문제 생성 (본인 키 등록: Gemini 무료/OpenAI/Claude, 검토 후 등록, 일 20회) | ✅ |
| 문제 대량 등록 (한 줄 한 문제, 엑셀 복사 호환) | ✅ |
| 학생·통계 탭 (정답률·오늘/누적 풀이·도감·오답률 TOP10) | ✅ |
| 학생 선물(포인트·아이템)·비밀번호 초기화 | ✅ |
| AI 키 발급 가이드 페이지 (`/guide/ai-key`) | ✅ |
| 스타팅 포켓몬 선택 (이상해씨·파이리·꼬부기·피카츄) | ✅ |
| 배틀 포켓몬 선택 (잡은 포켓몬 사용) + 타입별 기술 자동 배치 | ✅ |
| 진화 3방식: 배틀 승수(5승/10승) 또는 포인트(1,000→2,000→2,500P) 또는 진화의돌(돌 진화 16페어) | ✅ |
| 간식 배틀: 일반(500P·흔함)/고급(2,000P·희귀)/최고급(6,000P·전설 확정) — 일일 제한 무관 추가 배틀 | ✅ |
| 배틀 일일 제한 (기본 2회, 교사 설정) | ✅ |
| 희귀 등급 재분류 (최종 진화체·상징·스타팅 = 희귀 71종) + 몬스터볼 확률 소폭 하향 | ✅ |
| 친구 도감 구경 + 학급 수집 랭킹 | ✅ |
| 잡은 마리 수 기록(도감 ×N 표시) + 진화 시 진화 전 포켓몬 1마리 소모 | ✅ |
| 상점 구매 확인 모달 · 문제 체크박스 일괄 출제/숨김 · 엑셀 양식 다운로드/업로드 | ✅ |
| 레벨 시스템: 배틀·문제풀이 정답 +2XP, 포획 XP, 레벨업 +100P (5의 배수 레벨 +500P) | ✅ |
| 야생 레벨 연동 (내 레벨 기준 흔함 -10 / 희귀 -4 / 전설 +4) + 진화 연출 애니메이션 | ✅ |
| 도감 영구 기록: 진화로 떠나보낸 종도 도감에 남음(보유0 표시), 교환으로만 새 종 추가 | ✅ |
| 학생 간 교환: 포켓몬 걸고 6자리 코드 발급 → 친구가 코드로 맞바꿈(서버 원자 처리) | ✅ |
| 배틀 도트(픽셀) 통일 · 도감은 공식 일러스트 · 클릭 시 한글 도감 설명 카드 | ✅ |
| 선택 → 정답 제출 2단계(실수 방지) + 배틀 타이머 교사 설정(On/Off·배수) | ✅ |
| 이로치(색違) 포켓몬 1/40 등장 + 도감 ✨ 표시 | ✅ |
| 빛나는 스프레이(3,000P): 다음 야생 이로치 확정(간식과 중복) + 상점 수량 구매 | ✅ |
| 단답형 문제(문제풀이) + AI 생성 특수/일반 탭(특수교육 기본교육과정 근거) | ✅ |

## 처음 설정 (선생님용, 약 10분)

### 1. Supabase 프로젝트 만들기
1. https://supabase.com 가입 → **New project** (Region: Seoul 권장, Free 플랜)
2. 키 4개 수집 (자세한 위치는 아래):
   - **Project URL**: Settings(⚙️) → Data API → `Project URL`
   - **Publishable key**: Settings → API Keys → `sb_publishable_...`
   - **Secret key**: Settings → API Keys → Secret keys → Reveal → `sb_secret_...` ⚠️ 절대 공개 금지
   - **JWT secret**: 직접 생성한 긴 랜덤 문자열 (`openssl rand -base64 32`)

### 2. 데이터베이스 만들기
1. Supabase 대시보드 → **SQL Editor** → New query
2. [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) 내용 전체를 붙여넣고 **Run**
3. 같은 방법으로 [`supabase/migrations/0002_seed_pokemon.sql`](./supabase/migrations/0002_seed_pokemon.sql)도 **Run**
   (성공하면 `pokemon_meta` 테이블에 151마리가 들어갑니다)
4. 같은 방법으로 [`supabase/migrations/0003_battle_pokemon.sql`](./supabase/migrations/0003_battle_pokemon.sql)도 **Run**
   (배틀 포켓몬 시스템용 — 이미 0001~0002만 실행한 기존 설치도 이것만 추가로 Run 하면 됩니다)
5. 같은 방법으로 [`supabase/migrations/0004_catch_count.sql`](./supabase/migrations/0004_catch_count.sql)도 **Run**
   (잡은 마리 수 기록용 — 기존 설치도 이것만 추가로 Run 하면 됩니다)
6. 같은 방법으로 [`supabase/migrations/0005_trades.sql`](./supabase/migrations/0005_trades.sql)도 **Run**
   (학생 간 교환 기능용 — 기존 설치도 이것만 추가로 Run 하면 됩니다)
7. 같은 방법으로 [`supabase/migrations/0006_trade_numeric_code.sql`](./supabase/migrations/0006_trade_numeric_code.sql)도 **Run**
   (교환 코드를 6자리 숫자·재사용 가능하게 — 0005를 이미 실행했어도 이것만 추가로 Run)
8. 같은 방법으로 [`supabase/migrations/0007_catch_shiny.sql`](./supabase/migrations/0007_catch_shiny.sql)도 **Run**
   (이로치 포켓몬 도감 표시용 — 기존 설치도 이것만 추가로 Run)

### 3. (권장) 이메일 확인 끄기
Supabase 대시보드 → **Authentication → Sign In / Up → Email** 에서 **Confirm email을 OFF**
하면 교사 가입 직후 바로 로그인됩니다. (켜두면 가입 확인 메일을 클릭해야 로그인 가능)

### 4. 앱 실행 (내 컴퓨터에서)
```bash
# Node.js 20 이상 필요 (https://nodejs.org)
git clone <이 저장소>
cd pokesutdy
cp .env.local.example .env.local   # 파일을 복사한 뒤
# .env.local 을 열어 1번에서 모은 키 4개를 채운다
npm install
npm run dev
# → http://localhost:3000 접속
```

### 5. 사용 순서
1. **교사로 입장** → 가입 → 학급 만들기 → 학급 코드 확인 (샘플 문제 6개 자동 등록)
2. 문제 은행에서 **+ 새 문제**로 문제 추가, 토글로 출제 여부 관리
3. 학생들에게 학급 코드 전달 → 학생은 **학생으로 입장** → 코드+닉네임+비밀번호로 가입
4. 배틀 시작! 문제를 맞혀 야생 포켓몬을 쓰러뜨리고 볼을 던져 도감을 채웁니다

## 배포 (Vercel, 선택)
1. 이 저장소를 GitHub에 두고 https://vercel.com 에서 Import
2. **Environment Variables**에 `.env.local`과 같은 4개 값을 입력 후 Deploy

## 기술 구조
- **Next.js 15 (App Router) + TypeScript + React 19** — UI는 프로토타입에서 포팅
- **Supabase**: Postgres + Auth(교사) + RLS(학급 간 데이터 격리)
- **학생 인증**: 개인정보 무수집 원칙에 따라 자체 JWT 세션(httpOnly 쿠키), 비밀번호는 bcrypt 해시
- **부정 방지**: 포인트·인벤토리·포획 판정·XP·문제 통계는 전부 서버(Route Handler, service-role)가 계산.
  야생 출현도 서버가 뽑아 서명(battle token) → 클라이언트 콘솔로 조작 불가
- 학생 관련 테이블(students/catches/answer_logs)은 anon 키로 접근 불가(정책 없음), 서버 경유만 허용

```
app/api/…        서버 권위 엔드포인트 (학생 인증, 배틀 채점, 포획 RNG)
app/student      학생 화면 (배틀·도감) — 게임보이풍
app/teacher      교사 화면 (문제은행·설정) — 관리 도구풍
components/      프로토타입에서 분해한 UI 컴포넌트
lib/game.ts      게임 상수·규칙 (희귀도, 볼, 포획률, 151마리 데이터)
supabase/migrations  스키마 + RLS + 시드 SQL
```

## 저작권 유의
포켓몬 IP는 The Pokémon Company 소유입니다. **교육용·비상업·학급 내부 사용 범위**를 유지하세요.
(자세한 내용: 명세서 §8)
