import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';import {createHandler} from '../src/server.mjs';
const handler=createHandler();const allowed=new Map([['/','index.html'],['/privacy','privacy.html'],['/support','support.html'],['/terms','terms.html'],['/icon.svg','icon.svg'],['/favicon.ico','favicon.ico']]);
createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/mcp'||path==='/api/mcp'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192){res.writeHead(413);res.end();return;}}let body;try{body=raw?JSON.parse(raw):undefined;}catch{res.writeHead(400);res.end();return;}return handler(req,res,body);}
 const file=allowed.get(path);if(!file){res.writeHead(404);res.end();return;}
 try{const data=await readFile(new URL(`../public/${file}`,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.ico')?'image/x-icon':'text/html; charset=utf-8'});res.end(data);}catch{res.writeHead(404);res.end();}
}).listen(Number(process.env.PORT??3107),'127.0.0.1',()=>console.log('AI Token Saver local validation server ready'));
