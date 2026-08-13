#!/usr/bin/env node
/** Local check that Score unit tests pass against known-good implementations. */
'use strict';
const { grade, TASKS } = require('../tests/score/harness');

const SOLUTIONS = {
  slugify: `function slugify(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}`,
  isPalindrome: `function isPalindrome(str) {
  const s = String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  return s === s.split('').reverse().join('');
}`,
  chunk: `function chunk(arr, size) {
  if (size < 1) return [];
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}`,
  parseQuery: `function parseQuery(qs) {
  const s = String(qs).replace(/^\\?/, '');
  if (!s) return {};
  const out = {};
  for (const part of s.split('&')) {
    if (!part) continue;
    const i = part.indexOf('=');
    const k = i < 0 ? part : part.slice(0, i);
    const v = i < 0 ? '' : part.slice(i + 1);
    out[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return out;
}`,
  deepGet: `function deepGet(obj, path) {
  if (path === '') return obj;
  return String(path).split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}`,
  uniquePreserve: `function uniquePreserve(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}`,
  formatBytes: `function formatBytes(n) {
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  const num = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return num + ' ' + units[i];
}`,
  rangeSum: `function rangeSum(a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return ((hi - lo + 1) * (lo + hi)) / 2;
}`,
  titleCase: `function titleCase(str) {
  return String(str).trim().split(/\\s+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}`,
  isAnagram: `function isAnagram(a, b) {
  const n = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '').split('').sort().join('');
  return n(a) === n(b);
}`,
  fibonacci: `function fibonacci(n) {
  if (n < 0) return null;
  if (n < 2) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) { const t = a + b; a = b; b = t; }
  return b;
}`,
  groupBy: `function groupBy(arr, key) {
  const out = {};
  for (const obj of arr) {
    const k = obj[key];
    if (!out[k]) out[k] = [];
    out[k].push(obj);
  }
  return out;
}`,
};

let failed = 0;
for (const id of Object.keys(TASKS)) {
  const r = grade(id, '```js\n' + SOLUTIONS[id] + '\n```');
  if (!r.pass) {
    failed++;
    console.error('FAIL', id, r.reason);
  } else {
    console.log('ok', id);
  }
}
if (failed) process.exit(1);
console.log('score harness: all', Object.keys(TASKS).length, 'tasks passed');
