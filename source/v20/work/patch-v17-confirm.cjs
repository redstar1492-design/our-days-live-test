'use strict';

// Pure, isolated v17 patch. Does not write an output HTML on its own.
module.exports = function patchConfirm(html) {
  if (html.includes('id="v17-confirm-system"')) throw new Error('Confirmation patch already applied');
  function once(before, after) {
    if (!html.includes(before)) throw new Error('Confirmation patch anchor missing: ' + before.slice(0, 90));
    html = html.replace(before, after);
  }
  const start = html.indexOf('  function askConfirm(message)');
  const end = html.indexOf('\n', start);
  if (start < 0 || end < 0) throw new Error('askConfirm function missing');
  html = html.slice(0, start) + String.raw`  let activeConfirm=null;
  function askConfirm(options){
    if(activeConfirm)return Promise.resolve(false);
    const config=typeof options==='string'?{message:options}:options||{};
    return new Promise(resolve=>{
      const prior=document.activeElement,wrapper=document.createElement('section');
      wrapper.className='od-native-confirm';
      wrapper.innerHTML='<section class="od-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="od-confirm-title" aria-describedby="od-confirm-text"><h2 class="od-confirm-title" id="od-confirm-title"></h2><p class="od-confirm-body" id="od-confirm-text"></p><footer class="od-confirm-actions"><button type="button" class="od-confirm-cancel"></button><button type="button" class="od-confirm-accept"></button></footer></section>';
      wrapper.dataset.tone=config.tone||'default';
      wrapper.querySelector('h2').textContent=config.title||'확인해 주세요';
      wrapper.querySelector('p').textContent=config.message||'';
      const buttons=wrapper.querySelectorAll('button');
      buttons[0].textContent=config.cancelLabel||'취소';
      buttons[1].textContent=config.confirmLabel||'확인';
      const roots=[...document.body.children].filter(el=>el instanceof HTMLElement&&!['SCRIPT','STYLE'].includes(el.tagName)),inert=roots.map(el=>el.inert);
      roots.forEach(el=>el.inert=true);document.body.append(wrapper);
      let settled=false;
      function done(ok){if(settled)return;settled=true;wrapper.remove();roots.forEach((el,i)=>el.inert=inert[i]);activeConfirm=null;if(prior?.isConnected)prior.focus?.({preventScroll:true});resolve(ok);}
      activeConfirm={dismiss:()=>done(false)};
      buttons[0].onclick=()=>done(false);buttons[1].onclick=()=>done(true);
      wrapper.onkeydown=ev=>{ev.stopPropagation();if(ev.key==='Escape'){ev.preventDefault();done(false);}else if(ev.key==='Tab'){ev.preventDefault();(document.activeElement===buttons[0]?buttons[1]:buttons[0]).focus();}};
      buttons[0].focus({preventScroll:true});
    });
  }` + html.slice(end);
  once('  async function close(force=false){', '  let closePending=false;\n  async function close(force=false){');
  once("    if(!force && ['post','event','task','ledger','profile'].includes(modalKind)&&$('od-overlay').querySelector('[data-dirty=\"true\"]')&&!await askConfirm('작성 중인 내용을 닫을까요? 저장하지 않은 내용은 사라집니다.'))return;", String.raw`    if(closePending&&!force)return;
    const closingOverlay=$('od-overlay');if(closingOverlay.hidden)return;
    if(force&&activeConfirm)activeConfirm.dismiss();
    if(!force&&['post','event','task','ledger','profile'].includes(modalKind)&&closingOverlay.querySelector('[data-dirty="true"]')){
      const closingSheet=$('od-sheet-body');let confirmed=false;closePending=true;
      try{confirmed=await askConfirm({title:'작성 중인 내용을 닫을까요?',message:'저장하지 않은 내용은 사라져요.',cancelLabel:'계속 작성',confirmLabel:'닫기',tone:'discard'});}finally{closePending=false;}
      if(!confirmed||closingOverlay.hidden||closingSheet!==$('od-sheet-body'))return;
    }`);
  const copies = [
    ["askConfirm('입력한 내용을 닫고 할 일로 돌아갈까요?')", "askConfirm({title:'할 일로 돌아갈까요?',message:'입력한 일정 내용은 저장되지 않아요.',cancelLabel:'계속 작성',confirmLabel:'돌아가기',tone:'discard'})"],
    ["askConfirm('덤프와 댓글을 삭제할까요? 되돌릴 수 없어요.')", "askConfirm({title:'덤프를 삭제할까요?',message:'댓글도 함께 삭제되며 되돌릴 수 없어요.',confirmLabel:'삭제',tone:'danger'})"],
    ["askConfirm('이 댓글을 삭제할까요? 답글은 유지됩니다.')", "askConfirm({title:'댓글을 삭제할까요?',message:'이 댓글에 달린 답글은 유지돼요.',confirmLabel:'삭제',tone:'danger'})"],
    ["askConfirm(v.lifecycle==='cancelled'?'일정을 복원할까요?':'일정을 취소할까요? 기록은 남습니다.')", "askConfirm(v.lifecycle==='cancelled'?{title:'일정을 복원할까요?',message:'이 일정을 다시 함께 확인할 수 있어요.',confirmLabel:'복원'}:{title:'일정을 취소할까요?',message:'취소해도 일정 기록은 남아요.',cancelLabel:'유지',confirmLabel:'일정 취소',tone:'danger'})"],
    ["askConfirm('할 일과 하위 항목을 삭제할까요? 연결한 일정은 유지됩니다.')", "askConfirm({title:'할 일을 삭제할까요?',message:'하위 항목도 함께 삭제돼요. 연결된 일정은 유지돼요.',confirmLabel:'삭제',tone:'danger'})"],
    ["askConfirm('하위 항목을 삭제할까요?')", "askConfirm({title:'하위 항목을 삭제할까요?',message:'삭제한 항목은 되돌릴 수 없어요.',confirmLabel:'삭제',tone:'danger'})"],
    ["askConfirm('이 내역을 삭제할까요? 합계에서도 제외됩니다.')", "askConfirm({title:'내역을 삭제할까요?',message:'삭제한 내역은 합계에서도 제외돼요.',confirmLabel:'삭제',tone:'danger'})"]
  ];
  copies.forEach(([a,b])=>once(a,b));
  const style = `<style id="v17-confirm-system">
/* Confirmation dialogs share the app's embedded font, type scale, and control colors. */
.od-native-confirm{font-family:DumpSans,sans-serif!important;position:fixed;inset:0;z-index:190;display:grid;place-items:center;padding:20px;background:#0006;overflow-y:auto;overscroll-behavior:contain}
.od-native-confirm .od-confirm-card{box-sizing:border-box;width:min(100%,320px);max-height:calc(100dvh - 40px);overflow-y:auto;padding:22px 20px 16px;border:1px solid var(--od-line,#e9ecef);border-radius:16px;background:var(--od-paper,#fff);color:var(--od-ink,#252a31);box-shadow:0 16px 50px #0002;text-align:left}
.od-native-confirm .od-confirm-title{margin:0;font-family:DumpSans,sans-serif!important;font-size:16px;font-weight:650;line-height:1.5;letter-spacing:0;overflow-wrap:anywhere}
.od-native-confirm .od-confirm-body{margin:8px 0 20px;font-family:DumpSans,sans-serif!important;font-size:14px;font-weight:400;line-height:1.6;color:var(--od-muted,#68717d);white-space:pre-wrap;overflow-wrap:anywhere}
.od-native-confirm .od-confirm-actions{display:flex;gap:8px;margin:0;padding:0}
.od-native-confirm .od-confirm-actions button{flex:1;min-width:0;min-height:44px;padding:10px 12px;font-family:DumpSans,sans-serif!important;font-size:14px;font-weight:600;line-height:1.5;letter-spacing:0;border:1px solid var(--od-line,#e9ecef);border-radius:8px;background:var(--od-paper,#fff);color:var(--od-ink,#252a31);cursor:pointer;touch-action:manipulation}
.od-native-confirm .od-confirm-actions .od-confirm-cancel{background:var(--od-soft,#f3f5f7);border-color:var(--od-soft,#f3f5f7)}
.od-native-confirm .od-confirm-actions .od-confirm-accept{color:var(--od-action,#365d88)}
.od-native-confirm[data-tone=discard] .od-confirm-cancel{color:var(--od-action,#365d88)}
.od-native-confirm[data-tone=discard] .od-confirm-accept{color:var(--od-muted,#68717d)}
.od-native-confirm[data-tone=danger] .od-confirm-accept{color:#bc4c53}
.od-native-confirm .od-confirm-actions button:active{opacity:.7}
body[data-keyboard-focus=true] .od-native-confirm .od-confirm-actions button:focus-visible{outline:2px solid #7e91aa;outline-offset:2px}
</style>`;
  once('</head>',style+'\n</head>');
  return html;
};
