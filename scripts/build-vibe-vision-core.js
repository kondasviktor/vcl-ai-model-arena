#!/usr/bin/env node
/**
 * Copy src/vibe-vision/core.js → dist/vibe-vision-core.js with draft header + SHA-256.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const src = path.join(root, 'src/vibe-vision/core.js');
const dist = path.join(root, 'dist/vibe-vision-core.js');

const body = fs.readFileSync(src, 'utf8');
const sha = crypto.createHash('sha256').update(body).digest('hex');
const header = `/* vibe-vision-core · source=src/vibe-vision/core.js · tag=unreleased-1.1-draft · sha256=${sha} */\n`;
fs.mkdirSync(path.dirname(dist), { recursive: true });
fs.writeFileSync(dist, header + body);
console.log('Wrote', path.relative(root, dist));
console.log('sha256', sha);
