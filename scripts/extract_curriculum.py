import fitz, re, json, sys

PDF = "기본교육과정.pdf"
OUT = "data/curriculum.json"

SUBJ = {
    "바생": "바른 생활", "슬생": "슬기로운 생활", "즐생": "즐거운 생활",
    "국어": "국어", "사회": "사회", "수학": "수학", "과학": "과학",
    "실과": "실과", "진로": "진로와 직업", "체육": "체육", "음악": "음악",
    "미술": "미술", "정통": "정보통신활용", "생영": "생활영어", "보건": "보건",
}
BAND = {2: "초등 1~2학년", 4: "초등 3~4학년", 6: "초등 5~6학년", 9: "중학교", 12: "고등학교"}

d = fitz.open(PDF)
SUBJ_FULL = set(SUBJ.values())
def clean_page(txt):
    out = []
    for ln in txt.split("\n"):
        s = ln.strip()
        if not s:
            continue
        if re.fullmatch(r"\d{1,3}", s):           # 페이지 번호
            continue
        if s == "기본 교육과정" or s in SUBJ_FULL:  # 러닝 헤더
            continue
        out.append(ln)
    return "\n".join(out)
full = "\n".join(clean_page(d[i].get_text()) for i in range(d.page_count))

# 성취기준 코드 + 뒤 문장. 다음 코드가 나오기 전까지 캡처.
pat = re.compile(r"\[(\d{1,2})([가-힣]{1,4})(\d{2})-(\d{2})\]")
def first_sentence(body, cap=220):
    body = re.sub(r"\s+", " ", body).strip()
    sm = re.search(r"^(.*?[다요음됨함니])\.", body)  # 대개 '~다.'로 끝남
    return (sm.group(1) + ".") if sm else body[:cap].strip()

matches = list(pat.finditer(full))
# 같은 코드가 성취기준 표 → 해설 → 적용 고려사항에 반복 등장. 첫 등장이 실제 성취기준.
by_code = {}   # code -> list of bodies (등장 순)
order = []      # 첫 등장 순서 유지
for i, m in enumerate(matches):
    start = m.end()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(full)
    code = m.group(0)
    if code not in by_code:
        by_code[code] = []
        order.append((code, m.group(1), m.group(2), m.group(3)))
    by_code[code].append(full[start:end])

records = []
for code, band, subj_ab, area in order:
    bodies = by_code[code]
    text = first_sentence(bodies[0])
    rec = {
        "code": code,
        "subject": SUBJ.get(subj_ab, subj_ab),
        "gradeBand": BAND.get(int(band), band),
        "area": int(area),
        "text": text,
    }
    if len(bodies) > 1:  # 해설 등 부가 설명(있으면 문제 생성에 참고)
        note = first_sentence(bodies[1], cap=300)
        if note and note != text:
            rec["note"] = note
    records.append(rec)

subjects = sorted({r["subject"] for r in records})
bands = [BAND[k] for k in [2, 4, 6, 9, 12]]
data = {
    "title": "2022 개정 특수교육 기본 교육과정",
    "source": "교육부 고시 제2022-34호 [별책 3]",
    "subjects": subjects,
    "gradeBands": bands,
    "count": len(records),
    "standards": records,
}
import os
os.makedirs("data", exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

print("saved", OUT, "records:", len(records))
print("subjects:", subjects)
# 품질 샘플
print("=== 샘플 10개 ===")
for r in records[:5] + records[500:503] + records[-2:]:
    print(f"{r['code']} [{r['subject']}/{r['gradeBand']}] {r['text'][:70]}")
# 이상치: 너무 긴 텍스트(잘못 캡처) 개수
longn = sum(1 for r in records if len(r["text"]) > 130)
print("긴(>130자) 레코드 수:", longn)
