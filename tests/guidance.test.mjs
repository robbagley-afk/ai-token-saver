import test from 'node:test';
import assert from 'node:assert/strict';
import { createGuidanceService } from '../src/guidance.mjs';
const fixture = (revision = 'r1') => ({ updated:'2026-10-13', revision, rule:'Choose the cheapest suitable setting.', source:'https://example.org/', platforms:{ codex:[{task:'Mechanical text work',pick:'Example OpenAI Small low',upgrade:'Example OpenAI Large medium'},{task:'Research and reasoning',pick:'Example OpenAI Large high'}], local:[{pick:'PRIVATE MODEL'}] }, best_value:[{best:'PRIVATE MODEL'}] });
const response = data => new Response(JSON.stringify(data));
test('ChatGPT uses the OpenAI platform and never exposes private/cross-vendor fields', async()=>{
 const s=createGuidanceService({fetch:async()=>response(fixture()),sources:['https://example.org/guide.json']});
 const a=await s.getGuidance('chatgpt'); assert.equal(a.revision,'r1'); assert.equal(a.bullets.length,2); assert.equal(a.platform,'chatgpt'); assert.equal(a.source_url,'https://example.org/guide.json'); assert.ok(!JSON.stringify(a).includes('PRIVATE')); assert.equal(a.best_value,null);
});
test('fallback skips HTTP errors and invalid schemas, and stops on valid data',async()=>{
 let n=0; const s=createGuidanceService({sources:['https://a.test','https://b.test','https://c.test'],fetch:async()=>{n++;return n===1?new Response('',{status:503}):response(n===2?{revision:'bad'}:fixture());}});
 assert.equal((await s.getGuidance('codex')).source_url,'https://c.test'); assert.equal(n,3);
});
test('15-minute cache refresh changes revision without client reinstall',async()=>{
 let clock=0,n=0; const s=createGuidanceService({now:()=>clock,sources:['https://example.org'],fetch:async()=>response(fixture(`r${++n}`))});
 assert.equal((await s.getGuidance('codex')).revision,'r1'); clock=899999;assert.equal((await s.getGuidance('codex')).revision,'r1'); clock=900000; assert.equal((await s.getGuidance('codex')).revision,'r2');
 assert.deepEqual(await s.compareRevision('r2'),{current:'r2',changed:false}); assert.deepEqual(await s.compareRevision('r1'),{current:'r2',changed:true});
});
test('expired data is not silently served after all sources fail',async()=>{
 let clock=0,failed=false;const s=createGuidanceService({now:()=>clock,sources:['https://example.org'],fetch:async()=>{if(failed)throw Error('no');return response(fixture());}});
 await s.getGuidance('codex');clock=900001;failed=true;await assert.rejects(s.getGuidance('codex'),/unavailable/);
});
test('bootstrap is stable, snapshot cites current revision, category filtering is precise',async()=>{
 let clock=0,n=0;const s=createGuidanceService({now:()=>clock,sources:['https://example.org'],fetch:async()=>response(fixture(`r${++n}`))});
 const boot=await s.instructionBlock('codex','bootstrap'); assert.ok(boot.text.includes('AI Token Saver'));clock=900001; assert.equal((await s.instructionBlock('codex','bootstrap')).text,boot.text);
 const snapshot=await s.instructionBlock('codex','snapshot');assert.ok(snapshot.text.startsWith('Updated:'));assert.ok(snapshot.text.includes('Revision: r1'));assert.ok(snapshot.text.includes('https://example.org'));
 assert.equal((await s.getGuidance('codex','Mechanical text work')).bullets.length,1);
 await assert.rejects(s.getGuidance('local'));await assert.rejects(s.getGuidance('codex','unknown'));
});
test('concurrent cold requests share one fetch and malformed bullets fail closed',async()=>{
 let n=0;const s=createGuidanceService({sources:['https://example.org'],fetch:async()=>{n++;await new Promise(r=>setTimeout(r,10));return response(fixture());}});await Promise.all([s.getGuidance('codex'),s.getGuidance('chatgpt')]);assert.equal(n,1);
 const bad=fixture();bad.platforms.codex[0].pick={x:1};const b=createGuidanceService({sources:['https://example.org'],fetch:async()=>response(bad)});await assert.rejects(b.getGuidance('codex'),/unavailable/);
});
