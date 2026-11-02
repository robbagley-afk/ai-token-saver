import {writeFile} from 'node:fs/promises';import {lessonsMarkdown} from '../src/lessons.mjs';
// Writes the bundled lessons fallback that each edition's skill reads when the server is offline.
for(const dir of ['ai-token-saver-all/skills/model-guidance-all','ai-token-saver/skills/model-guidance'])await writeFile(new URL(`../plugins/${dir}/LESSONS.md`,import.meta.url),lessonsMarkdown());
