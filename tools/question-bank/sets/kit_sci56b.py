"""초5-6 과학 그림 도구 2: 용액 비커, 전기 회로, 전자석, 지층, 낮과 밤, 거름 장치, 증발 접시, 팔(뼈와 근육).
svgkit 규칙(글자 12↑, 선 2↑, currentColor+파랑/주황)을 따른다."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, BLUE, ORANGE, C, _n
from kit_sci import cup
from kit_sci56 import _arrow

_DOTS = [(10, 62), (24, 64), (38, 60), (52, 63), (17, 52), (31, 54), (45, 52), (10, 42), (24, 44), (38, 42), (52, 44), (31, 34), (17, 34), (45, 33)]


def beaker_dots(n, level=0.75, label=None, w=64, h=70):
    """용질 알갱이를 n개 그린 비커(진하기 비교용). 알갱이가 많을수록 진한 용액"""
    dots = "".join(f'<circle cx="{x}" cy="{y}" r="3.5" fill="{ORANGE}" stroke="{C}" stroke-width="1.5"/>' for x, y in _DOTS[:n])
    return cup(level, label, w=w, h=h, extra=dots)


def _bulb(cx, cy, on=False):
    o = f'<circle cx="{cx}" cy="{cy}" r="15" fill="{ORANGE if on else "none"}" fill-opacity="0.55" stroke="{C}" stroke-width="2.5"/>'
    o += line(cx - 9, cy - 9, cx + 9, cy + 9, 2.5) + line(cx - 9, cy + 9, cx + 9, cy - 9, 2.5)
    return o


def _cell(cx, y):
    """가로 전지 기호: 긴 선(+)과 짧은 선(-)"""
    return (line(cx - 4, y - 12, cx - 4, y + 12, 3) + line(cx + 4, y - 7, cx + 4, y + 7, 3))


def circuit(bulbs=1, cells=1, closed=True, label_parts=True, W=250):
    """전지 cells개를 직렬로 이은 회로에 전구 bulbs개. closed=False이면 오른쪽에 끊어진 곳이 있음"""
    x0, x1, y0, y1 = 28, W - 28, 30, 110
    out = []
    # 위쪽: 전구
    pos = [W / 2] if bulbs == 1 else [W / 2 - 34, W / 2 + 34]
    segs = [x0] + [p for p in pos for p in (p - 15, p + 15)] + [x1]
    out.append(line(x0, y0, pos[0] - 15, y0, 2.5))
    for k, p in enumerate(pos):
        out.append(_bulb(p, y0, on=closed))
        if k + 1 < len(pos):
            out.append(line(p + 15, y0, pos[k + 1] - 15, y0, 2.5))
    out.append(line(pos[-1] + 15, y0, x1, y0, 2.5))
    # 오른쪽: 끊어짐
    if closed:
        out.append(line(x1, y0, x1, y1, 2.5))
    else:
        out.append(line(x1, y0, x1, 62, 2.5))
        out.append(line(x1, 76, x1, y1, 2.5))
        out.append(line(x1, 62, x1 - 12, 72, 2.5, color=ORANGE))
    # 아래쪽: 전지
    cx = W / 2
    cxs = [cx - 12 * (cells - 1) + 24 * k for k in range(cells)]
    out.append(line(x0, y1, cxs[0] - 6, y1, 2.5))
    for k, c in enumerate(cxs):
        out.append(_cell(c, y1))
        if k + 1 < cells:
            out.append(line(c + 4, y1, cxs[k + 1] - 4, y1, 2.5))
    out.append(line(cxs[-1] + 4, y1, x1, y1, 2.5))
    out.append(line(x0, y0, x0, y1, 2.5))
    if label_parts:
        out.append(text(pos[0] if bulbs == 1 else W / 2, 12, "전구" if bulbs == 1 else "전구 2개", 12))
        out.append(text(cx, y1 + 22, f"전지 {cells}개", 12))
        if not closed:
            out.append(text(x1 - 4, 52, "끊어짐", 12, anchor="end"))
    return svg(W, 140, "".join(out))


def electromagnet(turns=4, cells=1, clips=3, W=250):
    """철못에 코일을 감은 전자석. 못 끝에 클립 clips개가 붙어 있음"""
    out = [f'<rect x="50" y="46" width="150" height="12" rx="3" fill="none" stroke="{C}" stroke-width="2.5"/>']
    out.append(f'<polygon points="200,46 214,52 200,58" fill="none" stroke="{C}" stroke-width="2.5"/>')
    for k in range(turns):
        x = 70 + k * 16
        out.append(f'<path d="M{x},40 Q{x + 8},52 {x},64" fill="none" stroke="{ORANGE}" stroke-width="3"/>')
    out.append(line(70, 40, 70, 20, 2.5) + line(70, 20, 110, 20, 2.5))
    out.append(line(70 + (turns - 1) * 16, 64, 70 + (turns - 1) * 16, 84, 2.5))
    out.append(line(70 + (turns - 1) * 16, 84, 60, 84, 2.5))
    for k in range(clips):
        out.append(f'<ellipse cx="{206 + (k % 2) * 4}" cy="{70 + k * 8}" rx="6" ry="3.5" fill="none" stroke="{C}" stroke-width="2"/>')
    cxs = [150 + 24 * k for k in range(cells)]
    out.append(line(110, 20, cxs[0] - 6, 20, 2.5))
    out.append(line(110, 20, 110, 20, 2))
    for k, c in enumerate(cxs):
        out.append(_cell(c, 20))
        if k + 1 < cells:
            out.append(line(c + 4, 20, cxs[k + 1] - 4, 20, 2.5))
    out.append(line(cxs[-1] + 4, 20, cxs[-1] + 28, 20, 2.5) + line(cxs[-1] + 28, 20, cxs[-1] + 28, 100, 2.5))
    out.append(line(cxs[-1] + 28, 100, 60, 100, 2.5) + line(60, 100, 60, 84, 2.5))
    out.append(text(120, 118, f"코일 {turns}번 감음 · 전지 {cells}개", 13, weight="bold"))
    out.append(text(206, 126, "클립", 12, anchor="start"))
    return svg(W + 40, 134, "".join(out))


def strata(layers, W=300, lh=38):
    """지층 단면. layers: [(이름, 종류)] 위→아래. 종류: gravel/sand/mud/fossil"""
    x0, w = 14, 150
    out = []
    for i, (nm, kind) in enumerate(layers):
        y = 10 + i * lh
        out.append(f'<rect x="{x0}" y="{y}" width="{w}" height="{lh}" fill="{BLUE if i % 2 == 0 else "none"}" fill-opacity="0.18" stroke="{C}" stroke-width="2.5"/>')
        if kind in ("gravel", "fossil_g"):
            for k in range(5):
                out.append(f'<circle cx="{x0 + 18 + k * 28}" cy="{y + 12 + (k % 2) * 12}" r="6" fill="none" stroke="{C}" stroke-width="2"/>')
        elif kind == "sand":
            for k in range(14):
                out.append(f'<circle cx="{x0 + 10 + k * 10.5}" cy="{y + 10 + (k * 7) % 20}" r="2" fill="{C}"/>')
        elif kind == "mud":
            for k in range(4):
                out.append(line(x0 + 8, y + 8 + k * 7, x0 + w - 8, y + 8 + k * 7, 2, 0.45))
        elif kind == "fossil":
            out.append(f'<ellipse cx="{x0 + w / 2}" cy="{y + lh / 2}" rx="18" ry="11" fill="none" stroke="{C}" stroke-width="2.5"/>')
            for k in range(-2, 3):
                out.append(line(x0 + w / 2 + k * 6, y + lh / 2 - 9, x0 + w / 2 + k * 6, y + lh / 2 + 9, 2))
        out.append(text(x0 + w + 12, y + lh / 2 + 5, nm, 13, anchor="start"))
    return svg(W, 20 + len(layers) * lh, "".join(out))


def day_night(labels, W=270):
    """지구 낮과 밤. labels {'day': '㉠', 'night': '㉡'}: 태양 쪽(왼쪽) 점과 반대쪽(오른쪽) 점"""
    cx, cy, r = 150, 90, 50
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="3"/>']
    out.append(f'<path d="M{cx},{cy - r} A{r},{r} 0 0 1 {cx},{cy + r} Z" fill="{C}" fill-opacity="0.35"/>')
    for dy in (-30, 0, 30):
        out.append(_arrow(20, cy + dy, 82, cy + dy, 2.5, ORANGE))
    out.append(text(52, cy - 44, "태양 빛", 12))
    out.append(f'<circle cx="{cx - r + 8}" cy="{cy}" r="5" fill="{C}"/>')
    out.append(text(cx - r + 24, cy + 4, labels["day"], 15, weight="bold"))
    out.append(f'<circle cx="{cx + r - 8}" cy="{cy}" r="5" fill="{C}"/>')
    out.append(text(cx + r - 26, cy + 4, labels["night"], 15, weight="bold"))
    out.append(line(cx, cy - r - 16, cx, cy + r + 16, 2, dash="5 4"))
    return svg(W, 170, "".join(out))


def funnel_fig(W=220):
    """거름 장치: 깔때기 + 거름종이 + 비커"""
    out = [f'<polygon points="50,18 130,18 100,66 80,66" fill="none" stroke="{C}" stroke-width="2.5"/>']
    out.append(line(80, 66, 80, 84, 2.5) + line(100, 66, 100, 84, 2.5))
    out.append(line(56, 24, 90, 66, 2, dash="5 4", color=ORANGE) + line(124, 24, 90, 66, 2, dash="5 4", color=ORANGE))
    out.append(f'<polyline points="56,100 56,150 124,150 124,100" fill="none" stroke="{C}" stroke-width="3"/>')
    out.append(f'<rect x="57" y="130" width="66" height="19" fill="{BLUE}" fill-opacity="0.3"/>')
    out.append(text(150, 40, "깔때기", 12, anchor="start"))
    out.append(text(150, 62, "거름종이", 12, anchor="start"))
    out.append(text(150, 128, "비커", 12, anchor="start"))
    return svg(W, 160, "".join(out))


def evap_dish(W=220):
    """증발 접시를 알코올램프로 가열"""
    out = [f'<path d="M50,50 Q90,110 130,50 Z" fill="none" stroke="{C}" stroke-width="2.5"/>']
    out.append(f'<path d="M62,58 Q90,66 118,58" fill="none" stroke="{BLUE}" stroke-width="2.5"/>')
    out.append(f'<rect x="76" y="116" width="28" height="30" rx="4" fill="none" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<ellipse cx="90" cy="106" rx="5" ry="9" fill="{ORANGE}" fill-opacity="0.85" stroke="{C}" stroke-width="2"/>')
    out.append(text(150, 54, "증발 접시", 12, anchor="start"))
    out.append(text(150, 134, "알코올램프", 12, anchor="start"))
    return svg(W, 158, "".join(out))


def arm_fig(bent, W=220):
    """팔의 뼈와 근육. bent=True이면 팔을 구부림(근육이 줄어들어 굵어짐)"""
    out = []
    sx, sy, ex, ey = 60, 20, 60, 100
    out.append(f'<rect x="{sx - 7}" y="{sy}" width="14" height="{ey - sy}" rx="6" fill="none" stroke="{C}" stroke-width="2.5"/>')
    if bent:
        out.append(f'<rect x="{ex - 7}" y="{ey - 7}" width="90" height="14" rx="6" fill="none" stroke="{C}" stroke-width="2.5"/>')
        out.append(f'<ellipse cx="{ex + 22}" cy="{(sy + ey) / 2}" rx="15" ry="27" fill="{BLUE}" fill-opacity="0.35" stroke="{C}" stroke-width="2.5"/>')
        out.append(text(ex + 46, (sy + ey) / 2 - 4, "근육(줄어듦)", 12, anchor="start"))
    else:
        out.append(f'<rect x="{ex - 7}" y="{ey}" width="14" height="80" rx="6" fill="none" stroke="{C}" stroke-width="2.5"/>')
        out.append(f'<ellipse cx="{ex + 18}" cy="{(sy + ey) / 2}" rx="9" ry="36" fill="{BLUE}" fill-opacity="0.2" stroke="{C}" stroke-width="2.5"/>')
        out.append(text(ex + 34, (sy + ey) / 2 - 4, "근육(늘어남)", 12, anchor="start"))
    out.append(f'<circle cx="{ex}" cy="{ey}" r="6" fill="{ORANGE}" stroke="{C}" stroke-width="2"/>')
    out.append(text(ex - 12, ey + 18, "관절", 12, anchor="end"))
    out.append(text(sx - 14, 40, "뼈", 12, anchor="end"))
    return svg(W, 190, "".join(out))


def beside(*svgs, gap=10):
    """그림 여러 개를 가로로 나란히 붙인다 (세로는 가운데 맞춤)"""
    from svgkit import _vb
    parts = [_vb(s) for s in svgs]
    H = max(h for _, h, _ in parts)
    x = 0
    out = []
    for w, h, body in parts:
        out.append(f'<g transform="translate({_n(x)} {_n((H - h) / 2)})">{body}</g>')
        x += w + gap
    return svg(_n(x - gap), _n(H), "".join(out))
