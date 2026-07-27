# Results archive

Each eval run gets saved here as `<suite>-<date>.json` (via the GitHub Action or a manual
`promptfoo eval -o results/fun-2026-07-23.json` run). Over time this becomes a dated log of
which model won on which test — useful for a "here's how the race has moved" retrospective post.

To turn a result file back into a browsable UI locally:

```bash
npx promptfoo@latest view results/fun-2026-07-23.json
```

To get a public shareable link instead of a static JSON file:

```bash
npx promptfoo@latest eval -c tests/fun/promptfooconfig.yaml --share
```
