-- 포켓 스터디 M4: 배틀 포켓몬 시스템
-- 학생별 영구 게임 상태(스타팅 포켓몬, 현재 배틀 포켓몬, 포켓몬별 배틀 승수)를 담는 칸 추가.
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run (1초면 끝나요).

alter table public.students
  add column if not exists game_state jsonb not null default '{}'::jsonb;

-- (참고) 등급 재분류는 앱 코드가 직접 판정하므로 시드 재실행은 필요 없지만,
-- 데이터를 맞춰두고 싶다면 0002_seed_pokemon.sql을 다시 Run 해도 됩니다 (덮어쓰기 안전).
