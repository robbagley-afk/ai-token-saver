# AI Token Saver setup lessons

Show the matching lesson while each setup step runs. Use this file when the AI Token Saver server is offline. Generated from src/lessons.mjs. Do not edit by hand.

## Plugins and skills

Step: plugins

A plugin bundles tools, skills and settings into one install. A skill is a set of written instructions the AI loads only when a task matches its description. Each enabled plugin adds its tool list to every turn, so turn off the ones you rarely use.

Source: https://code.claude.com/docs/en/plugins

## General instructions

Step: instructions

General instructions are text your AI reads at the start of every chat. Claude Code loads ~/.claude/CLAUDE.md, Codex loads ~/.codex/AGENTS.md, Gemini CLI loads ~/.gemini/GEMINI.md, and ChatGPT and claude.ai use the custom instructions in Settings. Every word is sent on every turn, so keep them short.

Source: https://code.claude.com/docs/en/memory

## Context windows, compaction and handoffs

Step: context

Each turn re-sends the whole chat to the model, so a long chat costs more on every reply. Compaction summarizes older turns to free room, and some detail is lost. A handoff prompt carries the goal, files, decisions and next step into a fresh chat at a fraction of the cost.

Source: https://code.claude.com/docs/en/costs

## Scheduled tasks

Step: scheduled

A scheduled task is a saved prompt that runs on a timer in the same app. The refresh task here runs once a month and changes only the marked guidance block. Keep one refresh task per platform so you never pay for duplicate runs.

Source: https://github.com/robbagley-afk/ai-token-saver

## Model and effort choice

Step: model

Bigger models and higher effort settings use more tokens per answer. The live guide scores each model and effort on real task types, so you can pick the cheapest setting that still does the job. The Budget choice is good enough for most everyday work.

Source: https://robbagley-afk.github.io/model-value-map/
