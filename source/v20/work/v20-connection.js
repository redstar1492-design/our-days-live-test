  // Preview invitations carry only a display name. They never create a connection.
  function isCoupleConnected(){return !state.connection&&!Object.prototype.hasOwnProperty.call(state,'noSampleProfile');}
  function connectionMembers(){return isCoupleConnected()?['준영','아정']:[me()];}
  function connectionFilters(){return isCoupleConnected()?['전체','준영','아정','함께']:['전체',me()];}
  function connectionNotifications(){return isCoupleConnected()?state.notifications:[];}
  function parseDumpInviteHash(rawHash){
    const hash=String(rawHash||'');
    if(!hash.startsWith('#dump-invite='))return {status:'none',invite:null};
    try{
      const encoded=hash.slice(13);
      if(!encoded||encoded.length>800||!/^[A-Za-z0-9_-]+$/.test(encoded))throw Error('invalid');
      const binary=atob(encoded.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-encoded.length%4)%4));
      const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
      const payload=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
      if(!payload||Array.isArray(payload)||typeof payload!=='object'||Object.keys(payload).some(k=>!['v','name','nonce'].includes(k)))throw Error('invalid');
      if(payload.v!==20||typeof payload.name!=='string'||!payload.name.trim()||payload.name.trim().length>20||/[\u0000-\u001f\u007f]/.test(payload.name))throw Error('invalid');
      if(payload.nonce!==undefined&&(typeof payload.nonce!=='string'||!/^[A-Za-z0-9_-]{16,64}$/.test(payload.nonce)))throw Error('invalid');
      return {status:'valid',invite:{v:20,name:payload.name.trim(),...(payload.nonce?{nonce:payload.nonce}:{})}};
    }catch{return {status:'invalid',invite:null};}
  }
  function encodeDumpInvite(payload){
    const encoded=btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(payload)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    if(parseDumpInviteHash('#dump-invite='+encoded).status!=='valid')throw Error('초대 정보를 확인해 주세요.');
    return encoded;
  }
  function parsedIncomingInvite(){return parseDumpInviteHash(window.location.hash).invite;}
  let outgoingInvitePreview=null,inviteAfterSetup=false;
  function invitationPreviewUrl(){
    const name=nicknameOf(me()).trim();
    if(!outgoingInvitePreview||outgoingInvitePreview.name!==name){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);const nonce=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');outgoingInvitePreview={v:20,name,nonce};}
    const link=new URL(/^https?:$/.test(location.protocol)?location.href:'https://redstar1492-design.github.io/our-days-live-test/dump-onboarding-preview.html?v=20');
    link.hash='dump-invite='+encodeDumpInvite(outgoingInvitePreview);return link.href;
  }
  function invite(afterSetup=false){
    inviteAfterSetup=!!afterSetup;
    const incoming=parseDumpInviteHash(window.location.hash);
    let body='<div class="od-invite-preview"><p class="od-invite-kicker">초대 화면 미리보기</p>';
    if(incoming.status==='valid')body+='<h2>'+e(incoming.invite.name)+'님의 초대</h2><p>상대방도 자신의 이름과 사진으로 시작합니다.</p><p class="od-help">이 버전에서는 서로의 기기를 연결할 수 없어요. 입력한 정보와 기록은 각자의 브라우저에 저장됩니다.</p>';
    else if(incoming.status==='invalid')body+='<h2>초대 링크를 확인해 주세요</h2><p>링크가 올바르지 않아요. 보낸 사람에게 링크를 다시 받아 주세요.</p><p class="od-help">지금은 초대 화면만 미리 볼 수 있으며 기기 연결은 제공하지 않습니다.</p>';
    else body+='<h2>상대에게 링크 보내기</h2><p>받은 사람은 자신의 이름을 입력하고 시작합니다.</p><p class="od-help">지금은 초대 화면만 미리 볼 수 있어요. 링크를 보내도 기기가 연결되거나 기록이 공유되지는 않습니다.</p><div class="od-invite-actions"><button class="od-secondary" onclick="OD.inviteCopy()">링크 복사</button><button class="od-secondary" onclick="OD.inviteShare()">링크 공유</button></div><div id="od-invite-link-area" hidden><label class="od-field"><span>초대 미리보기 링크</span><input id="od-invite-link" readonly aria-label="초대 미리보기 링크"></label></div><p class="od-invite-disclosure">링크에는 내 이름만 포함됩니다.</p>';
    body+='<p id="od-invite-status" class="od-help" role="status" aria-live="polite"></p></div>';
    const actions=afterSetup?'<button class="od-primary od-wide" onclick="OD.beginGuide()">사용법 따라하기</button><button class="od-text-action od-wide od-invite-skip" onclick="OD.skipGuide()">바로 시작</button>':footer('닫기','OD.close(true)');
    show('상대 초대',body,actions,'invite');
  }
  function inviteStatus(message){const el=$('od-invite-status');if(el)el.textContent=message;}
  async function inviteCopy(){
    if(modalKind!=='invite')return;
    let link;try{link=invitationPreviewUrl();}catch{inviteStatus('링크를 만들지 못했어요. 내 이름을 확인해 주세요.');return;}
    try{if(!navigator.clipboard?.writeText)throw Error('clipboard');await navigator.clipboard.writeText(link);if(modalKind==='invite')inviteStatus('초대 미리보기 링크를 복사했어요.');}
    catch{if(modalKind!=='invite')return;const area=$('od-invite-link-area'),input=$('od-invite-link');if(area&&input){area.hidden=false;input.value=link;input.focus();input.select();inviteStatus('링크를 선택했어요. 복사해서 보내 주세요.');}}
  }
  async function inviteShare(){
    if(modalKind!=='invite')return;
    let link;try{link=invitationPreviewUrl();}catch{inviteStatus('링크를 만들지 못했어요. 내 이름을 확인해 주세요.');return;}
    if(!navigator.share){await inviteCopy();return;}
    try{await navigator.share({title:'dump 초대 화면 미리보기',text:nicknameOf(me())+'님의 dump 초대 화면입니다. 현재는 기기 연결을 지원하지 않습니다.',url:link});if(modalKind==='invite')inviteStatus('초대 미리보기 링크를 공유했어요.');}
    catch(err){if(err?.name!=='AbortError'&&modalKind==='invite'){inviteStatus('공유를 열지 못했어요. 링크를 복사해서 보내 주세요.');}}
  }
  Object.assign(window.OD,{invite,inviteCopy,inviteShare,incomingInvite:parsedIncomingInvite,inviteHashState:()=>parseDumpInviteHash(window.location.hash),isCoupleConnected,invitePreviewUrl:invitationPreviewUrl});
