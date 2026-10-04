"""중학 수학 도형 그림 도구: 좌표를 주면 점·선·원·각 표시를 그려 주는 범용 geo + 부채꼴.
svgkit 규칙(글자 12↑, 선 2↑, currentColor + 파랑/주황)을 따른다."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, BLUE, ORANGE, C, _n


def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return (cx + r * math.cos(a), cy - r * math.sin(a))


def _ang(v, p):
    return math.degrees(math.atan2(-(p[1] - v[1]), p[0] - v[0])) % 360


def geo(pts, segs=(), circles=(), texts=(), rights=(), arcs=(), ticks=(), W=240, H=170, loff=None, show=None, fills=()):
    """pts {이름:(x,y)} segs [(a,b[,'d'|'o'|'t'])] circles [(cx,cy,r[,'o'|'d'])]
    texts [(x,y,글자)] rights [(꼭짓점,a,b)] arcs [(꼭짓점,a,b,반지름,글자)] ticks [(a,b,개수)]
    fills [([이름..], 'b'|'o')] 다각형 칠하기. show: 점 이름을 적을 목록(None이면 전부)"""
    out = []
    P = lambda k: pts[k] if isinstance(k, str) else k
    for names, col in fills:
        d = " ".join(f"{_n(P(k)[0])},{_n(P(k)[1])}" for k in names)
        out.append(f'<polygon points="{d}" fill="{BLUE if col == "b" else ORANGE}" fill-opacity="0.22" stroke="none"/>')
    for cx, cy, r, *st in circles:
        s = st[0] if st else None
        col = ORANGE if s == "o" else C
        dash = ' stroke-dasharray="6 5"' if s == "d" else ""
        out.append(f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{_n(r)}" fill="none" stroke="{col}" stroke-width="2.5"{dash}/>')
    for sg in segs:
        a, b, *st = sg
        s = st[0] if st else None
        pa, pb = P(a), P(b)
        if s == "d":
            out.append(line(pa[0], pa[1], pb[0], pb[1], 2, dash="6 5"))
        elif s == "o":
            out.append(line(pa[0], pa[1], pb[0], pb[1], 3, color=ORANGE))
        else:
            out.append(line(pa[0], pa[1], pb[0], pb[1], 2.5))
    for v, a, b in rights:
        pv, pa, pb = P(v), P(a), P(b)
        s = 10
        ua = ((pa[0] - pv[0]), (pa[1] - pv[1])); la = math.hypot(*ua); ua = (ua[0] / la, ua[1] / la)
        ub = ((pb[0] - pv[0]), (pb[1] - pv[1])); lb = math.hypot(*ub); ub = (ub[0] / lb, ub[1] / lb)
        p1 = (pv[0] + ua[0] * s, pv[1] + ua[1] * s)
        p2 = (pv[0] + (ua[0] + ub[0]) * s, pv[1] + (ua[1] + ub[1]) * s)
        p3 = (pv[0] + ub[0] * s, pv[1] + ub[1] * s)
        out.append(f'<polyline points="{_n(p1[0])},{_n(p1[1])} {_n(p2[0])},{_n(p2[1])} {_n(p3[0])},{_n(p3[1])}" fill="none" stroke="{C}" stroke-width="2"/>')
    for v, a, b, r, lab in arcs:
        pv = P(v)
        a1, a2 = _ang(pv, P(a)), _ang(pv, P(b))
        d = (a2 - a1) % 360
        if d > 180:
            a1, a2, d = a2, a1, 360 - d
        s1, s2 = polar(pv[0], pv[1], r, a1), polar(pv[0], pv[1], r, a1 + d)
        out.append(f'<path d="M{_n(s1[0])},{_n(s1[1])} A{_n(r)},{_n(r)} 0 0 0 {_n(s2[0])},{_n(s2[1])}" fill="none" stroke="{ORANGE}" stroke-width="2.5"/>')
        if lab:
            tm = polar(pv[0], pv[1], r + 14, a1 + d / 2)
            out.append(text(tm[0], tm[1] + 4, lab, 12, weight="bold"))
    for a, b, n in ticks:
        pa, pb = P(a), P(b)
        mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
        L = math.hypot(pb[0] - pa[0], pb[1] - pa[1])
        ux, uy = (pb[0] - pa[0]) / L, (pb[1] - pa[1]) / L
        nx, ny = -uy, ux
        for k in range(n):
            off = (k - (n - 1) / 2) * 5
            cx, cy = mx + ux * off, my + uy * off
            out.append(line(cx - nx * 5, cy - ny * 5, cx + nx * 5, cy + ny * 5, 2.2))
    allp = list(pts.values())
    gx = sum(p[0] for p in allp) / len(allp)
    gy = sum(p[1] for p in allp) / len(allp)
    for k, p in pts.items():
        if show is not None and k not in show:
            continue
        out.append(f'<circle cx="{_n(p[0])}" cy="{_n(p[1])}" r="3" fill="{C}"/>')
        if loff and k in loff:
            dx, dy = loff[k]
        else:
            vx, vy = p[0] - gx, p[1] - gy
            L = math.hypot(vx, vy) or 1
            dx, dy = vx / L * 13, vy / L * 13 + 4
        out.append(text(p[0] + dx, p[1] + dy, k, 14, weight="bold"))
    for x, y, s in texts:
        out.append(text(x, y, s, 12, weight="bold"))
    return svg(W, H, "".join(out))


def sector(r, deg, labels=None, W=None, name=("O", "A", "B")):
    """부채꼴 O-A-B: 반지름 r(화면 길이), 중심각 deg. labels {'r':글자,'arc':글자,'ang':글자}"""
    R = 70
    cx, cy = 40, 100
    labels = labels or {}
    a0 = 0
    A = polar(cx, cy, R, a0)
    B = polar(cx, cy, R, a0 + deg)
    large = 1 if deg > 180 else 0
    out = [f'<path d="M{cx},{cy} L{_n(A[0])},{_n(A[1])} A{R},{R} 0 {large} 0 {_n(B[0])},{_n(B[1])} Z" fill="{BLUE}" fill-opacity="0.2" stroke="{C}" stroke-width="2.5"/>']
    out.append(text(cx - 12, cy + 16, name[0], 14, weight="bold"))
    out.append(text(A[0] + 12, A[1] + 14, name[1], 14, weight="bold"))
    bx, by = polar(cx, cy, R + 14, a0 + deg)
    out.append(text(bx, by, name[2], 14, weight="bold"))
    if "ang" in labels:
        t = polar(cx, cy, 26, a0 + deg / 2)
        out.append(text(t[0] + 6, t[1] + 4, labels["ang"], 13, weight="bold"))
    if "r" in labels:
        t = polar(cx, cy, R / 2, 0)
        out.append(text(t[0], t[1] + 16, labels["r"], 13, weight="bold"))
    if "arc" in labels:
        t = polar(cx, cy, R + 24, a0 + deg / 2)
        out.append(text(t[0] + 6, t[1] + 4, labels["arc"], 13, weight="bold"))
    return svg(W or 200, 190, "".join(out))


def plane(xr=(-5, 5), yr=(-5, 5), pts=(), lines=(), curves=(), W=240, H=240, texts=(), step=1, poly=(), xlab="x", ylab="y", grid=True):
    """좌표평면. pts [(x,y,글자,'o'?)] lines [((x1,y1),(x2,y2)[,'o'|'d'])](직선 전체) curves [[(x,y)...] 또는 (점목록,'o')] poly [[(x,y)...]] 꺾은선
    texts [(x,y,글자)] (좌표 단위). 좌표 단위를 화면으로 변환해서 그린다."""
    x0, x1 = xr
    y0, y1 = yr
    pad = 26
    sx = (W - 2 * pad) / (x1 - x0)
    sy = (H - 2 * pad) / (y1 - y0)
    if isinstance(step, tuple):
        sxx, syy = sx, sy
    else:
        sxx = syy = min(sx, sy)
    ox = pad + (-x0) * sxx
    oy = H - pad - (-y0) * syy
    X = lambda x: ox + x * sxx
    Y = lambda y: oy - y * syy
    out = []
    xs_, ys_ = (step if isinstance(step, tuple) else (step, step))
    gxs = [v for v in range(int(math.ceil(x0 / xs_)) * xs_, int(x1) + 1, xs_)]
    gys = [v for v in range(int(math.ceil(y0 / ys_)) * ys_, int(y1) + 1, ys_)]
    if grid:
        for gx in gxs:
            out.append(line(X(gx), Y(y0), X(gx), Y(y1), 1.2, 0.18))
        for gy in gys:
            out.append(line(X(x0), Y(gy), X(x1), Y(gy), 1.2, 0.18))
    out.append(line(X(x0), Y(0), X(x1) + 6, Y(0), 2.2))
    out.append(line(X(0), Y(y0), X(0), Y(y1) - 6, 2.2))
    out.append(text(X(x1) + 4, Y(0) + 16, xlab, 13, anchor="end", weight="bold"))
    out.append(text(X(0) + 12, Y(y1) - 2, ylab, 13, weight="bold"))
    out.append(text(X(0) - 8, Y(0) + 14, "O", 12, anchor="end"))
    for gx in gxs:
        if gx != 0:
            out.append(line(X(gx), Y(0) - 3, X(gx), Y(0) + 3, 2))
            out.append(text(X(gx), Y(0) + 17, gx, 12))
    for gy in gys:
        if gy != 0:
            out.append(line(X(0) - 3, Y(gy), X(0) + 3, Y(gy), 2))
            out.append(text(X(0) - 7, Y(gy) + 4, gy, 12, anchor="end"))

    def clip_line(p, q):
        (ax, ay), (bx, by) = p, q
        if abs(bx - ax) < 1e-9:
            return (ax, y0), (ax, y1)
        m = (by - ay) / (bx - ax)
        c = ay - m * ax
        cand = []
        for xv in (x0, x1):
            yv = m * xv + c
            if y0 - 1e-9 <= yv <= y1 + 1e-9:
                cand.append((xv, yv))
        if abs(m) > 1e-9:
            for yv in (y0, y1):
                xv = (yv - c) / m
                if x0 - 1e-9 <= xv <= x1 + 1e-9:
                    cand.append((xv, yv))
        cand = sorted(set((round(a, 6), round(b, 6)) for a, b in cand))
        return cand[0], cand[-1]

    for ln in lines:
        p, q, *st = ln
        a, b = clip_line(p, q)
        sty = st[0] if st else None
        if sty == "d":
            out.append(line(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), 2.2, dash="6 5"))
        else:
            out.append(line(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), 3, color=ORANGE if sty == "o" else BLUE))
    for cv in curves:
        pts_, *st = cv if isinstance(cv, tuple) else (cv,)
        col = ORANGE if (st and st[0] == "o") else BLUE
        seg = [(X(a), Y(b)) for a, b in pts_ if y0 - 0.01 <= b <= y1 + 0.01]
        out.append(f'<polyline points="{" ".join(f"{_n(a)},{_n(b)}" for a, b in seg)}" fill="none" stroke="{col}" stroke-width="3"/>')
    for pl in poly:
        out.append(f'<polyline points="{" ".join(f"{_n(X(a))},{_n(Y(b))}" for a, b in pl)}" fill="none" stroke="{BLUE}" stroke-width="3" stroke-linejoin="round"/>')
        for a, b in pl:
            out.append(f'<circle cx="{_n(X(a))}" cy="{_n(Y(b))}" r="3.5" fill="{BLUE}"/>')
    for p in pts:
        px, py, lab, *st = p
        col = ORANGE if st and st[0] == "o" else C
        out.append(f'<circle cx="{_n(X(px))}" cy="{_n(Y(py))}" r="4.5" fill="{col}" stroke="{C}" stroke-width="1.5"/>')
        if lab:
            out.append(text(X(px) + 10, Y(py) - 7, lab, 13, anchor="start", weight="bold"))
    for tx, ty, s_ in texts:
        out.append(text(X(tx), Y(ty), s_, 13, weight="bold"))
    return svg(W, H, "".join(out))


def parab(a, p=0, q=0, lo=-5, hi=5, n=80):
    """y=a(x-p)^2+q 점 목록"""
    return [(lo + (hi - lo) * i / n, a * (lo + (hi - lo) * i / n - p) ** 2 + q) for i in range(n + 1)]
