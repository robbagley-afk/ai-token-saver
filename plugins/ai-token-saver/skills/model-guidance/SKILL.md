---
name: model-guidance
description: Recommend a Best Choice and a Budget Choice of OpenAI model and effort for a task using live guidance. Use when the user asks which model or effort to use, wants to reduce unnecessary AI usage, or invokes AI Token Saver.
---

# AI Token Saver

Give model guidance. You cannot switch the user's model or save ChatGPT settings. Do not claim guaranteed savings or attribute API benchmark prices to subscription usage.

1. Call this plugin's `get_guidance` once with `platform: chatgpt` or `codex`. It returns every supported task category. Reuse that response for this recommendation; do not repeat the call to select a category. Send only the platform, never the user's prompt, files or personal data. If the tool is unavailable, say current guidance could not be verified. Do not invent a current pick.
2. Identify the actual task first. If it is missing, ask for its broad type before making a pick. Never treat the request for model advice as the task being evaluated. Classify the task locally: narrow/repeated (exact extraction or formatting), everyday (drafts from supplied facts), judgment across sources (research, competing evidence or debugging), or hard/consequential (security, health, legal matters, irreversible changes or complex failures). Choose the closest task category in the returned bullets. Category and consequences matter more than prompt length. For records, payments or messages involving exact names, use that task's specific guidance even if the prompt is short.
3. Compare only the matching task row's listed OpenAI picks and upgrades. **Best Choice** is the strongest overall fit after weighing task-specific quality, API benchmark cost and the guide's upgrade rule; start with the listed pick and elevate only for a justified quality need. **Budget Choice** is the lowest-cost listed candidate that can still complete the task with an appropriate check. Respect the user's allowed models, data restrictions, availability and the guide's qualifications. If availability is unknown, label it unverified. Do not manufacture a model or effort, infer task-specific ability from a general intelligence score, or compare different benchmarks as though they were one test. Treat prices as API benchmark costs per task, not subscription charges. If no distinct second candidate is supported, say why instead of inventing one. Stay within ChatGPT and Codex; do not recommend another vendor from this edition.
4. Lead with two labeled lines: **Best Choice: [ChatGPT or Codex] [full model and effort]** with why it fits, and **Budget Choice: [ChatGPT or Codex] [full model and effort]** with its savings and practical tradeoff. Cite the returned source and its full Revision, never shortened. Preserve any pilot or not-yet-evaluated qualification. The user selects the model manually. Do not interrupt an active dependent task solely for a recommendation unless the user asked.
5. Answer the actual guidance question first. Then offer the optional setup below once per conversation.

## Optional first-use setup

Answer the guidance question first. Then ask once per conversation: "Optional setup: I can put this guidance in your instructions and add one task that refreshes it every two weeks. Do you use ChatGPT, Codex, or both?" Respect a decline. Do not claim durable first-use tracking or create hidden state files.

Call `get_setup_prompt` with `platforms` set to what they named (`chatgpt`, `codex`). It returns `runner`, `order` and `prompt`. Show the prompt unchanged in one code block.

- ChatGPT only: you are the runner. Offer to run it now and start only after a yes.
- Both: the runner is Codex, because it can edit files on the user's computer. Tell the user to paste the prompt into Codex. Codex sets up its own platform, then writes a handoff prompt for ChatGPT. Tell the user to expect that handoff.

The prompt sets up two things per platform: one instruction block between `<!-- model-guidance:start -->` and `<!-- model-guidance:end -->` (the stable pointer plus a dated snapshot with its Revision), and one scheduled task named "AI Token Saver guidance refresh" that refreshes that block.

## Rules when you run the setup prompt

- **Only one task stays active per platform.** List existing scheduled tasks first. A task that checks or refreshes model guidance in instructions is a consumer task. A task that researches or publishes a guide is a publisher task. Never pause, edit or delete a publisher task or an unrelated task. Show the consumer tasks, reuse the best match, and pause the rest after one yes. Pause, never delete.
- **Schedule.** Every two weeks, Saturday 10:00 PM, local timezone. With no two-week option, use every Saturday 10:00 PM and have the task exit unless 14 days have passed. Say which was used. If no durable scheduler is available, say no task was created and give the task prompt.
- **Readback.** Report a task as created only after reading back its name, schedule, timezone and status. If registration was attempted and readback fails, report "registration attempted, status unverified", keep any task ID and inspect before retrying.
- **ChatGPT instructions.** Settings > Personalization > Custom instructions. The user pastes, saves and confirms. A scheduled run never edits account settings. It sends the replacement text and the menu path.
- **Codex instructions.** Confirm the account, the machine and the real instruction file. Edit it only after a yes. Back it up, change only the marked section, keep every other byte, show the diff, read it back. Stop on duplicated or malformed markers. If a sync process or an organization owns the file, hand over the text and change nothing. Repository instructions are a separate layer and stay untouched.

## Updates and boundary

Call `get_guidance` on every plugin invocation. The server caches validated public guidance for at most 15 minutes, so recommendations are current without the task. The task exists to keep the copy in the user's instructions current. Do not promise activation on every prompt or override workspace policy.

The four hosted tools are read-only and accept no personal prompt text. Instruction and scheduler changes use host capabilities, never the plugin server. No inference, private-service, messaging or browser-automation dependency is required for end users. The refresh task never researches or publishes a guide. Preserve allowed models and data rules. The user selects models manually.
