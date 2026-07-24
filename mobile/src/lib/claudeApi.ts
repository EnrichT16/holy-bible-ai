/**
 * Client for the Holy Bible backend's Claude proxy.
 *
 * The app NEVER holds the Anthropic API key — it calls our own backend,
 * which adds the key server-side and talks to Claude. See /backend.
 */
import { CONFIG } from './config';

export type ExplainMode = 'explain' | 'ask';

export interface ExplainRequest {
  mode: ExplainMode;
  reference: string; // e.g. "John 1"
  passage: string; // the verse text
  question?: string; // for "ask" mode
}

export async function explainPassage(req: ExplainRequest): Promise<string> {
  const res = await fetch(`${CONFIG.backendUrl}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(
      `The guide is unavailable right now (${res.status}). ${detail}`.trim()
    );
  }
  const data = await res.json();
  return String(data.answer ?? '').trim();
}
