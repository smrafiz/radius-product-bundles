# Radius Product Bundles - Starter App Extraction Guide

> Analysis of extractable components for creating a Shopify embedded app starter template.

---

## Project Overview

| Attribute | Value |
|-----------|-------|
| **App Type** | Shopify Embedded App |
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Database** | PostgreSQL + Prisma 7 |
| **State Management** | Zustand + React Query |
| **UI Components** | Shopify Polaris |
| **Package Manager** | bun |
| **Extensions** | Rust WASM Discount Function + Liquid Widget |

---

## 1. Framework ✅ Extractable

### Core Dependencies
```json
// web/package.json (key dependencies)
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@shopify/shopify-api": "^11.0.0",
  "@shopify/ui-extensions-react": "^16.0.0",
  "@prisma/client": "^7.0.0",
  "zustand": "^5.0.0",
  "@tanstack/react-query": "^5.0.0",
  "zod": "^3.0.0",
  "react-hook-form": "^7.0.0"
}
```

### Directory Structure
```
web/
├── app/                    # Next.js App Router pages
├── next.config.js           # Next.js configuration
├── tsconfig.json           # TypeScript strict mode
├── package.json            # Dependencies
└── prisma/                # Database schema
```

### Extraction Notes
- Next.js 16 App Router patterns are standard
- Server Actions in `web/features/*/actions/`
- Use `bun` as package manager throughout

---

## 2. GraphQL System ✅ Extractable

### Structure
```
web/lib/graphql/
├── client/                 # GraphQL client setup
│   └── client.ts          # executeGraphQLQuery/Mutation wrappers
├── generated/            # Auto-codegen types (from Shopify API 2025-10)
├── operations/           # queries, mutations, fragments
│   ├── queries/         # Product, Bundle, Metafield queries
│   ├── mutations/      # Bundle CRUD mutations
│   └── fragments/      # Reusable fragments
└── schema/              # GraphQL schema definitions
```

### Codegen Pipeline
```typescript
// web/codegen.ts
import { defineConfig } from '@shopify/api-codegen-preset';

export default defineConfig({
  schema: './web/lib/graphql/schema/**/*.graphql',
  documents: './web/lib/graphql/operations/**/*.graphql',
  extensions: {
    codegen: {
      preset: '@shopify/api-codegen-preset',
      config: {
        apiVersion: '2025-10',
        documents: { paths: ['./web/lib/graphql/operations/**/*'] },
      },
    },
  },
});
```

### Client Pattern
```typescript
// web/lib/graphql/client/client.ts
import { shopify } from '@/lib/shopify/server';

export async function executeGraphQLQuery<T>({
  query,
  variables,
  shopDomain,
  accessToken,
}: GraphQLOptions): Promise<T> {
  const client = shopify.api.clients.graphql({ shopDomain, accessToken });
  return client.query<T>({ data: { query, variables } });
}
```

### Extraction Steps
1. Copy `web/lib/graphql/` to new project
2. Update `codegen.ts` with your API operations
3. Run `bun run graphql-codegen`
4. Use generated types in components

---

## 3. Feature System ✅ Extractable (Gold Standard)

### Pattern Overview
Each feature follows a consistent layers structure:
```
web/features/<feature-name>/
├── actions/          # Next.js Server Actions (API boundary)
├── api/             # React Query keys, queries, mutations
├── components/      # Feature-specific React components
├── hooks/           # Custom React hooks
├── repositories/    # Prisma data access layer
├── services/        # Business logic
├── stores/         # Zustand state management
├── types/           # TypeScript interfaces
├── constants/      # Feature constants
├── validation/     # Zod schemas
└── utils/          # Helper functions
```

### Example: bundles Feature
```
web/features/bundles/
├── actions/
│   ├── bundle-read.actions.ts    # Server read actions
│   ├── bundle-write.actions.ts  # Server write actions
│   └── index.ts
├── api/
│   ├── bundle-keys.ts           # React Query keys
│   ├── bundle-queries.ts      # React Query queries
│   ├── bundle-mutations.ts    # React Query mutations
│   └── index.ts
├── components/
│   ├── bundle-form/           # Form components
│   ├── bundle-list/          # List components
│   ├── bundle-preview/       # Preview components
│   └── index.ts
├── hooks/
│   ├── use-bundle.ts         # Bundle CRUD hooks
│   ├── use-bundle-validator.ts
│   └── index.ts
├── repositories/
│   ├── bundle-repository.ts   # Prisma queries
│   └── index.ts
├── services/
│   ├── bundle-discount.service.ts    # Discount calculation
│   ├── bundle-pricing.service.ts    # Price calculation
│   └── index.ts
├── stores/
│   ├── bundle-form.store.ts   # Form state (Zustand)
│   └── index.ts
├── types/
│   └── bundle.types.ts       # Type definitions
├── constants/
│   └── bundle-status.ts    # Status enums
├── schema/
│   └── bundle.zod.ts       # Zod validation schemas
├── utils/
│   └── bundle-utils.ts     # Helper functions
└── validation/
    └── bundle-validation.ts
```

### Data Flow
```
Component
  → React Query (api/)
  → Server Action (actions/)
  → Service (services/)
  → Repository (repositories/)
  → Prisma → PostgreSQL
              ↓
        Shopify Admin API (GraphQL)
```

### Extraction Steps
1. Create new feature folder: `web/features/<your-feature>/`
2. Copy the 10-layer structure
3. Replace domain-specific code (Bundle → YourEntity)
4. Update Prisma schema for your data model

---

## 4. Three-Layer Architecture ✅ Extractable

### Layer 1: API Boundary (Server Actions)
```
web/features/*/actions/
```
- Next.js Server Actions with `"use server"`
- Input validation via Zod
- Error handling wrapper pattern
- Returns `{ status: "success" | "error", data?, message?, errors? }`

### Layer 2: Business Logic (Services)
```
web/features/*/services/
```
- Pure TypeScript functions
- No direct database access
- Called by Actions only
- Contains core business rules

### Layer 3: Data Access (Repositories)
```
web/features/*/repositories/
```
- Prisma client calls only
- No business logic
- CRUD operations only
- Called by Services only

### Code Flow
```typescript
// actions/bundle.actions.ts
"use server";
import { getBundleService } from '../services/bundle.service';
import { bundleRepository } from '../repositories/bundle.repository';

export async function getBundle(id: string) {
  const bundle = await bundleRepository.findUnique({ where: { id } });
  return getBundleService.calculate(bundle);
}
```

### Extraction Steps
1. Always create Actions for API boundary
2. Keep Services pure (no I/O)
3. Repositories handle only Prisma calls
4. NEVER call Repositories from Components directly

---

## 5. Shopify Extension System ✅ Extractable

### Extensions Structure
```
extension/extensions/
├── product-bundle-widget/       # Liquid Theme Extension
│   ├── locales/               # Translation files
│   ├── templates/            # Liquid templates
│   ├── assets/              # JS/CSS assets
│   └── blocks/              # Theme blocks
└── radius-discount-function/  # Shopify Function (Rust)
    ├── src/
    │   ├── api.rs          # API entry
    │   ├── discount.rs     # Discount logic
    │   └── run.rs          # Run function
    ├── schema.graphql      # GraphQL input schema
    ├── shopify.extension.toml
    └── Cargo.toml
```

### Widget Extension Pattern
```
extension/extensions/product-bundle-widget/
├── blocks/
│   └── product-bundle-widget.liquid
├── templates/
│   ├── product-bundle-show.json
│   └── product-bundle-card.json
├── assets/
│   ├── widget.js           # Storefront JS
│   └── widget.css         # Storefront styles
├── locales/
│   ├── en.default.json
│   └── *.json
└── shopify.extension.toml
```

### Extension Config
```toml
# extension/extensions/product-bundle-widget/shopify.extension.toml
api_version = "2025-10"

[extensions.possible-orders]
  "product-bundle-widget" = { "target" = "admin.product-purchase.option" }
```

### Extraction Steps
1. Copy `extension/extensions/product-bundle-widget/`
2. Modify Liquid templates for your data
3. Update `shopify.extension.toml`
4. Build with `bun run build:widgets`

---

## 6. Shopify Discount Function (Rust) ⚠️ Complex

### Structure
```
extension/extensions/radius-discount-function/
├── src/
│   ├── api.rs           # Input/output types (from GraphQL)
│   ├── run.rs          # Main entry point
│   ├── discount.rs     # Discount calculation logic
│   ├── configuration.rs # Configuration handling
│   └── error.rs       # Error types
├── schema.graphql     # Function input schema (generated)
├── Cargo.toml         # Rust dependencies
├── shopify.extension.toml
└── tests/             # Integration tests
```

### Function Pattern
```rust
// src/run.rs
shopify_function::graphql_id!(run);

pub fn run(input: RunInput) -> Output {
    let discount = calculate_discount(input.cart, input.discount)?;
    Output { discount }
}
```

### Dependencies (Cargo.toml)
```toml
[dependencies]
shopify-function = "0.0.6"
serde = "1.0"
serde_json = "1.0"

[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
```

### Input Schema
```graphql
# schema.graphql (generates src/api.rs)
input RunInput {
  cart: Cart!
  discount: Discount!
}

type Output {
  discount: AbstractMoney!
}
```

### Build & Deploy
```bash
# Build WASM
cd extension/extensions/radius-discount-function
cargo build --release

# Or use npm script
bun run build:function
```

### Extraction Difficulty: **HIGH**
- Requires Rust knowledge
- GraphQL schema must match your app's data model
- WASM compilation requires specific toolchain
- Recommend: Start with simple discounts first

---

## 7. Prisma Schema ✅ Extractable

### Database Model
```
web/prisma/
├── schema.prisma      # Main schema (19K+ lines)
└── generated/        # Prisma Client
```

### Schema Pattern
```prisma
// Simple example
model Bundle {
  id          String    @id @default(cuid())
  name       String
  type       BundleType
  status     BundleStatus @default(DRAFT)
  products   BundleProduct[]
  discount   Json?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([status])
  @@index([type])
}
```

### Migration Pattern
```bash
# Development
bun run migrate

# Push schema (no migration)
bun run prisma:push

# Studio (GUI)
bun run prisma:studio
```

### Extraction Steps
1. Copy `web/prisma/schema.prisma`
2. Modify models for your domain
3. Run `bun run migrate`
4. Use Prisma Client in Repositories

---

## 8. Additional Extracted Components

### Shopify Integration
```
web/lib/shopify/
├── server/           # Server-side Shopify client
├── web/             # Web OAuth flow
├── session/         # Session management
└── graphql/         # GraphQL utilities
```

### Proxy (App Proxy for Storefront)
```typescript
// web/proxy.ts
// Handles storefront data access via App Proxy
```

### Webhooks
```
web/features/webhooks/
├── handlers/         # Webhook handlers
├── validation/       # HMAC validation
└── types/          # Webhook types
```

### Security
```
web/security/
├── hmac.ts         # HMAC verification
├── auth.ts        # Authentication
└── cors.ts       # CORS config
```

### Shared Components
```
web/shared/
├── components/      # Reusable UI components
├── hooks/         # Shared hooks
├── stores/        # Global stores
└── utils/        # Shared utilities
```

### Testing
```
web/tests/
├── setup/         # Jest setup
├── mocks/        # Mock utilities
└── utils/       # Test helpers
```

---

## 9. Quick Extraction Checklist

| Component | Files to Copy | Complexity |
|-----------|-------------|------------|
| Framework | `web/app/`, `web/next.config.js`, `web/package.json` | Easy |
| GraphQL | `web/lib/graphql/` | Easy |
| Feature Pattern | `web/features/bundles/` (as template) | Easy |
| 3-Layer | Already in feature pattern | Easy |
| Widget Extension | `extension/extensions/product-bundle-widget/` | Medium |
| Discount Function | `extension/extensions/radius-discount-function/` | Hard |
| Prisma | `web/prisma/schema.prisma` | Easy |

---

## 10. Recommended Extraction Order

1. **Step 1**: Copy `web/app/` as Next.js app template
2. **Step 2**: Copy `web/lib/graphql/` + update codegen
3. **Step 3**: Copy a complete feature (e.g., `bundles`) as template
4. **Step 4**: Copy `web/prisma/schema.prisma`, modify models
5. **Step 5**: Copy widget extension, customize
6. **Step 6**: (Optional) Copy Rust function if needed

---

## 11. What NOT to Extract

- ❌ Bundle-specific business logic (discount calculations)
- ❌ Bundle CRUD operations (replace with your entity)
- ❌ Hardcoded bundle types/constants
- ❌ Feature-specific UI components
- ❌ Test files (rewrite for your domain)

---

## Summary

| Category | Extractable | Notes |
|----------|-----------|-------|
| Framework | ✅ Yes | Standard Next.js 16 patterns |
| GraphQL | ✅ Yes | Codegen pipeline included |
| Feature System | ✅ Yes | Excellent layered pattern |
| 3-Layer | ✅ Yes | Built into feature system |
| Widget Extension | ✅ Yes | Standard Liquid patterns |
| Discount Function | ⚠️ Hard | Requires Rust knowledge |
| Prisma | ✅ Yes | Standard schema + migrations |

**Overall Verdict**: High extraction potential. The feature system pattern is exceptional and can serve as a starter template for any Shopify embedded app.

---

*Generated: April 2026*
*From: Radius Product Bundles repo*