-- ================================================================
-- 학급 0213: 학생 이름(가명)과 학급 이름 바꾸기
--   정민지 → 학생A · 박준혁 → 학생B · 정민영 → 학생C · 이소미 → 학생D
--   학급 이름 → 특수교육사례발표대회 제출용
--
-- · 이름만 바뀌고 포인트·도감·레벨·풀이 기록·시연 기록은 그대로 (기록은 학생 고유번호에 연결)
-- · 학생 로그인: 학급 코드 0213 + 새 이름(학생A 등) + 기존 비밀번호
-- · 실행 전 확인: 학급 0213이 있는지, 새 이름이 이미 다른 학생에게 쓰이고 있지 않은지
--   → 문제가 있으면 아무것도 바꾸지 않고 멈춤
-- · 여러 번 실행해도 됨 (이미 바뀐 학생은 그대로 둠)
-- ================================================================
begin;

do $$
declare cls uuid; clash text; n int;
begin
  select id into cls from public.classes where class_code = '0213';
  if cls is null then raise exception '학급 코드 0213을 찾을 수 없어요.'; end if;

  -- 새 이름을 이미 다른 학생(바꿀 4명이 아닌 학생)이 쓰고 있으면 멈춤
  select string_agg(s.nickname, ', ') into clash
  from public.students s
  where s.class_id = cls and s.nickname in ('학생A','학생B','학생C','학생D')
    and exists (select 1 from public.students o
                where o.class_id = cls
                  and o.nickname = case s.nickname when '학생A' then '정민지' when '학생B' then '박준혁'
                                                    when '학생C' then '정민영' else '이소미' end);
  if clash is not null then
    raise exception '이미 같은 학급에 % 이름의 학생이 있어서 바꿀 수 없어요. 그 학생 이름을 먼저 바꾸거나 알려 주세요.', clash;
  end if;

  select count(*) into n from public.students
  where class_id = cls and nickname in ('정민지','박준혁','정민영','이소미','학생A','학생B','학생C','학생D');
  if n < 4 then
    raise exception '학급 0213에서 바꿀 학생 4명을 모두 찾지 못했어요 (찾은 수: %).', n;
  end if;
end $$;

update public.students s set nickname = v.new_name
from (values ('정민지','학생A'), ('박준혁','학생B'), ('정민영','학생C'), ('이소미','학생D')) v(old_name, new_name)
where s.nickname = v.old_name
  and s.class_id = (select id from public.classes where class_code = '0213');

update public.classes set name = '특수교육사례발표대회 제출용' where class_code = '0213';

commit;

-- 결과 확인
select c.name as 학급, s.nickname as 학생, s.level as 레벨, s.points as 포인트,
       (select count(*) from public.answer_logs l where l.student_id = s.id) as 풀이기록
from public.students s join public.classes c on c.id = s.class_id
where c.class_code = '0213'
order by s.nickname;
