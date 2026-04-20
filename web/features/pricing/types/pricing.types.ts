import type { PlanName, ShopifySubscriptionStatus } from "@/prisma/generated/client";

/**
 * Pricing card types
 */
export interface PricingCardItemInfo {
    id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    frequency: string;
    annualEquivalent?: string;
    primaryButton: {
        content: string;
        loading?: boolean;
        props: {
            variant: "primary" | "secondary";
            external?: boolean;
            disabled?: boolean;
        };
    };
    featuredText?: string;
    trialBadge?: string;
    onSubscribe?: () => void;
}

export type BillingInterval = "EVERY_30_DAYS" | "ANNUAL";

export interface BillingStatusResponse {
    subscription: {
        id: string;
        name: string;
        status: string;
        createdAt: string;
        currentPeriodEnd: string | null;
        trialDays: number | null;
        test: boolean;
        price: string | null;
        currencyCode: string | null;
        interval: string | null;
    } | null;
    localStatus: string | null;
    trialEndsAt: string | null;
    trialUsed: boolean;
    status: string;
}

/**
 * Pricing faqs types
 */
export interface PricingFaqItemInfo {
    id: string;
    title: string;
    description: string;
}

/**
 * Shop plan types
 */
export type ShopPlanUpsertData = {
    plan?: PlanName;
    status?: ShopifySubscriptionStatus;
    billingId?: string;
    billingInterval?: string;
    trialUsed?: boolean;
    trialEndsAt?: Date | null;
    currentPeriodEnd?: Date | null;
    activatedAt?: Date | null;
    cancelledAt?: Date | null;
};

/**
 * Feature comparison table types
 */
export type CellValue = boolean | string;

/**
 * Feature comparison table types
 */
export interface TableRow {
    labelKey: string;
    free: CellValue;
    pro: CellValue;
}

/**
 * Feature comparison table types
 */
export interface TableCategory {
    categoryKey: string;
    rows: TableRow[];
}
