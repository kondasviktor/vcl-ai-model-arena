# VCL VibeBench

**Stop trusting benchmark slides. Run it yourself.**

[VCL VibeBench](https://github.com/kondasviktor/vcl-ai-model-arena) is an open, forkable set of **practical prompts** for comparing AI models — by [Vibe Coder's Life](https://vibecoderslife.com/?utm_source=github&utm_medium=readme&utm_campaign=vibebench).

You can try the short **Fun** checks in any chat UI (ChatGPT, Claude, Gemini, Grok…).  
If you want a fair multi-model matrix, run the same prompts locally with **BYOK** (bring your own [OpenRouter](https://openrouter.ai/) API key) and **pick any OpenRouter model**.

> Display name: **VCL VibeBench** · GitHub: `kondasviktor/vcl-ai-model-arena`  
> Built for developers, makers, indie hackers, and AI enthusiasts — not academic leaderboard theater.

---

## Why this exists

Vendor slides and third-party charts often answer “who looks smartest on a fixed exam.”  
VibeBench asks a different question: **which model helps you with everyday practical tasks this week?**

Tier 1 (**Vibe Check**) ships two suites:

- **Fun** — short prompts anyone can try (copy-paste below, or CLI)
- **Dev** — coding / debugging prompts for vibe coders (CLI)

Scored prompts have a clear expected answer. Exploratory prompts are for side-by-side judgment — **no blended “best model” score**, no LLM judge in 1.0. Details: [docs/methodology.md](./docs/methodology.md).

Coming next: **Vibe Vision (1.1)** · **Vibe Score (1.2)** — [docs/ROADMAP.md](./docs/ROADMAP.md).

---

## Try Fun in 2 minutes (no terminal)

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

## What’s in Dev (CLI only)

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

1. **Star this repo** if VibeBench is useful — stars help others find an honest, re-runnable comparison when a new model drops, and they tell us the project is worth maintaining.
2. **Fork it** when you want your own suite, extra prompts, or a private comparison for your team — that’s the point of open fixtures.
3. **Run the CLI matrix (BYOK)** if you can — paste-into-one-chat is great for a quick vibe check; a local run with your OpenRouter key compares **many models on the exact same prompts** in one go.
4. **[Subscribe to the Vibe Coder's Life newsletter](https://vibecoderslife.com/?utm_source=github&utm_medium=readme&utm_campaign=vibebench#subscribe-email)** for result write-ups when we re-run after notable model releases — no need to live in GitHub to stay in the loop.

---

## Latest maintainer results

Models and dates below are from the last committed maintainer run — see [`results/latest.md`](./results/latest.md).

---

## Run the full matrix (BYOK + pick any model)

**BYOK** = put **your** OpenRouter API key in `.env`. We don’t run visitor evals on our credit.  
**Pick any model** = set `MODELS` to any OpenRouter ID(s) from [openrouter.ai/models](https://openrouter.ai/models).

```bash
git clone https://github.com/kondasviktor/vcl-ai-model-arena.git
cd vcl-ai-model-arena
cp .env.example .env          # set OPENROUTER_API_KEY
npm ci

# Fun suite — same prompts as the copy-paste section above
MODELS=anthropic/claude-opus-5,openai/gpt-5.6-sol,google/gemini-3.6-flash npm run eval:fun

# Dev suite — coding / debugging (vibe coders)
MODELS=anthropic/claude-opus-5,openai/gpt-5.6-sol,google/gemini-3.6-flash npm run eval:dev

# Cheap sanity check (2 inexpensive models, Fun only)
npm run eval:smoke

# Optional: confirm IDs exist on OpenRouter
MODELS=anthropic/claude-opus-5,openai/gpt-5.6-sol npm run validate:models

npx promptfoo view            # local results UI
```

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

- [docs/philosophy.md](./docs/philosophy.md) — why VibeBench exists  
- [docs/methodology.md](./docs/methodology.md) — scoring and reproducibility  
- [docs/ROADMAP.md](./docs/ROADMAP.md) — 1.1 Vision · 1.2 Score  
- [CONTRIBUTING.md](./CONTRIBUTING.md) · [SECURITY.md](./SECURITY.md)

## License

- **Code:** MIT ([LICENSE](./LICENSE))
- **Prompts / fixtures / result summaries:** CC BY 4.0 ([LICENSE-DATA](./LICENSE-DATA))
- Third-party notices: [NOTICE](./NOTICE)

Solo-maintained, best-effort issue triage. PRs reviewed when possible.
