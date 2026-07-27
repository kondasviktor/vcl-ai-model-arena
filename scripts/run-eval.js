#!/usr/bin/env node
/**
 * BYO OpenRouter eval runner.
 * Usage:
 *   node scripts/run-eval.js <fun|dev> [--smoke] [-- -o out.json ...]
 * Env:
 *   MODELS=id1,id2   — comma-separated OpenRouter IDs (overrides registry / smoke)
 *   SMOKE=1          — same as --smoke
 *   OUT=path         — passed to promptfoo as -o if set
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');

const root = path.join(__dirname, '..');

function loadDotEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv();

const SMOKE_MODELS = ['google/gemini-3.6-flash', 'moonshotai/kimi-k3'];

const argv = process.argv.slice(2);
const dashDash = argv.indexOf('--');
const mainArgs = dashDash >= 0 ? argv.slice(0, dashDash) : argv;
const extraArgs = dashDash >= 0 ? argv.slice(dashDash + 1) : [];

const suite = mainArgs.find((a) => a === 'fun' || a === 'dev');
if (!suite) {
  console.error('Usage: node scripts/run-eval.js <fun|dev> [--smoke] [-- promptfoo-args...]');
  process.exit(1);
}

const smoke =
  mainArgs.includes('--smoke') ||
  process.env.SMOKE === '1' ||
  process.env.SMOKE === 'true';

function resolveModels() {
  if (process.env.MODELS && process.env.MODELS.trim()) {
    return process.env.MODELS.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (smoke) return SMOKE_MODELS.slice();
  const registry = yaml.load(
    fs.readFileSync(path.join(root, 'models/registry.yaml'), 'utf8')
  );
  return (registry.models || [])
    .filter((m) => m.status === 'active')
    .map((m) => m.id);
}

const models = resolveModels();
if (!models.length) {
  console.error('No models resolved (MODELS empty and no active registry models).');
  process.exit(1);
}

const configPath = path.join(root, 'tests', suite, 'promptfooconfig.yaml');
const generatedPath = path.join(root, 'tests', suite, 'promptfooconfig.generated.yaml');
if (!fs.existsSync(configPath)) {
  console.error('Missing config:', configPath);
  process.exit(1);
}

const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
config.providers = models.map((id) => ({
  id: 'openrouter:' + id,
  label: id,
}));
fs.writeFileSync(generatedPath, yaml.dump(config, { lineWidth: 120 }) + '\n');
console.error(
  `run-eval: suite=${suite} models=${models.length}${smoke && !process.env.MODELS ? ' (smoke)' : ''} → ${path.relative(root, generatedPath)}`
);

const promptfooArgs = ['promptfoo', 'eval', '-c', generatedPath];
if (process.env.OUT && process.env.OUT.trim()) {
  promptfooArgs.push('-o', process.env.OUT.trim());
}
promptfooArgs.push(...extraArgs);

const result = spawnSync('npx', promptfooArgs, {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
  shell: false,
});

process.exit(result.status == null ? 1 : result.status);
