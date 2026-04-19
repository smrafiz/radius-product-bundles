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

export const BundleProductRole = {
    TRIGGER: "TRIGGER",
    REWARD: "REWARD",
    INCLUDED: "INCLUDED",
    OPTIONAL: "OPTIONAL",
    GROUP_OPTION: "GROUP_OPTION",
} as const;
export type BundleProductRole =
    (typeof BundleProductRole)[keyof typeof BundleProductRole];
