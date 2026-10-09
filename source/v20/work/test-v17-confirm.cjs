'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const patch=require('./patch-v17-confirm.cjs');
const sourcePath=process.argv[2]||'outputs/index0922testv16.html';
const source=fs.readFileSync(sourcePath,'utf8');
const html=source.includes('id="v17-confirm-system"')?source:patch(source);
// Keep an independent pre-patch baseline for mutation regression checks even
// when inspecting an already assembled v17 deliverable.
const baseline=fs.readFileSync('outputs/index0922testv16.html','utf8');
let count=0;const test=async(name,fn)=>{await fn();count++;console.log('PASS '+name);};

function runtime(){
  const doc={activeElement:null};
  class Element{
    constructor(tag='section'){this.tagName=tag.toUpperCase();this.inert=false;this.dataset={};this.style={};this.hidden=false;this.isConnected=true;this.children=[];this._html='';}
    set innerHTML(s){this._html=s;if(s.includes('od-confirm-title')){this.parts={h2:new Element('h2'),p:new Element('p')};this.buttons=[new Element('button'),new Element('button')];}}
    get innerHTML(){return this._html;}
    querySelector(s){if(this.parts?.[s])return this.parts[s];if(s==='[data-dirty="true"]')return this.dirty?sheet:null;return null;}
    querySelectorAll(s){return s==='button'?this.buttons||[]:[];}
    focus(){doc.activeElement=this;}
    remove(){this.isConnected=false;doc.body.children=doc.body.children.filter(n=>n!==this);}
  }
  const main=new Element('main'),overlay=new Element(),viewport=new Element('div'),prior=new Element('button');let sheet=new Element();
  main.inert=true;overlay.dirty=true;viewport.style.overflow='hidden';prior.focus();
  doc.body=new Element('body');doc.body.children=[main,overlay,viewport];doc.body.append=n=>doc.body.children.push(n);doc.createElement=tag=>new Element(tag);doc.querySelector=s=>s==='body>main'?main:null;
  const nodes={'od-overlay':overlay,'main-viewport':viewport,'od-sheet-body':sheet};
  const ctx={document:doc,HTMLElement:Element,Promise,$:id=>nodes[id],window:{odConflict:false},syncExternal(){ctx.synced=true;}};vm.createContext(ctx);
  const a=html.indexOf('  let activeConfirm=null;'),b=html.indexOf('  function showSyncNotice()',a);
  const c=html.indexOf('  let closePending=false;'),d=html.indexOf('  function choiceField(',c);
  vm.runInContext(`let posting=false,modalKind='post',profileToken=0,commentObserver=null,notificationNavigation=0,previousOverflow='auto',modalId=12,replyId=null,draftToken=0,photoBusy=false,focusBefore=null;`+html.slice(a,b)+html.slice(c,d),ctx);
  return{ctx,doc,main,overlay,viewport,prior,nodes,Element,dialog:()=>doc.body.children.find(n=>n.className==='od-native-confirm'),replaceSheet:()=>nodes['od-sheet-body']=new Element()};
}
function key(wrapper,key,shiftKey=false){let prevented=false,stopped=false;wrapper.onkeydown({key,shiftKey,preventDefault(){prevented=true},stopPropagation(){stopped=true}});return{prevented,stopped};}

(async()=>{
  await test('all final inline scripts compile',()=>{for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);});
  await test('confirmation type scale and embedded font are explicit',()=>{const css=html.match(/<style id="v17-confirm-system">([\s\S]*?)<\/style>/)[1];assert(css.includes('font-size:16px;font-weight:650'));assert(css.includes('font-size:14px;font-weight:400'));assert(css.includes('font-size:14px;font-weight:600'));assert(css.includes('font-family:DumpSans,sans-serif!important'));assert(css.includes('min-height:44px'));});
  await test('default focus is non-destructive with proper alert dialog semantics',async()=>{const r=runtime(),p=r.ctx.askConfirm({title:'닫을까요?',message:'내용',cancelLabel:'계속 작성',confirmLabel:'닫기',tone:'discard'}),dialog=r.dialog();assert(dialog.innerHTML.includes('aria-labelledby="od-confirm-title" aria-describedby="od-confirm-text"'));assert.equal(dialog.querySelector('h2').textContent,'닫을까요?');assert.equal(dialog.buttons[0].textContent,'계속 작성');assert.equal(r.doc.activeElement,dialog.buttons[0]);assert(r.overlay.inert);dialog.buttons[0].onclick();assert.equal(await p,false);assert.equal(r.main.inert,true);assert.equal(r.overlay.inert,false);assert.equal(r.doc.activeElement,r.prior);});
  await test('escape dismisses without confirmation and tab remains trapped',async()=>{const r=runtime(),p=r.ctx.askConfirm('내용'),w=r.dialog();assert(key(w,'Tab').prevented);assert.equal(r.doc.activeElement,w.buttons[1]);assert(key(w,'Tab',true).prevented);assert.equal(r.doc.activeElement,w.buttons[0]);assert(key(w,'Escape').prevented);assert.equal(await p,false);});
  await test('duplicate requests do not stack or share destructive approval',async()=>{const r=runtime(),p=r.ctx.askConfirm('first'),other=r.ctx.askConfirm('second');assert.equal(await other,false);assert.equal(r.doc.body.children.filter(n=>n.className==='od-native-confirm').length,1);r.dialog().buttons[1].onclick();assert.equal(await p,true);});
  await test('confirmation settles only once',async()=>{const r=runtime(),p=r.ctx.askConfirm('내용'),w=r.dialog();w.buttons[0].onclick();w.buttons[1].onclick();assert.equal(await p,false);assert.equal(r.overlay.inert,false);});
  await test('real dirty close keeps draft with continue writing',async()=>{const r=runtime(),p=r.ctx.close(),w=r.dialog();assert.equal(w.buttons[0].textContent,'계속 작성');assert.equal(w.buttons[1].textContent,'닫기');w.buttons[0].onclick();await p;assert.equal(r.overlay.hidden,false);assert.equal(vm.runInContext('modalKind',r.ctx),'post');assert.equal(r.overlay.dirty,true);});
  await test('real dirty close discards only after explicit close',async()=>{const r=runtime(),p=r.ctx.close();r.dialog().buttons[1].onclick();await p;assert(r.overlay.hidden);assert.equal(r.main.inert,false);assert.equal(r.viewport.style.overflow,'auto');assert.equal(vm.runInContext('modalKind',r.ctx),'');});
  await test('repeated X clicks produce one confirmation and one cleanup',async()=>{const r=runtime(),p=r.ctx.close(),second=r.ctx.close();await second;assert.equal(r.doc.body.children.filter(n=>n.className==='od-native-confirm').length,1);r.dialog().buttons[1].onclick();await p;assert.equal(vm.runInContext('profileToken',r.ctx),1);});
  await test('forced close cancels pending confirmation and avoids repeated cleanup',async()=>{const r=runtime(),p=r.ctx.close();await r.ctx.close(true);await p;assert(!r.dialog());assert(r.overlay.hidden);assert.equal(vm.runInContext('profileToken',r.ctx),1);});
  await test('stale approval cannot close a newly replaced sheet',async()=>{const r=runtime(),p=r.ctx.close();r.replaceSheet();r.dialog().buttons[1].onclick();await p;assert.equal(r.overlay.hidden,false);});
  await test('clean close and posting guards retain behavior',async()=>{const r=runtime();r.overlay.dirty=false;await r.ctx.close();assert(!r.dialog());assert(r.overlay.hidden);const q=runtime();vm.runInContext('posting=true',q.ctx);await q.ctx.close();assert(!q.dialog());assert(!q.overlay.hidden);});
  await test('all destructive callers retain conditional await and appropriate labels',()=>{assert(html.includes("!await askConfirm({title:'덤프를 삭제할까요?'") );assert(html.includes("!await askConfirm({title:'댓글을 삭제할까요?'"));assert(html.includes("!await askConfirm({title:'할 일을 삭제할까요?'"));assert(html.includes("t&&await askConfirm({title:'하위 항목을 삭제할까요?'"));assert(html.includes("v.lifecycle==='cancelled'?{title:'일정을 복원할까요?'"));assert(html.includes("cancelLabel:'유지',confirmLabel:'일정 취소'"));assert(!html.includes("<button>돌아가기</button><button>확인</button>"));});
  await test('initialization, storage and mutation logic unchanged',()=>{const originalReset=baseline.slice(baseline.indexOf('  function resetPreview()'),baseline.indexOf('  let pendingBackup='));assert(html.includes(originalReset));for(const needle of ["state.posts=state.posts.filter(p=>p.id!==n)","p.comments=p.comments.filter(c=>c.id!==n)","f.category.items=f.category.items.filter(t=>t.id!==n)","t.subItems=t.subItems.filter(x=>x.id!==s)"])assert(html.includes(needle));});
  console.log(count+' checks passed');
})().catch(err=>{console.error(err);process.exitCode=1;});
