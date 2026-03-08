# Auth Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate all auth security vulnerabilities — encrypt tokens at rest, lock down the session refresh endpoint, add HMAC/state validation to OAuth callback, and add shop domain validation.

**Architecture:** Defense-in-depth approach. Each task fixes one vulnerability independently. No schema changes needed — encryption is applied at the application layer. The `/api/session/refresh` endpoint is removed entirely (it leaks `shpat_*` tokens to the client). OAuth callback gets proper HMAC + state validation. `proxy.ts` is correctly named per Next.js 16 convention (middleware renamed to proxy in v16).

**Tech Stack:** Next.js 16 App Router, Prisma 7, `@shopify/shopify-api` SDK, Node.js `crypto` module (AES-256-GCM)

---

## Current Vulnerabilities (Severity Order)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | `/api/session/refresh` returns raw `shpat_*` token to client, **unauthenticated** | **CRITICAL** | `web/app/api/session/refresh/route.ts` |
| 2 | Access tokens stored in **plain text** in PostgreSQL | **CRITICAL** | `web/shared/repositories/session-storage.ts` |
| 3 | OAuth callback does **not verify HMAC** from Shopify | **HIGH** | `web/app/api/auth/callback/route.ts` |
| 4 | OAuth **state parameter never validated** (CSRF) | **HIGH** | `web/app/api/auth/route.ts` + callback |
| 5 | `generateOAuthState` uses `Math.random()` (not crypto-secure) | **MEDIUM** | `web/shared/utils/shopify/shopify-helpers.ts` |

## Reference: kinngh/shopify-nextjs-prisma-app Patterns

- **Token encryption**: Uses `Cryptr` (AES-256-GCM) with `ENCRYPTION_STRING` env var. All session data encrypted at rest.
- **No session refresh endpoint**: Only token exchange via App Bridge session tokens. Access tokens never sent to client.
- **HMAC validation**: App Proxy uses `createHmac` with sorted query params. Webhooks use SDK's built-in HMAC.
- **State management**: Uses managed install (token exchange) — no OAuth state needed. Legacy OAuth not present.

---

### Task 1: Remove the `/api/session/refresh` Endpoint (CRITICAL)

This endpoint accepts `{ shop }` in the body with **zero authentication** and returns the raw `shpat_*` offline access token. Anyone who knows a shop domain can steal its access token.

**Files:**
- Delete: `web/app/api/session/refresh/route.ts`
- Modify: `web/shared/hooks/session/use-protected-session.ts` — remove refresh fallback
- Modify: `web/shared/hooks/session/use-session-provider.ts` — remove any refresh references

**Step 1: Delete the refresh endpoint**

Delete the file `web/app/api/session/refresh/route.ts` entirely.

**Step 2: Update `use-protected-session.ts`**

Remove the fetch to `/api/session/refresh`. The fallback should go directly to the OAuth re-auth redirect (`/api/auth?returnTo=...&shop=...`). The client should never receive or handle access tokens — all token management happens server-side via `handleSessionToken`.

Find the block that calls `/api/session/refresh` and replace it:

```tsx
// REMOVE: any fetch("/api/session/refresh", ...) block
// KEEP: the redirect to /api/auth as the final fallback
```

The flow becomes:
1. Check if session is valid via App Bridge `idToken()`
2. If not, call `storeToken` server action (which does token exchange server-side)
3. If that fails, redirect to `/api/auth`

**Step 3: Verify no other files reference the refresh endpoint**

```bash
grep -r "session/refresh" web/ --include="*.ts" --include="*.tsx"
```

Remove any remaining references.

**Step 4: Commit**

```bash
git add -A && git commit -m "security: remove unauthenticated session refresh endpoint

The /api/session/refresh endpoint returned raw shpat_* access tokens
to the client with zero authentication. Removed entirely — token
management now happens exclusively server-side via token exchange."
```

---

### Task 2: Add Token Encryption at Rest (CRITICAL)

Access tokens are stored as plain `String` in PostgreSQL. If the database is compromised, all merchant tokens are exposed.

**Files:**
- Create: `web/lib/crypto/token-encryption.ts`
- Modify: `web/shared/repositories/session-storage.ts` — encrypt on write, decrypt on read

**Step 1: Add `ENCRYPTION_KEY` to environment**

Add to `.env` (and document in `.env.example`):

```
ENCRYPTION_KEY=<64-char-hex-string>
```

Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Step 2: Create the encryption utility**

Create `web/lib/crypto/token-encryption.ts`:

```ts
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
    }
    return Buffer.from(key, "hex");
}

export function encryptToken(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Format: iv:authTag:ciphertext (all hex)
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(encrypted: string): string {
    // Plain tokens (migration period) — starts with shpat_
    if (encrypted.startsWith("shpat_")) {
        return encrypted;
    }
    const [ivHex, authTagHex, ciphertextHex] = encrypted.split(":");
    if (!ivHex || !authTagHex || !ciphertextHex) {
        throw new Error("Invalid encrypted token format");
    }
    const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    return decipher.update(ciphertextHex, "hex", "utf8") + decipher.final("utf8");
}
```

Note: `decryptToken` handles unencrypted `shpat_*` tokens gracefully for backwards compatibility during migration.

**Step 3: Create barrel export**

Create `web/lib/crypto/index.ts`:

```ts
export { encryptToken, decryptToken } from "./token-encryption";
```

**Step 4: Modify `session-storage.ts` — encrypt on store, decrypt on load**

In `storeSession`: before writing `accessToken` to DB, call `encryptToken(session.accessToken)`.

In `loadSession` and `findOfflineSessionByShop`: after reading from DB, call `decryptToken(session.accessToken)` before returning.

```ts
import { encryptToken, decryptToken } from "@/lib/crypto";

// In storeSession:
accessToken: session.accessToken ? encryptToken(session.accessToken) : null,

// In loadSession / findOfflineSessionByShop - before returning:
if (dbSession?.accessToken) {
    session.accessToken = decryptToken(dbSession.accessToken);
}
```

**Step 5: Write a migration script to encrypt existing tokens**

Create `web/scripts/encrypt-existing-tokens.ts`:

```ts
import { PrismaClient } from "@/prisma/generated";
import { encryptToken } from "@/lib/crypto/token-encryption";

async function main() {
    const prisma = new PrismaClient();
    const sessions = await prisma.session.findMany({
        where: { accessToken: { not: null } },
    });

    for (const session of sessions) {
        if (session.accessToken && session.accessToken.startsWith("shpat_")) {
            await prisma.session.update({
                where: { id: session.id },
                data: { accessToken: encryptToken(session.accessToken) },
            });
            console.log(`Encrypted token for session: ${session.id}`);
        }
    }
    await prisma.$disconnect();
}

main();
```

**Step 6: Commit**

```bash
git add web/lib/crypto/ web/shared/repositories/session-storage.ts web/scripts/encrypt-existing-tokens.ts
git commit -m "security: encrypt access tokens at rest with AES-256-GCM

Tokens stored as iv:authTag:ciphertext hex. Backwards-compatible
with existing shpat_* tokens during migration period. Run
scripts/encrypt-existing-tokens.ts to encrypt existing tokens."
```

---

### Task 3: Add HMAC Validation to OAuth Callback (HIGH)

Shopify appends an `hmac` query parameter to the callback URL. The current callback does not verify it.

**Files:**
- Create: `web/lib/shopify/auth/verify-hmac.ts`
- Modify: `web/app/api/auth/callback/route.ts` — add HMAC check before code exchange

**Step 1: Create the HMAC verification utility**

Create `web/lib/shopify/auth/verify-hmac.ts`:

```ts
import { createHmac, timingSafeEqual } from "crypto";

export function verifyOAuthHmac(query: URLSearchParams): boolean {
    const hmac = query.get("hmac");
    if (!hmac) return false;

    const secret = process.env.SHOPIFY_API_SECRET;
    if (!secret) throw new Error("SHOPIFY_API_SECRET not configured");

    // Build message from all params except hmac, sorted alphabetically
    const params = new URLSearchParams();
    for (const [key, value] of query.entries()) {
        if (key !== "hmac") {
            params.append(key, value);
        }
    }
    params.sort();
    const message = params.toString();

    const computed = createHmac("sha256", secret).update(message).digest("hex");

    // Timing-safe comparison
    if (computed.length !== hmac.length) return false;
    return timingSafeEqual(Buffer.from(computed), Buffer.from(hmac));
}
```

**Step 2: Add HMAC check to callback route**

In `web/app/api/auth/callback/route.ts`, add at the top of the `GET` handler, before the code exchange:

```ts
import { verifyOAuthHmac } from "@/lib/shopify/auth/verify-hmac";

// After extracting searchParams, before the try block:
if (!verifyOAuthHmac(searchParams)) {
    return NextResponse.json(
        { error: "HMAC verification failed" },
        { status: 403 },
    );
}
```

**Step 3: Export from barrel**

Add to `web/lib/shopify/auth/index.ts` (or create it):

```ts
export { verifyOAuthHmac } from "./verify-hmac";
```

**Step 4: Commit**

```bash
git add web/lib/shopify/auth/verify-hmac.ts web/app/api/auth/callback/route.ts
git commit -m "security: validate Shopify HMAC on OAuth callback

Verifies hmac query parameter using timing-safe comparison
before processing the authorization code exchange."
```

---

### Task 4: Add OAuth State Validation (HIGH)

The current flow generates a state parameter but never validates it on callback. This leaves the OAuth flow vulnerable to CSRF attacks.

**Files:**
- Create: `web/lib/shopify/auth/oauth-state-store.ts`
- Modify: `web/shared/utils/shopify/shopify-helpers.ts` — use `crypto.randomBytes` instead of `Math.random`
- Modify: `web/app/api/auth/route.ts` — store state before redirect
- Modify: `web/app/api/auth/callback/route.ts` — validate state on return

**Step 1: Create the state store**

Since this is a serverless environment (Vercel), we use the database to store OAuth state. The state is short-lived (5 minutes) and deleted after use.

Create `web/lib/shopify/auth/oauth-state-store.ts`:

```ts
import prisma from "@/shared/repositories/client";
import { randomBytes } from "crypto";

const STATE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function createOAuthState(shop: string): Promise<string> {
    const state = randomBytes(32).toString("hex");

    // Store in a lightweight way — reuse session table with a special prefix
    await prisma.session.upsert({
        where: { id: `oauth_state_${shop}` },
        create: {
            id: `oauth_state_${shop}`,
            shop,
            state,
            isOnline: false,
            apiKey: process.env.SHOPIFY_API_KEY!,
            expires: new Date(Date.now() + STATE_TTL_MS),
        },
        update: {
            state,
            expires: new Date(Date.now() + STATE_TTL_MS),
        },
    });

    return state;
}

export async function validateAndConsumeOAuthState(
    shop: string,
    state: string,
): Promise<boolean> {
    const record = await prisma.session.findUnique({
        where: { id: `oauth_state_${shop}` },
    });

    // Delete regardless (one-time use)
    await prisma.session.deleteMany({
        where: { id: `oauth_state_${shop}` },
    });

    if (!record || record.state !== state) return false;
    if (record.expires && new Date() > record.expires) return false;

    return true;
}
```

**Step 2: Fix `generateOAuthState` to use crypto-secure randomness**

In `web/shared/utils/shopify/shopify-helpers.ts`, replace:

```ts
export function generateOAuthState(shop: string): string {
    return `${shop}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}
```

This function is now unused (replaced by `createOAuthState`), but fix it for safety:

```ts
import { randomBytes } from "crypto";

export function generateOAuthState(_shop: string): string {
    return randomBytes(32).toString("hex");
}
```

**Step 3: Update auth route to store state**

In `web/app/api/auth/route.ts`:

```ts
import { createOAuthState } from "@/lib/shopify/auth/oauth-state-store";

// Replace: const state = generateOAuthState(shop);
// With:
const state = await createOAuthState(shop);
```

**Step 4: Update callback to validate state**

In `web/app/api/auth/callback/route.ts`, after HMAC validation:

```ts
import { validateAndConsumeOAuthState } from "@/lib/shopify/auth/oauth-state-store";

// After HMAC check:
if (!state || !(await validateAndConsumeOAuthState(shop, state))) {
    return NextResponse.json(
        { error: "Invalid or expired OAuth state" },
        { status: 403 },
    );
}

// Remove the line: const sessionState = state || crypto.randomUUID();
// Replace with: const sessionState = state;
```

**Step 5: Commit**

```bash
git add web/lib/shopify/auth/oauth-state-store.ts web/shared/utils/shopify/shopify-helpers.ts web/app/api/auth/route.ts web/app/api/auth/callback/route.ts
git commit -m "security: validate OAuth state parameter (CSRF protection)

State is stored in DB with 5-minute TTL, validated and consumed
on callback. Uses crypto.randomBytes instead of Math.random."
```

---

### Task 5: Add Shop Domain Validation (BONUS)

The OAuth flow does not validate that the `shop` parameter is a legitimate `*.myshopify.com` domain. This could be used for SSRF attacks (the server fetches `https://{shop}/admin/oauth/access_token`).

**Files:**
- Modify: `web/shared/utils/shopify/shopify-helpers.ts` — add `isValidShopDomain`
- Modify: `web/app/api/auth/route.ts` — validate before redirect
- Modify: `web/app/api/auth/callback/route.ts` — validate before code exchange

**Step 1: Add domain validation**

In `web/shared/utils/shopify/shopify-helpers.ts`:

```ts
const SHOP_DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

export function isValidShopDomain(shop: string): boolean {
    return SHOP_DOMAIN_REGEX.test(shop);
}
```

**Step 2: Add to auth route**

```ts
if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json(
        { error: "Invalid shop domain" },
        { status: 400 },
    );
}
```

**Step 3: Add to callback route**

Same check before processing the callback.

**Step 4: Commit**

```bash
git add web/shared/utils/shopify/shopify-helpers.ts web/app/api/auth/route.ts web/app/api/auth/callback/route.ts
git commit -m "security: validate shop domain format to prevent SSRF

Only accepts *.myshopify.com domains in OAuth flow, preventing
server-side request forgery via crafted shop parameters."
```

---

## Comparison Summary: Your App vs Reference App

| Aspect | Your App (Current) | Reference (kinngh) | After This Plan |
|--------|-------------------|---------------------|-----------------|
| Token storage | **Plain text** | AES encrypted (Cryptr) | AES-256-GCM encrypted |
| Session refresh | **Leaks token to client** | No refresh endpoint | Endpoint removed |
| OAuth HMAC | **Not verified** | N/A (no legacy OAuth) | Verified with timing-safe compare |
| OAuth state | **Not validated** | N/A (token exchange only) | DB-stored, TTL, one-time use |
| State randomness | `Math.random()` | N/A | `crypto.randomBytes` |
| Proxy (middleware) | Correct (`proxy.ts` per Next.js 16) | Active (`proxy.js`) | No change needed |
| Shop domain check | None | None | Regex validation |
| Token exchange | Implemented | Implemented | No change needed |
| Proxy HMAC | Implemented | Implemented | No change needed |
| Webhook HMAC | SDK-handled | SDK-handled | No change needed |

## Execution Order

Tasks 1-4 are independent and can be parallelized. Task 5 is also independent.

Recommended order for sequential execution: **1 → 2 → 3 → 4 → 5** (highest severity first).
