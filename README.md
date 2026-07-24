# Holy Bible — AI Assisted

*Every version of the Word, in one place.*

A reverent, offline-first Bible and prayer app. Six public-domain translations,
a guided Rosary, read-aloud, and an AI study companion — free forever, never a
paywall on Scripture.

**Publisher:** [Organisation TBC] — to be published under a registered charity/company.

> **Roadmap:** [`ROADMAP.md`](./ROADMAP.md) · **Phase 1 spec:** [`BUILD-BRIEF.md`](./BUILD-BRIEF.md)

---

## What's inside

Five tabs — **Home · Bible · Listen · Library · More** — in the Lumen design system
(deep lapis-navy & gold; Cormorant Garamond / Cardo / Cinzel), with four home themes
(Lumen · Vox · Sanctus · Aurora) that rotate daily.

- **Home** — greeting, the liturgical day (season, colour, cycle, mysteries, coming feast), verse of the day
- **Bible** — a reader with drop-caps and a three-tab book picker (OT grouped · NT · Deuterocanon)
- **Listen** — read any passage aloud, then *Explain* it or *Ask* a question (Claude)
- **Library** — featured works, collections, the starter shelf (readable content in Phase 2)
- **More** — the hub: the guided **Rosary** and **Give** are live; For Catholics, Churches, Reminders, Mentorship preview Phase 2

## Fully offline Scripture — six public-domain versions

Bundled in `mobile/assets/bibles/` and switched in the version selector — **works with
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
  src/theme/       the Lumen design tokens + four home themes
  src/data/        66-book metadata, offline bible loader, Rosary prayers
  src/lib/         bible loading, Claude client, liturgical calendar
backend/           FastAPI Claude proxy — keeps the API key server-side
```

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

---

*Powered by Claude. To be published on the Apple App Store, Google Play, and the web.*
