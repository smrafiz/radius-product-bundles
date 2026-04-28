# Radius Bundles — Technical Reference

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [System Architecture](#2-system-architecture)
3. [Data Flow](#3-data-flow)
4. [Code Structure](#4-code-structure)
5. [Database Schema](#5-database-schema)
6. [Authentication & Session Management](#6-authentication--session-management)
7. [API Routes & Proxy System](#7-api-routes--proxy-system)
8. [Webhook System](#8-webhook-system)
9. [Shopify Extensions](#9-shopify-extensions)
10. [State Management](#10-state-management)
11. [Caching & Performance](#11-caching--performance)
12. [Security Model](#12-security-model)
13. [Deployment Pipeline](#13-deployment-pipeline)
14. [Environment Configuration](#14-environment-configuration)

---

## 1. Tech Stack

### Core Framework

| Layer                     | Technology                   | Version |
| ------------------------- | ---------------------------- | ------- |
| Framework                 | Next.js (App Router)         | 16.1.6  |
| UI Library                | React                        | 19.2.4  |
| Language                  | TypeScript                   | 5.9.3   |
| Runtime / Package Manager | Bun                          | Latest  |
| Database                  | PostgreSQL (Neon Serverless) | —       |
| ORM                       | Prisma + Neon Adapter        | 7.4.1   |
| Hosting                   | Vercel                       | —       |
| Shopify CLI               | `@shopify/cli-kit`           | 3.91.0  |

### Frontend

| Package                   | Version | Purpose                    |
| ------------------------- | ------- | -------------------------- |
| @shopify/polaris (types)  | 1.0.1   | Shopify UI component types |
| @shopify/app-bridge-react | 4.2.10  | Embedded app bridge        |
| tailwindcss               | 4.2.0   | Utility-first CSS          |
| tailwind-merge            | 3.5.0   | Merge Tailwind classes     |
| recharts                  | 3.7.0   | Charting                   |
| @dnd-kit/core             | 6.3.1   | Drag & drop                |
| @dnd-kit/sortable         | 10.0.0  | Sortable lists             |
| react-hook-form           | 7.71.2  | Form management            |
| @hookform/resolvers       | 5.2.2   | Zod integration            |
| zod                       | 4.3.6   | Schema validation          |
| react-simple-wysiwyg      | 3.4.1   | Rich text editor           |
| react-player              | 3.4.0   | Media player               |
| react-range               | 1.10.0  | Range slider               |
| nprogress                 | 0.2.0   | Progress bar               |

### Server State & Data Fetching

| Package               | Version | Purpose                    |
| --------------------- | ------- | -------------------------- |
| @tanstack/react-query | 5.90.21 | Server state management    |
| zustand               | 5.0.11  | Client state (w/ Immer)    |
| @apollo/client        | 4.1.5   | Apollo GraphQL client      |
| graphql-request       | 7.4.0   | Lightweight GraphQL client |

### Shopify API & GraphQL

| Package                     | Version | Purpose                  |
| --------------------------- | ------- | ------------------------ |
| @shopify/shopify-api        | 12.3.0  | Admin API SDK            |
| @graphql-codegen/cli        | 6.1.1   | Type generation          |
| @shopify/api-codegen-preset | 1.2.2   | Shopify-specific codegen |
| API version                 | 2026-04 | Shopify Admin API        |

### Dev & Build Tools

| Package                | Version | Purpose                    |
| ---------------------- | ------- | -------------------------- |
| vite                   | 7.3.1   | Widget build tool          |
| eslint                 | 10.0.1  | Linting                    |
| prettier               | 3.8.1   | Formatting                 |
| jest                   | 30.2.0  | Testing                    |
| ts-jest                | 29.4.6  | TypeScript test transforms |
| @testing-library/react | 16.3.2  | Component testing          |
| concurrently           | 9.2.1   | Parallel script runner     |
| nodemon                | 3.1.14  | Dev file watcher           |
| postcss                | 8.5.6   | CSS processing             |
| sass-embedded          | 1.97.3  | SCSS compilation           |

### Rust Discount Function

| Crate            | Version | Purpose                  |
| ---------------- | ------- | ------------------------ |
| shopify_function | 2.0.2   | Shopify Function runtime |
| serde            | 1.0     | Serialization            |
| serde_json       | 1.0     | JSON handling            |

Release profile: LTO enabled, opt-level `z` (size), symbols stripped.

---

## 2. System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Shopify Admin                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ OAuth    │  │ Webhooks │  │ App      │  │ Discount         │    │
│  │ Flow     │  │ Delivery │  │ Proxy    │  │ Function (WASM)  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────────┘    │
└───────┼──────────────┼──────────────┼────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Vercel (Next.js 16)                                │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐                │
│  │ /api/auth   │  │ /api/       │  │ /api/proxy/  │                │
│  │ OAuth       │  │ webhooks    │  │ products     │                │
│  │ callback    │  │ handler     │  │ analytics    │                │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘                │
│         │                │                 │                         │
│         ▼                ▼                 ▼                         │
│  ┌──────────────────────────────────────────────────┐               │
│  │            Server Actions Layer                   │               │
│  │  (auth → service → repository → Prisma)          │               │
│  └───────────────────────┬──────────────────────────┘               │
│                          │                                           │
│  ┌───────────────────────┼──────────────────────────┐               │
│  │        Next.js Cache Components                   │               │
│  │        ("use cache" + cacheTag)                   │               │
│  └───────────────────────┬──────────────────────────┘               │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  PostgreSQL (Neon)  │
                │  Serverless Adapter │
                └─────────────────────┘
```

### Embedded App Architecture

- **Direct API mode**: `offline` — access tokens work without active user session
- **Embedded app direct API access**: enabled
- **App Proxy**: `/apps/bundles/` → `/api/proxy/`
- **Metafield**: `product.metafields.app.bundle_ids` (list.single_line_text_field)

### Shopify Access Scopes

```
read_customers, read_orders, read_price_rules, read_products, read_themes,
write_files, write_app_proxy, write_price_rules, write_products,
write_publications, write_script_tags, write_discounts
```

---

## 3. Data Flow

### Primary Request Flow (Dashboard)

```
React Component
  │
  ├─ useQuery(queryKey, queryFn)           ← React Query
  │
  ▼
Server Action ("use server")
  │
  ├─ handleSessionToken(jwt)               ← Auth validation
  │   ├─ Decode JWT (Shopify SDK)
  │   ├─ Token exchange (online/offline)
  │   └─ Store session in PostgreSQL
  │
  ├─ getCached*Function(shop, params)      ← Next.js "use cache"
  │   ├─ cacheTag(shop-scoped tag)
  │   └─ cacheLife("dashboard")
  │
  ▼
Service Layer
  │
  ├─ Business logic / transforms
  │
  ▼
Repository Layer
  │
  ├─ Prisma query → PostgreSQL
  │
  ▼
Response → React Query cache → Component render
```

### Storefront Widget Flow

```
Liquid Theme Extension
  │
  ├─ GET /apps/bundles/products?productId=...
  │   └─ HMAC-SHA256 signed by Shopify
  │
  ▼
App Proxy Route (/api/proxy/products)
  │
  ├─ verifyProxyRequest() → HMAC validation
  ├─ findOfflineSessionByShop(shop)
  ├─ Prisma: findBundlesByProductId()
  ├─ GraphQL: GetBundleProductsDocument
  │
  ▼
JSON response with Cache-Control headers
  │
  ▼
Widget renders bundle offer
```

### Analytics Tracking Flow

```
Storefront Widget
  │
  ├─ POST /apps/bundles/analytics
  │   Body: { type, bundleId, customerId, sessionId }
  │
  ▼
Analytics Proxy (/api/proxy/analytics)
  │
  ├─ verifyProxyRequest()
  ├─ Check: analytics enabled in AppSettings?
  ├─ trackAnalyticsEventAction()
  │   └─ INSERT BundleView (deduped by customer+date OR session+date)
  │
  ▼
BundleView table (raw events)
  │
  ▼
BundleAnalytics table (hourly aggregation)
```

### Webhook Data Flow (Order Tracking)

```
Shopify ORDERS_CREATE webhook
  │
  ├─ SDK verifies HMAC signature
  │
  ▼
handleOrdersCreate()
  │
  ├─ Parse order.line_items
  ├─ Filter items with _bundle_id property
  ├─ Group by bundleId
  │   ├─ Calculate: originalPrice - discount_allocations = actualPrice
  │   ├─ Multiply by quantity → itemRevenue
  │   └─ Detect new vs returning customer
  │
  ▼
trackBundlePurchase({ bundleId, revenue, customerId, isNewCustomer })
  │
  ▼
BundleAnalytics table (purchases + revenue)
```

### GraphQL Execution Paths

| Path          | Auth Source               | Use Case                    |
| ------------- | ------------------------- | --------------------------- |
| Server Action | JWT session token         | Dashboard mutations/queries |
| Proxy Client  | Offline session from DB   | Storefront product fetching |
| Cron Job      | Direct shop + accessToken | Scheduled bundle activation |

---

## 4. Code Structure

### Monorepo Layout

```
/
├── package.json                    # Root orchestration scripts
├── shopify.app.toml                # Shopify app configuration
├── vercel.json                     # Root Vercel config (cron jobs)
│
├── /web                            # Next.js application
│   ├── package.json                # App dependencies
│   ├── next.config.js              # Next.js 16 config (cacheComponents)
│   ├── tsconfig.json               # TypeScript config (path aliases)
│   ├── vercel.json                 # App Vercel config (build command)
│   ├── jest.config.js              # Jest test config
│   │
│   ├── /app                        # Next.js App Router
│   │   ├── /api                    # API routes
│   │   │   ├── /auth               # OAuth flow
│   │   │   ├── /auth/callback      # OAuth callback
│   │   │   ├── /webhooks           # Webhook handler
│   │   │   ├── /proxy/products     # Storefront product fetch
│   │   │   ├── /proxy/analytics    # Storefront event tracking
│   │   │   ├── /session/validate   # Session validation
│   │   │   ├── /upload             # File upload (CORS)
│   │   │   └── /cron               # Scheduled jobs
│   │   └── /(pages)                # App pages
│   │
│   ├── /features                   # Feature modules
│   │   ├── /bundles                # Bundle CRUD
│   │   ├── /settings               # App config + style customizer
│   │   ├── /analytics              # Views, carts, purchases, revenue
│   │   ├── /dashboard              # Dashboard + setup guide
│   │   ├── /ab-testing             # A/B test framework (schema only)
│   │   ├── /automation             # Automation engine (schema only)
│   │   ├── /pricing                # Dynamic pricing (partial)
│   │   ├── /templates              # Reusable bundle templates
│   │   └── /webhooks               # Webhook handlers
│   │
│   ├── /shared                     # Cross-feature code
│   │   ├── /components             # Polaris-based UI components
│   │   ├── /hooks                  # Shared hooks
│   │   ├── /utils                  # Utility functions
│   │   ├── /repositories           # Prisma connection + session storage
│   │   ├── /stores                 # Global Zustand stores
│   │   ├── /types                  # Shared TypeScript interfaces
│   │   ├── /actions                # Shared server actions
│   │   ├── /constants              # App-wide constants
│   │   └── /api                    # React Query setup
│   │
│   ├── /lib                        # Infrastructure
│   │   ├── /shopify/auth           # OAuth + token exchange
│   │   ├── /shopify/webhooks       # Webhook registration
│   │   ├── /shopify/proxy          # HMAC signature verification
│   │   ├── /graphql/client         # GraphQL execution clients
│   │   ├── /graphql/operations     # GraphQL query documents
│   │   ├── /graphql/generated      # Auto-generated types
│   │   └── /cache                  # Cache tags + invalidation
│   │
│   ├── /prisma                     # Database
│   │   ├── schema.prisma           # Schema definition (23 models)
│   │   └── /generated              # Prisma client output
│   │
│   └── /security                   # CSP + headers
│       ├── csp.ts                  # Content Security Policy
│       └── headers.ts              # Security headers
│
└── /extension
    └── /extensions
        ├── /product-bundle-widget          # Liquid theme extension
        │   └── shopify.extension.toml
        └── /radius-discount-function       # Rust WASM function
            ├── Cargo.toml
            └── /src
                ├── cart_lines_discounts_generate_run.rs
                └── cart_delivery_options_discounts_generate_run.rs
```

### Feature Module Structure

Each feature under `/web/features/<name>/` follows:

```
features/<name>/
├── actions/       # Next.js server actions (API boundary)
├── api/           # React Query keys, queries, mutations
├── components/    # Feature-specific UI components
├── hooks/         # Feature-specific React hooks
├── repositories/  # Prisma data access layer
├── services/      # Business logic (read/write/transform)
├── stores/        # Zustand state stores
├── types/         # TypeScript interfaces
├── constants/     # Feature constants
└── validation/    # Zod schemas
```

### Path Aliases (tsconfig)

```
@/*         → /web/*
@/lib/*     → /web/lib/*
@/features/* → /web/features/*
@/shared/*  → /web/shared/*
@/tests/*   → /web/tests/*
```

---

## 5. Database Schema

### Models Overview (23 total)

#### Core Models

| Model                  | Purpose                      | Key Fields                                                                                                                                                               |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Bundle**             | Product bundle definition    | name, type, status, discountType, discountValue, aiOptimized, aiScore, seoTitle, seoDescription, marketingCopy, volumeTiers (JSON), images, startDate/endDate, deletedAt |
| **BundleProduct**      | Products within a bundle     | productId, variantId, quantity, role (TRIGGER/REWARD/INCLUDED/OPTIONAL/GROUP_OPTION), customPrice                                                                        |
| **BundleProductGroup** | Groups for mix-and-match     | min/max selection constraints                                                                                                                                            |
| **BundleSettings**     | Widget display configuration | layout, theme, widgetJson, responsiveJson, styleJson, display toggles                                                                                                    |

#### Analytics Models

| Model               | Purpose                 | Key Fields                                                                                                  |
| ------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **BundleAnalytics** | Time-series metrics     | bundleId + date + hour (unique), views, carts, purchases, revenue, cross-sell metrics, customer type splits |
| **BundleView**      | Per-view event tracking | bundleId, customerId, sessionId, date (unique on customer+date and session+date for dedup)                  |

#### Testing & Automation

| Model                | Purpose                    | Key Fields                                                                                             |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| **ABTest**           | A/B test experiments       | hypothesis, type, status, trafficSplit, duration, minSampleSize, controlBundleId, variantConfig (JSON) |
| **TestResult**       | Test metric results        | variant, date, views, conversions, revenue                                                             |
| **Automation**       | Automation rules           | triggerType, triggerConfig/conditions/actions (JSON), execution counters                               |
| **AutomationBundle** | Bundle-automation junction | —                                                                                                      |
| **AutomationLog**    | Execution logs             | event, success, data, error                                                                            |

#### Pricing & AI

| Model                 | Purpose                 | Key Fields                                                                                       |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| **PricingRule**       | Dynamic pricing rules   | priority, conditions (JSON), discount config, revenueImpact                                      |
| **PricingRuleBundle** | Pricing-bundle junction | —                                                                                                |
| **AIInsight**         | AI recommendations      | type, category, confidence (Float), impact, actionable, actionType, actionData (JSON), expiresAt |

#### App Infrastructure

| Model                | Purpose                   | Key Fields                                                                                                           |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Shop**             | Merchant shop data        | domain (PK), status, plan, trialEndsAt, setupComplete, metafieldSetupDone, setupGuideDismissed, setupProgress (JSON) |
| **AppSettings**      | App-wide defaults         | defaults, displayConfig, labels/globalStyles (JSON), customCSS, cacheTtl                                             |
| **Session**          | OAuth sessions            | id, shop, accessToken, scope, isOnline, expires, state, apiKey                                                       |
| **OnlineAccessInfo** | Online access token data  | sessionId (FK), expiresIn, associatedUserScope                                                                       |
| **AssociatedUser**   | Shopify merchant user     | —                                                                                                                    |
| **Notification**     | User notifications        | type, priority                                                                                                       |
| **AlertRule**        | Alert conditions          | conditions (JSON), threshold, comparison, frequency                                                                  |
| **Template**         | Reusable bundle templates | —                                                                                                                    |
| **TemplateReview**   | Template ratings          | —                                                                                                                    |

### Enums

| Enum              | Values                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------- |
| BundleType        | FIXED_BUNDLE, BUY_X_GET_Y, BOGO, VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER |
| BundleStatus      | DRAFT, ACTIVE, PAUSED, ARCHIVED, SCHEDULED                                                  |
| DiscountType      | PERCENTAGE, FIXED_AMOUNT, CUSTOM_PRICE, NO_DISCOUNT, BUY_X_GET_Y, QUANTITY_BREAKS           |
| BundleProductRole | TRIGGER, REWARD, INCLUDED, OPTIONAL, GROUP_OPTION                                           |

### Key Database Indexes

```
Bundle:        @@unique([shop, name])
               @@index([shop, status, type])
               @@index([mainProductId])
               @@index([status, startDate])
               @@index([status, endDate])

BundleProduct: @@unique([bundleId, productId, variantId, role])
               @@index([bundleId, role])
               @@index([productId])
```

---

## 6. Authentication & Session Management

### OAuth 2.0 Flow

```
1. GET /api/auth?shop=...&returnTo=...
   │
   ├─ generateOAuthState(shop)
   │   Format: {shop}-{timestamp}-{randomString}
   │
   ▼
2. Redirect → Shopify OAuth authorize endpoint
   │
   ▼
3. GET /api/auth/callback?code=...&shop=...
   │
   ├─ Exchange code for access token
   │   POST to Shopify /admin/oauth/access_token
   │   with SHOPIFY_API_KEY + SHOPIFY_API_SECRET
   │
   ├─ Store session in PostgreSQL
   │
   ├─ First-time setup:
   │   ├─ runAppSetup()
   │   ├─ registerWebhooks()
   │   └─ markSetupComplete(shop)
   │
   ▼
4. Redirect to app dashboard
```

### Runtime Session Validation

```
App Bridge idToken()
  │
  ▼
verifyRequest(req)
  │
  ├─ Extract Bearer token from Authorization header
  ├─ shopify.session.decodeSessionToken(jwt)
  ├─ Normalize shop domain
  │
  ├─ Check DB for cached offline session
  │   └─ findOfflineSessionByShop(shop)
  │
  ├─ If expired or missing:
  │   └─ shopify.auth.tokenExchange({
  │        shop, sessionToken,
  │        requestedTokenType: OnlineAccessToken | OfflineAccessToken
  │      })
  │
  ├─ storeSession() → PostgreSQL upsert
  │
  ▼
Return { session, shop }
```

### Token Types

| Type                 | Lifetime      | Use Case               | Storage                           |
| -------------------- | ------------- | ---------------------- | --------------------------------- |
| Session Token (JWT)  | Short-lived   | App Bridge requests    | Client memory                     |
| Online Access Token  | ~24 hours     | User-scoped API calls  | PostgreSQL                        |
| Offline Access Token | Until revoked | Server-to-server calls | PostgreSQL (ID: `offline_{shop}`) |

### Session Validation API

```
POST /api/session/validate
Authorization: Bearer {sessionToken}
→ Returns: { valid, shop, sessionId, isOnline, scope }

```

---

## 7. API Routes & Proxy System

### Route Map

| Route                        | Method | Auth               | Purpose                     |
| ---------------------------- | ------ | ------------------ | --------------------------- |
| `/api/auth`                  | GET    | None               | OAuth initiation            |
| `/api/auth/callback`         | GET    | OAuth code         | Token exchange              |
| `/api/webhooks`              | POST   | HMAC signature     | Webhook handler             |
| `/api/proxy/products`        | GET    | App Proxy HMAC     | Storefront product data     |
| `/api/proxy/analytics`       | POST   | App Proxy HMAC     | Storefront event tracking   |
| `/api/session/validate`      | POST   | Bearer JWT         | Session validation          |
| `/api/upload`                | POST   | Bearer + CORS      | File upload proxy           |
| `/api/cron/bundle-scheduler` | GET    | Bearer CRON_SECRET | Scheduled bundle activation |
| `/api/cron/keep-alive`       | GET    | Bearer CRON_SECRET | Serverless warm-up          |

### App Proxy Signature Verification

All `/api/proxy/*` requests are signed by Shopify:

```
1. Extract `signature` from query params
2. Remove signature, sort remaining params alphabetically
3. Join as "key=value" (no separator)
4. HMAC-SHA256(message, SHOPIFY_API_SECRET)
5. Compare computed digest with provided signature
```

### Products Proxy — Two Query Modes

**Mode A: By IDs** (`?ids=gid1,gid2,...`)

- Returns lightweight product list (id, title, price, image, handle, available)
- Cache-Control: `public, max-age={ttl}` (configurable per shop)

**Mode B: By Product** (`?productId=gid://...`)

- Returns ACTIVE bundles containing that product
- Sorts by priority or savings amount
- Fetches Shopify product details via GraphQL
- Keeps top 1 bundle per product

### Upload Proxy

- Supports Google Cloud Storage signed URLs (PUT) and Shopify staged uploads (POST)
- CORS: `Access-Control-Allow-Origin: *`
- Proxies raw file buffer to Shopify staged upload endpoint

---

## 8. Webhook System

### Registered Topics

| Topic             | Handler                  | Purpose                                   |
| ----------------- | ------------------------ | ----------------------------------------- |
| `APP_UNINSTALLED` | `handleAppUninstalled()` | Clean up Shop record                      |
| `SHOP_UPDATE`     | `handleShopUpdate()`     | Log currency/timezone changes             |
| `ORDERS_CREATE`   | `handleOrdersCreate()`   | Parse bundles in orders → track revenue   |
| `PRODUCTS_DELETE` | `handleProductsDelete()` | Soft-delete bundles with deleted products |

### Cold-Start Recovery

Serverless functions lose in-memory state between invocations. The webhook route handles this:

```typescript
// /api/webhooks/route.ts
const handlers = shopify.webhooks.getHandlers(topic);
if (!handlers || handlers.length === 0) {
    addHandlers(); // Re-register handlers in-process
}
```

### Webhook Registration

Triggered on first auth:

```typescript
registerWebhooks(session)
  ├─ addHandlers()  // Register handler functions
  └─ shopify.webhooks.register({ session })  // Send to Shopify
```

### Order Processing Pipeline

```
Order webhook → Parse line_items → Filter by _bundle_id property
  → Group by bundleId → Calculate revenue per bundle
  → Detect new vs returning customer (orders_count)
  → trackBundlePurchase() → INSERT BundleAnalytics
```

---

## 9. Shopify Extensions

### Theme Extension (Liquid Widget)

```toml
# /extension/extensions/product-bundle-widget/shopify.extension.toml
api_version = "2025-07"
type = "theme"
handle = "product-bundle-widget"
```

- Renders bundle offers on product pages
- Fetches data via App Proxy (`/apps/bundles/products?productId=...`)
- Tracks views/carts via App Proxy (`/apps/bundles/analytics`)
- No custom authentication (inherits from Shopify embed context)

### Discount Function (Rust WASM)

```toml
# /extension/extensions/radius-discount-function/shopify.extension.toml
api_version = "2025-04"
type = "function"
handle = "radius-discount-function"

[[extensions.targeting]]
target = "cart.lines.discounts.generate.run"
input_query = "src/cart_lines_discounts_generate_run.graphql"

[[extensions.targeting]]
target = "cart.delivery-options.discounts.generate.run"
```

**Capabilities**:

- Line-item discounts: Percentage, fixed amount, custom price, quantity breaks
- Delivery discounts: Free shipping per bundle
- Reads bundle config from cart line attributes (`_bundle_id`, `_bundle_discount_*`)
- Validates product GIDs from merchandise (tamper-proof)

**Performance Profile**:

- LTO + opt-level `z` + strip → minimal WASM binary
- O(n\*m) complexity: n = cart lines, m = bundles (typical <500 ops)
- Zero allocations on happy path (empty cart, no bundles)
- Single JSON parse per invocation
- No caching (real-time accuracy required)
- Typical execution: <1ms

---

## 10. State Management

### Three Layers

| Layer         | Technology             | Scope                | Persistence                |
| ------------- | ---------------------- | -------------------- | -------------------------- |
| Server State  | React Query (TanStack) | API data             | In-memory + HTTP cache     |
| Feature State | Zustand + Immer        | Per-feature UI state | Transient (no persistence) |
| Form State    | React Hook Form + Zod  | Form inputs          | Component lifecycle        |

### Global Zustand Stores (`/web/shared/stores/`)

| Store                 | Key State                                               |
| --------------------- | ------------------------------------------------------- |
| `session.store`       | shop, host, sessionToken, hasValidSession, isValidating |
| `shop-settings.store` | settings (ShopSettings), isInitialized                  |
| `modal.store`         | openModals (stack-based)                                |
| `global-banner.store` | banners (queue-based)                                   |

### React Query Configuration

**Global Defaults**:

```
staleTime: 60s
gcTime: 10min
retry: 1
refetchOnWindowFocus: false
```

**Per-Feature Overrides**:

| Feature           | staleTime | gcTime | Notes                          |
| ----------------- | --------- | ------ | ------------------------------ |
| Bundle list       | 5 min     | 10 min | refetchOnWindowFocus: false    |
| Bundle detail     | 5 min     | 10 min | enabled: !!bundleId            |
| Analytics metrics | 2 min     | 10 min | —                              |
| Analytics chart   | 2 min     | 10 min | —                              |
| Top bundles       | 5 min     | 10 min | —                              |
| Paginated bundles | 5 min     | 10 min | placeholderData: previous      |
| Settings          | 5 min     | 10 min | refetchOnMount: true, retry: 2 |
| Setup guide       | 10 min    | 10 min | Matches server cache           |

### Cross-Tab Synchronization

**Implementation**: `BroadcastChannel` API

| Message                | Effect                                        |
| ---------------------- | --------------------------------------------- |
| `INVALIDATE_BUNDLES`   | Invalidates bundle queries across all tabs    |
| `INVALIDATE_ANALYTICS` | Invalidates analytics queries across all tabs |

---

## 11. Caching & Performance

### Caching Layers

```
┌─────────────────────────────────────────────────┐
│ Layer 1: CDN / Browser Cache                     │
│ HTTP Cache-Control: public, max-age={ttl}        │
│ Configurable per shop (default: 300s)            │
├─────────────────────────────────────────────────┤
│ Layer 2: React Query (Client)                    │
│ In-memory cache with staleTime + gcTime          │
│ Cross-tab sync via BroadcastChannel              │
├─────────────────────────────────────────────────┤
│ Layer 3: Next.js Cache Components (Server)       │
│ "use cache" directive + cacheTag + cacheLife      │
│ Per-shop tag isolation                            │
├─────────────────────────────────────────────────┤
│ Layer 4: Database (Neon Serverless)              │
│ Connection pooling + Prisma singleton             │
│ Indexed queries on shop/status/type/dates         │
└─────────────────────────────────────────────────┘
```

### Next.js Cache Components

**Config** (`next.config.js`):

```javascript
cacheComponents: true,
cacheLife: {
    dashboard: {
        stale: 300,       // 5 min
        revalidate: 300,  // 5 min
        expire: 3600,     // 1 hour max
    },
    "dashboard-long": {
        stale: 600,       // 10 min
        revalidate: 600,  // 10 min
        expire: 3600,     // 1 hour max
    },
}
```

### Cache Tags (Multi-Tenant Isolation)

| Tag Pattern                | TTL    | Invalidation Trigger        |
| -------------------------- | ------ | --------------------------- |
| `analytics-metrics-{shop}` | 5 min  | Bundle create/update/delete |
| `top-bundles-{shop}`       | 10 min | Bundle status change        |
| `chart-data-{shop}`        | 5 min  | Analytics data change       |
| `setup-guide-{shop}`       | 10 min | Setup step completion       |

### Cache Invalidation

```typescript
// /web/lib/cache/invalidate-dashboard.ts
invalidateDashboardCache(shop); // All analytics tags
invalidateSetupGuideCache(shop); // Setup guide tag
```

Uses Next.js `updateTag()` for read-your-own-writes semantics.

### Database Performance

- **Neon Serverless Adapter**: Built-in connection pooling for edge/serverless
- **Prisma Singleton**: Global instance prevents connection leaks
- **Composite Indexes**: Match primary query patterns (shop + status + type)
- **Unique Constraints**: Dedup analytics events at DB level

### Build Performance

- **Turbopack**: Filesystem cache enabled for dev (`turbopackFileSystemCacheForDev: true`)
- **Tailwind CSS 4**: PostCSS pipeline with `@tailwindcss/postcss`
- **Vite 7**: Widget builds with watch mode for dev

---

## 12. Security Model

### Authentication Matrix

| Endpoint             | Mechanism              | Verification                  |
| -------------------- | ---------------------- | ----------------------------- |
| Dashboard (embedded) | Shopify App Bridge JWT | SDK `decodeSessionToken()`    |
| App Proxy routes     | HMAC-SHA256 signature  | Custom `verifyProxyRequest()` |
| Webhook routes       | HMAC-SHA256 on body    | SDK `webhooks.process()`      |
| Cron jobs            | Bearer token           | `CRON_SECRET` comparison      |
| Upload API           | Bearer token + CORS    | Auth header extraction        |

### Content Security Policy

```
default-src    'self'
script-src     'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopify.com
style-src      'self' 'unsafe-inline' https://cdn.shopify.com
img-src        'self' data: https: blob:
font-src       'self' https://fonts.gstatic.com https://cdn.shopify.com
connect-src    'self' https://*.shopify.com wss://*.shopify.com
frame-ancestors https://{shop} https://admin.shopify.com
form-action    'self'
base-uri       'self'
```

> `unsafe-inline` + `unsafe-eval` required for Shopify embedded app context.

### Security Headers

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-DNS-Prefetch-Control: on
```

### Session Security

- Sessions stored in PostgreSQL (encrypted in transit via Neon SSL)
- Offline session ID: deterministic `offline_{shop}` (idempotent lookups)
- Token format validation: `shpat_` prefix check + minimum length
- Expiry enforcement: `isSessionExpired()` compares against `session.expires`

### HMAC Signature Verification (App Proxy)

```
1. Extract signature from query params
2. Sort remaining params alphabetically
3. Concatenate as key=value (no separator)
4. HMAC-SHA256(concatenated, SHOPIFY_API_SECRET)
5. Compare hex digests
```

### Webhook Signature Verification

Delegated to Shopify SDK's `webhooks.process()` — HMAC-SHA256 on raw request body using `SHOPIFY_API_SECRET`.

### GDPR Compliance

- `APP_UNINSTALLED` webhook triggers `deleteSession()`
- GDPR webhook endpoints available (`CUSTOMERS_ERASURE_REQUEST`, `SHOP_REDACT_REQUEST`)
- No explicit TTL on analytics data (potential improvement area)

---

## 13. Deployment Pipeline

### Vercel Build Pipeline

```
1. bun prisma:push        → Push schema to PostgreSQL
2. bun prepare             → Generate Prisma client
3. bun graphql-codegen     → Generate TS types from Shopify Admin API schema
4. next build              → Build Next.js application
```

### Scheduled Jobs (Vercel Crons)

| Schedule                         | Path                         | Purpose                               |
| -------------------------------- | ---------------------------- | ------------------------------------- |
| `0 0 * * *` (daily midnight UTC) | `/api/cron/bundle-scheduler` | Activate/deactivate scheduled bundles |
| `*/4 * * * *` (every 4 min)      | `/api/cron/keep-alive`       | Prevent cold starts                   |

### Shopify Extension Deployment

```bash
bun run deploy              # shopify app deploy (all extensions)
bun run build:schema        # Build widget schema from /extension/schema/
bun run build:widgets       # Vite build storefront widgets
```

### Development Commands

| Command               | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `bun run dev`         | Concurrent: app + widgets + schema watcher |
| `bun run dev:app`     | Shopify CLI dev server only                |
| `bun run dev:widgets` | Vite watch-build for storefront widgets    |
| `bun run dev:full`    | Auto-update env host + codegen then dev    |

### Database Commands (run from `/web`)

| Command                 | Purpose                       |
| ----------------------- | ----------------------------- |
| `bun run migrate`       | `prisma migrate dev`          |
| `bun run prisma:push`   | Push schema without migration |
| `bun run prisma:pull`   | Pull schema from DB           |
| `bun run prisma:studio` | Open Prisma Studio GUI        |

### Code Quality

| Command                   | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `bun run graphql-codegen` | Generate types from Shopify Admin API 2026-04 |
| `bun run test`            | Jest test suite                               |
| `bun run test:watch`      | Jest watch mode                               |
| `bun run test:coverage`   | Jest with coverage report                     |
| `bun run pretty`          | Prettier on entire repo                       |
| `npx tsc --noEmit`        | Type checking                                 |

---

## 14. Environment Configuration

### Required Variables

| Variable              | Location    | Purpose                              |
| --------------------- | ----------- | ------------------------------------ |
| `SHOPIFY_API_KEY`     | Root `.env` | OAuth client ID                      |
| `SHOPIFY_API_SECRET`  | Root `.env` | OAuth secret + HMAC key              |
| `SCOPES`              | Root `.env` | Comma-separated OAuth scopes         |
| `HOST`                | Root `.env` | Public app URL (auto-updated by CLI) |
| `SHOPIFY_API_VERSION` | Root `.env` | API version (2026-04)                |
| `DATABASE_URL`        | Web `.env`  | PostgreSQL connection (Neon pooled)  |
| `DIRECT_DATABASE_URL` | Web `.env`  | Direct DB connection (migrations)    |
| `NEXT_PUBLIC_SHOP`    | Web `.env`  | Shop domain (client-side fallback)   |
| `CRON_SECRET`         | Web `.env`  | Vercel cron bearer token             |

### Next.js Configuration Highlights

```javascript
// next.config.js
{
    reactStrictMode: true,
    cacheComponents: true,
    images: { remotePatterns: [{ hostname: "cdn.shopify.com" }] },
    turbopackFileSystemCacheForDev: true,
    rewrites: [{ source: "/apps/bundle-api/:path*", destination: "/api/bundle-api/:path*" }],
}
```

### TypeScript Configuration

```json
{
    "target": "ES2023",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler"
}
```

---

## Feature Maturity Matrix

| Feature                  | Status      | Schema | Logic | UI           |
| ------------------------ | ----------- | ------ | ----- | ------------ |
| Bundle CRUD (6 types)    | Done        | Yes    | Yes   | Yes          |
| Analytics                | Done        | Yes    | Yes   | Yes          |
| Settings/Customizer      | Done        | Yes    | Yes   | Yes          |
| Discount Function (Rust) | Done        | N/A    | Yes   | N/A          |
| Theme Widget (Liquid)    | Done        | N/A    | Yes   | Yes          |
| Dashboard + Setup Guide  | Done        | Yes    | Yes   | Yes          |
| A/B Testing              | Schema only | Yes    | No    | Placeholder  |
| Automation               | Schema only | Yes    | No    | Types only   |
| Dynamic Pricing          | Partial     | Yes    | No    | Static cards |
| AI Insights              | Schema only | Yes    | No    | Placeholder  |
| FBT (Frequently Bought)  | Label only  | Enum   | No    | No           |

---

_Generated for Radius Bundles — Next.js 16 + React 19 + Prisma 7 + Shopify 2026-04_
