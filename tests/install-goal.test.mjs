import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildSetupPrompt,RUNNER_ORDER} from '../src/setup.mjs';
test('every platform selection starts with native goal activation and retains declines and handoff state',async()=>{
 const policy=await readFile('install/goal-policy.md','utf8');
 for(let mask=1;mask<(1<<RUNNER_ORDER.length);mask++){
  const platforms=RUNNER_ORDER.filter((_,i)=>mask&(1<<i));
  const {prompt}=buildSetupPrompt({platforms,revision:'a'.repeat(64)});
  assert.ok(prompt.includes(policy));
  assert.ok(prompt.indexOf('## Installation goal')<prompt.indexOf('Step 1.'));
  assert.ok(prompt.length<8000,`${platforms}: prompt length ${prompt.length}`);
 }
 for(const file of ['install/all-platforms.md','plugins/ai-token-saver-all/skills/model-guidance-all/SKILL.md','plugins/ai-token-saver/skills/model-guidance/SKILL.md']){
  const s=await readFile(file,'utf8');assert.ok(s.includes(policy),file);
 }
 for(const invariant of ['verify active status before proceeding','preserve unrelated goals','Silence, failure and handoff never mean declined or done','respect sign-in, permission and safety gates','no pending/blocked work','goal, checklist, evidence, declines and next action']) assert.ok(policy.includes(invariant),invariant);
});
