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
        title: "How is my bundle sales volume calculated?",
        description:
            "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sequi tempore, saepe minima nesciunt impedit quaerat repellat eveniet, dignissimos quis quo sed maxime aspernatur qui, quod consectetur optio veritatis iusto eligendi?",
    },
    {
        id: "1",
        title: "What is a rolling 30-day period?",
        description:
            "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sequi tempore, saepe minima nesciunt impedit quaerat repellat eveniet, dignissimos quis quo sed maxime aspernatur qui, quod consectetur optio veritatis iusto eligendi?",
    },
    {
        id: "2",
        title: "Which plan should I be on?",
        description:
            "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sequi tempore, saepe minima nesciunt impedit quaerat repellat eveniet, dignissimos quis quo sed maxime aspernatur qui, quod consectetur optio veritatis iusto eligendi?",
    },
    {
        id: "3",
        title: "Which plan should I be on?",
        description:
            "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sequi tempore, saepe minima nesciunt impedit quaerat repellat eveniet, dignissimos quis quo sed maxime aspernatur qui, quod consectetur optio veritatis iusto eligendi?",
    },
];
