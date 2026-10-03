"""사회 묶음 공통 그림 도구: 지도(기호·범례·방위표), 연표, 비교 상자.
svgkit.py 규칙: viewBox만, 글자 12 이상, 선 2 이상, 배경 없음, currentColor + 파랑/주황만, 색만으로 구분하지 않기."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, table, BLUE, ORANGE, C, _n

ST = f'stroke="{C}" stroke-width="2.5" stroke-linejoin="round"'
NAMES = {"school": "학교", "hospital": "병원", "park": "공원", "library": "도서관", "station": "역", "market": "시장", "office": "시청", "temple": "절"}


def glyph(kind, cx, cy, s=11):
    """지도 기호 (모양이 서로 다르다)"""
    if kind == "school":
        return (f'<rect x="{_n(cx - s)}" y="{_n(cy - s * 0.4)}" width="{2 * s}" height="{_n(s * 1.4)}" fill="{BLUE}" fill-opacity="0.35" {ST}/>'
                f'<polygon points="{_n(cx - s - 2)},{_n(cy - s * 0.4)} {_n(cx)},{_n(cy - s * 1.2)} {_n(cx + s + 2)},{_n(cy - s * 0.4)}" fill="none" {ST}/>')
    if kind == "hospital":
        return (f'<rect x="{_n(cx - s)}" y="{_n(cy - s)}" width="{2 * s}" height="{2 * s}" fill="none" {ST}/>'
                + line(cx, cy - s * 0.6, cx, cy + s * 0.6, 3, color=ORANGE) + line(cx - s * 0.6, cy, cx + s * 0.6, cy, 3, color=ORANGE))
    if kind == "park":
        return (f'<circle cx="{_n(cx)}" cy="{_n(cy - 3)}" r="{_n(s * 0.8)}" fill="{BLUE}" fill-opacity="0.35" {ST}/>' + line(cx, cy + s * 0.5, cx, cy + s, 3))
    if kind == "library":
        return (f'<rect x="{_n(cx - s)}" y="{_n(cy - s * 0.8)}" width="{2 * s}" height="{_n(s * 1.6)}" fill="none" {ST}/>'
                + line(cx - s * 0.5, cy - s * 0.3, cx + s * 0.5, cy - s * 0.3, 2) + line(cx - s * 0.5, cy + s * 0.3, cx + s * 0.5, cy + s * 0.3, 2))
    if kind == "station":
        return (f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{s}" fill="none" {ST}/>' + text(cx, cy + 5, "▲", 12))
    if kind == "market":
        return (f'<polygon points="{_n(cx - s)},{_n(cy + s * 0.8)} {_n(cx - s * 0.7)},{_n(cy - s * 0.6)} {_n(cx + s * 0.7)},{_n(cy - s * 0.6)} {_n(cx + s)},{_n(cy + s * 0.8)}" fill="{ORANGE}" fill-opacity="0.35" {ST}/>')
    if kind == "office":
        return (f'<polygon points="{_n(cx)},{_n(cy - s)} {_n(cx + s)},{_n(cy - s * 0.2)} {_n(cx + s * 0.6)},{_n(cy + s)} {_n(cx - s * 0.6)},{_n(cy + s)} {_n(cx - s)},{_n(cy - s * 0.2)}" fill="none" {ST}/>')
    if kind == "temple":
        return (f'<polygon points="{_n(cx - s)},{_n(cy - s * 0.1)} {_n(cx)},{_n(cy - s)} {_n(cx + s)},{_n(cy - s * 0.1)}" fill="none" {ST}/>' + line(cx - s * 0.6, cy - s * 0.1, cx - s * 0.6, cy + s, 3) + line(cx + s * 0.6, cy - s * 0.1, cx + s * 0.6, cy + s, 3))
    raise ValueError(kind)


def compass(cx, cy, r=22):
    """방위표: 북쪽 화살표와 동서남북 글자"""
    return (line(cx, cy + r * 0.8, cx, cy - r * 0.8, 3) + f'<polygon points="{_n(cx)},{_n(cy - r)} {_n(cx - 6)},{_n(cy - r + 12)} {_n(cx + 6)},{_n(cy - r + 12)}" fill="{C}"/>'
            + line(cx - r * 0.7, cy, cx + r * 0.7, cy, 2.5)
            + text(cx, cy - r - 4, "북", 13, weight="bold") + text(cx, cy + r + 14, "남", 13, weight="bold")
            + text(cx + r + 10, cy + 5, "동", 13, weight="bold") + text(cx - r - 10, cy + 5, "서", 13, weight="bold"))


def map_fig(places, roads=(), legend=True, with_compass=True, scale=None, W=320, H=220, labels=False, river=None):
    """places: [(종류, x, y)] 0~1 비율 좌표. roads: [((x1,y1),(x2,y2))]. legend: 기호 설명 상자 표시.
    labels=True면 기호 옆에 이름을 직접 적는다."""
    mw, mh = 214, H - 12
    ox, oy = 6, 6
    out = [f'<rect x="{ox}" y="{oy}" width="{mw}" height="{mh}" rx="6" fill="none" stroke="{C}" stroke-width="2.5"/>']
    if river:
        pts = " ".join(f"{_n(ox + x * mw)},{_n(oy + y * mh)}" for x, y in river)
        out.append(f'<polyline points="{pts}" fill="none" stroke="{BLUE}" stroke-width="7" stroke-opacity="0.55" stroke-linecap="round"/>')
        mx, my = river[len(river) // 2]
        out.append(text(ox + mx * mw + 14, oy + my * mh - 8, "강", 13, "start", "bold"))
    for (a, b_) in roads:
        out.append(line(ox + a[0] * mw, oy + a[1] * mh, ox + b_[0] * mw, oy + b_[1] * mh, 4, 0.45))
    kinds = []
    for kind, x, y in places:
        cx, cy = ox + x * mw, oy + y * mh
        out.append(glyph(kind, cx, cy))
        if labels:
            out.append(text(cx, cy + 26, NAMES[kind], 12, weight="bold"))
        if kind not in kinds:
            kinds.append(kind)
    if with_compass:
        out.append(compass(ox + mw - 38, oy + mh - 34, 16))
    if scale:
        out.append(line(ox + 12, oy + mh - 14, ox + 12 + scale[0], oy + mh - 14, 3.5) + text(ox + 12 + scale[0] / 2, oy + mh - 20, scale[1], 12, weight="bold"))
    if legend:
        lx, ly = ox + mw + 10, oy
        out.append(f'<rect x="{lx}" y="{ly}" width="{W - lx - 4}" height="{12 + 32 * len(kinds) + 24}" rx="6" fill="none" stroke="{C}" stroke-width="2"/>')
        out.append(text(lx + (W - lx - 4) / 2, ly + 18, "범례", 13, weight="bold"))
        for i, k in enumerate(kinds):
            y = ly + 44 + i * 32
            out.append(glyph(k, lx + 18, y, 9))
            out.append(text(lx + 34, y + 5, NAMES[k], 12, "start"))
    return svg(W, H, "".join(out))


def timeline(points, title=None, W=320):
    """points: [(위치 라벨 위, 설명 아래)] 가로 연표(왼쪽 옛날 → 오른쪽 오늘)"""
    n = len(points)
    x0, x1 = 24, W - 24
    y = 52
    out = [line(x0 - 8, y, x1 + 8, y, 3)]
    out.append(f'<polygon points="{x1 + 14},{y} {x1 + 4},{y - 6} {x1 + 4},{y + 6}" fill="{C}"/>')
    for i, (top, bottom) in enumerate(points):
        x = x0 + (x1 - x0) * i / max(n - 1, 1)
        out.append(f'<circle cx="{_n(x)}" cy="{y}" r="6" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
        out.append(text(x, y - 14, top, 13, weight="bold"))
        out.append(text(x, y + 26, bottom, 12))
    return svg(W + 14, 96, "".join(out))


def compare_table(head, rows, first_w=70, col_w=110):
    return table(head, rows, first_w=first_w, col_w=col_w)
