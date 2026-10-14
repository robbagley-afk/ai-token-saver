---
name: model-guidance
description: Recommend an available OpenAI model and effort for a task using live guidance. Use when the user asks which model or effort to use, wants to reduce unnecessary AI usage, or invokes AI Token Saver.
---

# AI Token Saver

Give model guidance. You cannot switch the user's model or save ChatGPT settings. Do not claim guaranteed savings or attribute API benchmark prices to subscription usage.

1. Call this plugin's `get_guidance` once with `platform: chatgpt` or `codex`. It returns every supported task category. Reuse that response for this recommendation; do not repeat the call to select a category. Send only the platform, never the user's prompt, files or personal data. If the tool is unavailable, say current guidance could not be verified. Do not invent a current pick.
2. Classify the task locally: narrow/repeated (exact extraction or formatting), everyday (drafts from supplied facts), judgment across sources (research, competing evidence or debugging), or hard/consequential (security, health, legal matters, irreversible changes or complex failures). Choose the closest task category in the returned bullets. Category and consequences matter more than prompt length. For records, payments or messages involving exact names, use that task's specific guidance even if the prompt is short.
3. Recommend the category's listed pick first. Upgrade only after a failed check or when the pick cannot meet an explicit task constraint. Do not manufacture a model or effort. Respect the user's allowed models and data rules. If availability is unknown, label it unverified. If the listed setting is unavailable, say so and use another explicitly listed compatible option only with a clear reason.
4. Give one concise line: **Model / effort**, why, **Revision**, and a link to the returned source. Follow the guide's wording when pick includes qualifications. Ask the user to select it manually if they want to change models. Do not interrupt an active dependent task solely for a recommendation unless the user asked.
5. Answer the actual guidance question first. Then offer the optional setup below once per conversation unless reliable host-owned onboarding state says it was completed or declined. Respect a decline. Do not claim durable first-use tracking or create hidden state files.

## Optional first-use setup

Offer one compact choice: “Optional setup: ChatGPT/Work instructions, Codex instructions, a weekly guidance check, any combination, or skip.” Show both instruction surfaces regardless of the current host. Installing this plugin does not edit either surface.

For ChatGPT/Work, call `get_instruction_block` with `platform: chatgpt, mode: bootstrap` only after acceptance. Provide paste-ready text for Settings > Personalization > Custom instructions > ChatGPT. Preserve existing preferences. The user pastes, saves and reads it back. Do not claim it was saved without confirmation.

For Codex, call the same tool with `platform: codex, mode: bootstrap`. Confirm the actual account, execution target and instruction surface at installation time. A web settings entry may describe desktop/web sync; a desktop editor may identify AGENTS.md on the selected machine. Verify the supported scope. Do not claim every machine-local file syncs. Repository instructions remain a separate layer.

Offer copy/paste, or edit a local file only with explicit consent. Back it up first. Limit changes to one unique `<!-- model-guidance:start -->` / `<!-- model-guidance:end -->` section and preserve every surrounding byte. Show the scoped diff and verify readback. Stop on missing, duplicated or malformed boundaries. If account-specific instructions are protected or owned by a sync process, prepare a proposal for that owner. Never regenerate them through generic sync.

Bootstrap text points to live guidance and contains no dated model picks. A personal fleet can distribute the versioned plugin/skill while keeping ChatGPT account settings and machine/account Codex instructions separate. Do not run a fleet sync merely for onboarding.

## Optional weekly consumer check

Create a task only after the user opts in. Use the host's supported scheduler, inspect existing same-purpose tasks, and reuse one with authorization. Select one host and confirm time and timezone before registration. Do not assume a universal scheduler API. Verify the saved name, cadence, timezone, execution target and status. Check inspection and verification capability before mutation. If unavailable before registration, provide a task prompt and state that no task was created. If registration was attempted but readback fails, report “registration attempted, status unverified,” retain any returned task ID, and inspect before retrying to avoid duplicates.

Capture the verified Revision at setup as the initial baseline. The task calls `get_guidance` for its selected platform and `compare_revision` with `installed_revision` equal to that baseline. The actual response is `{current, changed}`. Stay quiet when unchanged. When changed, notify with the current Revision and source link. Update the baseline only through supported host-owned task state after a successful check. If baseline storage cannot be read or updated, report the limitation and never claim reliable ongoing change tracking. Report source/tool failures without inventing current guidance.

A suitable task prompt is: “Check AI Token Saver for PLATFORM_FROM_SETUP, sending only the platform. Compare Revision against the last successfully recorded baseline, initially REVISION_FROM_SETUP. Stay quiet when unchanged. On change, report the current Revision and source. Include replacement instruction text only if I opted into dated snapshots. Record the new baseline only in supported host-owned task state. If state cannot be updated, say so. Never edit account settings or instruction files, switch models, research or publish the source guide, or create another task. Report failures honestly.” Replace both setup placeholders with verified values before registration.

Snapshots are opt-in. Use `get_instruction_block` with `mode: snapshot` only when the user explicitly requests a full dated guide, including an explicit request for replacement snapshots in the consumer task. Explain that copies can become stale. Changed guidance does not require replacing a stable bootstrap.

## Updates and boundary

Call `get_guidance` on every plugin invocation. The server caches validated public guidance for at most 15 minutes. No scheduler, reinstall or replacement bootstrap is required for current recommendations. Do not promise activation on every prompt or override workspace policy.

The three hosted tools are read-only and accept no personal prompt text. Authorized instruction or scheduler operations use host capabilities, never the plugin server. No inference, private-service, messaging or browser-automation dependency is required for end users. The consumer task only checks revisions; one separate upstream publisher owns research and publication. Preserve allowed models and data rules. The user selects models manually.
