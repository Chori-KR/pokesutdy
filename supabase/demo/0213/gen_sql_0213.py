"""시연기록_만들기_0213.sql / 시연기록_지우기_0213.sql 만들기 (사전·사후 평가 기반, 영역 5개)"""
import os, json, runpy, io, contextlib, random, collections

HERE = os.path.dirname(os.path.abspath(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    SIM = runpy.run_path(os.path.join(HERE, "sim_0213.py"), run_name="sim")
students, trades, DEX, AREAS = SIM["students"], SIM["trades"], SIM["DEX"], SIM["AREAS"]
NICKS = ["정민지", "박준혁", "정민영", "이소미"]
lit = lambda s: "'" + str(s).replace("'", "''") + "'"
P = "dec0de13"
CLS = "(select id from public.classes where class_code = '0213')"

plan = []
for st in students.values():
    for at, a, ctx, diff, ok in st.logs:
        plan.append((NICKS.index(st.nick) + 1, at, a, ctx[0], diff[:1], ok))
plan.sort(key=lambda r: r[1])
need_areas = sorted({a for _, _, a, *_ in plan})
used_pids = sorted({pid for st in students.values() for pid in st.catches} | {x for t in trades for x in (t[2], t[4])})
cnt = collections.Counter((r[0], r[3]) for r in plan)

# 영역 분류 규칙 (태그 글자로) — 순서가 중요: 곱하기(올림 있음/없음) → 곱셈구구·나눗셈 → 1번 있는 → 없는 덧셈·뺄셈
AREA_SQL = """case
    when q.tag ~ '올림이 *있는' and q.tag ~ '(곱|×|x)' then 5
    when q.tag ~ '올림이 *없는' and q.tag ~ '(곱|×|x)' then 4
    when q.tag ~ '(곱셈구구|나눗셈)' then 3
    when q.tag ~ '1 *번 *있는' then 2
    when q.tag ~ '없는' and q.tag ~ '(덧셈|뺄셈)' then 1
  end"""

HEAD = f"""-- ================================================================
-- 시연용 활동 기록 만들기 — 학급 코드 0213 (사전·사후 평가 기반)
--   1번 정민지 · 2번 박준혁 · 3번 정민영 · 4번 이소미 (모두 가명)
-- 기간 2026-04-01 ~ 2026-10-30
--
-- 사전 → 사후 (영역 5개 × 20점, 총점):  정민지 0 → 16 · 박준혁 28 → 56 · 정민영 8 → 24 · 이소미 32 → 60
--   영역 ① 받아올림·내림 없는 두·세 자리 덧셈·뺄셈  ② 받아올림·내림 1번 있는 두 자리 덧셈·뺄셈
--        ③ 곱셈구구·기초 나눗셈  ④ 올림 없는 (두 자리)×(한 자리)  ⑤ 올림 있는 (두 자리)×(한 자리)
--   학생마다 그달 공부한 영역의 문제로 풀이 기록을 만들고, 영역별 정답률이 사전 → 사후 수준으로 움직이게 함
--
-- 만드는 것
--   · 풀이 기록 {len(plan):,}개: 문제풀이 · 배틀 · 레이드 (학급 0213 문제를 태그로 영역 ①~⑤에 나눠 고름)
--   · 배틀 평일 하루 2회(빠짐없이) + 주말 가끔 + 간식 배틀 · 야생 탐색 약 2/3 성공
--   · 레이드 매달 1회(전설 포켓몬, 그달 주로 배운 영역의 형성평가) — 실패하면 다시 도전한 기록까지
--   · 학생 상태(포인트·레벨·경험치·가방·배틀 포켓몬·진화·도감 보상·가입일 3/31), 도감, 교환 {len(trades)}건, 문제 은행 오답률
--
-- 안전장치
--   · 실행 전 확인: 학급 0213, 학생 4명, 등장 세대(1·2·9세대 포함), 영역별 객관식 문제가 있는지
--     → 하나라도 다르면 아무것도 바꾸지 않고 멈추며 이유(지금 학급의 태그 목록 등)를 알려 줌
--   · 4명의 원래 상태·도감은 demo_backup_0213 표에 보관(처음 보관한 것 유지) → 지우기 SQL로 되돌림
--   · 시연 풀이 기록·교환 기록의 id는 모두 {P}- 로 시작 → 다른 기록은 건드리지 않음
--   · 여러 번 실행해도 됨 (이전 0213 시연 기록을 지우고 다시 만듦)
-- ================================================================
begin;

-- 0) 문제를 영역 ①~⑤로 나누기 (태그 글자로)
create temp table demo_q on commit drop as
select q.id, q.type, q.difficulty, coalesce(q.raid_only, false) as raid_only, q.tag,
  {AREA_SQL} as area
from public.questions q where q.class_id = {CLS};

do $$
declare cls uuid; n int; g jsonb; miss text; tags text;
begin
  select id, settings->'gens' into cls, g from public.classes where class_code = '0213';
  if cls is null then raise exception '학급 코드 0213을 찾을 수 없어요.'; end if;
  select count(*) into n from public.students where class_id = cls and nickname in ('정민지','박준혁','정민영','이소미');
  if n <> 4 then raise exception '학급 0213에서 학생 4명(정민지·박준혁·정민영·이소미)을 모두 찾지 못했어요 (찾은 수: %).', n; end if;
  if g is null or not (g @> '[1,2,9]'::jsonb) then
    raise exception '학급 0213의 등장 세대가 %예요. 이 SQL은 1·2·9세대 포켓몬을 쓰므로, 교사 메뉴 → 시스템 설정에서 1·2·9세대를 켜 주세요.', coalesce(g::text, '[1] (설정 없음)');
  end if;
  select string_agg('영역 ' || a::text, ', ') into miss
  from unnest(array[{",".join(map(str, need_areas))}]) a
  where not exists (select 1 from demo_q d where d.area = a and d.type <> 'short');
  if miss is not null then
    select string_agg(distinct tag, ' / ') into tags from demo_q;
    raise exception '객관식 문제를 찾지 못한 영역이 있어요: %. 지금 학급의 태그: %', miss, tags;
  end if;
end $$;

-- 1) 원래 상태 보관 (처음 실행할 때 한 번만)
create table if not exists public.demo_backup_0213 (
  student_id uuid primary key,
  student jsonb not null,
  catches jsonb not null,
  saved_at timestamptz not null default now()
);
alter table public.demo_backup_0213 enable row level security;
insert into public.demo_backup_0213 (student_id, student, catches)
select s.id,
       jsonb_build_object('points', s.points, 'xp', s.xp, 'level', s.level, 'inventory', s.inventory,
                          'game_state', s.game_state, 'created_at', s.created_at),
       coalesce((select jsonb_agg(to_jsonb(c) - 'id' - 'student_id') from public.catches c where c.student_id = s.id), '[]'::jsonb)
from public.students s
where s.class_id = {CLS} and s.nickname in ('정민지','박준혁','정민영','이소미')
on conflict (student_id) do nothing;

-- 2) 이전 0213 시연 기록 되돌리기
update public.questions q set tries = greatest(0, q.tries - x.t), wrong = greatest(0, q.wrong - x.w)
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like '{P}-%' and question_id is not null group by question_id) x
where q.id = x.question_id;
delete from public.answer_logs where id::text like '{P}-%';
delete from public.trades where id::text like '{P}-%';

-- 3) 도감에 쓰는 포켓몬이 pokemon_meta에 없으면 추가 (0010을 아직 안 넣은 DB 대비)
create temp table demo_meta (id int, name_ko text, type text, rarity text) on commit drop;
insert into demo_meta values
{",".join(f"({p},{lit(DEX[p]['name'])},{lit(DEX[p].get('type') or 'normal')},{lit(DEX[p]['rarity'])})" for p in used_pids)};
do $$
begin
  insert into public.pokemon_meta (id, name_ko, type, rarity) select id, name_ko, type, rarity from demo_meta on conflict (id) do nothing;
exception when check_violation then  -- 등급 4단계(0010) 전이면 '특별'을 '흔함'으로
  insert into public.pokemon_meta (id, name_ko, type, rarity)
  select id, name_ko, type, case when rarity = 'special' then 'common' else rarity end from demo_meta on conflict (id) do nothing;
end $$;

-- 4) 풀이 계획 (학생 번호, 시각, 영역, 상황 s/b/r, 기술 난이도 e/m/h, 정답 여부)
create temp table demo_nick (n int, nick text) on commit drop;
insert into demo_nick values {", ".join(f"({i + 1},{lit(n)})" for i, n in enumerate(NICKS))};
create temp table demo_plan (seq int, n int, at timestamptz, area int, c text, d text, ok boolean) on commit drop;
"""

TAIL = f"""
-- 5) 풀이 기록 — 계획한 영역의 문제 중에서 고름 (레이드는 레이드 전용 문제를 먼저, 배틀·레이드는 객관식만)
insert into public.answer_logs (id, student_id, question_id, correct, context, created_at)
select overlay(gen_random_uuid()::text placing '{P}' from 1 for 8)::uuid,
       s.id, pick.id, pl.ok,
       case pl.c when 's' then 'solve' when 'b' then 'battle' else 'raid' end, pl.at
from demo_plan pl
join demo_nick dn on dn.n = pl.n
join public.students s on s.nickname = dn.nick and s.class_id = {CLS}
cross join lateral (
  select d.id from demo_q d
  where d.area = pl.area and (pl.c = 's' or d.type <> 'short')
  order by (case when pl.c = 'r' then d.raid_only else not d.raid_only end) desc,
           (pl.d <> '' and left(d.difficulty, 1) = pl.d) desc,
           md5(d.id::text || pl.seq::text)
  limit 1
) pick;

-- 풀 당시 문제 내용 (0009를 넣은 DB만)
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'answer_logs' and column_name = 'q_body') then
    execute $q$
      update public.answer_logs l set q_tag = q.tag, q_difficulty = q.difficulty, q_body = q.body,
        q_answer = case when q.type = 'short' then q.options->>0 else q.options->>q.answer_idx end
      from public.questions q where l.question_id = q.id and l.id::text like '{P}-%'
    $q$;
  end if;
end $$;

-- 6) 문제 은행 오답률
update public.questions q set tries = q.tries + x.t, wrong = q.wrong + x.w
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like '{P}-%' group by question_id) x
where q.id = x.question_id;

-- 7) 학생 상태
update public.students s set
  points = v.points, xp = v.xp, level = v.level, inventory = v.inventory::jsonb,
  game_state = (coalesce(s.game_state, '{{}}'::jsonb) - 'starter' - 'battlePid' - 'battleShiny' - 'wins' - 'evoCount' - 'dexRewards')
               || v.gs::jsonb,
  hp = 100,
  created_at = least(s.created_at, '2026-03-31 15:00+09'::timestamptz)
from (values
__STUDENTS__
) v(nick, points, xp, level, inventory, gs)
where s.nickname = v.nick and s.class_id = {CLS};

-- 8) 도감
delete from public.catches c using public.students s
where c.student_id = s.id and s.class_id = {CLS} and s.nickname in ('정민지','박준혁','정민영','이소미');
insert into public.catches (student_id, pokemon_id, method, caught_at, count, shiny)
select s.id, v.pid, v.method, v.at::timestamptz, v.cnt, v.shiny
from (values
__CATCHES__
) v(nick, pid, method, at, cnt, shiny)
join public.students s on s.nickname = v.nick and s.class_id = {CLS};

-- 9) 교환 기록 (여러 마리 가진 포켓몬끼리)
insert into public.trades (id, class_id, code, from_student, offer_pokemon, status, to_student, want_pokemon, created_at, completed_at)
select overlay(gen_random_uuid()::text placing '{P}' from 1 for 8)::uuid, {CLS}, v.code,
       a.id, v.offer, 'done', b.id, v.want, v.at::timestamptz - interval '3 minutes', v.at::timestamptz
from (values
__TRADES__
) v(code, from_nick, offer, to_nick, want, at)
join public.students a on a.nickname = v.from_nick and a.class_id = {CLS}
join public.students b on b.nickname = v.to_nick and b.class_id = {CLS};

commit;

-- 10) 결과 확인 — 학생별·월별
select s.nickname as 학생, to_char(l.created_at at time zone 'Asia/Seoul', 'MM') || '월' as 월,
       count(distinct (l.created_at at time zone 'Asia/Seoul')::date) as 활동한_날,
       count(*) filter (where l.context = 'solve') as 문제풀이,
       count(*) filter (where l.context = 'battle') as 배틀_답,
       count(*) filter (where l.context = 'raid') as 레이드_답,
       round(100.0 * avg(l.correct::int)) as 정답률
from public.answer_logs l join public.students s on s.id = l.student_id
where l.id::text like '{P}-%'
group by 1, 2 order by 1, 2;
"""

out = os.path.join(HERE, "시연기록_만들기_0213.sql")
with open(out, "w", encoding="utf-8") as f:
    f.write(HEAD)
    for i in range(0, len(plan), 1000):
        f.write("insert into demo_plan values\n" + ",\n".join(
            f"({i + k},{n},'{at.isoformat(timespec='seconds')}',{a},'{c}','{d}',{'true' if ok else 'false'})"
            for k, (n, at, a, c, d, ok) in enumerate(plan[i:i + 1000])) + ";\n")
    srows = ",\n".join(
        f"  ({lit(st.nick)}, {st.points}, {st.xp}, {st.level}, {lit(json.dumps(st.inv))}, {lit(json.dumps(st.gs, ensure_ascii=False))})"
        for st in students.values())
    crows = ",\n".join(
        f"  ({lit(st.nick)}, {pid}, {lit(c['method'])}, '{c['at'].isoformat(timespec='seconds')}', {c['count']}, {'true' if c['shiny'] else 'false'})"
        for st in students.values() for pid, c in sorted(st.catches.items(), key=lambda kv: kv[1]['at']))
    rnd = random.Random(1302)
    codes = rnd.sample(range(100000, 999999), len(trades))
    trows = ",\n".join(
        f"  ('{codes[i]}', {lit(a)}, {x}, {lit(b)}, {y}, '{at.isoformat(timespec='seconds')}')"
        for i, (at, a, x, b, y) in enumerate(trades))
    f.write(TAIL.replace("__STUDENTS__", srows).replace("__CATCHES__", crows).replace("__TRADES__", trows))

with open(os.path.join(HERE, "시연기록_지우기_0213.sql"), "w", encoding="utf-8") as f:
    f.write(f"""-- ================================================================
-- 시연용 활동 기록 지우기 — 학급 0213 학생 4명을 시연 전 상태로 되돌림
--   · 시연 풀이 기록·교환 기록({P}-) 삭제 + 문제 오답률 원래대로
--   · 포인트·레벨·가방·게임 상태·가입일·도감을 demo_backup_0213 보관본으로 복원
-- ================================================================
begin;
update public.questions q set tries = greatest(0, q.tries - x.t), wrong = greatest(0, q.wrong - x.w)
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like '{P}-%' and question_id is not null group by question_id) x
where q.id = x.question_id;
delete from public.answer_logs where id::text like '{P}-%';
delete from public.trades where id::text like '{P}-%';
do $$
begin
  if to_regclass('public.demo_backup_0213') is null then return; end if;
  update public.students s set
    points = (b.student->>'points')::int, xp = (b.student->>'xp')::int, level = (b.student->>'level')::int,
    inventory = b.student->'inventory', game_state = b.student->'game_state',
    created_at = (b.student->>'created_at')::timestamptz
  from public.demo_backup_0213 b where b.student_id = s.id;
  delete from public.catches c using public.demo_backup_0213 b where c.student_id = b.student_id;
  insert into public.catches (student_id, pokemon_id, method, caught_at, count, shiny)
  select b.student_id, (e->>'pokemon_id')::smallint, coalesce(e->>'method', 'battle'),
         coalesce((e->>'caught_at')::timestamptz, now()), coalesce((e->>'count')::int, 1), coalesce((e->>'shiny')::boolean, false)
  from public.demo_backup_0213 b, jsonb_array_elements(b.catches) e;
  drop table public.demo_backup_0213;
end $$;
commit;
select count(*) as 남은_시연기록 from public.answer_logs where id::text like '{P}-%';
""")

print("plan", len(plan), "areas", need_areas, "trades", len(trades), "catch rows", sum(len(s.catches) for s in students.values()),
      "size", os.path.getsize(out))
