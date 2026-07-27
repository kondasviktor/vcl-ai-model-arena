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

Do not commit API keys, request headers, or absolute local paths.
