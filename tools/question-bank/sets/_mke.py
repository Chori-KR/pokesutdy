"""(지문 지원판) 중학 일반 묶음 생성기: python3 _mkx.py <묶음이름> <영역> <과목명> <과목> <본문파일> [쪽수기준]"""
import sys
name, unit, course, subject, bodyf = sys.argv[1:6]
body = open(bodyf, encoding="utf-8").read()
head = f'''"""{subject} · 중1-3 · {unit} — 자동 생성 래퍼"""
import os, sys, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from kit_ko import KoBank, report
from svgkit import svg, text, line, table, bar_graph, hbar_graph, line_graph, BLUE, ORANGE, C, _n

bank = Bank("{subject}", "중", "{course}", "중1-3", "{unit}", "bank_{name}.json")
b = KoBank(bank)


def Q(S, lv, body, ok, bad, why, p=None, svg=None):
    kw = dict(options=[ok] + list(bad), answer=ok, why=why, passage=p)
    if svg:
        kw["svg"] = svg
    b.q(S, lv, body, **kw)


def SH(S, lv, body, answers, why, p=None, svg=None):
    kw = dict(answers=answers, why=why, passage=p)
    if svg:
        kw["svg"] = svg
    b.q(S, lv, body, **kw)

'''
foot = '''
if __name__ == "__main__":
    report(bank, 6, lo=400, hi=900)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
'''
open(f"sets/{name}.py", "w", encoding="utf-8").write(head + body + foot)
