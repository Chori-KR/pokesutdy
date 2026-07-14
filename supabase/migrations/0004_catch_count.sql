-- 포켓 스터디 M8: 잡은 포켓몬 마리 수(수량) 기록
-- 같은 포켓몬을 여러 마리 잡을 수 있게 catches에 count 칸을 추가한다.
-- 진화 시 진화 전 포켓몬 1마리 소모(0이면 사라짐), 도감에 마리 수 표시, 교환 기능의 토대.
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run (1초면 끝나요).

alter table public.catches
  add column if not exists count integer not null default 1;

-- 기존 기록은 최소 1마리로 맞춰 둠 (이미 default 1이라 신규 행엔 자동 적용)
update public.catches set count = 1 where count is null or count < 1;
