#!/usr/bin/env node
/**
 * Export Fun/Dev/Score prompts + slim maintainer results as Hugging Face JSONL.
 * Source of truth: tests suite promptfooconfig.yaml files and results meta pairs.
 * Does not copy Score hidden unit tests or raw Promptfoo completions.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { listPairs, suitePayload } = require('./build-latest-results');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'hf-dataset');
const SPACE_DATA = path.join(ROOT, 'hf-space', 'data');

const SUITE_META = {
  fun: { suite_version: '1.0', yaml: 'tests/fun/promptfooconfig.yaml' },
  dev: { suite_version: '1.1', yaml: 'tests/dev/promptfooconfig.yaml' },
  score: { suite_version: '1.2', yaml: 'tests/score/promptfooconfig.yaml' },
};

function slugId(prefix, index, title) {
  const slug = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${prefix}-${String(index + 1).padStart(3, '0')}${slug ? `-${slug}` : ''}`;
}

function expectedHint(asserts) {
  if (!Array.isArray(asserts) || !asserts.length) return undefined;
  const first = asserts.find(
    (a) => a && (a.type === 'contains' || a.type === 'icontains' || a.type === 'regex') && a.value != null
  );
  if (!first) return undefined;
  if (first.type === 'regex') {
    return String(first.value)
      .replace(/^\^\\s\*/, '')
      .replace(/\\s\*\$/, '')
      .replace(/\\s\*/g, '')
      .replace(/^\^/, '')
      .replace(/\$$/, '')
      .replace(/\\([.])/g, '$1')
      .replace(/\\/g, '');
  }
  return String(first.value);
}

function unquote(value) {
  const v = String(value || '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parsePromptfooTests(yamlText) {
  const tests = [];
  const parts = yamlText.split(/\n  - description:/);
  parts.shift();
  for (const part of parts) {
    const block = `  - description:${part}`;
    const titleMatch = block.match(/description:\s*(.+)/);
    const scoringMatch = block.match(/scoring:\s*(\S+)/);
    const taskMatch = block.match(/\n\s+task:\s*(\S+)/);
    const title = unquote(titleMatch ? titleMatch[1] : '');
    let prompt = '';
    const blockPrompt = block.match(/\n\s+prompt:\s*\|\s*\n([\s\S]*?)(?=\n    assert:|\n    metadata:|\n  - description:|$)/);
    const inlinePrompt = block.match(/\n\s+prompt:\s*(.+)/);
    if (block.includes('prompt: |') && blockPrompt) {
      const body = blockPrompt[1]
        .split('\n')
        .map((line) => line.replace(/^        /, '').replace(/^      /, ''))
        .join('\n')
        .replace(/\n    assert:[\s\S]*$/, '')
        .trim();
      prompt = body;
    } else if (inlinePrompt && !inlinePrompt[1].trim().startsWith('|')) {
      prompt = unquote(inlinePrompt[1]);
    }
    const asserts = [];
    const assertBlock = block.split(/\n    assert:\s*\n/)[1] || '';
    const typeVals = [...assertBlock.matchAll(/type:\s*(\S+)\n\s+value:\s*(.+)/g)];
    for (const m of typeVals) {
      asserts.push({ type: m[1], value: unquote(m[2]) });
    }
    tests.push({
      description: title,
      metadata: {
        scoring: scoringMatch ? scoringMatch[1] : undefined,
        task: taskMatch ? taskMatch[1] : undefined,
      },
      vars: { prompt },
      assert: asserts,
    });
  }
  return tests;
}

function promptRows(suite) {
  const info = SUITE_META[suite];
  const yamlText = fs.readFileSync(path.join(ROOT, info.yaml), 'utf8');
  const tests = parsePromptfooTests(yamlText);
  return tests.map((test, i) => {
    const title = test.description || `item-${i + 1}`;
    const scoring = test.metadata?.scoring || (test.assert?.length ? 'scored' : 'exploratory');
    const row = {
      id: suite === 'score' ? `score-${test.metadata?.task || title}` : slugId(suite, i, title),
      suite,
      suite_version: info.suite_version,
      title,
      prompt: String(test.vars?.prompt || '').trim(),
      scoring,
    };
    if (suite === 'score') {
      row.function_name = test.metadata?.task || title;
      row.language = 'javascript';
    } else if (scoring === 'scored') {
      const hint = expectedHint(test.assert);
      if (hint) row.expected_hint = hint;
    }
    return row;
  });
}

function writeJsonl(name, rows) {
  const body = rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '');
  fs.writeFileSync(path.join(OUT, name), body);
  console.log(`Wrote ${path.join(OUT, name)} (${rows.length} rows)`);
}

function slimResults() {
  const rows = [];
  for (const pair of listPairs()) {
    const payload = suitePayload(pair.json, pair.meta);
    const models = new Set([
      ...payload.scored.map((s) => s.model),
      ...payload.exploratory.map((s) => s.model),
    ]);
    for (const model of models) {
      const scored = payload.scored.find((s) => s.model === model);
      const expl = payload.exploratory.find((s) => s.model === model);
      rows.push({
        id: `${payload.suite}-${payload.date}-${model}`.replace(/[^a-zA-Z0-9._-]+/g, '-'),
        date: payload.date,
        suite: payload.suite,
        model,
        pass: scored ? scored.pass : 0,
        fail: scored ? scored.fail : 0,
        scored_total: scored ? scored.scored_total : 0,
        exploratory_total: expl ? expl.exploratory_total : 0,
        label: payload.label,
        git_sha: payload.git_sha,
        notes: payload.notes || '',
      });
    }
  }
  return rows;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(SPACE_DATA, { recursive: true });

  const fun = promptRows('fun');
  const dev = promptRows('dev');
  const score = promptRows('score');
  const results = slimResults();

  if (fun.length !== 10) throw new Error(`expected 10 Fun prompts, got ${fun.length}`);
  if (dev.length !== 10) throw new Error(`expected 10 Dev prompts, got ${dev.length}`);
  if (score.length !== 12) throw new Error(`expected 12 Score prompts, got ${score.length}`);

  writeJsonl('fun.jsonl', fun);
  writeJsonl('dev.jsonl', dev);
  writeJsonl('score.jsonl', score);
  writeJsonl('results.jsonl', results);

  const prompts = { fun, dev, score };
  fs.writeFileSync(path.join(SPACE_DATA, 'prompts.json'), `${JSON.stringify(prompts, null, 2)}\n`);
  console.log('Wrote', path.join(SPACE_DATA, 'prompts.json'));
}

main();
