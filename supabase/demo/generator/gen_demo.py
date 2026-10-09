"""시연용 학습 기록 SQL 만들기 — 학급 0000의 학생 4명 (2026-04 ~ 2026-10)

- 학생마다 '성취기준 묶음(주제)'별로 언제 배우기 시작해서 언제까지 얼마나 늘었는지를 정해 두고
  날짜별 정답 확률을 계산한다. (실제 문제 선택·정답 여부 추첨은 SQL이 DB 안의 문제로 한다)
- 만든 기록은 id가 dec0de00- 로 시작 → 언제든 되돌리기(demo_undo.sql) 가능
"""
import json, glob, random, datetime as dt, re, sys, os

random.seed(20260409)
HERE = os.path.dirname(os.path.abspath(__file__))
KST = dt.timezone(dt.timedelta(hours=9))

# ── 문제 은행(성취기준 코드 포함)에서 주제별 문제 본문 모으기 ──
bank = []
for f in sorted(glob.glob(os.path.join(HERE, "banks", "bank_수학_초*.json"))):
    d = json.load(open(f, encoding="utf-8"))
    for q in d["questions"]:
        bank.append(q)

ADD = re.compile(r"(\+|덧셈|더하|더한|합)")
SUB = re.compile(r"(−|-|뺄셈|빼|뺀|차는|남은)")

def pick(stds, inc=None, exc=None):
    out = []
    for q in bank:
        if q["standard"] not in stds:
            continue
        b = q["body"]
        if inc and not inc.search(b):
            continue
        if exc and exc.search(b):
            continue
        out.append(q["body"].strip())
    return out

D = lambda s: dt.date.fromisoformat(s)

# 주제: (이름, 문제 본문 목록, 대체용 태그 조건, 대체용 본문 조건, 시작, 끝, 처음 정답률, 끝 정답률, 비중)
TOPICS = {
    "정민지": [
        ("수 세기·순서", pick({"2수01-01", "2수01-03"}), "%초1-2%수와 연산%", "(몇 개|순서|번째|큰 수|작은 수|세어)", "2026-04-06", "2026-07-10", .35, .86, 3),
        ("가르기·모으기", pick({"2수01-04"}), "%초1-2%수와 연산%", "(가르|모으|모아)", "2026-05-11", "2026-08-28", .30, .82, 3),
        ("덧셈 상황", pick({"2수01-05"}, None, re.compile(r"(뺄셈|빼|-|내렸|먹었|적습|남은)")) + pick({"2수01-09"}, ADD, re.compile(r"(뺄셈|빼|-)")), "%초1-2%수와 연산%", "(더하|모두 몇|덧셈)", "2026-06-08", "2026-09-18", .45, .86, 3),
        ("두 자리 수 덧셈(받아올림)", pick({"2수01-06", "2수01-08"}, ADD, re.compile(r"(−|뺄셈|빼)")), "%초1-2%수와 연산%", "[0-9]{2} ?\\+", "2026-09-01", "2026-10-08", .55, .80, 4),
        ("뺄셈(시작 단계)", pick({"2수01-05", "2수01-06"}, SUB), "%초1-2%수와 연산%", "(빼|뺄셈|남은)", "2026-09-14", "2026-10-08", .35, .45, 1),
    ],
    "정민영": [
        ("두 자리 수 덧셈·뺄셈", pick({"2수01-06", "2수01-08"}), "%초1-2%수와 연산%", "[0-9]{2}", "2026-04-06", "2026-05-29", .60, .90, 3),
        ("곱셈의 뜻", pick({"2수01-10"}), "%초1-2%수와 연산%", "(곱|묶음|씩|배)", "2026-04-20", "2026-06-30", .50, .88, 3),
        ("곱셈구구", pick({"2수01-11"}), "%초1-2%수와 연산%", "(×|times|곱셈구구)", "2026-05-18", "2026-09-30", .50, .91, 4),
        ("(몇십몇)×(몇)", pick({"4수01-04"}), "%초3-4%수와 연산%", "(×|times|곱)", "2026-08-24", "2026-10-08", .55, .80, 3),
        ("나눗셈의 뜻(시작 단계)", pick({"4수01-05"}), "%초3-4%수와 연산%", "(÷|div|나눗셈|나누)", "2026-09-28", "2026-10-08", .40, .48, 1),
    ],
    "박준혁": [
        ("분수의 뜻·종류", pick({"4수01-09", "4수01-10", "4수01-11"}), "%초3-4%수와 연산%", "(분수|frac)", "2026-04-06", "2026-06-26", .40, .88, 3),
        ("분모가 같은 분수의 덧셈·뺄셈", pick({"4수01-15"}, None, re.compile(r"소수")), "%초3-4%수와 연산%", "(frac|분수)", "2026-05-11", "2026-10-08", .35, .84, 4),
        ("시각·시간(초2)", pick({"2수03-07", "2수03-08", "2수03-09"}), "%초1-2%도형과 측정%", "(시각|시간|몇 시)", "2026-04-06", "2026-07-10", .40, .88, 2),
        ("초 단위 시간 계산", pick({"4수03-13", "4수03-14"}), "%초3-4%도형과 측정%", "(초|분|시간)", "2026-06-08", "2026-10-08", .45, .80, 3),
        ("길이 m·cm", pick({"2수03-10", "2수03-11", "2수03-13"}), "%초1-2%도형과 측정%", "(cm|m |길이)", "2026-04-06", "2026-07-10", .40, .88, 2),
        ("거리 km·m, mm·cm", pick({"4수03-15", "4수03-16"}), "%초3-4%도형과 측정%", "(km|mm|거리)", "2026-06-08", "2026-10-08", .45, .82, 3),
        ("분모가 다른 분수(시작 단계)", pick({"6수01-08"}), "%초5-6%수와 연산%", "(frac|분수)", "2026-09-21", "2026-10-08", .50, .58, 1),
    ],
    "이소미": [
        ("분수의 뜻", pick({"4수01-09", "4수01-10"}), "%초3-4%수와 연산%", "(분수|frac)", "2026-04-06", "2026-07-10", .25, .75, 3),
        ("분모가 같은 분수의 덧셈·뺄셈", pick({"4수01-15"}, None, re.compile(r"소수")), "%초3-4%수와 연산%", "(frac|분수)", "2026-06-08", "2026-10-08", .35, .64, 3),
        ("시각 읽기", pick({"2수03-07", "2수03-08"}), "%초1-2%도형과 측정%", "(시각|몇 시|시계)", "2026-04-06", "2026-09-18", .25, .72, 3),
        ("시간 계산", pick({"2수03-09", "4수03-13"}), "%초1-2%도형과 측정%", "(시간|분|초)", "2026-08-24", "2026-10-08", .42, .58, 2),
        ("길이 cm·m", pick({"2수03-10", "2수03-11"}), "%초1-2%도형과 측정%", "(cm|m |길이)", "2026-04-06", "2026-07-10", .30, .78, 3),
        ("길이 계산·km", pick({"2수03-13", "4수03-15", "4수03-16"}), "%도형과 측정%", "(km|cm|길이|거리)", "2026-06-08", "2026-10-08", .35, .62, 2),
    ],
}
SESS = {"정민지": (0.55, 6, 10), "정민영": (0.6, 8, 14), "박준혁": (0.6, 8, 14), "이소미": (0.55, 7, 12)}

# ── 수업일 ──
HOLI = {D(x) for x in ["2026-05-05", "2026-05-25", "2026-06-03", "2026-08-17", "2026-09-24", "2026-09-25",
                       "2026-09-28", "2026-10-05", "2026-10-09"]}
VAC = (D("2026-07-22"), D("2026-08-16"))
START, END = D("2026-04-06"), D("2026-10-08")
days = []
d = START
while d <= END:
    if d.weekday() < 5 and d not in HOLI and not (VAC[0] <= d <= VAC[1]):
        days.append(d)
    d += dt.timedelta(days=1)

def ease(x):  # 0~1 부드러운 곡선
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)

plan = []  # (nick, ts, topic, p, ctx)
for nick, topics in TOPICS.items():
    prob, lo, hi = SESS[nick]
    for day in days:
        if random.random() > prob:
            continue
        act = []
        for (name, bodies, tag, rx, s, e, p0, p1, w) in topics:
            s, e = D(s), D(e)
            if day < s:
                continue
            frac = (day - s).days / max(1, (e - s).days)
            p = p0 + (p1 - p0) * ease(frac) if day <= e else min(p1 + 0.03, 0.95)
            ramp = min(1.0, 0.3 + (day - s).days / 21)  # 새 주제는 처음 3주 동안 조금씩 늘림
            weight = w * ramp if day <= e else w * 0.25  # 끝난 주제는 가끔 복습
            act.append((name, p, weight))
        if not act:
            continue
        sess_noise = random.gauss(0, 0.05)
        slot = random.choice([(9, 10), (10, 0), (10, 50), (11, 40), (13, 30), (14, 20)])
        t = dt.datetime(day.year, day.month, day.day, slot[0], slot[1], tzinfo=KST) + dt.timedelta(minutes=random.randint(0, 20))
        for _ in range(random.randint(lo, hi)):
            name, p, _w = random.choices(act, weights=[a[2] for a in act])[0]
            ctx = "battle" if random.random() < 0.6 else "solve"
            plan.append((nick, t.isoformat(timespec="seconds"), name, round(max(0.03, min(0.97, p + sess_noise)), 3), ctx))
            t += dt.timedelta(seconds=random.randint(25, 85))

def lit(s):
    return "'" + s.replace("'", "''") + "'"

topic_rows = []
for nick, topics in TOPICS.items():
    for (name, bodies, tag, rx, *_rest) in topics:
        topic_rows.append((nick, name, tag, rx, sorted(set(bodies))))

with open(os.path.join(HERE, "demo_plan_summary.txt"), "w", encoding="utf-8") as f:
    for nick, name, tag, rx, bodies in topic_rows:
        f.write(f"{nick}\t{name}\t문제 {len(bodies)}개\n")
    f.write(f"계획된 풀이 수: {len(plan)}\n")

SQL_HEAD = r"""-- ============================================================
-- 시연용 학습 기록 만들기 — 학급 코드 0000 (정민지·정민영·이소미·박준혁)
-- 기간: 2026-04-06 ~ 2026-10-08 (수업일만, 여름방학·공휴일 제외)
--
-- · 학급 0000에 실제로 있는 문제 중에서 골라 풀이 기록(answer_logs)을 만듭니다.
-- · 만든 기록의 id는 모두 dec0de00- 로 시작합니다 → demo_undo.sql로 언제든 지울 수 있어요.
-- · 여러 번 실행해도 됩니다 (먼저 예전 시연 기록을 지우고 새로 만듦).
-- · 문제 은행의 '오답률'(tries/wrong)과 학생 '가입일'도 기록에 맞춰 고칩니다.
-- ============================================================
do $$
declare
  cls uuid;
  n int;
begin
  select id into cls from public.classes where class_code = '0000';
  if cls is null then raise exception '학급 코드 0000을 찾을 수 없어요.'; end if;
  select count(*) into n from public.students
   where class_id = cls and nickname in ('정민지','정민영','이소미','박준혁');
  if n <> 4 then raise exception '학급 0000에서 학생 4명(정민지·정민영·이소미·박준혁)을 모두 찾지 못했어요 (찾은 수: %).', n; end if;
end $$;

-- 1) 예전 시연 기록이 있으면 되돌리기 (오답률 원상복구 → 기록 삭제)
update public.questions q set tries = greatest(0, q.tries - x.t), wrong = greatest(0, q.wrong - x.w)
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like 'dec0de00-%' and question_id is not null
       group by question_id) x
where q.id = x.question_id;
delete from public.answer_logs where id::text like 'dec0de00-%';

-- 2) 주제별 문제 목록 (문제 은행 JSON의 성취기준으로 분류한 문제 본문)
create temp table demo_topic (nick text, topic text, tag_like text, body_rx text) on commit drop;
create temp table demo_topic_body (nick text, topic text, body text) on commit drop;
create temp table demo_plan (seq int, nick text, at timestamptz, topic text, p numeric, ctx text) on commit drop;
"""

with open(os.path.join(HERE, "demo_seed.sql"), "w", encoding="utf-8") as f:
    f.write("begin;\n")
    f.write(SQL_HEAD)
    f.write("insert into demo_topic values\n" + ",\n".join(
        f"({lit(n)},{lit(t)},{lit(tag)},{lit(rx)})" for n, t, tag, rx, _ in topic_rows) + ";\n")
    rows = [(n, t, b) for n, t, _, _, bodies in topic_rows for b in bodies]
    for i in range(0, len(rows), 200):
        f.write("insert into demo_topic_body values\n" + ",\n".join(
            f"({lit(n)},{lit(t)},{lit(b)})" for n, t, b in rows[i:i + 200]) + ";\n")
    for i in range(0, len(plan), 500):
        f.write("insert into demo_plan values\n" + ",\n".join(
            f"({i + k},{lit(n)},{lit(ts)},{lit(t)},{p},{lit(c)})" for k, (n, ts, t, p, c) in enumerate(plan[i:i + 500])) + ";\n")
    f.write(r"""
-- 3) 학급 0000의 문제 중 주제에 맞는 문제 고르기
--    (본문이 일치하는 문제 → 없으면 태그·본문 조건으로 비슷한 문제)
create temp table demo_pool on commit drop as
with cls as (select id from public.classes where class_code = '0000'),
by_body as (
  select distinct b.nick, b.topic, q.id
  from demo_topic_body b join public.questions q on q.class_id = (select id from cls) and btrim(q.body) = b.body
),
by_rule as (
  select t.nick, t.topic, q.id
  from demo_topic t join public.questions q
    on q.class_id = (select id from cls) and q.tag like t.tag_like and q.body ~ t.body_rx
  where not exists (select 1 from by_body x where x.nick = t.nick and x.topic = t.topic)
)
select p.nick, p.topic, q.id, q.type, q.difficulty, coalesce(q.raid_only, false) as raid_only
from (select * from by_body union select * from by_rule) p join public.questions q on q.id = p.id;

-- 4) 풀이 기록 만들기
select setseed(0.4096);
insert into public.answer_logs (id, student_id, question_id, correct, context, created_at, q_tag, q_difficulty, q_body, q_answer)
select
  overlay(gen_random_uuid()::text placing 'dec0de00' from 1 for 8)::uuid,
  s.id, q.id,
  random() < greatest(0.03, least(0.97, pl.p + case q.difficulty when 'easy' then 0.08 when 'hard' then -0.12 else 0 end)),
  case when q.type = 'short' then 'solve' else pl.ctx end,
  pl.at, q.tag, q.difficulty, q.body,
  case when q.type = 'short' then q.options->>0 else q.options->>q.answer_idx end
from demo_plan pl
join public.students s on s.nickname = pl.nick and s.class_id = (select id from public.classes where class_code = '0000')
cross join lateral (
  select pool.id from demo_pool pool
  where pool.nick = pl.nick and pool.topic = pl.topic and not pool.raid_only
    and (pl.ctx = 'solve' or pool.type <> 'short')
  order by md5(pool.id::text || pl.seq::text) limit 1
) pick
join public.questions q on q.id = pick.id;

-- 5) 문제 은행 오답률 반영
update public.questions q set tries = q.tries + x.t, wrong = q.wrong + x.w
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like 'dec0de00-%' group by question_id) x
where q.id = x.question_id;

-- 6) 가입일을 첫 기록 전으로
update public.students s set created_at = '2026-04-03 09:00+09'
where s.class_id = (select id from public.classes where class_code = '0000')
  and s.nickname in ('정민지','정민영','이소미','박준혁') and s.created_at > '2026-04-03 09:00+09';

commit;

-- 7) 결과 확인: 학생별·월별 푼 문제 수와 정답률
select s.nickname as 학생, to_char(l.created_at at time zone 'Asia/Seoul', 'YYYY-MM') as 월,
       count(*) as 푼_문제, round(100.0 * avg(l.correct::int)) as 정답률
from public.answer_logs l join public.students s on s.id = l.student_id
where l.id::text like 'dec0de00-%'
group by 1, 2 order by 1, 2;
""")

with open(os.path.join(HERE, "demo_undo.sql"), "w", encoding="utf-8") as f:
    f.write("""-- 시연용 학습 기록 지우기 (demo_seed.sql로 만든 것만; id가 dec0de00- 로 시작)
begin;
update public.questions q set tries = greatest(0, q.tries - x.t), wrong = greatest(0, q.wrong - x.w)
from (select question_id, count(*) t, count(*) filter (where not correct) w
        from public.answer_logs where id::text like 'dec0de00-%' and question_id is not null
       group by question_id) x
where q.id = x.question_id;
delete from public.answer_logs where id::text like 'dec0de00-%';
commit;
select count(*) as 남은_시연기록 from public.answer_logs where id::text like 'dec0de00-%';
""")
print(open(os.path.join(HERE, "demo_plan_summary.txt"), encoding="utf-8").read())
print("SQL size", os.path.getsize(os.path.join(HERE, "demo_seed.sql")))
