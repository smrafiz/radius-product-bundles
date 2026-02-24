# App Bridge Migration Report — Radius Product Bundles

> Generated: 2026-02-22 | Branch: `caching-test`
> Sources: Shopify Dev MCP (App Bridge Migration Guide, React Migration Guide), Codebase Analysis

---

## Current State

### Installed Packages (`web/package.json`)

| Package                        | Installed Version | Latest   | Status                         |
| ------------------------------ | ----------------- | -------- | ------------------------------ |
| `@shopify/app-bridge`          | `^3.7.11`         | `3.7.11` | **LEGACY — should be removed** |
| `@shopify/app-bridge-react`    | `^4.2.10`         | `4.2.10` | Current                        |
| `@shopify/app-bridge-types`    | `^0.7.0`          | `0.7.0`  | Current                        |
| `@shopify/app-bridge-ui-types` | `^0.3.3`          | `0.3.3`  | Current                        |

### Key Finding

Your app is **already mostly on App Bridge v4**. You have:

- The CDN `app-bridge.js` script tag in `web/app/layout.tsx:29`
- `@shopify/app-bridge-react@4.2.10` (latest v4)
- No `Provider` component (correct for v4)
- `useAppBridge()` used correctly (returns the `shopify` global in v4)
- v4 React components: `TitleBar`, `SaveBar`, `NavMenu` — all used correctly

The **only issue** is the stale `@shopify/app-bridge@^3.7.11` dependency in `package.json`. This package is the **legacy v3 npm package** and is **not imported anywhere** in the codebase. It can be safely removed.

---

## Migration Checklist

| Step                                                  | Status   | Notes                   |
| ----------------------------------------------------- | -------- | ----------------------- |
| CDN `app-bridge.js` script tag                        | Done     | `layout.tsx:29`         |
| `@shopify/app-bridge-react` v4                        | Done     | `4.2.10` installed      |
| Remove `Provider` wrapper                             | Done     | No Provider found       |
| `useAppBridge` returns `shopify` global               | Done     | Used in 30+ files       |
| `TitleBar` uses child `<button>` elements (not props) | Done     | 6 files                 |
| `SaveBar` uses child elements                         | Done     | `global-form.tsx`       |
| `NavMenu` component (not `NavigationMenu`)            | Done     | `navigation.tsx`        |
| Remove `@shopify/app-bridge` v3 dependency            | **TODO** | Still in `package.json` |
| `@shopify/app-bridge-types` in tsconfig               | Done     | `tsconfig.json:17`      |
| Global type declarations for web components           | Done     | `global.d.ts`           |

---

## Action Required

### 1. Remove the legacy `@shopify/app-bridge` v3 package

```bash
cd web && bun remove @shopify/app-bridge
```

This package (`@shopify/app-bridge@3.7.11`) is not imported anywhere. Removing it:

- Shrinks `node_modules`
- Eliminates confusion between v3 (npm) and v4 (CDN) architectures
- Prevents accidental imports from the legacy package

### 2. (Optional) Verify no transitive dependency needs it

After removal, run `bun install` and confirm no peer dependency warnings. The v4 `@shopify/app-bridge-react` does **not** depend on `@shopify/app-bridge` — it relies on the CDN script.

---

## Files Using App Bridge (42 files total)

### Core Infrastructure (5 files)

| File                                            | Imports                     | Usage                                                                  |
| ----------------------------------------------- | --------------------------- | ---------------------------------------------------------------------- |
| `web/app/layout.tsx:29`                         | CDN script                  | `<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js">`    |
| `web/global.d.ts:1,15`                          | `@shopify/app-bridge-types` | Type declarations for web components (`ui-modal`, `ui-nav-menu`, etc.) |
| `web/tsconfig.json:17`                          | —                           | `types: ["@shopify/app-bridge-types"]`                                 |
| `web/shared/utils/shopify/shopify-helpers.ts:4` | `useAppBridge`              | `getSessionToken()`, `window.shopify?.loading()`                       |
| `web/shared/hooks/data/use-graphql.ts:5`        | `useAppBridge`              | `app.idToken()` for session tokens                                     |

### Navigation & Layout (2 files)

| File                                                | Imports   | Usage                                |
| --------------------------------------------------- | --------- | ------------------------------------ |
| `web/shared/components/navigation/navigation.tsx:2` | `NavMenu` | App navigation menu — **v4 pattern** |
| `web/shared/components/forms/global-form.tsx:14`    | `SaveBar` | Contextual save bar — **v4 pattern** |

### TitleBar Usage (6 files)

All use the **v4 pattern** (`<TitleBar title="...">` with child `<button>` elements):

| File                                                                                | Import                      |
| ----------------------------------------------------------------------------------- | --------------------------- |
| `web/features/dashboard/components/dashboard-page/dashboard-page.tsx:17`            | `TitleBar`                  |
| `web/features/bundles/components/edit-bundle-page/edit-bundle-page.tsx:16`          | `TitleBar`                  |
| `web/features/bundles/components/bundle-creation/form/bundle-creation-form.tsx:12`  | `TitleBar`                  |
| `web/features/bundles/components/bundle-listing-page/bundle-listing-page.tsx:9`     | `TitleBar`                  |
| `web/features/bundles/components/bundle-type-selection/bundle-type-selection.tsx:9` | `TitleBar`                  |
| `web/features/settings/components/settings-page/settings-page.tsx:12`               | `TitleBar`                  |
| `web/features/analytics/components/analytics-page/analytics-page.tsx:4`             | `TitleBar` + `useAppBridge` |
| `web/features/pricing/components/pricing-page/pricing-page.tsx:4`                   | `TitleBar`                  |

### `useAppBridge` Hook Usage (29 files)

All use the **v4 pattern** (`const app = useAppBridge()` returning the `shopify` global):

| File                                                                   | Primary Usage                     |
| ---------------------------------------------------------------------- | --------------------------------- |
| `web/shared/hooks/session/use-session-provider.ts`                     | Session token via `app.idToken()` |
| `web/shared/hooks/shopify/use-product-picker.ts`                       | `app.resourcePicker()`            |
| `web/shared/api/media/media.mutations.ts`                              | Session token                     |
| `web/features/bundles/api/bundles.queries.ts`                          | Session token                     |
| `web/features/bundles/hooks/data/use-edit-bundle.ts`                   | Session token                     |
| `web/features/bundles/hooks/data/use-bundles-data.ts`                  | Session token                     |
| `web/features/bundles/hooks/form/use-bundle-submit.ts`                 | Session token                     |
| `web/features/bundles/hooks/form/use-bundle-product.ts`                | `resourcePicker` + toast          |
| `web/features/bundles/hooks/form/use-media-upload.ts`                  | Session token                     |
| `web/features/bundles/hooks/form/use-create-bundle-product.ts`         | Session token                     |
| `web/features/bundles/hooks/form/use-auto-generate-name.ts`            | Session token                     |
| `web/features/bundles/hooks/actions/use-bundle-actions.ts`             | Session token                     |
| `web/features/bundles/hooks/actions/use-bundle-table-bulk-actions.tsx` | Session token                     |
| `web/features/bundles/stores/bundle-listing.store.ts`                  | Session token                     |
| `web/features/settings/api/settings.queries.ts`                        | Session token                     |
| `web/features/settings/api/settings.mutations.ts`                      | Session token                     |
| `web/features/settings/hooks/settings/use-settings-query.ts`           | Session token                     |
| `web/features/settings/hooks/settings/use-settings-submit.ts`          | Session token + toast             |
| `web/features/settings/hooks/settings/use-save-settings.ts`            | Session token + toast             |
| `web/features/settings/hooks/settings/use-reset-settings.ts`           | Session token + toast             |
| `web/features/settings/hooks/settings/use-refetch-settings.ts`         | Session token                     |
| `web/features/settings/hooks/settings/use-settings-tools.ts`           | Session token + toast             |
| `web/features/analytics/api/analytics.queries.ts`                      | Session token                     |
| `web/features/analytics/hooks/use-analytics.ts`                        | Session token                     |
| `web/features/analytics/hooks/use-top-bundles.ts`                      | Session token                     |
| `web/features/analytics/hooks/use-all-bundles.ts`                      | Session token                     |
| `web/features/dashboard/api/setup-guide.queries.ts`                    | Session token                     |
| `web/features/dashboard/hooks/use-setup-guide.ts`                      | Session token + toast             |

### Direct `shopify` Global Usage (toast/loading — no import needed)

These files access `window.shopify` or the `shopify` global directly (v4 pattern):

| File                                                             | Usage                           |
| ---------------------------------------------------------------- | ------------------------------- |
| `web/shared/components/loading/progress/global-loader.tsx`       | `window.shopify.loading()`      |
| `web/features/bundles/hooks/data/use-bundles-page.ts`            | `shopify.toast.show()`          |
| `web/features/bundles/hooks/form/use-bundle-form-methods.ts`     | `shopify.toast.show()`          |
| `web/features/bundles/hooks/ui/use-step-indicator.ts`            | `shopify.toast.show()`          |
| `web/features/settings/hooks/customizer/use-customizer-panel.ts` | `window.shopify?.toast?.show()` |
| `web/features/settings/hooks/customizer/use-customizer-page.ts`  | `window.shopify?.loading()`     |

---

## App Bridge v4 Migration Guide (Reference)

Based on [Shopify's official React migration guide](https://shopify.dev/docs/api/app-bridge/migration-guide-react):

### Step 1: CDN Script Tag (Already Done)

```html
<head>
    <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
</head>
```

### Step 2: Install `@shopify/app-bridge-react@latest` (Already Done)

```bash
bun add @shopify/app-bridge-react@latest
```

### Step 3: Remove `Provider` Wrapper (Already Done)

v4 does not need a React Provider — the CDN script handles initialization.

### Step 4: Component Changes

| Component    | v3                                                       | v4 (Current)                                                                |
| ------------ | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| **TitleBar** | `primaryAction`, `secondaryActions`, `breadcrumbs` props | Child `<button>` elements with `variant="primary"` / `variant="breadcrumb"` |
| **SaveBar**  | `useContextualSaveBar()` hook                            | `<SaveBar id="..." open={bool}>` with child `<button>` elements             |
| **NavMenu**  | `<NavigationMenu navigationLinks={[...]} />`             | `<NavMenu>` with child `<Link>` elements                                    |
| **Modal**    | `size`, `message`, `title`, `onClose` props              | `variant`, children, `<TitleBar>` inside, `onHide`                          |

### Step 5: Hook Changes

| v3 Hook                                   | v4 Replacement                               |
| ----------------------------------------- | -------------------------------------------- |
| `useAppBridge()` → returns `app` instance | `useAppBridge()` → returns `shopify` global  |
| `useAuthenticatedFetch()`                 | Not needed — `fetch()` is auto-authenticated |
| `useContextualSaveBar()`                  | `<SaveBar>` component                        |
| `useNavigate()`                           | `shopify.navigation.navigate()`              |
| `useToast()`                              | `shopify.toast.show()`                       |

### Step 6: API Access

| v3                                            | v4                                     |
| --------------------------------------------- | -------------------------------------- |
| `import createApp from '@shopify/app-bridge'` | Not needed — CDN handles init          |
| `app.dispatch(Toast.Action.SHOW)`             | `shopify.toast.show('message')`        |
| `app.dispatch(Redirect.Action.APP)`           | `shopify.navigation.navigate()`        |
| Custom authenticated fetch                    | Standard `fetch()` with automatic auth |

---

## Summary

| Category            | Status                                                                  |
| ------------------- | ----------------------------------------------------------------------- |
| **Architecture**    | Fully v4 — CDN script + React components                                |
| **Components**      | All using v4 API (`TitleBar`, `SaveBar`, `NavMenu`)                     |
| **Hooks**           | `useAppBridge()` returns `shopify` global (v4)                          |
| **Global API**      | `shopify.toast`, `shopify.loading`, `app.resourcePicker`, `app.idToken` |
| **Legacy package**  | `@shopify/app-bridge@3.7.11` in `package.json` but **unused**           |
| **Required action** | Remove `@shopify/app-bridge` from dependencies                          |
| **Risk**            | **Very low** — only removing an unused package                          |
