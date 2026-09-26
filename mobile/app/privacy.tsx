import { GuidePage, GuideContent } from '@/components/GuidePage';

/**
 * The privacy promise, written to be read — not a legal fog. This page
 * is also the app's privacy policy for the Apple and Google stores:
 * https://enricht16.github.io/holy-bible-ai/privacy
 */

const CONTENT: GuideContent = {
  title: 'Privacy',
  subtitle:
    'The Word is free here, and so are you. This page says plainly what the app ' +
    'knows, what it never knows, and where everything lives.',
  sections: [
    {
      heading: 'What stays on your device',
      body: [
        'Your reading place, highlights, chosen Bible version, text size, themes, and ' +
          'reminder times are stored on your own device and nowhere else. The Scriptures ' +
          'themselves travel with the app, so reading needs no account and sends nothing.',
      ],
    },
    {
      heading: 'An account is a choice, never a toll',
      body: [
        'Nothing in Scripture or prayer requires an account. An account exists for one ' +
          'purpose: so the friends you pray with can find you. Creating one stores your ' +
          'email address, a display name you choose, and a prayer ID the app mints for ' +
          'you. That is the whole of it — no birthday, no phone number, no address.',
        'Accounts and the Prayer Circle are kept with Supabase, our database service, in ' +
          'London. The rules that guard each row are enforced by the database itself: ' +
          'nobody can browse the membership of this app, a stranger can only find you by ' +
          'the exact prayer ID you handed them, and your intentions are visible to your ' +
          'circle and no one else.',
      ],
    },
    {
      heading: 'Prayer calls',
      body: [
        'When you pray aloud with your circle, your voice travels encrypted through ' +
          'LiveKit, the service that carries the sound. Calls are never recorded and ' +
          'never stored — when the call ends, the sound is gone, as spoken prayer should ' +
          'be. The app keeps only the small facts needed to ring honestly: who called ' +
          'whom, and whether the call was answered, declined, or missed.',
        'While the app is open it quietly notes the time, so your circle can see you as ' +
          '“reachable now.” Only your circle sees this, and it fades within minutes of ' +
          'closing the app.',
      ],
    },
    {
      heading: 'The AI guide',
      body: [
        'When you ask the guide to explain a passage or answer a question, the passage ' +
          'and your question are sent to our own server, which passes them to Anthropic’s ' +
          'Claude to compose the reflection. Your name and account are not attached; the ' +
          'guide answers a question, not a person. Even so, it is wise not to place ' +
          'personal details inside a question.',
      ],
    },
    {
      heading: 'What this app will never do',
      body: [
        'No advertising. No trackers. No analytics harvest. No selling or sharing of ' +
          'your data with anyone, for any price. There is no paywall on Scripture and no ' +
          'trade in the people who read it.',
      ],
    },
    {
      heading: 'Leaving, wholly',
      body: [
        'You may remove intentions, leave circles, and sign out at any time inside the ' +
          'app. You may also delete your account entirely from the account page: your ' +
          'profile, prayer ID, circle ties, intentions, and call records are erased ' +
          'together, and nothing of the account remains.',
      ],
    },
    {
      heading: 'A word on children',
      body: [
        'The app is made for everyone at prayer. It shows no advertising, opens no ' +
          'strangers’ doors — the circle admits only people whose exact prayer ID you ' +
          'hold — and asks nothing of a reader but their attention.',
      ],
    },
    {
      heading: 'Questions and changes',
      body: [
        'This page will be kept true as the app grows; anything new the app learns to do ' +
          'will be written here in the same plain words. Questions and concerns are ' +
          'welcome through the app’s pages on GitHub, at github.com/EnrichT16/holy-bible-ai.',
      ],
    },
  ],
  footnote: 'Last renewed 26 September 2026 · Holy Bible · AI Assisted',
};

export default function Privacy() {
  return <GuidePage content={CONTENT} />;
}
