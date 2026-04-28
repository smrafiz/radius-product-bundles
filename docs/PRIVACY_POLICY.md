# Privacy Policy — Radius Bundles

**Last updated:** April 28, 2026

This Privacy Policy describes how RadiusTheme ("we", "our", "us") collects, uses, stores, and shares information when you install and use the **Radius Bundles** Shopify app (the "App") on your Shopify store.

By installing the App, you agree to the practices described in this policy.

---

## 1. Who We Are

**App publisher:** RadiusTheme
**Website:** https://www.radiustheme.com
**Contact for privacy inquiries:** privacy@radiustheme.com
**Support:** support@radiustheme.com

The App is distributed through the [Shopify App Store](https://apps.shopify.com/) and is governed by Shopify's [Partner Program Agreement](https://www.shopify.com/legal/partners) and [API Terms of Service](https://www.shopify.com/legal/api-terms).

---

## 2. Information We Collect

When a merchant installs Radius Bundles, the App accesses and stores the following categories of information through the Shopify Admin API and webhooks:

### 2.1 Merchant store data
- Shop domain (e.g. `your-store.myshopify.com`)
- Shop name, currency, plan, primary locale, country, time zone
- App installation status, subscription status, and trial dates
- Encrypted Shopify access tokens (used to call the Shopify Admin API on the merchant's behalf)

### 2.2 Product and catalog data
- Product IDs, titles, descriptions, vendors, and product types
- Product variants, prices, compare-at prices, SKUs, and inventory state
- Product images and media URLs
- Collections and tags (only when used in bundle configurations)

### 2.3 Order and analytics data
- Order data received through the `orders/create` webhook (line items, totals, currency) — used solely to track bundle conversion performance
- Aggregated bundle metrics (views, add-to-cart events, purchases, revenue)
- Anonymous customer identifiers and session identifiers — used **only to deduplicate analytics events** (e.g. counting one bundle view per customer per day). We do not store names, email addresses, phone numbers, billing addresses, or payment details.

### 2.4 App configuration data
- Bundle definitions (name, type, products, pricing rules, schedule, status)
- Widget appearance settings (layout, colors, typography, custom CSS)
- App preferences and feature toggles
- Webhook delivery logs (used for retries and idempotency)

### 2.5 Information we do NOT collect
- Buyer payment details, credit card numbers, or banking information
- Buyer email addresses, phone numbers, or postal addresses
- Customer account passwords or authentication credentials
- Any data outside of what merchants explicitly grant access to via the OAuth scopes listed in the App Store listing

---

## 3. How We Use Your Information

We use the information collected to:

1. **Provide core App functionality** — display, calculate, and apply bundle discounts on the merchant's storefront and at checkout
2. **Render the storefront widget** — fetch product details to display bundles to shoppers
3. **Calculate analytics** — track bundle views, conversions, and revenue for the merchant's reporting dashboard
4. **Apply automation rules** — schedule bundle activation/deactivation, react to performance thresholds (when configured by the merchant)
5. **Authenticate API calls** — securely communicate with Shopify on the merchant's behalf
6. **Handle billing** — process subscription charges through Shopify's Billing API
7. **Provide customer support** — diagnose issues reported by merchants
8. **Comply with legal obligations** — respond to GDPR data requests, tax/audit requirements, and lawful authority requests

We do **not** sell, rent, or trade merchant or buyer data to third parties for advertising or marketing purposes.

---

## 4. Where Your Data Is Stored

- **Database:** PostgreSQL hosted on Amazon Web Services (AWS) infrastructure, deployed in a North America region (US East / US West)
- **Application servers:** Hosted on AWS managed infrastructure
- **File uploads:** Stored in Shopify's Files API (MediaImage), not on our servers

All data in transit is encrypted using TLS 1.2 or higher. Sensitive credentials (Shopify access tokens) are encrypted at rest using AES-256 before storage.

---

## 5. Third-Party Services

The App relies on the following sub-processors:

| Provider                      | Purpose                                                | Data shared                            |
| ----------------------------- | ------------------------------------------------------ | -------------------------------------- |
| **Shopify, Inc.**             | Platform hosting, OAuth, billing, webhook delivery     | All app data flows through Shopify     |
| **Amazon Web Services (AWS)** | Database hosting, application servers, infrastructure  | All structured app data, request logs  |

Each sub-processor is contractually bound to confidentiality and security obligations equivalent to those described in this policy.

---

## 6. Data Retention

- **While the App is installed:** We retain all data required to operate the App for as long as the App remains installed on the merchant's store.
- **After uninstall:** When a merchant uninstalls the App, the `app/uninstalled` webhook triggers automatic cleanup of access tokens and disables further data processing. All other shop data is retained for **48 hours** in case of accidental uninstall, then permanently deleted.
- **GDPR `shop/redact` webhook:** 48 hours after uninstall, Shopify sends a `shop/redact` webhook. On receipt, we permanently delete all merchant data, including bundles, analytics, and configuration.
- **GDPR `customers/redact` webhook:** When Shopify sends this webhook, we delete any anonymous customer/session identifiers associated with the specified customer from our analytics tables.

---

## 7. Your Rights (GDPR, CCPA, and other privacy laws)

If you are a merchant or a shopper whose data is processed by Radius Bundles, you have the right to:

- **Access** — request a copy of personal data we hold about you
- **Rectify** — correct inaccurate personal data
- **Erase** — request deletion of personal data ("right to be forgotten")
- **Restrict** — limit how we process personal data
- **Portability** — receive personal data in a machine-readable format
- **Object** — object to processing based on legitimate interests
- **Withdraw consent** — at any time, where processing is based on consent

### How to exercise your rights

- **Merchants:** uninstall the App from your Shopify admin. Shopify will automatically send the `shop/redact` webhook 48 hours later, triggering full data deletion. You may also email **privacy@radiustheme.com** for an expedited request.
- **Shoppers:** contact the merchant whose store you visited. They will forward your request to us via Shopify's `customers/data_request` or `customers/redact` webhooks.
- **Direct inquiries:** email **privacy@radiustheme.com**. We respond to all verifiable requests within **30 days**.

### GDPR webhook compliance

The App implements the three Shopify-mandated GDPR webhooks:
- `customers/data_request` — we compile and return all data we hold about a specified customer
- `customers/redact` — we permanently delete all data about a specified customer
- `shop/redact` — we permanently delete all data about a specified shop

---

## 8. Cookies and Tracking

The App uses **Shopify session tokens** for authentication. We do **not** use third-party cookies, tracking pixels, advertising identifiers, or cross-site tracking technologies in the embedded admin app.

The storefront widget uses a single anonymous session identifier (stored in `sessionStorage`, not a cookie) to deduplicate analytics events. This identifier is reset when the shopper closes their browser and is not linked to any personally identifiable information.

---

## 9. Children's Privacy

The App is intended for use by Shopify merchants who are at least 18 years old. We do not knowingly collect data from children under 16. If you believe a child has provided us with personal data, contact privacy@radiustheme.com and we will delete it.

---

## 10. International Data Transfers

Our infrastructure is located in North America. By using the App, you consent to the transfer of your data to North America for processing. Where required, we rely on Standard Contractual Clauses (SCCs) for transfers from the EU/UK.

---

## 11. Security

We implement industry-standard security measures, including:

- TLS 1.2+ encryption for all data in transit
- AES-256 encryption at rest for sensitive credentials
- HMAC verification on all incoming Shopify webhooks
- Token-based authentication using Shopify session tokens (no third-party cookies)
- Rate limiting on App Proxy endpoints
- Multi-tenant data isolation enforced at the database query level
- Regular dependency audits and security reviews

No system is 100% secure. If we become aware of a data breach affecting your information, we will notify affected merchants without undue delay and report to relevant authorities as required by law.

---

## 12. Changes to This Policy

We may update this Privacy Policy from time to time. When we do, we will:

1. Update the **Last updated** date at the top of this page
2. Notify merchants in-app of material changes
3. For significant changes, provide 30 days' notice before changes take effect

Your continued use of the App after changes take effect constitutes acceptance of the updated policy.

---

## 13. Contact Us

For privacy-related questions, requests, or complaints:

- **Email:** privacy@radiustheme.com
- **Support:** support@radiustheme.com
- **Postal address:** [Your business address here]
- **Website:** https://www.radiustheme.com

If you are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority.

---

*Radius Bundles is a third-party app built on the Shopify platform. Shopify's own privacy practices are described in [Shopify's Privacy Policy](https://www.shopify.com/legal/privacy).*
