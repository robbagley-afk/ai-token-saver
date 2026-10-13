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

Invoke AI Token Saver and ask: “Recommend a model and effort for this task. Cite the Revision.” Optional bootstrap instructions can be pasted once into Custom Instructions or Codex instructions. The plugin cannot switch your model, save ChatGPT settings, or guarantee activation on every prompt.

## Updates

The skill calls `get_guidance` on each invocation. Validated upstream guidance is cached for at most 15 minutes per server instance. New model picks require no reinstall or recurring task. The stable bootstrap contains no model names or dated picks. Users who explicitly request a full snapshot must refresh it themselves if they want current pasted guidance.

## Public tools

- `get_guidance(platform, category?)`: OpenAI-only task picks and Revision, fetched from the public guide.
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
