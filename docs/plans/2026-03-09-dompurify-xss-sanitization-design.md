# DOMPurify XSS Sanitization — Design

**Date**: 2026-03-09
**Status**: Approved

## Approach

- **Admin React app**: DOMPurify (`isomorphic-dompurify` for SSR compat)
- **Storefront widget**: Existing `escapeHtml()` (no new deps)
- **Server actions**: Sanitize at action boundary before DB write / GraphQL call

## Shared Utility: `web/shared/utils/sanitize.ts`

Three sanitization levels:

### `sanitizeHtml(dirty: string): string`

For rendering trusted HTML (banners, SVG icons). Allowlists safe structural + SVG tags.

### `sanitizeRichText(dirty: string): string`

For WYSIWYG editor content (bundle product description). Allows formatting tags (b, i, u, a, lists, headings) but strips scripts and event handlers.

### `sanitizeText(dirty: string): string`

Strips ALL HTML. For plain-text fields (titles, names, labels).

### `sanitizeCss(dirty: string): string`

Strips JS expressions, `@import`, `data:` URLs from custom CSS.

## Targets

### Admin HTML Rendering (DOMPurify)

| File                                                        | Line | Current                   | Fix                                     |
| ----------------------------------------------------------- | ---- | ------------------------- | --------------------------------------- |
| `shared/components/feedback/banner/global-banner.tsx`       | 54   | `__html: message.content` | `__html: sanitizeHtml(message.content)` |
| `shared/components/data-display/metric-card.tsx`            | 36   | `__html: img.svg`         | `__html: sanitizeHtml(img.svg)`         |
| `features/dashboard/components/dashboard-quick-actions.tsx` | 59   | `__html: action.img.svg`  | `__html: sanitizeHtml(action.img.svg)`  |

### Bundle as Product (DOMPurify)

| Field                                   | Location                          | Fix                                         |
| --------------------------------------- | --------------------------------- | ------------------------------------------- |
| `productTitle`                          | `product-mutations.action.ts:254` | `sanitizeText(input.title)`                 |
| `productDescription` (write)            | `product-mutations.action.ts:255` | `sanitizeRichText(input.description)`       |
| `productDescription` (read)             | `product-queries.action.ts:58`    | `sanitizeRichText(product.descriptionHtml)` |
| `bundleName` → `title`                  | `shopify-operation.service.ts:33` | `sanitizeText(bundleName)`                  |
| `bundleDescription` → `descriptionHtml` | `shopify-operation.service.ts:34` | `sanitizeRichText(bundleDescription)`       |

### Bundle Zod Schema (replace regex with DOMPurify)

| Field            | Location        | Current                            | Fix                                    |
| ---------------- | --------------- | ---------------------------------- | -------------------------------------- |
| `name`           | `zod.schema.ts` | `.transform(sanitizeHtml)` (regex) | `.transform(sanitizeText)` (DOMPurify) |
| `description`    | `zod.schema.ts` | `.transform(sanitizeHtml)` (regex) | `.transform(sanitizeText)` (DOMPurify) |
| `marketingCopy`  | `zod.schema.ts` | `.transform(sanitizeHtml)` (regex) | `.transform(sanitizeText)` (DOMPurify) |
| `seoTitle`       | `zod.schema.ts` | `.transform(sanitizeHtml)` (regex) | `.transform(sanitizeText)` (DOMPurify) |
| `seoDescription` | `zod.schema.ts` | `.transform(sanitizeHtml)` (regex) | `.transform(sanitizeText)` (DOMPurify) |

### BundleSettings Fields (add sanitization)

| Field            | Location            | Fix                            |
| ---------------- | ------------------- | ------------------------------ |
| `title`          | Settings Zod schema | Add `.transform(sanitizeText)` |
| `subtitle`       | Settings Zod schema | Add `.transform(sanitizeText)` |
| `cartButtonText` | Settings Zod schema | Add `.transform(sanitizeText)` |

### Settings — Custom CSS

| Field       | Location             | Fix                         |
| ----------- | -------------------- | --------------------------- |
| `customCss` | `settings.action.ts` | `sanitizeCss()` before save |

### Settings — Labels (JSON)

| Field      | Location             | Fix                                |
| ---------- | -------------------- | ---------------------------------- |
| `labels.*` | `settings.action.ts` | `sanitizeText()` each string value |
