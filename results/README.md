# Results archive

Each run should produce:

- `results/<suite>-<YYYY-MM-DD>.json` — promptfoo output
- `results/<suite>-<YYYY-MM-DD>.meta.json` — reproducibility metadata

Then:

```bash
npm run results:latest
```

Browse a file locally:

```bash
npx promptfoo view results/fun-YYYY-MM-DD.json
```

`npm run results:latest` writes the human summary. For **Score**, that file includes a per-task table (what each helper checks, pass/fail, and a plain-language detail). `9/12` is nine unit-tested helpers, not an IQ score — see [tests/score/README.md](../tests/score/README.md).

Do not commit API keys, request headers, or absolute local paths.
