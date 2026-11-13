"""「잡으면서 배우자!」 교사 활용 가이드북 — 부록용 축약판(10쪽 이내) HWPX"""
import os, re, sys, warnings
from PIL import Image
from hwpx import HwpxDocument

warnings.filterwarnings("ignore")
HERE = os.path.dirname(os.path.abspath(__file__))
G, SH = os.path.join(HERE, "gimg"), os.path.join(HERE, "shots")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "잡으면서배우자_교사가이드북_부록_축약판.hwpx")

MM = 283.465
ML = 16
TW = 210 - 2 * ML            # 본문 폭 178mm
FONT = "맑은 고딕"
BODY = 9.5
C_T, C_H, C_G, C_TAB, C_NEW = "#1F3A8A", "#24499A", "#6B7280", "#1D4ED8", "#C2410C"

d = HwpxDocument.new()
d.set_page_margins(left=int(ML * MM), right=int(ML * MM), top=int(13 * MM), bottom=int(12 * MM),
                   header=int(7 * MM), footer=int(7 * MM))

def idx(): return len(d.paragraphs) - 1
def fmt(**kw): d.set_paragraph_format(paragraph_index=idx(), **kw)

def runs(p, s, size=BODY, color=None, bold=False):
    """'**굵게**', '[탭]'(파란 굵게) 표기를 글자 조각으로"""
    for b in re.split(r"(\*\*.+?\*\*|\[[^\]]+\])", s):
        if not b: continue
        if b.startswith("**"):
            p.add_run(b[2:-2], font=FONT, size=size, bold=True, color=color)
        elif b.startswith("[") and b.endswith("]"):
            p.add_run(b, font=FONT, size=size, bold=True, color=C_TAB)
        else:
            p.add_run(b, font=FONT, size=size, bold=bold, color=color)

def P(s="", size=BODY, color=None, bold=False, align="JUSTIFY", before=0, after=2.5, indent=0, keep=False, line=150):
    p = d.add_paragraph("", inherit_style=False)
    runs(p, s, size, color, bold)
    kw = dict(spacing_before_pt=before, spacing_after_pt=after, line_spacing_percent=line, alignment=align)
    if indent: kw["indent_left_mm"] = indent
    if keep: kw["keep_with_next"] = True
    fmt(**kw)
    return p

def H1(num, title):
    p = P("", 13.5, C_T, True, before=9, after=4, keep=True, line=130)
    runs(p, f"{num}. {title}", 13.5, C_T, True)
    d.set_paragraph_format(paragraph_index=idx(), bottom_border=True, border_color="#1F3A8A", keep_with_next=True)

def H3(title, new=False):
    p = P("", 10.5, C_H, True, before=5, after=2, keep=True, line=130)
    runs(p, title, 10.5, C_H, True)
    if new: p.add_run("  NEW", font=FONT, size=8, bold=True, color=C_NEW)

def BUL(items, indent=2.5):
    for it in items:
        p = d.add_paragraph("", inherit_style=False)
        p.add_run("• ", font=FONT, size=BODY, bold=True, color=C_H)
        runs(p, it)
        fmt(spacing_after_pt=2, line_spacing_percent=150, alignment="JUSTIFY", indent_left_mm=indent)

def STEPS(items):
    for i, it in enumerate(items):
        p = d.add_paragraph("", inherit_style=False)
        p.add_run("①②③④⑤⑥⑦⑧"[i] + " ", font=FONT, size=BODY + 0.5, bold=True, color=C_H)
        runs(p, it)
        fmt(spacing_after_pt=2, line_spacing_percent=150, alignment="JUSTIFY", indent_left_mm=2.5)

_img = {}
def item(path):
    if path not in _img:
        _img[path] = d.add_image(open(path, "rb").read(), "png")
    return _img[path]

def size(path, max_w, max_h):
    w, h = Image.open(path).size
    s = min(max_w / w, max_h / h)
    return w * s, h * s

def no_border(t, r, c):
    try: t.set_cell_borders(r, c, color="#FFFFFF", line_type="NONE")
    except Exception: t.set_cell_borders(r, c, color="#FFFFFF")

_cpr = {}
def center(p):
    if "id" not in _cpr:
        d.add_paragraph("", inherit_style=False); fmt(alignment="CENTER", spacing_after_pt=1, line_spacing_percent=120)
        _cpr["id"] = d.paragraphs[idx()].para_pr_id_ref
        d.remove_paragraph(d.paragraphs[idx()])
    p.para_pr_id_ref = _cpr["id"]

def FIGS(items, max_h=55, widths=None):
    """items: [(그림, 설명)] — 한 줄에 나란히(테두리 없는 표)"""
    n = len(items)
    t = d.add_table(1, n, width=int(TW * MM))
    fmt(alignment="CENTER", spacing_before_pt=3, spacing_after_pt=4)
    ws = widths or [1] * n
    t.set_column_widths(ws)
    for i, (f, cap) in enumerate(items):
        cell = t.cell(0, i); no_border(t, 0, i)
        col = TW * ws[i] / sum(ws)
        w, h = size(f, col - 5, max_h)
        p0 = cell.paragraphs[0]; p0.add_picture(item(f), width=int(w * MM), height=int(h * MM)); center(p0)
        if cap:
            cp = cell.add_paragraph(""); runs(cp, cap, 7.5, C_G); center(cp)

def BOX(lines, kind="tip"):
    color, label = {"tip": ("#FFF7E6", "TIP"), "info": ("#EEF4FF", "알아 두기"), "warn": ("#FDECEC", "주의"), "new": ("#ECFDF3", "새 기능")}[kind]
    t = d.add_table(1, 1, width=int(TW * MM)); fmt(spacing_before_pt=3, spacing_after_pt=4)
    t.set_cell_shading(0, 0, color); t.set_cell_borders(0, 0, color="#D9DEE8")
    cell = t.cell(0, 0)
    try: cell.set_margins(left=int(2.5 * MM), right=int(2.5 * MM), top=int(1.5 * MM), bottom=int(1.5 * MM))
    except Exception: pass
    p = cell.paragraphs[0]
    p.add_run(f"[{label}] ", font=FONT, size=8.5, bold=True, color=C_NEW if kind == "new" else "#374151")
    runs(p, lines[0], 8.5)
    for ln in lines[1:]:
        q = cell.add_paragraph(""); runs(q, ln, 8.5)

def TABLE(rows, widths=None, header=True, sz=9, shade_first_col=False):
    nr, nc = len(rows), max(len(r) for r in rows)
    t = d.add_table(nr, nc, width=int(TW * MM)); fmt(spacing_before_pt=2, spacing_after_pt=4)
    t.set_column_widths(widths or [1] * nc)
    for r, row in enumerate(rows):
        for c in range(nc):
            p = t.cell(r, c).paragraphs[0]
            runs(p, row[c] if c < len(row) else "", sz, None, header and r == 0)
            if header and r == 0: t.set_cell_shading(r, c, "#E8EEF9")
            elif shade_first_col and c == 0: t.set_cell_shading(r, c, "#F7F9FC")
    return t

# ════════════════════ 본문 ════════════════════
# 제목 블록
P("부록", 10, C_NEW, True, align="CENTER", after=1)
P("잡으면서 배우자! 교사 활용 가이드북", 18, C_T, True, align="CENTER", after=2, line=130)
P("문제를 풀어 포켓몬을 잡고 도감을 채우는 우리 반 학습 웹앱 · **https://pokesutdy.vercel.app** · 2026년 11월 웹앱 기준",
  8.5, "#374151", align="CENTER", after=5)
TABLE([["대상", "이 웹앱을 처음 쓰는 선생님 · 준비물: 인터넷이 되는 기기(교사 1대, 학생 각 1대)"],
       ["순서", "① 학급 만들기 → ② 문제 등록 → ③ 학급 코드 배부 → ④ 수업 시작"],
       ["차례", "1. 웹앱 소개 · 2. 시작하기 · 3. 문제 은행 · 4. 시스템 설정 · 5. 레이드 · 6. 학생·통계와 구글 시트 · "
                "7. 학생 활동 · 8. 규칙 한눈에 · 9. 활용 팁과 자주 묻는 질문"]], widths=[1.2, 10], header=False, shade_first_col=True)

H1(1, "이 웹앱은 무엇인가요?")
P("선생님이 낸 문제를 학생이 풀면 → 야생 포켓몬을 배틀·포획 → 도감을 채우는 **학급 전용 학습 웹앱**이에요. 맞히면 공격이 들어가고 "
  "틀리면 반격을 받아, **공부가 곧 게임의 엔진**이 됩니다. 잡은 포켓몬은 도감에 기록되고, 진화시키거나 친구와 교환할 수 있어요.")
BUL(["**학생** — 문제 풀이 동기, 성취감(도감·진화·이로치 수집), 협동(레이드), 친구와 교환",
     "**교사** — 문제 은행 관리, 오답률·영역별 정답률 통계, 형성평가(레이드), 확률·보상·횟수 조정",
     "**개인정보를 수집하지 않아요.** 학생은 이메일 없이 **학급 코드 + 닉네임 + 비밀번호**로 가입해요."])
BOX(["**최근 업데이트 반영** — 문제 은행 **엑셀로 내려받기** · 문제 1,000개 이상도 모두 출제 · 학생 **출제 영역 선택**(배틀·문제풀이) · "
     "**구글 시트 연동**(학생별·영역별 대시보드, 레이드 기록 포함)"], "new")

H1(2, "5분 만에 시작하기")
STEPS(["첫 화면에서 [교사로 입장] → [회원가입]에서 이메일·비밀번호로 가입해요(학생은 이메일 불필요).",
       "**학급 만들기** — 반 이름을 적으면 **학급 코드**(숫자 4자리)가 자동으로 발급돼요. 연습용 샘플 문제도 들어 있어요.",
       "화면 위의 학급 코드를 학생에게 알려 주세요([시스템 설정]에서 언제든 다시 확인).",
       "학생은 첫 화면 [학생으로 입장] → 학급 코드 + 닉네임 + 비밀번호(4자 이상)로 가입하면 끝!"])
FIGS([(f"{G}/g01.png", "첫 화면 — 학생/교사 입장"), (f"{G}/g02.png", "교사 로그인·회원가입"), (f"{G}/g09.png", "학생 로그인·회원가입")], max_h=60)

H1(3, "문제 등록하기 — 문제 은행")
P("[문제 은행] 탭에서 문제를 만들고 관리해요. **출제 중**인 문제만 학생에게 나와요. 배틀은 4지선다만, 단답형은 문제풀이에서 나와요.")
FIGS([(f"{SH}/t_bank_top.png", "문제 은행 — 검색 · 새 문제 · AI 생성 · 대량 등록 · 엑셀로 내려받기 · 단원(태그) 칩 · 배틀 출제 현황")], max_h=80)
TABLE([["방법", "이렇게 해요"],
       ["+ 새 문제", "4지선다/단답형 선택 → 문제·보기 입력 → 동그라미로 정답 지정 → **난이도**(배틀 기술이 됨)와 **태그**(예: 수학·분수의 덧셈) → 등록"],
       ["📥 대량 등록", "엑셀 양식(.xlsx)을 내려받아 채운 뒤 한 번에 업로드. 단답형은 보기를 비우고 정답 칸에 허용 정답을 쉼표로. **개수 제한 없음**(500개씩 나눠 저장)"],
       ["🤖 AI 생성", "[시스템 설정]에서 AI 키를 등록하면 주제만으로 문제 생성 → 검토·수정 후 등록"],
       ["⬇️ 엑셀로 내려받기 (NEW)", "지금 보이는 문제(검색·태그 필터)를 .xlsx로. 앞 9칸은 대량 등록 양식과 같고, 출제 여부·레이드 전용·푼 횟수·**오답률**·문제ID가 붙어요"]],
      widths=[2.6, 9.4])
BUL(["**출제 관리** — 문제마다 토글로 출제/숨김, 태그별 모두 출제·숨김, 체크해서 선택 출제·숨김·삭제. 출제 중 문제가 0개면 배틀이 잠겨요.",
     "**문제가 많아도 OK** — 목록은 200개씩 보여 주고 [200개 더 보기]·[모두 보기]로 이어 봐요. 1,000개가 넘어도 모두 출제돼요.",
     "**수식** — `$ … $` 사이에 넣으면 분수·지수·화학식이 교과서처럼 보여요(예: 2^3, $\\frac{1}{2}$)."])

H1(4, "시스템 설정")
P("[시스템 설정] 탭에서 우리 반에 맞게 조절해요. 바꾸면 바로 저장되고, 학생은 새로고침하면 반영돼요.")
TABLE([["설정", "내용"],
       ["학급 코드", "학생 가입용 숫자 4자리"],
       ["기술 = 난이도", "끄면 배틀 기술이 '보통' 하나로 단순해져요"],
       ["배틀 제한 시간", "켜기/끄기 + 시간 배수. 그림·자료 문제가 많으면 끄거나 넉넉하게"],
       ["출제 영역 선택 (NEW)", "켜면 학생이 배틀·문제풀이에서 **영역을 골라** 공부해요. 끄면(기본) 안 푼·틀린 문제 위주로 자동 출제(편식 방지). "
                            "영역은 태그로 나눠요 — '·' 앞 과목이 2개 이상이면 과목으로, 하나뿐이면 '·' 뒤(예: 수학·**덧셈과 뺄셈**)로"],
       ["야생 출현 확률", "흔함 55% · 특별 25% · 희귀 15% · 전설 5%(기본, 합 100%) · 이로치 2.5%"],
       ["하루 횟수", "배틀 2회 · 야생 탐색 3회 · 문제풀이 10문제(정답당 +20P)가 기본"],
       ["구글 시트 연동 (NEW)", "연동 주소를 만들어 내 구글 시트에 풀이 기록을 자동으로 보내요(6장)"]], widths=[2.6, 9.4])
FIGS([(f"{SH}/t_toggle.png", "출제 영역 선택 토글"), (f"{SH}/t_sheet_after.png", "구글 시트 연동 카드")], max_h=50, widths=[1, 1])

H1(5, "레이드 — 형성평가로 활용")
P("단원·주 마무리에 강력한 **보스 포켓몬**과 협동 배틀을 해요. 학생은 **문제 10개를 맞혀야**(5번 틀리면 실패) 승리하고, 몇 번이든 다시 도전할 수 있어요(하루 배틀 횟수와 무관).")
STEPS(["**레이드 전용 문제 등록** — 문제 은행에서 이번 평가 문제를 🛡️ 레이드 전용으로 지정(평소 배틀과 분리 → 진짜 형성평가).",
       "[시스템 설정] → 레이드 카드에서 **보스 포켓몬**, 이로치 여부, **협동 인원 기준**, 승리 보상(포인트·아이템)을 정해요.",
       "[레이드 실시하기] → 학생 레이드 탭에 보스 등장. 기준 인원 이상 성공하면 보스 포켓몬이 **반 전체**에게 지급돼요."])
BUL(["학생이 '다음에 나왔으면 하는 포켓몬'을 신청하면 설정 화면에 득표 현황이 떠요.",
     "레이드에서 푼 문제도 풀이 기록에 **'레이드'**로 남아, 구글 시트 '상황별' 표에서 **형성평가 정답률**을 학생별로 볼 수 있어요."])
FIGS([(f"{G}/g07.png", "교사 — 레이드 설정 카드"), (f"{G}/g20.png", "학생 — 레이드 도전 화면")], max_h=62, widths=[1.3, 1])

H1(6, "학생·통계 관리와 구글 시트 대시보드")
BUL(["**📅 기간**을 정하면 정답률·오답률·단원 통계가 그 기간 기준으로 나와요. **오답률 TOP**으로 다시 짚어 줄 문제를 확인해요.",
     "학생 옆 **📊 단원** — 그 학생의 단원별 정답률(60% 미만은 🔴 취약 단원).",
     "**선물**(포인트·아이템, 여러 명/전체) · **비밀번호 초기화**(교사가 새 비밀번호 입력) · **학생 삭제**(기록도 함께 삭제, 되돌릴 수 없음)."])
FIGS([(f"{G}/g08_blur.png", "학생·통계 — 기간 선택, 학생별 현황, 단원별 정답률(🔴 취약 단원)")], max_h=72)
H3("📊 구글 시트 대시보드로 학생별 분석하기", new=True)
P("앱의 통계가 '지금 현황'이라면, 구글 시트는 **기간을 정해 학생별·영역별로 깊이 보는 분석 도구**예요. 처음 한 번만 연결하면(약 10분) 5분마다 자동으로 기록이 쌓여요.")
TABLE([["연결 순서", "① 새 구글 시트(sheets.new) → ② 확장 프로그램 → Apps Script에 안내 페이지(/guide/sheets)의 스크립트 붙여 넣기 → "
                   "③ 메뉴 🎮 잡으면서 배우자 → ① 처음 설정하기 → ④ 웹앱 [시스템 설정] → 🔗 연동 주소 만들기 → 📋 복사 → "
                   "⑤ 시트 메뉴 ② 연동 주소 넣기 → ③ 지금 가져오기 → ⑥ ⏱ 자동 가져오기 켜기"],
       ["시트 탭", "**학생현황**(레벨·포인트·도감·정답률·최근 활동) · **반 전체** · **👤 학생별** 대시보드(가입하면 자동 생성) · **문제기록**(풀이 기록 원본)"],
       ["대시보드", "**기간**(이번 주·이번 달·최근 30일·전체·직접 입력) 선택 → 과목·단원별 정답률, 단원 × 난이도, 난이도별, "
                   "**상황별(배틀·문제풀이·레이드)**, **날짜별 정답률 그래프**, **오답 모아보기**(최근 100개)"]],
      widths=[1.7, 10.3], header=False, shade_first_col=True)
BOX(["지난 학기 전체를 보려면 기간을 **'전체'**로(기본값은 '이번 달'). 시트 시간대는 **파일 → 설정 → (GMT+09:00) 서울**.",
     "연동 주소를 아는 사람은 우리 반 기록을 볼 수 있어요. 새어 나갔다면 **🔄 다시 만들기**. 시트 없이 보려면 **⬇️ 풀이 기록 CSV로 내려받기**."])

H1(7, "학생은 이렇게 사용해요")
P("가입하면 **500P + 몬스터볼 3개**를 받고 스타팅 포켓몬을 골라요(딱 한 번). 로그인하면 **오늘의 퀴즈** 팝업이 먼저 뜨고, 아래 탭에서 활동을 골라요.")
TABLE([["활동", "이렇게 해요"],
       ["⚔️ 배틀", "야생 포켓몬 등장 → **기술(=난이도)** 선택 → 문제를 맞히면 공격, 틀리면 반격 → 쓰러뜨리면 볼을 던져 포획(도감 + 포인트). "
                  "타이머 노란 구간 제출은 급소 1.5배. 안 푼·틀린 문제가 먼저 나와 자연스럽게 복습돼요"],
       ["🎯 출제 영역 (NEW)", "선생님이 허용하면 배틀 시작 버튼 위 '출제 영역'에서 공부할 영역을 골라요. 문제풀이는 **영역을 먼저 골라야** 시작돼요"],
       ["🌿 탐색", "문제 없이 볼만 던져 잡는 찬스(하루 횟수 제한). 문제 풀이가 어려운 학생도 성취감을 느낄 수 있어요"],
       ["📝 문제풀이", "문제를 하나씩 받아 풀고 **정답당 +20P**(하루 한도). 포획 없이 순수 학습·수입 활동. 보기 순서가 매번 섞여요"],
       ["🧠 오늘의 퀴즈", "로그인하면 팝업(하루 1번). 실루엣 포켓몬을 맞히면 +150P + 랜덤 볼, 틀려도 몬스터볼 1개"],
       ["🛒 상점 · 📕 도감", "포인트로 볼·진화의돌·빛나는 스프레이·간식 구입. 도감은 등급별 수집, **15마리마다 달성 보상**, 중복 포켓몬 포인트 환전"],
       ["🔄 교환 · 🛡️ 레이드", "6자리 코드(또는 QR)로 친구와 포켓몬 맞바꾸기. 레이드는 보스에게 문제 10개로 도전하는 반 협동전"]],
      widths=[2.4, 9.6])
FIGS([(f"{G}/g11.png", "배틀 — 필드·체력바·타이머·문제"), (f"{SH}/s_battle_area.png", "학생 홈 · 배틀 시작 버튼 위 '출제 영역'")],
     max_h=85, widths=[0.8, 1.4])
FIGS([(f"{SH}/s_solve_pick.png", "문제풀이 — 영역을 먼저 골라요"), (f"{G}/g13.png", "탐색 — 볼을 골라 던지기")], max_h=70, widths=[1.4, 1])
FIGS([(f"{G}/g16.png", "상점"), (f"{G}/g17.png", "도감 — 등급별 수집·달성 보상"), (f"{G}/g19.png", "교환 — 6자리 코드·QR")],
     max_h=80, widths=[0.7, 1, 1.2])

H1(8, "웹앱 규칙 한눈에")
TABLE([["포인트 버는 법", "보상", "볼", "가격 · 포획 보너스"],
       ["오늘의 퀴즈", "+150P + 랜덤 볼", "몬스터볼", "100P · 기본(살짝 낮음)"],
       ["문제풀이(정답당)", "+20P (하루 한도)", "슈퍼볼", "300P · +15%"],
       ["포획 — 흔함 / 특별", "+50P / +75P", "하이퍼볼", "800P · +30%"],
       ["포획 — 희귀 / 전설", "+100P / +300P", "마스터볼", "5,000P · 100% 확정"]], widths=[3, 2.6, 2, 3])
TABLE([["간식(추가 배틀)", "가격 · 등장 등급", "도감 보상", "보상"],
       ["🍪 일반 간식", "500P · 흔함 70% / 특별 30%", "15 · 30 · 45마리", "몬스터볼·슈퍼볼·하이퍼볼 ×3"],
       ["🍰 고급 간식", "2,000P · 특별 60% / 희귀 40%", "60 · 75 · 90마리", "일반·고급·최고급 간식 ×1"],
       ["🎂 최고급 간식", "4,000P · 희귀 90% / 전설 10%", "105 · 135마리", "마스터볼 ×1"],
       ["🍱 전설의 간식", "6,000P · 전설 100%", "120 · 150마리", "빛나는 스프레이 ×1"]], widths=[2.4, 3.6, 2.4, 3.2])
BUL(["**진화 3가지** — ① 승수(무료): 그 포켓몬으로 1→2단계 5승, 2→3단계 10승 ② 진화의돌(1,500P): 돌 진화 포켓몬 "
     "③ 포인트: 첫 진화 1,000P · 두 번째 2,000P · 이후 2,500P(학생 누적 진화 횟수 기준)",
     "**중복 환전** — 흔함 30 · 특별 50 · 희귀 70 · 전설 150P (도감 기록은 그대로 남아요)"])

H1(9, "수업 활용 팁 & 자주 묻는 질문")
BUL(["**단원 도입·복습** — 그날 배운 개념을 문제로 등록하고 자투리 시간에 배틀로 복습.",
     "**개별화** — 태그를 '과목·영역'으로 통일하고 출제 영역 선택을 켜면, 학생마다 자기 단계의 영역을 골라 연습할 수 있어요.",
     "**형성평가** — 단원 끝에 레이드(레이드 전용 문제 10개 맞히기) + 협동 목표로 반 전체 동기부여. 결과는 구글 시트 '상황별'에서.",
     "**보상 이벤트** — 잘한 학생·모둠에게 선물로 볼·간식 지급."])
TABLE([["자주 묻는 질문", "답"],
       ["학생이 비밀번호를 잊었어요", "[학생·통계]에서 비밀번호 초기화(교사가 새 비밀번호 입력)"],
       ["배틀이 안 돼요", "출제 중인 4지선다 문제가 있는지 확인하세요(0개면 배틀이 잠겨요)"],
       ["설정을 바꿨는데 안 보여요", "학생 화면을 새로고침하면 반영돼요"],
       ["문제가 1,000개가 넘어요", "모두 저장·출제돼요. 목록은 200개씩, [모두 보기]로 전체 확인"],
       ["학생이 영역을 골라 공부하게 하려면", "[시스템 설정] → '학생이 출제 과목·단원 선택 허용' 켜기"],
       ["시트에 단원이 너무 많이 보여요", "지운 예전 문제로 푼 기록의 옛 태그 때문 → 태그 통일 후 🔁 기록 전부 다시 받기"],
       ["시트 날짜가 일부만 보여요", "기간을 '전체'로. 그래도 같으면 문제기록 탭 삭제 → ① 처음 설정하기 → 🔁 기록 전부 다시 받기"],
       ["공용 기기를 써요", "수업 끝에 꼭 로그아웃을 안내하세요"]], widths=[4, 8])

d.set_header_text("잡으면서 배우자! 교사 활용 가이드북 (부록)")
d.set_page_number(format="page", align="CENTER", position="BOTTOM_CENTER", prefix="- ", suffix=" -")
d.save_to_path(OUT)
rep = d.validate()
print("saved", OUT, os.path.getsize(OUT) // 1024, "KB", "issues", len(getattr(rep, "issues", [])))
