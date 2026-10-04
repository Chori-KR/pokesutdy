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

def sq_diag():
    W, H = 200, 150
    out = [f'<rect x="50" y="20" width="100" height="100" fill="none" stroke="currentColor" stroke-width="2.5"/>',
           line(50, 120, 150, 20, 2.5, color=ORANGE),
           text(100, 140, "1", 14, weight="bold"), text(40, 74, "1", 14, anchor="end", weight="bold"),
           text(112, 64, "?", 16, anchor="start", weight="bold")]
    return svg(W, H, "".join(out))


bank = Bank("수학", "중", "수학", "중1-3", "수와 연산", "bank_수학_중1-3_수와연산_2.json")
b = KoBank(bank)

# ───────── 9수01-08 무리수 ─────────
S = "9수01-08"
mc(b, S, "C", "한 변의 길이가 1인 정사각형의 대각선(?)의 길이는?", "$\\sqrt{2}$", ["1", "2", "$\\dfrac32$"], "피타고라스 정리로 $1^{2}+1^{2}=2$이므로 대각선의 길이는 $\\sqrt{2}$입니다. 분수로 나타낼 수 없는 무리수입니다.", svg=sq_diag())
mc(b, S, "C", "다음 중 무리수인 것은?", "$\\sqrt{3}$", ["$\\sqrt{9}$", "0.25", "$-\\dfrac13$"], "$\\sqrt{9}=3$, $0.25=\\dfrac14$은 유리수입니다. $\\sqrt{3}$은 분수로 나타낼 수 없습니다.")
mc(b, S, "C", "무리수를 소수로 나타내면 어떻게 되나요?", "순환하지 않는 무한소수", ["유한소수", "순환하는 무한소수", "정수"], "무리수는 소수로 나타내면 순환하지 않는 무한소수입니다.")
mc(b, S, "B", "다음 중 무리수가 아닌 것은?", "$\\sqrt{0.04}$", ["$\\sqrt{0.4}$", "$\\sqrt{5}$", "$\\pi$"], "$\\sqrt{0.04}=0.2$로 유리수입니다.")
sh(b, S, "B", "$\\sqrt{2},\\ \\sqrt{4},\\ \\sqrt{6},\\ \\sqrt{9},\\ \\sqrt{10},\\ \\sqrt{16}$ 중 무리수는 모두 몇 개인가요? (숫자만)", ["3", "3개"], "$\\sqrt{4}=2$, $\\sqrt{9}=3$, $\\sqrt{16}=4$는 유리수이고, $\\sqrt{2},\\sqrt{6},\\sqrt{10}$이 무리수입니다.")
mc(b, S, "B", "원주율 $\\pi$에 대한 설명으로 옳은 것은?", "순환하지 않는 무한소수이므로 무리수이다", ["3.14로 끝나는 유한소수이다", "$\\dfrac{22}{7}$와 같으므로 유리수이다", "순환소수이다"], "3.14나 $\\dfrac{22}{7}$는 $\\pi$의 근삿값일 뿐입니다.")
mc(b, S, "A", "실수의 체계에 대한 설명으로 옳은 것은?", "실수는 유리수와 무리수로 이루어진다", ["실수는 유리수와 정수로 이루어진다", "무리수는 유리수에 포함된다", "실수 중 정수가 아닌 수는 모두 무리수이다"], "$\\dfrac12$처럼 정수가 아닌 유리수도 있습니다.")
mc(b, S, "A", "$\\sqrt{2}$는 분수로 나타낼 수 없습니다. 그럼에도 무리수가 필요한 이유로 가장 알맞은 것은?", "수직선 위에 유리수만으로는 나타낼 수 없는 점이 있기 때문이다", ["유리수는 크기를 비교할 수 없기 때문이다", "수직선이 정수만으로 채워져 있기 때문이다", "모든 유리수가 무한소수이기 때문이다"], "한 변이 1인 정사각형의 대각선 길이 $\\sqrt{2}$처럼, 유리수가 아닌 수에 대응하는 점이 수직선 위에 있습니다.")
sh(b, S, "A", "1 이상 20 이하의 자연수 $n$ 중 $\\sqrt{n}$이 유리수인 $n$은 모두 몇 개인가요? (숫자만)", ["4", "4개"], "$n=1,4,9,16$일 때 $\\sqrt{n}$이 자연수이므로 4개입니다.")

# ───────── 9수01-09 실수의 대소 관계 ─────────
S = "9수01-09"
mc(b, S, "C", "$\\sqrt{2}$ $\\square$ 1.5에서 $\\square$ 안에 알맞은 부등호는?", "$<$", [">", "$=$", "$\\ge$"], "$1.5^{2}=2.25>2$이므로 $\\sqrt{2}<1.5$입니다.")
mc(b, S, "C", "$\\sqrt{7}$과 $\\sqrt{5}$ 중 더 큰 수는?", "$\\sqrt{7}$", ["$\\sqrt{5}$", "두 수는 같다", "알 수 없다"], "근호 안의 수가 클수록 큽니다.")
mc(b, S, "C", "3과 $\\sqrt{10}$ 중 더 큰 수와 그 이유는?", "$\\sqrt{10}$, $3=\\sqrt{9}$이고 $9<10$이기 때문이다", ["3, $\\sqrt{10}$은 근호가 있어 더 작기 때문이다", "$\\sqrt{10}$, 10이 3보다 크기 때문이다", "3, 3은 정수이기 때문이다"], "$3=\\sqrt{9}$로 바꾸어 근호 안의 수를 비교합니다.")
mc(b, S, "B", "$2,\\ \\sqrt{3}+1,\\ \\sqrt{5}$를 작은 수부터 차례로 나열한 것은?", "$2<\\sqrt{5}<\\sqrt{3}+1$", ["$2<\\sqrt{3}+1<\\sqrt{5}$", "$\\sqrt{5}<2<\\sqrt{3}+1$", "$\\sqrt{3}+1<\\sqrt{5}<2$"], "$\\sqrt{5}\\approx2.24$, $\\sqrt{3}+1\\approx2.73$입니다.")
mc(b, S, "B", "$\\sqrt{2}$의 소수 부분을 나타내는 식은?", "$\\sqrt{2}-1$", ["$\\sqrt{2}-2$", "0.414", "$\\sqrt{2}$"], "$\\sqrt{2}=1.414\\cdots$의 정수 부분은 1이므로 소수 부분은 $\\sqrt{2}-1$입니다.")
sh(b, S, "B", "$3<\\sqrt{n}<4$를 만족하는 자연수 $n$은 모두 몇 개인가요? (숫자만)", ["6", "6개"], "$9<n<16$이므로 $n=10,11,12,13,14,15$로 6개입니다.")
mc(b, S, "A", "1과 2 사이에 있는 무리수는?", "$\\sqrt{2}$", ["$\\sqrt{4}$", "$\\dfrac32$", "$\\sqrt{1}$"], "$1<\\sqrt{2}<2$이고 $\\sqrt{2}$는 무리수입니다. $\\dfrac32$는 유리수입니다.")
mc(b, S, "A", "다음 중 옳은 것은?", "$\\sqrt{3}+2<\\sqrt{2}+3$", ["$\\sqrt{3}+2>\\sqrt{2}+3$", "$\\sqrt{3}-1>\\sqrt{2}$", "$\\sqrt{5}-2>1$"], "차를 구하면 $(\\sqrt{3}+2)-(\\sqrt{2}+3)=\\sqrt{3}-\\sqrt{2}-1<0$입니다. ($\\sqrt{3}-\\sqrt{2}\\approx0.32$)")
sh(b, S, "A", "$2<\\sqrt{3n}<5$를 만족하는 자연수 $n$은 모두 몇 개인가요? (숫자만)", ["7", "7개"], "$4<3n<25$이므로 $n=2,3,\\cdots,8$로 7개입니다.")

# ───────── 9수01-10 근호를 포함한 식의 계산 ─────────
S = "9수01-10"
mc(b, S, "C", "$\\sqrt{2}+3\\sqrt{2}$를 계산하면?", "$4\\sqrt{2}$", ["$3\\sqrt{2}$", "$4\\sqrt{4}$", "$\\sqrt{8}$"], "$\\sqrt{2}$를 문자처럼 보고 $1+3=4$입니다.")
mc(b, S, "C", "$\\sqrt{3}\\times\\sqrt{5}$를 계산하면?", "$\\sqrt{15}$", ["$\\sqrt{8}$", "15", "$5\\sqrt{3}$"], "$\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}$입니다.")
sh(b, S, "C", "$\\sqrt{18}\\div\\sqrt{2}$를 계산하세요. (숫자만)", ["3"], "$\\sqrt{\\dfrac{18}{2}}=\\sqrt{9}=3$입니다.")
mc(b, S, "B", "$\\sqrt{8}+\\sqrt{18}$을 계산하면?", "$5\\sqrt{2}$", ["$\\sqrt{26}$", "$6\\sqrt{2}$", "$5\\sqrt{4}$"], "$\\sqrt{8}=2\\sqrt{2}$, $\\sqrt{18}=3\\sqrt{2}$이므로 합은 $5\\sqrt{2}$입니다.")
mc(b, S, "B", "$\\dfrac{6}{\\sqrt{3}}$의 분모를 유리화하면?", "$2\\sqrt{3}$", ["$\\sqrt{3}$", "$6\\sqrt{3}$", "$\\dfrac{2}{\\sqrt{3}}$"], "분모와 분자에 $\\sqrt{3}$을 곱하면 $\\dfrac{6\\sqrt{3}}{3}=2\\sqrt{3}$입니다.")
mc(b, S, "B", "$(\\sqrt{3}+1)(\\sqrt{3}-1)$을 계산하면?", "2", ["4", "$\\sqrt{3}$", "$2\\sqrt{3}$"], "$(a+b)(a-b)=a^{2}-b^{2}$이므로 $3-1=2$입니다.")
mc(b, S, "A", "$\\sqrt{2}(3-\\sqrt{2})$를 계산하면?", "$3\\sqrt{2}-2$", ["$3\\sqrt{2}-\\sqrt{2}$", "$3\\sqrt{2}+2$", "$3-2$"], "분배법칙으로 $3\\sqrt{2}-\\sqrt{2}\\times\\sqrt{2}=3\\sqrt{2}-2$입니다.")
sh(b, S, "A", "$\\dfrac{1}{\\sqrt{2}-1}=a\\sqrt{2}+b$일 때 $a+b$의 값을 구하세요. (숫자만)", ["2"], "분모를 유리화하면 $\\dfrac{\\sqrt{2}+1}{(\\sqrt{2}-1)(\\sqrt{2}+1)}=\\sqrt{2}+1$이므로 $a=1$, $b=1$입니다.")
mc(b, S, "A", "‘$\\sqrt{2}+\\sqrt{3}=\\sqrt{5}$’가 틀린 이유로 알맞은 것은?", "$\\sqrt{a}+\\sqrt{b}$는 $\\sqrt{a+b}$와 같지 않다. 예를 들어 $\\sqrt{4}+\\sqrt{9}=5$이지만 $\\sqrt{13}\\ne5$이다", ["근호 안의 수는 더할 수 없기 때문이다", "$\\sqrt{2}$와 $\\sqrt{3}$은 계산할 수 없기 때문이다", "$\\sqrt{5}$는 무리수가 아니기 때문이다"], "근호 안의 수가 같을 때만 계수끼리 더할 수 있습니다.")

if __name__ == "__main__":
    report(bank, 9, lo=300, hi=700)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
