'use strict';
// Legacy tests isolate selected real functions. Load the new data dependencies
// from this exact deliverable; preserve all original assertions and fixtures.
const fs = require('fs'), vm = require('vm');
const target = process.argv[2] || 'outputs/index0922testv21.html';
const html = fs.readFileSync(target, 'utf8');
function extract(name) {
  const match = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(').exec(html);
  if (!match) throw Error('Missing v21 runtime dependency: ' + name);
  let end = html.indexOf('\n', match.index);
  while (end >= 0) {
    const source = html.slice(match.index, end).trim();
    try { new vm.Script('(' + source + ')'); return source; } catch {}
    end = html.indexOf('\n', end + 1);
  }
  throw Error('Cannot extract v21 runtime dependency: ' + name);
}
function arrow(name) {
  const match = new RegExp('const\\s+' + name + '\\s*=\\s*([^\\n]+)').exec(html);
  if (!match) throw Error('Missing v21 arrow dependency: ' + name);
  const source = match[1].replace(/;\s*$/, '');
  new vm.Script('(' + source + ')');
  return source;
}
const source = [
  'validateCollectionsV21', 'daysV21', 'reconcileCollectionsV21',
  'eventRangeAllowedV21', 'chosenCollectionV21', 'collectionFieldV21'
].map(extract).join('\n');
const arrows = Object.fromEntries(['collectionsV21', 'collectionByIdV21', 'allTasks'].map(name => [name, arrow(name)]));
const original = vm.createContext;
vm.createContext = function(ctx, ...args) {
  const result = Reflect.apply(original, vm, [ctx, ...args]);
  if (!Object.prototype.hasOwnProperty.call(ctx, 'state')) ctx.state = {};
  if (!Object.prototype.hasOwnProperty.call(ctx, 'formCollectionContext')) ctx.formCollectionContext = null;
  if (!Object.prototype.hasOwnProperty.call(ctx, 'URL')) ctx.URL = URL;
  // Some old form fixtures provide allTasks directly; others relied on commit
  // having no need for it. Reconciliation now uses the real shared accessor.
  for (const [name, body] of Object.entries(arrows)) {
    if (typeof ctx[name] !== 'function') vm.runInContext('var ' + name + ' = ' + body + ';', ctx);
  }
  vm.runInContext(source, ctx);
  return result;
};
