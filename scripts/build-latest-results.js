#!/usr/bin/env node
/**
 * Build results/latest.md from the newest result JSON + matching .meta.json pairs.
 */
const fs = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, '..', 'results');
const outPath = path.join(resultsDir, 'latest.md');

function listPairs() {
  if (!fs.existsSync(resultsDir)) return [];
  return fs
    .readdirSync(resultsDir)
    .filter((f) => f.endsWith('.json') && !f.endsWith('.meta.json'))
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

function summarize(jsonPath, metaPath) {
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const results = raw.results || raw;
  const lines = [];
  lines.push(`### ${meta.suite || 'suite'} — ${meta.date || 'unknown date'}`);
  lines.push('');
  lines.push(`- VibeBench: ${meta.vibebench_version || '?'}`);
  lines.push(`- promptfoo: ${meta.promptfoo_version || '?'}`);
  lines.push(`- Runner: ${meta.runner || '?'}`);
  lines.push(`- Label: ${meta.label || 'maintainer'}`);
  if (meta.models) lines.push(`- Models: ${meta.models.join(', ')}`);
  lines.push('');

  // Best-effort scored pass summary if promptfoo shape has success flags
  if (Array.isArray(results)) {
    const byProvider = {};
    for (const row of results) {
      const provider = row.provider?.label || row.provider?.id || row.provider || 'unknown';
      if (!byProvider[provider]) byProvider[provider] = { pass: 0, fail: 0, total: 0 };
      const ok = row.success === true || row.score === 1 || row.gradingResult?.pass === true;
      byProvider[provider].total += 1;
      if (ok) byProvider[provider].pass += 1;
      else if (row.success === false || row.gradingResult?.pass === false) byProvider[provider].fail += 1;
    }
    lines.push('| Model | Assert passes | Total graded rows |');
    lines.push('|---|---:|---:|');
    for (const [name, s] of Object.entries(byProvider)) {
      lines.push(`| ${name} | ${s.pass} | ${s.total} |`);
    }
    lines.push('');
    lines.push('_Exploratory prompts are not included in a blended “best model” score. See methodology._');
  } else {
    lines.push('_Open the JSON in `promptfoo view` for the full matrix._');
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
      '_No result+meta pairs yet. Run `npm run eval:fun` / `eval:dev`, write a `.meta.json`, then re-run `npm run results:latest`._',
      '',
    ].join('\n');
    fs.writeFileSync(outPath, stub);
    console.log('Wrote placeholder', outPath);
    return;
  }

  const latestBySuite = {};
  for (const p of pairs) {
    const suite = p.base.split('-')[0];
    latestBySuite[suite] = p;
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
