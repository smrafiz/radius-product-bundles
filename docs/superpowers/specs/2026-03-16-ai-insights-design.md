# AI Insights Feature — Design Spec
**Date**: 2026-03-16
**Status**: Reviewed — awaiting user approval
**Feature**: LLM-powered bundle insights with BYOK (Bring Your Own Key)

---

## 1. Overview

Merchants connect their own LLM API key (Claude, OpenAI, or Gemini) and the app generates two types of AI-powered insights:

1. **Bundle Optimizer** — analyzes existing bundle performance metrics and returns actionable recommendations (low CVR warnings, discount suggestions, product swap ideas)
2. **Bundle Discovery** — analyzes the merchant's product catalog and recommends new high-converting bundle combinations, with a one-click "Create Bundle →" flow

Insights are triggered two ways:
- **On-demand**: merchant clicks "Generate Insights" button on the dashboard
- **Scheduled**: infrastructure-agnostic cron endpoint (`POST /api/cron/ai-insights`) called by any scheduler (Vercel Cron, AWS EventBridge, GitHub Actions, etc.)

---

## 2. Architecture

### 2.1 LLM Provider Layer

**Library**: Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai` + `@ai-sdk/google`)

Rationale: single unified `generateText()` interface across all 3 providers. Structured output via Zod schemas enforced at the SDK level — no manual JSON parsing. Infrastructure-agnostic (runs on any Node.js environment). Not tied to Vercel hosting.

```
createLLMModel(provider, apiKey, model)
  ├── CLAUDE  → createAnthropic({ apiKey })(model)
  ├── OPENAI  → createOpenAI({ apiKey })(model)
  └── GEMINI  → createGoogleGenerativeAI({ apiKey })(model)
```

All pipelines call:
```typescript
const { output } = await generateText({
  model: createLLMModel(provider, decryptedKey, model),
  output: Output.object({ schema: InsightResponseSchema }),  // Zod
  prompt: buildPrompt(data),
  maxTokens: 2000,
})
```

### 2.2 Two Pipelines

#### Pipeline 1 — Bundle Optimizer
```
Input:  BundleAnalytics.groupBy (last 30 days) + Bundle metadata
Prompt: Analyze metrics, return 3–5 actionable insights per underperforming bundle
Output: AIInsight rows (type: OPTIMIZATION | WARNING | RECOMMENDATION)
```

#### Pipeline 2 — Bundle Discovery
```
Input:  Shopify Admin GraphQL → up to 50 active products (title, type, tags, vendor, price)
        + existing Bundle names (to avoid duplicates)
Prompt: Recommend 3–5 new bundle combinations with reasoning
Output: AIInsight rows (type: RECOMMENDATION)
        actionType: "create_bundle"
        actionData: { bundleType, products[], discountType, discountValue, suggestedName, reasoning }
```

### 2.3 Data Flow

```
ON-DEMAND:
  Dashboard → "Generate Insights" button
    → useGenerateInsights() mutation
    → POST server action (authenticate.admin session)
    → AIInsightsService.generate(shop, adminClient)
    → [Pipeline 1 + Pipeline 2 in parallel]
    → Write AIInsight rows
    → Invalidate React Query cache
    → Dashboard card re-renders with new insights

SCHEDULED (cron):
  Any scheduler → GET /api/cron/ai-insights          ← GET, matches bundle-scheduler pattern
    → CRON_SECRET validation (Bearer token, min 16 chars)
    → 55s timeout budget with break in shop loop
    → Iterate shops where aiInsightsEnabled = true + aiInsightsCronFrequency due:
        DAILY:  aiInsightsLastRun < now - 24h  (or null)
        WEEKLY: aiInsightsLastRun < now - 7d   (or null)
    → Per shop (sequential, not parallel — avoids timeout risk):
        get offline session token from Session table
        create admin GraphQL client with stored accessToken
        run Pipeline 1 → run Pipeline 2
        update aiInsightsCronLastRun timestamp (separate from on-demand tracking)
    → Break loop if elapsed > 50s
```

### 2.4 Pre-fill Flow (Bundle Discovery → Create Bundle)

```
Merchant sees recommendation card
  → clicks "Create Bundle →"
  → useAIPrefillStore.setPrefill(actionData)
  → router.push('/bundles/create/FIXED_BUNDLE')
  → CreateBundlePage.onMount: consumePrefill()
  → useBundleStore.setBundleData({ name, products, discountType, discountValue })
  → Form pre-populated, merchant reviews and publishes
```

No URL params needed — Zustand store handles the handoff cleanly.

---

## 3. Schema Changes

### 3.1 New Prisma Enums

```prisma
enum LLMProvider {
  CLAUDE
  OPENAI
  GEMINI
}

enum CronFrequency {
  DAILY
  WEEKLY
}
```

### 3.2 AppSettings Extensions

```prisma
// Add to AppSettings model:
llmProvider               LLMProvider?
llmApiKey                 String?        // AES-256-GCM encrypted via encryptToken()
llmModel                  String?        // e.g. "claude-sonnet-4-6", "gpt-4o", "gemini-2.0-flash"
aiInsightsEnabled         Boolean        @default(false)
aiInsightsCronFrequency   CronFrequency  @default(WEEKLY)
aiInsightsCronLastRun     DateTime?      // Updated by cron only
aiInsightsOnDemandLastRun DateTime?      // Updated by on-demand only (rate limit check)

@@index([shopId, aiInsightsEnabled])  // for cron shop iteration
```

**Two separate last-run fields** prevent the cron from resetting the on-demand rate limit clock (C-3 fix).

### 3.3 AIInsight Model — Index Additions Only

Add missing indexes to support expiry filtering and cap deletion queries:

```prisma
@@index([shopId, expiresAt])    // exclude expired insights efficiently
@@index([shopId, createdAt])    // oldest-first deletion for 20-insight cap
```

Key fields utilized:

| Field | Usage |
|---|---|
| `type` | OPTIMIZATION, WARNING, RECOMMENDATION |
| `category` | "performance", "pricing", "product-mix", "new-bundle" |
| `title` | Short insight headline |
| `description` | Full explanation from LLM |
| `confidence` | 0.0–1.0 float from LLM |
| `impact` | "HIGH" \| "MEDIUM" \| "LOW" |
| `actionable` | true for all AI-generated insights |
| `actionType` | "create_bundle" \| "adjust_discount" \| "swap_product" \| null |
| `actionData` | JSON config for the action (bundle pre-fill, discount change, etc.) |
| `bundleId` | Set for Optimizer insights (null for Discovery) |
| `expiresAt` | now + 30 days |
| `shopId` | Required |

---

## 4. Deduplication & Limits

- **Dedup (Optimizer)**: check for existing unread rows with same `type + category + bundleId` within last 7 days → skip if found
- **Dedup (Discovery)**: check for existing unread RECOMMENDATION rows where `actionData` product IDs hash matches within last 7 days → skip if found (prevents duplicate bundle recommendations for same product set)
- **Cap**: max 20 active (non-expired) insights per shop → delete oldest `(implemented=true OR views > 0)` rows first when exceeding limit
- **Rate limit (on-demand)**: 1 generation per 5 minutes per shop — server-side check against `aiInsightsOnDemandLastRun` (not affected by cron runs)
- **Expiry**: `expiresAt = now + 30 days` — expired insights excluded from all dashboard queries
- **Empty catalog guard**: if Shopify returns 0 active products, skip Pipeline 2 entirely and write a single INFO insight: "Add products to your store to receive bundle recommendations"

---

## 5. Settings UI — New AI Tab

Added to the existing settings config-driven tab system.

### Fields

| Field | Component | Notes |
|---|---|---|
| Enable AI Insights | Toggle | Master on/off |
| LLM Provider | Select | Claude \| OpenAI \| Gemini |
| API Key | Password input | Masked, never returned to client after save |
| Model | Select (dynamic per provider) | See model list below |
| Cron Frequency | Select | Daily \| Weekly |
| Test Connection | Button | Makes a minimal `generateText()` call server-side |

### Default Models per Provider

| Provider | Default | Options |
|---|---|---|
| CLAUDE | claude-sonnet-4-6 | claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-6 |
| OPENAI | gpt-4o | gpt-4o, gpt-4o-mini, gpt-4-turbo |
| GEMINI | gemini-2.0-flash | gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash |

### Security: API Key Handling

- Key encrypted with `encryptToken()` (existing AES-256-GCM) before DB write in `settings.service.ts`
- Key decrypted server-side only in service layer — never returned to client
- On settings read: `transformSettingsToFormData()` returns `hasLlmApiKey: boolean` (not the key itself)
- On settings save: `transformFormDataToSettings()` — if `llmApiKey` field is empty string, preserve existing encrypted key in DB (no overwrite); only encrypt + save if a new non-empty value is provided
- On settings reset (`resetSettingsService`): warns merchant that AI credentials will be cleared; reset is confirmed before proceeding

### Test Connection

Standalone server action `testLLMConnection(shop)` (not wired through the settings save flow):
1. Read encrypted key from DB
2. Decrypt server-side
3. `generateText({ model, prompt: "ping", maxTokens: 5 })`
4. Return `{ success: boolean, error?: string }` to client
5. Never exposes key to client at any point

---

## 6. Dashboard AI Insights Card

### States

| State | UI |
|---|---|
| Not configured | "Connect your AI provider in Settings to enable insights" + Settings link |
| Empty (no insights yet) | "No insights yet. Click Generate to analyze your bundles." + Generate button |
| Loading | Skeleton cards + spinner |
| Has insights | List of insight cards + Generate button |
| Rate limited | "Please wait X minutes before generating again" |

### Insight Card

```
[Badge: OPTIMIZATION | WARNING | RECOMMENDATION]  [Confidence: 87%]
Title: "Summer Bundle has low conversion"
Description: "With 340 views and only 2.1% CVR, consider reducing the discount
              from 10% to 15% or swapping the sunscreen for a more popular item."
Impact: HIGH
[Action button if actionType set: "Adjust Discount →" | "Create Bundle →"]
[Mark as read ×]
```

### "Create Bundle →" button

- Stores `actionData` in `useAIPrefillStore`
- Navigates to `/bundles/create/FIXED_BUNDLE`
- Bundle form pre-fills: name, products, discountType, discountValue
- Merchant reviews → publishes

---

## 7. File Structure

```
/web/lib/ai/
  llm-provider.ts                   # createLLMModel() factory
  prompts/
    bundle-optimizer.prompt.ts       # Prompt builder for Pipeline 1
    bundle-discovery.prompt.ts       # Prompt builder for Pipeline 2
  schemas/
    insight-response.schema.ts       # Zod schemas for LLM output

/web/features/ai-insights/
  actions/
    ai-insights.actions.ts           # generateInsights(), markRead(), dismiss()
  api/
    ai-insights.queries.ts           # React Query keys + query fns
    ai-insights.mutations.ts         # React Query mutation fns
  components/
    ai-insights-card/                # Single insight card component
    ai-insights-list/                # List + empty states
    ai-insights-generate-button/     # CTA with loading + rate limit feedback
    dashboard-ai-insights/           # Dashboard section wrapper
  hooks/
    use-ai-insights.ts               # React Query hook (fetch insights)
    use-generate-insights.ts         # Mutation hook (trigger generation)
  repositories/
    ai-insights.queries.ts           # Prisma reads (list, dedup check)
    ai-insights.mutations.ts         # Prisma writes (create, expire, cap)
  services/
    ai-insights.service.ts           # Orchestrator (runs both pipelines)
    bundle-optimizer.service.ts      # Pipeline 1 logic
    bundle-discovery.service.ts      # Pipeline 2 logic
    insight-dedup.service.ts         # Dedup + cap logic
  stores/
    ai-prefill.store.ts              # Temporary pre-fill store (cross-feature: written by ai-insights, read by bundles)
  types/
    ai-insights.types.ts             # AIInsight, LLMProvider, BundleRecommendation
  constants/
    ai-insights.constants.ts         # Provider models, caps, rate limits
  index.ts

/web/features/settings/configs/
  ai.config.ts                       # New AI settings tab config

/web/app/api/cron/ai-insights/
  route.ts                           # Cron endpoint (CRON_SECRET protected)
```

### Modified Files

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add LLMProvider enum, CronFrequency enum, 8 AI fields to AppSettings, 2 indexes to AIInsight |
| `features/settings/configs/tabs.config.ts` | Add AI tab entry with icon (e.g. `SparklesIcon`) |
| `features/settings/types/settings.types.ts` | Add `"ai"` to `SettingsTabId`, add AI icon to `SettingsTabNavInfo` union |
| `features/settings/types/app-settings.types.ts` | Add AI fields + `hasLlmApiKey: boolean` to `AppSettings` type |
| `features/settings/services/settings.service.ts` | Update `transformSettingsToFormData()` + `transformFormDataToSettings()` for AI fields; encrypt key on save; preserve key when empty; warn on reset |
| `features/settings/repositories/settings.mutations.ts` | Handle AI fields in upsert |
| `features/dashboard/components/dashboard-page/` | Add AIInsights section |
| `features/bundles/components/create-bundle-page/` | Consume `useAIPrefillStore.consumePrefill()` on mount |

---

## 8. Dependencies

```bash
bun add ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google
```

No other new npm dependencies. All other needs (Zod, Prisma, React Query, Zustand) already present.

### Required Environment Variables

| Variable | Already exists? | Notes |
|---|---|---|
| `ENCRYPTION_KEY` | Yes (S-4 audit fix) | 64-char hex string. Required for LLM API key encryption. Must be present in all deployment environments |
| `CRON_SECRET` | Yes (S-5 audit fix) | Min 16 chars. Required for cron endpoint auth |

---

## 9. Zod Schema — LLM Structured Output

Both pipelines use `Output.object({ schema })` with Vercel AI SDK. Schemas must be explicit.

### Pipeline 1 — Bundle Optimizer Response Schema

```typescript
const OptimizerInsightSchema = z.object({
  insights: z.array(z.object({
    type: z.enum(['OPTIMIZATION', 'WARNING', 'RECOMMENDATION']),
    category: z.enum(['performance', 'pricing', 'product-mix']),
    title: z.string().max(100),
    description: z.string().max(500),
    confidence: z.number().min(0).max(1),
    impact: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    actionType: z.enum(['adjust_discount', 'swap_product']).nullable(),
    actionData: z.record(z.unknown()).nullable(),
    bundleId: z.string(),
  })).max(5),
})
```

### Pipeline 2 — Bundle Discovery Response Schema

```typescript
const DiscoveryInsightSchema = z.object({
  recommendations: z.array(z.object({
    suggestedName: z.string().max(100),
    reasoning: z.string().max(500),
    confidence: z.number().min(0).max(1),
    impact: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    bundleType: z.enum(['FIXED_BUNDLE']),   // only supported type for AI creation
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'NO_DISCOUNT']),
    discountValue: z.number().min(0).max(100),
    products: z.array(z.object({
      productId: z.string(),   // Shopify GID: "gid://shopify/Product/123"
      title: z.string(),
      quantity: z.number().int().min(1).default(1),
    })).min(2).max(10),
  })).max(5),
})
```

`maxTokens` per pipeline:
- Pipeline 1 (Optimizer): `1500` (structured insights, bounded output)
- Pipeline 2 (Discovery): `2500` (more products + reasoning per recommendation)

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| LLM latency (10–30s on-demand) | Loading skeleton + optimistic UI feedback |
| Invalid API key stored | Test Connection standalone action validates before save |
| Prompt returns malformed JSON | Zod schema enforced by Vercel AI SDK — throws on parse failure, caught in service |
| Merchant spams Generate button | Server-side rate limit: 1 call per 5 min per shop via `aiInsightsOnDemandLastRun` |
| Cron resets on-demand rate limit | Two separate fields: `aiInsightsCronLastRun` + `aiInsightsOnDemandLastRun` |
| Large product catalogs | Cap Discovery input at 50 products (`first: 50` in GraphQL query) |
| Empty product catalog | Pipeline 2 short-circuits, writes INFO insight prompting merchant to add products |
| Insight fatigue | 7-day dedup (with product hash for Discovery) + 20 insight cap + 30-day expiry |
| Cron timeout | 55s budget with break in shop loop; pipelines run sequentially per shop |
| Provider API outage | Caught in service, logged, surface error in dashboard card |
| Settings reset deletes API key | Reset flow warns merchant; separate confirm required |
| `ENCRYPTION_KEY` missing in deployment | Documented as required env var; throws on startup (existing behaviour) |

---

## 11. Out of Scope (Post-submission)

- Streaming responses (real-time token output)
- Insight approval/rejection workflow
- Per-insight feedback (thumbs up/down for model improvement)
- Automatic A/B test creation from insights
- Insight history / archive view
- Multi-language prompt support
