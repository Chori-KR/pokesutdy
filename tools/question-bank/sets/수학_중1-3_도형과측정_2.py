"""수학 · 중1-3 · 도형과 측정 2 (9수03-08 ~ 14) — 63문제"""
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

bank = Bank("수학", "중", "수학", "중1-3", "도형과 측정", "bank_수학_중1-3_도형과측정_2.json")
b = KoBank(bank)


def tri_fig(pts, segs, **kw):
    kw.setdefault("W", 230)
    kw.setdefault("H", 160)
    return geo(pts, segs=segs, **kw)


# ───────── 9수03-08 입체도형의 겉넓이와 부피 ─────────
S = "9수03-08"
mc(b, S, "C", "가로 $3\\,\\mathrm{cm}$, 세로 $4\\,\\mathrm{cm}$, 높이 $5\\,\\mathrm{cm}$인 직육면체의 부피는 몇 $\\mathrm{cm^3}$인가요?", "60", ["12", "47", "120"], "부피는 $3\\times4\\times5=60\\,\\mathrm{cm^3}$입니다.")
mc(b, S, "C", "한 모서리의 길이가 $4\\,\\mathrm{cm}$인 정육면체의 겉넓이는 몇 $\\mathrm{cm^2}$인가요?", "96", ["64", "48", "128"], "정사각형 6개이므로 $6\\times4\\times4=96\\,\\mathrm{cm^2}$입니다.")
mc(b, S, "C", "밑면의 반지름이 $r$, 높이가 $h$인 원기둥의 부피를 구하는 식은 무엇인가요?",
   "$\\pi r^2 h$", ["$2\\pi r h$", "$\\dfrac13\\pi r^2 h$", "$\\dfrac43\\pi r^3$"], "원기둥의 부피는 (밑넓이)×(높이)$=\\pi r^2 h$입니다.")
mc(b, S, "B", "그림의 원기둥(밑면의 반지름 $3\\,\\mathrm{cm}$, 높이 $5\\,\\mathrm{cm}$)의 겉넓이는 얼마인가요?",
   "$48\\pi\\,\\mathrm{cm^2}$", ["$30\\pi\\,\\mathrm{cm^2}$", "$45\\pi\\,\\mathrm{cm^2}$", "$63\\pi\\,\\mathrm{cm^2}$"], "겉넓이는 $2\\times\\pi\\times3^2+2\\pi\\times3\\times5=18\\pi+30\\pi=48\\pi$입니다.", svg=cyl_fig(h=60, r=30, rtxt="3", htxt="5"))
mc(b, S, "B", "밑면이 한 변의 길이가 $6\\,\\mathrm{cm}$인 정사각형이고 높이가 $4\\,\\mathrm{cm}$인 사각뿔의 부피는 몇 $\\mathrm{cm^3}$인가요?", "48", ["144", "24", "72"], "부피는 $\\dfrac13\\times36\\times4=48\\,\\mathrm{cm^3}$입니다.")
mc(b, S, "B", "반지름이 $3\\,\\mathrm{cm}$인 구의 부피는 얼마인가요?",
   "$36\\pi\\,\\mathrm{cm^3}$", ["$12\\pi\\,\\mathrm{cm^3}$", "$27\\pi\\,\\mathrm{cm^3}$", "$108\\pi\\,\\mathrm{cm^3}$"], "구의 부피는 $\\dfrac43\\pi r^3=\\dfrac43\\pi\\times27=36\\pi$입니다.", svg=sphere_fig(rtxt="3"))
mc(b, S, "A", "그림의 원뿔(밑면의 반지름 $3\\,\\mathrm{cm}$, 모선의 길이 $5\\,\\mathrm{cm}$)의 겉넓이는 얼마인가요?",
   "$24\\pi\\,\\mathrm{cm^2}$", ["$15\\pi\\,\\mathrm{cm^2}$", "$9\\pi\\,\\mathrm{cm^2}$", "$30\\pi\\,\\mathrm{cm^2}$"], "밑넓이 $\\pi\\times3^2=9\\pi$, 옆넓이 $\\pi\\times3\\times5=15\\pi$이므로 겉넓이는 $24\\pi$입니다.", svg=cone_fig(h=60, r=30))
sh(b, S, "A", "반지름이 $5\\,\\mathrm{cm}$인 구의 겉넓이는 몇 $\\pi\\,\\mathrm{cm^2}$인가요? (숫자만)", ["100", "100π"], "구의 겉넓이는 $4\\pi r^2=4\\pi\\times25=100\\pi$입니다.")
mc(b, S, "A", "원기둥에 꼭 맞게 들어 있는 구(지름과 높이가 같음)의 부피는 원기둥 부피의 몇 배인가요?",
   "$\\dfrac23$", ["$\\dfrac12$", "$\\dfrac13$", "$\\dfrac34$"], "구 $\\dfrac43\\pi r^3$, 원기둥 $\\pi r^2\\cdot2r=2\\pi r^3$이므로 비는 $\\dfrac23$입니다.")

# ───────── 9수03-09 이등변삼각형 ─────────
S = "9수03-09"
mc(b, S, "C", "이등변삼각형의 두 밑각의 크기에 대한 설명으로 알맞은 것은 무엇인가요?",
   "서로 같다", ["서로 다르다", "합이 $90^\\circ$이다", "항상 $60^\\circ$이다"], "이등변삼각형의 두 밑각의 크기는 같습니다.")
sh(b, S, "C", "$\\overline{AB}=\\overline{AC}$인 이등변삼각형 $ABC$에서 $\\angle A=40^\\circ$일 때 $\\angle B$의 크기는 몇 도인가요? (숫자만)", A(70),
   "밑각의 크기는 $(180^\\circ-40^\\circ)\\div2=70^\\circ$입니다.", svg=tri_fig({"A": (115, 20), "B": (40, 135), "C": (190, 135)}, [("A", "B"), ("B", "C"), ("C", "A")], ticks=[("A", "B", 1), ("A", "C", 1)], arcs=[("A", "B", "C", 24, "40°")]))
mc(b, S, "C", "$\\overline{AB}=\\overline{AC}$인 이등변삼각형에서 $\\angle B=50^\\circ$일 때 $\\angle C$의 크기는 얼마인가요?",
   "50°", ["80°", "65°", "40°"], "이등변삼각형의 밑각은 같으므로 $\\angle C=\\angle B=50^\\circ$입니다.")
mc(b, S, "B", "이등변삼각형의 꼭지각이 $80^\\circ$일 때 한 밑각의 크기는 몇 도인가요?", "50°", ["40°", "100°", "80°"], "$(180^\\circ-80^\\circ)\\div2=50^\\circ$입니다.")
mc(b, S, "B", "이등변삼각형 $ABC$ ($\\overline{AB}=\\overline{AC}$)에서 꼭지각 $A$의 이등분선과 밑변 $BC$가 만나는 점을 $D$라 할 때 알맞은 설명은 무엇인가요?",
   "$\\overline{AD}$는 $\\overline{BC}$를 수직이등분한다", ["$\\overline{AD}=\\overline{BC}$이다", "$\\overline{BD}=2\\overline{DC}$이다", "$\\angle ADB=60^\\circ$이다"], "이등변삼각형의 꼭지각의 이등분선은 밑변을 수직이등분합니다.",
   svg=tri_fig({"A": (115, 20), "B": (40, 135), "C": (190, 135), "D": (115, 135)}, [("A", "B"), ("B", "C"), ("C", "A"), ("A", "D", "d")], rights=[("D", "A", "C")], ticks=[("A", "B", 1), ("A", "C", 1), ("B", "D", 2), ("D", "C", 2)]))
mc(b, S, "B", "$\\overline{AB}=\\overline{AC}$인 삼각형 $ABC$에서 $\\angle B=(2x+10)^\\circ$, $\\angle C=(3x-20)^\\circ$일 때 $x$의 값을 구하세요.", "30", ["20", "10", "40"], "밑각이 같으므로 $2x+10=3x-20$에서 $x=30$입니다.")
sh(b, S, "A", "$\\overline{AB}=\\overline{AC}$인 삼각형 $ABC$에서 $\\overline{BC}$의 연장선 위의 점 $D$에 대해 $\\angle ACD=110^\\circ$일 때 $\\angle A$의 크기는 몇 도인가요? (숫자만)", A(40),
   "$\\angle ACB=180^\\circ-110^\\circ=70^\\circ$이므로 $\\angle B=70^\\circ$이고 $\\angle A=180^\\circ-70^\\circ-70^\\circ=40^\\circ$입니다.",
   svg=tri_fig({"A": (90, 20), "B": (30, 130), "C": (150, 130), "D": (215, 130)}, [("A", "B"), ("B", "D"), ("C", "A")], arcs=[("C", "A", "D", 22, "110°")], ticks=[("A", "B", 1), ("A", "C", 1)]))
mc(b, S, "A", "삼각형 $ABC$에서 $\\angle B=\\angle C$이면 어떤 삼각형인가요?",
   "$\\overline{AB}=\\overline{AC}$인 이등변삼각형", ["$\\overline{BC}=\\overline{AB}$인 이등변삼각형", "정삼각형", "직각삼각형"], "두 내각의 크기가 같은 삼각형은 그 두 각의 대변의 길이가 같은 이등변삼각형입니다.")
mc(b, S, "A", "$\\overline{AB}=\\overline{AC}$인 이등변삼각형 $ABC$에서 $\\overline{BC}$ 위의 점 $D$에 대해 $\\overline{AD}$가 $\\angle A$의 이등분선일 때 $\\triangle ABD\\equiv\\triangle ACD$의 합동 조건은 무엇인가요?",
   "SAS 합동", ["SSS 합동", "ASA 합동", "RHA 합동"], "$\\overline{AB}=\\overline{AC}$, $\\angle BAD=\\angle CAD$, $\\overline{AD}$ 공통이므로 SAS 합동입니다.")

# ───────── 9수03-10 삼각형의 외심과 내심 ─────────
S = "9수03-10"
mc(b, S, "C", "삼각형의 세 변의 수직이등분선이 만나는 점을 무엇이라고 하나요?",
   "외심", ["내심", "무게중심", "수심"], "세 변의 수직이등분선의 교점은 외심입니다.")
sh(b, S, "C", "삼각형의 세 내각의 이등분선이 만나는 점을 무엇이라고 하나요? (두 글자)", ["내심"], "세 내각의 이등분선의 교점은 내심입니다.")
mc(b, S, "C", "삼각형의 외심에서 세 꼭짓점까지의 거리에 대한 설명으로 알맞은 것은 무엇인가요?",
   "모두 같다", ["모두 다르다", "두 개만 같다", "빗변에서만 같다"], "외심은 세 꼭짓점에서 같은 거리에 있는 점입니다.")
mc(b, S, "B", "빗변의 길이가 $10\\,\\mathrm{cm}$인 직각삼각형의 외접원의 반지름의 길이는 몇 $\\mathrm{cm}$인가요?", "5", ["10", "20", "2.5"], "직각삼각형의 외심은 빗변의 중점이므로 반지름은 $10\\div2=5\\,\\mathrm{cm}$입니다.")
mc(b, S, "B", "삼각형 $ABC$의 외심을 $O$라 하고 $\\angle A=60^\\circ$일 때 $\\angle BOC$의 크기는 얼마인가요?",
   "120°", ["60°", "30°", "90°"], "외심에서 중심각은 원주각의 2배이므로 $\\angle BOC=2\\times60^\\circ=120^\\circ$입니다.",
   svg=geo({"A": (115, 25), "B": (59, 122), "C": (171, 122), "O": (115, 90)}, segs=[("A", "B"), ("B", "C"), ("C", "A"), ("O", "B", "d"), ("O", "C", "d")], circles=[(115, 90, 65, "d")], arcs=[("O", "B", "C", 18, "?")], W=230, H=160, loff={"O": (0, 18)}))
mc(b, S, "B", "삼각형 $ABC$의 내심을 $I$라 하고 $\\angle A=70^\\circ$일 때 $\\angle BIC$의 크기는 얼마인가요?",
   "125°", ["110°", "140°", "55°"], "$\\angle BIC=90^\\circ+\\dfrac12\\angle A=90^\\circ+35^\\circ=125^\\circ$입니다.")
mc(b, S, "A", "세 변의 길이가 $3\\,\\mathrm{cm},\\ 4\\,\\mathrm{cm},\\ 5\\,\\mathrm{cm}$인 직각삼각형의 내접원의 반지름의 길이는 몇 $\\mathrm{cm}$인가요?", "1", ["2", "1.5", "3"],
   "직각삼각형의 내접원의 반지름은 $\\dfrac{3+4-5}{2}=1$입니다.")
sh(b, S, "A", "둘레의 길이가 $24\\,\\mathrm{cm}$이고 내접원의 반지름이 $2\\,\\mathrm{cm}$인 삼각형의 넓이는 몇 $\\mathrm{cm^2}$인가요? (숫자만)", ["24"],
   "넓이 $=\\dfrac12\\times r\\times(\\text{둘레})=\\dfrac12\\times2\\times24=24$입니다.")
mc(b, S, "A", "삼각형 $ABC$의 외심 $O$에 대해 $\\angle OBC=30^\\circ$일 때 $\\angle A$의 크기는 얼마인가요?",
   "60°", ["30°", "90°", "120°"], "$\\triangle OBC$는 이등변삼각형이므로 $\\angle BOC=180^\\circ-60^\\circ=120^\\circ$이고 $\\angle A=\\dfrac12\\angle BOC=60^\\circ$입니다.")

# ───────── 9수03-11 사각형의 성질 ─────────
S = "9수03-11"
mc(b, S, "C", "평행사변형의 성질로 알맞은 것은 무엇인가요?",
   "두 쌍의 대각의 크기가 각각 같다", ["네 변의 길이가 모두 같다", "대각선이 서로 수직이다", "네 각이 모두 직각이다"], "평행사변형은 두 쌍의 대변의 길이, 대각의 크기가 각각 같습니다.")
sh(b, S, "C", "평행사변형 $ABCD$에서 $\\angle A=70^\\circ$일 때 $\\angle C$의 크기는 몇 도인가요? (숫자만)", A(70), "평행사변형의 대각의 크기는 같으므로 $\\angle C=\\angle A=70^\\circ$입니다.",
   svg=geo({"A": (50, 30), "B": (20, 130), "C": (160, 130), "D": (190, 30)}, segs=[("A", "B"), ("B", "C"), ("C", "D"), ("D", "A")], W=230, H=160))
mc(b, S, "C", "네 변의 길이가 모두 같은 사각형은 무엇인가요?",
   "마름모", ["직사각형", "평행사변형", "사다리꼴"], "네 변의 길이가 모두 같은 사각형이 마름모입니다.")
sh(b, S, "B", "평행사변형 $ABCD$에서 $\\overline{AB}=5\\,\\mathrm{cm}$, $\\overline{BC}=8\\,\\mathrm{cm}$일 때 둘레의 길이는 몇 $\\mathrm{cm}$인가요? (숫자만)", ["26"], "대변의 길이가 같으므로 둘레는 $2\\times(5+8)=26\\,\\mathrm{cm}$입니다.")
mc(b, S, "B", "직사각형 $ABCD$의 두 대각선의 교점을 $O$라 하고 $\\overline{AC}=10\\,\\mathrm{cm}$일 때 $\\overline{OB}$의 길이는 몇 $\\mathrm{cm}$인가요?", "5", ["10", "20", "2.5"],
   "직사각형의 대각선은 길이가 같고 서로 이등분하므로 $\\overline{OB}=\\dfrac12\\overline{BD}=5\\,\\mathrm{cm}$입니다.")
mc(b, S, "B", "마름모의 두 대각선의 길이가 $6\\,\\mathrm{cm},\\ 8\\,\\mathrm{cm}$일 때 한 변의 길이는 몇 $\\mathrm{cm}$인가요?", "5", ["7", "10", "14"],
   "대각선은 서로 수직이등분하므로 한 변은 $\\sqrt{3^2+4^2}=5\\,\\mathrm{cm}$입니다.")
sh(b, S, "A", "평행사변형 $ABCD$에서 $\\angle A=2\\angle B$일 때 $\\angle A$의 크기는 몇 도인가요? (숫자만)", A(120), "이웃한 두 각의 합은 $180^\\circ$이므로 $3\\angle B=180^\\circ$, $\\angle B=60^\\circ$이고 $\\angle A=120^\\circ$입니다.")
mc(b, S, "A", "마름모가 정사각형이 되기 위한 조건으로 알맞은 것은 무엇인가요?",
   "한 내각의 크기가 $90^\\circ$이다", ["두 대각선이 서로 수직이다", "두 쌍의 대변이 평행하다", "네 변의 길이가 같다"], "마름모에서 한 내각이 직각이면 네 각이 모두 직각이 되어 정사각형입니다.")
mc(b, S, "A", "등변사다리꼴의 성질로 알맞은 것은 무엇인가요?",
   "두 대각선의 길이가 같다", ["두 대각선이 서로 수직이다", "네 변의 길이가 모두 같다", "두 쌍의 대변이 평행하다"], "등변사다리꼴은 평행하지 않은 두 변의 길이가 같고 두 대각선의 길이도 같습니다.")

# ───────── 9수03-12 도형의 닮음과 닮음비 ─────────
S = "9수03-12"
mc(b, S, "C", "한 도형을 일정한 비율로 확대하거나 축소한 도형과 합동인 도형을 무엇이라고 하나요?",
   "닮은 도형", ["대칭 도형", "합동 도형", "평행 도형"], "확대·축소하여 합동이 되는 도형을 닮은 도형이라고 합니다.")
mc(b, S, "C", "닮은 두 도형에서 대응하는 변의 길이의 비를 무엇이라고 하나요?",
   "닮음비", ["합동비", "축척", "비례식"], "닮은 도형의 대응변의 길이의 비는 닮음비입니다.")
mc(b, S, "C", "닮음비가 $2:3$인 두 삼각형에서 작은 삼각형의 한 변이 $6\\,\\mathrm{cm}$일 때 대응하는 변의 길이는 몇 $\\mathrm{cm}$인가요?", "9", ["4", "12", "15"], "$6\\times\\dfrac32=9\\,\\mathrm{cm}$입니다.")
mc(b, S, "B", "닮음비가 $1:2$인 두 삼각형의 넓이의 비는 얼마인가요?",
   "$1:4$", ["$1:2$", "$1:3$", "$1:8$"], "닮은 평면도형의 넓이의 비는 닮음비의 제곱이므로 $1:4$입니다.")
mc(b, S, "B", "닮음비가 $1:2$인 두 입체도형의 부피의 비는 얼마인가요?",
   "$1:8$", ["$1:2$", "$1:4$", "$1:6$"], "닮은 입체도형의 부피의 비는 닮음비의 세제곱이므로 $1:8$입니다.")
mc(b, S, "B", "닮은 두 도형에서 대응하는 각의 크기는 어떻게 되나요?",
   "서로 같다", ["서로 다르다", "닮음비만큼 다르다", "2배이다"], "닮은 도형에서 대응각의 크기는 같습니다.")
sh(b, S, "A", "닮음비가 $3:5$인 두 삼각형이 있습니다. 작은 삼각형의 넓이가 $18\\,\\mathrm{cm^2}$일 때 큰 삼각형의 넓이는 몇 $\\mathrm{cm^2}$인가요? (숫자만)", ["50"],
   "넓이의 비는 $9:25$이므로 큰 삼각형의 넓이는 $18\\times\\dfrac{25}{9}=50$입니다.")
mc(b, S, "A", "닮은 두 입체도형의 부피의 비가 $8:27$일 때 겉넓이의 비는 얼마인가요?",
   "$4:9$", ["$2:3$", "$8:27$", "$16:81$"], "부피의 비 $8:27$에서 닮음비는 $2:3$이므로 겉넓이의 비는 $4:9$입니다.")
mc(b, S, "A", "축척이 $\\dfrac{1}{50000}$인 지도에서 실제 거리 $5\\,\\mathrm{km}$는 지도에서 몇 $\\mathrm{cm}$인가요?", "10", ["5", "100", "25"],
   "$5\\,\\mathrm{km}=500000\\,\\mathrm{cm}$이므로 지도에서의 길이는 $500000\\div50000=10\\,\\mathrm{cm}$입니다.")

# ───────── 9수03-13 삼각형의 닮음 조건 ─────────
S = "9수03-13"
mc(b, S, "C", "두 삼각형에서 세 쌍의 대응변의 길이의 비가 같을 때 두 삼각형은 닮음입니다. 이 닮음 조건의 이름은 무엇인가요?",
   "SSS 닮음", ["SAS 닮음", "AA 닮음", "ASA 닮음"], "세 쌍의 대응변의 길이의 비가 같은 경우는 SSS 닮음입니다.")
mc(b, S, "C", "두 삼각형에서 두 쌍의 대응각의 크기가 각각 같을 때 두 삼각형은 닮음입니다. 이 닮음 조건의 이름은 무엇인가요?",
   "AA 닮음", ["SSS 닮음", "SAS 닮음", "RHS 닮음"], "두 쌍의 대응각의 크기가 각각 같은 경우는 AA 닮음입니다.")
mc(b, S, "C", "두 쌍의 대응변의 길이의 비가 같고 그 끼인각의 크기가 같은 두 삼각형은 닮음입니다. 이 닮음 조건의 이름은 무엇인가요?",
   "SAS 닮음", ["SSS 닮음", "AA 닮음", "ASA 닮음"], "두 변의 길이의 비와 그 끼인각이 같은 경우는 SAS 닮음입니다.")
mc(b, S, "B", "$\\triangle ABC$의 세 변이 $3,4,5$이고 $\\triangle DEF$의 세 변이 $6,8,10$일 때 두 삼각형의 닮음 조건은 무엇인가요?",
   "SSS 닮음", ["SAS 닮음", "AA 닮음", "합동"], "$3:6=4:8=5:10$이므로 SSS 닮음입니다.")
mc(b, S, "B", "$\\angle A=50^\\circ,\\ \\angle B=60^\\circ$인 $\\triangle ABC$와 $\\angle D=50^\\circ,\\ \\angle E=60^\\circ$인 $\\triangle DEF$의 닮음 조건은 무엇인가요?",
   "AA 닮음", ["SSS 닮음", "SAS 닮음", "합동"], "두 쌍의 대응각이 같으므로 AA 닮음입니다.")
mc(b, S, "B", "$\\overline{AB}:\\overline{DE}=\\overline{AC}:\\overline{DF}=1:2$이고 $\\angle A=\\angle D$일 때 $\\triangle ABC$와 $\\triangle DEF$의 닮음 조건은 무엇인가요?",
   "SAS 닮음", ["SSS 닮음", "AA 닮음", "RHS 합동"], "두 변의 비가 같고 끼인각이 같으므로 SAS 닮음입니다.")
mc(b, S, "A", "직각삼각형 $ABC$ ($\\angle A=90^\\circ$)에서 꼭짓점 $A$에서 빗변 $BC$에 내린 수선의 발을 $H$라 하자. $\\overline{BH}=4$, $\\overline{HC}=9$일 때 $\\overline{AH}$의 길이를 구하세요.", "6", ["13", "36", "5"],
   "$\\triangle HBA\\sim\\triangle HAC$이므로 $\\overline{AH}^2=\\overline{BH}\\times\\overline{HC}=36$, $\\overline{AH}=6$입니다.",
   svg=tri_fig({"A": (80, 30), "B": (20, 130), "C": (210, 130), "H": (80, 130)}, [("A", "B"), ("B", "C"), ("C", "A"), ("A", "H", "d")], rights=[("A", "B", "C"), ("H", "A", "C")], texts=[(50, 146, "4"), (146, 146, "9")]))
sh(b, S, "A", "닮은 두 삼각형에서 대응하는 두 변의 길이가 각각 $6,\\ 9$이고, 작은 삼각형의 다른 한 변이 $8$일 때 큰 삼각형에서 대응하는 변의 길이를 구하세요. (숫자만)", ["12"],
   "닮음비가 $6:9=2:3$이므로 $8\\times\\dfrac32=12$입니다.")
mc(b, S, "A", "$\\angle A$를 공통으로 하는 $\\triangle ABC$와 $\\triangle ADE$에서 $\\overline{AB}=9,\\ \\overline{AC}=12,\\ \\overline{AD}=3,\\ \\overline{AE}=4$일 때 두 삼각형은 어떤 관계인가요?",
   "SAS 닮음", ["합동", "닮음이 아니다", "AA 닮음"], "$\\overline{AD}:\\overline{AB}=\\overline{AE}:\\overline{AC}=1:3$이고 $\\angle A$가 공통이므로 SAS 닮음입니다.")

# ───────── 9수03-14 평행선 사이의 선분의 길이의 비 ─────────
S = "9수03-14"
mc(b, S, "C", "삼각형 $ABC$에서 $\\overline{DE}\\parallel\\overline{BC}$일 때 성립하는 비례식은 무엇인가요?",
   "$\\overline{AD}:\\overline{AB}=\\overline{AE}:\\overline{AC}$", ["$\\overline{AD}:\\overline{DB}=\\overline{AB}:\\overline{AC}$", "$\\overline{AD}:\\overline{AE}=\\overline{DB}:\\overline{AC}$", "$\\overline{DE}:\\overline{BC}=\\overline{AD}:\\overline{DB}$"],
   "평행선이 두 변과 만날 때 대응하는 선분의 비는 같습니다.",
   svg=tri_fig({"A": (115, 20), "B": (30, 140), "C": (200, 140), "D": (72, 80), "E": (158, 80)}, [("A", "B"), ("B", "C"), ("C", "A"), ("D", "E")]))
sh(b, S, "C", "$\\overline{AD}=3\\,\\mathrm{cm}$, $\\overline{DB}=6\\,\\mathrm{cm}$일 때 $\\overline{AD}:\\overline{DB}$를 가장 간단한 자연수의 비로 나타내면 $1:\\square$입니다. $\\square$에 알맞은 수를 쓰세요. (숫자만)", ["2"], "$3:6=1:2$입니다.")
mc(b, S, "C", "삼각형 $ABC$에서 $\\overline{DE}\\parallel\\overline{BC}$이고 $\\overline{AD}=\\overline{DB}$일 때 $\\overline{AE}$와 $\\overline{EC}$의 관계는 무엇인가요?",
   "$\\overline{AE}=\\overline{EC}$", ["$\\overline{AE}=2\\overline{EC}$", "$\\overline{AE}<\\overline{EC}$", "알 수 없다"], "$\\overline{AD}:\\overline{DB}=\\overline{AE}:\\overline{EC}=1:1$이므로 $\\overline{AE}=\\overline{EC}$입니다.")
mc(b, S, "B", "삼각형 $ABC$에서 $\\overline{DE}\\parallel\\overline{BC}$이고 $\\overline{AD}=4,\\ \\overline{DB}=6,\\ \\overline{AE}=6$일 때 $\\overline{EC}$의 길이를 구하세요.", "9", ["4", "12", "6"],
   "$4:6=6:\\overline{EC}$이므로 $\\overline{EC}=9$입니다.")
mc(b, S, "B", "삼각형 $ABC$에서 $\\overline{DE}\\parallel\\overline{BC}$, $\\overline{AD}:\\overline{AB}=2:5$이고 $\\overline{BC}=15$일 때 $\\overline{DE}$의 길이를 구하세요.", "6", ["10", "5", "7.5"],
   "$\\overline{DE}:\\overline{BC}=\\overline{AD}:\\overline{AB}=2:5$이므로 $\\overline{DE}=15\\times\\dfrac25=6$입니다.")
mc(b, S, "B", "세 평행선 $l,m,n$이 두 직선과 만나 $a:b=3:5$일 때, $a=6$이면 $b$의 값은 얼마인가요?",
   "10", ["6", "8", "12"], "$3:5=6:b$에서 $b=10$입니다.")
sh(b, S, "A", "삼각형 $ABC$에서 두 변 $AB, AC$의 중점을 각각 $D, E$라 하고 $\\overline{BC}=14$일 때 $\\overline{DE}$의 길이를 구하세요. (숫자만)", ["7"], "중점연결정리에 의해 $\\overline{DE}=\\dfrac12\\overline{BC}=7$입니다.")
mc(b, S, "A", "삼각형 $ABC$에서 $\\angle A$의 이등분선이 $\\overline{BC}$와 만나는 점을 $D$라 하자. $\\overline{AB}=6,\\ \\overline{AC}=4,\\ \\overline{BC}=10$일 때 $\\overline{BD}$의 길이를 구하세요.", "6", ["4", "5", "7"],
   "각의 이등분선의 성질로 $\\overline{BD}:\\overline{DC}=\\overline{AB}:\\overline{AC}=3:2$이므로 $\\overline{BD}=10\\times\\dfrac35=6$입니다.")
mc(b, S, "A", "$\\overline{AD}=\\overline{DB}$, $\\overline{DE}\\parallel\\overline{BC}$일 때 $\\triangle ADE$와 $\\triangle ABC$의 넓이의 비는 얼마인가요?",
   "$1:4$", ["$1:2$", "$1:3$", "$1:8$"], "닮음비가 $1:2$이므로 넓이의 비는 $1:4$입니다.")

if __name__ == "__main__":
    report(bank, 9, lo=300, hi=700)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
