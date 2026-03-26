# Radius Product Bundles

An embedded Shopify app for creating and managing product bundles. Includes a Rust-based discount function (WASM) and a Liquid storefront widget, with analytics and a 4-section style customizer.

## Tech Stack

### Frontend

| Layer          | Technology             | Version    |
| -------------- | ---------------------- | ---------- |
| Framework      | Next.js (App Router)   | 16.1.x     |
| Language       | TypeScript             | 5.9        |
| UI             | Polaris Web Components | —          |
| Styling        | Tailwind CSS           | 4.2        |
| State (server) | TanStack React Query   | 5.90       |
| State (client) | Zustand + Immer        | 5.0        |
| Forms          | React Hook Form + Zod  | 7.71 / 4.3 |
| Drag & Drop    | @dnd-kit               | 6.3        |

### Backend & Data

| Layer       | Technology                | Version |
| ----------- | ------------------------- | ------- |
| ORM         | Prisma                    | 7.5     |
| Database    | PostgreSQL (AWS-hosted)   | 15+     |
| GraphQL     | graphql-request + codegen | 7.4     |
| Shopify API | @shopify/shopify-api      | 13.x    |
| App Bridge  | @shopify/app-bridge-react | 4.2     |
| Runtime     | Bun (scripts) + Node.js   | 1.1+    |

### Shopify Extensions

| Extension                  | Type                   | Purpose                                               |
| -------------------------- | ---------------------- | ----------------------------------------------------- |
| `radius-discount-function` | Rust → WASM            | Server-side line-item & delivery discount calculation |
| `product-bundle-widget`    | Liquid theme extension | Storefront bundle display widget                      |

### Tooling

- **Package manager**: pnpm (install) + bun (run/watch)
- **GraphQL codegen**: `@shopify/api-codegen-preset` targeting Admin API 2026-01
- **ESLint**: 10.x | **Prettier**: 3.8
- **Testing**: Jest 30 + Testing Library

---

## Monorepo Structure

```
/                                   # Root: orchestration scripts, shopify.app.toml
├── web/                            # Next.js 16 app (frontend + backend)
│   ├── app/                        # App Router pages & API routes
│   │   └── api/                    # auth, webhooks, proxy, session, upload
│   ├── features/                   # Feature modules (self-contained)
│   │   ├── bundles/                # Core bundle CRUD
│   │   ├── settings/               # App config + style customizer
│   │   ├── analytics/              # Performance tracking
│   │   ├── dashboard/              # Overview + setup guide
│   │   ├── pricing/                # Pricing rules (partial)
│   │   └── webhooks/               # Webhook handlers
│   ├── shared/                     # Cross-feature: components, hooks, utils, stores
│   ├── prisma/                     # Schema, migrations, generated client
│   ├── lib/                        # GraphQL operations, codegen config
│   └── widgets/                    # Storefront widget (Vite build)
│       └── src/                    # Widget source (TypeScript)
│
└── extension/
    ├── extensions/
    │   ├── product-bundle-widget/  # Liquid theme extension
    │   └── radius-discount-function/ # Rust WASM discount function
    └── schema/                     # Widget schema definitions
```

Each feature module follows the same internal structure:

```
features/<name>/
  actions/        # Next.js server actions (API boundary)
  api/            # React Query keys, queries, mutations
  components/     # Feature-specific UI
  hooks/          # Feature-specific hooks
  repositories/   # Prisma data access
  services/       # Business logic
  stores/         # Zustand stores
  types/          # TypeScript interfaces
  constants/      # Feature constants
  validation/     # Zod schemas
```

---

## Features

### Bundle Types

`FIXED_BUNDLE` · `BUY_X_GET_Y` · `BOGO` · `VOLUME_DISCOUNT` · `MIX_AND_MATCH` · `FREQUENTLY_BOUGHT_TOGETHER`

### Bundle Statuses

`DRAFT` · `ACTIVE` · `PAUSED` · `ARCHIVED` · `SCHEDULED`

### Discount Types

`PERCENTAGE` · `FIXED_AMOUNT` · `CUSTOM_PRICE` · `NO_DISCOUNT` · `QUANTITY_BREAKS`

## Shopify Integration

- **App type**: Embedded, offline mode, direct API enabled
- **Webhooks**: `app/uninstalled`, `shop/update`, `orders/create`, `products/delete`
- **Access scopes**: `read_locales`, `read_orders`, `read_products`, `write_app_proxy`, `write_discounts`, `write_files`, `write_products`, `write_publications`

---

## Documentation

| Document | Purpose |
| --- | --- |
| [**Agent Guardrails**](docs/AGENT_GUARDRAILS.md) | **MANDATORY** safety protocols for ALL AI agents |

---

## Path Aliases (tsconfig)

```
@/*          → /web/*
@/lib/*      → /web/lib/*
@/features/* → /web/features/*
@/shared/*   → /web/shared/*
```

---

## Quick Command Reference

### Development

| Command               | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `bun run dev`         | Start full dev environment (app + widget watcher + schema watcher) |
| `bun run dev:app`     | Shopify CLI dev server only                                        |
| `bun run dev:widgets` | Vite watch-build for storefront widgets                            |

### Build & Deploy

| Command                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `bun run build`         | `shopify app build`                                           |
| `bun run deploy`        | `shopify app deploy`                                          |
| `bun run build:widgets` | Vite build for storefront widgets                             |
| `bun run build:schema`  | Build extension schema from `/extension/schema/`              |
| `bun run update:config` | Regenerate `shopify.app.toml` from `.env`, then deploy config |

### Database (run from `/web`)

| Command                     | Description                              |
| --------------------------- | ---------------------------------------- |
| `bun migrate`               | `prisma migrate dev`                     |
| `bun prisma:push`           | Push schema without creating a migration |
| `bun prisma:pull`           | Pull schema from database                |
| `bun prisma:migrate <name>` | Create a named migration                 |
| `bun prisma:studio`         | Open Prisma Studio                       |
| `bun prepare`               | Regenerate Prisma client                 |

### Code Quality (run from `/web`)

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `bun graphql-codegen` | Generate types from Shopify Admin API 2026-01 |
| `bun test`            | Jest                                          |
| `bun test:watch`      | Jest watch mode                               |
| `bun test:coverage`   | Jest with coverage report                     |

### Formatting

| Command          | Description             |
| ---------------- | ----------------------- |
| `bun run pretty` | Prettier on entire repo |

## Contributing

> **AI Agents:** Before contributing, read [Agent Guardrails](docs/AGENT_GUARDRAILS.md)

---

## Setup

See **[INSTALLATION.md](./INSTALLATION.md)** for the full step-by-step setup guide including prerequisites, environment variables, database setup, Rust WASM build, and first-run instructions.

---

- update ci/cd

Built with ❤️ by [RadiusTheme](https://radiustheme.com)
