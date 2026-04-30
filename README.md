# Radius Bundles

Radius Bundles is an embedded Shopify app for building product bundles that actually perform. It pairs a Next.js admin with a Rust-compiled discount function and a Liquid storefront widget, so the math runs on Shopify's edge and the UI looks at home in the merchant's theme.

If you've ever wired up a "Buy 2, Get 1 Free" promo and held your breath at checkout, this is for you.

## What you can build

- **Fixed bundles** — group products and ship a single price.
- **BOGO** and **Buy X / Get Y** — flexible trigger and reward roles, including same-product mode.
- **Volume discounts** — quantity breaks with optional open-ended tiers.
- **Mix & Match** — let shoppers choose from a curated set.
- **Frequently bought together** — schema and surfaces in place; affinity logic is on the roadmap.

Each bundle has its own status lifecycle (`DRAFT`, `ACTIVE`, `PAUSED`, `ARCHIVED`, `SCHEDULED`) and supports `PERCENTAGE`, `FIXED_AMOUNT`, `CUSTOM_PRICE`, `NO_DISCOUNT`, or `QUANTITY_BREAKS` discounts.

## How it's put together

| Layer | Pick | Why |
| --- | --- | --- |
| App framework | Next.js 16.2 (App Router) + TypeScript 6 | Server actions are the API boundary; the file system is the route table. |
| UI | Polaris Web Components + Tailwind 4 | Native to the Shopify admin, no React Polaris bloat. |
| Server state | TanStack React Query 5.100 | Caching and invalidation we don't have to hand-roll. |
| Client state | Zustand 5 + Immer | Per-feature stores; no provider trees. |
| Forms | React Hook Form 7.74 + Zod 4 | One source of truth for shape and rules. |
| Database | PostgreSQL via Prisma 7.8 | Generated client lives at `/web/prisma/generated/`. |
| Shopify | `@shopify/shopify-api` 13 + App Bridge React 4.2 | Embedded, offline mode, direct API enabled. |
| Discount engine | Rust → WASM Shopify Function | Server-side, deterministic, runs on Shopify infra. |
| Storefront | Liquid theme extension + Vite-built TS widget | Loads in the theme, talks to App Proxy. |
| Runtime | Bun for scripts, Node for serverless | Bun is fast at watching; Node is the deploy target. |

GraphQL is generated from the Shopify Admin API (currently 2026-04) via `@shopify/api-codegen-preset`. Tests run on Jest 30 with Testing Library.

## Repo layout

```
/                                    # Root scripts + shopify.app.toml
├── web/                             # Next.js 16 app (admin + APIs)
│   ├── app/                         # App Router pages
│   │   └── api/                     # auth, webhooks, proxy, session, upload
│   ├── features/                    # Self-contained feature modules
│   │   ├── bundles/                 # Core bundle CRUD
│   │   ├── settings/                # Style customizer + app config
│   │   ├── analytics/               # Performance tracking
│   │   ├── dashboard/               # Overview + setup guide
│   │   ├── pricing/                 # Pricing rules (partial)
│   │   └── webhooks/                # Webhook handlers
│   ├── shared/                      # Cross-feature components, hooks, utils
│   ├── prisma/                      # Schema, migrations, generated client
│   ├── lib/                         # GraphQL operations, codegen config
│   └── widgets/                     # Storefront widget source (Vite)
│
└── extension/
    ├── extensions/
    │   ├── product-bundle-widget/   # Liquid theme extension
    │   └── radius-discount-function/# Rust → WASM discount function
    └── schema/                      # Widget schema definitions
```

Every feature module follows the same internal shape:

```
features/<name>/
├── actions/        # Server actions — the API boundary
├── api/            # React Query keys, queries, mutations
├── components/     # Feature UI
├── hooks/          # Feature-scoped hooks
├── repositories/   # Prisma calls
├── services/       # Business logic
├── stores/         # Zustand stores
├── types/          # TypeScript interfaces
├── constants/
└── validation/     # Zod schemas
```

If you're hunting for something, start at the feature folder and follow the layers down.

## Path aliases

```
@/*          → /web/*
@/lib/*      → /web/lib/*
@/features/* → /web/features/*
@/shared/*   → /web/shared/*
```

## Shopify integration

- **App type**: embedded, offline-mode tokens, direct API enabled.
- **Admin API version**: 2026-04.
- **Webhooks**: `app/uninstalled`, `app_subscriptions/update`, `shop/update`, `locales/create`, `locales/update`, `orders/create`, `products/create`, `products/delete`.
- **Compliance webhooks**: `customers/data_request`, `customers/redact`, `shop/redact`.
- **Scopes**: `read_locales`, `read_orders`, `read_products`, `read_themes`, `write_app_proxy`, `write_discounts`, `write_files`, `write_products`, `write_publications`.

## Getting set up

The full walkthrough — env vars, database, Rust toolchain, first run — lives in [INSTALLATION.md](./INSTALLATION.md). Read that before you start.

## Commands you'll actually use

### Day-to-day development

| Command | What it does |
| --- | --- |
| `bun run dev` | App + widget watcher + schema watcher, all running together. |
| `bun run dev:app` | Just the Shopify CLI dev server. |
| `bun run dev:widgets` | Vite watch-build for the storefront widget. |

### Build & deploy

| Command | What it does |
| --- | --- |
| `bun run build` | `shopify app build` |
| `bun run deploy` | `shopify app deploy` |
| `bun run build:widgets` | Vite production build for the widget. |
| `bun run build:schema` | Compile the widget schema from `/extension/schema/`. |
| `bun run update:config` | Regenerate `shopify.app.toml` from `.env`, then deploy config. |

### Database (from `/web`)

| Command | What it does |
| --- | --- |
| `bun migrate` | `prisma migrate dev` |
| `bun prisma:push` | Push schema without a migration — handy for prototypes. |
| `bun prisma:pull` | Pull schema from the database. |
| `bun prisma:migrate <name>` | Create a named migration. |
| `bun prisma:studio` | Open Prisma Studio. |
| `bun prepare` | Regenerate the Prisma client. |

### Code quality (from `/web`)

| Command | What it does |
| --- | --- |
| `bun graphql-codegen` | Regenerate types from the Admin API (2026-04). |
| `bun test` | Jest |
| `bun test:watch` | Jest in watch mode. |
| `bun test:coverage` | Jest with coverage. |
| `bun run pretty` | Prettier across the repo. |

## Documentation

| Document | What's inside |
| --- | --- |
| [**Agent Guardrails**](docs/AGENT_GUARDRAILS.md) | **Required reading for any AI agent touching this repo.** |
| [App Store Submission](docs/APP_STORE_SUBMISSION.md) | Submission checklist + protected customer data declarations. |
| [Features](docs/features.md) | The full catalog. |
| [App Guide](docs/app-guide.md) | Merchant-facing how-to. |
| [Free vs Pro](docs/free-vs-pro-features.md) | Plan tier matrix. |
| [Installation](docs/INSTALLATION.md) | Local dev setup. |
| [Technical Reference](docs/TECHNICAL_REFERENCE.md) | Architecture + schema cheatsheet. |

## Contributing

If you're an AI agent, read [Agent Guardrails](docs/AGENT_GUARDRAILS.md) first. Non-negotiable.

If you're a human, the same guardrails are still a fast way to learn how this codebase expects work to land.

---

Built by [RadiusTheme](https://radiustheme.com).
