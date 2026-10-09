const previous=require('./patch-v18-onboarding-state.cjs');
function validateOnboardingInfo(info){
  if(!info||typeof info!=='object'||Array.isArray(info))throw Error('프로필 정보를 확인해 주세요.');
  const name=typeof info.name==='string'?info.name.trim():'';
  if(!name||name.length>20||/[\u0000-\u001f\u007f]/.test(name))throw Error('이름은 1~20자로 입력해 주세요.');
  const avatar=info.avatar==null?'':info.avatar;
  if(typeof avatar!=='string'||avatar.length>3000000||avatar&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(avatar))throw Error('프로필 사진을 다시 선택해 주세요.');
  return{name,avatar};
}
const fresh=previous.freshOnboardingState
  .replace("{ nickname: profile.partnerName, avatar: '' }","{}")
  .replace('next.firstMetDate = profile.firstMetDate;','next.firstMetDate = null;')
  .replace('next.anniversary = profile.anniversary;','next.anniversary = null;')
  .replace('next.onboarding = { version: 1, completed: true };',"next.onboarding = { version: 20, completed: true };\n  next.connection = { status: 'unconnected' };\n  next.tutorial = { version: 20, status: 'paused', step: 'post' };");
module.exports={source:validateOnboardingInfo.toString()+'\n'+fresh};
