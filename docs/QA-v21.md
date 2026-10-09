# dump v21 — 모음·여행 계획 검수

기준일: 2026-10-09. `index.html`, `dump-final.html`, `versions/v21/index.html`은 같은 최종 HTML입니다. 체험 HTML은 기존 v20 체험 저장 키를 유지합니다.

최종 HTML SHA256: `ef854483724a07c16186344cd72da6ce542647d7c59bc0a994bc0b49be8e4e38`

코드 검사는 새 모음·여행 68개와 현재 HTML에 대한 기존 앱 회귀 339개, 모두 실패 0개입니다. 서버 준비 정적 검사 52개는 별도 범위이며 실제 DB 실행·기기 연결 검사로 합산하지 않습니다. 실제 실행 환경과 제한은 아래 원문 보고서를 따릅니다.

## 두 차례 검토와 수정

- 1차: 구조·동선·연결 데이터 검토 → 모음 안 수정 후 복귀, 대표 일정 재지정 방지·기간 동기화, 대표 일정 백업 검증, 할 일에서 달력 추가 시 모음 승계 보완.
- 2차: 실제 입력·페이지 이동·사진·여행/장소 흐름과 기존 기능 회귀 → https URL 정규화 후 길이 제한, 모음 선택 변경·해제 후 복귀, 날짜 스크롤·항목 선택 초점 유지 보완.

보존된 v20을 기준으로 source/v21 패키지에서 직접 재빌드하여 최종 HTML SHA256과 일치를 확인했습니다.

독립 2차 감사에서 추가 10개 확인을 통과했으며 중대한 문제는 없었습니다. 기존 검사와 겹치는 범위이므로 최종 코드 검사 합계는 407개로 유지합니다.

## QA-v21-기능.txt

```text
dump v21 모음·여행 기능 QA
대상: versions/v21/index.html
SHA256: ef854483724a07c16186344cd72da6ce542647d7c59bc0a994bc0b49be8e4e38
실행(UTC): 2026-10-09T13:18:37.928Z
결과: 68개 통과, 0개 실패

검사 범위
- 실제 산출 HTML의 v21 모음·여행 함수 및 원본 저장·백업·검증·정규화 함수를 VM에서 실행한다.
- 빈 계정, 기존 v20 데이터 이전, 백업 유효성, 모음 생성·수정·삭제와 원본 보존을 확인한다.
- 여행 기간 1~31일·윤년·연말·범위 오류, 장소 생성·수정·삭제·순서·경계·제한을 확인한다.
- 기존 항목 가져오기·연결 해제, 실제 게시·일정·할 일의 연결 저장, 기간 동기화·삭제 후 복구를 확인한다.
- 저장 공간 부족·다른 탭의 변경에서 원본과 관련 상태가 함께 롤백되는지 확인한다.

한계
- 저장과 상태를 검증하기 위한 격리 VM의 모의 DOM·저장소 검사이며 실제 화면 배치·키보드·터치 검수를 대체하지 않는다.
- 모음과 여행 계획은 로컬 기능이다. 실제 상대 계정 연결·공동 편집·기기 동기화를 검사하지 않는다.

PASS v21 fresh user starts with no collections and no sample items
PASS v21 v20 data without collection fields migrates to an empty collection list
PASS v21 collection and trip state survive real backup validation and serialization
PASS v21 backup rejects duplicate collection ids malformed list and excess collections
PASS v21 backup rejects empty or overlong collection names unknown kinds and invalid authors
PASS v21 backup rejects duplicate stop ids impossible dates and dates outside trip
PASS v21 backup rejects stops on ordinary collections and a trip with over 300 stops
PASS v21 backup rejects unsafe stop links while retaining HTTPS raster-independent records
PASS v21 backup rejects dangling collection links on posts events and tasks
PASS v21 backup without collection list cannot smuggle dangling collection references
PASS v21 backup rejects two trips pointing at the same representative calendar event
PASS v21 backup rejects representative event pointers that are missing or linked elsewhere
PASS v21 day ranges include one day and exactly 31 days but reject 32
PASS v21 day range handles leap days month boundaries and year boundaries
PASS v21 day range rejects reversed malformed impossible and pre-1900 dates
PASS v21 creating an ordinary collection leaves original posts events and tasks untouched
PASS v21 collection edit preserves id author creation time stop references and linked content
PASS v21 invalid blank overlong title or excessive note cannot create a collection
PASS v21 collection creation limit allows 200 existing edits but blocks the 201st
PASS v21 deleted collection draft cannot silently create replacement content
PASS v21 collection quota failure rolls back collection and linked trip event together
PASS v21 external storage update prevents collection creation and preserves outside data
PASS v21 collection deletion detaches all item types but preserves their original contents
PASS v21 collection delete confirmation cancellation preserves all original links
PASS v21 collection delete storage failure restores collection and every original link
PASS v21 trip creation adds one linked period event with own participant and no fake notification
PASS v21 same-day trip uses one day and a null event end date
PASS v21 invalid trip ranges create neither collection nor event
PASS v21 trip edit updates the existing period event rather than duplicating it
PASS v21 trip edit refuses a shorter range that would strand an existing stop
PASS v21 event capacity prevents trip creation without an orphan collection
PASS v21 stop create and edit retain one id and the entered visit date link and note
PASS v21 stop requires a title valid trip date safe link and bounded note
PASS v21 stop limit blocks the 301st entry while allowing edits at capacity
PASS v21 stale stop draft cannot resurrect a deleted stop or collection
PASS v21 stop save quota and external conflict preserve all old stops and user input
PASS v21 stop reorder swaps only same-day neighbors and leaves another day in place
PASS v21 first last unknown stop and invalid deltas are reorder no-ops
PASS v21 stop reorder storage failure rolls back the complete ordering
PASS v21 stop deletion cancellation keeps it while confirmation removes only that stop
PASS v21 stop delete save failure restores the deleted place
PASS v21 HTTPS link normalization rejects credentials scripts HTTP and malformed input
PASS v21 Unicode link expansion cannot save a URL that breaks next-load backup validation
PASS v21 trip stop HTML escapes titles notes and fallback map queries
PASS v21 linking and unlinking a post keeps its original text comments media and id
PASS v21 linking and unlinking events and tasks preserve original owner date and content
PASS v21 an item cannot be silently moved out of another collection by link toggle
PASS v21 private hidden and automatic trip events cannot be imported into another collection
PASS v21 link save quota failure restores the original unlinked record
PASS v21 photos derive only from linked dumps and include every image in original order
PASS v21 new linked dump saves through actual composer and returns to its collection
PASS v21 new linked task saves through actual task form with original author and due date
PASS v21 new linked event saves through actual schedule form without duplicating collection
PASS v21 changing the selected collection during creation returns each saved item to its actual target
PASS v21 clearing the selected collection during creation removes the stale collection view
PASS v21 actual task to schedule form inherits its collection and preserves the source task
PASS v21 deleted selected collection blocks every actual item save instead of dropping the link
PASS v21 actual linked item save quota failure retains the draft collection context and editor
PASS v21 editing the linked trip event date synchronizes the collection range atomically
PASS v21 representative trip event cannot detach or move into another collection through form input
PASS v21 representative calendar title edit keeps trip title synchronized
PASS v21 representative calendar name cannot exceed the collection title limit
PASS v21 linked event edit cannot create a range beyond 31 days or strand a trip stop
PASS v21 linked trip date edit quota failure rolls both event and collection dates back
PASS v21 deleting trip collection preserves its calendar event and detaches its collection id
PASS v21 deleting linked event clears only trip event pointer and keeps its stops
PASS v21 calendar action reuses existing trip event and recreates only a missing one
PASS v21 deleting original post and task does not delete their collection or unrelated items
```

## QA-v21-기존-전체.txt

```text
dump v21 최종 코드 QA
대상: versions/v21/index.html
SHA256: ef854483724a07c16186344cd72da6ce542647d7c59bc0a994bc0b49be8e4e38
실행(UTC): 2026-10-09T13:17:26.932Z
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

[test-v21-legacy-guided.cjs]
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
{"target":"versions/v21/index.html","sha256":"ef854483724a07c16186344cd72da6ce542647d7c59bc0a994bc0b49be8e4e38","passed":74,"failed":0,"report":"outputs/QA-v21-기존-사용안내.txt"}

[test-v21-legacy-regression.cjs]
test-v17-calendar.cjs: 32 passed, exit 0
test-v17-tasks.cjs: 28 passed, exit 0
test-v17-confirm.cjs: 14 passed, exit 0
test-coherence-logic.cjs: 33 passed, exit 0
test-deadlines.cjs: 27 passed, exit 0
test-release-logic.cjs: 43 passed, exit 0
test-v10-storage.cjs: 21 passed, exit 0
test-profile-dates.cjs: 25 passed, exit 0
test-v19-title-migration.cjs: 5 passed, exit 0
{"target":"versions/v21/index.html","hash":"ef854483724a07c16186344cd72da6ce542647d7c59bc0a994bc0b49be8e4e38","passed":228,"failures":[],"report":"outputs/QA-v21-기존-회귀.txt"}

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

## QA-v21-화면검수.txt

```text
dump v21 화면 검수
기준일: 2026-10-09
HTML SHA256: ef854483724a07c16186344cd72da6ce542647d7c59bc0a994bc0b49be8e4e38

1차: 구조·동선·데이터 독립 검토 후 수정
- 모음 안 기존 덤프/일정/할 일 수정 후 같은 모음으로 복귀.
- 여행 대표 일정의 다른 모음 재지정 방지, 제목/기간 양방향 동기화.
- 여행 대표 일정 중복 참조·누락·모음 연결 불일치 백업 거부.
- 할 일에서 달력 추가 시 원본 모음 승계 및 상세 복귀.

2차: 수정본 실제 UI 및 기능 회귀 확인
- Codex in-app browser의 독립 localhost QA 주소에서 직접 내 프로필 설정, 빈 피드 진입, 모음 생성, 3일 여행 저장.
- 장소 링크 오류 안내/입력 유지, 장소 두 개 추가, 위/아래 순서 변경, 날짜별 계획 확인.
- 모음 안 할 일 생성/기존 수정/할 일에서 일정 연결 후 모음 복귀 확인.
- 실제 파일 선택으로 공개 로고 검수용 이미지 한 장 추가, 덤프 게시, 사진 모아보기, 사진 상세→원본 본문과 댓글 연결 확인.
- 저장 후 페이지 재접속에서 여행·장소·순서 유지 확인.
- 1280×720 PC: 기존 앱 폭/헤더/하단 4탭과 여행 상세 확인.
- 390×844 모바일: 여행 상세/장소/할 일/덤프/사진/댓글/작성 폼 확인. document.scrollWidth=clientWidth=390.
- 320×700 모바일: 여행 상세/장소 폼 확인. document.scrollWidth=clientWidth=320.
- 실제 댓글 입력은 DumpSans 14px, 장소 폼 입력·메모도 DumpSans 14px. 반응 이모지 버튼은 별도 21px 아이콘 크기이며 글꼴 이름은 동일.
- 한글 URL 정규화 후 길이 제한 보완, 모음 선택 변경·해제 후 화면 복귀, 날짜 가로 스크롤·기존 항목 연결 초점 보존을 코드 검사로 확인.

자동 기능 검사(별도 보고서)
- 새 모음/여행 기능: 68개 통과, 실패 0개.
- 기존 앱 회귀/본인 프로필/사용 안내/초대 미리보기: 339개 통과, 실패 0개.
- 서버 준비 정적 검사는 52개 통과. 이는 DB 실행 또는 실제 계정 연결 결과가 아니다.

범위와 한계
- 실제 Android/iOS 기기·가상 키보드·스크린리더·두 기기 동시 편집은 미실행.
- 현재 저장은 브라우저 localStorage. 실제 서버 인증·초대 수락·동기화·실시간 톡·푸시는 미구현.
- 모음은 최대 200개, 여행은 최대 31일/300장소. 기존 항목 선택은 검색 후 최대 100개씩 표시한다.
- QA 입력 데이터는 localhost 테스트 브라우저에만 존재하며 전달 HTML/GitHub에 포함하지 않는다.
- 테스트 스크린샷 preview-v21-trip.jpg는 QA 예시이며 신규 사용자의 기본 데이터가 아니다.
```

## 서버 준비 자료

[서버 준비 문서](../source/v21/backend/README.md)와 validation-result.json의 정적 52개 검사를 별도로 보존합니다. SQL 검토안은 자동 migration 경로 밖에 있으며 실행하거나 운영 DB에 적용하지 않았습니다. 실제 계정 연결·공동 편집·실시간 대화·동기화·푸시는 제공하지 않습니다.

## 원격 반영 범위

HTML·최신 MD·v21 구현·검사 및 backend 준비 사본만 반영합니다. 기존 v17~v20 HTML·소스·QA와 next-app 원본은 보존합니다. 개인 localStorage 기록, QA 중 등록한 덤프·여행·할 일·프로필 사진과 화면 캡처는 업로드하지 않습니다.
