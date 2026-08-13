#!/usr/bin/env node
/**
 * Build results/latest.md from the newest result JSON + matching .meta.json pairs.
 * Reads Promptfoo v3 nested results.results; scored vs exploratory are reported separately.
 */
const fs = require('fs');
const path = require('path');

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
  lines.push(`Files: \`${path.basename(jsonPath)}\` + \`${path.basename(metaPath)}\``);
  lines.push('');
  return lines.join('\n');
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

  const latestBySuite = {};
  for (const p of pairs) {
    const suite = p.base.split('-')[0];
    const existing = latestBySuite[suite];
    if (!existing || p.base.localeCompare(existing.base) > 0) {
      latestBySuite[suite] = p;
    }
  }

  const parts = [
    '# Latest VCL VibeBench results',
    '',
    `_Generated ${new Date().toISOString().slice(0, 10)}_`,
    '',
  ];
  for (const suite of Object.keys(latestBySuite).sort()) {
    parts.push(summarize(latestBySuite[suite].json, latestBySuite[suite].meta));
  }
  fs.writeFileSync(outPath, parts.join('\n'));
  console.log('Updated', outPath);
}

main();
