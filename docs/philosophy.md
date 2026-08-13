# Philosophy

VCL VibeBench exists because vendor slides and academic leaderboards answer the wrong question for vibe coders.

**We ask:** which model helps you ship *your* practical tasks this week?  
**We do not ask:** which model is “smartest” in absolute terms.

## Why these prompts

Shipping suites mix:

- **Scored** checks with a clear expected answer (counting, logic, bug fix markers)
- **Exploratory** prompts that reveal personality, explanation quality, and judgment — shown side-by-side, not forced into a fake numeric score

No LLM-as-judge. Deterministic asserts only where a single answer exists. No blended “best model” number across Fun, Dev, and Score.

**1.0 Fun** prompts are published for copy-paste in any chat UI *and* for CLI multi-model runs.  
**1.1 Dev** prompts are aimed at vibe coders running the CLI.  
**1.2 Score** is a small original coding suite with unit-test pass/fail (Aider-lite protocol) — not a SWE-bench or lab-index clone.

## Why BYOK + forkability

Automated runs use **BYOK** (bring your own API key). Default path: [OpenRouter](https://openrouter.ai/). Optional experimental path: [Hetzner Experiments Inference](https://experiments.hetzner.com/docs/inference) (`PROVIDER=hetzner`). Anyone can re-run the same prompts with models they choose and check our results. That is the point of “stop trusting benchmark slides.”

## What we are not

- Not MMLU / SWE-bench / Chatbot Arena replacements
- Not an “AI-proof” security product
- Not a claim that any model is permanently best

## Name note

Display name is **VCL VibeBench** (GitHub slug `vcl-ai-model-arena`) to distinguish from other projects that already use “VibeBench” alone.
