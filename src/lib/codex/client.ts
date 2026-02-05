'use client';

import { Codex } from '@codex-data/sdk';

let codexClient: Codex | null = null;
let cachedApiKey: string | null = null;

export const getCodexClient = (apiKey?: string | null) => {
  if (!apiKey) return null;
  if (!codexClient || cachedApiKey !== apiKey) {
    codexClient = new Codex(apiKey);
    cachedApiKey = apiKey;
  }
  return codexClient;
};
