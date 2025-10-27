import {
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
        key: "activeBundles",
        title: "Active Bundles",
        format: "number",
        tone: "critical",
        icon: "arrow-down",
        action: { label: "View all", url: ROUTES.BUNDLES },
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
