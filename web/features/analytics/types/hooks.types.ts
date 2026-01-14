
/*
 * Interface for top bundle
 */
export interface TopBundle {
    bundleId: string;
    title: string;
    status: string;
    discountType: string | null;
    discountValue: number | null;
    createdAt: Date;
    revenue: number;
    purchases: number;
    views: number;
    addToCarts: number;
    conversionRate: number;
    addToCartRate: number;
    revenuePerView: number;
    trendPercentage: number;
    badges: Array<{
        icon: string;
        label: string;
        tone: "success" | "info" | "attention" | "critical";
    }>;
}

/**
 * Interface for the hook return value
 */
export interface SmartChartDisplay {
    shouldShowChart: boolean;
    shouldShowEmptyState: boolean;
    emptyStateReason: "no_data" | "insufficient_points" | "no_activity" | null;
    points?: number;
    showInfoBanner?: boolean;
    bannerMessage?: string;
}
