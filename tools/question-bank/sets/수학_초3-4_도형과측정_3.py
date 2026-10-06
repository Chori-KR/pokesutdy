"""수학 · 초3-4 · 도형과 측정 (3/4) (4수03-15 ~ 21) — 63문제"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from svgkit import svg, text, line, BLUE, ORANGE, C, _n
from kit_ko import KoBank, report
from kit12 import seg_bars
from kit34 import hold, ruler_mm, beaker, dial


def dial_short(value, full, r=84, labels_every=200, minor=100):
    """dial과 같지만 바늘을 짧게 해서 눈금 숫자를 가리지 않게 한다"""
    import math
    from kit34 import dot
    cx = cy = r + 16
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="3"/>']
    k = 0
    while k < full:
        a = math.radians(k / full * 360)
        big = k % labels_every == 0
        r1 = r - (11 if big else 6)
        out.append(line(cx + r1 * math.sin(a), cy - r1 * math.cos(a), cx + (r - 1) * math.sin(a), cy - (r - 1) * math.cos(a), 2.5 if big else 2))
        if big:
            rr = r - 25
            out.append(text(cx + rr * math.sin(a), cy - rr * math.cos(a) + 4, k, 12, weight="bold"))
        k += minor
    a = math.radians(value / full * 360)
    out.append(line(cx, cy, cx + (r - 40) * math.sin(a), cy - (r - 40) * math.cos(a), 3.5, color=ORANGE) + dot(cx, cy, 5))
    out.append(text(cx, cy + 22, "g", 13, weight="bold"))
    return svg(2 * r + 32, 2 * r + 32, "".join(out))


def bars(*parts, total=None):
    """parts: (너비, 글자, 'B'|'O'|'Q')"""
    return seg_bars(list(parts), total=total, u=1.0)


bank = Bank("수학", "초", "수학", "초3-4", "도형과 측정", "bank_수학_초3-4_도형과측정_3.json")
b = KoBank(bank)

# ───────── 4수03-15 1 mm, 1 km로 길이 재고 어림하기 ─────────
S = "4수03-15"

b.q(S, "C", "자로 지우개의 길이를 재었습니다. 지우개의 길이는 몇 mm인가요?",
    svg=ruler_mm(8, [(0, 47, "지우개")]),
    options=["47 mm", "4 mm", "7 mm", "40 mm"], answer="47 mm",
    why="지우개의 한쪽 끝이 0에 맞추어져 있고 다른 쪽 끝이 4 cm에서 작은 눈금 7칸을 더 간 곳이므로 47 mm입니다.")
b.q(S, "C", "1 cm를 같은 길이로 10칸으로 나눈 한 칸의 길이를 무엇이라고 하나요?",
    options=["1 mm", "1 m", "1 km", "10 mm"], answer="1 mm",
    why="1 cm를 10칸으로 나눈 한 칸의 길이는 1 mm입니다.")
b.q(S, "C", "자로 클립의 길이를 재려고 합니다. 클립의 한쪽 끝이 5 mm, 다른 쪽 끝이 38 mm에 있습니다. 클립의 길이는 몇 mm인가요?",
    svg=ruler_mm(6, [(5, 38, "클립")]),
    answers=["33", "33 mm", "33mm"],
    why="38-5=33이므로 클립의 길이는 33 mm입니다. 끝 눈금을 그대로 읽지 않고 시작한 눈금을 빼야 합니다.")

b.q(S, "B", "서울에서 부산까지의 거리를 나타낼 때 가장 알맞은 단위는 무엇인가요?",
    options=["km", "m", "cm", "mm"], answer="km",
    why="아주 먼 거리는 km로 나타내는 것이 알맞습니다.")
b.q(S, "B", "두 막대의 길이의 차는 몇 mm인가요?",
    svg=ruler_mm(8, [(0, 52, "가"), (0, 35, "나")]),
    options=["17 mm", "87 mm", "7 mm", "27 mm"], answer="17 mm",
    why="가는 52 mm, 나는 35 mm이므로 52-35=17(mm)입니다.")
b.q(S, "B", "□ 안에 알맞은 단위를 쓰세요.\n쌀알 한 알의 길이는 약 6 □입니다.",
    answers=["mm", "밀리미터", "MM"],
    why="쌀알처럼 아주 작은 것의 길이는 mm로 나타내는 것이 알맞습니다.")

b.q(S, "A", "길이를 알맞은 단위로 나타낸 것은 무엇인가요?",
    options=["연필의 길이는 17 cm이다", "축구장의 긴 쪽 길이는 105 km이다", "개미의 몸길이는 5 m이다", "서울에서 부산까지의 거리는 400 mm이다"],
    answer="연필의 길이는 17 cm이다",
    why="연필은 cm, 축구장은 m, 개미는 mm, 서울-부산은 km가 알맞습니다.")
b.q(S, "A", "운동장 한 바퀴의 길이가 250 m입니다. 운동장을 몇 바퀴 돌면 1 km를 걷게 되나요?",
    svg=bars((60, "250 m", "B"), (180, "?", "Q"), total="1 km"),
    options=[2, 3, 4, 5], answer=4,
    why="1 km는 1000 m이고 250×4=1000이므로 4바퀴를 돌면 됩니다.")
b.q(S, "A", "길이를 mm 단위로 나타내면 더 편리한 경우로 알맞은 것은 무엇인가요?",
    options=["연필심의 굵기를 정확하게 말할 때", "도시 사이의 거리를 말할 때", "운동장의 길이를 말할 때", "강의 길이를 말할 때"],
    answer="연필심의 굵기를 정확하게 말할 때",
    why="아주 작은 길이를 정확하게 나타낼 때는 mm가 편리합니다.")

# ───────── 4수03-16 cm와 mm, km와 m의 관계 ─────────
S = "4수03-16"

b.q(S, "C", "막대의 길이 3 cm를 mm로 나타내면 몇 mm인가요?",
    svg=ruler_mm(5, [(0, 30, "막대")]),
    options=["30 mm", "3 mm", "300 mm", "13 mm"], answer="30 mm",
    why="1 cm는 10 mm이므로 3 cm는 30 mm입니다.")
b.q(S, "C", "2 km는 몇 m인가요?",
    svg=bars((120, "1 km", "B"), (120, "1 km", "O"), total="? m"),
    options=["200 m", "2000 m", "20 m", "20000 m"], answer="2000 m",
    why="1 km는 1000 m이므로 2 km는 2000 m입니다.")
b.q(S, "C", "40 mm는 몇 cm인가요?",
    svg=ruler_mm(6, [(0, 40, "막대")]),
    answers=["4", "4 cm", "4cm"],
    why="10 mm가 1 cm이므로 40 mm는 4 cm입니다.")

b.q(S, "B", "아래 색연필의 길이를 ‘몇 cm 몇 mm’로 나타낸 것은 무엇인가요?",
    svg=ruler_mm(8, [(0, 57, "색연필")]),
    options=["5 cm 7 mm", "7 cm 5 mm", "57 cm", "5 cm 70 mm"], answer="5 cm 7 mm",
    why="5 cm에서 작은 눈금 7칸을 더 간 길이이므로 5 cm 7 mm입니다. 57 mm와 같습니다.")
b.q(S, "B", "3 km 450 m는 몇 m인가요?",
    svg=bars((150, "3 km", "B"), (60, "450 m", "O"), total="? m"),
    options=["3450 m", "345 m", "30450 m", "3045 m"], answer="3450 m",
    why="3 km는 3000 m이므로 3 km 450 m는 3000+450=3450(m)입니다.")
b.q(S, "B", "6200 m는 몇 km 몇 m인가요?",
    svg=bars((250, "6200 m", "B"), total="? km ? m"),
    answers=["6 km 200 m", "6km 200m", "6km200m", "6 km 200m"],
    why="6200 m는 6000 m와 200 m이고, 6000 m는 6 km이므로 6 km 200 m입니다.")

b.q(S, "A", "나머지와 길이가 다른 하나는 무엇인가요?",
    options=["1 m 23 mm", "123 mm", "12 cm 3 mm", "10 cm 23 mm"], answer="1 m 23 mm",
    why="123 mm=12 cm 3 mm=10 cm 23 mm이고, 1 m 23 mm는 1023 mm로 다릅니다.")
b.q(S, "A", "1 cm와 1 mm의 관계를 바르게 설명한 것은 무엇인가요?",
    options=["1 cm는 1 mm를 10번 이은 길이와 같다", "1 mm는 1 cm를 10번 이은 길이와 같다", "1 cm와 1 mm는 길이가 같다", "1 cm는 1 mm를 100번 이은 길이와 같다"],
    answer="1 cm는 1 mm를 10번 이은 길이와 같다",
    why="1 cm=10 mm이므로 1 cm는 1 mm를 10번 이은 길이입니다.")
b.q(S, "A", "1 km 5 m는 몇 m인가요?",
    svg=bars((200, "1 km", "B"), (30, "5 m", "O"), total="? m"),
    answers=["1005", "1005 m", "1005m"],
    why="1 km는 1000 m이므로 1 km 5 m는 1000+5=1005(m)입니다.")

# ───────── 4수03-17 1 L, 1 mL로 들이 측정하고 어림하기 ─────────
S = "4수03-17"

b.q(S, "C", "눈금실린더에 담긴 물의 양은 몇 mL인가요?",
    svg=beaker(500, 350, 50, "물"),
    options=["350 mL", "35 mL", "300 mL", "400 mL"], answer="350 mL",
    why="물의 높이가 300과 400 사이의 가운데인 350 mL에 있습니다.")
b.q(S, "C", "들이의 단위인 mL는 어떻게 읽나요?",
    options=["밀리리터", "리터", "밀리미터", "킬로리터"], answer="밀리리터",
    why="mL는 ‘밀리리터’, L는 ‘리터’라고 읽습니다.")
b.q(S, "C", "눈금 있는 그릇에 담긴 물의 양은 몇 mL인가요?",
    svg=beaker(1000, 600, 100, "물", major=200),
    answers=["600", "600 mL", "600mL"],
    why="물의 높이가 눈금 600에 닿아 있으므로 600 mL입니다.")

b.q(S, "B", "□ 안에 알맞은 단위를 쓰세요.\n종이컵 한 컵의 들이는 약 200 □입니다.",
    answers=["mL", "ml", "밀리리터", "ML"],
    why="종이컵 한 컵 정도의 적은 양은 mL로 나타냅니다.")
b.q(S, "B", "두 그릇 가와 나에 담긴 물의 양의 차는 몇 mL인가요?",
    svg=hold([(beaker(1000, 700, 100, "가", major=200), ""), (beaker(1000, 450, 50, "나", major=250), "")], gap=2),
    options=["250 mL", "150 mL", "350 mL", "1150 mL"], answer="250 mL",
    why="가는 700 mL, 나는 450 mL이므로 700-450=250(mL)입니다.")
b.q(S, "B", "□ 안에 알맞은 단위를 쓰세요.\n욕조에 가득 담을 수 있는 물의 양은 약 200 □입니다.",
    answers=["L", "l", "리터", "ℓ"],
    why="욕조처럼 큰 그릇의 들이는 L로 나타내는 것이 알맞습니다.")

b.q(S, "A", "들이를 알맞은 단위로 나타낸 것은 무엇인가요?",
    options=["물병의 들이는 약 500 mL이다", "약병의 들이는 약 5 L이다", "수영장의 들이는 약 2000 mL이다", "종이컵의 들이는 약 200 L이다"],
    answer="물병의 들이는 약 500 mL이다",
    why="물병은 약 500 mL가 알맞습니다. 약병은 mL, 수영장은 아주 많은 L, 종이컵은 약 200 mL로 나타내야 알맞습니다.")
b.q(S, "A", "들이가 1 L인 물병을 가득 채우려면 들이가 200 mL인 컵으로 몇 번 부어야 하나요?",
    svg=bars((50, "200 mL", "B"), (200, "?번", "Q"), total="1 L"),
    options=[2, 4, 5, 10], answer=5,
    why="1 L는 1000 mL이고 200×5=1000이므로 5번 부어야 합니다.")
b.q(S, "A", "어떤 컵에 물을 가득 채우니 약 250 mL입니다. 같은 컵으로 4번 가득 부으면 물의 양은 약 몇 L인가요?",
    svg=bars((60, "250 mL", "B"), (180, "×4", "Q"), total="? L"),
    answers=["1", "1 L", "1L", "1리터"],
    why="250×4=1000(mL)이고 1000 mL는 1 L입니다.")

# ───────── 4수03-18 1 L와 1 mL의 관계 ─────────
S = "4수03-18"

b.q(S, "C", "2 L는 몇 mL인가요?",
    svg=beaker(2000, 2000, 500, "2 L", major=500),
    options=["2000 mL", "200 mL", "20 mL", "20000 mL"], answer="2000 mL",
    why="1 L는 1000 mL이므로 2 L는 2000 mL입니다.")
b.q(S, "C", "3000 mL는 몇 L인가요?",
    svg=beaker(3000, 3000, 1000, "3000 mL", major=1000),
    options=["3 L", "30 L", "300 L", "0.3 L"], answer="3 L",
    why="1000 mL가 1 L이므로 3000 mL는 3 L입니다.")
b.q(S, "C", "5 L는 몇 mL인가요?",
    answers=["5000", "5000 mL", "5000mL"],
    why="1 L=1000 mL이므로 5 L는 5000 mL입니다.")

b.q(S, "B", "2 L 300 mL는 몇 mL인가요?",
    svg=beaker(3000, 2300, 500, "2 L 300 mL", major=1000),
    options=["2300 mL", "230 mL", "2030 mL", "23000 mL"], answer="2300 mL",
    why="2 L는 2000 mL이므로 2 L 300 mL는 2000+300=2300(mL)입니다.")
b.q(S, "B", "그릇에 담긴 물의 양을 ‘몇 L 몇 mL’로 나타내세요. (눈금 한 칸은 100 mL이고 가득 차면 2 L입니다.)",
    svg=beaker(2000, 1500, 100, "물", major=500, h=170),
    options=["1 L 500 mL", "1 L 50 mL", "15 L", "500 mL"], answer="1 L 500 mL",
    why="눈금이 1500 mL이고 1500 mL는 1000 mL와 500 mL이므로 1 L 500 mL입니다.")
b.q(S, "B", "4050 mL는 몇 L 몇 mL인가요?",
    svg=bars((250, "4050 mL", "B"), total="? L ? mL"),
    answers=["4 L 50 mL", "4L 50mL", "4L50mL", "4 L 50mL"],
    why="4050 mL는 4000 mL와 50 mL이고, 4000 mL는 4 L이므로 4 L 50 mL입니다.")

b.q(S, "A", "1 L와 1 mL의 관계를 바르게 설명한 것은 무엇인가요?",
    options=["1 L는 1 mL를 1000번 더한 양과 같다", "1 L는 1 mL를 100번 더한 양과 같다", "1 mL는 1 L의 10배이다", "1 L와 1 mL는 같은 양이다"],
    answer="1 L는 1 mL를 1000번 더한 양과 같다",
    why="1 L=1000 mL이므로 1 L는 1 mL를 1000번 더한 양과 같습니다.")
b.q(S, "A", "들이를 나타낸 것 중 나머지와 다른 하나는 무엇인가요?",
    options=["1 L 250 mL", "1250 mL", "1 L 25 mL", "1000 mL와 250 mL를 합한 양"], answer="1 L 25 mL",
    why="1 L 250 mL=1250 mL=1000 mL+250 mL이고, 1 L 25 mL는 1025 mL로 다릅니다.")
b.q(S, "A", "1 L 8 mL는 몇 mL인가요?",
    answers=["1008", "1008 mL", "1008mL"],
    why="1 L는 1000 mL이므로 1 L 8 mL는 1000+8=1008(mL)입니다.")

# ───────── 4수03-19 들이의 덧셈과 뺄셈 ─────────
S = "4수03-19"

b.q(S, "C", "1 L 200 mL + 2 L 300 mL는 얼마인가요?",
    svg=seg_bars([(60, "1 L 200 mL", "B"), (90, "2 L 300 mL", "O")], total="? L ? mL", u=2.0),
    options=["3 L 500 mL", "3 L 100 mL", "2 L 500 mL", "4 L 500 mL"], answer="3 L 500 mL",
    why="L는 L끼리 1+2=3, mL는 mL끼리 200+300=500이므로 3 L 500 mL입니다.")
b.q(S, "C", "5 L 800 mL - 2 L 300 mL는 얼마인가요?",
    svg=bars((100, "2 L 300 mL", "O"), (120, "?", "Q"), total="5 L 800 mL"),
    options=["3 L 500 mL", "3 L 100 mL", "7 L 100 mL", "2 L 500 mL"], answer="3 L 500 mL",
    why="L끼리 5-2=3, mL끼리 800-300=500이므로 3 L 500 mL입니다.")
b.q(S, "C", "400 mL + 800 mL는 몇 L 몇 mL인가요?",
    answers=["1 L 200 mL", "1L 200mL", "1L200mL"],
    why="400+800=1200(mL)이고 1200 mL는 1 L 200 mL입니다.")

b.q(S, "B", "물통에 물이 1 L 500 mL 들어 있습니다. 물 700 mL를 더 부으면 물은 모두 얼마인가요?",
    svg=bars((110, "1 L 500 mL", "B"), (60, "700 mL", "O"), total="? L ? mL"),
    options=["2 L 200 mL", "2 L 700 mL", "1 L 200 mL", "2 L 20 mL"], answer="2 L 200 mL",
    why="1 L 500 mL+700 mL에서 mL끼리 500+700=1200(mL)=1 L 200 mL이므로 모두 2 L 200 mL입니다.")
b.q(S, "B", "두 그릇 가와 나의 물을 모두 큰 통에 부으면 물은 모두 몇 mL인가요?",
    svg=hold([(beaker(1000, 400, 100, "가", major=200), ""), (beaker(1000, 750, 50, "나", major=250), "")], gap=2),
    options=["1150 mL", "1050 mL", "350 mL", "1250 mL"], answer="1150 mL",
    why="가는 400 mL, 나는 750 mL이므로 400+750=1150(mL)입니다.")
b.q(S, "B", "3 L - 1 L 400 mL는 얼마인가요? 몇 L 몇 mL로 쓰세요.",
    svg=bars((100, "1 L 400 mL", "O"), (90, "?", "Q"), total="3 L"),
    answers=["1 L 600 mL", "1L 600mL", "1L600mL"],
    why="3 L를 2 L 1000 mL로 바꾸어 계산합니다. 2 L 1000 mL-1 L 400 mL=1 L 600 mL입니다.")

b.q(S, "A", "주스 2 L 중에서 650 mL를 마시고, 다시 300 mL를 마셨습니다. 남은 주스는 얼마인가요?",
    options=["1 L 50 mL", "1 L 350 mL", "950 mL", "1 L 150 mL"], answer="1 L 50 mL",
    why="마신 양은 650+300=950(mL)입니다. 2 L-950 mL=2000 mL-950 mL=1050 mL=1 L 50 mL입니다.")
b.q(S, "A", "물이 1 L 250 mL 들어 있는 병, 800 mL 들어 있는 병, 2 L 들어 있는 병이 있습니다. 세 병의 물은 모두 몇 L 몇 mL인가요?",
    options=["4 L 50 mL", "3 L 50 mL", "4 L 250 mL", "3 L 800 mL"], answer="4 L 50 mL",
    why="1 L 250 mL+800 mL=2 L 50 mL이고, 여기에 2 L를 더하면 4 L 50 mL입니다.")
b.q(S, "A", "큰 통에 물 5 L가 들어 있습니다. 여기서 1 L 800 mL를 덜어 내고 다시 600 mL를 부었습니다. 지금 통에 들어 있는 물의 양은 몇 L 몇 mL인가요?",
    answers=["3 L 800 mL", "3L 800mL", "3L800mL"],
    why="5 L-1 L 800 mL=3 L 200 mL이고, 여기에 600 mL를 더하면 3 L 800 mL입니다.")

# ───────── 4수03-20 1 g, 1 kg으로 무게 측정하고 어림하기 ─────────
S = "4수03-20"

b.q(S, "C", "주방 저울의 바늘이 가리키는 무게는 몇 g인가요?",
    svg=dial(450, 1000),
    options=["450 g", "45 g", "400 g", "500 g"], answer="450 g",
    why="바늘이 400과 500의 가운데를 가리키므로 450 g입니다.")
b.q(S, "C", "무게의 단위인 kg은 어떻게 읽나요?",
    options=["킬로그램", "그램", "킬로미터", "밀리그램"], answer="킬로그램",
    why="kg은 ‘킬로그램’, g은 ‘그램’이라고 읽습니다.")
b.q(S, "C", "저울의 바늘이 가리키는 무게는 몇 g인가요?",
    svg=dial(700, 1000),
    answers=["700", "700 g", "700g"],
    why="바늘이 700을 가리키고 있으므로 700 g입니다.")

b.q(S, "B", "□ 안에 알맞은 단위를 쓰세요.\n연필 한 자루의 무게는 약 10 □입니다.",
    answers=["g", "그램", "G"],
    why="연필처럼 가벼운 물건은 g으로 나타내는 것이 알맞습니다.")
b.q(S, "B", "두 저울에 올린 물건 가와 나의 무게의 차는 몇 g인가요?",
    svg=hold([(dial(600, 1000), "가"), (dial(250, 1000), "나")], gap=2),
    options=["350 g", "850 g", "150 g", "450 g"], answer="350 g",
    why="가는 600 g, 나는 250 g이므로 600-250=350(g)입니다.")
b.q(S, "B", "□ 안에 알맞은 단위를 쓰세요.\n수박 한 통의 무게는 약 5 □입니다.",
    answers=["kg", "KG", "킬로그램"],
    why="수박처럼 무거운 물건은 kg으로 나타내는 것이 알맞습니다.")

b.q(S, "A", "무게를 알맞은 단위로 나타낸 것은 무엇인가요?",
    options=["달걀 한 개의 무게는 약 50 g이다", "사과 한 개의 무게는 약 200 kg이다", "코끼리의 무게는 약 5 g이다", "공책 한 권의 무게는 약 100 kg이다"],
    answer="달걀 한 개의 무게는 약 50 g이다",
    why="달걀은 약 50 g이 알맞습니다. 사과와 공책은 g, 코끼리는 kg으로 나타내야 알맞습니다.")
b.q(S, "A", "달걀 한 개의 무게가 약 50 g일 때 1 kg은 달걀 약 몇 개의 무게와 같은가요?",
    svg=bars((40, "50 g", "B"), (200, "?개", "Q"), total="1 kg"),
    options=[10, 20, 50, 100], answer=20,
    why="1 kg은 1000 g이고 1000÷50=20이므로 달걀 약 20개의 무게와 같습니다.")
b.q(S, "A", "무게를 g 단위로 나타내면 더 편리한 경우로 알맞은 것은 무엇인가요?",
    options=["약의 무게를 정확하게 말할 때", "트럭의 무게를 말할 때", "코끼리의 무게를 말할 때", "배의 무게를 말할 때"],
    answer="약의 무게를 정확하게 말할 때",
    why="아주 가벼운 물건의 무게를 정확하게 나타낼 때는 g이 편리합니다.")

# ───────── 4수03-21 1 kg과 1 g의 관계 ─────────
S = "4수03-21"

b.q(S, "C", "1 kg은 1000 g입니다. 3 kg은 몇 g인가요?",
    svg=bars((90, "1 kg", "B"), (90, "1 kg", "B"), (90, "1 kg", "B"), total="3 kg = ? g"),
    options=["3000 g", "300 g", "30 g", "30000 g"], answer="3000 g",
    why="1 kg은 1000 g이므로 3 kg은 3000 g입니다.")
b.q(S, "C", "5000 g은 몇 kg인가요?",
    options=["5 kg", "50 kg", "500 kg", "0.5 kg"], answer="5 kg",
    why="1000 g이 1 kg이므로 5000 g은 5 kg입니다.")
b.q(S, "C", "2 kg은 몇 g인가요?",
    answers=["2000", "2000 g", "2000g"],
    why="1 kg=1000 g이므로 2 kg은 2000 g입니다.")

b.q(S, "B", "3 kg 400 g은 몇 g인가요?",
    svg=bars((150, "3 kg", "B"), (60, "400 g", "O"), total="? g"),
    options=["3400 g", "340 g", "3040 g", "34000 g"], answer="3400 g",
    why="3 kg은 3000 g이므로 3 kg 400 g은 3000+400=3400(g)입니다.")
b.q(S, "B", "저울의 바늘이 가리키는 무게를 ‘몇 kg 몇 g’으로 나타내면 얼마인가요?",
    svg=dial_short(1600, 2000),
    options=["1 kg 600 g", "1 kg 60 g", "16 kg", "600 g"], answer="1 kg 600 g",
    why="바늘이 1600 g을 가리키고, 1600 g은 1000 g과 600 g이므로 1 kg 600 g입니다.")
b.q(S, "B", "7080 g은 몇 kg 몇 g인가요?",
    answers=["7 kg 80 g", "7kg 80g", "7kg80g"],
    why="7080 g은 7000 g과 80 g이고, 7000 g은 7 kg이므로 7 kg 80 g입니다.")

b.q(S, "A", "1 kg과 1 g의 관계를 바르게 설명한 것은 무엇인가요?",
    options=["1 kg은 1 g을 1000번 더한 무게와 같다", "1 kg은 1 g을 100번 더한 무게와 같다", "1 g은 1 kg의 1000배이다", "1 kg과 1 g은 같은 무게이다"],
    answer="1 kg은 1 g을 1000번 더한 무게와 같다",
    why="1 kg=1000 g이므로 1 kg은 1 g을 1000번 더한 무게입니다.")
b.q(S, "A", "무게를 나타낸 것 중 나머지와 다른 하나는 무엇인가요?",
    options=["2 kg 5 g", "2005 g", "2 kg과 5 g을 합한 무게", "2050 g"], answer="2050 g",
    why="2 kg 5 g=2005 g이고 2050 g은 2 kg 50 g이므로 다릅니다.")
b.q(S, "A", "1 kg 30 g은 몇 g인가요?",
    svg=bars((200, "1 kg", "B"), (30, "30 g", "O"), total="? g"),
    answers=["1030", "1030 g", "1030g"],
    why="1 kg은 1000 g이므로 1 kg 30 g은 1000+30=1030(g)입니다.")

if __name__ == "__main__":
    report(bank, 9)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
