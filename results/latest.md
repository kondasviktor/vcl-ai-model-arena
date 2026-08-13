# Latest VCL VibeBench results

_Generated 2026-08-13_

### dev — 2026-07-28

- VCL VibeBench: 1.0.0
- promptfoo: 0.121.19
- Runner: local
- Label: maintainer
- Models: anthropic/claude-opus-4.8, anthropic/claude-fable-5, openai/gpt-5.6-sol, x-ai/grok-4.5, moonshotai/kimi-k3, google/gemini-3.6-flash
- Notes: anthropic/claude-fable-5 failed contains assert on Email validation with regex (59/60 cells passed).

#### Scored prompts (deterministic asserts)

| Model | Pass | Fail | Scored total |
|---|---:|---:|---:|
| anthropic/claude-fable-5 | 4 | 1 | 5 |
| anthropic/claude-opus-4.8 | 5 | 0 | 5 |
| google/gemini-3.6-flash | 5 | 0 | 5 |
| moonshotai/kimi-k3 | 5 | 0 | 5 |
| openai/gpt-5.6-sol | 5 | 0 | 5 |
| x-ai/grok-4.5 | 5 | 0 | 5 |

#### Exploratory prompts (qualitative — not scored)

| Model | Exploratory prompts |
|---|---:|
| anthropic/claude-fable-5 | 5 |
| anthropic/claude-opus-4.8 | 5 |
| google/gemini-3.6-flash | 5 |
| moonshotai/kimi-k3 | 5 |
| openai/gpt-5.6-sol | 5 |
| x-ai/grok-4.5 | 5 |

_No blended “best model” score. Exploratory rows are for side-by-side judgment only. See [methodology](../docs/methodology.md)._

Files: `dev-2026-07-28.json` + `dev-2026-07-28.meta.json`

### fun — 2026-07-28

- VCL VibeBench: 1.0.0
- promptfoo: 0.121.19
- Runner: local
- Label: maintainer
- Models: anthropic/claude-fable-5, x-ai/grok-4.5, moonshotai/kimi-k3, google/gemini-3.6-flash, anthropic/claude-opus-4.8, openai/gpt-5.6-sol
- Notes: Strict regex on Fun exact-answer prompts. moonshotai/kimi-k3: 1/3 Fun scored (format fails on strawberry + 9.11 vs 9.9); reasoning correct.

#### Scored prompts (deterministic asserts)

| Model | Pass | Fail | Scored total |
|---|---:|---:|---:|
| anthropic/claude-fable-5 | 1 | 2 | 3 |
| anthropic/claude-opus-4.8 | 3 | 0 | 3 |
| google/gemini-3.6-flash | 2 | 1 | 3 |
| moonshotai/kimi-k3 | 1 | 2 | 3 |
| openai/gpt-5.6-sol | 3 | 0 | 3 |
| x-ai/grok-4.5 | 1 | 2 | 3 |

#### Exploratory prompts (qualitative — not scored)

| Model | Exploratory prompts |
|---|---:|
| anthropic/claude-fable-5 | 7 |
| anthropic/claude-opus-4.8 | 7 |
| google/gemini-3.6-flash | 7 |
| moonshotai/kimi-k3 | 7 |
| openai/gpt-5.6-sol | 7 |
| x-ai/grok-4.5 | 7 |

_No blended “best model” score. Exploratory rows are for side-by-side judgment only. See [methodology](../docs/methodology.md)._

Files: `fun-2026-07-28.json` + `fun-2026-07-28.meta.json`

### score — 2026-08-13

- VCL VibeBench: 1.0.0
- promptfoo: 0.121.19
- Runner: local
- Label: maintainer
- Models: x-ai/grok-4.6
- Notes: First Score (1.2) maintainer run. OpenRouter x-ai/grok-4.6 is the same weights as Cursor Grok 4.6. Recorded 9/12. The 3 fails (parseQuery, deepGet, titleCase) are Unexpected token / Invalid or unexpected token: the reply leaked a truncated thinking fence, then a finished function; this eval compiled the draft, so unit tests never ran. Not proof those helpers are wrong. Fun/Dev were not re-run on 4.6. promptfoo eval-5F6-2026-08-13T14:01:16.

#### Scored prompts (deterministic asserts)

| Model | Pass | Fail | Scored total |
|---|---:|---:|---:|
| x-ai/grok-4.6 | 9 | 3 | 12 |

_All tasks in this suite are scored (unit-test pass/fail). No blended “best model” across Fun/Dev/Score. See [methodology](../docs/methodology.md)._

#### How to read Score

Score is **not** “how smart is this model” and **9/12 is not 75% intelligence.**

Each of the 12 rows is a small original JavaScript helper (slugify, parse a query string, Fibonacci, …). The model must return **one named function** in a markdown fence. There is **no LLM judge**. A sandbox extracts the code and runs a handful of **hidden unit tests**.

- **Pass** — the function compiled and every hidden example matched.
- **Fail** — we could not extract/compile a function, *or* a unit test mismatched (wrong return value).
- Syntax errors like `Unexpected token` mean the tests **never ran**. That is often a truncated thinking dump, not “Grok cannot title-case a string.”
- OpenRouter `x-ai/grok-4.6` is the same weights as **Cursor Grok 4.6**. Fun/Dev tables on this page are still the 2026-07-28 Grok **4.5** matrix.

See [methodology](../docs/methodology.md#score-12) and [tests/score/README.md](../tests/score/README.md).

#### Per task — x-ai/grok-4.6

| Task | What it checks | Result | Detail |
|---|---|---|---|
| `slugify` | URL slug from a string (lowercase, hyphens, strip junk) | **pass** | All assertions passed |
| `isPalindrome` | Palindrome after ignoring case, spaces, punctuation | **pass** | All assertions passed |
| `chunk` | Split an array into groups of size N | **pass** | All assertions passed |
| `parseQuery` | URL query string → `{ key: value }` object | **fail** | Could not compile the **extracted** snippet (`Unexpected token ';'`). The reply opened a code fence in thinking, cut off mid-line, then wrote a finished function in a second fence. This recorded run compiled the truncated draft — not proof the finished function is wrong. |
| `deepGet` | Read `a.b.0.c` from a nested object/array | **fail** | Could not compile the **extracted** snippet (`Invalid or unexpected token`). The reply opened a code fence in thinking, cut off mid-line, then wrote a finished function in a second fence. This recorded run compiled the truncated draft — not proof the finished function is wrong. |
| `uniquePreserve` | Deduplicate an array, keep first occurrence | **pass** | All assertions passed |
| `formatBytes` | Bytes → `1 KB` / `1.5 KB` style string | **pass** | All assertions passed |
| `rangeSum` | Sum of integers from a to b (either order) | **pass** | All assertions passed |
| `titleCase` | Capitalize each word; collapse extra spaces | **fail** | Could not compile the **extracted** snippet (`Unexpected token ';'`). The reply opened a code fence in thinking, cut off mid-line, then wrote a finished function in a second fence. This recorded run compiled the truncated draft — not proof the finished function is wrong. |
| `isAnagram` | Same letters ignoring case/spaces/punctuation | **pass** | All assertions passed |
| `fibonacci` | nth Fibonacci number (negative → null) | **pass** | All assertions passed |
| `groupBy` | Group objects by a property name | **pass** | All assertions passed |

_Those 3 syntax fails are from this recorded promptfoo run. Re-grading the same replies with the current extractor (last valid function) passes them — the finished second fence is fine. We do not rewrite the JSON._

Files: `score-2026-08-13.json` + `score-2026-08-13.meta.json`
