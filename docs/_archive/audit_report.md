# Shopify App Store Readiness Audit

**App Name:** Radius Bundles
**Date:** March 11, 2026
**Auditor:** Antigravity (Shopify App Reviewer)

---

## 1. Technical Architecture & Setup ✅

The app utilizes a modern and recommended technology stack:

- **Framework:** Next.js (App Router, React 19)
- **Backend Integration:** Prisma ORM for database connectivity, custom robust webhook handling.
- **Shopify Integrations:**
    - App Proxy is configured at `/apps/bundles`.
    - Embedded App configuration is enabled, utilizing App Bridge v4.
    - Extends Shopify via **Theme App Extensions** (`product-bundle-widget`) and **Shopify Functions** (`radius-discount-function` built in Rust).
- **Configuration:** Scopes defined in `shopify.app.toml` cover all necessary resource accesses (`read_orders`, `write_products`, `write_discounts`, etc.).
- **Recommendation:** Ensure that the scopes requested in `shopify.app.toml` are strictly necessary for the app to function. Requesting unnecessary scopes is a common reason for App Store rejection.

## 2. Security & Authentication ✅

The app meets Shopify's strict security guidelines:

- **OAuth & API Access:** Uses `@shopify/shopify-api` to securely handle token generation. Environment variables (`SHOPIFY_API_KEY`, etc.) are securely loaded and enforced at startup (`initialize-context.ts`).
- **Direct API Access:** Correctly implements Shopify's new "Offline" direct API mode for embedded apps.

## 3. Data Privacy & Mandatory Webhooks ✅ **(CRITICAL PASS)**

Shopify requires all public apps to implement mandatory privacy webhooks.

- Your implementation in `web/lib/shopify/webhooks/gdpr.ts` is exactly what the review team looks for.
- **`CUSTOMERS_DATA_REQUEST`**: Correctly aggregates bundle view history and serializes it for the merchant.
- **`CUSTOMERS_REDACT`**: Successfully deletes `BundleView` data linked to specific customers.
- **`SHOP_REDACT`**: Accurately purges all store-specific data (`deleteShopData(shop)`).
- **Recommendation:** Ensure your configured GDPR webhook URLs in the Partner Dashboard map exactly to the `/api/webhooks` endpoint processing these payloads.

## 4. Extensions & Storefront Implementation ✅

- **Theme App Extension:** Using an app block (`product-bundle-widget`) guarantees the widget won't leave ghost code on uninstall, which is a major App Store requirement.
- **Shopify Functions:** Using Rust-based functions (`radius-discount-function`) for `cart.lines.discounts` and `delivery-options.discounts` is the golden standard. Shopify review teams strongly favor this over legacy Draft Orders or Script Tags for bundle discounting.

## 5. UI/UX & Polaris Design System ⚠️

- The application loads App Bridge v4 and Polaris CSS via CDN in `layout.tsx`.
- TailwindCSS is heavily utilized alongside custom UI components.
- **Reviewer Note:** While using the `@shopify/polaris` React library is not strictly mandatory, the app interface _must_ feel native to the Shopify admin. If your custom Tailwind UI deviates significantly from Shopify's design language, it could lead to rejection under the "User Experience" guidelines.
- **Recommendation:** Ensure primary buttons, typography, and spacing closely resemble the Polaris design system. Handle loading states gracefully (prevent white flashes) and use App Bridge Toast for success/error messages rather than custom-built alerts.

## 6. App Listing Preparation (Pending Actions) 📋

Before hitting "Submit", ensure you have prepared the following for the App Store Listing page:

1. **App Icon:** Must be exactly `1200 x 1200` pixels (JPEG or PNG).
2. **App URLs & Contact:** Ensure your support URLs and emails do not contain the word "Shopify" or any abbreviations of it.
3. **Demo Screencast:** Prepare a comprehensive screencast (with English audio/subtitles) demonstrating installing the app, creating a bundle, and verifying it works on the storefront.
4. **Test Store Credentials:** Provide full access to your test development store for the Shopify review team.

---

### Final Verdict: **Ready for Pre-Submission Polish**

From a technical and architectural standpoint, `Radius Bundles` is incredibly well-structured and fully compliant with Shopify's most complex App Store requirements (Functions, Theme App Extensions, and GDPR webhooks). The codebase uses modern, best-practice implementations. Focusing on the UI polish and listing metadata will guarantee a smooth review process!
