# Testing Quick Start Guide
## Radius Product Bundles - E2E Testing

---

## 🚀 How to Test Your App (Step-by-Step)

### **Step 1: Start Development Server with Shopify CLI**

```bash
# From project root
bun run dev:app

# This will:
# 1. Start Next.js dev server
# 2. Create ngrok/cloudflare tunnel
# 3. Open Shopify Partners dashboard
# 4. Install app in dev store
```

### **Step 2: Access App in Shopify Admin**

```bash
# Navigate to your development store admin
https://your-dev-store.myshopify.com/admin

# Click on "Apps" → "Radius Product Bundles"
# The app will load in an iframe with proper Shopify context
```

### **Step 3: Manual Testing Checklist**

#### ✅ **Dashboard Test** (2 minutes)
- [ ] Dashboard loads without errors
- [ ] Metrics cards display (bundles, revenue, conversions)
- [ ] "Create Bundle" button works
- [ ] Navigation menu visible

#### ✅ **Create Bundle Test** (5 minutes)
- [ ] Click "Create Bundle" → Type selection page loads
- [ ] Click "Fixed Bundle" → Form loads
- [ ] Fill in:
  - Name: "Test Summer Bundle"
  - Discount Type: Percentage
  - Discount Value: 20
- [ ] Click "Add Products" → Select 2-3 products
- [ ] Click "Save" → Bundle created successfully
- [ ] Check bundle list → New bundle appears

#### ✅ **Bundle List Test** (3 minutes)
- [ ] Navigate to Bundles page
- [ ] See list of all bundles
- [ ] Click bundle name → Edit page opens
- [ ] Test filters (status, type)
- [ ] Test search by name
- [ ] Test bulk actions (select multiple, change status)

#### ✅ **Analytics Test** (3 minutes)
- [ ] Navigate to Analytics page
- [ ] Date range selector works
- [ ] Metrics cards display
- [ ] Charts render (may be empty if no storefront activity)
- [ ] Export button present

#### ✅ **Settings Customizer Test** (5 minutes)
- [ ] Navigate to Settings → Customizer
- [ ] **Appearance Section:**
  - Change primary color → Preview updates
  - Adjust font size slider → Preview updates
- [ ] **Product Cards Section:**
  - Change card background → Preview updates
- [ ] **Button & Badge Section:**
  - Change button color → Preview updates
- [ ] **Advanced Section:**
  - Toggle device preview (desktop/tablet/mobile)
  - Check responsive view
- [ ] Click "Save Changes" → Success toast appears

#### ✅ **Storefront Widget Test** (10 minutes)
This requires your dev store to be accessible:

1. **Install Theme Extension:**
   ```bash
   # From project root
   bun run deploy
   # Select theme extension to deploy
   ```

2. **Enable Extension in Theme:**
   - Go to Online Store → Themes
   - Click "Customize" on your dev theme
   - Add "Bundle Widget" app block to product pages
   - Save theme

3. **Test on Storefront:**
   - Open a product page that's in an active bundle
   - Verify widget displays
   - Verify products and pricing shown
   - Click "Add to Cart" → Cart should contain bundle items
   - Verify discount applied in cart

#### ✅ **API Endpoints Test** (with curl)

```bash
# Test webhook endpoint (will be 401 without proper auth, which is expected)
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Expected: 401 Unauthorized (correct behavior)

# Test upload endpoint
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.jpg"

# Expected: 401 or validation error (correct behavior)
```

---

## 🤖 Automated Testing with Puppeteer MCP

If you have Puppeteer MCP running (like in your current setup):

### **Test 1: Dashboard Load**
```javascript
// Navigate to dashboard
await navigate("https://your-dev-store.myshopify.com/admin/apps/radius-bundles");

// Wait for iframe to load
await page.waitForSelector('[name="app-iframe"]');

// Switch to iframe context
const frame = page.frame({name: 'app-iframe'});

// Take screenshot
await screenshot("dashboard-loaded", { fullPage: true });
```

### **Test 2: Create Bundle Flow**
```javascript
// Click create button
await click('button:has-text("Create Bundle")');

// Select fixed bundle type
await click('[data-bundle-type="FIXED_BUNDLE"]');

// Fill form
await fill('input[name="name"]', 'Automated Test Bundle');
await select('select[name="discountType"]', 'PERCENTAGE');
await fill('input[name="discountValue"]', '15');

// Screenshot filled form
await screenshot("bundle-form-filled");

// Submit
await click('button[type="submit"]');

// Wait for success
await page.waitForSelector('[data-success-banner]');
await screenshot("bundle-created");
```

### **Test 3: Analytics Page**
```javascript
await navigate("/analytics");
await page.waitForSelector('[data-chart-loaded]');
await screenshot("analytics-page", { fullPage: true });
```

---

## 🧪 Setting Up Playwright (Full Test Suite)

### **1. Install Playwright**
```bash
cd web
bun add -D @playwright/test
bunx playwright install chromium
```

### **2. Create Test Config**
Create `web/playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.SHOPIFY_APP_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { device: 'Desktop Chrome' } },
  ],
});
```

### **3. Create First Test**
Create `web/e2e/bundles/create.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('create fixed bundle', async ({ page }) => {
  // This would need proper Shopify auth setup
  await page.goto('/bundles/create');

  await page.getByLabel('Bundle name').fill('Test Bundle');
  await page.selectOption('select[name="type"]', 'FIXED_BUNDLE');
  await page.getByLabel('Discount value').fill('20');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Bundle created')).toBeVisible();
});
```

### **4. Run Tests**
```bash
bun run test:e2e
```

---

## 🎯 Testing Priorities (By Importance)

### **Priority 1: Critical Path (Must Work)**
1. ✅ Bundle creation (fixed bundle type)
2. ✅ Bundle listing and filtering
3. ✅ Settings customizer
4. ✅ Storefront widget rendering
5. ✅ Discount calculation (Rust function)

### **Priority 2: Core Features (Should Work)**
6. Analytics tracking and reporting
7. Bundle edit/update
8. Bundle status changes (activate/deactivate)
9. Product search and selection
10. Image upload

### **Priority 3: Nice to Have (Can Wait)**
11. Template management
12. Bulk actions
13. Export functionality
14. Alert rules
15. Advanced customization

### **Priority 4: Future Features (Not Yet Implemented)**
16. AI Insights
17. A/B Testing
18. Automation rules
19. Dynamic pricing
20. Frequently bought together

---

## 📊 Test Coverage Goals

| Area | Current | Target | Priority |
|------|---------|--------|----------|
| Unit Tests (Services) | 0% | 80% | High |
| Integration Tests (API) | 0% | 60% | Medium |
| E2E Tests (UI) | 0% | 40% | High |
| Visual Regression | 0% | 30% | Low |

---

## 🐛 Known Issues to Test For

### **1. App Bridge Dependency**
- **Issue:** App doesn't work outside Shopify admin iframe
- **Test:** Verify proper error handling when accessed directly
- **Expected:** Friendly error message, not crash

### **2. Session Token Expiry**
- **Issue:** Session tokens expire after 1 hour
- **Test:** Leave app idle for 1+ hour, interact
- **Expected:** Automatic token refresh or re-auth prompt

### **3. CORS on Upload Endpoint**
- **Issue:** Image uploads may fail from certain origins
- **Test:** Upload image from storefront vs admin
- **Expected:** CORS headers allow both

### **4. Bundle Scheduling**
- **Issue:** Scheduled bundles may not activate on time
- **Test:** Create bundle with start date in 5 minutes
- **Expected:** Bundle auto-activates at scheduled time

### **5. Analytics Deduplication**
- **Issue:** Multiple views from same customer counted multiple times
- **Test:** Visit bundle page 5 times in same session
- **Expected:** Only 1 view recorded per day per customer

---

## 🔧 Debugging Tools

### **1. Check Server Logs**
```bash
# Next.js dev logs
tail -f /tmp/nextjs-dev.log

# Or with bun
bun run dev:app
# Logs will appear in terminal
```

### **2. Check Database**
```bash
bun run prisma:studio
# Opens Prisma Studio at http://localhost:5555
# Browse and edit database records
```

### **3. Check GraphQL API**
```bash
# Test Shopify Admin API query
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: <token>" \
  -d '{"query": "{ shop { name } }"}' \
  https://your-store.myshopify.com/admin/api/2025-10/graphql.json
```

### **4. Browser DevTools**
- **Network Tab:** Check API requests/responses
- **Console Tab:** Check for JavaScript errors
- **Application Tab:** Check localStorage/sessionStorage
- **React DevTools:** Inspect component state

---

## 📝 Test Reporting Template

After each test session, document:

```markdown
## Test Session Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Duration:** X hours
**Environment:** Development Store / Production

### Tests Executed:
- [ ] Dashboard load
- [ ] Bundle creation
- [ ] Bundle listing
- [ ] Analytics
- [ ] Settings customizer
- [ ] Storefront widget

### Bugs Found:
1. **[BUG-001]** Description of bug
   - **Severity:** High/Medium/Low
   - **Steps to Reproduce:** 1. 2. 3.
   - **Expected:** What should happen
   - **Actual:** What actually happened
   - **Screenshot:** [link]

### Performance Observations:
- Page load times: X seconds
- API response times: X ms
- Console errors: X errors

### Recommendations:
1. Fix high-severity bugs first
2. Add error handling for X
3. Improve UX for Y
```

---

## 🚀 Next Steps

1. **Today:** Run manual checklist above (30 minutes)
2. **This Week:** Setup Playwright, write 5 critical tests
3. **Next Week:** Implement full test suite, CI/CD integration
4. **Month:** Achieve 60%+ test coverage

---

**Questions?** Check the full `E2E_TEST_REPORT.md` for comprehensive details.

**Need help?** The app uses:
- Next.js 16 → [Next.js Docs](https://nextjs.org/docs)
- Shopify App Bridge → [Shopify Docs](https://shopify.dev/docs/apps/build/app-bridge)
- Prisma → [Prisma Docs](https://www.prisma.io/docs)
- Playwright → [Playwright Docs](https://playwright.dev)
