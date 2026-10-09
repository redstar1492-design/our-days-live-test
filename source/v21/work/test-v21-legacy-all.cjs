'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawn}=require('child_process');
const target=process.argv[2]||'outputs/index0922testv20.html';
const suites=[
 {file:'test-v21-legacy-guided.cjs',label:'본인 프로필·빈 계정·실제 사용 안내',expected:74,report:'outputs/QA-v21-기존-사용안내.txt'},
 {file:'test-v21-legacy-regression.cjs',label:'기존 앱 기능 회귀',expected:228,report:'outputs/QA-v21-기존-회귀.txt'},
 {file:'test-v20-connection.cjs',label:'초대 화면 준비·미연결 상태 보호',expected:37}
];
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function run(suite){return new Promise(resolve=>{const child=spawn(process.execPath,[path.join('work',suite.file),target],{cwd:process.cwd(),shell:false,windowsHide:true});let output='',error='';child.stdout.on('data',v=>output+=v);child.stderr.on('data',v=>error+=v);child.on('error',err=>resolve({...suite,code:-1,output,error:String(err)}));child.on('close',code=>resolve({...suite,code,output,error}));});}
(async()=>{
 const sha256=digest(target),results=await Promise.all(suites.map(run)),failures=[],labels=new Set();
 for(const suite of results){const text=suite.report&&fs.existsSync(suite.report)?fs.readFileSync(suite.report,'utf8'):suite.output;suite.checks=text.split(/\r?\n/).filter(v=>v.startsWith('PASS '));if(suite.code!==0)failures.push(suite.file+' exit '+suite.code);if(suite.checks.length!==suite.expected)failures.push(suite.file+' expected '+suite.expected+', found '+suite.checks.length);for(const check of suite.checks){if(labels.has(check))failures.push('Duplicate '+check);labels.add(check);}if(suite.report&&!text.includes(sha256))failures.push(suite.file+' hash mismatch');console.log(suite.label+': '+suite.checks.length+' passed, exit '+suite.code);}
 if(digest(target)!==sha256)failures.push('Target changed during verification');
 if(path.resolve(target)===path.resolve('outputs/index0922testv20.html')&&digest('outputs/dump-final.html')!==sha256)failures.push('Canonical HTML differs from versioned HTML');
 let report='dump v21 최종 코드 QA\n대상: '+target+'\nSHA256: '+sha256+'\n실행(UTC): '+new Date().toISOString()+'\n결과: '+labels.size+'개 고유 검사 통과, '+failures.length+'개 실패\n\n';
 report+=results.map(v=>'- '+v.label+': '+v.checks.length+'개 통과').join('\n')+'\n\n검사 범위\n- 가상 예시를 제거한 1장 서비스 설명 → 내 프로필만 입력 → 초대 화면 준비 → 실제 앱 사용 안내.\n- 게시·일정·할 일의 실제 저장 성공, 검증 실패, 취소, 중복, 저장 실패, 다른 탭 충돌, 일시정지·재개·건너뛰기·재접속 데이터 유지.\n- 신규 계정에 샘플 데이터와 가짜 상대 프로필·알림을 넣지 않는다.\n- 초대 화면은 미리보기로 제한하고 이름만 포함한 링크의 공유·복사·검증·실패 대안을 제공한다. 실제 기기 연결 및 서버 동기화 완료를 표시하지 않는다.\n- 기존 일정 참여·기간 바·할 일·D-day·댓글·프로필·백업·취소 확인창 회귀.\n\n한계\n- 실제 산출 HTML에서 추출한 앱 함수를 격리 VM의 모의 DOM·저장소에서 실행한 코드 검사다. 실제 배치·폰트·모션·모바일 터치 검수는 별도 화면검수 보고서에 따른다.\n- 기존 기능 회귀에서는 실제 v20 상태 의존성을 주입하되 UI refresh는 기존 render와 같이 모의 처리한다.\n- 실제 기기 간 초대 수락·계정 연결·동기화는 이번 버전에서 제공하지 않는다.\n\n';
 if(failures.length)report+='실패\n'+failures.join('\n')+'\n\n';
 for(const suite of results)report+='['+suite.file+']\n'+suite.output+(suite.error?'STDERR\n'+suite.error:'')+'\n';
 fs.writeFileSync('outputs/QA-v21-기존-전체.txt',report,'utf8');console.log(JSON.stringify({target,sha256,passed:labels.size,failures,report:'outputs/QA-v21-기존-전체.txt'}));if(failures.length)process.exitCode=1;
})().catch(err=>{console.error(err);process.exitCode=1;});
