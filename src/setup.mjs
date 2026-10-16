// Builds the one setup prompt a user pastes to install the instruction block and the refresh task on each platform.
// Order is "most able to change the other platforms on the same computer" first: agents with a shell and desktop control, then chat-only apps.
export const RUNNER_ORDER=Object.freeze(['claude','codex','antigravity','chatgpt','grok']);
const NAMES={claude:'Claude',codex:'Codex',antigravity:'Gemini or Antigravity',chatgpt:'ChatGPT',grok:'Grok'};
const SURFACES={
 claude:'Claude account instructions on claude.ai, Settings. Claude Code file ~/.claude/CLAUDE.md.',
 codex:'File ~/.codex/AGENTS.md (Windows %USERPROFILE%\\.codex\\AGENTS.md).',
 antigravity:'Gemini CLI or Antigravity file ~/.gemini/GEMINI.md, or the global rules file that client documents. Gemini app: Settings, saved info.',
 chatgpt:'Settings > Personalization > Custom instructions.',
 grok:'Settings, custom instructions.'
};
export const TASK_NAME='AI Token Saver guidance refresh';
export function buildSetupPrompt({platforms,revision}){
 if(!Array.isArray(platforms)||!platforms.length||platforms.length>10||!platforms.every(p=>RUNNER_ORDER.includes(p)))throw Error('Unsupported platform list');
 if(typeof revision!=='string'||!revision.trim()||revision.length>128)throw Error('Invalid Revision');
 const order=RUNNER_ORDER.filter(p=>platforms.includes(p)),runner=order[0],many=order.length>1;
 const prompt=`AI Token Saver setup.
Platforms to set up: ${order.map(p=>NAMES[p]).join(', ')}
Done so far: none
Baseline Revision: ${revision}
Guidance server (read-only, no authentication): https://ai-token-saver.vercel.app/mcp

Run this in ${NAMES[runner]}${many?', the listed app most able to change the others on this computer. If you are a different listed app, do your own platform and hand off as step 4 says':''}. If you are not a listed app, say so and stop.

Step 1. Instructions for your own platform.
Call get_instruction_block twice for your platform, mode bootstrap and mode snapshot. The block is the bootstrap text, a blank line, then the snapshot text, wrapped in these exact markers:
<!-- model-guidance:start -->
<!-- model-guidance:end -->
Where it goes:
${order.map(p=>`- ${NAMES[p]}: ${SURFACES[p]}`).join('\n')}
For a file: confirm the real path, back it up, replace only the one marked section or add it at the end, keep every other byte, show the diff, read it back. Stop on duplicated or malformed markers. If a sync tool or an organization owns the file, give me the text and change nothing. For an account setting: open the settings page in the in-app browser and ask me to sign in to my own account there. Never type, request or store passwords, codes or tokens. Confirm the signed-in account on the page, replace only the marked block, and read it back. If a page has a character limit, shorten the block, never my own text. With no in-app browser, give me the text and the menu path, and mark it done only after I confirm I saved it.

Step 2. Scheduled task for your own platform.
After a confirmed save, ask: "Would you like me to set up a scheduled task so your instructions stay updated with the best model recommendations as new models are released?" Continue only on yes.
List this platform's existing scheduled tasks first. Sort them into: consumer tasks that check or refresh model guidance in instructions, publisher tasks that research or publish a guide, and unrelated tasks. Never change publisher or unrelated tasks. Show me the consumer tasks. Keep only one active: reuse the best match, and pause the other consumer tasks after one yes from me. Pause, do not delete.
The one task: name "${TASK_NAME}", 1:00 PM in my local timezone on the first Tuesday of each month, so I can be present. If this scheduler has no monthly-weekday option, run every Tuesday at 1:00 PM and have the task exit unless the date is the 1st through the 7th. Say which you used. Reuse an older every-two-weeks refresh task as the best match and change its schedule. A scheduler that lives only in this chat or expires within days does not count: say so and give me the task prompt.
Task prompt: "${TASK_NAME} for PLATFORM. Call get_guidance for PLATFORM, sending only the platform, and build the new block from get_instruction_block, bootstrap plus snapshot. For each instructions page or file approved at setup: if the block is in a file on this computer, back the file up first. If it is an account setting, open the page in the in-app browser and ask me to sign in if needed. Replace only the marked block, read it back, and report what changed with the old and new Revision, or say nothing changed. Never edit outside the markers, switch models, create or change another task, or research or publish a guide. If the plugin is unavailable, report it and change nothing."
Replace PLATFORM before saving. Read the saved task back: name, schedule, timezone, status.
${many?`
Step 3. The other platforms, from here.
For each remaining platform, do steps 1 and 2 from this app only where you can make the change and read it back on this computer: files through a shell or a desktop-control tool, schedulers only through that platform's own documented files or commands. Use a signed-in browser for account settings only if I approve that session. Do not guess another vendor's scheduler format.

Step 4. Hand off what is left.
If any platform is not finished and verified, write one handoff prompt for the next one in order: copy this whole prompt, change "Platforms to set up" to Platforms still to do, update "Done so far", keep the Baseline Revision, and tell me which app to paste it into. One handoff at a time. The app that receives it repeats steps 1 to 4. When nothing is left, say setup is complete.
`:''}
Report one line per platform: instructions UPDATED, PASTE NEEDED or SKIPPED, and task CREATED, REUSED, PROMPT ONLY or SKIPPED, with the schedule you saved and any tasks you paused.

Rules: only one active consumer task per platform. A scheduled run edits account settings only in an interactive session where I sign in. Do not install anything else. If a step fails, show the error and stop that platform.`;
 return {platforms:order,order,runner,task_name:TASK_NAME,schedule:'First Tuesday of each month, 1:00 PM local time',prompt};
}
