'use strict';
const fs=require('node:fs'),path=require('node:path');
const repository=path.resolve(__dirname,'../..');
const baseline=path.join(repository,'versions/v20/index.html');
if(!fs.existsSync(baseline))throw Error('Expected the preserved repository versions/v20/index.html.');
const outputs=path.join(__dirname,'outputs');fs.mkdirSync(outputs,{recursive:true});
fs.copyFileSync(baseline,path.join(outputs,'index0922testv20.html'));
const previous=path.join(repository,'source/v20/work'),work=path.join(__dirname,'work');
if(fs.existsSync(previous))for(const name of fs.readdirSync(previous)){if(name.startsWith('test-')||name.startsWith('patch-')){const target=path.join(work,name);if(!fs.existsSync(target))fs.copyFileSync(path.join(previous,name),target);}}
console.log('Prepared the preserved v20 baseline. No browser data is read or changed.');
