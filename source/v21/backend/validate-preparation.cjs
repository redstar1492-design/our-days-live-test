'use strict';
// Static preparation checks ONLY. No network, credentials, server, SQL execution.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dir = __dirname;
const read = file => fs.readFileSync(path.join(dir, file), 'utf8');
const sql = read('003_collections_trips.review.sql');
const contract = read('adapter-contract.d.ts');
const readOnly = read('preflight.readonly.sql').replace(/--[^\n]*/g, '');
const doc = read('README.md');
const assertions = [];
function check(condition, name) {
  assertions.push({ name, passed: Boolean(condition) });
}
for (const [file, expected] of [
  ['baseline-001.sql', 'cd8ac95c3542eec0f486255adb0b7806ddde7ef2'],
  ['baseline-002.sql', 'd8c9107ec709208c464da430bc02b915b2edbf30'],
  ['baseline-shared.ts', '9cba225e7e55f4a82252c106d76e48063e8a4da9']
]) {
  const bytes = fs.readFileSync(path.join(dir, file));
  const sha = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  check(sha === expected, `baseline Git blob preserved: ${file}`);
}
for (const table of ['collections', 'trips', 'trip_stops', 'collection_items']) {
  check(sql.includes(`create table public.${table} (`), `${table}: definition present`);
  check(sql.includes(`alter table public.${table} enable row level security;`), `${table}: RLS enabled`);
  for (const operation of ['select', 'insert', 'update', 'delete']) {
    check(new RegExp(`on public\\.${table} for ${operation} to authenticated`).test(sql), `${table}: ${operation} policy present`);
  }
}
check(/grant select on public\.collections, public\.trips, public\.trip_stops, public\.collection_items\s+to authenticated/.test(sql), 'authenticated gets SELECT only');
check(!/grant\s+(?:all|insert|update|delete)\b/i.test(sql), 'no client write grant');
check(!/grant\s+select[^;]+to\s+(?:anon|public)\s*;/i.test(sql), 'no anonymous/public read grant');
check(sql.includes('revoke all on public.collections, public.trips, public.trip_stops, public.collection_items'), 'public/anon default table privileges revoked');
for (const table of ['dumps', 'events', 'todos']) {
  check(sql.includes(`references public.${table}(id, couple_id)`), `${table}: target same-couple composite FK`);
}
check(sql.includes('num_nonnulls(dump_id, event_id, todo_id) = 1'), 'exactly one real item reference required');
check(sql.includes('set search_path = \'\''), 'fixed helper search path');
check(sql.includes('m.user_id = auth.uid()'), 'membership derives verified auth identity');
check(sql.includes('deferrable initially deferred'), 'atomic stop/date and order changes supported');
check(sql.includes('event_id uuid not null unique'), 'one calendar event per trip');
check(!/\b(create|alter|drop|grant|revoke|insert|update|delete|truncate|execute|call|do)\b/i.test(readOnly), 'preflight is read-only');
check(contract.includes('readonly mode: \'connected\''), 'connected adapter is explicitly distinct from local HTML');
check(contract.includes('expectedRevision: Revision'), 'revision conflict contract');
check(contract.includes('operationId: UUID'), 'retry idempotency contract');
check(contract.includes('viewportBasedReadReceipt: true'), 'future chat read receipt requires visible message');
check(contract.includes('reconnectBackfill: true'), 'future chat reconnect backfill contract');
check(!/create table [\w.]*messages|create table [\w.]*conversations/i.test(sql), 'no fake chat schema or implementation');
check(doc.includes('아직 미실행'), 'runtime database validation is clearly not claimed');
check(doc.includes('모음 자체 삭제를 작성자에게 제한'), 'delete authorization is documented');
check(doc.includes('기존 스키마 전체의 권한이 이 초안으로 보완되는 것은 아닙니다'), 'legacy permissions limitation disclosed');
for (const [name, source] of [['draft SQL', sql], ['contract', contract], ['documentation', doc]]) {
  check(!/gh[pousr]_[A-Za-z0-9_]{20,}|BEGIN[ -].*PRIVATE KEY/.test(source), `${name}: no credential-like strings`);
}
const result = {
  scope: 'Static preparation checks only; SQL was not executed and no backend was connected.',
  passed: assertions.filter(a => a.passed).length,
  failed: assertions.filter(a => !a.passed).length,
  assertions
};
fs.writeFileSync(path.join(dir, 'validation-result.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ scope: result.scope, passed: result.passed, failed: result.failed }));
for (const a of assertions.filter(a => !a.passed)) console.error(a.name);
process.exitCode = result.failed ? 1 : 0;
