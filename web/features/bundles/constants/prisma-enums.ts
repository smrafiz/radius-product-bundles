/**
 * Client-safe enum constants that mirror Prisma generated enum values.
 * Import from here in client components and Zod schemas.
 * Do NOT import from @/prisma/generated/client in client bundles.
 */

export const DiscountApplication = {
    BUNDLE: "BUNDLE",
    PRODUCTS: "PRODUCTS",
} as const;
export type DiscountApplication =
    (typeof DiscountApplication)[keyof typeof DiscountApplication];

export const PriorityType = {
    INDEX_BASED: "INDEX_BASED",
    DISCOUNT_BASED: "DISCOUNT_BASED",
} as const;
export type PriorityType =
    (typeof PriorityType)[keyof typeof PriorityType];

export const RedirectAfterCart = {
    DEFAULT: "DEFAULT",
    CART: "CART",
    CHECKOUT: "CHECKOUT",
    NONE: "NONE",
} as const;
export type RedirectAfterCart = (typeof RedirectAfterCart)[keyof typeof RedirectAfterCart];

export const BundleLayout = {
    GRID: "GRID",
    CAROUSEL: "CAROUSEL",
    LIST: "LIST",
    COMPACT: "COMPACT",
    CLASSIC_CARD: "CLASSIC_CARD",
    COMPACT_GRID: "COMPACT_GRID",
    MINIMALIST: "MINIMALIST",
    SLEEK: "SLEEK",
    CHECKLIST: "CHECKLIST",
    SPLIT_DEAL: "SPLIT_DEAL",
    VOLUME_TIER_LIST: "VOLUME_TIER_LIST",
    VOLUME_PRICING_CARDS: "VOLUME_PRICING_CARDS",
    VOLUME_SLIDER: "VOLUME_SLIDER",
    VOLUME_CALCULATOR: "VOLUME_CALCULATOR",
} as const;
export type BundleLayout = (typeof BundleLayout)[keyof typeof BundleLayout];

export const TestType = {
    PRICING: "PRICING",
    PRODUCT_MIX: "PRODUCT_MIX",
    COPY: "COPY",
    LAYOUT: "LAYOUT",
} as const;
export type TestType = (typeof TestType)[keyof typeof TestType];

export const TestStatus = {
    DRAFT: "DRAFT",
    RUNNING: "RUNNING",
    COMPLETED: "COMPLETED",
    STOPPED: "STOPPED",
} as const;
export type TestStatus = (typeof TestStatus)[keyof typeof TestStatus];

export const AutomationStatus = {
    ACTIVE: "ACTIVE",
    PAUSED: "PAUSED",
    ARCHIVED: "ARCHIVED",
} as const;
export type AutomationStatus = (typeof AutomationStatus)[keyof typeof AutomationStatus];

export const TriggerType = {
    SCHEDULE: "SCHEDULE",
    PERFORMANCE: "PERFORMANCE",
    INVENTORY: "INVENTORY",
    CUSTOMER_BEHAVIOR: "CUSTOMER_BEHAVIOR",
} as const;
export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

export const AIInsightType = {
    RECOMMENDATION: "RECOMMENDATION",
    OPTIMIZATION: "OPTIMIZATION",
    PREDICTION: "PREDICTION",
    WARNING: "WARNING",
} as const;
export type AIInsightType = (typeof AIInsightType)[keyof typeof AIInsightType];

export const NotificationType = {
    BUNDLE_PERFORMANCE: "BUNDLE_PERFORMANCE",
    AI_RECOMMENDATION: "AI_RECOMMENDATION",
    TEST_COMPLETED: "TEST_COMPLETED",
    AUTOMATION_ERROR: "AUTOMATION_ERROR",
    MILESTONE_REACHED: "MILESTONE_REACHED",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationPriority = {
    LOW: "LOW",
    NORMAL: "NORMAL",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
} as const;
export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority];

export const AlertRuleStatus = {
    ACTIVE: "ACTIVE",
    PAUSED: "PAUSED",
} as const;
export type AlertRuleStatus = (typeof AlertRuleStatus)[keyof typeof AlertRuleStatus];

export const AlertFrequency = {
    IMMEDIATE: "IMMEDIATE",
    HOURLY: "HOURLY",
    DAILY: "DAILY",
} as const;
export type AlertFrequency = (typeof AlertFrequency)[keyof typeof AlertFrequency];

export const BundleProductRole = {
    TRIGGER: "TRIGGER",
    REWARD: "REWARD",
    INCLUDED: "INCLUDED",
    OPTIONAL: "OPTIONAL",
    GROUP_OPTION: "GROUP_OPTION",
} as const;
export type BundleProductRole =
    (typeof BundleProductRole)[keyof typeof BundleProductRole];
