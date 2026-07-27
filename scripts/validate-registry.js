#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = path.join(__dirname, '..');
const registry = yaml.load(fs.readFileSync(path.join(root, 'models/registry.yaml'), 'utf8'));
const active = (registry.models || []).filter((m) => m.status === 'active');
const suites = ['fun', 'dev'];
let failed = 0;

for (const suite of suites) {
  const cfgPath = path.join(root, 'tests', suite, 'promptfooconfig.yaml');
  const cfg = yaml.load(fs.readFileSync(cfgPath, 'utf8'));
  const providerIds = (cfg.providers || []).map((p) => String(p.id || p).replace(/^openrouter:/, ''));
  for (const m of active) {
    if (!providerIds.includes(m.id)) {
      console.error(`✗ ${suite}: missing registry model ${m.id}`);
      failed += 1;
    }
  }
  for (const id of providerIds) {
    if (!active.find((m) => m.id === id)) {
      console.error(`✗ ${suite}: provider ${id} not active in registry`);
      failed += 1;
    }
  }
  console.log(`✓ ${suite}: ${providerIds.length} providers align with registry`);
}

if (failed) process.exit(1);
console.log('Registry validation passed.');
