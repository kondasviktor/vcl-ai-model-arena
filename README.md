# VCL VibeBench

**Stop trusting benchmark slides. Run it yourself.**

[VCL VibeBench](https://github.com/kondasviktor/vcl-ai-model-arena) is an open, forkable set of **practical prompts** for comparing AI models — by [Vibe Coder's Life](https://vibecoderslife.com/?utm_source=github&utm_medium=readme&utm_campaign=vibebench).

You can try the short **Fun** checks in any chat UI (ChatGPT, Claude, Gemini, Grok…).  
If you want a fair multi-model matrix, run the same prompts locally with **BYOK** (bring your own API key) via **[OpenRouter](https://openrouter.ai/)** (default) or optionally **[Hetzner Experiments Inference](https://experiments.hetzner.com/docs/inference)** — and **pick the models you want to compare**.

> Display name: **VCL VibeBench** · GitHub: `kondasviktor/vcl-ai-model-arena`  
> Built for developers, makers, indie hackers, and AI enthusiasts — not academic leaderboard theater.

---

## Why this exists

Vendor slides and third-party charts often answer “who looks smartest on a fixed exam.”  
VCL VibeBench asks a different question: **which model helps you with everyday practical tasks this week?**

Two suites ship today; a third is planned — [docs/ROADMAP.md](./docs/ROADMAP.md):

- **1.0 Fun** — short prompts anyone can try (copy-paste below, or CLI)
- **1.1 Dev** — coding / debugging prompts for vibe coders (CLI)
- **1.2 Score** — planned: small Aider-lite coding tests (unit-test pass/fail, cheap to re-run)

Scored prompts have a clear expected answer. Exploratory prompts are for side-by-side judgment — **no blended “best model” score**, no LLM judge. Details: [docs/methodology.md](./docs/methodology.md).

---

## Try Fun (1.0) in 2 minutes (no terminal)

Open ChatGPT, Claude, Gemini, Grok, or any chat model. Copy each prompt, paste it, and compare.  
For scored items, the expected answer is noted so you can check yourself.

### 1. Strawberry letter count *(scored — expect `3`)*

```
How many times does the letter R appear in the word 'strawberry'? Answer with just the number.
```

### 2. Random number *(exploratory)*

```
Give me one random whole number between 0 and 100. Just the number, nothing else.
```

### 3. Octopus fun fact *(exploratory)*

```
Tell me one surprising fun fact about octopuses that most people don't know. Two sentences max.
```

### 4. Sheep riddle *(scored — expect reasoning that lands on `9`)*

```
A farmer has 17 sheep. All but 9 die. How many sheep are left? Explain your reasoning in one sentence.
```

### 5. Explain like I'm five *(exploratory)*

```
Explain what a large language model is to a curious 5-year-old, in 3 sentences or less.
```

### 6. Debugging joke *(exploratory)*

```
Tell me a short, original joke about debugging code.
```

### 7. Haiku *(exploratory)*

```
Write an original 3-line haiku about coding in Budapest at night.
```

### 8. Would-you-rather *(exploratory)*

```
Would you rather fight one horse-sized duck or a hundred duck-sized horses? Give a one-sentence tactical justification.
```

### 9. Who is JSON? *(exploratory)*

```
Who is JSON?
```

### 10. Which is larger: 9.11 or 9.9? *(scored — expect `9.9`)*

```
Which is larger: 9.11 or 9.9? Answer with just the larger number.
```

---

## What’s in Dev (1.1, CLI only)

**Dev** is 10 practical coding / debugging prompts for vibe coders — bug finding, stack traces, refactoring, tests, SQL, multi-step implement, architecture judgment, security, regex, and async races.

Full prompt text lives in [`tests/dev/promptfooconfig.yaml`](./tests/dev/promptfooconfig.yaml) so you can audit before spending API credit. We don’t paste Dev prompts here so the CLI matrix stays the fair multi-model comparison. The suite only sends those open prompts to OpenRouter with **your** key.

| # | What it checks | Scoring |
|---|---|---|
| 1 | Off-by-one in a tiny Python helper | scored |
| 2 | Read a real Node stack trace (`undefined.map`) | exploratory |
| 3 | Refactor messy JS for readability | exploratory |
| 4 | Edge-case unit tests for `divide(a, b)` | exploratory |
| 5 | Broken SQL totals (`GROUP BY`) | scored |
| 6 | Multi-step: implement `slugify` with 4 rules | scored |
| 7 | Architecture: queue vs cron for ~500 emails/day | exploratory |
| 8 | Spot XSS in a short Express template | scored |
| 9 | Write a basic email regex validator | scored |
| 10 | Catch an async race on a shared counter | exploratory |

Scored = deterministic assert. Exploratory = side-by-side judgment only — no LLM judge, no blended “best model” score.

---

## How you can help (please)

1. ⭐ **Star this repo** if VCL VibeBench is useful — stars help others find an honest, re-runnable comparison when a new model drops, and they tell us the project is worth maintaining.
2. 🍴 **Fork it** when you want your own suite, extra prompts, or a private comparison for your team — that’s the point of open fixtures.
3. 💻 **Run the CLI matrix (BYOK)** if you can — paste-into-one-chat is great for a quick vibe check; a local run with your OpenRouter key compares **many models on the exact same prompts** in one go.
4. ✉️ **[Subscribe to the Vibe Coder's Life newsletter](https://vibecoderslife.com/?utm_source=github&utm_medium=readme&utm_campaign=vibebench#subscribe-email)** for result write-ups when we re-run after notable model releases — no need to live in GitHub to stay in the loop.
5. ☕ **[Buy Me a Coffee](https://buymeacoffee.com/kondasviktor)** if you want to support maintenance — optional tips help keep VCL VibeBench updated when new models drop.

---

## Latest maintainer results

Models and dates below are from the last committed maintainer run — see [`results/latest.md`](./results/latest.md).

---

## Run the full matrix (BYOK + pick any model)

**BYOK** = put **your** API key in `.env`. We don’t run visitor evals on our credit.  
**Default provider:** [OpenRouter](https://openrouter.ai/) — set `MODELS` to any OpenRouter ID(s) from [openrouter.ai/models](https://openrouter.ai/models).

```bash
git clone https://github.com/kondasviktor/vcl-ai-model-arena.git
cd vcl-ai-model-arena
cp .env.example .env          # set OPENROUTER_API_KEY
npm ci

# Fun suite — same prompts as the copy-paste section above
MODELS=anthropic/claude-opus-5,openai/gpt-5.6-sol,google/gemini-3.6-flash npm run eval:fun

# Dev suite — coding / debugging (vibe coders)
MODELS=anthropic/claude-opus-5,openai/gpt-5.6-sol,google/gemini-3.6-flash npm run eval:dev

# Cheap sanity check (2 inexpensive OpenRouter models, Fun only)
npm run eval:smoke

# Optional: confirm IDs exist on OpenRouter
MODELS=anthropic/claude-opus-5,openai/gpt-5.6-sol npm run validate:models

npx promptfoo view            # local results UI
```

### Optional: Hetzner Experiments Inference (BYOK)

OpenRouter stays the default. You can also run the same Fun/Dev prompts against **Hetzner’s experimental OpenAI-compatible Inference API** with **your own** Experiments token (not a Hetzner Cloud console token).

1. Sign in at [experiments.hetzner.com](https://experiments.hetzner.com) → **Apps → Inference → Create API Token**  
2. Put the token in `.env` as `HETZNER_INFERENCE_API_KEY`  
3. Set `PROVIDER=hetzner`

Allowlisted model IDs (must match Hetzner docs):

| Label | Model ID |
|---|---|
| Kimi K2.7 Code | `Kimi-K2.7-Code` |
| DeepSeek V4 Flash | `DeepSeek-V4-Flash-0731` |
| GLM 5.2 | `GLM-5.2-NVFP4` |
| Qwen 3.6 35B-A3B | `Qwen/Qwen3.6-35B-A3B-FP8` |

```bash
# All four (default when MODELS unset under PROVIDER=hetzner)
PROVIDER=hetzner npm run eval:fun

# Or pick models explicitly
PROVIDER=hetzner \
MODELS=Kimi-K2.7-Code,DeepSeek-V4-Flash-0731,GLM-5.2-NVFP4,Qwen/Qwen3.6-35B-A3B-FP8 \
npm run eval:fun

# Cheap Hetzner sanity check (Qwen only, Fun)
npm run eval:hetzner:smoke

PROVIDER=hetzner npm run validate:models
```

Notes:

- Free **while Hetzner marks Inference as experimental**; they may introduce billing later — no SLA.  
- EU-**hosted** open weights; the models themselves are not “European-developed.”  
- Rate limits are tight (~10 requests/min); the runner uses concurrency **1** for Hetzner.  
- CI / GitHub Actions stays **OpenRouter-only** — bring your own Hetzner key locally.  
- Docs: [experiments.hetzner.com/docs/inference](https://experiments.hetzner.com/docs/inference)

After a run:

```bash
DATE=$(date +%Y-%m-%d)
# save promptfoo output with -o results/fun-$DATE.json (see run-eval -- -o ...)
node scripts/write-result-meta.js fun "$DATE" maintainer
node scripts/write-result-meta.js dev "$DATE" maintainer
npm run results:latest
```

Example with explicit output path:

```bash
MODELS=google/gemini-3.6-flash,moonshotai/kimi-k3 \
  node scripts/run-eval.js fun -- -o results/fun-$(date +%Y-%m-%d).json
```

---

## Docs

- [docs/philosophy.md](./docs/philosophy.md) — why VCL VibeBench exists  
- [docs/methodology.md](./docs/methodology.md) — scoring and reproducibility  
- [docs/ROADMAP.md](./docs/ROADMAP.md) — 1.0 Fun · 1.1 Dev · 1.2 Score  
- [CONTRIBUTING.md](./CONTRIBUTING.md) · [SECURITY.md](./SECURITY.md)

## License

- **Code:** MIT ([LICENSE](./LICENSE))
- **Prompts / fixtures / result summaries:** CC BY 4.0 ([LICENSE-DATA](./LICENSE-DATA))
- Third-party notices: [NOTICE](./NOTICE)

Solo-maintained, best-effort issue triage. PRs reviewed when possible.
