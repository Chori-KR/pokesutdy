"""미술 묶음 공통 그림 도구: 선 종류, 질감 무늬, 따뜻한/차가운 색 면, 도형.
svgkit.py 규칙: viewBox만, 글자 12 이상, 선 2 이상, currentColor + 파랑(#4b7bec)/주황(#e07b39)만, 색만으로 구분하지 않기(글자·무늬 함께)."""
import math
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from svgkit import svg, text, line, BLUE, ORANGE, C, _n


def line_fig(kind, w=120, h=44):
    """선 그림: straight curve zigzag dotted thick thin spiral"""
    m = h / 2
    if kind == "straight":
        d = f'<line x1="8" y1="{m}" x2="{w - 8}" y2="{m}" stroke="{C}" stroke-width="3"/>'
    elif kind == "thick":
        d = f'<line x1="8" y1="{m}" x2="{w - 8}" y2="{m}" stroke="{C}" stroke-width="9"/>'
    elif kind == "thin":
        d = f'<line x1="8" y1="{m}" x2="{w - 8}" y2="{m}" stroke="{C}" stroke-width="2"/>'
    elif kind == "dotted":
        d = f'<line x1="8" y1="{m}" x2="{w - 8}" y2="{m}" stroke="{C}" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/>'
    elif kind == "zigzag":
        pts = " ".join(f"{8 + i * (w - 16) / 8},{m + (10 if i % 2 else -10)}" for i in range(9))
        d = f'<polyline points="{pts}" fill="none" stroke="{C}" stroke-width="3" stroke-linejoin="round"/>'
    elif kind == "curve":
        d = f'<path d="M8,{m} q{(w - 16) / 8},-22 {(w - 16) / 4},0 t{(w - 16) / 4},0 t{(w - 16) / 4},0 t{(w - 16) / 4},0" fill="none" stroke="{C}" stroke-width="3"/>'
    else:
        d = ""
    return svg(w, h, d)


def tex(kind, size=64):
    """질감 무늬 네모: rough(거침) smooth(매끄러움) dots(점무늬) stripes(줄무늬) checks(바둑무늬)"""
    s = size
    out = [f'<rect x="3" y="3" width="{s - 6}" height="{s - 6}" fill="none" stroke="{C}" stroke-width="2.5"/>']
    if kind == "rough":
        pts = " ".join(f"{8 + i * 6},{12 + ((i * 7) % 5) * 8 + (4 if i % 2 else 0)}" for i in range(9))
        out.append(f'<polyline points="{pts}" fill="none" stroke="{C}" stroke-width="2.5"/>')
        pts2 = " ".join(f"{8 + i * 6},{44 - ((i * 5) % 4) * 6}" for i in range(9))
        out.append(f'<polyline points="{pts2}" fill="none" stroke="{C}" stroke-width="2.5"/>')
    elif kind == "dots":
        for r in range(3):
            for c in range(3):
                out.append(f'<circle cx="{14 + c * 18}" cy="{14 + r * 18}" r="4" fill="{C}"/>')
    elif kind == "stripes":
        for k in range(4):
            out.append(line(8, 12 + k * 13, s - 8, 12 + k * 13, 4))
    elif kind == "checks":
        for r in range(4):
            for c in range(4):
                if (r + c) % 2 == 0:
                    out.append(f'<rect x="{8 + c * 12}" y="{8 + r * 12}" width="12" height="12" fill="{C}" fill-opacity="0.65"/>')
    return svg(s, s, "".join(out))


def swatch(kind, label=None, w=64, h=52):
    """색 면: warm(주황, 따뜻한 색) cool(파랑, 차가운 색)"""
    col = ORANGE if kind == "warm" else BLUE
    out = [f'<rect x="3" y="3" width="{w - 6}" height="{h - 6}" rx="4" fill="{col}" fill-opacity="0.65" stroke="{C}" stroke-width="2.5"/>']
    if label:
        out.append(text(w / 2, h / 2 + 5, label, 14, weight="bold"))
    return svg(w, h, "".join(out))


def shape_fig(kind, filled=True, size=60):
    """도형: circle square triangle star"""
    f = f'fill="{ORANGE}" fill-opacity="0.45"' if filled else 'fill="none"'
    st = f'stroke="{C}" stroke-width="2.5" stroke-linejoin="round"'
    c = size / 2
    if kind == "circle":
        d = f'<circle cx="{c}" cy="{c}" r="{c - 6}" {f} {st}/>'
    elif kind == "square":
        d = f'<rect x="8" y="8" width="{size - 16}" height="{size - 16}" {f} {st}/>'
    elif kind == "triangle":
        d = f'<polygon points="{c},8 {size - 8},{size - 8} 8,{size - 8}" {f} {st}/>'
    else:
        pts = []
        for k in range(10):
            r = (c - 5) if k % 2 == 0 else (c - 5) * 0.45
            a = math.radians(-90 + k * 36)
            pts.append(f"{c + r * math.cos(a):.1f},{c + r * math.sin(a):.1f}")
        d = f'<polygon points="{" ".join(pts)}" {f} {st}/>'
    return svg(size, size, d)
