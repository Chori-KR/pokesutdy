"""음악 묶음 공통 그림 도구: 오선, 음표, 쉼표, 리듬 칸, 가락선.
svgkit.py 규칙: viewBox만, 글자 12 이상, 선 2 이상, 배경 없음, currentColor + 파랑/주황만."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, BLUE, ORANGE, C, _n

SP = 10  # 선 간격
# 높은음자리표(sol) 기준: 아래 첫째 줄 = 미(E4). step: 미=0, 파=1, 솔=2, 라=3, 시=4, 도'=5, 레'=6, 미'=7, 파'=8, 도(아래)=-2, 레(아래)=-1
STEP = {"도": -2, "레": -1, "미": 0, "파": 1, "솔": 2, "라": 3, "시": 4, "도'": 5, "레'": 6, "미'": 7, "파'": 8}


def _clef(x, ybot):
    """간단한 높은음자리표(곡선 하나 + 동그라미)"""
    y = ybot
    d = (f"M{x + 8},{y - 18} C{x + 22},{y - 30} {x + 26},{y - 46} {x + 14},{y - 52} C{x + 4},{y - 56} {x - 4},{y - 44} {x + 4},{y - 32} "
         f"C{x + 12},{y - 22} {x + 14},{y - 6} {x + 14},{y + 4} C{x + 14},{y + 14} {x + 2},{y + 14} {x + 2},{y + 6} C{x + 2},{y} {x + 10},{y - 4} {x + 12},{y + 2}")
    return f'<path d="{d}" fill="none" stroke="{C}" stroke-width="2.4" stroke-linecap="round"/>'


def staff(notes, W=None, clef=True, beats_bar=None, labels=None, hot=None, gap=36):
    """오선 악보. notes: [(음이름, 종류)] 종류: w(온) h(2분) q(4분) e(8분) 또는 쉼표 'rq','rh','rw','re'. 음이름 '-'는 쉼표용.
    beats_bar: 한 마디의 박 수(4분음표 기준)면 마디선을 그려 줌. labels: 음 아래 글자 목록. hot: 강조할 음 번호."""
    n = len(notes)
    x0 = 56 if clef else 16
    top = 36
    ybot = top + 4 * SP
    out = [line(6, top + i * SP, (W or 0) or 0, top + i * SP, 1.6) for i in range(0)]  # placeholder
    xs = []
    x = x0
    bar_beats = 0
    bars = []
    for i, (p, k) in enumerate(notes):
        xs.append(x)
        x += gap
        if beats_bar:
            bar_beats += {"w": 4, "h": 2, "q": 1, "e": 0.5, "rq": 1, "rh": 2, "rw": 4, "re": 0.5}[k]
            if abs(bar_beats - beats_bar) < 1e-6 and i < n - 1:
                bars.append(x - gap / 2 + 4)
                x += 10
                bar_beats = 0
    Wd = W or (x + 12)
    out = [line(6, top + i * SP, Wd - 6, top + i * SP, 1.8) for i in range(5)]
    out.append(line(6, top, 6, ybot, 2))
    out.append(line(Wd - 6, top, Wd - 6, ybot, 3))
    for bx in bars:
        out.append(line(bx, top, bx, ybot, 2))
    if clef:
        out.append(_clef(24, ybot))
    for i, ((p, k), x) in enumerate(zip(notes, xs)):
        col = ORANGE if hot == i else C
        if k.startswith("r"):
            if k == "rq":
                out.append(f'<path d="M{x - 3},{top + 6} l6,8 l-6,6 l6,8 q-8,0 -4,8" fill="none" stroke="{col}" stroke-width="2.4" stroke-linejoin="round"/>')
            elif k == "rh":
                out.append(f'<rect x="{x - 7}" y="{top + 2 * SP - 5}" width="14" height="5" fill="{col}"/>')
            elif k == "rw":
                out.append(f'<rect x="{x - 7}" y="{top + SP}" width="14" height="5" fill="{col}"/>')
            else:
                out.append(f'<path d="M{x - 4},{top + 14} l8,-6 M{x + 2},{top + 8} l-6,16" fill="none" stroke="{col}" stroke-width="2.4"/><circle cx="{x - 4}" cy="{top + 14}" r="2.6" fill="{col}"/>')
        else:
            st = STEP[p]
            y = ybot - st * SP / 2
            if st <= -2:  # 도(아래) 보조선
                out.append(line(x - 11, ybot + SP, x + 11, ybot + SP, 1.8))
            fill = "none" if k in ("w", "h") else col
            out.append(f'<ellipse cx="{x}" cy="{_n(y)}" rx="6.8" ry="5" transform="rotate(-20 {x} {_n(y)})" fill="{fill}" stroke="{col}" stroke-width="2.2"/>')
            if k != "w":
                up = st < 4
                sx = x + 6 if up else x - 6
                y2 = y - 28 if up else y + 28
                out.append(line(sx, y, sx, y2, 2.2, color=col))
                if k == "e":
                    if up:
                        out.append(f'<path d="M{sx},{_n(y2)} q10,6 6,16" fill="none" stroke="{col}" stroke-width="2.4"/>')
                    else:
                        out.append(f'<path d="M{sx},{_n(y2)} q-10,-6 -6,-16" fill="none" stroke="{col}" stroke-width="2.4"/>')
        if labels:
            out.append(text(x, ybot + 34, labels[i], 13, weight="bold"))
    H = ybot + (46 if labels else 22)
    return svg(Wd, H, "".join(out))


def rhythm_boxes(items, W=None, w=44):
    """리듬 칸: items 글자 목록(예: ['♩','♩','♪♪','♩'])"""
    out = []
    for i, s in enumerate(items):
        x = 4 + i * w
        out.append(f'<rect x="{x}" y="4" width="{w}" height="40" fill="none" stroke="{C}" stroke-width="2.2"/>')
        out.append(text(x + w / 2, 33, s, 22))
    return svg(8 + len(items) * w, 48, "".join(out))


def contour(vals, W=None, labels=None, hot=None):
    """가락선: vals 높이(0이 낮음, 클수록 높음)"""
    n = len(vals)
    W = W or (40 + 36 * n)
    mx = max(vals) or 1
    pts = [(24 + i * (W - 48) / max(n - 1, 1), 70 - v * 46 / mx) for i, v in enumerate(vals)]
    out = [f'<polyline points="{" ".join(f"{_n(x)},{_n(y)}" for x, y in pts)}" fill="none" stroke="{BLUE}" stroke-width="3"/>']
    for i, (x, y) in enumerate(pts):
        out.append(f'<circle cx="{_n(x)}" cy="{_n(y)}" r="5" fill="{ORANGE if hot == i else C}" stroke="{C}" stroke-width="2"/>')
        if labels:
            out.append(text(x, 94, labels[i], 13, weight="bold"))
    return svg(W, 100 if labels else 84, "".join(out))
