import {
    DashboardSetupConfig,
    DashboardMetricConfig,
    DashboardQuickActionItem,
    DashboardCalloutCardsItem,
} from "@/features/dashboard/types";
import { ACTION_THEMES, ROUTES } from "@/shared/constants";

/*
 * Dashboard Metrics
 */
export const DASHBOARD_METRICS: DashboardMetricConfig[] = [
    {
        key: "activeBundles",
        title: "Active bundles",
        format: "number",
        img: {
            url: "/assets/active-bundles.svg",
            alt: "Enable app embed",
        },
    },
    {
        key: "totalRevenue",
        title: "Total revenue",
        format: "currency",
        tone: "success",
        icon: "arrow-up",
        img: {
            url: "/assets/total-revenue.svg",
            alt: "Enable app embed",
        },
    },
    {
        key: "avgConversionRate",
        title: "Conversion rate",
        format: "percentage",
        tone: "warning",
        icon: "arrow-up",
        img: {
            url: "/assets/conversion-rate.svg",
            alt: "Enable app embed",
        },
    },
    {
        key: "totalViews",
        title: "Total views",
        format: "number",
        tone: "info",
        icon: "arrow-down",
        comparisonLabel: "Last 30 days",
        action: { label: "View details", url: ROUTES.ANALYTICS },
        img: {
            url: "/assets/total-views.svg",
            alt: "Enable app embed",
        },
    },
];

/*
 * Dashboard Quick Actions
 */
export const DASHBOARD_QUICK_ACTIONS: DashboardQuickActionItem[] = [
    {
        id: "bundles",
        title: "Manage bundle",
        description: "Create and edit bundle offers",
        icon: "text-in-rows",
        tone: "success",
        url: ROUTES.BUNDLES,
        ...ACTION_THEMES.success,
        enabled: true,
        img: {
            url: "/assets/manage-bundle.svg",
            alt: "Enable app embed",
        },
    },
    {
        id: "analytics",
        title: "View analytics",
        description: "Track performance metrics",
        icon: "chart-histogram-second-last",
        tone: "info",
        url: ROUTES.ANALYTICS,
        ...ACTION_THEMES.info,
        enabled: true,
        img: {
            url: "/assets/view-analytics.svg",
            alt: "Enable app embed",
        },
    },
    {
        id: "studio",
        title: "Bundle studio",
        description: "Create just like the templates",
        icon: "database",
        tone: "info",
        url: ROUTES.BUNDLE_STUDIO,
        ...ACTION_THEMES.info,
        badge: "New",
        enabled: true,
        img: {
            url: "/assets/bundle-studio.svg",
            alt: "Enable app embed",
        },
    },
];

export const DASHBOARD_CALLOUT_CARDS: DashboardCalloutCardsItem[] = [
    {
        title: "Need any support?",
        description:
            "Step by step guide to install and activate BundleSuite on your store.",
        primaryButton: {
            content: "Send us mail",
            props: {
                url: "https://www.example.com",
                external: true,
            },
            tone: "critical",
        },
        icon: "email",
    },
    {
        title: "Upcoming new features",
        description:
            "Watch our video tutorials to learn how to use BundleSuite.",
        primaryButton: {
            content: "See all features",
            props: {
                url: "https://www.example.com",
                external: true,
            },
            tone: "neutral",
        },
        icon: "star",
    },
    {
        title: "Help docs",
        description:
            "Translating your store improves cross-border conversion by an average of 13%.",
        primaryButton: {
            content: "See help doc",
            props: {
                url: "https://www.example.com",
                external: true,
            },
            tone: "neutral",
        },
        icon: "book",
    },
];

/*
 * Dashboard Setup Guide
 */
export const DASHBOARD_SETUP_ITEMS: DashboardSetupConfig[] = [
    {
        id: 0,
        title: "Enable app embed",
        description:
            "For your bundles to appear on your storefront, enable Bundles app embed and click Save on your theme.",
        image: {
            url: "/assets/setup-guide-step-one.svg",
            alt: "Enable app embed",
        },
        complete: false,
        primaryButton: {
            content: "Enable in theme editor",
            props: {
                url: "https://www.example.com",
                external: true,
            },
        },
    },
    {
        id: 1,
        title: "Create your first bundle campaign",
        description:
            "Pick a bundle type, customize it to fit your products and brand, and preview it live on your store.",
        image: {
            url: "/assets/setup-guide-step-two.svg",
            alt: "Create your first bundle campaign",
        },
        complete: false,
        primaryButton: {
            content: "Create a bundle campaign",
            props: {
                url: "https://www.example.com",
                external: true,
            },
        },
        secondaryButton: {
            content: "Learn more",
            props: {
                url: "https://www.example.com",
                external: true,
            },
        },
    },
    {
        id: 2,
        title: "Start tracking your bundle campaign performance",
        description:
            "You're all set! Click Finish setup and start monitoring how your bundles are performing.",
        image: {
            url: "/assets/setup-guide-step-three.svg",
            alt: "Start tracking your bundle campaign performance",
        },
        complete: false,
        primaryButton: {
            content: "Finish setup",
            props: {
                url: "https://www.example.com",
                external: true,
            },
        },
    },
];
