'use strict';
// Legacy suites execute selected real functions in an isolated VM. Supply the
// newly introduced state dependencies from the same delivered HTML. The UI-only
// refresh hook remains mocked in those existing unit harnesses, like render().
const fs = require('fs'), vm = require('vm');
const target = process.argv[2];
if (target && fs.existsSync(target)) {
  const html = fs.readFileSync(target, 'utf8');
  if (html.includes('function guideTrackMutation(')) {
    function extract(name) {
      const match = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(').exec(html);
      if (!match) throw Error('Missing v20 runtime dependency: ' + name);
      let end = html.indexOf('\n', match.index);
      while (end >= 0) {
        const code = html.slice(match.index, end).trim();
        try { new vm.Script('(' + code + ')'); return code; } catch {}
        end = html.indexOf('\n', end + 1);
      }
      throw Error('Cannot extract dependency: ' + name);
    }
    const source = ['isCoupleConnected', 'connectionMembers', 'connectionFilters', 'connectionNotifications', 'normalizeTutorial', 'guideTrackMutation'].map(extract).join('\n');
    const original = vm.createContext;
    vm.createContext = function (ctx, ...args) {
      const result = Reflect.apply(original, vm, [ctx, ...args]);
      // Form-only legacy harnesses previously supplied taskById without a
      // global state. Their fixture represents the legacy connected branch.
      if (!Object.prototype.hasOwnProperty.call(ctx, 'state')) ctx.state = {};
      if (!Object.prototype.hasOwnProperty.call(ctx, 'guideSteps')) ctx.guideSteps = ['post', 'calendar', 'task', 'invite'];
      if (!ctx.guideRefresh) ctx.guideRefresh = () => {};
      vm.runInContext(source, ctx);
      return result;
    };
  }
}
