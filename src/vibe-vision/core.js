/**
 * VCL Vibe Vision — original random-dot motion field (technique class: motion coherence).
 * Not affiliated with Mixfont / Ghost Font. MIT.
 *
 * Source tag (draft): unreleased-1.1
 * Browser: assign to window.VibeVision
 * Node: module.exports
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VibeVision = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_CHARS = 10;
  var DEFAULT_PROMPT = 'What word is in this video?';

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sanitizeText(raw) {
    var s = String(raw || '')
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_CHARS);
    return s;
  }

  function hashSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * Build an offscreen mask: 1 = letter (figure), 0 = ground.
   */
  function buildMask(width, height, text, decoyText) {
    var canvas;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(width, height);
    } else if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
    } else {
      return buildBitmapMask(width, height, text, decoyText);
    }
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Thinner strokes so paused frames dissolve into snow (motion-only legibility).
    var fontSize = Math.floor(Math.min(height * 0.48, (width / Math.max(text.length, 1)) * 0.95));
    ctx.font = '500 ' + fontSize + 'px system-ui, Segoe UI, Helvetica, Arial, sans-serif';
    ctx.fillText(text, width / 2, height / 2);

    if (decoyText) {
      ctx.globalAlpha = 0.28;
      var dSize = Math.floor(fontSize * 0.4);
      ctx.font = '400 ' + dSize + 'px system-ui, Segoe UI, Helvetica, Arial, sans-serif';
      ctx.fillText(decoyText, width / 2, height * 0.82);
      ctx.globalAlpha = 1;
    }

    var img = ctx.getImageData(0, 0, width, height);
    var mask = new Uint8Array(width * height);
    for (var i = 0, p = 0; i < mask.length; i++, p += 4) {
      mask[i] = img.data[p] > 90 ? 1 : 0;
    }
    return erodeMask(mask, width, height);
  }

  /** One-pass erode: drop figure pixels that touch ground — thins letter bands. */
  function erodeMask(mask, width, height) {
    var out = new Uint8Array(mask.length);
    for (var y = 1; y < height - 1; y++) {
      for (var x = 1; x < width - 1; x++) {
        var i = y * width + x;
        if (!mask[i]) continue;
        if (
          mask[i - 1] &&
          mask[i + 1] &&
          mask[i - width] &&
          mask[i + width]
        ) {
          out[i] = 1;
        }
      }
    }
    return out;
  }

  /** Minimal 5x7 glyphs for Node frame export without DOM canvas. */
  var GLYPHS = {
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  };

  function buildBitmapMask(width, height, text, decoyText) {
    var mask = new Uint8Array(width * height);
    function stamp(str, cy, scale) {
      var chars = str.split('');
      var gw = 5 * scale;
      var gh = 7 * scale;
      var gap = 1 * scale;
      var total = chars.length * gw + (chars.length - 1) * gap;
      var startX = Math.floor((width - total) / 2);
      var startY = Math.floor(cy - gh / 2);
      for (var ci = 0; ci < chars.length; ci++) {
        var g = GLYPHS[chars[ci]] || GLYPHS[' '];
        var ox = startX + ci * (gw + gap);
        for (var row = 0; row < 7; row++) {
          for (var col = 0; col < 5; col++) {
            if (g[row][col] !== '1') continue;
            for (var dy = 0; dy < scale; dy++) {
              for (var dx = 0; dx < scale; dx++) {
                var x = ox + col * scale + dx;
                var y = startY + row * scale + dy;
                if (x >= 0 && y >= 0 && x < width && y < height) {
                  mask[y * width + x] = 1;
                }
              }
            }
          }
        }
      }
    }
    var scale = Math.max(3, Math.floor(Math.min(height, width) / 36));
    stamp(text, height * 0.48, scale);
    if (decoyText) {
      stamp(decoyText, height * 0.82, Math.max(2, Math.floor(scale * 0.45)));
    }
    return erodeMask(mask, width, height);
  }

  var DECOY_WORDS = [
    'RIVER', 'BRIDGE', 'CLOUD', 'STONE', 'MAPLE', 'CORAL', 'EMBER', 'PRISM', 'QUARTZ', 'SILVER',
  ];

  function pickDecoy(mainText, randFn) {
    var main = sanitizeText(mainText) || 'VCL';
    var pool = DECOY_WORDS.filter(function (w) {
      return w !== main;
    });
    if (!pool.length) return 'NOISE';
    var r = typeof randFn === 'function' ? randFn() : Math.random();
    return pool[Math.floor(r * pool.length) % pool.length];
  }

  function createField(opts) {
    opts = opts || {};
    var width = opts.width || 640;
    var height = opts.height || 360;
    var density = opts.density != null ? opts.density : 0.25;
    var speed = opts.speed != null ? opts.speed : 120;
    var invert = !!opts.invert;
    var text = sanitizeText(opts.text || 'VCL');
    if (!text) text = 'VCL';
    var decoyText = opts.decoyText ? sanitizeText(opts.decoyText) : '';
    var seed =
      opts.seed != null ? (opts.seed >>> 0) : hashSeed(text + '|' + decoyText + '|' + width);
    var rand = mulberry32(seed);
    var playing = opts.playing !== false;
    var reducedMotion = !!opts.reducedMotion;
    if (reducedMotion) playing = false;

    var mask = buildMask(width, height, text, decoyText || null);
    var count = Math.max(2000, Math.floor(width * height * density));
    var dots = new Float32Array(count * 3); // x, y, isFigure(0/1)

    for (var i = 0; i < count; i++) {
      var x = rand() * width;
      var y = rand() * height;
      var mx = Math.min(width - 1, Math.max(0, Math.floor(x)));
      var my = Math.min(height - 1, Math.max(0, Math.floor(y)));
      var fig = mask[my * width + mx];
      dots[i * 3] = x;
      dots[i * 3 + 1] = y;
      dots[i * 3 + 2] = fig;
    }

    // Light field + dark dots (paused ≈ uniform snow). Invert flips.
    var bg = [236, 236, 232];
    var fg = [18, 18, 20];

    function applyColors() {
      if (invert) {
        bg = [18, 18, 20];
        fg = [236, 236, 232];
      } else {
        bg = [236, 236, 232];
        fg = [18, 18, 20];
      }
    }
    applyColors();

    function setText(next, nextDecoy) {
      text = sanitizeText(next) || 'VCL';
      decoyText = nextDecoy != null ? sanitizeText(nextDecoy) : decoyText;
      seed = hashSeed(text + '|' + decoyText + '|' + width);
      rand = mulberry32(seed);
      mask = buildMask(width, height, text, decoyText || null);
      for (var j = 0; j < count; j++) {
        var xx = rand() * width;
        var yy = rand() * height;
        var ix = Math.min(width - 1, Math.max(0, Math.floor(xx)));
        var iy = Math.min(height - 1, Math.max(0, Math.floor(yy)));
        dots[j * 3] = xx;
        dots[j * 3 + 1] = yy;
        dots[j * 3 + 2] = mask[iy * width + ix];
      }
    }

    function tick(dtMs) {
      if (!playing) return;
      var dt = Math.min(48, Math.max(0, dtMs || 16)) / 1000;
      var dist = speed * dt;
      for (var i = 0; i < count; i++) {
        var base = i * 3;
        var fig = dots[base + 2];
        var dir = invert ? (fig ? -1 : 1) : fig ? 1 : -1;
        var nx = dots[base] + dir * dist;
        if (nx < 0) nx += width;
        if (nx >= width) nx -= width;
        dots[base] = nx;
      }
    }

    function paintDot(data, x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      var idx = (y * width + x) * 4;
      data[idx] = fg[0];
      data[idx + 1] = fg[1];
      data[idx + 2] = fg[2];
      data[idx + 3] = 255;
    }

    function paintToImageData(imageData) {
      var data = imageData.data;
      for (var p = 0; p < data.length; p += 4) {
        data[p] = bg[0];
        data[p + 1] = bg[1];
        data[p + 2] = bg[2];
        data[p + 3] = 255;
      }
      for (var i = 0; i < count; i++) {
        paintDot(data, dots[i * 3] | 0, dots[i * 3 + 1] | 0);
      }
    }

    function render(ctx) {
      if (!ctx) return;
      if (!ctx.__vvBuf || ctx.__vvBuf.width !== width || ctx.__vvBuf.height !== height) {
        // Prefer createImageData — more reliable across browsers than `new ImageData(w,h)`.
        if (ctx.createImageData) {
          ctx.__vvBuf = ctx.createImageData(width, height);
        } else if (typeof ImageData !== 'undefined') {
          ctx.__vvBuf = new ImageData(width, height);
        } else {
          return;
        }
      }
      paintToImageData(ctx.__vvBuf);
      ctx.putImageData(ctx.__vvBuf, 0, 0);
    }

    /** Raw RGBA buffer (Node / tests). */
    function renderToBuffer() {
      var buf = typeof Buffer !== 'undefined' ? Buffer.alloc(width * height * 4) : new Uint8ClampedArray(width * height * 4);
      var fake = { data: buf };
      paintToImageData(fake);
      return buf;
    }

    return {
      width: width,
      height: height,
      get text() {
        return text;
      },
      get decoyText() {
        return decoyText;
      },
      get speed() {
        return speed;
      },
      get invert() {
        return invert;
      },
      get playing() {
        return playing;
      },
      setPlaying: function (v) {
        playing = !!v && !reducedMotion;
      },
      togglePlaying: function () {
        this.setPlaying(!playing);
        return playing;
      },
      setInvert: function (v) {
        invert = !!v;
        applyColors();
      },
      toggleInvert: function () {
        invert = !invert;
        applyColors();
        return invert;
      },
      setSpeed: function (pxPerSec) {
        speed = Math.max(20, Math.min(400, Number(pxPerSec) || 120));
      },
      setText: setText,
      reset: function () {
        setText(text, decoyText);
      },
      tick: tick,
      render: render,
      renderToBuffer: renderToBuffer,
      paintToImageData: paintToImageData,
    };
  }

  /**
   * Export N RGBA frames (Uint8ClampedArray or Buffer each) for multimodal eval.
   */
  function exportFrames(field, opts) {
    opts = opts || {};
    var count = opts.count || 12;
    var dt = opts.dtMs != null ? opts.dtMs : 80;
    var wasPlaying = field.playing;
    field.setPlaying(true);
    var frames = [];
    for (var i = 0; i < count; i++) {
      field.tick(dt);
      frames.push(field.renderToBuffer());
    }
    field.setPlaying(wasPlaying);
    return frames;
  }

  /** Minimal uncompressed PNG encoder (RGBA). */
  function crc32(buf) {
    var table = crc32.table;
    if (!table) {
      table = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
      }
      crc32.table = table;
    }
    var crc = 0xffffffff;
    for (var i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function pngChunk(type, data) {
    var typeBuf = Buffer.from(type, 'ascii');
    var len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    var crcBuf = Buffer.concat([typeBuf, data]);
    var crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcBuf), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  function rgbaToPng(width, height, rgba) {
    if (typeof Buffer === 'undefined') {
      throw new Error('rgbaToPng requires Node Buffer');
    }
    var zlib = require('zlib');
    var raw = Buffer.alloc((width * 4 + 1) * height);
    for (var y = 0; y < height; y++) {
      var rowStart = y * (width * 4 + 1);
      raw[rowStart] = 0;
      rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
    }
    var compressed = zlib.deflateSync(raw);
    var sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    var ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    return Buffer.concat([
      sig,
      pngChunk('IHDR', ihdr),
      pngChunk('IDAT', compressed),
      pngChunk('IEND', Buffer.alloc(0)),
    ]);
  }

  return {
    MAX_CHARS: MAX_CHARS,
    DEFAULT_PROMPT: DEFAULT_PROMPT,
    sanitizeText: sanitizeText,
    pickDecoy: pickDecoy,
    createField: createField,
    exportFrames: exportFrames,
    rgbaToPng: rgbaToPng,
    hashSeed: hashSeed,
  };
});
