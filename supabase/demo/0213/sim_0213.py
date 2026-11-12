"""시연용 활동 기록 시뮬레이션 — 학급 0213 학생 4명, 2026-04-01 ~ 2026-10-30

사전·사후 평가(영역 5개 × 20점) 결과에 맞춰, 영역별 정답률이 사전 → 사후 수준으로 움직이도록 만든다.
게임 규칙(main): 데일리 퀴즈 → 문제풀이(최대 10) → 배틀(평일 2회 + 간식, 주말 가끔) → 야생 탐색(최대 3, 약 2/3 성공)
                → 레이드(한 달 1회, 전설 보스) → 상점 → 진화 · 도감 보상 · 교환
"""
import json, random, datetime as dt, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
KST = dt.timezone(dt.timedelta(hours=9))
D = dt.date.fromisoformat
START, END = D("2026-04-01"), D("2026-10-30")
SPAN = (END - START).days

# 학급 0213 등장 세대: 1·2·9세대
DEX = {p["id"]: p for p in json.load(open(os.path.join(HERE, "gens_129.json"), encoding="utf-8"))}
BY_RAR = collections.defaultdict(list)
for p in DEX.values():
    BY_RAR[p["rarity"]].append(p["id"])

RARITY = {"common": dict(catch=.9, hp=40, atk=10, pts=50, xp=20), "special": dict(catch=.75, hp=55, atk=13, pts=75, xp=30),
          "rare": dict(catch=.6, hp=70, atk=15, pts=100, xp=40), "legendary": dict(catch=.3, hp=120, atk=25, pts=300, xp=100)}
SNACKS = {"snack": (500, [("common", .7), ("special", .3)]), "snack2": (2000, [("special", .6), ("rare", .4)])}
DEX_MILESTONES = [(15, "poke", 3), (30, "superb", 3), (45, "hyper", 3), (60, "snack", 1), (75, "snack2", 1),
                  (90, "snack3", 1), (105, "master", 1), (120, "spray", 1), (135, "master", 1), (150, "spray", 1)]
DMG = {"easy": 10, "medium": 20, "hard": 35}
DIFF_ADJ = {"easy": .06, "medium": 0, "hard": -.10}

# ── 영역 5개 (사전·사후 평가와 같은 순서) ──
AREAS = {
    1: "받아올림·내림이 없는 두·세 자리 수의 덧셈과 뺄셈",
    2: "받아올림·내림이 1번 있는 두 자리 수의 덧셈과 뺄셈",
    3: "곱셈구구 및 곱셈구구 범위의 기초 나눗셈",
    4: "올림이 없는 (두 자리 수)×(한 자리 수)",
    5: "올림이 있는 (두 자리 수)×(한 자리 수)",
}
# 사전 → 사후 점수 (영역당 20점)
SCORES = {
    "정민지": {1: (0, 8), 2: (0, 4), 3: (0, 4), 4: (0, 0), 5: (0, 0)},
    "박준혁": {1: (8, 20), 2: (8, 20), 3: (8, 12), 4: (4, 4), 5: (0, 0)},
    "정민영": {1: (4, 12), 2: (0, 4), 3: (4, 8), 4: (0, 0), 5: (0, 0)},
    "이소미": {1: (12, 20), 2: (8, 16), 3: (8, 16), 4: (4, 8), 5: (0, 0)},
}
# 월별 영역 비중 (4월 … 10월) — 학생이 그달 주로 공부한 영역
M = [4, 5, 6, 7, 8, 9, 10]
MIX = {
    "정민지": {1: [1, 1, 1, 1, 1, .85, .7], 2: [0, 0, 0, 0, 0, .15, .18], 3: [0, 0, 0, 0, 0, 0, .12]},
    "박준혁": {1: [.6, .45, .25, .2, .2, .15, .15], 2: [.4, .55, .75, .8, .4, .3, .25],
              3: [0, 0, 0, 0, .4, .55, .45], 4: [0, 0, 0, 0, 0, 0, .15]},
    "정민영": {1: [.8, .8, .8, .75, .55, .5, .5], 2: [0, 0, 0, 0, .25, .3, .3], 3: [.2, .2, .2, .25, .2, .2, .2]},
    "이소미": {1: [.55, .3, .15, .15, .12, .1, .1], 2: [.45, .7, .5, .3, .25, .2, .2],
              3: [0, 0, .35, .55, .4, .35, .3], 4: [0, 0, 0, 0, .23, .35, .32], 5: [0, 0, 0, 0, 0, 0, .08]},
}
# 정민영: 오르다가 가끔 실수가 몰리는 달 (정답률이 잠깐 내려감)
DIP = {"정민영": {6: -.05, 9: -.07}, "정민지": {6: -.02, 9: -.03}, "박준혁": {}, "이소미": {7: -.02}}

def mastery_acc(score):
    """평가 점수(20점 만점) → 4지선다 연습 정답률 (찍어도 25%)"""
    return .25 + .72 * (score / 20)

def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)

def area_start(nick, a):
    i = next(i for i, w in enumerate(MIX[nick][a]) if w > 0)
    return D(f"2026-{M[i]:02d}-01") if i else START

def acc_of(nick, a, day):
    s0, s1 = SCORES[nick][a]
    p0, p1 = mastery_acc(s0), mastery_acc(s1)
    st = area_start(nick, a)
    x = (day - st).days / max(1, (END - st).days)
    p = p0 + (p1 - p0) * ease(x)
    return p + DIP[nick].get(day.month, 0)

def area_weights(nick, day):
    i = M.index(day.month)
    return {a: ws[i] for a, ws in MIX[nick].items() if ws[i] > 0}

# 학생 프로필 (참여): 스타팅, 문제풀이 참여 확률·문항 수, 탐색, 기술 선택, 퀴즈
def lin(a, b):
    return lambda d: a + (b - a) * min(1, max(0, (d - START).days / SPAN))

PROFILE = {
    # 정민지: 정답률은 천천히, 참여(문제풀이)가 크게 늘어남
    "정민지": dict(starter=25, solve_p=lin(.30, .95), solve_n=lambda d: (3, 6) if d < D("2026-06-15") else (6, 10),
                  wk_p=lin(.15, .45), explore=lin(1.2, 2.4), moves=(.75, .2, .05), quiz=.7, snacky=.5),
    "박준혁": dict(starter=4, solve_p=lin(.82, .9), solve_n=lambda d: (7, 10), wk_p=lin(.3, .35), explore=lin(1.8, 2.2),
                  moves=(.3, .45, .25), quiz=.88, snacky=.3),
    "정민영": dict(starter=909, solve_p=lambda d: .62 if d.month == 8 else .82, solve_n=lambda d: (6, 10), wk_p=lin(.3, .3),
                  explore=lin(1.7, 1.9), moves=(.35, .45, .2), quiz=.8, snacky=.35),
    "이소미": dict(starter=906, solve_p=lin(.85, .8), solve_n=lambda d: (7, 10), wk_p=lin(.4, .3), explore=lin(2.0, 2.1),
                  moves=(.4, .4, .2), quiz=.8, snacky=.3),
}

HOLI = {D(x) for x in ["2026-05-05", "2026-05-25", "2026-06-03", "2026-08-17", "2026-09-24", "2026-09-25",
                       "2026-10-05", "2026-10-09"]}
# 레이드(형성평가) — 한 달 1회, 전설 포켓몬 보스 (1·2·9세대)
RAIDS = [("2026-04-24", 144), ("2026-05-22", 249), ("2026-06-26", 1007), ("2026-07-17", 250),
         ("2026-08-21", 1008), ("2026-09-18", 150), ("2026-10-23", 245)]
RAID_THRESHOLD = 2  # 협동 목표: 2명 이상 성공하면 반 전체가 보스 포켓몬 (선생님 설정 가정)

class Stu:
    def __init__(self, nick):
        self.nick = nick
        self.points, self.xp, self.level = 500, 0, 1
        self.inv = {"poke": 5, "superb": 0, "hyper": 0, "master": 0, "potion": 0, "revive": 0,
                    "stone": 0, "snack": 0, "snack2": 0, "snack3": 0, "snack4": 0, "spray": 0}
        stt = PROFILE[nick]["starter"]
        self.gs = {"starter": stt, "battlePid": stt, "battleShiny": False, "wins": {}, "evoCount": 0, "dexRewards": []}
        self.catches = {}
        self.logs = []  # (at, area, ctx, diff, ok)
        self.ev = collections.Counter()
        self.mev = collections.Counter()
        self.spent = collections.Counter()
        self.raid_tries = {}
        self.catch_(stt, "starter", dt.datetime(2026, 3, 31, 15, 10, tzinfo=KST))

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
    return "legendary" if r < .04 else "rare" if r < .18 else "special" if r < .45 else "common"

def use_ball(st, rar):
    order = (["master"] if rar == "legendary" else []) + (["hyper"] if rar in ("rare", "legendary") else []) + ["superb", "poke"]
    b = next((x for x in order if st.inv[x] > 0), None)
    if b:
        st.inv[b] -= 1
    return b

def main_area(nick, day):
    w = area_weights(nick, day)
    return max(w, key=w.get)

def answer(st, day, at, ctx, diff=None, area=None):
    w = area_weights(st.nick, day)
    a = area or random.choices(list(w), weights=list(w.values()))[0]
    # 레이드는 그날 수업에서 다룬 영역을 쉬운 문제 위주로 내는 형성평가 → 평소보다 조금 높게
    p = acc_of(st.nick, a, day) + (DIFF_ADJ[diff] if diff else 0) + st.noise + (.12 if ctx == "raid" else 0)
    ok = random.random() < max(.05, min(.97, p))
    st.logs.append((at, a, ctx, diff or "", ok))
    return ok

def nxt(t, lo=25, hi=80):
    return t + dt.timedelta(seconds=random.randint(lo, hi))

students = {n: Stu(n) for n in PROFILE}
RNG = {}
for i, n in enumerate(PROFILE):
    random.seed(213000 + 7919 * i)
    RNG[n] = random.getstate()
random.seed(213)
trades = []  # (at, from_nick, offer, to_nick, want)

day = START
while day <= END:
    weekend = day.weekday() >= 5 or day in HOLI
    raid_today = next((pid for ds, pid in RAIDS if D(ds) == day), None)
    winners = []
    for nick, st in students.items():
        random.setstate(RNG[nick])
        pr = PROFILE[nick]
        if weekend and random.random() > pr["wk_p"](day):
            RNG[nick] = random.getstate()
            continue
        st.ev["days"] += 1; st.mev[("days", day.month)] += 1
        st.noise = random.gauss(0, .02)
        t = dt.datetime(day.year, day.month, day.day, 9 if not weekend else 15, random.randint(0, 25), tzinfo=KST)
        # 데일리 퀴즈
        if random.random() < .9:
            st.ev["quiz"] += 1; st.mev[("quiz", day.month)] += 1
            if random.random() < pr["quiz"]:
                st.points += 150
                r = random.random()
                st.inv["poke" if r < .5 else "superb" if r < .8 else "hyper"] += 1
            else:
                st.inv["poke"] += 1
        # 문제풀이 (평일 수업 시간, 주말엔 가끔)
        if random.random() < pr["solve_p"](day) * (.5 if weekend else 1):
            slot = random.choice([(10, 0), (10, 50), (11, 40), (13, 30), (14, 20)]) if not weekend else (16, 0)
            t = dt.datetime(day.year, day.month, day.day, slot[0], slot[1] + random.randint(0, 8), tzinfo=KST)
            lo, hi = pr["solve_n"](day)
            for _ in range(random.randint(lo, hi)):
                t = nxt(t, 30, 90)
                if answer(st, day, t, "solve"):
                    st.points += 20
                    st.add_xp(2)
                st.ev["solve"] += 1; st.mev[("solve", day.month)] += 1
            st.ev["solve_days"] += 1; st.mev[("solve_days", day.month)] += 1
        # 배틀: 평일 2회(빠짐없이), 주말은 1~2회 + 간식 배틀
        nb = 2 if not weekend else random.choice([1, 2])
        snack_battle = next((k for k in ("snack2", "snack") if st.inv[k] > 0 and random.random() < .5), None)
        for snack in [None] * nb + ([snack_battle] if snack_battle else []):
            if snack:
                st.inv[snack] -= 1
                r, acc = random.random(), 0
                rar = SNACKS[snack][1][-1][0]
                for rr, pp in SNACKS[snack][1]:
                    acc += pp
                    if r < acc:
                        rar = rr
                        break
                st.ev["snack_used"] += 1; st.mev[("snack_used", day.month)] += 1
            else:
                rar = roll_rarity()
            pid = random.choice(BY_RAR[rar])
            shiny = random.random() < 1 / 40
            whp, myhp = RARITY[rar]["hp"], 100
            st.ev["battles"] += 1; st.mev[("battles", day.month)] += 1
            t = nxt(t, 40, 120)
            while whp > 0 and myhp > 0:
                diff = random.choices(["easy", "medium", "hard"], weights=pr["moves"])[0]
                t = nxt(t, 20, 60)
                if answer(st, day, t, "battle", diff):
                    st.add_xp(2)
                    whp -= DMG[diff] * (1.5 if random.random() < .3 else 1)
                else:
                    myhp -= RARITY[rar]["atk"] * .6  # 배틀 시작 시 회복약·방어 고려 (실제 기록상 대부분 승리)
            if whp > 0:
                st.ev["battle_lost"] += 1; st.mev[("battle_lost", day.month)] += 1
                continue
            st.ev["battle_won"] += 1; st.mev[("battle_won", day.month)] += 1
            bp = str(st.gs["battlePid"])
            st.gs["wins"][bp] = st.gs["wins"].get(bp, 0) + 1
            t = nxt(t, 10, 30)
            caught = False
            for _ in range(3):
                b = use_ball(st, rar)
                if not b:
                    break
                bonus = {"poke": -.1, "superb": .15, "hyper": .3, "master": 1}[b]
                if random.random() < max(.05, min(1, RARITY[rar]["catch"] + bonus)):
                    caught = True
                    break
            if caught:
                st.catch_(pid, "battle", t, shiny)
                st.points += RARITY[rar]["pts"]
                st.add_xp(RARITY[rar]["xp"])
                st.ev["caught_battle"] += 1; st.mev[("caught_battle", day.month)] += 1
            cur = st.gs["battlePid"]
            evos = [e for e in DEX[cur]["evo"] if not e["stone"]]
            need = DEX[cur]["wins"]
            if evos and st.gs["wins"].get(str(cur), 0) >= need:
                to = evos[0]["to"]
                st.gs["wins"][str(cur)] -= need
                st.catches[cur]["count"] = max(0, st.catches[cur]["count"] - 1)
                st.catch_(to, "evolve", t)
                st.gs["battlePid"] = to
                st.gs["evoCount"] += 1
                st.ev["evolve"] += 1; st.mev[("evolve", day.month)] += 1
        # 야생 탐색 (최대 3, 약 2/3 성공)
        ne = min(3, max(0, round(random.gauss(pr["explore"](day), .6))))
        t = nxt(t, 60, 300)
        for _ in range(ne):
            rar = roll_rarity()
            pid = random.choice(BY_RAR[rar])
            st.ev["explore"] += 1; st.mev[("explore", day.month)] += 1
            t = nxt(t, 30, 90)
            if use_ball(st, rar) and random.random() < {"common": .78, "special": .68, "rare": .52, "legendary": .25}[rar]:
                st.catch_(pid, "explore", t, random.random() < 1 / 40)
                st.ev["explore_ok"] += 1; st.mev[("explore_ok", day.month)] += 1
        # 레이드 (형성평가): 보스 체력 10칸, 5번 틀리면 실패 → 다시 도전
        if raid_today:
            t = dt.datetime(day.year, day.month, day.day, 13, 40 + random.randint(0, 10), tzinfo=KST)
            tries, won = 0, False
            ra = main_area(nick, day)  # 레이드 = 그달 주로 배운 영역의 형성평가
            while not won and tries < 4:
                tries += 1
                hits = wrong = 0
                while hits < 10 and wrong < 5:
                    t = nxt(t, 20, 50)
                    if answer(st, day, t, "raid", random.choices(["easy", "medium", "hard"], weights=(.6, .3, .1))[0], ra):
                        hits += 1
                    else:
                        wrong += 1
                won = hits >= 10
                t = nxt(t, 60, 180)
            st.raid_tries[day.month] = (tries, won)
            st.ev["raid"] += 1; st.mev[("raid", day.month)] += 1
            if won:
                winners.append(st)
                st.ev["raid_won"] += 1; st.mev[("raid_won", day.month)] += 1
        # 상점
        balls = st.inv["poke"] + st.inv["superb"] + st.inv["hyper"]
        if balls < 6 and st.points >= 300:
            if st.points >= 1500 and random.random() < .5:
                st.inv["superb"] += 3; st.points -= 900; st.spent["슈퍼볼"] += 3
            else:
                n = min(8, st.points // 100 // 2)
                st.inv["poke"] += n; st.points -= 100 * n; st.spent["몬스터볼"] += n
        if st.points >= 2600 and random.random() < pr["snacky"]:
            k = "snack2" if st.points >= 5000 and random.random() < .4 else "snack"
            st.inv[k] += 1; st.points -= SNACKS[k][0]; st.spent["고급 간식" if k == "snack2" else "일반 간식"] += 1
        cur = st.gs["battlePid"]
        stone_evo = [e for e in DEX[cur]["evo"] if e["stone"]]
        if stone_evo and st.points >= 2000 and st.inv["stone"] == 0 and day >= D("2026-06-01"):
            st.inv["stone"] += 1; st.points -= 1500; st.spent["진화의돌"] += 1
        if stone_evo and st.inv["stone"] > 0:
            to = stone_evo[0]["to"]
            st.inv["stone"] -= 1
            st.catches[cur]["count"] = max(0, st.catches[cur]["count"] - 1)
            st.catch_(to, "evolve", t)
            st.gs["battlePid"] = to
            st.gs["evoCount"] += 1
            st.ev["evolve"] += 1; st.mev[("evolve", day.month)] += 1
        for n, item, cnt in DEX_MILESTONES:
            if st.dex() >= n and n not in st.gs["dexRewards"]:
                st.inv[item] += cnt
                st.gs["dexRewards"].append(n)
        RNG[nick] = random.getstate()
    if raid_today:
        for st in winners:
            st.points += 200
        if len(winners) >= RAID_THRESHOLD:
            for st in students.values():
                st.catch_(raid_today, "raid", dt.datetime(day.year, day.month, day.day, 14, 30, tzinfo=KST))
    # 교환: 평일 점심(가끔) — 여러 마리 가진 포켓몬끼리 맞바꿈
    if not weekend and random.random() < .22:
        a, b = random.sample(list(students.values()), 2)
        give = [p for p, c in a.catches.items() if c["count"] >= 2 and p not in b.catches and p != a.gs["battlePid"]]
        take = [p for p, c in b.catches.items() if c["count"] >= 2 and p not in a.catches and p != b.gs["battlePid"]]
        if give and take:
            x, y = random.choice(give), random.choice(take)
            at = dt.datetime(day.year, day.month, day.day, 12, 20 + random.randint(0, 25), tzinfo=KST)
            a.catches[x]["count"] -= 1; b.catches[y]["count"] -= 1
            b.catch_(x, "trade", at); a.catch_(y, "trade", at)
            a.ev["trades"] += 1; b.ev["trades"] += 1
            trades.append((at, a.nick, x, b.nick, y))
    day += dt.timedelta(days=1)

def report():
    print("교환", len(trades))
    for st in students.values():
        acc = collections.defaultdict(lambda: [0, 0]); ad = collections.defaultdict(set)
        sv = collections.Counter(); ar = collections.defaultdict(lambda: [0, 0])
        for at, a, ctx, diff, ok in st.logs:
            m = at.month
            acc[m][0] += 1; acc[m][1] += ok; ad[m].add(at.date())
            if ctx == "solve": sv[m] += 1
        for at, a, ctx, diff, ok in st.logs:
            if at.month in (4, 10):
                ar[(at.month, a)][0] += 1; ar[(at.month, a)][1] += ok
        print(f"\n■ {st.nick} Lv{st.level} {st.points}P 도감 {st.dex()} 진화 {st.gs['evoCount']} {DEX[st.gs['battlePid']]['name']}")
        print("  월별(활동일/문제풀이/전체풀이/정답률):", "  ".join(f"{m}월 {len(ad[m])}일/{sv[m]}/{acc[m][0]}/{round(100*acc[m][1]/acc[m][0])}%" for m in sorted(acc)))
        print("  4월·10월 영역별 정답률:", {k: f"{round(100*v[1]/v[0])}%({v[0]})" for k, v in sorted(ar.items())})
        print("  레이드(시도,성공):", st.raid_tries)
        print("  활동:", dict(st.ev))

if __name__ == "__main__":
    report()
