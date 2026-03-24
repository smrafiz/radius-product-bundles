"use client";

/**
 * ShopifyQL React Query hooks
 * Uses ShopifyQL for analytics data (ready for AI features)
 */

import { useQuery } from "@tanstack/react-query";
import { analyticsQueries } from "@/features/analytics";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { DateRange } from "@/shared/types/services";

/**
 * ShopifyQL React Query hooks
 * Provides access to ShopifyQL analytics data for AI features
 */
export function useShopifyQLQueries() {
    const app = useAppBridge();
    const queries = analyticsQueries(app);

    return {
        salesMetrics: (dateRange: DateRange) =>
            useQuery(queries.salesMetrics(dateRange)),

        productPerformance: (dateRange: DateRange, limit?: number) =>
            useQuery(queries.productPerformance(dateRange, limit)),

        customerMetrics: (dateRange: DateRange) =>
            useQuery(queries.customerMetrics(dateRange)),

        sessionMetrics: (dateRange: DateRange) =>
            useQuery(queries.sessionMetrics(dateRange)),

        salesByDay: (dateRange: DateRange) =>
            useQuery(queries.salesByDay(dateRange)),
    };
}
