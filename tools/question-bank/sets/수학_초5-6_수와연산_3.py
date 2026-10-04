"""수학 · 초5-6 · 수와 연산 (3/3) (6수01-15) — 9문제"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from svgkit import svg, text, line, table, BLUE, ORANGE, C, _n
from kit_ko import KoBank, report
from kit34 import hold
from kit56 import *
from kit12 import blocks

def cm(n):
    return f"${n}\\,\\mathrm{{cm}}$"

def cm2(n):
    return f"${n}\\,\\mathrm{{cm^2}}$"

def cm3(n):
    return f"${n}\\,\\mathrm{{cm^3}}$"

def ans(n, unit=""):
    """단답형 허용 답: 숫자만, 단위 붙임"""
    a = [str(n)]
    if unit:
        a += [f"{n}{unit}", f"{n} {unit}"]
    return a
from kit34n import fr, mx, ex, frac_bars, frac_bar, frac_line, pie
from kit_soc import compare_table
from math import gcd
from fractions import Fraction


def lcm(a, b):
    return a * b // gcd(a, b)


def divisors(n):
    return [d for d in range(1, n + 1) if n % d == 0]

bank = Bank("수학", "초", "수학", "초5-6", "수와 연산", "bank_수학_초5-6_수와연산_3.json")
b = KoBank(bank)

# ───────── 6수01-15 소수의 나눗셈 ─────────
S = "6수01-15"
b.q(S, "C", "$4.8 \\div 2$를 계산하면 얼마인가요?",
    options=[2.4, 24, 0.24, 9.6], answer=2.4,
    why="48÷2=24이고 4.8은 48의 0.1배이므로 몫도 24의 0.1배인 2.4입니다.")
b.q(S, "C", "$6 \\div 0.5$를 계산한 값을 쓰세요.",
    answers=["12"],
    why="6 안에 0.5가 12개 들어 있으므로 12입니다. (6÷0.5=60÷5=12)")
b.q(S, "C", "$0.9 \\div 0.3$을 계산하면 얼마인가요?",
    options=[3, 0.3, 30, 0.27], answer=3,
    why="나누는 수와 나누어지는 수에 똑같이 10을 곱하면 9÷3=3입니다.")
b.q(S, "B", "$7.2 \\div 0.4$를 계산한 값을 쓰세요.",
    answers=["18"],
    why="72÷4=18입니다.")
b.q(S, "B", "$13.5 \\div 5$를 계산하면 얼마인가요?",
    options=[2.7, 27, 0.27, 2.07], answer=2.7,
    why="13.5÷5=2.7입니다.")
b.q(S, "B", "$3.6 \\div 1.2$를 계산하면 얼마인가요?",
    options=[3, 0.3, 30, 4.32], answer=3,
    why="36÷12=3입니다.")
b.q(S, "A", "$12.6 \\div 4.2$의 몫이 3입니다. 이 계산 결과가 타당한 까닭을 어림하여 설명한 것은 무엇인가요?",
    options=["12.6은 약 12, 4.2는 약 4이므로 약 3이 되어 타당하다", "12.6이 4.2보다 작으므로 몫은 1보다 작아야 한다", "나눗셈이므로 몫은 항상 12.6보다 커야 한다", "어림할 수 없다"], answer="12.6은 약 12, 4.2는 약 4이므로 약 3이 되어 타당하다",
    why="12.6÷4.2를 12÷4로 어림하면 3이므로 계산 결과가 타당합니다.")
b.q(S, "A", "리본 9.6 m를 0.8 m씩 자르면 모두 몇 도막이 되나요?",
    options=["12도막", "1.2도막", "120도막", "7.7도막"], answer="12도막",
    why="9.6÷0.8=96÷8=12(도막)입니다.")
b.q(S, "A", "(소수)÷(소수)를 계산할 때 나누는 수와 나누어지는 수에 똑같이 10(또는 100)을 곱하는 까닭은 무엇인가요?",
    options=["나눗셈의 몫이 변하지 않으면서 나누는 수를 자연수로 만들 수 있기 때문이다", "몫을 10배 하기 위해서이다", "나머지를 없애기 위해서이다", "나누어지는 수를 작게 만들기 위해서이다"], answer="나눗셈의 몫이 변하지 않으면서 나누는 수를 자연수로 만들 수 있기 때문이다",
    why="나누는 수와 나누어지는 수에 같은 수를 곱해도 몫은 같으므로 나누는 수를 자연수로 바꾸어 계산합니다.")

if __name__ == "__main__":
    report(bank, 9, lo=0, hi=999)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
