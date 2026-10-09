# dump v20 — 실제 앱 사용법과 상대 초대 검수

기준일: 2026-10-09. `index.html`과 `versions/v20/index.html`은 전달용 `dump-final.html`과 같은 파일입니다. 체험 파일만 v20 전용 저장 키를 사용합니다.

최종 HTML SHA256: `5620d72d7c01c80720d6a9fcf26fc1af352033cbbcb7849c73db3172e0761e5a`

자동 코드 검사와 실제 브라우저 확인을 아래에 분리해 기록했습니다. 이전 v19의 검사 통과 수를 이번 버전 수치로 합산하지 않았습니다. 실제 계정 연결·두 기기 동기화·푸시는 아직 제공하지 않으며 이번 검수 범위가 아닙니다.

## 두 차례 검수와 수정

- 1차: 실제 등록 흐름·취소·저장 성공 시 안내 진행 확인 → startedAt 보존, 중단 후 사용법 이어보기 수정.
- 2차: 초대 수신 후 재접속·버튼 강조·320px 입력창 확인 → 가입 직후 초대 화면 버튼 유지, URL fragment 정리, 실제 등록 버튼의 aria 선택자 수정.

최종 코드 검사는 339개 고유 검사 통과·0개 실패입니다. source/v20의 재빌드 패키지도 따로 실행해 최종 HTML과 동일한 SHA256을 확인했습니다.

## QA-v20-전체.txt

```text
dump v20 최종 코드 QA
대상: versions/v20/index.html
SHA256: 5620d72d7c01c80720d6a9fcf26fc1af352033cbbcb7849c73db3172e0761e5a
실행(UTC): 2026-10-09T09:22:23.829Z
결과: 339개 고유 검사 통과, 0개 실패

- 본인 프로필·빈 계정·실제 사용 안내: 74개 통과
- 기존 앱 기능 회귀: 228개 통과
- 초대 화면 준비·미연결 상태 보호: 37개 통과

검사 범위
- 가상 예시를 제거한 1장 서비스 설명 → 내 프로필만 입력 → 초대 화면 준비 → 실제 앱 사용 안내.
- 게시·일정·할 일의 실제 저장 성공, 검증 실패, 취소, 중복, 저장 실패, 다른 탭 충돌, 일시정지·재개·건너뛰기·재접속 데이터 유지.
- 신규 계정에 샘플 데이터와 가짜 상대 프로필·알림을 넣지 않는다.
- 초대 화면은 미리보기로 제한하고 이름만 포함한 링크의 공유·복사·검증·실패 대안을 제공한다. 실제 기기 연결 및 서버 동기화 완료를 표시하지 않는다.
- 기존 일정 참여·기간 바·할 일·D-day·댓글·프로필·백업·취소 확인창 회귀.

한계
- 실제 산출 HTML에서 추출한 앱 함수를 격리 VM의 모의 DOM·저장소에서 실행한 코드 검사다. 실제 배치·폰트·모션·모바일 터치 검수는 별도 화면검수 보고서에 따른다.
- 기존 기능 회귀에서는 실제 v20 상태 의존성을 주입하되 UI refresh는 기존 render와 같이 모의 처리한다.
- 실제 기기 간 초대 수락·계정 연결·동기화는 이번 버전에서 제공하지 않는다.

[test-v20-guided-flow.cjs]
PASS fresh account has no sample dumps events tasks notifications or remote partner facts
PASS fresh factory retains only own supplied name and raster profile photograph
PASS fresh state blocks sample reseeding and begins paused at the real post step
PASS factory and serialization preserve a fully empty new account
PASS factory calls return independent arrays and do not alter default samples
PASS blank missing numeric control and overlong own names are rejected
PASS untrusted URL SVG malformed and excessive profile images are rejected
PASS profile input cannot collect or overwrite a partner name
PASS one service screen leads directly to own profile without invented feed examples
PASS going back from own profile preserves the real name and selected photo draft
PASS own photo is compressed to the real profile size and remains an unsaved draft
PASS photo read failure keeps own name and previously selected image available
PASS late photo completion cannot write into a later onboarding session
PASS duplicate photo selection cannot start concurrent compression or double-change a draft
PASS photo deletion is blocked while compression is pending and works afterward
PASS invalid profile completion retains the draft and focuses the name field
PASS new profile completion writes one empty account then shows invitation preparation
PASS profile completion resets all author filters and scroll positions
PASS double completion cannot write or open the invitation twice
PASS photo preparation and saving each block next back and completion
PASS storage quota failure retains profile draft old account and retry controls
PASS another-tab account created during setup is never overwritten
PASS storage recovery and preloaded existing data each prevent profile reset
PASS device-user write denial preserves a successfully committed new profile
PASS post-save render failure never rolls memory back behind persisted profile
PASS guide begins on the real empty feed without creating a post event or task
PASS start guide honors dirty-sheet refusal without changing data or progress
PASS start guide storage failure keeps the previously paused state
PASS invalid tutorial state never silently activates a guide
PASS invalid guide step normalizes to post while known paused progress is retained
PASS editing an existing post never completes the post creation step
PASS new partner post does not complete my real post step
PASS new own post advances exactly once and persists its actual id
PASS creation on a different feature does not falsely complete the current guide step
PASS post creation storage failure rolls back both new post and guide advancement
PASS external account update blocks a guide mutation without losing the external version
PASS paused and done guides never advance when actual records are created
PASS calendar and task guide steps track only fresh records from the current user
PASS invite guide never declares the preview as a real connection on data mutation
PASS actual empty post submission retains form and post guide step
PASS actual post save preserves typed text advances guide and creates no fake partner notification
PASS actual post duplicate press is blocked while the first submit is pending
PASS actual post persistence failure leaves editor and typed input available for retry
PASS actual post editing cannot generate a second record or move guide progress
PASS actual invalid event title and reversed range each preserve the calendar guide step
PASS actual event creation keeps the entered range and advances to task without a fake partner
PASS actual event save failure rolls back event and retains calendar guide step
PASS unconnected event creation rejects fabricated together or partner participants
PASS actual empty task or invalid date cannot complete the task guide
PASS actual task save keeps text date and own author then advances to invitation guide
PASS actual task storage failure preserves the task guide and creates no item
PASS unconnected task creation cannot assign a non-existent partner or couple
PASS skipping every guide step writes no sample content and ends with usable empty app
PASS step skip preserves guide start time and existing real user records
PASS step skip honors dirty-sheet refusal and storage failure without advancing
PASS pause and resume preserve actual records step and start time
PASS pause and resume each redraw the actual account status immediately
PASS reload of deliberately paused guide does not reopen first-setup invitation
PASS full guide skip retains user records and never claims connection complete
PASS replaying service introduction never collects own profile again or clears data
PASS closing replay preserves existing records without creating a new account
PASS fresh paused account opens invitation before the real guide begins
PASS incoming invitation keeps setup guide actions for new users and normal close for returning users
PASS actual incoming invitation close removes the name fragment and does not reopen on reload
PASS clearing invitation fragment preserves unrelated page hashes
PASS history access failure while closing preview does not corrupt existing app state
PASS storage recovery prevents invitation and tutorial boot over unreadable saved data
PASS already completed tutorial boot only refreshes current app without resetting it
PASS actual boot initializes fresh users without saving invented seed records
PASS actual boot keeps existing real records and bypasses first-run profile collection
PASS delivered onboarding removes synthetic photo and demo-action runtime entirely
PASS contextual guide highlights actual header creation buttons without auto-filling user content
PASS creation guide appears only for a new form and stays out of existing record edits
PASS new preview storage is separated from canonical users and earlier previews
{"target":"versions/v20/index.html","sha256":"5620d72d7c01c80720d6a9fcf26fc1af352033cbbcb7849c73db3172e0761e5a","passed":74,"failed":0,"report":"outputs/QA-v20-사용안내.txt"}

[test-v20-regression.cjs]
test-v17-calendar.cjs: 32 passed, exit 0
test-v17-tasks.cjs: 28 passed, exit 0
test-v17-confirm.cjs: 14 passed, exit 0
test-coherence-logic.cjs: 33 passed, exit 0
test-deadlines.cjs: 27 passed, exit 0
test-release-logic.cjs: 43 passed, exit 0
test-v10-storage.cjs: 21 passed, exit 0
test-profile-dates.cjs: 25 passed, exit 0
test-v19-title-migration.cjs: 5 passed, exit 0
{"target":"versions/v20/index.html","hash":"5620d72d7c01c80720d6a9fcf26fc1af352033cbbcb7849c73db3172e0761e5a","passed":228,"failures":[],"report":"outputs/QA-v20-회귀.txt"}

[test-v20-connection.cjs]
PASS connection source and all patched inline scripts parse
PASS fresh profile is unconnected
PASS fresh only exposes own member
PASS fresh filters omit partner and together
PASS fresh notification list is empty without changing source
PASS fresh top toolbar renders only own face with working dropdown action
PASS fresh picker contains only all and own author
PASS fresh participant and task selection become own hidden values
PASS fresh paired photos cannot show a fake partner
PASS fresh writes do not generate partner notification
PASS legacy compatibility retains original two people
PASS explicit unconnected state cannot enter legacy compatibility
PASS outgoing preview does not change state
PASS preview link contains only version name nonce
PASS preview link contains no avatar or records
PASS recipient name is received separately from own name
PASS invitation decoding preserves Korean
PASS incoming display escapes its name
PASS rejects unsupported version
PASS rejects extra avatar
PASS rejects empty name
PASS rejects long name
PASS rejects control character
PASS rejects wrong nonce
PASS rejects array
PASS malformed base64 is rejected
PASS very large hash is rejected
PASS unrelated hash is ignored
PASS ordinary invitation has copy and share buttons
PASS setup invitation hands off to real tutorial APIs
PASS incoming invitation does not offer fake accept
PASS partner filters and profile switches are guarded in patched app
PASS unconnected writes cannot choose fake shared post participant event or task
PASS copy writes only safe preview URL
PASS blocked clipboard offers selectable link without false success
PASS share is explicitly labelled as non-connected preview
PASS outgoing invitation never creates a connected marker

37 passed, 0 failed
```

## QA-v20-화면검수.txt

```text
dump v20 실제 브라우저 검수
검수일: 2026-10-09 (Asia/Seoul)
대상 SHA256: 5620D72D7C01C80720D6A9FCF26FC1AF352033CBBCB7849C73DB3172E0761E5A

검수 환경
- 최종 체험 HTML만 제공하는 읽기 전용 로컬 서버(127.0.0.1:8880).
- 127.0.0.1과 localhost의 별도 저장소로 발신자와 수신자 진입 흐름을 검수.
- 기존 파일 실행 및 공개 웹 주소의 사용자 데이터를 변경하지 않음.
- 390×844, 320×640, 320×420 브라우저 viewport 검수.

확인한 흐름
- 서비스 설명 한 장에서 덤프/일정/할 일 용도를 표시. 소개용 사진·가상 게시글·가상 댓글 없음.
- 본인 이름 없이 다음을 누르면 진행 차단. 본인 이름 입력 후 프로필 설정 완료.
- 상대 이름 입력 필드 없음. 초기 피드/일정/할 일은 빈 상태.
- 초대 화면에서 링크 복사 성공 안내 확인. 링크에는 이름과 미리보기 정보만 포함.
- 복사한 링크를 별도 저장소에서 열어 보낸 사람 이름 표시. 받은 사람은 자신의 이름만 설정.
- 수신자 프로필 완료 후 초대 미리보기 안내, 실제 연결·기록 공유 미제공 문구 확인.
- 수신자 재접속 시 설정 완료 뒤의 사용법/바로 시작 버튼 유지.
- 초대 미리보기 닫기/바로 시작 후 이름 fragment가 URL에서 제거되고, 재접속 시 초대창 반복 노출 없음.
- 상대 프로필 생성·연결 완료·가짜 상대 알림 없음. 미연결 필터에는 본인 얼굴만 표시.
- 실제 덤프 작성창에서 내용 미입력 게시 차단, 닫기 후 안내 1단계 유지.
- 실제 입력한 덤프 게시 성공 후 피드에 표시, 안내 2단계(일정 탭)로 진행.
- 실제 일정 제목 입력·등록 성공 후 달력에 1개 일정 반영, 안내 3단계로 진행.
- 실제 할 일과 목표일(10월 13일) 입력·저장 성공, 안내 4단계로 진행.
- 마이의 상대 초대 메뉴와 초대 화면으로 연결. 안내 마치기 후 재접속해도 작성한 덤프 보존.
- 안내 재시작과 단계 건너뛰기가 기존 덤프·일정을 삭제하거나 새 기록을 만들지 않음.
- 중간 안내 종료 후 재접속, 마이의 사용법 이어보기에서 이전 2단계로 복귀.
- 덤프 작성/일정 등록/할 일 추가 실제 + 버튼의 강조, 이동 전 일정 탭 강조를 DOM과 화면에서 확인.

배치·폰트
- 390×844 빈 피드에서 가로 넘침 없음. 안내 글꼴 DumpSans 사용.
- 320×640 서비스 소개 본문의 client/scroll 높이 모두 483px. 시작 버튼 하단 596.5px로 화면 안 유지.
- 초대 이름 안내를 추가한 320×640 화면은 본문만 스크롤하고 시작 버튼 유지.
- 320×640 작성창 게시 버튼 하단 628px, 입력 글꼴 DumpSans, 안내 본문 13px 확인.
- 320×420 작성창 게시 버튼 하단 408px, 본문 client287/scroll493px, 가로 넘침 없음.
- 임시 viewport override는 검수 뒤 해제.

검수 중 수정·재확인
- 안내 시작 시각 보존과 중단/이어보기 상태 표시를 수정해 재접속이 가입 직후 초대창으로 돌아가지 않도록 처리.
- 초대 미리보기 닫기 후 URL fragment 제거로 재접속 반복 표시 수정.
- 수신 초대에서 프로필 완료 직후 새로고침해도 사용법/바로 시작 버튼 유지.
- 안내의 + 버튼 선택자가 실제 헤더 버튼과 달랐던 문제를 실제 aria-label 기준으로 수정. 강조 표시 재확인.
- 기존 기록 수정창에 신규 등록 안내를 붙이지 않도록 정리.
- 초대 화면에서 같은 제한 설명이 반복되지 않게 안내 문구 축소, 본문 폰트 공통 크기로 정리.

검수 한계
- 실제 iOS/Android 기기, 서버 인증·두 기기 연결·동기화·푸시는 검수 대상이 아님.
- 사용자가 서버 없음/초대 화면과 연결 준비 우선 범위를 선택했으며 실제 연결 완료를 가장하지 않음.
- 프로필 사진 비동기 처리·저장 실패·충돌·백업 및 기존 기능은 별도 코드 검사 보고서 참조.
- QA 입력 데이터는 로컬 테스트 저장소에만 존재하고 HTML/GitHub에는 포함되지 않음.

화면 증거
- outputs/preview-v20-intro.jpg: 실제 서비스 소개 화면.
- outputs/preview-v20-guide.jpg: 실제 빈 덤프 피드와 + 버튼 안내.
```

## 원격 반영 범위

HTML·MD·현재 구현 소스와 준비용 빈 설정만 반영합니다. 개인 localStorage 기록, QA 중 입력한 이름·게시글·사진 및 화면 스크린샷은 업로드하지 않습니다. `versions/v17`·`v18`·`v19`, 이전 QA 문서와 기존 `next-app` 코드는 보존합니다. 서버 초대 준비 계약은 [별도 문서](INVITATION_BACKEND.md)를 따릅니다.
