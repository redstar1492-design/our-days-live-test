'use strict';
// Preserve existing assertions; add dependencies from the exact v22 deliverable.
require('./test-v20-regression-deps.cjs');
require('./test-v21-regression-deps.cjs');
const fs=require('fs'),vm=require('vm');
const target=process.argv[2],html=fs.readFileSync(target,'utf8');
function extract(name){const found=new RegExp('(?:async\\s+)?function\\s+'+name+'\\s*\\(').exec(html);if(!found)throw Error('Missing v22 dependency '+name);let end=html.indexOf('\n',found.index);while(end>=0){const source=html.slice(found.index,end).trim();try{new vm.Script('('+source+')');return source;}catch{}end=html.indexOf('\n',end+1);}throw Error('Cannot extract '+name);}
const source=['validCoordinatesV22','validateUiV22','locationTagV22','mapUrlV22'].map(extract).join('\n');
const original=vm.createContext;
vm.createContext=function(ctx,...args){const result=Reflect.apply(original,vm,[ctx,...args]);for(const[k,v]of Object.entries({locationBusyV22:false,locationDraftV22:null,feedModeV22:'feed',tab:'our'}))if(!(k in ctx))ctx[k]=v;
 // Old calendar fixtures predate the travel-entry icon. This is only a view
 // dependency, like their existing header/eventCard/peopleToolbar stubs.
 if(typeof ctx.icon!=='function')ctx.icon=name=>'<svg data-icon="'+name+'"></svg>';
 vm.runInContext(source,ctx);return result;};
