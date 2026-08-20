# Holy Bible — AI Assisted · Project Roadmap
### From blueprint to a launched app

This is the whole journey in one place. Work through the phases in order. You don't
need everything at once — each phase gives you something real.

---

## ✔ Phase 0 — Design (COMPLETE)
A full blueprint of every screen, in the Lumen style: the four home themes, the Bible
reader and book picker, Speak the Word, the guided Rosary, the full For Catholics
section, the Library, Churches, Give, Pray with Friends and calling, Settings,
onboarding, reminders, and mentorship.

---

## ✔ Phase 1 — Build the MVP  *(with Claude Code)*  (COMPLETE)
Build a lean, real, shippable first version — see **BUILD-BRIEF.md**:
1. App shell (5-tab navigation) + Lumen theme
2. Bible reader (KJV to start) + book picker
3. Speak the Word — read-aloud + "Explain / Ask" (Claude API)
4. Guided Rosary (opening + first decade)
5. Give (links to a hosted donation page)

**Milestone:** an app you can hold in your hand and pray with.

---

## ✔ Phase 2 — The devotion & community features  (COMPLETE)
- [x] The **full For Catholics** section — The Day, Divine Mercy (+ guided Chaplet),
  Block Rosary, Legion of Mary, Our Lady, Canon Law
- [x] The **complete guided Rosary** — all five decades + closing prayers
- [x] The **Library collections** — Book of the Saints, The Prophets, Artifacts &
  Documents, *Find free books*; *Submit your book* prepared (uploads await cloud storage)
- [x] **Churches** — founding directory shell + *List your church* form (vetting
  backend still to come)
- [x] **Reminders** — daily prayer notifications on the phone (the incoming-call ring
  arrives in Phase 3) · **Settings** — version, text size, theme, persisted · first-open **onboarding**
- [x] **Mentorship** — the Life in the Spirit Seminar (7 sessions) with the AI guide
- [x] **Backend:** Supabase wired — church listing submissions, the live verified
  directory, the book review queue. *Accounts arrived with Phase 3 Slice 1; book file
  uploads still await cloud storage*

**Milestone:** the full spiritual app, minus live calling.

---

## Phase 3 — Pray with Friends (calling) + the subscription  ← **IN PROGRESS**

Built in slices, because calling needs someone to call before it needs a microphone.

### ✔ Slice 1 — accounts and the Prayer Circle  (COMPLETE)
- [x] **Accounts** — email and password through Supabase Auth, remembered on the device
  and quietly renewed. Never required to read Scripture or to pray; it is only the door
  to the circle
- [x] **The prayer ID** — every account carries a shareable handle (`HB-4KQ7-9TXM`),
  minted on sign-up, with the ambiguous letters left out so it survives being read aloud
- [x] **The Prayer Circle** — invite by prayer ID, accept or decline, leave; two people
  who invite each other simply join
- [x] **Shared intentions** — name what you would have your circle pray for, and mark
  the quiet *I prayed for this*; the author may mark one answered
- [x] **The privacy that has to hold** — Row Level Security throughout: nobody can browse
  the membership of the app, a stranger is reachable only by the exact prayer ID they gave
  you, and intentions never leave the circle

### Slice 2 — the calls  ← **NEXT**
- In-app voice calls (WebRTC), QR invites, one-to-one and groups of four,
  *read the Word together*, real ringing + missed calls
- Free tier on self-hosted open-source calling (LiveKit / Jitsi); paid **unlimited**
  tier via a provider (Twilio / Agora), funded by the subscription

### Slice 3 — the subscription
- 15 minutes free → unlimited, through Apple / Google in-app purchase, priced cost-plus
  with the store's cut folded in

**Milestone:** believers calling each other to pray, inside your app.

---

## Phase 4 — The business foundation  *(before you collect money or publish)*
1. **Register the entity** at Companies House (charity or company)
2. **Open a bank account** in its name
3. **Donation platform** — Stripe / Donorbox / PayPal / GoCardless; if a charity, enrol
   for **Gift Aid** (HMRC)
4. **Developer accounts** — Apple (~$99/yr), Google (~$25 once)
5. Keep **subscription money separate from donations** (only donations are
   Gift-Aid-eligible). Have a professional confirm VAT and charity-trading rules.

---

## Phase 5 — Launch
- **Privacy policy + terms** — you'll hold data (names, email, contacts, chat), so
  honour UK GDPR
- **App store listings** — real screenshots, a clear description, the caption
  *"Every version of the Word, in one place"*
- **Submit** to the Apple App Store and Google Play (expect a review period)
- **Reverent outreach** to ministries inviting them to be listed
- **Companion website**

---

## Ongoing — tend the garden
- **Moderation** — keep uploads, church listings, and chat safe and fitting
- **Costs to watch** — AI usage, calling bandwidth, cloud storage, hosting
- **Grow gently** — let donations and subscriptions sustain the mission, never a paywall on the Word

---

## The whole path in one line
**Design ✔ → build the MVP → add the devotion & community features → add calling +
subscription → register the entity + payments → launch → tend and grow.**
