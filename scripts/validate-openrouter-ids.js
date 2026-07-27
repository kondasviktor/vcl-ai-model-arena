#!/usr/bin/env node
/**
 * Soft-check OpenRouter IDs from MODELS= (or argv) against the public model list.
 * Usage: MODELS=id1,id2 npm run validate:models
 */
async function main() {
  const fromEnv = (process.env.MODELS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const fromArgv = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const ids = fromEnv.length ? fromEnv : fromArgv;
  if (!ids.length) {
    console.error('Set MODELS=id1,id2 or pass IDs as argv.');
    process.exit(1);
  }

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

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
