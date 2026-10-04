import os, sys, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from svgkit import svg, text, line, table, BLUE, ORANGE, C, _n
from kit_ko import KoBank, report
from kit34 import hold
from kit56 import cuboid_fig, prism_fig, pyramid_fig, cone_fig, cyl_fig, sphere_fig
from kit_soc import compare_table
from kit_m9 import geo, sector, polar, plane, parab
from fractions import Fraction


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

bank = Bank("수학", "중", "수학", "중1-3", "변화와 관계", "bank_수학_중1-3_변화와관계_4.json")
b = KoBank(bank)

# ───────── 9수02-22 이차함수의 그래프 ─────────
S = "9수02-22"
mc(b, S, "C", "이차함수 $y=-x^{2}$의 그래프에 대한 설명으로 옳은 것은?", "위로 볼록하다", ["아래로 볼록하다", "$x$축에 대하여 대칭이다", "꼭짓점이 $(0,1)$이다"], "$x^{2}$의 계수가 음수이므로 위로 볼록하고, 꼭짓점은 원점입니다.")
mc(b, S, "C", "이차함수 $y=x^{2}+3$의 그래프의 꼭짓점의 좌표는?", "$(0,3)$", ["$(3,0)$", "$(0,-3)$", "$(-3,0)$"], "$y=x^{2}$을 $y$축 방향으로 3만큼 평행이동한 것이므로 꼭짓점은 $(0,3)$입니다.")
sh(b, S, "C", "이차함수 $y=(x-2)^{2}$의 그래프의 축의 방정식을 쓰세요. (예: $x=1$)", ["x=2", "$x=2$", "x = 2"], "꼭짓점이 $(2,0)$이고 축은 꼭짓점을 지나는 $y$축에 평행한 직선이므로 $x=2$입니다.")
mc(b, S, "B", "이차함수 $y=2(x-1)^{2}+3$의 그래프의 꼭짓점의 좌표는?", "$(1,3)$", ["$(-1,3)$", "$(1,-3)$", "$(3,1)$"], "$y=a(x-p)^{2}+q$의 꼭짓점은 $(p,q)$입니다.")
mc(b, S, "B", "그림은 이차함수 $y=a(x-p)^{2}+q$의 그래프입니다. 이 함수의 식은?", "$y=(x-2)^{2}-1$", ["$y=(x+2)^{2}-1$", "$y=(x-2)^{2}+1$", "$y=-(x-2)^{2}-1$"], "꼭짓점이 $(2,-1)$이고 아래로 볼록하며 $(0,3)$을 지나므로 $a=1$입니다.",
   svg=plane((-2, 6), (-2, 6), pts=[(2, -1, "(2,-1)"), (0, 3, "(0,3)")], curves=[parab(1, 2, -1, -0.65, 4.65)], W=230, H=230))
mc(b, S, "B", "$y=-(x+2)^{2}+1$의 그래프는 $y=-x^{2}$의 그래프를 어떻게 평행이동한 것인가요?", "$x$축 방향으로 $-2$, $y$축 방향으로 1", ["$x$축 방향으로 2, $y$축 방향으로 1", "$x$축 방향으로 $-2$, $y$축 방향으로 $-1$", "$x$축 방향으로 1, $y$축 방향으로 $-2$"], "$y=a(x-p)^{2}+q$에서 $p=-2$, $q=1$입니다.")
mc(b, S, "A", "이차함수 $y=x^{2}-4x+1$의 그래프의 꼭짓점의 좌표는?", "$(2,-3)$", ["$(-2,-3)$", "$(2,3)$", "$(4,1)$"], "$y=(x-2)^{2}-3$으로 고치면 꼭짓점은 $(2,-3)$입니다.")
sh(b, S, "A", "이차함수 $y=-x^{2}+2x+3$의 최댓값을 구하세요. (숫자만)", ["4"], "$y=-(x-1)^{2}+4$이므로 $x=1$일 때 최댓값 4입니다.")
mc(b, S, "A", "그림은 $y=x^{2}-2x-3$의 그래프입니다. 옳은 설명은?", "$x$축과 두 점에서 만나고 꼭짓점의 좌표는 $(1,-4)$이다", ["$x$축과 한 점에서 만나고 꼭짓점의 좌표는 $(1,-4)$이다", "$x$축과 두 점에서 만나고 꼭짓점의 좌표는 $(-1,-4)$이다", "$x$축과 만나지 않고 꼭짓점의 좌표는 $(1,4)$이다"], "$y=(x-1)^{2}-4$이고, $y=0$이면 $(x+1)(x-3)=0$이므로 $x=-1,3$에서 $x$축과 만납니다.",
   svg=plane((-2, 4), (-5, 4), curves=[parab(1, 1, -4, -1.9, 3.9)], W=230, H=230))

if __name__ == "__main__":
    report(bank, 9, lo=300, hi=700)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
