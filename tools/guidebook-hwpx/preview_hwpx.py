"""HWPX → 대략적인 A4 HTML 미리보기 (글자 크기·굵기·색·정렬·여백·그림·표·쪽 나눔)"""
import sys, zipfile, re, base64, html
import xml.etree.ElementTree as ET

src, out = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(src)
NS = {"hh": "http://www.hancom.co.kr/hwpml/2011/head", "hp": "http://www.hancom.co.kr/hwpml/2011/paragraph",
      "hc": "http://www.hancom.co.kr/hwpml/2011/core", "opf": "http://www.idpf.org/2007/opf/"}
hd = ET.fromstring(z.read("Contents/header.xml"))
sec = ET.fromstring(z.read("Contents/section0.xml"))
hpf = z.read("Contents/content.hpf").decode()
items = dict(re.findall(r'<opf:item id="([^"]+)" href="([^"]+)"', hpf))
U = 7200 / 25.4  # HWPUNIT per mm

chars = {}
for c in hd.iter("{%s}charPr" % NS["hh"]):
    chars[c.get("id")] = dict(size=int(c.get("height", "1000")) / 100, color=c.get("textColor", "#000000"),
                              bold=c.find("hh:bold", NS) is not None)
paras = {}
for p in hd.iter("{%s}paraPr" % NS["hh"]):
    al = p.find("hh:align", NS)
    br = p.find(".//hh:breakSetting", NS)
    mg = p.find(".//hh:margin", NS)
    def mv(tag):
        e = mg.find("hc:" + tag, NS) if mg is not None else None
        return int(e.get("value", "0")) if e is not None else 0
    ls = p.find(".//hh:lineSpacing", NS)
    bd = p.find("hh:border", NS)
    paras[p.get("id")] = dict(align=(al.get("horizontal") if al is not None else "JUSTIFY"),
                              pb=br is not None and br.get("pageBreakBefore") == "1",
                              left=mv("left"), prev=mv("prev"), next=mv("next"),
                              line=int(ls.get("value", "160")) if ls is not None else 160,
                              border=bd is not None and bd.get("borderFillIDRef") not in (None, "1", "2"))
fills = {}
for bf in hd.iter("{%s}borderFill" % NS["hh"]):
    wb = bf.find(".//hc:winBrush", NS)
    fills[bf.get("id")] = wb.get("faceColor") if wb is not None else None

def p_html(p):
    pp = paras.get(p.get("paraPrIDRef"), {})
    al = {"CENTER": "center", "RIGHT": "right", "LEFT": "left"}.get(pp.get("align"), "justify")
    style = (f"text-align:{al};margin:{pp.get('prev', 0) / 100 * 0.35:.1f}mm 0 {pp.get('next', 0) / 100 * 0.35:.1f}mm "
             f"{pp.get('left', 0) / U:.1f}mm;line-height:{pp.get('line', 160) / 100 * 1.0:.2f}")
    if pp.get("border"): style += ";border-bottom:1.5px solid #1F3A8A;padding-bottom:1mm"
    parts = []
    for r in p.findall("hp:run", NS):
        cp = chars.get(r.get("charPrIDRef"), {})
        for ch in r:
            tag = ch.tag.split("}")[1]
            if tag == "t" and ch.text:
                parts.append(f'<span style="font-size:{cp.get("size", 10)}pt;color:{cp.get("color", "#000")};'
                             f'font-weight:{700 if cp.get("bold") else 400}">{html.escape(ch.text)}</span>')
            elif tag == "pic":
                img = ch.find(".//hc:img", NS)
                cs = ch.find("hp:curSz", NS)
                href = items.get(img.get("binaryItemIDRef"))
                data = base64.b64encode(z.read("Contents/" + href if not href.startswith("BinData") else href)).decode()
                w, h = int(cs.get("width")) / U, int(cs.get("height")) / U
                parts.append(f'<img src="data:image/png;base64,{data}" style="width:{w:.1f}mm;height:{h:.1f}mm;vertical-align:bottom">')
            elif tag == "tbl":
                parts.append(tbl_html(ch))
    return f'<div class="p{" pb" if pp.get("pb") else ""}" style="{style}">{"".join(parts) or "&nbsp;"}</div>'

def tbl_html(t):
    rows = []
    for tr in t.findall("hp:tr", NS):
        tds = []
        for tc in tr.findall("hp:tc", NS):
            sz = tc.find("hp:cellSz", NS)
            fill = fills.get(tc.get("borderFillIDRef"))
            inner = "".join(p_html(p) for p in tc.findall(".//hp:subList/hp:p", NS))
            sp = tc.find("hp:cellSpan", NS)
            cs = sp.get("colSpan", "1") if sp is not None else "1"
            tds.append(f'<td colspan="{cs}" style="width:{int(sz.get("width")) / U:.1f}mm;background:{fill or "transparent"};'
                       f'border:0.5px solid #c8ccd4;padding:1.2mm 2mm;vertical-align:top">{inner}</td>')
        rows.append("<tr>" + "".join(tds) + "</tr>")
    return '<table style="border-collapse:collapse;margin:0 auto">' + "".join(rows) + "</table>"

body = "".join(p_html(p) for p in sec.findall("hp:p", NS))
open(out, "w", encoding="utf-8").write(f"""<!doctype html><meta charset="utf-8"><style>
@page {{ size: A4; margin: 15mm 18mm 14mm 18mm; }}
body {{ font-family: "Malgun Gothic","Noto Sans CJK KR","Noto Sans KR",sans-serif; margin:0; }}
.pb {{ break-before: page; }}
</style>{body}""")
print("ok")
