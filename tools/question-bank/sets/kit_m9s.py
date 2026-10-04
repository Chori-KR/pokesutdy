"""중학 수학 통계 그림: 히스토그램·도수분포다각형, 줄기와 잎, 상자그림, 산점도"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, BLUE, ORANGE, C, _n


def hist(edges, freqs, ymax, ystep, xunit="", poly=False, hide=None, W=330, H=230, ylab="도수(명)"):
    """히스토그램. edges 계급 경계 목록, freqs 도수. poly=True면 도수분포다각형 겹침. hide=계급 번호면 그 막대 대신 ?"""
    x0, y0, pw, ph = 46, 28, W - 70, H - 78
    yb = y0 + ph
    n = len(freqs)
    bw = pw / n
    sc = ph / ymax
    out = [text(x0 - 6, 16, ylab, 12, "end")]
    v = 0
    while v <= ymax + 1e-9:
        y = yb - v * sc
        out.append(line(x0, y, x0 + pw, y, 2 if v == 0 else 1.2, None if v == 0 else 0.22))
        out.append(text(x0 - 6, y + 4, int(v), 12, "end"))
        v += ystep
    out.append(line(x0, y0 - 4, x0, yb, 2))
    for i, f in enumerate(freqs):
        x = x0 + bw * i
        if hide is not None and i == hide:
            out.append(text(x + bw / 2, yb - 12, "?", 16, weight="bold"))
            continue
        if f > 0:
            out.append(f'<rect x="{_n(x)}" y="{_n(yb - f * sc)}" width="{_n(bw)}" height="{_n(f * sc)}" fill="{BLUE}" fill-opacity="{0.35 if poly else 0.8}" stroke="currentColor" stroke-width="2"/>')
    for i, e in enumerate(edges):
        out.append(text(x0 + bw * i, yb + 18, e, 12))
    if xunit:
        out.append(text(x0 + pw + 4, yb + 36, xunit, 12, "end"))
    if poly:
        pts = [(x0 - bw / 2, yb)] + [(x0 + bw * (i + 0.5), yb - f * sc) for i, f in enumerate(freqs)] + [(x0 + pw + bw / 2, yb)]
        d = " ".join(f"{_n(a)},{_n(b)}" for a, b in pts)
        out.append(f'<polyline points="{d}" fill="none" stroke="{ORANGE}" stroke-width="3"/>')
        for a, b in pts[1:-1]:
            out.append(f'<circle cx="{_n(a)}" cy="{_n(b)}" r="4" fill="{ORANGE}"/>')
    return svg(W, H, "".join(out))


def stemleaf(rows, note="", W=300):
    """rows [(줄기, '잎 문자열')]"""
    rh = 28
    H = rh * (len(rows) + 1) + 36
    out = [text(60, 22, "줄기", 13, "end", "bold"), text(90, 22, "잎", 13, "start", "bold"), line(70, 8, 70, 8 + rh * (len(rows) + 1), 2), line(20, 30, W - 20, 30, 2)]
    for i, (s, lv) in enumerate(rows):
        y = 30 + rh * (i + 1) - 8
        out.append(text(60, y, s, 14, "end"))
        out.append(text(82, y, " ".join(lv.split()), 14, "start"))
    if note:
        out.append(text(20, H - 8, note, 12, "start"))
    return svg(W, H, "".join(out))


def boxplot(rows, lo, hi, step, W=330, unit=""):
    """rows [(라벨,최솟값,Q1,중앙값,Q3,최댓값)] 가로 상자그림"""
    x0, x1 = 56, W - 20
    rh = 50
    H = 14 + rh * len(rows) + 40
    sc = (x1 - x0) / (hi - lo)
    X = lambda v: x0 + (v - lo) * sc
    yb = 14 + rh * len(rows)
    out = [line(x0, yb, x1, yb, 2)]
    v = lo
    while v <= hi + 1e-9:
        out.append(line(X(v), 8, X(v), yb, 1.2, 0.2))
        out.append(line(X(v), yb, X(v), yb + 5, 2))
        out.append(text(X(v), yb + 20, int(v), 12))
        v += step
    if unit:
        out.append(text(x1, yb + 36, unit, 12, "end"))
    for i, (lab, mn, q1, md, q3, mx) in enumerate(rows):
        cy = 14 + rh * i + rh / 2
        out.append(text(x0 - 8, cy + 5, lab, 14, "end", "bold"))
        out.append(line(X(mn), cy, X(q1), cy, 2.5))
        out.append(line(X(q3), cy, X(mx), cy, 2.5))
        out.append(line(X(mn), cy - 8, X(mn), cy + 8, 2.5))
        out.append(line(X(mx), cy - 8, X(mx), cy + 8, 2.5))
        out.append(f'<rect x="{_n(X(q1))}" y="{_n(cy - 14)}" width="{_n(X(q3) - X(q1))}" height="28" fill="{BLUE}" fill-opacity="0.3" stroke="currentColor" stroke-width="2.5"/>')
        out.append(line(X(md), cy - 14, X(md), cy + 14, 3.5, color=ORANGE))
    return svg(W, H, "".join(out))


def scatter(points, xr, yr, xstep, ystep, xlab="", ylab="", W=300, H=230, diag=False):
    x0, y0, pw, ph = 46, 26, W - 70, H - 70
    yb = y0 + ph
    X = lambda v: x0 + (v - xr[0]) / (xr[1] - xr[0]) * pw
    Y = lambda v: yb - (v - yr[0]) / (yr[1] - yr[0]) * ph
    out = [text(x0 - 6, 16, ylab, 12, "end"), text(x0 + pw + 4, yb + 36, xlab, 12, "end")]
    v = xr[0]
    while v <= xr[1] + 1e-9:
        out.append(line(X(v), y0, X(v), yb, 1.2, 0.2))
        out.append(text(X(v), yb + 18, int(v), 12))
        v += xstep
    v = yr[0]
    while v <= yr[1] + 1e-9:
        out.append(line(x0, Y(v), x0 + pw, Y(v), 1.2, 0.2))
        out.append(text(x0 - 6, Y(v) + 4, int(v), 12, "end"))
        v += ystep
    out.append(line(x0, y0 - 4, x0, yb, 2))
    out.append(line(x0, yb, x0 + pw + 4, yb, 2))
    if diag:
        out.append(line(X(xr[0]), Y(xr[0]), X(xr[1]), Y(xr[1]), 2.2, dash="6 5", color=ORANGE))
    for a, b in points:
        out.append(f'<circle cx="{_n(X(a))}" cy="{_n(Y(b))}" r="4.5" fill="{BLUE}"/>')
    return svg(W, H, "".join(out))
