"use client";

import { SortField, useAllBundles, useBundleFilters, useBundleSort, } from "@/features/analytics";
import { useMemo } from "react";
import { getBundleStatusBadge } from "@/features/bundles";

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
    return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Get status badge tone
 */
function getStatusTone(status: string): "success" | "info" | "neutral" {
    switch (status.toLowerCase()) {
        case "active":
            return "success";
        case "draft":
            return "neutral";
        case "scheduled":
            return "info";
        default:
            return "neutral";
    }
}

/**
 * Get health status badge config
 */
function getHealthBadge(status: string): {
    icon: string;
    tone: "success" | "attention" | "critical" | "info";
    label: string;
} {
    switch (status) {
        case "healthy":
            return { icon: "🟢", tone: "success", label: "Healthy" };
        case "needs-work":
            return { icon: "⚠️", tone: "attention", label: "Needs Work" };
        case "poor":
            return { icon: "🔴", tone: "critical", label: "Poor" };
        case "new":
            return { icon: "🆕", tone: "info", label: "New" };
        default:
            return { icon: "—", tone: "info", label: "Unknown" };
    }
}

/**
 * Get conversion badge tone based on rate and sample size
 */
function getConversionBadge(
    rate: number,
    views: number,
): { tone: "success" | "attention" | "neutral"; hasWarning: boolean } {
    const hasWarning = views < 30;

    if (hasWarning) {
        return { tone: "attention", hasWarning: true };
    }

    if (rate >= 8) return { tone: "success", hasWarning: false };
    if (rate >= 5) return { tone: "attention", hasWarning: false };
    return { tone: "neutral", hasWarning: false };
}

/**
 * Funnel Bar Component - Visual representation of conversion funnel
 */
function FunnelBar({
    views,
    carts,
    orders,
    healthBadge,
}: {
    views: number;
    carts: number;
    orders: number;
    healthBadge: {
        icon: string;
        tone: "success" | "warning" | "critical" | "info";
        label: string;
    };
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
                            backgroundColor: "#E3E3E3",
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
            <s-badge tone={healthBadge.tone}>
                {healthBadge.icon} {healthBadge.label}
            </s-badge>
        </s-stack>
    );
}

/**
 * Table Skeleton
 */
function TableSkeleton() {
    return (
        <s-section padding="none">
            <s-table loading>
                <s-table-header-row>
                    <s-table-header listSlot="primary">Bundle</s-table-header>
                    <s-table-header listSlot="inline">Status</s-table-header>
                    <s-table-header listSlot="labeled" format="currency">
                        Revenue
                    </s-table-header>
                    <s-table-header listSlot="labeled">Orders</s-table-header>
                    <s-table-header listSlot="labeled">Conv %</s-table-header>
                    <s-table-header listSlot="labeled">Views</s-table-header>
                    <s-table-header listSlot="labeled">Cart %</s-table-header>
                    <s-table-header listSlot="labeled">Funnel</s-table-header>
                    <s-table-header listSlot="inline">Health</s-table-header>
                </s-table-header-row>
                <s-table-body>
                    {[...Array(5)].map((_, i) => (
                        <s-table-row key={i}>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                            <s-table-cell>
                                <s-skeleton-text lines={1} />
                            </s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>
        </s-section>
    );
}

/**
 * Empty State
 */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <s-section>
            <s-stack gap="base" alignItems="center">
                <s-icon type="search" size="xl" tone="neutral" />
                <s-stack gap="small-300" alignItems="center">
                    <s-text heading size="lg">
                        {hasFilters ? "No bundles found" : "No bundles yet"}
                    </s-text>
                    <s-text tone="neutral" alignContent="center">
                        {hasFilters
                            ? "Try adjusting your filters or search query"
                            : "Create your first bundle to see analytics here"}
                    </s-text>
                </s-stack>
            </s-stack>
        </s-section>
    );
}

/**
 * Sort Header Cell (Clickable)
 */
interface SortHeaderProps {
    field: SortField;
    label: string;
    currentSort: SortField;
    currentOrder: "asc" | "desc";
    onSort: (field: SortField) => void;
    format?: "currency" | "numeric";
    listSlot?: "primary" | "inline" | "labeled";
}

function SortHeader({
    field,
    label,
    currentSort,
    currentOrder,
    onSort,
    format,
    listSlot = "labeled",
}: SortHeaderProps) {
    const isActive = currentSort === field;
    const icon = isActive ? (currentOrder === "desc" ? "↓" : "↑") : "";

    return (
        <s-table-header listSlot={listSlot} format={format}>
            <div className="-ml-3">
                <s-button variant="tertiary" onClick={() => onSort(field)}>
                    <span
                        style={{
                            borderBottom:
                                ".125rem dotted var(--p-color-border-tertiary)",
                            cursor: "help",
                            display: "inline-block",
                        }}
                    >
                        {label} {icon}
                    </span>
                </s-button>
            </div>
        </s-table-header>
    );
}

/**
 * All Bundles Analytics Table - Diagnostic View
 *
 * Visual analysis table optimized for:
 * - Multi-signal diagnostics
 * - Health status indicators
 * - Funnel visualization
 * - Actionable insights
 */
export function AllBundlesTable() {
    const { sortBy, sortOrder, handleSort } = useBundleSort();
    const {
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        filterBundles,
    } = useBundleFilters();
    const { data, isLoading, error } = useAllBundles(sortBy, sortOrder);

    // Apply filters
    const filteredBundles = useMemo(() => {
        if (!data?.bundles) return [];
        return filterBundles(data.bundles);
    }, [data?.bundles, filterBundles]);

    const hasFilters = statusFilter !== "all" || searchQuery.trim() !== "";

    if (isLoading) {
        return (
            <s-card>
                <TableSkeleton />
            </s-card>
        );
    }

    if (error) {
        return (
            <s-card>
                <s-section>
                    <s-banner tone="critical">
                        <s-text>
                            Failed to load bundles. Please try again.
                        </s-text>
                    </s-banner>
                </s-section>
            </s-card>
        );
    }

    if (!data || data.bundles.length === 0) {
        return (
            <s-card>
                <EmptyState hasFilters={false} />
            </s-card>
        );
    }

    return (
        <s-section padding="none">
            {/* Header with filters */}
            <s-box
                padding="base"
                border="base"
                borderStyle="none none solid none"
            >
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-stack gap="small-200">
                            <s-text heading size="lg">
                                All Bundles Analytics ({data.totalBundles})
                            </s-text>
                            <s-text tone="neutral" size="sm">
                                Analyze performance across revenue, traffic,
                                conversion & quality signals
                            </s-text>
                        </s-stack>

                        {/* Status counts */}
                        <s-stack direction="inline" gap="small-300">
                            {data.statusCounts.ACTIVE > 0 && (
                                <s-stack
                                    direction="inline"
                                    gap="small-100"
                                    alignItems="center"
                                >
                                    <s-text tone="neutral" size="sm">
                                        Active:
                                    </s-text>
                                    <s-text type="strong">
                                        {data.statusCounts.ACTIVE}
                                    </s-text>
                                </s-stack>
                            )}
                            {data.statusCounts.DRAFT > 0 && (
                                <s-stack
                                    direction="inline"
                                    gap="small-100"
                                    alignItems="center"
                                >
                                    <s-text tone="neutral" size="sm">
                                        Draft:
                                    </s-text>
                                    <s-text>{data.statusCounts.DRAFT}</s-text>
                                </s-stack>
                            )}
                        </s-stack>
                    </s-stack>

                    {/* Filters row */}
                    <s-stack direction="inline" gap="base">
                        {/* Search */}
                        <s-search-field
                            placeholder="Search bundles..."
                            value={searchQuery}
                            onInput={(e: any) => setSearchQuery(e.target.value)}
                            onClear={() => setSearchQuery("")}
                        />

                        {/* Status filter */}
                        <s-select
                            value={statusFilter}
                            onChange={(e: any) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                        </s-select>
                    </s-stack>
                </s-stack>
            </s-box>

            {/* Table */}
            <s-table>
                <s-table-header-row>
                    <s-table-header listSlot="primary">Bundle</s-table-header>
                    <s-table-header listSlot="inline">Status</s-table-header>
                    <SortHeader
                        field="revenue"
                        label="Revenue"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                    />
                    <SortHeader
                        field="purchases"
                        label="Orders"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                    />
                    <SortHeader
                        field="views"
                        label="Views"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                    />
                    <s-table-header listSlot="labeled">Cart %</s-table-header>
                    <SortHeader
                        field="conversion"
                        label="Conv %"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                    />
                    <s-table-header listSlot="labeled">Funnel</s-table-header>
                    {/*<s-table-header listSlot="inline">Health</s-table-header>*/}
                </s-table-header-row>

                <s-table-body>
                    {filteredBundles.length === 0 ? (
                        <s-table-row>
                            <s-table-cell colSpan={9}>
                                <EmptyState hasFilters={hasFilters} />
                            </s-table-cell>
                        </s-table-row>
                    ) : (
                        filteredBundles.map((bundle) => {
                            const conversionBadge = getConversionBadge(
                                bundle.conversionRate,
                                bundle.views,
                            );
                            const healthBadge = getHealthBadge(
                                bundle.healthStatus,
                            );
                            const statusTone = getStatusTone(bundle.status);

                            return (
                                <s-table-row key={bundle.id}>
                                    {/* Bundle name + type */}
                                    <s-table-cell>
                                        <s-stack gap="small-200">
                                            <s-text type="strong">
                                                {bundle.title}
                                            </s-text>
                                        </s-stack>
                                    </s-table-cell>

                                    {/* Status badge */}
                                    <s-table-cell>
                                        {(() => {
                                            const badgeProps =
                                                getBundleStatusBadge(
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
                                            <s-text type="strong">
                                                {formatCurrency(bundle.revenue)}
                                            </s-text>
                                            {bundle.averageOrderValue > 0 && (
                                                <s-text
                                                    tone="neutral"
                                                    size="sm"
                                                >
                                                    {formatCurrency(
                                                        bundle.averageOrderValue,
                                                    )}
                                                    /ord
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
                                            <s-badge
                                                tone={conversionBadge.tone}
                                            >
                                                {bundle.conversionRate}%
                                            </s-badge>
                                            <s-tooltip
                                                content={
                                                    conversionBadge.hasWarning
                                                        ? "Low sample size - conversion rate may fluctuate"
                                                        : `${bundle.purchases} orders from ${bundle.views} views`
                                                }
                                                preferredPlacement="top"
                                            >
                                                <s-text
                                                    tone="neutral"
                                                    size="sm"
                                                >
                                                    ({bundle.purchases}/
                                                    {bundle.views})
                                                    {conversionBadge.hasWarning &&
                                                        " ⚠"}
                                                </s-text>
                                            </s-tooltip>
                                        </s-stack>
                                    </s-table-cell>

                                    {/* Funnel visualization */}
                                    <s-table-cell>
                                        <FunnelBar
                                            views={bundle.views}
                                            carts={bundle.addToCarts}
                                            orders={bundle.purchases}
                                            healthBadge={healthBadge}
                                        />
                                    </s-table-cell>

                                    {/* Health status with tooltip */}
                                    {/*<s-table-cell>*/}
                                    {/*    <s-tooltip*/}
                                    {/*        content={bundle.healthReason}*/}
                                    {/*        preferredPlacement="left"*/}
                                    {/*    >*/}
                                    {/*        <s-badge tone={healthBadge.tone}>*/}
                                    {/*            {healthBadge.icon}{" "}*/}
                                    {/*            {healthBadge.label}*/}
                                    {/*        </s-badge>*/}
                                    {/*    </s-tooltip>*/}
                                    {/*</s-table-cell>*/}
                                </s-table-row>
                            );
                        })
                    )}
                </s-table-body>
            </s-table>
        </s-section>
    );
}
