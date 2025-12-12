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
        key: "totalRevenue",
        title: "Total Revenue",
        format: "currency",
        tone: "success",
        icon: "arrow-up",
    },
    {
        key: "avgConversionRate",
        title: "Conversion Rate",
        format: "percentage",
        tone: "warning",
        icon: "arrow-up",
    },
    {
        key: "totalViews",
        title: "Total Views",
        format: "number",
        tone: "info",
        icon: "arrow-down",
        comparisonLabel: "Last 30 days",
        action: { label: "View details", url: ROUTES.ANALYTICS },
    },
];

/*
 * Dashboard Quick Actions
 */
export const DASHBOARD_QUICK_ACTIONS: DashboardQuickActionItem[] = [
    {
        id: "bundles",
        title: "Manage Bundle",
        description: "Create and edit bundle offers",
        icon: "order",
        tone: "success",
        url: ROUTES.BUNDLES,
        ...ACTION_THEMES.success,
        enabled: true,
    },
    {
        id: "analytics",
        title: "View Analytics",
        description: "Track performance metrics",
        icon: "chart-vertical",
        tone: "info",
        url: ROUTES.ANALYTICS,
        ...ACTION_THEMES.info,
        enabled: true,
    },
    {
        id: "studio",
        title: "Bundle Studio",
        description: "Create just like the templates",
        icon: "work-list",
        tone: "critical",
        url: ROUTES.BUNDLE_STUDIO,
        ...ACTION_THEMES.critical,
        badge: "New",
        enabled: true,
    },
];

export const DASHBOARD_CALLOUT_CARDS: DashboardCalloutCardsItem[] = [
    {
        title: "Installation Guide",
        description:
            "Step by step guide to install and activate BundleSuite on your store.",
        primaryButton: {
            content: "Learn Now",
            props: {
                url: "https://www.example.com",
                external: true,
            },
            tone: "critical",
        },
        icon: "lightbulb",
    },
    {
        title: "Video Tutorials",
        description:
            "Watch our video tutorials to learn how to use BundleSuite.",
        primaryButton: {
            content: "Watch Now",
            props: {
                url: "https://www.example.com",
                external: true,
            },
            tone: "neutral",
        },
        icon: "video",
    },
    {
        title: "Help Docs",
        description:
            "Translating your store improves cross-border conversion by an average of 13%.",
        primaryButton: {
            content: "Visit Help Center",
            props: {
                url: "https://www.example.com",
                external: true,
            },
            tone: "neutral",
        },
        icon: "question-circle",
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
            url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/shop_pay_task-70830ae12d3f01fed1da23e607dc58bc726325144c29f96c949baca598ee3ef6.svg",
            alt: "Enable app embed",
        },
        complete: true,
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
            url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/detail-images/home-onboard-share-store-b265242552d9ed38399455a5e4472c147e421cb43d72a0db26d2943b55bdb307.svg",
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
            url: "https://cdn.shopify.com/b/shopify-guidance-dashboard-public/nqjyaxwdnkg722ml73r6dmci3cpn.svgz",
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
