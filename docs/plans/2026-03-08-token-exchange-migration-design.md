# Auth Migration: OAuth Code Grant → Token Exchange

## Overview

Migrate from legacy OAuth authorization code grant to Shopify-recommended token exchange flow for embedded apps. The app already uses token exchange as its primary auth mechanism — this migration removes the legacy OAuth fallback and simplifies the auth surface.

## Motivation

- Shopify requires session tokens for embedded apps (App Store requirement 1.1.1)
- Token exchange eliminates redirects, page flicker, and CSRF state management
- Reduces auth surface area (3 files deleted, fewer attack vectors)
- Aligns with official `shopify-app-react-router` template

## What Does NOT Change

| Component                | File                                           | Reason                                            |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------- |
| Token exchange logic     | `lib/shopify/auth/verify.ts`                   | Already implements `shopify.auth.tokenExchange()` |
| Session storage          | `shared/repositories/session-storage.ts`       | Encryption layer unchanged                        |
| Token encryption         | `lib/crypto/token-encryption.ts`               | AES-256-GCM + `shpat_` passthrough                |
| Session validation API   | `app/api/session/validate/route.ts`            | Uses `verifyRequest()` → token exchange           |
| Session store (Zustand)  | `shared/stores/session.store.ts`               | Client state management                           |
| SessionProvider hook     | `shared/hooks/session/use-session-provider.ts` | App Bridge → `storeToken()` → validate            |
| ProtectedRoute component | `shared/components/auth/protected-route.tsx`   | Session check wrapper                             |
| App proxy verification   | `lib/shopify/proxy/verify-proxy.ts`            | Separate HMAC verification                        |
| Webhook auth             | `app/api/webhooks/route.ts`                    | Shopify SDK HMAC                                  |
| Server actions           | All `handleSessionToken(token)` calls          | Already token exchange based                      |
| Shopify SDK config       | `lib/shopify/config/initialize-context.ts`     | `isEmbeddedApp: true`                             |

## Changes

### A. Replace `/api/auth/route.ts` — Bounce redirect

**Before:** Redirects to Shopify OAuth authorize endpoint with state/HMAC.
**After:** Redirects to embedded app URL inside Shopify admin.

```
GET /api/auth?shop=foo.myshopify.com&returnTo=/dashboard
  → 302 https://foo.myshopify.com/admin/apps/{client_id}/dashboard
```

App Bridge loads in embedded context → `useSessionProvider` → token exchange. No OAuth code grant needed.

### B. Modify `useProtectedSession` — Remove OAuth fallback

**Before:** Session failure → redirect to `/api/auth?returnTo=...` (OAuth code grant).
**After:** Session failure → re-attempt via App Bridge. Last resort → bounce redirect to embedded URL.

Fallback chain:

1. App Bridge `idToken()` → token exchange (normal)
2. Retry up to 3 times (existing in `useSessionProvider`)
3. Bounce redirect to embedded app URL (instead of OAuth)

### C. Delete legacy OAuth files

| File                                    | Reason                                   |
| --------------------------------------- | ---------------------------------------- |
| `app/api/auth/callback/route.ts`        | No authorization code to exchange        |
| `lib/shopify/auth/oauth-state-store.ts` | CSRF state only used by OAuth code grant |
| `lib/shopify/auth/verify-hmac.ts`       | OAuth HMAC only used by callback         |

Note: `verify-proxy.ts` (app proxy HMAC) is separate and unchanged.

### D. Update `shopify.app.toml`

Remove `[auth].redirect_urls` section — no callback URLs needed for token exchange. Shopify managed installation handles everything (`use_legacy_install_flow = false` already set).

### E. Update `tomlWriter.ts`

Remove auth callback URL generation from developer tooling.

### F. Remove `createSessionConfig` from `session-helpers.ts`

Only consumed by deleted callback route. Shopify SDK creates session objects during token exchange automatically.

## Auth Flow After Migration

```
Merchant installs app
  → Shopify managed installation (TOML scopes, use_legacy_install_flow=false)
  → App loads in admin iframe

App loads
  → App Bridge initializes
  → useSessionProvider: app.idToken() → JWT session token
  → storeToken(token) server action
    → handleSessionToken(token)
      → shopify.session.decodeSessionToken(token) — validates JWT signature
      → tokenExchange({shop, sessionToken}) — exchanges for access token
        → Reuses existing offline session if valid
        → OR calls shopify.auth.tokenExchange() for new token
      → storeSession(session) — encrypts & stores in DB
      → First-time: runAppSetup() + registerWebhooks()
  → validateSession() → POST /api/session/validate
    → verifyRequest() → handleSessionToken() → returns {valid, shop}
  → Zustand store updated: hasValidSession=true

Subsequent requests (server actions)
  → Client passes sessionToken from Zustand store
  → handleSessionToken(token) on server
  → Reuses cached offline session if not expired
  → Returns {shop, session} for data access

App proxy (storefront widget)
  → verifyAppProxySignature() — separate HMAC, unchanged
  → findOfflineSessionByShop() → decryptToken() → Shopify API calls

Edge case: accessed outside iframe
  → /api/auth?shop=X → 302 to embedded URL
  → App Bridge loads → token exchange (normal flow)
```

## Risk Assessment

| Risk                             | Likelihood | Mitigation                                                  |
| -------------------------------- | ---------- | ----------------------------------------------------------- |
| Existing `shpat_*` tokens in DB  | Zero       | `decryptToken()` passthrough unchanged                      |
| Token exchange failure           | Low        | 3 retries in `useSessionProvider`, bounce redirect fallback |
| App accessed outside iframe      | Low        | Bounce redirect into embedded context                       |
| App proxy breaks                 | Zero       | Uses separate HMAC, not OAuth                               |
| Webhooks break                   | Zero       | Uses SDK HMAC, not OAuth                                    |
| Orphaned `oauth_state_*` DB rows | Cosmetic   | Harmless, optional cleanup later                            |
| Shopify app review rejection     | Zero       | Token exchange is the required/recommended flow             |

## Files Summary

**Modified (3):**

- `web/app/api/auth/route.ts` — OAuth redirect → embedded bounce
- `web/shared/hooks/session/use-protected-session.ts` — OAuth fallback → bounce redirect
- `web/_developer/tomlWriter.ts` — remove callback URL generation

**Deleted (3):**

- `web/app/api/auth/callback/route.ts`
- `web/lib/shopify/auth/oauth-state-store.ts`
- `web/lib/shopify/auth/verify-hmac.ts`

**Updated (1):**

- `shopify.app.toml` — remove `[auth].redirect_urls`

**Cleanup (1):**

- `web/shared/utils/shopify/session-helpers.ts` — remove `createSessionConfig` function
