import { PricingCardItemInfo } from "@/features/pricing";

export const SUBSCRIPTION_PLANS = {
    FREE: "free",
    STARTER: "starter",
    PREMIUM: "premium",
} as const;

export type SubscriptionPlanType =
    (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export const PLAN_PRICING: Record<
    SubscriptionPlanType,
    {
        price: number;
        currencyCode: string;
        interval: "EVERY_30_DAYS" | "ANNUAL";
        trialDays?: number;
    }
> = {
    [SUBSCRIPTION_PLANS.FREE]: {
        price: 0,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
    },
    [SUBSCRIPTION_PLANS.STARTER]: {
        price: 9.99,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 7,
    },
    [SUBSCRIPTION_PLANS.PREMIUM]: {
        price: 19.99,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 7,
    },
};

export const PRICING_CARD: PricingCardItemInfo[] = [
    {
        id: SUBSCRIPTION_PLANS.FREE,
        title: "Free",
        description: "Perfect for testing and small stores",
        features: [
            "Up to 100 orders/month",
            "5 active bundles",
            "Basic analytics",
            "Email support",
        ],
        price: "$0",
        frequency: "month",
        primaryButton: {
            content: "Current Plan",
            loading: false,
            props: {
                variant: "secondary",
                disabled: true,
            },
        },
    },
    {
        id: SUBSCRIPTION_PLANS.STARTER,
        title: "Starter",
        featuredText: "Best Value",
        description: "For growing stores that need more power",
        features: [
            "Up to 1,000 orders/month",
            "25 active bundles",
            "Advanced analytics",
            "Priority support",
            "Custom bundle templates",
        ],
        price: "$9.99",
        frequency: "month",
        primaryButton: {
            content: "Select Starter",
            loading: false,
            props: {
                variant: "primary",
            },
        },
    },
    {
        id: SUBSCRIPTION_PLANS.PREMIUM,
        title: "Pro",
        description: "For high-volume stores with advanced needs",
        features: [
            "Unlimited orders",
            "Unlimited bundles",
            "Advanced analytics",
            "24/7 priority support",
            "Custom bundle templates",
            "API access",
            "White-label options",
        ],
        price: "$19.99",
        frequency: "month",
        primaryButton: {
            content: "Select Pro",
            loading: false,
            props: {
                variant: "primary",
            },
        },
    },
];

export const PRICING_FAQ_ITEM = [
    {
        id: "0",
        title: "What's included in the Free plan?",
        description:
            "The Free plan includes basic bundle creation, up to 100 orders/month, 5 active bundles, and email support. Perfect for testing the app before committing.",
    },
    {
        id: "1",
        title: "Can I upgrade or downgrade anytime?",
        description:
            "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades apply at the next billing cycle.",
    },
    {
        id: "2",
        title: "Is there a free trial?",
        description:
            "All paid plans come with a 7-day free trial. No credit card required to start.",
    },
    {
        id: "3",
        title: "What happens if I exceed my plan limits?",
        description:
            "We'll notify you when you're approaching your limits. You can upgrade your plan anytime, or continue on your current plan with reduced functionality.",
    },
];
