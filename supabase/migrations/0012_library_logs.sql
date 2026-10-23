-- 기본 문제 은행(모든 학급이 함께 쓰는 원본 문제)의 풀이 기록.
--
-- 기본 문제는 학급 문제 표(questions)에 복사하지 않으므로 answer_logs.question_id 에 넣을 수 없다.
-- 대신 lib_qid 에 기본 문제 번호(예: "L:수학-초3-4-…")를 적는다. 문제 내용은 0009 칸(q_tag·q_body…)에 함께 남는다.
--
-- 칸만 추가하므로 기존 기록과 이전 버전 앱에는 영향이 없다. 여러 번 실행해도 안전.

alter table public.answer_logs add column if not exists lib_qid text;
create index if not exists answer_logs_lib_qid_idx on public.answer_logs (lib_qid) where lib_qid is not null;
