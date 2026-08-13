# Score (1.2)

Twelve **original** VCL coding tasks. The model writes a JavaScript function; **unit tests** pass or fail. No LLM judge.

This is Aider-lite in *protocol* (edit/write code → tests), not a clone of Aider polyglot, Exercism, SWE-bench, Terminal-Bench, CursorBench, or Artificial Analysis.

```bash
MODELS=google/gemini-3.6-flash npm run eval:score
npm run eval:score:smoke   # 2 tasks, cents
npm run test:score:harness # no API; known-good solutions + dual-fence extraction
```

Cost target: smoke = cents; full 12 tasks ≤ about **$2 per model** on typical OpenRouter chat prices. Same BYOK as Fun/Dev (`OPENROUTER_API_KEY` or `PROVIDER=hetzner`).

## What Score is doing

Each prompt says: write **one named function**, return **only** a markdown `javascript` fence.

[`harness.js`](./harness.js) then:

1. Pulls code out of the reply (prefers the last snippet that actually parses).
2. Runs it in a Node `vm` (1.5s timeout, no filesystem).
3. Calls a handful of **hidden** examples (`expectEq` / `expectDeep`).

**Pass** = compiled + every example matched. **Fail** = could not compile, or a return value was wrong.

`9/12` is not “the model is 75% smart.” It is nine helpers that ran cleanly and three that did not, on that run.

OpenRouter `x-ai/grok-4.6` is the same weights as **Cursor Grok 4.6**.

## The 12 tasks

| Task | What the hidden tests check |
|---|---|
| `slugify` | URL slug (`Hello World` → `hello-world`) |
| `isPalindrome` | Palindrome after stripping case / punctuation |
| `chunk` | Split array into groups of size N |
| `parseQuery` | `a=1&b=2` → `{ a: "1", b: "2" }` (last key wins, decode) |
| `deepGet` | `obj["a.b"]` / array indexes; missing → `undefined` |
| `uniquePreserve` | Unique primitives, first occurrence wins |
| `formatBytes` | `1024` → `1 KB`, `1536` → `1.5 KB` |
| `rangeSum` | Sum of integers from a to b (either order) |
| `titleCase` | Capitalize words; collapse whitespace |
| `isAnagram` | Same letters ignoring case / spaces / punctuation |
| `fibonacci` | `fibonacci(10) === 55`; negative → `null` |
| `groupBy` | Group objects by a property name |

## How to read a fail in the log / JSON

Promptfoo’s `reason` is the harness error, not a prose critique of the model.

| `reason` | Meaning |
|---|---|
| `slugify: all unit tests passed` | Function ran; examples matched. |
| `classic: expected true, got false` | Function ran; that named example failed. |
| `Unexpected token ';'` / `Invalid or unexpected token` | The **extracted** JavaScript did not parse. Tests never ran. |

Thinking models (including Grok 4.6) sometimes open a fence in the thinking dump, cut off mid-line (`for (const part of qs.`), then emit a **finished** function in a second fence. The first fence never closes, so a naive “grab until the next triple-backtick” extractor compiles the truncated draft.

That is why the 2026-08-13 maintainer JSON records **fail** on `parseQuery`, `deepGet`, and `titleCase` with syntax errors — the finished second function looks correct; Score never got to run it.

Current `extractCode` prefers the last **syntactically valid** named function, so a later run on the same kind of reply can pass those three. We do **not** rewrite the committed promptfoo JSON; `results/latest.md` explains the recorded 9/12.

## Cursor Grok 4.6

A Score row for `x-ai/grok-4.6` is a Score row for Cursor Grok 4.6 (same weights, OpenRouter). It does **not** say:

- that Fun or Dev were re-run on 4.6 (those maintainer files may still be Grok 4.5)
- that the model “failed three coding interviews”
- that Cursor’s agent/tooling loop was tested (Score is a single completion: write a function, no tools)
