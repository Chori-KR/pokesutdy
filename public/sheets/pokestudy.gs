/**
 * 잡으면서 배우자! — 구글 시트 연동 스크립트
 *
 * 쓰는 법
 *   1) 이 코드를 구글 시트의 [확장 프로그램 → Apps Script]에 통째로 붙여넣고 저장
 *   2) 시트를 새로고침하면 위쪽에 [🎮 잡으면서 배우자] 메뉴가 생깁니다
 *   3) 메뉴 순서대로 ① 처음 설정하기 → ② 연동 주소 넣기 → ③ 지금 가져오기
 *   4) [자동 가져오기 켜기]를 누르면 30분마다 새 기록이 저절로 쌓입니다
 *
 * 만들어지는 탭
 *   학생현황     — 학생별 요약 (가져올 때마다 새로 씀)
 *   문제기록     — 모든 풀이 기록 원본 (계속 아래로 쌓임, 지우지 마세요)
 *   반 전체      — 반 전체 대시보드
 *   👤 학생이름  — 학생별 대시보드 (새 학생이 생기면 자동으로 만들어짐)
 *   _학생템플릿  — 학생 탭의 원본 (숨김)
 *
 * 대시보드의 표·그래프는 전부 '문제기록' 탭을 수식(QUERY)으로 걸러 보여줍니다.
 * 그래서 서식이나 표를 직접 고치셔도 기록에는 영향이 없습니다.
 */

const SH = { status: '학생현황', log: '문제기록', all: '반 전체', tpl: '_학생템플릿' };
const STUDENT_PREFIX = '👤 ';
const LOG_HEAD = ['날짜시각', '닉네임', '상황', '과목', '단원', '난이도', '정답', '문항', '정답 보기', '기록ID'];
const STATUS_HEAD = ['닉네임', '레벨', '포인트', '도감', '가입일', '푼 문항', '정답률', '오늘 푼 문항', '최근 활동'];
const PROP = { url: 'EXPORT_URL', owner: 'EXPORT_SHEET_ID', cursor: 'EXPORT_CURSOR', cls: 'EXPORT_CLASS' };
const PERIODS = ['이번 주', '지난 주', '이번 달', '지난 달', '최근 30일', '전체', '직접 입력'];
const LOG = "'" + SH.log + "'!A2:J";

// 꾸미기(서식·색·그래프)가 혹시 실패해도 기록 가져오기는 멈추지 않도록 감싼다
function safe_(what, fn) {
  try { fn(); } catch (e) { console.warn(what + ' 건너뜀: ' + e.message); }
}

// ── 메뉴 ─────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🎮 잡으면서 배우자')
    .addItem('① 처음 설정하기', 'setupSheets')
    .addItem('② 연동 주소 넣기', 'setExportUrl')
    .addItem('③ 지금 가져오기', 'syncNow')
    .addSeparator()
    .addItem('⏱ 자동 가져오기 켜기 (30분마다)', 'enableAutoSync')
    .addItem('⏸ 자동 가져오기 끄기', 'disableAutoSync')
    .addSeparator()
    .addItem('🔁 기록 전부 다시 받기', 'resyncAll')
    .addItem('🧹 배포용으로 비우기 (템플릿 만드는 분만)', 'clearForTemplate')
    .addToUi();
}

// ── ① 처음 설정하기 ──────────────────────────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone('Asia/Seoul');
  ensureSheets_(ss, true);
  SpreadsheetApp.getUi().alert(
    '✅ 시트 준비 완료',
    '학생현황 · 문제기록 · 반 전체 탭을 만들었어요.\n\n' +
    '다음으로 메뉴에서 [② 연동 주소 넣기]를 눌러 주세요.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

// rebuild=true 이면 반 전체·학생템플릿 대시보드를 새로 그린다(문제기록은 건드리지 않음)
function ensureSheets_(ss, rebuild) {
  let log = ss.getSheetByName(SH.log);
  if (!log) {
    log = ss.insertSheet(SH.log);
    log.getRange(1, 1, 1, LOG_HEAD.length).setValues([LOG_HEAD]).setFontWeight('bold').setBackground('#eef1f8');
    log.setFrozenRows(1);
    log.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
    log.getRange('B:F').setNumberFormat('@');
    safe_('O/X 표시', function () {
      log.getRange('G:G').setNumberFormat('[=1]"O";[=0]"X";General').setHorizontalAlignment('center');
    });
    log.getRange('H:J').setNumberFormat('@');
    [135, 80, 70, 60, 130, 70, 45, 380, 140, 90].forEach((w, i) => log.setColumnWidth(i + 1, w));
  }

  let st = ss.getSheetByName(SH.status);
  if (!st) {
    st = ss.insertSheet(SH.status, 0);
    st.getRange(1, 1, 1, STATUS_HEAD.length).setValues([STATUS_HEAD]).setFontWeight('bold').setBackground('#eef1f8');
    st.setFrozenRows(1);
    [90, 50, 70, 50, 90, 65, 65, 85, 125].forEach((w, i) => st.setColumnWidth(i + 1, w));
    st.getRange('K1:K3').setValues([['마지막 가져오기'], [''], ['']]);
    st.getRange('K1').setFontWeight('bold');
    st.setColumnWidth(11, 170);
  }

  let all = ss.getSheetByName(SH.all);
  const newAll = !all;
  if (!all) all = ss.insertSheet(SH.all, 1);
  if (newAll || rebuild) buildDashboard_(all, '(전체)');

  let tpl = ss.getSheetByName(SH.tpl);
  const newTpl = !tpl;
  if (!tpl) tpl = ss.insertSheet(SH.tpl);
  if (newTpl || rebuild) buildDashboard_(tpl, '');
  tpl.hideSheet();

  // 새 시트에 기본으로 있는 빈 탭 정리
  ['시트1', 'Sheet1'].forEach(function (n) {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });
}

// ── 대시보드 (반 전체 / 학생 탭 공통) ────────────────────────

function buildDashboard_(sh, who) {
  sh.clear();
  sh.getCharts().forEach(function (c) { sh.removeChart(c); });
  sh.clearConditionalFormatRules();
  sh.getDataRange().clearDataValidations();
  if (sh.getMaxColumns() < 26) sh.insertColumnsAfter(sh.getMaxColumns(), 26 - sh.getMaxColumns());
  if (sh.getMaxRows() < 300) sh.insertRowsAfter(sh.getMaxRows(), 300 - sh.getMaxRows());

  const isAll = who === '(전체)';
  sh.getRange('A1').setValue(isAll ? '📊 반 전체 대시보드' : '👤 학생 대시보드').setFontSize(15).setFontWeight('bold');
  sh.getRange('A3:A6').setValues([[isAll ? '대상' : '학생'], ['기간'], ['시작일'], ['종료일']]).setFontWeight('bold');
  sh.getRange('B3').setNumberFormat('@').setValue(who).setFontWeight('bold').setFontSize(12);

  sh.getRange('B4').setValue('이번 달').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(PERIODS, true).build()).setBackground('#fff8e1');
  sh.getRange('B5').setFormula(
    '=IF($B$4="직접 입력",IF($D$5="",DATE(2000,1,1),$D$5),SWITCH($B$4,' +
    '"이번 주",TODAY()-WEEKDAY(TODAY(),3),' +
    '"지난 주",TODAY()-WEEKDAY(TODAY(),3)-7,' +
    '"이번 달",EOMONTH(TODAY(),-1)+1,' +
    '"지난 달",EOMONTH(TODAY(),-2)+1,' +
    '"최근 30일",TODAY()-29,' +
    'DATE(2000,1,1)))');
  sh.getRange('B6').setFormula(
    '=IF($B$4="직접 입력",IF($D$6="",TODAY(),$D$6),SWITCH($B$4,' +
    '"지난 주",TODAY()-WEEKDAY(TODAY(),3)-1,' +
    '"지난 달",EOMONTH(TODAY(),-1),' +
    'TODAY()))');
  sh.getRange('B5:B6').setNumberFormat('yyyy-mm-dd');
  sh.getRange('C5:C6').setValues([['직접 입력 →'], ['직접 입력 →']]).setFontColor('#999999');
  sh.getRange('D5:D6').setNumberFormat('yyyy-mm-dd').setBackground('#fff8e1');
  sh.getRange('E4').setValue('← 기간을 고르면 아래 표·그래프가 모두 바뀌어요').setFontColor('#999999');

  // 모든 표가 함께 쓰는 조건(기간 + 학생) — Z열에 두고 숨긴다
  sh.getRange('Z1').setFormula(
    '="where A is not null and toDate(A) >= date \'"&TEXT($B$5,"yyyy-mm-dd")&"\'' +
    ' and toDate(A) <= date \'"&TEXT($B$6,"yyyy-mm-dd")&"\'"' +
    '&IF($B$3="(전체)",""," and B = """&$B$3&"""")');
  sh.hideColumns(26);

  const q = function (cell, select, rest, empty) {
    sh.getRange(cell).setFormula(
      '=IFERROR(QUERY(' + LOG + ',"' + select + ' "&$Z$1&"' + (rest ? ' ' + rest : '') + '",0),"' + (empty || '기록 없음') + '")');
  };
  const title = function (cell, text) {
    sh.getRange(cell).setValue(text).setFontWeight('bold').setFontSize(11).setFontColor('#2f4bc0');
  };

  // 요약
  title('A8', '요약');
  q('B8', 'select count(G), sum(G), avg(G)', "label count(G) '푼 문항', sum(G) '맞힌 문항', avg(G) '정답률'");

  // 과목·단원별
  title('A11', '📚 과목·단원별');
  q('A12', 'select D, E, count(G), avg(G), 1-avg(G)',
    "group by D, E order by D, E label D '과목', E '단원', count(G) '문항수', avg(G) '정답률', 1-avg(G) '오답률'");

  // 과목·단원 × 난이도
  title('G11', '🎯 과목·단원 × 난이도 (정답률)');
  q('G12', 'select D, E, avg(G)', "group by D, E pivot F order by D, E label D '과목', E '단원'");

  // 난이도별 / 상황별 / 날짜별
  title('M11', '📈 난이도별');
  q('M12', 'select F, count(G), avg(G)', "group by F label F '난이도', count(G) '문항수', avg(G) '정답률'");
  title('M18', '🎮 상황별 (배틀·문제풀이·레이드)');
  q('M19', 'select C, count(G), avg(G)', "group by C label C '상황', count(G) '문항수', avg(G) '정답률'");
  title('M25', '📅 날짜별 정답률');
  q('M26', 'select toDate(A), avg(G), count(G)',
    "group by toDate(A) order by toDate(A) label toDate(A) '날짜', avg(G) '정답률', count(G) '문항수'");

  // 오답 모아보기
  title('Q11', '❌ 오답 모아보기 (최근 100개 · 복습용)');
  sh.getRange('Q12').setFormula(
    '=IFERROR(QUERY(' + LOG + ',"select A, D, E, F, H, I "&$Z$1&" and G = 0 order by A desc limit 100' +
    " label A '날짜', D '과목', E '단원', F '난이도', H '문항', I '정답'\",0),\"오답 없음 🎉\")");

  // 숫자 모양
  sh.getRange('D9').setNumberFormat('0%');
  sh.getRange('D13:E300').setNumberFormat('0%');
  sh.getRange('I13:L300').setNumberFormat('0%');
  sh.getRange('O13:O16').setNumberFormat('0%');
  sh.getRange('O20:O23').setNumberFormat('0%');
  sh.getRange('M27:M300').setNumberFormat('m/d');
  sh.getRange('N27:N300').setNumberFormat('0%');
  sh.getRange('Q13:Q300').setNumberFormat('m/d hh:mm');
  sh.getRange('A12:X12').setFontWeight('bold');
  sh.getRange('B8:D8').setFontWeight('bold');
  sh.getRange('M19:O19').setFontWeight('bold');
  sh.getRange('M26:O26').setFontWeight('bold');

  // 정답률은 낮을수록 붉게, 높을수록 푸르게 (오답률은 반대)
  const scale = function (a1, reverse) {
    return SpreadsheetApp.newConditionalFormatRule()
      .setGradientMinpoint(reverse ? '#d9ead3' : '#f4c7c3')
      .setGradientMidpointWithValue('#fff2cc', SpreadsheetApp.InterpolationType.NUMBER, '0.5')
      .setGradientMaxpoint(reverse ? '#f4c7c3' : '#d9ead3')
      .setRanges([sh.getRange(a1)]).build();
  };
  safe_('정답률 색', function () {
    sh.setConditionalFormatRules([
      scale('D13:D300'), scale('E13:E300', true), scale('I13:L300'),
      scale('O13:O16'), scale('O20:O23'), scale('N27:N300'),
    ]);
  });

  // 폭
  [70, 110, 60, 60, 60, 16, 60, 110, 62, 62, 62, 16, 95, 60, 60, 16, 90, 60, 110, 70, 320, 130].forEach(
    function (w, i) { sh.setColumnWidth(i + 1, w); });

  // 날짜별 정답률 꺾은선 그래프
  safe_('그래프', function () {
    const chart = sh.newChart().asLineChart()
      .addRange(sh.getRange('M26:N300'))
      .setNumHeaders(1)
      .setOption('title', '날짜별 정답률')
      .setOption('legend', { position: 'none' })
      .setOption('vAxis', { format: 'percent', viewWindow: { min: 0, max: 1 } })
      .setOption('pointSize', 5)
      .setOption('width', 520).setOption('height', 195)
      .setPosition(1, 7, 0, 0) // 위쪽 빈 자리(G1~N10). 표 제목은 11행부터라 겹치지 않는다
      .build();
    sh.insertChart(chart);
  });
  sh.setFrozenRows(0);
}

// ── ② 연동 주소 넣기 ─────────────────────────────────────────

function setExportUrl() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('② 연동 주소 넣기',
    '잡으면서 배우자 → 교사 메뉴 → 시스템 설정 → [📊 구글 시트 연동]에서\n' +
    '[📋 복사]한 주소를 여기에 붙여넣으세요.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const url = r.getResponseText().trim();
  if (!/^https:\/\/[^\s?#]+\/api\/export\?token=pk_[A-Za-z0-9_-]{20,}$/.test(url)) {
    ui.alert('주소 모양이 달라요.\n\nhttps://…/api/export?token=pk_… 형태의 주소 전체를 붙여넣어 주세요.');
    return;
  }

  let body;
  try {
    // 기록은 받지 않고 연결만 확인 (아주 먼 미래부터 달라고 요청)
    body = fetchJson_(url + '&students=0&cursor=' + encodeURIComponent('9999-12-31T00:00:00+00:00|'));
  } catch (e) {
    ui.alert('연결하지 못했어요.\n\n' + e.message);
    return;
  }

  const p = PropertiesService.getDocumentProperties();
  const id = SpreadsheetApp.getActive().getId();
  if (p.getProperty(PROP.owner) !== id) {
    // 다른 시트에서 복사해 온 설정이면 이어받기 위치를 버린다
    p.deleteProperty(PROP.cursor);
    p.deleteProperty(PROP.cls);
  }
  p.setProperty(PROP.url, url);
  p.setProperty(PROP.owner, id);
  ensureSheets_(SpreadsheetApp.getActive(), false);

  ui.alert('✅ 연결됐어요',
    '"' + body.class.name + '" 학급(코드 ' + body.class.code + ')과 연결했어요.\n\n' +
    '이제 메뉴에서 [③ 지금 가져오기]를 눌러 주세요.', ui.ButtonSet.OK);
}

function getConfig_() {
  const p = PropertiesService.getDocumentProperties();
  const url = p.getProperty(PROP.url);
  // 이 시트를 복사한 사본에는 원래 시트의 연동 주소가 따라가지 않도록
  if (!url || p.getProperty(PROP.owner) !== SpreadsheetApp.getActive().getId()) return null;
  return { url: url, cursor: p.getProperty(PROP.cursor) || '' };
}

function fetchJson_(url) {
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
  const code = res.getResponseCode();
  let body = null;
  try { body = JSON.parse(res.getContentText()); } catch (e) { /* JSON이 아님 */ }
  if (code !== 200 || !body || !body.ok)
    throw new Error((body && body.error) || ('서버가 응답하지 않아요 (' + code + '). 잠시 후 다시 해 주세요.'));
  return body;
}

// ── ③ 가져오기 ───────────────────────────────────────────────

function syncNow() {
  const ui = SpreadsheetApp.getUi();
  try {
    const r = sync_();
    ui.alert('✅ 가져오기 완료',
      '새 기록 ' + r.added + '개를 가져왔어요.' +
      (r.more ? '\n\n아직 남은 기록이 있어요. 한 번 더 눌러 주세요.' : '') +
      (r.newTabs ? '\n새 학생 탭 ' + r.newTabs + '개를 만들었어요.' : ''),
      ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('가져오지 못했어요', e.message, ui.ButtonSet.OK);
  }
}

// 자동 가져오기(트리거)용 — 화면에 창을 띄울 수 없으므로 오류는 기록만
function autoSync() {
  try { sync_(); } catch (e) { console.error(e); }
}

function sync_() {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(20000)) throw new Error('다른 가져오기가 진행 중이에요. 잠시 후 다시 해 주세요.');
  try {
    const cfg = getConfig_();
    if (!cfg) throw new Error('연동 주소가 없어요. 메뉴에서 [② 연동 주소 넣기]를 먼저 해 주세요.');
    const ss = SpreadsheetApp.getActive();
    const p = PropertiesService.getDocumentProperties();
    ensureSheets_(ss, false);

    let cursor = cfg.cursor, students = null, cls = null, added = 0, more = false;
    const started = Date.now();
    for (let i = 0; ; i++) {
      const body = fetchJson_(cfg.url + '&cursor=' + encodeURIComponent(cursor) + (i ? '&students=0' : ''));
      if (i === 0) { students = body.students || []; cls = body.class; checkClass_(p, cls); }
      if (body.logs && body.logs.length) added += appendLogs_(ss, body.logs);
      cursor = body.cursor || cursor;
      p.setProperty(PROP.cursor, cursor); // 중간에 멈춰도 다음에 이어서 받도록
      if (body.done) break;
      if (Date.now() - started > 4 * 60 * 1000) { more = true; break; } // 실행 시간 제한(6분) 전에 멈춤
    }

    const tabs = ensureStudentTabs_(ss, students);
    updateStatus_(ss, students, tabs.gid, cls);
    return { added: added, more: more, newTabs: tabs.created };
  } finally {
    lock.releaseLock();
  }
}

function checkClass_(p, cls) {
  const saved = p.getProperty(PROP.cls);
  if (!saved) { p.setProperty(PROP.cls, cls.code); return; }
  if (saved !== cls.code)
    throw new Error('이 시트에는 학급 코드 ' + saved + '의 기록이 쌓여 있는데, 연동 주소는 ' + cls.code +
      ' 학급이에요.\n\n다른 반이라면 새 시트를 쓰시거나, 메뉴의 [🔁 기록 전부 다시 받기]를 해 주세요.');
}

function appendLogs_(ss, logs) {
  const sh = ss.getSheetByName(SH.log);
  const last = sh.getLastRow();
  // 직전에 받다가 끊긴 경우를 대비해 최근 기록ID와 겹치는 것은 건너뛴다
  const seen = {};
  if (last > 1) {
    const n = Math.min(3000, last - 1);
    sh.getRange(last - n + 1, 10, n, 1).getValues().forEach(function (r) { seen[String(r[0])] = true; });
  }
  const rows = [];
  logs.forEach(function (l) {
    // l = [기록ID, 시각, 닉네임, 상황, 과목, 단원, 난이도, 정답(1/0), 문항, 정답 보기]
    if (seen[String(l[0])]) return;
    rows.push([new Date(l[1]), l[2], l[3], l[4], l[5], l[6], Number(l[7]), l[8], l[9], String(l[0])]);
  });
  if (!rows.length) return 0;
  const need = last + rows.length - sh.getMaxRows();
  if (need > 0) sh.insertRowsAfter(sh.getMaxRows(), need + 500);
  sh.getRange(last + 1, 1, rows.length, LOG_HEAD.length).setValues(rows);
  return rows.length;
}

function tabName_(nickname) {
  return (STUDENT_PREFIX + String(nickname).replace(/[\[\]\*\?\/\\:]/g, '_')).slice(0, 90);
}

function ensureStudentTabs_(ss, students) {
  const gid = {};
  let created = 0;
  const tpl = ss.getSheetByName(SH.tpl);
  (students || []).forEach(function (s) {
    const name = tabName_(s.nickname);
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = tpl.copyTo(ss).setName(name);
      sh.getRange('B3').setNumberFormat('@').setValue(String(s.nickname));
      sh.showSheet();
      created++;
    }
    gid[s.nickname] = sh.getSheetId();
  });
  return { gid: gid, created: created };
}

function updateStatus_(ss, students, gid, cls) {
  const sh = ss.getSheetByName(SH.status);
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, STATUS_HEAD.length).clearContent();

  const L = "'" + SH.log + "'!";
  const rows = (students || []).map(function (s, i) {
    const r = i + 2;
    const name = String(s.nickname).replace(/"/g, '""');
    return [
      gid[s.nickname] != null ? '=HYPERLINK("#gid=' + gid[s.nickname] + '","' + name + '")' : s.nickname,
      s.level, s.points, s.dex, new Date(s.joinedAt),
      '=COUNTIF(' + L + 'B:B,$A' + r + ')',
      '=IFERROR(AVERAGEIF(' + L + 'B:B,$A' + r + ',' + L + 'G:G),"")',
      '=COUNTIFS(' + L + 'B:B,$A' + r + ',' + L + 'A:A,">="&TODAY())',
      '=IFERROR(1/(1/MAXIFS(' + L + 'A:A,' + L + 'B:B,$A' + r + ')),"")',
    ];
  });
  if (rows.length) {
    const need = rows.length + 1 - sh.getMaxRows();
    if (need > 0) sh.insertRowsAfter(sh.getMaxRows(), need);
    sh.getRange(2, 1, rows.length, STATUS_HEAD.length).setValues(rows);
    sh.getRange(2, 5, rows.length, 1).setNumberFormat('yyyy-mm-dd');
    sh.getRange(2, 7, rows.length, 1).setNumberFormat('0%');
    sh.getRange(2, 9, rows.length, 1).setNumberFormat('m/d hh:mm');
  }
  sh.getRange('K2').setValue(new Date()).setNumberFormat('yyyy-mm-dd hh:mm');
  if (cls) sh.getRange('K3').setValue(cls.name + ' (' + cls.code + ')');
}

// ── 자동 가져오기 ────────────────────────────────────────────

function enableAutoSync() {
  if (!getConfig_()) {
    SpreadsheetApp.getUi().alert('먼저 [② 연동 주소 넣기]를 해 주세요.');
    return;
  }
  removeTriggers_();
  ScriptApp.newTrigger('autoSync').timeBased().everyMinutes(30).create();
  SpreadsheetApp.getUi().alert('⏱ 자동 가져오기를 켰어요',
    '이제 30분마다 새 기록이 저절로 쌓여요.\n시트를 닫아 두어도 괜찮아요.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

function disableAutoSync() {
  const n = removeTriggers_();
  SpreadsheetApp.getUi().alert(n ? '⏸ 자동 가져오기를 껐어요.' : '자동 가져오기가 켜져 있지 않았어요.');
}

function removeTriggers_() {
  let n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'autoSync') { ScriptApp.deleteTrigger(t); n++; }
  });
  return n;
}

// ── 관리 ─────────────────────────────────────────────────────

function resyncAll() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('기록 전부 다시 받기',
    '문제기록 탭을 비우고 처음부터 다시 받아요.\n(학생 탭과 서식은 그대로예요)\n\n계속할까요?',
    ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SH.log);
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, LOG_HEAD.length).clearContent();
  const p = PropertiesService.getDocumentProperties();
  p.deleteProperty(PROP.cursor);
  p.deleteProperty(PROP.cls);
  syncNow();
}

// 템플릿을 다른 선생님께 나눠 드리기 전에: 기록·학생 탭·연동 주소를 모두 지운다.
function clearForTemplate() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('배포용으로 비우기',
    '이 시트를 다른 선생님께 나눠 드릴 템플릿으로 만들어요.\n\n' +
    '· 문제기록, 학생현황의 내용을 모두 지워요\n· 학생 탭(👤)을 모두 지워요\n' +
    '· 연동 주소와 자동 가져오기를 해제해요\n\n실제로 쓰는 시트라면 누르지 마세요. 계속할까요?',
    ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  const ss = SpreadsheetApp.getActive();
  ss.getSheets().forEach(function (s) {
    if (s.getName().indexOf(STUDENT_PREFIX) === 0) ss.deleteSheet(s);
  });
  [SH.log, SH.status].forEach(function (n) {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
  });
  const st = ss.getSheetByName(SH.status);
  if (st) st.getRange('K2:K3').clearContent();
  removeTriggers_();
  PropertiesService.getDocumentProperties().deleteAllProperties();
  ensureSheets_(ss, true);
  ui.alert('🧹 비웠어요. 이제 [공유 → 링크 복사] 후 주소 끝의 /edit… 를 /copy 로 바꿔 나눠 주세요.');
}
