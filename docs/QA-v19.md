# dump v19 — 제품 화면 중심 소개와 첫 진입 검수

기준일: 2026-10-09. `index.html`과 `versions/v19/index.html`은 전달용 `dump-final.html`과 같은 파일입니다. 별도 체험 `dump-onboarding-preview.html`은 v19 전용 저장 키를 사용합니다.

최종 로컬 검수 기록을 아래에 분리해 적었습니다. 코드 검사 통과 수는 자동 코드 검수 보고서의 실제 결과를 따릅니다. 실제 휴대전화·서버 로그인·상대 기기 동기화·푸시가 검증됐다는 의미가 아닙니다. 사진 파일 선택과 업로드 완료의 실제 확인 여부는 브라우저 보고서에 기록된 범위를 따릅니다.

## 실제 브라우저 검수

Retro·BeReal·Howbout 레퍼런스 방향을 참고한 제품 화면 중심 소개입니다. 소개 사진은 `imagegen` 스킬로 제작한 예시 JPEG(약 216KB)를 HTML data URI로 내장했으며, 소개의 글꼴·로고·사진은 외부 다운로드 없이 표시합니다. 이 자산은 사용자의 개인 사진이 아닙니다. 검수 중 작성한 이름·게시글·프로필 사진은 별도 브라우저 QA 저장소에서만 사용하고 원격 파일에는 포함하지 않습니다.

```text
dump v19 온보딩 화면 및 첫 진입 검수
검수일: 2026-10-09

실제 브라우저 확인
- 새 저장소에서 첫 실행 시 3장 소개 → 내 프로필 → 둘의 정보 순서로 이동.
- 첫 화면의 JPEG 사진 로드 완료, 원본 폭 800px 확인. 글꼴 DumpSans 사용.
- 소개 좋아요·저장·댓글을 눌러 예시 반응 확인. 정보 입력 완료 후 실제 저장한 덤프·댓글·알림은 0개.
- 일정 예시의 같이하기/취소 동작, 프로필 겹침과 별도 두 색 막대 확인.
- 같이하기 전후 제목 위치 x=80px, 폭=210px 유지(390px 화면).
- 할 일 예시 체크 시 완료 항목이 아래로 이동.
- 빈 이름 제출 차단, 이름 입력 후 다음 단계 진입, 뒤로 이동 후 두 이름 유지.
- 프로필 사진 파일 선택 → 실제 압축 후 미리보기 반영 → 선택 해제 확인.
- 날짜 선택, 오늘 이후 비활성화, 날짜 선택 해제 확인.
- 320×640에서 가로 넘침 없음. 입력 14px, 라벨 13px, 글꼴 DumpSans.
- 320×640 소개 첫 장은 본문 client/scroll 모두510px로 불필요한 스크롤 없음, 다음 버튼 하단624px, 아이콘 버튼40×44px 확인.
- 320×420에서 본문만 스크롤(client262px/scroll295px), 시작 버튼 하단375.5px로 화면 안 유지.
- 설정 완료 후 빈 덤프 화면 진입. 사진·글·댓글·저장한 덤프 없음.
- 일정 31일 모두 0개, 할 일 없음, 마이 내 덤프 0/저장한 덤프 0 확인.
- 새로고침 후 입력한 두 이름 유지, 소개 자동 재등장 및 예시 데이터 부활 없음.
- 첫 텍스트 덤프 실제 게시 성공, 마이에서 소개 다시 보기 진입·닫기 및 재로드 후 작성한 글 보존.

화면 검수 중 수정 후 재확인
- 원본 로고의 가로세로 비율을 유지하도록 높이 auto 적용하여 잘림 수정.
- 낮은 데스크톱/모바일 화면에서 소개 첫 장의 글자·사진·간격을 줄여 불필요한 스크롤 조정.
- 소개 피드 아이콘의 터치 높이 44px 확보.
- 데모 반응을 눌러도 전체 사진과 화면 진입 애니메이션이 반복되지 않도록 조정.

검수 범위
- 별도 127.0.0.1:8879 저장소에서 수행. 기존 사용자 파일/웹 주소의 저장 기록은 변경하지 않음.
- 실제 데스크톱 브라우저와 모바일 크기 viewport 검수. 실제 iOS/Android 기기, 기기 간 동기화, 실제 로그인/푸시 검수는 포함하지 않음.
- 자동 코드 검사 결과 및 전체 검사명은 QA-v19-온보딩.txt 참조.
- 소개 사진은 제작한 예시 자산이며 실제 게시물/프로필에 자동 추가되지 않음.
```

## 자동 코드 검수

```text
dump v19 온보딩 코드 QA
최종 실행 시각(UTC): 2026-10-09T06:23:50.737Z
대상: outputs/index0922testv19.html
SHA256: 449382a0a3434dfaa787bb82b18ec98e3e9592d790f623c5cfc53a5afad76741
최신본 dump-final.html SHA256: 449382a0a3434dfaa787bb82b18ec98e3e9592d790f623c5cfc53a5afad76741

결과: 308개 고유 검사 통과, 0개 실패 항목
- 새 온보딩 흐름: 56개
- 빈 계정 상태 및 입력 검증: 24개
- 기존 기능 회귀: 228개

검사 범위
- v19 실제 산출 HTML에서 함수와 상태 스키마를 추출하여 실행한다.
- 3장 소개(덤프·일정·할 일) → 2장 설정(내 이름·사진, 상대 이름·커플 날짜) → 빈 덤프 진입.
- 이름 필수, 상대 이름·사진·관계 날짜 선택, 넘기기·뒤로가기·오류 수정·초안 유지.
- 튜토리얼 예시는 저장하지 않으며, 새 계정에 샘플 덤프·일정·할 일·알림을 삽입하지 않는다.
- 기존 데이터 보존, 다른 창의 저장 계정 감지, 저장 실패 롤백, 중복 제출, 저장 후 렌더 오류 상태 일관성.
- 재소개는 개인정보를 재수집하지 않고 기존 계정을 보존한다.
- 사진 비동기 stale callback/중복 처리, 날짜 경계와 키보드 모달 처리, 프리뷰 저장 키 분리.
- 기존 캘린더·같이하기/취소·D-day·할 일 분류·편집·연결·댓글·프로필·백업·저장 회귀.

검사 한계
- VM과 모의 DOM·저장소에서 실제 앱 함수를 실행한 코드 QA이다.
- 날짜 검사는 재현성을 위해 2026-10-08을 기준일로 고정한다. 실제 앱은 실행 시점의 오늘 날짜를 사용한다.
- 실제 브라우저의 배치·모션·폰트·터치·오버플로 확인은 별도 UI 검수에 따른다.
- 실제 모바일 기기 파일 선택기, 서버 로그인·동기화·푸시 및 서버 트랜잭션 보장은 포함하지 않는다.

[test-v19-onboarding-flow.cjs] 56개 통과
PASS tutorial interactions do not write app state or browser storage
PASS example heart toggles accessibly and reversibly without liking a real dump
PASS example bookmark is session-only and does not create real saved dump data
PASS unknown tutorial action cannot accidentally complete a task or mutate the session
PASS first introduction photograph is embedded with descriptive alt text and reserved dimensions
PASS actual renderer exposes exactly three introductions followed by own and couple setup screens
PASS skip introduction always enters required own-name setup rather than empty account
PASS introduction advances in order and reaches own information after task tutorial
PASS empty own name blocks setup progression and focuses the field
PASS back preserves entered names photo and dates without persistent writes
PASS returning to own setup does not trap invalid optional dates away from their editing screen
PASS changing a text field clears the previous error and retains the draft
PASS fresh completion commits one empty account and resets the app to the whole dump feed
PASS a second completion click cannot create or save a second account
PASS pending submission blocks duplicate submit and back/skip changes
PASS photo preparation blocks leaving or submitting the information screen
PASS invalid final relationship dates never replace state or persist personal information
PASS existing persistent account prevents destructive new-account completion
PASS another tab creating an account while the introduction is open is preserved
PASS an already-read stored account blocks completion even if storage was removed meanwhile
PASS storage recovery issue blocks onboarding from overwriting unreadable data
PASS quota failure keeps draft and old state and enables retry
PASS storage read denial leaves draft state and completion controls usable
PASS device-viewer storage failure does not discard the successfully saved account
PASS a UI exception after a successful save never restores contradictory in-memory account data
PASS replaying the introduction does not enter personal setup or replace stored profiles
PASS replay skip only closes and preserves all account data
PASS direct finish call while replaying cannot persist a new state
PASS introduction start isolates app controls and prevents duplicate overlays
PASS closing introduction restores navigation and focuses usable app content
PASS Escape closes replay but cannot bypass new-user information collection
PASS date selection rejects invalid future values without closing or modifying the draft
PASS date selection accepts today and returns focus to the initiating date field
PASS optional date can be explicitly cleared without substituting sample dates
PASS Escape closes date dialog first and restores inert tutorial controls
PASS date dialog Tab and Shift-Tab cycle within enabled buttons
PASS date picker marks future days disabled with explicit dialog and date labels
PASS month arrows reach January 1900 and reject earlier boundary months
PASS month and year choices cannot navigate beyond supported past-date boundaries
PASS old device-viewer setting cannot move a newly onboarded account to the counterpart
PASS legacy sample accounts retain their selected device-viewer setting
PASS existing newly onboarded account retains its stored viewer on reload
PASS profile input markup supplies required name and keyboard activation for optional photo
PASS profile text is escaped when rerendered and cannot become markup
PASS schedule tutorial join changes two faces and an independent partner bar reversibly
PASS completed task tutorial moves finished item after ongoing work without persisting examples
PASS selected photo async result updates only the current draft
PASS stale photo callback cannot mutate a replacement onboarding session
PASS photo conversion failure keeps the draft usable and reports its error
PASS a concurrent photo selection cannot start a second conversion
PASS actual first boot opens introduction over an empty temporary account without saving examples
PASS actual boot with an existing account keeps its posts and never reopens first setup
PASS actual boot with unreadable saved data shows recovery and cannot create a replacement account
PASS a newly completed empty account stays empty after serialized reload and boot
PASS isolated preview uses separate state and viewer keys and cannot overwrite canonical data
PASS empty dump state offers real composition rather than seeded samples
Onboarding v19 flow: 56 passed, 0 failed

[test-v18-onboarding-state.cjs] 24개 통과
PASS a new account starts with no posts events notifications markers or finance data
PASS todo keeps only a usable empty category and no seeded tasks
PASS input names map to stable internal person IDs without changing ownership identifiers
PASS blank or omitted partner name uses a neutral counterpart label
PASS unprovided photos do not retain example portraits or a cover
PASS uploaded own avatar is retained and does not copy to the counterpart
PASS unprovided relationship dates and mood do not invent personal facts
PASS initial view and selected calendar month use runtime today
PASS empty account sets both legacy seed flags to prevent automatic reinsertion
PASS factory never alters actual default seed data or its nested objects
PASS factory calls return independent state without sharing arrays or profile references
PASS state passes real backup validation and normalization without reviving samples
PASS blank optional dates normalize to null and today is allowed
PASS name values are trimmed before storage
PASS missing blank numeric overlong and multiline personal names are rejected
PASS numeric overlong or multiline partner labels are rejected
PASS twenty-character names remain valid under current profile limits
PASS factory does not interpret user-supplied names as HTML or rename identity keys
PASS profile info arrays primitive values and missing objects are rejected
PASS invalid impossible and future relationship dates are rejected
PASS first meeting cannot be later than dating start while equal dates are allowed
PASS arbitrary URLs SVG script content wrong types and excessive avatars are rejected
PASS permitted raster data URLs survive exact roundtrip
PASS helpers validate and construct data without reading or writing browser storage
Onboarding state: 24 passed, 0 failed

[test-v17-calendar.cjs] 32개 통과
PASS empty month still reserves exactly three rows in every real date
PASS February month grid respects leap and ordinary calendar lengths
PASS single-day event has both start and end in one occupied row
PASS October 8 to 11 stays continuous through Saturday and Sunday
PASS neighbor ending midweek never moves an ongoing period to another row
PASS carryover keeps its previous-week row while a new event reuses a free row
PASS nonoverlapping events in same week can reuse a row with independent caps
PASS period clipping at month edges preserves continuation semantics
PASS year-crossing interval includes the correct dates in both months
PASS same-start periods prioritize long spans then registration time
PASS cancelled invalid-date and outside-month events never occupy period rows
PASS actual solo participant determines its independent single color
PASS together event consumes two independent person rows in creator-first order
PASS four simultaneous personal events show three rows and one hidden bar
PASS author filters remain registration-based and together filter follows participation
PASS private partner schedule is absent from both bars and agenda
PASS busy-only schedule exposes the allowed placeholder without leaking raw title
PASS creator remains able to see and edit own private schedule after assigning partner
PASS own busy-only schedule keeps its full title and edit access after assigning partner
PASS calendar date cells contain no avatar image or nested button creation target
PASS partner solo schedule exposes join action beside title and no duplicate personal footer
PASS already together schedule exposes cancellation beside title and only paired photos indicate participation
PASS own personal and cancelled schedules do not offer invalid join or cancellation actions
PASS editing participants preserves original author filter while updating actual participant bar color
PASS together overflow counts hidden person bars separately from actual event total
PASS continuing together schedule preserves each person row across week boundary
PASS calendar removes color legend and visible long-press instruction
PASS compact card title opens detail and excludes inline dates name labels place and memo
PASS detail popup displays full date range place memo author and permitted edit action
PASS busy-only detail keeps raw title location memo and edit action hidden
PASS hidden private partner schedule cannot open a detail popup
PASS paired compact photos put original creator first when both participate
{"file":"outputs/index0922testv19.html","passed":32,"failed":0}

[test-v17-tasks.cjs] 28개 통과
PASS list card is a single row retaining completion detail and menu actions
PASS list shows original author title countdown and short date in order
PASS list and detail remove duplicate remaining-day text
PASS short target date retains full year month weekday for accessibility
PASS today and overdue labels stay compact and explicit
PASS completed and undated list rows do not show countdown badges
PASS long and unsafe titles remain full escaped text for detail access
PASS detail metadata displays a custom category without adding it to the list
PASS new custom category uses compatible legacy group and persists its label
PASS editing custom category preserves original author subitems and linked schedule
PASS switching back to a built-in category clears the old custom label
PASS custom label is trimmed and a 24-character label can be saved
PASS invalid empty custom label leaves state and persisted data intact
PASS invalid whitespace custom label leaves state and persisted data intact
PASS invalid too long custom label leaves state and persisted data intact
PASS storage failure rolls back the category and all other edited fields
PASS editing completed task keeps its completion state and opens the completed filter
PASS saved custom category survives actual backup validation and reload
PASS legacy backups without the extra category field remain accepted
PASS backup rejects invalid custom category types lengths and empty labels
PASS explicit null custom category remains valid for built-in classifications
PASS edit form keeps author fixed and uses the requested field order
PASS custom category is selected and editable when reopening a stored task
PASS new tasks keep the existing together default and current author
PASS deleted task does not open an accidental new task form
PASS note autosizing clamps content and restores compact height after clearing
PASS unknown legacy author is not falsely replaced with current profile
PASS custom category selector reveals and hides its input without losing draft text
{"file":"outputs/index0922testv19.html","passed":28,"failed":0}

[test-v17-confirm.cjs] 14개 통과
PASS all final inline scripts compile
PASS confirmation type scale and embedded font are explicit
PASS default focus is non-destructive with proper alert dialog semantics
PASS escape dismisses without confirmation and tab remains trapped
PASS duplicate requests do not stack or share destructive approval
PASS confirmation settles only once
PASS real dirty close keeps draft with continue writing
PASS real dirty close discards only after explicit close
PASS repeated X clicks produce one confirmation and one cleanup
PASS forced close cancels pending confirmation and avoids repeated cleanup
PASS stale approval cannot close a newly replaced sheet
PASS clean close and posting guards retain behavior
PASS all destructive callers retain conditional await and appropriate labels
PASS initialization, storage and mutation logic unchanged
14 checks passed

[test-coherence-logic.cjs] 33개 통과
PASS valid explicit creation date takes precedence over ID
PASS generated microsecond ID recovers creation milliseconds
PASS legacy millisecond ID retains its actual creation date
PASS invalid creation date falls back to legacy millisecond ID
PASS small or negative sample IDs never outrank real generated schedules
PASS new same-day schedule renders before old samples
PASS new legacy schedule renders before earlier explicit-date schedule
PASS multi-day schedule is ordered by registration, not start date
PASS creator determines first color of paired bar regardless of participant array order
PASS equal date ranges use registration order without mutating source events
PASS solo schedule assigned to partner shows its actual participant color
PASS together participation occupies two independent rows and remains one event
PASS two together registrations show three person rows and one overflow without day avatars
PASS single optional date works without an end-date field
PASS moving range start after end clamps end to new start
PASS moving range start earlier preserves chosen end
PASS optional task date clears value and updates displayed label
PASS mandatory schedule start date cannot be cleared
PASS custom date field preserves both minimum and maximum constraints
PASS out-of-range date cannot overwrite existing selection or close picker
PASS minimum and maximum date boundaries are both selectable
PASS invalid actual date cannot be committed through date picker
PASS calendar exposes disabled state before user presses an out-of-range day
PASS year and month direct selection navigates without changing saved date
PASS non-leap February has exactly its valid day choices after direct navigation
PASS invalid direct year or month request leaves navigation state untouched
PASS every enabled year choice permits a valid date rather than a silent dead end
PASS month arrows cannot leave supported year boundaries
PASS month arrows still reach both valid boundary months
PASS task-to-calendar adds linked event and returns to original task detail
PASS removed source task blocks schedule creation and keeps editor open
PASS failed persistence leaves task unlinked and editor open
PASS direct calendar creation still returns to and reveals new calendar card
{"file":"outputs/index0922testv19.html","passed":33,"failed":0}

[test-deadlines.cjs] 27개 통과
PASS October 8 to October 13 is exactly D-5
PASS same calendar date is D-day rather than D-0
PASS tomorrow and three days away are upcoming while four days is later
PASS a passed due date is labeled overdue
PASS completed tasks do not show urgency or overdue feedback
PASS absent empty malformed and nonexistent target dates have no D-day
PASS invalid reference date cannot produce a misleading D-day
PASS date difference survives month and year boundaries
PASS leap February and century rules use real calendar dates
PASS daylight saving boundaries count calendar days instead of elapsed local hours
PASS default current-day function is reevaluated after local midnight
PASS incomplete tasks sort today and future first then undated then overdue
PASS all tasks keep completed rows after all incomplete deadline groups
PASS sorting accepts wrapped task rows without losing their category
PASS same deadline undated and completed groups preserve their existing relative order
PASS comparator produces reciprocal ordering for every valid deadline group
PASS actual board applies deadline sort without mutating stored source task order
PASS author filtering is retained before deadline ordering
PASS completed and all status filters retain their requested membership
PASS together filter still excludes personally assigned tasks
PASS creating an event for an undated task atomically assigns its start date
PASS source task receives schedule start date instead of later range end
PASS existing preparation deadline is preserved when schedule date differs
PASS actual quota failure rolls back both linked event and newly assigned deadline
PASS missing source blocks event and deadline writes
PASS persisted linked target date remains valid after backup normalization
PASS cleared linked deadline is not automatically resurrected during reload
{"file":"outputs/index0922testv19.html","passed":27,"failed":0}

[test-release-logic.cjs] 43개 통과
PASS participant-only backup keeps a personal schedule
PASS together participants remain together after normalization
PASS reject event comment invalid ID
PASS reject event comment invalid author
PASS reject event comment invalid text
PASS reject event comment orphan reply
PASS reject event comment duplicate ID
PASS valid schedule comments and one-level replies accepted
PASS notification history remains within readable backup limits
PASS new task is visible after save from partner filter
PASS editing a completed task keeps it visible
PASS legacy descriptive task date becomes editable note without losing text
PASS legacy ISO task date becomes target date and not descriptive note
PASS invalid legacy ISO-like date is retained as note rather than invalid target
PASS current nonempty note takes precedence over legacy description
PASS current target date takes precedence over legacy ISO date
PASS explicitly cleared current note is not resurrected by legacy description
PASS explicitly cleared current target date is not resurrected by legacy ISO date
PASS clearing migrated note through actual task save persists across reload
PASS clearing migrated target date through actual task save persists across reload
PASS task date migration is stable after serialized second reload
PASS linked event route clears filter and selects event date
PASS ordinary load no longer implicitly resets legacy data
PASS stale second tab cannot overwrite first tab data
PASS successful writer can save again with updated snapshot
PASS storage quota failure keeps persisted snapshot and saved data
PASS external changes apply automatically with no modal
PASS open editor defers external state and exposes conflict notice
PASS explicit latest-data action keeps draft while applying new state
PASS backup restore checks stale-tab guard before replacing data
PASS sample reset checks stale-tab guard before composing new data
PASS backup restore saves prior state and updates snapshot
PASS failed backup restore leaves saved state and snapshot intact
PASS reply draft whose parent was deleted never stores orphan reference
PASS latest comments refresh clears deleted reply target and keeps textarea
PASS latest data with removed post disables comment submission and retains text
PASS valid profile edits preserve selected photo and text fields
PASS invalid profile email cannot be saved
PASS duplicate profile handles rejected case-insensitively
PASS partner joins solo event without changing original creator
PASS leaving together event restores remaining personal participation
PASS cancelled event cannot be joined
PASS task-to-schedule creation retains together assignee
{"file":"outputs/index0922testv19.html","passed":43,"failed":0}

[test-v10-storage.cjs] 21개 통과
PASS raw v8 compatible
PASS versioned backup
PASS reject unknown version
PASS leap day validation
PASS duplicate IDs
PASS reversed dates
PASS invalid author
PASS invalid participants
PASS bad image URL
PASS too many photos
PASS long title
PASS orphan reply
PASS invalid task date
PASS dangerous keys
PASS image readThrow
PASS image hang
PASS image huge
PASS image decodeFail
PASS image canvasThrow
PASS image success with white background
PASS quota failure restores in-memory state
21 checks passed

[test-profile-dates.cjs] 25개 통과
PASS profile form reads both shared dates and constrains selection to today
PASS partner profile form reads the same shared dates
PASS actual profile save persists profile and shared dates in one stored state
PASS saving relationship dates retains existing avatar, cover and partner profile
PASS relationship dates remain shared after switching viewer
PASS optional relationship dates can both be cleared and stay absent in display
PASS one relationship date can be set without requiring the other
PASS same-day first meeting and dating start are accepted
PASS actual profile save rejects future first meeting without changing state
PASS actual profile save rejects future dating start without changing state
PASS actual profile save rejects impossible calendar date without changing state
PASS actual profile save rejects reversed relationship dates without changing state
PASS quota failure rolls back profile and both dates while leaving editor open
PASS legacy backup without new shared date retains its existing anniversary
PASS saved shared dates survive real backup validation and serialized reload
PASS explicitly cleared dates are not restored from sample defaults
PASS backup rejects malformed and reversed relationship dates
PASS backup rejects future dates under the same policy as profile save
PASS actual clearDate clears each optional relationship input and marks dirty
PASS clearDate cannot clear a required schedule date
PASS existing optional task date clear remains supported
PASS actual dateField carries optional marker and maximum date
PASS real picker exposes clearing only for the optional relationship field
PASS real date selection updates the shared-date draft without saving automatically
PASS real date selection rejects dates after the field maximum
{"file":"outputs/index0922testv19.html","passed":25,"failed":0}

[test-v19-title-migration.cjs] 5개 통과
PASS exact old seed title is shortened while preserving assigned person and note
PASS already shortened seed title keeps its inferred original author
PASS custom title on seed ID keeps its own title and explicit author
PASS identical text on another task ID remains unmodified
PASS exact seed title migration preserves explicit author and original note
{"file":"outputs/index0922testv19.html","passed":5,"failed":0}
```

[v18 검수](QA-v18.md)와 [v17 검수](QA-v17.md)는 보존합니다. GitHub에는 HTML·MD만 반영하고 사용자 저장 기록, 프로필 사진, 로컬 QA 사진·스크린샷은 업로드하지 않습니다. 원격 소스와 로컬 파일의 해시 및 이전 파일 보존은 업로드 단계에서 별도로 확인합니다.
