-- 지문과 그림을 문제에 붙일 수 있게 한다.
--
--  passages        : 지문(제목·본문·출처·그림). 지문 하나에 문제 여러 개가 딸린다.
--  questions.svg   : 문제에 붙는 그림(SVG 코드). 그래프·도형·표 등.
--  questions.passage_id : 이 문제가 딸린 지문. 지문을 지우면 문제는 남고 연결만 끊긴다.
--
-- 칸·표를 추가만 하므로 기존 문제와 이전 버전 앱에는 영향이 없다. 여러 번 실행해도 안전.

create table if not exists public.passages (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null default '',
  body text not null,
  source text not null default '',   -- 출처 (예: 교과서 국어 3-1 가 / 직접 지음 / 김소월 「엄마야 누나야」)
  svg text,                          -- 지문에 딸린 그림(선택)
  created_at timestamptz not null default now()
);
create index if not exists passages_class_idx on public.passages (class_id);

alter table public.passages enable row level security;

-- 교사는 자기 학급 지문만 (문제와 같은 규칙). 학생은 서버(service_role) 경유로만 읽는다.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'passages' and policyname = 'teacher_own_passages') then
    create policy "teacher_own_passages" on public.passages
      for all
      using (class_id in (select id from public.classes where teacher_id = auth.uid()))
      with check (class_id in (select id from public.classes where teacher_id = auth.uid()));
  end if;
end $$;

alter table public.questions add column if not exists svg text;
alter table public.questions add column if not exists passage_id uuid references public.passages(id) on delete set null;
create index if not exists questions_passage_idx on public.questions (passage_id);
