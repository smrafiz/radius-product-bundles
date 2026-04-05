import { PlanName, ShopifySubscriptionStatus } from "@/prisma/generated/enums";

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
    trialEndsAt?: Date | null;
    currentPeriodEnd?: Date | null;
    activatedAt?: Date | null;
    cancelledAt?: Date | null;
};
