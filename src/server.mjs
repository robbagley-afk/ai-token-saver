import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {z} from 'zod';import {createGuidanceService} from './guidance.mjs';
const annotations={readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:true};
const platform=z.enum(['chatgpt','codex']);
const service=createGuidanceService();
export function createHandler(guidance=service){return async(req,res,body=req.body)=>{
 if(req.method!=='POST'){res.writeHead(405,{'Allow':'POST','Content-Type':'application/json'});res.end(JSON.stringify({jsonrpc:'2.0',error:{code:-32000,message:'Use POST for this stateless MCP server.'},id:null}));return;}
 if(JSON.stringify(body??{}).length>8192){res.writeHead(413);res.end();return;}
 const server=new McpServer({name:'ai-token-saver',version:'0.1.0'});
 const register=(name,description,inputSchema,call)=>server.registerTool(name,{description,inputSchema,annotations},async(args)=>{
  try{const data=await call(args);return {structuredContent:data,content:[{type:'text',text:data.revision?`Current guidance Revision: ${data.revision}. Use structuredContent for the guidance.`:data.text??`Current Revision: ${data.current}. Changed: ${data.changed}.`}]};}
  catch{return {isError:true,content:[{type:'text',text:'Current guidance could not be returned. Check the platform/category or try again later. No stale guidance was used.'}]};}
 });
 register('get_guidance','Fetch current OpenAI model and effort guidance. Use before recommending settings. Send only platform and an optional task-category label, never prompt text or user data.',z.object({platform,category:z.string().trim().min(1).max(160).optional()}).strict(),({platform,category})=>guidance.getGuidance(platform,category));
 register('get_instruction_block','Return optional one-time bootstrap instructions. Set mode to snapshot only when a user explicitly requests dated full guidance. This tool never saves account settings or edits files.',z.object({platform,mode:z.enum(['bootstrap','snapshot']).default('bootstrap')}).strict(),({platform,mode})=>guidance.instructionBlock(platform,mode));
 register('compare_revision','Compare a previously seen public guide Revision with the current one. Optional manual check; ordinary plugin use updates automatically.',z.object({installed_revision:z.string().trim().min(1).max(128)}).strict(),({installed_revision})=>guidance.compareRevision(installed_revision));
 const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
 // Each request owns its transport/server; the validated public guide cache alone is shared.
 res.once('close',()=>{void transport.close();void server.close();});
 try{await server.connect(transport);await transport.handleRequest(req,res,body);}
 catch{if(!res.headersSent){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({jsonrpc:'2.0',error:{code:-32603,message:'MCP request failed'},id:null}));}}
};}
