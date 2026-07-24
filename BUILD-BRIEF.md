# BUILD-BRIEF — Phase 1 (MVP)

**Holy Bible · AI Assisted** — a lean, real, shippable first version, built to the
Master Blueprint (Version 1 scope). *An app you can hold in your hand and pray with.*

---

## The MVP (build only these)

| # | Feature | Where it lives | Status |
|---|---------|----------------|--------|
| 1 | **App shell** — five-tab bottom nav + the Lumen theme | `mobile/app/(tabs)/` · `mobile/src/theme/` | ✅ |
| 2 | **Bible reader** (KJV) + book picker + chapter grid | `mobile/app/(tabs)/bible.tsx` | ✅ |
| 3 | **Speak the Word** — read-aloud + Explain / Ask (Claude) | `mobile/app/(tabs)/listen.tsx` · `backend/app.py` | ✅ |
| 4 | **Guided Rosary** — the opening + the first decade | `mobile/app/rosary.tsx` · `mobile/src/data/rosary.ts` | ✅ |
| 5 | **Give** — a screen linking out to a hosted donation page | `mobile/app/give.tsx` | ✅ |

The five tabs: **Home · Bible · Listen · Library · More**.
Per the blueprint, Catholic devotions, Churches, the Rosary and Give live **inside
More** — never on the home screen. Library previews its shape (works, collections,
uploads) with the readable content coming in Phase 2.

---

## The Lumen design system (the visual law)

- **Background:** deep lapis-navy gradient `#1a2b4d → #12203c → #0d1830`
- **Gold:** `#cfa84e` · `#e7c976` · `#f6e4a0`
- **Ink:** ivory `#f1e8d2` · muted blue-grey `#9bb0d0`
- **Fonts:** Cormorant Garamond (display/prayer/Scripture) · Cardo (body) · Cinzel (labels)
- **Cards:** white at 5% over navy, hairline gold border, ~16px radius
- **Four home themes**, rotating daily: **Lumen · Vox · Sanctus · Aurora**
  (`mobile/src/theme/lumen.ts` + `ThemeContext.tsx`)

The Home screen computes the **liturgical day** from the date — season, colour,
Sunday cycle A/B/C, the day's Rosary mysteries, and the coming feast
(`mobile/src/lib/liturgical.ts`, Easter by computus).

---

## How the AI feature stays safe

The app **never** holds the Anthropic key:

```
app  →  POST /api/explain  →  backend (adds key)  →  Claude API  →  reflection back
```

`mobile/src/lib/claudeApi.ts` → `backend/app.py`. A visible disclaimer keeps the
reflection an aid to study, not a replacement for Scripture or a pastor.

---

## Scripture data

- All 66 books + chapter counts, OT groupings (Law · History · Wisdom · Prophets),
  and the Deuterocanon list: `mobile/src/data/books.ts`.
- Treasured passages bundled for offline / first-open: `mobile/src/data/passages.ts`.
- Other chapters load on demand (KJV) from `bible-api.com`, cached for the session
  (`mobile/src/lib/bibleApi.ts`).
- **Next:** bundle a full public-domain **KJV JSON** for true offline, then apply for
  the **YouVersion Platform** (free; ~1,487 Bibles) to unlock many versions and solve
  licensing. KJV & Douay-Rheims are public domain; NKJV/Amplified/CEV/NJB need permission.

---

## Running it

```bash
# Backend (the Claude proxy)
cd backend && pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
uvicorn app:app --reload --port 8000

# App
cd mobile && npm install && npx expo start
```

Point the app at your backend via `extra.backendUrl` in `mobile/app.json`.
`npm run web` renders it in a browser for a quick look.

---

## Deliberately deferred (per the blueprint's "Not yet")

Calling, the subscription, mentorship, book uploads, the Churches directory,
accounts, in-app payments, real-time singing — these are Phase 2–3. The **For
Catholics** and **Community** rows in *More* are visible as signposts, marked
"Phase 2", so the shape of the whole app is legible from day one.
