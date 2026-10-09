'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,repo=path.resolve(root,'../..');
const source=path.join(repo,'versions/v21/index.html'),bytes=fs.readFileSync(source);
const sha=crypto.createHash('sha256').update(bytes).digest('hex');
if(sha!=='ef854483724a07c16186344cd72da6ce542647d7c59bc0a994bc0b49be8e4e38')throw Error('Preserved v21 baseline differs.');
fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
fs.copyFileSync(source,path.join(root,'outputs/index0922testv21.html'));
console.log('Prepared preserved v21 baseline; run build from source/v22.');
