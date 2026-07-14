-- 포켓 스터디 M10: 교환 코드를 6자리 숫자로 바꾸고 재사용 가능하게
-- 기존엔 코드가 전역 유니크라 완료·취소된 코드가 영영 다시 못 나왔는데,
-- '열려 있는(open)' 교환끼리만 코드가 겹치지 않도록 바꿔서
-- 완료·취소된 6자리 숫자는 나중에 다시 발급될 수 있게 한다.
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run (1초면 끝나요).

-- 전역 유니크 제약 제거 (컬럼 unique는 <테이블>_<컬럼>_key 이름으로 생성됨)
alter table public.trades drop constraint if exists trades_code_key;

-- 열린 교환끼리만 코드 유일 (완료/취소된 코드는 재사용 가능)
create unique index if not exists trades_open_code_idx
  on public.trades (code) where status = 'open';
