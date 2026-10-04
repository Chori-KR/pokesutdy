"""사회(역사·중학) 묶음 파일 생성기: python3 _mkh.py <묶음이름> <영역> <과목명> <본문파일>"""
import sys, os
name, unit, course, bodyf = sys.argv[1:5]
body = open(bodyf, encoding="utf-8").read()
head = f'''"""사회 · 중1-3 · {unit} — 자동 생성 래퍼"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from kit_ko import KoBank, report
from kit_soc import timeline, compare_table
from svgkit import bar_graph, hbar_graph, line_graph, table

bank = Bank("사회", "중", "{course}", "중1-3", "{unit}", "bank_{name}.json")
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
