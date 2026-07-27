/**
 * The Library's readable collections — Book of the Saints, the Prophets,
 * and Artifacts & Documents. Entries are our own short guides; Scripture
 * is KJV (public domain).
 */
import type { GuideContent } from '@/components/GuidePage';

export interface LibraryEntry {
  id: string;
  title: string;
  meta: string; // shown under the title in lists
  content: GuideContent;
}

export interface LibraryCollection {
  id: string;
  icon: string;
  title: string;
  sub: string;
  intro: string;
  entries: LibraryEntry[];
}

const saint = (
  id: string,
  title: string,
  meta: string,
  subtitle: string,
  paragraphs: string[],
  quote?: { title: string; text: string }
): LibraryEntry => ({
  id,
  title,
  meta,
  content: {
    title,
    subtitle,
    sections: [
      { label: 'The life', body: paragraphs },
      ...(quote ? [{ prayer: quote }] : []),
    ],
  },
});

const prophet = (
  id: string,
  title: string,
  meta: string,
  paragraphs: string[],
  scripture: { ref: string; text: string }
): LibraryEntry => ({
  id,
  title,
  meta,
  content: {
    title,
    subtitle: meta,
    sections: [
      { label: 'The voice', body: paragraphs },
      { label: 'Hear him', scripture },
    ],
  },
});

const artifact = (
  id: string,
  title: string,
  meta: string,
  paragraphs: string[]
): LibraryEntry => ({
  id,
  title,
  meta,
  content: {
    title,
    subtitle: meta,
    sections: [{ label: 'The story', body: paragraphs }],
  },
});

export const COLLECTIONS: LibraryCollection[] = [
  {
    id: 'saints',
    icon: 'people-outline',
    title: 'Book of the Saints',
    sub: 'Life · feast day · patronage',
    intro: 'Friends of God from every age and continent — read their lives, then ask their prayers.',
    entries: [
      saint('augustine', 'St. Augustine of Hippo', 'Feast August 28 · patron of theologians', 'Bishop and Doctor of the Church · 354–430 · North Africa', [
        'A brilliant, restless African who chased pleasure and philosophy across Carthage, Rome, and Milan while his mother Monica wept and prayed for him. In a Milanese garden he heard a child sing "take up and read," opened St. Paul, and was undone.',
        'Baptised at thirty-two, he became bishop of Hippo in present-day Algeria and wrote the Confessions and The City of God — books the Church has never stopped reading.',
      ], { title: 'His cry', text: 'Thou hast made us for Thyself, O Lord, and our heart is restless until it rests in Thee.' }),
      saint('monica', 'St. Monica', 'Feast August 27 · patroness of mothers', 'Mother of Augustine · 331–387 · Thagaste, North Africa', [
        'For seventeen years she prayed, fasted, and followed her wayward son across the sea, told by a bishop that "the child of those tears shall never perish." She lived to see Augustine baptised, and died at Ostia on the way home, asking only to be remembered at the altar of the Lord.',
      ]),
      saint('francis', 'St. Francis of Assisi', 'Feast October 4 · patron of ecology', 'Founder of the Friars Minor · 1181–1226 · Italy', [
        'A merchant\'s son who heard the crucifix of San Damiano say "rebuild My church" — and took it literally, then completely. He married Lady Poverty, preached to birds and sultans alike, and received the wounds of Christ in his own flesh.',
        'His little brotherhood became one of the largest families in the Church, and his Canticle of the Sun still teaches creation to praise.',
      ], { title: 'His prayer', text: 'Most High, glorious God, enlighten the darkness of my heart: give me right faith, certain hope, and perfect charity, sense and knowledge, Lord, that I may carry out Thy holy and true command. Amen.' }),
      saint('bakhita', 'St. Josephine Bakhita', 'Feast February 8 · patroness of Sudan and survivors of slavery', 'From slavery to sanctity · c. 1869–1947 · Sudan and Italy', [
        'Kidnapped as a child in Darfur and sold so many times she forgot her own name — her captors called her Bakhita, "fortunate," in cruel irony that God made true. Brought to Italy, she met Christ, won her freedom before an Italian court, and became a Canossian sister.',
        'For fifty years the gentle African doorkeeper of Schio blessed children and the poor. Asked what she would do if she met her captors, she said she would kneel and kiss their hands, for without them she would not have known Jesus.',
      ]),
      saint('lwanga', 'St. Charles Lwanga & Companions', 'Feast June 3 · patrons of African youth', 'The Uganda Martyrs · died 1886 · Namugongo', [
        'Pages at the court of King Mwanga of Buganda, they refused the king\'s corruptions and would not renounce Christ. Charles, their leader, baptised the youngest of them on the road to execution.',
        'Twenty-two Catholic martyrs — with Anglican companions — were burned at Namugongo, the eldest not yet thirty. Their blood became the seed of one of the most vibrant churches on earth.',
      ]),
      saint('therese', 'St. Thérèse of Lisieux', 'Feast October 1 · patroness of missions', 'Carmelite and Doctor of the Church · 1873–1897 · France', [
        'A French girl who entered Carmel at fifteen and died at twenty-four, unknown — and became one of the most loved saints in history through her Story of a Soul. Her "little way" is simple: small things, done with great love, in total confidence in the Father.',
        'She promised to spend her heaven doing good on earth, and to let fall a shower of roses.',
      ], { title: 'Her way', text: 'My vocation is love. In the heart of the Church, my Mother, I will be love.' }),
      saint('vianney', 'St. John Vianney', 'Feast August 4 · patron of parish priests', 'The Curé of Ars · 1786–1859 · France', [
        'A farm boy who nearly failed his seminary Latin was sent to Ars, a village of two hundred souls, and stayed forty years. He prayed before the tabernacle in the dark hours, fasted, and heard confessions up to sixteen hours a day as all France beat a path to his box.',
        'Asked his secret, he pointed to the tabernacle: "He is there."',
      ]),
      saint('teresa-avila', 'St. Teresa of Ávila', 'Feast October 15 · Doctor of prayer', 'Reformer of Carmel · 1515–1582 · Spain', [
        'A Spanish noblewoman, witty and stubborn, who after years of lukewarm convent life met Christ in earnest and reformed an order on bare feet. Her Interior Castle maps the soul\'s journey to the King who dwells at its centre.',
      ], { title: 'Her bookmark', text: 'Let nothing disturb thee; let nothing dismay thee: all things pass; God never changes. Patience attains all that it strives for. He who has God finds he lacks nothing: God alone suffices.' }),
      saint('pio', 'St. Pio of Pietrelcina', 'Feast September 23 · Padre Pio', 'Capuchin priest and stigmatist · 1887–1968 · Italy', [
        'For fifty years the Capuchin of San Giovanni Rotondo bore the wounds of Christ, heard oceans of confessions, and built a great hospital he called the Home for the Relief of Suffering. Gruff, tender, and utterly given to prayer.',
      ], { title: 'His counsel', text: 'Pray, hope, and don\'t worry. Worry is useless. God is merciful and will hear your prayer.' }),
      saint('anthony', 'St. Anthony of Padua', 'Feast June 13 · patron of lost things', 'Franciscan preacher and Doctor · 1195–1231 · Portugal and Italy', [
        'A Portuguese Augustinian who joined the new Franciscans hoping for martyrdom in Morocco, and instead became the most famous preacher of his age — the "Hammer of Heretics" with the tenderness of the Christ Child in his arms. The whole world asks his help finding what is lost; wiser still to ask his help finding the Lost Sheep\'s Shepherd.',
      ]),
    ],
  },
  {
    id: 'prophets',
    icon: 'megaphone-outline',
    title: 'The Prophets',
    sub: 'The voices that pointed to Christ',
    intro: 'God\'s spokesmen — wild, weeping, fearless — each one a finger pointing to the Messiah.',
    entries: [
      prophet('moses', 'Moses', 'The lawgiver · Exodus–Deuteronomy', [
        'Drawn from the Nile, schooled in Pharaoh\'s house, met by God in burning fire — Moses led the Exodus, received the Law on Sinai, and spoke with God face to face, as a man speaketh unto his friend. He promised a Prophet like himself still to come; the Church answers: Christ.',
      ], { ref: 'Deuteronomy 18:15 · KJV', text: 'The LORD thy God will raise up unto thee a Prophet from the midst of thee, of thy brethren, like unto me; unto him ye shall hearken.' }),
      prophet('samuel', 'Samuel', 'The kingmaker · 1 & 2 Samuel', [
        'Asked of God by weeping Hannah and lent to Him for life, Samuel heard the Lord call his name as a boy in the temple dark. He anointed Israel\'s first kings — Saul, then the shepherd David, from whose line the true King came.',
      ], { ref: '1 Samuel 3:9 · KJV', text: 'Speak, LORD; for thy servant heareth.' }),
      prophet('elijah', 'Elijah', 'The fire-caller · 1 & 2 Kings', [
        'The Tishbite in his mantle of hair stood alone against a king, four hundred prophets of Baal, and a nation limping between two opinions — and fire fell on Carmel. Fed by ravens and by an angel, he heard God not in wind or earthquake but in a still small voice, and was taken up in a chariot of fire.',
      ], { ref: '1 Kings 18:21 · KJV', text: 'How long halt ye between two opinions? if the LORD be God, follow him: but if Baal, then follow him.' }),
      prophet('isaiah', 'Isaiah', 'The evangelist of the Old Testament · Isaiah', [
        'A courtier who saw the Lord high and lifted up, and cried "unclean" until the coal touched his lips. No prophet saw Christ more clearly seven centuries early: born of a virgin, called Wonderful Counsellor, wounded for our transgressions, silent as a lamb.',
      ], { ref: 'Isaiah 53:5 · KJV', text: 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.' }),
      prophet('jeremiah', 'Jeremiah', 'The weeping prophet · Jeremiah & Lamentations', [
        'Called as a boy and forbidden to marry, he preached forty years to a city that would not listen, was thrown in a pit for it, and wept over the ruins he had foretold. Yet it was Jeremiah who promised the New Covenant, written not on stone but on hearts.',
      ], { ref: 'Jeremiah 31:33 · KJV', text: 'I will put my law in their inward parts, and write it in their hearts; and will be their God, and they shall be my people.' }),
      prophet('ezekiel', 'Ezekiel', 'The watchman by the river · Ezekiel', [
        'A priest exiled to Babylon who saw wheels within wheels and the glory of God on the move — proof that the Lord was not chained to a ruined temple. He prophesied to a valley of dry bones and watched an army rise: the God of Israel raises the dead.',
      ], { ref: 'Ezekiel 36:26 · KJV', text: 'A new heart also will I give you, and a new spirit will I put within you: and I will take away the stony heart out of your flesh, and I will give you an heart of flesh.' }),
      prophet('daniel', 'Daniel', 'The faithful exile · Daniel', [
        'A young noble carried to Babylon who would not defile himself at the king\'s table, read the writing on the wall, and prayed with his windows open though it cost him a night with the lions. He saw one like the Son of Man coming with the clouds of heaven — the very title Jesus took for Himself.',
      ], { ref: 'Daniel 7:13 · KJV', text: 'I saw in the night visions, and, behold, one like the Son of man came with the clouds of heaven.' }),
      prophet('hosea', 'Hosea', 'The prophet of wounded love · Hosea', [
        'Commanded to marry a woman who would break his heart, Hosea lived his message: Israel is the faithless bride, and God the husband who will not stop loving. He bought his wife back from the market — as Christ bought us.',
      ], { ref: 'Hosea 6:1 · KJV', text: 'Come, and let us return unto the LORD: for he hath torn, and he will heal us; he hath smitten, and he will bind us up.' }),
      prophet('jonah', 'Jonah', 'The reluctant missionary · Jonah', [
        'The prophet who ran the other way, slept through the storm, and prayed from the belly of the fish. Nineveh repented at his half-hearted sermon — and Jesus gave His own resurrection no other sign but "the sign of the prophet Jonas": three days, and out of the deep alive.',
      ], { ref: 'Jonah 2:9 · KJV', text: 'Salvation is of the LORD.' }),
      prophet('malachi', 'Malachi', 'The last word before the silence · Malachi', [
        'The final voice of the Old Testament, calling weary priests back to pure offering and promising two comings: a messenger to prepare the way, and the Lord Himself suddenly in His temple. Then four hundred years of silence — until a voice cried in the wilderness.',
      ], { ref: 'Malachi 4:2 · KJV', text: 'But unto you that fear my name shall the Sun of righteousness arise with healing in his wings.' }),
    ],
  },
  {
    id: 'artifacts',
    icon: 'ribbon-outline',
    title: 'Artifacts & Documents',
    sub: 'Relics, letters, and sources',
    intro: 'Things you can touch, read, and stand before — the material trail the Word has left through history.',
    entries: [
      artifact('ark', 'The Ark of the Covenant', 'Exodus 25 · the mercy seat', [
        'A chest of shittim wood overlaid with gold, crowned by two cherubim over the mercy seat, holding the tablets of the Law. It went before Israel through Jordan, circled Jericho, and rested at last in Solomon\'s Holy of Holies.',
        'Lost when Babylon burned the temple, it has been sought ever since — while the Church sees its truest fulfilment in Our Lady, the ark who carried the Word made flesh.',
      ]),
      artifact('dss', 'The Dead Sea Scrolls', 'Qumran · discovered 1947', [
        'A Bedouin shepherd tossing a stone into a cave above the Dead Sea heard pottery break — and found the greatest manuscript discovery of the modern age: nearly a thousand scrolls, including every Old Testament book but Esther, copied a thousand years earlier than any Hebrew Bible then known.',
        'The great Isaiah scroll matched the medieval text almost word for word: the Word had been carried across ten centuries essentially unchanged.',
      ]),
      artifact('sinaiticus', 'Codex Sinaiticus', 'c. AD 350 · St. Catherine\'s, Sinai', [
        'A complete Greek Bible copied within living memory of the Council of Nicaea, found at the foot of the mountain of the Law in St. Catherine\'s monastery. With Codex Vaticanus it stands behind the New Testament read today.',
        'Its pages — now shared between London, Leipzig, Sinai, and St. Petersburg — can be read online by anyone, freely.',
      ]),
      artifact('didache', 'The Didache', 'The Teaching of the Twelve Apostles · 1st century', [
        'A church manual so old it may predate some of the New Testament: two ways set before every soul, life and death; instructions for baptism in living water; the Our Father three times a day; the Eucharist of the broken bread gathered from the hills into one.',
        'Lost for centuries, found again in Constantinople in 1873 — the young Church\'s own voice, startlingly familiar.',
      ]),
      artifact('shroud', 'The Shroud of Turin', 'The burial cloth · Turin, Italy', [
        'A fourteen-foot linen bearing the faint front-and-back image of a scourged, crucified man, wounded at wrists, feet, side, and brow. Photographed in 1898, it revealed itself a photographic negative — and has been studied more intensely than any cloth in history.',
        'The Church proposes it for veneration without ruling on its authenticity: an icon of the Passion, whatever science finally says, before which pilgrims meet the Crucified.',
      ]),
      artifact('guadalupe', 'The Tilma of Guadalupe', '1531 · Mexico City', [
        'On Juan Diego\'s cactus-fibre cloak — a fabric that should have crumbled in twenty years — the image of Our Lady as a young mestiza mother, left when Castilian roses spilled out before the bishop in December 1531.',
        'Within a decade, millions of Mexico\'s peoples asked for baptism. The tilma hangs in her basilica still, the most visited Marian shrine on earth.',
      ]),
      artifact('kells', 'The Book of Kells', 'c. AD 800 · Dublin', [
        'The four Gospels copied and illuminated by Irish monks with such intricacy that a single initial can hold a meadow of interlaced angels, beasts, and vines. Giraldus called it "the work of an angel, not of a man."',
        'It survived Viking raids that took its golden cover and lives today in Trinity College Dublin — the Word made radiant by candlelit patience.',
      ]),
      artifact('gutenberg', 'The Gutenberg Bible', 'c. 1455 · Mainz', [
        'The first great book printed with movable type in the West: the Latin Vulgate in some 180 copies, each page set by hand in metal letters. Within a lifetime, presses across Europe were putting the Scriptures within reach of ordinary hands — the beginning of the road this very app walks.',
      ]),
    ],
  },
];

export function findCollection(id: string): LibraryCollection | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}

export function findEntry(cid: string, eid: string): LibraryEntry | undefined {
  return findCollection(cid)?.entries.find((e) => e.id === eid);
}

/** Trusted sources of complete, legal, free spiritual books. */
export const FREE_BOOK_SOURCES = [
  {
    title: 'Christian Classics Ethereal Library',
    sub: 'The great spiritual classics, formatted and free',
    url: 'https://ccel.org',
  },
  {
    title: 'Project Gutenberg',
    sub: 'Over 70,000 public-domain books — search any classic',
    url: 'https://www.gutenberg.org',
  },
  {
    title: 'Internet Archive',
    sub: 'Scanned originals — old catechisms, missals, lives of the saints',
    url: 'https://archive.org',
  },
  {
    title: 'Wikisource',
    sub: 'Transcribed source texts, including Church documents',
    url: 'https://en.wikisource.org',
  },
  {
    title: 'The Holy See — vatican.va',
    sub: 'The Catechism, the Code of Canon Law, encyclicals — the originals',
    url: 'https://www.vatican.va',
  },
];
