module.exports = function patchTasks(html) {
  let h = html.replace(/\r\n/g, '\n');
  const app = () => h.indexOf('/* Our Days 4');
  const source = fn => '  ' + fn.toString().replace(/\n/g, ' ');
  function replace(a, b, active = true) {
    const index = h.indexOf(a, active ? app() : 0);
    if (index < 0) throw Error('Task patch missing ' + a.slice(0, 100));
    h = h.slice(0, index) + h.slice(index).replace(a, b);
  }
  function line(name, fn) {
    const match = new RegExp('  (?:async )?function ' + name + '\\(').exec(h.slice(app()));
    if (!match) throw Error('Task patch missing function ' + name);
    const start = app() + match.index, end = h.indexOf('\n', start);
    h = h.slice(0, start) + source(fn) + h.slice(end);
  }

  function taskShortDateLabel(date) { if (!validISODate(date)) return ''; const [, month, day] = date.split('-').map(Number); return month + '.' + day; }
  function taskCountdownText(info) { return info ? info.days < 0 ? 'D+' + Math.abs(info.days) : info.text : ''; }
  function taskCategoryLabel(task) { return typeof task.customCategory === 'string' && task.customCategory.trim() ? task.customCategory.trim() : groupName[task.group || 'life'] || ''; }
  function taskMeta(t) {
    const deadline = deadlineInfo(t), date = validISODate(t.targetDate) ? t.targetDate : null, category = taskCategoryLabel(t), progress = t.subItems?.length ? t.subItems.filter(s => s.done).length + '/' + t.subItems.length + ' 완료' : '';
    if (!deadline && !date && !category && !progress) return '';
    return '<div class="od-task-meta od-task-detail-meta ' + (t.createdBy ? 'has-author' : 'no-author') + '">' + (deadline ? '<strong class="od-countdown ' + deadline.kind + '">' + taskCountdownText(deadline) + '</strong>' : '') + (date ? '<time datetime="' + e(date) + '">' + e(taskDateLabel(date)) + '</time>' : '') + (progress ? '<span class="od-task-progress">' + progress + '</span>' : '') + (category ? '<span class="od-task-category">' + e(category) + '</span>' : '') + '</div>';
  }
  function taskCard(t, c) {
    const deadline = deadlineInfo(t), date = validISODate(t.targetDate) ? t.targetDate : null, dateText = date ? taskDateLabel(date) : '', heading = (t.createdBy ? nicknameOf(t.createdBy) + '의 할 일, ' : '') + t.text;
    return '<article class="od-task od-task-inline ' + (t.done ? 'done' : '') + '"><button class="od-check ' + (t.done ? 'done' : '') + '" onclick="OD.toggleTask(' + t.id + ')" aria-label="' + e(t.text) + ' ' + (t.done ? '완료 취소' : '완료') + '">' + (t.done ? icon('check') : '') + '</button><button class="od-grow od-task-open" onclick="OD.taskDetail(' + t.id + ')" aria-label="' + e(heading + (date ? ', 목표일 ' + dateText : '')) + '">' + (t.createdBy ? avatar(t.createdBy, true) : '') + '<span class="od-task-title" title="' + e(t.text) + '">' + e(t.text) + '</span>' + (deadline ? '<strong class="od-countdown ' + deadline.kind + '" aria-label="' + e(deadline.days < 0 ? Math.abs(deadline.days) + '일 지남' : deadline.days === 0 ? '오늘까지' : deadline.days + '일 남음') + '">' + taskCountdownText(deadline) + '</strong>' : '') + (date ? '<time class="od-task-shortdate" datetime="' + e(date) + '" title="' + e(dateText) + '" aria-label="목표일 ' + e(dateText) + '">' + taskShortDateLabel(date) + '</time>' : '') + '</button>' + btn('할 일 메뉴', 'OD.taskMenu(' + t.id + ')', 'more') + '</article>';
  }
  function taskAuthorField(t) {
    const author = t ? t.createdBy : me();
    return '<div class="od-field od-task-author-field"><span>작성자</span><div class="od-task-fixed-value">' + (author ? avatar(author, true) + '<span>' + e(nicknameOf(author)) + '</span>' : '<span class="od-muted">작성자 정보 없음</span>') + '</div></div>';
  }
  function taskPeopleField(who) {
    return '<div class="od-field"><span>함께할 사람</span><input type="hidden" id="od-who" value="' + e(who) + '"><div class="od-task-options" role="group" aria-label="함께할 사람">' + ['준영', '아정', '함께'].map(person => '<button type="button" aria-pressed="' + (who === person) + '" onclick="OD.selectField(this,\'who\',\'' + person + '\')">' + (person === '함께' ? '' : avatar(person, true)) + '<span>' + e(person === '함께' ? '함께' : nicknameOf(person)) + '</span></button>').join('') + '</div></div>';
  }
  function taskCategoryField(t, prefill) {
    const custom = t?.customCategory || prefill?.customCategory || '', current = custom ? 'custom' : t?.group || prefill?.group || 'life';
    return '<div class="od-field"><span>분류</span><input type="hidden" id="od-group" value="' + e(current) + '"><div class="od-task-category-control"><div class="od-task-options" role="group" aria-label="분류">' + [...Object.entries(groupName), ['custom', '직접 입력']].map(([value, label]) => '<button type="button" aria-pressed="' + (value === current) + '" onclick="OD.taskSelectCategory(this,\'' + value + '\')">' + e(label) + '</button>').join('') + '</div><input id="od-custom-category" type="text" value="' + e(custom) + '" maxlength="24" aria-label="분류 직접 입력" placeholder="분류 입력 · 24자까지" ' + (current === 'custom' ? '' : 'hidden') + '></div></div>';
  }
  function taskSelectCategory(el, group) {
    if (!['date', 'study', 'life', 'custom'].includes(group)) return;
    selectField(el, 'group', group);
    const input = $('od-custom-category');
    if (input) { input.hidden = group !== 'custom'; if (group === 'custom') input.focus({ preventScroll: true }); }
  }
  function resizeTaskNote(el) {
    if (!el) return;
    el.style.height = '40px';
    const height = Math.max(40, Math.min(140, el.scrollHeight + 2));
    el.style.height = height + 'px';
    el.style.overflowY = el.scrollHeight + 2 > 140 ? 'auto' : 'hidden';
  }
  function taskForm(n, prefill) {
    const t = n ? taskById(n)?.task : null;
    if (n && !t) { toast('원본 할 일이 삭제되었어요.'); return; }
    modalId = n || null; taskSource = null;
    show(t ? '할 일 수정' : '할 일 추가', '<div class="od-stack od-task-form">' + taskAuthorField(t) + field('할 일', 'title', t?.text || prefill?.text || '', 'text', 'maxlength="140" placeholder="할 일 입력"') + '<label class="od-field"><span>메모</span><textarea id="od-note" maxlength="4000" rows="1" placeholder="메모 입력 · 선택" oninput="OD.resizeTaskNote(this)">' + e(t?.note || prefill?.note || '') + '</textarea></label>' + dateField('목표일 · 선택', 'date', t?.targetDate || '', 'data-optional="true"') + taskPeopleField(t?.who || '함께') + taskCategoryField(t, prefill) + '</div>', footer('저장', 'OD.saveTask()'), 'task');
    resizeTaskNote($('od-note'));
  }
  function saveTask() {
    const title = value('title'), note = value('note'), date = value('date'), group = value('group'), customCategory = value('custom-category');
    if (title.length > 140 || note.length > 4000 || date && !validISODate(date)) { toast('할 일 내용과 날짜를 확인해 주세요.'); return; }
    if (!title) { toast('할 일을 입력해 주세요.'); return; }
    const found = taskById(modalId);
    if (modalId && !found) { toast('원본 할 일이 삭제되었어요. 입력을 복사한 후 새로 작성해 주세요.'); return; }
    if (!found && allTasks().length >= 5000) { toast('할 일 보관 한도에 도달했어요.'); return; }
    if (!['date', 'study', 'life', 'custom'].includes(group) || !['준영', '아정', '함께'].includes(value('who'))) { toast('분류와 함께할 사람을 확인해 주세요.'); return; }
    if (group === 'custom' && (!customCategory || customCategory.length > 24)) { toast('직접 입력한 분류는 1~24자로 입력해 주세요.'); return; }
    const data = { text: title, group: group === 'custom' ? 'life' : group, customCategory: group === 'custom' ? customCategory : null, who: value('who'), targetDate: date || null, note };
    if (!commit(() => { if (found) Object.assign(found.task, data); else { let category = state.todoCategories.find(c => c.id === 'wishlist'); if (!category) { category = { id: 'wishlist', title: '할 일', items: [] }; state.todoCategories.push(category); } category.items.push({ id: id(), done: false, subItems: [], createdBy: me(), ...data }); } }, '할 일을 저장했어요.')) return;
    close(true); taskFilter = taskAuthorFilter = '전체'; taskStatus = found?.task.done ? '완료' : '진행 중'; switchTo('todo');
  }

  replace('  function taskMeta(', [taskShortDateLabel, taskCountdownText, taskCategoryLabel].map(source).join('\n') + '\n  function taskMeta(');
  line('taskMeta', taskMeta); line('taskCard', taskCard);
  replace('  function taskForm(', [taskAuthorField, taskPeopleField, taskCategoryField, taskSelectCategory, resizeTaskNote].map(source).join('\n') + '\n  function taskForm(');
  line('taskForm', taskForm); line('saveTask', saveTask);
  replace('window.OD={', 'window.OD={resizeTaskNote,taskSelectCategory,');
  replace("text(t.note||'','할 일 메모',4000);", "text(t.note||'','할 일 메모',4000);if(t.customCategory!=null){text(t.customCategory,'직접 입력 분류',24);if(!t.customCategory.trim())bad('직접 입력한 분류를 확인해 주세요.');}", false);

  const css = `
.od-task-inline{align-items:center;gap:3px;padding:8px 0;min-height:56px}.od-task-inline>.od-grow{padding-top:0}.od-task-inline>.od-icon{min-width:36px;width:36px}.od-task-inline .od-task-open{display:flex;align-items:center;gap:7px;min-width:0;min-height:40px;flex:1;text-align:left;overflow:hidden}.od-task-inline .od-task-open>.od-avatar{width:22px;height:22px;flex:none}.od-task-inline .od-task-title{font-size:14px;line-height:1.5;font-weight:650;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;overflow-wrap:normal}.od-task-inline.done .od-task-title{text-decoration:line-through;color:var(--od-muted)}.od-task-inline.done .od-task-open>.od-avatar{opacity:.65}.od-task-inline .od-countdown{min-width:0;min-height:22px;flex:none;font-size:12px;padding:1px 4px;line-height:18px;white-space:nowrap}.od-task-shortdate{flex:none;font-size:12px;color:var(--od-muted);white-space:nowrap;font-variant-numeric:tabular-nums}.od-task-inline .od-check{width:36px;min-width:36px;height:40px}.od-task-inline .od-check:before{inset:10px 8px}.od-task-detail>.od-task-detail-meta{margin-top:0;display:flex;flex-direction:row;align-items:center;flex-wrap:wrap;gap:7px 10px}.od-task-detail>.od-task-detail-meta.has-author{margin-left:32px}.od-task-detail-meta .od-countdown{font-size:12px;min-height:22px;padding:1px 5px;line-height:18px}.od-task-category{font-size:12px;color:var(--od-muted)}
.od-task-form{gap:10px}.od-task-form .od-field{display:grid;grid-template-columns:88px minmax(0,1fr);column-gap:10px;align-items:start;margin:0;min-width:0}.od-task-form .od-field>span{font-size:13px;font-weight:650;margin:0;padding-top:10px;line-height:20px}.od-task-form .od-field textarea{height:40px;min-height:40px;max-height:140px;resize:none;border:0;border-bottom:1px solid var(--od-line);border-radius:0;padding:9px 0;background:white;box-shadow:none;line-height:20px;overflow-y:hidden}.od-task-form .od-field textarea:focus{border-bottom-color:#8d9bab}.od-task-fixed-value{display:flex;align-items:center;gap:7px;min-height:40px;border-bottom:1px solid var(--od-line);font-size:14px}.od-task-fixed-value .od-avatar{width:22px;height:22px}.od-task-fixed-value>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.od-task-options{display:flex;align-items:center;gap:12px;min-height:40px;border-bottom:1px solid var(--od-line);flex-wrap:wrap}.od-task-options button{display:inline-flex;align-items:center;justify-content:flex-start;gap:4px;font-size:13px;min-height:40px;max-width:100%;white-space:nowrap;border-radius:5px}.od-task-options button>span{min-width:0;overflow:hidden;text-overflow:ellipsis}.od-task-options .od-avatar{width:18px;height:18px}.od-task-options button[aria-pressed=true]{color:var(--od-action);font-weight:650}.od-task-category-control{min-width:0}.od-task-category-control .od-task-options{gap:11px}.od-task-category-control>input{margin-top:4px}.od-task-form .od-date-field button{font-size:14px;min-height:40px}.od-task-form .od-date-field>span{font-size:13px}.od-task-form .od-task-author-field{padding-bottom:0}
@media(max-width:360px){.od-task-form .od-field{grid-template-columns:86px minmax(0,1fr);column-gap:8px}.od-task-options{gap:9px}.od-task-category-control .od-task-options{gap:10px}.od-task-inline .od-task-open{gap:5px}.od-task-inline .od-task-open>.od-avatar{width:20px;height:20px}.od-task-inline .od-task-shortdate{font-size:11px}.od-task-inline .od-countdown{font-size:11px;padding:1px 3px}}
`;
  const styleStart = h.indexOf('<style id="dump-ui-system">'), styleEnd = h.indexOf('</style>', styleStart);
  if (styleStart < 0 || styleEnd < 0) throw Error('Task patch missing UI stylesheet');
  h = h.slice(0, styleEnd) + css + h.slice(styleEnd);
  return h;
};
