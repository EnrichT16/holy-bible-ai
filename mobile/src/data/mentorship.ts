/**
 * Mentorship — the Life in the Spirit Seminar: seven sessions walking a
 * believer from God's love to a Spirit-filled life. Scripture is KJV
 * (public domain); the teaching summaries are our own.
 */
import type { GuideContent } from '@/components/GuidePage';

export interface SeminarSession {
  id: string;
  week: number;
  title: string;
  aim: string;
  content: GuideContent;
}

const DISCLAIMER =
  'The guide is an aid to study and prayer — never a replacement for Scripture, the Church, or your pastor.';

export const SEMINAR: SeminarSession[] = [
  {
    id: 'gods-love',
    week: 1,
    title: "God's Love",
    aim: 'To know personally that God loves you and has a plan for your life.',
    content: {
      title: "Week 1 · God's Love",
      subtitle: 'To know personally that God loves you and has a plan for your life.',
      sections: [
        {
          label: 'The Word',
          scripture: {
            ref: 'John 3:16 · KJV',
            text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
          },
        },
        {
          label: 'The teaching',
          body: [
            'Everything begins here: before you did anything, God loved you. His love is not a reward for good behaviour — it is the reason you exist. The seminar starts by asking you to stop treating God\'s love as a doctrine you agree with and to receive it as a fact about yourself.',
            'This week, notice the ways you quietly believe you must earn God\'s attention. Bring each one to Him honestly.',
          ],
        },
        {
          label: 'To ponder',
          bullets: [
            'When did God\'s love last feel real to you — not argued, felt?',
            'What would change tomorrow if you were certain of it?',
          ],
        },
        {
          prayer: {
            title: 'This week\'s prayer',
            text: 'Father, You loved me before I ever turned to You. Open my heart this week to know that love — not as an idea, but as my life. Amen.',
          },
        },
      ],
      footnote: DISCLAIMER,
    },
  },
  {
    id: 'salvation',
    week: 2,
    title: 'Salvation',
    aim: 'To see clearly what Jesus has done for us on the Cross.',
    content: {
      title: 'Week 2 · Salvation',
      subtitle: 'To see clearly what Jesus has done for us on the Cross.',
      sections: [
        {
          label: 'The Word',
          scripture: {
            ref: 'Romans 5:8 · KJV',
            text: 'But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.',
          },
        },
        {
          label: 'The teaching',
          body: [
            'Sin is not a list of broken rules; it is a broken relationship — and no one mends it from our side. The Gospel is not advice, it is news: Christ has done for us what we could not do for ourselves.',
            'This week the seminar asks for honesty about sin — not to condemn, but so the Cross can be received for what it is: rescue.',
          ],
        },
        {
          label: 'To ponder',
          bullets: [
            'What do you still try to fix in yourself before letting God near it?',
            'Have you ever thanked Jesus, plainly and personally, for the Cross?',
          ],
        },
        {
          prayer: {
            title: 'This week\'s prayer',
            text: 'Lord Jesus, You died for me while I was still far away. I bring You my sin without excuses, and I receive Your rescue. Be my Saviour — today, and every day. Amen.',
          },
        },
      ],
      footnote: DISCLAIMER,
    },
  },
  {
    id: 'new-life',
    week: 3,
    title: 'The New Life',
    aim: 'To understand the life Jesus offers — friendship with God in His Spirit.',
    content: {
      title: 'Week 3 · The New Life',
      subtitle: 'To understand the life Jesus offers — friendship with God in His Spirit.',
      sections: [
        {
          label: 'The Word',
          scripture: {
            ref: 'John 10:10 · KJV',
            text: 'I am come that they might have life, and that they might have it more abundantly.',
          },
        },
        {
          label: 'The teaching',
          body: [
            'Christianity is not sin-management. Jesus offers a new life: prayer that is conversation, Scripture that speaks, a community that carries you, power to love people you could not love before.',
            'This week, begin the habits that new life breathes through: a fixed daily time of prayer, and a Gospel read slowly — a chapter a day is enough.',
          ],
        },
        {
          label: 'To ponder',
          bullets: [
            'Which part of the new life do you most hunger for — and which do you resist?',
            'What fixed time each day will be God\'s, starting now?',
          ],
        },
        {
          prayer: {
            title: 'This week\'s prayer',
            text: 'Lord, I do not want a smaller life patched up — I want the life You promised. Teach me to pray, open the Scriptures to me, and give me companions on the way. Amen.',
          },
        },
      ],
      footnote: DISCLAIMER,
    },
  },
  {
    id: 'receiving-gods-gift',
    week: 4,
    title: "Receiving God's Gift",
    aim: 'To prepare to receive the Holy Spirit — turning from sin, turning in faith.',
    content: {
      title: "Week 4 · Receiving God's Gift",
      subtitle: 'To prepare to receive the Holy Spirit — turning from sin, turning in faith.',
      sections: [
        {
          label: 'The Word',
          scripture: {
            ref: 'Luke 11:13 · KJV',
            text: 'If ye then, being evil, know how to give good gifts unto your children: how much more shall your heavenly Father give the Holy Spirit to them that ask him?',
          },
        },
        {
          label: 'The teaching',
          body: [
            'The Spirit is a gift — but a gift must be received with open hands. This week is the turning: renouncing what cannot stay (unforgiveness, the occult, hidden sin) and choosing Jesus as Lord of every room in the house.',
            'A good confession this week is worth more than a hundred resolutions. Go, if you can.',
          ],
        },
        {
          label: 'To ponder',
          bullets: [
            'What must be renounced by name for your hands to be open?',
            'Is any part of your life still marked "private — God keep out"?',
          ],
        },
        {
          prayer: {
            title: 'This week\'s prayer',
            text: 'Lord Jesus, I turn from everything that shuts You out, and I ask You plainly, as Your friend: fill me with Your Holy Spirit. I hold nothing back. Amen.',
          },
        },
      ],
      footnote: DISCLAIMER,
    },
  },
  {
    id: 'baptism-in-the-spirit',
    week: 5,
    title: 'Baptism in the Holy Spirit',
    aim: 'To be prayed with for a fresh outpouring of the Spirit.',
    content: {
      title: 'Week 5 · Baptism in the Holy Spirit',
      subtitle: 'To be prayed with for a fresh outpouring of the Spirit.',
      sections: [
        {
          label: 'The Word',
          scripture: {
            ref: 'Acts 1:8 · KJV',
            text: 'But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me… unto the uttermost part of the earth.',
          },
        },
        {
          label: 'The teaching',
          body: [
            'This is the seminar\'s heart: being prayed with, simply and expectantly, that the grace of your Baptism and Confirmation would blaze up into fire. Nothing magical happens in the hands laid on you — everything happens in the God who keeps His promise.',
            'Ordinarily this session is prayed in person, with your group or parish community. If you are walking the seminar alone with this app, ask two praying friends — or your priest — to pray over you this week. And pray yourself: the ancient prayer below has never failed to be answered in God\'s way and time.',
          ],
        },
        {
          prayer: {
            title: 'Come, Holy Spirit',
            text: 'Come, Holy Spirit, fill the hearts of Thy faithful, and kindle in them the fire of Thy love. Send forth Thy Spirit and they shall be created, and Thou shalt renew the face of the earth. Amen.',
          },
        },
        {
          label: 'To ponder',
          bullets: [
            'What are you afraid might change if the Spirit truly came in power?',
            'Who will you ask to pray with you this week?',
          ],
        },
      ],
      footnote: DISCLAIMER,
    },
  },
  {
    id: 'growth',
    week: 6,
    title: 'Growth',
    aim: 'To learn the means of growth: prayer, Scripture, sacraments, community.',
    content: {
      title: 'Week 6 · Growth',
      subtitle: 'To learn the means of growth: prayer, Scripture, sacraments, community.',
      sections: [
        {
          label: 'The Word',
          scripture: {
            ref: '2 Peter 3:18 · KJV',
            text: 'But grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ.',
          },
        },
        {
          label: 'The teaching',
          body: [
            'Fire that is not fed goes out. The Spirit-filled life is kept burning by unglamorous faithfulness: daily prayer at a fixed hour, the Scriptures read and prayed, frequent Communion and regular confession, and real brothers and sisters who know your name and your struggles.',
            'This week, choose your rule of life — small enough to keep, firm enough to hold you.',
          ],
        },
        {
          label: 'A simple rule to begin',
          bullets: [
            'Morning: the day offered to God — one psalm.',
            'Midday: a pause — the Angelus.',
            'Evening: the Rosary or a Gospel chapter.',
            'Weekly: Sunday Mass; one act of service nobody sees.',
            'Monthly: confession.',
          ],
        },
        {
          prayer: {
            title: 'This week\'s prayer',
            text: 'Lord, keep the fire You lit in me burning. Give me love for the small faithful things, and friends to walk with. Amen.',
          },
        },
      ],
      footnote: DISCLAIMER,
    },
  },
  {
    id: 'transformation',
    week: 7,
    title: 'Transformation in Christ',
    aim: 'To be sent: a life given away in love and witness.',
    content: {
      title: 'Week 7 · Transformation in Christ',
      subtitle: 'To be sent: a life given away in love and witness.',
      sections: [
        {
          label: 'The Word',
          scripture: {
            ref: 'Matthew 5:16 · KJV',
            text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',
          },
        },
        {
          label: 'The teaching',
          body: [
            'The Spirit is given for mission. What you have received is not a private treasure but a lamp for the house. The seminar ends where the Christian life begins in earnest: family loved better, work done honestly, the poor served, and the name of Jesus spoken without shame and without harshness.',
            'Ask this week: to whom am I sent? Begin with the people already given to you.',
          ],
        },
        {
          label: 'To ponder',
          bullets: [
            'Who in your life is waiting — without knowing it — for your witness?',
            'What one work of mercy will you take up this season?',
          ],
        },
        {
          prayer: {
            title: 'The sending prayer',
            text: 'Lord Jesus, all I have received, I received to give. Send me — to my home, my street, my work — and let my life make You easier to believe in. Amen.',
          },
        },
      ],
      footnote: DISCLAIMER,
    },
  },
];

export function findSession(id: string): SeminarSession | undefined {
  return SEMINAR.find((s) => s.id === id);
}
