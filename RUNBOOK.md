# RUNBOOK — model drop ritual

Target: result within **48h**, publish by **96h**. Correctness beats speed.

1. Confirm model ID on https://openrouter.ai/models
2. Add/activate in `models/registry.yaml` and suite YAMLs (`npm run validate:models`)
3. `npm run eval:fun` then `npm run eval:dev` (or CI workflow_dispatch)
4. Write `results/<suite>-<date>.meta.json` (see `docs/methodology.md`)
5. `npm run results:latest`
6. Optional: `promptfoo eval ... --share` for an embed link (committed JSON is canonical)
7. Build a screenshot-friendly result card from `results/latest.md`
8. Publish VCL post/newsletter — lead with the **result**, not “we have a repo”
9. Distribute with UTMs (see private site `docs/COMMUNITY_TRACKING.md`); share the result card / share URL, not a bare clone command
10. Update README “Latest run” section; bump CHANGELOG if suites changed

## Cost gate

Estimate spend before multi-model paid runs. Prefer free/cheap variants when possible. Keep an OpenRouter spend limit on the key.

## Incident — leaked key

1. Revoke the OpenRouter key immediately  
2. Replace GitHub Actions secret  
3. Scrub history if the key was committed  
4. Note rotation in CHANGELOG  
