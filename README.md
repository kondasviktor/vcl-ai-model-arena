# VCL VibeBench

**Stop trusting benchmark slides. Run it yourself.**

Open, forkable comparisons of frontier AI models on practical tasks — by [Vibe Coder's Life](https://vibecoderslife.com/?utm_source=github&utm_medium=readme&utm_campaign=vibebench).

> **Display name:** VCL VibeBench · **GitHub:** [`kondasviktor/vcl-ai-model-arena`](https://github.com/kondasviktor/vcl-ai-model-arena)  
> VibeBench is for developers, makers, indie hackers, and AI enthusiasts who want to compare frontier models on practical tasks — not academic charts.

## CTAs

1. **Star** this repo  
2. **Fork** it  
3. **Run locally** (below)  
4. **[Subscribe](https://vibecoderslife.com/?utm_source=github&utm_medium=readme&utm_campaign=vibebench#subscribe-email)** to the Vibe Coder's Life newsletter  

## Latest run

See [`results/latest.md`](./results/latest.md) after the first eval.

## Tier 1 — Vibe Check (shipped in 1.0)

| Suite | Path | What |
|---|---|---|
| Fun | [`tests/fun`](./tests/fun) | Strawberry-R, riddles, personality — scored + exploratory |
| Dev | [`tests/dev`](./tests/dev) | Bugs, SQL, stack traces, judgment — scored + exploratory |

**Scoring policy:** only tests tagged `scored` use deterministic asserts. Exploratory prompts are side-by-side only — no blended “best model” score, no LLM judge in 1.0. Details: [`docs/methodology.md`](./docs/methodology.md).

Coming next: **Vibe Vision (1.1)** · **Vibe Score (1.2)** — see [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## Quick start

```bash
git clone https://github.com/kondasviktor/vcl-ai-model-arena.git
cd vcl-ai-model-arena
cp .env.example .env        # set OPENROUTER_API_KEY
npm ci
npm run validate:models     # confirm OpenRouter IDs
npm run eval:fun
npm run eval:dev
npx promptfoo view          # local results UI
```

After a run:

```bash
DATE=$(date +%Y-%m-%d)
node scripts/write-result-meta.js fun "$DATE" maintainer
node scripts/write-result-meta.js dev "$DATE" maintainer
npm run results:latest
```

Optional share link for a post: `npx promptfoo eval -c tests/fun/promptfooconfig.yaml --share`


## Pick any OpenRouter model

Override the roster for a local run (BYO). Official published results still use the active registry only.

```bash
MODELS=openai/gpt-4o-mini,anthropic/claude-3.5-sonnet npm run eval:fun
npm run eval:smoke   # cheap 2-model check
```

Default roster = published maintainer results only.

## Model roster

Single source: [`models/registry.yaml`](./models/registry.yaml). Comment out retired models; don’t delete them.

## Docs

- [`docs/philosophy.md`](./docs/philosophy.md)
- [`docs/methodology.md`](./docs/methodology.md)
- [`docs/ROADMAP.md`](./docs/ROADMAP.md)
- [`docs/REPO_BOUNDARY.md`](./docs/REPO_BOUNDARY.md)
- [`RUNBOOK.md`](./RUNBOOK.md) — model-drop checklist
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`SECURITY.md`](./SECURITY.md) · [`CHANGELOG.md`](./CHANGELOG.md)

## License

- **Code:** MIT ([LICENSE](./LICENSE))
- **Prompts / fixtures / result summaries:** CC BY 4.0 ([LICENSE-DATA](./LICENSE-DATA))
- Third-party notices: [NOTICE](./NOTICE)

Solo-maintained, best-effort issue triage. PRs reviewed when possible.
