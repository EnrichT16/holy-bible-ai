/**
 * Voice transport — native build.
 *
 * The web app (voice.web.ts) carries live prayer calls over LiveKit in
 * the browser. The native apps will carry them with the store builds of
 * Phase 4, where a real ring can reach a locked phone; until then this
 * stub says so honestly and nothing here imports the browser library.
 */

export interface VoicePeer {
  /** The friend's account id — stable across name changes. */
  identity: string;
  name: string;
  speaking: boolean;
}

export interface VoiceEvents {
  onPeers: (peers: VoicePeer[]) => void;
  onDisconnected: () => void;
  /** A small JSON message from another participant — shared reading state. */
  onData?: (payload: unknown, fromIdentity: string) => void;
}

export interface VoiceSession {
  setMuted: (muted: boolean) => Promise<void>;
  leave: () => Promise<void>;
  /** Send a small JSON message to everyone in the room, reliably. */
  sendData: (payload: unknown) => Promise<void>;
}

export const VOICE_SUPPORTED = false;

export async function joinVoice(
  _url: string,
  _token: string,
  _events: VoiceEvents,
): Promise<VoiceSession> {
  throw new Error(
    'Voice prayer calls work in the web app today; the store apps of Phase 4 will carry them too.',
  );
}

/** The shared-reading message that travels between participants. */
export interface ReadingMessage {
  t: 'passage';
  book: string;
  chapter: number;
  /** Epoch milliseconds — the newest choice wins on every screen. */
  at: number;
  byName: string;
}

export function isReadingMessage(payload: unknown): payload is ReadingMessage {
  const p = payload as ReadingMessage | null;
  return (
    !!p &&
    p.t === 'passage' &&
    typeof p.book === 'string' &&
    typeof p.chapter === 'number' &&
    typeof p.at === 'number'
  );
}
