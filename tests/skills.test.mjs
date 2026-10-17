import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {buildRetiredSkill,SOURCE,TARGET} from '../scripts/build-retired-skill.mjs';
const skills=[TARGET,SOURCE];
const manifests=['plugins/ai-token-saver/plugin.json','plugins/ai-token-saver-all/plugin.json','plugins/ai-token-saver-all/.claude-plugin/plugin.json'];
test('both skills carry the short template, pause, estimate, setup offer, sign-in and monthly refresh',async()=>{for(const f of skills){const s=await readFile(f,'utf8');
 for(const need of ['Low on tokens? Budget choice:','[AI Model Value Map](https://robbagley-afk.github.io/model-value-map/)','Type "go" when the model and effort are selected.','Recommended: <','(estimate)','never the same setting as the recommendation','is not a task','Always give a budget choice','1432','Would you like me to use the in-app browser to update your instructions so they always recommend the most efficient model and effort?','Never type, request or store passwords, codes or tokens','<!-- model-guidance:start -->','<!-- model-guidance:end -->','Would you like me to set up a scheduled task so your instructions stay updated with the best model recommendations as new models are released?','AI Token Saver guidance refresh','1:00 PM local time on the first Tuesday of each month','A scheduled run edits account settings only in an interactive session where the user signs in.'])assert.ok(s.includes(need),`${f}: ${need}`);
 for(const gone of [/every two weeks,? Saturday/i,/Saturday (?:at )?10:00 PM/i,/never edits account settings/i,/Ensign|\bCES\b|ChatGPT Edu|LM Studio|Coding Helper|FERPA/i,/Best Choice/,/not listed/i])assert.ok(!gone.test(s),`${f}: ${gone}`);}});
test('one vendor stays within that vendor, the ChatGPT-only behavior of the retired edition',async()=>{const s=await readFile(SOURCE,'utf8');
 for(const need of ['When only one vendor is in scope, such as ChatGPT alone or ChatGPT with Codex, stay within that vendor. Make no platform comparison and no switch suggestion.','ChatGPT and Codex are one vendor, OpenAI, and share one list.','If they named none, assume only the current platform.','Never recommend a platform the user has not said they can use.','you may drop the platform name or name ChatGPT or Codex'])assert.ok(s.includes(need),need);});
test('switching rules: half the cost at project start, a third mid-project, phase plans for long projects, and always a stay option',async()=>{const s=await readFile(SOURCE,'utf8');
 for(const need of ['**Start of a project.**','costs at most half as much','**Long multi-phase project.**','Phase plan: 1. <phase> on <platform> <model> <effort>. 2. <phase> on <platform> <model> <effort>. <n> handoff(s).','Never split a short task.','**Mid-project.**','costs at most a third as much','"Or stay on <current platform>: <model> <effort> (score <n>)."','put the stay line from section 2 before the "go" line','favor the platform the user is on when the difference is small','Never put restricted data in a handoff'])assert.ok(s.includes(need),need);
 assert.ok(s.indexOf('## 2. Choose the platform')<s.indexOf('## 3. Answer short'));});
test('retired edition is the multiplatform skill plus a retirement notice, and is regenerated',async()=>{
 const src=await readFile(SOURCE,'utf8'),stub=await readFile(TARGET,'utf8');
 assert.equal(stub,buildRetiredSkill(src),'run node scripts/build-retired-skill.mjs');
 assert.match(stub,/^---\nname: model-guidance\n/);assert.ok(stub.includes('defer to it and say nothing'));assert.ok(stub.includes('https://github.com/robbagley-afk/ai-token-saver'));
 assert.ok(stub.endsWith(src.slice(src.indexOf('Give model guidance.'))));});
test('every manifest is 0.5.0 and the retired edition says so',async()=>{for(const f of manifests)assert.equal(JSON.parse(await readFile(f,'utf8')).version,'0.5.0',f);
 const stub=JSON.parse(await readFile(manifests[0],'utf8'));assert.match(stub.extensions['com.openai'].interface.displayName,/retired/);assert.match(stub.description,/^Retired\./);
 assert.equal(JSON.parse(await readFile(manifests[1],'utf8')).extensions['com.openai'].interface.displayName,'AI Token Saver');});
test('marketplaces list the multiplatform plugin first and Claude lists only it',async()=>{
 const codex=JSON.parse(await readFile('.agents/plugins/marketplace.json','utf8')),claude=JSON.parse(await readFile('.claude-plugin/marketplace.json','utf8'));
 assert.deepEqual(codex.plugins.map(p=>p.name),['ai-token-saver-all','ai-token-saver']);assert.deepEqual(claude.plugins.map(p=>p.name),['ai-token-saver-all']);});
test('homepage carries the one install prompt verbatim and no retired-edition prompt',async()=>{
 const page=await readFile('public/index.html','utf8'),prompt=(await readFile('install/all-platforms.md','utf8')).trimEnd();
 const pre=page.match(/<pre id="p-all">([\s\S]*?)<\/pre>/)[1].replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
 assert.equal(pre,prompt);assert.ok(!page.includes('p-oa'));assert.ok(!/Saturday|every two weeks/.test(page));});
