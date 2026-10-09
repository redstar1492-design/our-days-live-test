# v22 빌드와 검사

저장소 전체를 내려받고 Node.js에서 실행합니다. 외부 패키지는 필요하지 않습니다.

```text
cd source/v22
node prepare-build.cjs
node work/build-v22.cjs
node work/test-v22-ui.cjs outputs/index0922testv22.html
```

prepare-build.cjs는 보존된 ../../versions/v21/index.html 해시를 확인하고 outputs/index0922testv21.html로 복사합니다. 빌더는 이번 JS/CSS를 적용해 최종·버전·체험 HTML을 생성합니다.

최종/버전 SHA256: 38252a0af620dad07a01f012d8e2583c1f11172b45dfddf78170700df08acd15  
체험 SHA256: 8584a7110fd71cf62c5f21e6730a75e129d4cab1564892c91dae00ec3f6fc279

## 구성

work/build-v22.cjs와 gallery-location-v22.js/css, chat-v22.js/css가 구현 파일입니다. test-v22-ui.cjs는 실제 산출 HTML의 신규·변경 경로 77개를 격리 VM에서 검사합니다. REVIEW.md는 독립 검토 기록입니다.

기존 회귀 실행기는 test-v22-legacy-all.cjs와 guided/regression/deps입니다. 필요한 v20/v21 의존성·기존 검사 9개·초대 검사·patch helper를 사본으로 포함합니다. 이 사본은 기존 source/v20·v21을 수정하지 않습니다.

## 기존 회귀의 추가 fixture

```text
node work/test-v22-legacy-all.cjs outputs/index0922testv22.html
```

기존 test-v17-confirm.cjs는 비교용 outputs/index0922testv16.html을 추가로 요구합니다. **v16 fixture는 현재 공개 저장소에 포함하지 않았으므로 위 전체 339개 회귀는 깨끗한 clone에서 그대로 실행할 수 없습니다.** fixture를 보유한 개발 작업 공간에서 같은 동결 HTML로 339개를 실행한 결과는 ../../docs/QA-v22.md에 보존했습니다. 신규 77개와 HTML 재빌드는 이 fixture 없이 실행할 수 있습니다. 누락 fixture를 최신 HTML로 대체해 검사를 통과시키지 않습니다.

코드 검사와 실제 브라우저·기기 검사는 서로 다른 범위입니다. 실제 위치·두 기기 전송·서버 연결은 완료 기능이 아닙니다. 생성 outputs와 개인 localStorage·검수 사진·위치·대화·스크린샷은 소스 업로드 대상이 아닙니다.
