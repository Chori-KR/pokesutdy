"""시연용 활동 기록 시뮬레이션 — 학급 0000 학생 4명, 2026-04-06 ~ 2026-10-08

진짜 사이트(main)의 게임 규칙 그대로 하루하루를 진행한다.
  출석 → 데일리 퀴즈 → 문제풀이(최대 10) → 배틀(하루 2회 + 간식) → 야생 탐색(최대 3)
  → (레이드 날) 레이드 → 상점(볼·간식·진화의돌) → 진화 · 도감 보상 · 중복 환전
결과: 풀이 기록 계획 + 학생 최종 상태(포인트·레벨·XP·가방·게임 상태) + 도감(catches)
"""
import json, random, datetime as dt, os, re, glob, collections

HERE = os.path.dirname(os.path.abspath(__file__))
random.seed(20261009)
KST = dt.timezone(dt.timedelta(hours=9))
D = dt.date.fromisoformat

GEN1 = {p["id"]: p for p in json.load(open(os.path.join(HERE, "gen1.json"), encoding="utf-8"))}
BY_RAR = collections.defaultdict(list)
for p in GEN1.values():
    BY_RAR[p["rarity"]].append(p["id"])

RARITY = {"common": dict(catch=.9, hp=40, atk=10, pts=50, xp=20), "special": dict(catch=.75, hp=55, atk=13, pts=75, xp=30),
          "rare": dict(catch=.6, hp=70, atk=15, pts=100, xp=40), "legendary": dict(catch=.3, hp=120, atk=25, pts=300, xp=100)}
BALLS = {"poke": (100, -.1), "superb": (300, .15), "hyper": (800, .3), "master": (5000, 1)}
SNACKS = {"snack": (500, [("common", .7), ("special", .3)]), "snack2": (2000, [("special", .6), ("rare", .4)])}
DEX_MILESTONES = [(15, "poke", 3), (30, "superb", 3), (45, "hyper", 3), (60, "snack", 1), (75, "snack2", 1),
                  (90, "snack3", 1), (105, "master", 1), (120, "spray", 1), (135, "master", 1), (150, "spray", 1)]
DUPE = {"common": 30, "special": 50, "rare": 70, "legendary": 150}
DMG = {"easy": 10, "medium": 20, "hard": 35}
DIFF_ADJ = {"easy": .08, "medium": 0, "hard": -.12}

# ── 문제 주제 (성취기준 묶음) — 정답률이 날짜에 따라 변한다 ──
# (이름, 시작, 끝, 처음 정답률, 끝 정답률, 비중)
TOPICS = {
    "정민지": [  # 성취도는 거의 그대로, 참여도가 크게 늘어남
        ("수 세기·순서", "2026-04-06", "2026-10-08", .44, .50, 4),
        ("가르기·모으기", "2026-05-11", "2026-10-08", .40, .46, 3),
        ("덧셈 상황", "2026-06-08", "2026-10-08", .38, .45, 3),
        ("두 자리 수 덧셈(받아올림)", "2026-09-01", "2026-10-08", .30, .34, 1),
    ],
    "정민영": [
        ("두 자리 수 덧셈·뺄셈", "2026-04-06", "2026-05-29", .60, .90, 3),
        ("곱셈의 뜻", "2026-04-20", "2026-06-30", .50, .88, 3),
        ("곱셈구구", "2026-05-18", "2026-09-30", .50, .91, 4),
        ("(몇십몇)×(몇)", "2026-08-24", "2026-10-08", .55, .80, 3),
        ("나눗셈의 뜻(시작 단계)", "2026-09-28", "2026-10-08", .40, .48, 1),
    ],
    "박준혁": [
        ("분수의 뜻·종류", "2026-04-06", "2026-06-26", .40, .88, 3),
        ("분모가 같은 분수의 덧셈·뺄셈", "2026-05-11", "2026-10-08", .35, .84, 4),
        ("시각·시간(초2)", "2026-04-06", "2026-07-10", .40, .88, 2),
        ("초 단위 시간 계산", "2026-06-08", "2026-10-08", .45, .80, 3),
        ("길이 m·cm", "2026-04-06", "2026-07-10", .40, .88, 2),
        ("거리 km·m, mm·cm", "2026-06-08", "2026-10-08", .45, .82, 3),
        ("분모가 다른 분수(시작 단계)", "2026-09-21", "2026-10-08", .50, .58, 1),
    ],
    "이소미": [
        ("분수의 뜻", "2026-04-06", "2026-07-10", .18, .66, 3),
        ("분모가 같은 분수의 덧셈·뺄셈", "2026-06-08", "2026-10-08", .28, .58, 3),
        ("시각 읽기", "2026-04-06", "2026-09-18", .18, .64, 3),
        ("시간 계산", "2026-08-24", "2026-10-08", .36, .52, 2),
        ("길이 cm·m", "2026-04-06", "2026-07-10", .20, .68, 3),
        ("길이 계산·km", "2026-06-08", "2026-10-08", .28, .56, 2),
    ],
}

# 학생 프로필: 스타팅 포켓몬, 월별 출석 확률, 문제풀이 수, 기술 선택(쉬움/보통/어려움), 탐색 횟수, 퀴즈 정답률
def lin(a, b):  # 4월 a → 10월 b
    return lambda d: a + (b - a) * min(1, max(0, (d - D("2026-04-06")).days / 185))

PROFILE = {
    "정민지": dict(starter=25, attend=lin(.30, .92), solve=lambda d: (3, 6) if d < D("2026-06-15") else (5, 10),
                  battles=lin(.7, 2.0), explore=lin(.3, 1.8), moves=(.75, .2, .05), quiz=.7, snacky=.5),
    "정민영": dict(starter=7, attend=lin(.62, .72), solve=lambda d: (7, 10), battles=lin(1.4, 1.7), explore=lin(.9, 1.2),
                  moves=(.2, .5, .3), quiz=.85, snacky=.35),
    "박준혁": dict(starter=4, attend=lin(.6, .72), solve=lambda d: (6, 10), battles=lin(1.3, 1.7), explore=lin(.8, 1.2),
                  moves=(.35, .45, .2), quiz=.85, snacky=.3),
    "이소미": dict(starter=1, attend=lin(.55, .66), solve=lambda d: (5, 9), battles=lin(1.1, 1.5), explore=lin(.7, 1.0),
                  moves=(.45, .4, .15), quiz=.75, snacky=.3),
}

def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)

def topic_now(nick, day):
    act = []
    for (name, s, e, p0, p1, w) in TOPICS[nick]:
        s, e = D(s), D(e)
        if day < s:
            continue
        frac = (day - s).days / max(1, (e - s).days)
        p = p0 + (p1 - p0) * ease(frac) if day <= e else min(p1 + .03, .95)
        ramp = min(1.0, .3 + (day - s).days / 21)
        act.append((name, p, w * ramp if day <= e else w * .25))
    return act

# ── 수업일 ──
HOLI = {D(x) for x in ["2026-05-05", "2026-05-25", "2026-06-03", "2026-08-17", "2026-09-24", "2026-09-25",
                       "2026-09-28", "2026-10-05", "2026-10-09"]}
DAYS = []
d = D("2026-04-06")
while d <= D("2026-10-08"):
    if d.weekday() < 5 and d not in HOLI and not (D("2026-07-22") <= d <= D("2026-08-16")):
        DAYS.append(d)
    d += dt.timedelta(days=1)

# 레이드(형성평가) 날짜와 보스 — 한 달에 한 번쯤
RAIDS = [("2026-04-24", 143), ("2026-05-22", 131), ("2026-06-26", 144), ("2026-07-17", 145),
         ("2026-09-11", 146), ("2026-10-02", 150)]
RAID_THRESHOLD = 3  # 협동 달성 인원 (선생님 설정 가정)

class S:  # 학생 상태
    def __init__(self, nick):
        self.nick = nick
        self.points, self.xp, self.level = 500, 0, 16
        self.inv = {"poke": 3, "superb": 0, "hyper": 0, "master": 0, "potion": 0, "revive": 0,
                    "stone": 0, "snack": 0, "snack2": 0, "snack3": 0, "snack4": 0, "spray": 0}
        st = PROFILE[nick]["starter"]
        self.gs = {"starter": st, "battlePid": st, "battleShiny": False, "wins": {}, "evoCount": 0, "dexRewards": []}
        self.catches = {}  # pid -> dict(count, method, at, shiny)
        self.logs = []     # (at, topic, ctx, diff, correct)
        self.events = collections.Counter()
        self.spent = collections.Counter()
        self.catch_(st, "starter", dt.datetime(2026, 4, 6, 9, 5, tzinfo=KST))

    def add_xp(self, n):
        self.xp += n
        while self.xp >= 100:
            self.xp -= 100
            self.level += 1
            self.points += 100 + (400 if self.level % 5 == 0 else 0)

    def catch_(self, pid, method, at, shiny=False):
        c = self.catches.get(pid)
        if c:
            c["count"] += 1
            c["shiny"] = c["shiny"] or shiny
        else:
            self.catches[pid] = dict(count=1, method=method, at=at, shiny=shiny)

    def dex(self):
        return len(self.catches)

def roll_rarity():
    r = random.random()
    return "legendary" if r < .05 else "rare" if r < .20 else "special" if r < .45 else "common"

def throw(st, rar, at, method):
    """볼을 던져 잡기. 성공하면 True"""
    order = (["master"] if rar == "legendary" else []) + (["hyper"] if rar in ("rare", "legendary") else []) + ["superb", "poke"]
    tries = 0
    while tries < 3:
        ball = next((b for b in order if st.inv[b] > 0), None)
        if not ball:
            return False
        st.inv[ball] -= 1
        tries += 1
        if random.random() < max(.05, min(1, RARITY[rar]["catch"] + BALLS[ball][1])):
            return True
    return False

def answer(st, day, at, ctx, diff=None):
    act = topic_now(st.nick, day)
    name, p, _ = random.choices(act, weights=[a[2] for a in act])[0]
    pp = p + (DIFF_ADJ[diff] if diff else 0) + st.noise
    ok = random.random() < max(.03, min(.97, pp))
    st.logs.append((at, name, ctx, diff or "", ok))
    return ok

students = {n: S(n) for n in PROFILE}

def nxt(t, lo=25, hi=80):
    return t + dt.timedelta(seconds=random.randint(lo, hi))

for day in DAYS:
    raid_today = next((pid for ds, pid in RAIDS if D(ds) == day), None)
    winners = []
    for nick, st in students.items():
        pr = PROFILE[nick]
        if random.random() > pr["attend"](day) and not raid_today:
            continue
        st.events["days"] += 1
        st.noise = random.gauss(0, .04)
        t = dt.datetime(day.year, day.month, day.day, 9, random.randint(0, 25), tzinfo=KST)
        # 데일리 퀴즈 (포켓몬 이름 맞히기)
        if random.random() < .9:
            st.events["quiz"] += 1
            if random.random() < pr["quiz"]:
                st.points += 150
                r = random.random()
                st.inv["poke" if r < .5 else "superb" if r < .8 else "hyper"] += 1
            else:
                st.inv["poke"] += 1
        # 수업 시간: 문제풀이
        slot = random.choice([(10, 0), (10, 50), (11, 40), (13, 30), (14, 20)])
        t = dt.datetime(day.year, day.month, day.day, slot[0], slot[1] + random.randint(0, 8), tzinfo=KST)
        lo, hi = pr["solve"](day)
        for _ in range(random.randint(lo, hi)):
            t = nxt(t, 30, 90)
            if answer(st, day, t, "solve"):
                st.points += 20
                st.add_xp(2)
            st.events["solve"] += 1
        # 배틀 (하루 2회 + 간식)
        nb = min(2, max(0, round(random.gauss(pr["battles"](day), .5))))
        snack_battle = None
        for k in ("snack2", "snack"):
            if st.inv[k] > 0 and random.random() < .6:
                snack_battle = k
                break
        plan_b = [None] * nb + ([snack_battle] if snack_battle else [])
        for snack in plan_b:
            if snack:
                st.inv[snack] -= 1
                r, acc = random.random(), 0
                rar = SNACKS[snack][1][-1][0]
                for rr, pp in SNACKS[snack][1]:
                    acc += pp
                    if r < acc:
                        rar = rr
                        break
                st.events["snack_used"] += 1
            else:
                rar = roll_rarity()
            pid = random.choice(BY_RAR[rar])
            shiny = random.random() < 1 / 40
            whp, myhp = RARITY[rar]["hp"], 100
            st.events["battles"] += 1
            t = nxt(t, 40, 120)
            while whp > 0 and myhp > 0:
                diff = random.choices(["easy", "medium", "hard"], weights=pr["moves"])[0]
                t = nxt(t, 20, 60)
                if answer(st, day, t, "battle", diff):
                    st.add_xp(2)
                    whp -= DMG[diff] * (1.5 if random.random() < .3 else 1)
                else:
                    myhp -= RARITY[rar]["atk"]
            if whp > 0:
                st.events["battle_lost"] += 1
                continue
            st.events["battle_won"] += 1
            bp = str(st.gs["battlePid"])
            st.gs["wins"][bp] = st.gs["wins"].get(bp, 0) + 1
            t = nxt(t, 10, 30)
            if throw(st, rar, t, "battle"):
                st.catch_(pid, "battle", t, shiny)
                st.points += RARITY[rar]["pts"]
                st.add_xp(RARITY[rar]["xp"])
                st.events["caught_battle"] += 1
            # 진화 (승수)
            cur = st.gs["battlePid"]
            evos = [e for e in GEN1[cur]["evo"] if not e["stone"]]
            need = GEN1[cur]["wins"]
            if evos and st.gs["wins"].get(str(cur), 0) >= need:
                to = evos[0]["to"]
                st.gs["wins"][str(cur)] -= need
                st.catches[cur]["count"] = max(0, st.catches[cur]["count"] - 1)
                st.catch_(to, "evolve", t)
                st.gs["battlePid"] = to
                st.gs["evoCount"] += 1
                st.events["evolve"] += 1
        # 야생 탐색 (최대 3)
        ne = min(3, max(0, round(random.gauss(pr["explore"](day), .6))))
        t = nxt(t, 60, 300)
        for _ in range(ne):
            rar = roll_rarity()
            pid = random.choice(BY_RAR[rar])
            st.events["explore"] += 1
            t = nxt(t, 30, 90)
            if throw(st, rar, t, "explore"):
                st.catch_(pid, "explore", t, random.random() < 1 / 40)
                st.events["caught_explore"] += 1
        # 레이드
        if raid_today:
            hits = wrong = 0
            t = dt.datetime(day.year, day.month, day.day, 13, 40 + random.randint(0, 10), tzinfo=KST)
            while hits < 10 and wrong < 5:
                t = nxt(t, 20, 50)
                if answer(st, day, t, "raid", random.choices(["easy", "medium", "hard"], weights=pr["moves"])[0]):
                    hits += 1
                else:
                    wrong += 1
            st.events["raid"] += 1
            if hits >= 10:
                winners.append(st)
                st.events["raid_won"] += 1
        # 상점: 볼이 떨어지면 사고, 여유가 있으면 간식·진화의돌
        balls = st.inv["poke"] + st.inv["superb"] + st.inv["hyper"]
        if balls < 4 and st.points >= 300:
            if st.points >= 1500 and random.random() < .5:
                st.inv["superb"] += 3; st.points -= 900; st.spent["슈퍼볼"] += 3
            else:
                n = min(5, st.points // 100 // 2)
                st.inv["poke"] += n; st.points -= 100 * n; st.spent["몬스터볼"] += n
        if st.points >= 2600 and random.random() < PROFILE[nick]["snacky"]:
            k = "snack2" if st.points >= 5000 and random.random() < .4 else "snack"
            st.inv[k] += 1; st.points -= SNACKS[k][0]; st.spent["고급 간식" if k == "snack2" else "일반 간식"] += 1
        cur = st.gs["battlePid"]
        stone_evo = [e for e in GEN1[cur]["evo"] if e["stone"]]
        if stone_evo and st.points >= 2000 and st.inv["stone"] == 0 and day >= D("2026-06-01"):
            st.inv["stone"] += 1; st.points -= 1500; st.spent["진화의돌"] += 1
        if stone_evo and st.inv["stone"] > 0:
            to = stone_evo[0]["to"]
            st.inv["stone"] -= 1
            st.catches[cur]["count"] = max(0, st.catches[cur]["count"] - 1)
            st.catch_(to, "evolve", t)
            st.gs["battlePid"] = to
            st.gs["evoCount"] += 1
            st.events["evolve"] += 1
        # 도감 보상
        for n, item, cnt in DEX_MILESTONES:
            if st.dex() >= n and n not in st.gs["dexRewards"]:
                st.inv[item] += cnt
                st.gs["dexRewards"].append(n)
        # 중복 포켓몬 환전 (가끔, 금요일)
        if day.weekday() == 4 and random.random() < .25:
            for pid, c in st.catches.items():
                if c["count"] > 2 and pid != st.gs["battlePid"]:
                    st.points += DUPE[GEN1[pid]["rarity"]] * (c["count"] - 1)
                    st.events["dupes_converted"] += c["count"] - 1
                    c["count"] = 1
    # 레이드 보상: 성공자 +200P, 협동 달성(3명 이상 성공) 시 반 전체에 보스 포켓몬
    if raid_today:
        for st in winners:
            st.points += 200
        if len(winners) >= RAID_THRESHOLD:
            for st in students.values():
                st.catch_(raid_today, "raid", dt.datetime(day.year, day.month, day.day, 14, 30, tzinfo=KST))

if __name__ == "__main__":
    for st in students.values():
        acc = collections.defaultdict(lambda: [0, 0])
        for at, name, ctx, diff, ok in st.logs:
            m = at.strftime("%m")
            acc[m][0] += 1; acc[m][1] += ok
        days = collections.Counter(at.strftime("%m") for at, *_ in st.logs if True)
        act_days = collections.defaultdict(set)
        for at, *_ in st.logs:
            act_days[at.strftime("%m")].add(at.date())
        print(f"\n■ {st.nick}  Lv{st.level} xp{st.xp}  {st.points}P  도감 {st.dex()}종  진화 {st.gs['evoCount']}  배틀포켓몬 {GEN1[st.gs['battlePid']]['name']}")
        print("   월별 (출석일 / 푼 문제 / 정답률):", "  ".join(f"{m}월 {len(act_days[m])}일/{acc[m][0]}/{round(100*acc[m][1]/acc[m][0])}%" for m in sorted(acc)))
        print("   활동:", dict(st.events))
        print("   구매:", dict(st.spent), " 가방:", {k: v for k, v in st.inv.items() if v})
    print("\n총 풀이 기록:", sum(len(s.logs) for s in students.values()))
