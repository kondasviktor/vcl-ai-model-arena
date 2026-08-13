/**
 * VCL VibeBench Score (1.2) — extract a function from model output and run unit tests.
 * Original VCL tasks (Aider-lite protocol: write code, tests grade). Not Exercism/SWE-bench.
 */
'use strict';

const vm = require('vm');

function parsesAsScript(code) {
  try {
    new vm.Script(code, { filename: 'score-candidate.js' });
    return true;
  } catch {
    return false;
  }
}

/** Brace-balanced `function name(...) { ... }` blocks (ignores truncated thinking drafts). */
function namedFunctionBlocks(text) {
  const blocks = [];
  const re = /\b(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index;
    const brace = text.indexOf('{', start);
    if (brace < 0) continue;
    let depth = 0;
    let inStr = null;
    let escape = false;
    for (let i = brace; i < text.length; i++) {
      const c = text[i];
      if (inStr) {
        if (escape) {
          escape = false;
          continue;
        }
        if (c === '\\') {
          escape = true;
          continue;
        }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        inStr = c;
        continue;
      }
      if (c === '{') depth += 1;
      else if (c === '}') {
        depth -= 1;
        if (depth === 0) {
          blocks.push(text.slice(start, i + 1).trim());
          break;
        }
      }
    }
  }
  return blocks;
}

function extractCode(output) {
  const text = String(output || '');
  const candidates = [];
  for (const m of text.matchAll(/```(?:javascript|js|python|py)?\s*\n([\s\S]*?)```/gi)) {
    const body = m[1].trim();
    if (body) candidates.push(body);
  }
  for (const block of namedFunctionBlocks(text)) {
    candidates.push(block);
  }
  for (let i = candidates.length - 1; i >= 0; i--) {
    if (parsesAsScript(candidates[i])) return candidates[i];
  }
  if (candidates.length) return candidates[candidates.length - 1];
  const start = text.search(/\b(?:async\s+)?function\b|\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=/);
  if (start >= 0) return text.slice(start).trim();
  return text.trim();
}

const TASKS = {
  slugify: {
    name: 'slugify',
    checks: 'URL slug from a string (lowercase, hyphens, strip junk)',
    run(fn) {
      expectEq(fn('Hello World'), 'hello-world', 'Hello World');
      expectEq(fn('Hello  World!!'), 'hello-world', 'punctuation/spaces');
      expectEq(fn('--Foo--Bar--'), 'foo-bar', 'collapse hyphens');
      expectEq(fn(''), '', 'empty');
      expectEq(fn('Already-slug'), 'already-slug', 'lowercase existing');
    },
  },
  isPalindrome: {
    name: 'isPalindrome',
    checks: 'Palindrome after ignoring case, spaces, punctuation',
    run(fn) {
      expectEq(fn('A man a plan a canal Panama'), true, 'classic');
      expectEq(fn('race a car'), false, 'not palindrome');
      expectEq(fn(''), true, 'empty');
      expectEq(fn('No lemon, no melon'), true, 'punctuation');
    },
  },
  chunk: {
    name: 'chunk',
    checks: 'Split an array into groups of size N',
    run(fn) {
      expectDeep(fn([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]], 'uneven');
      expectDeep(fn([], 3), [], 'empty arr');
      expectDeep(fn([1, 2], 1), [[1], [2]], 'size 1');
      expectDeep(fn([1, 2, 3], 0), [], 'size < 1');
    },
  },
  parseQuery: {
    name: 'parseQuery',
    checks: 'URL query string → `{ key: value }` object',
    run(fn) {
      expectDeep(fn('a=1&b=2'), { a: '1', b: '2' }, 'basic');
      expectDeep(fn('?a=1&a=2'), { a: '2' }, 'last wins + leading ?');
      expectEq(fn('q=hello%20world').q, 'hello world', 'decode');
      expectDeep(fn(''), {}, 'empty');
    },
  },
  deepGet: {
    name: 'deepGet',
    checks: 'Read `a.b.0.c` from a nested object/array',
    run(fn) {
      const obj = { a: { b: 1 }, items: [{ n: 9 }] };
      expectEq(fn(obj, 'a.b'), 1, 'nested');
      expectEq(fn(obj, 'items.0.n'), 9, 'array index');
      expectEq(fn(obj, 'a.c'), undefined, 'missing');
      expectEq(fn(obj, ''), obj, 'empty path returns obj');
    },
  },
  uniquePreserve: {
    name: 'uniquePreserve',
    checks: 'Deduplicate an array, keep first occurrence',
    run(fn) {
      expectDeep(fn([1, 2, 2, 3, 1]), [1, 2, 3], 'first wins');
      expectDeep(fn([]), [], 'empty');
      expectDeep(fn(['a', 'A', 'a']), ['a', 'A'], 'case sensitive');
    },
  },
  formatBytes: {
    name: 'formatBytes',
    checks: 'Bytes → `1 KB` / `1.5 KB` style string',
    run(fn) {
      expectEq(fn(0), '0 B', 'zero');
      expectEq(fn(1024), '1 KB', '1024');
      expectEq(fn(1536), '1.5 KB', '1.5 KB');
      expectEq(fn(1048576), '1 MB', '1 MB');
    },
  },
  rangeSum: {
    name: 'rangeSum',
    checks: 'Sum of integers from a to b (either order)',
    run(fn) {
      expectEq(fn(1, 3), 6, '1..3');
      expectEq(fn(3, 1), 6, 'either order');
      expectEq(fn(0, 0), 0, 'zero');
      expectEq(fn(-1, 1), 0, 'negatives');
    },
  },
  titleCase: {
    name: 'titleCase',
    checks: 'Capitalize each word; collapse extra spaces',
    run(fn) {
      expectEq(fn('hello world'), 'Hello World', 'basic');
      expectEq(fn('HELLO'), 'Hello', 'all caps');
      expectEq(fn('  a   b '), 'A B', 'collapse space');
      expectEq(fn(''), '', 'empty');
    },
  },
  isAnagram: {
    name: 'isAnagram',
    checks: 'Same letters ignoring case/spaces/punctuation',
    run(fn) {
      expectEq(fn('listen', 'silent'), true, 'listen/silent');
      expectEq(fn('Hello', 'world'), false, 'hello/world');
      expectEq(fn('Dormitory', 'dirty room'), true, 'ignore space/case');
      expectEq(fn('', ''), true, 'empty');
    },
  },
  fibonacci: {
    name: 'fibonacci',
    checks: 'nth Fibonacci number (negative → null)',
    run(fn) {
      expectEq(fn(0), 0, '0');
      expectEq(fn(1), 1, '1');
      expectEq(fn(10), 55, '10');
      expectEq(fn(-1), null, 'negative');
    },
  },
  groupBy: {
    name: 'groupBy',
    checks: 'Group objects by a property name',
    run(fn) {
      const rows = [
        { t: 'a', n: 1 },
        { t: 'a', n: 2 },
        { t: 'b', n: 3 },
      ];
      const g = fn(rows, 't');
      expectEq(Array.isArray(g.a) && g.a.length, 2, 'group a');
      expectEq(Array.isArray(g.b) && g.b.length, 1, 'group b');
      expectDeep(fn([], 't'), {}, 'empty');
    },
  },
};

function expectEq(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function expectDeep(actual, expected, label) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(`${label}: expected ${b}, got ${a}`);
  }
}

function loadFn(code, name) {
  const sandbox = {
    module: { exports: {} },
    exports: {},
    console: { log() {}, warn() {}, error() {} },
  };
  sandbox.exports = sandbox.module.exports;
  vm.createContext(sandbox);
  const wrapped =
    code +
    `\n; (typeof ${name} === 'function' ? ${name} : (module.exports.${name} || module.exports.default || module.exports))`;
  const fn = vm.runInContext(wrapped, sandbox, { timeout: 1500, filename: 'score-candidate.js' });
  if (typeof fn !== 'function') {
    throw new Error(`Could not find function ${name} in the output`);
  }
  return fn;
}

function grade(taskId, output) {
  const task = TASKS[taskId];
  if (!task) {
    return { pass: false, reason: `Unknown Score task: ${taskId}` };
  }
  try {
    const code = extractCode(output);
    if (!code) {
      return { pass: false, reason: 'No code in the model output' };
    }
    const fn = loadFn(code, task.name);
    task.run(fn);
    return { pass: true, reason: `${task.name}: all unit tests passed` };
  } catch (err) {
    return { pass: false, reason: String(err && err.message ? err.message : err) };
  }
}

/** promptfoo javascript file assert: boolean | number | {pass, score, reason} */
module.exports = function scoreAssert(output, context) {
  const taskId =
    (context && context.vars && context.vars.task) ||
    (context && context.test && context.test.metadata && context.test.metadata.task) ||
    (context && context.testCase && context.testCase.metadata && context.testCase.metadata.task);
  const result = grade(taskId, output);
  return {
    pass: result.pass,
    score: result.pass ? 1 : 0,
    reason: result.reason,
  };
};

module.exports.grade = grade;
module.exports.TASKS = TASKS;
module.exports.extractCode = extractCode;
