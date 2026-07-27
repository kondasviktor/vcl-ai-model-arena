#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function main() {
  const root = path.join(__dirname, '..');
  const registry = yaml.load(fs.readFileSync(path.join(root, 'models/registry.yaml'), 'utf8'));
  const active = (registry.models || []).filter((m) => m.status === 'active');
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { 'User-Agent': 'vcl-vibebench/1.0' },
  });
  if (!res.ok) throw new Error(`OpenRouter models HTTP ${res.status}`);
  const body = await res.json();
  const ids = new Set((body.data || []).map((m) => m.id));
  let failed = 0;
  for (const m of active) {
    if (!ids.has(m.id)) {
      console.error(`✗ Not on OpenRouter: ${m.id}`);
      failed += 1;
    } else {
      console.log(`✓ ${m.id}`);
    }
  }
  if (failed) process.exit(1);
  console.log('All active registry IDs exist on OpenRouter.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
