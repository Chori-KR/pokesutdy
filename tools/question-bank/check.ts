// 앱의 JSON 가져오기 검사(lib/bankImport.ts)를 그대로 돌린다.
// 사용: npx tsx tools/question-bank/check.ts tools/question-bank/banks
import { readFileSync, readdirSync } from "fs";
import { parseBank } from "../../lib/bankImport";

const dir = process.argv[2] ?? "tools/question-bank/banks";
for (const f of readdirSync(dir).filter((x) => x.startsWith("bank_") && x.endsWith(".json"))) {
  const r = parseBank(f, readFileSync(`${dir}/${f}`, "utf8"));
  console.log(f, r.fatal ?? "", "문제", r.questions.length, "그림", r.questions.filter((q) => q.svg).length,
    "오류", r.errors.length, "경고", r.warnings.length, [...new Set(r.questions.map((q) => q.tag))].join());
  for (const e of [...r.errors, ...r.warnings].slice(0, 5)) console.log("   ", e);
}
