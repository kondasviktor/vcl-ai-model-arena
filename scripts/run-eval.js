#!/usr/bin/env node
/**
 * VCL VibeBench eval runner (BYOK).
 *
 * Default provider: OpenRouter (OPENROUTER_API_KEY + MODELS=).
 * Optional: PROVIDER=hetzner + HETZNER_INFERENCE_API_KEY (Experiments Inference, BYOK).
 *
 * Usage:
 *   MODELS=id1,id2 node scripts/run-eval.js <fun|dev|vision> [-- -o out.json ...]
 *   node scripts/run-eval.js fun --smoke
 *   PROVIDER=hetzner MODELS=Qwen/Qwen3.6-35B-A3B-FP8 npm run eval:fun
 *
 * Env:
 *   PROVIDER=openrouter|hetzner  — default openrouter
 *   MODELS=id1,id2               — provider-specific IDs (OpenRouter any; Hetzner allowlist)
 *   SMOKE=1                      — cheap fixed OpenRouter pair (ignored for Hetzner defaults)
 *   OUT=path                     — passed to promptfoo as -o if set
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');
const {
  HETZNER_API_BASE,
  HETZNER_KEY_ENV,
  HETZNER_MODELS,
  HETZNER_SMOKE_MODEL,
} = require('./hetzner-models');

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

const OPENROUTER_SMOKE_MODELS = ['google/gemini-3.6-flash', 'moonshotai/kimi-k3'];
const HETZNER_ALLOW = new Set(HETZNER_MODELS);

const argv = process.argv.slice(2);
const dashDash = argv.indexOf('--');
const mainArgs = dashDash >= 0 ? argv.slice(0, dashDash) : argv;
const extraArgs = dashDash >= 0 ? argv.slice(dashDash + 1) : [];

const suite = mainArgs.find((a) => a === 'fun' || a === 'dev' || a === 'vision');
if (!suite) {
  console.error(
    'Usage: MODELS=id1,id2 node scripts/run-eval.js <fun|dev|vision> [--smoke] [-- promptfoo-args...]'
  );
  console.error('Optional: PROVIDER=hetzner HETZNER_INFERENCE_API_KEY=… (BYOK Experiments Inference)');
  process.exit(1);
}

const smoke =
  mainArgs.includes('--smoke') ||
  process.env.SMOKE === '1' ||
  process.env.SMOKE === 'true';

const providerRaw = (process.env.PROVIDER || 'openrouter').trim().toLowerCase();
const provider = providerRaw === 'hetzner' ? 'hetzner' : 'openrouter';

function parseModelsEnv() {
  if (!process.env.MODELS || !process.env.MODELS.trim()) return [];
  return process.env.MODELS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function resolveModelsOpenRouter() {
  const fromEnv = parseModelsEnv();
  if (fromEnv.length) return fromEnv;
  if (smoke) return OPENROUTER_SMOKE_MODELS.slice();
  console.error(`Set MODELS to one or more OpenRouter IDs, e.g.:
  MODELS=anthropic/claude-opus-5,openai/gpt-5.6-sol,google/gemini-3.6-flash npm run eval:${suite}

Browse IDs: https://openrouter.ai/models
Or run a cheap check: npm run eval:smoke`);
  process.exit(1);
}

function resolveModelsHetzner() {
  const fromEnv = parseModelsEnv();
  let models;
  if (fromEnv.length) {
    models = fromEnv;
  } else if (smoke) {
    models = [HETZNER_SMOKE_MODEL];
  } else {
    models = HETZNER_MODELS.slice();
  }
  const bad = models.filter((id) => !HETZNER_ALLOW.has(id));
  if (bad.length) {
    console.error(
      `Unknown Hetzner model ID(s): ${bad.join(', ')}\n` +
        `Allowed (from Hetzner Experiments docs):\n  ${HETZNER_MODELS.join('\n  ')}\n` +
        `See https://experiments.hetzner.com/docs/inference`
    );
    process.exit(1);
  }
  return models;
}

function requireKey(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    console.error(
      `Missing ${name}. BYOK only — put your own key in .env (never commit it).\n` +
        (name === HETZNER_KEY_ENV
          ? 'Create a token: https://experiments.hetzner.com → Apps → Inference → Create API Token'
          : 'Get a key: https://openrouter.ai/keys')
    );
    process.exit(1);
  }
}

if (provider === 'hetzner') {
  requireKey(HETZNER_KEY_ENV);
} else {
  requireKey('OPENROUTER_API_KEY');
}

const models =
  provider === 'hetzner' ? resolveModelsHetzner() : resolveModelsOpenRouter();

if (!models.length) {
  console.error('No models resolved (MODELS empty).');
  process.exit(1);
}

const configPath = path.join(root, 'tests', suite, 'promptfooconfig.yaml');
const generatedPath = path.join(root, 'tests', suite, 'promptfooconfig.generated.yaml');
if (!fs.existsSync(configPath)) {
  console.error('Missing config:', configPath);
  process.exit(1);
}

const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

if (provider === 'hetzner') {
  console.error(
    'run-eval: PROVIDER=hetzner — experimental Hetzner Inference (BYOK, free while experimental, ~10 req/min). No SLA.'
  );
  config.providers = models.map((id) => ({
    id: 'openai:chat:' + id,
    label: 'hetzner:' + id,
    config: {
      apiBaseUrl: HETZNER_API_BASE,
      apiKeyEnvar: HETZNER_KEY_ENV,
      temperature: 0,
    },
  }));
  // Avoid 429 under Hetzner request-rate limits (10/min).
  config.evaluateOptions = Object.assign({}, config.evaluateOptions || {}, {
    maxConcurrency: 1,
  });
} else {
  config.providers = models.map((id) => ({
    id: 'openrouter:' + id,
    label: id,
  }));
}

fs.writeFileSync(generatedPath, yaml.dump(config, { lineWidth: 120 }) + '\n');
console.error(
  `run-eval: provider=${provider} suite=${suite} models=${models.length}` +
    `${smoke && !parseModelsEnv().length ? ' (smoke)' : ''} → ${path.relative(root, generatedPath)}`
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
