# Token Exchange Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove legacy OAuth authorization code grant flow and rely solely on Shopify-recommended token exchange for embedded app authentication.

**Architecture:** The app already uses token exchange as its primary auth path via `handleSessionToken()` → `shopify.auth.tokenExchange()`. This migration deletes the unused OAuth code grant fallback (`/api/auth/callback`, HMAC verification, state management) and replaces the `/api/auth` route with a simple bounce redirect into the Shopify admin embedded context.

**Tech Stack:** Next.js 16 App Router, Shopify App Bridge, @shopify/shopify-api, Zustand, Prisma

---

### Task 1: Replace `/api/auth/route.ts` with bounce redirect

**Files:**
- Modify: `web/app/api/auth/route.ts`

**Step 1: Rewrite the auth route as an embedded bounce redirect**

Replace the entire file contents with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { isValidShopDomain } from "@/shared";

const CLIENT_ID = process.env.SHOPIFY_API_KEY!;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");
    const returnTo = searchParams.get("returnTo") || "/";

    if (!shop || !isValidShopDomain(shop)) {
        return NextResponse.json(
            { error: "Invalid or missing shop domain" },
            { status: 400 },
        );
    }

    const embeddedUrl = `https://${shop}/admin/apps/${CLIENT_ID}${returnTo}`;
    return NextResponse.redirect(embeddedUrl);
}
```

**Step 2: Verify the change compiles**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `web/app/api/auth/route.ts`

**Step 3: Commit**

```bash
git add web/app/api/auth/route.ts
git commit -m "refactor(auth): replace OAuth redirect with embedded bounce"
```

---

### Task 2: Update `useProtectedSession` to use bounce redirect

**Files:**
- Modify: `web/shared/hooks/session/use-protected-session.ts`

**Step 1: Replace the OAuth redirect with embedded bounce**

In the `catch` block (around line 56-66), change the auth URL construction from:

```typescript
const shopParam =
    searchParamsRef.current.get("shop") || shop;
const authUrl = `/api/auth?returnTo=${encodeURIComponent(pathnameRef.current)}${
    shopParam ? `&shop=${shopParam}` : ""
}`;

setTimeout(() => router.push(authUrl), 0);
```

To:

```typescript
const shopParam =
    searchParamsRef.current.get("shop") || shop;

if (shopParam) {
    const embeddedUrl = `https://${shopParam}/admin/apps/${process.env.NEXT_PUBLIC_SHOPIFY_API_KEY}${pathnameRef.current}`;
    setTimeout(() => window.open(embeddedUrl, "_top"), 0);
} else {
    const authUrl = `/api/auth?returnTo=${encodeURIComponent(pathnameRef.current)}`;
    setTimeout(() => router.push(authUrl), 0);
}
```

**Step 2: Verify the env var exists**

Check if `NEXT_PUBLIC_SHOPIFY_API_KEY` is set. If not, check `.env.example` and `.env` for the pattern used.

Run: `grep -r "NEXT_PUBLIC_SHOPIFY_API_KEY" /Users/radiustheme/Shopify/radius-product-bundles/web/ --include="*.ts" --include="*.tsx" --include="*.env*" | head -10`

If it doesn't exist, we need to either:
- Add `NEXT_PUBLIC_SHOPIFY_API_KEY` to env (duplicating `SHOPIFY_API_KEY` for client-side access)
- OR keep the `/api/auth` bounce redirect as the fallback (simpler, no new env var needed)

**Preferred approach if env var doesn't exist:** Keep the `/api/auth` route as fallback — it's now just a bounce redirect anyway:

```typescript
const shopParam =
    searchParamsRef.current.get("shop") || shop;
const authUrl = `/api/auth?returnTo=${encodeURIComponent(pathnameRef.current)}${
    shopParam ? `&shop=${shopParam}` : ""
}`;

setTimeout(() => router.push(authUrl), 0);
```

This means **no change needed** if the `/api/auth` route already does the bounce redirect (from Task 1). The existing code in `useProtectedSession` calls `/api/auth` which now bounces to the embedded URL instead of starting an OAuth flow.

**Step 3: Verify the change compiles**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

**Step 4: Commit (only if changes were made)**

```bash
git add web/shared/hooks/session/use-protected-session.ts
git commit -m "refactor(auth): update session fallback to use bounce redirect"
```

---

### Task 3: Delete OAuth callback route

**Files:**
- Delete: `web/app/api/auth/callback/route.ts`

**Step 1: Verify no other files import from the callback route**

Run: `grep -r "auth/callback" /Users/radiustheme/Shopify/radius-product-bundles/web/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".toml"`
Expected: Only `web/app/api/auth/route.ts` (old reference in redirect_uri, now removed) and possibly `tomlWriter.ts` (handled in Task 6)

**Step 2: Delete the file**

```bash
rm web/app/api/auth/callback/route.ts
```

**Step 3: Remove empty callback directory if it exists**

```bash
rmdir web/app/api/auth/callback/ 2>/dev/null || true
```

**Step 4: Verify no type errors**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

**Step 5: Commit**

```bash
git add -A web/app/api/auth/callback/
git commit -m "refactor(auth): remove legacy OAuth callback route"
```

---

### Task 4: Delete OAuth state store

**Files:**
- Delete: `web/lib/shopify/auth/oauth-state-store.ts`

**Step 1: Verify no other files import oauth-state-store**

Run: `grep -r "oauth-state-store" /Users/radiustheme/Shopify/radius-product-bundles/web/ --include="*.ts" --include="*.tsx" | grep -v node_modules`
Expected: Only `web/app/api/auth/route.ts` (old import, now removed in Task 1) and `web/app/api/auth/callback/route.ts` (deleted in Task 3)

**Step 2: Delete the file**

```bash
rm web/lib/shopify/auth/oauth-state-store.ts
```

**Step 3: Verify no type errors**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

**Step 4: Commit**

```bash
git add web/lib/shopify/auth/oauth-state-store.ts
git commit -m "refactor(auth): remove OAuth state store (CSRF no longer needed)"
```

---

### Task 5: Delete OAuth HMAC verification

**Files:**
- Delete: `web/lib/shopify/auth/verify-hmac.ts`

**Step 1: Verify no other files import verify-hmac**

Run: `grep -r "verify-hmac" /Users/radiustheme/Shopify/radius-product-bundles/web/ --include="*.ts" --include="*.tsx" | grep -v node_modules`
Expected: Only `web/app/api/auth/callback/route.ts` (already deleted in Task 3)

**IMPORTANT:** Do NOT confuse with `web/lib/shopify/proxy/verify-proxy.ts` — that file stays.

**Step 2: Delete the file**

```bash
rm web/lib/shopify/auth/verify-hmac.ts
```

**Step 3: Verify no type errors**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

**Step 4: Commit**

```bash
git add web/lib/shopify/auth/verify-hmac.ts
git commit -m "refactor(auth): remove OAuth HMAC verification (token exchange uses JWT)"
```

---

### Task 6: Remove `createSessionConfig` and dead helper functions

**Files:**
- Modify: `web/shared/utils/shopify/session-helpers.ts`

**Step 1: Verify nothing imports the functions being removed**

Run: `grep -r "createSessionConfig\|generateOfflineSessionId\|validateSessionToken" /Users/radiustheme/Shopify/radius-product-bundles/web/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v "session-helpers.ts"`
Expected: Only `web/app/api/auth/callback/route.ts` (already deleted)

**Step 2: Delete the entire file**

Since all three exported functions are dead code:

```bash
rm web/shared/utils/shopify/session-helpers.ts
```

**Step 3: Remove the barrel export**

In `web/shared/utils/shopify/index.ts`, remove the line:

```typescript
export * from "./session-helpers";
```

So it becomes:

```typescript
export * from "./media-upload";
export * from "./shopify-helpers";
```

**Step 4: Verify no type errors**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

**Step 5: Commit**

```bash
git add web/shared/utils/shopify/session-helpers.ts web/shared/utils/shopify/index.ts
git commit -m "refactor(auth): remove dead session helper functions"
```

---

### Task 7: Update `tomlWriter.ts` — remove auth redirect URLs

**Files:**
- Modify: `web/_developer/tomlWriter.ts` (lines 75-81)

**Step 1: Remove the auth config block**

Replace lines 75-81:

```typescript
    // Auth
    config.auth = {
        redirect_urls: [
            `${appUrl}/api/auth/callback`,
            `${appUrl}/api/auth/oauth/callback`,
        ],
    };
```

With nothing (delete the block entirely).

**Step 2: Remove `auth` from the `AppConfig` type if it exists**

Run: `grep -n "auth" /Users/radiustheme/Shopify/radius-product-bundles/web/_developer/types/toml.ts`

If `auth` is a required field in the type, make it optional with `?` or remove it.

**Step 3: Verify no type errors**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

**Step 4: Commit**

```bash
git add web/_developer/tomlWriter.ts web/_developer/types/toml.ts
git commit -m "refactor(auth): remove OAuth callback URLs from TOML generator"
```

---

### Task 8: Update `shopify.app.toml` — remove auth section

**Files:**
- Modify: `shopify.app.toml` (root level)

**Step 1: Remove the `[auth]` section**

Remove lines 31-35:

```toml
[auth]
redirect_urls = [
  "https://www.app.example.com/api/auth/callback",
  "https://www.app.example.com/api/auth/oauth/callback"
]
```

**Step 2: Check for other TOML files that need the same update**

Run: `grep -r "redirect_urls" /Users/radiustheme/Shopify/radius-product-bundles/ --include="*.toml"`

Update all matching TOML files (root, extension, vercel variants) by removing their `[auth]` sections.

**Step 3: Commit**

```bash
git add "*.toml" "**/*.toml"
git commit -m "refactor(auth): remove OAuth redirect URLs from TOML configs"
```

---

### Task 9: Type check & smoke test

**Files:** None (verification only)

**Step 1: Full type check**

Run: `cd /Users/radiustheme/Shopify/radius-product-bundles/web && npx tsc --noEmit --pretty`
Expected: Clean pass, no errors

**Step 2: Verify remaining auth files are intact**

Run: `ls -la web/lib/shopify/auth/`
Expected: Only `verify.ts` remains (token exchange logic)

Run: `ls -la web/lib/shopify/proxy/`
Expected: `verify-proxy.ts` still present (app proxy HMAC — separate concern)

Run: `ls -la web/lib/crypto/`
Expected: `token-encryption.ts` still present (encryption layer — unchanged)

**Step 3: Verify session storage is intact**

Run: `grep -c "encryptToken\|decryptToken" web/shared/repositories/session-storage.ts`
Expected: 2 (one encrypt in storeSession, one decrypt in generateShopifySessionFromDB)

**Step 4: Verify token exchange logic is intact**

Run: `grep -c "tokenExchange\|handleSessionToken" web/lib/shopify/auth/verify.ts`
Expected: 4+ occurrences (function definitions + calls)

**Step 5: Commit final state**

No commit needed — this is verification only. If all checks pass, the migration is complete.

---

### Post-Migration Checklist

After deploying, verify these flows still work:

1. **Fresh install:** New dev store → install app → should load via managed installation → token exchange
2. **Existing store:** Open app → `useSessionProvider` → App Bridge token → validate → works
3. **App proxy:** Visit storefront with bundle widget → proxy signature verification → data loads
4. **Webhooks:** Create a product update → webhook fires → verified by Shopify SDK HMAC
5. **Server actions:** Create/edit a bundle → `handleSessionToken()` → data saved
6. **Outside iframe:** Direct URL to app → `/api/auth` bounces to embedded URL → App Bridge loads
