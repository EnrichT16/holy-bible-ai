# Deploying the AI guide backend (DigitalOcean App Platform)

The backend is a small FastAPI service that keeps the Anthropic key
server-side and answers the app's Explain / Ask requests. Cost on the
smallest instance is about **$5/month**.

## Steps (about 10 minutes)

1. **Get an Anthropic API key** (if you don't have one yet):
   console.anthropic.com → sign in → **API Keys** → Create key. Add a
   little credit under Billing (a few pounds goes far — each reflection
   is a fraction of a penny on Sonnet).

2. In DigitalOcean: **Create → App Platform**.

3. **Source:** choose GitHub, authorize if asked, pick the
   `EnrichT16/holy-bible-ai` repository, branch `main`.
   - Set **Source Directory** to `backend/`. DigitalOcean will detect a
     Python app.

4. **Resources:** one Web Service is enough — pick the smallest size
   (Basic, 512 MB / 1 vCPU). Delete any extra resources it guesses at.

5. **Environment variables** (App-level or on the service):
   | Key | Value | Notes |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | `sk-ant-…` | tick **Encrypt** |
   | `HOLYBIBLE_MODEL` | `claude-sonnet-5` | optional (default) |
   | `HOLYBIBLE_RATE_LIMIT` | `20` | reflections per hour per visitor |

6. **Run command** (if it asks): `uvicorn app:app --host 0.0.0.0 --port $PORT`

7. Create the app and wait for the build. When it's live you get a URL like
   `https://holy-bible-backend-abc12.ondigitalocean.app`.

8. **Check it:** open `<your-url>/api/health` — you should see
   `"status": "online"` and `"claude_configured": true`.

9. **Point the app at it:** in `mobile/app.json`, set
   `extra.backendUrl` to your URL (no trailing slash), rebuild the web
   export, and redeploy — or hand the URL to Claude Code and it will do
   this step.

## Waking the voice calls (Phase 3 · Slice 2)

The Prayer Circle's voice calls travel over **LiveKit Cloud**, which has
a free tier that comfortably covers a small community. Until these three
variables are set, the app simply says calls are not yet awake — nothing
else is affected.

1. Create a free account at **cloud.livekit.io** and make a project
   (call it anything — "Holy Bible" is fine).
2. In the LiveKit project: **Settings → Keys → Create key**. It shows a
   websocket URL (`wss://…livekit.cloud`), an API key, and an API
   secret.
3. In DigitalOcean, on the backend service, add three environment
   variables and redeploy:
   | Key | Value | Notes |
   |---|---|---|
   | `LIVEKIT_URL` | `wss://…livekit.cloud` | the project's URL |
   | `LIVEKIT_API_KEY` | `API…` | |
   | `LIVEKIT_API_SECRET` | `…` | tick **Encrypt** |
4. **Check it:** `<your-url>/api/health` should now say
   `"voice_configured": true` — and calls ring from the app at once,
   with no new deploy of the app itself.

The API secret never leaves the server: the app asks this service for a
short-lived room token (proving who it is with its Supabase sign-in),
and that token opens exactly one room for a couple of hours.

## Notes

- CORS is locked to `https://enricht16.github.io` and local dev by
  default; set `HOLYBIBLE_ALLOWED_ORIGINS` (comma-separated) when the
  app gets its own domain.
- The per-IP rate limit protects your Anthropic credit from abuse.
- `.do/app.yaml` in the repo root mirrors this configuration.
