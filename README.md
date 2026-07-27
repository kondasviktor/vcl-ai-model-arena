# VibeBench by Vibe Coder's Life

**Stop trusting benchmark slides. Run it yourself.**

Open benchmark for comparing frontier AI models on practical tasks.

> **Status:** private build (Phase 0 extract). Not public yet. Tier 1 (Vibe Check) only.

- **Site:** [vibecoderslife.com](https://vibecoderslife.com)
- **GitHub (this repo):** `kondasviktor/vcl-ai-model-arena`

## Quick start (when ready)

```bash
cp .env.example .env   # add OPENROUTER_API_KEY
# Phase 1 will add package.json + pinned promptfoo
npx promptfoo@latest eval -c tests/fun/promptfooconfig.yaml
```

## Suites (1.0)

| Suite | Path | Audience |
|---|---|---|
| Fun | `tests/fun` | Beginners / shareable checks |
| Dev | `tests/dev` | Vibe coder practical prompts |

Vibe Vision (1.1) and Vibe Score (1.2) are planned — see `docs/ROADMAP.md` (landing in Phase 1).

## License

MIT (code) — LICENSE file lands in Phase 1.
