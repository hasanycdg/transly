# AI Translation Platform API (WordPress Integration)

Production-ready backend scaffold for a SaaS translation API that accepts structured WordPress payloads and returns translated JSON in the same shape.

## What This Backend Provides

- Fastify + TypeScript REST API
- API key authentication (`x-api-key` or `Authorization: Bearer ...`)
- Strict request validation with Zod
- Translation provider abstraction (swappable providers)
- Structure-preserving translation for nested objects/arrays
- Skip rules for IDs, URL/file refs, slugs (unless enabled), and relationship fields
- PostgreSQL persistence with Prisma
- Health, single translate, bulk translate, and job status endpoints
- Rate limiting, centralized error handling, request logging, payload size limits
- Queue-ready architecture scaffold for async processing

## Endpoints

- `GET /api/health`
- `POST /api/translate`
- `POST /api/translate/bulk`
- `GET /api/job/:id`

## Folder Structure

```txt
backend/
  prisma/
    schema.prisma
  examples/
    translate.request.json
    translate.response.json
    translate-bulk.request.json
    translate-bulk.response.json
  src/
    app.ts
    server.ts
    config/
    controllers/
    db/
    plugins/
    repositories/
    routes/
    schemas/
    services/
      jobs/
      queue/
      translation/
    types/
    utils/
```

## Local Setup

1. `cd backend`
2. `npm install`
3. Set environment values (`API_KEY`, `DATABASE_URL`) in one of these files:
   - `backend/.env.local` or `backend/.env`
   - project root `/.env.local` or `/.env` (auto-loaded fallback)
   - optional explicit file via `ENV_FILE=../path/to/.env npm run dev`
5. Apply Supabase SQL migration from repo root:

```bash
# from repository root
supabase db push
```

Migration added: `supabase/migrations/20260406_000002_wp_translation_jobs.sql`

6. `npm run prisma:generate`
7. `npm run dev`

The API starts on `http://localhost:4001` by default.

## Authentication

Protected endpoints require an API key:

- Header option 1: `x-api-key: <API_KEY>`
- Header option 2: `Authorization: Bearer <API_KEY>`

Unauthenticated requests return `401`.

## Example Requests

Single job:

```bash
curl -X POST "http://localhost:4001/api/translate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  --data @examples/translate.request.json
```

Bulk job:

```bash
curl -X POST "http://localhost:4001/api/translate/bulk" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  --data @examples/translate-bulk.request.json
```

Job status:

```bash
curl -H "x-api-key: YOUR_API_KEY" "http://localhost:4001/api/job/<jobId>"
```

## Translation Provider Abstraction

Provider interface:

- `translateText(text, sourceLanguage, targetLanguage)`
- `translateStructuredPayload(payload, sourceLanguage, targetLanguage, options)`

Implemented providers:

- `stub-provider` (for local/dev)
- `llm-provider-placeholder` (TODO scaffold)

Switch provider via:

```env
TRANSLATION_PROVIDER=stub
```

## Data Persistence (Prisma/PostgreSQL)

Prisma maps to the Supabase table `public.wp_translation_jobs` (snake_case in DB, camelCase in app code).

Each translation job stores:

- `jobId`
- `siteUrl`
- `postId`
- `postType`
- `requestPayload`
- `responsePayload`
- `status`
- `createdAt`
- `updatedAt`
- `errors`
- timing metadata and warnings

## Reliability & Safety Notes

- Strict Zod validation for request bodies and route params
- Payload size limits (`MAX_PAYLOAD_BYTES`)
- Rate limiting (`RATE_LIMIT_MAX`, `RATE_LIMIT_TIME_WINDOW`)
- Structured error responses with clear error codes
- Failed jobs persisted with error details
- Partial field failures produce warnings, while preserving original values
- Logs are sanitized and redact secret-like keys

## WordPress Compatibility

Designed for plugin workflows that:

- export posts/pages/custom post types
- include ACF field trees and nested structures
- require same-shape JSON response for safe re-import
- may extend to draft creation + multilingual sync later

## Future-Ready Scaffolding

Included architecture placeholders for:

- async queue workers (`services/queue`)
- webhook callbacks (easy to add route layer)
- translation memory
- glossary rules
- human review state
- billing and usage metering

## Important TODOs Before Production

1. Implement real LLM/API provider in `llm-translation-provider.ts`
2. Add retry policy and backoff strategy
3. Add request signing/HMAC if plugin supports it
4. Add observability (metrics + traces)
5. Add automated tests (unit + integration + contract tests)
