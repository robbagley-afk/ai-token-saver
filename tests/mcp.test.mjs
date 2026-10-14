import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from 'node:http';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {createHandler} from '../src/server.mjs';import {createGuidanceService} from '../src/guidance.mjs';
test('real MCP client initializes, lists all three tools, calls them, rejects user-data fields',async()=>{
 const service=createGuidanceService({sources:['https://example.org/guide.json'],fetch:async()=>new Response(JSON.stringify({updated:'2026-10-13',revision:'integration-r1',rule:'Choose the cheapest suitable pick.',platforms:{codex:[{task:'Mechanical text work',pick:'Example OpenAI Small low'}],claude:[{task:'Mechanical text work',pick:'Example Claude Small low'}]}}))});
 const handler=createHandler(service);const http=createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;await handler(req,res,body?JSON.parse(body):undefined);});await new Promise(r=>http.listen(0,'127.0.0.1',r));
 const client=new Client({name:'validation',version:'1.0.0'});try{
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${http.address().port}/mcp`)));
  const tools=await client.listTools();assert.deepEqual(tools.tools.map(t=>t.name),['get_guidance','get_instruction_block','compare_revision','get_setup_prompt']);assert.ok(tools.tools.every(t=>t.annotations.readOnlyHint&&!t.annotations.destructiveHint));
  assert.ok(!('category' in tools.tools[0].inputSchema.properties));
  const result=await client.callTool({name:'get_guidance',arguments:{platform:'chatgpt'}});assert.equal(result.structuredContent.revision,'integration-r1');assert.ok(result.content[0].text.includes('Example OpenAI Small low'));assert.ok(result.content[0].text.includes('https://example.org/guide.json'));
  const block=await client.callTool({name:'get_instruction_block',arguments:{platform:'codex'}});assert.ok(block.structuredContent.text.includes('AI Token Saver'));
  const diff=await client.callTool({name:'compare_revision',arguments:{installed_revision:'integration-r1'}});assert.equal(diff.structuredContent.changed,false);
  const other=await client.callTool({name:'get_guidance',arguments:{platform:'claude'}});assert.equal(other.structuredContent.bullets[0].pick,'Example Claude Small low');const every=await client.callTool({name:'get_guidance',arguments:{platform:'all'}});assert.deepEqual(Object.keys(every.structuredContent.platforms).sort(),['claude','codex']);
  const setup=await client.callTool({name:'get_setup_prompt',arguments:{platforms:['chatgpt','claude']}});assert.equal(setup.structuredContent.runner,'claude');assert.ok(setup.structuredContent.prompt.includes('Baseline Revision: integration-r1'));const badSetup=await client.callTool({name:'get_setup_prompt',arguments:{platforms:['local']}});assert.equal(badSetup.isError,true);
  const invalid=await client.callTool({name:'get_guidance',arguments:{platform:'local'}});assert.equal(invalid.isError,true);
  const extra=await client.callTool({name:'get_guidance',arguments:{platform:'codex',prompt:'Never transmit this'}});assert.equal(extra.isError,true);
  const response=await fetch(`http://127.0.0.1:${http.address().port}/mcp`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({padding:'x'.repeat(9000)})});assert.equal(response.status,413);
 }finally{await client.close();await new Promise(r=>http.close(r));}
});
