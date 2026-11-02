import {readFile,copyFile,writeFile,rename,unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
export const BOOTSTRAP = 'When model choice matters, use the installed AI Token Saver plugin to fetch current guidance. Identify my actual task type first; ask if it is missing. Follow the installed plugin’s recommendation format, explain the task-specific evidence and tradeoff, and cite the returned Revision. Skip model advice and any "go" pause for commands that run my own agent team or workflow, handoffs between agents, continuing work I already approved, and scheduled runs. When you pick a model or effort yourself, such as for subagents, sub-sessions, workers or tasks you start or drive, use the Budget choice. Use the Recommendation instead only when the Budget choice scores more than 10 points lower, or the work is high-stakes. Do not switch my model. If the plugin is unavailable, say so rather than inventing current guidance. Preserve my other instructions and data restrictions.';
const SESSION_CORE='One task per chat. When I ask for something unrelated, suggest a new chat with a short brief instead of continuing this one. Keep small follow-ups here. At about 150k tokens, or when the task is done, write a handoff (goal, files, decisions, next step) and start fresh. Do not reuse a chat idle for over an hour. Why: each turn re-reads the whole chat, so a long chat spends tokens, context and credits on every reply.';
// Per-platform wording for the session rule. Only Claude Code gets the auto-compact setting.
export const SESSION_RULES=Object.freeze({
 claude:`${SESSION_CORE} In Claude Code, suggest auto-compact at 200k for Opus and Sonnet: run /autocompact 200k, or add "modelSettings": {"claude-opus-5-5": {"autoCompactWindow": 200000}, "claude-sonnet-5-5": {"autoCompactWindow": 200000}} to ~/.claude/settings.json. Why: compacting at 200k keeps each turn smaller than a full context window.`,
 codex:`${SESSION_CORE} In Codex, start a new session or thread for each task.`,
 chatgpt:`${SESSION_CORE} In ChatGPT, start a new chat for each task. Use a project to keep related chats together.`,
 antigravity:`${SESSION_CORE} In Gemini or Antigravity, start a new conversation for each task.`,
 grok:`${SESSION_CORE} In Grok, start a new chat for each task.`
});
export const sessionRule=platform=>platform==='all'?SESSION_CORE:SESSION_RULES[platform];
const START='<!-- model-guidance:start -->',END='<!-- model-guidance:end -->';
export function replaceSection(original,block){
 if(typeof original!=='string'||typeof block!=='string'||!block.trim()||block.includes(START)||block.includes(END))throw Error('Invalid instruction block');
 const wrapped=`${START}\n${block.trim()}\n${END}`;
 const starts=original.split(START).length-1,ends=original.split(END).length-1;
 if(starts||ends){
  if(starts!==1||ends!==1||original.indexOf(END)<original.indexOf(START))throw Error('Ambiguous or malformed guidance boundaries');
  return original.slice(0,original.indexOf(START))+wrapped+original.slice(original.indexOf(END)+END.length);
 }
 const headings=[...original.matchAll(/^(#{1,6})[ \t]+Model and effort guidance[ \t]*\r?$/gmi)];
 if(headings.length>1)throw Error('Ambiguous guidance headings');
 if(headings.length){
  const h=headings[0],tail=original.slice(h.index+h[0].length);
  const next=[...tail.matchAll(/^(#{1,6})[ \t]+[^\r\n]+/gm)].find(m=>m[1].length<=h[1].length);
  const end=next?h.index+h[0].length+next.index:original.length;
  return original.slice(0,h.index)+wrapped+'\n'+original.slice(end);
 }
 return original+(original.endsWith('\n')||!original?'':'\n')+(original?'\n':'')+wrapped+'\n';
}
export async function installInstructions(path,block=BOOTSTRAP){
 let original='',exists=true;try{original=await readFile(path,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;exists=false;}
 const updated=replaceSection(original,block);if(updated===original)return {changed:false,backup:null};
 const backup=exists?`${path}.backup-${new Date().toISOString().replaceAll(':','-')}-${randomUUID()}`:null;
 if(backup)await copyFile(path,backup,1);
 const staged=`${path}.staging-${randomUUID()}`;
 try{await writeFile(staged,updated,{encoding:'utf8',mode:0o600,flag:'wx'});await rename(staged,path);}catch(e){await unlink(staged).catch(()=>{});throw e;}
 if(await readFile(path,'utf8')!==updated)throw Error('Instruction destination verification failed');
 return {changed:true,backup,original,updated};
}
