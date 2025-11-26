import { PricingCardItemInfo } from "@/features/pricing";
import { PricingFaqItemInfo } from "@/features/pricing";

/*
 * Pricing Table Card Data
 */
export const PRICING_CARD: PricingCardItemInfo[] = [
    {
        id: "0",
        title: "Development Only",
        description:
            "This is a great plan for stores that are just starting out",
        features: [
            "Process up to 1,000 orders/mo",
            "Amazing feature",
            "Another really cool feature",
            "24/7 Customer Support",
        ],
        price: "$0",
        frequency: "month",
        primaryButton: {
            content: "Currently subscribed",
            loading: false,
            props: {
                variant: "secondary",
                external: true,
            },
        },
    },
    {
        id: "1",
        title: "Starter Plan",
        featuredText: "Most Popular",
        description:
            "For stores that are growing and need a reliable solution to scale with them",
        features: [
            "Process up to 1,000 orders/mo",
            "Amazing feature",
            "Another really cool feature",
            "24/7 Customer Support",
        ],
        price: "$49",
        frequency: "month",
        primaryButton: {
            content: "Select this plan",
            loading: false,
            props: {
                variant: "primary",
                external: true,
            },
        },
    },
    {
        id: "2",
        title: "Premium",
        description:
            "The best of the best, for stores that have the highest order processing needs",
        features: [
            "Process up to 1,000 orders/mo",
            "Amazing feature",
            "Another really cool feature",
            "24/7 Customer Support",
        ],
        price: "$99",
        frequency: "year",
        primaryButton: {
            content: "Select this plan",
            loading: false,
            props: {
                variant: "primary",
                external: true,
            },
        },
    },
];

/*
 * Pricing Faq Card Data
 */

export const PRICING_FAQ_ITEM: PricingFaqItemInfo[] = [
    {
        id: "0",
        title: "What’s the best plan for high-priced bundles?",
        description:
            "For businesses with high Average Order Value (AOV), tailored payment is key. We're here to help you grow with customized plans designed to fit your unique needs. Contact us to discuss how we can best support your business.",
    },
    {
        id: "1",
        title: "Can I use the app for free?",
        description:
            "You can test the app for free within the 7-day trial on all plans. Moreover, development stores and test stores can access the app for free without approving any charges.",
    },
    {
        id: "2",
        title: "Does the subscription fee automatically adjust based on my bundle sales?",
        description:
            "The subscription fee remains constant unless you explicitly approve changes. If you anticipate a decrease in sales, you can downgrade your plan accordingly. Conversely, if your sales exceed your plan's limit, you'll receive an email notification and can approve the upgrade.",
    },
    {
        id: "3",
        title: "What if I want to change or cancel my plan?",
        description:
            "You can thoroughly test the app during the 7-day trial and cancel without any charges. After that, downgrades are prorated, but cancellations are not. Contact support to explore refund options.",
    },
];
