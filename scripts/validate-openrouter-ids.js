#!/usr/bin/env node
/**
 * Soft-check model IDs from MODELS= (or argv) against the active provider's catalog.
 *
 *   MODELS=id1,id2 npm run validate:models
 *   PROVIDER=hetzner MODELS=Kimi-K2.7-Code npm run validate:models
 *
 * Default PROVIDER=openrouter (public list, no key required).
 * PROVIDER=hetzner requires HETZNER_INFERENCE_API_KEY (BYOK).
 */
const {
  HETZNER_API_BASE,
  HETZNER_KEY_ENV,
  HETZNER_MODELS,
} = require('./hetzner-models');

function loadDotEnv() {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
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

async function validateOpenRouter(ids) {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { 'User-Agent': 'vcl-vibebench/1.0' },
  });
  if (!res.ok) throw new Error(`OpenRouter models HTTP ${res.status}`);
  const body = await res.json();
  const known = new Set((body.data || []).map((m) => m.id));
  let failed = 0;
  for (const id of ids) {
    if (!known.has(id)) {
      console.error(`✗ Not on OpenRouter: ${id}`);
      failed += 1;
    } else {
      console.log(`✓ ${id}`);
    }
  }
  if (failed) process.exit(1);
  console.log('All listed IDs exist on OpenRouter.');
}

async function validateHetzner(ids) {
  const key = process.env[HETZNER_KEY_ENV];
  if (!key || !String(key).trim()) {
    console.error(
      `Missing ${HETZNER_KEY_ENV}. Create a BYOK token at https://experiments.hetzner.com (Apps → Inference).`
    );
    process.exit(1);
  }

  const allow = new Set(HETZNER_MODELS);
  for (const id of ids) {
    if (!allow.has(id)) {
      console.error(
        `✗ Not in VibeBench Hetzner allowlist: ${id}\n  Allowed:\n  ${HETZNER_MODELS.join('\n  ')}`
      );
      process.exit(1);
    }
  }

  const res = await fetch(`${HETZNER_API_BASE}/models`, {
    headers: {
      Authorization: `Bearer ${key}`,
      'User-Agent': 'vcl-vibebench/1.0',
    },
  });
  if (!res.ok) {
    throw new Error(`Hetzner models HTTP ${res.status}`);
  }
  const body = await res.json();
  const list = body.data || body.models || [];
  const known = new Set(
    list.map((m) => (typeof m === 'string' ? m : m.id)).filter(Boolean)
  );

  let failed = 0;
  for (const id of ids) {
    if (known.size && !known.has(id)) {
      console.error(`✗ Not returned by Hetzner /v1/models: ${id}`);
      failed += 1;
    } else {
      console.log(`✓ ${id}`);
    }
  }
  if (failed) process.exit(1);
  if (!known.size) {
    console.log(
      'Warning: /v1/models returned no ids; allowlist check only. All requested IDs are on the VibeBench allowlist.'
    );
  } else {
    console.log('All listed IDs exist on Hetzner Experiments Inference.');
  }
}

async function main() {
  const providerRaw = (process.env.PROVIDER || 'openrouter').trim().toLowerCase();
  const provider = providerRaw === 'hetzner' ? 'hetzner' : 'openrouter';

  const fromEnv = (process.env.MODELS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const fromArgv = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  let ids = fromEnv.length ? fromEnv : fromArgv;

  if (!ids.length && provider === 'hetzner') {
    ids = HETZNER_MODELS.slice();
  }
  if (!ids.length) {
    console.error('Set MODELS=id1,id2 or pass IDs as argv.');
    process.exit(1);
  }

  if (provider === 'hetzner') {
    await validateHetzner(ids);
  } else {
    await validateOpenRouter(ids);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
