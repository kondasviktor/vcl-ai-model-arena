# Methodology — VibeBench 1.0 (Tier 1)

## Version

- Product: **VCL VibeBench 1.0.0**
- Engine: promptfoo (pinned in `package.json`)
- Providers: OpenRouter model IDs listed in `models/registry.yaml`

## Suites

| Suite | Path | Purpose |
|---|---|---|
| Fun | `tests/fun` | Short, shareable checks |
| Dev | `tests/dev` | Practical coding / debugging prompts |

## Scoring

Each test is tagged `metadata.scoring: scored | exploratory`.

- **Scored:** deterministic `contains` / similar asserts. These feed accuracy summaries.
- **Exploratory:** no assert; compare qualitatively in the promptfoo UI. **No numeric “winner”.**

There is **no LLM judge** in 1.0.

## Run parameters

- Temperature: `0` (registry default; provider may still apply its own decoding)
- One attempt per prompt per model
- Official maintainer runs label: `maintainer` in result metadata
- Community PRs label: `community`

## Reproducibility

Every committed result should include:

1. `results/<suite>-<YYYY-MM-DD>.json` — promptfoo output
2. `results/<suite>-<YYYY-MM-DD>.meta.json` — VibeBench version, promptfoo version, registry hash, git SHA, model IDs, timestamp, runner

Regenerate the human summary with `npm run results:latest`.

## Updating the roster

1. Check https://openrouter.ai/models
2. Edit `models/registry.yaml`
3. Mirror providers in `tests/*/promptfooconfig.yaml` (or regenerate)
4. Run `npm run validate:models`
5. Comment out retired models; do not delete them

## Cadence

Target a Tier 1 run within 48 hours of a notable frontier release; publish no later than 96 hours. Correctness beats speed.
