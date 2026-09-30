-- 풀이 기록에 "풀 당시의 문제 내용"을 함께 남긴다.
-- 교사가 나중에 문제를 지워도(question_id → null) 구글 시트·통계에서
-- 어떤 단원·난이도의 무슨 문제였는지 알 수 있도록.
--
-- 칸만 추가하므로 기존 기록과 이전 버전 앱에는 영향이 없다.
-- (이전 버전 앱은 이 칸을 채우지 않을 뿐, 저장·조회 모두 그대로 동작)

alter table public.answer_logs add column if not exists q_tag text;
alter table public.answer_logs add column if not exists q_difficulty text;
alter table public.answer_logs add column if not exists q_body text;
alter table public.answer_logs add column if not exists q_answer text;

-- 이미 쌓인 기록 중 문제가 아직 남아 있는 것은 지금 내용으로 채워 둔다
-- (이후에 그 문제를 지워도 시트에 남도록)
update public.answer_logs l
set q_tag = q.tag,
    q_difficulty = q.difficulty,
    q_body = q.body,
    q_answer = case when q.type = 'short' then q.options->>0 else q.options->>q.answer_idx end
from public.questions q
where l.question_id = q.id and l.q_body is null;
