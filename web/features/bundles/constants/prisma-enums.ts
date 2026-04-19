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

export const BundleProductRole = {
    TRIGGER: "TRIGGER",
    REWARD: "REWARD",
    INCLUDED: "INCLUDED",
    OPTIONAL: "OPTIONAL",
    GROUP_OPTION: "GROUP_OPTION",
} as const;
export type BundleProductRole =
    (typeof BundleProductRole)[keyof typeof BundleProductRole];
