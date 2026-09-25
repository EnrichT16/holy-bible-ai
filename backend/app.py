"""
Holy Bible · AI Assisted — backend.

A thin, secure proxy in front of the Claude API. The mobile app never holds
the Anthropic key; it calls this service, which adds the key server-side and
asks Claude to explain or answer questions about a passage.

Run locally:
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY=sk-ant-...
    uvicorn app:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional
from collections import deque
from time import time
import os
import re
import httpx
import jwt  # PyJWT — signs the short-lived voice-room tokens

app = FastAPI(title="Holy Bible · AI Assisted — Backend", version="0.2.0")

# Origins allowed to call this API: the public web preview and local dev.
# Native apps send no Origin header, so they are unaffected by CORS.
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "HOLYBIBLE_ALLOWED_ORIGINS",
        "https://enricht16.github.io,http://localhost:8081,http://localhost:19006",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
# Sonnet gives warm, careful reflections at a sensible cost. Override via env.
MODEL = os.environ.get("HOLYBIBLE_MODEL", "claude-sonnet-5")
MAX_TOKENS = int(os.environ.get("HOLYBIBLE_MAX_TOKENS", "600"))

# ── Voice calls (Phase 3 · Slice 2) ──────────────────────────────────
# The app's Prayer Circle calls travel over LiveKit. This service holds
# the LiveKit API secret and mints short-lived room tokens; the app
# never sees the secret, only a token for one room, for one person, for
# a couple of hours. Until the three LIVEKIT_* variables are set on the
# server, the endpoint answers 503 and the app says calls are not yet
# awake — nothing else breaks.
LIVEKIT_URL = os.environ.get("LIVEKIT_URL", "")
LIVEKIT_API_KEY = os.environ.get("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET", "")

# Who is asking is proven by their Supabase session token, verified
# against Supabase Auth. Both of these values are public by design (the
# same pair ships inside the app); authority lives in the user's token.
SUPABASE_URL = os.environ.get(
    "HOLYBIBLE_SUPABASE_URL", "https://wrhwaghauinxtytyyrgm.supabase.co"
)
SUPABASE_ANON_KEY = os.environ.get(
    "HOLYBIBLE_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaHdhZ2hhdWlueHR5dHl5cmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjU4NzUsImV4cCI6MjEwMDc0MTg3NX0.gqj36CZkpORrcGnQjlYP3mkN2uZaeUz0eSRAonWXBbY",
)

SYSTEM_PROMPT = (
    "You are a warm, faithful study companion inside a Christian Bible app. "
    "You help readers understand Scripture with reverence, clarity, and humility. "
    "Draw on the historic Christian tradition and the plain sense of the text. "
    "Be concise (a few short paragraphs), pastoral, and encouraging. "
    "When a question touches contested doctrine between traditions, note the main "
    "views charitably rather than insisting on one. Never invent chapter-and-verse "
    "citations. You are an aid to study and prayer, not a replacement for Scripture, "
    "the Church, or a person's pastor."
)


# ── Gentle abuse guard ────────────────────────────────────────────────
# The endpoint spends real Anthropic credit, so each IP gets a fixed
# number of reflections per hour. In-memory is fine for one instance.
RATE_LIMIT_PER_HOUR = int(os.environ.get("HOLYBIBLE_RATE_LIMIT", "20"))
# Voice tokens are cheap to mint, so their bucket is roomier — enough
# for a family's evening of calls, still a wall against a script.
VOICE_RATE_LIMIT_PER_HOUR = int(os.environ.get("HOLYBIBLE_VOICE_RATE_LIMIT", "60"))
_hits: dict[str, deque] = {}
_voice_hits: dict[str, deque] = {}


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _within_rate_limit(ip: str, hits: dict[str, deque], limit: int) -> bool:
    now = time()
    if len(hits) > 10000:  # shed empty buckets under unusual load
        for k in [k for k, v in hits.items() if not v]:
            hits.pop(k, None)
    dq = hits.setdefault(ip, deque())
    while dq and now - dq[0] > 3600:
        dq.popleft()
    if len(dq) >= limit:
        return False
    dq.append(now)
    return True


class ExplainRequest(BaseModel):
    mode: Literal["explain", "ask"]
    reference: str
    passage: str
    question: Optional[str] = None


class ExplainResponse(BaseModel):
    answer: str
    reference: str
    model: str


@app.get("/api/health")
def health():
    return {
        "status": "online",
        "service": "holy-bible-backend",
        "model": MODEL,
        "claude_configured": bool(ANTHROPIC_API_KEY),
        "voice_configured": bool(LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET),
    }


@app.post("/api/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest, request: Request):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI guide not configured on the server.")
    if not _within_rate_limit(_client_ip(request), _hits, RATE_LIMIT_PER_HOUR):
        raise HTTPException(
            status_code=429,
            detail="The guide needs a moment of rest — please try again in a little while.",
        )

    passage = req.passage.strip()[:6000]
    if req.mode == "ask":
        if not req.question or not req.question.strip():
            raise HTTPException(status_code=400, detail="A question is required in 'ask' mode.")
        user_msg = (
            f"Passage — {req.reference} (KJV):\n\n{passage}\n\n"
            f"A reader asks: {req.question.strip()}\n\n"
            "Answer their question in light of this passage and the wider witness of Scripture."
        )
    else:
        user_msg = (
            f"Passage — {req.reference} (KJV):\n\n{passage}\n\n"
            "Explain what this passage means: its context, its heart, and how a believer "
            "might carry it into daily life."
        )

    payload = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_msg}],
    }
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.post(ANTHROPIC_URL, json=payload, headers=headers)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Could not reach the AI guide: {e}")

    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"AI guide error ({r.status_code}).")

    data = r.json()
    parts = [b.get("text", "") for b in data.get("content", []) if b.get("type") == "text"]
    answer = "\n".join(parts).strip() or "No reflection was returned. Please try again."

    return ExplainResponse(answer=answer, reference=req.reference, model=MODEL)


# ── Voice-room tokens ─────────────────────────────────────────────────

class CallTokenRequest(BaseModel):
    # The call's uuid, which doubles as the LiveKit room name. Room ids
    # are minted by the database and shared only with the call's own
    # participants (Row Level Security keeps them there), so holding a
    # valid room id is itself the proof of an invitation.
    room: str
    display_name: Optional[str] = None


class CallTokenResponse(BaseModel):
    token: str
    url: str


_ROOM_SHAPE = re.compile(r"^[0-9a-fA-F-]{16,64}$")


@app.post("/api/call-token", response_model=CallTokenResponse)
async def call_token(req: CallTokenRequest, request: Request):
    if not (LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET):
        raise HTTPException(
            status_code=503,
            detail="The calling service is not configured on the server yet.",
        )
    if not _within_rate_limit(_client_ip(request), _voice_hits, VOICE_RATE_LIMIT_PER_HOUR):
        raise HTTPException(
            status_code=429,
            detail="Too many calls just now — please try again in a little while.",
        )

    room = req.room.strip()
    if not _ROOM_SHAPE.match(room):
        raise HTTPException(status_code=400, detail="That is not a call id.")

    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Please sign in first.")
    supabase_token = auth_header[7:].strip()

    # Ask Supabase who this token belongs to; a stale or forged token is
    # turned away here, before any room token exists.
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {supabase_token}",
                },
            )
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Could not verify the sign-in just now.")
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Please sign in again.")

    user = r.json()
    identity = str(user.get("id", "")).strip()
    if not identity:
        raise HTTPException(status_code=401, detail="Please sign in again.")

    name = (req.display_name or "").strip()[:60] or "A friend in Christ"
    now = int(time())
    claims = {
        "iss": LIVEKIT_API_KEY,
        "sub": identity,
        "jti": identity,
        "nbf": now - 10,
        "exp": now + 2 * 3600,
        "name": name,
        "video": {
            "room": room,
            "roomJoin": True,
            "canPublish": True,
            "canSubscribe": True,
            "canPublishData": True,
        },
    }
    token = jwt.encode(claims, LIVEKIT_API_SECRET, algorithm="HS256")
    return CallTokenResponse(token=token, url=LIVEKIT_URL)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
