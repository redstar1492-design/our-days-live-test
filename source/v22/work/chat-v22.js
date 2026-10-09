  // Local chat preview. It never sends messages, connects a partner, or creates
  // real notifications. Example messages require an explicit user action.
  let chatDraftV22='',chatSendingV22=false,chatComposingV22=false;
  let chatScrollTopV22=0,chatScrollEndV22=true,chatFocusV22=null,chatObserverV22=null;
  const chatExampleRepliesV22=['좋아. 장소는 여기서 같이 정하자.','일정 확인했어. 그날로 잡자.','이 링크도 같이 확인해 보자.'];
  function chatPreviewV22(){return state.chatPreview||{version:1,exampleLoaded:false,exampleReplyIndex:0,messages:[]};}
  function chatUnreadV22(){return chatPreviewV22().messages.filter(m=>m.sender==='example'&&!m.read).length;}
  function chatEnsureV22(){if(!state.chatPreview)state.chatPreview={version:1,exampleLoaded:false,exampleReplyIndex:0,messages:[]};return state.chatPreview;}
  function chatMessageIdV22(messages){const used=new Set(messages.map(m=>m.id));let next=id();while(used.has(next))next++;return next;}
  function chatMessageTimeV22(m){const date=new Date(m.createdAt);if(!Number.isFinite(date.getTime()))return '';return String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0');}
  function chatMessageDateV22(m){const date=new Date(m.createdAt);if(!Number.isFinite(date.getTime()))return '';return date.getFullYear()+'. '+(date.getMonth()+1)+'. '+date.getDate()+'.';}
  function chatPageV22(){
    const preview=chatPreviewV22(),messages=preview.messages;
    const top=header('마이').replace(btn('설정 열기','OD.settings()','settings'),btn('톡 메뉴','OD.chatMenu()','more'));
    let day='';
    const rows=messages.map(m=>{const date=chatMessageDateV22(m),divider=date!==day?'<p class="v22-chat-day">'+e(date)+'</p>':'';day=date;
      return divider+'<article id="v22-chat-message-'+m.id+'" class="v22-chat-message '+(m.sender==='self'?'self':'example')+'" data-chat-id="'+m.id+'" data-chat-read="'+m.read+'" aria-label="'+(m.sender==='self'?'이 기기에 저장한 내 메시지':'예시 상대 메시지')+'">'+(m.sender==='example'?'<span class="v22-chat-person" aria-hidden="true">'+icon('user')+'</span>':'')+'<div class="v22-chat-message-main">'+(m.sender==='example'?'<strong class="v22-chat-sender">상대 <span>예시</span></strong>':'')+'<div class="v22-chat-message-line"><p class="v22-chat-bubble">'+e(m.text)+'</p><time datetime="'+e(m.createdAt)+'">'+e(chatMessageTimeV22(m))+'</time></div></div></article>';
    }).join('');
    const empty='<div class="v22-chat-empty">'+icon('comment')+'<h1>아직 메시지가 없습니다</h1><p>메시지를 입력하거나 예시 대화를 확인해 보세요.</p><button type="button" class="v22-chat-text-action" onclick="OD.chatExamples()">예시 대화 보기</button></div>';
    return '<section class="v22-chat-page" aria-label="톡 미리보기">'+top+'<div class="v22-chat-preview-note"><strong>톡 미리보기</strong><span>상대에게 전송되지 않으며, 이 브라우저에만 저장됩니다.</span></div><div class="v22-chat-heading"><span class="v22-chat-person" aria-hidden="true">'+icon('user')+'</span><div><strong>상대 <span>예시</span></strong><small>대화 화면과 알림을 확인할 수 있습니다.</small></div><button type="button" class="v22-chat-text-action" onclick="OD.chatExampleReply()">예시 답장 받기</button></div><div id="v22-chat-log" class="v22-chat-log" role="log" aria-label="이 브라우저의 대화 미리보기" aria-live="polite" aria-relevant="additions text" onscroll="OD.chatScroll(this)">'+(messages.length?rows:empty)+'</div><form class="v22-chat-composer" onsubmit="OD.chatSend(event);return false;">'+avatar(me(),true)+'<div class="v22-chat-input-wrap"><label class="v22-chat-sr-only" for="v22-chat-input">메시지 입력</label><textarea id="v22-chat-input" rows="1" maxlength="1000" placeholder="메시지 입력" enterkeyhint="send" oninput="OD.chatInput(this)" onkeydown="OD.chatKey(event)" oncompositionstart="OD.chatComposition(true)" oncompositionend="OD.chatComposition(false)">'+e(chatDraftV22)+'</textarea></div><button id="v22-chat-send" class="v22-chat-send" type="submit" aria-label="메시지를 이 브라우저에 저장" '+(!chatDraftV22.trim()||chatSendingV22?'disabled':'')+'>'+icon('send')+'</button></form></section>';
  }
  function chatResizeInputV22(input){if(!input)return;input.style.height='auto';const height=Math.max(40,Math.min(112,input.scrollHeight||40));input.style.height=height+'px';input.style.overflowY=height>=112?'auto':'hidden';}
  function chatInputV22(input){chatDraftV22=input.value;chatResizeInputV22(input);const button=$('v22-chat-send');if(button)button.disabled=chatSendingV22||!chatDraftV22.trim();}
  function chatKeyV22(event){if(event.key!=='Enter'||event.shiftKey||event.isComposing||chatComposingV22||event.keyCode===229)return;event.preventDefault();chatSendV22();}
  function chatCompositionV22(value){chatComposingV22=!!value;}
  function chatRememberFocusV22(){const input=$('v22-chat-input');if(input&&document.activeElement===input)chatFocusV22={start:input.selectionStart,end:input.selectionEnd};}
  function chatSendV22(event){
    event?.preventDefault?.();if(chatSendingV22||chatComposingV22)return false;
    const input=$('v22-chat-input'),raw=input?input.value:chatDraftV22,text=raw.replace(/\r\n?/g,'\n').trim();
    if(!text)return false;if(text.length>1000){toast('메시지는 1,000자까지 입력해 주세요.');return false;}
    if(chatPreviewV22().messages.length>=500){toast('미리보기 메시지는 500개까지 보관됩니다. 톡 메뉴에서 비울 수 있어요.');return false;}
    chatDraftV22=raw;chatSendingV22=true;const button=$('v22-chat-send');if(button)button.disabled=true;
    try{
      if(!commit(()=>{const preview=chatEnsureV22();preview.messages.push({id:chatMessageIdV22(preview.messages),sender:'self',text,createdAt:new Date().toISOString(),read:true});}))return false;
      chatDraftV22='';chatScrollEndV22=true;chatFocusV22={start:0,end:0};if(input)input.value='';render();return true;
    }finally{chatSendingV22=false;const current=$('v22-chat-send');if(current)current.disabled=!chatDraftV22.trim();}
  }
  function chatExamplesV22(){
    if(chatPreviewV22().exampleLoaded){toast('예시 대화가 이미 추가되어 있어요.');return false;}
    if(chatPreviewV22().messages.length>498){toast('예시를 추가할 공간이 없습니다. 톡 메뉴에서 미리보기를 비워 주세요.');return false;}
    if(!commit(()=>{const preview=chatEnsureV22();for(const text of ['토요일 점심에 시간 괜찮아?','가고 싶은 곳 사진도 보내 줄게.'])preview.messages.push({id:chatMessageIdV22(preview.messages),sender:'example',text,createdAt:new Date().toISOString(),read:false});preview.exampleLoaded=true;}))return false;
    chatScrollEndV22=true;render();return true;
  }
  function chatExampleReplyV22(){
    if(chatPreviewV22().messages.length>=500){toast('미리보기 메시지는 500개까지 보관됩니다.');return false;}
    if(!commit(()=>{const preview=chatEnsureV22(),text=chatExampleRepliesV22[preview.exampleReplyIndex%chatExampleRepliesV22.length];preview.messages.push({id:chatMessageIdV22(preview.messages),sender:'example',text,createdAt:new Date().toISOString(),read:false});preview.exampleReplyIndex++;}))return false;
    chatRememberFocusV22();chatScrollEndV22=true;render();return true;
  }
  function chatScrollV22(log){chatScrollTopV22=log.scrollTop;chatScrollEndV22=log.scrollHeight-log.scrollTop-log.clientHeight<32;requestAnimationFrame(chatEnterV22);}
  function chatCanReadV22(){return tab==='chat'&&document.visibilityState!=='hidden'&&$('od-overlay')?.hidden!==false&&!!$('v22-chat-log');}
  function chatVisibleV22(node){
    if(!node||!chatCanReadV22()||typeof node.getBoundingClientRect!=='function')return false;
    const area=$('v22-chat-log').getBoundingClientRect(),rect=node.getBoundingClientRect();
    return rect.width>0&&area.width>0&&Math.min(rect.bottom,area.bottom)-Math.max(rect.top,area.top)>=Math.min(40,rect.height*.5)&&Math.min(rect.right,area.right)>Math.max(rect.left,area.left);
  }
  function chatMarkVisibleV22(ids){
    if(!chatCanReadV22())return;const visible=new Set(ids.filter(n=>chatVisibleV22($('v22-chat-message-'+n))));
    if(!chatPreviewV22().messages.some(m=>m.sender==='example'&&!m.read&&visible.has(m.id)))return;
    chatRememberFocusV22();if(commit(()=>{for(const m of chatEnsureV22().messages)if(m.sender==='example'&&visible.has(m.id))m.read=true;}))render();
  }
  function chatEnterV22(){
    chatObserverV22?.disconnect();chatObserverV22=null;if(!chatCanReadV22())return;
    const unread=chatPreviewV22().messages.filter(m=>m.sender==='example'&&!m.read),log=$('v22-chat-log');if(!unread.length)return;
    const visible=unread.filter(m=>chatVisibleV22($('v22-chat-message-'+m.id))).map(m=>m.id);
    if(visible.length){chatMarkVisibleV22(visible);return;}
    if(typeof IntersectionObserver==='function'){
      chatObserverV22=new IntersectionObserver(entries=>{const ids=entries.filter(entry=>entry.isIntersecting).map(entry=>Number(entry.target.dataset.chatId));if(ids.length)chatMarkVisibleV22(ids);},{root:log,threshold:[0,.1,.5,1]});
      for(const m of unread){const node=$('v22-chat-message-'+m.id);if(node)chatObserverV22.observe(node);}
    }
  }
  function chatRenderAfterV22(){
    if(tab!=='chat'){chatObserverV22?.disconnect();chatObserverV22=null;return;}
    const page=$('main-viewport')?.querySelector('.v22-chat-page'),viewport=$('main-viewport'),log=$('v22-chat-log'),input=$('v22-chat-input');if(!page||!log)return;
    const padding=typeof getComputedStyle==='function'?parseFloat(getComputedStyle(viewport).paddingBottom)||72:72;
    page.style.height=Math.max(240,viewport.clientHeight-padding)+'px';
    if(input){input.value=chatDraftV22;chatResizeInputV22(input);}
    log.scrollTop=chatScrollEndV22?log.scrollHeight:chatScrollTopV22;
    if(chatFocusV22&&input){input.focus({preventScroll:true});input.setSelectionRange?.(chatFocusV22.start,chatFocusV22.end);chatFocusV22=null;}
    const send=$('v22-chat-send');if(send)send.disabled=chatSendingV22||!chatDraftV22.trim();
    // Defer read-state mutation until after the rendered cards have layout.
    requestAnimationFrame(chatEnterV22);
  }
  function chatMenuV22(){show('톡 미리보기','<button class="od-menu-item" onclick="OD.chatExamplesFromMenu()">'+icon('comment')+'예시 대화 보기</button><button class="od-menu-item od-danger" onclick="OD.chatReset()">'+icon('trash')+'미리보기 비우기</button><p class="v22-chat-menu-note">실제 상대에게 메시지가 전송되지 않습니다. 예시 대화와 입력한 메시지는 이 브라우저에만 저장됩니다.</p>','','menu');}
  async function chatExamplesFromMenuV22(){await close(true);chatExamplesV22();}
  async function chatResetV22(){
    if(!await askConfirm({title:'톡 미리보기를 비울까요?',message:'이 브라우저에 저장한 메시지와 예시 대화가 삭제됩니다.',confirmLabel:'비우기',tone:'danger'}))return;
    if(!commit(()=>{state.chatPreview={version:1,exampleLoaded:false,exampleReplyIndex:0,messages:[]};}))return;
    chatDraftV22='';chatScrollTopV22=0;chatScrollEndV22=true;chatFocusV22=null;await close(true);render();
  }
  Object.assign(OD,{chatSend:chatSendV22,chatInput:chatInputV22,chatKey:chatKeyV22,chatComposition:chatCompositionV22,chatScroll:chatScrollV22,chatExamples:chatExamplesV22,chatExampleReply:chatExampleReplyV22,chatEnter:chatEnterV22,chatAfterRender:chatRenderAfterV22,chatMenu:chatMenuV22,chatExamplesFromMenu:chatExamplesFromMenuV22,chatReset:chatResetV22});
  window.addEventListener('resize',()=>{if(tab==='chat'){chatRenderAfterV22();requestAnimationFrame(chatEnterV22);}});
  document.addEventListener('visibilitychange',()=>{if(tab==='chat'&&document.visibilityState==='visible')requestAnimationFrame(chatEnterV22);});
