"""초1-2 묶음에서 함께 쓰는 그림 도구 (입체도형·쌓기나무·시계·자·수 모형 등).
svgkit.py 규칙을 따른다: viewBox만, 글자 12 이상, 선 2 이상, 배경 없음, currentColor + 파랑/주황만."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from svgkit import svg, text, line, shape, BLUE, ORANGE, C, _n

ST = f'stroke="{C}" stroke-width="2.5" stroke-linejoin="round"'


# ── 입체도형 (직육면체 · 원기둥 · 구) ─────────────────────
def box_at(x, y, w, h, d, fill="none", op=None):
    """앞면 왼쪽 아래가 (x, y)인 직육면체 (비스듬히 본 그림)"""
    dx, dy = d * 0.6, d * 0.45
    fo = f' fill-opacity="{op}"' if op else ""
    return (f'<rect x="{_n(x)}" y="{_n(y-h)}" width="{_n(w)}" height="{_n(h)}" fill="{fill}"{fo} {ST}/>'
            f'<polygon points="{_n(x)},{_n(y-h)} {_n(x+dx)},{_n(y-h-dy)} {_n(x+w+dx)},{_n(y-h-dy)} {_n(x+w)},{_n(y-h)}" fill="{fill}"{fo} {ST}/>'
            f'<polygon points="{_n(x+w)},{_n(y-h)} {_n(x+w+dx)},{_n(y-h-dy)} {_n(x+w+dx)},{_n(y-dy)} {_n(x+w)},{_n(y)}" fill="{fill}"{fo} {ST}/>')


def cyl_at(cx, y, rx, h, fill="none", op=None, lying=False):
    """밑면 가운데가 (cx, y)인 원기둥. lying=True면 옆으로 눕힘"""
    fo = f' fill-opacity="{op}"' if op else ""
    if lying:
        ry = rx
        rx2 = ry * 0.35
        x0 = cx - h / 2
        cy = y - ry
        return (f'<path d="M{_n(x0)},{_n(cy-ry)} L{_n(x0+h)},{_n(cy-ry)} A{_n(rx2)},{_n(ry)} 0 0 1 {_n(x0+h)},{_n(cy+ry)} '
                f'L{_n(x0)},{_n(cy+ry)} Z" fill="{fill}"{fo} {ST}/>'
                f'<ellipse cx="{_n(x0)}" cy="{_n(cy)}" rx="{_n(rx2)}" ry="{_n(ry)}" fill="{fill}"{fo} {ST}/>')
    ry = rx * 0.32
    return (f'<path d="M{_n(cx-rx)},{_n(y-h)} L{_n(cx-rx)},{_n(y)} A{_n(rx)},{_n(ry)} 0 0 0 {_n(cx+rx)},{_n(y)} '
            f'L{_n(cx+rx)},{_n(y-h)}" fill="{fill}"{fo} {ST}/>'
            f'<ellipse cx="{_n(cx)}" cy="{_n(y-h)}" rx="{_n(rx)}" ry="{_n(ry)}" fill="{fill}"{fo} {ST}/>')


def sphere_at(cx, cy, r, fill="none", op=None):
    fo = f' fill-opacity="{op}"' if op else ""
    return (f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{_n(r)}" fill="{fill}"{fo} {ST}/>'
            f'<ellipse cx="{_n(cx)}" cy="{_n(cy)}" rx="{_n(r)}" ry="{_n(r*0.3)}" fill="none" stroke="{C}" stroke-width="2" stroke-dasharray="4 4" stroke-opacity="0.6"/>')


def solid(kind, cx, base, size=40, fill="none", op=None):
    """kind: box / cube / flatbox / tallbox / cyl / tallcyl / flatcyl / lycyl / sphere — 밑이 base, 가운데가 cx"""
    s = size
    if kind == "box":
        return box_at(cx - s * 0.6, base, s * 1.0, s * 0.62, s * 0.6, fill, op)
    if kind == "cube":
        return box_at(cx - s * 0.5, base, s * 0.75, s * 0.75, s * 0.6, fill, op)
    if kind == "flatbox":
        return box_at(cx - s * 0.7, base, s * 1.2, s * 0.3, s * 0.8, fill, op)
    if kind == "tallbox":
        return box_at(cx - s * 0.4, base, s * 0.55, s * 1.1, s * 0.4, fill, op)
    if kind == "cyl":
        return cyl_at(cx, base - 4, s * 0.42, s * 0.75, fill, op)
    if kind == "tallcyl":
        return cyl_at(cx, base - 4, s * 0.3, s * 1.1, fill, op)
    if kind == "flatcyl":
        return cyl_at(cx, base - 6, s * 0.55, s * 0.25, fill, op)
    if kind == "lycyl":
        return cyl_at(cx, base, s * 0.35, s * 1.0, fill, op, lying=True)
    if kind == "sphere":
        return sphere_at(cx, base - s * 0.45, s * 0.45, fill, op)
    raise ValueError(kind)


def solids_row(kinds, labels=None, size=40, gap=24, fills=None):
    """입체도형을 한 줄로 늘어놓고 아래에 이름(가, 나, …)"""
    n = len(kinds)
    cw = size * 1.4 + gap
    W = max(160, n * cw + 10)
    base = size * 1.25 + 12
    H = base + (30 if labels else 12)
    out = []
    for i, k in enumerate(kinds):
        cx = 5 + cw * (i + 0.5)
        f = fills[i] if fills else "none"
        out.append(solid(k, cx, base, size, f, 0.35 if f != "none" else None))
        if labels:
            out.append(text(cx, base + 22, labels[i], 14, weight="bold"))
    return svg(_n(W), _n(H), "".join(out))


# ── 쌓기나무 (비스듬히 본 그림) ──────────────────────────
def blocks(cells, a=30, mark=None, labels=None, front_label=True, dxr=0.5, dyr=0.4):
    """cells: (x, y, z) 목록 — x 오른쪽, y 뒤쪽, z 위쪽.
    mark: {(x,y,z): "가"} 처럼 표시할 쌓기나무(주황 + 글자)"""
    mark = mark or {}
    dx, dy = a * dxr, a * dyr
    xs = [c[0] for c in cells]
    ys = [c[1] for c in cells]
    zs = [c[2] for c in cells]
    W = (max(xs) + 1) * a + (max(ys) + 1) * dx + 20
    H = (max(zs) + 1) * a + (max(ys) + 1) * dy + 20 + (24 if front_label else 0)
    ox = 10
    oy = (max(zs) + 1) * a + (max(ys) + 1) * dy + 10
    out = []
    for (x, y, z) in sorted(cells, key=lambda c: (-c[1], c[2], c[0])):
        px = ox + x * a + y * dx
        py = oy - z * a - y * dy
        f = ORANGE if (x, y, z) in mark else BLUE
        out.append(f'<rect x="{_n(px)}" y="{_n(py-a)}" width="{a}" height="{a}" fill="{f}" {ST}/>')
        out.append(f'<polygon points="{_n(px)},{_n(py-a)} {_n(px+dx)},{_n(py-a-dy)} {_n(px+a+dx)},{_n(py-a-dy)} {_n(px+a)},{_n(py-a)}" fill="{f}" {ST}/>')
        out.append(f'<polygon points="{_n(px)},{_n(py-a)} {_n(px+dx)},{_n(py-a-dy)} {_n(px+a+dx)},{_n(py-a-dy)} {_n(px+a)},{_n(py-a)}" fill="{C}" fill-opacity="0.18" stroke="none"/>')
        out.append(f'<polygon points="{_n(px+a)},{_n(py-a)} {_n(px+a+dx)},{_n(py-a-dy)} {_n(px+a+dx)},{_n(py-dy)} {_n(px+a)},{_n(py)}" fill="{f}" {ST}/>')
        out.append(f'<polygon points="{_n(px+a)},{_n(py-a)} {_n(px+a+dx)},{_n(py-a-dy)} {_n(px+a+dx)},{_n(py-dy)} {_n(px+a)},{_n(py)}" fill="{C}" fill-opacity="0.35" stroke="none"/>')
        if (x, y, z) in mark:
            if (x, y - 1, z) in cells:
                out.append(text(px + a / 2 + dx / 2, py - a - dy / 2 + 6, mark[(x, y, z)], 14, weight="bold"))
            else:
                out.append(text(px + a / 2, py - a / 2 + 6, mark[(x, y, z)], 16, weight="bold"))
    if front_label:
        out.append(text(ox + (max(xs) + 1) * a / 2, H - 6, "▲ 앞", 13))
    return svg(_n(W), _n(H), "".join(out))


def blocks_side(groups, a=30, gap=34, names=None):
    """쌓기나무 모양 여러 개를 옆으로 (각각 cells 목록)"""
    parts = [blocks(g[0], a, mark=g[1], front_label=False) if isinstance(g, tuple) else blocks(g, a, front_label=False)
             for g in groups]
    import re
    vb = []
    for p in parts:
        m = re.match(r'<svg viewBox="0 0 ([\d.]+) ([\d.]+)"[^>]*>(.*)</svg>$', p, re.S)
        vb.append((float(m.group(1)), float(m.group(2)), m.group(3)))
    H = max(h for _, h, _ in vb) + (26 if names else 4)
    x = 0
    out = []
    for i, (w, h, body) in enumerate(vb):
        out.append(f'<g transform="translate({_n(x)} {_n(H - (26 if names else 4) - h)})">{body}</g>')
        if names:
            out.append(text(x + w / 2, H - 6, names[i], 14, weight="bold"))
        x += w + gap
    return svg(_n(x - gap), _n(H), "".join(out))


# ── 평면도형 ─────────────────────────────────────────────
def poly(pts, fill="none", op=None, dash=None, closed=True):
    fo = f' fill-opacity="{op}"' if op else ""
    d = f' stroke-dasharray="{dash}"' if dash else ""
    tag = "polygon" if closed else "polyline"
    p = " ".join(f"{_n(x)},{_n(y)}" for x, y in pts)
    return f'<{tag} points="{p}" fill="{fill}"{fo} {ST}{d}/>'


def circ(cx, cy, r, fill="none", op=None):
    fo = f' fill-opacity="{op}"' if op else ""
    return f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{_n(r)}" fill="{fill}"{fo} {ST}/>'


def figs_row(items, labels=None, cell=74, h=70):
    """items: 각 칸에 그릴 SVG 조각을 돌려주는 함수 f(cx, cy) 목록"""
    n = len(items)
    W = n * cell + 6
    H = h + (26 if labels else 6)
    out = []
    for i, f in enumerate(items):
        cx = 3 + cell * (i + 0.5)
        out.append(f(cx, h / 2 + 3))
        if labels:
            out.append(text(cx, h + 20, labels[i], 14, weight="bold"))
    return svg(W, H, "".join(out))


def dot_grid(cols, rows, segs=(), sp=30, fill_poly=None, dots=True):
    """점판(도형판). segs: [((c1,r1),(c2,r2)), ...] 선분, fill_poly: [(c,r)…] 칠할 다각형"""
    W, H = (cols - 1) * sp + 30, (rows - 1) * sp + 30
    o = 15
    out = []
    if fill_poly:
        out.append(poly([(o + c * sp, o + r * sp) for c, r in fill_poly], BLUE, 0.3))
    for (a, b) in segs:
        out.append(line(o + a[0] * sp, o + a[1] * sp, o + b[0] * sp, o + b[1] * sp, 3))
    if dots:
        for r in range(rows):
            for c in range(cols):
                out.append(f'<circle cx="{o + c * sp}" cy="{o + r * sp}" r="3" fill="{C}"/>')
    return svg(W, H, "".join(out))


# ── 시계 ────────────────────────────────────────────────
def clock(h, m, r=70, show_hands=True, label=None, hour_only=False):
    cx = cy = r + 8
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="3"/>']
    for k in range(60):
        a = math.radians(k * 6)
        big = k % 5 == 0
        r1 = r - (9 if big else 5)
        out.append(line(cx + r1 * math.sin(a), cy - r1 * math.cos(a), cx + (r - 1) * math.sin(a), cy - (r - 1) * math.cos(a),
                        2.5 if big else 2, None if big else 0.45))
    for k in range(1, 13):
        a = math.radians(k * 30)
        rr = r * 0.76
        out.append(text(cx + rr * math.sin(a), cy - rr * math.cos(a) + 5, k, 14 if r >= 65 else 12, weight="bold"))
    if show_hands:
        ha = math.radians((h % 12) * 30 + m * 0.5)
        ma = math.radians(m * 6)
        out.append(line(cx, cy, cx + r * 0.42 * math.sin(ha), cy - r * 0.42 * math.cos(ha), 6, color=C))
        if not hour_only:
            out.append(line(cx, cy, cx + r * 0.63 * math.sin(ma), cy - r * 0.63 * math.cos(ma), 3.5, color=BLUE))
    out.append(f'<circle cx="{cx}" cy="{cy}" r="5" fill="{C}"/>')
    H = 2 * r + 16
    if label:
        out.append(text(cx, H + 16, label, 14, weight="bold"))
        H += 24
    return svg(2 * r + 16, H, "".join(out))


def clocks_row(times, labels, r=60):
    import re
    parts = [clock(h, m, r) for h, m in times]
    w = 2 * r + 16
    out = []
    for i, p in enumerate(parts):
        body = re.match(r'<svg viewBox="[^"]+"[^>]*>(.*)</svg>$', p, re.S).group(1)
        out.append(f'<g transform="translate({i * (w + 10)} 0)">{body}</g>')
        out.append(text(i * (w + 10) + w / 2, 2 * r + 34, labels[i], 14, weight="bold"))
    return svg(len(parts) * (w + 10) - 10, 2 * r + 42, "".join(out))


def digital(h, m):
    s = f"{h}:{m:02d}"
    return svg(150, 64, f'<rect x="4" y="4" width="142" height="56" rx="10" fill="none" stroke="{C}" stroke-width="3"/>'
                        + text(75, 44, s, 30, weight="bold"))


# ── 자 ─────────────────────────────────────────────────
def ruler(n, objs=(), u=26, start_label=0, tick_half=False):
    """n cm 자. objs: [(시작cm, 끝cm, 이름)] 자 위에 놓인 막대(물건)"""
    x0 = 14
    W = n * u + 28
    top = 16 + 30 * len(objs)
    out = []
    for i, (s, e, name) in enumerate(objs):
        y = 12 + 30 * i
        out.append(f'<rect x="{_n(x0 + s * u)}" y="{y}" width="{_n((e - s) * u)}" height="18" rx="3" fill="{BLUE if i == 0 else ORANGE}" fill-opacity="0.75" stroke="{C}" stroke-width="2"/>')
        if name:
            out.append(text(x0 + (s + e) / 2 * u, y + 14, name, 13, weight="bold"))
        out.append(line(x0 + s * u, y + 18, x0 + s * u, top + 2, 2, 0.5, "3 3"))
        out.append(line(x0 + e * u, y + 18, x0 + e * u, top + 2, 2, 0.5, "3 3"))
    out.append(f'<rect x="4" y="{top}" width="{W - 8}" height="44" rx="4" fill="none" stroke="{C}" stroke-width="2.5"/>')
    for k in range(n + 1):
        x = x0 + k * u
        out.append(line(x, top, x, top + 16, 2))
        out.append(text(x, top + 34, k + start_label, 12))
        if tick_half and k < n:
            out.append(line(x + u / 2, top, x + u / 2, top + 9, 2, 0.6))
    return svg(W, top + 50, "".join(out))


def bar_objs(objs, unit=None, u=22):
    """막대(물건) 여러 개를 왼쪽 끝을 맞추어 늘어놓음: [(길이(칸), 이름)]. unit이면 칸 눈금 표시"""
    lab_w = 56
    W = lab_w + max(l for l, _ in objs) * u + 16
    H = len(objs) * 34 + 8
    out = []
    for i, (l, name) in enumerate(objs):
        y = 8 + i * 34
        out.append(text(lab_w - 8, y + 18, name, 13, "end", "bold"))
        out.append(f'<rect x="{lab_w}" y="{y}" width="{_n(l * u)}" height="24" rx="3" fill="{BLUE}" fill-opacity="0.35" stroke="{C}" stroke-width="2"/>')
        if unit:
            for k in range(1, int(l)):
                out.append(line(lab_w + k * u, y, lab_w + k * u, y + 24, 2, 0.6))
    return svg(W, H, "".join(out))


# ── 수 모형 ─────────────────────────────────────────────
def base10(hund=0, tens=0, ones=0, thou=0, s=8):
    """천 모형(큰 정육면체 대신 큰 판에 '1000'), 백 모형(판), 십 모형(막대), 일 모형(작은 정육면체)"""
    out = []
    x = 6
    H = 10 * s + 34
    yb = 10 * s + 6
    for _ in range(thou):
        out.append(box_at(x, yb, 10 * s * 0.8, 10 * s * 0.8, 22))
        out.append(text(x + 4 * s, yb - 3 * s, "1000", 13, weight="bold"))
        x += 10 * s * 0.8 + 22
    for _ in range(hund):
        out.append(f'<rect x="{x}" y="{yb - 10*s}" width="{10*s}" height="{10*s}" fill="{BLUE}" fill-opacity="0.3" stroke="{C}" stroke-width="2"/>')
        for k in range(1, 10):
            out.append(line(x + k * s, yb - 10 * s, x + k * s, yb, 2, 0.25))
            out.append(line(x, yb - k * s, x + 10 * s, yb - k * s, 2, 0.25))
        x += 10 * s + 8
    for _ in range(tens):
        out.append(f'<rect x="{x}" y="{yb - 10*s}" width="{s}" height="{10*s}" fill="{BLUE}" fill-opacity="0.3" stroke="{C}" stroke-width="2"/>')
        for k in range(1, 10):
            out.append(line(x, yb - k * s, x + s, yb - k * s, 2, 0.4))
        x += s + 6
    x += 4
    for i in range(ones):
        col, row = divmod(i, 5)
        out.append(f'<rect x="{x + col * (s + 5)}" y="{yb - (row + 1) * (s + 5) + 5}" width="{s}" height="{s}" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
    if ones:
        x += ((ones - 1) // 5 + 1) * (s + 5)
    return svg(max(x + 6, 120), yb + 6, "".join(out))


def dots_groups(groups, per_row=5, r=7, gap=16, kind="circle", box=True):
    """물건(동그라미)을 묶음별로: groups=[개수, 개수, …] 각 묶음은 테두리로 둘러쌈"""
    out = []
    x = 8
    rows_max = max((g - 1) // per_row + 1 for g in groups) if groups else 1
    H = rows_max * (2 * r + 6) + 22
    for g in groups:
        cols = min(g, per_row) if g else 1
        w = cols * (2 * r + 6) + 6
        if box:
            out.append(f'<rect x="{x}" y="6" width="{w}" height="{H - 12}" rx="8" fill="none" stroke="{C}" stroke-width="2" stroke-dasharray="5 4"/>')
        for i in range(g):
            c, rr = i % per_row, i // per_row
            cx, cy = x + 6 + r + c * (2 * r + 6), 14 + r + rr * (2 * r + 6)
            out.append(shape(kind, cx, cy, r, fill=BLUE))
        x += w + gap
    return svg(max(x - gap + 8, 100), H, "".join(out))


def counters(n, per_row=10, r=8, kind="circle", fill=BLUE, ten_frame=False):
    """물건 n개를 줄지어 (ten_frame=True면 10칸 틀)"""
    rows = (n - 1) // per_row + 1 if n else 1
    cs = 2 * r + 8
    W = per_row * cs + 12
    H = rows * cs + 12
    out = []
    if ten_frame:
        for rr in range(rows):
            for c in range(per_row):
                out.append(f'<rect x="{6 + c * cs}" y="{6 + rr * cs}" width="{cs}" height="{cs}" fill="none" stroke="{C}" stroke-width="2"/>')
    for i in range(n):
        c, rr = i % per_row, i // per_row
        out.append(shape(kind, 6 + c * cs + cs / 2, 6 + rr * cs + cs / 2, r, fill=fill))
    return svg(W, H, "".join(out))
