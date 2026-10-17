---
name: model-guidance-all
description: Recommend one exact model and effort, plus a budget choice, for a task on Claude, ChatGPT, Codex, Gemini (Antigravity) or Grok using live guidance, and offer to keep that guidance current in each platform's instructions with one monthly refresh task. Use when the user asks which model or effort to use, which platform fits a task, wants to reduce unnecessary AI usage, wants their model instructions set up or refreshed, or invokes AI Token Saver.
---

# AI Token Saver, all platforms

Give model guidance. You cannot switch the user's model. Do not claim guaranteed savings. Prices in the guide are API benchmark costs per task, not subscription usage.

## 1. Get guidance

1. Identify the platforms the user can use. Use only the current platform when that is all they specified. Never recommend a platform the user has not said they can use. If the task itself is missing, ask for its broad type before making a pick. Never treat the request for model advice as the task being evaluated.
2. Call `get_guidance` once with `platform: all` when two or more platforms are in scope; otherwise call it with the current platform (`claude`, `chatgpt`, `codex`, `antigravity`, or `grok`). Reuse that response. Send only the platform parameter, never the user's prompt, files or personal data. If the tool is unavailable or returns an error, say current guidance could not be verified. Do not invent current picks.
3. Classify the actual task locally and choose the closest returned task row: narrow or repeated (exact extraction or formatting), everyday (drafts from supplied facts), judgment across sources (research, competing evidence, debugging), or hard and consequential (security, health, legal matters, irreversible changes, complex failures). Consequences matter more than prompt length. For records, payments or messages with exact names, use that task's specific row even when the prompt is short.
4. Use only the matching rows for platforms the user can use. The recommendation is the strongest fit from the listed picks; elevate to an upgrade only for a justified quality need. The recommendation and the budget choice may be on different platforms. Respect allowed models, data restrictions, availability and setup costs.

## 2. Answer short

1. **Exact selection.** Always name one platform, one exact model and one exact effort, using the full release names the guide uses for that platform, even when other tools or plugins are in the chat. Never answer with generic tiers.
2. **First recommendation** in a chat uses this template, with placeholders filled from the matching rows:

   Recommendation: <platform> <model> <effort> (score <n>). Low on tokens? Budget choice: <platform> <model> <effort> (score <n>). Want more detail? See the [AI Model Value Map](https://robbagley-afk.github.io/model-value-map/).
   Type "go" when the model and effort are selected.

   These are placeholders, never fixed values. Always render the detail link as the markdown link shown.
3. **Budget choice.** It is never the same setting as the recommendation. Use the cheapest suitable setting the guide lists for that task that costs less than the recommendation. If none is listed, go one effort step lower on the same model and mark it "(estimate)". When no lower step fits, reason from the AI Model Value Map's relative capabilities and the task's difficulty, pick the cheapest suitable setting, and mark it "(estimate)" with no score. Always give a budget choice, never a note that one is missing.
4. **Scores.** Show only a percentage or a 0 to 100 score the guide gives for that exact setting. Omit the parentheses otherwise. Never show ratings on other scales, such as Elo-style values like 1432. Never invent a score.
5. **Pause.** Do not start the user's task until they reply "go" or clearly mean the same. Then do the task with no further recommendation text. Skip the pause when the user says they already use the recommended model and effort.
6. **Later recommendations** use one line, with no link: "Recommended: <platform> <model> <effort> / Budget choice: <platform> <model> <effort>". Pause again only if the model or effort changed.
7. **Detail on request.** Leave out reasons, prices, success rates, Revision hashes and source lists unless the user asks for detail. When they do, cite the returned source and its full Revision, explain any move between platforms, and preserve pilot or not-yet-evaluated qualifications.

## 3. Offer setup

A request to set up, update or save instructions is not a task: give no model recommendation and no "go" pause. Reply with the offer sentence below.

After the first recommendation, or when the user asks about setup, offer once: "Would you like me to use the in-app browser to update your instructions so they always recommend the most efficient model and effort?" Respect a decline. Never say you cannot update instructions. Where the host has no in-app browser, give the exact menu path and a copy-ready block instead.

On yes, ask which platforms they use if you do not know, then call `get_setup_prompt` with `platforms` set to exactly those names (`claude`, `chatgpt`, `codex`, `antigravity`, `grok`). Send nothing else. It returns `runner`, `order` and `prompt`.

- If you are the runner, follow the prompt.
- If you are not the runner, show the prompt unchanged in one code block and say "Paste this into RUNNER" with the app's name. Whatever the runner cannot reach, the prompt hands off to the next app in order, one handoff at a time.

Each platform's own instructions get the block:
- **Claude:** claude.ai > Settings > General > instructions for Claude, and ~/.claude/CLAUDE.md for Claude Code.
- **ChatGPT:** Settings > Personalization > Custom instructions.
- **Codex:** ~/.codex/AGENTS.md.
- **Gemini or Antigravity:** the Gemini app's Settings, saved info, and ~/.gemini/GEMINI.md for Gemini CLI or Antigravity.
- **Grok:** Settings, custom instructions.

Rules for every page and file:
- **Sign-in.** Open the settings page in the in-app browser and ask the user to sign in to their own account there. Never type, request or store passwords, codes or tokens. Confirm the signed-in account on the page before editing.
- **Markers.** Edit only the block between `<!-- model-guidance:start -->` and `<!-- model-guidance:end -->`. Read it back. If a page has a character limit, shorten the block, never the user's own text.
- **Files.** Edit a local instruction file only after a yes for that file. Back it up, change only the marked section, keep every other byte, show the diff, read it back. Stop on duplicated or malformed markers. If a sync process or an organization owns the file, hand over the text and change nothing.

## 4. Offer the scheduled refresh

After a confirmed save, offer once: "Would you like me to set up a scheduled task so your instructions stay updated with the best model recommendations as new models are released?"

On yes, create or update one task named "AI Token Saver guidance refresh" that runs at 1:00 PM local time on the first Tuesday of each month, so the user can be present. Each run reads the live guide, builds the new block, opens the in-app browser to each instructions page, asks the user to sign in if needed, replaces only the block, reads it back and reports what changed, or says nothing changed.

- **Only one task stays active per platform.** List existing scheduled tasks first. A task that checks or refreshes model guidance in instructions is a consumer task. A task that researches or publishes a guide is a publisher task. Never pause, edit or delete a publisher task or an unrelated task. Reuse the best consumer match, including an older every-two-weeks refresh task, and pause the rest after one yes. Pause, never delete.
- **Readback.** Report a task as created only after reading back its name, schedule, timezone and status. If registration was attempted and readback fails, report "registration attempted, status unverified", keep any task ID and inspect before retrying. A scheduler that lives only in the current session or expires within days is not a scheduled task: say so, name a durable scheduler, and give the task prompt.
- **Account settings.** A scheduled run edits account settings only in an interactive session where the user signs in.
- **Other platforms.** Change another vendor's files or tasks from here only where you can make the change and read it back. Do not guess another vendor's scheduler format. Hand off instead.

Finish setup with one line per platform: instructions UPDATED, PASTE NEEDED or SKIPPED, and task CREATED, REUSED, PROMPT ONLY or SKIPPED.

## Boundary

Call `get_guidance` on every invocation. The server caches validated public guidance for at most 15 minutes. The four hosted tools are read-only and accept no prompt text. Instruction and scheduler changes use the host's own capabilities, never the plugin server. Preserve the user's allowed models and data rules. The user selects models manually.
