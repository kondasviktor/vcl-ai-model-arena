---
pretty_name: VCL VibeBench
license: cc-by-4.0
language:
  - en
task_categories:
  - text-generation
tags:
  - benchmark
  - llm
  - evaluation
  - coding
  - vibe-coding
  - openrouter
configs:
  - config_name: fun
    data_files: fun.jsonl
  - config_name: dev
    data_files: dev.jsonl
  - config_name: score
    data_files: score.jsonl
  - config_name: results
    data_files: results.jsonl
---

# VCL VibeBench

**Stop trusting benchmark slides. Run it yourself.**

Practical AI model prompts from [Vibe Coder's Life](https://vibecoderslife.com/vibebench?utm_source=huggingface&utm_medium=dataset&utm_campaign=vibebench).

This dataset mirrors the open-source GitHub suites. It is **not** a blended intelligence leaderboard. There is **no LLM judge**. `9/12` on Score means nine JavaScript helpers compiled and passed hidden unit tests — not “75% smart.”

## Configs

| Config | What it is | Rows |
| --- | --- | --- |
| `fun` | Fun 1.0 — short copy-paste prompts | 10 |
| `dev` | Dev 1.1 — coding / debugging prompts | 10 |
| `score` | Score 1.2 — write one named JS function | 12 |
| `results` | Slim maintainer run summaries (pass/fail counts) | varies |

```python
from datasets import load_dataset

fun = load_dataset("kondasviktor/vcl-vibebench", "fun")
dev = load_dataset("kondasviktor/vcl-vibebench", "dev")
score = load_dataset("kondasviktor/vcl-vibebench", "score")
results = load_dataset("kondasviktor/vcl-vibebench", "results")
```

## Hidden tests stay on GitHub

Score **prompts** are here. Hidden unit tests live in the GitHub harness. Fork and run:

```bash
git clone https://github.com/kondasviktor/vcl-ai-model-arena.git
cd vcl-ai-model-arena
cp .env.example .env   # OPENROUTER_API_KEY
npm ci
MODELS=google/gemini-3.6-flash npm run eval:score:smoke
```

## Links

- Interactive explorer (Static Space): [kondasviktor/vcl-vibebench](https://huggingface.co/spaces/kondasviktor/vcl-vibebench)
- Source + CLI: [github.com/kondasviktor/vcl-ai-model-arena](https://github.com/kondasviktor/vcl-ai-model-arena)
- Write-ups + newsletter: [vibecoderslife.com/vibebench](https://vibecoderslife.com/vibebench?utm_source=huggingface&utm_medium=dataset&utm_campaign=vibebench)

Prompts and result summaries: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Code on GitHub: MIT.
