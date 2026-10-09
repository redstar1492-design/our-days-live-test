'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file=process.argv[2]||'outputs/index0922testv19.html';
const html=fs.readFileSync(file,'utf8');
const code=html.split('\n').find(s=>s.includes('allTasks().forEach(({task:t})=>{const seed='));
assert(code,'built-in seed migration code exists in requested deliverable');
const cases=[
 ['exact old seed title is shortened while preserving assigned person and note',{id:308,text:'아정 신작 에세이 구매',note:'메모',who:'아정'},'신작 에세이 구매','아정'],
 ['already shortened seed title keeps its inferred original author',{id:308,text:'신작 에세이 구매'},'신작 에세이 구매','아정'],
 ['custom title on seed ID keeps its own title and explicit author',{id:308,text:'다른 제목',createdBy:'준영'},'다른 제목','준영'],
 ['identical text on another task ID remains unmodified',{id:400,text:'아정 신작 에세이 구매',createdBy:'준영'},'아정 신작 에세이 구매','준영'],
 ['exact seed title migration preserves explicit author and original note',{id:308,text:'아정 신작 에세이 구매',createdBy:'준영',note:'원래 메모'},'신작 에세이 구매','준영']
];
let passed=0,failed=0;
for(const[name,task,text,author]of cases){try{const memo=task.note;vm.runInNewContext(code,{allTasks:()=>[{task}]});assert.equal(task.text,text);assert.equal(task.createdBy,author);assert.equal(task.note,memo);passed++;console.log('PASS '+name);}catch(err){failed++;console.log('FAIL '+name+' :: '+err.message);}}
console.log(JSON.stringify({file,passed,failed}));
if(failed)process.exitCode=1;
