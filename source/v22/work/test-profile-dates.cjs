const fs = require('fs'), vm = require('vm'), assert = require('assert');
const file = process.argv[2] || 'outputs/dump-final.html';
const html = fs.readFileSync(file, 'utf8');
const active = html.slice(html.indexOf('/* Our Days 4'));
function extract(name, source = html) {
  const match = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(').exec(source);
  if (!match) throw Error('Missing function ' + name);
  const start = match.index;
  let end = source.indexOf('\n', start);
  while (end >= 0) {
    const candidate = source.slice(start, end).trim();
    try { new vm.Script('(' + candidate + ')'); return candidate; } catch {}
    end = source.indexOf('\n', end + 1);
  }
  throw Error('Cannot extract ' + name);
}
function context(values) { values.window = values; vm.createContext(values); return values; }
function load(ctx, names, source = html) { vm.runInContext(names.map(name => extract(name, source)).join('\n'), ctx); }
const asPlain = value => JSON.parse(JSON.stringify(value));
const today = () => '2026-10-08';
const encode = value => String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const base = () => ({ posts: [], events: [], todoCategories: [], notifications: [], currentUser: '준영', firstMetDate: '2022-01-01', anniversary: '2022-02-01', memberProfiles: { '준영': { nickname: '준영', handle: 'junyoung', avatar: 'data:image/jpeg;base64,AA==', cover: 'data:image/jpeg;base64,BB==', bio: '기존 소개', email: 'j@example.com' }, '아정': { nickname: '아정', handle: 'ajung', avatar: 'data:image/jpeg;base64,CC==', bio: '상대 소개' } } });
function profileContext(overrides = {}, failSave = false) {
  const state = base(), elements = {}, inputs = { 'profile-name': '양준영', 'profile-handle': 'junyoung', 'profile-bio': '수정된 소개', 'profile-email': 'new@example.com', 'first-met': '2022-01-03', 'dating-start': '2022-02-04', ...overrides };
  const raw = JSON.stringify(state), storage = new Map([['test-state', raw]]);
  const ctx = context({ state, STATE_KEY: 'test-state', odPersistedRaw: raw, viewer: '준영', profileDraft: { ...state.memberProfiles['준영'] }, profileToken: 0, profileBusy: false, modalKind: 'profile', Date, JSON, Number, Error, today, e: encode, icon: () => '<svg></svg>', nicknameOf: who => ctx.state.memberProfiles[who]?.nickname || who, avatarUrlOf: who => ctx.state.memberProfiles[who]?.avatar || '', me: () => ctx.viewer, value: key => inputs[key] || '', $: key => elements[key] || (elements[key] = {}), localStorage: { getItem: key => storage.has(key) ? storage.get(key) : null, setItem: (key, value) => { if (failSave) throw Error('quota'); storage.set(key, value); } }, toasts: [], toast: message => ctx.toasts.push(message), showSyncNotice: () => { ctx.notice = true; }, close: () => { ctx.closed = true; }, render: () => { ctx.rendered = true; }, show: (title, body, footer, kind) => { ctx.dialog = { title, body, footer, kind }; }, field: (label, name, value) => '<label>' + label + '<input id="od-' + name + '" value="' + encode(value) + '"></label>', area: (label, name, value) => '<label>' + label + '<textarea id="od-' + name + '">' + encode(value) + '</textarea></label>', footer: () => '' });
  load(ctx, ['validISODate', 'saveState', 'commit', 'dateLabel', 'dateField', 'profileEdit', 'saveProfile', 'relationshipDates']);
  return { ctx, inputs, storage, raw, elements };
}
let passed = 0, failed = 0;
function test(name, run) { try { run(); passed++; console.log('PASS ' + name); } catch (error) { failed++; console.log('FAIL ' + name + ' :: ' + error.message); } }

test('profile form reads both shared dates and constrains selection to today', () => {
  const { ctx } = profileContext(); ctx.profileEdit();
  assert(ctx.dialog.body.includes('id="od-first-met" type="hidden" value="2022-01-01" max="2026-10-08" data-optional="true"'));
  assert(ctx.dialog.body.includes('id="od-dating-start" type="hidden" value="2022-02-01" max="2026-10-08" data-optional="true"'));
  assert.equal(ctx.dialog.kind, 'profile');
});
test('partner profile form reads the same shared dates', () => {
  const { ctx } = profileContext(); ctx.viewer = '아정'; ctx.profileEdit();
  assert(ctx.dialog.body.includes('id="od-first-met" type="hidden" value="2022-01-01"'));
  assert(ctx.dialog.body.includes('id="od-dating-start" type="hidden" value="2022-02-01"'));
  assert(ctx.dialog.body.includes('id="od-profile-name" value="아정"'));
});
test('actual profile save persists profile and shared dates in one stored state', () => {
  const { ctx, storage } = profileContext(); ctx.saveProfile();
  const saved = JSON.parse(storage.get('test-state'));
  assert.equal(saved.memberProfiles['준영'].nickname, '양준영');
  assert.equal(saved.firstMetDate, '2022-01-03'); assert.equal(saved.anniversary, '2022-02-04');
  assert(ctx.closed && ctx.rendered);
});
test('saving relationship dates retains existing avatar, cover and partner profile', () => {
  const { ctx, storage } = profileContext(); const other = asPlain(ctx.state.memberProfiles['아정']); ctx.saveProfile();
  const saved = JSON.parse(storage.get('test-state'));
  assert.equal(saved.memberProfiles['준영'].avatar, 'data:image/jpeg;base64,AA==');
  assert.equal(saved.memberProfiles['준영'].cover, 'data:image/jpeg;base64,BB==');
  assert.deepStrictEqual(saved.memberProfiles['아정'], other);
  assert(!Object.hasOwn(saved.memberProfiles['준영'], 'firstMetDate')); assert(!Object.hasOwn(saved.memberProfiles['아정'], 'anniversary'));
});
test('relationship dates remain shared after switching viewer', () => {
  const { ctx } = profileContext(); ctx.saveProfile(); const first = ctx.relationshipDates(); ctx.viewer = '아정';
  assert.equal(ctx.relationshipDates(), first); assert(first.includes('datetime="2022-01-03"')); assert(first.includes('datetime="2022-02-04"'));
});
test('optional relationship dates can both be cleared and stay absent in display', () => {
  const { ctx, storage } = profileContext({ 'first-met': '', 'dating-start': '' }); ctx.saveProfile();
  const saved = JSON.parse(storage.get('test-state')); assert.equal(saved.firstMetDate, null); assert.equal(saved.anniversary, null); assert.equal(ctx.relationshipDates(), '');
});
test('one relationship date can be set without requiring the other', () => {
  for (const inputs of [{ 'first-met': '2022-01-03', 'dating-start': '' }, { 'first-met': '', 'dating-start': '2022-02-04' }]) {
    const { ctx, storage, raw } = profileContext(inputs); ctx.saveProfile(); assert.notEqual(storage.get('test-state'), raw); assert(ctx.closed);
  }
});
test('same-day first meeting and dating start are accepted', () => {
  const { ctx } = profileContext({ 'first-met': '2022-02-04', 'dating-start': '2022-02-04' }); ctx.saveProfile(); assert(ctx.closed);
});
for (const [name, inputs] of [
  ['future first meeting', { 'first-met': '2026-10-09', 'dating-start': '' }],
  ['future dating start', { 'first-met': '', 'dating-start': '2026-10-09' }],
  ['impossible calendar date', { 'first-met': '2026-02-30', 'dating-start': '' }],
  ['reversed relationship dates', { 'first-met': '2022-03-01', 'dating-start': '2022-02-01' }]
]) test('actual profile save rejects ' + name + ' without changing state', () => {
  const { ctx, storage, raw } = profileContext(inputs); ctx.saveProfile(); assert.equal(storage.get('test-state'), raw); assert.equal(JSON.stringify(ctx.state), raw); assert(!ctx.closed); assert(ctx.toasts.length > 0);
});
test('quota failure rolls back profile and both dates while leaving editor open', () => {
  const { ctx, storage, raw } = profileContext({}, true); ctx.saveProfile(); assert.equal(storage.get('test-state'), raw); assert.equal(JSON.stringify(ctx.state), raw); assert(!ctx.closed); assert(ctx.toasts.some(message => message.includes('저장하지 못했어요')));
});

const validation = context({ Date, JSON, Number, Set, Error, defaultData: { posts: [], events: [], todoCategories: [], currentUser: '준영', anniversary: '2022-10-16', firstMetDate: null }, loadDeviceUser: () => null, addMinutesToTime: () => '', today });
load(validation, ['validISODate', 'checkBackup', 'normalizeState']);
test('legacy backup without new shared date retains its existing anniversary', () => {
  const data = base(); delete data.firstMetDate; const restored = validation.normalizeState(validation.checkBackup(data)); assert.equal(restored.firstMetDate, null); assert.equal(restored.anniversary, '2022-02-01');
});
test('saved shared dates survive real backup validation and serialized reload', () => {
  const { ctx, storage } = profileContext(); ctx.saveProfile(); const restored = validation.normalizeState(validation.checkBackup(JSON.parse(storage.get('test-state')))); assert.equal(restored.firstMetDate, '2022-01-03'); assert.equal(restored.anniversary, '2022-02-04');
});
test('explicitly cleared dates are not restored from sample defaults', () => {
  const data = base(); data.firstMetDate = data.anniversary = null; const restored = validation.normalizeState(validation.checkBackup(data)); assert.equal(restored.firstMetDate, null); assert.equal(restored.anniversary, null);
});
test('backup rejects malformed and reversed relationship dates', () => {
  for (const change of [{ firstMetDate: '2022-02-30' }, { anniversary: 123 }, { firstMetDate: '2022-03-01', anniversary: '2022-02-01' }]) assert.throws(() => validation.checkBackup({ ...base(), ...change }));
});
test('backup rejects future dates under the same policy as profile save', () => {
  for (const change of [{ firstMetDate: '2099-01-01', anniversary: null }, { firstMetDate: null, anniversary: '2099-01-01' }]) assert.throws(() => validation.checkBackup({ ...base(), ...change }));
});

function clearContext(optional, target = 'first-met', kind = 'profile') {
  const nodes = { ['od-' + target]: { value: '2022-01-01', dataset: optional ? { optional: 'true' } : {} }, ['od-' + target + '-label']: { innerHTML: '2022. 1. 1.' }, 'od-sheet-body': { dataset: {} } };
  const ctx = context({ modalKind: kind, dateTarget: target, $: id => nodes[id], dateLabel: d => d || '날짜 선택', icon: () => '<svg></svg>', closeDatePicker: () => { ctx.pickerClosed = true; } });
  load(ctx, ['clearDate']); return { ctx, nodes };
}
test('actual clearDate clears each optional relationship input and marks dirty', () => {
  for (const name of ['first-met', 'dating-start']) { const { ctx, nodes } = clearContext(true, name); ctx.clearDate(); assert.equal(nodes['od-' + name].value, ''); assert.equal(nodes['od-' + name + '-label'].innerHTML, '날짜 선택<svg></svg>'); assert.equal(nodes['od-sheet-body'].dataset.dirty, 'true'); assert(ctx.pickerClosed); }
});
test('clearDate cannot clear a required schedule date', () => {
  const { ctx, nodes } = clearContext(false, 'date', 'event'); ctx.clearDate(); assert.equal(nodes['od-date'].value, '2022-01-01'); assert(!ctx.pickerClosed);
});
test('existing optional task date clear remains supported', () => {
  const { ctx, nodes } = clearContext(false, 'date', 'task'); ctx.clearDate(); assert.equal(nodes['od-date'].value, ''); assert(ctx.pickerClosed);
});
test('actual dateField carries optional marker and maximum date', () => {
  const { ctx } = profileContext(); const field = ctx.dateField('처음 만난 날 · 선택', 'first-met', '', 'max="2026-10-08" data-optional="true"'); assert(field.includes('max="2026-10-08" data-optional="true"')); assert(field.includes('날짜 선택'));
});
function pickerContext(optional = true) {
  const attrs = { max: '2022-01-15' }, nodes = { 'od-first-met': { value: '2022-01-12', dataset: optional ? { optional: 'true' } : {}, getAttribute: key => attrs[key] || null }, 'od-first-met-label': { innerHTML: '', getAttribute: () => '처음 만난 날 선택' }, 'od-date-picker': { innerHTML: '' }, 'od-sheet-body': { dataset: {} } };
  const ctx = context({ Date, dateTarget: 'first-met', modalKind: 'profile', pickerMode: 'days', pickerMonth: '2022-01', $: id => nodes[id], value: key => nodes['od-' + key]?.value || '', e: encode, icon: () => '<svg></svg>', btn: (label, action) => '<button onclick="' + action + '">' + label + '</button>', closeDatePicker: () => { ctx.pickerClosed = true; } });
  load(ctx, ['validISODate', 'dateLabel', 'renderDatePicker', 'setDate']); return { ctx, nodes };
}
test('real picker exposes clearing only for the optional relationship field', () => {
  const { ctx, nodes } = pickerContext(); ctx.renderDatePicker(); assert(nodes['od-date-picker'].innerHTML.includes('OD.clearDate()'));
  nodes['od-first-met'].dataset = {}; ctx.renderDatePicker(); assert(!nodes['od-date-picker'].innerHTML.includes('OD.clearDate()'));
});
test('real date selection updates the shared-date draft without saving automatically', () => {
  const { ctx, nodes } = pickerContext(); ctx.setDate('2022-01-14'); assert.equal(nodes['od-first-met'].value, '2022-01-14'); assert.equal(nodes['od-first-met-label'].innerHTML, '2022. 1. 14.<svg></svg>'); assert.equal(nodes['od-sheet-body'].dataset.dirty, 'true'); assert(ctx.pickerClosed);
});
test('real date selection rejects dates after the field maximum', () => {
  const { ctx, nodes } = pickerContext(); ctx.setDate('2022-01-16'); assert.equal(nodes['od-first-met'].value, '2022-01-12'); assert.equal(nodes['od-sheet-body'].dataset.dirty, undefined); assert(!ctx.pickerClosed);
});
console.log(JSON.stringify({ file, passed, failed })); if (failed) process.exitCode = 1;
