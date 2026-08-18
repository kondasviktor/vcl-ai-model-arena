/**
 * Shared constants for optional Hetzner Experiments Inference (BYOK).
 * Docs: https://experiments.hetzner.com/docs/inference
 */
'use strict';

const HETZNER_API_BASE = 'https://inference.hetzner.com/api/v1';
const HETZNER_KEY_ENV = 'HETZNER_INFERENCE_API_KEY';

/**
 * Exact model IDs currently public on Hetzner Experiments Inference.
 * Aug 2026: GLM-5.2-NVFP4, Kimi-K2.7-Code, and DeepSeek-V4-Flash-0731 were
 * withdrawn from public Experiments. Qwen 3.6 remains; Qwen 3.8-27B was
 * announced as coming shortly — add it here only after the exact ID is in
 * https://experiments.hetzner.com/docs/inference
 */
const HETZNER_MODELS = ['Qwen/Qwen3.6-35B-A3B-FP8'];

const HETZNER_SMOKE_MODEL = 'Qwen/Qwen3.6-35B-A3B-FP8';

module.exports = {
  HETZNER_API_BASE,
  HETZNER_KEY_ENV,
  HETZNER_MODELS,
  HETZNER_SMOKE_MODEL,
};
