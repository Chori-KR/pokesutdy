"""초5-6 과학 그림 도구: 온도계, 지구 공전, 태양 고도·그림자, 빛의 반사·굴절, 렌즈,
기압 분포, 식물 기관, 현미경, 세포.  svgkit 규칙(글자 12↑, 선 2↑, currentColor+파랑/주황)을 따른다."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, BLUE, ORANGE, C, _n


def _arrow(x1, y1, x2, y2, w=2.5, color=C):
    a = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 9 * math.cos(a), y2 - 9 * math.sin(a)
    p1 = (hx + 4.5 * math.sin(a), hy - 4.5 * math.cos(a))
    p2 = (hx - 4.5 * math.sin(a), hy + 4.5 * math.cos(a))
    return (line(x1, y1, hx, hy, w, color=color) +
            f'<polygon points="{_n(x2)},{_n(y2)} {_n(p1[0])},{_n(p1[1])} {_n(p2[0])},{_n(p2[1])}" fill="{color}"/>')


def thermometer(t, lo=0, hi=50, label=None, W=150):
    """액체 온도계. t: 눈금을 읽을 값(소수 가능)"""
    top, bot = 28, 176
    out = [text(60, 16, "°C", 13, weight="bold")]
    out.append(f'<rect x="52" y="{top - 6}" width="16" height="{bot - top + 12}" rx="8" fill="none" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<circle cx="60" cy="{bot + 14}" r="15" fill="{ORANGE}" fill-opacity="0.85" stroke="{C}" stroke-width="2.5"/>')
    y = lambda v: bot - (bot - top) * (v - lo) / (hi - lo)
    out.append(f'<rect x="56" y="{_n(y(t))}" width="8" height="{_n(bot + 8 - y(t))}" fill="{ORANGE}" fill-opacity="0.85"/>')
    step = 10 if hi - lo >= 40 else 5
    v = lo
    while v <= hi + 1e-9:
        out.append(line(70, y(v), 82, y(v), 2.5))
        out.append(text(88, y(v) + 4, int(v) if float(v).is_integer() else v, 12, anchor="start"))
        v += step
    m = lo
    mstep = 2 if step == 10 else 1
    while m <= hi + 1e-9:
        if (m - lo) % step:
            out.append(line(70, y(m), 76, y(m), 2))
        m += mstep
    if label:
        out.append(text(60, bot + 44, label, 13, weight="bold"))
    return svg(W, bot + 50, "".join(out))


def earth_orbit(labels, show_names=False):
    """지구 공전 그림. labels: {'left':..,'top':..,'right':..,'bottom':..}; 자전축은 늘 오른쪽 위로 기울어 있다.
    왼쪽 위치는 북반구가 태양 쪽으로 기울어(여름), 오른쪽 위치는 반대쪽(겨울)."""
    cx0, cy0, rx, ry = 138, 100, 92, 58
    out = [f'<ellipse cx="{cx0}" cy="{cy0}" rx="{rx}" ry="{ry}" fill="none" stroke="{C}" stroke-width="2" stroke-dasharray="6 5"/>']
    out.append(f'<circle cx="{cx0}" cy="{cy0}" r="17" fill="{ORANGE}" fill-opacity="0.8" stroke="{C}" stroke-width="2.5"/>')
    out.append(text(cx0, cy0 + 4, "태양", 12, weight="bold"))
    pos = {"left": (cx0 - rx, cy0), "top": (cx0, cy0 - ry), "right": (cx0 + rx, cy0), "bottom": (cx0, cy0 + ry)}
    ang = math.radians(23.5)
    for k, (px, py) in pos.items():
        out.append(f'<circle cx="{px}" cy="{py}" r="12" fill="{BLUE}" fill-opacity="0.3" stroke="{C}" stroke-width="2.5"/>')
        dx, dy = 20 * math.sin(ang), 20 * math.cos(ang)
        out.append(line(px - dx, py + dy, px + dx, py - dy, 2.5))
        out.append(f'<circle cx="{_n(px + dx)}" cy="{_n(py - dy)}" r="3.5" fill="{C}"/>')
        lab = labels.get(k)
        if lab:
            tx, ty = {"left": (px - 26, py + 5), "right": (px + 26, py + 5), "top": (px - 26, py - 6), "bottom": (px, py + 38)}[k]
            out.append(text(tx, ty, lab, 14, weight="bold"))
    out.append(f'<circle cx="14" cy="216" r="3.5" fill="{C}"/>')
    out.append(text(24, 220, "자전축의 북쪽 끝(북극 쪽)", 12, anchor="start"))
    return svg(276, 228, "".join(out))


def sun_altitude(deg, W=200, show=True):
    """태양 고도: 관측자 P에서 본 태양의 방향과 지평선 사이의 각"""
    px, py, L = 40, 120, 100
    a = math.radians(deg)
    ex, ey = px + L * math.cos(a), py - L * math.sin(a)
    out = [line(10, py, W - 10, py, 3)]
    out.append(f'<circle cx="{px}" cy="{py}" r="5" fill="{C}"/>')
    out.append(text(px, py + 20, "관측자", 12))
    out.append(line(px, py, ex, ey, 2.5, dash="6 4", color=ORANGE))
    out.append(f'<circle cx="{_n(ex)}" cy="{_n(ey)}" r="13" fill="{ORANGE}" fill-opacity="0.8" stroke="{C}" stroke-width="2.5"/>')
    out.append(text(ex, ey + 4, "해", 12, weight="bold"))
    r = 44
    out.append(f'<path d="M{px + r},{py} A{r},{r} 0 0 0 {_n(px + r * math.cos(a))},{_n(py - r * math.sin(a))}" fill="none" stroke="{C}" stroke-width="2.5"/>')
    mid = a / 2
    out.append(text(px + (r + 16) * math.cos(mid) + 4, py - (r + 16) * math.sin(mid) + 4, f"{deg}°" if show else "?", 13, weight="bold"))
    return svg(W, 150, "".join(out))


def shadow_stick(stick, shadow, W=240):
    """막대와 그림자 (길이는 그림 속 상대 길이)"""
    gx, gy = 40, 130
    out = [line(10, gy, W - 10, gy, 3)]
    out.append(line(gx, gy, gx, gy - stick, 5))
    out.append(text(gx - 6, gy - stick / 2, "막대", 12, anchor="end"))
    out.append(line(gx, gy + 6, gx + shadow, gy + 6, 5, color=ORANGE))
    out.append(text(gx + shadow / 2, gy + 26, "그림자", 12))
    out.append(line(gx, gy - stick, gx + shadow, gy, 2, dash="6 4"))
    return svg(W, 160, "".join(out))


def ray_reflect(inc, ref_txt=None, W=250):
    """거울에서의 빛 반사. inc 입사각(도). ref_txt None이면 반사각을 같게 그리고 숫자는 보여 주지 않음('?')"""
    mx, my, L = 125, 120, 92
    a = math.radians(inc)
    out = [line(30, my, W - 30, my, 4)]
    for k in range(0, 8):
        x = 40 + k * 25
        out.append(line(x, my + 2, x - 10, my + 14, 2, op=0.6))
    out.append(text(W - 30, my + 28, "거울", 12, anchor="end"))
    out.append(line(mx, 14, mx, my, 2, dash="5 4"))
    out.append(text(mx + 6, 22, "법선", 12, anchor="start"))
    sx, sy = mx - L * math.sin(a), my - L * math.cos(a)
    out.append(_arrow(sx, sy, mx, my, 2.5, ORANGE))
    ex, ey = mx + L * math.sin(a), my - L * math.cos(a)
    out.append(_arrow(mx, my, ex, ey, 2.5, ORANGE))
    out.append(text(sx - 4, sy + 4, "입사광", 12, anchor="end"))
    out.append(text(ex + 4, ey + 4, "반사광", 12, anchor="start"))
    out.append(text(mx - 34, my - 24, f"{inc}°", 13, weight="bold"))
    out.append(text(mx + 34, my - 24, ref_txt if ref_txt else "?", 13, weight="bold"))
    return svg(W, my + 40, "".join(out))


def refract(mode="air_to_water", W=300):
    """공기와 물의 경계에서 빛의 굴절"""
    bx, by = 130, 90
    out = [f'<rect x="20" y="{by}" width="{W - 40}" height="70" fill="{BLUE}" fill-opacity="0.18" stroke="none"/>']
    out.append(line(20, by, W - 20, by, 3))
    out.append(line(bx, 12, bx, 160, 2, dash="5 4"))
    out.append(text(30, 24, "공기", 13, anchor="start", weight="bold"))
    out.append(text(30, 150, "물", 13, anchor="start", weight="bold"))
    a1, a2 = math.radians(50), math.radians(33)
    if mode == "water_to_air":
        a1, a2 = a2, a1
        L1, L2 = 70, 80
        sx, sy = bx - L1 * math.sin(a1), by + L1 * math.cos(a1)
        ex, ey = bx + L2 * math.sin(a2), by - L2 * math.cos(a2)
    else:
        L1, L2 = 80, 70
        sx, sy = bx - L1 * math.sin(a1), by - L1 * math.cos(a1)
        ex, ey = bx + L2 * math.sin(a2), by + L2 * math.cos(a2)
    out.append(_arrow(sx, sy, bx, by, 2.5, ORANGE))
    out.append(_arrow(bx, by, ex, ey, 2.5, ORANGE))
    out.append(text(sx - 4, sy + (4 if mode == "air_to_water" else 14), "처음 빛", 12, anchor="end"))
    out.append(text(ex + 4, ey + 4, "나아가는 빛", 12, anchor="start"))
    return svg(W, 168, "".join(out))


def lens(kind="convex", W=240):
    """볼록 렌즈(빛이 모임) / 오목 렌즈(빛이 퍼짐)"""
    cx, cy = 110, 76
    out = []
    if kind == "convex":
        out.append(f'<path d="M{cx},18 Q{cx + 22},{cy} {cx},{2 * cy - 18} Q{cx - 22},{cy} {cx},18 Z" fill="{BLUE}" fill-opacity="0.2" stroke="{C}" stroke-width="2.5"/>')
        out.append(text(cx, 164, "볼록 렌즈", 13, weight="bold"))
    else:
        out.append(f'<path d="M{cx - 14},18 L{cx + 14},18 Q{cx},{cy} {cx + 14},{2 * cy - 18} L{cx - 14},{2 * cy - 18} Q{cx},{cy} {cx - 14},18 Z" fill="{BLUE}" fill-opacity="0.2" stroke="{C}" stroke-width="2.5"/>')
        out.append(text(cx, 164, "오목 렌즈", 13, weight="bold"))
    for dy in (-34, 0, 34):
        y = cy + dy
        out.append(line(14, y, cx - (5 if kind == "convex" else 12), y, 2.5, color=ORANGE))
        if kind == "convex":
            out.append(line(cx + 4, y, 215, y + (cy - y) * (215 - cx - 4) / 66 if dy else cy, 2.5, color=ORANGE))
        else:
            out.append(line(cx + 12, y, 214, cy + dy * 1.7 if dy else cy, 2.5, color=ORANGE))
    if kind == "convex":
        out.append(f'<circle cx="{cx + 70}" cy="{cy}" r="4" fill="{C}"/>')
        out.append(text(cx + 70, cy + 22, "초점", 12))
    return svg(W, 172, "".join(out))


def pressure_map(left="고기압", right="저기압", arrows=True, W=250):
    """기압 분포: 왼쪽/오른쪽 타원과 바람 방향(고기압 → 저기압)"""
    out = []
    for cx, nm in ((55, left), (195, right)):
        out.append(f'<ellipse cx="{cx}" cy="70" rx="46" ry="42" fill="{BLUE if nm == "고기압" else ORANGE}" fill-opacity="0.2" stroke="{C}" stroke-width="2.5"/>')
        out.append(text(cx, 75, nm, 14, weight="bold"))
    if arrows:
        x1, x2 = (108, 146) if left == "고기압" else (146, 108)
        out.append(_arrow(x1, 70, x2, 70))
        out.append(text(127, 56, "바람", 12))
    return svg(W, 130, "".join(out))


def plant(marks):
    """식물 그림. marks: {'flower','leaf','stem','root'} -> 표시 글자(예: '㉠')"""
    out = []
    out.append(line(100, 56, 100, 150, 4))
    for k, (a, b) in enumerate(((100, 150), (100, 150), (100, 150))):
        pass
    for x2 in (62, 100, 138):
        out.append(line(100, 150, x2, 206, 2.5))
    out.append(f'<ellipse cx="72" cy="104" rx="26" ry="11" transform="rotate(-25 72 104)" fill="{BLUE}" fill-opacity="0.25" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<ellipse cx="130" cy="84" rx="26" ry="11" transform="rotate(25 130 84)" fill="{BLUE}" fill-opacity="0.25" stroke="{C}" stroke-width="2.5"/>')
    for k in range(5):
        a = math.radians(72 * k - 90)
        out.append(f'<circle cx="{_n(100 + 13 * math.cos(a))}" cy="{_n(36 + 13 * math.sin(a))}" r="8" fill="{ORANGE}" fill-opacity="0.35" stroke="{C}" stroke-width="2"/>')
    out.append(f'<circle cx="100" cy="36" r="6" fill="{C}"/>')
    out.append(line(8, 150, 192, 150, 2, dash="6 5", op=0.6))
    def mark(txt, x, y, tx, ty):
        return line(x, y, tx, ty, 2) + text(tx + (-8 if tx < x else 8), ty + 5, txt, 15, weight="bold")
    out.append(mark(marks["flower"], 112, 30, 160, 26))
    out.append(mark(marks["leaf"], 58, 112, 22, 124))
    out.append(mark(marks["stem"], 100, 120, 160, 128))
    out.append(mark(marks["root"], 84, 192, 40, 210))
    return svg(200, 222, "".join(out))


def microscope(marks):
    """광학 현미경. marks: {'ocular','objective','stage','knob','base'} -> 표시 글자"""
    out = []
    out.append(f'<rect x="84" y="12" width="20" height="22" fill="none" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<rect x="80" y="34" width="28" height="52" fill="none" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<rect x="86" y="86" width="16" height="16" fill="none" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<rect x="56" y="124" width="80" height="8" fill="{BLUE}" fill-opacity="0.3" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<path d="M108,48 Q150,50 150,110 L150,176" fill="none" stroke="{C}" stroke-width="3"/>')
    out.append(f'<circle cx="150" cy="116" r="8" fill="none" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<circle cx="96" cy="154" r="9" fill="none" stroke="{C}" stroke-width="2.5"/>')
    out.append(f'<rect x="52" y="178" width="108" height="12" rx="4" fill="{BLUE}" fill-opacity="0.3" stroke="{C}" stroke-width="2.5"/>')
    def mark(txt, x, y, tx, ty, anchor):
        return line(x, y, tx, ty, 2) + text(tx + (-6 if anchor == "end" else 6), ty + 5, txt, 15, anchor=anchor, weight="bold")
    out.append(mark(marks["ocular"], 84, 22, 40, 22, "end"))
    out.append(mark(marks["objective"], 86, 94, 40, 94, "end"))
    out.append(mark(marks["stage"], 56, 128, 28, 128, "end"))
    out.append(mark(marks["knob"], 158, 116, 184, 116, "start"))
    out.append(mark(marks["base"], 130, 184, 184, 184, "start"))
    return svg(210, 200, "".join(out))


def cell_pair(W=300):
    """(가) 사각형 칸으로 이어진 세포(벽 있음), (나) 둥글고 불규칙한 세포. 둘 다 핵이 있다."""
    out = []
    for r in range(2):
        for c in range(3):
            x, y = 12 + c * 38, 26 + r * 30
            out.append(f'<rect x="{x}" y="{y}" width="38" height="30" fill="none" stroke="{C}" stroke-width="3"/>')
            out.append(f'<circle cx="{x + 19}" cy="{y + 15}" r="5" fill="{BLUE}" fill-opacity="0.6" stroke="{C}" stroke-width="2"/>')
    out.append(text(68, 110, "(가)", 14, weight="bold"))
    blobs = [(188, 36, 24, 16), (234, 52, 22, 15), (200, 78, 20, 14)]
    for x, y, rx, ry in blobs:
        out.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="none" stroke="{C}" stroke-width="2"/>')
        out.append(f'<circle cx="{x}" cy="{y}" r="5" fill="{BLUE}" fill-opacity="0.6" stroke="{C}" stroke-width="2"/>')
    out.append(text(214, 110, "(나)", 14, weight="bold"))
    return svg(W, 118, "".join(out))
