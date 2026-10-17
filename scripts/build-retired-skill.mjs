// Builds the retired ChatGPT and Codex edition's skill from the multiplatform skill, so existing installs keep working until users move over.
// Run after editing the multiplatform SKILL.md: node scripts/build-retired-skill.mjs. tests/skills.test.mjs fails when the copy is stale.
import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
export const SOURCE='plugins/ai-token-saver-all/skills/model-guidance-all/SKILL.md';
export const TARGET='plugins/ai-token-saver/skills/model-guidance/SKILL.md';
export const NOTICE=`## Retired edition

This ChatGPT and Codex edition is retired and gets no updates after 0.5.0. AI Token Saver (\`ai-token-saver-all\`) replaces it on every platform, ChatGPT and Codex included. If that plugin is also installed in this chat, let it answer: give no recommendation and no notice of your own. Otherwise, once per chat, add this line after the first recommendation: "This AI Token Saver edition is retired. Install AI Token Saver from https://github.com/robbagley-afk/ai-token-saver, then remove this one." Below is AI Token Saver's own guidance, so ChatGPT and Codex answers stay the same, and it covers other platforms the user says they use.`;
const FRONT=`---
name: model-guidance
description: Retired ChatGPT and Codex edition of AI Token Saver. Recommend one exact model and effort, plus a budget choice, for a task using live guidance, and point the user to the multiplatform AI Token Saver plugin. Use when the user asks which model or effort to use, wants to reduce unnecessary AI usage, wants their instructions set up or refreshed, or invokes AI Token Saver.
---

# AI Token Saver (retired edition)
`;
export function buildRetiredSkill(source){
 const lf=source.replace(/\r\n/g,'\n'),body=lf.replace(/^---\n[\s\S]*?\n---\n\n# [^\n]+\n/,'');
 if(body===lf)throw Error('Unexpected multiplatform SKILL.md header: expected front matter, a blank line, then one # title');
 return `${FRONT}\n${NOTICE}\n${body}`;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){await writeFile(TARGET,buildRetiredSkill(await readFile(SOURCE,'utf8')));console.log(`Wrote ${TARGET}`);}
