"""문제 그림(SVG) 그리기 도구.

규칙: viewBox만(고정 width/height 없음), 글자 12 이상, 선 2 이상,
배경 없음, 선·글자 currentColor, 강조색 #4b7bec(파랑) #e07b39(주황)만,
색만으로 구분하지 않기(모양·무늬·글자를 함께).
"""
from html import escape

BLUE = "#4b7bec"
ORANGE = "#e07b39"
C = "currentColor"


def _fmt(v):
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return f"{v:g}" if isinstance(v, float) else str(v)


def _n(x):
    return f"{x:.1f}".rstrip("0").rstrip(".")


def svg(w, h, body):
    return f'<svg viewBox="0 0 {w} {h}" font-family="sans-serif">{body}</svg>'


def text(x, y, s, size=13, anchor="middle", weight=None, fill=C):
    wt = f' font-weight="{weight}"' if weight else ""
    return f'<text x="{_n(x)}" y="{_n(y)}" font-size="{size}" text-anchor="{anchor}" fill="{fill}"{wt}>{escape(str(s))}</text>'


def line(x1, y1, x2, y2, w=2, op=None, dash=None, color=C):
    o = f' stroke-opacity="{op}"' if op else ""
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{_n(x1)}" y1="{_n(y1)}" x2="{_n(x2)}" y2="{_n(y2)}" stroke="{color}" stroke-width="{w}"{o}{d}/>'


# ── 막대그래프 ──────────────────────────────────────────
def bar_graph(cats, vals, ymax, step, label_every, unit, hide=None, hide_mark="?", ymin=0):
    """세로 막대그래프. step: 눈금 한 칸 값, label_every: 숫자를 적는 간격.
    hide: 막대를 그리지 않을 항목 번호(그 자리에 ?)"""
    W, H = 330, 230
    x0, y0, pw, ph = 52, 26, 262, 160
    n = len(cats)
    yb = y0 + ph
    sc = ph / (ymax - ymin)
    out = [text(x0 - 6, 16, f"({unit})", 12, "end")]
    k = 0
    v = ymin
    while v <= ymax + 1e-9:
        y = yb - (v - ymin) * sc
        out.append(line(x0, y, x0 + pw, y, 2 if v == ymin else 1.2, None if v == ymin else 0.22))
        if abs((v - ymin) / label_every - round((v - ymin) / label_every)) < 1e-6:
            out.append(text(x0 - 6, y + 4, _fmt(round(v, 6)), 12, "end"))
        k += 1
        v = ymin + k * step
    out.append(line(x0, y0 - 4, x0, yb, 2))
    slot = pw / n
    bw = min(34, slot * 0.5)
    for i, (c, val) in enumerate(zip(cats, vals)):
        cx = x0 + slot * (i + 0.5)
        if hide is not None and i == hide:
            out.append(text(cx, yb - 14, hide_mark, 16, weight="bold"))
        else:
            hgt = (val - ymin) * sc
            out.append(f'<rect x="{_n(cx - bw/2)}" y="{_n(yb - hgt)}" width="{_n(bw)}" height="{_n(hgt)}" fill="{BLUE}"/>')
        out.append(text(cx, yb + 18, c, 13))
    return svg(W, H, "".join(out))


def hbar_graph(cats, vals, xmax, step, label_every, unit):
    """가로 막대그래프"""
    W = 330
    n = len(cats)
    x0, y0, pw = 78, 14, 230
    rowh = 34
    ph = rowh * n
    H = y0 + ph + 40
    sc = pw / xmax
    out = []
    k = 0
    v = 0
    while v <= xmax + 1e-9:
        x = x0 + v * sc
        out.append(line(x, y0, x, y0 + ph, 2 if v == 0 else 1.2, None if v == 0 else 0.22))
        if abs(v / label_every - round(v / label_every)) < 1e-6:
            out.append(text(x, y0 + ph + 18, _fmt(v), 12))
        k += 1
        v = k * step
    out.append(line(x0, y0 + ph, x0 + pw + 6, y0 + ph, 2))
    out.append(text(x0 + pw + 4, y0 + ph + 34, f"({unit})", 12, "end"))
    for i, (c, val) in enumerate(zip(cats, vals)):
        cy = y0 + rowh * (i + 0.5)
        out.append(text(x0 - 8, cy + 5, c, 13, "end"))
        out.append(f'<rect x="{x0}" y="{_n(cy - 10)}" width="{_n(val * sc)}" height="20" fill="{BLUE}"/>')
    return svg(W, H, "".join(out))


# ── 그림그래프 ──────────────────────────────────────────
def picture_graph(rows, big, small, unit, head=("항목", "수"), hide=None):
    """rows: [(이름, 값)]. 큰 그림(큰 원) = big, 작은 그림(작은 원) = small.
    크기로 구분하고 색도 다르게(파랑 큰 원 / 주황 작은 원)."""
    W = 330
    rowh = 34
    x0, y0, cw = 6, 6, 70
    n = len(rows)
    H = y0 + 28 + rowh * n + 36
    out = [f'<rect x="{x0}" y="{y0}" width="{W - 12}" height="{28 + rowh * n}" fill="none" stroke="{C}" stroke-width="2"/>',
           line(x0 + cw, y0, x0 + cw, y0 + 28 + rowh * n),
           line(x0, y0 + 28, W - 6, y0 + 28),
           text(x0 + cw / 2, y0 + 19, head[0], 13, weight="bold"),
           text((x0 + cw + W - 6) / 2, y0 + 19, head[1], 13, weight="bold")]
    for i, (name, val) in enumerate(rows):
        ty = y0 + 28 + rowh * i
        if i:
            out.append(line(x0, ty, W - 6, ty, 1.5, 0.5))
        cy = ty + rowh / 2
        out.append(text(x0 + cw / 2, cy + 5, name, 13))
        if hide is not None and i == hide:
            out.append(text(x0 + cw + 24, cy + 6, "?", 16, weight="bold"))
            continue
        nb, ns = divmod(val, big)
        ns //= small
        x = x0 + cw + 16
        for _ in range(nb):
            out.append(f'<circle cx="{x}" cy="{_n(cy)}" r="11" fill="{BLUE}" stroke="{C}" stroke-width="2"/>')
            x += 26
        x += 2
        for _ in range(ns):
            out.append(f'<circle cx="{x - 4}" cy="{_n(cy)}" r="6" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
            x += 16
    ly = H - 16
    out.append(f'<circle cx="24" cy="{ly - 4}" r="11" fill="{BLUE}" stroke="{C}" stroke-width="2"/>')
    out.append(text(42, ly + 1, f"{big}{unit}", 13, "start"))
    out.append(f'<circle cx="138" cy="{ly - 4}" r="6" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
    out.append(text(152, ly + 1, f"{small}{unit}", 13, "start"))
    return svg(W, H, "".join(out))


# ── 꺾은선그래프 ────────────────────────────────────────
def line_graph(xlabels, series, ymin, ymax, step, label_every, unit, wavy=False, legend=False, xunit=None):
    """series: [{'vals': [...], 'name': '가', 'dash': None|'6 4', 'marker': 'circle'|'square'|'none',
    'color': BLUE, 'upto': 개수(앞에서 몇 개만 그림)}]. 값이 None이면 그 점은 그리지 않음."""
    W, H = 330, 240
    x0, y0, pw, ph = 52, 26, 252, 160
    yb = y0 + ph
    n = len(xlabels)
    sc = ph / (ymax - ymin)
    out = [text(x0 - 6, 16, f"({unit})", 12, "end")]
    k = 0
    v = ymin
    while v <= ymax + 1e-9:
        y = yb - (v - ymin) * sc
        out.append(line(x0, y, x0 + pw, y, 2 if k == 0 else 1.2, None if k == 0 else 0.22))
        if abs((v - ymin) / label_every - round((v - ymin) / label_every)) < 1e-6:
            out.append(text(x0 - 6 - (10 if wavy and k == 0 else 0), y + 4, _fmt(round(v, 6)), 12, "end"))
        k += 1
        v = ymin + k * step
    out.append(line(x0, y0 - 4, x0, yb, 2))
    if wavy:  # 물결선: 0~ymin 사이를 줄였다는 표시
        wy = yb + 10
        out.append(f'<path d="M{x0-8},{wy} q4,-6 8,0 t8,0" fill="none" stroke="{C}" stroke-width="2"/>')
        out.append(text(x0 - 12, yb + 26, "0", 12, "end"))
    slot = pw / n
    xs = [x0 + slot * (i + 0.5) for i in range(n)]
    for i, lab in enumerate(xlabels):
        out.append(line(xs[i], y0, xs[i], yb, 1.2, 0.22))
        out.append(text(xs[i], yb + 18 + (12 if wavy else 0), lab, 12))
    if xunit:
        out.append(text(x0 + pw, yb + 34 + (12 if wavy else 0), f"({xunit})", 12, "end"))
    for s in series:
        col = s.get("color", BLUE)
        pts = [(xs[i], yb - (val - ymin) * sc) for i, val in enumerate(s["vals"][: s.get("upto", n)]) if val is not None]
        if len(pts) > 1:
            d = " ".join(f"{_n(x)},{_n(y)}" for x, y in pts)
            dash = f' stroke-dasharray="{s["dash"]}"' if s.get("dash") else ""
            out.append(f'<polyline points="{d}" fill="none" stroke="{col}" stroke-width="3"{dash}/>')
        for x, y in pts:
            if s.get("marker", "circle") == "square":
                out.append(f'<rect x="{_n(x-5)}" y="{_n(y-5)}" width="10" height="10" fill="{col}" stroke="{C}" stroke-width="2"/>')
            elif s.get("marker", "circle") == "circle":
                out.append(f'<circle cx="{_n(x)}" cy="{_n(y)}" r="5" fill="{col}" stroke="{C}" stroke-width="2"/>')
        if legend and pts:
            x, y = pts[-1]
            out.append(text(x + 10, y + 5, s["name"], 13, "start", "bold"))
    return svg(W, H, "".join(out))


# ── 표 ──────────────────────────────────────────────────
def table(header, rows, col_w=None, first_w=None):
    """header: [첫칸, 항목...], rows: [[이름, 값...]] — 가로로 긴 표"""
    ncol = len(header)
    first_w = first_w or 70
    col_w = col_w or max(46, min(70, (324 - first_w) // (ncol - 1)))
    W = first_w + col_w * (ncol - 1) + 6
    rh = 30
    H = rh * (len(rows) + 1) + 6
    out = [f'<rect x="3" y="3" width="{W-6}" height="{H-6}" fill="none" stroke="{C}" stroke-width="2"/>']
    xs = [3, 3 + first_w] + [3 + first_w + col_w * i for i in range(1, ncol)]
    for x in xs[1:-1]:
        out.append(line(x, 3, x, H - 3, 1.5))
    for r in range(1, len(rows) + 1):
        out.append(line(3, 3 + rh * r, W - 3, 3 + rh * r, 2 if r == 1 else 1.5))
    for r, row in enumerate([header] + rows):
        for c, val in enumerate(row):
            cx = (xs[c] + (xs[c + 1] if c + 1 < len(xs) else W - 3)) / 2
            out.append(text(cx, 3 + rh * r + 20, val, 13, weight="bold" if r == 0 or c == 0 else None))
    return svg(W, H, "".join(out))


# ── 모양 늘어놓기 ───────────────────────────────────────
def shape(kind, cx, cy, r=15, fill="none", label=None):
    st = f'stroke="{C}" stroke-width="2.5"'
    f = f'fill="{fill}"'
    if kind == "circle":
        s = f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{r}" {f} {st}/>'
    elif kind == "square":
        s = f'<rect x="{_n(cx-r)}" y="{_n(cy-r)}" width="{2*r}" height="{2*r}" {f} {st}/>'
    elif kind == "triangle":
        s = f'<polygon points="{_n(cx)},{_n(cy-r)} {_n(cx+r)},{_n(cy+r*0.8)} {_n(cx-r)},{_n(cy+r*0.8)}" {f} {st}/>'
    elif kind == "stone_b":   # 검은 바둑돌
        s = f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{r}" fill="{C}" {st}/>'
    elif kind == "stone_w":   # 흰 바둑돌
        s = f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{r}" fill="none" {st}/>'
    elif kind == "bead_big":
        s = f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{r}" fill="{BLUE}" {st}/>'
    elif kind == "bead_small":
        s = f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{r*0.55:.1f}" fill="{ORANGE}" {st}/>'
    elif kind == "q":
        s = (f'<rect x="{_n(cx-r)}" y="{_n(cy-r)}" width="{2*r}" height="{2*r}" fill="none" {st} stroke-dasharray="5 4"/>'
             + text(cx, cy + 6, "?", 18, weight="bold"))
    elif kind.startswith("arrow_"):
        ang = {"up": 0, "right": 90, "down": 180, "left": 270}[kind[6:]]
        s = (f'<g transform="rotate({ang} {_n(cx)} {_n(cy)})">'
             f'<line x1="{_n(cx)}" y1="{_n(cy+r)}" x2="{_n(cx)}" y2="{_n(cy-r+4)}" stroke="{C}" stroke-width="3"/>'
             f'<polyline points="{_n(cx-8)},{_n(cy-r+10)} {_n(cx)},{_n(cy-r+2)} {_n(cx+8)},{_n(cy-r+10)}" fill="none" stroke="{C}" stroke-width="3"/></g>')
    else:
        raise ValueError(kind)
    if label is not None:
        s += text(cx, cy + 5, label, 14, weight="bold")
    return s


def row_of(kinds, r=15, gap=12, below=None, fills=None):
    """모양을 한 줄로. below: 각 모양 아래 글자(번호 등)"""
    n = len(kinds)
    W = max(160, n * (2 * r + gap) + gap)
    H = 2 * r + 20 + (22 if below else 0)
    out = []
    for i, k in enumerate(kinds):
        cx = gap + r + i * (2 * r + gap)
        lab = None
        if isinstance(k, tuple):
            k, lab = k
        out.append(shape(k, cx, r + 10, r, fill=(fills[i] if fills else "none"), label=lab))
        if below:
            out.append(text(cx, 2 * r + 36, below[i], 12))
    return svg(W, H, "".join(out))


def _vb(s):
    import re
    m = re.match(r'<svg viewBox="0 0 ([\d.]+) ([\d.]+)"[^>]*>(.*)</svg>$', s, re.S)
    return float(m.group(1)), float(m.group(2)), m.group(3)


def stack(*svgs, gap=8):
    """그림 여러 개를 위아래로 붙인다 (가로는 가장 넓은 것에 맞춰 가운데)"""
    parts = [_vb(s) for s in svgs]
    W = max(w for w, _, _ in parts)
    y = 0
    out = []
    for w, h, body in parts:
        out.append(f'<g transform="translate({_n((W - w) / 2)} {_n(y)})">{body}</g>')
        y += h + gap
    return svg(_n(W), _n(y - gap), "".join(out))


def word_grid(words, cols=4, cw=74, rh=32):
    """조사한 낱말을 칸에 하나씩 (원자료 보여주기)"""
    rows = (len(words) + cols - 1) // cols
    W, H = cols * cw + 6, rows * rh + 6
    out = [f'<rect x="3" y="3" width="{W-6}" height="{H-6}" fill="none" stroke="{C}" stroke-width="2"/>']
    for c in range(1, cols):
        out.append(line(3 + c * cw, 3, 3 + c * cw, H - 3, 1.5))
    for r in range(1, rows):
        out.append(line(3, 3 + r * rh, W - 3, 3 + r * rh, 1.5))
    for i, wd in enumerate(words):
        r, c = divmod(i, cols)
        out.append(text(3 + c * cw + cw / 2, 3 + r * rh + 21, wd, 13))
    return svg(W, H, "".join(out))
