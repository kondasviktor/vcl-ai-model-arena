# Contributing

Thanks for helping VCL VibeBench stay useful for vibe coders.

## Ways to contribute

- Propose a new **scored** or **exploratory** prompt (open an issue with the template)
- Suggest OpenRouter model IDs worth featuring in a maintainer result write-up
- Submit a **community** result run (with metadata listing exact model IDs)

## Rules

1. **No secrets** in issues, PRs, or results files
2. New Fun prompts: keep them short and copy-paste friendly; Dev prompts: realistic coding/debug tasks
3. Prefer deterministic asserts for scored tests
4. Do not add LLM-judge scoring unless discussed in an issue first
5. Code contributions: MIT. Prompt/fixture/data contributions: CC BY 4.0 (see LICENSE-DATA)
6. Label official vs community runs clearly in metadata

## Local setup (BYOK)

```bash
cp .env.example .env   # set OPENROUTER_API_KEY
npm ci
MODELS=google/gemini-3.6-flash,moonshotai/kimi-k3 npm run eval:fun
# or: npm run eval:smoke
npm run hf:export   # refresh Hugging Face JSONL + Space data from YAML / results
```
