# Contributing

Thanks for helping VCL VibeBench stay useful for vibe coders.

## Ways to contribute

- Propose a new **scored** or **exploratory** prompt (open an issue with the template)
- Propose a model ID for the registry
- Submit a **community** result run (with metadata)

## Rules

1. **No secrets** in issues, PRs, or results files
2. New prompts: keep fun tests short/shareable; keep dev tests realistic
3. Prefer deterministic asserts for scored tests
4. Do not add LLM-judge scoring unless discussed in an issue first
5. Code contributions: MIT. Prompt/fixture/data contributions: CC BY 4.0 (see LICENSE-DATA)
6. Label official vs community runs clearly in metadata

## Local setup

```bash
cp .env.example .env
npm ci
npm run eval:fun
```
