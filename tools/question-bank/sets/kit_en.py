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
