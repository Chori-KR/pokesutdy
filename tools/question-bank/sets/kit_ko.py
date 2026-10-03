"""국어 묶음 공통: 객관식 정답 위치를 고르게 맞추는 도우미 + 지문 점검.
보기를 쓰는 순서대로 두면 정답이 앞쪽에 몰리기 쉬워서, 정답과 목표 자리의 보기를 서로 맞바꾼다
(나머지 보기 순서는 그대로 — 보기 회전이 아님). keep=True면 건드리지 않는다(순서가 있는 보기)."""
PATTERN = [2, 0, 3, 1, 1, 3, 0, 2, 3, 1, 2, 0]


class KoBank:
    def __init__(self, bank):
        self.b = bank
        self.n = 0

    def passage(self, *a, **k):
        return self.b.passage(*a, **k)

    def q(self, std, level, body, options=None, answer=None, answers=None, keep=False, **kw):
        if options is not None and not keep:
            opts = [str(o) for o in options]
            ai = opts.index(str(answer))
            t = PATTERN[self.n % len(PATTERN)]
            self.n += 1
            opts[ai], opts[t] = opts[t], opts[ai]
            options = opts
        self.b.q(std, level, body, options=options, answer=answer, answers=answers, **kw)


def report(b, per_std, lo=100, hi=300):
    errs, pos, short = b.check(per_std)
    qs = b.questions
    used = {}
    for q in qs:
        if q.get("passage"):
            used[q["passage"]] = used.get(q["passage"], 0) + 1
    for p in b.passages:
        n = used.get(p["id"], 0)
        L = len(p["text"])
        if n < 2 or n > 4:
            errs.append(f"지문 {p['id']} 문제 수 {n}")
        if not (lo <= L <= hi):
            errs.append(f"지문 {p['id']} 길이 {L}자")
        if not p["source"]:
            errs.append(f"지문 {p['id']} 출처 없음")
    pq = sum(used.values())
    print("errors", errs)
    print("answer pos", dict(sorted(pos.items())), "short", short, "/", len(qs),
          "passages", len(b.passages), "passage-q", pq, f"({pq * 100 // len(qs)}%)",
          "svg", sum(1 for q in qs if q.get("svg")), "lens", [len(p["text"]) for p in b.passages])
