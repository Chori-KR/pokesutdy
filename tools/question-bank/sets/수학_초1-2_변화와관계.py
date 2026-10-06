"""수학 · 초1-2 · 변화와 관계 (2수02-01 ~ 02) — 18문제"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from common import Bank
from svgkit import svg, text, line, shape, row_of, BLUE, C

b = Bank("수학", "초", "수학", "초1-2", "변화와 관계", "bank_수학_초1-2_변화와관계.json")


def number_grid(start, end, marked, cols=10, cw=32, rh=30):
    """수 배열표: 표시한 수는 동그라미로 둘러쌈"""
    nums = list(range(start, end + 1))
    rows = (len(nums) + cols - 1) // cols
    W, H = cols * cw + 6, rows * rh + 6
    out = [f'<rect x="3" y="3" width="{W-6}" height="{H-6}" fill="none" stroke="{C}" stroke-width="2"/>']
    for c in range(1, cols):
        out.append(line(3 + c * cw, 3, 3 + c * cw, H - 3, 2, 0.5))
    for r in range(1, rows):
        out.append(line(3, 3 + r * rh, W - 3, 3 + r * rh, 2, 0.5))
    for i, n in enumerate(nums):
        r, c = divmod(i, cols)
        cx, cy = 3 + c * cw + cw / 2, 3 + r * rh + rh / 2
        if n in marked:
            out.append(f'<circle cx="{cx}" cy="{cy}" r="12" fill="none" stroke="{BLUE}" stroke-width="2.5"/>')
        out.append(text(cx, cy + 5, n, 13, weight="bold" if n in marked else None))
    return svg(W, H, "".join(out))


def add_table(n=4, marked=()):
    """덧셈표 (가로·세로 1~n)"""
    cw = 40
    W = H = (n + 1) * cw + 6
    out = [f'<rect x="3" y="3" width="{W-6}" height="{H-6}" fill="none" stroke="{C}" stroke-width="2"/>']
    for k in range(1, n + 1):
        out.append(line(3 + k * cw, 3, 3 + k * cw, H - 3, 3 if k == 1 else 2))
        out.append(line(3, 3 + k * cw, W - 3, 3 + k * cw, 3 if k == 1 else 2))
    out.append(text(3 + cw / 2, 3 + cw / 2 + 6, "+", 16, weight="bold"))
    for k in range(1, n + 1):
        out.append(text(3 + k * cw + cw / 2, 3 + cw / 2 + 5, k, 14, weight="bold"))
        out.append(text(3 + cw / 2, 3 + k * cw + cw / 2 + 5, k, 14, weight="bold"))
    for r in range(1, n + 1):
        for c in range(1, n + 1):
            cx, cy = 3 + c * cw + cw / 2, 3 + r * cw + cw / 2
            if (r, c) in marked:
                out.append(f'<circle cx="{cx}" cy="{cy}" r="14" fill="none" stroke="{BLUE}" stroke-width="2.5"/>')
            out.append(text(cx, cy + 5, r + c, 14))
    return svg(W, H, "".join(out))


def l_blocks(steps, s=16):
    """ㄴ 모양 쌓기나무: k번째는 세로 k개 + 가로 k-1개 = 2k-1개"""
    out = []
    x = 10
    base = 12 + s * steps
    for k in range(1, steps + 1):
        cells = [(0, i) for i in range(k)] + [(i, 0) for i in range(1, k)]
        for (cx, cy) in cells:
            out.append(f'<rect x="{x + cx * s}" y="{base - (cy + 1) * s}" width="{s}" height="{s}" fill="{BLUE}" fill-opacity="0.35" stroke="{C}" stroke-width="2"/>')
        out.append(text(x + k * s / 2, base + 20, f"{k}째", 13))
        x += k * s + 26
    out.append(shape("q", x + 16, base - 24, 16))
    out.append(text(x + 16, base + 20, f"{steps + 1}째", 13))
    return svg(x + 40, base + 28, "".join(out))


# ───────── 2수02-01 규칙을 찾아 여러 가지 방법으로 나타내기 ─────────
S = "2수02-01"

b.q(S, "C", "규칙에 따라 모양을 늘어놓았습니다. ? 자리에 알맞은 모양은 무엇인가요?",
    svg=row_of(["circle", "triangle", "circle", "triangle", "circle", "q"]),
    options=["동그라미", "네모", "별", "세모"], answer="세모",
    why="동그라미, 세모가 번갈아 놓이므로 동그라미 다음에는 세모가 옵니다.")

b.q(S, "C", "규칙을 찾아 빈칸에 알맞은 수를 고르세요.\n2, 4, 6, 8, □",
    options=[10, 11, 12, 14], answer=10,
    why="2씩 커지는 규칙이므로 8 다음은 10입니다.")

b.q(S, "C", "규칙에 따라 과일을 늘어놓았습니다. □에 알맞은 과일은 무엇인가요?\n사과, 사과, 귤, 사과, 사과, 귤, 사과, □",
    answers=["사과"],
    why="사과, 사과, 귤이 되풀이됩니다. 일곱 번째가 사과이고, 여덟 번째도 사과입니다.")

b.q(S, "B", "바둑돌을 규칙에 따라 늘어놓았습니다. 규칙을 바르게 말한 것은 무엇인가요?",
    svg=row_of(["stone_b", "stone_w", "stone_w"] * 3, r=13, gap=8),
    options=["검은 바둑돌과 흰 바둑돌이 1개씩 되풀이된다", "검은 바둑돌 2개, 흰 바둑돌 1개가 되풀이된다",
             "검은 바둑돌 1개, 흰 바둑돌 2개가 되풀이된다", "흰 바둑돌만 계속 놓인다"],
    answer="검은 바둑돌 1개, 흰 바둑돌 2개가 되풀이된다",
    why="검은 돌 1개 다음에 흰 돌 2개가 오는 것이 되풀이됩니다.")

b.q(S, "B", "수 배열표에서 동그라미를 그린 수에는 어떤 규칙이 있나요?",
    svg=number_grid(1, 30, set(range(3, 31, 3))),
    options=["2씩 커진다", "3씩 커진다", "5씩 커진다", "10씩 커진다"], answer="3씩 커진다",
    why="3, 6, 9, 12, …로 3씩 커집니다.")

b.q(S, "B", "모양을 수로 나타내려고 합니다. 동그라미는 1, 세모는 2로 나타내면 1, 2, 2, 1, 2, 2, …가 됩니다. 일곱 번째에 올 수는 무엇인가요?",
    svg=row_of(["circle", "triangle", "triangle", "circle", "triangle", "triangle"], below=["1", "2", "2", "1", "2", "2"]),
    answers=["1"],
    why="1, 2, 2가 되풀이되므로 일곱 번째는 다시 처음인 1입니다.")

b.q(S, "A", "규칙에 따라 쌓기나무를 놓았습니다. 넷째 모양에 놓을 쌓기나무는 모두 몇 개인가요?",
    svg=l_blocks(3),
    options=[7, 8, 9, 10], answer=7,
    why="쌓기나무가 1개, 3개, 5개로 2개씩 늘어나므로 넷째는 7개입니다.")

b.q(S, "A", "덧셈표에서 동그라미를 그린 수들을 ↘ 방향으로 따라가면 수가 어떻게 변하나요?",
    svg=add_table(4, {(1, 1), (2, 2), (3, 3), (4, 4)}),
    options=["1씩 커진다", "2씩 커진다", "변하지 않는다", "2씩 작아진다"], answer="2씩 커진다",
    why="2, 4, 6, 8로 2씩 커집니다.")

b.q(S, "A", "어느 달의 달력에서 화요일인 날짜는 2일, 9일, 16일, …입니다. 16일 다음 화요일은 며칠인가요?",
    answers=["23", "23일"],
    why="달력에서 같은 요일은 7일마다 돌아오므로 16+7=23(일)입니다.")

# ───────── 2수02-02 규칙을 정해 배열하기 ─────────
S = "2수02-02"

b.q(S, "C", "‘세모, 동그라미’가 되풀이되도록 모양을 놓으려고 했는데 한 곳을 잘못 놓았습니다. 잘못 놓은 것은 몇 번째인가요?",
    svg=row_of(["triangle", "circle", "triangle", "circle", "triangle", "triangle"],
               below=["1", "2", "3", "4", "5", "6"]),
    options=["세 번째", "네 번째", "다섯 번째", "여섯 번째"], answer="여섯 번째",
    why="다섯 번째 세모 다음에는 동그라미가 와야 하는데 여섯 번째에 세모를 놓았습니다.")

b.q(S, "C", "‘2부터 시작하여 5씩 커지는’ 규칙으로 수를 늘어놓습니다. 세 번째 수는 무엇인가요?",
    options=[7, 10, 12, 17], answer=12,
    why="2, 7, 12이므로 세 번째 수는 12입니다.")

b.q(S, "C", "‘큰 구슬 1개, 작은 구슬 2개’가 되풀이되도록 구슬을 꿰고 있습니다. 계속 꿰어 나갈 때, 큰 구슬을 꿰게 되는 것은 몇 번째인가요?",
    svg=row_of(["bead_big", "bead_small", "bead_small"] * 2, r=14, gap=6),
    options=["8번째", "9번째", "10번째", "11번째"], answer="10번째",
    why="큰 구슬은 1, 4, 7, 10번째로 3개마다 나옵니다. 8, 9, 11번째는 작은 구슬입니다.")

b.q(S, "B", "‘사과 2개, 배 1개’가 되풀이되도록 과일 9개를 늘어놓으려고 합니다. 배는 모두 몇 개를 놓게 되나요?",
    options=[2, 3, 4, 6], answer=3,
    why="사과, 사과, 배 3개가 한 묶음이고 9개는 3묶음이므로 배는 3개입니다.")

b.q(S, "B", "다음 중 ‘10씩 작아지는’ 규칙으로 수를 늘어놓은 것은 무엇인가요?",
    options=["50, 40, 30, 20", "50, 45, 40, 35", "20, 30, 40, 50", "50, 49, 48, 47"], answer="50, 40, 30, 20",
    why="50, 40, 30, 20은 10씩 작아집니다. 20, 30, 40, 50은 10씩 커집니다.")

b.q(S, "B", "‘1부터 시작하여 3씩 커지는’ 규칙으로 수를 늘어놓습니다. 다섯 번째 수는 무엇인가요?",
    options=[10, 12, 13, 16], answer=13,
    why="1, 4, 7, 10, 13이므로 다섯 번째 수는 13입니다.")

b.q(S, "A", "모양은 동그라미와 네모가 번갈아 놓이고, 모양 안의 수는 1부터 2씩 커지는 규칙으로 늘어놓았습니다. 다섯 번째에 올 것은 무엇인가요?",
    svg=row_of([("circle", "1"), ("square", "3"), ("circle", "5"), ("square", "7"), "q"], r=17),
    options=["네모 안에 9", "동그라미 안에 8", "네모 안에 10", "동그라미 안에 9"], answer="동그라미 안에 9",
    why="네모 다음은 동그라미이고, 7 다음 수는 9이므로 동그라미 안에 9입니다.")

b.q(S, "A", "화살표를 규칙에 따라 늘어놓았습니다. 아홉 번째에 올 화살표는 어느 쪽을 가리키나요?",
    svg=row_of(["arrow_up", "arrow_right", "arrow_down", "arrow_left"] * 2 + ["q"], r=14, gap=8,
               below=[str(i) for i in range(1, 10)]),
    options=["↑ 위쪽", "→ 오른쪽", "↓ 아래쪽", "← 왼쪽"], answer="↑ 위쪽",
    why="위, 오른쪽, 아래, 왼쪽 4개가 되풀이되므로 아홉 번째는 첫 번째와 같은 위쪽입니다.")

b.q(S, "A", "규칙을 찾아 □에 알맞은 수를 구하세요.\n1, 2, 4, 7, 11, □",
    answers=["16"],
    why="커지는 수가 1, 2, 3, 4로 1씩 늘어나므로 11 다음은 11+5=16입니다.")

if __name__ == "__main__":
    errs, pos, short = b.check(9)
    print("errors", errs)
    print("answer pos", dict(sorted(pos.items())), "short", short, "/", len(b.questions))
    b.save(os.path.join(os.path.dirname(__file__), "..", "banks", b.outfile))
