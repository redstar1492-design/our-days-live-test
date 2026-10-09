# dump v21 — 모음·여행의 서버 연결 준비

기준일: 2026-10-09. **이 폴더는 설계·검토 자료이며 실행 중인 서버가 아닙니다.** 실제 서비스 계정, Supabase 프로젝트, 초대 수락 API, 두 기기 동기화, 실시간 채팅, 푸시를 생성하거나 연결하지 않았습니다. HTML의 모음·여행 기능은 현재 브라우저에 저장합니다.

## 파일과 상태

| 파일 | 용도 | 상태 |
| --- | --- | --- |
| `baseline-001.sql`, `baseline-002.sql`, `baseline-shared.ts` | GitHub에 이미 있는 서버 초안의 확인용 사본 | 원격 v20 내용 그대로, 수정·실행 안 함 |
| `adapter-contract.d.ts` | 인증된 UUID 기준 공유 데이터 adapter의 타입 계약 | 선언만 있음, 구현·배포 안 함 |
| `003_collections_trips.review.sql` | 기존 테이블 이름에 맞춘 모음·여행·장소·연결 스키마와 RLS 검토안 | 자동 migration 경로 밖, 적용 안 함 |
| `preflight.readonly.sql` | 미래 개발/스테이징 DB의 스키마·정책·권한 확인 | 조회만 수행, 실행 안 함 |
| `validate-preparation.cjs` | 사본 무결성 및 SQL/계약의 구조 검사 | PostgreSQL 실행 검증을 대신하지 않음 |
| `validation-result.json` | 위 정적 검사 결과 | DB 또는 두 기기 기능 통과 결과가 아님 |

기준 사본은 `redstar1492-design/our-days-live-test`의 v20 커밋 `5c9035dd4d4d94d3cd095fe07f6bc38613c96c4d`에서 확인했습니다. 원본 경로는 `next-app/supabase/migrations/001_auth_and_couples.sql`, `002_shared_content.sql`, `next-app/lib/data/shared.ts`입니다. 기존 저장소 파일을 교체하지 않습니다.

## 현재 HTML에서 서버 모델로 옮길 때

| 현재 로컬 값 | 향후 서버 값/처리 |
| --- | --- |
| 이름 또는 준영/아정 내부 슬롯 | 검증된 로그인 계정의 `auth.users.id` UUID. 표시 이름을 권한으로 사용하지 않음 |
| 숫자 모음/덤프/일정/할 일 ID | 서버 UUID. 사용자·기기별 원본 ID→UUID 매핑을 저장해 재시도 시 중복 이전 방지 |
| `collections.kind` | 서버 `collections.kind`, `collection` 또는 `trip` |
| 여행 `startDate`, `endDate` | `trips.start_date`, `end_date`의 SQL `date`. 시간대 변환을 적용하지 않음 |
| 여행 `stops[]` | `trip_stops`, 날짜별 `position` 정렬 |
| 항목의 선택적 `collectionId` | `collection_items`의 실제 FK. v21에서는 항목당 모음 하나 |
| 여행 `eventId` | `trips.event_id`. 여행 전체 기간의 일정 하나와 연결 |

개인 브라우저 기록은 상대에게 자동 공개하지 않습니다. 연결한 뒤 이전 범위를 사용자에게 확인하고, ID 매핑과 서버 결과가 모두 저장된 후 이전 완료로 표시합니다. 브라우저 데이터는 서버 저장 성공을 확인하기 전에 지우지 않습니다. 미리보기 초대 URL fragment는 서버 초대 토큰으로 승격하지 않습니다.

사진은 data URL을 DB 행에 그대로 옮기지 않습니다. 인증된 비공개 object storage에 올리고 검증된 저장 경로만 연결합니다. 모음은 기존 덤프와 사진의 연결을 조회하므로 사진 파일을 복제할 필요가 없습니다.

## 저장해야 할 단위와 권한

- 모음은 두 구성원이 함께 정리할 수 있습니다. 원본 덤프의 내용 수정 권한과 모음에 묶는 권한은 별도입니다. 원본 작성자는 유지합니다.
- 스키마 초안에서는 모음 자체 삭제를 작성자에게 제한합니다. 모음을 지워도 기존 덤프·할 일·일정을 지우지 않고 연결만 해제합니다. 연결된 여행 일정도 일반 일정으로 남깁니다.
- 여행 생성은 모음, 여행 기간, 기간 일정 하나, 항목 연결을 하나의 트랜잭션으로 만듭니다. 장소를 추가할 때마다 달력에 새 일정을 만들지 않습니다.
- 여행 날짜 변경은 기간 일정과 장소 날짜 검증을 함께 처리합니다. 기간 밖의 장소를 임의로 지우거나 옮기지 않고 수정할 날짜를 사용자에게 확인합니다.
- 장소 순서는 해당 날짜의 전체 ID 목록을 트랜잭션에서 검증합니다. 다른 여행·날짜 ID, 중복 ID, 누락 ID는 거부합니다.
- 서버가 세션으로 `userId`와 `coupleId`를 결정합니다. mutation 입력으로 받은 작성자/커플 ID를 신뢰하지 않습니다.

## 연결 전에 고쳐야 할 기존 서버 초안

현재 HTML이 아래 코드를 호출하는 것은 아닙니다. 하지만 기존 서버 초안을 그대로 제품 서버에 연결하면 안 됩니다.

1. **초대 수락의 동시성**: 기존 `join_couple_by_code`는 인원수를 확인한 뒤 추가하며 커플 행을 잠그지 않습니다. 수락 트랜잭션에서 커플/초대 행을 잠그고, 발신자·수신자 중복 연결과 두 명 제한을 DB 제약으로 보장해야 합니다. 6자리 표시용 코드는 만료·일회성·서버 토큰 해시 기반 초대로 대체합니다. 상세 계약은 기존 `docs/INVITATION_BACKEND.md`를 따릅니다.
2. **변경 가능한 소유권 열**: 기존 author 기준 UPDATE 정책만으로는 `couple_id` 변경을 막지 못하는 테이블이 있습니다. insert/update/delete 모두 활성 구성원을 확인하고, `id`, `author_id`, `couple_id`, 생성 시각을 변경하지 못하도록 열 권한과 RPC 검증을 함께 적용해야 합니다. 알림 UPDATE는 수신자가 읽음 상태만 바꾸도록 제한합니다.
3. **공개 사진 URL**: 기존 `dumpPhotoUrl`은 `getPublicUrl`을 사용합니다. 커플 사진은 private bucket + 구성원 RLS + 짧은 signed URL 또는 인증 다운로드로 바꾸고 bucket/object 정책을 직접 검증해야 합니다.
4. **날짜 모델**: 기존 events/todos는 timestamp 중심입니다. 현재 앱의 기간 일정·목표 날짜는 `date` 모델로 정규화한 뒤 adapter를 연결합니다. 임의 UTC 자정 변환으로 하루가 바뀌지 않게 합니다.
5. **현재 같이하기 모델과의 차이**: 기존 `event_join_requests`는 승인 요청 상태 모델입니다. 현재 UI의 즉시 같이하기/취소에 맞춰 실제 참여 관계와 자기 참여 변경 권한을 재설계해야 합니다. SQL 초안이 이 차이를 해결한 것은 아닙니다.

## 새 SQL 초안의 적용 범위

SQL은 `public.collections`, `trips`, `trip_stops`, `collection_items`만 새로 정의합니다. 원본 데이터와 링크의 커플 ID는 composite FK로 일치시킵니다. 체크 제약은 빈 제목, 잘못된 기간, 하나 이상의 항목 ID, 중복 순서를 거부합니다. 장소 날짜 검증은 트랜잭션 종료 시 실행하여 기간과 장소를 함께 바꾸는 작업을 허용합니다.

새 테이블의 RLS는 활성 커플 구성원 조회를 요구하고, anon/public 권한을 회수합니다. **authenticated에는 SELECT만 부여합니다.** INSERT/UPDATE/DELETE 정책이 있어도 직접 쓰기 권한은 부여하지 않았습니다. collection revision·operationId 재시도·연결 일정 동기화·작성자 열 불변성을 지킬 쓰기 RPC가 아직 없기 때문입니다. 기존 스키마 전체의 권한이 이 초안으로 보완되는 것은 아닙니다.

보호용 함수는 별도 `dump_private` schema에 두고 고정된 빈 `search_path`와 완전한 테이블 이름을 사용합니다. 이를 API exposed schema에 추가하지 않습니다. `service_role`은 RLS를 우회하므로 클라이언트에 전달하면 안 되며, 미래 RPC도 인증 세션과 커플 소속을 독립적으로 검증해야 합니다.

## 실제 서버 구현 시 순서

1. 로컬 Supabase 또는 별도 스테이징을 준비하고 기존 001/002 초안의 위 문제를 먼저 수정합니다. 운영 DB에 이 파일을 바로 붙여 넣지 않습니다.
2. `preflight.readonly.sql` 결과로 현재 이름·타입·권한을 확인합니다. 충돌하는 객체, 기존 데이터, 외래 키, 날짜 변환을 검토한 뒤 새로운 migration 이름으로 옮깁니다. 이 초안은 재실행 가능 migration이 아닙니다.
3. 새 스키마를 적용하고 서버 쓰기 RPC를 구현합니다. 모든 mutation은 root collection 행 잠금 → operationId 중복 확인 → expectedRevision 비교 → 변경/일정 동기화 → revision 증가 → 결과 저장을 한 트랜잭션으로 처리합니다. 실패하면 전체 rollback합니다.
4. 실제 로그인/초대 수락을 연결하고 `.d.ts` 계약을 구현합니다. publishable key만 브라우저에 전달합니다. 서버 비밀 키는 저장소·HTML·공개 JSON에 넣지 않습니다.
5. 아래 DB/기기 검수를 통과한 뒤 필요한 테이블만 Realtime에 등록합니다. 연결 여부는 서버 결과로 표시합니다.

## 실제 DB에서 해야 할 검수 — 아직 미실행

두 커플 A/B, A의 두 구성원 A1/A2, 미연결 계정 C, anon을 사용하는 테스트 fixture가 필요합니다. 운영 기록으로 테스트하지 않습니다.

| 대상 | 반드시 확인할 결과 |
| --- | --- |
| 새 4개 테이블 각각의 조회 | A1/A2는 A만 조회. B/C/anon은 A를 조회 불가 |
| 새 4개 테이블 직접 생성/수정/삭제 | authenticated·anon 모두 직접 DML 불가. 의도한 RPC만 허용 |
| 미래 쓰기 RPC 각각 | A1/A2의 허용 동작 성공. B/C/anon 거부. createdBy/coupleId 위조 거부 |
| 항목 링크 | 다른 커플 dump/event/todo FK 연결 거부. 둘 이상의 ID·중복 링크 거부 |
| 여행 생성/수정 | 일정 하나 생성. 날짜·장소·일정 중 하나 실패 시 전체 rollback |
| 장소 순서·기간 | 중복/누락/다른 여행 ID 거부. 기간 밖 장소가 있으면 저장 거부 |
| 동시 수정 | 같은 revision으로 두 번 수정 시 하나만 성공하고 다른 쪽 CONFLICT |
| 통신 재시도 | 같은 operationId의 같은 요청은 같은 결과. 다른 본문 재사용 거부 |
| 원본 삭제·모음 삭제 | 원본 삭제 시 링크만 정리. 모음 삭제 시 원본 기록과 사진 보존 |
| 연결 해제·계정 삭제 | 접근 즉시 중단. 채널 해제. 공유 기록 처리 정책에 따라 명시적으로 정리 |
| 사진 | URL/경로를 알아도 다른 커플은 다운로드 불가. 만료한 URL 거부 |

## 실시간 대화는 별도 후속 범위

v21은 실시간 대화가 구현된 것처럼 보이는 대화방이나 가짜 상대 메시지를 넣지 않습니다. 실제 두 기기 연결을 먼저 검증한 뒤 둘만의 대화방 하나를 구현합니다. 서버 메시지 순서, 중복 전송 방지, 재연결 후 누락 메시지 조회, 오프라인 전송 상태, 비공개 첨부파일, 실제 노출 시 읽음 커서, 구성원만의 채널 접근을 함께 갖춰야 합니다.

Realtime은 저장 성공이나 읽음을 보장하는 원본 데이터가 아닙니다. 변경 이벤트는 재조회 힌트로 처리하고, 재연결·탭 복귀 시 최신 스냅샷을 다시 받습니다. 다른 커플/anon의 채널 구독 거부와 연결 해제 직후 접근 차단을 두 기기로 검수합니다. 채팅 내용을 일정/모음에 넣는 동작은 사용자가 명시적으로 선택해야 합니다.

공식 참고: [Supabase RLS와 권한](https://supabase.com/docs/guides/database/postgres/row-level-security), [Postgres 변경 구독](https://supabase.com/docs/guides/realtime/postgres-changes). 실제 구현 시 최신 문서를 다시 확인합니다.
