import { GuidePage } from '@/components/GuidePage';

/**
 * Submit your book — the vision and the interim path. Real uploads with an
 * admin review queue arrive with accounts and cloud storage.
 */
export default function SubmitBook() {
  return (
    <GuidePage
      content={{
        title: 'Submit your book',
        subtitle: 'The Library will grow by gift — books offered by their authors, reviewed together, and published free.',
        sections: [
          {
            label: 'How it will work',
            bullets: [
              'You upload your manuscript or public-domain transcription.',
              'A reviewer reads it with you — doctrine, rights, and readability.',
              'Once approved, it joins the Library, free to every reader, with your name honoured as the giver.',
            ],
          },
          {
            label: 'Where this stands',
            body: [
              'Uploads need accounts and cloud storage, which arrive later in Phase 2. The review queue is designed and waiting.',
              'Until then, prepare your gift: the finished text, proof that the rights are yours to give (or that the work is public domain), and a few lines about the book and yourself.',
            ],
          },
          {
            label: 'Public domain today',
            body: [
              'If the book you love is already public domain, you don\'t have to wait for us — it may already be freely readable at the sources in "Find free books."',
            ],
            cta: { label: 'Find free books', icon: 'search-outline', route: '/free-books' },
          },
        ],
        footnote: 'Never a paywall on the Word — and never on the books that lead to it.',
      }}
    />
  );
}
