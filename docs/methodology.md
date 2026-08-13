# Methodology — VCL VibeBench

## Version

- Product: **VCL VibeBench** — **1.0 Fun** and **1.1 Dev** shipping; **1.2 Score** planned
- Engine: promptfoo (pinned in `package.json`)
- Providers (default): any OpenRouter model ID via `MODELS=` (BYOK with `OPENROUTER_API_KEY`)
- Providers (optional): Hetzner Experiments Inference via `PROVIDER=hetzner` + `HETZNER_INFERENCE_API_KEY` + allowlisted model IDs (BYOK; experimental)

## Suites

| Suite | Version | Audience | How to try |
|---|---|---|---|
| Fun | 1.0 | Everyone | Copy-paste in README **and** CLI (`npm run eval:fun`) |
| Dev | 1.1 | Vibe coders / developers | CLI only (`npm run eval:dev`) |
| Score | 1.2 (planned) | Developers who want a unit-tested coding number | CLI (`npm run eval:score` when it ships) |

## Scoring

Each test is tagged `metadata.scoring: scored | exploratory`.

- **Scored:** deterministic `contains` / `regex` asserts. Exact-answer Fun prompts use `regex` so “answer with just the number” is enforced, not only correctness. These feed accuracy summaries.
- **Exploratory:** no assert; compare qualitatively in the promptfoo UI (or by eye in a chat app). **No numeric “winner.”**

There is **no LLM judge**. Fun, Dev, and (when it ships) Score stay on deterministic asserts. There is **no blended “best model” score** across suites.

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
4. `npm run eval:fun` or `npm run eval:dev`

### Hetzner (optional)

1. Create a token at https://experiments.hetzner.com → Inference  
2. Set `HETZNER_INFERENCE_API_KEY` and `PROVIDER=hetzner`  
3. Use allowlisted IDs (see README) or omit `MODELS` to run all four  
4. `PROVIDER=hetzner npm run validate:models`  
5. `PROVIDER=hetzner npm run eval:fun`

There is **no frozen OpenRouter model registry** in the repo — model catalogs change too often. Each result file records the IDs that were actually run. Hetzner IDs are allowlisted in `scripts/hetzner-models.js` to match current Experiments docs.

## Cadence

Target a Fun + Dev run within 48 hours of a notable frontier release; publish no later than 96 hours. Correctness beats speed. Score (1.2) is optional on coding-model drops once it ships.

Do **not** wrap third-party mega-benches (SWE-bench, Terminal-Bench, Artificial Analysis indexes, CursorBench, and similar). Cite them in write-ups when useful; do not re-run them here.
