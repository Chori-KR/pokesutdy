"""초5-6 수학 공통 그림 도구: 겨냥도·각기둥·각뿔·원뿔·전개도·넓이 도형·대칭.
svgkit.py 규칙: viewBox만, 글자 12 이상, 선 2 이상, 배경 없음, currentColor + 파랑/주황만, 색만으로 구분하지 않기."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, BLUE, ORANGE, C, _n

ST = f'stroke="{C}" stroke-width="2.5" stroke-linejoin="round"'
DASH = f'stroke="{C}" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"'


def P(pts):
    return " ".join(f"{_n(x)},{_n(y)}" for x, y in pts)


def cuboid_fig(a, b, c, labels=("", "", ""), s=14, fill=False, W=None, hidden=True):
    """겨냥도: 앞면 가로 a, 세로(높이) c, 깊이 b. labels=(가로, 깊이, 높이) 글자. s=1단위의 화면 길이"""
    w, h = a * s, c * s
    dx, dy = b * s * 0.55, b * s * 0.4
    x0, y0 = 46, dy + 14   # 앞면 왼쪽 위
    F = [(x0, y0), (x0 + w, y0), (x0 + w, y0 + h), (x0, y0 + h)]
    Bk = [(x + dx, y - dy) for x, y in F]
    fo = f' fill="{BLUE}" fill-opacity="0.18"' if fill else ' fill="none"'
    out = []
    # 뒤에 숨은 모서리 3개: 뒤 왼쪽 아래 꼭짓점에서 만남
    if hidden:
        out.append(f'<polyline points="{P([F[3], Bk[3], Bk[2]])}" fill="none" {DASH}/>')
        out.append(f'<line x1="{_n(Bk[3][0])}" y1="{_n(Bk[3][1])}" x2="{_n(Bk[0][0])}" y2="{_n(Bk[0][1])}" {DASH}/>')
    out.append(f'<polygon points="{P(F)}"{fo} {ST}/>')
    out.append(f'<polygon points="{P([F[0], F[1], Bk[1], Bk[0]])}"{fo} {ST}/>')
    out.append(f'<polygon points="{P([F[1], Bk[1], Bk[2], F[2]])}"{fo} {ST}/>')
    if labels[0]:
        out.append(text(x0 + w / 2, y0 + h + 18, labels[0], 13, weight="bold"))
    if labels[1]:
        out.append(text(x0 + w + dx / 2 + 14, y0 + h - dy / 2 + 14, labels[1], 13, weight="bold"))
    if labels[2]:
        out.append(text(x0 - 6, y0 + h / 2 + 5, labels[2], 13, "end", "bold"))
    return svg(_n(W or (w + dx + 60)), _n(y0 + h + 28), "".join(out))


def _prism_pts(n, r, ry, cx, cy):
    return [(cx + r * math.cos(math.radians(90 + 360 * k / n)), cy + ry * math.sin(math.radians(90 + 360 * k / n))) for k in range(n)]


def prism_fig(n, h=60, r=34, label=None, W=None):
    """n각기둥 (뒤쪽 모서리는 점선). 밑면은 납작한 타원 배치로 그린다."""
    ry = r * 0.38
    cx = r + 14
    ybot = 14 + h + ry
    bot = _prism_pts(n, r, ry, cx, ybot)
    top = [(x, y - h) for x, y in bot]
    # 뒤쪽 꼭짓점(화면에서 위쪽에 있는 것): y 작은 것
    back = [k for k in range(n) if bot[k][1] < ybot - 0.2 * ry]
    out = []
    for k in range(n):
        k2 = (k + 1) % n
        hid = k in back and k2 in back
        out.append(f'<line x1="{_n(bot[k][0])}" y1="{_n(bot[k][1])}" x2="{_n(bot[k2][0])}" y2="{_n(bot[k2][1])}" {DASH if hid else ST}/>')
        v_hidden = k in back and (k not in (min(back, key=lambda t: bot[t][0]), max(back, key=lambda t: bot[t][0])) if len(back) > 2 else False)
        out.append(f'<line x1="{_n(bot[k][0])}" y1="{_n(bot[k][1])}" x2="{_n(top[k][0])}" y2="{_n(top[k][1])}" {DASH if (k in back and len(back) >= 2 and k not in (min(back, key=lambda t: bot[t][0]), max(back, key=lambda t: bot[t][0]))) or (n == 3 and k == back[0] if back else False) else ST}/>')
    out.append(f'<polygon points="{P(top)}" fill="{BLUE}" fill-opacity="0.2" {ST}/>')
    if label:
        out.append(text(cx, ybot + ry + 22, label, 14, weight="bold"))
    return svg(_n(W or (2 * r + 28)), _n(ybot + ry + (32 if label else 12)), "".join(out))


def pyramid_fig(n, h=64, r=34, label=None):
    ry = r * 0.38
    cx = r + 14
    ybot = 14 + h + ry
    bot = _prism_pts(n, r, ry, cx, ybot)
    apex = (cx, 14)
    back = [k for k in range(n) if bot[k][1] < ybot - 0.2 * ry]
    out = []
    for k in range(n):
        k2 = (k + 1) % n
        hid = k in back and k2 in back
        out.append(f'<line x1="{_n(bot[k][0])}" y1="{_n(bot[k][1])}" x2="{_n(bot[k2][0])}" y2="{_n(bot[k2][1])}" {DASH if hid else ST}/>')
        mid_back = len(back) >= 3 and k in back and k not in (min(back, key=lambda t: bot[t][0]), max(back, key=lambda t: bot[t][0]))
        hidn = mid_back or (n == 3 and k in back)
        out.append(f'<line x1="{_n(bot[k][0])}" y1="{_n(bot[k][1])}" x2="{_n(apex[0])}" y2="{_n(apex[1])}" {DASH if hidn else ST}/>')
    if label:
        out.append(text(cx, ybot + ry + 22, label, 14, weight="bold"))
    return svg(_n(2 * r + 28), _n(ybot + ry + (32 if label else 12)), "".join(out))


def cone_fig(h=64, r=32, label=None):
    ry = r * 0.35
    cx = r + 14
    ybot = 14 + h
    out = [f'<path d="M{_n(cx - r)},{_n(ybot)} L{_n(cx)},14 L{_n(cx + r)},{_n(ybot)}" fill="none" {ST}/>',
           f'<path d="M{_n(cx - r)},{_n(ybot)} A{r},{_n(ry)} 0 0 0 {_n(cx + r)},{_n(ybot)}" fill="none" {ST}/>',
           f'<path d="M{_n(cx - r)},{_n(ybot)} A{r},{_n(ry)} 0 0 1 {_n(cx + r)},{_n(ybot)}" fill="none" {DASH}/>']
    if label:
        out.append(text(cx, ybot + ry + 24, label, 14, weight="bold"))
    return svg(_n(2 * r + 28), _n(ybot + ry + (34 if label else 14)), "".join(out))


def cyl_fig(h=64, r=30, label=None, rtxt=None, htxt=None):
    ry = r * 0.35
    cx = r + 22
    ytop = 14 + ry
    ybot = ytop + h
    out = [f'<path d="M{_n(cx - r)},{_n(ytop)} L{_n(cx - r)},{_n(ybot)} A{r},{_n(ry)} 0 0 0 {_n(cx + r)},{_n(ybot)} L{_n(cx + r)},{_n(ytop)}" fill="none" {ST}/>',
           f'<path d="M{_n(cx - r)},{_n(ybot)} A{r},{_n(ry)} 0 0 1 {_n(cx + r)},{_n(ybot)}" fill="none" {DASH}/>',
           f'<ellipse cx="{_n(cx)}" cy="{_n(ytop)}" rx="{r}" ry="{_n(ry)}" fill="{BLUE}" fill-opacity="0.2" {ST}/>']
    if rtxt:
        out.append(line(cx, ytop, cx + r, ytop, 2.5, color=ORANGE) + text(cx + r / 2, ytop + ry + 16, rtxt, 12, weight="bold"))
    if htxt:
        out.append(line(cx + r + 10, ytop, cx + r + 10, ybot, 2.5, color=ORANGE) + text(cx + r + 16, (ytop + ybot) / 2 + 5, htxt, 12, "start", "bold"))
    if label:
        out.append(text(cx, ybot + ry + 22, label, 14, weight="bold"))
    return svg(_n(2 * r + (80 if htxt else 44)), _n(ybot + ry + (32 if label else 14)), "".join(out))


def sphere_fig(r=34, label=None, rtxt=None):
    cx = cy = r + 12
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" {ST}/>',
           f'<path d="M{cx - r},{cy} A{r},{_n(r * 0.3)} 0 0 0 {cx + r},{cy}" fill="none" {ST}/>',
           f'<path d="M{cx - r},{cy} A{r},{_n(r * 0.3)} 0 0 1 {cx + r},{cy}" fill="none" {DASH}/>',
           f'<circle cx="{cx}" cy="{cy}" r="3.5" fill="{C}"/>']
    if rtxt:
        out.append(line(cx, cy, cx + r, cy, 2.5, color=ORANGE) + text(cx + r / 2, cy - 6, rtxt, 12, weight="bold"))
    if label:
        out.append(text(cx, 2 * cy + 22, label, 14, weight="bold"))
    return svg(2 * r + 24, 2 * r + (48 if label else 24), "".join(out))


def net_cells(cells, g=26, labels=None):
    """칸 전개도(정육면체용). cells: [(열, 행)] 정사각형 칸. labels {(열,행): 글자}"""
    cs = max(c for c, r in cells) + 1
    rs = max(r for c, r in cells) + 1
    out = []
    for (c, r) in cells:
        out.append(f'<rect x="{4 + c * g}" y="{4 + r * g}" width="{g}" height="{g}" fill="{BLUE}" fill-opacity="0.22" {ST}/>')
        if labels and (c, r) in labels:
            out.append(text(4 + c * g + g / 2, 4 + r * g + g / 2 + 5, labels[(c, r)], 14, weight="bold"))
    return svg(cs * g + 8, rs * g + 8, "".join(out))


def net_cuboid(a, b, c, s=18, names=True, fills=None):
    """직육면체 전개도(십자 모양): 가운데 줄에 앞(a×c), 오른쪽(b×c), 뒤(a×c), 왼쪽(b×c), 앞 위·아래에 윗면·밑면(a×b). a=가로 b=깊이 c=높이"""
    A, B, Cc = a * s, b * s, c * s
    x0, y0 = 6, 6
    # 가운데 줄 시작: 왼쪽면(b), 앞(a), 오른쪽면(b), 뒤(a)
    xs = [x0, x0 + B, x0 + B + A, x0 + 2 * B + A]
    ym = y0 + B
    rects = [
        (xs[0], ym, B, Cc, "옆"), (xs[1], ym, A, Cc, "앞"), (xs[2], ym, B, Cc, "옆"), (xs[3], ym, A, Cc, "뒤"),
        (xs[1], y0, A, B, "위"), (xs[1], ym + Cc, A, B, "아래"),
    ]
    out = []
    for i, (x, y, w, h, nm) in enumerate(rects):
        out.append(f'<rect x="{_n(x)}" y="{_n(y)}" width="{_n(w)}" height="{_n(h)}" fill="{BLUE}" fill-opacity="0.18" {ST}/>')
        if names:
            out.append(text(x + w / 2, y + h / 2 + 5, nm, 13, weight="bold"))
    W = x0 * 2 + 2 * A + 2 * B
    H = y0 * 2 + 2 * B + Cc
    return svg(_n(W), _n(H), "".join(out))


def net_prism(n, base_side, h, s=16, txt=None):
    """n각기둥 전개도(정n각기둥, 밑면은 윗쪽 한 개·아래 한 개를 같은 변에 붙임). 옆면 n개를 가로로 나열.
    txt={'side': '3 cm', 'h': '5 cm'} 로 길이 표시. 밑면은 작은 n각형으로 그림."""
    bw, bh = base_side * s, h * s
    x0, y0 = 6, 56
    out = []
    for k in range(n):
        out.append(f'<rect x="{_n(x0 + k * bw)}" y="{y0}" width="{_n(bw)}" height="{_n(bh)}" fill="{BLUE}" fill-opacity="0.15" {ST}/>')
    # 밑면 두 개
    r = max(bw * 0.55, 18)
    for (cx, cy) in ((x0 + bw * 0.5 + 0 * bw, y0 - r - 2), (x0 + bw * 0.5 + 0 * bw, y0 + bh + r + 2)):
        pts = [(cx + r * math.cos(math.radians(-90 + 360 * k / n)), cy + r * math.sin(math.radians(-90 + 360 * k / n))) for k in range(n)]
        out.append(f'<polygon points="{P(pts)}" fill="{ORANGE}" fill-opacity="0.3" {ST}/>')
    if txt:
        if "side" in txt:
            out.append(text(x0 + bw / 2, y0 + bh / 2 + 5, txt["side"], 12, weight="bold"))
        if "h" in txt:
            out.append(text(x0 + n * bw + 8, y0 + bh / 2 + 5, txt["h"], 12, "start", "bold"))
    W = x0 + n * bw + (46 if txt and "h" in txt else 10)
    H = y0 + bh + 2 * r + 12
    return svg(_n(W), _n(H), "".join(out))


def net_cylinder(r, h, s=10, labels=True):
    """원기둥 전개도: 가운데 직사각형(가로=밑면 둘레, 세로=높이) 위·아래에 원"""
    R = r * s
    L = 2 * math.pi * R
    hh = h * s
    x0, y0 = 8, 8
    out = [f'<rect x="{x0}" y="{_n(y0 + 2 * R + 4)}" width="{_n(L)}" height="{_n(hh)}" fill="{BLUE}" fill-opacity="0.15" {ST}/>',
           f'<circle cx="{_n(x0 + R + 6)}" cy="{_n(y0 + R)}" r="{_n(R)}" fill="{ORANGE}" fill-opacity="0.3" {ST}/>',
           f'<circle cx="{_n(x0 + R + 6)}" cy="{_n(y0 + 2 * R + 4 + hh + R + 4)}" r="{_n(R)}" fill="{ORANGE}" fill-opacity="0.3" {ST}/>']
    if labels:
        out.append(text(x0 + L / 2, y0 + 2 * R + 4 + hh / 2 + 5, "옆면", 13, weight="bold"))
    return svg(_n(L + 2 * x0), _n(y0 * 2 + 4 * R + hh + 8), "".join(out))


def _right(b, a, c, s=9):
    def un(p, q):
        d = math.hypot(q[0] - p[0], q[1] - p[1])
        return (q[0] - p[0]) / d, (q[1] - p[1]) / d
    u1, u2 = un(b, a), un(b, c)
    p1 = (b[0] + s * u1[0], b[1] + s * u1[1]); p3 = (b[0] + s * u2[0], b[1] + s * u2[1])
    p2 = (b[0] + s * (u1[0] + u2[0]), b[1] + s * (u1[1] + u2[1]))
    return f'<polyline points="{P([p1, p2, p3])}" fill="none" stroke="{C}" stroke-width="2"/>'


def area_fig(kind, base, h, s=16, texts=None, extra=None, fill=True):
    """넓이 도형: parallelogram / triangle / trapezoid(extra=윗변) / rhombus(extra=다른 대각선) / rect.
    texts={'base':'6 cm','h':'4 cm','top':'3 cm','d1':'..','d2':'..'}"""
    texts = texts or {}
    bw, hh = base * s, h * s
    x0, y0 = 30, 28
    fo = f' fill="{BLUE}" fill-opacity="0.18"' if fill else ' fill="none"'
    out = []
    if kind == "parallelogram":
        sh = bw * 0.35
        pts = [(x0 + sh, y0), (x0 + sh + bw, y0), (x0 + bw, y0 + hh), (x0, y0 + hh)]
        out.append(f'<polygon points="{P(pts)}"{fo} {ST}/>')
        hx = x0 + sh
        out.append(f'<line x1="{_n(hx)}" y1="{y0}" x2="{_n(hx)}" y2="{_n(y0 + hh)}" {DASH}/>')
        out.append(_right((hx, y0 + hh), (hx, y0), (hx + 20, y0 + hh)))
        W = x0 + sh + bw + 30
        bx, hx2 = (x0 + bw / 2, y0 + hh + 20), (hx + 6, y0 + hh / 2 + 5)
        ha = "start"
    elif kind == "triangle":
        ap = x0 + bw * 0.12
        pts = [(ap, y0), (x0 + bw, y0 + hh), (x0, y0 + hh)]
        out.append(f'<polygon points="{P(pts)}"{fo} {ST}/>')
        out.append(f'<line x1="{_n(ap)}" y1="{y0}" x2="{_n(ap)}" y2="{_n(y0 + hh)}" {DASH}/>')
        out.append(_right((ap, y0 + hh), (ap, y0), (ap + 20, y0 + hh)))
        W = x0 + bw + 30
        bx, hx2 = (x0 + bw / 2, y0 + hh + 20), (ap + 6, y0 + hh / 2 + 5)
        ha = "start"
    elif kind == "trapezoid":
        tw = (extra or base * 0.5) * s
        off = (bw - tw) / 2 - 8
        pts = [(x0 + off, y0), (x0 + off + tw, y0), (x0 + bw, y0 + hh), (x0, y0 + hh)]
        out.append(f'<polygon points="{P(pts)}"{fo} {ST}/>')
        hx = x0 + off + tw
        out.append(f'<line x1="{_n(hx)}" y1="{y0}" x2="{_n(hx)}" y2="{_n(y0 + hh)}" {DASH}/>')
        out.append(_right((hx, y0 + hh), (hx, y0), (hx + 20, y0 + hh)))
        out.append(text(x0 + off + tw / 2, y0 - 6, texts.get("top", ""), 13, weight="bold"))
        W = x0 + bw + 30
        bx, hx2 = (x0 + bw / 2, y0 + hh + 20), (hx - 6, y0 + hh / 2 + 5)
        ha = "end"
    elif kind == "rhombus":
        d2 = (extra or base) * s
        cx, cy = x0 + bw / 2, y0 + hh / 2
        pts = [(cx, y0), (cx + d2 / 2, cy), (cx, y0 + hh), (cx - d2 / 2, cy)]
        # base=한 대각선(가로), h=다른 대각선(세로)
        pts = [(cx, cy - hh / 2), (cx + bw / 2, cy), (cx, cy + hh / 2), (cx - bw / 2, cy)]
        out.append(f'<polygon points="{P(pts)}"{fo} {ST}/>')
        out.append(f'<line x1="{_n(cx - bw / 2)}" y1="{_n(cy)}" x2="{_n(cx + bw / 2)}" y2="{_n(cy)}" {DASH}/>')
        out.append(f'<line x1="{_n(cx)}" y1="{_n(cy - hh / 2)}" x2="{_n(cx)}" y2="{_n(cy + hh / 2)}" {DASH}/>')
        out.append(_right((cx, cy), (cx, cy - 12), (cx + 12, cy)))
        W = x0 + bw + 60
        bx, hx2 = (cx, cy + hh / 2 + 20), (cx - 8, cy - hh / 4)
        out.append(text(cx + bw / 2 + 6, cy + 5, texts.get("d1", ""), 13, "start", "bold"))
        out.append(text(cx + 8, cy - hh / 2 - 4, texts.get("d2", ""), 13, "start", "bold"))
        return svg(_n(W), _n(y0 + hh + 28), "".join(out))
    else:  # rect
        out.append(f'<rect x="{x0}" y="{y0}" width="{_n(bw)}" height="{_n(hh)}"{fo} {ST}/>')
        out.append(_right((x0, y0 + hh), (x0, y0), (x0 + 20, y0 + hh)))
        W = x0 + bw + 30
        bx, hx2 = (x0 + bw / 2, y0 + hh + 20), (x0 - 8, y0 + hh / 2 + 5)
        ha = "end"
    if texts.get("base"):
        out.append(text(bx[0], bx[1], texts["base"], 13, weight="bold"))
    if texts.get("h"):
        out.append(text(hx2[0], hx2[1], texts["h"], 13, ha, "bold"))
    return svg(_n(W), _n(y0 + hh + 30), "".join(out))


def circle_r(r_txt=None, d_txt=None, R=46, shade=False, extra_txt=None):
    cx = cy = R + 14
    out = [f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="{BLUE if shade else "none"}" fill-opacity="0.2" {ST}/>']
    if r_txt:
        out.append(line(cx, cy, cx + R, cy, 3, color=ORANGE) + text(cx + R / 2, cy - 7, r_txt, 13, weight="bold"))
    if d_txt:
        out.append(line(cx - R, cy + 0, cx + R, cy, 3, color=ORANGE) + text(cx, cy - 8, d_txt, 13, weight="bold"))
    out.append(f'<circle cx="{cx}" cy="{cy}" r="3.5" fill="{C}"/>')
    if extra_txt:
        out.append(text(cx, cy + R + 22, extra_txt, 13, weight="bold"))
    return svg(2 * R + 28, 2 * R + 28 + (24 if extra_txt else 0), "".join(out))


# ── 대칭 ────────────────────────────────────────────────
def sym_shape(kind, size=60):
    """대칭 판별용 도형: iso(이등변삼각형) rect(직사각형) para(평행사변형) trap(등변사다리꼴) rhomb(마름모) circle square scalene(부등변삼각형) arrow(화살표) letterL"""
    s = size
    c = s / 2
    f = f'fill="{BLUE}" fill-opacity="0.2" {ST}'
    if kind == "iso":
        d = f'<polygon points="{c},6 {s - 6},{s - 6} 6,{s - 6}" {f}/>'
    elif kind == "rect":
        d = f'<rect x="4" y="14" width="{s - 8}" height="{s - 28}" {f}/>'
    elif kind == "square":
        d = f'<rect x="10" y="10" width="{s - 20}" height="{s - 20}" {f}/>'
    elif kind == "para":
        d = f'<polygon points="18,14 {s - 4},14 {s - 18},{s - 14} 4,{s - 14}" {f}/>'
    elif kind == "trap":
        d = f'<polygon points="18,14 {s - 18},14 {s - 4},{s - 14} 4,{s - 14}" {f}/>'
    elif kind == "rhomb":
        d = f'<polygon points="{c},4 {s - 6},{c} {c},{s - 4} 6,{c}" {f}/>'
    elif kind == "circle":
        d = f'<circle cx="{c}" cy="{c}" r="{c - 6}" {f}/>'
    elif kind == "scalene":
        d = f'<polygon points="10,8 {s - 4},{s - 10} 6,{s - 6}" {f}/>'
    elif kind == "arrow":
        d = f'<polygon points="4,{c - 8} {c + 4},{c - 8} {c + 4},6 {s - 4},{c} {c + 4},{s - 6} {c + 4},{c + 8} 4,{c + 8}" {f}/>'
    elif kind == "L":
        d = f'<polygon points="10,6 26,6 26,{s - 24} {s - 8},{s - 24} {s - 8},{s - 6} 10,{s - 6}" {f}/>'
    elif kind == "hexagon":
        pts = [(c + (c - 6) * math.cos(math.radians(60 * k)), c + (c - 6) * math.sin(math.radians(60 * k))) for k in range(6)]
        d = f'<polygon points="{P(pts)}" {f}/>'
    else:
        raise ValueError(kind)
    return svg(s, s, d)


def cong_pair(P1, P2, names1=None, names2=None, W=None, H=None):
    """합동인 두 도형을 한 그림에: 각각 꼭짓점 목록(좌표). names는 꼭짓점 이름(ㄱㄴㄷ…)"""
    xs = [x for x, _ in P1 + P2]
    ys = [y for _, y in P1 + P2]
    ox, oy = 24 - min(xs), 24 - min(ys)
    out = []
    for pts, names in ((P1, names1), (P2, names2)):
        Q = [(x + ox, y + oy) for x, y in pts]
        out.append(f'<polygon points="{P(Q)}" fill="{BLUE}" fill-opacity="0.15" {ST}/>')
        if names:
            cx = sum(q[0] for q in Q) / len(Q)
            cy = sum(q[1] for q in Q) / len(Q)
            for q, nm in zip(Q, names):
                dx, dy = q[0] - cx, q[1] - cy
                L = math.hypot(dx, dy) or 1
                out.append(text(q[0] + dx / L * 14, q[1] + dy / L * 14 + 5, nm, 14, weight="bold"))
    return svg(_n(W or (max(xs) - min(xs) + 48)), _n(H or (max(ys) - min(ys) + 48)), "".join(out))


def stack_cells(grid):
    """grid[행(앞→뒤)][열(왼→오)] = 높이 → blocks()에 쓸 (x,y,z) 집합. y=0이 맨 앞줄"""
    cells = set()
    for y, row in enumerate(grid):
        for x, hgt in enumerate(row):
            for z in range(hgt):
                cells.add((x, y, z))
    return cells


def top_grid(grid, g=34, hide=None, title=None):
    """위에서 본 모양: 각 칸에 쌓은 개수. grid[0]이 맨 앞줄(그림에서는 아래쪽). hide=(행,열)이면 ? 표시"""
    rows, cols = len(grid), len(grid[0])
    out = []
    for yi, row in enumerate(grid):
        ry = rows - 1 - yi  # 앞줄이 아래
        for xi, v in enumerate(row):
            if v == 0:
                continue
            out.append(f'<rect x="{4 + xi * g}" y="{4 + ry * g}" width="{g}" height="{g}" fill="{BLUE}" fill-opacity="0.22" {ST}/>')
            lab = "?" if hide == (yi, xi) else str(v)
            out.append(text(4 + xi * g + g / 2, 4 + ry * g + g / 2 + 6, lab, 17, weight="bold"))
    H = rows * g + 8 + (22 if title else 0)
    if title:
        out.append(text(4 + cols * g / 2, H - 6, title, 14, weight="bold"))
    return svg(cols * g + 8, H, "".join(out))


def skyline(heights, g=26, title=None):
    """앞(또는 옆)에서 본 모양: 열마다 쌓인 높이"""
    cols = len(heights)
    mh = max(heights)
    out = []
    for xi, hgt in enumerate(heights):
        for z in range(hgt):
            out.append(f'<rect x="{4 + xi * g}" y="{4 + (mh - 1 - z) * g}" width="{g}" height="{g}" fill="{BLUE}" fill-opacity="0.22" {ST}/>')
    H = mh * g + 8 + (22 if title else 0)
    if title:
        out.append(text(4 + cols * g / 2, H - 6, title, 14, weight="bold"))
    return svg(cols * g + 8, H, "".join(out))


def l_shape(a, b, c, d, s=14, labels=True):
    """ㄱ자(L) 모양: 가로 a, 세로 b인 큰 직사각형에서 오른쪽 위를 가로 c, 세로 d만큼 잘라 낸 도형. 변 길이를 표시"""
    x0, y0 = 52, 26
    A, B, Cc, Dd = a * s, b * s, c * s, d * s
    pts = [(x0, y0), (x0 + A - Cc, y0), (x0 + A - Cc, y0 + Dd), (x0 + A, y0 + Dd), (x0 + A, y0 + B), (x0, y0 + B)]
    out = [f'<polygon points="{P(pts)}" fill="{BLUE}" fill-opacity="0.18" {ST}/>']
    if labels:
        out.append(text(x0 + A / 2, y0 + B + 18, f"{a} cm", 13, weight="bold"))
        out.append(text(x0 - 6, y0 + B / 2 + 5, f"{b} cm", 13, "end", "bold"))
        out.append(text(x0 + (A - Cc) / 2, y0 - 6, f"{a - c} cm", 13, weight="bold"))
        out.append(text(x0 + A - Cc - 6, y0 + Dd / 2 + 5, f"{d} cm", 13, "end", "bold"))
        out.append(text(x0 + A - Cc / 2, y0 + Dd - 6, f"{c} cm", 13, weight="bold"))
        out.append(text(x0 + A + 6, y0 + Dd + (B - Dd) / 2 + 5, f"{b - d} cm", 13, "start", "bold"))
    return svg(_n(x0 + A + 62), _n(y0 + B + 30), "".join(out))


def rect_fig(w, h, wt=None, ht=None, s=16, fill=True):
    x0, y0 = 40, 16
    out = [f'<rect x="{x0}" y="{y0}" width="{_n(w * s)}" height="{_n(h * s)}" fill="{BLUE if fill else "none"}" fill-opacity="0.18" {ST}/>']
    if wt:
        out.append(text(x0 + w * s / 2, y0 + h * s + 18, wt, 13, weight="bold"))
    if ht:
        out.append(text(x0 - 6, y0 + h * s / 2 + 5, ht, 13, "end", "bold"))
    return svg(_n(x0 + w * s + 16), _n(y0 + h * s + 30), "".join(out))
