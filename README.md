# Holy Bible — AI Assisted

*Every version of the Word, in one place.*

A reverent, offline-first Bible and prayer app. Six public-domain translations,
a guided Rosary, read-aloud, and an AI study companion — free forever, never a
paywall on Scripture.

**Publisher:** [Organisation TBC] — to be published under a registered charity/company.

> **Roadmap:** [`ROADMAP.md`](./ROADMAP.md) · **Phase 1 spec:** [`BUILD-BRIEF.md`](./BUILD-BRIEF.md)
>
> Currently in **Phase 3 · Slice 1 — accounts and the Prayer Circle**.

---

## What's inside

Five tabs — **Home · Bible · Listen · Library · More** — in the Lumen design system
(deep lapis-navy & gold; Cormorant Garamond / Cardo / Cinzel), with four home themes
(Lumen · Vox · Sanctus · Aurora) that rotate daily.

- **Home** — greeting, the liturgical day (season, colour, cycle, mysteries, coming feast), verse of the day
- **Bible** — a reader with drop-caps, a three-tab book picker (OT grouped · NT · Deuterocanon), and adjustable text size
- **Listen** — read any passage aloud, then *Explain* it or *Ask* a question (Claude)
- **Library** — readable collections (**Book of the Saints · The Prophets · Artifacts & Documents**), the starter shelf, *Find free books*, and *Submit your book*
- **More** — the hub, now fully alive:
  - **Pray** — the complete guided **Rosary** (all five decades) and the **Divine Mercy Chaplet**, illuminated bead by bead
  - **For Catholics** — The Day · Divine Mercy · Block Rosary · Legion of Mary · Our Lady · Canon Law
  - **Community** — Churches (founding directory + listing form), the **Prayer Circle**, prayer **Reminders**, **Mentorship** (the Life in the Spirit Seminar, with the AI guide)
  - **Settings** — default version, Scripture text size, home theme, all remembered on the device
  - **Your account** — a prayer ID to share, and the circle it opens

## The Prayer Circle (Phase 3 · Slice 1)

*"Where two or three are gathered together in my name, there am I in the midst of them."*

An account is **never** needed to read Scripture or to pray. It exists for one thing: so
the friends you pray with can find you.

- **Your prayer ID** — a shareable handle like `HB-4KQ7-9TXM`, minted when you sign up.
  The ambiguous letters (I, L, O, 0, 1) are left out, so it survives being read down a
  telephone or written on paper.
- **Your circle** — invite by prayer ID, accept or decline, leave at any time. If two
  people invite each other, their circles simply join.
- **Shared intentions** — name what you would have your circle pray for. Others mark the
  quiet *I prayed for this*; you may mark yours answered.
- **What holds it together** — Row Level Security in the database, not trust in the app:
  nobody can browse the membership, a stranger is reachable only by the exact prayer ID
  they handed you, and an intention never leaves the circle it was shared with. The
  two-sided moves (inviting, accepting, leaving) run as database functions that check the
  caller themselves.

The voice calls — ringing, one-to-one and groups of four, reading the Word together —
join the circle in Slice 2.

## Fully offline Scripture — six public-domain versions

Bundled in `mobile/public/bibles/` and switched in the version selector — **works with
no internet at all**:

| Version | Notes |
|---------|-------|
| **KJV** — King James Version | 66 books |
| **WEB** — World English Bible | modern English · **includes the Deuterocanon** |
| **ASV** — American Standard Version | 66 books |
| **YLT** — Young's Literal Translation | literal |
| **DRA** — Douay-Rheims (Challoner) | traditional Catholic |
| **DBY** — Darby Translation | 66 books |

The **Deuterocanon tab** reads from the WEB (with Apocrypha). Copyrighted versions
(NIV, ESV, NKJV, NLT, Amplified…) are **not** bundled — those come later via the
YouVersion Platform, with permission. Regenerate the data with `scripts/build_bibles.py`.

---

## Project layout

```
mobile/            React Native + Expo app (iOS · Android · web)
  app/(tabs)/      the five tabs
  app/circle.tsx   the Prayer Circle · app/account.tsx  accounts
  src/theme/       the Lumen design tokens + four home themes
  src/data/        66-book metadata, offline bible loader, Rosary prayers
  src/lib/         bible loading, Claude client, liturgical calendar,
                   Supabase transport, auth, the circle
  src/state/       version, settings and account contexts
backend/           FastAPI Claude proxy — keeps the API key server-side
supabase/          schema.sql — tables, RLS policies and functions
```

### The database

Run `supabase/schema.sql` once in the Supabase dashboard (SQL Editor → New query → paste
→ Run). It is idempotent, so re-running it after an update is safe. Point the app at the
project with `extra.supabaseUrl` and `extra.supabaseAnonKey` in `mobile/app.json`.

## Run it locally

```bash
# Backend (the AI guide)
cd backend
pip install -r requirements.txt
cp .env.example .env          # then paste your Anthropic key into ANTHROPIC_API_KEY
uvicorn app:app --reload --port 8000

# App
cd mobile
npm install
npx expo start                # scan the QR with Expo Go
```

Point the app at your backend via `extra.backendUrl` in `mobile/app.json`.

## Security

- The Anthropic API key lives **only** on the backend (`backend/.env`, git-ignored) — never in the app.
- `.env` is git-ignored; only `.env.example` (placeholders) is committed.
- The app carries only Supabase's public anon key. What anyone can do with it is decided
  by Row Level Security in the database, never by the app: submissions can be written but
  never read back, only verified church listings are public, and everything belonging to
  an account is reachable solely with that account's own token.

---

*Powered by Claude. To be published on the Apple App Store, Google Play, and the web.*
