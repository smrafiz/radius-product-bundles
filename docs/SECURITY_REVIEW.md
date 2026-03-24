# Shopify App Security Review Report

_Radius Product Bundles - Pre-Submission Assessment_

**Review Date:** March 22, 2026  
**Reviewer:** AI Security Review  
**Overall Status:** GOOD with CRITICAL issues to address

---

## Executive Summary

The Radius Product Bundles app demonstrates solid security foundations with proper OAuth flow, token encryption, input validation, and GDPR compliance. However, **4 critical issues must be resolved before Shopify App Store submission**.

| Severity | Count |
| -------- | ----- |
| Critical | 4     |
| High     | 5     |
| Medium   | 5     |
| Low      | 3     |

---

## Critical Issues (Must Fix Before Submission)

### 1. Hardcoded Secrets in .env File

**File:** `/web/.env`

```env
DATABASE_URL="postgresql://neondb_owner:npg_6AcEMdLYDr8N@..."
CRON_SECRET="c7f3a9e2-4b1d-47c6-8e5f-9d2c3a1b6e4f"
ENCRYPTION_KEY="ef8af61b5c14fb422de5cc248c1ae3f4a5d5fba92b9ad676b0875f2385e2e494"
```

**Impact:** Database credentials and encryption keys committed to repository.

**Required Actions:**

1. Remove `.env` from git tracking:
    ```bash
    git rm --cached web/.env
    echo "web/.env" >> .gitignore
    ```
2. Rotate all exposed secrets immediately
3. Use Shopify App secrets or proper secret management

---

### 2. Missing X-Frame-Options Header

**File:** `/web/security/headers.ts`

**Impact:** Clickjacking attacks possible on browsers that don't support CSP frame-ancestors.

**Required Fix:**

```typescript
response.headers.set("X-Frame-Options", "DENY");
```

---

### 3. CSP Not Consistently Applied

**File:** `/web/next.config.js`

**Issue:** CSP headers in `next.config.js` are only applied via `async headers()` for static responses. Dynamic routes may not receive CSP headers.

**Required Fix:** Ensure CSP headers are applied to ALL responses, including dynamic ones.

---

### 4. Server/Client Code Mixing in Webhook Handler

**File:** `/web/lib/shopify/webhooks/handlers.ts:24`

```typescript
if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("radius-shop-settings-changed"));
}
```

**Impact:** Server-side code should NOT dispatch browser events. This indicates a design flaw.

**Required Fix:** Move browser event dispatching to client-side code using WebSocket, polling, or client-side webhook acknowledgment listeners.

---

## High Priority Issues

### 1. CORS Allow-All on Upload API

**File:** `/web/app/api/upload/route.ts:45`

```typescript
{ key: "Access-Control-Allow-Origin", value: "*" }
```

**Recommendation:**

```typescript
const allowedOrigins = [
    "https://admin.shopify.com",
    process.env.NEXT_PUBLIC_HOST,
];
```

---

### 2. In-Memory Rate Limiting

**File:** `/web/lib/shopify/proxy/verify-proxy.ts:8`

```typescript
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
```

**Issues:**

- Doesn't work across multiple serverless instances
- State lost on server restart
- Attackers can bypass by hitting different instances

**Recommendation:** Implement Redis-backed rate limiting.

---

### 3. Client-Side JWT Decoding

**File:** `/web/shared/stores/session.store.ts:148-155`

```typescript
const payload = (() => {
    try {
        const base64Payload = sessionToken.split(".")[1];
        return JSON.parse(atob(base64Payload));
    } catch {
        return null;
    }
})();
```

**Recommendation:** Use Shopify SDK's built-in session validation for production.

---

### 4. Missing CSRF Protection on Server Actions

**Files:** `/web/features/*/actions/`

**Recommendation:** Verify Next.js built-in CSRF protection is enabled and consider adding explicit validation.

---

### 5. Timing Attack on Domain Validation

**File:** `/web/shared/utils/shopify/shopify-helpers.ts:185`

**Recommendation:** Use constant-time comparison for domain validation.

---

## Medium Priority Issues

### 1. Incomplete Security Headers

**Missing headers:**

- `Permissions-Policy`
- `X-XSS-Protection`
- `Cross-Origin-Embedder-Policy`

---

### 2. GraphQL Introspection Enabled

GraphQL introspection should be disabled in production to prevent schema enumeration.

---

### 3. Error Messages May Leak Internal Details

**File:** `/web/shared/utils/error/error-handlers.ts`

**Recommendation:** Return generic messages to clients, log details server-side.

---

### 4. Limited SVG Sanitization

**File:** `/web/shared/utils/validation/validators.ts`

Some legitimate SVG content may be stripped.

---

### 5. No Input Size Limits on JSON Fields

**File:** `/web/features/bundles/schema/zod.schema.ts`

Add maximum size constraints to `volumeTiers`, `triggerConfig`, `conditions`, `actions`.

---

## Low Priority Issues

### 1. Security Service Not Integrated

**File:** `/web/features/bundles/services/bundle-security.service.ts`

`performSecurityChecks`, `checkRateLimit`, `detectAbusiveBehavior` are defined but not called from bundle mutations.

---

### 2. No Request Correlation IDs

No request tracing for debugging and log analysis.

---

### 3. Logging Review Needed

**File:** `/web/lib/shopify/auth/verify.ts:113-116`

Ensure no access tokens or PII are ever logged.

---

## Shopify Compliance Checklist

| Requirement                  | Status     | Notes                               |
| ---------------------------- | ---------- | ----------------------------------- |
| OAuth Flow                   | ✅ PASS    | Complete implementation             |
| App Setup (shopify.app.toml) | ✅ PASS    | Properly configured                 |
| Embedded App                 | ✅ PASS    | `embedded = true`                   |
| Webhook Registration         | ✅ PASS    | GDPR and essential webhooks         |
| Webhook HMAC Verification    | ✅ PASS    | Using Shopify SDK                   |
| GDPR Compliance              | ✅ PASS    | Data request/redaction handlers     |
| Session Token Handling       | ✅ PASS    | JWT validation                      |
| Token Encryption at Rest     | ✅ PASS    | AES-256-GCM                         |
| Input Validation             | ✅ PASS    | Zod schemas                         |
| Shop Domain Validation       | ⚠️ PARTIAL | Regex exists, could be strengthened |
| Rate Limiting                | ⚠️ PARTIAL | In-memory only                      |
| Security Headers             | ⚠️ PARTIAL | Some missing                        |
| X-Frame-Options              | ❌ FAIL    | Missing explicit header             |
| Permissions-Policy           | ❌ FAIL    | Not configured                      |
| CORS Policy                  | ⚠️ PARTIAL | Allow-all on upload API             |
| HSTS                         | ✅ PASS    | `max-age=63072000`                  |
| CSP                          | ⚠️ PARTIAL | Not consistently applied            |
| API Version                  | ✅ PASS    | Using 2026-01                       |

---

## Positive Security Practices

1. **AES-256-GCM Encryption** - Strong cryptographic choice for token storage
2. **HMAC-SHA256** - Webhook and proxy signature verification
3. **Zod Schema Validation** - Comprehensive input validation
4. **DOMPurify** - Proper HTML sanitization
5. **GDPR Implementation** - Data request and redaction handlers
6. **Shop Domain Validation** - Prevents subdomain takeover
7. **Atomic Setup Locks** - Race condition prevention
8. **Idempotent Webhooks** - Deduplicates webhook deliveries
9. **Comprehensive Error Handling** - Structured responses

---

## Required Fixes Checklist

### Priority 1: Immediate (Before Submission)

- [ ] Remove `.env` from git tracking and rotate all secrets
- [ ] Add `X-Frame-Options: DENY` header
- [ ] Add `Permissions-Policy` header
- [ ] Fix webhook handler - remove `window.dispatchEvent`
- [ ] Ensure CSP is applied to all responses

### Priority 2: Production Hardening

- [ ] Implement Redis-based rate limiting
- [ ] Restrict CORS on upload API
- [ ] Disable GraphQL introspection in production
- [ ] Add constant-time comparison for domain validation
- [ ] Sanitize error messages in production

### Priority 3: Code Quality

- [ ] Integrate security service into bundle mutations
- [ ] Add request correlation IDs
- [ ] Add input size limits to JSON fields
- [ ] Review all logging for sensitive data

---

## Summary

The Radius Product Bundles app has a solid security architecture and follows many best practices. After addressing the **4 critical issues** and **5 high priority items**, the app should be ready for Shopify App Store submission.

**Key Strengths:**

- Strong encryption (AES-256-GCM)
- Comprehensive input validation
- GDPR compliant
- Proper OAuth implementation

**Key Concerns:**

- Secrets management
- Security headers consistency
- Rate limiting implementation
- Server/client code separation
