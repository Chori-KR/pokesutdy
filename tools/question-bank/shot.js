// 미리보기 HTML의 문제 카드를 하나씩 찍는다: node shot.js page.html outdir
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [, , page_, outdir] = process.argv;
(async () => {
  const fs = require('fs'); fs.mkdirSync(outdir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await browser.newContext({ viewport: { width: 400, height: 900 }, deviceScaleFactor: 1 })).newPage();
  await page.goto('file://' + require('path').resolve(page_));
  const cards = page.locator('.card');
  const n = await cards.count();
  const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length);
  console.log('cards', n, 'broken images', broken);
  for (let i = 0; i < n; i++) await cards.nth(i).screenshot({ path: `${outdir}/${String(i + 1).padStart(2, '0')}.png` });
  await browser.close();
})();
