---
name: model-guidance
description: Recommend one exact OpenAI model and effort, plus a budget choice, for a task using live guidance, and offer to keep that guidance current in ChatGPT and Codex instructions. Use when the user asks which model or effort to use, wants to reduce unnecessary AI usage, wants their instructions set up or refreshed, or invokes AI Token Saver.
---

# AI Token Saver

Give model guidance. You cannot switch the user's model. Do not claim guaranteed savings or attribute API benchmark prices to subscription usage.

## 1. Get guidance

1. Call this plugin's `get_guidance` once with `platform: chatgpt` or `codex`. It returns every supported task category. Reuse that response for this recommendation. Send only the platform, never the user's prompt, files or personal data. If the tool is unavailable, say current guidance could not be verified. Do not invent a current pick.
2. Identify the actual task first. If it is missing, ask for its broad type before making a pick. Never treat the request for model advice as the task being evaluated. Classify the task locally and choose the closest task row: narrow/repeated (exact extraction or formatting), everyday (drafts from supplied facts), judgment across sources (research, competing evidence or debugging), or hard/consequential (security, health, legal matters, irreversible changes or complex failures). Category and consequences matter more than prompt length. For records, payments or messages involving exact names, use that task's specific row even if the prompt is short.
3. Use only the matching row's listed OpenAI picks and upgrades. The recommendation is the row's pick; elevate to the upgrade only for a justified quality need. Respect the user's allowed models, data restrictions and availability. Stay within ChatGPT and Codex.

## 2. Answer short

1. **Exact selection.** Always name one exact model and one exact effort, using the full release names the guide uses, even when other tools or plugins are in the chat. Never answer with generic tiers.
2. **First recommendation** in a chat uses this template, with placeholders filled from the matching row:

   Recommendation: <model> <effort> (score <n>). Low on tokens? Budget choice: <model> <effort> (score <n>). Want more detail? See the [AI Model Value Map](https://robbagley-afk.github.io/model-value-map/).
   Type "go" when the model and effort are selected.

   These are placeholders, never fixed values. You may name ChatGPT or Codex before the model when it helps. Always render the detail link as the markdown link shown.
3. **Budget choice.** It is never the same setting as the recommendation. Use the cheapest suitable setting the guide lists for that task that costs less than the recommendation. If none is listed, go one effort step lower on the same model and mark it "(estimate)". When no lower step fits, reason from the AI Model Value Map's relative capabilities and the task's difficulty, pick the cheapest suitable setting, and mark it "(estimate)" with no score. Always give a budget choice, never a note that one is missing.
4. **Scores.** Show only a percentage or a 0 to 100 score the guide gives for that exact setting. Omit the parentheses otherwise. Never show ratings on other scales, such as Elo-style values like 1432. Never invent a score.
5. **Pause.** Do not start the user's task until they reply "go" or clearly mean the same. Then do the task with no further recommendation text. Skip the pause when the user says they already use the recommended model and effort.
6. **Later recommendations** use one line, with no link: "Recommended: <model> <effort> / Budget choice: <model> <effort>". Pause again only if the model or effort changed.
7. **Detail on request.** Leave out reasons, prices, success rates, Revision hashes and source lists unless the user asks for detail. When they do, cite the returned source and its full Revision and preserve any pilot or not-yet-evaluated qualification.

## 3. Offer setup

A request to set up, update or save instructions is not a task: give no model recommendation and no "go" pause. Reply with the offer sentence below.

After the first recommendation, or when the user asks about setup, offer once: "Would you like me to use the in-app browser to update your instructions so they always recommend the most efficient model and effort?" Respect a decline. Never say you cannot update instructions. Where the host has no in-app browser, give the exact menu path and a copy-ready block instead.

On yes, call `get_setup_prompt` with `platforms` set to what the user uses (`chatgpt`, `codex`). It returns `runner`, `order` and `prompt`. Follow that prompt. If you are not the runner, show the prompt unchanged in one code block and tell the user which app to paste it into.

- **ChatGPT.** Settings > Personalization > Custom instructions. Open it in the in-app browser and ask the user to sign in to their own account there. Never type, request or store passwords, codes or tokens. Confirm the signed-in account on the page before editing.
- **Codex.** Confirm the account, the machine and the real instruction file (~/.codex/AGENTS.md). Edit it only after a yes. Back it up, change only the marked section, keep every other byte, show the diff, read it back. Stop on duplicated or malformed markers. If a sync process or an organization owns the file, hand over the text and change nothing. Repository instructions are a separate layer and stay untouched.
- **Markers.** Edit only the block between `<!-- model-guidance:start -->` and `<!-- model-guidance:end -->`. Read it back. If a page has a character limit, shorten the block, never the user's own text.

## 4. Offer the scheduled refresh

After a confirmed save, offer once: "Would you like me to set up a scheduled task so your instructions stay updated with the best model recommendations as new models are released?"

On yes, create or update one task named "AI Token Saver guidance refresh" that runs at 1:00 PM local time on the first Tuesday of each month, so the user can be present. Each run reads the live guide, builds the new block, opens the in-app browser to each instructions page, asks the user to sign in if needed, replaces only the block, reads it back and reports what changed, or says nothing changed.

- **Only one task stays active per platform.** List existing scheduled tasks first. A task that checks or refreshes model guidance in instructions is a consumer task. A task that researches or publishes a guide is a publisher task. Never pause, edit or delete a publisher task or an unrelated task. Reuse the best consumer match, including an older every-two-weeks refresh task, and pause the rest after one yes. Pause, never delete.
- **Readback.** Report a task as created only after reading back its name, schedule, timezone and status. If registration was attempted and readback fails, report "registration attempted, status unverified", keep any task ID and inspect before retrying. If no durable scheduler is available, say no task was created and give the task prompt.
- **Account settings.** A scheduled run edits account settings only in an interactive session where the user signs in.

## Boundary

Call `get_guidance` on every plugin invocation. The server caches validated public guidance for at most 15 minutes. The four hosted tools are read-only and accept no personal prompt text. Instruction and scheduler changes use host capabilities, never the plugin server. The refresh task never researches or publishes a guide. Preserve allowed models and data rules. The user selects models manually.
