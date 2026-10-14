---
name: model-guidance-all
description: Recommend a model and effort for a task on Claude, ChatGPT, Codex, Gemini (Antigravity) or Grok using live guidance, set up matching instructions and one every-two-weeks refresh task on each platform through a single setup prompt. Use when the user asks which model or effort to use, which platform fits a task, wants to reduce unnecessary AI usage, wants their model instructions set up or refreshed, or invokes AI Token Saver.
---

# AI Token Saver, all platforms

Give model guidance. You cannot switch the user's model or save account settings. Do not claim guaranteed savings. Prices in the guide are API benchmark costs per task, not subscription usage.

## Start here: the first reply of a conversation

The first time this skill runs in a conversation, your reply MUST begin with these two sentences, word for word, before any recommendation:

"AI Token Saver picks the cheapest model and effort that fits each task, from a live guide, and can keep that guidance current in your instructions on every AI platform you use. Which of these do you use: Claude, ChatGPT, Codex, Gemini or Antigravity, Grok?"

Then, in the same reply, answer any model question the user asked by following section 1. Do not skip the two sentences because the user asked something specific. Say them once per conversation. If the user later declines setup or names no platforms, drop it. Do not claim durable first-use tracking or create hidden state files.

## 1. Recommend a model and effort

1. Identify the platform you are running on: `claude`, `chatgpt`, `codex`, `antigravity` (any Gemini client) or `grok`. If you cannot tell, ask once.
2. Call `get_guidance` once with that platform. It returns every task category. Reuse that response. Send only the platform, never the user's prompt, files or personal data. If the tool is unavailable or returns an error, say current guidance could not be verified. Do not invent a current pick.
3. Classify the task locally: narrow or repeated (exact extraction or formatting), everyday (drafts from supplied facts), judgment across sources (research, competing evidence, debugging), or hard and consequential (security, health, legal matters, irreversible changes, complex failures). Choose the closest returned category. Consequences matter more than prompt length. For records, payments or messages with exact names, use that task's specific guidance even when the prompt is short.
4. Recommend the listed pick first. Upgrade only after a failed check or when the pick cannot meet a stated constraint. Respect the user's allowed models and data rules. If availability on their plan is unknown, label it unverified.
5. Give one concise line: **Platform**, **Model / effort**, why, **Revision**, and a link to the returned source. Print the Revision in full, never shortened. The user selects the model manually. Do not interrupt an active dependent task solely for a recommendation.

## 2. Which platform for this task

Only when the user asks where to run a task, or says they have more than one subscription: call `get_guidance` with `platform: all`. It returns `platforms`, one list per vendor, under one Revision. Compare the picks for the matching category across the platforms the user actually has. Name one, give the reason from the returned text, and say that moving a task between platforms costs setup and context. Recommend a move only when the difference is stated in the guide. Never recommend a platform the user has not said they can use.

## 3. Build the setup prompt

When the user names their platforms, call `get_setup_prompt` with `platforms` set to exactly those names (`claude`, `chatgpt`, `codex`, `antigravity`, `grok`). Send nothing else. It returns `runner`, `order` and `prompt`. Show the prompt unchanged in one code block.

- `runner` is the listed app most able to change the others on the user's computer: an agent with a shell and desktop control first, chat-only apps last. Say "Paste this into RUNNER" with the app's name.
- If you are the runner, offer to run it now and start only after a yes.
- If you are not the runner and the user has it, tell them to paste it there. That one run sets up every platform it can reach and verify from that computer.
- For whatever it cannot reach, the prompt cascades: each app finishes its own platform, then writes the handoff for the next app in order, until none are left. Tell the user to expect one handoff at a time.

The prompt sets up two things per platform:
- **Instructions.** One block between `<!-- model-guidance:start -->` and `<!-- model-guidance:end -->`: the stable pointer to live guidance plus a dated snapshot with its Revision.
- **One scheduled task**, named "AI Token Saver guidance refresh", every two weeks on Saturday at 10:00 PM local time, that refreshes that block when the Revision changes.

## 4. Rules when you run the setup prompt

Follow the prompt as written, and hold to these:

- **Only one task stays active per platform.** List existing scheduled tasks first. A task that checks or refreshes model guidance in instructions is a consumer task. A task that researches or publishes a guide is a publisher task. Never pause, edit or delete a publisher task or an unrelated task. Show the consumer tasks, reuse the best match, and pause the rest after one yes. Pause, never delete.
- **Schedule.** Every two weeks, Saturday 10:00 PM, local timezone. With no two-week option, use every Saturday 10:00 PM and have the task exit unless 14 days have passed. Say which was used. A scheduler that lives only in the current session or expires within days is not a scheduled task: say so, name a durable scheduler, and give the task prompt.
- **Readback.** Report a task as created only after reading back its name, schedule, timezone and status. If registration was attempted and readback fails, report "registration attempted, status unverified", keep any task ID and inspect before retrying.
- **Files.** Edit an instruction file only after a yes for that file. Back it up, change only the marked section, keep every other byte, show the diff, read it back. Stop on duplicated or malformed markers. If a sync process or an organization owns the file, hand over the text and change nothing.
- **Account settings.** The user pastes, saves and confirms. A scheduled run never edits account settings. It sends the replacement text and the menu path.
- **Other platforms.** Change another vendor's files or tasks from here only where you can make the change and read it back. Do not guess another vendor's scheduler format. Hand off instead.

Finish with one line per platform: instructions UPDATED, PASTE NEEDED or SKIPPED, and task CREATED, REUSED, PROMPT ONLY or SKIPPED.

## Boundary

Call `get_guidance` on every invocation. The server caches validated public guidance for at most 15 minutes, so recommendations are current without the task. The task exists to keep the copy in your instructions current. The four hosted tools are read-only and accept no prompt text. Instruction and scheduler changes use the host's own capabilities, never the plugin server. Preserve the user's allowed models and data rules.
