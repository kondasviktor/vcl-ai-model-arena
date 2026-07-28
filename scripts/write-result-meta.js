#!/usr/bin/env node
/** Write results/<suite>-<date>.meta.json next to a promptfoo JSON output. */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const [suite, dateArg, label = 'maintainer'] = process.argv.slice(2);
if (!suite) {
  console.error('Usage: node scripts/write-result-meta.js <suite> [YYYY-MM-DD] [label]');
  process.exit(1);
}
const date = dateArg || new Date().toISOString().slice(0, 10);
const root = path.join(__dirname, '..');
const resultsDir = path.join(root, 'results');
const jsonPath = path.join(resultsDir, `${suite}-${date}.json`);
if (!fs.existsSync(jsonPath)) {
  console.error('Missing result JSON:', jsonPath);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
let gitSha = 'unknown';
try {
  gitSha = execSync('git rev-parse HEAD', { cwd: root }).toString().trim();
} catch {}

const result = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const models = [];
const seen = new Set();
const rows =
  (result.results && Array.isArray(result.results.results) && result.results.results) ||
  (Array.isArray(result.results) ? result.results : []);
for (const row of rows) {
  const id =
    row.provider?.id ||
    row.provider ||
    row.metadata?.providerId ||
    null;
  const cleaned = String(id || '')
    .replace(/^openrouter:/, '')
    .trim();
  if (cleaned && !seen.has(cleaned)) {
    seen.add(cleaned);
    models.push(cleaned);
  }
}
if (!models.length && process.env.MODELS) {
  for (const id of process.env.MODELS.split(',').map((s) => s.trim()).filter(Boolean)) {
    models.push(id);
  }
}

const meta = {
  vibebench_version: version,
  promptfoo_version: pkg.devDependencies.promptfoo,
  suite,
  date,
  label,
  runner: process.env.GITHUB_ACTIONS ? 'ci' : 'local',
  git_sha: gitSha,
  models,
  created_at: new Date().toISOString(),
};

const metaPath = path.join(resultsDir, `${suite}-${date}.meta.json`);
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
console.log('Wrote', metaPath);
