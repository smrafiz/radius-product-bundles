import { PricingCardItemInfo } from "@/features/pricing";

export const PRO_TRIAL_DAYS = 14;
export const PRO_MONTHLY_PRICE = 9.99;
export const PRO_ANNUAL_PRICE = 99.99;
export const BILLING_CURRENCY = "USD";

export const SUBSCRIPTION_PLANS = {
    FREE: "free",
    PRO: "pro",
} as const;

export type SubscriptionPlanType =
    (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export const PLAN_PRICING: Record<
    SubscriptionPlanType,
    {
        monthly: { price: number; currencyCode: string; interval: "EVERY_30_DAYS"; trialDays?: number };
        annual: { price: number; currencyCode: string; interval: "ANNUAL"; trialDays?: number };
    }
> = {
    [SUBSCRIPTION_PLANS.FREE]: {
        monthly: { price: 0, currencyCode: BILLING_CURRENCY, interval: "EVERY_30_DAYS" },
        annual: { price: 0, currencyCode: BILLING_CURRENCY, interval: "ANNUAL" },
    },
    [SUBSCRIPTION_PLANS.PRO]: {
        monthly: { price: PRO_MONTHLY_PRICE, currencyCode: BILLING_CURRENCY, interval: "EVERY_30_DAYS", trialDays: PRO_TRIAL_DAYS },
        annual: { price: PRO_ANNUAL_PRICE, currencyCode: BILLING_CURRENCY, interval: "ANNUAL", trialDays: PRO_TRIAL_DAYS },
    },
};

export const PRICING_CARD: PricingCardItemInfo[] = [
    {
        id: SUBSCRIPTION_PLANS.FREE,
        title: "Free",
        description: "Get started with bundle creation at no cost",
        features: [
            "Up to 5 bundles",
            "Up to 10 products per bundle",
            "Fixed bundles, BOGO, Buy X Get Y",
            "Grid and list layouts",
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
        id: SUBSCRIPTION_PLANS.PRO,
        title: "Pro",
        featuredText: "Most Popular",
        description: "Everything you need to grow your bundle revenue",
        features: [
            "Unlimited bundles",
            "Unlimited products per bundle",
            "All bundle types",
            "All layouts",
            "Full analytics",
            "Custom CSS",
            "Priority support",
        ],
        price: "$9.99",
        frequency: "month",
        primaryButton: {
            content: "Start Free Trial",
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
            "The Free plan includes up to 5 bundles, up to 10 products per bundle, Fixed Bundle, BOGO, and Buy X Get Y bundle types, grid and list layouts, basic analytics, and email support.",
    },
    {
        id: "1",
        title: "Can I upgrade or downgrade anytime?",
        description:
            "Yes. You can upgrade to Pro or downgrade to Free at any time. Upgrades take effect immediately, and downgrades apply at the next billing cycle.",
    },
    {
        id: "2",
        title: "Is there a free trial?",
        description:
            "Pro comes with a 14-day free trial. No credit card required to start your trial.",
    },
    {
        id: "3",
        title: "What billing options are available?",
        description:
            "Pro is available on a monthly ($9.99/month) or annual ($99.99/year) billing cycle. Annual billing saves you about 17% compared to monthly.",
    },
    {
        id: "4",
        title: "What happens if I exceed my plan limits?",
        description:
            "On the Free plan, you'll be notified when approaching your bundle or product limits. You can upgrade to Pro at any time for unlimited access.",
    },
];
