"use server";

import { handleSessionToken } from "@/lib/shopify/verify";

export async function getBundles(sessionToken: string) {
    try {
        const { session: { shop } } = await handleSessionToken(sessionToken);

        // Mock data for dashboard
        return {
            status: "success",
            data: [
                {
                    id: "1",
                    name: "Summer Sale Bundle",
                    type: "BOGO",
                    status: "ACTIVE",
                    views: 1250,
                    conversions: 45,
                    revenue: 2340.50,
                    conversionRate: 3.6,
                    productCount: 3,
                    createdAt: new Date().toISOString()
                },
                {
                    id: "2",
                    name: "Tech Essentials",
                    type: "CROSS_SELL",
                    status: "ACTIVE",
                    views: 890,
                    conversions: 23,
                    revenue: 1840.20,
                    conversionRate: 2.6,
                    productCount: 4,
                    createdAt: new Date().toISOString()
                }
            ]
        };
    } catch (error) {
        return {
            status: "error",
            message: "Failed to fetch bundles"
        };
    }
}

export async function getBundleMetrics(sessionToken: string) {
    try {
        const { session: { shop } } = await handleSessionToken(sessionToken);

        // Mock metrics for dashboard
        return {
            status: "success",
            data: {
                totals: {
                    revenue: 15420.75,
                    views: 5670,
                    purchases: 156,
                    addToCarts: 234
                },
                metrics: {
                    conversionRate: 2.75,
                    avgOrderValue: 98.85,
                    cartConversionRate: 66.7
                }
            }
        };
    } catch (error) {
        return {
            status: "error",
            message: "Failed to fetch metrics"
        };
    }
}