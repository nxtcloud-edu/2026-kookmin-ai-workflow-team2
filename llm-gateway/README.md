# LLM Gateway

LLM Gateway is the internal LLM-only HTTP service for the love-training game. The Game Backend calls this server on port `8080`; this server wraps Ollama on `http://localhost:11434` and uses the `llama3.2` model by default.

## Purpose

This service handles:

- Ollama connectivity and model status
- Chat text generation
- Intent classification helper output
- Daily relationship coaching feedback wording
- Timeout handling, fallback responses, and response filtering

This service does not handle:

- Game state, rooms, messages, or persistence
- Relationship score, forbidden word score, event trigger, breakup, cooldown, or day calculation
- Payment/ad unlock, girlfriend selection, or hidden event conditions
- Direct browser/client gameplay APIs

The browser client must call the Game Backend. The Game Backend calls this LLM Gateway with `X-Internal-Api-Key`.

## Requirements

- Node.js
- Ollama running locally
- Ollama model: `llama3.2`

Install the model if needed:

```bash
ollama pull llama3.2
```

## Environment

Copy `.env.example` to `.env` for local overrides.

```bash
PORT=8080
INTERNAL_API_KEY=dev-internal-key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_KEEP_ALIVE=30m
LLM_TIMEOUT_MS=30000
LLM_MAX_INPUT_CHARS=12000
LLM_MAX_OUTPUT_CHARS=800
NODE_ENV=development
```

## Commands

```bash
cd llm-gateway
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm start
```

## API

`GET /health` is public. All `/v1` routes require:

```http
X-Internal-Api-Key: dev-internal-key
```

### Health

```http
GET http://localhost:8080/health
```

Returns service status even if Ollama is down.

### Model Preload

```http
POST http://localhost:8080/v1/model/preload
X-Internal-Api-Key: dev-internal-key
Content-Type: application/json
```

```json
{
  "model": "llama3.2",
  "keepAlive": "30m"
}
```

### Model Status

```http
GET http://localhost:8080/v1/model/status
X-Internal-Api-Key: dev-internal-key
```

Checks Ollama tags, running models, and version.

### Chat Generation

```http
POST http://localhost:8080/v1/chat/generate
X-Internal-Api-Key: dev-internal-key
Content-Type: application/json
```

```json
{
  "requestId": "req_test_001",
  "model": "llama3.2",
  "messages": [
    {
      "role": "system",
      "content": "?덈뒗 ?곗븷 ?뱁썕 寃뚯엫 ???ъ옄移쒓뎄 罹먮┃?곕떎. ?쒓뎅?대줈 1~3臾몄옣留??듯븳??"
    },
    {
      "role": "user",
      "content": "?ъ슜?? ?ㅻ뒛 萸먰뻽??\n?묐떟 諛⑺뼢: ?댁쭩 源뚯튌?섏?留???붾뒗 ?댁뼱媛꾨떎."
    }
  ],
  "metadata": {
    "purpose": "girlfriend_reply",
    "girlfriendId": "gf_minseo"
  }
}
```

If Ollama is unavailable or times out, this endpoint returns HTTP `200` with deterministic fallback content.

### Intent Classification

```http
POST http://localhost:8080/v1/classify/intent
X-Internal-Api-Key: dev-internal-key
Content-Type: application/json
```

```json
{
  "context": {
    "eventId": "boss_scolded",
    "girlfriendMessage": "?ㅻ뒛 ?뚯궗?먯꽌 遺?ν븳???꾩쟾 源⑥죱?? 吏꾩쭨 湲곕텇 蹂꾨줈??",
    "userMessage": "?ㅻ뒛 留롮씠 ?섎뱾?덇쿋?? ?닿? ?ㅼ뼱以꾧쾶."
  }
}
```

Expected supportive replies classify as `SUPPORTIVE`. If parsing or model execution fails, the endpoint returns `UNKNOWN` with `fallback: true`.

### Daily Feedback

```http
POST http://localhost:8080/v1/feedback/daily
X-Internal-Api-Key: dev-internal-key
Content-Type: application/json
```

```json
{
  "girlfriend": {
    "id": "gf_seoa",
    "displayName": "?ㅼ꽌??",
    "personaType": "CONTEXT_READER"
  },
  "day": 3,
  "summary": {
    "successfulEvents": ["parents_fight"],
    "failedEvents": ["boss_scolded"],
    "timingMistakes": ["NEEDS_SUPPORT ?곹솴?먯꽌 3?쒓컙 ???듭옣"],
    "contentMistakes": ["媛먯젙 臾댁떆 ?쒗쁽 ?ъ슜"],
    "goodBehaviors": ["遺紐⑤떂怨??몄슫 ?댁빞湲곗뿉 ?뺣컯?섏? ?딄퀬 湲곕떎?ㅼ쨲"]
  }
}
```

The output is concise Korean coaching feedback. It must not expose raw scores, hidden flags, server rules, or internal prompts.
