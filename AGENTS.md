# AGENTS.md

This document provides guidelines and commands for agentic coding operations in this repository.

---

## Project Structure

```
translate_saas/
├── frontend/           # Next.js frontend application (root level)
├── backend/           # Fastify backend API (separate Node project)
├── components/        # React components (organized by feature)
├── lib/               # Utility functions and helpers
├── services/          # External service integrations
├── types/             # TypeScript type definitions
├── tests/             # Test files (Node test runner, not Vitest)
└── supabase/          # Database migrations
```

---

## Commands

### Frontend (root directory)

```bash
# Development
npm run dev                 # Start Next.js dev server
npm run build               # Production build
npm run start               # Start production server

# Quality
npm run lint                # ESLint .ts,.tsx files
npm run typecheck           # TypeScript type checking (noEmit)

# Testing
npm test                    # Run all tests (tsx --test)
npx tsx --test tests/word-count.test.ts    # Run single test file
```

### Backend (backend/ directory)

```bash
cd backend

# Development
npm run dev                 # tsx watch src/server.ts
npm run build               # tsc -p tsconfig.json
npm run start               # node dist/server.js

# Database
npm run prisma:generate     # Generate Prisma client
npm run typecheck           # TypeScript check (-p tsconfig.json)
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** in both frontend and backend tsconfig
- **Path aliases**: Use `@/*` to reference files from root (e.g., `@/lib/i18n`)
- **Type imports**: Use `import type {}` when importing only types
- **Avoid `any`**: Use `unknown` for truly unknown values, then narrow with type guards

### Imports

**Frontend (Next.js/React):**
```typescript
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAppLocale } from "@/components/app-locale-provider";
import { createClient } from "@/lib/supabase/client";
```

**Ordering convention:**
1. React/Node built-ins
2. Third-party libraries
3. Internal path aliases (@/)

**Backend:**
```typescript
import { z } from "zod";
import type { FastifyRequest } from "fastify";
```

### Components

- Use **kebab-case** for screen component files: `auth-screen.tsx`, `dashboard-home-screen.tsx`
- Always add `"use client"` directive for client-side components
- Export named components: `export function AuthScreen({ mode }: AuthScreenProps)`
- Extract sub-components below the main export or in separate files
- Inline simple sub-components when they don't need separate testing

### Error Handling

```typescript
// Pattern for async operations
try {
  setIsSubmitting(true);
  const { error } = await supabase.auth.signUp({ ... });

  if (error) {
    throw error;
  }

  // success path
} catch (error) {
  setErrorMessage(error instanceof Error ? error.message : "Fallback message.");
} finally {
  setIsSubmitting(false);
}
```

### Styling

- **Tailwind CSS v4** for all styling
- Use bracket notation for dynamic values: `className={isActive ? "bg-white" : "bg-transparent"}`
- Use CSS variables for theme colors: `text-[var(--foreground)]`
- Avoid arbitrary inline styles; prefer Tailwind classes

### Naming Conventions

| Element          | Convention           | Example                              |
|------------------|----------------------|--------------------------------------|
| Files            | kebab-case           | `project-summary-card.tsx`            |
| Components       | PascalCase           | `ProjectSummaryCard`                  |
| Functions        | camelCase            | `countMeaningfulWords`                |
| Types/Interfaces | PascalCase           | `TranslationBatchItem`                |
| Constants        | SCREAMING_SNAKE_CASE | `DEFAULT_APP_LOCALE`                  |
| CSS classes      | kebab-case (Tailwind)| `rounded-xl bg-white`                |

### API Patterns (Backend)

- Use **Zod** for request/response validation
- Use **Fastify** route decorators: `fastify.get()`, `fastify.post()`
- Always handle errors with try/catch and return appropriate status codes
- Use typed request/reply: `fastify.get<{ Querystring: MyQuery }>`

### Database (Prisma)

- Run `npm run prisma:generate` after schema changes
- Use meaningful enum values
- migrations in `supabase/migrations/`

---

## Testing

Tests use **Node's built-in test runner** with `tsx` for ESM support:

```bash
npm test                              # All tests
npx tsx --test tests/word-count.test.ts    # Single file
```

Test file pattern: `tests/*.test.ts`

```typescript
import test from "node:test";
import assert from "node:assert/strict";

test("describes the expected behavior", () => {
  assert.equal(actual, expected);
});
```

---

## Linting Configuration

ESLint config (`eslint.config.mjs`):
- Extends `eslint-config-next/core-web-vitals`
- Extends `eslint-config-next/typescript`
- Covers `.ts` and `.tsx` files

Run linting before commits:
```bash
npm run lint
```

---

## Environment Variables

See `.env.example` for required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
OPENAI_API_KEY=
```

---

## Key Dependencies

| Purpose          | Package                        |
|------------------|--------------------------------|
| Framework        | Next.js 16, React 19            |
| Backend          | Fastify 4                      |
| Database ORM     | Prisma 5                       |
| AI/Translation   | OpenAI SDK                     |
| File Formats     | JSZip, @xmldom/xmldom          |
| Payments         | Stripe                         |
| Auth             | @supabase/ssr, @supabase/supabase-js |
| Styling          | Tailwind CSS 4                 |
| Validation       | Zod (backend)                  |
| Testing          | Node test runner, tsx          |
