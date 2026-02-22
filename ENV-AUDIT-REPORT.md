# Environment Variables Audit Report

> Generated: 2026-02-21 | Branch: `caching-test`

---

## 1. Overview: Two `.env` Files

Your project has two `.env` files with overlapping and duplicated values:

| File           | Purpose                    | Runtime                      |
| -------------- | -------------------------- | ---------------------------- |
| `/.env` (root) | Shopify CLI + root scripts | `shopify app dev` reads this |
| `/web/.env`    | Next.js app                | Next.js reads this           |

---

## 2. Root `/.env` — Full Audit

```env
# ---- Shopify CLI Credentials ----
SHOPIFY_API_KEY=90639cf08512143558f29fdc47f10d98    # ✅ Used by Shopify CLI
SHOPIFY_API_SECRET=58e60175810ec91583ddc6bbe4668e91  # ✅ Used by Shopify CLI
SCOPES=read_customers,read_orders,...                 # ⚠️ REDUNDANT — scopes are in shopify.app.toml

# ---- App Config ----
APP_NAME="Product Bundles"                            # ⚠️ REDUNDANT — name is in shopify.app.toml
APP_HANDLE="product-bundles47"                        # ⚠️ REDUNDANT — handle is in shopify.app.toml
HOST=https://hand-nam-vinyl-assessing.trycloudflare.com  # ✅ Dynamic tunnel URL (auto-updated by dev scripts)
SHOPIFY_API_VERSION="2025-10"                         # ⚠️ REDUNDANT — api_version is in shopify.app.toml
POS_EMBEDDED=false                                    # ⚠️ REDUNDANT — pos.embedded is in shopify.app.toml
DIRECT_API_MODE="offline"                             # ⚠️ REDUNDANT — in shopify.app.toml
EMBEDDED_APP_DIRECT_API_ACCESS=true                   # ⚠️ REDUNDANT — in shopify.app.toml
AUTO_UPDATE_URL=true                                  # ⚠️ REDUNDANT — in shopify.app.toml

# ---- Database ----
DATABASE_URL="postgresql://..."                       # ⚠️ DUPLICATED — also in web/.env

# ---- Dev ----
DEV_STORE_URL="bundles47.myshopify.com"               # ⚠️ REDUNDANT — dev_store_url is in shopify.app.toml
```

### Root `.env` Issues

| Issue                         | Severity | Details                                                                                                                                                                                                                            |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7 values duplicated from TOML | Low      | `SCOPES`, `APP_NAME`, `APP_HANDLE`, `SHOPIFY_API_VERSION`, `POS_EMBEDDED`, `DIRECT_API_MODE`, `EMBEDDED_APP_DIRECT_API_ACCESS`, `AUTO_UPDATE_URL` all exist in `shopify.app.toml`. Shopify CLI reads the TOML, not these env vars. |
| `DATABASE_URL` duplicated     | Medium   | Same connection string exists in both `/.env` and `/web/.env`. Single source of truth should be `/web/.env` since only Next.js/Prisma uses it.                                                                                     |
| `DEV_STORE_URL` redundant     | Low      | Already `dev_store_url` in TOML `[build]` section                                                                                                                                                                                  |
| API secret exposed            | High     | `SHOPIFY_API_SECRET` is in the root `.env` but this file is not in `/web/`. Make sure it's in `.gitignore`.                                                                                                                        |

---

## 3. Web `/web/.env` — Full Audit

```env
# ---- Database ----
DATABASE_URL="postgresql://..."       # ✅ Required by Prisma
DIRECT_DATABASE_URL="${DATABASE_URL}"  # ✅ Required by Prisma (direct connection for migrations)

# ---- The Problem ----
NEXT_PUBLIC_SHOP=bundles47.myshopify.com  # ❌ PROBLEM — see Section 4

# ---- Cron ----
CRON_SECRET="c7f3a9e2-..."            # ✅ Needed for cron route protection
```

---

## 4. The `NEXT_PUBLIC_SHOP` Problem

### What It Does

`NEXT_PUBLIC_SHOP` is used in exactly **one place** at runtime:

**`web/security/shop.ts:38-39`** — as the 3rd fallback in `detectShop()`:

```
1. ?shop= query parameter
2. shopify-shop cookie / shopify-session cookie
3. process.env.NEXT_PUBLIC_SHOP  ← THIS
4. "*.myshopify.com" wildcard fallback
```

`detectShop()` is called from **`web/proxy.ts:40`** (your middleware) to build the CSP `frame-ancestors` header:

```
frame-ancestors https://{shop} https://admin.shopify.com;
```

### Why It's Wrong

| Problem                                                   | Impact                                                                                                                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hardcoded to one shop**                                 | Multi-tenant apps serve many shops. This env var locks CSP to a single store.                                                                             |
| **`NEXT_PUBLIC_` prefix exposes it to the client bundle** | The shop domain gets baked into your JS bundle at build time. Every client downloads `bundles47.myshopify.com` in the JavaScript — unnecessary data leak. |
| **Must change per deployment**                            | As you noted, deploying to a new server requires updating this value.                                                                                     |
| **Not actually needed**                                   | Your server actions already get the shop from the session token (see below). The middleware just needs a different approach.                              |

### Why You Don't Need It

Your **entire server-side stack already works without it**. Here's the actual flow for all server actions:

```
Client (App Bridge sessionToken)
  → Server Action (receives sessionToken)
    → handleSessionToken(sessionToken)            [web/lib/shopify/auth/verify.ts:88]
      → shopify.session.decodeSessionToken(token) [decodes JWT]
      → normalizeShopDomain(payload.dest)          [strips https://]
      → returns { shop: "example.myshopify.com" }
```

Every action, service, and repository call already gets the shop from the **Shopify session token JWT**. The `NEXT_PUBLIC_SHOP` env var is only a crutch for the middleware CSP.

### The Shopify-Recommended Approach

Per [Shopify App Bridge docs](https://shopify.dev/docs/api/app-bridge-library):

> When Shopify admin loads your app path, the following parameters are available in the URL:
> `/my-app-path?embedded=1&shop={SHOP}&host={HOST}&id_token={ID_TOKEN}&...`

Shopify **always** provides the `shop` parameter in the URL query string when loading your embedded app. Your middleware already checks this as priority #1 in `detectShop()`. The env var fallback is only hit when:

- The request has no `?shop=` param (rare — only direct URL access)
- No cookies are set (first load scenario)

For the CSP `frame-ancestors`, the safe fallback is `*.myshopify.com` (which you already have as fallback #4). This is what Shopify's own app templates use.

---

## 5. Suggested Fix for `NEXT_PUBLIC_SHOP`

### Option A: Remove It Entirely (Recommended)

The `*.myshopify.com` wildcard is the standard Shopify approach for CSP when the specific shop is unknown. Your `detectShop()` already has this as fallback #4.

**Changes needed:**

1. **`web/security/shop.ts`** — Remove the env var fallback:

```typescript
export function detectShop(
    request?: NextRequest,
    searchParams?: URLSearchParams,
): string {
    // 1. Query param (Shopify always provides ?shop= for embedded apps)
    if (searchParams) {
        const shopParam = searchParams.get("shop");
        if (shopParam) return shopParam;
    }

    // 2. Cookies
    if (request) {
        const shopCookie = request.cookies.get("shopify-shop")?.value;
        if (shopCookie) return shopCookie;

        const sessionCookie = request.cookies.get("shopify-session")?.value;
        const shopFromSession = sessionCookie
            ? extractShopFromSession(sessionCookie)
            : null;
        if (shopFromSession) return shopFromSession;
    }

    // 3. Wildcard fallback (standard Shopify CSP pattern)
    return "*.myshopify.com";
}
```

2. **`web/next.config.js`** — Remove from env mapping:

```javascript
env: {
    NEXT_PUBLIC_HOST: process.env.HOST,
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    // Remove: NEXT_PUBLIC_SHOP
},
```

3. **`web/.env`** — Remove the line:

```diff
- NEXT_PUBLIC_SHOP=bundles47.myshopify.com
```

4. **`web/.env.example`** — Remove the line too.

### Option B: Make It Server-Only (If You Prefer Specific CSP)

If you want a specific shop domain in CSP rather than a wildcard, rename it to drop the `NEXT_PUBLIC_` prefix so it stays server-side only:

```env
# web/.env
SHOPIFY_SHOP_DOMAIN=bundles47.myshopify.com
```

But this still has the "must change per deployment" problem, so **Option A is strongly recommended**.

---

## 6. Other `NEXT_PUBLIC_` Variables Audit

| Variable                      | Set In                                         | Used In                                         | Assessment                            |
| ----------------------------- | ---------------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_HOST`            | `next.config.js` (from root `HOST`)            | `layout.tsx` for `shopify-app-origins` meta tag | ✅ OK — needed for App Bridge         |
| `NEXT_PUBLIC_SHOPIFY_API_KEY` | `next.config.js` (from root `SHOPIFY_API_KEY`) | `layout.tsx` for `shopify-api-key` meta tag     | ✅ OK — needed for App Bridge         |
| `NEXT_PUBLIC_SHOP`            | `next.config.js` + `web/.env`                  | `security/shop.ts` only                         | ❌ Remove — not needed                |
| `NEXT_PUBLIC_SHOPIFY_APP_URL` | Dev scripts update it                          | Not found in app code                           | ⚠️ Unused — clean up from dev scripts |

---

## 7. Suggested Clean `/web/.env`

```env
# Database (Prisma)
DATABASE_URL="postgresql://neondb_owner:npg_xxxxx@ep-flat-cloud-a1c9fbe2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_DATABASE_URL="${DATABASE_URL}"

# Cron job authentication
CRON_SECRET="c7f3a9e2-4b1d-47c6-8e5f-9d2c3a1b6e4f"
```

That's it. Three variables. Everything else comes from Shopify CLI (which reads `shopify.app.toml` and the root `.env` for `SHOPIFY_API_KEY`/`SHOPIFY_API_SECRET`).

---

## 8. Suggested Clean Root `/.env`

```env
# Shopify CLI credentials (required)
SHOPIFY_API_KEY=90639cf08512143558f29fdc47f10d98
SHOPIFY_API_SECRET=58e60175810ec91583ddc6bbe4668e91

# Dynamic tunnel URL (auto-updated by dev scripts)
HOST=https://hand-nam-vinyl-assessing.trycloudflare.com
```

Everything else (`SCOPES`, `APP_NAME`, `APP_HANDLE`, `SHOPIFY_API_VERSION`, `POS_EMBEDDED`, `DIRECT_API_MODE`, etc.) already lives in `shopify.app.toml` as the single source of truth.

---

## 9. Summary

| #   | Action                                                                  | Priority | Files                                                                                           |
| --- | ----------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| 1   | **Remove `NEXT_PUBLIC_SHOP`** from env, next.config.js, and shop.ts     | High     | `web/.env`, `web/.env.example`, `web/next.config.js`, `web/security/shop.ts`                    |
| 2   | **Remove redundant root env vars** (SCOPES, APP_NAME, APP_HANDLE, etc.) | Medium   | `/.env`                                                                                         |
| 3   | **Remove duplicate `DATABASE_URL`** from root `.env`                    | Medium   | `/.env`                                                                                         |
| 4   | **Clean up `NEXT_PUBLIC_SHOPIFY_APP_URL`** from dev scripts (unused)    | Low      | `scripts/update-env-host.js`, `scripts/update-and-generate.js`, `scripts/dev-with-auto-host.sh` |
| 5   | **Update `.env.example`** to reflect minimal required vars              | Low      | `web/.env.example`                                                                              |

---

## References

- [Shopify Session Tokens](https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens/set-up-session-tokens) — shop domain extracted from JWT `dest` claim
- [Embedded App Authorization](https://shopify.dev/docs/apps/build/authentication-authorization/set-embedded-app-authorization) — Shopify passes `?shop=` in URL automatically
- [App Bridge Setup](https://shopify.dev/docs/api/app-home) — `shopify-api-key` meta tag is the only required NEXT_PUBLIC value
