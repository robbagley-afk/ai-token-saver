import {BOOTSTRAP} from './instructions.mjs';
export const SOURCES=Object.freeze([
 'https://robbagley-afk.github.io/model-value-map/guidance.json',
 'https://raw.githubusercontent.com/robbagley-afk/model-value-map/main/docs/guidance.json',
 'https://cdn.jsdelivr.net/gh/robbagley-afk/model-value-map@main/docs/guidance.json'
]);
const OPTIONAL=Object.freeze(['claude','antigravity','grok']);
export const PLATFORMS=Object.freeze(['chatgpt','codex',...OPTIONAL,'all']);
export function createGuidanceService({fetch=globalThis.fetch,now=Date.now,sources=SOURCES}={}){
 let cached=null,expires=0,inflight=null;
 const text=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 const normalize=rows=>Array.isArray(rows)&&rows.length&&rows.length<=50&&rows.every(b=>text(b?.task,160)&&text(b?.pick,2000)&&(b.upgrade===undefined||text(b.upgrade,2000)))?rows.map(b=>({task:b.task,pick:b.pick,...(b.upgrade?{upgrade:b.upgrade}:{})})):null;
 async function load(){
  if(cached&&now()<expires)return cached;
  if(inflight)return inflight;
  inflight=(async()=>{
   for(const url of sources){try{
    const r=await fetch(url,{signal:AbortSignal.timeout(6000),headers:{Accept:'application/json'},redirect:'error'});
    if(!r.ok)continue;
    const raw=await r.text();if(raw.length>200000)continue;
    const d=JSON.parse(raw);
    if(!text(d.updated,80)||!text(d.revision,128)||!text(d.rule,4000))continue;
    const normalized=normalize(d?.platforms?.codex);if(!normalized)continue;
    // Allowlist per-vendor rows only. The codex list is required; other vendors are optional and fail alone. Local-model rows and cross-vendor best_value are intentionally excluded.
    const vendors={codex:normalized};for(const key of OPTIONAL){const rows=normalize(d.platforms[key]);if(rows)vendors[key]=rows;}
    cached={updated:d.updated,revision:d.revision,rule:d.rule,bullets:normalized,vendors,best_value:normalized.find(b=>b.task==='General agentic judgment')?.pick??null,source_url:url};expires=now()+900000;return cached;
   }catch{/* Retry the next canonical mirror, without logging request content. */}}
   throw Error('Current guidance is unavailable. Try again later; no stale recommendation was returned.');
  })();
  try{return await inflight;}finally{inflight=null;}
 }
 // chatgpt and codex share the OpenAI list, as the public guide specifies.
 const rowsFor=(d,platform)=>{if(!PLATFORMS.includes(platform)||platform==='all')throw Error('Unsupported platform');const rows=Object.hasOwn(d.vendors,platform==='chatgpt'?'codex':platform)?d.vendors[platform==='chatgpt'?'codex':platform]:null;if(!rows)throw Error('Unsupported platform');return rows;};
 const head=d=>({updated:d.updated,revision:d.revision,rule:d.rule,source_url:d.source_url});
 return {
  async getGuidance(platform,category){
   if(!PLATFORMS.includes(platform))throw Error('Unsupported platform');const d=await load();
   if(platform==='all'){if(category)throw Error('Category filtering needs one platform');return {...head(d),platform,platforms:structuredClone(d.vendors)};}
   let bullets=rowsFor(d,platform);const openai=bullets===d.bullets;if(category){bullets=bullets.filter(b=>b.task.toLowerCase()===category.toLowerCase());if(!bullets.length)throw Error('Unknown task category; call get_guidance without a category to see current choices.');}return {...head(d),best_value:openai?d.best_value:null,platform,bullets:structuredClone(bullets)};},
  async instructionBlock(platform,mode='bootstrap'){if(!PLATFORMS.includes(platform))throw Error('Unsupported platform');if(mode==='bootstrap')return {platform,mode,text:BOOTSTRAP};if(mode!=='snapshot')throw Error('Unsupported instruction mode');const d=await load(),rows=rowsFor(d,platform);return {platform,mode,revision:d.revision,text:`Updated: ${d.updated}\nRevision: ${d.revision}\nSource: ${d.source_url}\n\n${d.rule}\n\n${rows.map(b=>`- ${b.task}: ${b.pick}${b.upgrade?` Upgrade only after a failed check: ${b.upgrade}`:''}`).join('\n')}\n\nThis snapshot can become stale. Invoke AI Token Saver for current guidance. Do not switch the user’s model.`};},
  async compareRevision(installedRevision){if(!text(installedRevision,128))throw Error('Invalid installed Revision');const d=await load();return {current:d.revision,changed:d.revision!==installedRevision};}
 };
}
