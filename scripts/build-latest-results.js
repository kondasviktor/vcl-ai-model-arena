#!/usr/bin/env node
/**
 * Build results/latest.md from the newest result JSON + matching .meta.json pairs.
 * Reads Promptfoo v3 nested results.results; scored vs exploratory are reported separately.
 */
const fs = require('fs');
const path = require('path');
const { TASKS } = require('../tests/score/harness');

const resultsDir = path.join(__dirname, '..', 'results');
const outPath = path.join(resultsDir, 'latest.md');

function listPairs() {
  if (!fs.existsSync(resultsDir)) return [];
  return fs
    .readdirSync(resultsDir)
    .filter((f) => f.endsWith('.json') && !f.endsWith('.meta.json') && !f.startsWith('.'))
    .filter((f) => !f.includes('-smoke-'))
    .map((f) => {
      const base = f.replace(/\.json$/, '');
      return {
        json: path.join(resultsDir, f),
        meta: path.join(resultsDir, `${base}.meta.json`),
        base,
        mtime: fs.statSync(path.join(resultsDir, f)).mtimeMs,
      };
    })
    .filter((p) => fs.existsSync(p.meta))
    .sort((a, b) => a.mtime - b.mtime);
}

function extractResultRows(raw) {
  if (raw?.results?.results && Array.isArray(raw.results.results)) {
    return raw.results.results;
  }
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw)) return raw;
  return null;
}

function isScoredRow(row) {
  const scoring = row.testCase?.metadata?.scoring;
  if (scoring === 'exploratory') return false;
  if (scoring === 'scored') return true;
  return Boolean(row.testCase?.assert?.length);
}

function providerLabel(row) {
  return row.provider?.label || row.provider?.id || String(row.provider || 'unknown');
}

function rowPassed(row) {
  return row.success === true || row.score === 1 || row.gradingResult?.pass === true;
}

function rowFailed(row) {
  return row.success === false || row.gradingResult?.pass === false;
}

function rowReason(row) {
  return (
    row.gradingResult?.reason ||
    row.gradingResult?.componentResults?.[0]?.reason ||
    ''
  );
}

function scoreTaskName(row) {
  return row.testCase?.metadata?.task || row.testCase?.description || 'unknown';
}

function looksLikeSyntaxFail(reason) {
  return /unexpected token|invalid or unexpected token|missing \) after argument list|unexpected end of input/i.test(
    String(reason || '')
  );
}

function looksLikeLeakedThinkingFence(output) {
  const text = String(output || '');
  const fenceOpens = (text.match(/```(?:javascript|js)?/gi) || []).length;
  return fenceOpens >= 2 && /thinking\s*:/i.test(text);
}

function scoreDetail(row) {
  const reason = rowReason(row);
  if (rowPassed(row)) return reason || 'all unit tests passed';
  const output = row.response?.output || '';
  if (looksLikeSyntaxFail(reason) && looksLikeLeakedThinkingFence(output)) {
    return (
      `Could not compile the **extracted** snippet (\`${reason}\`). ` +
      `The reply opened a code fence in thinking, cut off mid-line, then wrote a finished function in a second fence. ` +
      `This recorded run compiled the truncated draft — not proof the finished function is wrong.`
    );
  }
  if (looksLikeSyntaxFail(reason)) {
    return `Could not compile extracted code (\`${reason}\`). The function never ran, so unit tests did not execute.`;
  }
  if (reason) return `Unit test failed: ${reason}`;
  return 'Failed (see JSON)';
}

function scoreHowToRead() {
  return [
    '#### How to read Score',
    '',
    'Score is **not** “how smart is this model” and **9/12 is not 75% intelligence.**',
    '',
    'Each of the 12 rows is a small original JavaScript helper (slugify, parse a query string, Fibonacci, …). The model must return **one named function** in a markdown fence. There is **no LLM judge**. A sandbox extracts the code and runs a handful of **hidden unit tests**.',
    '',
    '- **Pass** — the function compiled and every hidden example matched.',
    '- **Fail** — we could not extract/compile a function, *or* a unit test mismatched (wrong return value).',
    '- Syntax errors like `Unexpected token` mean the tests **never ran**. That is often a truncated thinking dump, not “Grok cannot title-case a string.”',
    '- OpenRouter `x-ai/grok-4.6` is the same weights as **Cursor Grok 4.6**. Fun/Dev tables on this page are still the 2026-07-28 Grok **4.5** matrix.',
    '',
    'See [methodology](../docs/methodology.md#score-12) and [tests/score/README.md](../tests/score/README.md).',
    '',
  ].join('\n');
}

function summarize(jsonPath, metaPath) {
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const rows = extractResultRows(raw);
  const lines = [];
  lines.push(`### ${meta.suite || 'suite'} — ${meta.date || 'unknown date'}`);
  lines.push('');
  lines.push(`- VCL VibeBench: ${meta.vibebench_version || '?'}`);
  lines.push(`- promptfoo: ${meta.promptfoo_version || '?'}`);
  lines.push(`- Runner: ${meta.runner || '?'}`);
  lines.push(`- Label: ${meta.label || 'maintainer'}`);
  if (meta.models) lines.push(`- Models: ${meta.models.join(', ')}`);
  if (meta.notes) lines.push(`- Notes: ${meta.notes}`);
  lines.push('');

  if (!Array.isArray(rows) || !rows.length) {
    lines.push('_Open the JSON in `promptfoo view` for the full matrix._');
    lines.push('');
    lines.push(`Files: \`${path.basename(jsonPath)}\` + \`${path.basename(metaPath)}\``);
    lines.push('');
    return lines.join('\n');
  }

  const scoredByProvider = {};
  const exploratoryByProvider = {};

  for (const row of rows) {
    const name = providerLabel(row);
    if (isScoredRow(row)) {
      if (!scoredByProvider[name]) scoredByProvider[name] = { pass: 0, fail: 0, total: 0 };
      scoredByProvider[name].total += 1;
      if (rowPassed(row)) scoredByProvider[name].pass += 1;
      else if (rowFailed(row)) scoredByProvider[name].fail += 1;
    } else {
      if (!exploratoryByProvider[name]) exploratoryByProvider[name] = { total: 0 };
      exploratoryByProvider[name].total += 1;
    }
  }

  lines.push('#### Scored prompts (deterministic asserts)');
  lines.push('');
  lines.push('| Model | Pass | Fail | Scored total |');
  lines.push('|---|---:|---:|---:|');
  for (const [name, s] of Object.entries(scoredByProvider).sort()) {
    lines.push(`| ${name} | ${s.pass} | ${s.fail} | ${s.total} |`);
  }
  lines.push('');
  if (Object.keys(exploratoryByProvider).length) {
    lines.push('#### Exploratory prompts (qualitative — not scored)');
    lines.push('');
    lines.push('| Model | Exploratory prompts |');
    lines.push('|---|---:|');
    for (const [name, s] of Object.entries(exploratoryByProvider).sort()) {
      lines.push(`| ${name} | ${s.total} |`);
    }
    lines.push('');
    lines.push('_No blended “best model” score. Exploratory rows are for side-by-side judgment only. See [methodology](../docs/methodology.md)._');
  } else {
    lines.push('_All tasks in this suite are scored (unit-test pass/fail). No blended “best model” across Fun/Dev/Score. See [methodology](../docs/methodology.md)._');
  }
  lines.push('');

  if ((meta.suite || '') === 'score') {
    lines.push(scoreHowToRead());
    const byProvider = {};
    for (const row of rows) {
      const name = providerLabel(row);
      if (!byProvider[name]) byProvider[name] = [];
      byProvider[name].push(row);
    }
    for (const [name, taskRows] of Object.entries(byProvider).sort()) {
      lines.push(`#### Per task — ${name}`);
      lines.push('');
      lines.push('| Task | What it checks | Result | Detail |');
      lines.push('|---|---|---|---|');
      for (const row of taskRows) {
        const task = scoreTaskName(row);
        const checks = TASKS[task]?.checks || 'JavaScript helper; hidden unit tests';
        const result = rowPassed(row) ? 'pass' : 'fail';
        const detail = scoreDetail(row).replace(/\|/g, '\\|');
        lines.push(`| \`${task}\` | ${checks} | **${result}** | ${detail} |`);
      }
      lines.push('');
      const leaked = taskRows.filter(
        (row) => !rowPassed(row) && looksLikeSyntaxFail(rowReason(row)) && looksLikeLeakedThinkingFence(row.response?.output || '')
      );
      if (leaked.length) {
        lines.push(
          `_Those ${leaked.length} syntax fails are from this recorded promptfoo run. Re-grading the same replies with the current extractor (last valid function) passes them — the finished second fence is fine. We do not rewrite the JSON._`
        );
        lines.push('');
      }
    }
  }

  lines.push(`Files: \`${path.basename(jsonPath)}\` + \`${path.basename(metaPath)}\``);
  lines.push('');
  return lines.join('\n');
}

function aggregateProviders(rows) {
  const scored = {};
  const exploratory = {};
  for (const row of rows) {
    const name = providerLabel(row);
    if (isScoredRow(row)) {
      if (!scored[name]) scored[name] = { pass: 0, fail: 0, total: 0 };
      scored[name].total += 1;
      if (rowPassed(row)) scored[name].pass += 1;
      else if (rowFailed(row)) scored[name].fail += 1;
    } else {
      if (!exploratory[name]) exploratory[name] = { total: 0 };
      exploratory[name].total += 1;
    }
  }
  return { scored, exploratory };
}

function suitePayload(jsonPath, metaPath) {
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const rows = extractResultRows(raw) || [];
  const { scored, exploratory } = aggregateProviders(rows);
  const payload = {
    suite: meta.suite || path.basename(jsonPath).split('-')[0],
    date: meta.date || null,
    vibebench_version: meta.vibebench_version || null,
    promptfoo_version: meta.promptfoo_version || null,
    runner: meta.runner || null,
    label: meta.label || 'maintainer',
    models: meta.models || [],
    git_sha: meta.git_sha || null,
    notes: meta.notes || '',
    files: {
      json: path.basename(jsonPath),
      meta: path.basename(metaPath),
    },
    scored: Object.entries(scored)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([model, s]) => ({ model, pass: s.pass, fail: s.fail, scored_total: s.total })),
    exploratory: Object.entries(exploratory)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([model, s]) => ({ model, exploratory_total: s.total })),
  };
  if ((meta.suite || '') === 'score') {
    payload.tasks = rows.map((row) => ({
      model: providerLabel(row),
      task: scoreTaskName(row),
      result: rowPassed(row) ? 'pass' : 'fail',
      detail: scoreDetail(row),
    }));
  }
  return payload;
}

function latestBySuite(pairs) {
  const map = {};
  for (const p of pairs) {
    const suite = p.base.split('-')[0];
    const existing = map[suite];
    if (!existing || p.base.localeCompare(existing.base) > 0) {
      map[suite] = p;
    }
  }
  return map;
}

function writeLatestJson(map, generated) {
  const jsonOut = path.join(resultsDir, 'latest.json');
  const payload = { generated, suites: {} };
  for (const suite of Object.keys(map).sort()) {
    payload.suites[suite] = suitePayload(map[suite].json, map[suite].meta);
  }
  fs.writeFileSync(jsonOut, `${JSON.stringify(payload, null, 2)}\n`);
  console.log('Updated', jsonOut);

  const spaceData = path.join(__dirname, '..', 'hf-space', 'data');
  if (fs.existsSync(path.dirname(spaceData))) {
    fs.mkdirSync(spaceData, { recursive: true });
    fs.writeFileSync(path.join(spaceData, 'latest.json'), `${JSON.stringify(payload, null, 2)}\n`);
  }
}

function main() {
  const pairs = listPairs();
  if (!pairs.length) {
    const stub = [
      '# Latest VCL VibeBench results',
      '',
      '_No result+meta pairs yet. Run `npm run eval:fun` / `eval:dev` / `eval:score`, write a `.meta.json`, then re-run `npm run results:latest`._',
      '',
    ].join('\n');
    fs.writeFileSync(outPath, stub);
    console.log('Wrote placeholder', outPath);
    return;
  }

  const map = latestBySuite(pairs);
  const generated = new Date().toISOString().slice(0, 10);

  const parts = [
    '# Latest VCL VibeBench results',
    '',
    `_Generated ${generated}_`,
    '',
  ];
  for (const suite of Object.keys(map).sort()) {
    parts.push(summarize(map[suite].json, map[suite].meta));
  }
  fs.writeFileSync(outPath, parts.join('\n'));
  console.log('Updated', outPath);
  writeLatestJson(map, generated);
}

module.exports = {
  listPairs,
  extractResultRows,
  isScoredRow,
  providerLabel,
  rowPassed,
  rowFailed,
  aggregateProviders,
  suitePayload,
  latestBySuite,
};

if (require.main === module) {
  main();
}
