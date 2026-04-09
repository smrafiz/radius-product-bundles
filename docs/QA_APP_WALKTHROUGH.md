# Radius Product Bundles — QA App Walkthrough

> **Purpose:** Screen-by-screen guide to every page, section, button, and interactive element in the app. Use this alongside `QA_FREE_FEATURES_GUIDE.md` for feature details.

---

## App Shell & Global Elements

Every page shares these elements:

```
┌─────────────────────────────────────────────────┐
│  [Progress Bar]  (thin bar at top, shows on nav)│
├──────────┬──────────────────────────────────────┤
│          │  [TitleBar]  (page title + actions)   │
│  Sidebar │──────────────────────────────────────│
│   Nav    │                                       │
│          │  [GlobalBanner]  (success/error/warn)  │
│  ------  │                                       │
│  Dashboard│  [Page Content]                      │
│  Bundles │                                       │
│  Analytics│                                      │
│  Settings│                                       │
│  Pricing │                                       │
│  Support │                                       │
│          │                                       │
├──────────┴──────────────────────────────────────┤
│  [ModalHost]  (global modal, hidden until open)  │
│  [CrossSellModal]  (Pro upsell, hidden)          │
└─────────────────────────────────────────────────┘
```

### Sidebar Navigation

| Item | Route | Free Plan | Notes |
|---|---|---|---|
| Dashboard | `/dashboard` | Visible | Home link |
| Bundles | `/bundles` | Visible | |
| Analytics | `/analytics` | Visible | Partially gated — basic free, advanced Pro (`analytics_full`) |
| Settings | `/settings` | Visible | |
| Pricing | `/pricing` | Visible | |
| Support | `/support` | Visible | |

### Global Elements

| Element | Location | Trigger |
|---|---|---|
| Progress Bar | Top of viewport | Any navigation click |
| Global Banner | Below TitleBar | Success/error after actions (save, delete, etc.) |
| Modal Host | Overlay | Delete confirm, status change, duplicate, quota exceeded |
| Cross-Sell Modal | Overlay | Click any Pro-locked feature/badge |

---

## Page 1: Dashboard (`/dashboard`)

### TitleBar

| Button | Position | Action |
|---|---|---|
| "Create Bundle" | Primary (right) | Navigate to `/bundles/create` |
| "Setup Guide" | Secondary (right) | Toggle setup guide visibility |

### Content (top → bottom)

#### 1.1 Setup Guide (collapsible card)

```
┌──────────────────────────────────────────────────────────┐
│  Setup Guide                [2/6 complete]  [Dismiss ✕]  │
│  ──────────────────────────────────────────────────────  │
│  ✓ Enable the app embed          [Open editor] [Check]  │
│  ✓ Create your first bundle      [Create bundle]         │
│  ▼ Add bundle widget to theme    [Open editor] [Check]  │ ← expanded
│     "Add the bundle widget block to your product         │
│      pages in the theme editor..."                       │
│  ○ Customize your settings       [Go to settings]        │
│  ○ Preview your live storefront  [View storefront]       │
│  ○ Monitor bundle analytics      [Go to analytics]       │
│  ──────────────────────────────────────────────────────  │
│  [Progress Ring ◔]  2 of 6 tasks complete                │
└──────────────────────────────────────────────────────────┘
```

- **6 steps** total (not 5)
- Progress ring: SVG circular indicator showing completion ratio
- First incomplete step auto-expands on load
- Steps 0-4: auto-detected (no manual checkbox)
- Step 5 (analytics): manual — marked when user visits analytics page
- Steps 0 & 2 have "Check status" secondary button → shows toast (active/not enabled)
- "Open theme editor" buttons use different URLs:
  - Step 0: `?context=apps&activateAppId={apiKey}/app-embed`
  - Step 2: `?template=product&addAppBlockId={apiKey}/app-block&target=newAppsSection`
- Step 4 "View storefront" opens store in new tab + auto-marks complete
- Dismiss persists to DB (`setupGuideDismissed` on Shop model)
- All 6 complete → guide auto-dismisses
- "Up Next" bar shows when guide is collapsed + steps remain

#### 1.2 Widget Status Banner (conditional)

Shows if app embed or widget block is not active. Yellow warning banner with action link to theme editor.

#### 1.3 Analytics Disabled Warning (conditional)

Shows if analytics tracking is off in Settings. Info banner with link to Settings.

#### 1.4 Metrics Overview (4 cards in row)

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Active     │ │ Total      │ │ Conversion │ │ Total      │
│ Bundles    │ │ Revenue    │ │ Rate       │ │ Views      │
│   3        │ │   $1,234   │ │   12.5%    │ │   456      │
│            │ │  ▲ +15%    │ │  ▲ +2.3%   │ │            │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

#### 1.5 Recent Bundles (table)

```
┌──────────────────────────────────────────────────────┐
│  Recent Bundles                        [View All →]  │
│  ────────────────────────────────────────────────── │
│  Name              Type           Status   Created   │
│  Summer Kit        FIXED_BUNDLE   ACTIVE   Apr 1     │
│  BOGO Deal         BOGO           DRAFT    Mar 28    │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

- Rows are clickable → navigate to edit page
- "View All" → navigate to `/bundles`
- Empty state shown if no bundles

#### 1.6 Quick Actions (3-card grid)

```
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 🎨 Customize   │ │ 🔌 Check Widget│ │ 📊 View        │
│    Style       │ │    Status      │ │    Analytics   │
│  [Go →]        │ │  [Check →]     │ │  [View →]      │
└────────────────┘ └────────────────┘ └────────────────┘
```

#### 1.7 Features Section (2-column)

Left: Feature image. Right: Bullet list of app capabilities + "Create Bundle" CTA.

#### 1.8 Media Card + Review Banner (2-column)

Left: Promo/media card. Right: Review prompt with app store link.

#### 1.9 Video Overview

Tutorial video cards. Click opens video in modal.

#### 1.10 Callout Cards

Resource links (docs, support, changelog).

---

## Page 2: Bundle List (`/bundles`)

### TitleBar

| Button | Position | Action |
|---|---|---|
| "Create Bundle" | Primary | Navigate to `/bundles/create` |
| "View Analytics" | Secondary | Navigate to `/analytics` |

### Content (top → bottom)

#### 2.1 Page Header (centered)

"Bundles" heading + subtitle.

#### 2.2 Banners (conditional)

Same as dashboard: GlobalBanner, AnalyticsDisabled, WidgetStatus.

#### 2.3 Metrics Grid (4-6 cards)

Same metrics as dashboard overview.

#### 2.4 Bundle Table

```
┌──────────────────────────────────────────────────────────────────┐
│  [Search bundles...]         [Status filter ▼]                   │
│  ──────────────────────────────────────────────────────────────  │
│  ☐  Name              Products    Type          Discount Status  │
│  ──────────────────────────────────────────────────────────────  │
│  ☐  Summer Kit        🖼🖼🖼      FIXED_BUNDLE  10%     [ACTIVE▼]│
│  ☐  BOGO Deal         🖼🖼        BOGO          FREE    [DRAFT▼] │
│  ☐  Buy 2 Get 1       🖼🖼🖼      BUY_X_GET_Y   50%     [ACTIVE▼]│
│  ──────────────────────────────────────────────────────────────  │
│  [Bulk Actions Bar]  (appears when checkboxes selected)          │
│  ──────────────────────────────────────────────────────────────  │
│  Page 1 of 1                                    [← Prev] [Next→]│
└──────────────────────────────────────────────────────────────────┘
```

**Per-row interactions:**

| Element | Action |
|---|---|
| Checkbox | Select for bulk action |
| Bundle name (link) | Navigate to edit page |
| Product thumbnails | Visual preview |
| Type badge | Display only |
| Status popover `[STATUS▼]` | Click to change status (DRAFT/ACTIVE/ARCHIVED free; PAUSED/SCHEDULED show Pro badge) |
| `⋮` menu (row end) | Edit / View / Duplicate / Delete |

**Row action details:**

| Action | Free Plan | Behavior |
|---|---|---|
| Edit | Yes | Navigate to `/bundles/:id/edit` |
| View | Yes | Popover showing products list + bundle product link |
| Duplicate | **Pro only** | Opens Cross-Sell Modal |
| Delete | Yes | Opens confirmation modal |

**Bulk Actions Bar** (appears when 1+ rows selected):

Shows selected count + bulk action buttons (delete, status change).

**Empty State:** "No bundles yet" illustration + "Create your first bundle" CTA.

---

## Page 3: Bundle Type Selection (`/bundles/create`)

### TitleBar

Breadcrumb: "Bundles" ← back to list.

### Content

#### 3.1 Header

Back arrow + "Select Bundle Type" heading.

#### 3.2 Type Cards Grid

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│              │ │              │ │              │ │  ⭐ PRO      │
│  [image]     │ │  [image]     │ │  [image]     │ │  [image]     │
│              │ │              │ │              │ │              │
│ Fixed Bundle │ │ Buy X Get Y  │ │ BOGO         │ │ Volume       │
│              │ │              │ │              │ │ Discount     │
│ [Select] [ℹ]│ │ [Select] [ℹ]│ │ [Select] [ℹ]│ │ [Select] [ℹ]│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

- **Free types** (Fixed, BXGY, BOGO): Click "Select" → navigate to wizard
- **Pro types** (Volume Discount): Click → redirect to `/pricing`
- **Hidden types** (Mix & Match, FBT): Not shown
- **ℹ button**: Opens info modal with description + feature list
- While one card is loading (selected), others are disabled

#### 3.3 Upgrade Card

"Upgrade Your Plan" media card with "See Details" link to pricing.

#### 3.4 Help Section (collapsible)

Expandable help content about bundle types.

---

## Page 4: Bundle Creation Wizard (`/bundles/create/:type`)

### TitleBar

| Element | Details |
|---|---|
| Breadcrumb | "Bundles" ← back to list |
| Save/Publish | Primary button (disabled until form is dirty) |

### Layout: 2-Column

```
┌──────────────────────────────────────────────────────────────┐
│  [← Back]  Create Fixed Bundle                               │
│  ────────────────────────────────────────────────────────────│
│  [Widget Status Banner]                                       │
│  ────────────────────────────────────────────────────────────│
│  [◄ Prev]  ①──②──③──④  [Next ►]     ← Step Indicator        │
│  ────────────────────────────────────────────────────────────│
│                                    │                          │
│   STEP CONTENT (left, ~60%)        │  LIVE PREVIEW (right)   │
│                                    │  (sticky sidebar)        │
│   ┌───────────────────────┐       │  ┌──────────────────┐   │
│   │  [Step-specific       │       │  │  Bundle widget    │   │
│   │   form fields]        │       │  │  preview updates  │   │
│   │                       │       │  │  in real-time     │   │
│   │                       │       │  │                   │   │
│   └───────────────────────┘       │  └──────────────────┘   │
│                                    │                          │
└──────────────────────────────────────────────────────────────┘
```

### Step Indicator Bar

```
[◄ Prev]   ①✓ ───── ②● ───── ③○ ───── ④○   [Next ►]
           Products  Discount  Appearance Review
```

- ✓ = completed (green check), ● = current (blue), ○ = pending (gray)
- Steps are clickable (validates current step first)
- Final step shows "Publish" instead of "Next"

### Step 1: Products

```
┌─────────────────────────────────────┐
│  Bundle Details                      │
│  ┌─────────────────────────────────┐│
│  │ Name: [Auto-generated name    ] ││
│  └─────────────────────────────────┘│
│                                      │
│  Select Products        2/10 added   │
│  ┌─────────────────────────────────┐│
│  │ 🖼 Product A    $29.99    [✕]   ││
│  │    ↕ drag handle                ││
│  │ 🖼 Product B    $19.99    [✕]   ││
│  └─────────────────────────────────┘│
│  [+ Add Products]    [Clear All]     │
│                                      │
│  ── BOGO/BXGY only ──              │
│  [Same Product Toggle]               │
│  Role dropdowns (TRIGGER/REWARD)     │
│  Quantity inputs (BXGY only)         │
└─────────────────────────────────────┘
```

| Element | Interaction |
|---|---|
| Name input | Editable text, auto-generated default |
| Add Products | Opens Shopify product picker modal |
| Product `[✕]` | Remove product |
| Drag handle `↕` | Reorder products |
| Clear All | Remove all products (confirm) |
| Same Product Toggle | BOGO/BXGY: use 1 product for both roles |
| Role dropdown | BOGO/BXGY: set TRIGGER or REWARD |
| Quantity input | BXGY: set per-product quantity |

### Step 2: Discount

**Standard (Fixed Bundle):**

```
┌─────────────────────────────────────┐
│  Discount Type                       │
│  (●) Percentage  (○) Fixed  (○) None│
│                                      │
│  Discount Value                      │
│  [    10    ] %                      │
│                                      │
│  Bundle as Product                   │
│  [Create bundle product toggle]      │
│  [Product title / description /      │
│   media picker]                      │
│                                      │
│  ── Pro-locked section ──           │
│  [🔒 Bundle Behavior]    ⭐PRO     │
└─────────────────────────────────────┘
```

**BOGO/BXGY:**

```
┌─────────────────────────────────────┐
│  Buy X Get Y Discount Settings       │
│                                      │
│  Discount on reward items:           │
│  (●) Percentage  (○) Fixed  (○) Free│
│                                      │
│  Discount Value                      │
│  [    50    ] %                      │
│                                      │
│  Buy Quantity: [ 2 ]                 │
│  Get Quantity: [ 1 ]                 │
│                                      │
│  Bundle as Product                   │
│  [Create bundle product toggle]      │
└─────────────────────────────────────┘
```

**Volume Discount (Pro only):**

```
┌─────────────────────────────────────┐
│  Volume Discount Settings            │
│                                      │
│  Discount Type: [% | $]             │
│  Open-ended tiers: [toggle]          │
│                                      │
│  Tier 1: Min Qty [2]  Discount [10%]│
│  Tier 2: Min Qty [5]  Discount [20%]│
│  [+ Add Tier]                        │
└─────────────────────────────────────┘
```

### Step 3: Appearance

```
┌─────────────────────────────────────┐
│  Widget Layout                       │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ GRID   │ │ LIST   │ │ 🔒CARD │  │
│  │  ✓     │ │        │ │ ⭐PRO  │  │
│  └────────┘ └────────┘ └────────┘  │
│                                      │
│  Widget Position                     │
│  [Below product form           ▼]   │
│                                      │
│  Display Settings                    │
│  ☑ Show product images              │
│  ☑ Show prices                      │
│  ☑ Show savings                     │
│  ☑ Show quantity                    │
└─────────────────────────────────────┘
```

- Free layouts are selectable
- Pro-locked layouts show Pro badge; clicking opens Cross-Sell Modal

### Step 4: Review

```
┌─────────────────────────────────────┐
│  ⚠ [Error Banner]  (if errors)     │
│                                      │
│  Bundle Summary                      │
│  ────────────────────────────────── │
│  Name:      Summer Kit               │
│  Type:      Fixed Bundle              │
│  Status:    Draft                     │
│  Discount:  10% off                   │
│  Products:  3 items                   │
│  ────────────────────────────────── │
│  Product List                        │
│  • Product A — $29.99               │
│  • Product B — $19.99               │
│  • Product C — $24.99               │
│  ────────────────────────────────── │
│  Total: $67.47 (was $74.97)         │
│  Savings: $7.50                     │
│                                      │
│              [◄ Back]    [Publish]   │
└─────────────────────────────────────┘
```

BXGY and Volume Discount have type-specific review sections.

### Live Preview Sidebar (all steps)

Updates in real-time as form fields change. Shows the widget as it will appear on the storefront, using the selected layout and styles.

---

## Page 5: Edit Bundle (`/bundles/:id/edit`)

**Same layout as creation wizard**, with differences:

| Difference | Details |
|---|---|
| Title | Shows bundle name instead of "Create..." |
| TitleBar button | "Update" instead of "Publish" |
| Status badge | Shown next to title (DRAFT/ACTIVE/ARCHIVED) |
| Extra header buttons | View (popover) / Check Status / Delete |
| Duplicate button | In TitleBar (Pro-locked on Free) |
| Discard | Available if form is dirty |
| Delete | Red button → confirmation modal |
| Form | Pre-populated with saved bundle data |

---

## Page 6: Settings (`/settings`)

### Layout: Sidebar Tabs + Content

```
┌───────────────────────────────────────────────────────┐
│  Settings                          [Save] [Discard]    │
│  ─────────────────────────────────────────────────── │
│  ┌──────────┐  ┌──────────────────────────────────┐  │
│  │ Tabs     │  │  Tab Content                      │  │
│  │          │  │                                    │  │
│  │ General  │  │  (dynamic per selected tab)        │  │
│  │ Style ●  │  │                                    │  │
│  │ Labels   │  │                                    │  │
│  │ Advanced │  │                                    │  │
│  │ Tools    │  │                                    │  │
│  │          │  │                                    │  │
│  └──────────┘  └──────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

### General Tab

| Section | Setting | Type | Free |
|---|---|---|---|
| **Defaults** | Default discount type | Dropdown | ✅ |
| | Default discount value | Number | ✅ |
| **Cart Behavior** | After add-to-cart | Dropdown (Default/Cart/Checkout/Stay) | ✅ |
| | Enable stock validation | Toggle | ✅ |
| | Bundle priority strategy | Dropdown | 🔒 Pro |
| | Hide payment buttons | Toggle | 🔒 Pro |
| | Max bundles per order | Number | 🔒 Pro |
| | Show savings banner | Toggle | 🔒 Pro |
| | Allow discount stacking | Toggle | 🔒 Pro |
| **Privacy** | Enable analytics tracking | Toggle | ✅ |
| **Performance** | Cache duration | Dropdown | ✅ |
| | Lazy load images | Toggle | ✅ |

Pro-locked settings show with a lock icon + Pro badge. Clicking opens Cross-Sell Modal.

### Style Tab (Customizer)

Opens a modal-style customizer:

```
┌──────────────────────────────────────────────────────────┐
│  Style Customizer                                         │
│  ──────────────────────────────────────────────────────  │
│  Bundle Type Tabs: [Fixed] [BOGO] [BXGY] [Volume] ...   │
│  ──────────────────────────────────────────────────────  │
│  ┌────────────────────┐  ┌─────────────────────────────┐│
│  │ Settings Panel     │  │ Live Preview                 ││
│  │ (scrollable)       │  │ (sticky)                     ││
│  │                    │  │                               ││
│  │ Preset: [Minimal▼] │  │  ┌─────────────────────┐    ││
│  │ Primary: [#4F46E5] │  │  │ Bundle Widget        │    ││
│  │ Text:    [#1F2937] │  │  │ Preview              │    ││
│  │ BG:      [#FFFFFF] │  │  │                       │    ││
│  │ Corners: [Modern ] │  │  │ (updates live)        │    ││
│  │ Shadow:  [Soft   ] │  │  └─────────────────────┘    ││
│  │ Spacing: [Comfy  ] │  │                               ││
│  │ Image:   [Medium ] │  │  Device: [🖥] [📱] [📱]       ││
│  │                    │  │  (responsive preview)         ││
│  └────────────────────┘  └─────────────────────────────┘│
│                                        [Save] [Discard]  │
└──────────────────────────────────────────────────────────┘
```

**Customizer has 5 sections:**
1. **Appearance** — presets, colors (primary/text/bg/border/savings), shape (corners/shadow/spacing)
2. **Product Cards** — image size/fit/position, card background/border/shadow toggles
3. **Button & Badge** — button style/size/width/color, badge position/style, pricing summary box
4. **Advanced** — container max-width/alignment/border, responsive breakpoints, typography sizes, layout-specific settings (list/grid/carousel/BOGO/BXGY/volume/mix-match/FBT)
5. **Cart Banner** — colors, shape, typography, icon (visible only for cart banner preview)

### Labels Tab

**Locale Picker** (top of tab, visible when store has 2+ languages):

```
┌──────────────────────────────────────────────────┐
│  Language: [English ★] [French] [German] ...     │
│                    [🔄 Refresh]  [🔒 Auto Trans] │
└──────────────────────────────────────────────────┘
```

- Locale list fetched from Shopify (GraphQL), cached 24h
- Primary locale marked with star
- "Refresh locales" syncs latest from Shopify
- "Auto Translate" button: 🔒 Pro (lock icon on Free → Cross-Sell Modal)
- Switching locale loads that locale's saved labels (or blanks for new locale)
- All label edits are per-locale

**Label Sections:**

| Section | Free |
|---|---|
| Widget Texts (headings, buttons, qty) | ✅ |
| Button States (Adding, Added, Out of Stock) | ✅ |
| Price Labels (Regular, Bundle, Savings, Badge) | ✅ |
| BOGO/BXGY Labels (13 fields: deal badge, free text, buy/get prefixes, you pay/save, trigger/reward badges, total, checklist progress/hint/completed, locked/unlocked reward, pricing locked) | ✅ |
| Shipping Labels | 🔒 Pro |
| Cart Limits Messages | 🔒 Pro |
| Cart Savings Banner | 🔒 Pro |

### Advanced Tab

| Setting | Free |
|---|---|
| Custom CSS class | 🔒 Pro |
| Custom CSS code (10,000 char limit) | 🔒 Pro |

### Tools Tab

```
┌──────────────────────────────────────────────────────┐
│  Data Management                                      │
│  [📥 Export Settings]  [📤 Import Settings]           │
│  ──────────────────────────────────────────────────  │
│  Sync & Cache                                         │
│  [🔄 Sync to Shopify]  [🗑 Clear Cache]              │
│  ──────────────────────────────────────────────────  │
│  Webhook Management                                   │
│  [✓ Check Webhooks]  [⚡ Force Register Webhooks]     │
│  ──────────────────────────────────────────────────  │
│  ⚠ Danger Zone                                       │
│  [Reset Settings]  (tone="critical")                  │
└──────────────────────────────────────────────────────┘
```

| Tool | Action | Result |
|---|---|---|
| Export Settings | Downloads JSON backup | File download |
| Import Settings | Upload JSON file | Confirmation modal → applies settings |
| Sync to Shopify | Pushes settings/styles to metafields | Success/error toast |
| Clear Cache | Purges cached data | Success toast |
| Check Webhooks | Queries registered webhooks | Modal showing status per topic + GDPR compliance |
| Force Register | Re-registers all webhooks | Modal showing results per topic |
| Reset Settings | Factory reset | Confirmation modal → restores defaults |

### Form Controls

| Button | When visible | Action |
|---|---|---|
| Save | Always | Submits all settings changes |
| Discard | When form is dirty | Resets to last saved state |

---

## Page 7: Analytics (`/analytics`)

**Free plan:** Page is **accessible** (nav link visible). Basic metrics and charts are free. Advanced sections show as Pro-locked placeholders.

### Layout

```
┌──────────────────────────────────────────────────────┐
│  Analytics                                            │
│  ──────────────────────────────────────────────────  │
│  [AnalyticsDisabledBanner]  (if analytics off)       │
│  ──────────────────────────────────────────────────  │
│  [Overview] [Bundle Performance]    [Date Range ▼]   │
│  ──────────────────────────────────────────────────  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Revenue │ │Rev     │ │CVR     │ │CVR     │       │
│  │ $1,234 │ │Growth  │ │ 12.5%  │ │Growth  │       │
│  │        │ │ ▲+15%  │ │        │ │ ▲+2.3% │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│  ──────────────────────────────────────────────────  │
│                                                       │
│  OVERVIEW TAB:                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  Main Chart (area)                            │   │
│  │  [Revenue] [Views] [Purchases]  ← toggles     │   │
│  │  📈 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌──────────────┐ ┌──────────────┐  🔒 Pro          │
│  │ 🔒 Customer  │ │ 🔒 Conversion│                   │
│  │    Journey    │ │    Perform.  │  ← gray           │
│  │    Funnel     │ │              │    placeholders    │
│  └──────────────┘ └──────────────┘                   │
│  ┌─────────────────────────────────┐  🔒 Pro          │
│  │ 🔒 Revenue Analysis             │                   │
│  └─────────────────────────────────┘                   │
│                                                       │
│  BUNDLE PERFORMANCE TAB:                              │
│  ┌──────────────────────────────────────────────┐   │
│  │  Top Bundles (3 on Free, 10 on Pro)           │   │
│  │  #1  Summer Kit     ⭐Revenue Star   $5,200  │   │
│  │  #2  BOGO Deal      🔥Trending       $2,100  │   │
│  │  #3  Essentials     📈High Convert   $1,800  │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  🔒 All Bundles Performance        ⭐PRO     │   │
│  │     (gray placeholder)                        │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Free vs Pro breakdown

| Element | Free | Pro |
|---|---|---|
| 4 Metric cards | ✅ | ✅ |
| Main area chart (revenue/views/purchases) | ✅ | ✅ |
| Date range picker | ✅ | ✅ |
| Top Bundles table | 3 bundles | 10 bundles |
| Customer Journey Funnel | 🔒 Placeholder | ✅ |
| Conversion Performance chart | 🔒 Placeholder | ✅ |
| Revenue Analysis chart | 🔒 Placeholder | ✅ |
| All Bundles Performance table | 🔒 Placeholder | ✅ |

Clicking any 🔒 placeholder opens the Cross-Sell Modal for "Advanced Analytics".

### Performance Badges (on bundle rows)

| Badge | Free | Criteria |
|---|---|---|
| High Converter | ✅ | ≥15% CVR |
| Revenue Star | ✅ | ≥$5K revenue |
| Trending | ✅ | ≥25% growth |
| Hidden Gem | 🔒 | <100 views + ≥10% CVR |
| Declining | 🔒 | ≤-25% drop |
| High Interest | 🔒 | ≥30% ATC rate |

---

## Page 8: Pricing (`/pricing`)

```
┌──────────────────────────────────────────────────────┐
│  Pricing                                              │
│  ──────────────────────────────────────────────────  │
│  Billing: [Monthly | Annual (Save 20%)]              │
│  ──────────────────────────────────────────────────  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Free       │  │ Pro ★      │  │ Enterprise │    │
│  │ $0/mo      │  │ $9.99/mo   │  │ Contact us │    │
│  │            │  │ 14-day trial│  │            │    │
│  │ [Current]  │  │ [Upgrade]  │  │ [Contact]  │    │
│  │            │  │            │  │            │    │
│  │ ✓ 5 bundles│  │ ✓ Unlimited│  │ ✓ Custom   │    │
│  │ ✓ 3 types  │  │ ✓ All types│  │ ✓ Priority │    │
│  │ ✓ Basic    │  │ ✓ Analytics│  │ ✓ Dedicated│    │
│  └────────────┘  └────────────┘  └────────────┘    │
│  ──────────────────────────────────────────────────  │
│  Current Plan Status                                 │
│  Plan: Free | Bundles: 3/5 used  [████░░░░] 60%     │
│  ──────────────────────────────────────────────────  │
│  Feature Comparison Table                            │
│  Feature          Free    Pro     Enterprise         │
│  Max Bundles      5       ∞       ∞                  │
│  Bundle Types     3       6       6                  │
│  Analytics        Basic   Full    Full               │
│  A/B Testing      ✕       ✓       ✓                  │
│  Custom CSS       ✕       ✓       ✓                  │
│  ...                                                 │
│  ──────────────────────────────────────────────────  │
│  FAQ (collapsible accordion)                         │
│  ▸ Can I cancel anytime?                            │
│  ▸ What happens to my bundles if I downgrade?       │
│  ▸ ...                                              │
└──────────────────────────────────────────────────────┘
```

| Element | Interaction |
|---|---|
| Monthly/Annual toggle | Switches price display |
| Plan card buttons | Current Plan (disabled) / Upgrade (starts billing) / Contact |
| FAQ items | Click to expand/collapse |
| QuotaBar | Visual bundle usage indicator |

---

## Page 9: Support (`/support`)

```
┌──────────────────────────────────────────────────────┐
│  Support                                              │
│  ──────────────────────────────────────────────────  │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ Main Content          │  │ Side Panel            │ │
│  │                       │  │                       │ │
│  │ Quick Actions         │  │ Resources             │ │
│  │ [Common shortcuts]    │  │ • Documentation       │ │
│  │                       │  │ • Email support       │ │
│  │ FAQ                   │  │ • Changelog           │ │
│  │ ▸ Question 1          │  │                       │ │
│  │ ▸ Question 2          │  │ [📧 Email Support]   │ │
│  │ ▸ Question 3          │  │                       │ │
│  └──────────────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

| Element | Interaction |
|---|---|
| FAQ items | Click to expand/collapse |
| Quick action buttons | Navigate to relevant pages |
| Email Support button | Opens email client |
| Documentation link | Opens external docs |

---

## Modal Inventory

These modals can appear on any page:

| Modal | Trigger | Content |
|---|---|---|
| **Delete Bundle** | Delete button (list/edit) | "Are you sure?" + confirm/cancel |
| **Duplicate Bundle** | Duplicate button (list/edit) | Pro: creates copy (auto-named "#2"). Free: opens Cross-Sell |
| **Change Status** | Status popover → select status | Confirm status change. SCHEDULED shows date picker |
| **Delete Product** | Remove product in wizard | Confirm removal |
| **Restore Defaults** | Reset in customizer | Confirm style reset |
| **Import Settings** | Tools tab → Import | File upload + confirmation |
| **Webhook Status** | Tools tab → Check Webhooks | Lists registered/missing webhooks + GDPR status |
| **Webhook Register** | Tools tab → Force Register | Shows per-topic registration results |
| **Reset Settings** | Tools tab → Reset | Danger confirmation → factory reset |
| **Quota Exceeded** | Create when at 5/5 | Upgrade prompt |
| **Cross-Sell (Pro Upsell)** | Any Pro badge/locked feature | Benefits list + "Upgrade" link to pricing |
| **Bundle Type Info** | ℹ button on type card | Description + features + "Select" CTA |
| **Video Player** | Video card on dashboard | Embedded video |
| **Product Picker** | "Add Products" in wizard | Shopify resource picker (multi-select) |

---

## Storefront Widget (Customer-Facing)

Not in the admin app. Two components render on the merchant's Shopify store:
1. **Bundle Widget** (app-block) — on product pages
2. **Cart Savings Banner** (app-embed) — on cart page

### Where to find them

**Bundle Widget:**
1. Go to merchant's store → any product page that's in an active bundle
2. Widget appears in the position configured in Step 3 (Appearance)

**Cart Savings Banner:**
1. Go to cart page with bundle products in cart
2. Banner appears at top of cart form (auto-positioned)

### What it looks like

```
┌──────────────────────────────────────────┐
│  🏷 Bundle Deal                          │
│  ────────────────────────────────────── │
│  [Product images / cards per layout]     │
│  ────────────────────────────────────── │
│  Regular: $74.97                         │
│  Bundle:  $67.47  (Save $7.50)          │
│  ────────────────────────────────────── │
│  [       Add Bundle to Cart        ]     │
└──────────────────────────────────────────┘
```

### All Widget Layouts (by bundle type)

**Fixed Bundle:** `list`, `grid`, `compact` (Pro), `slider` (Pro)

**BOGO / Buy X Get Y:** `classic_card`, `compact_grid`, `minimalist`, `sleek` (Pro), `checklist` (Pro), `split_deal` (Pro), `bxgy` default (Pro)

**Volume Discount (Pro):** `volume_tier_list`, `volume_pricing_cards`, `volume_slider`, `volume_calculator`

Free plan layouts are determined by `plans.constants.ts` — see `QA_FREE_FEATURES_GUIDE.md` §2 for the exact mapping.

### Events to verify (Network tab)

| Event | Method | Endpoint |
|---|---|---|
| Page load | GET | `/apps/radius-bundles/products?productId=...` |
| Widget visible | POST | `/apps/radius-bundles/analytics` (type: `bundle_view`) |
| Add to Cart | POST | `/cart/add.js` (Shopify) |
| After ATC | POST | `/apps/radius-bundles/analytics` (type: `bundle_add_to_cart`) |

### Cart line items after Add

Each bundle product becomes a separate line item with properties:
- `_bundle_id`
- `_bundle_name`
- `_bundle_discount_type`
- `_bundle_discount_value`

Plus a global cart attribute `_radiusDiscounts` (JSON array of all active bundle configs).

### Standalone Bundle Mode

When a bundle has a "main product" (via Bundle as Product), visiting that product's page:
- Widget container is **hidden** (no visible widget UI)
- Hidden inputs injected into the product form: `_bundle_id`, `_bundle_name`
- "Buy Now" button is hidden (prevents checkout bypass)
- Normal "Add to Cart" adds all bundle products with attributes
- Analytics `bundle_view` still fires

### Cart Auto-Cleanup

The widget monitors the cart continuously:
- Intercepts `/cart/change`, `/cart/update`, `/cart/clear` fetch calls
- If a bundle product is manually removed → remaining bundle items cleaned up
- If bundle deactivated server-side → `_radiusDiscounts` entry removed
- If discount settings changed → cart attributes updated
- Debounced (500ms), dispatches `radiusBundles:cleanup` event

### Cart Savings Banner (App Embed)

```
┌──────────────────────────────────────────────────────┐
│  [🏷]  You're saving $7.50 with Summer Bundle!       │
│        Free shipping included                         │
└──────────────────────────────────────────────────────┘
```

- Renders on **cart page** only (separate from product page widget)
- Auto-positions at top of cart form
- Polls cart every 10s + listens to `cart:change` events
- Updates in real-time when bundles added/removed/modified
- Customizable via Settings → Style → Cart Banner section:
  - Colors, corner style, shadow, spacing, font size
  - Icon type (tag, percent, gift, sparkle, fire, check, none)
- Label placeholders: `{discount}`, `{name}`, `{price}`

### Max Bundles Per Order

If `maxBundlesPerOrder` > 0 (set in Settings → General, Pro feature):
- Widget counts existing bundles in cart before Add to Cart
- If at limit → shows error toast, blocks addition
- Default: 0 (unlimited)

### Stock Validation

If `enableStockValidation` is on (default: true):
- Widget checks product availability from API response
- Out-of-stock variants → Add to Cart button disabled
- Error message displayed to customer

### Widget Translation / Locale Handling

```
Settings → Labels (per locale) → Save → DB → Metafield sync → Storefront
```

**Storefront locale detection (Liquid):**
1. `request.locale.iso_code` → exact match in `global.labels[locale]`
2. Base locale fallback (e.g., `en-us` → `en`)
3. Store's primary locale
4. Built-in extension defaults (`/extension/.../locales/en.default.json`)

**Built-in storefront locales** (7): English, French, German, Spanish, Italian, Portuguese, Japanese

**RTL support:** Arabic, Hebrew, Farsi, Urdu — auto-detected, flips widget layout.

**QA checks:**
- Switch storefront language → widget labels change
- Custom label in Settings → appears on storefront after save
- Placeholders (`{amount}`, `{count}`, `{name}`, `{discount}`) resolve to real values
- RTL language → widget text and layout flip correctly
- Missing locale → falls back to primary locale → then to built-in defaults

---

## Loading & Error States Reference

| State | What you see |
|---|---|
| Page loading | Skeleton placeholders (gray shimmer blocks) |
| Table loading | Skeleton rows |
| Button loading | Spinner inside button, button disabled |
| Save success | Green banner: "Settings saved" / "Bundle created" |
| Save error | Red banner: error message |
| Network error | Red banner: "Something went wrong" |
| Empty bundle list | Illustration + "Create your first bundle" CTA |
| Bundle not found | Redirect to `/bundles` with error banner |
| Form validation error | Red inline messages on fields + error banner on Review step |

---

## Key Keyboard/Accessibility Notes

- All buttons are Tab-focusable
- Modals trap focus
- `Escape` closes modals/popovers
- Product list supports drag-and-drop (mouse) for reordering
- Status popovers open on click, close on outside click or Escape
