-- ================================================================
-- 시연용 활동 기록 지우기 — 학급 0000 학생 4명을 시연 전 상태로 되돌림
--   · 시연 풀이 기록(dec0de00-) 삭제 + 문제 오답률 원래대로
--   · 포인트·레벨·가방·게임 상태·가입일·도감을 demo_backup 보관본으로 복원
-- ================================================================
begin;
update public.questions q set tries = greatest(0, q.tries - x.t), wrong = greatest(0, q.wrong - x.w)
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like 'dec0de00-%' and question_id is not null group by question_id) x
where q.id = x.question_id;
delete from public.answer_logs where id::text like 'dec0de00-%';

do $$
begin
  if to_regclass('public.demo_backup') is null then return; end if;
  update public.students s set
    points = (b.student->>'points')::int, xp = (b.student->>'xp')::int, level = (b.student->>'level')::int,
    inventory = b.student->'inventory', game_state = b.student->'game_state',
    created_at = (b.student->>'created_at')::timestamptz
  from public.demo_backup b where b.student_id = s.id;
  delete from public.catches c using public.demo_backup b where c.student_id = b.student_id;
  insert into public.catches (student_id, pokemon_id, method, caught_at, count, shiny)
  select b.student_id, (e->>'pokemon_id')::smallint, coalesce(e->>'method', 'battle'),
         coalesce((e->>'caught_at')::timestamptz, now()), coalesce((e->>'count')::int, 1), coalesce((e->>'shiny')::boolean, false)
  from public.demo_backup b, jsonb_array_elements(b.catches) e;
  drop table public.demo_backup;
end $$;
commit;
select count(*) as 남은_시연기록 from public.answer_logs where id::text like 'dec0de00-%';
