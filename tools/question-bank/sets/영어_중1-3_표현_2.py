"""영어 · 중1-3 · 표현_2 — 자동 생성 래퍼"""
import os, sys, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from kit_ko import KoBank, report
from svgkit import svg, text, line, table, bar_graph, hbar_graph, line_graph, BLUE, ORANGE, C, _n

bank = Bank("영어", "중", "영어", "중1-3", "표현_2", "bank_영어_중1-3_표현_2.json")
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

P1 = b.passage("p1", "A Message to a New Classmate",
    "Hi Daniel, welcome to our class! I heard you moved here from another city last week. I know that a new school can feel strange, so I want to help you. If you need anything, please ask me. I can show you where the cafeteria and the library are. Also, if you want to join a club, I can go with you to visit some of them. We usually have lunch together at the table by the window, and you are welcome to join us. Please don't worry about your English. Everyone makes mistakes, and we will be happy to help. See you tomorrow! Your classmate, Yuri", "직접 지음")

S = "9영02-11"
Q(S, "C", "친구에게 책을 빌리고 싶을 때 상대를 배려하는 말은 무엇인가요?", "May I borrow your book, please?", ["Give me your book.", "I'll take your book.", "Your book is mine."], "May I ... please?는 정중하게 부탁하는 표현입니다.")
SH(S, "C", "도움을 받은 뒤 감사를 전하는 말 \"___ you for your help.\"에 알맞은 낱말을 쓰세요.", ["Thank", "thank"], "고마움을 표현하는 말은 Thank you입니다.")
Q(S, "B", "친구의 발표를 들은 뒤 배려하는 마음으로 건네는 말은 무엇인가요?", "You did a great job. I liked your pictures.", ["That was boring.", "I didn't listen.", "You should stop talking."], "친구의 노력을 인정하는 칭찬입니다.")
Q(S, "B", "친구가 영어로 말하다가 실수했을 때 배려하는 반응은 무엇인가요?", "It's okay. Take your time.", ["Ha ha, that's wrong!", "You're so bad at English.", "Never mind, I'll tell everyone."], "실수해도 괜찮다고 격려합니다.")
Q(S, "A", "Yuri가 Daniel에게 \"Please don't worry about your English.\"라고 쓴 의도로 알맞은 것은 무엇인가요?", "영어를 못할까 봐 걱정하는 마음을 덜어 주려고", ["영어를 쓰지 말라고 하려고", "영어 실력을 시험하려고", "영어 숙제를 내 주려고"], "새 친구의 불안을 덜어 주려는 배려입니다.", p=P1)
Q(S, "A", "이 글에서 Yuri가 Daniel을 배려한 행동으로 알맞지 않은 것은 무엇인가요?", "Daniel이 실수하면 모두에게 알려 주겠다고 했다", ["학교 안 장소를 안내해 주겠다고 했다", "점심을 함께 먹자고 했다", "동아리 방문에 같이 가 주겠다고 했다"], "나머지는 모두 글에 있는 배려 행동입니다.", p=P1)

if __name__ == "__main__":
    report(bank, 6, lo=400, hi=900)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
