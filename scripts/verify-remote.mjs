import {Client} from '@modelcontextprotocol/sdk/client/index.js';import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';import assert from 'node:assert/strict';
const url=process.argv[2];if(!url)throw Error('Pass the verified HTTPS MCP endpoint');
const client=new Client({name:'ai-token-saver-release-check',version:'0.1.0'});
try{
 await client.connect(new StreamableHTTPClientTransport(new URL(url)));
 const list=await client.listTools();assert.deepEqual(list.tools.map(t=>t.name),['get_guidance','get_instruction_block','compare_revision','get_setup_prompt']);
 const raw=await fetch('https://robbagley-afk.github.io/model-value-map/guidance.json');assert.ok(raw.ok);const live=await raw.json();
 const results={endpoint:url,revision:live.revision,tools:[]};
 for(const platform of ['chatgpt','codex']){
  const r=await client.callTool({name:'get_guidance',arguments:{platform}});assert.ok(!r.isError);assert.equal(r.structuredContent.revision,live.revision);assert.ok(r.structuredContent.bullets.length);assert.ok(!/Gemma|LM Studio|Claude|Haiku|Sonnet|Opus|tail\d+/i.test(JSON.stringify(r.structuredContent)));results.tools.push(`get_guidance:${platform}`);
 }
 for(const platform of ['claude','antigravity','grok']){
  const r=await client.callTool({name:'get_guidance',arguments:{platform}});assert.ok(!r.isError);assert.equal(r.structuredContent.revision,live.revision);assert.deepEqual(r.structuredContent.bullets.map(b=>b.pick),live.platforms[platform].map(b=>b.pick));assert.ok(!/LM Studio|tail\d+/i.test(JSON.stringify(r.structuredContent)));results.tools.push(`get_guidance:${platform}`);
 }
 const every=await client.callTool({name:'get_guidance',arguments:{platform:'all'}});assert.deepEqual(Object.keys(every.structuredContent.platforms).sort(),['antigravity','claude','codex','grok']);assert.ok(!/LM Studio|Gemma|tail\d+/i.test(JSON.stringify(every.structuredContent)));results.tools.push('get_guidance:all');
 const local=await client.callTool({name:'get_guidance',arguments:{platform:'local'}});assert.equal(local.isError,true);results.tools.push('get_guidance:local rejected');
 const b=await client.callTool({name:'get_instruction_block',arguments:{platform:'chatgpt'}});assert.ok(b.structuredContent.text.includes('AI Token Saver'));results.tools.push('get_instruction_block:bootstrap');
 const s=await client.callTool({name:'get_instruction_block',arguments:{platform:'codex',mode:'snapshot'}});assert.equal(s.structuredContent.revision,live.revision);results.tools.push('get_instruction_block:snapshot');
 for(const [revision,changed] of [[live.revision,false],['release-stub-old-revision',true]]){const r=await client.callTool({name:'compare_revision',arguments:{installed_revision:revision}});assert.equal(r.structuredContent.changed,changed);results.tools.push(`compare_revision:${changed}`);}
 const setup=await client.callTool({name:'get_setup_prompt',arguments:{platforms:['chatgpt','claude','codex']}});assert.equal(setup.structuredContent.runner,'claude');assert.ok(setup.structuredContent.prompt.includes(`Baseline Revision: ${live.revision}`));assert.ok(setup.structuredContent.prompt.includes('first Tuesday of each month'));results.tools.push('get_setup_prompt');
 console.log(JSON.stringify(results,null,2));
}finally{await client.close();}
