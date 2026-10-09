// Inject these helpers inside the active app IIFE. They never touch storage.
function validateOnboardingInfo(info) {
  if (!info || typeof info !== 'object' || Array.isArray(info)) throw Error('프로필 정보를 확인해 주세요.');
  const name = typeof info.name === 'string' ? info.name.trim() : '';
  const partnerName = info.partnerName == null ? '상대방' : typeof info.partnerName === 'string' ? info.partnerName.trim() || '상대방' : '';
  if (!name || name.length > 20 || /[\u0000-\u001f\u007f]/.test(name)) throw Error('이름은 1~20자로 입력해 주세요.');
  if (!partnerName || partnerName.length > 20 || /[\u0000-\u001f\u007f]/.test(partnerName)) throw Error('상대방 이름은 1~20자로 입력해 주세요.');
  const avatar = info.avatar == null || info.avatar === '' ? '' : info.avatar;
  if (typeof avatar !== 'string' || avatar.length > 3000000 || avatar && !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(avatar)) throw Error('프로필 사진을 다시 선택해 주세요.');
  const date = (value, label) => {
    if (value == null || value === '') return null;
    if (typeof value !== 'string' || !validISODate(value) || value > today()) throw Error(label + '은 오늘 이전의 날짜로 선택해 주세요.');
    return value;
  };
  const firstMetDate = date(info.firstMetDate, '처음 만난 날'), anniversary = date(info.anniversary, '사귀기 시작한 날');
  if (firstMetDate && anniversary && firstMetDate > anniversary) throw Error('처음 만난 날은 사귀기 시작한 날 이전으로 선택해 주세요.');
  return { name, partnerName, avatar, firstMetDate, anniversary };
}

function freshOnboardingState(info) {
  const profile = validateOnboardingInfo(info), date = today(), next = JSON.parse(JSON.stringify(defaultData));
  next.activeTab = 'our';
  next.activeCalendarView = 'daily';
  next.currentUser = '준영';
  next.selectedDate = date;
  next.calendarMonth = date.slice(0, 7);
  next.calendarFilter = '전체';
  next.memberProfiles = { '준영': { nickname: profile.name, avatar: profile.avatar }, '아정': { nickname: profile.partnerName, avatar: '' } };
  next.profiles = {};
  next.noSampleProfile = true;
  next.heroPhoto = null;
  next.heroTitle = '';
  next.heroSubtitle = '';
  next.firstMetDate = profile.firstMetDate;
  next.anniversary = profile.anniversary;
  next.moodStatus = { '준영': null, '아정': null };
  next.posts = [];
  next.events = [];
  next.notifications = [];
  next.joinRequests = [];
  next.dailyMarkers = [];
  next.cycleMarkers = [];
  next.financeEntries = [];
  next.monthlyBudgets = {};
  next.todoCategories = [{ id: 'wishlist', title: '할 일', coverMode: 'auto', coverAuto: 'sea', coverImg: null, collapsed: true, items: [] }];
  // Legacy sample helpers must not infer that a fresh user's empty data needs seeds.
  next.demoV5 = true;
  next.demoV6 = true;
  next.onboarding = { version: 1, completed: true };
  return next;
}

module.exports = {
  validateOnboardingInfo: validateOnboardingInfo.toString(),
  freshOnboardingState: freshOnboardingState.toString(),
  source: validateOnboardingInfo.toString() + '\n' + freshOnboardingState.toString()
};
