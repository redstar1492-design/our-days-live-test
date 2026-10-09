# v20 소스와 재빌드

이 폴더는 현재 단독 HTML의 사용법 안내·초대 미리보기 소스를 보존합니다. 실제 서버는 연결하지 않습니다. Node.js와 표준 라이브러리만 사용하며 별도 패키지 설치가 필요하지 않습니다.

## 재빌드

저장소를 내려받은 뒤 `source/v20`를 작업 디렉터리로 사용합니다.

```text
cd source/v20
node prepare-build.cjs
node work/build-v20-onboarding.cjs
```

준비 스크립트는 같은 저장소의 `versions/v17/index.html`을 기준 앱으로 복사하고 최신 `index.html`에서 이미 내장된 로고만 추출합니다. 개인 브라우저 데이터나 사진을 읽지 않습니다.

생성 파일은 이 폴더 안의 `outputs/dump-final.html`, `outputs/index0922testv20.html`, `outputs/dump-onboarding-preview.html`입니다. 앞의 두 파일은 같고 체험 파일만 저장 키가 다릅니다. 새 빌드에 v19의 소개 사진을 넣지 않습니다.

## 구현 파일

| 파일 | 역할 |
|---|---|
| `work/build-v20-onboarding.cjs` | 보존된 기준 앱에 v20 변경을 적용하는 조립 스크립트 |
| `work/onboarding-v20.js` | 서비스 소개·내 프로필·실제 앱 사용법 상태와 화면 |
| `work/onboarding-v20.css` | 소개·입력·앱 안 안내 스타일 |
| `work/patch-v20-onboarding-state.cjs` | 자기 프로필 검증과 빈 앱 상태 생성 |
| `work/patch-v18-onboarding-state.cjs` | 빈 상태 생성의 보존된 공통 helper |
| `work/v20-connection.js` | 초대 미리보기 링크와 수신 검증·복사·공유 |
| `work/patch-v20-connection.cjs` | 미연결 상태의 필터·프로필·알림·함께 선택 제한 |
| `server/config.example.json` | URL·공개 key를 빈 값으로 둔 서버 준비 예시 |

서버 실제 계약 준비는 [초대 연결 문서](../../docs/INVITATION_BACKEND.md)를 참고합니다. 설정 예시에 값을 넣는 것만으로 단독 HTML이 자동 연결되지 않습니다.

## 검사

새 연결과 실제 앱 안내 검사는 최종 HTML에서 실행합니다.

```text
node work/test-v20-connection.cjs outputs/index0922testv20.html
node work/test-v20-guided-flow.cjs outputs/index0922testv20.html
```

앱 안 안내 검사는 최종 v20 HTML을 대상으로 실행합니다. 최종 검사 파일과 실행 명령은 동일 폴더의 테스트 소스 및 [최종 검수 기록](../../docs/QA-v20.md)을 따릅니다.

이전 앱 회귀 검사는 프로젝트의 보존된 검수 fixture를 추가로 사용합니다. 특히 v17 확인창 회귀에는 패치 이전 v16 HTML이 필요합니다. 해당 fixture가 없는 저장소 사본에서는 그 전체 회귀를 재현했다고 표시하지 않습니다. 실제 전달본에 대해 실행한 결과와 범위는 검수 문서에 보존합니다.

`work/test-v20-all.cjs`는 신규 안내 74개·기존 회귀 228개·산출 HTML 초대 37개를 집계합니다. 보존된 로컬 fixture를 모두 제공한 환경에서만 이 전체 집계를 실행합니다. 위의 두 신규 검사에는 별도 v16 fixture가 필요하지 않습니다.

빌드 후 기존 앱 저장 공간을 직접 초기화하지 않습니다. 첫 실행을 확인하려면 별도 체험 HTML을 사용합니다.
