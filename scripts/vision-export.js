#!/usr/bin/env node
/**
 * Export Vibe Vision PNG frame sequences for multimodal eval fixtures.
 * Usage:
 *   node scripts/vision-export.js --word OCEAN --out tests/vision/cases/ocean
 *   node scripts/vision-export.js --word RIVER --decoy BRIDGE --out tests/vision/cases/decoy-river
 */
const fs = require('fs');
const path = require('path');
const {
  createField,
  exportFrames,
  rgbaToPng,
  sanitizeText,
} = require('../src/vibe-vision/core');

function parseArgs(argv) {
  const out = {
    word: 'OCEAN',
    decoy: '',
    outDir: '',
    frames: 12,
    width: 480,
    height: 270,
    speed: 120,
    density: 0.25,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '--word' && next) {
      out.word = next;
      i++;
    } else if (a === '--decoy' && next) {
      out.decoy = next;
      i++;
    } else if (a === '--out' && next) {
      out.outDir = next;
      i++;
    } else if (a === '--frames' && next) {
      out.frames = Number(next) || 12;
      i++;
    } else if (a === '--width' && next) {
      out.width = Number(next) || 480;
      i++;
    } else if (a === '--height' && next) {
      out.height = Number(next) || 270;
      i++;
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const word = sanitizeText(args.word);
  if (!word) {
    console.error('Missing --word');
    process.exit(1);
  }
  const outDir = path.resolve(
    args.outDir || path.join('tests/vision/cases', word.toLowerCase().replace(/\s+/g, '-'))
  );
  const framesDir = path.join(outDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });

  const field = createField({
    text: word,
    decoyText: args.decoy || '',
    width: args.width,
    height: args.height,
    speed: args.speed,
    density: args.density,
    playing: true,
  });

  const frames = exportFrames(field, { count: args.frames, dtMs: 80 });
  const paths = [];
  for (let i = 0; i < frames.length; i++) {
    const png = rgbaToPng(field.width, field.height, frames[i]);
    const name = `frame-${String(i + 1).padStart(2, '0')}.png`;
    const fp = path.join(framesDir, name);
    fs.writeFileSync(fp, png);
    paths.push(fp);
  }

  const expected = {
    answer: word,
    decoy: args.decoy ? sanitizeText(args.decoy) : null,
    frame_count: frames.length,
    width: field.width,
    height: field.height,
    speed_px_s: args.speed,
    density: args.density,
    protocol: 'png-sequence',
    draft: true,
  };
  fs.writeFileSync(path.join(outDir, 'expected.json'), JSON.stringify(expected, null, 2) + '\n');

  const question = `# Vision case — ${word}

Read the hidden word revealed only by motion across these frames.

Answer with the word only (uppercase letters/numbers). If you cannot tell, say CANNOT_TELL.
`;
  fs.writeFileSync(path.join(outDir, 'question.md'), question);

  console.log(`Wrote ${paths.length} frames → ${framesDir}`);
  console.log(`expected.json answer=${word}${args.decoy ? ` decoy=${sanitizeText(args.decoy)}` : ''}`);
}

main();
