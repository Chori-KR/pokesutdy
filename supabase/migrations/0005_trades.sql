-- 포켓 스터디 M9: 학생 간 포켓몬 교환
-- 친구 A가 교환할 포켓몬을 걸고 6자리 코드를 만들면, 친구 B가 코드로 찾아
-- 자기 포켓몬을 걸고 수락 → 서버가 원자적으로 서로 맞바꾼다(도감 마리 수 이동).
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run (1초면 끝나요).

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  code text not null unique,                 -- 친구에게 알려줄 6자리 교환 코드
  from_student uuid not null references public.students(id) on delete cascade,
  offer_pokemon smallint not null references public.pokemon_meta(id),
  status text not null default 'open' check (status in ('open','done','cancelled')),
  to_student uuid references public.students(id) on delete set null,
  want_pokemon smallint references public.pokemon_meta(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists trades_class_status_idx on public.trades (class_id, status);
create index if not exists trades_from_idx on public.trades (from_student);

-- RLS: 학생 관련 테이블과 동일 — 정책 없음(anon 접근 차단), 서버(service_role) 경유만 허용.
alter table public.trades enable row level security;
