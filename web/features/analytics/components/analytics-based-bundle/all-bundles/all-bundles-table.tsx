"use client";

import {
    AllBundlesHeader,
    AllBundlesSkeleton,
    AllBundlesTableHeader,
    useAllBundlesTableWithPagination,
} from "@/features/analytics";
import { getBundleStatusBadge } from "@/features/bundles";
import { EmptyState, formatCurrencyCompact, formatNumber, TablePagination, useAppNavigation, } from "@/shared";

/**
 * Get health status badge config
 */
function getHealthBadge(status: string): {
    color: string;
    label: string;
} {
    switch (status) {
        case "healthy":
            return { color: "#047b5d", label: "Healthy" };
        case "needs-work":
            return { color: "#b28400", label: "Needs Work" };
        case "poor":
            return { color: "#e22c38", label: "Poor" };
        case "new":
            return { color: "#0094d5", label: "New" };
        default:
            return { color: "#0094d5", label: "Unknown" };
    }
}

/**
 * Get conversion rate tone based on value
 */
function getConversionTone(rate: number): "success" | "warning" | "neutral" {
    if (rate >= 10) {
        return "success";
    }

    if (rate >= 5) {
        return "warning";
    }

    return "neutral";
}

/**
 * Funnel Bar Component - Visual representation of conversion funnel
 */
function FunnelBar({
    views,
    carts,
    orders,
}: {
    views: number;
    carts: number;
    orders: number;
}) {
    if (views === 0) {
        return "-";
    }

    const cartPercentage = (carts / views) * 100;
    const orderPercentage = (orders / views) * 100;

    return (
        <s-stack
            gap="small"
            direction="inline"
            alignItems="center"
            justifyContent="space-between"
        >
            <s-stack gap="small-500">
                {/* Views bar (baseline) */}
                <s-stack direction="inline" gap="small-100" alignItems="center">
                    <s-text tone="neutral">
                        <div className="w-8.75 text-[11px]">Views</div>
                    </s-text>
                    <div
                        style={{
                            width: "100px",
                            height: "6px",
                            backgroundColor: "#ffa55f",
                            borderRadius: "2px",
                        }}
                    />
                </s-stack>

                {/* Cart bar */}
                <s-stack direction="inline" gap="small-100" alignItems="center">
                    <s-text tone="neutral">
                        <div className="w-8.75 text-[11px]">Cart</div>
                    </s-text>
                    <div
                        style={{
                            width: `${cartPercentage}px`,
                            maxWidth: "100px",
                            height: "6px",
                            backgroundColor: "#5C6AC4",
                            borderRadius: "2px",
                        }}
                    />
                </s-stack>

                {/* Order bar */}
                <s-stack direction="inline" gap="small-100" alignItems="center">
                    <s-text tone="neutral">
                        <div className="w-8.75 text-[11px]">Order</div>
                    </s-text>
                    <div
                        style={{
                            width: `${orderPercentage}px`,
                            maxWidth: "100px",
                            height: "6px",
                            backgroundColor: "#50B83C",
                            borderRadius: "2px",
                        }}
                    />
                </s-stack>
            </s-stack>
        </s-stack>
    );
}

/**
 * All Bundles Analytics Table - Diagnostic View with Pagination
 *
 * Shows skeleton on initial load and when dates change.
 * Shows table loading state for search, sort, and pagination changes.
 */
export function AllBundlesTable() {
    const {
        bundles,
        pagination,
        isLoading,
        isFetching,
        error,
        hasFilters,
        nextPage,
        prevPage,
    } = useAllBundlesTableWithPagination();
    const { bundleData } = useAppNavigation();

    /**
     * Handle bundle name click - navigate to edit page
     */
    const handleBundleClick = (bundleId: string) => {
        bundleData.edit(bundleId);
    };

    /**
     * Handle next page event from s-table
     */
    const handleNextPage = () => {
        if (pagination?.hasNextPage) {
            nextPage();
        }
    };

    /**
     * Handle previous page event from s-table
     */
    const handlePreviousPage = () => {
        if (pagination?.hasPrevPage) {
            prevPage();
        }
    };

    // Show skeleton on loading (including date changes)
    if (isLoading) {
        return (
            <AllBundlesSkeleton
                Header={AllBundlesHeader}
                TableHeader={AllBundlesTableHeader}
            />
        );
    }

    if (error) {
        return (
            <s-section padding="none">
                <AllBundlesHeader loading={isFetching} />
                <s-box padding="base">
                    <s-banner tone="critical">
                        <s-text>
                            Failed to load bundle performance data. Please try
                            again.
                        </s-text>
                    </s-banner>
                </s-box>
            </s-section>
        );
    }

    if (!bundles || bundles.length === 0) {
        return (
            <s-section padding="none">
                <AllBundlesHeader loading={isFetching} />
                <s-box padding="base">
                    <EmptyState
                        heading={
                            hasFilters ? "No bundles found" : "No bundles yet"
                        }
                        description={
                            hasFilters
                                ? "Try adjusting your filters or search query"
                                : "Create your first bundle to see analytics here"
                        }
                        isSearch={hasFilters}
                    />
                </s-box>
            </s-section>
        );
    }

    // Show table loading for non-date refetches (search, sort, pagination)
    const showTableLoading = isFetching && !isLoading;
    const totalPages = pagination?.totalPages ?? 0;
    const currentPage = pagination?.page ?? 1;

    const paginationLabel =
        totalPages > 0
            ? `Showing page ${currentPage} of ${totalPages}`
            : "Showing page 1 of 1";

    return (
        <s-section padding="none">
            {/* Header with search */}
            <AllBundlesHeader loading={isFetching} />

            <s-table loading={showTableLoading}>
                <AllBundlesTableHeader />

                <s-table-body>
                    {bundles.map((bundle) => {
                        const conversionBadge = getConversionTone(
                            bundle.conversionRate,
                        );
                        const healthBadge = getHealthBadge(
                            bundle.healthStatus || "unknown",
                        );

                        return (
                            <s-table-row key={bundle.id}>
                                {/* Bundle name */}
                                <s-table-cell>
                                    <s-heading>
                                        <s-text>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleBundleClick(bundle.id)
                                                }
                                                className="text-left font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
                                            >
                                                {bundle.title}
                                            </button>
                                        </s-text>
                                    </s-heading>
                                </s-table-cell>

                                {/* Status badge */}
                                <s-table-cell>
                                    {(() => {
                                        const badgeProps = getBundleStatusBadge(
                                            bundle.status,
                                        );
                                        return (
                                            <s-badge
                                                color="base"
                                                {...badgeProps}
                                            >
                                                {badgeProps.text}
                                            </s-badge>
                                        );
                                    })()}
                                </s-table-cell>

                                {/* Revenue + AOV */}
                                <s-table-cell>
                                    <s-stack gap="small-200">
                                        <s-text
                                            tone={
                                                bundle.revenue > 0
                                                    ? "success"
                                                    : "neutral"
                                            }
                                        >
                                            <span
                                                className={
                                                    bundle.revenue > 0
                                                        ? "font-semibold"
                                                        : "font-normal"
                                                }
                                            >
                                                {formatCurrencyCompact(
                                                    bundle.revenue,
                                                )}
                                            </span>
                                        </s-text>
                                        {bundle.averageOrderValue > 0 && (
                                            <s-text tone="neutral">
                                                {formatCurrencyCompact(
                                                    bundle.averageOrderValue,
                                                )}
                                                /order
                                            </s-text>
                                        )}
                                    </s-stack>
                                </s-table-cell>

                                {/* Orders */}
                                <s-table-cell>
                                    <s-text type="strong">
                                        {formatNumber(bundle.purchases)}
                                    </s-text>
                                </s-table-cell>

                                {/* Views */}
                                <s-table-cell>
                                    <s-text tone="neutral">
                                        {formatNumber(bundle.views)}
                                    </s-text>
                                </s-table-cell>

                                {/* Cart % (Add-to-cart rate) */}
                                <s-table-cell>
                                    <s-text>{bundle.addToCartRate}%</s-text>
                                </s-table-cell>

                                {/* Conversion % with color coding */}
                                <s-table-cell>
                                    <s-stack gap="small-200">
                                        <s-badge tone={conversionBadge}>
                                            {bundle.conversionRate}%
                                        </s-badge>
                                    </s-stack>
                                </s-table-cell>

                                {/* Funnel visualization */}
                                <s-table-cell>
                                    <FunnelBar
                                        views={bundle.views}
                                        carts={bundle.addToCarts}
                                        orders={bundle.purchases}
                                    />
                                </s-table-cell>
                                <s-table-cell>
                                    <span>
                                        <s-text
                                            interestFor={`${bundle.id}-health-tooltip`}
                                        >
                                            <span
                                                className="w-3 h-3 rounded-full text-center inline-block"
                                                style={{
                                                    backgroundColor:
                                                        healthBadge.color,
                                                }}
                                            />
                                        </s-text>
                                        <s-tooltip
                                            id={`${bundle.id}-health-tooltip`}
                                        >
                                            <s-text tone="neutral">
                                                {bundle.healthReason}
                                            </s-text>
                                        </s-tooltip>
                                    </span>
                                </s-table-cell>
                            </s-table-row>
                        );
                    })}
                </s-table-body>
            </s-table>
            <TablePagination
                hasPrevious={pagination?.hasPrevPage ?? false}
                hasNext={pagination?.hasNextPage ?? false}
                label={paginationLabel}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
                loading={showTableLoading}
            />
        </s-section>
    );
}
