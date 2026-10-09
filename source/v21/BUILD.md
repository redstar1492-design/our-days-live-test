# v21 소스와 재빌드

이 폴더는 모음·여행 계획의 브라우저 구현, 검사와 서버 준비 자료를 보존합니다. 기존 [v20 HTML](../../versions/v20/index.html)을 기준으로 같은 v21 파일을 재생성합니다. Node.js 표준 라이브러리를 사용하고 별도 패키지를 설치하지 않습니다.

```text
cd source/v21
node prepare-build.cjs
node work/build-v21.cjs
node work/test-v21-collections.cjs outputs/index0922testv21.html
```

생성되는 `outputs/index0922testv21.html`과 `outputs/dump-final.html`은 같습니다. `outputs/dump-onboarding-preview.html`은 기존 v20 체험 저장 키를 사용합니다. 준비·빌드 스크립트는 브라우저 기록이나 사용자 사진을 읽지 않습니다.

## 파일

| 경로 | 역할 |
|---|---|
| `work/build-v21.cjs` | 기준 v20에 v21 변경 조립 |
| `work/collections-v21.js`, `.css` | 모음·여행 화면과 상태·공통 앱 연결 |
| `work/v21-validation.js` | 백업·모음·여행·장소 연결 검증 |
| `work/test-v21-collections.cjs` | 실제 산출 HTML에서 신규 함수 추출 검사 |
| `work/test-v21-legacy-*.cjs`, `test-v21-regression-deps.cjs` | 기존 앱 회귀용 소스와 의존성 처리 |
| `backend/` | 서버 검토 사본·SQL 검토안·adapter 계약·정적 검사 |

기존 회귀 전체에는 source/v20의 suite와 v16 이전 확인창 fixture가 추가로 필요합니다. 보존 fixture가 없는 사본에서 전체 회귀를 재현했다고 표시하지 않습니다. 신규 모음 검사는 위 명령만으로 실행할 수 있습니다. 실제 최종 실행 수치와 범위는 [v21 검수 문서](../../docs/QA-v21.md)를 따릅니다.

준비 스크립트는 저장소의 source/v20/work에 있는 이전 검사·patch helper도 필요한 경우 복사합니다. v21 검사 사본은 보존하며 기존 source/v20 파일을 수정하지 않습니다. 전체 회귀에는 새 상태 의존성을 자식 검사에도 전달하는 preload 설정과 v16 fixture가 추가로 필요합니다.

서버 준비 자료 정적 검사는 다음과 같습니다.

```text
node backend/validate-preparation.cjs
```

이 명령은 SQL을 DB에 실행하거나 서버를 연결하지 않습니다. 스키마·계약 검토 자료의 구조와 원격 기준 사본 무결성만 확인합니다.
