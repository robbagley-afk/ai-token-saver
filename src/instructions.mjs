import {readFile,copyFile,writeFile,rename,unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
export const BOOTSTRAP = 'When model choice matters, use the installed AI Token Saver plugin to fetch current guidance. Recommend the cheapest suitable available model and effort, explain why, and cite the returned Revision. Do not switch my model. If the plugin is unavailable, say so rather than inventing current guidance. Preserve my other instructions and data restrictions.';
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
