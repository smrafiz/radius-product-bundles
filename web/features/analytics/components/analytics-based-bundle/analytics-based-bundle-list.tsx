"use client";

import { useState } from "react";
import { ANALYTICS_BASED_BUNDLE } from "@/features/analytics";

import { getBundleStatusBadge } from "@/features/bundles";

export const AnalyticsBasedBundlesList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // ===== FILTER =====
    const filteredData = ANALYTICS_BASED_BUNDLE.filter((bundle) =>
        bundle.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // ===== PAGINATION =====
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
            {/* ===== TABLE ===== */}
            <s-table>
                <s-grid
                    slot="filters"
                    gap="small-200"
                    gridTemplateColumns="1fr auto"
                >
                    <s-search-field
                        label="Search"
                        labelAccessibilityVisibility="exclusive"
                        placeholder="Search items"
                        value={searchTerm}
                        onInput={(e: any) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </s-grid>

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
                                    {" "}
                                    <s-clickable
                                        href=""
                                        accessibilityLabel="Mountain View puzzle thumbnail"
                                        border="base"
                                        borderRadius="base"
                                        overflow="hidden"
                                        inlineSize="40px"
                                        blockSize="40px"
                                    >
                                        {" "}
                                        <s-image
                                            objectFit="cover"
                                            src="https://picsum.photos/id/29/80/80"
                                        />{" "}
                                    </s-clickable>{" "}
                                </s-stack>{" "}
                            </s-table-cell>
                            <s-table-cell>{bundle.name}</s-table-cell>
                            <s-table-cell>{bundle.views}</s-table-cell>
                            <s-table-cell>{bundle.sales_value}</s-table-cell>
                            <s-table-cell>{bundle.sales_number}</s-table-cell>
                            <s-table-cell>
                                <s-badge tone={bundle.tone}>
                                    {bundle.status}
                                </s-badge>
                            </s-table-cell>
                            {/*<s-table-cell>*/}
                            {/*    {(() => {*/}
                            {/*        const badgeProps = getBundleStatusBadge(*/}
                            {/*            bundle.status,*/}
                            {/*        );*/}

                            {/*        return (*/}
                            {/*            <s-badge*/}
                            {/*                color="base"*/}
                            {/*                icon="enabled"*/}
                            {/*                {...badgeProps}*/}
                            {/*            >*/}
                            {/*                {badgeProps.text}*/}
                            {/*            </s-badge>*/}
                            {/*        );*/}
                            {/*    })()}*/}
                            {/*</s-table-cell>*/}
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>

            {/* ===== PAGINATION CONTROLS ===== */}
            <s-stack
                direction="inline"
                gap="small"
                justifyContent="space-between"
                padding="base"
            >
                <s-button
                    variant="secondary"
                    disabled={!hasPreviousPage}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
        </s-stack>
    );
};
