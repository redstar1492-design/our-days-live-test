'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { spawn } = require('child_process');
const target = process.argv[2] || 'outputs/index0922testv22.html';
const suites = [
  ['test-v17-calendar.cjs', '캘린더 및 일정 상세'],
  ['test-v17-tasks.cjs', '할 일 목록·분류·편집'],
  ['test-v17-confirm.cjs', '확인창·작성 취소'],
  ['test-coherence-logic.cjs', '날짜 선택 및 일정 연결'],
  ['test-deadlines.cjs', 'D-day·마감 정렬'],
  ['test-release-logic.cjs', '댓글·참여·저장 충돌·프로필'],
  ['test-v10-storage.cjs', '백업·이미지·저장 롤백'],
  ['test-profile-dates.cjs', '프로필·커플 날짜'],
  ['test-v19-title-migration.cjs', '기존 제목 호환']
];
function run([file, label]) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, ['--require', path.resolve('work/test-v22-regression-deps.cjs'), path.join('work', file), target], { cwd: process.cwd(), shell: false, windowsHide: true });
    let output = '', error = '';
    child.stdout.on('data', chunk => output += chunk);
    child.stderr.on('data', chunk => error += chunk);
    child.on('error', err => resolve({ file, label, code: -1, output, error: String(err) }));
    child.on('close', code => resolve({ file, label, code, output, error }));
  });
}
(async () => {
  if (!fs.existsSync(target)) throw Error('Deliverable not built: ' + target);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
  const results = new Array(suites.length); let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => { while (cursor < suites.length) { const i = cursor++; results[i] = await run(suites[i]); } }));
  const seen = new Set(), duplicates = [], failures = [];
  for (const result of results) {
    result.passes = result.output.split(/\r?\n/).filter(line => line.startsWith('PASS '));
    for (const pass of result.passes) { if (seen.has(pass)) duplicates.push(pass); seen.add(pass); }
    if (result.code !== 0) failures.push(result.file + ': exit ' + result.code);
    const failLines = result.output.split(/\r?\n/).filter(line => line.startsWith('FAIL '));
    failures.push(...failLines);
    console.log(result.file + ': ' + result.passes.length + ' passed, exit ' + result.code);
  }
  if (duplicates.length) failures.push('Duplicate pass labels: ' + duplicates.length);
  let report = 'dump v22 기존 앱 회귀 검사\n대상: ' + target + '\nSHA256: ' + hash + '\n실행(UTC): ' + new Date().toISOString() + '\n';
  report += '결과: ' + seen.size + '개 고유 검사 통과, ' + failures.length + '개 실패\n';
  report += '\n이 보고서는 기존 앱 기능 회귀 코드 검사만 다룬다. 새 실제 앱 가이드·초대 검사는 별도 보고서에 따른다.\n';
  report += '격리 VM에는 산출 HTML의 실제 v22 연결 판정·가이드·컬렉션·위치 검증 함수를 주입한다. 화면 갱신 hook은 기존 render()와 마찬가지로 모의 처리한다.\n';
  if (failures.length) report += '\n실패\n' + failures.join('\n') + '\n';
  for (const result of results) report += '\n[' + result.file + ']\n' + result.output + (result.error ? '\nSTDERR\n' + result.error : '');
  fs.writeFileSync('outputs/QA-v22-기존-회귀.txt', report, 'utf8');
  console.log(JSON.stringify({ target, hash, passed: seen.size, failures, report: 'outputs/QA-v22-기존-회귀.txt' }));
  if (failures.length) process.exitCode = 1;
})().catch(err => { console.error(err); process.exitCode = 1; });
