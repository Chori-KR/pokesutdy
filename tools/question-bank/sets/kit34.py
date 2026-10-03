"""초3-4 도형과 측정 묶음에서 쓰는 그림 도구.
svgkit.py 규칙: viewBox만, 글자 12 이상, 선 2 이상, 배경 없음, currentColor + 파랑/주황만, 색만으로 구분하지 않기."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, shape, BLUE, ORANGE, C, _n
from kit12 import poly, circ, ST, clock, seg_bars


def dot(x, y, r=4, fill=None):
    return f'<circle cx="{_n(x)}" cy="{_n(y)}" r="{r}" fill="{fill or C}"/>'


def arrow_head(x, y, ang, size=9, color=C):
    """(x,y)가 화살촉 끝, ang(도)는 진행 방향(0=오른쪽, 90=아래쪽)"""
    a = math.radians(ang)
    p1 = (x - size * math.cos(a - 0.45), y - size * math.sin(a - 0.45))
    p2 = (x - size * math.cos(a + 0.45), y - size * math.sin(a + 0.45))
    return (f'<polyline points="{_n(p1[0])},{_n(p1[1])} {_n(x)},{_n(y)} {_n(p2[0])},{_n(p2[1])}" fill="none" '
            f'stroke="{color}" stroke-width="2.5" stroke-linejoin="round"/>')


def hold(items, gap=14, pad=4, cols=None):
    """(svg 문자열, 이름) 여러 개를 늘어놓고 아래에 이름. cols를 주면 그 개수마다 줄을 바꾼다"""
    import re
    parts = []
    for it in items:
        sv, nm = it if isinstance(it, tuple) else (it, None)
        m = re.match(r'<svg viewBox="0 0 ([\d.]+) ([\d.]+)"[^>]*>(.*)</svg>$', sv, re.S)
        parts.append((float(m.group(1)), float(m.group(2)), m.group(3), nm))
    has = any(n for *_, n in parts)
    cols = cols or len(parts)
    rows = [parts[k:k + cols] for k in range(0, len(parts), cols)]
    rw = [sum(w for w, *_ in r) + gap * (len(r) - 1) for r in rows]
    W = max(rw) + 2 * pad
    out = []
    y = 0
    for r, wr in zip(rows, rw):
        rh = max(h for _, h, _, _ in r) + (24 if has else 0)
        x = pad + (W - 2 * pad - wr) / 2
        for w, h, body, nm in r:
            out.append(f'<g transform="translate({_n(x)} {_n(y + (rh - (24 if has else 0) - h) / 2)})">{body}</g>')
            if nm:
                out.append(text(x + w / 2, y + rh - 6, nm, 14, weight="bold"))
            x += w + gap
        y += rh + 4
    return svg(_n(W), _n(y - 4), "".join(out))


# ── 직선·반직선·선분 ───────────────────────────────────
def lineobj(kind, la="ㄱ", lb="ㄴ", W=160, H=60, tilt=0):
    """kind: 선분 / 반직선 / 직선 / 반직선_반대(ㄴ에서 시작해 ㄱ쪽으로)"""
    y = H / 2
    out = []
    x1, x2 = 40, W - 40
    if kind == "선분":
        out.append(line(x1, y, x2, y, 3) + dot(x1, y) + dot(x2, y))
    elif kind == "반직선":
        out.append(line(x1, y, W - 12, y, 3) + arrow_head(W - 8, y, 0) + dot(x1, y) + dot(x2, y))
    elif kind == "반직선_반대":
        out.append(line(12, y, x2, y, 3) + arrow_head(8, y, 180) + dot(x1, y) + dot(x2, y))
    elif kind == "직선":
        out.append(line(12, y, W - 12, y, 3) + arrow_head(8, y, 180) + arrow_head(W - 8, y, 0) + dot(x1, y) + dot(x2, y))
    elif kind == "곡선":
        out.append(f'<path d="M{x1},{y} Q{(x1 + x2) / 2},{y - 40} {x2},{y}" fill="none" stroke="{C}" stroke-width="3"/>' + dot(x1, y) + dot(x2, y))
    out.append(text(x1, y + 22, la, 14, weight="bold") + text(x2, y + 22, lb, 14, weight="bold"))
    s = "".join(out)
    if tilt:
        s = f'<g transform="rotate({tilt} {W / 2} {H / 2})">{s}</g>'
    return svg(W, H, s)


# ── 각 ─────────────────────────────────────────────────
def angle_fig(deg, rot=0, L=78, label=None, vertex_label=None, right_mark=True, size=110, arc=True, flip=False):
    """꼭짓점 왼쪽 아래. 한 변은 rot(도) 방향(수평 오른쪽=0, 반시계 +), 다른 변은 rot+deg 방향"""
    cx, cy = size * 0.3, size * 0.78
    def end(a):
        r = math.radians(a)
        return cx + L * math.cos(r), cy - L * math.sin(r)
    a1, a2 = rot, rot + deg
    if flip:
        a1, a2 = 180 - a1, 180 - a2
    e1, e2 = end(a1), end(a2)
    out = [line(cx, cy, *e1, 3), line(cx, cy, *e2, 3), dot(cx, cy, 4)]
    if deg == 90 and right_mark:
        s = 16
        u1 = (math.cos(math.radians(a1)), -math.sin(math.radians(a1)))
        u2 = (math.cos(math.radians(a2)), -math.sin(math.radians(a2)))
        p1 = (cx + s * u1[0], cy + s * u1[1])
        p3 = (cx + s * u2[0], cy + s * u2[1])
        p2 = (cx + s * (u1[0] + u2[0]), cy + s * (u1[1] + u2[1]))
        out.append(f'<polyline points="{_n(p1[0])},{_n(p1[1])} {_n(p2[0])},{_n(p2[1])} {_n(p3[0])},{_n(p3[1])}" fill="none" stroke="{C}" stroke-width="2"/>')
    elif arc:
        r = 24
        s1, s2 = (a1, a2) if not flip else (a2, a1)
        pa = (cx + r * math.cos(math.radians(a1)), cy - r * math.sin(math.radians(a1)))
        pb = (cx + r * math.cos(math.radians(a2)), cy - r * math.sin(math.radians(a2)))
        sweep = 0 if not flip else 1
        out.append(f'<path d="M{_n(pa[0])},{_n(pa[1])} A{r},{r} 0 {1 if deg > 180 else 0} {sweep} {_n(pb[0])},{_n(pb[1])}" fill="none" stroke="{BLUE}" stroke-width="2.5"/>')
    if vertex_label:
        out.append(text(cx - 12, cy + 18, vertex_label, 14, weight="bold"))
    W = size + 40
    return svg(W, size, "".join(out))


def angles_row(items, names=None):
    """items: [(deg, rot, flip)] 또는 deg"""
    figs = []
    for i, it in enumerate(items):
        if isinstance(it, tuple):
            deg, rot, *rest = it
            fl = rest[0] if rest else False
        else:
            deg, rot, fl = it, 0, False
        figs.append((angle_fig(deg, rot, flip=fl, size=96, L=62), names[i] if names else None))
    return hold(figs, gap=0, cols=3 if len(figs) > 3 else None)


# ── 수직·평행 ───────────────────────────────────────────
def ext_line(p, q, ext=14, arrows=True):
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    a = (p[0] - ux * ext, p[1] - uy * ext)
    b = (q[0] + ux * ext, q[1] + uy * ext)
    s = line(a[0], a[1], b[0], b[1], 2.5)
    if arrows:
        s += arrow_head(a[0], a[1], math.degrees(math.atan2(-uy, -ux)), 8)
        s += arrow_head(b[0], b[1], math.degrees(math.atan2(uy, ux)), 8)
    return s


def lines_fig(lines, W=None, H=None, names_pos=None, marks=()):
    """lines: {이름: (p, q)}. marks: [(교점 x, y, 방향1 각도, 방향2 각도)] 직각 표시.
    그림 크기는 직선들이 차지하는 범위에 맞춰 자동으로 정한다(이름 글자가 잘리지 않게 여백)."""
    xs = [pt[0] for p, q in lines.values() for pt in (p, q)]
    ys = [pt[1] for p, q in lines.values() for pt in (p, q)]
    mx, my = 36 - min(xs), 36 - min(ys)
    W = max(xs) - min(xs) + 72
    H = max(ys) - min(ys) + 72
    out = []
    g = []
    for nm, (p, q) in lines.items():
        P = (p[0] + mx, p[1] + my)
        Q = (q[0] + mx, q[1] + my)
        g.append(ext_line(P, Q))
        dx, dy = Q[0] - P[0], Q[1] - P[1]
        L = math.hypot(dx, dy)
        ux, uy = dx / L, dy / L
        lx, ly = Q[0] + ux * 30 - uy * 4, Q[1] + uy * 30 + ux * 4
        if names_pos and nm in names_pos:
            lx, ly = names_pos[nm][0] + mx, names_pos[nm][1] + my
        g.append(text(lx, ly + 5, nm, 14, weight="bold"))
    out += g
    for (x, y, a1, a2) in marks:
        x, y = x + mx, y + my
        s_ = 12
        u1 = (math.cos(math.radians(a1)), -math.sin(math.radians(a1)))
        u2 = (math.cos(math.radians(a2)), -math.sin(math.radians(a2)))
        p1 = (x + s_ * u1[0], y + s_ * u1[1]); p3 = (x + s_ * u2[0], y + s_ * u2[1])
        p2 = (x + s_ * (u1[0] + u2[0]), y + s_ * (u1[1] + u2[1]))
        out.append(f'<polyline points="{_n(p1[0])},{_n(p1[1])} {_n(p2[0])},{_n(p2[1])} {_n(p3[0])},{_n(p3[1])}" fill="none" stroke="{C}" stroke-width="2"/>')
    return svg(_n(W), _n(H), "".join(out))


# ── 밀기·뒤집기·돌리기 (모눈 위 도형) ────────────────────
BASE = [(0, 0), (2, 0), (2, 1), (1, 1), (1, 3), (0, 3)]     # ㄴ자 모양
MARK = (0.5, 0.5)                                           # 표시점(모서리 한쪽)


def t_slide(pts, dx, dy):
    return [(x + dx, y + dy) for x, y in pts]


def t_flip_lr(pts, ax):
    return [(2 * ax - x, y) for x, y in pts]


def t_flip_ud(pts, ay):
    return [(x, 2 * ay - y) for x, y in pts]


def t_rot(pts, c, deg):
    """시계 방향 deg(90 단위) 돌리기 (화면 좌표 y 아래쪽)"""
    out = []
    for x, y in pts:
        dx, dy = x - c[0], y - c[1]
        for _ in range((deg // 90) % 4):
            dx, dy = -dy, dx
        out.append((c[0] + dx, c[1] + dy))
    return out


def grid_panel(shapes, cols, rows, g=22, marks=None, label=None, axes=None):
    """shapes: [(pts, 'o'|'f')] o=테두리만, f=채움. marks: 각 도형의 표시점(원). axes: [('v', x)] 점선"""
    W, H = cols * g + 8, rows * g + 8
    out = []
    for c in range(cols + 1):
        out.append(line(4 + c * g, 4, 4 + c * g, 4 + rows * g, 2, 0.2))
    for r in range(rows + 1):
        out.append(line(4, 4 + r * g, 4 + cols * g, 4 + r * g, 2, 0.2))
    for i, (pts, st) in enumerate(shapes):
        P = [(4 + x * g, 4 + y * g) for x, y in pts]
        fill = BLUE if st == "f" else "none"
        out.append(poly(P, fill, 0.4 if st == "f" else None))
        if marks:
            mx, my = marks[i]
            out.append(f'<circle cx="{_n(4 + mx * g)}" cy="{_n(4 + my * g)}" r="4.5" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
    for (k, v) in (axes or []):
        if k == "v":
            out.append(line(4 + v * g, 0, 4 + v * g, H, 2.5, None, "6 4", color=ORANGE))
        else:
            out.append(line(0, 4 + v * g, W, 4 + v * g, 2.5, None, "6 4", color=ORANGE))
    return svg(W, H, "".join(out))


def shape_mark(pts):
    """ㄴ자 도형의 표시점: 첫 칸 중심 (변환을 따라 이동). 도형 좌표를 같은 변환에 넣어 사용"""
    return MARK


# ── 좌표·점의 이동 ───────────────────────────────────────
def move_grid(cols, rows, pts, path=None, g=30, show_nums=False):
    """pts: {이름: (열, 행)} (행은 위에서부터), path: [(c,r),...] 화살표 이동 경로"""
    W, H = (cols - 1) * g + 50, (rows - 1) * g + 50
    o = 25
    out = []
    for c in range(cols):
        out.append(line(o + c * g, o, o + c * g, o + (rows - 1) * g, 2, 0.25))
    for r in range(rows):
        out.append(line(o, o + r * g, o + (cols - 1) * g, o + r * g, 2, 0.25))
    if path:
        for (a, b) in zip(path, path[1:]):
            x1, y1, x2, y2 = o + a[0] * g, o + a[1] * g, o + b[0] * g, o + b[1] * g
            out.append(line(x1, y1, x2, y2, 3.5, color=BLUE))
            out.append(arrow_head(x2, y2, math.degrees(math.atan2(y2 - y1, x2 - x1)), 10, BLUE))
    for nm, (c, r) in pts.items():
        out.append(dot(o + c * g, o + r * g, 5.5, ORANGE) + f'<circle cx="{o + c * g}" cy="{o + r * g}" r="5.5" fill="none" stroke="{C}" stroke-width="2"/>')
        out.append(text(o + c * g + 12, o + r * g - 8, nm, 14, weight="bold"))
    return svg(W, H, "".join(out))


# ── 원 ──────────────────────────────────────────────────
def circle_fig(r=62, show=("center",), names=None, W=190, rtext=None):
    """show: center / radius / diameter / chord. names로 점 이름 바꿈"""
    cx = cy = r + 16
    nm = {"center": "ㅇ", "p": "ㄱ", "q": "ㄴ", "s": "ㄷ"}
    if names:
        nm.update(names)
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="3"/>']
    if "diameter" in show:
        out.append(line(cx - r, cy, cx + r, cy, 3, color=ORANGE))
        out.append(dot(cx - r, cy) + dot(cx + r, cy))
        out.append(text(cx - r - 12, cy + 5, nm["p"], 14, weight="bold") + text(cx + r + 12, cy + 5, nm["q"], 14, weight="bold"))
    if "radius" in show:
        a = math.radians(-50)
        x2, y2 = cx + r * math.cos(a), cy + r * math.sin(a)
        out.append(line(cx, cy, x2, y2, 3, color=BLUE if "diameter" not in show else C))
        out.append(dot(x2, y2) + text(x2 + 12, y2 - 4, nm["s"], 14, weight="bold"))
        if rtext:
            out.append(text((cx + x2) / 2 - 28, (cy + y2) / 2 + 2, rtext, 13, weight="bold"))
    if "chord" in show:
        a, b = math.radians(150), math.radians(-30 - 40)
        out.append(line(cx + r * math.cos(a), cy - r * math.sin(a) * -1, cx + r * math.cos(b), cy + r * math.sin(b), 3))
    out.append(dot(cx, cy, 4.5) + text(cx - 2, cy + 20, nm["center"], 14, weight="bold"))
    return svg(2 * r + 36 if W == 190 else W, 2 * r + 32, "".join(out))


def compass_ruler(open_cm, unit=34, leg=1):
    """자 위에 컴퍼스를 벌려 놓은 그림 (바늘 끝은 0, 연필 끝은 open_cm)"""
    x0 = 44
    w = 8 * unit
    ytop = 96
    out = [f'<rect x="{x0 - 14}" y="{ytop}" width="{w + 28}" height="38" rx="4" fill="none" stroke="{C}" stroke-width="2.5"/>']
    for k in range(9):
        out.append(line(x0 + k * unit, ytop, x0 + k * unit, ytop + 14, 2) + text(x0 + k * unit, ytop + 30, k, 12))
    nx, px = x0, x0 + open_cm * unit
    hx, hy = (nx + px) / 2, 12
    out.append(line(hx, hy, nx, ytop, 3) + line(hx, hy, px, ytop, 3))
    out.append(dot(hx, hy, 5))
    out.append(f'<circle cx="{nx}" cy="{ytop}" r="3" fill="{C}"/>')
    out.append(f'<polygon points="{px - 4},{ytop - 14} {px + 4},{ytop - 14} {px},{ytop}" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
    out.append(text(nx - 4, ytop - 8, "바늘", 12, "end") + text(px + 8, ytop - 20, "연필", 12, "start"))
    return svg(w + 88, ytop + 44, "".join(out))


# ── 삼각형·사각형 ───────────────────────────────────────
def tick(p, q, n=1, size=6):
    mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy)
    nx, ny = -dy / L, dx / L
    ux, uy = dx / L, dy / L
    s = ""
    for k in range(n):
        off = (k - (n - 1) / 2) * 5
        cx, cy = mx + ux * off, my + uy * off
        s += line(cx - nx * size, cy - ny * size, cx + nx * size, cy + ny * size, 2.5)
    return s


def tri_fig(P, ticks=(), side_txt=None, ang_txt=None, right=None, fill=None, W=None, H=None, pad=30, vnames=None, ang_out=False):
    """P: 세 꼭짓점. ticks: [(i, 개수)] 변 i(=P[i]→P[i+1])에 같은 길이 표시.
    side_txt: {i: '5 cm'}, ang_txt: {꼭짓점 i: '60°'}, right: 직각 표시할 꼭짓점 i"""
    xs, ys = [p[0] for p in P], [p[1] for p in P]
    ox, oy = pad - min(xs), pad - min(ys)
    Q = [(x + ox, y + oy) for x, y in P]
    W = W or max(xs) - min(xs) + 2 * pad
    H = H or max(ys) - min(ys) + 2 * pad
    out = [poly(Q, fill or "none", 0.2 if fill else None)]
    n = len(Q)
    for (i, k) in ticks:
        out.append(tick(Q[i], Q[(i + 1) % n], k))
    cxm = sum(q[0] for q in Q) / n
    cym = sum(q[1] for q in Q) / n
    for i, t in (side_txt or {}).items():
        p, q = Q[i], Q[(i + 1) % n]
        mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
        dx, dy = mx - cxm, my - cym
        L = math.hypot(dx, dy) or 1
        out.append(text(mx + dx / L * 20, my + dy / L * 20 + 5, t, 13, weight="bold"))
    for i, t in (ang_txt or {}).items():
        x, y = Q[i]
        dx, dy = cxm - x, cym - y
        L = math.hypot(dx, dy) or 1
        k = -22 if ang_out else 30
        out.append(text(x + dx / L * k, y + dy / L * k + 5, t, 13, weight="bold", fill=C))
    for i, nm in enumerate(vnames or []):
        x, y = Q[i]
        dx, dy = x - cxm, y - cym
        L = math.hypot(dx, dy) or 1
        out.append(text(x + dx / L * 16, y + dy / L * 16 + 5, nm, 14, weight="bold"))
    if right is not None:
        i = right
        a, b, c = Q[(i - 1) % n], Q[i], Q[(i + 1) % n]
        s = 12
        def un(p, q):
            d = math.hypot(q[0] - p[0], q[1] - p[1])
            return (q[0] - p[0]) / d, (q[1] - p[1]) / d
        u1, u2 = un(b, a), un(b, c)
        p1 = (b[0] + s * u1[0], b[1] + s * u1[1]); p3 = (b[0] + s * u2[0], b[1] + s * u2[1])
        p2 = (b[0] + s * (u1[0] + u2[0]), b[1] + s * (u1[1] + u2[1]))
        out.append(f'<polyline points="{_n(p1[0])},{_n(p1[1])} {_n(p2[0])},{_n(p2[1])} {_n(p3[0])},{_n(p3[1])}" fill="none" stroke="{C}" stroke-width="2"/>')
    return svg(_n(W), _n(H), "".join(out))


def quad_fig(P, ticks=(), par=(), right=(), ang_txt=None, side_txt=None, fill=None, pad=30, W=None, H=None, diag=False):
    """사각형: ticks [(변 i, 개수)], par: [(변 i, 개수)] 평행 표시(화살촉), right: 직각 꼭짓점 목록"""
    xs, ys = [p[0] for p in P], [p[1] for p in P]
    ox, oy = pad - min(xs), pad - min(ys)
    Q = [(x + ox, y + oy) for x, y in P]
    W = W or max(xs) - min(xs) + 2 * pad
    H = H or max(ys) - min(ys) + 2 * pad
    out = [poly(Q, fill or "none", 0.2 if fill else None)]
    n = 4
    for (i, k) in ticks:
        out.append(tick(Q[i], Q[(i + 1) % n], k))
    for (i, k) in par:
        p, q = Q[i], Q[(i + 1) % n]
        mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
        ang = math.degrees(math.atan2(q[1] - p[1], q[0] - p[0]))
        for j in range(k):
            out.append(arrow_head(mx + (j - (k - 1) / 2) * 7 + 4, my, 0, 7) if False else
                       f'<g transform="translate({_n(mx)} {_n(my)}) rotate({_n(ang)})"><polyline points="{-6 + j * 7 - (k - 1) * 3.5},-6 {j * 7 - (k - 1) * 3.5},0 {-6 + j * 7 - (k - 1) * 3.5},6" fill="none" stroke="{C}" stroke-width="2.5"/></g>')
    cxm = sum(q[0] for q in Q) / 4
    cym = sum(q[1] for q in Q) / 4
    for i in right:
        a, b, c = Q[(i - 1) % n], Q[i], Q[(i + 1) % n]
        s = 11
        def un(p, q):
            d = math.hypot(q[0] - p[0], q[1] - p[1])
            return (q[0] - p[0]) / d, (q[1] - p[1]) / d
        u1, u2 = un(b, a), un(b, c)
        p1 = (b[0] + s * u1[0], b[1] + s * u1[1]); p3 = (b[0] + s * u2[0], b[1] + s * u2[1])
        p2 = (b[0] + s * (u1[0] + u2[0]), b[1] + s * (u1[1] + u2[1]))
        out.append(f'<polyline points="{_n(p1[0])},{_n(p1[1])} {_n(p2[0])},{_n(p2[1])} {_n(p3[0])},{_n(p3[1])}" fill="none" stroke="{C}" stroke-width="2"/>')
    for i, t in (side_txt or {}).items():
        p, q = Q[i], Q[(i + 1) % n]
        mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
        dx, dy = mx - cxm, my - cym
        L = math.hypot(dx, dy) or 1
        out.append(text(mx + dx / L * 20, my + dy / L * 20 + 5, t, 13, weight="bold"))
    for i, t in (ang_txt or {}).items():
        x, y = Q[i]
        dx, dy = cxm - x, cym - y
        L = math.hypot(dx, dy) or 1
        out.append(text(x + dx / L * 28, y + dy / L * 28 + 5, t, 13, weight="bold"))
    if diag:
        out.append(line(Q[0][0], Q[0][1], Q[2][0], Q[2][1], 2.5, None, "6 4", color=ORANGE))
    return svg(_n(W), _n(H), "".join(out))


def ngon_pts(n, r=40, rot=-90, cx=None, cy=None):
    cx = cx if cx is not None else r + 10
    cy = cy if cy is not None else r + 10
    return [(cx + r * math.cos(math.radians(rot + 360 * i / n)), cy + r * math.sin(math.radians(rot + 360 * i / n))) for i in range(n)]


def shapes_row(polys, names=None, cell=100, h=100, pad=8):
    """polys: [(점 목록 또는 callable(cx,cy)->svg조각)] 각 칸 가운데에 이름"""
    out = []
    for i, f in enumerate(polys):
        cx = pad + cell * (i + 0.5)
        out.append(f(cx, h / 2 + 4))
        if names:
            out.append(text(cx, h + 22, names[i], 14, weight="bold"))
    return svg(cell * len(polys) + 2 * pad, h + (30 if names else 8), "".join(out))


def pp(pts, off=(0, 0), fill="none", op=None, dash=None):
    return poly([(x + off[0], y + off[1]) for x, y in pts], fill, op, dash)


# ── 채우기 · 모양 만들기 ─────────────────────────────────
def cell_grid(cells, cols, rows, g=26, hole=None, labels=None):
    """cells: {(c,r): 'B'|'O'} 색칠(파랑/주황, 무늬 다르게), hole: 빈칸 목록 (점선 + ?)"""
    out = []
    W, H = cols * g + 8, rows * g + 8
    for (c, r), k in cells.items():
        fill = BLUE if k == "B" else ORANGE
        out.append(f'<rect x="{4 + c * g}" y="{4 + r * g}" width="{g}" height="{g}" fill="{fill}" fill-opacity="0.45" stroke="{C}" stroke-width="2"/>')
        if k == "O":
            out.append(line(4 + c * g + 3, 4 + r * g + g - 3, 4 + c * g + g - 3, 4 + r * g + 3, 2, 0.6))
    for (c, r) in (hole or []):
        out.append(f'<rect x="{4 + c * g}" y="{4 + r * g}" width="{g}" height="{g}" fill="none" stroke="{C}" stroke-width="2" stroke-dasharray="4 3"/>')
    return svg(W, H, "".join(out))


# ── 시계 (초 단위) ───────────────────────────────────────
def clock_sec(h, m, s, r=72):
    base = clock(h, m, r, True)
    import re
    body = re.match(r'<svg viewBox="[^"]+"[^>]*>(.*)</svg>$', base, re.S).group(1)
    cx = cy = r + 8
    a = math.radians(s * 6)
    sx, sy = cx + (r - 6) * math.sin(a), cy - (r - 6) * math.cos(a)
    bx, by = cx - 14 * math.sin(a), cy + 14 * math.cos(a)
    extra = (line(bx, by, sx, sy, 2, color=ORANGE) + f'<circle cx="{_n(sx)}" cy="{_n(sy)}" r="3.5" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>'
             + f'<circle cx="{cx}" cy="{cy}" r="4" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
    return svg(2 * r + 16, 2 * r + 16, body + extra)


def seconds_clock_only(s, r=72):
    """초바늘만 있는 시계(초 읽기 연습): 0~59초"""
    cx = cy = r + 8
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="3"/>']
    for k in range(60):
        a = math.radians(k * 6)
        big = k % 5 == 0
        r1 = r - (10 if big else 5)
        out.append(line(cx + r1 * math.sin(a), cy - r1 * math.cos(a), cx + (r - 1) * math.sin(a), cy - (r - 1) * math.cos(a), 2.5 if big else 2, None if big else 0.45))
    for k in range(1, 13):
        a = math.radians(k * 30)
        out.append(text(cx + r * 0.74 * math.sin(a), cy - r * 0.74 * math.cos(a) + 5, k, 13, weight="bold"))
    return clock_sec(1, 0, s, r) if False else svg(2 * r + 16, 2 * r + 16, "".join(out))


# ── 자 (mm) · 들이 · 무게 · 각도기 ──────────────────────
def ruler_mm(cm=8, bars=(), u=34):
    """cm 눈금 + mm 눈금이 있는 자. bars: [(시작mm, 끝mm, 이름)]"""
    x0 = 18
    W = cm * u + 2 * x0
    top = 14 + 30 * len(bars)
    out = []
    for i, (s_, e, nm) in enumerate(bars):
        y = 10 + 30 * i
        xs, xe = x0 + s_ / 10 * u, x0 + e / 10 * u
        out.append(f'<rect x="{_n(xs)}" y="{y}" width="{_n(xe - xs)}" height="18" rx="3" fill="{BLUE if i == 0 else ORANGE}" fill-opacity="0.7" stroke="{C}" stroke-width="2"/>')
        if nm:
            out.append(text((xs + xe) / 2, y + 14, nm, 13, weight="bold"))
        out.append(line(xs, y + 18, xs, top, 2, 0.5, "3 3") + line(xe, y + 18, xe, top, 2, 0.5, "3 3"))
    out.append(f'<rect x="4" y="{top}" width="{W - 8}" height="52" rx="4" fill="none" stroke="{C}" stroke-width="2.5"/>')
    big, mid, small = [], [], []
    for k in range(cm * 10 + 1):
        x = x0 + k * u / 10
        ln = 22 if k % 10 == 0 else (15 if k % 5 == 0 else 9)
        (big if k % 10 == 0 else mid if k % 5 == 0 else small).append(f"M{_n(x)},{top}v{ln}")
        if k % 10 == 0:
            out.append(text(x, top + 42, k // 10, 12))
    out.append(f'<path d="{"".join(small)}" stroke="{C}" stroke-width="2" stroke-opacity="0.6"/>')
    out.append(f'<path d="{"".join(mid)}" stroke="{C}" stroke-width="2"/>')
    out.append(f'<path d="{"".join(big)}" stroke="{C}" stroke-width="2.5"/>')
    return svg(W, top + 58, "".join(out))


def beaker(max_ml, level, step, label=None, h=150, w=70, major=None):
    """눈금 있는 들이 그릇. level(mL)만큼 물. major: 숫자를 쓰는 간격(mL)"""
    major = major or step * 2
    x0, top = 40, 30
    bot = top + h
    sc = h / max_ml
    out = []
    wh = level * sc
    out.append(f'<rect x="{x0 + 2}" y="{_n(bot - wh)}" width="{w - 4}" height="{_n(wh)}" fill="{BLUE}" fill-opacity="0.4"/>')
    out.append(f'<polyline points="{x0},{top} {x0},{bot} {x0 + w},{bot} {x0 + w},{top}" fill="none" stroke="{C}" stroke-width="3"/>')
    v = 0
    while v <= max_ml:
        y = bot - v * sc
        isM = v % major == 0
        out.append(line(x0, y, x0 + (22 if isM else 12), y, 2))
        if isM:
            out.append(text(x0 - 6, y + 4, v, 12, "end"))
        v += step
    out.append(text(x0 + w / 2, bot + 20, label or "", 13, weight="bold"))
    out.append(text(x0 - 6, 14, "(mL)", 12, "end"))
    return svg(x0 + w + 16, bot + 28, "".join(out))


def dial(value, full=1000, unit="g", r=76, labels_every=100, minor=50):
    """주방 저울 눈금판: 0 ~ full 한 바퀴. value 위치에 바늘"""
    cx = cy = r + 16
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="3"/>']
    k = 0
    while k < full:
        a = math.radians(k / full * 360)
        big = k % labels_every == 0
        r1 = r - (11 if big else 6)
        out.append(line(cx + r1 * math.sin(a), cy - r1 * math.cos(a), cx + (r - 1) * math.sin(a), cy - (r - 1) * math.cos(a), 2.5 if big else 2))
        if big:
            rr = r - 25
            out.append(text(cx + rr * math.sin(a), cy - rr * math.cos(a) + 4, k, 12, weight="bold"))
        k += minor
    a = math.radians(value / full * 360)
    out.append(line(cx, cy, cx + (r - 14) * math.sin(a), cy - (r - 14) * math.cos(a), 3.5, color=ORANGE) + dot(cx, cy, 5))
    out.append(text(cx, cy + 22, unit, 13, weight="bold"))
    return svg(2 * r + 32, 2 * r + 32, "".join(out))


def protractor(deg, base="right", W=270, show_label=True):
    """각도기 위에 각 하나. base=right: 한 변이 오른쪽(0°), left: 한 변이 왼쪽. 바깥 눈금은 오른쪽부터, 안쪽 눈금은 왼쪽부터"""
    R = 118
    cx, cy = W / 2, R + 14
    out = [f'<path d="M{cx - R},{cy} A{R},{R} 0 0 1 {cx + R},{cy} Z" fill="none" stroke="{C}" stroke-width="2.5"/>',
           line(cx - R - 10, cy, cx + R + 10, cy, 2.5)]
    for d in range(0, 181, 10):
        a = math.radians(d)
        r1 = R - (14 if d % 30 == 0 else 8)
        out.append(line(cx + r1 * math.cos(a), cy - r1 * math.sin(a), cx + R * math.cos(a), cy - R * math.sin(a), 2.5 if d % 30 == 0 else 2))
        if d % 30 == 0:
            rr = R - 27
            ox = 6 if d == 0 else (-6 if d == 180 else 0)
            oy = -9 if d in (0, 180) else 4
            out.append(text(cx + rr * math.cos(a) + ox, cy - rr * math.sin(a) + oy, d, 12, weight="bold"))
            if d not in (0, 180):
                rr2 = R - 50
                out.append(text(cx + rr2 * math.cos(a), cy - rr2 * math.sin(a) + 4, 180 - d, 12))
    out.append(dot(cx, cy, 4))
    if base == "right":
        a1, a2 = 0, deg
    else:
        a1, a2 = 180, 180 - deg
    for a in (a1, a2):
        r = math.radians(a)
        out.append(line(cx, cy, cx + (R + 24) * math.cos(r), cy - (R + 24) * math.sin(r), 3.5, color=BLUE))
    H = cy + 20
    return svg(W + 30, H, f'<g transform="translate(15 0)">' + "".join(out) + "</g>")


def angle_split(angs, labels):
    """삼각형의 세 각을 한곳에 모아 일직선(180°)이 되는 그림. angs: 세 각(도), labels: 각 표시 글자"""
    cx, cy, R = 150, 96, 80
    out = [line(cx - R - 30, cy, cx + R + 30, cy, 3), dot(cx, cy, 4)]
    cur = 0
    for a, lb in zip(angs, labels):
        r = math.radians(cur + a)
        out.append(line(cx, cy, cx + R * math.cos(r), cy - R * math.sin(r), 3))
        mid = math.radians(cur + a / 2)
        out.append(text(cx + 38 * math.cos(mid), cy - 38 * math.sin(mid) + 5, lb, 14, weight="bold"))
        cur += a
    return svg(300, 118, "".join(out))
