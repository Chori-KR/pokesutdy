"""문제 은행 JSON 만들기 공통 도구 (v7 형식)"""
import json, collections, re

LEVEL_DIFF = {"C": "easy", "B": "medium", "A": "hard"}


class Bank:
    def __init__(self, subject, school, course, grade_band, unit, outfile):
        self.meta = {"curriculum": "2022 개정 교육과정", "subject": subject, "school": school, "course": course,
                     "gradeBand": grade_band, "unit": unit, "createdAt": "2026-10-02"}
        self.outfile = outfile
        self.questions = []
        self.passages = []
        self._n = collections.Counter()

    def passage(self, pid, title, text, source):
        self.passages.append({"id": pid, "title": title, "text": text, "source": source})
        return pid

    def q(self, std, level, body, *, options=None, answer=None, answers=None, svg=None, why, passage=None):
        """객관식: options=[...] + answer=정답 '값'(문자열/수) — 위치는 자동으로 찾음.
        단답형: answers=[허용 정답...]"""
        self._n[(std, level)] += 1
        m = self.meta
        item = {
            "id": f"{m['subject']}-{m['gradeBand']}-{std}-{level.lower()}{self._n[(std, level)]}",
            "subject": m["subject"], "gradeBand": m["gradeBand"], "unit": m["unit"], "standard": std,
            "level": level, "difficulty": LEVEL_DIFF[level],
            "type": "short" if answers else "multiple", "body": body,
        }
        if passage:
            item["passage"] = passage
        if svg:
            item["svg"] = svg
        if answers:
            item["answers"] = [str(a) for a in answers]
        else:
            opts = [str(o) for o in options]
            assert len(opts) == 4 and len(set(opts)) == 4, (body, opts)
            item["options"] = opts
            item["answer"] = opts.index(str(answer))
        item["why"] = why
        self.questions.append(item)

    def check(self, per_std):
        qs = self.questions
        errs = []
        bodies = collections.Counter(q["body"] for q in qs)
        errs += [f"본문 중복: {b[:30]}" for b, c in bodies.items() if c > 1]
        svgs = collections.Counter(q.get("svg") for q in qs if q.get("svg"))
        errs += ["SVG 재사용" for s, c in svgs.items() if c > 1]
        for q in qs:
            if re.search(r"(아래|다음)\s*(그림|그래프|표|모양)", q["body"]) and not q.get("svg"):
                errs.append(f"그림 언급인데 svg 없음: {q['id']}")
            if q.get("svg"):
                import xml.dom.minidom
                try:
                    xml.dom.minidom.parseString(q["svg"])
                except Exception as e:
                    errs.append(f"SVG 문법 오류: {q['id']} {e}")
            if q.get("svg") and len(q["svg"].encode()) > 8000:
                errs.append(f"SVG 8KB 초과: {q['id']}")
            if q.get("svg") and re.search(r'font-size="(\d+)"', q["svg"]):
                small = [int(x) for x in re.findall(r'font-size="(\d+)"', q["svg"]) if int(x) < 12]
                if small:
                    errs.append(f"글자 12 미만: {q['id']}")
        by = collections.Counter((q["standard"], q["level"]) for q in qs)
        for (s, l), c in by.items():
            if c != per_std // 3:
                errs.append(f"{s} {l}: {c}개 (기대 {per_std // 3})")
        pos = collections.Counter(q["answer"] for q in qs if q["type"] == "multiple")
        short = sum(q["type"] == "short" for q in qs)
        return errs, pos, short

    def save(self, path):
        data = {"version": 1, "meta": self.meta, "passages": self.passages, "questions": self.questions, "skipped": []}
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
            f.write("\n")
        return data
