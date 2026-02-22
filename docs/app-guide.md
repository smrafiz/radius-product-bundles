# Radius Product Bundles — App Guide

> A non-technical walkthrough of the entire app experience. Written for product managers, QA, and onboarding teams. Covers every screen, every action, and every flow a merchant encounters.

---

## Table of Contents

- [App Navigation](#app-navigation)
- [1. First Launch & Setup Guide](#1-first-launch--setup-guide)
- [2. Dashboard](#2-dashboard)
- [3. Creating a Bundle](#3-creating-a-bundle)
- [4. Managing Bundles](#4-managing-bundles)
- [5. Editing a Bundle](#5-editing-a-bundle)
- [6. Analytics](#6-analytics)
- [7. Style Customizer](#7-style-customizer)
- [8. Settings](#8-settings)
- [9. Pricing Plans](#9-pricing-plans)
- [10. How the Storefront Widget Works](#10-how-the-storefront-widget-works)
- [11. How Discounts Work at Checkout](#11-how-discounts-work-at-checkout)
- [Page Map](#page-map)

---

## App Navigation

After installing the app, merchants see a **top navigation bar** with these sections:

| Nav Item      | Where It Goes                                                  |
| ------------- | -------------------------------------------------------------- |
| **Dashboard** | Main hub — metrics, recent bundles, onboarding, quick actions  |
| **Bundles**   | Bundle listing — create, edit, filter, bulk manage all bundles |
| **Analytics** | Performance dashboard — charts, badges, health scores          |
| **Settings**  | App configuration — general, labels, style customizer, tools   |
| **Pricing**   | Plan comparison and upgrade                                    |

Additional nav items appear but are marked "Coming Soon": A/B Testing, Automation, Templates, Integrations.

---

## 1. First Launch & Setup Guide

When a merchant opens the app for the first time, the **Dashboard** loads with a prominent **Setup Guide** at the top.

### The 5 Setup Steps

The guide walks merchants through getting started. Each step has a checkbox, description, and an action button.

**Step 1 — Enable the App Embed**

- The merchant needs to activate the Radius widget in their Shopify theme.
- Clicking "Enable" opens the Shopify Theme Editor in a new tab, where they toggle the Radius app embed on.
- Back in the app, clicking "Verify activation" checks the theme's settings via the Shopify API.
- Once verified, the checkbox turns green automatically.

**Step 2 — Create Your First Bundle**

- Clicking "Create bundle" navigates to the bundle creation page.
- This step auto-completes when the store has at least one bundle (no manual check needed).

**Step 3 — Customize Your Widget**

- Clicking "Open customizer" navigates to the Style Customizer.
- This step auto-completes when the merchant has saved any custom style changes.

**Step 4 — Preview Your Storefront**

- Clicking "Preview" opens the merchant's live storefront in a new tab.
- The merchant manually checks the box after they've verified the widget looks correct on their store.

**Step 5 — Check Your Analytics**

- Clicking "View analytics" navigates to the Analytics page.
- The merchant manually checks the box after reviewing their analytics dashboard.

### Guide Behavior

- A progress bar shows "X of 5 completed."
- Steps expand and collapse — only one is open at a time.
- Auto-detected steps (Steps 2 and 3) can't be unchecked manually — they lock once completed.
- The merchant can dismiss the entire guide with "Dismiss." It can be brought back with the "Setup guide" button in the title bar.
- Progress is saved to the database, so it persists across sessions and devices.

### App Embed Banner

If the app embed is not enabled and the setup guide is dismissed, a **persistent warning banner** appears at the top of the dashboard reminding the merchant to enable it, with a direct link to the theme editor.

---

## 2. Dashboard

The dashboard is the merchant's home base. It gives a snapshot of everything without having to dig into individual sections.

### Metrics Overview (4 Cards)

Four cards at the top show key numbers:

| Card                | What It Shows                                                                       |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Active Bundles**  | How many bundles are currently live. Clicking navigates to the Bundles page.        |
| **Total Revenue**   | Total revenue from bundle sales with a growth % indicator vs. previous period.      |
| **Conversion Rate** | Percentage of bundle views that resulted in a purchase, with growth indicator.      |
| **Total Views**     | How many times bundle widgets were seen in the last 30 days, with growth indicator. |

### Top Performing Bundles

A table showing the 5 best-performing active bundles from the last 30 days. Each row displays:

- Bundle thumbnail, name, and type
- Status badge
- Views, conversion rate, and revenue

Clicking a row navigates to that bundle's edit page. If no bundles exist yet, an empty state encourages the merchant to create their first bundle.

### Quick Actions (3 Cards)

Three large action cards for fast navigation:

- **Manage Bundles** — Goes to the Bundles listing page
- **View Analytics** — Goes to the Analytics dashboard
- **App Settings** — Goes to the Settings page

### Feature Highlights

A section showcasing the app's key capabilities with a call-to-action button to create a bundle.

### Video Tutorials

Three embedded video tutorials the merchant can watch:

- **"See it in action"** — General app overview
- **"Getting started"** — Step-by-step setup walkthrough
- **"Advanced tips"** — Power user techniques

Videos open in a modal player. The player remembers playback position.

### Review & Feedback

A section asking the merchant to rate their experience (1-5 stars):

- **4-5 stars** → Buttons appear: "Rate on App Store" and "Share with friends"
- **1-3 stars** → Buttons appear: "Contact Support" and "View Help Center"
- A text area lets them submit detailed feedback.

### Plan Upgrade Card

A marketing card promoting the Pro plan with a button to navigate to the Pricing page.

### Help & Support (3 Cards)

- **Support** — Link to email support
- **Upcoming Features** — Link to the feature roadmap
- **Help Docs** — Link to documentation

---

## 3. Creating a Bundle

### Step A — Choose a Bundle Type

**Where:** Bundles → "Create bundle" button → `/bundles/create`

The merchant lands on a type selection screen showing 6 bundle type cards:

| Type                           | Available?  | What It Is                                               |
| ------------------------------ | ----------- | -------------------------------------------------------- |
| **Fixed Bundle**               | Yes         | A curated set of specific products sold together         |
| **Buy X Get Y**                | Coming Soon | Buy a quantity, get another product free or discounted   |
| **BOGO**                       | Coming Soon | Buy one, get one (simplified Buy X Get Y)                |
| **Volume Discount**            | Coming Soon | Buy more, save more with quantity tiers                  |
| **Mix & Match**                | Coming Soon | Customers pick from product groups to build their bundle |
| **Frequently Bought Together** | Coming Soon | Recommended products based on purchase patterns          |

Each card shows an image, description, and a "Select" button. "Coming Soon" types are visually disabled. Clicking the info icon on any card opens a modal with a detailed description and feature list.

**Currently, only Fixed Bundle can be selected.** Clicking "Select" on Fixed Bundle navigates to the 4-step creation wizard.

### Step B — The 4-Step Bundle Wizard

The wizard is a horizontal step flow. The merchant progresses through 4 steps, with a live bundle preview always visible on the right side of the screen.

---

#### Step 1 of 4 — Products

This step captures the bundle's identity and contents.

**Bundle Details**

- **Name** — Required. Auto-generates a creative name based on the bundle type (e.g., "Summer Essentials Pack", "The Complete Collection"). The merchant can keep it or type their own.
- **Description** — Optional. Internal-only, not shown to customers.

**Select Products**

- Clicking "Add products" opens the Shopify product picker — a familiar Shopify modal where the merchant searches and selects products.
- Selected products appear in a list showing: thumbnail, product title, price, and a quantity input.
- The merchant sets the quantity for each product in the bundle (e.g., 2x Shampoo, 1x Conditioner).
- Products can be reordered or removed individually. "Clear all" removes everything.
- **Limits:** Minimum 2 products required, maximum depends on settings (default 20).

**Bundle Images**

- The merchant can upload up to 5 custom images for the bundle using drag-and-drop or file picker.
- These images represent the bundle itself (separate from individual product images).

**Live Preview:** The right panel updates in real-time as products are added, showing how the bundle widget will look on the storefront.

---

#### Step 2 of 4 — Discount

This step configures the bundle's pricing.

**Discount Type** — A dropdown with 4 options:

| Type             | What It Does                 | Example                                                 |
| ---------------- | ---------------------------- | ------------------------------------------------------- |
| **Percentage**   | X% off the total             | "15% Off" — a $100 bundle becomes $85                   |
| **Fixed Amount** | Flat dollar amount off       | "$10 Off" — a $100 bundle becomes $90                   |
| **Custom Price** | Set an exact bundle price    | "Bundle Price $49.99" — regardless of individual prices |
| **No Discount**  | Bundle without a price break | Products grouped together but no savings                |

**Discount Value** — A number input that adapts to the selected type:

- Percentage: Shows "%" suffix, max 100
- Fixed Amount: Shows "$" prefix
- Custom Price: Shows "$" prefix (this is the final price)
- No Discount: Input is hidden

**Optional Controls:**

- **Minimum Order Value** — Discount only applies if the cart total meets this threshold (e.g., "Only apply discount on orders over $50")
- **Maximum Discount Amount** — Caps the discount (e.g., "Up to $25 off maximum" — useful for percentage discounts on expensive bundles)

**Bundle as Product** — A toggle that creates the bundle as an actual Shopify product. When enabled:

- The bundle appears in Shopify collections and search results
- Customers can find it through normal store navigation
- The merchant can select which product image represents the bundle

**Live Preview:** The pricing section updates to show regular price, discounted price, and savings amount.

---

#### Step 3 of 4 — Appearance

This step controls how the bundle widget looks on the storefront.

**Widget Layout** — 4 layout options shown as visual thumbnails:

| Layout       | Best For                                         |
| ------------ | ------------------------------------------------ |
| **List**     | Classic vertical layout, good for 2-4 products   |
| **Grid**     | Product card grid, good for 3+ products          |
| **Carousel** | Swipeable slider, good for 4+ products on mobile |
| **Compact**  | Minimal view, good for tight spaces or sidebars  |

**Display Toggles** — The merchant turns individual elements on or off:

- Show product images
- Show product prices
- Show compare-at (strikethrough) prices
- Show quantity per product
- Show savings badge (e.g., "Save 15%")
- Show savings amount (e.g., "You save $15")
- Show free shipping notice
- Make product titles clickable (link to product pages)

**Text Customization:**

- Widget heading text (e.g., "Complete the Look", "Bundle & Save")
- Add-to-cart button text (e.g., "Add Bundle to Cart", "Get This Deal")

**Live Preview:** The right panel updates instantly as the merchant toggles options and changes layouts.

---

#### Step 4 of 4 — Review

The final step shows a read-only summary of everything the merchant configured:

- **Bundle name** and description
- **Discount type** and value (formatted: "15% Off" or "$10 Off" or "Custom Price $49.99")
- **Status** — Defaults to Draft (can be changed after creation)
- **Selected products** — Full list with images, titles, quantities
- **Pricing summary:**
    - Subtotal (sum of all products at regular price)
    - Discount amount
    - Final bundle price
    - Minimum order value (if set)
    - Maximum discount cap (if set)

If any validation errors exist, a banner at the top lists them and the merchant can click to jump back to the relevant step.

**Publishing:** The merchant clicks "Save" (or "Publish" if setting to Active). The bundle is created and they're redirected to the bundle listing page with a success notification.

### Step Navigation

- A **horizontal step indicator** at the bottom shows all 4 steps with icons.
- Completed steps show a green checkmark.
- The current step is highlighted in blue.
- The merchant can click any previous step to jump back and make changes.
- "Previous" and "Continue" buttons navigate between steps.
- Validation runs when moving forward — the merchant can't skip to Step 4 if Step 1 has errors.

---

## 4. Managing Bundles

**Where:** Bundles → `/bundles`

The bundle listing page is the central management hub for all bundles.

### The Bundle Table

Each row in the table shows:

- **Checkbox** — For selecting bundles for bulk actions
- **Thumbnail** — Product image from the bundle
- **Name** — Bundle name with a type badge (e.g., "Fixed Bundle")
- **Status badge** — Color-coded: Draft (gray), Active (green), Paused (yellow), Archived (gray), Scheduled (blue)
- **Discount** — Formatted discount (e.g., "20% Off", "$10 Off", "Custom Price $49.99")
- **Product count** — Number of products in the bundle
- **Metrics** — Views, conversions, revenue, conversion rate
- **Actions menu** (three dots) — Edit, Duplicate, Change Status, Delete

### Searching and Filtering

- **Search bar** — Type to filter bundles by name in real-time
- **Status tabs** — Filter by one or more statuses (All, Active, Draft, Paused, Archived, Scheduled)
- **Type filter** — Filter by bundle type
- **Sort** — Sort by date created, name, views, conversions, revenue, or conversion rate (ascending or descending)
- **Pagination** — Navigate between pages with configurable page size

### Single Bundle Actions

Clicking the three-dot menu on any bundle row reveals:

**Edit** — Opens the bundle in the 4-step wizard with all fields pre-filled.

**Duplicate** — Creates an exact copy of the bundle:

- A confirmation modal appears
- The copy gets an auto-numbered name (e.g., "Summer Bundle" → "Summer Bundle #2")
- All products, discount settings, and appearance settings are preserved
- The copy is created as a Draft
- A success notification appears

**Change Status** — Opens a popover with status options:

- Click any status to change (Draft, Active, Paused, Archived, Scheduled)
- A confirmation modal appears
- For **Scheduled**: A date picker appears where the merchant sets Start Date and End Date
- The Shopify product status syncs automatically (Active bundles publish the product, Draft/Paused hides it)

**Delete** — Removes the bundle:

- A destructive confirmation modal appears: "Are you sure? This action cannot be undone."
- Confirming deletes the bundle (soft delete — analytics data is preserved)
- The Shopify product is also cleaned up
- A success notification appears

### Bulk Actions

The merchant can select multiple bundles using checkboxes:

- **Select all** checkbox in the header selects everything on the current page
- A **bulk action bar** appears at the bottom when items are selected

Available bulk actions:

- **Activate** — Set all selected bundles to Active
- **Set to Draft** — Set all selected bundles to Draft
- **Delete** — Delete all selected bundles (with confirmation)
- **Clear selection** — Deselect all

Bulk operations support up to 100 bundles at once.

### Empty States

- **No bundles yet** — Shows a welcome message with a "Create your first bundle" call-to-action
- **No results** — When search or filters return nothing, shows a message suggesting to adjust filters

---

## 5. Editing a Bundle

**Where:** Click a bundle name or "Edit" from the actions menu → `/bundles/[id]/edit`

The edit page uses the same 4-step wizard as creation, with these differences:

- All fields are pre-filled with the bundle's current data
- The page title shows the bundle name
- A **Delete** button appears in the top-right corner
- The step indicator shows all steps as completed (green checkmarks) since the data already exists
- The merchant can jump to any step immediately
- Saving updates the existing bundle rather than creating a new one
- A success notification says "Bundle updated successfully" and the merchant stays on the edit page

### Editing Products

- The merchant can add new products, remove existing ones, or change quantities
- If a product was deleted from Shopify, it shows as unavailable
- The app tracks which products were added, removed, or changed and syncs only the differences

### Changing Status While Editing

The status badge is visible on the edit page. The merchant can change status the same way as on the listing page — click the badge, select a new status, confirm in the modal.

---

## 6. Analytics

**Where:** Analytics → `/analytics`

The analytics page has two tabs: **Overview** and **Bundle Performance**.

### Overview Tab

**4 KPI Cards at the Top:**

| Card                    | What It Shows                                                                   |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Total Revenue**       | Total bundle revenue for the selected period, with growth % vs. previous period |
| **Revenue Growth**      | Percentage change in revenue compared to the same-length previous period        |
| **Conversion Growth**   | Percentage change in conversion rate                                            |
| **Avg Conversion Rate** | Overall views-to-purchases percentage                                           |

**Time-Series Charts (3 Charts):**

The main chart area has metric selector tabs:

- **Revenue** — Daily revenue plotted as an area chart (formatted in $K for large values)
- **Views** — Daily unique bundle widget views
- **Purchases** — Daily completed bundle orders

Each chart shows the selected date range with interactive tooltips on hover.

**Comparison Charts (3 Visualizations):**

Below the main chart:

- **Funnel Performance** — A visual funnel showing: Views → Add to Cart → Purchases, with drop-off percentages between stages
- **Conversion Rates** — Conversion rate trend over time
- **Revenue & AOV** — Dual metric chart showing total revenue alongside Average Order Value

### Bundle Performance Tab

**Top Performing Bundles Table:**

The top 5 bundles ranked by revenue, showing:

- Bundle name
- Revenue, views, purchases
- Conversion rate, add-to-cart rate
- Average Order Value, revenue per view
- **Performance badge** — The bundle's primary badge (see below)
- **Trend indicator** — Up/down percentage or "New" for recent bundles
- Low confidence warning if the bundle has fewer than 25 views

**Performance Badges** — Automatically assigned based on data:

| Badge              | When It Appears                                                                     |
| ------------------ | ----------------------------------------------------------------------------------- |
| **High Converter** | Conversion rate is 15% or higher                                                    |
| **Revenue Star**   | Revenue is $5,000 or more                                                           |
| **Hidden Gem**     | Fewer than 100 views but 10%+ conversion — strong but under-promoted                |
| **Trending**       | 25%+ revenue growth vs. previous period                                             |
| **Declining**      | 25%+ revenue drop vs. previous period                                               |
| **High Interest**  | 30%+ add-to-cart rate — customers are interested but may not be completing purchase |

**Health Status** — Each bundle gets a health classification:

| Status         | Meaning                                                              |
| -------------- | -------------------------------------------------------------------- |
| **New**        | Fewer than 30 views — not enough data yet                            |
| **Healthy**    | 8%+ conversion rate and over $1,000 revenue                          |
| **Needs Work** | High add-to-cart but low purchases, or high views but low conversion |
| **Poor**       | 50+ views, under 3% conversion, under $500 revenue                   |

**All Bundles Table:**

A paginated table of every bundle with analytics data:

- Searchable by name
- Sortable by revenue, views, purchases, conversion rate, or creation date
- Each row shows the bundle's health status
- Filterable by status with counts

### Date Range Controls

At the top of the analytics page:

- **Preset ranges:** Last 7 days, Last 14 days, Last 30 days
- The app automatically calculates a "previous period" of the same duration for comparison (e.g., Last 7 days compares to the 7 days before that)
- All analytics data is cached for 5 minutes

### Analytics Disabled State

If the merchant has turned off analytics tracking in Settings, a banner appears on the analytics page explaining that data collection is paused and offering a link to re-enable it.

---

## 7. Style Customizer

**Where:** Settings → Style tab → "Open style customizer" → `/settings/customizer`

The customizer is a dedicated full-screen interface for designing how the bundle widget looks on the storefront.

### Layout

- **Left panel** — All styling controls organized in collapsible sections
- **Right panel** — A live preview of the bundle widget that updates in real-time as the merchant makes changes

### Bundle Type & Layout Selector

At the top of the left panel, the merchant selects:

- Which **bundle type** they're styling (tabs for each type: Fixed Bundle, BOGO, etc.)
- Which **layout** to use (List, Grid, Carousel, Compact — shown as visual tabs)

Style settings adapt based on the selected layout and bundle type. For example, grid-specific settings like "Columns" only appear when Grid is selected.

### Section 1 — Appearance

**Presets:** 8 one-click style presets to use as a starting point:

- **Minimal** — Sharp edges, high contrast, no shadows
- **Soft** — Rounded corners, subtle shadows
- **Bold** — High contrast, fully rounded, strong shadows
- **Elegant** — Sophisticated curves, medium shadows
- **Dark** — Dark background, cyan accents
- **Nature** — Green/organic tones
- **Warm** — Orange/warm tones
- **Professional** — Blue accents, structured, no shadows

Selecting a preset applies all its values. The merchant can then customize any individual setting.

**Colors** — 5 color pickers:

- Accent/primary color
- Text color
- Background color
- Border color
- Savings highlight color

**Shape** — Corner roundness: Sharp (0px), Modern (4-6px), Rounded (12px+)

**Depth** — Shadow intensity: None, Soft, Strong

**Spacing** — Content density: Compact, Comfortable, Spacious

### Section 2 — Product Cards

**Image Settings:**

- Size: Small, Medium, Large
- Fit: Cover (fills space, may crop) or Contain (shows full image)
- Position: Left (beside text, for list layout) or Top (above text)

**Card Style:**

- Toggle: Use custom card styling (or inherit from Appearance)
- If custom: Background color, border toggle, shadow toggle

### Section 3 — Button & Badge

**Add to Cart Button:**

- Style: Filled (solid color) or Outline (border only)
- Size: Small, Medium, Large
- Width: Auto (fits text) or Full (spans entire width)
- Color: Override the primary color for the button specifically

**Savings Badge:**

- Position: Top-left corner, Top-right corner, or Inline with text
- Style: Filled or Outline

**Pricing Summary Box:**

- Toggle: Show/hide the pricing summary below products
- Background color
- Style: Minimal (just text), Card (with border), Highlight (with accent background)

### Section 4 — Advanced

**Container:**

- Max width: 300px to 1200px slider
- Alignment: Left, Center, Right
- Border: Toggle the outer widget border

**Breakpoints:**

- Preset: Standard (768/480), Compact (640/375), Wide (1024/768)
- Custom: Enter exact pixel values for tablet and mobile breakpoints

**Typography:**

- Heading size: Small, Medium, Large
- Body text size: Small, Medium, Large

**Layout-Specific Settings** (only visible when relevant layout is selected):

| Layout       | Extra Settings                                                                              |
| ------------ | ------------------------------------------------------------------------------------------- |
| **List**     | Divider style between products: None, Line, Plus sign                                       |
| **Grid**     | Number of columns: 2, 3, or 4                                                               |
| **Carousel** | Slides visible (2/3/4), navigation (arrows/dots/both/none), autoplay on/off, autoplay speed |

**Bundle-Type-Specific Settings** (for future types):

- BOGO: FREE tag color
- Buy X Get Y: Tier display style
- Volume Discount: Tier highlight color, display style
- Mix & Match: Group header color, selection style
- FBT: Separator style, checkbox color

### Section 5 — Cart Banner

For bundles that display a cart savings banner:

- Text, background, border, and highlight colors
- Corner roundness and shadow (same options as Appearance)
- Text size
- Icon selector: Tag, Percent, Gift, Sparkle, Fire, Check, or None
- Custom icon color

### Responsive Overrides

This is a key feature of the customizer. Many settings support **per-device values**:

- **Desktop** — The base setting (always applies)
- **Tablet** — Override for tablets (768px-1024px by default)
- **Mobile** — Override for phones (below 768px by default)

Fields with responsive support show small device icons. The merchant clicks an icon to set a different value for that device. For example:

- Grid columns: 4 on desktop, 2 on tablet, 1 on mobile
- Spacing: Spacious on desktop, Compact on mobile
- Image size: Large on desktop, Small on mobile

An indicator shows when a field has been overridden. The merchant can clear an override to revert to the desktop value.

### Custom CSS

In the Advanced section:

- **Custom CSS class** — Add a class name to the widget wrapper (max 100 chars) for targeting in external CSS
- **Custom CSS editor** — Write raw CSS (up to 10,000 characters) that gets injected into the widget. This gives complete design control beyond the built-in settings.

### Saving

- A save bar appears at the bottom when changes are detected
- **Discard** reverts all changes to the last saved state
- **Save** pushes the styles to a Shopify metafield, making them immediately available on the storefront
- The merchant sees a success notification on save

---

## 8. Settings

**Where:** Settings → `/settings`

The settings page has 5 tabs.

### General Tab

**Defaults:**

- Default discount type — What discount type is pre-selected when creating a new bundle
- Default discount value — Pre-filled discount value for new bundles
- Max products per bundle — Limit how many products can be added (2-50)
- Max bundles per shop — Shows the current plan limit (read-only)

**Cart Behavior:**

- Bundle priority — When multiple bundles apply, prioritize by: index order or highest discount
- After add-to-cart action — What happens when a customer adds a bundle: use theme default (usually drawer), redirect to cart page, redirect to checkout, or stay on current page
- Hide third-party payment buttons — Toggle off PayPal/Google Pay/Apple Pay quick-buy buttons on bundle products
- Stock validation — Validate product availability before allowing add-to-cart
- Max bundles per order — Limit how many times a customer can add bundles in one order (0 = unlimited, up to 10)
- Show savings banner in cart — Display a banner in the cart showing how much the customer saved
- Allow discount stacking — Whether bundle discounts can combine with other Shopify discounts

**Privacy:**

- Enable analytics tracking — Toggle on/off. When off, no view, cart, or purchase events are recorded.

**Performance:**

- Storefront cache TTL — How long bundle data is cached: No cache, 1 minute, 5 minutes, 15 minutes, 1 hour
- Lazy load product images — Defer loading images until they're about to scroll into view

### Labels Tab

Every piece of text that customers see in the bundle widget can be customized here. This is especially useful for non-English stores or stores that want to match their brand voice.

**Widget Text:**

- Bundle heading (default: "Bundle & Save")
- Add-to-cart button text (default: "Add Bundle to Cart")
- Quantity label (default: "Qty")

**Button States:**

- Adding to cart text (default: "Adding...")
- Added to cart text (default: "Added!")
- Out of stock text (default: "Out of Stock")

**Price Labels:**

- Regular price label (default: "Regular price")
- Bundle price label (default: "Bundle price")
- You save label (default: "You save")
- Savings badge text (default: "Save {value}")

**Shipping Labels:**

- Free shipping text (default: "Free Shipping")
- Shipping method title — supports template variables

**Cart Messages:**

- Max bundles reached (default: "Maximum of {count} bundles per order")
- Savings text, custom price text, free shipping messages — all support template variables like `{name}`, `{discount}`, `{price}`

### Style Tab

A single button: **"Open style customizer"** — launches the full customizer interface described in Section 7.

### Advanced Tab

**Custom CSS:**

- Custom CSS class name — Inject a class onto the widget wrapper element (max 100 characters)
- Custom CSS code — A text editor for writing custom CSS (max 10,000 characters)

### Tools Tab

**Data Management:**

- **Export settings** — Downloads the current app settings as a JSON file. Useful for backup or migrating to another store.
- **Import settings** — Upload a JSON file to restore settings. A confirmation modal warns that this will overwrite current settings.

**Sync & Cache:**

- **Sync to Shopify** — Forces a push of all settings and bundle data to Shopify metafields. Use this if the storefront widget isn't showing the latest changes. Shows a result modal listing what was synced.
- **Clear app cache** — Clears cached bundle, analytics, and settings data. Forces fresh data on next load.

**Webhook Management:**

- **Check webhooks** — Shows which Shopify webhooks are registered, which are missing, and GDPR compliance topics. Useful for debugging if analytics or order tracking isn't working.
- **Force register webhooks** — Re-registers all webhooks from scratch. Shows results with success/failure per webhook.

**Danger Zone:**

- **Reset to defaults** — Resets ALL app settings to factory defaults. A destructive confirmation modal warns this cannot be undone.

### Saving Settings

A save bar appears at the bottom of the settings page when changes are made. "Discard" reverts all changes; "Save" persists them and syncs to Shopify metafields.

---

## 9. Pricing Plans

**Where:** Pricing → `/pricing`

The pricing page shows plan comparison cards (Free vs. Pro), current plan indicator, and an FAQ section. The merchant can upgrade or manage their subscription from here.

---

## 10. How the Storefront Widget Works

After the merchant enables the app embed and creates a bundle, here's what their customers experience:

### Where It Appears

The bundle widget appears on **product pages** — specifically on pages for products that belong to a bundle. It's rendered via a Shopify theme extension (app block) that the merchant can position in their theme editor.

### What Customers See

1. **Widget heading** — e.g., "Bundle & Save" or whatever the merchant configured
2. **Product cards** — Each product in the bundle with image, title, price, and quantity
3. **Pricing section** — Regular total, bundle price, and savings amount/percentage
4. **Savings badge** — Visual badge showing the discount (e.g., "Save 15%")
5. **Free shipping badge** — If configured and the bundle qualifies
6. **Add to Cart button** — Adds all bundle products to cart in one click

### Cart Behavior

When the customer clicks "Add Bundle to Cart":

- All bundle products are added to the cart with their configured quantities
- Bundle metadata is attached to each line item (invisible to the customer)
- Cart attributes are set for the discount function to read at checkout
- The customer is redirected based on the merchant's setting (cart page, checkout, drawer, or stay)
- A toast notification confirms the action
- If a product is out of stock, the button is disabled and shows "Out of Stock"

### Responsive Behavior

The widget automatically adapts to the customer's screen size:

- On desktop: Uses the base layout and styling
- On tablet: Applies tablet overrides (if the merchant configured them)
- On mobile: Applies mobile overrides (e.g., fewer grid columns, smaller images, compact spacing)

The carousel layout supports touch swipe and mouse drag on all devices.

### View Tracking

When the bundle widget scrolls into the customer's viewport, a view event is recorded automatically (once per customer per day for logged-in customers, or once per session per day for anonymous visitors). This feeds the analytics dashboard.

---

## 11. How Discounts Work at Checkout

Bundle discounts are calculated by a **server-side Rust function** running directly on Shopify's infrastructure. This means:

- Discounts are **tamper-proof** — customers can't modify prices via browser tools
- Discounts apply **automatically** at checkout — no discount codes needed
- The function verifies that the correct products and quantities are in the cart before applying any discount
- **Line item discounts:** Each bundle product shows its individual discounted price in the cart
- **Delivery discounts:** If free shipping is configured, the shipping method is discounted with a custom label (e.g., "Free shipping with Summer Bundle")
- **Discount caps** are enforced server-side (maximum discount amount, minimum order value)
- Multiple bundles in the same cart are each discounted independently

---

## Page Map

| Page               | URL                      | Purpose                                       |
| ------------------ | ------------------------ | --------------------------------------------- |
| Dashboard          | `/dashboard`             | App home — metrics, onboarding, quick actions |
| Bundle Listing     | `/bundles`               | View, search, filter, bulk manage all bundles |
| Select Bundle Type | `/bundles/create`        | Choose which type of bundle to create         |
| Create Bundle      | `/bundles/create/[type]` | 4-step wizard to build a new bundle           |
| Edit Bundle        | `/bundles/[id]/edit`     | Modify an existing bundle                     |
| Analytics          | `/analytics`             | Performance charts, badges, health scores     |
| Settings           | `/settings`              | General, Labels, Style, Advanced, Tools tabs  |
| Style Customizer   | `/settings/customizer`   | Visual widget designer with live preview      |
| Pricing            | `/pricing`               | Plan comparison and upgrade                   |
| A/B Testing        | `/ab-testing`            | Coming soon                                   |
| Automation         | `/automation`            | Coming soon                                   |
| Templates          | `/templates`             | Coming soon                                   |
| Integrations       | `/integrations`          | Coming soon                                   |
