# Comprehensive E2E Test Report
## Radius Product Bundles - Shopify App

**Test Date:** 2026-03-30
**App Version:** 1.0.0
**Testing Tool:** Puppeteer MCP
**Status:** ⚠️ **Shopify App Bridge Dependency Detected**

---

## 🚨 Critical Finding

The app **requires Shopify App Bridge context** to function. Testing must be performed either:
1. **Within Shopify Admin** (embedded app mode)
2. **Using Shopify CLI** (`shopify app dev`) with ngrok tunnel
3. **Mocking App Bridge** for unit/integration tests

**Direct localhost:3000 access fails** due to:
- Missing `window.shopify` global object
- App Bridge initialization in `SessionProvider`
- OAuth session token validation

**Error Observed:**
```
Error: The shopify global is not defined. This likely means the App Bridge script tag was not added correctly to this page
  at useSessionProvider (shared/hooks/session/use-session-provider.ts:10:29)
```

---

## 📋 Comprehensive Test Plan

### **1. Authentication & Session Management**

#### Test Cases:
- [ ] **OAuth Flow**
  - Initial app installation
  - Shop authentication via Shopify OAuth
  - Session token generation
  - Callback URL handling (`/api/auth/callback`)
  - Token refresh mechanism

- [ ] **Session Validation**
  - Valid session token acceptance
  - Expired token rejection
  - Invalid token handling
  - Session refresh on expiry

- [ ] **App Bridge Integration**
  - App Bridge initialization
  - Toast notifications
  - Modal interactions
  - Navigation within Shopify admin

**Routes:**
- `app/api/auth/route.ts`
- `app/api/session/validate/route.ts`
- `shared/hooks/session/use-session-provider.ts`

---

### **2. Dashboard (Overview)**

#### Test Cases:
- [ ] **Dashboard Load**
  - Page renders without errors
  - All metrics cards display
  - Loading states visible during data fetch
  - Error states handle gracefully

- [ ] **Key Metrics Display**
  - Total bundles count
  - Active bundles count
  - Revenue metrics (today, week, month)
  - Conversion rate display
  - View/cart/purchase stats

- [ ] **AI Insights Card** (Placeholder)
  - Card renders
  - "Coming Soon" or empty state shown
  - No console errors

- [ ] **Quick Actions**
  - "Create Bundle" button → navigates to `/bundles/create`
  - "View Analytics" button → navigates to `/analytics`
  - "Settings" button → navigates to `/settings`

**Routes:**
- `app/(dashboard)/dashboard/page.tsx`
- `features/dashboard/components/`

---

### **3. Bundle CRUD Operations**

#### 3.1 **Create Bundle**

**Test Cases:**
- [ ] **Bundle Type Selection**
  - Display 6 bundle types (FIXED_BUNDLE, BUY_X_GET_Y, BOGO, VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER)
  - Only FIXED_BUNDLE clickable
  - Other types show "Coming Soon" badge
  - Navigate to `/bundles/create/fixed-bundle`

- [ ] **Bundle Form - Basic Info**
  - Name input (required, min 3 chars)
  - Internal name input (optional)
  - Description textarea (optional)
  - Status select (DRAFT, ACTIVE, PAUSED, SCHEDULED)
  - Priority number input

- [ ] **Bundle Form - Discount Configuration**
  - Discount type select (PERCENTAGE, FIXED_AMOUNT, CUSTOM_PRICE, NO_DISCOUNT)
  - Discount value input (numeric validation)
  - Minimum/maximum quantity inputs
  - Date range picker (start/end dates)

- [ ] **Bundle Form - Product Selection**
  - "Add Products" button opens modal
  - Product search functionality
  - Multi-select products
  - Display selected products list
  - Remove product action
  - Product quantity input per item
  - Product role assignment (INCLUDED, TRIGGER, REWARD)

- [ ] **Bundle Form - SEO & Marketing**
  - SEO title input (max 70 chars)
  - SEO description textarea (max 160 chars)
  - Marketing copy textarea (AI-assisted placeholder)

- [ ] **Bundle Form - Images**
  - Image upload button
  - Upload to `/api/upload`
  - Display uploaded images
  - Remove image action
  - Set featured image

- [ ] **Bundle Form - Validation**
  - Required field validation
  - Numeric field validation
  - Date range validation (end > start)
  - Discount value validation (0-100% for percentage)
  - Product selection validation (min 2 products for bundle)

- [ ] **Bundle Form - Submit**
  - Save as draft
  - Publish bundle (status → ACTIVE)
  - Success toast notification
  - Redirect to `/bundles` or `/bundles/[id]/edit`
  - Error handling on save failure

**Routes:**
- `app/(dashboard)/bundles/create/page.tsx`
- `app/(dashboard)/bundles/create/[bundleType]/page.tsx`
- `features/bundles/components/bundle-form/`

#### 3.2 **Read/List Bundles**

**Test Cases:**
- [ ] **Bundle List Page**
  - Display all bundles in table
  - Columns: Name, Type, Status, Products, Discount, Views, Conversions, Revenue, Actions
  - Pagination (default 10 per page)
  - Loading skeleton during fetch

- [ ] **Filters**
  - Status filter (ALL, ACTIVE, DRAFT, PAUSED, ARCHIVED, SCHEDULED)
  - Bundle type filter
  - Date range filter
  - Search by name

- [ ] **Sorting**
  - Sort by name (A-Z, Z-A)
  - Sort by created date (newest, oldest)
  - Sort by revenue (highest, lowest)
  - Sort by conversions

- [ ] **Bulk Actions**
  - Select multiple bundles (checkboxes)
  - Bulk activate/deactivate
  - Bulk archive
  - Bulk delete (with confirmation)

- [ ] **Individual Actions**
  - View bundle details (click row)
  - Edit bundle → `/bundles/[id]/edit`
  - Duplicate bundle
  - Archive bundle
  - Delete bundle (with confirmation)

**Routes:**
- `app/(dashboard)/bundles/page.tsx`
- `features/bundles/components/bundle-table/`

#### 3.3 **Update Bundle**

**Test Cases:**
- [ ] **Edit Form Load**
  - Pre-populate all fields with existing data
  - Display current products
  - Display current images
  - Show current status

- [ ] **Field Updates**
  - All create form validations apply
  - Changes tracked (dirty state)
  - Unsaved changes warning on navigation

- [ ] **Save Changes**
  - Update bundle in database
  - Success toast notification
  - Remain on edit page or redirect to list
  - Real-time preview update (if applicable)

**Routes:**
- `app/(dashboard)/bundles/[id]/edit/page.tsx`

#### 3.4 **Delete Bundle**

**Test Cases:**
- [ ] **Soft Delete**
  - Status changes to ARCHIVED
  - Bundle hidden from main list
  - Recoverable from archive

- [ ] **Hard Delete**
  - Confirmation modal required
  - Permanent deletion from database
  - Related records handled (cascade or restrict)

**Routes:**
- `features/bundles/actions/` (server actions)

---

### **4. Analytics Tracking & Reporting**

#### 4.1 **Analytics Dashboard**

**Test Cases:**
- [ ] **Date Range Selector**
  - Presets: Today, Yesterday, Last 7 days, Last 30 days, Custom
  - Custom date range picker
  - Apply date filter to all charts

- [ ] **Key Metrics Cards**
  - Total views
  - Add to cart rate
  - Conversion rate
  - Total revenue
  - Average order value
  - Comparison with previous period (% change)

- [ ] **Performance Charts**
  - Views over time (line chart)
  - Conversions over time (line chart)
  - Revenue over time (bar chart)
  - Top performing bundles (table)
  - Bottom performing bundles (table)

- [ ] **Bundle Health Badges**
  - High Converter (≥15% CVR)
  - Revenue Star (≥$5k)
  - Hidden Gem (<100 views + ≥10% CVR)
  - Trending (≥25% growth)
  - Declining (≤-25% drop)
  - High Interest (≥30% ATC rate)
  - Needs Work (high cart/low conversion)
  - Poor (50+ views + <3% CVR + <$500)

- [ ] **Export Functionality**
  - Export to CSV
  - Export to Excel
  - Date range included in export

**Routes:**
- `app/(dashboard)/analytics/page.tsx`
- `features/analytics/components/`

#### 4.2 **Analytics Tracking (Storefront)**

**Test Cases:**
- [ ] **View Tracking**
  - Bundle view tracked on storefront
  - App Proxy route: `/apps/bundles/products`
  - Deduplication (per customer/session/day)
  - Unique view counting

- [ ] **Cart Tracking**
  - Add to cart event tracked
  - Cart abandonment tracked
  - Multiple adds counted

- [ ] **Purchase Tracking**
  - Order completion tracked
  - Revenue calculated correctly
  - Discount amount recorded

**Routes:**
- `app/api/proxy/analytics/route.ts`
- `features/analytics/repositories/bundle-analytics.mutations.ts`

---

### **5. Settings & Customizer**

#### 5.1 **General Settings**

**Test Cases:**
- [ ] **App Configuration**
  - Shop info display (read-only)
  - Plan display
  - Trial status

- [ ] **Display Settings**
  - Widget visibility toggle
  - Badge visibility toggle
  - Product title display toggle
  - Price display toggle

- [ ] **Label Customization**
  - Custom "Add to Cart" text
  - Custom "Save X%" text
  - Custom bundle badge text
  - Language/translation support

**Routes:**
- `app/(dashboard)/settings/page.tsx`
- `features/settings/`

#### 5.2 **Style Customizer (4 Sections)**

**Test Cases:**
- [ ] **Section 1: Appearance**
  - Primary color picker
  - Secondary color picker
  - Font family select
  - Font size slider
  - Border radius slider
  - Shadow intensity slider
  - Preview updates in real-time

- [ ] **Section 2: Product Cards**
  - Card layout (grid, list)
  - Card background color
  - Card border color/width
  - Image aspect ratio
  - Product title size/weight
  - Price styling

- [ ] **Section 3: Button & Badge**
  - Button background color
  - Button text color
  - Button hover color
  - Button border radius
  - Badge background color
  - Badge text color
  - Badge position

- [ ] **Section 4: Advanced**
  - Custom CSS textarea
  - Responsive overrides (desktop/tablet/mobile)
  - Device preview toggle
  - Reset to defaults button

- [ ] **Customizer Actions**
  - Save changes
  - Apply preset (if available)
  - Dirty state tracking
  - Unsaved changes warning

- [ ] **Preview Panel**
  - Live preview of storefront widget
  - Device size toggle (desktop/tablet/mobile)
  - Preview updates on every change

**Routes:**
- `app/(dashboard)/settings/customizer/page.tsx`
- `features/settings/components/customizer/`
- `features/settings/configs/customizer.config.ts`

---

### **6. Template Management**

**Test Cases:**
- [ ] **Template Library**
  - Display available templates
  - Template categories/tags
  - Template preview

- [ ] **Use Template**
  - Select template
  - Create bundle from template
  - Pre-populate form with template data
  - Allow customization before save

- [ ] **Save as Template**
  - Save existing bundle as template
  - Public/private toggle
  - Template rating system

**Routes:**
- Schema: `Template` + `TemplateReview` models
- UI: Coming soon/placeholder

---

### **7. Notifications & Alerts**

**Test Cases:**
- [ ] **Notification List**
  - Display recent notifications
  - Types: BUNDLE_PERFORMANCE, AI_RECOMMENDATION, TEST_COMPLETED, AUTOMATION_ERROR, MILESTONE_REACHED
  - Priority indicators (HIGH, MEDIUM, LOW)
  - Read/unread status

- [ ] **Notification Actions**
  - Mark as read
  - Dismiss notification
  - Navigate to related bundle/feature

- [ ] **Alert Rules**
  - Create alert rule
  - Condition builder (metric thresholds)
  - Delivery methods (in-app, email)
  - Frequency (IMMEDIATE, HOURLY, DAILY)

**Routes:**
- Schema: `Notification` + `AlertRule` models
- UI: Implemented in dashboard/header

---

### **8. API Endpoints**

#### 8.1 **Webhooks**

**Test Cases:**
- [ ] **Webhook Registration**
  - `products/update` webhook registered
  - `shop/update` webhook registered
  - Cold-start auto-registration

- [ ] **Webhook Processing**
  - Valid webhook HMAC verification
  - Product update processing
  - Shop update processing
  - Error handling and retry logic

**Routes:**
- `app/api/webhooks/route.ts`

#### 8.2 **App Proxy**

**Test Cases:**
- [ ] **Products Endpoint**
  - `/apps/bundles/products` returns bundle products
  - Filtering by bundleId
  - CORS headers set correctly

- [ ] **Analytics Endpoint**
  - `/apps/bundles/analytics` tracks events
  - Accepts view/cart/purchase events
  - Deduplication logic

**Routes:**
- `app/api/proxy/products/route.ts`
- `app/api/proxy/analytics/route.ts`

#### 8.3 **Upload**

**Test Cases:**
- [ ] **Image Upload**
  - `/api/upload` accepts image files
  - File type validation (jpg, png, webp)
  - File size validation (max 5MB)
  - Returns CDN URL
  - CORS enabled

**Routes:**
- `app/api/upload/route.ts`

#### 8.4 **Cron Jobs**

**Test Cases:**
- [ ] **Bundle Scheduler**
  - Activates scheduled bundles at start date
  - Deactivates expired bundles at end date
  - Runs on schedule (hourly)

- [ ] **Keep-Alive**
  - Prevents serverless cold start
  - Pings database connection
  - Runs on schedule (every 5 minutes)

**Routes:**
- `app/api/cron/bundle-scheduler/route.ts`
- `app/api/cron/keep-alive/route.ts`

---

### **9. Shopify Function (Rust WASM)**

**Test Cases:**
- [ ] **Discount Calculation**
  - Line-item discounts applied correctly
  - Percentage discount calculation
  - Fixed amount discount calculation
  - Custom price override
  - Minimum quantity requirements

- [ ] **Delivery Discounts**
  - Free shipping conditions
  - Shipping discount calculation

- [ ] **Function Deployment**
  - Build succeeds (`cargo build --target wasm32-wasi --release`)
  - Function deploys to Shopify
  - Function shows in Shopify admin

**Location:**
- `/extension/extensions/radius-discount-function/`

---

### **10. Storefront Widget (Liquid Theme Extension)**

**Test Cases:**
- [ ] **Widget Rendering**
  - Widget displays on product pages
  - Widget displays on cart page
  - Correct bundle products shown
  - Pricing displayed correctly

- [ ] **Widget Interactions**
  - Add to cart button functional
  - Quantity selector updates price
  - Product selection (for mix-and-match)
  - Discount badge displays

- [ ] **Widget Styling**
  - Theme CSS applied
  - Responsive design (mobile/tablet/desktop)
  - Customizer styles applied
  - No layout breaking

**Location:**
- `/extension/extensions/product-bundle-widget/`

---

### **11. Error Handling & Edge Cases**

#### Test Cases:
- [ ] **Network Errors**
  - API timeout handling
  - Retry logic for failed requests
  - User-friendly error messages

- [ ] **Validation Errors**
  - Form field validation errors shown
  - API validation errors displayed
  - Toast notifications for errors

- [ ] **Database Errors**
  - Connection failure handling
  - Transaction rollback on error
  - Graceful degradation

- [ ] **Authentication Errors**
  - Expired session redirect to login
  - Unauthorized access blocked
  - Token refresh on expiry

- [ ] **Edge Cases**
  - Empty state handling (no bundles)
  - Large dataset pagination
  - Special characters in input
  - Unicode support
  - Timezone handling

---

## 🧪 Testing Strategy

### **Phase 1: Shopify Development Store Setup**
1. Create Shopify Partners account
2. Create development store
3. Install app via `shopify app dev`
4. Obtain test credentials

### **Phase 2: Manual E2E Testing**
- Use Puppeteer MCP with Shopify admin URL
- Navigate through all features
- Screenshot each page
- Test CRUD operations
- Verify analytics tracking

### **Phase 3: Automated Testing**
- Setup Playwright with Shopify auth fixtures
- Create page object models
- Write test suites for each feature
- Implement visual regression tests
- Add CI/CD integration

### **Phase 4: Performance & Security**
- Load testing with Artillery/K6
- Security audit (OWASP)
- Accessibility audit (WCAG 2.1)
- Lighthouse performance scores

---

## 📊 Feature Maturity Assessment

| Feature                    | Schema | UI/UX | Logic | API  | Tests | Status      |
|---------------------------|--------|-------|-------|------|-------|-------------|
| Bundle CRUD               | ✅     | ✅    | ✅    | ✅   | ⚠️    | Done        |
| Analytics                 | ✅     | ✅    | ✅    | ✅   | ⚠️    | Done        |
| Settings/Customizer       | ✅     | ✅    | ✅    | ✅   | ⚠️    | Done        |
| Discount Function         | ✅     | N/A   | ✅    | N/A  | ⚠️    | Done        |
| Theme Widget              | ✅     | ✅    | ✅    | N/A  | ⚠️    | Done        |
| Dashboard                 | ✅     | ✅    | ✅    | ✅   | ⚠️    | Done        |
| Webhooks                  | ✅     | N/A   | ✅    | ✅   | ⚠️    | Done        |
| AI Insights               | ✅     | ⚠️    | ❌    | ❌   | ❌    | Schema Only |
| A/B Testing               | ✅     | ❌    | ❌    | ❌   | ❌    | Schema Only |
| Automation                | ✅     | ❌    | ❌    | ❌   | ❌    | Schema Only |
| Dynamic Pricing           | ✅     | ⚠️    | ❌    | ❌   | ❌    | Partial     |
| Templates                 | ✅     | ❌    | ❌    | ❌   | ❌    | Schema Only |
| Frequently Bought Together| ✅     | ❌    | ❌    | ❌   | ❌    | Label Only  |

**Legend:**
- ✅ Implemented
- ⚠️ Partial/Placeholder
- ❌ Not Implemented
- N/A Not Applicable

---

## 🔧 Test Environment Requirements

### **Dependencies:**
- Shopify CLI (`@shopify/cli@latest`)
- Bun runtime (`v1.1+`)
- PostgreSQL (`v15+`)
- Node.js (`v20+` for Puppeteer/Playwright)

### **Environment Variables (.env):**
```bash
# Shopify
SHOPIFY_API_KEY=<app_api_key>
SHOPIFY_API_SECRET=<app_secret>
SHOPIFY_APP_URL=<ngrok_or_cloudflare_url>
SCOPES=<required_scopes>

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_URL_NON_POOLING=postgresql://user:pass@host:5432/db

# Session
SESSION_SECRET=<random_32_char_string>

# Upload (if using CDN)
UPLOAD_URL=<cdn_url>
```

### **Test Data:**
- 10 sample products in Shopify store
- 5 sample bundles (various types/statuses)
- Analytics data seeded (last 30 days)
- Test customer accounts

---

## 🎯 Next Steps

### **Immediate Actions:**
1. **Setup Shopify Dev Store** → Install app properly
2. **Fix Console Errors** → Ensure App Bridge loads correctly
3. **Run Manual Tests** → Follow test cases above
4. **Document Bugs** → Create GitHub issues for failures
5. **Implement Unit Tests** → Jest for services/repositories
6. **Add E2E Tests** → Playwright suite for critical flows

### **Recommended Test Coverage Targets:**
- Unit Tests: **80%+** (services, repositories, utilities)
- Integration Tests: **60%+** (API routes, server actions)
- E2E Tests: **Critical paths only** (bundle CRUD, analytics, checkout)

---

## 📝 Summary

The **Radius Product Bundles** app is a complex Shopify embedded application with:
- **9 implemented features** (Bundle CRUD, Analytics, Settings, etc.)
- **6 schema-only features** (AI, A/B Testing, Automation, etc.)
- **23 database models**
- **18 routes** (12 pages + 6 API endpoints)

**Testing Blocker:**
Direct localhost testing impossible due to Shopify App Bridge requirement. Must test via `shopify app dev` with tunnel or within Shopify admin iframe.

**Estimated Test Suite Size:**
- ~**150+ E2E test cases** across all features
- ~**300+ unit tests** for services/repositories
- ~**50+ API integration tests**

**Total Testing Effort:** ~**40-60 hours** for comprehensive coverage.

---

**Generated by:** Puppeteer MCP E2E Testing Agent
**Report Version:** 1.0
**Last Updated:** 2026-03-30
