import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {z} from 'zod';import {createGuidanceService,PLATFORMS} from './guidance.mjs';import {RUNNER_ORDER} from './setup.mjs';
const annotations={readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:true};
const platform=z.enum(PLATFORMS);
const service=createGuidanceService();
export function createHandler(guidance=service){return async(req,res,body=req.body)=>{
 if(req.method!=='POST'){res.writeHead(405,{'Allow':'POST','Content-Type':'application/json'});res.end(JSON.stringify({jsonrpc:'2.0',error:{code:-32000,message:'Use POST for this stateless MCP server.'},id:null}));return;}
 if(JSON.stringify(body??{}).length>8192){res.writeHead(413);res.end();return;}
 const server=new McpServer({name:'ai-token-saver',version:'0.4.0'});
 const register=(name,description,inputSchema,call)=>server.registerTool(name,{description,inputSchema,annotations},async(args)=>{
  try{const data=await call(args);return {structuredContent:data,content:[{type:'text',text:JSON.stringify(data)}]};}
  catch{return {isError:true,content:[{type:'text',text:'Current guidance could not be returned. Check the platform or try again later. No stale guidance was used.'}]};}
 });
 register('get_guidance','Fetch current model and effort guidance for all task categories. Platform chatgpt or codex returns OpenAI picks, claude, antigravity (Gemini) or grok returns that vendor, and all returns every vendor in one response under platforms. Call once before recommending settings and choose the category locally. Send only platform, never prompt text or user data.',z.object({platform}).strict(),({platform})=>guidance.getGuidance(platform));
 register('get_instruction_block','Return optional one-time bootstrap instructions. Set mode to snapshot only when a user explicitly requests dated full guidance. This tool never saves account settings or edits files.',z.object({platform,mode:z.enum(['bootstrap','snapshot']).default('bootstrap')}).strict(),({platform,mode})=>guidance.instructionBlock(platform,mode));
 register('compare_revision','Compare a previously seen public guide Revision with the current one. Optional manual check; ordinary plugin use updates automatically.',z.object({installed_revision:z.string().trim().min(1).max(128)}).strict(),({installed_revision})=>guidance.compareRevision(installed_revision));
 register('get_setup_prompt','Build the one setup prompt that installs the instruction block and the monthly refresh task (first Tuesday, 1:00 PM local time) on each platform the user names. Returns the platform to run it in and the order. Send only the platform names the user gave, never prompt text or user data. This tool changes nothing.',z.object({platforms:z.array(z.enum(RUNNER_ORDER)).min(1).max(5)}).strict(),({platforms})=>guidance.setupPrompt(platforms));
 const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
 // Each request owns its transport/server; the validated public guide cache alone is shared.
 res.once('close',()=>{void transport.close();void server.close();});
 try{await server.connect(transport);await transport.handleRequest(req,res,body);}
 catch{if(!res.headersSent){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({jsonrpc:'2.0',error:{code:-32603,message:'MCP request failed'},id:null}));}}
};}
