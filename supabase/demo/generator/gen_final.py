"""최종 SQL 만들기: 시연기록_만들기_0000.sql / 시연기록_지우기_0000.sql"""
import os, json, runpy, io, contextlib

HERE = os.path.dirname(os.path.abspath(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    G = runpy.run_path(os.path.join(HERE, "gen_demo.py"))   # 주제별 문제 본문(성취기준 분류)
    SIM = runpy.run_path(os.path.join(HERE, "sim_demo.py"), run_name="sim")
students = SIM["students"]
NICKS = list(students)                      # 정민지, 정민영, 박준혁, 이소미
lit = lambda s: "'" + str(s).replace("'", "''") + "'"

# 주제 표
topics = []   # (tid, nick, name, tag, rx, bodies)
for nick, lst in G["TOPICS"].items():
    for (name, bodies, tag, rx, *_r) in lst:
        topics.append((len(topics) + 1, nick, name, tag, rx, sorted(set(bodies))))
tid_of = {(n, name): tid for tid, n, name, *_ in topics}

plan = []
for st in students.values():
    for at, name, ctx, diff, ok in st.logs:
        plan.append((NICKS.index(st.nick) + 1, at, tid_of[(st.nick, name)], ctx[0], diff[:1], ok))
plan.sort(key=lambda r: r[1])

def gs_json(st):
    return json.dumps(st.gs, ensure_ascii=False)

HEAD = """-- ================================================================
-- 시연용 활동 기록 만들기 — 학급 코드 0000 (정민지 · 정민영 · 박준혁 · 이소미)
-- 기간 2026-04-06 ~ 2026-10-08 (수업일만 · 여름방학/공휴일 제외)
--
-- 만드는 것
--   · 풀이 기록: 문제풀이 · 배틀 · 레이드 (학급 0000에 있는 수학 문제 중에서 고름)
--   · 학생 상태: 포인트 · 레벨 · 경험치 · 가방(볼·간식 등) · 배틀 포켓몬 · 진화 · 도감 보상 · 가입일
--   · 도감: 잡은 포켓몬 (스타팅 · 배틀 · 탐색 · 진화 · 레이드 보상)
--   · 문제 은행 오답률(푼 횟수/틀린 횟수)
--
-- 안전장치
--   · 실행 전 4명의 원래 상태와 도감을 demo_backup 표에 보관 → 지우기 SQL로 그대로 되돌림
--   · 시연 풀이 기록의 id는 모두 dec0de00- 로 시작 → 다른 기록은 건드리지 않음
--   · 여러 번 실행해도 됨 (이전 시연 기록을 지우고 다시 만듦, 원래 상태 보관본은 처음 것 유지)
--   · 학급 0000과 학생 4명 외에는 아무것도 바꾸지 않음
-- ================================================================
begin;

do $$
declare cls uuid; n int;
begin
  select id into cls from public.classes where class_code = '0000';
  if cls is null then raise exception '학급 코드 0000을 찾을 수 없어요.'; end if;
  select count(*) into n from public.students where class_id = cls and nickname in ('정민지','정민영','박준혁','이소미');
  if n <> 4 then raise exception '학급 0000에서 학생 4명(정민지·정민영·박준혁·이소미)을 모두 찾지 못했어요 (찾은 수: %).', n; end if;
  select count(*) into n from public.questions where class_id = cls;
  if n = 0 then raise exception '학급 0000에 문제가 없어요. 문제를 먼저 넣어 주세요.'; end if;
end $$;

-- 0) 원래 상태 보관 (처음 실행할 때 한 번만)
create table if not exists public.demo_backup (
  student_id uuid primary key,
  student jsonb not null,
  catches jsonb not null,
  saved_at timestamptz not null default now()
);
alter table public.demo_backup enable row level security;  -- 앱에서는 보이지 않음

insert into public.demo_backup (student_id, student, catches)
select s.id,
       jsonb_build_object('points', s.points, 'xp', s.xp, 'level', s.level, 'inventory', s.inventory,
                          'game_state', s.game_state, 'created_at', s.created_at),
       coalesce((select jsonb_agg(to_jsonb(c) - 'id' - 'student_id') from public.catches c where c.student_id = s.id), '[]'::jsonb)
from public.students s
where s.class_id = (select id from public.classes where class_code = '0000')
  and s.nickname in ('정민지','정민영','박준혁','이소미')
on conflict (student_id) do nothing;

-- 1) 이전 시연 풀이 기록 되돌리기
update public.questions q set tries = greatest(0, q.tries - x.t), wrong = greatest(0, q.wrong - x.w)
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like 'dec0de00-%' and question_id is not null group by question_id) x
where q.id = x.question_id;
delete from public.answer_logs where id::text like 'dec0de00-%';

-- 2) 주제(성취기준 묶음)별 문제 목록과 풀이 계획
create temp table demo_topic (tid int, nick text, topic text, tag_like text, body_rx text) on commit drop;
create temp table demo_topic_body (tid int, body text) on commit drop;
create temp table demo_plan (seq int, n int, at timestamptz, tid int, c text, d text, ok boolean) on commit drop;
create temp table demo_nick (n int, nick text) on commit drop;
"""

TAIL = r"""
-- 3) 학급 0000의 문제 중 주제에 맞는 문제 (본문 일치 → 없으면 태그·본문 조건)
create temp table demo_pool on commit drop as
with cls as (select id from public.classes where class_code = '0000'),
by_body as (
  select distinct b.tid, q.id from demo_topic_body b
  join public.questions q on q.class_id = (select id from cls) and btrim(q.body) = b.body
),
by_rule as (
  select t.tid, q.id from demo_topic t
  join public.questions q on q.class_id = (select id from cls) and q.tag like t.tag_like and q.body ~ t.body_rx
  where not exists (select 1 from by_body x where x.tid = t.tid)
)
select p.tid, q.id, q.type, q.difficulty, coalesce(q.raid_only, false) raid_only
from (select * from by_body union select * from by_rule) p join public.questions q on q.id = p.id;

-- 4) 풀이 기록 (정답 여부는 계획대로 — 포인트·경험치와 맞춤)
insert into public.answer_logs (id, student_id, question_id, correct, context, created_at, q_tag, q_difficulty, q_body, q_answer)
select overlay(gen_random_uuid()::text placing 'dec0de00' from 1 for 8)::uuid,
       s.id, q.id, pl.ok,
       case pl.c when 's' then 'solve' when 'b' then 'battle' else 'raid' end,
       pl.at, q.tag, q.difficulty, q.body,
       case when q.type = 'short' then q.options->>0 else q.options->>q.answer_idx end
from demo_plan pl
join demo_nick dn on dn.n = pl.n
join public.students s on s.nickname = dn.nick and s.class_id = (select id from public.classes where class_code = '0000')
left join lateral (
  select pool.id from demo_pool pool
  where pool.tid = pl.tid and not pool.raid_only and (pl.c = 's' or pool.type <> 'short')
  order by (pl.d <> '' and left(pool.difficulty, 1) = pl.d) desc, md5(pool.id::text || pl.seq::text)
  limit 1
) p1 on true
left join lateral (
  select q2.id from public.questions q2
  where p1.id is null and q2.class_id = s.class_id and (pl.c = 's' or q2.type <> 'short')
  order by md5(q2.id::text || pl.seq::text) limit 1
) p2 on true
join public.questions q on q.id = coalesce(p1.id, p2.id);

-- 5) 문제 은행 오답률
update public.questions q set tries = q.tries + x.t, wrong = q.wrong + x.w
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like 'dec0de00-%' group by question_id) x
where q.id = x.question_id;

-- 6) 학생 상태 (포인트 · 레벨 · 경험치 · 가방 · 배틀 포켓몬/진화/도감 보상 · 가입일)
--    게임 상태 중 레이드 관련 값(raidReq/raidWin 등)은 지금 학급 설정과 맞물려 있어 그대로 둠
update public.students s set
  points = v.points, xp = v.xp, level = v.level, inventory = v.inventory::jsonb,
  game_state = (coalesce(s.game_state, '{}'::jsonb) - 'starter' - 'battlePid' - 'battleShiny' - 'wins' - 'evoCount' - 'dexRewards')
               || v.gs::jsonb,
  hp = 100,
  created_at = least(s.created_at, '2026-04-03 09:00+09'::timestamptz)
from (values
__STUDENTS__
) v(nick, points, xp, level, inventory, gs)
where s.nickname = v.nick and s.class_id = (select id from public.classes where class_code = '0000');

-- 7) 도감 (잡은 포켓몬) — 4명의 도감을 시연 내용으로 바꿈 (원래 도감은 demo_backup에 보관됨)
delete from public.catches c using public.students s
where c.student_id = s.id and s.class_id = (select id from public.classes where class_code = '0000')
  and s.nickname in ('정민지','정민영','박준혁','이소미');
insert into public.catches (student_id, pokemon_id, method, caught_at, count, shiny)
select s.id, v.pid, v.method, v.at::timestamptz, v.cnt, v.shiny
from (values
__CATCHES__
) v(nick, pid, method, at, cnt, shiny)
join public.students s on s.nickname = v.nick and s.class_id = (select id from public.classes where class_code = '0000');

commit;

-- 8) 결과 확인 — 학생별·월별: 활동한 날 / 푼 문제 / 정답률 / 배틀 / 레이드
select s.nickname as 학생, to_char(l.created_at at time zone 'Asia/Seoul', 'MM') || '월' as 월,
       count(distinct (l.created_at at time zone 'Asia/Seoul')::date) as 활동한_날,
       count(*) as 푼_문제,
       round(100.0 * avg(l.correct::int)) as 정답률,
       count(*) filter (where l.context = 'battle') as 배틀_답,
       count(*) filter (where l.context = 'raid') as 레이드_답
from public.answer_logs l join public.students s on s.id = l.student_id
where l.id::text like 'dec0de00-%'
group by 1, 2 order by 1, 2;
"""

with open(os.path.join(HERE, "시연기록_만들기_0000.sql"), "w", encoding="utf-8") as f:
    f.write(HEAD)
    f.write("insert into demo_nick values " + ", ".join(f"({i + 1},{lit(n)})" for i, n in enumerate(NICKS)) + ";\n")
    f.write("insert into demo_topic values\n" + ",\n".join(
        f"({tid},{lit(n)},{lit(name)},{lit(tag)},{lit(rx)})" for tid, n, name, tag, rx, _ in topics) + ";\n")
    rows = [(tid, b) for tid, *_x, bodies in topics for b in bodies]
    for i in range(0, len(rows), 200):
        f.write("insert into demo_topic_body values\n" + ",\n".join(f"({t},{lit(b)})" for t, b in rows[i:i + 200]) + ";\n")
    for i in range(0, len(plan), 1000):
        f.write("insert into demo_plan values\n" + ",\n".join(
            f"({i + k},{n},'{at.isoformat(timespec='seconds')}',{t},'{c}','{d}',{'true' if ok else 'false'})"
            for k, (n, at, t, c, d, ok) in enumerate(plan[i:i + 1000])) + ";\n")
    srows = ",\n".join(
        f"  ({lit(st.nick)}, {st.points}, {st.xp}, {st.level}, {lit(json.dumps(st.inv))}, {lit(gs_json(st))})"
        for st in students.values())
    crows = ",\n".join(
        f"  ({lit(st.nick)}, {pid}, {lit(c['method'])}, '{c['at'].isoformat(timespec='seconds')}', {c['count']}, {'true' if c['shiny'] else 'false'})"
        for st in students.values() for pid, c in sorted(st.catches.items(), key=lambda kv: kv[1]['at']))
    f.write(TAIL.replace("__STUDENTS__", srows).replace("__CATCHES__", crows))

with open(os.path.join(HERE, "시연기록_지우기_0000.sql"), "w", encoding="utf-8") as f:
    f.write("""-- ================================================================
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
""")

print("plan rows", len(plan), "topics", len(topics), "catch rows", sum(len(s.catches) for s in students.values()))
print("SQL size", os.path.getsize(os.path.join(HERE, "시연기록_만들기_0000.sql")))
