"""「잡으면서 배우자!」 교사 활용 가이드북 (부록용) — HWPX 만들기
원본: public/guide.html (앱 안 교사 가이드북) + 최근 메인 업데이트(새 기능) 내용·스크린샷
"""
import os, re, sys, warnings
from bs4 import BeautifulSoup, NavigableString, Tag
from PIL import Image
from hwpx import HwpxDocument

warnings.filterwarnings("ignore")
HERE = os.path.dirname(os.path.abspath(__file__))
GIMG, SHOT = os.path.join(HERE, "gimg"), os.path.join(HERE, "shots")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "잡으면서배우자_교사가이드북_부록_2026-11.hwpx")

MM = 283.465                      # HWPUNIT per mm
PAGE_W, MARGIN_LR = 210, 18
TEXT_W = PAGE_W - 2 * MARGIN_LR   # 174mm
FONT = "맑은 고딕"
C_TITLE, C_H3, C_GRAY, C_TAB, C_NEW = "#1F3A8A", "#24499A", "#6B7280", "#1D4ED8", "#C2410C"

d = HwpxDocument.new()
d.set_page_margins(left=int(MARGIN_LR * MM), right=int(MARGIN_LR * MM), top=int(15 * MM), bottom=int(14 * MM),
                   header=int(8 * MM), footer=int(8 * MM))

def idx():
    return len(d.paragraphs) - 1

def fmt(**kw):
    d.set_paragraph_format(paragraph_index=idx(), **kw)

def norm(s):
    return re.sub(r"\s+", " ", s)

def run(p, text, size=10, bold=False, color=None):
    if text:
        p.add_run(text, font=FONT, size=size, bold=bold, color=color)

# ── 인라인(굵게·탭 이름·코드) ──
def inline(p, node, size=10, bold=False, color=None, skip_hint=True):
    for ch in node.children:
        if isinstance(ch, NavigableString):
            run(p, norm(str(ch)), size, bold, color)
        elif isinstance(ch, Tag):
            cls = ch.get("class") or []
            if skip_hint and "hint" in cls:
                continue
            if ch.name == "br":
                run(p, " ", size)
            elif ch.name in ("b", "strong"):
                inline(p, ch, size, True, color, skip_hint)
            elif "tab" in cls:
                run(p, "[" + norm(ch.get_text()).strip() + "]", size, True, C_TAB)
            elif ch.name in ("kbd", "code"):
                run(p, norm(ch.get_text()), size, True, "#9A3412")
            elif ch.name == "img":
                continue
            else:
                inline(p, ch, size, bold, color, skip_hint)

def para(node=None, text=None, size=10, bold=False, color=None, align=None, before=0, after=4, indent=0, keep=False, line=160):
    p = d.add_paragraph("", inherit_style=False)   # 앞 문단 서식(가운데·밑줄)을 물려받지 않게
    if node is not None:
        inline(p, node, size, bold, color)
    if text:
        run(p, text, size, bold, color)
    kw = dict(spacing_before_pt=before, spacing_after_pt=after, line_spacing_percent=line, alignment=align or "JUSTIFY")
    if indent: kw["indent_left_mm"] = indent
    if keep: kw["keep_with_next"] = True
    fmt(**kw)
    return p

def rich(parts, size=10, **kw):
    """parts: [(text, bold, color), ...] 또는 문자열('**굵게**' 표기)"""
    if isinstance(parts, str):
        bits = re.split(r"(\*\*.+?\*\*)", parts)
        parts = [(b[2:-2], True, None) if b.startswith("**") else (b, False, None) for b in bits if b]
    p = para(size=size, **kw)
    for t, b, c in parts:
        run(p, t, size, b, c)
    return p

# ── 그림 ──
_img_cache = {}
def img_item(path):
    if path not in _img_cache:
        ext = path.rsplit(".", 1)[1].lower()
        _img_cache[path] = d.add_image(open(path, "rb").read(), "jpg" if ext == "jpeg" else ext)
    return _img_cache[path]

def fit(path, max_w, max_h):
    w, h = Image.open(path).size
    natural = 0.105 if w >= 1200 else 0.2      # 작은 그림을 억지로 키우지 않음 (화면 배율 2배 캡처는 절반)
    s = min(max_w / w, max_h / h, natural)
    return w * s, h * s

def picture(path, caption=None, max_w=120, max_h=105):
    w, h = fit(path, max_w, max_h)
    p = para(align="CENTER", before=4, after=2, keep=bool(caption), line=100)
    p.add_picture(img_item(path), width=int(w * MM), height=int(h * MM))
    if caption:
        caption_par(caption)

def caption_par(cap):
    p = para(size=8.5, color=C_GRAY, align="CENTER", after=6)
    if isinstance(cap, Tag):
        inline(p, cap, 8.5, False, C_GRAY)
    else:
        run(p, cap, 8.5, False, C_GRAY)

def no_border(t, r, c):
    try:
        t.set_cell_borders(r, c, color="#FFFFFF", line_type="NONE")
    except Exception:
        t.set_cell_borders(r, c, color="#FFFFFF")

def picture_row(items, max_h=95):
    """items: [(path, caption)] — 표 한 줄에 나란히"""
    n = len(items)
    if n == 1:
        return picture(items[0][0], items[0][1], max_h=max_h)
    col_w = TEXT_W / n
    t = d.add_table(1, n, width=int(TEXT_W * MM))
    fmt(alignment="CENTER", spacing_before_pt=4, spacing_after_pt=6)
    t.set_column_widths([1] * n)
    for i, (path, cap) in enumerate(items):
        cell = t.cell(0, i)
        no_border(t, 0, i)
        w, h = fit(path, col_w - 6, max_h)
        p0 = cell.paragraphs[0]
        p0.add_picture(img_item(path), width=int(w * MM), height=int(h * MM))
        _center(p0)
        if cap:
            cp = cell.add_paragraph("")
            if isinstance(cap, Tag):
                inline(cp, cap, 8.5, False, C_GRAY)
            else:
                run(cp, cap, 8.5, False, C_GRAY)
            _center(cp)
    return t

_center_pr = {}
def _center(p):
    """표 안 문단 가운데 정렬 — 가운데 정렬 paraPr을 하나 만들어 재사용"""
    if "id" not in _center_pr:
        q = d.add_paragraph("", inherit_style=False)
        fmt(alignment="CENTER", spacing_after_pt=2)
        _center_pr["id"] = d.paragraphs[idx()].para_pr_id_ref
        d.remove_paragraph(d.paragraphs[idx()])
    p.para_pr_id_ref = _center_pr["id"]

# ── 상자(알림)·표 ──
BOX = {"info": ("#EEF4FF", "알아 두기"), "tip": ("#FFF7E6", "TIP"), "warn": ("#FDECEC", "주의"), "new": ("#ECFDF3", "새 기능")}
def box(kind, node=None, parts=None):
    color, label = BOX[kind]
    t = d.add_table(1, 1, width=int(TEXT_W * MM))
    fmt(spacing_before_pt=4, spacing_after_pt=6)
    t.set_cell_shading(0, 0, color)
    t.set_cell_borders(0, 0, color="#D9DEE8")
    cell = t.cell(0, 0)
    try:
        cell.set_margins(left=int(3 * MM), right=int(3 * MM), top=int(2 * MM), bottom=int(2 * MM))
    except Exception:
        pass
    p = cell.paragraphs[0]
    run(p, f"[{label}] ", 9.5, True, C_NEW if kind == "new" else "#374151")
    if node is not None:
        tgt = node.find("p") or node
        inline(p, tgt, 9.5)
    for item in parts or []:
        if isinstance(item, list):     # 다음 줄
            p = cell.add_paragraph("")
            for t_, b_, c_ in item:
                run(p, t_, 9.5, b_, c_)
        else:
            t_, b_, c_ = item
            run(p, t_, 9.5, b_, c_)
    return t

def table(rows, header=True, widths=None, size=9.5):
    nr, nc = len(rows), max(len(r) for r in rows)
    t = d.add_table(nr, nc, width=int(TEXT_W * MM))
    fmt(spacing_before_pt=4, spacing_after_pt=6)
    t.set_column_widths(widths or [1] * nc)
    for r, row in enumerate(rows):
        for c in range(nc):
            val = row[c] if c < len(row) else ""
            p = t.cell(r, c).paragraphs[0]
            if isinstance(val, Tag):
                inline(p, val, size, header and r == 0)
            else:
                rp = rich_runs(str(val))
                for txt, b in rp:
                    run(p, txt, size, b or (header and r == 0))
            if header and r == 0:
                t.set_cell_shading(r, c, "#E8EEF9")
    return t

def rich_runs(s):
    bits = re.split(r"(\*\*.+?\*\*)", s)
    return [(b[2:-2], True) if b.startswith("**") else (b, False) for b in bits if b]

def h1(num, title, first=False):
    p = para(size=17, bold=True, color=C_TITLE, before=0 if first else 16, after=8, keep=True)
    if num:
        run(p, f"{num}. ", 17, True, C_TITLE)
    run(p, title, 17, True, C_TITLE)
    d.set_paragraph_format(paragraph_index=idx(), bottom_border=True, border_color="#1F3A8A", keep_with_next=True,
                           page_break_before=first)

def h3(text, new=False):
    p = para(size=12.5, bold=True, color=C_H3, before=10, after=4, keep=True)
    run(p, text, 12.5, True, C_H3)
    if new:
        run(p, "  NEW", 9, True, C_NEW)

def bullets(items, size=10, indent=3):
    for it in items:
        p = para(size=size, indent=indent, after=2)
        run(p, "• ", size, True, C_H3)
        for t_, b_ in rich_runs(it):
            run(p, t_, size, b_)

# ── 원본 HTML 블록 변환 ──
TEXT_FIX = [("151칸 중 몇 마리 모았는지", "등장 세대 포켓몬 중 몇 마리 모았는지"),
            ("1세대 포켓몬은 한 마리당 최대 2번 진화해요", "포켓몬은 진화 단계에 따라 최대 2번 진화해요")]

def fix_text(soup_node):
    for s in list(soup_node.find_all(string=True)):
        t = str(s)
        for a, b in TEXT_FIX:
            if a in t:
                s.replace_with(t.replace(a, b))

def figs_of(div):
    out = []
    for fg in div.find_all("figure"):
        im = fg.find("img")
        n = IMG_INDEX[id(im)]
        out.append((os.path.join(GIMG, f"g{n:02d}.png"), fg.find("figcaption")))
    return out

def render_block(el, sid):
    cls = el.get("class") or []
    name = el.name
    if name == "div" and "head" in cls:
        return
    if name == "p":
        if "sub" in cls:
            para(el, size=10.5, color="#1F2937", after=6, before=2)
        elif "muted" in cls:
            para(el, size=9.5, color="#374151", after=4)
        else:
            para(el, after=4)
    elif name == "h3":
        h3(norm(el.get_text()).strip())
    elif name == "h4":
        para(el, size=10.5, bold=True, color=C_H3, before=6, after=2, keep=True)
    elif name == "ol" and "steps" in cls:
        for i, li in enumerate(el.find_all("li", recursive=False)):
            p = para(size=10, indent=3, after=1)
            run(p, "①②③④⑤⑥⑦⑧⑨⑩"[i] + " ", 10.5, True, C_H3)
            inline(p, li, 10)
            for hint in li.find_all("span", class_="hint"):
                q = para(size=9, color=C_GRAY, indent=8, after=2)
                run(q, "→ ", 9, False, C_GRAY)
                inline(q, hint, 9, False, C_GRAY, skip_hint=False)
    elif name == "ul":
        for li in el.find_all("li", recursive=False):
            p = para(size=10, indent=3, after=2)
            run(p, "• ", 10, True, C_H3)
            inline(p, li, 10)
    elif name == "div" and "callout" in cls:
        kind = "warn" if "warn" in cls else "tip" if "tip" in cls else "info"
        box(kind, el)
    elif name == "div" and "figrow" in cls:
        picture_row(figs_of(el))
    elif name == "figure":
        picture_row(figs_of(el.parent) if False else [(os.path.join(GIMG, f"g{IMG_INDEX[id(el.find('img'))]:02d}.png"), el.find("figcaption"))], max_h=100)
    elif name == "div" and "twrap" in cls:
        tb = el.find("table")
        rows = [[c for c in tr.find_all(["th", "td"])] for tr in tb.find_all("tr")]
        table(rows)
    elif name == "table":
        rows = [[c for c in tr.find_all(["th", "td"])] for tr in el.find_all("tr")]
        table(rows)
    elif name == "div" and "grid2" in cls:
        minis = el.find_all("div", class_="mini", recursive=False)
        extra = EXTRA_FAQ if sid == "s8" else []
        cells = [(m.find("h4"), m.find("p")) for m in minis] + extra
        rows = (len(cells) + 1) // 2
        t = d.add_table(rows, 2, width=int(TEXT_W * MM))
        fmt(spacing_before_pt=4, spacing_after_pt=6)
        t.set_column_widths([1, 1])
        for k, (hh, pp) in enumerate(cells):
            cell = t.cell(k // 2, k % 2)
            t.set_cell_shading(k // 2, k % 2, "#F7F9FC")
            p0 = cell.paragraphs[0]
            if isinstance(hh, Tag):
                inline(p0, hh, 10, True, C_H3)
            else:
                run(p0, hh, 10, True, C_H3)
            p1 = cell.add_paragraph("")
            if isinstance(pp, Tag):
                inline(p1, pp, 9.5)
            else:
                for t_, b_ in rich_runs(pp):
                    run(p1, t_, 9.5, b_)
    elif name == "a" and "applink" in cls:
        rich("🎮 웹앱 주소: **https://pokesutdy.vercel.app**", after=4)
    elif name in ("div", "section"):
        for ch in el.children:
            if isinstance(ch, Tag):
                render_block(ch, sid)

# ── 새 기능(최근 메인 업데이트) 블록 ──
def new_bank_export():
    h3("⬇️ 엑셀로 내려받기", new=True)
    rich("[📥 대량 등록] 옆의 **[⬇️ 엑셀로 내려받기]**를 누르면, 지금 화면에 보이는 문제(검색·태그 필터 적용)가 엑셀(.xlsx) 파일로 내려받아져요.", after=3)
    picture(os.path.join(SHOT, "t_bank_top.png"), "문제 은행 상단 — 검색 · 새 문제 · AI 생성 · 대량 등록 · 엑셀로 내려받기, 단원(태그) 칩", max_w=150, max_h=95)
    bullets(["**앞 9칸은 대량 등록 양식과 같아요** — 유형·문제·보기1~4·정답·난이도·태그. 받은 파일을 그대로 다른 학급에 올릴 수 있어요.",
             "뒤에는 **출제 여부 · 레이드 전용 · 푼 횟수 · 오답률(%) · 문제ID**가 붙어요. 오답률이 높은 문제를 골라 다시 지도할 때 좋아요.",
             "태그를 고쳐 다시 정리하고 싶을 때도 이 파일로 한눈에 확인해요."])

def new_bank_many():
    bullets(["**문제가 많아도 괜찮아요.** 대량 등록은 개수 제한이 없고 500개씩 나눠 저장해요. 중간에 문제가 생겨도 이미 저장된 문제는 남아요."])

def new_bank_list():
    bullets(["문제가 많으면 목록을 **200개씩** 보여 줘요. 맨 아래 **[200개 더 보기] · [모두 보기]**로 이어 볼 수 있고, 1,000개가 넘어도 모두 출제돼요."])
    picture(os.path.join(SHOT, "t_bank_more.png"), "문제 목록 아래 — 200개 / 960개 보는 중 · 200개 더 보기 · 모두 보기", max_w=140, max_h=70)

def new_settings():
    h3("🎓 학생 출제 영역 선택 (배틀 · 문제풀이)", new=True)
    rich("[시스템 설정]의 **'학생이 출제 과목·단원 선택 허용'**을 켜면, 학생이 배틀과 문제풀이에서 공부할 **영역**을 직접 골라요.", after=3)
    picture(os.path.join(SHOT, "t_toggle.png"), "시스템 설정 — 학생이 출제 과목·단원 선택 허용 토글", max_w=140, max_h=40)
    bullets(["**끄면(기본)** 출제된 문제 전체에서 안 푼 문제·최근 틀린 문제를 먼저 내 줘요(편식 방지).",
             "**켜면** 배틀은 시작 버튼 위 '출제 영역'에서 고르고, 문제풀이는 **영역을 먼저 골라야** 문제를 받을 수 있어요.",
             "영역은 문제의 **태그**로 나눠요. 태그 '·' 앞(과목)이 2개 이상이면 과목으로, 과목이 하나뿐이면 '·' 뒤(예: 수학·**덧셈과 뺄셈**)로 나눠요."])
    box("tip", parts=[("영역별로 공부시키려면 태그를 '수학·받아올림이 없는 덧셈과 뺄셈'처럼 ", False, None),
                      ("과목·영역", True, None), (" 형태로 통일해 두세요. 학생의 단계에 맞는 영역을 안내하기 쉬워요.", False, None)])
    h3("📊 구글 시트 연동", new=True)
    rich("[시스템 설정] 맨 아래 **'📊 구글 시트 연동'** 카드에서 연동 주소를 만들면, 학생들의 풀이 기록이 **선생님의 구글 시트**로 자동으로 쌓이고 학생별 대시보드가 만들어져요. (자세한 방법은 5장)", after=3)
    picture(os.path.join(SHOT, "t_sheet_after.png"), "구글 시트 연동 카드 — 연동 주소 · 복사 · 다시 만들기 · 연결 끊기 · 풀이 기록 CSV로 내려받기", max_w=140, max_h=65)

def new_raid_note():
    bullets(["레이드에서 푼 문제도 풀이 기록에 **'레이드'**로 남아요. 구글 시트 대시보드의 '상황별' 표에서 **형성평가 정답률**을 학생별로 확인할 수 있어요."])

def new_sheet_dashboard():
    h3("📊 구글 시트 대시보드로 학생별 분석하기", new=True)
    rich("앱의 [학생·통계]가 '지금 현황'이라면, 구글 시트 대시보드는 **기간을 정해 학생별·영역별로 깊이 보는 분석 도구**예요. 처음 한 번만 연결하면(약 10분) 이후로는 5분마다 자동으로 기록이 들어와요.", after=4)
    table([["단계", "할 일"],
           ["①", "새 구글 시트 만들기 (**sheets.new**)"],
           ["②", "확장 프로그램 → Apps Script에 안내 페이지(**/guide/sheets**)의 스크립트를 붙여 넣고 저장"],
           ["③", "시트 새로고침 → 메뉴 **🎮 잡으면서 배우자 → ① 처음 설정하기** → 권한 허용"],
           ["④", "웹앱 [시스템 설정] → 📊 구글 시트 연동 → **🔗 연동 주소 만들기 → 📋 복사**"],
           ["⑤", "시트 메뉴 **② 연동 주소 넣기**에 붙여 넣고 **③ 지금 가져오기**"],
           ["⑥", "**⏱ 자동 가져오기 켜기** — 5분마다 새 기록이 저절로 쌓여요"]], widths=[1, 9])
    table([["시트 탭", "보이는 내용"],
           ["학생현황", "학생별 레벨·포인트·도감·푼 문항·정답률·최근 활동 (이름을 누르면 그 학생 탭으로)"],
           ["반 전체", "반 전체 대시보드"],
           ["👤 학생 이름", "학생별 대시보드 — 새 학생이 가입하면 자동으로 생겨요"],
           ["문제기록", "모든 풀이 기록 원본(날짜·이름·상황·과목·단원·난이도·정답·문항). 지우지 마세요."]], widths=[2, 8])
    rich("대시보드 한 장에서 **기간**(이번 주·이번 달·최근 30일·전체·직접 입력)을 고르면 아래 표가 모두 그 기간 기준으로 바뀌어요.", after=2)
    bullets(["**과목·단원별** 정답률/오답률, **과목·단원 × 난이도** 정답률",
             "**난이도별**, **상황별(배틀·문제풀이·레이드)** 정답률",
             "**날짜별 정답률** 꺾은선 그래프 — 학기 동안의 성장 흐름",
             "**오답 모아보기**(최근 100개) — 복습·개별 지도 자료"])
    box("tip", parts=[("지난 학기 전체를 보려면 기간을 ", False, None), ("'전체'", True, None),
                      (" 또는 '직접 입력'(시작일·종료일)으로 바꾸세요. 기본값은 '이번 달'이에요.", False, None),
                      [("시트 시간대는 ", False, None), ("파일 → 설정 → 시간대 → (GMT+09:00) 서울", True, None), ("이어야 날짜가 정확해요.", False, None)],
                      [("이 시트에 연동 주소를 아는 사람은 우리 반 기록을 볼 수 있어요. 주소가 새어 나갔다면 ", False, None),
                       ("🔄 다시 만들기", True, None), ("를 누르면 예전 주소는 바로 막혀요.", False, None)]])
    bullets(["시트 없이 바로 보고 싶으면 연동 카드의 **[⬇️ 풀이 기록 CSV로 내려받기]**로 엑셀에서 열 수 있어요."])

def new_battle_area():
    rich("**출제 영역 고르기** — 선생님이 '학생이 출제 과목·단원 선택 허용'을 켜면, 배틀 시작 버튼 위에 **'출제 영역'**이 생겨요. '전체 영역 섞어서' 또는 공부할 영역 하나를 고른 뒤 야생 포켓몬을 찾아요.", size=9.5, after=3)
    picture(os.path.join(SHOT, "s_battle_area.png"), "배틀 — 시작 버튼 위 '출제 영역' 선택", max_w=120, max_h=75)

def new_solve_area():
    rich("**영역을 먼저 골라요** — 영역 선택이 켜진 학급은 문제풀이 첫 화면에서 '출제 영역'을 고르기 전에는 [문제 받기]가 잠겨 있어요. 고른 영역은 다음 문제에서도 유지되고, 문제를 푼 뒤 같은 칸에서 언제든 바꿀 수 있어요.", size=9.5, after=3)
    picture_row([(os.path.join(SHOT, "s_solve_pick.png"), "① 영역을 먼저 골라 주세요"),
                 (os.path.join(SHOT, "s_solve_next.png"), "② 푼 뒤에도 영역을 바꿀 수 있어요")], max_h=95)

EXTRA_FAQ = [("❓ 문제가 1,000개가 넘어요", "모두 저장되고 모두 출제돼요. 목록은 200개씩 보여 주니 **[200개 더 보기]·[모두 보기]**를 누르세요."),
             ("❓ 등록한 문제를 파일로 받고 싶어요", "문제 은행의 **[⬇️ 엑셀로 내려받기]**를 누르세요. 대량 등록 양식과 같은 모양이에요."),
             ("❓ 학생이 영역을 골라 공부하게 하고 싶어요", "[시스템 설정]에서 **'학생이 출제 과목·단원 선택 허용'**을 켜세요. 태그를 '과목·영역'으로 통일하면 좋아요."),
             ("❓ 시트에 단원이 너무 많이 보여요", "지운 예전 문제로 푼 기록에는 **예전 태그**가 남아요. 그 기록을 정리하거나 태그를 통일한 뒤 **🔁 기록 전부 다시 받기**를 하세요."),
             ("❓ 시트 날짜별 정답률이 일부만 보여요", "기간을 **'전체'**로 바꿔 보세요. 그래도 같으면 문제기록 탭 삭제 → **① 처음 설정하기 → 🔁 기록 전부 다시 받기**."),
             ("❓ 학생 이름(닉네임)을 바꾸고 싶어요", "이름이 바뀌어도 기록은 그대로예요. 구글 시트는 **🔁 기록 전부 다시 받기**를 해야 새 이름으로 다시 정리돼요.")]

HOOKS_AFTER_H3 = {("s2", "빠르게 많이 넣는 방법"): [new_bank_many],
                  ("s2", "출제 관리"): [new_bank_list]}
HOOKS_BEFORE_H3 = {("s2", "🔎 유형 배지"): [new_bank_export],
                   ("s3", "야생 출현 확률"): [new_settings],
                   ("s6", "🌿 탐색"): [new_battle_area],
                   ("s6", "🧠 오늘의 퀴즈"): [new_solve_area]}
HOOKS_END = {"s4": [new_raid_note], "s5": [new_sheet_dashboard]}

# ── 문서 만들기 ──
soup = BeautifulSoup(open(os.path.join(HERE, "..", "..", "..", "..", "..", "home", "user", "pokesutdy", "public", "guide.html")
                          if False else "/home/user/pokesutdy/public/guide.html", encoding="utf-8").read(), "html.parser")
body = soup.body or soup
IMG_INDEX = {id(im): i for i, im in enumerate(body.find_all("img"))}
fix_text(body)

# 표지
para(text="", after=40)
para(text="부록", size=12, bold=True, color=C_NEW, align="CENTER", after=6)
para(text="잡으면서 배우자!", size=30, bold=True, color=C_TITLE, align="CENTER", after=4)
para(text="교사 활용 가이드북", size=18, bold=True, color="#374151", align="CENTER", after=14)
picture(os.path.join(GIMG, "g00.png"), None, max_w=55, max_h=55)
para(text="문제를 풀어 포켓몬을 잡고 도감을 채우는 우리 반 학습 플랫폼", size=11, color="#374151", align="CENTER", before=10, after=4)
para(text="웹앱 주소  https://pokesutdy.vercel.app", size=11, bold=True, color=C_TAB, align="CENTER", after=24)
table([["대상", "이 앱을 처음 쓰는 선생님"], ["준비물", "인터넷이 되는 기기 (교사 1대, 학생 각 1대)"],
       ["순서", "① 학급 만들기 → ② 문제 등록 → ③ 코드 배부 → ④ 수업 시작"],
       ["기준", "2026년 11월 웹앱(최신 업데이트) 기준"]], header=False, widths=[2, 8])
para(text="초리쌤의 교수학습 콘텐츠", size=10, color=C_GRAY, align="CENTER", before=18)

# 목차 + 이번 판 새 내용
h1("", "차례", first=True)
TOC = ["이 웹앱은 무엇인가요?", "5분 만에 시작하기", "문제 등록하기 — 문제 은행", "시스템 설정", "레이드 — 형성평가로 활용",
       "학생·통계 관리 (구글 시트 대시보드)", "학생은 이렇게 사용해요", "웹앱 규칙 한눈에", "수업 활용 팁 & 자주 묻는 질문"]
for i, t in enumerate(TOC):
    p = para(size=11, indent=4, after=3)
    run(p, f"{i + 1}.  ", 11, True, C_H3)
    run(p, t, 11)
para(text="", after=6)
box("new", parts=[("이번 판에 새로 담은 내용 (최근 웹앱 업데이트)", True, None),
                  [("• 문제 은행 ", False, None), ("엑셀로 내려받기", True, None), (" · 문제 1,000개 이상도 모두 저장·출제(200개씩 보기)", False, None)],
                  [("• 학생 ", False, None), ("출제 영역 선택", True, None), (" — 배틀 '출제 영역', 문제풀이 '영역 먼저 고르기'", False, None)],
                  [("• ", False, None), ("구글 시트 연동", True, None), (" — 학생별·영역별 대시보드, 레이드(형성평가) 기록까지", False, None)]])

# 본문 9장
for n, sec in enumerate(body.find_all("section", class_="chapter")):
    sid = sec.get("id")
    title = norm(sec.find("h2").get_text()).strip()
    h1(str(n + 1), title, first=False)
    for el in sec.children:
        if not isinstance(el, Tag):
            continue
        if el.name == "h3":
            key = norm(el.get_text()).strip()
            for (s_, k_), fns in HOOKS_BEFORE_H3.items():
                if s_ == sid and key.startswith(k_):
                    for f in fns: f()
        render_block(el, sid)
        if el.name == "h3":
            pass
        # h3 다음 블록(목록 등)까지 끝난 뒤 붙이는 내용: 다음 h3 직전에 처리
        nxt = el.find_next_sibling()
        if el.name != "h3" and (nxt is None or nxt.name == "h3"):
            prev_h3 = el.find_previous_sibling("h3")
            if prev_h3 is not None:
                k = norm(prev_h3.get_text()).strip()
                for (s_, k_), fns in HOOKS_AFTER_H3.items():
                    if s_ == sid and k.startswith(k_):
                        for f in fns: f()
    for f in HOOKS_END.get(sid, []):
        f()

d.set_header_text("잡으면서 배우자! 교사 활용 가이드북")
d.set_page_number(format="page", align="CENTER", position="BOTTOM_CENTER", prefix="- ", suffix=" -")
d.save_to_path(OUT)
rep = d.validate()
print("saved", OUT, os.path.getsize(OUT) // 1024, "KB")
print("validate:", getattr(rep, "ok", rep) if not hasattr(rep, "issues") else (len(rep.issues), [str(i)[:120] for i in rep.issues[:5]]))
