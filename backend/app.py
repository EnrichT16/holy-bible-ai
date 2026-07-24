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
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional
import os
import httpx

app = FastAPI(title="Holy Bible · AI Assisted — Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your app's origin before launch
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
# Sonnet gives warm, careful reflections at a sensible cost. Override via env.
MODEL = os.environ.get("HOLYBIBLE_MODEL", "claude-sonnet-5")
MAX_TOKENS = int(os.environ.get("HOLYBIBLE_MAX_TOKENS", "600"))

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
    }


@app.post("/api/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI guide not configured on the server.")

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


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
