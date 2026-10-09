  let onboardingSession=null;
  const guideSteps=['post','calendar','task','invite'];
  function normalizeTutorial(raw){return{version:20,status:raw?.version===20&&['active','paused','done'].includes(raw.status)?raw.status:'inactive',step:guideSteps.includes(raw?.step)?raw.step:'post',...(typeof raw?.startedAt==='string'&&raw.startedAt.length<40&&Number.isFinite(Date.parse(raw.startedAt))?{startedAt:raw.startedAt}:{})};}
  function guideTrackMutation(beforeRaw){
    const g=normalizeTutorial(state.tutorial);if(g.status!=='active'||g.step==='invite')return;
    let before;try{before=JSON.parse(beforeRaw);}catch{return;}
    const list=(s,step)=>step==='post'?s.posts||[]:step==='calendar'?s.events||[]:(s.todoCategories||[]).flatMap(c=>c.items||[]);
    const previous=new Set(list(before,g.step).map(v=>String(v.id)));
    const created=list(state,g.step).find(v=>!previous.has(String(v.id))&&(g.step==='post'?v.author:v.createdBy)===me());
    if(created)state.tutorial={...g,step:guideSteps[guideSteps.indexOf(g.step)+1],lastCreated:{type:g.step,id:created.id}};
  }
  function onboardingFields(){const s=onboardingSession,d=s.info;return '<div class="dt-profile-fields"><label class="dt-photo" tabindex="0" role="button" aria-label="프로필 사진 추가" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();document.getElementById(\'dt-photo-input\').click()}"><span class="dt-photo-preview">'+(d.avatar?'<img src="'+e(d.avatar)+'" alt="내 프로필 사진">':icon('user'))+'</span><span><strong>프로필 사진</strong><small>'+(s.photoBusy?'사진 준비 중…':'선택')+'</small></span><input id="dt-photo-input" type="file" accept="image/*" hidden onchange="OD.onboardPhoto(this)" '+(s.photoBusy?'disabled':'')+'></label>'+(d.avatar?'<button class="dt-remove" onclick="OD.onboardRemovePhoto()">사진 삭제</button>':'')+'<label class="dt-name-field" for="dt-name"><strong>내 이름</strong><input id="dt-name" name="name" value="'+e(d.name)+'" maxlength="20" placeholder="이름 입력" autocomplete="nickname" aria-required="true" aria-describedby="dt-error" oninput="OD.onboardInput(this)" onkeydown="if(event.key===\'Enter\'){event.preventDefault();OD.onboardNext()}"></label></div>';}
  function renderOnboarding(focus=true){const s=onboardingSession,root=$('od-onboarding');if(!s||!root)return;const setup=s.step===1,inv=OD.incomingInvite?.();
    root.innerHTML='<header class="dt-top"><img src="'+ONBOARDING_LOGO+'" alt="dump" width="160" height="73">'+(setup?'<button aria-label="이전 화면" onclick="OD.onboardBack()" '+(s.photoBusy?'disabled':'')+'>'+icon('left')+'</button>':s.replay?'<button aria-label="소개 닫기" onclick="OD.onboardSkip()">'+icon('x')+'</button>':'')+'</header><div class="dt-body"><h1 id="dt-title" tabindex="-1">'+(setup?'내 프로필':'둘이 쓰는 덤프')+'</h1><p class="dt-description">'+(setup?'이름과 사진은 내 게시물에 표시됩니다.':'사진과 글을 올리고,<br>일정과 할 일을 함께 관리하세요.')+'</p>'+(setup?onboardingFields():'<div class="dt-services"><div>'+icon('image')+'<span><strong>덤프</strong><p>사진과 글, 댓글</p></span></div><div>'+icon('calendar')+'<span><strong>일정</strong><p>각자의 일정과 같이할 약속</p></span></div><div>'+icon('todo')+'<span><strong>할 일</strong><p>목표 날짜와 완료 체크</p></span></div></div><div class="dt-how"><span>사용 순서</span><p>내 프로필 설정 → 상대방 초대 → 사용법 따라하기</p></div>')+(inv?'<p class="dt-invited"><strong>'+e(inv.name)+'</strong>님의 초대 화면입니다.<br>상대방 이름을 입력할 필요 없이 내 프로필만 설정하세요.<small>초대 화면 미리보기 · 실제 계정 연결은 아직 제공되지 않습니다.</small></p>':'')+'<p id="dt-error" class="dt-error" role="status">'+e(s.error||'')+'</p></div><footer class="dt-footer"><button class="dt-start" onclick="OD.onboardNext()" '+(s.photoBusy||s.saving?'disabled':'')+'>'+(s.saving?'저장 중…':setup?'다음':s.replay?'사용법 따라하기':'시작하기')+icon('right')+'</button>'+(setup?'<small>사진은 나중에 추가할 수 있습니다.</small>':'<small>다음 화면부터 직접 등록하며 사용법을 확인합니다.</small>')+'</footer>';
    if(focus)$('dt-title')?.focus({preventScroll:true});
  }
  function startOnboarding(replay=true){if(onboardingSession)return;if(!$('od-overlay').hidden)close(true);const root=document.createElement('section');root.id='od-onboarding';root.className='od-onboarding';root.setAttribute('aria-label','덤프 시작 안내');document.querySelector('body>main').appendChild(root);$('main-viewport').inert=true;$('od-nav').inert=true;onboardingSession={replay,step:0,info:{name:'',avatar:''},error:'',photoBusy:false,saving:false,photoToken:0};renderOnboarding();resizeOnboarding();}
  function resizeOnboarding(){const root=$('od-onboarding');if(root&&window.visualViewport)root.style.height=Math.min(document.querySelector('body>main').clientHeight,window.visualViewport.height)+'px';}
  function onboardingError(message){if(!onboardingSession)return;onboardingSession.error=message;if($('dt-error'))$('dt-error').textContent=message;}
  function onboardingInput(input){if(!onboardingSession||input.name!=='name')return;onboardingSession.info.name=input.value;onboardingError('');}
  function onboardingNext(){const s=onboardingSession;if(!s||s.saving||s.photoBusy)return;if(s.replay){closeOnboarding();beginGuide();return;}if(s.step===0){s.step=1;s.error='';renderOnboarding();return;}finishOnboarding();}
  function onboardingBack(){const s=onboardingSession;if(!s||s.saving||s.photoBusy)return;s.step=0;s.error='';renderOnboarding();}
  function onboardingSkip(){if(onboardingSession?.replay)closeOnboarding();}
  async function onboardingPhoto(input){const s=onboardingSession,file=input.files?.[0];if(!s||s.photoBusy||!file)return;const token=++s.photoToken;s.photoBusy=true;s.error='';renderOnboarding(false);try{const url=await new Promise((resolve,reject)=>compressImage(file,320,resolve,reject));if(onboardingSession!==s||s.photoToken!==token)return;s.info.avatar=url;}catch{if(onboardingSession===s)s.error='사진을 읽지 못했습니다. 다른 사진을 선택해 주세요.';}finally{if(onboardingSession===s){s.photoBusy=false;renderOnboarding(false);}}}
  function onboardingRemovePhoto(){if(onboardingSession&&!onboardingSession.photoBusy){onboardingSession.info.avatar='';renderOnboarding(false);}}
  function closeOnboarding(){if(!onboardingSession)return;onboardingSession.photoToken++;onboardingSession=null;$('od-onboarding')?.remove();$('main-viewport').inert=false;$('od-nav').inert=false;document.querySelector('body>main').inert=false;}
  function finishOnboarding(){const s=onboardingSession;if(!s||s.replay||s.saving||s.photoBusy)return;let next;try{next=freshOnboardingState(s.info);}catch(err){onboardingError(err.message);$('dt-name')?.focus();return;}s.saving=true;renderOnboarding(false);const before=state;
    try{if(window.odStorageIssue||window.odPersistedRaw!==null||localStorage.getItem(STATE_KEY)!==null)throw Error('다른 창에 저장된 정보가 있습니다. 새로고침해 주세요.');next.onboarding.completedAt=new Date().toISOString();const raw=JSON.stringify(next);localStorage.setItem(STATE_KEY,raw);window.state=next;window.odPersistedRaw=raw;window.odConflict=false;try{localStorage.setItem(DEVICE_USER_KEY,'준영');}catch{}}
    catch(err){window.state=before;s.saving=false;onboardingError(err.message.includes('다른 창')?err.message:'저장하지 못했습니다. 입력은 유지됩니다. 저장 공간을 확인해 주세요.');renderOnboarding(false);return;}
    feedFilter=calFilter=taskFilter=taskAuthorFilter='전체';tab='our';taskStatus='진행 중';selected=today();month=selected.slice(0,7);Object.keys(scrolls).forEach(k=>scrolls[k]=0);closeOnboarding();
    try{render();$('main-viewport').scrollTop=0;OD.invite(true);}catch{toast('프로필은 저장되었습니다. 새로고침해 주세요.');}
  }
  function onboardingEmpty(){return '<div class="od-new-empty"><strong>아직 덤프가 없습니다</strong><p>오른쪽 위 +에서 사진이나 글을 등록하세요.</p></div>';}
  function guideRefresh(){
    document.querySelectorAll('.dt-target').forEach(el=>el.classList.remove('dt-target'));$('dump-guide')?.remove();if(onboardingSession)return;
    const g=normalizeTutorial(state.tutorial);if(g.status!=='active')return;
    const overlay=$('od-overlay'),isSheet=overlay&&!overlay.hidden;
    if(isSheet&&!['post','event','task','invite','invitePreview'].includes(modalKind))return;
    if(isSheet&&modalId&&g.step!=='invite')return;
    const expected={post:'our',calendar:'calendar',task:'todo',invite:'account'}[g.step],index=guideSteps.indexOf(g.step),inTab=tab===expected;
    let title,detail,target=null;
    if(isSheet){
      const match=g.step==='post'&&modalKind==='post'||g.step==='calendar'&&modalKind==='event'||g.step==='task'&&modalKind==='task'||g.step==='invite'&&['invite','invitePreview'].includes(modalKind);if(!match)return;
      title={post:'내용을 입력하고 게시하세요',calendar:'제목과 날짜를 정하세요',task:'할 일을 입력하고 저장하세요',invite:'초대 링크를 확인하세요'}[g.step];
      detail={post:'여기서 게시한 덤프는 피드에 저장됩니다. 사진은 선택입니다.',calendar:'하루 또는 여러 날로 등록할 수 있습니다. 저장하면 달력에 표시됩니다.',task:'목표일을 정하면 D-day가 표시됩니다. 완료한 일은 체크하세요.',invite:'링크를 복사하거나 공유해 보세요.'}[g.step];
      target=g.step==='invite'?null:$('od-submit');
    }else if(!inTab){title={post:'덤프 탭으로 이동하세요',calendar:'다음은 일정 등록입니다',task:'다음은 할 일 등록입니다',invite:'마이에서 상대방을 초대하세요'}[g.step];detail={post:'아래 덤프 탭을 누르세요.',calendar:'아래 일정 탭을 누르세요.',task:'아래 할 일 탭을 누르세요.',invite:'아래 마이 탭을 누르세요.'}[g.step];target=$('od-nav')?.querySelector('[onclick="OD.tab(\''+expected+'\')"]');}
    else {title={post:'첫 덤프를 등록해 보세요',calendar:'일정을 등록해 보세요',task:'할 일을 추가해 보세요',invite:'상대방 초대 화면을 확인하세요'}[g.step];detail={post:'오른쪽 위 +를 누르면 작성창이 열립니다.',calendar:'오른쪽 위 +를 눌러 제목과 날짜를 입력하세요.',task:'오른쪽 위 +를 누르면 할 일을 추가할 수 있습니다.',invite:'아래 상대방 초대를 누르세요. 상대 이름을 대신 입력하지 않습니다.'}[g.step];target=g.step==='invite'?$('main-viewport').querySelector('[onclick="OD.invite()"],[onclick="OD.partnerInfo()"]'):$('main-viewport').querySelector('.od-top button[aria-label="'+({post:'덤프 작성',calendar:'일정 등록',task:'할 일 추가'}[g.step])+'"]');}
    const panel=document.createElement('aside');panel.id='dump-guide';panel.className='dt-guide';panel.setAttribute('aria-label','사용법 안내');panel.innerHTML='<div class="dt-guide-top"><span>사용법 '+(index+1)+' / 4</span><button aria-label="사용법 안내 종료" onclick="OD.pauseGuide()">'+icon('x')+'</button></div><strong>'+title+'</strong><p>'+detail+'</p><div class="dt-guide-actions"><button onclick="OD.guideSkip()">'+(g.step==='invite'?'안내 마치기':'이 단계 건너뛰기')+'</button></div>';
    if(isSheet){$('od-sheet-body')?.prepend(panel);}else{const host=$('main-viewport').querySelector('.od'),anchor=host?.querySelector('.od-filter-fixed')||host?.querySelector('.od-top');if(anchor)anchor.insertAdjacentElement('afterend',panel);else host?.prepend(panel);}
    if(target)target.classList.add('dt-target');
  }
  async function beginGuide(){if(!$('od-overlay').hidden){await close();if(!$('od-overlay').hidden)return;}if(!commit(()=>{state.tutorial={version:20,status:'active',step:'post',startedAt:new Date().toISOString()};}))return;feedFilter='전체';switchTo('our');$('main-viewport').scrollTop=0;guideRefresh();}
  async function skipGuide(){if(!$('od-overlay').hidden){await close();if(!$('od-overlay').hidden)return;}if(commit(()=>{state.tutorial={...normalizeTutorial(state.tutorial),status:'done'};})){switchTo('our');guideRefresh();}}
  function pauseGuide(){if(commit(()=>{state.tutorial={...normalizeTutorial(state.tutorial),status:'paused'};}))render();}
  async function guideSkip(){const g=normalizeTutorial(state.tutorial);if(g.status!=='active')return;if(!$('od-overlay').hidden){await close();if(!$('od-overlay').hidden)return;}const i=guideSteps.indexOf(g.step);if(!commit(()=>{state.tutorial={...g,version:20,status:i===3?'done':'active',step:guideSteps[Math.min(i+1,3)],startedAt:state.tutorial.startedAt||new Date().toISOString()};}))return;if(i===3){switchTo('our');toast('사용법 안내를 마쳤습니다.');}else switchTo({calendar:'calendar',task:'todo',invite:'account'}[guideSteps[i+1]]);guideRefresh();}
  function resumeGuide(){if(normalizeTutorial(state.tutorial).status==='paused'&&commit(()=>{state.tutorial={...normalizeTutorial(state.tutorial),status:'active'};}))render();}
  function clearInvitePreviewHash(){if(!window.location.hash.startsWith('#dump-invite='))return;try{const url=new URL(window.location.href);url.hash='';window.history.replaceState(window.history.state,'',url.href);}catch{}}
  function guideAccountRow(){const g=normalizeTutorial(state.tutorial);return accountRow(g.status==='paused'&&g.startedAt?'사용법 이어보기':'사용법 안내','실제 등록 버튼을 따라 사용하기',g.status==='paused'&&g.startedAt?'OD.resumeGuide()':'OD.onboarding()','todo');}
  function onboardingBoot(){
    if(onboardingSession||window.odStorageIssue)return;
    const g=normalizeTutorial(state.tutorial);
    if(OD.inviteHashState?.().status!=='none'){OD.invite(g.status==='paused'&&state.onboarding?.version===20&&!state.tutorial.startedAt);return;}
    if(g.status==='paused'&&state.onboarding?.version===20&&!state.tutorial.startedAt){OD.invite(true);return;}
    guideRefresh();
  }
  Object.assign(OD,{onboarding:()=>startOnboarding(true),onboardNext:onboardingNext,onboardBack:onboardingBack,onboardSkip:onboardingSkip,onboardInput:onboardingInput,onboardPhoto:onboardingPhoto,onboardRemovePhoto:onboardingRemovePhoto,beginGuide,skipGuide,guideSkip,pauseGuide,resumeGuide});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&onboardingSession?.replay)closeOnboarding();if(ev.key==='Tab'&&onboardingSession){const buttons=Array.from($('od-onboarding').querySelectorAll('button,input,[tabindex]')).filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last?.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first?.focus();}}});
  window.addEventListener('resize',resizeOnboarding);window.visualViewport?.addEventListener('resize',resizeOnboarding);
