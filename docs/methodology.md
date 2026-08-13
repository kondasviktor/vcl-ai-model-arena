# Methodology — VCL VibeBench

## Version

- Product: **VCL VibeBench** — **1.0 Fun**, **1.1 Dev**, and **1.2 Score** shipping
- Engine: promptfoo (pinned in `package.json`)
- Providers (default): any OpenRouter model ID via `MODELS=` (BYOK with `OPENROUTER_API_KEY`)
- Providers (optional): Hetzner Experiments Inference via `PROVIDER=hetzner` + `HETZNER_INFERENCE_API_KEY` + allowlisted model IDs (BYOK; experimental)

## Suites

| Suite | Version | Audience | How to try |
|---|---|---|---|
| Fun | 1.0 | Everyone | Copy-paste in README **and** CLI (`npm run eval:fun`) |
| Dev | 1.1 | Vibe coders / developers | CLI only (`npm run eval:dev`) |
| Score | 1.2 | Developers who want a unit-tested coding number | CLI (`npm run eval:score`; smoke: `npm run eval:score:smoke`) |

## Scoring

Each test is tagged `metadata.scoring: scored | exploratory`.

- **Scored:** deterministic `contains` / `regex` asserts. Exact-answer Fun prompts use `regex` so “answer with just the number” is enforced, not only correctness. These feed accuracy summaries.
- **Exploratory:** no assert; compare qualitatively in the promptfoo UI (or by eye in a chat app). **No numeric “winner.”**

There is **no LLM judge**. Fun, Dev, and Score stay on deterministic asserts. There is **no blended “best model” score** across suites.

## Run parameters

- Temperature: `0` when the provider honors it
- One attempt per prompt per model
- Official maintainer runs label: `maintainer` in result metadata
- Community PRs label: `community`
- Models for a run come from **`MODELS=`** (required for OpenRouter, except `npm run eval:smoke`), or from the Hetzner allowlist when `PROVIDER=hetzner` and `MODELS` is unset

## Reproducibility

Every committed result should include:

1. `results/<suite>-<YYYY-MM-DD>.json` — promptfoo output
2. `results/<suite>-<YYYY-MM-DD>.meta.json` — VCL VibeBench version, promptfoo version, git SHA, **exact model IDs**, timestamp, runner

Regenerate the human summary with `npm run results:latest`.

## Optional provider: Hetzner Experiments Inference

Set `PROVIDER=hetzner` and `HETZNER_INFERENCE_API_KEY` (your own Experiments token). Scored/exploratory asserts are unchanged. The generated promptfoo config uses OpenAI-compatible `apiBaseUrl` and `maxConcurrency: 1` (Hetzner request limits). Label published result writeups with the provider (e.g. `hetzner:…` model labels). Free only while Hetzner marks the API experimental — not a permanent €0 guarantee. GitHub Actions CI remains OpenRouter-only.

## Picking models

### OpenRouter (default)

1. Browse https://openrouter.ai/models  
2. Set `MODELS=id1,id2,...`  
3. Optional: `MODELS=... npm run validate:models`  
4. `npm run eval:fun`, `npm run eval:dev`, or `npm run eval:score`

### Hetzner (optional)

1. Create a token at https://experiments.hetzner.com → Inference  
2. Set `HETZNER_INFERENCE_API_KEY` and `PROVIDER=hetzner`  
3. Use allowlisted IDs (see README) or omit `MODELS` to run all four  
4. `PROVIDER=hetzner npm run validate:models`  
5. `PROVIDER=hetzner npm run eval:fun`

There is **no frozen OpenRouter model registry** in the repo — model catalogs change too often. Each result file records the IDs that were actually run. Hetzner IDs are allowlisted in `scripts/hetzner-models.js` to match current Experiments docs.

## Cadence

Target a Fun + Dev run within 48 hours of a notable frontier release; publish no later than 96 hours. Correctness beats speed. Add **Score** on coding-model drops (`npm run eval:score` or `eval:score:smoke`).

Do **not** wrap third-party mega-benches (SWE-bench, Terminal-Bench, Artificial Analysis indexes, CursorBench, and similar). Cite them in write-ups when useful; do not re-run them here.

## Score (1.2)

Twelve original JavaScript tasks in [`tests/score/`](../tests/score/). Protocol is Aider-lite (write code, tests grade). Fixtures are **original VCL** — we do not clone Aider polyglot or Exercism at runtime.

### What a Score number means

Score is **not** a general intelligence rating. `9/12` means nine everyday helpers compiled and passed hidden examples, and three did not — not “the model is 75% as capable.”

For each task:

1. The prompt asks for **one named function** in a markdown fence (no tests, no essay).
2. [`tests/score/harness.js`](../tests/score/harness.js) extracts code and runs it in a `vm` sandbox (timeout, no filesystem).
3. A few **hidden unit tests** must match exactly (`pass` / `fail` only).

There is **no LLM judge**. Score is **not** blended with Fun or Dev.

| If the log says… | It actually means… |
|---|---|
| `all unit tests passed` | Extracted function ran; every hidden example matched. |
| `expected X, got Y` | Function ran, but a return value was wrong. |
| `Unexpected token` / `Invalid or unexpected token` | The extracted snippet **did not compile**. Unit tests never ran. Common with thinking models that open a fence, abort mid-line, then emit a finished function in a second fence. |

The harness prefers the **last syntactically valid** `function name() { … }` in the reply so a finished second fence can still pass. The 2026-08-13 Grok 4.6 JSON was graded with an earlier extractor that compiled the truncated thinking draft — that is why `parseQuery`, `deepGet`, and `titleCase` show as fail in that file even though the finished functions look correct.

OpenRouter `x-ai/grok-4.6` is the same weights as **Cursor Grok 4.6**. A Score run on that ID is a Score run on Cursor Grok 4.6. Fun/Dev maintainer tables may still be an older Grok (check `results/latest.md`).

- Smoke: first two tasks (`slugify`, `isPalindrome`)
- Cost intent: smoke = cents; full suite ≤ about **$2 per model**
- Same BYOK as Fun/Dev (OpenRouter default, `PROVIDER=hetzner` optional)
