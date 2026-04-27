Here's my full review. I'm going to be direct — this app will likely be REJECTED in its current state. Here's the breakdown:

🔴 Shopify App Review Report: Radius Bundles

Verdict: LIKELY REJECTED — Fix critical issues before resubmitting

🚨 CRITICAL Issues (Will cause rejection)

1. Database Credentials Leaked in .env.example
   web/.env.example line 2 contains a real Neon PostgreSQL connection string with username and password:
   The root .env.example has the same issue with a different production database URL. This is a credential leak. .env.example files should contain only placeholders.

Fix: Replace with DATABASE_URL="postgresql://user:password@host/dbname" and rotate the leaked credentials immediately.

2. Placeholder Application URL
   shopify.app.toml line 6: application_url = "https://www.app.example.com". Shopify reviewers will test your app — they need a real, live URL. This also applies to the app proxy URL on line 11.

3. Excessive/Unjustified Scopes
   Your app requests scopes that appear unused:
   • write_script_tags — Script tags are deprecated. You're using a theme app extension, so this scope has no justification. Grep confirms zero usage in your codebase.
   • read_customers — Your app doesn't appear to have a customers management page (the /customers directory is empty).
   • write_files — Only justified if you use the Files API (e.g., image uploads). Needs clear in-app usage.
   • read_themes — Needs justification.

Shopify explicitly rejects apps with unnecessary scopes. Remove any scope you cannot justify.

4. Empty Route Directories — "Coming Soon" Pages
   These directories have zero files:
   • app/automation/
   • app/customers/
   • app/integrations/
   • app/pricing-rules/
   • app/settings/
   • app/templates/

The app/ab-testing/page.tsx renders only "A/B testing features coming soon...".

Shopify rejects apps with placeholder/non-functional pages. Remove navigation links to unfinished features or implement them before submission.

⚠️ MODERATE Issues (May cause rejection or review comments)

5. Excessive console.log Statements
   The proxy route (web/app/api/proxy/products/route.ts) is riddled with debug logging (lines 27, 67, 241, 251-252, 257, 261, 267, 276-281, 303-310). These log product IDs, titles, prices, and variant data to the server console. This is:
   • A privacy concern (logging product/customer data)
   • Unprofessional for production

Fix: Remove all debug console.log calls or move to a proper logging library with log-level control.

6. CRON_SECRET Hardcoded in .env.example
   web/.env.example line 6 has an actual secret value: "c7f3a9e2-4b1d-47c6-8e5f-9d2c3a1b6e4f". Should be a placeholder.

7. polaris.js CDN Script in Layout
   web/app/layout.tsx line 30 loads https://cdn.shopify.com/shopifycloud/polaris.js. If you're using the Polaris React library (which you are via @shopify/polaris-types), loading the CDN version may cause conflicts and is not the recommended pattern for embedded apps.

✅ What Looks Good

GDPR Compliance — PASS ✅
All three mandatory webhooks are properly implemented in web/lib/shopify/webhooks/gdpr.ts:
• CUSTOMERS_DATA_REQUEST — queries and compiles customer data
• CUSTOMERS_REDACT — deletes customer-specific BundleView records
• SHOP_REDACT — calls deleteShopData() to purge all shop data

Webhook Architecture — PASS ✅
Properly structured with handler registration, re-initialization for serverless cold starts, and compliance topics declared in shopify.app.toml.

App Proxy Security — PASS ✅
HMAC-SHA256 signature verification is correctly implemented in verify-proxy.ts using SHOPIFY_API_SECRET. All proxy routes call verifyProxyRequest().

Access Token Encryption — PASS ✅
Access tokens are encrypted at rest using AES-256-GCM in lib/crypto/token-encryption.ts before database storage. Decrypted on read. Excellent practice.

CSP & Security Headers — PASS ✅
Proper frame-ancestors set for embedded app, plus HSTS, X-Content-Type-Options, and Referrer-Policy headers.

Shop Domain Validation — PASS ✅
isValidShopDomain() is used in the auth route to validate the shop parameter. returnTo is sanitized with a regex whitelist.

Discount Function Extension — PASS ✅
Well-implemented Rust WASM function with proper security — discount values are read from trusted metafields (not cart attributes), product IDs are verified against merchandise data (tamper-proof).

Theme Extension — PASS ✅
Properly structured with Liquid blocks, snippets, localization, and a clean schema. Uses $app metafields correctly.

Error Handling & Loading States — PASS ✅
Global error.tsx and loading.tsx are present at the app root.

.env Not Tracked in Git — PASS ✅
Verified .env is in .gitignore and not tracked.

Priority Fix List

1. Replace real credentials in .env.example files (both root and web/) — and rotate them
2. Set a real application_url in shopify.app.toml
3. Remove write_script_tags scope — it's unused and deprecated
4. Remove or justify read_customers, write_files, read_themes scopes
5. Remove empty page routes and their navigation links (automation, customers, integrations, pricing-rules, settings top-level, templates, ab-testing)
6. Remove debug console.log statements from proxy routes
7. Remove CRON_SECRET real value from .env.example
8. Review the polaris.js CDN import — likely unnecessary
