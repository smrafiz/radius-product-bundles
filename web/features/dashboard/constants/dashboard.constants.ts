import { ACTION_THEMES, ROUTES } from "@/shared/constants";
import {
    ChartVerticalIcon,
    OrderIcon,
    SandboxIcon,
} from "@shopify/polaris-icons";
import {
    DashboardMetricConfig,
    DashboardQuickActionItem,
} from "@/features/dashboard/types";

export const DASHBOARD_METRICS: DashboardMetricConfig[] = [
    {
        key: "totalRevenue",
        title: "Total Revenue",
        format: "currency",
    },
    {
        key: "avgConversionRate",
        title: "Conversion Rate",
        format: "percentage",
    },
    {
        key: "activeBundles",
        title: "Active Bundles",
        format: "number",
        action: { label: "View all", url: ROUTES.BUNDLES },
    },
    {
        key: "totalViews",
        title: "Total Views",
        format: "number",
        comparisonLabel: "Last 30 days",
        action: { label: "View details", url: ROUTES.ANALYTICS },
    },
];

export const DASHBOARD_QUICK_ACTIONS: DashboardQuickActionItem[] = [
    {
        id: "bundles",
        title: "Manage Bundle",
        description: "Create and edit bundle offers",
        icon: OrderIcon,
        url: ROUTES.BUNDLES,
        ...ACTION_THEMES.success,
        enabled: true,
    },
    {
        id: "analytics",
        title: "View Analytics",
        description: "Track performance metrics",
        icon: ChartVerticalIcon,
        url: ROUTES.ANALYTICS,
        ...ACTION_THEMES.info,
        enabled: true,
    },
    {
        id: "studio",
        title: "Bundle Studio",
        description: "Create just like the templates",
        icon: SandboxIcon,
        url: ROUTES.BUNDLE_STUDIO,
        ...ACTION_THEMES.critical,
        badge: "New",
        enabled: true,
    },
];
