# Public / private repository contract

| Concern | Public `kondasviktor/vcl-ai-model-arena` | Private `vibecoderslife` |
|---|---|---|
| Canonical benchmark code | Yes | No |
| Fixtures, methodology, results | Yes | No |
| Vibe Vision generator/core (from 1.1) | Yes — source of truth | Pinned browser artifact only |
| Live page shell, VCL navigation/copy | No | Yes |
| Newsletter API/data, analytics IDs | Never | Yes |
| Secrets / `.env` | Never | Private repo only, still untracked |

## Rules

1. **No nested copy** of this repo inside `vibecoderslife`. Link by public URL only.
2. **No submodule** of this repo in the private site.
3. Never fetch `main` of this repo at Vercel build time; vendor only tagged, hashed artifacts when needed.
4. VCL pages link to `https://github.com/kondasviktor/vcl-ai-model-arena`.
5. This README/results link only to public VCL URLs (`https://vibecoderslife.com/...`).
6. Neither repo references local absolute paths or the private GitHub remote of the other.

## Extract history

Phase 0 (2026-07-27): clean extract from a staging folder inside the private site working tree. New Git history — no private VCL commits.
