/**
 * Voice transport — web build, over LiveKit.
 *
 * One room per call; the room name is the call's uuid and the token
 * comes from the backend, which checked who was asking. Everything here
 * is sound plumbing: connect, publish the microphone, play each friend
 * who arrives, and tell the screen who is present and who is speaking.
 */
import { Room, RoomEvent, Track } from 'livekit-client';
import type { VoiceEvents, VoicePeer, VoiceSession } from './voice';

export type { VoiceEvents, VoicePeer, VoiceSession, ReadingMessage } from './voice';
export { isReadingMessage } from './voice';

export const VOICE_SUPPORTED = true;

export async function joinVoice(
  url: string,
  token: string,
  events: VoiceEvents,
): Promise<VoiceSession> {
  const room = new Room();
  const attached: HTMLMediaElement[] = [];

  const report = () => {
    const peers: VoicePeer[] = [];
    room.remoteParticipants.forEach((p) => {
      peers.push({
        identity: p.identity,
        name: p.name?.trim() || 'A friend in Christ',
        speaking: p.isSpeaking,
      });
    });
    events.onPeers(peers);
  };

  room
    .on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        const el = track.attach();
        el.style.display = 'none';
        document.body.appendChild(el);
        attached.push(el);
      }
    })
    .on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach().forEach((el) => el.remove());
    })
    .on(RoomEvent.ParticipantConnected, report)
    .on(RoomEvent.ParticipantDisconnected, report)
    .on(RoomEvent.ActiveSpeakersChanged, report)
    .on(RoomEvent.DataReceived, (payload, participant) => {
      if (!events.onData) return;
      try {
        const parsed = JSON.parse(new TextDecoder().decode(payload)) as unknown;
        events.onData(parsed, participant?.identity ?? '');
      } catch {
        // not ours to read
      }
    })
    .on(RoomEvent.Disconnected, () => {
      attached.forEach((el) => el.remove());
      attached.length = 0;
      events.onDisconnected();
    });

  await room.connect(url, token);

  try {
    await room.localParticipant.setMicrophoneEnabled(true);
  } catch {
    await room.disconnect().catch(() => {});
    throw new Error(
      'The microphone was not allowed. Allow it for this site in your browser, then try again.',
    );
  }

  report();

  return {
    setMuted: async (muted: boolean) => {
      await room.localParticipant.setMicrophoneEnabled(!muted);
    },
    leave: async () => {
      await room.disconnect();
    },
    sendData: async (payload: unknown) => {
      const bytes = new TextEncoder().encode(JSON.stringify(payload));
      await room.localParticipant.publishData(bytes, { reliable: true });
    },
  };
}
