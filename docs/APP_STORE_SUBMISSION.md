# Shopify App Store Submission Guide

## Protected Customer Data

Declare these two reasons only:

- **App functionality** — discount calculation (Rust function), session auth, billing
- **Analytics** — `BundleView`/`BundleAnalytics` track `customerId` + `sessionId` for dedup and conversion tracking

Do NOT select: Customer service, Store management, Personalization, Marketing or advertising.

---

## Submission Checklist

### 1. Configuration Setup

- [ ] App URL — no "Shopify" or "Example" in domain
- [ ] Redirect URLs — OAuth flow tested and working
- [ ] Compliance webhooks subscribed:
  - `customers/data_request`
  - `customers/redact`
  - `shop/redact`
- [ ] App icon — 1200×1200px, JPEG or PNG
- [ ] API contact email — no "Shopify" in address
- [ ] Emergency contact — email + phone number added

### 2. Listing

- [ ] Primary language set (English)
- [ ] App name, tagline, description complete
- [ ] Screenshots uploaded
- [ ] Screencast video uploaded (mandatory — show full setup + usage flow, in English)
- [ ] Pricing/plan info accurate

### 3. Protected Customer Data

- [ ] Declared: App functionality + Analytics
- [ ] Request form submitted from App Store review page

### 4. Pre-Submission

- [ ] App installed and tested on a development store
- [ ] All billing uses Shopify Billing API
- [ ] No errors, no beta/incomplete features
- [ ] Added to allowed senders:
  - `app-submissions@shopify.com`
  - `noreply@shopify.com`

### 5. Submit

- [ ] Click **Submit your app** on App Store review page
- [ ] Confirmation email received

---

## Status Flow

```
Draft → Submitted → Reviewed (fixes needed) → Published
```

If rejected: fix required changes → resubmit via **Submit fixes** button.

---

## Pre-Submission Compliance Check Results

Checked 2026-04-26 against all 29 Shopify App Store requirements.

| Requirement | Status |
|---|---|
| Auth flow (token exchange, no legacy OAuth) | ✅ Correct |
| `application_url` placeholder in toml | ❌ Fix before submit — replace `https://example.com` |
| App Proxy URL placeholder in toml | ❌ Fix before submit — replace `https://example.com/api/proxy` |
| TLS/SSL certificate | ⚠️ Verify HTTPS loads with no cert errors after real URL is set |
| App Bridge CDN init (incognito test) | ⚠️ Test in Chrome incognito — confirm app loads and authenticates |
| All other 24 requirements | ✅ Likely passing |

**Note:** Auth route (`/api/auth`) correctly redirects to embedded app URL — this is expected behavior for `use_legacy_install_flow = false` + token exchange flow. `redirect_urls = []` in toml is also correct for this pattern.

## Common Rejection Reasons

- Missing or broken compliance webhooks
- No screencast demo
- Billing not using Shopify Billing API
- App has errors or incomplete flows
- Placeholder URLs left in shopify.app.toml