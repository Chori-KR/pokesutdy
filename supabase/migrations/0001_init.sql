-- 포켓 스터디 M1 스키마 (명세 §6.1)
-- Supabase 대시보드 → SQL Editor에 이 파일 내용을 붙여넣고 Run.

create extension if not exists pgcrypto;

-- 학급 (교사 1명 = Supabase Auth 유저)
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '우리 반',
  class_code text not null unique,
  settings jsonb not null default '{"moveDiff": true}'::jsonb,
  created_at timestamptz not null default now()
);

-- 학생 (개인정보 무수집: 닉네임 + bcrypt 해시만)
create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  nickname text not null,
  pw_hash text not null,
  points integer not null default 500 check (points >= 0),
  inventory jsonb not null default '{"poke":3,"superb":0,"hyper":0,"master":0,"potion":0,"revive":0}'::jsonb,
  hp integer not null default 100 check (hp between 0 and 100),
  level integer not null default 16,
  xp integer not null default 0,
  day_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (class_id, nickname)
);

-- 문제 은행
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  body text not null,
  options jsonb not null,
  answer_idx smallint not null check (answer_idx between 0 and 3),
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  tag text not null default '미분류',
  type text not null default 'multiple',
  active boolean not null default true,
  source text not null default '수동',
  tries integer not null default 0,
  wrong integer not null default 0,
  created_at timestamptz not null default now()
);
create index questions_class_active_idx on public.questions (class_id, active);

-- 포켓몬 메타 (151마리 시드는 0002 참조)
create table public.pokemon_meta (
  id smallint primary key,
  name_ko text not null,
  type text not null,
  rarity text not null check (rarity in ('common','rare','legendary'))
);

-- 도감 (학생당 포켓몬 1회 기록)
create table public.catches (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  pokemon_id smallint not null references public.pokemon_meta(id),
  method text not null default 'battle',
  caught_at timestamptz not null default now(),
  unique (student_id, pokemon_id)
);

-- 풀이 로그 (통계용, M3에서 활용)
create table public.answer_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  correct boolean not null,
  context text not null default 'battle',
  created_at timestamptz not null default now()
);
create index answer_logs_student_idx on public.answer_logs (student_id, created_at);

-- ── RLS: 학급 간 데이터 격리 (명세 §7) ─────────────────────────
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.questions enable row level security;
alter table public.pokemon_meta enable row level security;
alter table public.catches enable row level security;
alter table public.answer_logs enable row level security;

-- 교사는 자기 학급만 (anon 키 + Supabase Auth 세션으로 접근)
create policy "teacher_own_classes" on public.classes
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);

create policy "teacher_own_questions" on public.questions
  for all
  using (class_id in (select id from public.classes where teacher_id = auth.uid()))
  with check (class_id in (select id from public.classes where teacher_id = auth.uid()));

-- 포켓몬 메타는 누구나 읽기 가능
create policy "pokemon_meta_read" on public.pokemon_meta for select using (true);

-- students / catches / answer_logs 는 정책 없음
-- → anon 키로는 접근 불가, 서버(service_role Route Handler) 경유만 허용.
--   포인트·인벤토리·포획 판정을 서버 권위로 처리하기 위한 의도적 차단.
