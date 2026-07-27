/**
 * The For Catholics guides — Divine Mercy, Our Lady, the Block Rosary,
 * the Legion of Mary, and Canon Law. Prayers are the traditional public-
 * domain texts; the prose is our own plain-spoken guide.
 */
import type { GuideContent } from '@/components/GuidePage';

export const DIVINE_MERCY: GuideContent = {
  title: 'Divine Mercy',
  subtitle: 'The message Our Lord entrusted to St. Faustina Kowalska in 1930s Poland: that His mercy is greater than every sin, and that souls should come to Him with trust.',
  sections: [
    {
      label: 'The Chaplet',
      body: [
        'The Chaplet of Divine Mercy is prayed on ordinary rosary beads and takes about seven minutes. On the large beads we offer the Eternal Father the Body and Blood, Soul and Divinity of His Son; on the small beads we plead His sorrowful Passion for the whole world.',
      ],
      cta: { label: 'Pray the Chaplet — guided', icon: 'water-outline', route: '/chaplet' },
    },
    {
      label: 'The Hour of Mercy',
      body: [
        'Three o\'clock in the afternoon recalls the hour Jesus died for us. Even a moment\'s pause at three — a single "Jesus, I trust in You" — honours His Passion. If you can, pray the Chaplet then; the Reminders can call you to it each day.',
      ],
      prayer: { title: 'The prayer of trust', text: 'Jesus, I trust in You.' },
      cta: { label: 'Set the three o\'clock reminder', icon: 'notifications-outline', route: '/reminders' },
    },
    {
      label: 'The Novena',
      body: [
        'The Divine Mercy Novena begins on Good Friday and ends on the eve of Divine Mercy Sunday (the Sunday after Easter). Each day the Chaplet is offered for a different group of souls — all mankind, priests and religious, the devout, unbelievers, separated brethren, the meek, souls who venerate His mercy, the souls in purgatory, and the lukewarm.',
        'To pray it: each of the nine days, bring that day\'s intention to the Chaplet.',
      ],
    },
    {
      label: 'Divine Mercy Sunday',
      body: [
        'The Sunday after Easter, established for the whole Church by St. John Paul II in the year 2000. A day to receive Holy Communion worthily, go to Confession, and trust completely in the ocean of His mercy.',
      ],
    },
  ],
  footnote: 'The devotion is drawn from the Diary of St. Faustina. Read it in full through your parish or the Marian Fathers, its custodians.',
};

export const OUR_LADY: GuideContent = {
  title: 'Our Lady',
  subtitle: 'The Church\'s treasury of Marian prayer — the Angelus, the Memorare, the Magnificat, and the great hymns to the Mother of God.',
  sections: [
    {
      label: 'The Angelus',
      body: ['Prayed morning, noon, and evening — traditionally at six, twelve, and six — the Angelus recalls the Incarnation. The bell rings three times three, then nine.'],
      prayer: {
        title: 'The Angelus',
        text:
          'The Angel of the Lord declared unto Mary, and she conceived of the Holy Spirit. Hail Mary… ' +
          'Behold the handmaid of the Lord: be it done unto me according to thy word. Hail Mary… ' +
          'And the Word was made flesh, and dwelt among us. Hail Mary… ' +
          'Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. ' +
          'Let us pray: Pour forth, we beseech Thee, O Lord, Thy grace into our hearts; that we, to whom the Incarnation of Christ, Thy Son, was made known by the message of an angel, may by His Passion and Cross be brought to the glory of His Resurrection, through the same Christ our Lord. Amen.',
      },
    },
    {
      label: 'In Eastertide',
      body: ['From Easter to Pentecost the Regina Caeli replaces the Angelus, greeting the Risen Lord with His Mother\'s joy.'],
      prayer: {
        title: 'Regina Caeli',
        text:
          'Queen of Heaven, rejoice, alleluia: for He whom thou didst merit to bear, alleluia, ' +
          'hath risen as He said, alleluia. Pray for us to God, alleluia. ' +
          'Rejoice and be glad, O Virgin Mary, alleluia: for the Lord is truly risen, alleluia.',
      },
    },
    {
      label: 'The Memorare',
      body: ['St. Bernard\'s cry of confidence — the prayer for impossible causes.'],
      prayer: {
        title: 'The Memorare',
        text:
          'Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, ' +
          'implored thy help, or sought thy intercession was left unaided. Inspired by this confidence, ' +
          'I fly unto thee, O Virgin of virgins, my Mother. To thee do I come, before thee I stand, sinful and sorrowful. ' +
          'O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.',
      },
    },
    {
      label: 'The Magnificat',
      body: ['Mary\'s own song, sung at the Visitation — the Church prays it every evening at Vespers.'],
      scripture: {
        ref: 'Luke 1:46–49 · KJV',
        text:
          'My soul doth magnify the Lord, and my spirit hath rejoiced in God my Saviour. ' +
          'For he hath regarded the low estate of his handmaiden: for, behold, from henceforth all generations shall call me blessed. ' +
          'For he that is mighty hath done to me great things; and holy is his name.',
      },
    },
    {
      label: 'Hail, Holy Queen',
      prayer: {
        title: 'Salve Regina',
        text:
          'Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. ' +
          'To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, ' +
          'mourning and weeping in this valley of tears. Turn then, most gracious advocate, ' +
          'thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus. ' +
          'O clement, O loving, O sweet Virgin Mary.',
      },
    },
    {
      label: 'And always — the Rosary',
      body: ['Our Lady\'s own school of prayer: the Gospel prayed bead by bead.'],
      cta: { label: 'Pray the Rosary — guided', icon: 'flower-outline', route: '/rosary' },
    },
  ],
};

export const BLOCK_ROSARY: GuideContent = {
  title: 'The Block Rosary',
  subtitle: 'The neighbourhood evening apostolate — families gathering at dusk, street by street, to pray the Rosary before a travelling image of Our Lady.',
  sections: [
    {
      label: 'What it is',
      body: [
        'The Block Rosary is a crusade of neighbourhood prayer that grew from the Family Rosary movement of the 1940s and took deep root in Nigeria, where children and families gather each evening — often at a grotto, a compound, or a street corner — to pray the Rosary together.',
        'A statue or picture of Our Lady often travels from home to home, staying a week in each, gathering the families of the street around her Son.',
      ],
    },
    {
      label: 'How to start one',
      bullets: [
        'Speak to your parish priest and ask his blessing.',
        'Find two or three families within walking distance who will commit to an evening time — six or seven o\'clock works in most places.',
        'Choose the meeting place: a home, a compound, a grotto — anywhere safe for children.',
        'Keep it simple and constant: the Rosary of the day\'s mysteries, a hymn, and the closing prayers. Constancy matters more than length.',
        'Let the children lead decades early — the Block Rosary is a school of prayer for the young.',
        'If an image of Our Lady travels house to house, receive her with a candle and a clean cloth; the host family leads that week.',
      ],
    },
    {
      label: 'An evening\'s order',
      bullets: [
        'The Sign of the Cross and a hymn to gather.',
        'The Rosary — the day\'s mysteries, decades shared among those present.',
        'The Hail, Holy Queen and the closing prayer.',
        'Brief intentions — the sick of the street, exams, travels, peace.',
        'A final hymn; the youngest carry the candle home.',
      ],
      cta: { label: 'Open the guided Rosary', icon: 'flower-outline', route: '/rosary' },
    },
    {
      label: 'Its fruits',
      body: [
        'Where the Block Rosary lives, the street becomes a parish in miniature: children learn the mysteries by heart, neighbours reconcile, vocations quietly begin. As Venerable Patrick Peyton preached: the family that prays together stays together.',
      ],
    },
  ],
};

export const LEGION_OF_MARY: GuideContent = {
  title: 'The Legion of Mary',
  subtitle: 'A lay apostolic army in Mary\'s service — founded by the Servant of God Frank Duff in Dublin, 1921, now praying and serving in nearly every country on earth.',
  sections: [
    {
      label: 'What it is',
      body: [
        'The Legion of Mary is an association of lay Catholics who, under the leadership of Our Lady, do spiritual works of mercy: visiting the sick and the lonely, teaching the faith, welcoming strangers, and bringing the sacraments\' invitation to those far from them.',
        'Its spirit is drawn from St. Louis de Montfort\'s True Devotion to Mary: total, confident consecration to Jesus through His Mother.',
      ],
    },
    {
      label: 'How it works',
      bullets: [
        'The praesidium — the local unit, meeting weekly in the parish, usually six to twenty members.',
        'The weekly meeting — the Legion prayers around a small altar of Our Lady, the minutes, the allocutio (a short teaching), and the assignment of the week\'s work in pairs.',
        'The work — every active member does a substantial weekly apostolic work: visitation, catechism, care of the sick and forgotten.',
        'Auxiliary members — those who cannot do the active work support the Legion by daily prayer.',
      ],
    },
    {
      label: 'Its heart',
      body: ['The Legion prays the Catena — the chain — every day: at its centre is Mary\'s own Magnificat.'],
      scripture: {
        ref: 'Luke 1:46–47 · KJV',
        text: 'My soul doth magnify the Lord, and my spirit hath rejoiced in God my Saviour.',
      },
    },
    {
      label: 'How to join',
      bullets: [
        'Ask at your parish whether a praesidium meets there — most dioceses have several.',
        'Attend three or four meetings as a visitor before deciding.',
        'New members make the Legion promise after a period of probation.',
        'No praesidium nearby? Write to the Legion\'s curia in your diocese about starting one — it takes a priest\'s agreement and a handful of willing members.',
      ],
    },
  ],
  footnote: 'The Legion\'s official handbook and prayers (the Tessera) are available through the Legion of Mary itself — ask at your parish or the diocesan curia.',
};

export const CANON_LAW: GuideContent = {
  title: 'Canon Law',
  subtitle: 'The living law of the Church — what it is, how the Code is arranged, and where to read it for yourself.',
  sections: [
    {
      label: 'What it is',
      body: [
        'Canon law is the Church\'s own legal order: the norms by which she worships, teaches, governs, and cares for souls. The word canon is Greek for "rule" or "measure."',
        'The Latin Church\'s law is gathered in the Code of Canon Law of 1983, promulgated by St. John Paul II, which replaced the first Code of 1917. The Eastern Catholic Churches have their own code, from 1990.',
        'Its final canon states the spirit of the whole: the salvation of souls is the supreme law of the Church.',
      ],
    },
    {
      label: 'The seven books of the Code',
      bullets: [
        'I · General Norms — how laws work: who is bound, how offices are held.',
        'II · The People of God — the faithful, the hierarchy, religious life.',
        'III · The Teaching Office — preaching, catechesis, schools, missions.',
        'IV · The Sanctifying Office — the sacraments and worship.',
        'V · Temporal Goods — church property and its stewardship.',
        'VI · Sanctions — offences and penalties in the Church.',
        'VII · Processes — church courts, marriage cases, appeals.',
      ],
    },
    {
      label: 'Questions Catholics often ask it',
      bullets: [
        'Baptismal sponsors: a godparent must be a confirmed Catholic, sixteen or over, living the faith (canon 874).',
        'Marriage form: Catholics ordinarily marry before a priest or deacon and two witnesses (canon 1108).',
        'Sunday: the faithful are obliged to take part in Mass on Sundays and holy days (canon 1247).',
        'Fasting and abstinence: Ash Wednesday and Good Friday are days of fast and abstinence (canons 1249–1253).',
        'Confession: the faithful are bound to confess grave sins at least once a year (canon 989).',
      ],
    },
    {
      label: 'Read it yourself',
      body: ['The full Code is published freely by the Holy See.'],
      cta: { label: 'Open the Code on vatican.va', icon: 'open-outline', url: 'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_en.html' },
    },
  ],
  footnote: 'This guide teaches; it does not bind. For anything that touches your own situation, speak with your pastor or a canonist.',
};
