"use client";

import { useState, useEffect } from "react";

import { formatCurrency, formatPercentage, useAppNavigation } from "@/shared";
import { DashboardBundlesListProps } from "@/features/dashboard";
import { useBundleFilters, getBundleStatusBadge } from "@/features/bundles";

export const AnalyticsBasedBundlesList = ({
    bundles,
}: DashboardBundlesListProps) => {
    const { queryValue, handleSearchInput } = useBundleFilters();
    const { bundleData } = useAppNavigation();

    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = bundles.filter((bundle) =>
        bundle.name.toLowerCase().includes(queryValue.toLowerCase()),
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage]);

    const itemsPerPage = 5;
    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / itemsPerPage),
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return (
        <s-stack>
            <s-table>
                <s-stack padding="small-300" slot="filters">
                    <s-search-field
                        label="Search"
                        labelAccessibilityVisibility="exclusive"
                        placeholder="Search items"
                        value={queryValue}
                        onInput={handleSearchInput}
                    />
                </s-stack>

                <s-table-header-row>
                    <s-table-header listSlot="primary">Items</s-table-header>
                    <s-table-header>Name</s-table-header>
                    <s-table-header>Views</s-table-header>
                    <s-table-header>Sales value</s-table-header>
                    <s-table-header>Sales number</s-table-header>
                    <s-table-header>Status</s-table-header>
                </s-table-header-row>

                <s-table-body>
                    {currentData.map((bundle, index) => (
                        <s-table-row key={index}>
                            <s-table-cell>
                                <s-stack
                                    direction="inline"
                                    gap="small"
                                    alignItems="center"
                                >
                                    <s-clickable
                                        accessibilityLabel={bundle.name}
                                        border="base"
                                        borderRadius="base"
                                        overflow="hidden"
                                        inlineSize="40px"
                                        blockSize="40px"
                                        onClick={() =>
                                            bundleData.edit(bundle.id)
                                        }
                                    >
                                        <s-image
                                            objectFit="cover"
                                            src=""
                                        ></s-image>
                                    </s-clickable>
                                </s-stack>
                            </s-table-cell>

                            <s-table-cell>{bundle.name}</s-table-cell>
                            <s-table-cell>{bundle.views}</s-table-cell>
                            <s-table-cell>
                                {formatPercentage(bundle.conversionRate)}
                            </s-table-cell>
                            <s-table-cell>
                                {formatCurrency(bundle.revenue)}
                            </s-table-cell>
                            <s-table-cell>
                                {(() => {
                                    const badgeProps = getBundleStatusBadge(
                                        bundle.status,
                                    );
                                    return (
                                        <s-badge
                                            color="base"
                                            icon="enabled"
                                            {...badgeProps}
                                        >
                                            {badgeProps.text}
                                        </s-badge>
                                    );
                                })()}
                            </s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>

            {/* ===== PAGINATION CONTROLS ===== */}
            {filteredData.length > 0 && (
                <s-stack
                    direction="inline"
                    gap="small"
                    justifyContent="center"
                    alignItems="center"
                    padding="base"
                >
                    <s-button
                        variant="secondary"
                        disabled={!hasPreviousPage}
                        onClick={() =>
                            setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                    >
                        Previous
                    </s-button>

                    <s-text>
                        Page {currentPage} of {totalPages}
                    </s-text>

                    <s-button
                        variant="secondary"
                        disabled={!hasNextPage}
                        onClick={() =>
                            setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                    >
                        Next
                    </s-button>
                </s-stack>
            )}
        </s-stack>
    );
};
