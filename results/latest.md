# Latest VCL VibeBench results

_Generated 2026-07-28_

### dev — 2026-07-28

- VCL VibeBench: 1.0.0
- promptfoo: 0.121.19
- Runner: local
- Label: maintainer
- Models: anthropic/claude-opus-4.8, anthropic/claude-fable-5, openai/gpt-5.6-sol, x-ai/grok-4.5, moonshotai/kimi-k3, google/gemini-3.6-flash
- Notes: anthropic/claude-fable-5 failed contains assert on Email validation with regex (59/60 cells passed).

#### Scored prompts (deterministic asserts)

| Model | Pass | Fail | Scored total |
|---|---:|---:|---:|
| anthropic/claude-fable-5 | 4 | 1 | 5 |
| anthropic/claude-opus-4.8 | 5 | 0 | 5 |
| google/gemini-3.6-flash | 5 | 0 | 5 |
| moonshotai/kimi-k3 | 5 | 0 | 5 |
| openai/gpt-5.6-sol | 5 | 0 | 5 |
| x-ai/grok-4.5 | 5 | 0 | 5 |

#### Exploratory prompts (qualitative — not scored)

| Model | Exploratory prompts |
|---|---:|
| anthropic/claude-fable-5 | 5 |
| anthropic/claude-opus-4.8 | 5 |
| google/gemini-3.6-flash | 5 |
| moonshotai/kimi-k3 | 5 |
| openai/gpt-5.6-sol | 5 |
| x-ai/grok-4.5 | 5 |

_No blended “best model” score. Exploratory rows are for side-by-side judgment only. See [methodology](../docs/methodology.md)._

Files: `dev-2026-07-28.json` + `dev-2026-07-28.meta.json`

### fun — 2026-07-28

- VCL VibeBench: 1.0.0
- promptfoo: 0.121.19
- Runner: local
- Label: maintainer
- Models: anthropic/claude-fable-5, x-ai/grok-4.5, moonshotai/kimi-k3, google/gemini-3.6-flash, anthropic/claude-opus-4.8, openai/gpt-5.6-sol
- Notes: Strict regex on Fun exact-answer prompts. moonshotai/kimi-k3: 1/3 Fun scored (format fails on strawberry + 9.11 vs 9.9); reasoning correct.

#### Scored prompts (deterministic asserts)

| Model | Pass | Fail | Scored total |
|---|---:|---:|---:|
| anthropic/claude-fable-5 | 1 | 2 | 3 |
| anthropic/claude-opus-4.8 | 3 | 0 | 3 |
| google/gemini-3.6-flash | 2 | 1 | 3 |
| moonshotai/kimi-k3 | 1 | 2 | 3 |
| openai/gpt-5.6-sol | 3 | 0 | 3 |
| x-ai/grok-4.5 | 1 | 2 | 3 |

#### Exploratory prompts (qualitative — not scored)

| Model | Exploratory prompts |
|---|---:|
| anthropic/claude-fable-5 | 7 |
| anthropic/claude-opus-4.8 | 7 |
| google/gemini-3.6-flash | 7 |
| moonshotai/kimi-k3 | 7 |
| openai/gpt-5.6-sol | 7 |
| x-ai/grok-4.5 | 7 |

_No blended “best model” score. Exploratory rows are for side-by-side judgment only. See [methodology](../docs/methodology.md)._

Files: `fun-2026-07-28.json` + `fun-2026-07-28.meta.json`
