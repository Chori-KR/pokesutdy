"""초3-4 수·규칙·분수·소수 묶음 공통 그림 도구와 도우미.
svgkit.py 규칙: viewBox만, 글자 12 이상, 선 2 이상, 배경 없음, currentColor + 파랑/주황만, 색만으로 구분하지 않기."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, shape, table, BLUE, ORANGE, C, _n
from kit12 import ST, poly, seg_bars, dots_groups, column

# ── 문장 속 수식 ────────────────────────────────────────
X = "\\times"
D = "\\div"


def fr(n, d):
    return f"$\\frac{{{n}}}{{{d}}}$"


def mx(w, n, d):
    return f"${w}\\frac{{{n}}}{{{d}}}$"


def mul(a, b, c=None):
    return f"${a} {X} {b}$" if c is None else f"${a} {X} {b} = {c}$"


def div(a, b, c=None):
    return f"${a} {D} {b}$" if c is None else f"${a} {D} {b} = {c}$"


def ex(s):
    """× ÷ 가 들어간 식 전체를 수식으로"""
    return "$" + s.replace("×", f" {X} ").replace("÷", f" {D} ") + "$"


# ── 큰 수 읽기 ──────────────────────────────────────────
_D = "영일이삼사오육칠팔구"


def _group(n):
    s = ""
    for k, u in ((1000, "천"), (100, "백"), (10, "십")):
        d = n // k % 10
        if d:
            s += ("" if d == 1 else _D[d]) + u
    if n % 10:
        s += _D[n % 10]
    return s


def kr(n):
    """자연수를 우리말 수로 읽기 (만·억·조). 한 묶음이 1이면 '일만·일억'처럼 일을 붙여 읽는다."""
    if n == 0:
        return "영"
    parts = []
    for unit, name in ((10 ** 12, "조"), (10 ** 8, "억"), (10 ** 4, "만"), (1, "")):
        g = n // unit % 10000
        if not g:
            continue
        parts.append(("일" + name) if (g == 1 and name) else (_group(g) + name))
    return " ".join(parts)


# ── 분수 그림 ──────────────────────────────────────────
def frac_txt(cx, cy, n, d, size=14):
    """그림 속에 쓰는 분수 (분자 위, 분모 아래)"""
    w = max(len(str(n)), len(str(d))) * 8 + 6
    return (text(cx, cy - 4, n, size, weight="bold") + line(cx - w / 2, cy, cx + w / 2, cy, 2)
            + text(cx, cy + size + 1, d, size, weight="bold"))


def frac_bar(d, n, w=220, h=34, label=None, whole=None):
    """막대를 d등분하여 n칸을 색칠 (칠한 칸은 빗금도 넣음)"""
    cw = w / d
    out = []
    for i in range(d):
        x = 4 + i * cw
        if i < n:
            out.append(f'<rect x="{_n(x)}" y="4" width="{_n(cw)}" height="{h}" fill="{BLUE}" fill-opacity="0.45" stroke="{C}" stroke-width="2"/>')
            out.append(line(x + 3, 4 + h - 3, x + cw - 3, 7, 2, 0.5))
        else:
            out.append(f'<rect x="{_n(x)}" y="4" width="{_n(cw)}" height="{h}" fill="none" stroke="{C}" stroke-width="2"/>')
    W = w + 8
    H = h + 8
    if label:
        out.append(text(W / 2, h + 26, label, 13, weight="bold"))
        H += 24
    return svg(W, H, "".join(out))


def frac_bars(items, w=200, h=26, gap=8):
    """items: [(분모, 분자, 이름)] 막대를 위아래로 비교"""
    out = []
    y = 4
    lab_w = 58
    for d, n, nm in items:
        cw = w / d
        out.append(text(lab_w - 8, y + h / 2 + 5, nm, 14, "end", "bold"))
        for i in range(d):
            x = lab_w + i * cw
            if i < n:
                out.append(f'<rect x="{_n(x)}" y="{y}" width="{_n(cw)}" height="{h}" fill="{BLUE}" fill-opacity="0.45" stroke="{C}" stroke-width="2"/>')
                out.append(line(x + 3, y + h - 3, x + cw - 3, y + 3, 2, 0.5))
            else:
                out.append(f'<rect x="{_n(x)}" y="{y}" width="{_n(cw)}" height="{h}" fill="none" stroke="{C}" stroke-width="2"/>')
        y += h + gap
    return svg(lab_w + w + 8, y, "".join(out))


def pie(d, n, r=38, start=-90):
    cx = cy = r + 6
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="2.5"/>']
    for i in range(d):
        a1 = math.radians(start + 360 * i / d)
        a2 = math.radians(start + 360 * (i + 1) / d)
        x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
        x2, y2 = cx + r * math.cos(a2), cy + r * math.sin(a2)
        if i < n:
            large = 1 if (a2 - a1) > math.pi else 0
            out.append(f'<path d="M{cx},{cy} L{_n(x1)},{_n(y1)} A{r},{r} 0 {large} 1 {_n(x2)},{_n(y2)} Z" fill="{BLUE}" fill-opacity="0.45" stroke="{C}" stroke-width="2"/>')
        if d > 1:
            out.append(line(cx, cy, x1, y1, 2.5))
    return svg(2 * r + 12, 2 * r + 12, "".join(out))


def pies(items, names=None):
    """items: [(분모, 분자)]"""
    import re
    parts = []
    for i, (d, n) in enumerate(items):
        parts.append((pie(d, n), names[i] if names else None))
    from kit34 import hold
    return hold(parts, gap=8)


def frac_line(d, whole, marks=None, hide=None, w=300):
    """수직선: 0에서 whole까지 1/d 간격 눈금, 정수에 숫자. marks: {칸 번호: 이름 글자}, hide: 숫자를 가릴 정수"""
    n = d * whole
    x0 = 20
    u = w / n
    out = [line(x0 - 8, 44, x0 + w + 10, 44, 2.5)]
    for k in range(n + 1):
        x = x0 + k * u
        big = k % d == 0
        out.append(line(x, 44 - (10 if big else 7), x, 44 + (10 if big else 7), 2.5 if big else 2))
        if big:
            out.append(text(x, 74, k // d, 13, weight="bold"))
    for k, nm in (marks or {}).items():
        x = x0 + k * u
        out.append(f'<circle cx="{_n(x)}" cy="44" r="5.5" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
        out.append(text(x, 26, nm, 14, weight="bold"))
    return svg(w + 48, 84, "".join(out))


def dec_line(vals, marks, w=300, step=0.1, start=0.0):
    """소수 수직선: start부터 step 간격으로 len(vals)칸. marks: {값: 이름}. 큰 눈금에 숫자"""
    n = len(vals) - 1
    x0 = 24
    u = w / n
    out = [line(x0 - 10, 44, x0 + w + 10, 44, 2.5)]
    for k, v in enumerate(vals):
        x = x0 + k * u
        big = (k % 5 == 0) or k == n
        out.append(line(x, 44 - (10 if big else 7), x, 44 + (10 if big else 7), 2.5 if big else 2))
        if big:
            out.append(text(x, 74, v, 12, weight="bold"))
    for v, nm in marks.items():
        k = vals.index(v)
        x = x0 + k * u
        out.append(f'<circle cx="{_n(x)}" cy="44" r="5.5" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
        out.append(text(x, 26, nm, 14, weight="bold"))
    return svg(w + 52, 84, "".join(out))


def grid100(n, rows=10, cols=10, cell=15, label=None):
    """모눈 한 칸=0.01. 앞의 n칸(세로 줄 단위로 왼쪽부터)을 색칠. 십분의 일은 세로 한 줄(10칸)"""
    out = []
    for i in range(rows * cols):
        c, r = divmod(i, rows)
        x, y = 4 + c * cell, 4 + r * cell
        if i < n:
            out.append(f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" fill="{BLUE}" fill-opacity="0.5"/>')
    out.append(f'<rect x="4" y="4" width="{cols * cell}" height="{rows * cell}" fill="none" stroke="{C}" stroke-width="2.5"/>')
    d = ""
    for c in range(1, cols):
        d += f"M{4 + c * cell},4v{rows * cell}"
    for r in range(1, rows):
        d += f"M4,{4 + r * cell}h{cols * cell}"
    out.append(f'<path d="{d}" stroke="{C}" stroke-width="2" stroke-opacity="0.35"/>')
    W, H = cols * cell + 8, rows * cell + 8
    if label:
        out.append(text(W / 2, H + 14, label, 13, weight="bold"))
        H += 22
    return svg(W, H, "".join(out))


def decimal_bar(tenths, label=None, w=240, h=30):
    """막대를 10칸으로 나누어 tenths칸 색칠 (0.1 단위)"""
    return frac_bar(10, tenths, w=w, h=h, label=label)


def place_table(headers, digits, first="자리", unit_row=None):
    """자릿값 표. headers: ['만','천','백','십','일'], digits: ['4','0',…]"""
    rows = [[first] + list(headers), ["숫자"] + [str(d) for d in digits]]
    return table(rows[0], [rows[1]], col_w=max(40, min(84, 300 // (len(headers)))), first_w=50)


def mult_box(a, b, hide=None):
    """곱셈 상자 모형: (십의 자리·일의 자리) 부분곱. a=23, b=14 → 20×10, 20×4, 3×10, 3×4"""
    ta, ua = (a // 10) * 10, a % 10
    tb, ub = (b // 10) * 10, b % 10
    cw1, cw2 = 120, 60
    ch1, ch2 = 56, 38
    out = []
    x0, y0 = 70, 40
    cols = [(ta, cw1), (ua, cw2)]
    rows = [(tb, ch1), (ub, ch2)]
    xs = [x0, x0 + cw1]
    ys = [y0, y0 + ch1]
    for ci, (cv, cw) in enumerate(cols):
        out.append(text(xs[ci] + cw / 2, 28, cv, 14, weight="bold"))
    for ri, (rv, ch) in enumerate(rows):
        out.append(text(x0 - 10, ys[ri] + ch / 2 + 5, rv, 14, "end", "bold"))
    k = 0
    for ri, (rv, ch) in enumerate(rows):
        for ci, (cv, cw) in enumerate(cols):
            out.append(f'<rect x="{xs[ci]}" y="{ys[ri]}" width="{cw}" height="{ch}" fill="{BLUE if (ri + ci) % 2 == 0 else ORANGE}" fill-opacity="0.3" stroke="{C}" stroke-width="2"/>')
            v = cv * rv
            out.append(text(xs[ci] + cw / 2, ys[ri] + ch / 2 + 5, "?" if hide == k else v, 15, weight="bold"))
            k += 1
    return svg(x0 + cw1 + cw2 + 14, y0 + ch1 + ch2 + 12, "".join(out))


def div_groups(total, per, kind="circle", r=7, show_rest=True):
    """total개를 per개씩 묶음 (남는 것은 묶음 밖)"""
    groups = total // per
    rest = total % per
    out = []
    x = 8
    per_row = min(per, 5)
    rows = (per - 1) // per_row + 1
    H = rows * (2 * r + 6) + 22
    for g in range(groups):
        w = per_row * (2 * r + 6) + 6
        out.append(f'<rect x="{x}" y="6" width="{w}" height="{H - 12}" rx="8" fill="none" stroke="{C}" stroke-width="2" stroke-dasharray="5 4"/>')
        for i in range(per):
            c, rr = i % per_row, i // per_row
            out.append(shape(kind, x + 6 + r + c * (2 * r + 6), 14 + r + rr * (2 * r + 6), r, fill=BLUE))
        x += w + 10
    if rest and show_rest:
        for i in range(rest):
            out.append(shape("triangle", x + 4 + r + i * (2 * r + 6), 14 + r, r, fill=ORANGE))
        x += rest * (2 * r + 6) + 6
    return svg(max(x, 100), H, "".join(out))


# ── 규칙 찾기 그림 ──────────────────────────────────────
def cell_fig(cells, g=14, fill=BLUE):
    xs = [c for c, _ in cells]
    ys = [r for _, r in cells]
    W, H = (max(xs) + 1) * g + 6, (max(ys) + 1) * g + 6
    out = [f'<rect x="{3 + c * g}" y="{3 + r * g}" width="{g}" height="{g}" fill="{fill}" fill-opacity="0.45" stroke="{C}" stroke-width="2"/>' for c, r in cells]
    return svg(W, H, "".join(out))


def seq_row(figs, names=None, extra="?", gap=10):
    """그림 여러 개를 가로로 + 마지막 칸에 '?' 모양(점선 상자)"""
    from kit34 import hold
    items = [(f, names[i] if names else None) for i, f in enumerate(figs)]
    if extra:
        q = svg(60, 60, f'<rect x="6" y="6" width="48" height="48" rx="6" fill="none" stroke="{C}" stroke-width="2.5" stroke-dasharray="5 4"/>' + text(30, 38, extra, 20, weight="bold"))
        items.append((q, names[len(figs)] if names and len(names) > len(figs) else None))
    return hold(items, gap=gap)


def stairs(k, g=14):
    return cell_fig([(c, r) for r in range(k) for c in range(k) if c <= r], g)


def squares(k, g=14):
    return cell_fig([(c, r) for r in range(k) for c in range(k)], g)


def toothpick_tri(k, L=28):
    """성냥개비로 정삼각형 k개를 이어 만든 모양 (개비 수 2k+1)"""
    h = L * 0.866
    x0 = 6
    pts = [(x0 + i * L / 2, 6 + (h if i % 2 == 0 else 0)) for i in range(k + 2)]
    out = []
    for a, b_ in zip(pts, pts[1:]):
        out.append(line(a[0], a[1], b_[0], b_[1], 3.5))
    for i in range(k):
        a, b_ = pts[i], pts[i + 2]
        out.append(line(a[0], a[1], b_[0], b_[1], 3.5))
    return svg(_n(x0 * 2 + (k + 1) * L / 2), _n(h + 14), "".join(out))


def toothpick_sq(k, L=26):
    """성냥개비로 정사각형 k개를 한 줄로 만든 모양 (개비 수 3k+1)"""
    out = []
    x0, y0 = 6, 6
    for i in range(k + 1):
        out.append(line(x0 + i * L, y0, x0 + i * L, y0 + L, 3.5))
    for i in range(k):
        out.append(line(x0 + i * L, y0, x0 + (i + 1) * L, y0, 3.5))
        out.append(line(x0 + i * L, y0 + L, x0 + (i + 1) * L, y0 + L, 3.5))
    return svg(x0 * 2 + k * L, L + 12, "".join(out))


def calc_rows(rows, W=260, size=15):
    """계산식을 여러 줄로 적은 상자"""
    h = 28
    H = h * len(rows) + 14
    out = [f'<rect x="4" y="4" width="{W - 8}" height="{H - 8}" rx="8" fill="none" stroke="{C}" stroke-width="2"/>']
    for i, r in enumerate(rows):
        out.append(text(W / 2, 4 + h * i + 24, r, size, weight="bold"))
    return svg(W, H, "".join(out))


def balance(left, right, W=260, tilt=0):
    """양팔저울: 양쪽 접시 위의 글자(식). tilt 0이면 수평"""
    out = [f'<polygon points="130,96 114,132 146,132" fill="none" stroke="{C}" stroke-width="2.5"/>']
    ang = tilt
    beam = f'<g transform="rotate({ang} 130 96)">' + line(30, 96, 230, 96, 4)
    beam += f'<rect x="12" y="62" width="76" height="32" rx="6" fill="{BLUE}" fill-opacity="0.3" stroke="{C}" stroke-width="2.5"/>' + text(50, 84, left, 14, weight="bold")
    beam += f'<rect x="172" y="62" width="76" height="32" rx="6" fill="{ORANGE}" fill-opacity="0.35" stroke="{C}" stroke-width="2.5"/>' + text(210, 84, right, 14, weight="bold")
    beam += "</g>"
    out.append(beam)
    out.append(line(110, 132, 150, 132, 4))
    return svg(W, 144, "".join(out))
