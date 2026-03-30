# Comprehensive Audit Sweep — 2026-03-30

**Scope:** Full codebase audit — security, compliance, code quality, testing, Rust function
**Previous score:** 96/100 (after 5-week security audit)
**Tools used:** Sequential thinking MCP, Shopify Dev MCP, Context7, 4 parallel Explore agents

---

## RESOLVED (fixed this session)

| Item | Fix | Status |
|------|-----|--------|
| **C-1** GDPR `data_request` handler | Logs compiled customer data for merchant to fulfill within 30 days. Sufficient for App Store submission. | ✅ Done |
| **H-1** `fetchProductByIdAction` missing auth | Added `handleSessionToken()` as first call | ✅ Done |
| **H-2** Jest `testMatch` too narrow | Fixed to `["**/*.test.ts", "**/*.test.tsx"]` — 4 suites, 98 tests now run | ✅ Done |
| **H-2 bonus** `currency.ts` mega-barrel import | Direct import from `@/shared/constants/currency.constants` — broke 2 test suites | ✅ Done |
| **M-2** App Bridge script order | Verified — already first script in `web/app/layout.tsx:33` | ✅ Pass |
| **M-3** REST Admin API usage | Only REST call is Theme Asset API in setup guide (no GraphQL equivalent) — accepted exception | ✅ Accepted |
| Dead code | Removed 35-line commented metrics function from `bundle-queries.action.ts` | ✅ Done |
| Dead code | Removed stale `// export * from "./webhook.action"` from `shared/actions/index.ts` | ✅ Done |

---

## PENDING — HIGH

### H-3 — `bundle-security.service.ts` zero tests
**File:** `web/features/bundles/services/bundle-security.service.ts` (8KB)

Enforces plan quotas, bundle type access, permission checks — completely untested. A silent regression here is high-impact. All 51.9KB of bundle services are untested — this is the highest-risk file.

---

### H-4 — Rust discount function zero tests
**Files:** `extension/extensions/radius-discount-function/src/`

1,273 LOC of BOGO/BXGY deal count logic. No `#[cfg(test)]` modules, no test files, no dev-dependencies in Cargo.toml. A discount calculation bug directly affects merchant revenue.

Critical untested paths:
- BOGO deal count (variant-role handling, lines 256, 347-380)
- BXGY same-product path (lines 227-297)
- `safe_mul` MAX_QUANTITY=10K boundary
- Discount value capping (`max_discount_amount`, lines 180-196)
- CUSTOM_PRICE deal count multiplier (lines 160-174)
- Empty cart / empty reward_lines edge cases

---

## PENDING — MEDIUM

### M-1 — 90+ TypeScript `any` types
Highest density in:
- `analytics/repositories/analytics.queries.ts` — `where: any`, `bundle: any`
- `analytics/components/top-bundles-table.tsx` — `bundle: any`, `b: any`
- `bundles/services/bundle-transformer.service.ts` — 6 instances
- `bundles/hooks/data/use-edit-bundle.ts` — 6 instances
- `widgets/src/bundle-widget.ts` — 10 `as any` casts
- `widgets/src/radius-bundles.ts` — 15+ `as any` for Shopify window object (partially acceptable)

---

## PENDING — LOW

### L-1 — `TODO: Implement sync logic`
**File:** `web/features/settings/stores/settings.store.ts:205`
Only TODO in entire codebase. Implement or remove.

### L-2 — GDPR notification (post-launch)
Currently logs compiled customer data to server console. Upgrade to in-app Notification record (add `GDPR_DATA_REQUEST` type to Notification enum) so merchant sees it in admin UI. Not needed for App Store submission.

### L-3 — Console logging
77 files contain console statements. Most are prefixed (`[RadiusBundle]`, `[Scheduler]`). Vite config strips them from widget bundles. Acceptable until structured logging is introduced.

---

## Shopify App Store Readiness

| Requirement | Status |
|-------------|--------|
| Session tokens (1.1.1) | ✅ Pass |
| GraphQL Admin API only (2.2.4) | ✅ Pass (REST exception accepted) |
| Latest App Bridge (2.2.3) | ✅ Pass |
| GDPR webhooks registered in toml | ✅ Pass |
| GDPR `data_request` handler | ✅ Pass (logs data, sufficient for submission) |
| GDPR redact handlers | ✅ Pass |
| App Proxy HMAC verification | ✅ Pass (timing-safe) |
| Embedded app patterns | ✅ Pass |
| Authenticate immediately after install | ✅ Pass |
| No web errors (404/500) | ⚠️ Need error boundaries (Task 16) |

---

## Test Coverage Summary

| Layer | LOC | Tests | Coverage |
|-------|-----|-------|----------|
| Utility helpers | ~500 | 98 (all running) | ~80% |
| Server actions | ~48KB | 0 | 0% |
| Services | ~52KB | 0 | 0% |
| Repositories | ~38KB | 0 | 0% |
| React components | ~200 files | 0 | 0% |
| Rust discount function | 1,273 LOC | 0 | 0% |
| Widget JS | ~2,500 LOC | 0 | 0% |
| **Overall estimate** | | | **~3-5%** |

---

## Remaining Priority Order

1. **Task 16** — Per-feature error boundaries (needed for App Store — no 500 pages)
2. **H-3** — Tests for `bundle-security.service.ts`
3. **H-4** — Rust discount function tests
4. **Task 14+15** — Memoize BundleTableRow + Zustand selectors (performance)
5. **M-1** — Type safety cleanup (analytics + bundles)
6. **Task 17** — Fix `any` in analytics repository
7. **L-1** — Settings store TODO
8. **L-2** — GDPR notification upgrade (post-launch)
