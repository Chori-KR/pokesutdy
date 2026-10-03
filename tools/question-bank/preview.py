"""bank_*.json → 검토용 미리보기 HTML (앱과 같은 방식: <img src=data:image/svg+xml>)"""
import json, sys, html, urllib.parse, re

DIFF = {"easy": ("쉬움", "#e3f5ea", "#1d7a46"), "medium": ("보통", "#fff3d6", "#9a6700"), "hard": ("어려움", "#fde4e4", "#b42318")}
CIRCLED = "①②③④"


def with_xmlns(s):
    return s if re.match(r"^<svg[^>]*\sxmlns=", s) else s.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)


def img(svg):
    return f'<div class="pic"><img alt="문제 그림" src="data:image/svg+xml;charset=utf-8,{urllib.parse.quote(with_xmlns(svg))}"></div>'


def render(files, title):
    cards = []
    total = 0
    for path in files:
        d = json.load(open(path, encoding="utf-8"))
        m = d["meta"]
        ps = {p["id"]: p for p in d.get("passages", [])}
        cards.append(f'<h2>{html.escape(m["subject"])} · {html.escape(m["gradeBand"])} · {html.escape(m["unit"])} '
                     f'<small>{len(d["questions"])}문제</small></h2>')
        for i, q in enumerate(d["questions"], 1):
            total += 1
            lab, bg, fg = DIFF[q["difficulty"]]
            parts = [f'<div class="card"><div class="head"><span class="no">{i}</span>'
                     f'<span class="chip" style="background:{bg};color:{fg}">{lab}</span>'
                     f'<span class="chip">{html.escape(q["standard"])}</span>'
                     f'<span class="chip">{"단답형" if q["type"] == "short" else "4지선다"}</span></div>']
            if q.get("passage"):
                p = ps[q["passage"]]
                parts.append(f'<div class="passage"><b>📖 {html.escape(p["title"])}</b><p>{html.escape(p["text"])}</p>'
                             f'<div class="src">출처: {html.escape(p["source"])}</div></div>')
            if q.get("svg"):
                parts.append(img(q["svg"]))
            parts.append(f'<div class="body">{html.escape(q["body"])}</div>')
            if q["type"] == "short":
                parts.append(f'<div class="ans">정답: {" / ".join(html.escape(a) for a in q["answers"])}</div>')
            else:
                parts.append('<ol class="opts">' + "".join(
                    f'<li class="{"ok" if k == q["answer"] else ""}">{CIRCLED[k]} {html.escape(o)}</li>'
                    for k, o in enumerate(q["options"])) + "</ol>")
            parts.append(f'<div class="why">💡 {html.escape(q["why"])}</div></div>')
            cards.append("".join(parts))
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title>
<style>
:root{{--bg:#f4f5f9;--card:#fff;--ink:#1d2030;--ink2:#6b7080;--line:#e4e6ee;--ok:#1d7a46}}
@media (prefers-color-scheme:dark){{:root:not([data-theme=light]){{--bg:#12131c;--card:#1c1e2b;--ink:#eceef6;--ink2:#9aa0bd;--line:#2c2f45;--ok:#5fd394}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}}
main{{max-width:760px;margin:0 auto;padding:16px}}
h1{{font-size:20px}} h2{{font-size:16px;margin:28px 0 10px}} h2 small{{color:var(--ink2);font-weight:400}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px}}
.head{{display:flex;gap:6px;align-items:center;margin-bottom:8px;flex-wrap:wrap}}
.no{{font-weight:700;margin-right:4px}}
.chip{{font-size:11px;padding:2px 8px;border-radius:9px;background:rgba(127,127,127,.12)}}
.pic{{background:#fff;border:1px solid var(--line);border-radius:12px;padding:8px;text-align:center;margin-bottom:10px;color:#000}}
.pic img{{max-width:100%;max-height:300px}}
.passage{{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:10px}}
.passage p{{white-space:pre-wrap;line-height:1.75}} .src{{font-size:11px;color:var(--ink2);text-align:right}}
.body{{font-size:15px;line-height:1.6;white-space:pre-wrap;margin-bottom:8px}}
.opts{{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}}
.opts li{{border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:14px}}
.opts li.ok{{border:2px solid var(--ok);color:var(--ok);font-weight:700}}
.ans{{color:var(--ok);font-weight:700;font-size:14px}}
.why{{font-size:12.5px;color:var(--ink2);margin-top:8px}}
@media (max-width:480px){{.opts{{grid-template-columns:1fr}}}}
</style></head><body><main><h1>{html.escape(title)}</h1>
<p style="color:var(--ink2);font-size:13px">총 {total}문제 · 초록 테두리가 정답입니다. 그림은 앱과 같은 방식으로 그렸습니다.</p>
{"".join(cards)}</main>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>
<script>window.renderMathInElement&&renderMathInElement(document.body,{{delimiters:[{{left:"$$",right:"$$",display:true}},{{left:"$",right:"$",display:false}}],throwOnError:false}})</script>
</body></html>"""


if __name__ == "__main__":
    out, title, *files = sys.argv[1:]
    open(out, "w", encoding="utf-8").write(render(files, title))
