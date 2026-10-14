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
const multi = () => { const d=fixture(); d.platforms.claude=[{task:'Mechanical text work',pick:'Example Claude Small low'}]; d.platforms.antigravity=[{task:'Mechanical text work',pick:'Example Gemini Fast low'}]; d.platforms.grok=[{task:'Mechanical text work',pick:'Example Grok low'}]; return d; };
test('other vendors return their own picks, all returns every public platform, private rows stay excluded',async()=>{
 const s=createGuidanceService({fetch:async()=>response(multi()),sources:['https://example.org/guide.json']});
 const c=await s.getGuidance('claude');assert.equal(c.platform,'claude');assert.equal(c.bullets[0].pick,'Example Claude Small low');assert.ok(!JSON.stringify(c).includes('OpenAI'));
 assert.equal((await s.getGuidance('antigravity')).bullets[0].pick,'Example Gemini Fast low');assert.equal((await s.getGuidance('grok')).bullets[0].pick,'Example Grok low');
 const o=await s.getGuidance('codex');assert.ok(!/Claude|Gemini|Grok/.test(JSON.stringify(o)));
 const all=await s.getGuidance('all');assert.equal(all.platform,'all');assert.deepEqual(Object.keys(all.platforms).sort(),['antigravity','claude','codex','grok']);assert.equal(all.revision,'r1');assert.ok(!('bullets' in all));assert.ok(!JSON.stringify(all).includes('PRIVATE'));
 await assert.rejects(s.getGuidance('local'));await assert.rejects(s.getGuidance('all','Mechanical text work'));
 const snap=await s.instructionBlock('claude','snapshot');assert.ok(snap.text.includes('Example Claude Small low'));assert.ok(!snap.text.includes('OpenAI'));
 await assert.rejects(s.instructionBlock('all','snapshot'));assert.ok((await s.instructionBlock('all')).text.includes('AI Token Saver'));
});
test('a missing or malformed optional platform fails only that platform',async()=>{
 const d=multi();delete d.platforms.grok;d.platforms.claude[0].pick={x:1};const s=createGuidanceService({fetch:async()=>response(d),sources:['https://example.org']});
 await assert.rejects(s.getGuidance('grok'),/Unsupported platform/);await assert.rejects(s.getGuidance('claude'),/Unsupported platform/);
 assert.equal((await s.getGuidance('codex')).bullets.length,2);assert.deepEqual(Object.keys((await s.getGuidance('all')).platforms).sort(),['antigravity','codex']);
});
