# dump v18 — 소개·초기 설정·첫 진입 검수

기준일: 2026-10-09. GitHub의 `index.html`과 `versions/v18/index.html`은 전달용 `dump-final.html`과 같은 파일입니다. `dump-onboarding-preview.html`은 본앱과 다른 저장 키로 여섯 단계의 첫 실행을 체험합니다.

아래 기록은 완료된 로컬 v18 검수 결과입니다. 자동 검사는 300개(새 흐름 48개 + 새 상태 24개 + 기존 회귀 228개)이며 실제 브라우저 확인 범위는 별도로 기록합니다. 네이티브 사진 선택 UI의 최종 업로드 완료는 확인하지 못했습니다. GitHub 업로드는 별도로 파일 바이트 일치와 이전 버전·기존 서버 작업 파일 보존을 확인합니다.

## 실제 브라우저 검수

```text
dump v18 화면 및 연결 검수
최종 정리: 2026-10-09

실제 브라우저에서 확인한 항목
- 서비스 소개 → 덤프 → 일정 → 할 일 → 내 정보 → 둘의 정보 6단계 이동.
- 덤프 예시의 댓글 추가, 일정 예시의 같이하기/취소, 할 일 예시의 완료/완료 취소 동작.
- 일정 예시 참여 전후 제목의 x좌표 101px, 폭 172px 유지(390px 화면).
- 소개 넘기기는 내 정보로 이동하며, 빈 이름으로 다음 화면 진입 불가.
- 두 이름 입력, 날짜 선택, 잘못된 날짜 순서 제출 차단, 뒤로 이동 후 입력 유지와 오류 복구.
- 완료 후 빈 덤프, 빈 일정, 빈 할 일 확인. 입력한 이름과 두 날짜가 마이에 반영됨.
- 완료 후 새로고침해도 소개가 재등장하지 않으며 입력 정보 유지.
- 새 계정에서 첫 텍스트 덤프 작성과 내 덤프 1개 표시 확인.
- 마이의 소개 다시 보기 진입 확인. 기존 기록을 지우지 않는 종료 흐름은 VM 검사로 추가 확인.
- 320×640: 가로 넘침 없음, 입력 글꼴 DumpSans 14px, 라벨 13px, 제목 27px.
- 320×420: 본문만 스크롤되며 하단 시작 버튼은 화면 안에 유지됨.
- 390×844 모바일 화면과 데스크톱 앱 프레임의 시각 배치 확인.

수정 후 확인
- 잘못된 둘의 날짜 때문에 내 이름 화면에서 다음으로 이동할 수 없던 문제 수정.
- 1900년 1월 선택 하한, 신규 계정의 오래된 사용자 시점 설정, 저장 성공 후 렌더 오류 처리 수정.
- 로고 이미지 배경이 소개 화면의 옅은 배경 위에 네모로 보이는 현상 조정.

범위
- 별도 localhost QA 저장소에서 확인했으며 사용자가 기존에 열어 둔 파일의 저장 데이터는 변경하지 않음.
- 프로필 사진 형식/비동기 처리/저장 검증은 코드 QA에 포함. 네이티브 사진 선택 UI의 최종 업로드 완료는 별도로 확인하지 못함.
- 실제 iOS/Android 기기, 실제 로그인·상대 기기 연결·푸시 알림 검증은 이 HTML 검수에 포함하지 않음.
- 자동 코드 QA 300개의 전체 검사명은 QA-v18-온보딩.txt 참조.
```

## 자동 코드 검수와 전체 검사명

```text
dump v18 온보딩 코드 QA
최종 재검사일: 2026-10-09
날짜 계산 테스트는 재현성을 위해 2026-10-08을 기준일로 고정하며, 실제 앱의 오늘 날짜는 런타임에 계산한다.
대상: outputs/index0922testv18.html (outputs/dump-final.html과 동일)

결과: 300개 검사 통과, 0개 실패
- 새 온보딩 흐름: 48개 (stale DEVICE_USER viewer 3개 포함; 별도 가산하지 않음)
- 새 온보딩 상태 및 입력 검증: 24개
- 기존 v17 기능 회귀: 228개

검사 범위
- 실제 v18 산출 HTML에서 함수와 저장 스키마를 추출해 VM으로 실행.
- 첫 소개 → 덤프·일정·할 일 예시 → 개인 정보 설정 → 빈 계정 진입.
- 넘기기/뒤로가기/이름 필수 검증/날짜 선택과 순서 검증/선택 정보 유지.
- 예시 인터랙션은 앱에 저장하지 않음. 새 계정은 샘플 사진·덤프·일정·할 일·알림을 생성하지 않음.
- 기존 계정/저장된 다른 창 정보 보존, 저장공간 및 접근 실패, 중복 제출, 저장 후 렌더 오류의 상태 일관성.
- 새 계정에 남아 있던 기기 사용자 설정이 적용되지 않음. 기존 계정의 사용자 전환은 유지.
- 사진 비동기 stale callback/중복 처리, replay 종료 및 정보 재수집 차단.
- 날짜 모달 Tab/Shift-Tab/Escape 및 inert 복원, 라벨·이름 필수 정보, HTML 문자 이스케이프.
- 기존 일정 참여/취소, 캘린더 기간 바, 할 일 D-day/분류/일정 연결, 댓글·알림, 프로필, 백업/저장 회귀.

검토 후 수정 확인
1. 둘의 날짜가 잘못된 상태에서 뒤로 갔다가 이름 화면의 다음을 눌렀을 때 수정 화면으로 복귀하지 못하던 현상 수정.
2. 날짜 이전 달 이동으로 1900년 1월을 선택하지 못하던 하한 조건 수정.
3. 저장 성공 뒤 UI 렌더 오류가 발생해 저장 상태와 메모리 상태가 달라지던 처리 수정.
4. 신규 빈 계정이 과거 기기 사용자 선택 때문에 상대방 시점으로 이동하지 않도록 분기 수정.

실행 대상 SHA256
Path : versions/v18/index.html
Hash : BCC389D6D863782385443FDB3D44870386847996B94AF122ED7E627777397EA0

Path : index.html
Hash : BCC389D6D863782385443FDB3D44870386847996B94AF122ED7E627777397EA0

검사 한계
- VM은 브라우저 DOM·저장소를 모의하고 실제 HTML 함수를 실행한 로직 검증이다.
- 실제 모바일 기기·운영체제 파일 선택기·네트워크·실서버 동기화·실 로그인·푸시는 이 300개에 포함되지 않는다.
- 서로 다른 창에서 동시에 신규 계정을 완료하는 작업에 대한 서버 트랜잭션 보장을 검증한 것이 아니다. 저장 완료 전에 이미 기록된 상태를 감지해 덮어쓰지 않는 가드를 검증했다.
- 실제 브라우저의 배치·모션·폰트·오버플로 검수는 root의 별도 검수 결과에 따른다.

세부 검사명

[test-v18-onboarding-flow.cjs] 48개
PASS tutorial interactions do not write app state or browser storage
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
PASS initial startup replaces example state only when there is no stored account
PASS isolated preview uses separate state and viewer keys and cannot overwrite canonical data
PASS empty dump state offers real composition rather than seeded samples

[test-v18-onboarding-state.cjs] 24개
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

[test-v17-calendar.cjs] 32개
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

[test-v17-tasks.cjs] 28개
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

[test-v17-confirm.cjs] 14개
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

[test-coherence-logic.cjs] 33개
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

[test-deadlines.cjs] 27개
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

[test-release-logic.cjs] 43개
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

[test-v10-storage.cjs] 21개
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

[test-profile-dates.cjs] 25개
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

[test-v17-sample-title.cjs] 5개
PASS seed task 308 old title is shortened and original assigned person and note remain
PASS already-shortened seed task title remains unchanged and original author is inferred
PASS custom title on seed ID is not changed and explicit author remains
PASS same text on another task ID is not changed and its author remains
PASS exact seed title migration preserves explicit author and original memo
```

[v17 검수 이력](QA-v17.md)은 별도로 보존합니다. 개인 브라우저 기록이나 로컬 QA 데이터·사진은 저장소에 포함하지 않습니다. 실제 휴대전화·서버 계정·두 기기 동기화·실제 푸시의 완성을 보증하지 않습니다.
