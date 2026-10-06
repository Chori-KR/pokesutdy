"""수학 · 중1-3 · 도형과 측정 3 (9수03-15 ~ 19) — 45문제"""
import os, sys, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from svgkit import svg, text, line, table, BLUE, ORANGE, C, _n
from kit_ko import KoBank, report
from kit34 import hold
from kit56 import cuboid_fig, prism_fig, pyramid_fig, cone_fig, cyl_fig, sphere_fig
from kit_soc import compare_table
from kit_m9 import geo, sector, polar


def A(n, u="°"):
    """단답형 허용 답: 숫자만/단위 붙임"""
    return [str(n), f"{n}{u}", f"{n} {u}"]


def mc(b, S, lv, body, ok, bad, why, svg=None, keep=False):
    kw = dict(options=[ok] + list(bad), answer=ok, why=why, keep=keep)
    if svg:
        kw["svg"] = svg
    b.q(S, lv, body, **kw)


def sh(b, S, lv, body, answers, why, svg=None):
    kw = dict(answers=answers, why=why)
    if svg:
        kw["svg"] = svg
    b.q(S, lv, body, **kw)

bank = Bank("수학", "중", "수학", "중1-3", "도형과 측정", "bank_수학_중1-3_도형과측정_3.json")
b = KoBank(bank)


def rt(a, bb, c, names=("A", "B", "C"), hide=None, tx=None, W=230, H=160, ang=None, note=None, dims=None):
    """직각삼각형 (직각 B). a=AB(세로), bb=BC(가로), c=AC(빗변) 글자. ang: A 또는 C의 각 표시 글자"""
    A_, B_, C_ = (50, 22), (50, 124), (186, 124)
    if dims:
        k = min(26, 100 / dims[0], 136 / dims[1])
        A_, C_ = (50, 124 - dims[0] * k), (50 + dims[1] * k, 124)
    pts = {names[0]: A_, names[1]: B_, names[2]: C_}
    segs = [(names[0], names[1]), (names[1], names[2]), (names[2], names[0])]
    texts = []
    if a:
        texts.append((A_[0] - 16, (A_[1] + B_[1]) / 2 + 5, a))
    if bb:
        texts.append(((B_[0] + C_[0]) / 2, B_[1] + 18, bb))
    if c:
        mx, my = (A_[0] + C_[0]) / 2, (A_[1] + C_[1]) / 2
        dx, dy = C_[1] - A_[1], -(C_[0] - A_[0])
        L = math.hypot(dx, dy)
        texts.append((mx + dx / L * 14, my + dy / L * 14 + 4, c))
    if note:
        texts.append((190, 28, note))
    arcs = []
    if ang:
        v, lab = ang
        if v == names[0]:
            arcs.append((names[0], names[1], names[2], 26, lab))
        else:
            arcs.append((names[2], names[1], names[0], 28, lab))
    return geo(pts, segs=segs, rights=[(names[1], names[0], names[2])], texts=texts, arcs=arcs, W=W, H=H)


def circ(pts_deg, chords=(), R=62, O=(115, 85), W=230, H=170, show_center=True, texts=(), arcs=(), extra_pts=None, extra_segs=(), dashed=(), oloff=(0, 18)):
    pts = {k: polar(O[0], O[1], R, d) for k, d in pts_deg.items()}
    if show_center:
        pts["O"] = O
    if extra_pts:
        pts.update(extra_pts)
    segs = list(chords) + list(extra_segs)
    return geo(pts, segs=segs, circles=[(O[0], O[1], R)], texts=texts, arcs=list(arcs), W=W, H=H, loff={"O": oloff})


# ───────── 9수03-15 피타고라스 정리 ─────────
S = "9수03-15"
mc(b, S, "C", "직각삼각형에서 직각을 낀 두 변의 길이를 $a, b$, 빗변의 길이를 $c$라 할 때 성립하는 관계는 무엇인가요?",
   "$a^2+b^2=c^2$", ["$a+b=c$", "$a^2-b^2=c^2$", "$ab=c^2$"], "피타고라스 정리: 직각삼각형에서 $a^2+b^2=c^2$입니다.")
sh(b, S, "C", "직각을 낀 두 변의 길이가 $3\\,\\mathrm{cm},\\ 4\\,\\mathrm{cm}$인 직각삼각형의 빗변의 길이는 몇 $\\mathrm{cm}$인가요? (숫자만)", ["5"], "$\\sqrt{3^2+4^2}=\\sqrt{25}=5$입니다.", svg=rt("3", "4", "?", dims=(3, 4)))
sh(b, S, "C", "직각을 낀 두 변의 길이가 $5,\\ 12$인 직각삼각형의 빗변의 길이를 구하세요. (숫자만)", ["13"], "$\\sqrt{5^2+12^2}=\\sqrt{169}=13$입니다.")
mc(b, S, "B", "빗변의 길이가 $17$이고 한 변의 길이가 $8$인 직각삼각형의 나머지 한 변의 길이는 얼마인가요?",
   "15", ["9", "12", "25"], "$\\sqrt{17^2-8^2}=\\sqrt{225}=15$입니다.")
mc(b, S, "B", "한 변의 길이가 $6$인 정사각형의 대각선의 길이는 얼마인가요?",
   "$6\\sqrt2$", ["$12$", "$6$", "$6\\sqrt3$"], "대각선의 길이는 $\\sqrt{6^2+6^2}=6\\sqrt2$입니다.")
mc(b, S, "B", "한 변의 길이가 $4$인 정삼각형의 높이는 얼마인가요?",
   "$2\\sqrt3$", ["$2$", "$4\\sqrt3$", "$2\\sqrt2$"], "높이는 $\\sqrt{4^2-2^2}=\\sqrt{12}=2\\sqrt3$입니다.")
mc(b, S, "A", "세 변의 길이가 다음과 같은 삼각형 중 직각삼각형인 것은 무엇인가요?",
   "$6,\\ 8,\\ 10$", ["$6,\\ 8,\\ 11$", "$4,\\ 5,\\ 6$", "$5,\\ 6,\\ 7$"], "$6^2+8^2=10^2$을 만족하므로 직각삼각형입니다.")
sh(b, S, "A", "좌표평면 위의 세 점 $A(-2,-3)$, $B(7,9)$, $C(7,-3)$을 꼭짓점으로 하는 삼각형 $ABC$에서 $\\overline{AB}$의 길이를 구하세요. (숫자만)", ["15"], "$\\angle C=90^\\circ$이고 $\\overline{AC}=9$, $\\overline{BC}=12$이므로 $\\overline{AB}=\\sqrt{9^2+12^2}=\\sqrt{225}=15$입니다.")
mc(b, S, "A", "가로 $3$, 세로 $4$, 높이 $12$인 직육면체의 대각선의 길이는 얼마인가요?",
   "13", ["19", "$\\sqrt{19}$", "$12\\sqrt2$"], "대각선의 길이는 $\\sqrt{3^2+4^2+12^2}=\\sqrt{169}=13$입니다.")

# ───────── 9수03-16 삼각비의 뜻과 값 ─────────
S = "9수03-16"
mc(b, S, "C", "그림의 직각삼각형 $ABC$에서 $\\sin A$의 값은 얼마인가요? ($\\overline{AB}=4,\\ \\overline{BC}=3,\\ \\overline{AC}=5$)",
   "$\\dfrac35$", ["$\\dfrac45$", "$\\dfrac34$", "$\\dfrac53$"], "$\\sin A=\\dfrac{\\text{높이}}{\\text{빗변}}=\\dfrac{\\overline{BC}}{\\overline{AC}}=\\dfrac35$입니다.", svg=rt("4", "3", "5", ang=("A", ""), dims=(4, 3), note="sin A=?"))
mc(b, S, "C", "그림의 직각삼각형 $ABC$에서 $\\cos A$의 값은 얼마인가요? ($\\overline{AB}=12,\\ \\overline{BC}=5,\\ \\overline{AC}=13$)",
   "$\\dfrac{12}{13}$", ["$\\dfrac{5}{13}$", "$\\dfrac{5}{12}$", "$\\dfrac{13}{12}$"], "$\\cos A=\\dfrac{\\overline{AB}}{\\overline{AC}}=\\dfrac{12}{13}$입니다.", svg=rt("12", "5", "13", ang=("A", ""), dims=(12, 5), note="cos A=?"))
mc(b, S, "C", "그림의 직각삼각형 $ABC$에서 $\\tan C$의 값은 얼마인가요? ($\\overline{AB}=4,\\ \\overline{BC}=3,\\ \\overline{AC}=5$)",
   "$\\dfrac43$", ["$\\dfrac34$", "$\\dfrac35$", "$\\dfrac45$"], "$\\tan C=\\dfrac{\\overline{AB}}{\\overline{BC}}=\\dfrac43$입니다.", svg=rt("4", "3", "5", ang=("C", ""), dims=(4, 3), note="tan C=?"))
mc(b, S, "B", "$\\sin30^\\circ$의 값은 얼마인가요?",
   "$\\dfrac12$", ["$\\dfrac{\\sqrt3}{2}$", "$\\dfrac{\\sqrt2}{2}$", "$1$"], "$\\sin30^\\circ=\\dfrac12$입니다.")
mc(b, S, "B", "$\\tan60^\\circ$의 값은 얼마인가요?",
   "$\\sqrt3$", ["$\\dfrac{\\sqrt3}{3}$", "$1$", "$\\dfrac{\\sqrt3}{2}$"], "$\\tan60^\\circ=\\sqrt3$입니다.")
mc(b, S, "B", "$\\cos45^\\circ$의 값은 얼마인가요?",
   "$\\dfrac{\\sqrt2}{2}$", ["$\\dfrac12$", "$\\dfrac{\\sqrt3}{2}$", "$1$"], "$\\cos45^\\circ=\\dfrac{\\sqrt2}{2}$입니다.")
mc(b, S, "A", "$\\sin A=\\dfrac35$일 때 $\\cos A$의 값은 얼마인가요? ($0^\\circ<A<90^\\circ$)",
   "$\\dfrac45$", ["$\\dfrac35$", "$\\dfrac34$", "$\\dfrac54$"], "빗변이 $5$, 높이가 $3$인 직각삼각형을 생각하면 밑변은 $\\sqrt{5^2-3^2}=4$이므로 $\\cos A=\\dfrac45$입니다.")
mc(b, S, "A", "$\\sin30^\\circ+\\cos60^\\circ$의 값은 얼마인가요?",
   "$1$", ["$\\dfrac12$", "$\\dfrac{\\sqrt3}{2}$", "$\\sqrt3$"], "$\\dfrac12+\\dfrac12=1$입니다.")
mc(b, S, "A", "$\\sin A=\\dfrac5{13}$일 때 $\\tan A$의 값은 얼마인가요? ($0^\\circ<A<90^\\circ$)",
   "$\\dfrac5{12}$", ["$\\dfrac{12}{13}$", "$\\dfrac{12}5$", "$\\dfrac{13}{12}$"], "밑변이 $\\sqrt{13^2-5^2}=12$이므로 $\\tan A=\\dfrac5{12}$입니다.")

# ───────── 9수03-17 삼각비의 활용 ─────────
S = "9수03-17"
sh(b, S, "C", "빗변의 길이가 $10$이고 $\\angle A=30^\\circ$인 직각삼각형 $ABC$($\\angle B=90^\\circ$)에서 $\\overline{BC}$의 길이를 구하세요. (숫자만)", ["5"],
   "$\\overline{BC}=10\\sin30^\\circ=10\\times\\dfrac12=5$입니다.", svg=rt("", "?", "10", ang=("A", "30°"), dims=(8.66, 5)).replace('x="60.4" y="66.6"', 'x="61" y="80"'))
mc(b, S, "C", "빗변의 길이가 $10$이고 $\\angle A=60^\\circ$인 직각삼각형 $ABC$($\\angle B=90^\\circ$)에서 $\\overline{AB}$의 길이는 얼마인가요?",
   "5", ["$5\\sqrt3$", "10", "$10\\sqrt3$"], "$\\overline{AB}=10\\cos60^\\circ=5$입니다.")
mc(b, S, "C", "건물에서 $100\\,\\mathrm{m}$ 떨어진 곳에서 건물 꼭대기를 올려본각이 $45^\\circ$일 때 눈높이를 무시하면 건물의 높이는 얼마인가요?",
   "$100\\,\\mathrm{m}$", ["$50\\,\\mathrm{m}$", "$100\\sqrt2\\,\\mathrm{m}$", "$200\\,\\mathrm{m}$"], "$\\tan45^\\circ=1$이므로 높이는 $100\\times1=100\\,\\mathrm{m}$입니다.")
mc(b, S, "B", "나무에서 $12\\,\\mathrm{m}$ 떨어진 곳에서 나무 꼭대기를 올려본각이 $45^\\circ$이고 눈높이가 $1.5\\,\\mathrm{m}$일 때 나무의 높이는 얼마인가요?",
   "$13.5\\,\\mathrm{m}$", ["$12\\,\\mathrm{m}$", "$12\\sqrt2\\,\\mathrm{m}$", "$1.5\\,\\mathrm{m}$"], "$12\\tan45^\\circ+1.5=13.5\\,\\mathrm{m}$입니다.")
mc(b, S, "B", "경사각이 $30^\\circ$인 경사로를 $20\\,\\mathrm{m}$ 올라갔을 때 높이는 얼마인가요?",
   "$10\\,\\mathrm{m}$", ["$10\\sqrt3\\,\\mathrm{m}$", "$20\\,\\mathrm{m}$", "$5\\,\\mathrm{m}$"], "높이는 $20\\sin30^\\circ=10\\,\\mathrm{m}$입니다.")
sh(b, S, "B", "두 변의 길이가 $6,\\ 8$이고 그 끼인각이 $30^\\circ$인 삼각형의 넓이를 구하세요. (숫자만)", ["12"], "$\\dfrac12\\times6\\times8\\times\\sin30^\\circ=12$입니다.")
mc(b, S, "A", "두 변의 길이가 $4,\\ 6$이고 그 끼인각이 $60^\\circ$인 삼각형의 넓이는 얼마인가요?",
   "$6\\sqrt3$", ["$12\\sqrt3$", "$6$", "$12$"], "$\\dfrac12\\times4\\times6\\times\\sin60^\\circ=12\\times\\dfrac{\\sqrt3}{2}=6\\sqrt3$입니다.")
mc(b, S, "A", "높이가 $30\\,\\mathrm{m}$인 건물 옥상에서 지면 위의 한 지점을 내려본각이 $30^\\circ$입니다. 건물 바로 아래에서 그 지점까지의 거리는 얼마인가요? (눈높이는 무시합니다)",
   "$30\\sqrt3\\,\\mathrm{m}$", ["$10\\sqrt3\\,\\mathrm{m}$", "$15\\,\\mathrm{m}$", "$60\\,\\mathrm{m}$"], "지면의 그 지점에서 옥상을 올려본각도 $30^\\circ$이므로 거리는 $\\dfrac{30}{\\tan30^\\circ}=30\\sqrt3\\,\\mathrm{m}$입니다.")
mc(b, S, "A", "삼각형 $ABC$에서 $\\overline{AB}=10$, $\\angle B=30^\\circ$, $\\angle C=45^\\circ$일 때 $\\overline{AC}$의 길이는 얼마인가요?",
   "$5\\sqrt2$", ["$10\\sqrt2$", "$5$", "$5\\sqrt3$"], "$A$에서 $\\overline{BC}$에 내린 수선의 길이는 $10\\sin30^\\circ=5$이고, $\\overline{AC}=\\dfrac{5}{\\sin45^\\circ}=5\\sqrt2$입니다.")

# ───────── 9수03-18 원의 현과 접선 ─────────
S = "9수03-18"
mc(b, S, "C", "원의 중심에서 현에 내린 수선은 그 현을 어떻게 하나요?",
   "이등분한다", ["삼등분한다", "길이가 변한다", "평행하다"], "원의 중심에서 현에 내린 수선은 그 현을 이등분합니다.")
mc(b, S, "C", "원의 접선과 접점을 지나는 반지름은 어떤 관계인가요?",
   "수직이다", ["평행하다", "일치한다", "$45^\\circ$로 만난다"], "원의 접선은 접점을 지나는 반지름과 수직입니다.")
sh(b, S, "C", "원 밖의 한 점 $P$에서 원에 그은 두 접선의 접점을 $A, B$라 할 때 $\\overline{PA}=7$이면 $\\overline{PB}$의 길이를 구하세요. (숫자만)", ["7"], "한 점에서 원에 그은 두 접선의 길이는 같으므로 $\\overline{PB}=7$입니다.")
mc(b, S, "B", "반지름이 $5$인 원에서 중심으로부터 현까지의 거리가 $3$일 때 현의 길이는 얼마인가요?",
   "8", ["4", "6", "10"], "현의 절반은 $\\sqrt{5^2-3^2}=4$이므로 현의 길이는 $8$입니다.",
   svg=geo({"O": (110, 85), "M": (110, 112), "A": (66, 112), "B": (154, 112)}, segs=[("A", "B"), ("O", "M", "d"), ("O", "A", "d")], circles=[(110, 85, 52)], rights=[("M", "O", "B")], texts=[(122, 100, "3"), (80, 90, "5")], W=220, H=160, loff={"O": (0, -8), "M": (0, 16), "A": (-12, 14), "B": (12, 14)}))
mc(b, S, "B", "반지름이 $5$인 원의 중심 $O$에서 $13$ 떨어진 점 $P$에서 원에 접선을 그었을 때, 접점 $A$까지의 접선의 길이는 얼마인가요?",
   "12", ["8", "$\\sqrt{194}$", "18"], "$\\angle OAP=90^\\circ$이므로 $\\overline{PA}=\\sqrt{13^2-5^2}=12$입니다.",
   svg=geo({"O": (80, 90), "P": (210, 90), "A": (99, 44)}, segs=[("O", "P"), ("O", "A"), ("A", "P")], circles=[(80, 90, 50)], rights=[("A", "O", "P")], W=260, H=170, loff={"O": (-6, 18), "P": (10, 16), "A": (-4, -10)}))
sh(b, S, "B", "원 밖의 점 $P$에서 원 $O$에 그은 접선의 길이가 $PA=6$이고 $\\overline{OP}=10$일 때, 원의 반지름의 길이를 구하세요. (숫자만)", ["8"], "$\\overline{OA}=\\sqrt{10^2-6^2}=8$입니다.")
mc(b, S, "A", "원 밖의 점 $P$에서 원 $O$에 그은 두 접선의 접점을 $A, B$라 합니다. $\\angle APB=50^\\circ$일 때 $\\angle AOB$의 크기는 얼마인가요?",
   "130°", ["50°", "100°", "140°"], "접선은 접점을 지나는 반지름과 수직이므로 $\\angle OAP=\\angle OBP=90^\\circ$이고, 사각형 $PAOB$에서 $\\angle AOB=360^\\circ-90^\\circ-90^\\circ-50^\\circ=130^\\circ$입니다.")
mc(b, S, "A", "삼각형 $ABC$의 내접원이 변 $AB, BC, CA$와 만나는 점을 각각 $D, E, F$라 하고 $\\overline{AB}=7,\\ \\overline{BC}=8,\\ \\overline{CA}=9$일 때 $\\overline{AD}$의 길이는 얼마인가요?",
   "4", ["3", "5", "6"], "$\\overline{AD}=\\dfrac{\\overline{AB}+\\overline{CA}-\\overline{BC}}{2}=\\dfrac{7+9-8}{2}=4$입니다.")
mc(b, S, "A", "원의 현과 접선에 대한 설명으로 옳은 것을 〈보기〉에서 모두 고른 것은 무엇인가요?\n〈보기〉\nㄱ. 한 원에서 길이가 같은 두 현은 원의 중심으로부터 같은 거리에 있다.\nㄴ. 한 원에서 중심으로부터 같은 거리에 있는 두 현의 길이는 같다.\nㄷ. 원 밖의 한 점에서 그 원에 그은 두 접선의 길이는 서로 다르다.\nㄹ. 현의 수직이등분선은 원의 중심을 지나지 않는다.",
   "ㄱ, ㄴ", ["ㄴ, ㄷ", "ㄷ, ㄹ", "ㄱ, ㄹ"], "ㄱ, ㄴ은 현의 성질로 옳습니다. 원 밖의 한 점에서 그은 두 접선의 길이는 같고(ㄷ), 현의 수직이등분선은 원의 중심을 지납니다(ㄹ).")

# ───────── 9수03-19 원주각의 성질 ─────────
S = "9수03-19"
mc(b, S, "C", "한 호에 대한 원주각의 크기는 그 호에 대한 중심각의 크기의 몇 배인가요?",
   "$\\dfrac12$", ["2", "1", "$\\dfrac13$"], "원주각의 크기는 중심각의 크기의 $\\dfrac12$입니다.")
sh(b, S, "C", "중심각이 $100^\\circ$인 호에 대한 원주각의 크기는 몇 도인가요? (숫자만)", A(50), "원주각은 중심각의 절반이므로 $50^\\circ$입니다.",
   svg=circ({"A": 40, "B": 140, "P": 270}, chords=[("A", "B"), ("A", "P"), ("B", "P"), ("O", "A"), ("O", "B")], arcs=[("O", "A", "B", 20, "100°"), ("P", "A", "B", 26, "?")], oloff=(14, 6)))
mc(b, S, "C", "반원에 대한 원주각의 크기는 얼마인가요?",
   "90°", ["45°", "180°", "60°"], "지름에 대한 원주각은 $90^\\circ$입니다.")
mc(b, S, "B", "한 원에서 같은 호에 대한 원주각의 크기는 어떻게 되나요?",
   "모두 같다", ["모두 다르다", "중심각과 같다", "두 배가 된다"], "같은 호에 대한 원주각의 크기는 모두 같습니다.")
sh(b, S, "B", "원주각 $\\angle APB=35^\\circ$일 때 호 $AB$에 대한 중심각 $\\angle AOB$의 크기는 몇 도인가요? (숫자만)", A(70), "중심각은 원주각의 2배이므로 $70^\\circ$입니다.")
mc(b, S, "B", "그림에서 $\\overline{AB}$는 원 $O$의 지름이고 점 $C$는 원 위의 점입니다. $\\angle CAB=35^\\circ$일 때 $\\angle ABC$의 크기는 얼마인가요?",
   "55°", ["35°", "45°", "70°"], "지름에 대한 원주각이므로 $\\angle ACB=90^\\circ$이고, $\\angle ABC=180^\\circ-90^\\circ-35^\\circ=55^\\circ$입니다.",
   svg=circ({"A": 180, "B": 0, "C": 70}, chords=[("A", "B"), ("A", "C"), ("B", "C")], arcs=[("A", "B", "C", 26, "35°"), ("B", "C", "A", 22, "?")]))
mc(b, S, "A", "한 원에서 호의 길이가 $6$인 호에 대한 원주각이 $30^\\circ$일 때, 원주각이 $60^\\circ$인 호의 길이는 얼마인가요?",
   "12", ["9", "18", "24"], "호의 길이는 원주각의 크기에 정비례하므로 $6\\times\\dfrac{60}{30}=12$입니다.")
mc(b, S, "A", "원 위의 네 점 $A, B, C, D$에 대하여 두 현 $AC$와 $BD$가 원의 내부의 점 $P$에서 만납니다. $\\angle BAC=25^\\circ$, $\\angle ACD=40^\\circ$일 때 $\\angle APB$의 크기는 얼마인가요?",
   "115°", ["65°", "50°", "130°"], "호 $BC$에 대한 원주각이므로 $\\angle BDC=\\angle BAC=25^\\circ$입니다. $\\triangle PCD$에서 $\\angle CPD=180^\\circ-40^\\circ-25^\\circ=115^\\circ$이고, $\\angle APB$는 그 맞꼭지각이므로 $115^\\circ$입니다.")
mc(b, S, "A", "한 원에서 호 $AB$의 길이가 원의 둘레의 $\\dfrac15$일 때, 호 $AB$에 대한 원주각의 크기는 얼마인가요?",
   "36°", ["72°", "18°", "45°"], "호 $AB$에 대한 중심각은 $360^\\circ\\times\\dfrac15=72^\\circ$이고, 원주각은 그 절반인 $36^\\circ$입니다.")

if __name__ == "__main__":
    report(bank, 9, lo=300, hi=700)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
