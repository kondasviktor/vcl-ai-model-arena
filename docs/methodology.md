# Methodology — VibeBench 1.0 (Tier 1)

## Version

- Product: **VCL VibeBench 1.0.0**
- Engine: promptfoo (pinned in `package.json`)
- Providers: any OpenRouter model ID via `MODELS=` (BYOK with `OPENROUTER_API_KEY`)

## Suites

| Suite | Audience | How to try |
|---|---|---|
| Fun | Everyone | Copy-paste in README **and** CLI (`npm run eval:fun`) |
| Dev | Vibe coders / developers | CLI only (`npm run eval:dev`) |

## Scoring

Each test is tagged `metadata.scoring: scored | exploratory`.

- **Scored:** deterministic `contains` / similar asserts. These feed accuracy summaries.
- **Exploratory:** no assert; compare qualitatively in the promptfoo UI (or by eye in a chat app). **No numeric “winner.”**

There is **no LLM judge** in 1.0.

## Run parameters

- Temperature: `0` when the provider honors it
- One attempt per prompt per model
- Official maintainer runs label: `maintainer` in result metadata
- Community PRs label: `community`
- Models for a run come from **`MODELS=`** (required), except `npm run eval:smoke` which uses a fixed cheap pair

## Reproducibility

Every committed result should include:

1. `results/<suite>-<YYYY-MM-DD>.json` — promptfoo output
2. `results/<suite>-<YYYY-MM-DD>.meta.json` — VibeBench version, promptfoo version, git SHA, **exact model IDs**, timestamp, runner

Regenerate the human summary with `npm run results:latest`.

## Picking models

1. Browse https://openrouter.ai/models  
2. Set `MODELS=id1,id2,...`  
3. Optional: `MODELS=... npm run validate:models`  
4. `npm run eval:fun` or `npm run eval:dev`

There is **no frozen model registry** in the repo — model catalogs change too often. Each result file records the IDs that were actually run.

## Cadence

Target a Tier 1 run within 48 hours of a notable frontier release; publish no later than 96 hours. Correctness beats speed.
