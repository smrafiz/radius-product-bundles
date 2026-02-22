# Radius Product Bundles — Shopify Dev Compliance Report

> Generated: 2026-02-21 | Branch: `caching-test`
> Source: Shopify Dev MCP documentation + project package analysis

---

## 1. API Version

| Item                | Your Project | Shopify Recommendation                                            | Status |
| ------------------- | ------------ | ----------------------------------------------------------------- | ------ |
| Webhook API version | `2025-10`    | Latest stable (released Oct 1, 2025, supported until Oct 1, 2026) | ✅ OK  |
| GraphQL codegen     | `2025-10`    | Should match webhook version                                      | ✅ OK  |

---

## 2. App Bridge & Embedding

| Item                           | Your Project | Shopify Requirement                                              | Status     |
| ------------------------------ | ------------ | ---------------------------------------------------------------- | ---------- |
| `@shopify/app-bridge`          | `^3.7.11`    | Must use CDN `app-bridge.js` script tag (deadline: Oct 15, 2025) | ⚠️ WARNING |
| `@shopify/app-bridge-react`    | `^4.2.10`    | v4.x is current                                                  | ✅ OK      |
| `@shopify/app-bridge-types`    | `^0.7.0`     | Latest types package                                             | ✅ OK      |
| `@shopify/app-bridge-ui-types` | `^0.3.3`     | Additional UI types                                              | ✅ OK      |
| `embedded` in TOML             | `true`       | Required for admin-embedded apps                                 | ✅ OK      |

### Action Required

`@shopify/app-bridge` at `^3.7.11` is the **legacy package**. Shopify now requires the latest App Bridge via the CDN-hosted `app-bridge.js` script tag in the `<head>` of your app. The old npm package is for migration/types only.

Verify your app includes:

```html
<head>
    <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
</head>
```

---

## 3. Mandatory Compliance Webhooks (GDPR)

| Topic                    | Shopify Requirement         | Your TOML Config                                 | Status     |
| ------------------------ | --------------------------- | ------------------------------------------------ | ---------- |
| `customers/data_request` | **Mandatory** for App Store | Not in `shopify.app.toml`                        | ❌ MISSING |
| `customers/redact`       | **Mandatory** for App Store | Not in `shopify.app.toml`                        | ❌ MISSING |
| `shop/redact`            | **Mandatory** for App Store | Not in `shopify.app.toml`                        | ❌ MISSING |
| `app/uninstalled`        | Recommended                 | Not in TOML (may be registered programmatically) | ⚠️ CHECK   |

### Blocker

Your `shopify.app.toml` has no `[[webhooks.subscriptions]]` entries. Compliance webhooks are **mandatory for App Store submission**. Your app will be rejected without them.

### Suggested Fix

Add to `shopify.app.toml`:

```toml
[[webhooks.subscriptions]]
topics = ["customers/data_request", "customers/redact", "shop/redact"]
uri = "/api/webhooks"

[[webhooks.subscriptions]]
topics = ["app/uninstalled"]
uri = "/api/webhooks"
```

Or configure them in the Partner Dashboard under your app's webhook settings.

---

## 4. Access Scopes Audit

### Current Scopes

```
read_customers, read_orders, read_price_rules, read_products, read_themes,
write_app_proxy, write_discounts, write_files, write_price_rules, write_products, write_script_tags
```

### Per-Scope Assessment

| Scope               | Needed?      | Notes                                                            | Status     |
| ------------------- | ------------ | ---------------------------------------------------------------- | ---------- |
| `read_customers`    | Yes          | Analytics tracking by customer                                   | ✅ OK      |
| `read_orders`       | Yes          | Analytics, co-occurrence analysis                                | ✅ OK      |
| `read_products`     | Yes          | Core functionality                                               | ✅ OK      |
| `write_products`    | Yes          | Managing bundle products, metafields                             | ✅ OK      |
| `write_app_proxy`   | Yes          | App Proxy usage confirmed                                        | ✅ OK      |
| `write_discounts`   | Yes          | Discount function                                                | ✅ OK      |
| `write_files`       | Check        | File uploads — needed if you use Files API                       | ⚠️ VERIFY  |
| `read_price_rules`  | Questionable | Price rules are REST-only legacy. You use GraphQL discounts      | ⚠️ REMOVE? |
| `write_price_rules` | Questionable | Same — legacy REST price rules API                               | ⚠️ REMOVE? |
| `read_themes`       | Questionable | Theme extensions handle widget injection                         | ⚠️ REMOVE? |
| `write_script_tags` | **No**       | Script tags are **deprecated**. You already use theme extensions | ❌ REMOVE  |

### Suggested Scopes (after cleanup)

```toml
[access_scopes]
scopes = "read_customers,read_orders,read_products,write_app_proxy,write_discounts,write_files,write_products"
```

---

## 5. Core Dependencies Audit

### Framework & Runtime

| Package                     | Version  | Latest       | Status |
| --------------------------- | -------- | ------------ | ------ |
| `next`                      | `16.1.6` | Next.js 16.x | ✅ OK  |
| `react` / `react-dom`       | `19.2.4` | React 19.x   | ✅ OK  |
| `typescript`                | `^5.9.3` | 5.9.x        | ✅ OK  |
| `prisma` / `@prisma/client` | `^7.4.1` | Prisma 7.x   | ✅ OK  |

### Shopify Packages

| Package                       | Version   | Notes             | Status |
| ----------------------------- | --------- | ----------------- | ------ |
| `@shopify/shopify-api`        | `^12.3.0` | Core Shopify API  | ✅ OK  |
| `@shopify/cli-kit`            | `^3.91.0` | CLI utilities     | ✅ OK  |
| `@shopify/api-codegen-preset` | `^1.2.2`  | GraphQL codegen   | ✅ OK  |
| `@shopify/polaris-types`      | `^1.0.1`  | Polaris type defs | ✅ OK  |

### Potentially Unnecessary / Oversized

| Package                | Version    | Concern                                       | Suggestion                                 |
| ---------------------- | ---------- | --------------------------------------------- | ------------------------------------------ |
| `@apollo/client`       | `^4.1.5`   | ~45KB min+gz. You also have `graphql-request` | Pick one — consolidate                     |
| `graphql-request`      | `^7.4.0`   | Redundant with Apollo                         | Keep this (lighter) or Apollo, not both    |
| `react-player`         | `^3.4.0`   | Video player — large bundle                   | Verify it's used; lazy-load if so          |
| `react-simple-wysiwyg` | `^3.4.1`   | WYSIWYG editor                                | Ensure tree-shaken / lazy-loaded           |
| `nprogress`            | `^0.2.0`   | Progress bar                                  | App Bridge has built-in loading indicators |
| `framer-motion`        | `^12.34.3` | ~32KB min+gz animation library                | Ensure not leaking into storefront widget  |
| `react-range`          | `^1.10.0`  | Range slider                                  | Polaris has `RangeSlider` built-in         |

### Dev Dependencies Concerns

| Package                | Concern                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `autoprefixer`         | Tailwind CSS v4 handles prefixing natively — likely unnecessary |
| `sass-embedded` (root) | No `.scss` files in architecture — verify if used               |

---

## 6. Package Placement Issues

These packages are in `dependencies` but should be in `devDependencies` (build-time only):

| Package                          | Why Move                                   |
| -------------------------------- | ------------------------------------------ |
| `@graphql-codegen/cli`           | Build tool, not runtime                    |
| `@graphql-codegen/client-preset` | Build tool, not runtime                    |
| `@shopify/api-codegen-preset`    | Build tool, not runtime                    |
| `prisma`                         | CLI tool; only `@prisma/client` is runtime |

### Suggested Fix

```bash
cd web
bun remove @graphql-codegen/cli @graphql-codegen/client-preset @shopify/api-codegen-preset prisma
bun add -D @graphql-codegen/cli @graphql-codegen/client-preset @shopify/api-codegen-preset prisma
```

### Other Structural Issues

| Issue                | Details                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `mux-embed` override | `"mux-embed": "^5.16.1"` in both root and web overrides — verify still needed |
| Duplicate `prettier` | Present in both root and web `package.json`                                   |

---

## 7. TOML Configuration Audit

| Setting                            | Value                         | Assessment                                     |
| ---------------------------------- | ----------------------------- | ---------------------------------------------- |
| `application_url`                  | `https://www.app.example.com` | ❌ Placeholder — needs real URL for production |
| `redirect_urls`                    | `example.com` paths           | ❌ Placeholder — needs real URLs               |
| `direct_api_mode`                  | `offline`                     | ✅ OK for background jobs                      |
| `embedded_app_direct_api_access`   | `true`                        | ✅ OK                                          |
| `automatically_update_urls_on_dev` | `true`                        | ✅ OK for development                          |
| `pos.embedded`                     | `false`                       | ✅ OK if no POS support                        |
| `use_legacy_install_flow`          | `false`                       | ✅ OK — using Shopify managed install          |

---

## 8. App Store Performance Requirements

| Requirement             | Threshold        | Your Situation                                         |
| ----------------------- | ---------------- | ------------------------------------------------------ |
| Lighthouse score impact | < 10 point drop  | Liquid theme extension + JS widget must be lightweight |
| LCP (Built for Shopify) | < 2.5s at p75    | Ensure widget lazy-loads and doesn't block render      |
| Web Vitals tracking     | Required for BFS | Latest App Bridge enables this automatically           |

### Performance Risks

Ensure these packages are **NOT** bundled into your storefront widget (`radius-bundles.ts`):

- `framer-motion` (~32KB)
- `recharts` (~45KB)
- `react-player` (~25KB)
- `@apollo/client` (~45KB)

These should only exist in the admin app bundle. The storefront widget should be as minimal as possible.

---

## 9. Summary: Priority Actions

### Blockers (will cause App Store rejection)

| #   | Action                                     | Files              |
| --- | ------------------------------------------ | ------------------ |
| 1   | Add mandatory GDPR compliance webhooks     | `shopify.app.toml` |
| 2   | Remove `write_script_tags` scope           | `shopify.app.toml` |
| 3   | Replace placeholder URLs before submission | `shopify.app.toml` |

### High Priority

| #   | Action                                                    | Files                 |
| --- | --------------------------------------------------------- | --------------------- |
| 4   | Verify App Bridge CDN script in app `<head>`              | Layout/root component |
| 5   | Move build-only packages to `devDependencies`             | `web/package.json`    |
| 6   | Remove `read_price_rules` / `write_price_rules` if unused | `shopify.app.toml`    |
| 7   | Verify `read_themes` scope is needed                      | `shopify.app.toml`    |

### Recommended Improvements

| #   | Action                                                  | Impact                 |
| --- | ------------------------------------------------------- | ---------------------- |
| 8   | Consolidate GraphQL clients (Apollo vs graphql-request) | ~45KB bundle reduction |
| 9   | Replace `react-range` with Polaris `RangeSlider`        | Remove dependency      |
| 10  | Replace `nprogress` with App Bridge loading states      | Remove dependency      |
| 11  | Audit `framer-motion` / `react-player` usage            | Bundle size            |
| 12  | Remove `sass-embedded` from root if unused              | Cleanup                |
| 13  | Remove `autoprefixer` (Tailwind v4 handles it)          | Cleanup                |
| 14  | Deduplicate `prettier` across packages                  | Cleanup                |

---

## 10. Suggested Improved `shopify.app.toml`

```toml
name = "Product Bundles"
handle = "product-bundles47"
client_id = "90639cf08512143558f29fdc47f10d98"
application_url = "https://your-production-url.com"
embedded = true
extension_directories = ["./extension/extensions/**"]

[app_proxy]
url = "https://your-production-url.com/api/proxy"
subpath = "bundles"
prefix = "apps"

[build]
automatically_update_urls_on_dev = true
dev_store_url = "bundles47.myshopify.com"

[webhooks]
api_version = "2025-10"

[[webhooks.subscriptions]]
topics = ["products/update", "shop/update"]
uri = "/api/webhooks"

[[webhooks.subscriptions]]
topics = ["app/uninstalled"]
uri = "/api/webhooks"

[webhooks.privacy_compliance]
customer_data_request_url = "https://your-production-url.com/api/webhooks/privacy"
customer_deletion_url = "https://your-production-url.com/api/webhooks/privacy"
shop_deletion_url = "https://your-production-url.com/api/webhooks/privacy"

[access.admin]
direct_api_mode = "offline"
embedded_app_direct_api_access = true

[access_scopes]
scopes = "read_customers,read_orders,read_products,write_app_proxy,write_discounts,write_files,write_products"
optional_scopes = []
use_legacy_install_flow = false

[auth]
redirect_urls = [
  "https://your-production-url.com/api/auth/callback",
  "https://your-production-url.com/api/auth/oauth/callback"
]

[pos]
embedded = false

[product.metafields.app.bundle_ids]
type = "list.single_line_text_field"
name = "Bundle IDs"
description = "List of bundle IDs that include this product"

  [product.metafields.app.bundle_ids.access]
  admin = "merchant_read"
  storefront = "public_read"
```

### Key Changes in Suggested TOML

1. Added `[webhooks.privacy_compliance]` section for GDPR
2. Added `[[webhooks.subscriptions]]` for `products/update`, `shop/update`, `app/uninstalled`
3. Removed deprecated scopes: `write_script_tags`, `read_price_rules`, `write_price_rules`, `read_themes`
4. Placeholder URLs marked for replacement

---

## References

- [App Store Requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements)
- [Built for Shopify Requirements](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)
- [App Bridge Migration Guide](https://shopify.dev/docs/api/app-bridge/migration-guide)
- [Access Scopes Reference](https://shopify.dev/docs/api/usage/access-scopes)
- [API Versioning](https://shopify.dev/docs/api/usage/versioning)
- [App Review Process](https://shopify.dev/docs/apps/launch/app-store-review/review-process)
- [Pass App Review](https://shopify.dev/docs/apps/launch/app-store-review/pass-app-review)
- [App Performance Best Practices](https://shopify.dev/docs/apps/launch/shopify-app-store/best-practices)
