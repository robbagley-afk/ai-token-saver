# Release checklist

1. Bump every manifest version. `npm test` passes, including the CIS boundary test (no `-cis` skill or resource in a shared edition).
2. Merge the PR. Vercel deploys `main`. Run `node scripts/verify-remote.mjs`.
3. Build `AI-Token-Saver-All-<version>.zip` (files at the ZIP root) and attach it to a GitHub release with its SHA-256.
4. CES editions live in `~/Local-Infra/ai-token-saver-ces`. Follow its RELEASE_CHECKLIST.md. Upload with the chatgpt-plugin-upload skill.
5. Tips sites: run `node scripts/check-sites.mjs`. Fix every UPDATE line in `robbagley-afk/model-value-map` (docs/index.html, #plugin). Review the AI Expert Toolkit (ChatGPT quick start guide and other plugin pages) and publish it with the chatgpt-sites-publish skill. Rerun until it prints OK.
