/**
 * Shared constants for optional Hetzner Experiments Inference (BYOK).
 * Docs: https://experiments.hetzner.com/docs/inference
 */
'use strict';

const HETZNER_API_BASE = 'https://inference.hetzner.com/api/v1';
const HETZNER_KEY_ENV = 'HETZNER_INFERENCE_API_KEY';

/** Exact model IDs from Hetzner Experiments Inference docs (allowlist). */
const HETZNER_MODELS = [
  'Kimi-K2.7-Code',
  'DeepSeek-V4-Flash-0731',
  'GLM-5.2-NVFP4',
  'Qwen/Qwen3.6-35B-A3B-FP8',
];

const HETZNER_SMOKE_MODEL = 'Qwen/Qwen3.6-35B-A3B-FP8';

module.exports = {
  HETZNER_API_BASE,
  HETZNER_KEY_ENV,
  HETZNER_MODELS,
  HETZNER_SMOKE_MODEL,
};
