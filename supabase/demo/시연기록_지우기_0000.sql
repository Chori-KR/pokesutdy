-- 시연용 학습 기록 지우기 (demo_seed.sql로 만든 것만; id가 dec0de00- 로 시작)
begin;
update public.questions q set tries = greatest(0, q.tries - x.t), wrong = greatest(0, q.wrong - x.w)
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like 'dec0de00-%' and question_id is not null
       group by question_id) x
where q.id = x.question_id;
delete from public.answer_logs where id::text like 'dec0de00-%';
commit;
select count(*) as 남은_시연기록 from public.answer_logs where id::text like 'dec0de00-%';
