"use server";

/**
 * ShopifyQL Server Actions
 * Uses ShopifyQL analytics service for native Shopify analytics
 */

import { handleSessionToken } from "@/lib/shopify";
import { ApiResponse } from "@/shared";
import type { DateRange } from "@/shared/types/services";
import {
    getSalesMetrics,
    getProductPerformance,
    getCustomerMetrics,
    getSessionMetrics,
    getSalesByDay,
} from "@/shared/services/shopify-analytics.service";

/**
 * Get sales metrics (revenue, orders, AOV)
 */
export async function getSalesMetricsAction(
    sessionToken: string,
    dateRange: DateRange,
): Promise<ApiResponse> {
    try {
        const { session } = await handleSessionToken(sessionToken);

        if (!session.accessToken) {
            return {
                status: "error",
                message: "No access token available",
                data: null,
            };
        }

        const data = await getSalesMetrics(
            session.shop,
            session.accessToken,
            dateRange,
        );

        return { status: "success", data };
    } catch (error) {
        console.error("[getSalesMetricsAction] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch sales metrics",
            data: null,
        };
    }
}

/**
 * Get product performance for pairing analysis
 */
export async function getProductPerformanceAction(
    sessionToken: string,
    dateRange: DateRange,
    limit: number = 50,
): Promise<ApiResponse> {
    try {
        const { session } = await handleSessionToken(sessionToken);

        if (!session.accessToken) {
            return {
                status: "error",
                message: "No access token available",
                data: null,
            };
        }

        const data = await getProductPerformance(
            session.shop,
            session.accessToken,
            dateRange,
            limit,
        );

        return { status: "success", data };
    } catch (error) {
        console.error("[getProductPerformanceAction] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch product performance",
            data: null,
        };
    }
}

/**
 * Get customer acquisition metrics
 */
export async function getCustomerMetricsAction(
    sessionToken: string,
    dateRange: DateRange,
): Promise<ApiResponse> {
    try {
        const { session } = await handleSessionToken(sessionToken);

        if (!session.accessToken) {
            return {
                status: "error",
                message: "No access token available",
                data: null,
            };
        }

        const data = await getCustomerMetrics(
            session.shop,
            session.accessToken,
            dateRange,
        );

        return { status: "success", data };
    } catch (error) {
        console.error("[getCustomerMetricsAction] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch customer metrics",
            data: null,
        };
    }
}

/**
 * Get session/visitor metrics
 */
export async function getSessionMetricsAction(
    sessionToken: string,
    dateRange: DateRange,
): Promise<ApiResponse> {
    try {
        const { session } = await handleSessionToken(sessionToken);

        if (!session.accessToken) {
            return {
                status: "error",
                message: "No access token available",
                data: null,
            };
        }

        const data = await getSessionMetrics(
            session.shop,
            session.accessToken,
            dateRange,
        );

        return { status: "success", data };
    } catch (error) {
        console.error("[getSessionMetricsAction] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch session metrics",
            data: null,
        };
    }
}

/**
 * Get sales by day for time-series charts
 */
export async function getSalesByDayAction(
    sessionToken: string,
    dateRange: DateRange,
): Promise<ApiResponse> {
    try {
        const { session } = await handleSessionToken(sessionToken);

        if (!session.accessToken) {
            return {
                status: "error",
                message: "No access token available",
                data: null,
            };
        }

        const data = await getSalesByDay(
            session.shop,
            session.accessToken,
            dateRange,
        );

        return { status: "success", data };
    } catch (error) {
        console.error("[getSalesByDayAction] Error:", error);
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch sales by day",
            data: null,
        };
    }
}
