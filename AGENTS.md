# AGENTS.md

This file provides guidance for AI agents working with the Radius Product Bundles repository.

## Safety & Guardrails (MANDATORY)

**Read before ANY code changes:**

1. **[Agent Guardrails](docs/AGENT_GUARDRAILS.md)** — Core safety protocols, Four Laws, forbidden actions
2. **[Pre-Work Check](.guardrails/pre-work-check.md)** — Regression checklist, run before editing

### The Four Laws of Agent Safety
1. **Read Before Editing** — Never modify code without reading it first
2. **Stay in Scope** — Only touch files explicitly authorized
3. **Verify Before Committing** — Test all changes
4. **Halt When Uncertain** — Ask instead of guessing

### Pre-Work Commands
```bash
python scripts/regression_check.py --all      # Check for regressions
python scripts/regression_check.py --staged    # Check staged changes only
python scripts/log_failure.py --list           # List known bugs
python scripts/log_failure.py --show FAIL-ID   # Show failure details
python scripts/log_failure.py --resolve FAIL-ID # Mark resolved
```

### Halt Conditions — STOP and ask the user if:
- Target file doesn't exist or has unexpected modifications
- Any test fails after edit
- Uncertain about ANY step
- Test/production boundary is unclear
- An operation has failed 3 times (Three Strikes Rule)

## Project Overview

Embedded Shopify app for creating/managing product bundles. Built with Next.js 16 (App Router) + React 19, PostgreSQL + Prisma 7, Zustand state management, and Shopify Polaris UI. Includes a Rust WASM discount function and Liquid theme extension.

## Commands

### Development (run from root)

```bash
bun run dev                 # Concurrent: app + widgets + schema watcher
bun run dev:app             # Shopify CLI dev server only
bun run dev:widgets         # Vite watch-build for storefront widgets
bun run dev:full            # Auto-update env host + codegen then dev
```

### Build & Deploy (run from root)

```bash
bun run build               # shopify app build
bun run deploy              # shopify app deploy
bun run build:widgets       # Vite build widgets-src
bun run build:schema        # Build extension schema
```

### Database (run from /web)

```bash
bun run migrate             # prisma migrate dev
bun run prisma:push         # Push schema without migration
bun run prisma:studio       # Open Prisma Studio
```

### Code Quality

```bash
# From /web directory:
bun run test                           # Run all tests
bun run test --watch                   # Watch mode
bun run test --coverage                # With coverage report
bun run test path/to/file.test.ts      # Single test file
bun run test --testNamePattern="test" # Run tests matching pattern
bun run graphql-codegen                # Generate GraphQL types from Shopify API 2025-10
bun run pretty                         # Prettier on entire repo
```

## Code Style

### Formatting (Prettier)

```json
{
    "trailingComma": "all",
    "tabWidth": 4,
    "semi": true
}
```

### ESLint

Extends `next/core-web-vitals` + `prettier`. Run `bun run pretty` to auto-fix.

### TypeScript

- Strict mode enabled
- Explicit return types on functions
- Use `as const` for literal type assertions in return objects
- Zod schemas for runtime validation

### File Naming

| Type         | Convention                   | Example                      |
| ------------ | ---------------------------- | ---------------------------- |
| Components   | PascalCase                   | `BundlePreview.tsx`          |
| Hooks        | camelCase                    | `useBundleActions.ts`        |
| Services     | camelCase                    | `bundle-read.service.ts`     |
| Repositories | camelCase                    | `bundle.queries.ts`          |
| Actions      | camelCase + `.action.ts`     | `bundle-mutations.action.ts` |
| Types        | camelCase + `.types.ts`      | `bundle.types.ts`            |
| Constants    | camelCase or SCREAMING_SNAKE | `bundle-types.constants.ts`  |
| Index files  | `index.ts`                   | Barrel exports               |

### Component Naming

- React Components: PascalCase (`BundleTable`)
- Zustand stores: `use*Store` pattern (`useBundleStore`)
- React Query hooks: descriptive names (`useBundlesPage`, `useEditBundle`)
- Constants/Enums: UPPER_SNAKE_CASE or PascalCase for enum values

### Import Organization

1. `"use server"` or `"use client"` directives
2. Node built-ins (`"next/cache"`, etc.)
3. External libraries (React, Zustand, Prisma)
4. Path aliases (`@/lib/*`, `@/shared/*`, `@/features/*`)
5. GraphQL generated types
6. Local files (relative imports)

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/repositories";
import { ApiResponse } from "@/shared";
import { BundleFormData, bundleSchema } from "@/features/bundles";
import { createBundleService } from "@/features/bundles/services";
import { ProductDeleteDocument } from "@/lib/graphql/generated/graphql";
```

### Path Aliases (tsconfig.json)

```
@/*         → /web/*
@/lib/*     → /web/lib/*
@/features/* → /web/features/*
@/shared/*  → /web/shared/*
@/tests/*   → /web/tests/*
```

## Error Handling

### Standard Pattern

Use error handler functions from `web/shared/utils/error/error-handlers.ts`:

```typescript
import {
    handleBundleError,
    handleApiError,
} from "@/shared/utils/error/error-handlers";
```

### Service Layer Returns

```typescript
// Success
return { status: "success" as const, message: "...", data: result };

// Error
try {
    // operation
} catch (error) {
    console.error("[updateBundleStatus] Error:", error);
    return {
        status: "error" as const,
        message: error instanceof Error ? error.message : "Failed to update",
        data: undefined,
        errors: [String(error)],
    };
}
```

### ApiError Structure

```typescript
{ status: "error", message: string, errors?: string[] }
```

## Testing

### Configuration

- Jest config: `web/jest.config.js`
- Test environment: node
- Setup file: `web/tests/setup/jest.setup.ts`
- Pattern: `**/?(*.)+(spec|test).[tj]s?(x)`
- Utilities: `@testing-library/jest-dom`, `@testing-library/react`, `jest-mock-extended`

### Example Test

```typescript
import { formatCurrency } from "@/shared";

describe("formatCurrency", () => {
    it("should format USD correctly", () => {
        expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });
});
```

## Feature Module Structure

Each feature in `/web/features/<name>/` follows this pattern:

```
features/<name>/
  actions/       # Next.js server actions
  api/           # React Query keys, queries, mutations
  components/    # Feature-specific UI
  hooks/         # Feature-specific hooks
  repositories/  # Prisma data access
  services/      # Business logic
  stores/        # Zustand stores
  types/         # TypeScript interfaces
  constants/     # Feature constants
  validation/    # Zod schemas
```

## State Management

- **Server state**: React Query (@tanstack/react-query)
- **Feature state**: Zustand with Immer middleware
- **Global state**: Zustand in `/web/shared/stores/`
- **Form state**: React Hook Form + Zod

## Data Flow

```
Component → React Query hook → Server Action → Service → Repository → Prisma → PostgreSQL
                                                                 ↓
                                                          Shopify Admin API (GraphQL)
```

## Bundle Types

FIXED_BUNDLE, BUY_X_GET_Y, BOGO, VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER

## Bundle Statuses

DRAFT, ACTIVE, PAUSED, ARCHIVED, SCHEDULED, DELETED

## Package Manager

**bun** is the primary runtime and package manager. Use `bun` for all commands.
