# AI Token Saver

A portable ChatGPT/Codex plugin that recommends the cheapest suitable available OpenAI model and effort from a live public guide. It cites the Revision used, leaves model selection to the user, and does not claim guaranteed savings.

## Editions

- **AI Token Saver** (`plugins/ai-token-saver`): OpenAI only, for ChatGPT and Codex.
- **AI Token Saver (All Platforms)** (`plugins/ai-token-saver-all`): the same live guide for Claude, ChatGPT, Codex, Gemini (Antigravity) and Grok. It sets up instructions and one every-two-weeks refresh task on each platform the user chooses, from a single setup prompt. Install one edition per client.

Both editions use the same read-only server. `get_guidance` accepts `chatgpt`, `codex`, `claude`, `antigravity`, `grok` or `all`. Local-model rows and the cross-vendor best-value table are never returned.

All Platforms install:

```sh
# Claude Code
/plugin marketplace add robbagley-afk/ai-token-saver
/plugin install ai-token-saver-all@ai-token-saver

# Codex
codex plugin marketplace add robbagley-afk/ai-token-saver
codex plugin add ai-token-saver-all@ai-token-saver
```

Any other MCP client: add `https://ai-token-saver.vercel.app/mcp` as a Streamable HTTP server with no authentication. That gives the four tools without the skill. Tested hosts are listed in the release notes. Other hosts are untested.

## Install by pasting a prompt

Paste one of these into the AI app you want it installed in. An app with a terminal installs and verifies it. A chat app without a terminal replies with the exact clicks.

- All Platforms edition: [install/all-platforms.md](install/all-platforms.md)
- ChatGPT and Codex edition: [install/chatgpt-codex.md](install/chatgpt-codex.md)

Tested: the All Platforms prompt installed the plugin from this repository in a headless Claude Code chat. The Codex and chat-app paths are untested.

## Installation

Live service and install guide: https://ai-token-saver.vercel.app/

MCP endpoint: https://ai-token-saver.vercel.app/mcp (Streamable HTTP, no authentication).

Use your client's normal plugin interface to install the release package. No local server, inference runtime, special browser profile, Microsoft account, or scheduler is needed. Workspace administrators can control installation and tool availability.

For a supported Codex repo marketplace, this repository contains `.agents/plugins/marketplace.json`, pointing to `plugins/ai-token-saver`. Register the repository with the documented `codex plugin marketplace add robbagley-afk/ai-token-saver` command, then install AI Token Saver through the desktop plugin interface. Confirm support with your installed client's help. Marketplace registration alone is not installation.

On clients that expose the verified CLI install command, run:

```sh
codex plugin marketplace add robbagley-afk/ai-token-saver
codex plugin add ai-token-saver@ai-token-saver
```

Restart or start a new chat to load installed skills and tools. These commands are a convenience for Codex users who already have its CLI, not a requirement for ChatGPT users.

ChatGPT supports **Plugins → Add custom MCP server → No authentication → Create as a plugin** for the deployed HTTPS endpoint shown on the service homepage. A direct MCP connection adds the three tools; the complete package also adds the guidance skill. Edu workspace access depends on administrator policy. A GitHub release does not imply inclusion in OpenAI's public plugin directory.

Invoke AI Token Saver and ask: “Recommend a model and effort for this task. Cite the Revision.” On first use, the skill offers optional setup: one prompt that adds the guidance to your instructions and one refresh task per platform. Each step is opt-in. The plugin cannot switch your model, save ChatGPT settings, or guarantee activation on every prompt.

## Updates and the refresh task

The skill calls `get_guidance` on each invocation. Validated upstream guidance is cached for at most 15 minutes per server instance, so recommendations need no reinstall and no task.

Setup is optional and runs from one prompt. The skill asks which platforms the user has and calls `get_setup_prompt`. The prompt names the app to run it in: the one most able to change the others on the same computer, an agent with a shell first and chat-only apps last. That run sets up every platform it can reach and verify. For the rest it cascades: each app finishes its own platform and writes the handoff prompt for the next.

Per platform the prompt installs one instruction block between `model-guidance` markers (a stable pointer plus a dated snapshot with its Revision) and one scheduled task, "AI Token Saver guidance refresh", every two weeks on Saturday at 10:00 PM local time. The task refreshes the marked block in an approved local instruction file when the Revision changes, and sends replacement text for account settings it cannot edit.

Before creating the task the prompt lists existing scheduled tasks and keeps only one consumer task active per platform. Other guidance-refresh tasks are paused after the user confirms, never deleted. Tasks that research or publish a guide are never touched. If the scheduler has no two-week option, the task runs every Saturday and exits unless 14 days have passed. If no durable scheduler exists, the prompt says no task was created.

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
