"""영어 묶음 공통 그림 도구: 글자 카드, 음절 상자, 날씨 그림, 표정 그림.
svgkit.py 규칙: viewBox만, 글자 12 이상, 선 2 이상, currentColor + 파랑/주황만, 색만으로 구분하지 않기."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, BLUE, ORANGE, C, _n


def letters(items, size=30, w=50, gap=10):
    """글자 카드 여러 장. items: 글자 문자열 목록"""
    out = []
    tot = len(items) * (w + gap) - gap
    off = max(0, (200 - tot) / 2)
    for i, s in enumerate(items):
        x = 4 + off + i * (w + gap)
        out.append(f'<rect x="{x}" y="4" width="{w}" height="58" rx="8" fill="none" stroke="{C}" stroke-width="2.5"/>')
        out.append(text(x + w / 2, 44, s, size, weight="bold"))
    return svg(max(8 + tot, 208), 66, "".join(out))


def syllables(parts, stress=None, w=62):
    """음절 상자. stress: 강하게 읽는 음절 번호(0부터)이면 주황 테두리 + 굵은 글씨, 없으면 None"""
    out = []
    for i, s in enumerate(parts):
        x = 4 + i * (w + 8)
        hot = stress == i
        out.append(f'<rect x="{x}" y="6" width="{w}" height="40" rx="8" fill="none" stroke="{ORANGE if hot else C}" stroke-width="2.5"/>')
        out.append(text(x + w / 2, 33, s, 18, weight="bold" if hot else None))
    return svg(8 + len(parts) * (w + 8) - 8, 52, "".join(out))


def weather(kind, label=None):
    """날씨 그림: sunny / cloudy / rainy / snowy / windy"""
    out = []
    if kind == "sunny":
        out.append(f'<circle cx="50" cy="44" r="18" fill="{ORANGE}" fill-opacity="0.6" stroke="{C}" stroke-width="2.5"/>')
        for k in range(8):
            a = math.radians(k * 45)
            out.append(line(50 + 24 * math.cos(a), 44 + 24 * math.sin(a), 50 + 34 * math.cos(a), 44 + 34 * math.sin(a), 3))
    else:
        out.append(f'<path d="M26,56 a14,14 0 0 1 4,-27 a18,18 0 0 1 34,2 a12,12 0 0 1 4,25 Z" fill="none" stroke="{C}" stroke-width="2.5" stroke-linejoin="round"/>')
        if kind == "rainy":
            for x in (34, 48, 62):
                out.append(line(x, 64, x - 5, 78, 3, color=BLUE))
        elif kind == "snowy":
            for x in (34, 50, 66):
                out.append(text(x, 78, "*", 22, weight="bold"))
        elif kind == "windy":
            out.append(f'<path d="M20,72 h40 a6,6 0 1 0 -6,-6 M20,82 h52 a6,6 0 1 1 -6,6" fill="none" stroke="{BLUE}" stroke-width="3" stroke-linecap="round"/>')
    if label:
        out.append(text(50, 100, label, 14, weight="bold"))
    return svg(100, 106 if label else 90, "".join(out))


def face(kind, label=None):
    """표정: happy / sad / angry / sleepy / surprised"""
    out = [f'<circle cx="40" cy="38" r="30" fill="none" stroke="{C}" stroke-width="3"/>']
    if kind == "sleepy":
        out += [line(26, 32, 36, 32, 3), line(44, 32, 54, 32, 3)]
    elif kind == "angry":
        out += [line(24, 24, 36, 30, 3), line(56, 24, 44, 30, 3), f'<circle cx="31" cy="35" r="3" fill="{C}"/>', f'<circle cx="49" cy="35" r="3" fill="{C}"/>']
    else:
        out += [f'<circle cx="31" cy="32" r="3.5" fill="{C}"/>', f'<circle cx="49" cy="32" r="3.5" fill="{C}"/>']
    mouth = {"happy": "M26,46 q14,16 28,0", "sad": "M26,56 q14,-14 28,0", "angry": "M28,56 q12,-8 24,0",
             "sleepy": "M32,52 h16", "surprised": "M40,46 m-6,0 a6,8 0 1 0 12,0 a6,8 0 1 0 -12,0"}[kind]
    out.append(f'<path d="{mouth}" fill="none" stroke="{C}" stroke-width="3" stroke-linecap="round"/>')
    if label:
        out.append(text(40, 88, label, 14, weight="bold"))
    return svg(80, 94 if label else 76, "".join(out))


def icon(kind, cx=36, cy=36, s=1.0):
    """간단한 물건 그림. kind: apple ball book star heart house flower tree fish"""
    f = 'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"'
    t = f'<g transform="translate({cx},{cy}) scale({s})">'
    if kind == "apple":
        t += f'<path d="M0,-14 C-24,-24 -30,10 -12,22 C-6,27 6,27 12,22 C30,10 24,-24 0,-14 Z" fill="{ORANGE}" fill-opacity="0.45" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M0,-14 q0,-10 6,-14" {f}/>'
    elif kind == "ball":
        t += f'<circle r="24" {f}/><path d="M-24,0 q24,-16 48,0 M-24,0 q24,16 48,0 M0,-24 q-12,24 0,48" {f}/>'
    elif kind == "book":
        t += f'<rect x="-22" y="-26" width="44" height="52" rx="3" fill="{BLUE}" fill-opacity="0.3" stroke="currentColor" stroke-width="2.5"/><path d="M-14,-26 v52 M-6,-12 h20 M-6,-2 h20" {f}/>'
    elif kind == "star":
        pts = []
        for k in range(10):
            r = 26 if k % 2 == 0 else 11
            a = math.radians(-90 + k * 36)
            pts.append(f"{r * math.cos(a):.1f},{r * math.sin(a):.1f}")
        t += f'<polygon points="{" ".join(pts)}" fill="{ORANGE}" fill-opacity="0.45" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>'
    elif kind == "heart":
        t += f'<path d="M0,22 C-34,0 -22,-26 0,-10 C22,-26 34,0 0,22 Z" fill="{ORANGE}" fill-opacity="0.45" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>'
    elif kind == "house":
        t += f'<polygon points="-26,-4 0,-28 26,-4" {f}/><rect x="-20" y="-4" width="40" height="30" {f}/><rect x="-5" y="8" width="10" height="18" {f}/>'
    elif kind == "flower":
        for k in range(5):
            a = math.radians(k * 72 - 90)
            t += f'<circle cx="{12 * math.cos(a):.1f}" cy="{-6 + 12 * math.sin(a):.1f}" r="8" fill="{ORANGE}" fill-opacity="0.35" stroke="currentColor" stroke-width="2"/>'
        t += f'<circle cy="-6" r="5" {f}/><path d="M0,6 v22" {f}/>'
    elif kind == "tree":
        t += f'<rect x="-5" y="6" width="10" height="22" {f}/><circle cy="-8" r="20" fill="{BLUE}" fill-opacity="0.3" stroke="currentColor" stroke-width="2.5"/>'
    elif kind == "fish":
        t += f'<ellipse rx="22" ry="13" fill="{BLUE}" fill-opacity="0.3" stroke="currentColor" stroke-width="2.5"/><polygon points="20,0 34,-12 34,12" {f}/><circle cx="-12" cy="-3" r="2.5" fill="currentColor"/>'
    return t + "</g>"


def icons_row(items, W=None, gap=70):
    """items: [(kind, 개수)] 가로로 개수만큼 그림"""
    out = []
    x = 36
    for kind, n in items:
        for k in range(n):
            out.append(icon(kind, x, 40, 0.9))
            x += 58
        x += 12
    return svg(max(x, 120), 82, "".join(out))


def in_box(inside=True):
    """상자와 공: inside=True면 상자 안, False면 상자 위"""
    out = [f'<rect x="20" y="40" width="80" height="44" fill="none" stroke="{C}" stroke-width="3"/>']
    if inside:
        out.append(f'<circle cx="60" cy="62" r="12" fill="{ORANGE}" fill-opacity="0.5" stroke="{C}" stroke-width="2.5"/>')
    else:
        out.append(f'<circle cx="60" cy="26" r="12" fill="{ORANGE}" fill-opacity="0.5" stroke="{C}" stroke-width="2.5"/>')
    return svg(120, 92, "".join(out))
