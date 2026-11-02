// Release step: flag the tips sites that must match this release. Exit 1 if the Model Value Map is out of date.
import {readFile} from 'node:fs/promises';
const version=JSON.parse(await readFile('plugins/ai-token-saver-all/plugin.json','utf8')).version;
const prompt=(await readFile('install/all-platforms.md','utf8')).trimEnd();
const unesc=s=>s.replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#x27;',"'").replaceAll('&amp;','&');
const MAP='https://robbagley-afk.github.io/model-value-map/',TOOLKIT='https://robs-ai-expert-toolkit.airy-emu-9499.chatgpt.site/chatgpt-quick-start-guide/';
let bad=0;
const map=await (await fetch(MAP,{cache:'no-store'})).text();
const pre=map.match(/<pre class="copy" id="p-all"[^>]*>([\s\S]*?)<\/pre>/);
if(!pre||unesc(pre[1])!==prompt){bad=1;console.log(`UPDATE ${MAP}#plugin: install prompt differs from install/all-platforms.md (repo robbagley-afk/model-value-map, docs/index.html, pre#p-all)`);}
if(!map.includes(`version ${version}`)){bad=1;console.log(`UPDATE ${MAP}#plugin: heading does not say version ${version}`);}
if(/p-oa|Saturday/.test(map.slice(map.indexOf('id="plugin"'),map.indexOf('id="use"')))){bad=1;console.log(`UPDATE ${MAP}#plugin: retired edition or old schedule still shown`);}
console.log(bad?'':`OK ${MAP}#plugin matches ${version}`);
console.log(`REVIEW ${TOOLKIT} and the rest of the AI Expert Toolkit (~/Local-Infra/ai-expert-toolkit) for plugin links, prompts and steps that changed in ${version}. Publish with the chatgpt-sites-publish skill.`);
process.exit(bad);
