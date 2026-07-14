-- 포켓 스터디 M11: 이로치(색違) 포켓몬 도감 표시
-- 한 번이라도 이로치를 잡은 종은 도감에 ✨로 표시한다.
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run (1초면 끝나요).

alter table public.catches
  add column if not exists shiny boolean not null default false;
