/**
 * ShopifyQL Analytics Service
 * Uses Shopify's native analytics query language for
 *
 * Reference: https://shopify.dev/docs/apps/build/shopifyql
 */

import type { ShopifyQLResponse, DateRange } from "@/shared";
import { executeGraphQLQuery } from "@/lib/graphql/client/server-action";
import { ShopifyQlQueryDocument } from "@/lib/graphql/generated/graphql";

/**
 * Required scopes: read_reports
 */

const MAX_DATE_RANGE_DAYS = 365;

async function queryShopifyQL(
    shop: string,
    accessToken: string,
    query: string,
): Promise<ShopifyQLResponse> {
    const result = await executeGraphQLQuery<{
        shopifyqlQuery: ShopifyQLResponse;
    }>({
        query: ShopifyQlQueryDocument,
        variables: { query },
        shop,
        accessToken,
    });

    if (result.errors) {
        const firstError = result.errors[0];
        const errorMessage = firstError?.message ?? "ShopifyQL query failed";
        console.error("[ShopifyQL] Query errors:", result.errors);

        if (errorMessage.includes("Rate limited")) {
            throw new Error("Rate limited. Please retry in a few minutes.");
        }

        throw new Error(errorMessage);
    }

    return result.data?.shopifyqlQuery ?? { parseErrors: [] };
}

function normalizeDate(date: Date): Date {
    if (isNaN(date.getTime())) {
        console.warn("[ShopifyQL] Invalid date received, using default");
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 7);
        return defaultDate;
    }
    return date;
}

function capDateRange(dateRange: DateRange): DateRange {
    const from = normalizeDate(dateRange.from);
    const to = normalizeDate(dateRange.to);

    const diffMs = to.getTime() - from.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > MAX_DATE_RANGE_DAYS) {
        console.warn(
            `[ShopifyQL] Date range ${diffDays} days exceeds max ${MAX_DATE_RANGE_DAYS}, capping`,
        );
        const cappedFrom = new Date(to);
        cappedFrom.setDate(cappedFrom.getDate() - MAX_DATE_RANGE_DAYS);
        return { from: cappedFrom, to };
    }

    return { from, to };
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Get revenue and order metrics for a time period
 */
export async function getSalesMetrics(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM sales
        SHOW total_sales, net_sales, gross_sales, orders, aov, returns
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData?.rows[0] ?? {};
}

/**
 * Get sales broken down by day
 */
export async function getSalesByDay(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM sales
        SHOW total_sales, orders
        GROUP BY day
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
        ORDER BY day DESC
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData ?? { columns: [], rows: [] };
}

/**
 * Get product performance (for product pairing analysis)
 */
export async function getProductPerformance(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
    limit: number = 50,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM sales
        SHOW total_sales, orders, units_sold, product_title, product_type
        GROUP BY product_title
        HAVING orders > 0
        ORDER BY total_sales DESC
        LIMIT ${limit}
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData ?? { columns: [], rows: [] };
}

/**
 * Get customer acquisition metrics
 */
export async function getCustomerMetrics(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM customers
        SHOW new_customers, returning_customers
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData?.rows[0] ?? {};
}

/**
 * Get customer acquisition over time
 */
export async function getCustomerTrends(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM customers
        SHOW new_customers, returning_customers
        GROUP BY week
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
        ORDER BY week DESC
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData ?? { columns: [], rows: [] };
}

/**
 * Get session/visitor data for conversion analysis
 */
export async function getSessionMetrics(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM sessions
        SHOW sessions, product_views, add_to_carts, checkouts, orders
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData?.rows[0] ?? {};
}

/**
 * Get top products by conversion
 */
export async function getTopConvertingProducts(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
    limit: number = 20,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM sessions
        SHOW sessions, product_views, add_to_carts, checkouts, orders
        GROUP BY product_title
        HAVING orders > 0
        ORDER BY orders DESC
        LIMIT ${limit}
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData ?? { columns: [], rows: [] };
}

/**
 * Compare periods (e.g., this month vs last month)
 */
export async function getSalesComparison(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
    compareRange: DateRange,
) {
    const capped = capDateRange(dateRange);
    const cappedCompare = capDateRange(compareRange);
    const query = `
        FROM sales
        SHOW total_sales, orders, aov
        TIMESERIES day
        WITH PERCENT_CHANGE
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
        COMPARE TO ${formatDate(cappedCompare.from)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData ?? { columns: [], rows: [] };
}

/**
 * Get orders by fulfillment status
 */
export async function getOrdersByStatus(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM orders
        SHOW orders, total_sales
        GROUP BY fulfillment_status
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData ?? { columns: [], rows: [] };
}

/**
 * Get sales by location
 */
export async function getSalesByLocation(
    shop: string,
    accessToken: string,
    dateRange: DateRange,
    limit: number = 20,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM sales
        SHOW total_sales, orders
        GROUP BY billing_country, billing_region
        ORDER BY total_sales DESC
        LIMIT ${limit}
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData ?? { columns: [], rows: [] };
}

/**
 * Find co-purchased products (for bundle recommendations)
 * This finds products that are often bought together
 */
export async function findCoPurchasedProducts(
    shop: string,
    accessToken: string,
    productIds: string[],
    dateRange: DateRange,
): Promise<{ productId: string; coPurchaseCount: number }[]> {
    const capped = capDateRange(dateRange);
    const query = `
        FROM orders
        SHOW orders, line_items
        WHERE product_id IN (${productIds.map((id) => `'${id}'`).join(",")})
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);

    const coPurchases: Record<string, number> = {};

    for (const row of result.tableData?.rows ?? []) {
        const lineItems = row.line_items as string[] | undefined;
        if (lineItems && lineItems.length > 1) {
            for (const item of lineItems) {
                if (!productIds.includes(item)) {
                    coPurchases[item] = (coPurchases[item] || 0) + 1;
                }
            }
        }
    }

    return Object.entries(coPurchases)
        .map(([productId, count]) => ({ productId, coPurchaseCount: count }))
        .sort((a, b) => b.coPurchaseCount - a.coPurchaseCount);
}

/**
 * Get bundle-specific revenue (orders containing bundle line items)
 * Requires bundle products to have _bundle_id in line item properties
 */
export async function getBundleRevenue(
    shop: string,
    accessToken: string,
    bundleId: string,
    dateRange: DateRange,
) {
    const capped = capDateRange(dateRange);
    const query = `
        FROM sales
        SHOW total_sales, orders, aov
        WHERE line_item_properties CONTAINS '_bundle_id'
        SINCE ${formatDate(capped.from)}
        UNTIL ${formatDate(capped.to)}
    `;

    const result = await queryShopifyQL(shop, accessToken, query);
    return result.tableData?.rows[0] ?? {};
}
