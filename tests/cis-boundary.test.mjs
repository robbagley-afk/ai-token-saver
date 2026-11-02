import test from 'node:test';import assert from 'node:assert/strict';import {readdir,readFile} from 'node:fs/promises';import {join} from 'node:path';
// -cis skills and resources are for Ensign Career Services staff only. No shared edition may ship or link them.
const roots=['plugins','install','public','src','api','.agents','.claude-plugin'];
const leak=/\b[a-z0-9]+(?:-[a-z0-9]+)*-cis\b|\bcis-[a-z0-9-]+|CIS_AI_SKILLS|coding-helper|search-offload|lm-studio-offload/i;
async function* walk(d){let es;try{es=await readdir(d,{withFileTypes:true});}catch{return;}for(const e of es){const p=join(d,e.name);if(e.isDirectory())yield* walk(p);else yield p;}}
test('no -cis skill, link or tool appears in any shared edition',async()=>{const hits=[];
 for(const r of roots)for await(const f of walk(r)){if(/\.(png|ico|jpg|zip)$/i.test(f))continue;const s=await readFile(f,'utf8');
  s.split('\n').forEach((l,i)=>{const m=l.match(leak);if(m)hits.push(`${f}:${i+1}: ${m[0]}`);});}
 assert.deepEqual(hits,[],'CIS-only resource in a shared edition');});
