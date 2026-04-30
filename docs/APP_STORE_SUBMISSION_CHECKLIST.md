# Shopify App Store Submission Checklist — Radius Bundles

Filtered to applicable requirements (theme app extension + Shopify Function discount app). Skips payment, subscription, donation, sales channel, mobile builder, and post-purchase categories.

Source: <https://shopify.dev/docs/apps/launch/app-store-review/app-store-ai-self-review-requirements>

---

## 1. Policy

### 1.1 Build and operate within Shopify's platform

| ID | Requirement | Status |
| --- | --- | --- |
| 1.1.1 | Use session tokens (no cookies, no localStorage) | ✅ |
| 1.1.2 | Use Shopify Checkout — no bypass | ✅ |
| 1.1.3 | Direct merchants to Shopify Theme Store — no theme upload | ✅ |
| 1.1.4 | Use only factual information — no fake reviews/data | ✅ |
| 1.1.6 | Single-merchant storefronts only — no multi-seller | ✅ |
| 1.1.13 | Don't promote duplication of unowned products | ✅ |
| 1.1.14 | No agency/freelancer marketplace | ✅ |
| 1.1.16 | No capital lending or cash advances | ✅ |

### 1.2 Billing through Shopify Billing API

| ID | Requirement | Status |
| --- | --- | --- |
| 1.2.1 | Use Shopify Managed Pricing or Billing API | ✅ |
| 1.2.2 | Handle charge approval/decline and reinstall correctly | ✅ |
| 1.2.3 | Allow plan changes without reinstall | ✅ |

---

## 2. Functionality

### 2.2 Use Shopify's APIs and platform tools

| ID | Requirement | Status |
| --- | --- | --- |
| 2.2.1 | Use Shopify Admin API | ✅ |
| 2.2.3 | Use the latest App Bridge | ✅ |
| 2.2.4 | Use GraphQL Admin API (not legacy REST) | ✅ |
| 2.2.6 | No promotions in admin extensions (no admin extensions present) | ✅ |
| 2.2.7 | Max modal only on explicit merchant interaction | ✅ |

### 2.3 Provide seamless and secure installation

| ID | Requirement | Status |
| --- | --- | --- |
| 2.3.1 | Install only from Shopify-owned surface (no shop-domain input) | ✅ |
| 2.3.2 | Authenticate immediately after install | ✅ |
| 2.3.3 | Redirect to app UI after install | ⚠️ verify in Partner Dashboard |
| 2.3.4 | OAuth on reinstall — no install-once block | ✅ |

---

## 3. Security

### 3.1 TLS/SSL

| ID | Requirement | Status |
| --- | --- | --- |
| 3.1.1 | Valid TLS certificate, HTTPS enforced | ✅ HSTS preload |

### 3.2 Request only necessary scopes

| ID | Requirement | Status |
| --- | --- | --- |
| 3.2.1 | `read_all_orders` only if necessary | ✅ not requested |
| 3.2.2 | `write_payment_mandate` only if necessary | ✅ not requested |
| 3.2.3 | `write_checkout_extensions_apis` only if necessary | ✅ not requested |
| 3.2.4 | `read_advanced_dom_pixel_events` only if necessary | ✅ not requested |
| 3.2.5 | `read_checkout_extensions_chat` only if necessary | ✅ not requested |

---

## 4. Mandatory Webhooks (GDPR + lifecycle)

| Topic | Status |
| --- | --- |
| `app/uninstalled` | ✅ |
| `shop/update` + `app_subscriptions/update` | ✅ |
| `customers/data_request` (audit log + 200 response) | ✅ |
| `customers/redact` (deletes `BundleView` rows for customer) | ✅ |
| `shop/redact` (full shop data deletion) | ✅ |

### GDPR handler requirements

- Respond `200` on success, `401` if `X-Shopify-Hmac-Sha256` is invalid.
- Complete the action within **30 days** of receipt (unless legally required to retain data).
- `customers/redact` payload arrives 10 days after deletion request if customer has no order in past 6 months; otherwise after 6 months.
- `shop/redact` arrives **48 hours** after uninstall.
- Handlers must accept `POST` with `Content-Type: application/json`.

---

## 5. Category: Online Store (5.1)

| ID | Requirement | Status |
| --- | --- | --- |
| 5.1.1 | Use theme app extensions (no direct theme edits) | ✅ |
| 5.1.3 | Detailed onboarding instructions + deep links | ⚠️ verify setup guide UX |
| 5.1.5 | Customer data accessible to merchant (analytics surfaced in app) | ✅ |

---

## 6. TOML Configuration

| Item | Status |
| --- | --- |
| `application_url` + `proxy.url` set to real domain | ❌ placeholder, fix before deploy |
| `api_version` = `2026-04` | ✅ |
| `scopes` minimal | ✅ |
| Webhook `topics` + `compliance_topics` declared | ✅ |
| `direct_api_mode = "offline"` + `embedded_app_direct_api_access = true` | ✅ |
| `use_legacy_install_flow = false` | ✅ |
| `pos.embedded = false` | ✅ |
| `redirect_urls = []` acceptable for token-exchange flow | ⚠️ confirm in Partner Dashboard |

---

## 7. Listing Assets (Partner Dashboard)

### Branding

| Item | Spec |
| --- | --- |
| App name | ≤ 30 chars, brand-first (e.g. "Radius - Bundles"), matches `shopify.app.toml` |
| App icon | 1200×1200 px, PNG or JPEG, square corners (Shopify rounds), no text, no Shopify trademarks, padding around logo |

### Feature media (choose one)

| Type | Spec |
| --- | --- |
| Video (preferred) | 2–3 minutes, promotional (≤ 25% screencast), captions recommended |
| Static image | 1600×900 px (16:9), one focal point, solid background, ≥ 4.5:1 contrast, alt text required, no Shopify logos |

### Screenshots

- 3–6 desktop screenshots, 1600×900 px (16:9)
- At least one of the app UI
- Crop browser chrome
- Alt text required
- No PII, no pricing, no reviews, no outcome guarantees
- Add mobile/POS screenshots only if app supports those surfaces

### Copy

| Field | Limit / Rule |
| --- | --- |
| App card subtitle | Benefit-focused, not a function description |
| App introduction | ≤ 100 chars, benefit + measurable outcome |
| App details | ≤ 500 chars, functional description, no excessive marketing |
| Feature list | Each feature ≤ 80 chars, describe what (not how) |
| Search terms | Up to 5, complete words, one idea each |

### Discovery

- Category + tags chosen accurately
- Structured features: up to 25 per category

### Links

- Privacy policy URL — **required**, must resolve
- Demo store URL — **required**, deep-link to most demonstrative page
- Optional: FAQ, changelog, support portal, tutorial, docs (link to dedicated pages, not landing pages or cloud docs)

### Pricing (if app is paid)

- Plan name, price, feature list per plan
- Description of additional charges
- Link to detailed pricing page

### Translations

Auto-translated from English to: Brazilian Portuguese, Danish, Dutch, French, German, Simplified Chinese, Spanish, Swedish. Custom translations override auto.

---

## 8. Manual Pre-Submission Tests

- [ ] WCAG 2.1 AA — axe DevTools + Lighthouse + keyboard navigation + screen reader smoke test
- [ ] Install → uninstall → reinstall on dev store → lands in app UI without "already installed" error
- [ ] Billing approval flow + decline flow both handled
- [ ] Empty states present (zero bundles, zero analytics)
- [ ] Error states show meaningful messages (not blank)
- [ ] Widget renders on real theme + adds to cart correctly
- [ ] Cart banner shows correct discount text for all bundle types
- [ ] All 3 GDPR webhooks return 200 in Partner Dashboard test
- [ ] App icon, screenshots, video, copy uploaded to Partner Dashboard
- [ ] Privacy policy + demo store URLs resolve

---

## Not Applicable

| Section | Reason |
| --- | --- |
| 5.2 Payment | App is not a payment provider |
| 5.3 Payment facilitator | App is not a payment facilitator |
| 5.4 Purchase option (subscriptions) | App does not create subscriptions |
| 5.5 Product sourcing / fulfillment | App does not fulfill orders |
| 5.6 Checkout customization | No checkout extensions |
| 5.7 Sales channel | Not a sales channel |
| 5.8 Post-purchase | No post-purchase extensions |
| 5.9 Mobile app builders | Not a mobile app builder |
| 5.10 Donation | Not a donation app |

---

## Resources

- [App Store requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements)
- [Best practices for apps](https://shopify.dev/docs/apps/launch/shopify-app-store/best-practices)
- [Billing API](https://shopify.dev/docs/apps/launch/billing)
- [Submission flow](https://shopify.dev/docs/apps/launch/app-store-review/submit-app-for-review)
