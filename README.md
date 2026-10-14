# AI Token Saver

A portable ChatGPT/Codex plugin that recommends the cheapest suitable available OpenAI model and effort from a live public guide. It cites the Revision used, leaves model selection to the user, and does not claim guaranteed savings.

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

Invoke AI Token Saver and ask: “Recommend a model and effort for this task. Cite the Revision.” On first use, the skill offers optional setup for both ChatGPT/Work and Codex instructions, plus one weekly refresh check. Each choice is opt-in. The plugin cannot switch your model, save ChatGPT settings, or guarantee activation on every prompt.

## Updates

The skill calls `get_guidance` on each invocation. Validated upstream guidance is cached for at most 15 minutes per server instance. New model picks require no reinstall or recurring task. The stable bootstrap contains no model names or dated picks. Users can opt into a weekly consumer task that compares Revision and reports changes. It does not research or publish the source guide and never rewrites account settings or instruction files. Reuse an existing matching task. If scheduler inspection or verification is unavailable before registration, the skill supplies a task prompt and reports that no task was created. If registration was attempted but readback fails, it reports status unverified, retains any task ID and inspects before retrying. Users who explicitly request a full snapshot can receive replacement text when Revision changes.

## Public tools

- `get_guidance(platform)`: OpenAI-only task picks and Revision, fetched once from the public guide. Select the applicable category locally.
- `get_instruction_block(platform, mode?)`: stable bootstrap by default; dated full snapshot on request.
- `compare_revision(installed_revision)`: optional manual revision check.

Tool schemas reject prompt-text arguments. The application accepts no documents or credentials, stores no user state, intentionally logs no request bodies, and never calls an inference service. Hosting providers may retain request/network metadata. See the published privacy page for the full disclosure.

The JSON guide's `codex` section is used for both ChatGPT and Codex, as the public OpenAI guide explicitly specifies. Revision comes consistently from `guidance.json`; its markdown representation can have a different Revision. Only OpenAI-platform fields are returned; global best-value rows and local-model information are excluded.

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

For a personal fleet, distribute the versioned plugin through its marketplace. Keep account settings separate from machine-local instruction files. A generic instruction-sync task must not regenerate account-specific Codex instructions. Have the owning account or Codex session apply an explicitly approved scoped patch with a backup and readback. Keep only a stable live-guide pointer in instructions, not dated model names. One upstream publisher maintains recommendations. A consumer refresh task only checks for changes and informs its owner.

Optional weekly task prompt (capture the current Revision at setup):

> Check AI Token Saver guidance for the selected platform using only the platform argument. Compare its Revision with the last successfully recorded Revision, initially REVISION_FROM_SETUP. Stay quiet when unchanged. When changed, notify me with the current Revision and source link. Include replacement instruction text only if I opted into a dated snapshot. Never edit instructions or account settings, change models, research or publish the upstream guide, or create another task. Record a new baseline only in supported host-owned task state after a successful check. If persistent state is unavailable, say the baseline could not be updated and do not claim ongoing change tracking. Report tool or source failure without inventing current guidance.

Before registering it, inspect existing same-purpose tasks, choose one supported host, confirm schedule and timezone, and reuse an existing task with permission. Report the registered task's name, schedule, timezone, target and status. A prepared prompt is not a registered task.

Sources: [ChatGPT personalization](https://learn.chatgpt.com/docs/personalize), [settings and selected-machine instructions](https://learn.chatgpt.com/docs/reference/settings), [Codex instruction hierarchy](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
