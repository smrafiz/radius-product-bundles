import { NextRequest, NextResponse } from "next/server";
import { trackAnalyticsEventAction } from "@/features/analytics/actions";

/**
 * Analytics Proxy API
 *
 * Handles analytics tracking from storefront (theme/app embed)
 *
 * Usage from storefront:
 * ```javascript
 * const url = `/apps/bundles/analytics?shop=${shop}`;
 * fetch(url, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     type: 'bundle_view',
 *     bundleId: 'bundle_123',
 *     productId: 'gid://shopify/Product/123',
 *     customerId: 'customer_456' // optional
 *   })
 * });
 * ```
 */

interface AnalyticsEventPayload {
    type: "bundle_view" | "bundle_add_to_cart" | "page_view";
    bundleId?: string;
    productId?: string;
    customerId?: string;
    productIds?: string[];
    totalValue?: number;
    discountValue?: number;
    pageType?: string;
    url?: string;
    timestamp?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const shop = searchParams.get("shop");

        if (!shop) {
            return NextResponse.json(
                { error: "Missing shop parameter" },
                { status: 400 },
            );
        }

        // Parse request body
        const body: AnalyticsEventPayload = await request.json();
        const { type, bundleId, productId, customerId, ...data } = body;

        // Validate event type
        if (!type) {
            return NextResponse.json(
                { error: "Missing event type" },
                { status: 400 },
            );
        }

        // Track different event types
        switch (type) {
            case "bundle_view": {
                if (!bundleId) {
                    return NextResponse.json(
                        { error: "Missing bundleId for bundle_view event" },
                        { status: 400 },
                    );
                }

                const result = await trackAnalyticsEventAction(shop, {
                    type: "bundle_view",
                    bundleId: bundleId,
                    productId: productId || undefined,
                    customerId: customerId || undefined,
                    timestamp: data.timestamp || new Date().toISOString(),
                });

                if (result.status === "error") {
                    console.error(
                        "[Analytics Proxy] Bundle view tracking failed:",
                        result.message,
                    );
                    return NextResponse.json(
                        { error: result.message },
                        { status: 500 },
                    );
                }

                return NextResponse.json({
                    success: true,
                    event: "bundle_view",
                    bundleId: bundleId,
                });
            }

            case "bundle_add_to_cart": {
                if (!bundleId) {
                    return NextResponse.json(
                        {
                            error: "Missing bundleId for bundle_add_to_cart event",
                        },
                        { status: 400 },
                    );
                }

                const result = await trackAnalyticsEventAction(shop, {
                    type: "bundle_add_to_cart",
                    bundleId: bundleId,
                    customerId: customerId || undefined,
                    timestamp: data.timestamp || new Date().toISOString(),
                });

                if (result.status === "error") {
                    console.error(
                        "[Analytics Proxy] Add to cart tracking failed:",
                        result.message,
                    );
                    return NextResponse.json(
                        { error: result.message },
                        { status: 500 },
                    );
                }

                return NextResponse.json({
                    success: true,
                    event: "bundle_add_to_cart",
                    bundleId: bundleId,
                });
            }

            case "page_view": {
                // Optional: Track general page views for analytics
                // Can be used for understanding user behavior
                console.log("[Analytics Proxy] Page view tracked:", {
                    shop,
                    pageType: data.pageType,
                    url: data.url,
                });

                return NextResponse.json({
                    success: true,
                    event: "page_view",
                });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown event type: ${type}` },
                    { status: 400 },
                );
        }
    } catch (error) {
        console.error("[Analytics Proxy] Error:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to track analytics event",
            },
            { status: 500 },
        );
    }
}

/**
 * Optional: GET endpoint for health check or analytics query
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const shop = searchParams.get("shop");

        if (!shop) {
            return NextResponse.json(
                { error: "Missing shop parameter" },
                { status: 400 },
            );
        }

        // Could return analytics summary or health check
        return NextResponse.json({
            success: true,
            message: "Analytics endpoint is active",
            shop: shop,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Analytics Proxy] GET Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process request" },
            { status: 500 },
        );
    }
}
