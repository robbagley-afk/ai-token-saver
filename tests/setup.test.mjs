import test from 'node:test';import assert from 'node:assert/strict';
import {buildSetupPrompt,RUNNER_ORDER} from '../src/setup.mjs';
import {createGuidanceService} from '../src/guidance.mjs';
test('runner is the selected platform most able to change the others, and order starts with it',()=>{
 const a=buildSetupPrompt({platforms:['chatgpt','antigravity','claude'],revision:'r9'});
 assert.equal(a.runner,'claude');assert.deepEqual(a.order,['claude','antigravity','chatgpt']);
 assert.equal(buildSetupPrompt({platforms:['grok','chatgpt'],revision:'r9'}).runner,'chatgpt');
 assert.deepEqual(RUNNER_ORDER,['claude','codex','antigravity','chatgpt','grok']);
});
test('prompt carries schedule, single-task rule, markers, baseline and the cascade handoff',()=>{
 const {prompt}=buildSetupPrompt({platforms:['codex','claude','codex'],revision:'r9'});
 for(const s of ['Platforms to set up: Claude, Codex','Done so far: none','Baseline Revision: r9','first Tuesday of each month','1:00 PM','in-app browser','sign in to my own account','Never type, request or store passwords','edits account settings only in an interactive session','only one','<!-- model-guidance:start -->','<!-- model-guidance:end -->','handoff','AI Token Saver guidance refresh','https://ai-token-saver.vercel.app/mcp'])assert.ok(prompt.includes(s),s);
 assert.ok(!/LM Studio|Gemma|Coding Helper|localhost/i.test(prompt));assert.ok(prompt.length<6000);
});
test('a single platform gets no cascade and invalid input is rejected',()=>{
 const one=buildSetupPrompt({platforms:['chatgpt'],revision:'r9'});assert.equal(one.runner,'chatgpt');assert.ok(!one.prompt.includes('Platforms still to do'));assert.ok(one.prompt.includes('first Tuesday of each month'));for(const gone of ['every two weeks','Saturday at 10:00 PM','No scheduled run edits account settings'])assert.ok(!one.prompt.includes(gone),gone);assert.equal(one.schedule,'First Tuesday of each month, 1:00 PM local time');
 for(const bad of [[],['all'],['local'],['claude','nope'],'claude',null])assert.throws(()=>buildSetupPrompt({platforms:bad,revision:'r9'}));
 assert.throws(()=>buildSetupPrompt({platforms:['claude'],revision:''}));
});
test('service fills the baseline from the live Revision',async()=>{
 const s=createGuidanceService({sources:['https://example.org'],fetch:async()=>new Response(JSON.stringify({updated:'2026-10-13',revision:'live-r3',rule:'x',platforms:{codex:[{task:'t',pick:'p'}]}}))});
 const r=await s.setupPrompt(['chatgpt','codex']);assert.equal(r.revision,'live-r3');assert.equal(r.runner,'codex');assert.ok(r.prompt.includes('Baseline Revision: live-r3'));
});
