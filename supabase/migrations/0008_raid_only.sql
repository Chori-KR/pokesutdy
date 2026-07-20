-- 0008: 레이드 전용 문제 (형성평가용)
-- questions.raid_only = true 인 문제는 평소 배틀에는 나오지 않고,
-- 레이드(형성평가)에서만 출제된다. 기본값 false(=평소 배틀 문제).
alter table public.questions
  add column if not exists raid_only boolean not null default false;

-- 레이드 문제 조회용 인덱스
create index if not exists questions_class_raid_idx
  on public.questions (class_id, raid_only);
