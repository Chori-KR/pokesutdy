"""과학 묶음 공통 그림 도구: 순서 상자(flow), 물컵, 달 모양, 별자리.
svgkit.py 규칙: viewBox만, 글자 12 이상, 선 2 이상, 배경 없음, currentColor + 파랑/주황만, 색만으로 구분하지 않기."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, table, BLUE, ORANGE, C, _n

ST = f'stroke="{C}" stroke-width="2.5" stroke-linejoin="round"'


def flow(labels, W=330, hot=None, bh=58, size=12):
    """가로 순서 상자. labels: 줄바꿈은 '\\n'. hot: 주황 테두리로 강조할 번호(들)"""
    n = len(labels)
    gap = 14
    bw = (W - 8 - gap * (n - 1)) / n
    hot = hot if isinstance(hot, (list, tuple)) else ([] if hot is None else [hot])
    out = []
    for i, lab in enumerate(labels):
        x = 4 + i * (bw + gap)
        col = ORANGE if i in hot else C
        out.append(f'<rect x="{_n(x)}" y="6" width="{_n(bw)}" height="{bh}" rx="6" fill="none" stroke="{col}" stroke-width="2.5"/>')
        ls = lab.split("\n")
        y0 = 6 + bh / 2 - (len(ls) - 1) * (size + 2) / 2 + 4
        for k, s in enumerate(ls):
            out.append(text(x + bw / 2, y0 + k * (size + 2), s, size, weight="bold" if i in hot else None))
        if i < n - 1:
            ax = x + bw + 2
            out.append(line(ax, 6 + bh / 2, ax + gap - 4, 6 + bh / 2, 2.5))
            out.append(f'<polygon points="{_n(ax + gap - 1)},{6 + bh / 2} {_n(ax + gap - 7)},{6 + bh / 2 - 4} {_n(ax + gap - 7)},{6 + bh / 2 + 4}" fill="{C}"/>')
    return svg(W, bh + 12, "".join(out))


def cup(level=0.6, label=None, w=64, h=70, extra="", water=True, mark=None):
    """윗면이 열린 컵. level 0~1만큼 물. extra: 컵 안에 그릴 도형(좌표는 0,0이 컵 왼쪽 위)"""
    x0, top = 14, 12
    bot = top + h
    out = []
    if water and level > 0:
        wh = h * level
        out.append(f'<rect x="{x0 + 1}" y="{_n(bot - wh)}" width="{w - 2}" height="{_n(wh)}" fill="{BLUE}" fill-opacity="0.35"/>')
        out.append(f'<polyline points="{x0 + 1},{_n(bot - wh)} {x0 + w - 1},{_n(bot - wh)}" fill="none" stroke="{BLUE}" stroke-width="2.5"/>')
    out.append(f'<g transform="translate({x0},{top})">{extra}</g>')
    out.append(f'<polyline points="{x0},{top} {x0},{bot} {x0 + w},{bot} {x0 + w},{top}" fill="none" stroke="{C}" stroke-width="3" stroke-linejoin="round"/>')
    if label:
        out.append(text(x0 + w / 2, bot + 20, label, 13, weight="bold"))
    return svg(w + 28, bot + 30, "".join(out))


def moon(f, side="R", r=26, label=None):
    """달 모양. f: 밝은 부분 비율 0~1, side: 'R' 오른쪽이 밝음 / 'L' 왼쪽이 밝음. 밝은 부분은 주황 채움 + 둘레는 선."""
    cx, cy = r + 8, r + 8
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="2.5"/>']
    if f >= 0.99:
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{ORANGE}" fill-opacity="0.55" stroke="{C}" stroke-width="2.5"/>')
    elif f > 0.01:
        if f < 0.5:
            rx, sw = (1 - 2 * f) * r, 0
        else:
            rx, sw = (2 * f - 1) * r, 1
        d = f"M{cx},{cy - r} A{r},{r} 0 0 1 {cx},{cy + r} A{_n(max(rx, 0.01))},{r} 0 0 {sw} {cx},{cy - r} Z"
        tr = f' transform="translate({2 * cx},0) scale(-1,1)"' if side == "L" else ""
        out.append(f'<path d="{d}" fill="{ORANGE}" fill-opacity="0.55" stroke="{C}" stroke-width="2"{tr}/>')
    if label:
        out.append(text(cx, cy + r + 20, label, 13, weight="bold"))
    return svg(2 * cx, cy + r + (28 if label else 8), "".join(out))


def stars(pts, links=(), names=None, W=200, H=150, hot=None):
    """별자리: pts [(x,y)] 0~1 비율, links [(i,j)], names {i: 이름}, hot: 강조할 별 번호(북극성 등)"""
    out = []
    for i, j in links:
        a, b_ = pts[i], pts[j]
        out.append(line(a[0] * W, a[1] * H, b_[0] * W, b_[1] * H, 2, 0.6))
    for i, (x, y) in enumerate(pts):
        X, Y = x * W, y * H
        if hot is not None and i == hot:
            out.append(f'<polygon points="{_n(X)},{_n(Y - 9)} {_n(X + 3)},{_n(Y - 3)} {_n(X + 9)},{_n(Y)} {_n(X + 3)},{_n(Y + 3)} {_n(X)},{_n(Y + 9)} {_n(X - 3)},{_n(Y + 3)} {_n(X - 9)},{_n(Y)} {_n(X - 3)},{_n(Y - 3)}" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
        else:
            out.append(f'<circle cx="{_n(X)}" cy="{_n(Y)}" r="4" fill="{C}"/>')
        if names and i in names:
            out.append(text(X, Y - 12, names[i], 13, weight="bold"))
    return svg(W, H, "".join(out))


def syringe(level=0.5, label=None, W=170):
    """가로 주사기. level 0~1: 피스톤이 밀려 들어간 정도(0=끝까지 당김, 1=끝까지 누름 아님). 공기 부분은 점선 칸 + 파란 옅은 색."""
    x0, x1 = 44, 124
    px = x0 + level * (x1 - x0)
    out = [f'<rect x="{x0}" y="18" width="{x1 - x0}" height="30" fill="none" stroke="{C}" stroke-width="3"/>',
           f'<rect x="{_n(px)}" y="20" width="{_n(x1 - px)}" height="26" fill="{BLUE}" fill-opacity="0.25"/>',
           line(px, 16, px, 50, 5),
           line(px - 28, 33, px, 33, 4),
           line(px - 28, 22, px - 28, 44, 4),
           line(x1, 33, x1 + 16, 33, 4)]
    if x1 - px > 26:
        out.append(text((px + x1) / 2, 37, "공기", 12, weight="bold"))
    if label:
        out.append(text(W / 2 - 4, 76, label, 13, weight="bold"))
    return svg(W, 84 if label else 58, "".join(out))


def flask_balloon(state="big", label=None, W=130):
    """삼각 플라스크 입구의 풍선. state: big(부풀음) / mid / small(쪼그라듦)"""
    out = [f'<path d="M52,56 L52,78 L26,116 L94,116 L68,78 L68,56" fill="none" stroke="{C}" stroke-width="3" stroke-linejoin="round"/>']
    rr = {"big": 26, "mid": 16, "small": 8}[state]
    cy = 56 - rr - 2
    out.append(f'<ellipse cx="60" cy="{cy}" rx="{rr}" ry="{rr + 2}" fill="{ORANGE}" fill-opacity="0.35" stroke="{C}" stroke-width="2.5"/>')
    out.append(line(52, 56, 68, 56, 3))
    if label:
        out.append(text(60, 140, label, 13, weight="bold"))
    return svg(W, 148 if label else 124, "".join(out))
