# Score (1.2)

Twelve **original** VCL coding tasks. The model writes a JavaScript function; **unit tests** pass or fail. No LLM judge.

This is Aider-lite in *protocol* (edit/write code → tests), not a clone of Aider polyglot, Exercism, SWE-bench, Terminal-Bench, CursorBench, or Artificial Analysis.

```bash
MODELS=google/gemini-3.6-flash npm run eval:score
npm run eval:score:smoke   # 2 tasks, cents
```

Cost target: smoke = cents; full 12 tasks ≤ about **$2 per model** on typical OpenRouter chat prices. Same BYOK as Fun/Dev (`OPENROUTER_API_KEY` or `PROVIDER=hetzner`).
