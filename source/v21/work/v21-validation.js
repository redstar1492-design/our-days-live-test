function validateCollectionsV21(raw){
  if(raw.collections===undefined){if([...(raw.posts||[]),...(raw.events||[]),...(raw.todoCategories||[]).flatMap(c=>c.items||[])].some(v=>v.collectionId!=null))throw Error('모음 연결 정보가 없습니다.');return;}
  const bad=m=>{throw Error(m);},obj=x=>x&&typeof x==='object'&&!Array.isArray(x),text=(x,max)=>typeof x==='string'&&x.length<=max;
  if(!Array.isArray(raw.collections)||raw.collections.length>200)bad('모음 목록을 확인해 주세요.');
  const ids=new Set(),eventIds=new Set();
  for(const c of raw.collections){
    if(!obj(c)||!Number.isSafeInteger(c.id)||ids.has(c.id))bad('모음 ID를 확인해 주세요.');ids.add(c.id);
    if(!text(c.title,60)||!c.title.trim()||!text(c.note||'',4000)||!['collection','trip'].includes(c.kind)||!['준영','아정'].includes(c.createdBy))bad('모음 정보를 확인해 주세요.');
    if(c.eventId!=null){if(c.kind!=='trip'||!Number.isSafeInteger(c.eventId)||eventIds.has(c.eventId))bad('모음의 일정 연결을 확인해 주세요.');eventIds.add(c.eventId);const ev=(raw.events||[]).find(v=>v.id===c.eventId);if(!ev||ev.collectionId!==c.id||ev.date!==c.startDate||(ev.endDate||ev.date)!==c.endDate||ev.title!==c.title)bad('여행과 달력 일정의 연결을 확인해 주세요.');}
    if(!Array.isArray(c.stops)||c.stops.length>300)bad('여행 장소 목록을 확인해 주세요.');
    if(c.kind==='trip'&&(!validISODate(c.startDate)||!validISODate(c.endDate)||c.endDate<c.startDate||(Date.parse(c.endDate)-Date.parse(c.startDate))/86400000>30))bad('여행 기간은 1~31일로 선택해 주세요.');
    if(c.kind!=='trip'&&c.stops.length)bad('여행 모음의 장소만 저장할 수 있어요.');
    const stops=new Set();
    for(const s of c.stops){
      if(!obj(s)||!Number.isSafeInteger(s.id)||stops.has(s.id)||!text(s.title,100)||!s.title.trim()||!text(s.note||'',1000)||!validISODate(s.date)||s.date<c.startDate||s.date>c.endDate)bad('여행 장소 정보를 확인해 주세요.');stops.add(s.id);
      if(s.url){try{const u=new URL(s.url);if(!text(s.url,2000)||u.href.length>2000||u.protocol!=='https:'||u.username||u.password)throw Error();}catch{bad('장소 링크는 https 주소로 입력해 주세요.');}}
    }
  }
  for(const item of [...(raw.posts||[]),...(raw.events||[]),...(raw.todoCategories||[]).flatMap(c=>c.items||[])])if(item.collectionId!=null&&(!Number.isSafeInteger(item.collectionId)||!ids.has(item.collectionId)))bad('삭제되었거나 잘못된 모음 연결입니다.');
}
