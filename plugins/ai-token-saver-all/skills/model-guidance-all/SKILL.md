---
name: model-guidance-all
description: Recommend a model and effort for a task on Claude, ChatGPT, Codex, Gemini (Antigravity) or Grok using live guidance, set up matching instructions on each platform, and offer one weekly change check. Use when the user asks which model or effort to use, which platform fits a task, wants to reduce unnecessary AI usage, wants their model instructions set up or refreshed, or invokes AI Token Saver.
---

# AI Token Saver, all platforms

Give model guidance. You cannot switch the user's model or save account settings. Do not claim guaranteed savings. Prices in the guide are API benchmark costs per task, not subscription usage.

## 1. Recommend a model and effort

1. Identify the platform you are running on: `claude`, `chatgpt`, `codex`, `antigravity` (any Gemini client) or `grok`. If you cannot tell, ask once.
2. Call `get_guidance` once with that platform. It returns every task category. Reuse that response. Send only the platform, never the user's prompt, files or personal data. If the tool is unavailable or returns an error, say current guidance could not be verified. Do not invent a current pick.
3. Classify the task locally: narrow or repeated (exact extraction or formatting), everyday (drafts from supplied facts), judgment across sources (research, competing evidence, debugging), or hard and consequential (security, health, legal matters, irreversible changes, complex failures). Choose the closest returned category. Consequences matter more than prompt length. For records, payments or messages with exact names, use that task's specific guidance even when the prompt is short.
4. Recommend the listed pick first. Upgrade only after a failed check or when the pick cannot meet a stated constraint. Respect the user's allowed models and data rules. If availability on their plan is unknown, label it unverified.
5. Give one concise line: **Platform**, **Model / effort**, why, **Revision**, and a link to the returned source. The user selects the model manually. Do not interrupt an active dependent task solely for a recommendation.

## 2. Which platform for this task

Only when the user asks where to run a task, or says they have more than one subscription: call `get_guidance` with `platform: all`. It returns `platforms`, one list per vendor, under one Revision. Compare the picks for the matching category across the platforms the user actually has. Name one, give the reason from the returned text, and say that moving a task between platforms costs setup and context. Recommend a move only when the difference is stated in the guide. Never recommend a platform the user has not said they can use.

## 3. Optional instruction setup (offer once per conversation)

Answer the question first. Then offer one compact choice: "Optional setup: instructions for the platforms you use, a weekly guidance check, both, or skip." Ask which platforms they use. Respect a decline. Do not claim durable first-use tracking or create hidden state files.

Call `get_instruction_block` with `mode: bootstrap` after acceptance. The text is the same for every platform, points to live guidance and holds no dated model names, so one block serves all surfaces. Installing this plugin does not edit any of them. Each surface is separate and nothing syncs between vendors.

Account settings, pasted by the user, who saves and reads it back. Menu labels change, so describe the place and let the user confirm the label they see:
- **ChatGPT.** Settings > Personalization > Custom instructions.
- **Claude app.** Settings, the personal instructions or preferences box for the account.
- **Gemini app.** Settings, saved info or personal instructions.
- **Grok.** Settings, custom instructions.

Instruction files on a computer, for coding agents. Confirm the real path on this machine before touching anything. Common locations: Codex `~/.codex/AGENTS.md`, Claude Code `~/.claude/CLAUDE.md`, Gemini CLI or Antigravity `~/.gemini/GEMINI.md` or the global rules file that client documents. Project instruction files are another layer and stay untouched.

Offer copy and paste, or edit a file only after an explicit yes for that file. You can edit files only on the machine you are running on. For other machines and other vendors' apps, hand the user the text. Back the file up first. Limit the change to one unique `<!-- model-guidance:start -->` / `<!-- model-guidance:end -->` section and preserve every surrounding byte. Show the diff and read the file back. Stop on missing, duplicated or malformed boundaries. If a sync process or an organization owns the file, prepare a proposal for that owner. Never regenerate it.

Finish by listing each surface as done and confirmed by the user, text handed over, or skipped. Do not report a surface as updated without a readback or the user's confirmation.

## 4. Optional weekly check, one task for all platforms

Create a task only after the user opts in. One task on one host is enough, because every platform shares one Revision. Use the scheduler of the platform you are running on, inspect existing same-purpose tasks and reuse one with permission. Confirm day, time and timezone before registration. Verify the saved name, cadence, timezone, target and status. If inspection or registration is unavailable, give the task prompt and say no task was created. If registration was attempted and readback fails, report "registration attempted, status unverified", keep any task ID and inspect before retrying.

Capture the verified Revision at setup as the baseline. The task calls `compare_revision` with `installed_revision` set to the baseline. The response is `{current, changed}`. Stay quiet when unchanged. When changed, notify with the current Revision, the source link and the list of surfaces the user set up. Update the baseline only through supported host-owned task state. If that state cannot be read or written, say so and never claim reliable ongoing tracking.

Task prompt: "Check AI Token Saver with compare_revision against the last recorded baseline, initially REVISION_FROM_SETUP. Stay quiet when unchanged. On change, report the current Revision and source, and remind me which instruction surfaces I set up: SURFACES_FROM_SETUP. Include replacement snapshot text only for platforms where I opted into dated snapshots. Never edit account settings or instruction files, switch models, research or publish the source guide, or create another task. Report failures honestly." Replace both placeholders with verified values before registration.

## 5. Instruction updates

The stable block never needs replacing when picks change. Dated snapshots are opt-in: call `get_instruction_block` with `mode: snapshot` and one platform only when the user asks for the full dated guide on that platform. Tell them copies go stale. When the weekly check reports a change, offer fresh snapshot text for each opted-in platform. The user pastes it, or you apply it to a local file under the same consent, backup, marker and readback rules as section 3. A scheduled run never edits anything.

## Boundary

Call `get_guidance` on every invocation. The server caches validated public guidance for at most 15 minutes, so no reinstall or scheduled task is needed for current recommendations. The three hosted tools are read-only and accept no prompt text. Instruction and scheduler changes use the host's own capabilities, never the plugin server. Preserve the user's allowed models and data rules.
