Install the AI Token Saver plugin (ChatGPT and Codex edition) for me. Source: https://github.com/robbagley-afk/ai-token-saver

1. Work out which app you are. Check whether it is already installed and say so instead of installing twice.
2. Show me the commands you will run, then run them:
   - Codex: `codex plugin marketplace add robbagley-afk/ai-token-saver` then `codex plugin add ai-token-saver@ai-token-saver`
   - ChatGPT chat (no shell): you cannot install it yourself. Give me these clicks: open https://chatgpt.com/plugins, choose Add custom MCP server, name it AI Token Saver, paste https://ai-token-saver.vercel.app/mcp, choose No authentication, and create the plugin. Tell me my workspace admin may need to allow it.
   - Any other app: stop and tell me to use the All Platforms edition instead.
3. Verify. List the installed plugins and confirm AI Token Saver is there. If the get_guidance tool is available in this chat, call it once with platform codex or chatgpt and show me the Revision. If it only loads in a new chat, say so.
4. Finish with one line: INSTALLED, ALREADY INSTALLED, CLICKS NEEDED, or FAILED with the exact error. Then tell me to start a new chat and ask "Recommend a model and effort for this task. Cite the Revision."

Rules: do not edit my instruction files or account settings, do not create scheduled tasks, do not install anything else, and if a command fails show the error and stop.
