# AI Token Saver

A portable model guidance plugin with a live public guide. It gives one exact model and effort plus a budget choice for the user's task, in a short answer. It cites the Revision on request, leaves model selection to the user, and does not claim guaranteed savings.

## The plugin

**AI Token Saver** (`plugins/ai-token-saver-all`) is the one public plugin. It covers Claude, ChatGPT, Codex, Gemini (Antigravity) and Grok, limited to the platforms the user says they have.

- **ChatGPT alone, or ChatGPT with Codex:** it stays within OpenAI, with no platform comparison, the same as the former ChatGPT and Codex edition.
- **More than one vendor:** it compares the per-task cost of each platform's pick. At the start of a project it suggests another platform only when that pick costs at most half as much at a score no more than 5 points lower. For a long project with phases that match different task types, it can propose a phase plan with a handoff count. Mid-project it suggests a switch only at a third of the cost or less. Every suggestion ends with "Or stay on <current platform>: …".
- Setup offers the in-app browser and edits each platform's own instructions after the user signs in. The refresh task runs at 1:00 PM local time on the first Tuesday of each month.

`get_guidance` accepts `chatgpt`, `codex`, `claude`, `antigravity`, `grok` or `all`. Local-model rows and the cross-vendor best-value table are never returned.

### Retired: ChatGPT and Codex edition

`plugins/ai-token-saver` (AI Token Saver, OpenAI only) is retired as of 0.5.0. Its 0.5.0 skill is generated from the multiplatform skill by `scripts/build-retired-skill.mjs` and adds a one-line notice that asks the user to install AI Token Saver and remove the old edition. It stays in the Codex marketplace for one release so existing installs keep working, and is removed in 0.6.0. No new `openai-v*` releases are cut. ChatGPT users who uploaded the OpenAI package install the AI Token Saver package and then remove the old plugin.

## Current releases

The latest public releases are **0.4.0**. 0.5.0, the single multiplatform plugin, is not released yet.

- [All Platforms 0.4.0](https://github.com/robbagley-afk/ai-token-saver/releases/tag/v0.4.0)
- [OpenAI-only 0.4.0](https://github.com/robbagley-afk/ai-token-saver/releases/tag/openai-v0.4.0), the last release of the retired edition.

Separate institutional editions use their own account release process and are not included in these releases.

## Install by pasting a prompt

Paste one of these into the AI app you want it installed in. An app with a terminal installs and verifies it. A chat app without a terminal replies with the exact clicks.

- [install/all-platforms.md](install/all-platforms.md), for every platform. [install/chatgpt-codex.md](install/chatgpt-codex.md) now points there.

Tested: the All Platforms prompt installed the plugin from this repository in a headless Claude Code chat. The Codex and chat-app paths are untested.

## Installation

Live service and install guide: https://ai-token-saver.vercel.app/

MCP endpoint: https://ai-token-saver.vercel.app/mcp (Streamable HTTP, no authentication).

Use your client's normal plugin interface to install the release package. No local server, inference runtime, special browser profile, Microsoft account, or scheduler is needed. Workspace administrators can control installation and tool availability.

For a supported Codex repo marketplace, this repository contains `.agents/plugins/marketplace.json`, pointing to `plugins/ai-token-saver-all`. Register the repository with the documented `codex plugin marketplace add robbagley-afk/ai-token-saver` command, then install AI Token Saver through the desktop plugin interface. Confirm support with your installed client's help. Marketplace registration alone is not installation.

On clients that expose the verified CLI install command, run:

```sh
codex plugin marketplace add robbagley-afk/ai-token-saver
codex plugin add ai-token-saver-all@ai-token-saver
```

Restart or start a new chat to load installed skills and tools. These commands are a convenience for Codex users who already have its CLI, not a requirement for ChatGPT users.

ChatGPT supports **Plugins → Add custom MCP server → No authentication → Create as a plugin** for the deployed HTTPS endpoint shown on the service homepage. A direct MCP connection adds the three tools; the complete package also adds the guidance skill. Edu workspace access depends on administrator policy. A GitHub release does not imply inclusion in OpenAI's public plugin directory.

Invoke AI Token Saver and describe your task and the platforms you use. Ask which model and effort fit it. After the first recommendation, the skill offers to update your instructions in the in-app browser, then to add one monthly refresh task. Each step is opt-in. The plugin cannot switch your model, save ChatGPT settings, or guarantee activation on every prompt.

## Updates and the refresh task

The skill calls `get_guidance` on each invocation. Validated upstream guidance is cached for at most 15 minutes per server instance, so recommendations need no reinstall and no task.

Setup is optional and runs from one prompt. The skill asks which platforms the user has and calls `get_setup_prompt`. The prompt names the app to run it in: the one most able to change the others on the same computer, an agent with a shell first and chat-only apps last. That run sets up every platform it can reach and verify. For the rest it cascades: each app finishes its own platform and writes the handoff prompt for the next.

Per platform the prompt installs one instruction block between `model-guidance` markers (a stable pointer plus a dated snapshot with its Revision) and one scheduled task, "AI Token Saver guidance refresh", at 1:00 PM local time on the first Tuesday of each month, so the user can be present. Each run reads the live guide, opens each instructions page, asks the user to sign in if needed, replaces only the marked block and reads it back. A scheduled run edits account settings only in an interactive session where the user signs in.

Before creating the task the prompt lists existing scheduled tasks and keeps only one consumer task active per platform. Other guidance-refresh tasks, including the older every-two-weeks task, are paused after the user confirms, never deleted. Tasks that research or publish a guide are never touched. If the scheduler has no monthly-weekday option, the task runs every Tuesday and exits unless the date is the 1st through the 7th. If no durable scheduler exists, the prompt says no task was created.

## Public tools

- `get_guidance(platform)`: task picks and Revision, fetched once from the public guide. `chatgpt` and `codex` return OpenAI picks only. `claude`, `antigravity` and `grok` return that vendor only. `all` returns every vendor under `platforms`. Select the applicable category locally.
- `get_instruction_block(platform, mode?)`: stable bootstrap by default; dated full snapshot on request.
- `compare_revision(installed_revision)`: optional manual revision check.
- `get_setup_prompt(platforms)`: builds the setup prompt for the platforms named, with the app to run it in, the order and the current Revision as baseline. It changes nothing.

Tool schemas reject prompt-text arguments. The application accepts no documents or credentials, stores no user state, intentionally logs no request bodies, and never calls an inference service. Hosting providers may retain request/network metadata. See the published privacy page for the full disclosure.

The JSON guide's `codex` section is used for both ChatGPT and Codex, as the public OpenAI guide explicitly specifies. Revision comes consistently from `guidance.json`; its markdown representation can have a different Revision. Each platform returns only its own vendor rows; global best-value rows and local-model information are excluded.

## Development

Node 24. Run `npm ci`, `npm test`, and `npm run scan` after staging intended files. `npm start` serves a local validation endpoint. Deploy the stateless function with Vercel; external users connect to HTTPS, never this local development server. `node scripts/verify-remote.mjs HTTPS_ENDPOINT` validates a deployed server against the live source Revision.

The optional `scripts/install-instructions.mjs --consent /absolute/path/to/AGENTS.md` is an agent/developer utility, not an end-user prerequisite. It backs up existing instructions, applies only the guidance section and verifies the destination. Normal users can paste the short block. Never run it on a user's file without explicit consent.

## Documentation checked

Official documentation read on 2026-10-13:

- [Plugin quickstart](https://developers.openai.com/plugins/quickstart)
- [Portable plugin packaging](https://developers.openai.com/plugins/build/plugins)
- [MCP server integration](https://developers.openai.com/plugins/build/mcp-server)
- [Workspace plugin controls](https://learn.chatgpt.com/docs/enterprise/apps-and-connectors)
- [Public guidance](https://robbagley-afk.github.io/model-value-map/guidance-openai.md)

Public directory submission is separate from source publication, deployment and private account creation. Publisher verification, listing requirements, reviewer cases and a recorded demo must be completed before a directory submission. This release does not claim directory approval.

## Separate instruction surfaces and fleet strategy

ChatGPT/Work account custom instructions and Codex instructions have different scopes. Installing this plugin does not edit either. Put the same stable live-guide pointer in both if you use both, preserving each surface's existing preferences, allowed models and data rules. Do not paste an entire coding instruction file into ChatGPT.

The ChatGPT web Codex settings entry may describe desktop/web sync. A desktop editor may instead identify AGENTS.md on the selected machine. Confirm the actual account, execution target and active instruction file before changing anything. Do not assume the web entry synchronizes every machine-local file. Codex also layers project and repository instructions over global instructions.

For a personal fleet, distribute the versioned plugin through its marketplace. Keep account settings separate from machine-local instruction files. A generic instruction-sync task must not regenerate account-specific Codex instructions. Have the owning account or Codex session apply an explicitly approved scoped patch with a backup and readback. Keep only a stable live-guide pointer in instructions, not dated model names. One upstream publisher maintains recommendations. Each platform keeps one consumer refresh task, created by the setup prompt above. A prepared prompt is not a registered task.

Sources: [ChatGPT personalization](https://learn.chatgpt.com/docs/personalize), [settings and selected-machine instructions](https://learn.chatgpt.com/docs/reference/settings), [Codex instruction hierarchy](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
